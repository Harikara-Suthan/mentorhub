import { IssueCategory, Severity, prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { JwtPayload } from "../utils/jwt";
import { requireMentorId, assertMentorOwnsStudent } from "./accessControl";
import { runMeetingSummaryAgent } from "../ai/meetingSummaryAgent";
import { calculateRiskScore } from "../ai/riskEngine";
import { recommendInterventions } from "../ai/interventionAgent";
import { createNotification } from "./notificationService";

const CONCERN_TO_CATEGORY: Array<{ match: RegExp; category: IssueCategory }> = [
  { match: /attendance/i, category: "ATTENDANCE" },
  { match: /arrear/i, category: "ARREAR_SUBJECTS" },
  { match: /academic|math|subject|study/i, category: "ACADEMIC_PERFORMANCE" },
  { match: /placement/i, category: "PLACEMENT_READINESS" },
  { match: /internship/i, category: "INTERNSHIP_STATUS" },
  { match: /financial/i, category: "FINANCIAL_CONCERNS" },
  { match: /well-being|wellbeing|stress|anxious|personal/i, category: "PERSONAL_WELLBEING" },
];

function categorizeConcern(concern: string): IssueCategory {
  const hit = CONCERN_TO_CATEGORY.find((c) => c.match.test(concern));
  return hit?.category ?? "OTHER";
}

export async function listMeetings(user: JwtPayload, filters: { studentId?: string; page?: number; pageSize?: number }) {
  const where: Record<string, unknown> = {};
  if (user.role === "MENTOR") {
    where.mentorId = await requireMentorId(user);
  } else if (user.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) throw ApiError.forbidden();
    where.studentId = student.id;
  } else if (user.role === "HOD") {
    const mentor = await prisma.mentor.findUnique({ where: { userId: user.userId } });
    if (!mentor) throw ApiError.forbidden("No HOD mentor profile found");
    where.student = { departmentId: mentor.departmentId };
  }
  if (filters.studentId) where.studentId = filters.studentId;

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;

  const [items, total] = await Promise.all([
    prisma.meeting.findMany({
      where,
      include: { student: { select: { id: true, fullName: true, registerNumber: true, rollNumber: true } } },
      orderBy: { meetingDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.meeting.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function getMeetingById(user: JwtPayload, meetingId: string) {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      student: true,
      mentor: { select: { id: true, fullName: true } },
      riskAssessment: true,
    },
  });
  if (!meeting) throw ApiError.notFound("Meeting not found");

  if (user.role === "MENTOR") {
    const mentorId = await requireMentorId(user);
    if (meeting.mentorId !== mentorId) throw ApiError.forbidden();
  } else if (user.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student || meeting.studentId !== student.id) throw ApiError.forbidden();
  } else if (user.role === "HOD") {
    const mentor = await prisma.mentor.findUnique({ where: { userId: user.userId } });
    if (!mentor || meeting.student.departmentId !== mentor.departmentId) {
      throw ApiError.forbidden("Access denied: meeting is outside your authorized department");
    }
  }
  return meeting;
}

/**
 * Full end-to-end meeting workflow:
 * 1. Save the meeting record (always succeeds even if AI fails)
 * 2. Run AI meeting summarization
 * 3. Calculate explainable risk score
 * 4. Auto-file issues for detected concerns
 * 5. Generate intervention recommendations
 * 6. Auto-create suggested action items with the follow-up date
 * 7. Notify the mentor of the outcome
 */
export async function recordMeeting(user: JwtPayload, input: Record<string, any>) {
  const mentorId = await requireMentorId(user);
  await assertMentorOwnsStudent(mentorId, input.studentId);

  const meeting = await prisma.meeting.create({
    data: {
      studentId: input.studentId,
      mentorId,
      meetingDate: new Date(input.meetingDate),
      meetingType: input.meetingType ?? "INDIVIDUAL",
      discussionSummary: input.discussionSummary,
      studentConcerns: input.studentConcerns,
      mentorSuggestions: input.mentorSuggestions,
      nextFollowUpDate: input.nextFollowUpDate ? new Date(input.nextFollowUpDate) : null,
      aiStatus: "PENDING",
    },
  });

  let aiFailed = false;
  try {
    const aiResult = await runMeetingSummaryAgent({
      discussionSummary: input.discussionSummary,
      studentConcerns: input.studentConcerns,
      mentorSuggestions: input.mentorSuggestions,
    });

    await prisma.meeting.update({
      where: { id: meeting.id },
      data: {
        aiSummary: aiResult.summary,
        aiKeyConcerns: aiResult.key_concerns,
        aiImportantPoints: aiResult.important_points,
        aiRecommendedActions: aiResult.recommended_actions,
        aiStatus: "COMPLETED",
      },
    });

    // Auto-file issues for detected concerns (skipping duplicates of open issues in same category)
    const existingOpenCategories = new Set(
      (
        await prisma.studentIssue.findMany({
          where: { studentId: input.studentId, status: { in: ["OPEN", "IN_PROGRESS"] } },
          select: { category: true },
        })
      ).map((i) => i.category)
    );

    const createdIssues = [];
    for (const concern of aiResult.key_concerns) {
      const category = categorizeConcern(concern);
      if (existingOpenCategories.has(category)) continue;
      const severity: Severity = category === "PERSONAL_WELLBEING" ? "HIGH" : "MEDIUM";
      const issue = await prisma.studentIssue.create({
        data: {
          studentId: input.studentId,
          meetingId: meeting.id,
          mentorId,
          category,
          description: concern,
          severity,
          isRestricted: category === "PERSONAL_WELLBEING",
        },
      });
      createdIssues.push(issue);
      existingOpenCategories.add(category);
    }

    // Auto-create suggested action items from AI recommendations
    const followUp = input.nextFollowUpDate ? new Date(input.nextFollowUpDate) : addDays(new Date(), 14);
    for (const action of aiResult.recommended_actions) {
      await prisma.actionItem.create({
        data: {
          studentId: input.studentId,
          meetingId: meeting.id,
          mentorId,
          actionType: "MENTOR_ACTION",
          description: action,
          assignedTo: "Mentor",
          targetCompletionDate: followUp,
          status: "PENDING",
        },
      });
    }

    // Generate + store intervention recommendations
    const interventions = recommendInterventions(aiResult.key_concerns);
    for (const rec of interventions) {
      await prisma.intervention.create({
        data: {
          studentId: input.studentId,
          mentorId,
          issueArea: rec.issueArea,
          recommendation: rec.recommendation,
        },
      });
    }

    // Risk assessment
    await computeAndStoreRisk(input.studentId, meeting.id);
  } catch (err) {
    aiFailed = true;
    await prisma.meeting.update({ where: { id: meeting.id }, data: { aiStatus: "FAILED" } });
    console.error("AI meeting analysis failed (meeting record preserved):", err);
  }

  await createNotification(user.userId, {
    type: "GENERAL",
    title: aiFailed ? "Meeting saved (AI analysis unavailable)" : "Meeting recorded and analyzed",
    message: aiFailed
      ? "The meeting was saved successfully. AI analysis is temporarily unavailable."
      : "The meeting was saved and AI analysis, risk assessment, and follow-up items were generated.",
    entityId: meeting.id,
  });

  return getMeetingById(user, meeting.id);
}

export async function computeAndStoreRisk(studentId: string, meetingId?: string) {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw ApiError.notFound("Student not found");

  const [openIssues, issueGroups, overdueActions] = await Promise.all([
    prisma.studentIssue.count({ where: { studentId, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.studentIssue.groupBy({
      by: ["category"],
      where: { studentId },
      _count: { category: true },
    }),
    prisma.actionItem.count({
      where: { studentId, status: { not: "COMPLETED" }, targetCompletionDate: { lt: new Date() } },
    }),
  ]);

  const repeatedIssueCategories = issueGroups.filter((g) => g._count.category >= 2).length;

  const result = calculateRiskScore({
    attendancePercentage: student.attendancePercentage,
    cgpa: student.cgpa,
    arrearCount: student.arrearCount,
    openIssueCount: openIssues,
    repeatedIssueCategories,
    overdueActionCount: overdueActions,
    placementReady: student.placementStatus !== "NOT_ELIGIBLE",
    internshipPending: student.internshipStatus === "NOT_STARTED",
  });

  return prisma.riskAssessment.create({
    data: {
      studentId,
      meetingId: meetingId ?? undefined,
      riskScore: result.score,
      riskLevel: result.level,
      breakdown: result.breakdown as any,
      generatedBy: "AI",
    },
  });
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
