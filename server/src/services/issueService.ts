import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { JwtPayload } from "../utils/jwt";
import { requireMentorId, assertMentorOwnsStudent } from "./accessControl";
import { logAudit } from "../middleware/audit";
import { Request } from "express";

function redactRestricted(issue: any, user: JwtPayload, ownerMentorId?: string) {
  if (!issue.isRestricted) return issue;
  const allowed = user.role === "HOD" || (user.role === "MENTOR" && ownerMentorId === issue.mentorId);
  if (allowed) return issue;
  return {
    ...issue,
    description: "Restricted: personal/well-being concern",
    resolution: issue.resolution ? "Restricted" : issue.resolution,
  };
}

export async function listIssues(
  user: JwtPayload,
  filters: { studentId?: string; category?: string; severity?: string; status?: string }
) {
  const where: Record<string, unknown> = {};
  let mentorId: string | undefined;

  if (user.role === "MENTOR") {
    mentorId = await requireMentorId(user);
    where.mentorId = mentorId;
  } else if (user.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) throw ApiError.forbidden();
    where.studentId = student.id;
    where.isRestricted = false; // students never see restricted well-being issues
  } else if (user.role === "HOD") {
    const mentor = await prisma.mentor.findUnique({ where: { userId: user.userId } });
    if (!mentor) throw ApiError.forbidden("No HOD mentor profile found");
    where.student = { departmentId: mentor.departmentId };
  }

  if (filters.studentId) where.studentId = filters.studentId;
  
  if (filters.category) {
    const norm = filters.category.toUpperCase();
    const valid = ["ACADEMIC_PERFORMANCE", "ATTENDANCE", "ARREAR_SUBJECTS", "PLACEMENT_READINESS", "INTERNSHIP_STATUS", "FINANCIAL_CONCERNS", "PERSONAL_WELLBEING", "DISCIPLINE", "OTHER"];
    if (valid.includes(norm)) {
      where.category = norm as any;
    }
  }

  if (filters.severity) {
    const norm = filters.severity.toUpperCase();
    const valid = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    if (valid.includes(norm)) {
      where.severity = norm as any;
    }
  }

  if (filters.status) {
    const norm = filters.status.toUpperCase();
    const valid = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    if (valid.includes(norm)) {
      where.status = norm as any;
    }
  }

  const issues = await prisma.studentIssue.findMany({
    where,
    include: { student: { select: { id: true, fullName: true, registerNumber: true, rollNumber: true } } },
    orderBy: { createdAt: "desc" },
  });

  return issues.map((issue) => redactRestricted(issue, user, mentorId));
}

export async function createIssue(user: JwtPayload, req: Request, data: Record<string, any>) {
  const mentorId = await requireMentorId(user);
  await assertMentorOwnsStudent(mentorId, data.studentId);

  const issue = await prisma.studentIssue.create({
    data: {
      studentId: data.studentId,
      meetingId: data.meetingId,
      mentorId,
      category: data.category,
      description: data.description,
      severity: data.severity ?? "MEDIUM",
      isRestricted: data.category === "PERSONAL_WELLBEING",
    },
  });

  await logAudit(req, "Issue Created", "StudentIssue", issue.id, { category: (issue as any).category });
  return issue;
}

export async function updateIssue(user: JwtPayload, req: Request, issueId: string, data: Record<string, any>) {
  const issue = await prisma.studentIssue.findUnique({ where: { id: issueId } });
  if (!issue) throw ApiError.notFound("Issue not found");

  if (user.role === "MENTOR") {
    const mentorId = await requireMentorId(user);
    if (issue.mentorId !== mentorId) throw ApiError.forbidden();
  } else if (user.role === "STUDENT") {
    throw ApiError.forbidden("Students cannot update issues");
  }

  if (issue.isRestricted) {
    await logAudit(req, "Sensitive Record Accessed", "StudentIssue", issue.id);
  }

  const payload: Record<string, unknown> = { ...data };
  if (data.status === "RESOLVED" || data.status === "CLOSED") {
    payload.resolvedDate = new Date();
  }

  const updated = await prisma.studentIssue.update({ where: { id: issueId }, data: payload });
  await logAudit(req, "Issue Updated", "StudentIssue", issueId, { status: data.status });
  return updated;
}
