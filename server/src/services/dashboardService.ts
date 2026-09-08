import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { JwtPayload } from "../utils/jwt";
import { requireMentorId } from "./accessControl";
import { formatFeeDetails } from "./studentService";

async function latestRiskByStudent(studentIds: string[]) {
  if (studentIds.length === 0) return new Map<string, string>();
  const rows = await prisma.riskAssessment.findMany({
    where: { studentId: { in: studentIds } },
    orderBy: { createdAt: "desc" },
    select: { studentId: true, riskLevel: true },
  });
  const map = new Map<string, string>();
  for (const row of rows) {
    if (!map.has(row.studentId)) map.set(row.studentId, row.riskLevel);
  }
  return map;
}

export async function getMentorDashboard(user: JwtPayload) {
  const mentorId = await requireMentorId(user);

  const students = await prisma.student.findMany({ where: { mentorId } });
  const studentIds = students.map((s) => s.id);
  const riskMap = await latestRiskByStudent(studentIds);

  const [meetingsCompleted, pendingFollowUps, actionStats, issueByCategory] = await Promise.all([
    prisma.meeting.count({ where: { mentorId } }),
    prisma.meeting.count({ where: { mentorId, nextFollowUpDate: { gte: new Date() } } }),
    prisma.actionItem.groupBy({ by: ["status"], where: { mentorId }, _count: { status: true } }),
    prisma.studentIssue.groupBy({ by: ["category"], where: { mentorId }, _count: { category: true } }),
  ]);

  const riskDistribution = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 } as Record<string, number>;
  for (const level of riskMap.values()) riskDistribution[level] = (riskDistribution[level] ?? 0) + 1;

  const lowAttendance = students.filter((s: { attendancePercentage: number }) => s.attendancePercentage < 85).length;
  const withArrears = students.filter((s: { arrearCount: number }) => s.arrearCount > 0).length;
  const placementEligible = students.filter((s: { placementStatus: string }) => s.placementStatus !== "NOT_ELIGIBLE").length;
  const internshipInProgress = students.filter((s: { internshipStatus: string }) => s.internshipStatus === "IN_PROGRESS").length;
  const totalCertifications = students.reduce((sum: number, s: { certificationCount: number }) => sum + s.certificationCount, 0);

  return {
    cards: {
      totalStudents: students.length,
      meetingsCompleted,
      pendingFollowUps,
      lowAttendance,
      studentsWithArrears: withArrears,
      placementEligible,
      internshipInProgress,
      totalCertifications,
    },
    charts: {
      riskDistribution,
      attendanceDistribution: bucketAttendance(students),
      issueCategoryDistribution: issueByCategory.map((i: { category: string; _count: { category: number } }) => ({ category: i.category, count: i._count.category })),
      actionStatusDistribution: actionStats.map((a: { status: string; _count: { status: number } }) => ({ status: a.status, count: a._count.status })),
    },
    priorityStudents: buildPriorityList(students, riskMap).slice(0, 10),
  };
}

export async function getHodDashboard(user: JwtPayload, filters: { departmentId?: string; year?: string; section?: string; mentorId?: string }) {
  if (user.role !== "HOD") throw ApiError.forbidden();

  const hod = await prisma.mentor.findUnique({ where: { userId: user.userId } });
  if (!hod) throw ApiError.forbidden("No HOD profile found");

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const where: Record<string, unknown> = {
    departmentId: hod.departmentId,
  };

  if (filters.year && filters.year.toUpperCase() !== "ALL") {
    where.year = filters.year;
  }
  if (filters.section && filters.section.toUpperCase() !== "ALL") {
    where.section = filters.section;
  }
  if (filters.mentorId && filters.mentorId.toUpperCase() !== "ALL" && uuidRegex.test(filters.mentorId)) {
    where.mentorId = filters.mentorId;
  }

  const students = await prisma.student.findMany({ where });
  const studentIds = students.map((s) => s.id);
  const riskMap = await latestRiskByStudent(studentIds);

  const [totalMentors, meetingsCompleted, pendingFollowUps, mentorMeetingCounts, issueByCategory, actionStats, feeRecords] =
    await Promise.all([
      prisma.mentor.count({
        where: {
          OR: [
            { departmentId: hod.departmentId },
            { students: { some: { departmentId: hod.departmentId } } }
          ]
        }
      }),
      prisma.meeting.count({ where: { studentId: { in: studentIds } } }),
      prisma.meeting.count({ where: { studentId: { in: studentIds }, nextFollowUpDate: { gte: new Date() } } }),
      prisma.meeting.groupBy({ by: ["mentorId"], where: { studentId: { in: studentIds } }, _count: { mentorId: true } }),
      prisma.studentIssue.groupBy({ by: ["category"], where: { studentId: { in: studentIds } }, _count: { category: true } }),
      prisma.actionItem.groupBy({ by: ["status"], where: { studentId: { in: studentIds } }, _count: { status: true } }),
      prisma.studentFee.findMany({ where: { studentId: { in: studentIds } } }),
    ]);

  const riskDistribution = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 } as Record<string, number>;
  for (const level of riskMap.values()) riskDistribution[level] = (riskDistribution[level] ?? 0) + 1;

  const feeStatusDistribution = { PAID: 0, PARTIALLY_PAID: 0, PENDING: 0, OVERDUE: 0 };
  let totalFeesSum = 0;
  let amountPaidSum = 0;
  for (const f of feeRecords) {
    if (f.status in feeStatusDistribution) {
      feeStatusDistribution[f.status as keyof typeof feeStatusDistribution]++;
    }
    totalFeesSum += f.totalFees || 0;
    amountPaidSum += f.amountPaid || 0;
  }
  const outstandingSum = Math.max(0, totalFeesSum - amountPaidSum);

  const mentors = await prisma.mentor.findMany({ select: { id: true, fullName: true } });
  const mentorNameById = new Map(mentors.map((m) => [m.id, m.fullName]));
  const mentorWiseActivity = mentorMeetingCounts.map((m: { mentorId: string; _count: { mentorId: number } }) => ({
    mentor: mentorNameById.get(m.mentorId) ?? "Unknown",
    meetings: m._count.mentorId,
  }));

  return {
    cards: {
      totalStudents: students.length,
      totalMentors,
      meetingsCompleted,
      pendingFollowUps,
      highRiskStudents: riskDistribution.HIGH,
      criticalStudents: riskDistribution.CRITICAL,
      attendanceBelow85: students.filter((s: { attendancePercentage: number }) => s.attendancePercentage < 85).length,
      studentsWithArrears: students.filter((s: { arrearCount: number }) => s.arrearCount > 0).length,
      placementEligible: students.filter((s: { placementStatus: string }) => s.placementStatus !== "NOT_ELIGIBLE").length,
      internshipInProgress: students.filter((s: { internshipStatus: string }) => s.internshipStatus === "IN_PROGRESS").length,
      certificationTotal: students.reduce((sum: number, s: { certificationCount: number }) => sum + s.certificationCount, 0),
      totalFeeRecords: feeRecords.length,
      totalFeesSum,
      amountPaidSum,
      outstandingSum,
      feeOverdueCount: feeStatusDistribution.OVERDUE,
    },
    charts: {
      mentorWiseActivity,
      riskDistribution,
      attendanceDistribution: bucketAttendance(students),
      issueCategoryDistribution: issueByCategory.map((i: { category: string; _count: { category: number } }) => ({ category: i.category, count: i._count.category })),
      actionStatusDistribution: actionStats.map((a: { status: string; _count: { status: number } }) => ({ status: a.status, count: a._count.status })),
      feeStatusDistribution,
    },
    priorityStudents: buildPriorityList(students, riskMap).slice(0, 15),
  };
}

export async function getStudentDashboard(user: JwtPayload) {
  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
    include: {
      mentor: { select: { id: true, fullName: true, phone: true, designation: true, user: { select: { email: true } } } },
      department: true,
      fees: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!student) throw ApiError.forbidden("No student profile found for this user");

  const [upcomingMeeting, actions, latestMeeting, latestRisk] = await Promise.all([
    prisma.meeting.findFirst({
      where: { studentId: student.id, nextFollowUpDate: { gte: new Date() } },
      orderBy: { nextFollowUpDate: "asc" },
    }),
    prisma.actionItem.findMany({ where: { studentId: student.id }, orderBy: { targetCompletionDate: "asc" } }),
    prisma.meeting.findFirst({ where: { studentId: student.id }, orderBy: { meetingDate: "desc" } }),
    prisma.riskAssessment.findFirst({ where: { studentId: student.id }, orderBy: { createdAt: "desc" } }),
  ]);

  const feeDetails = formatFeeDetails(student, "STUDENT");

  return {
    student: {
      id: student.id,
      fullName: student.fullName,
      registerNumber: student.registerNumber,
      rollNumber: student.rollNumber,
      admissionYear: student.admissionYear,
      year: student.year,
      section: student.section,
      semester: student.semester,
      degree: student.degree,
      departmentName: student.department?.name,
      departmentCode: student.department?.code,
      cgpa: student.cgpa,
      attendancePercentage: student.attendancePercentage,
      arrearCount: student.arrearCount,
      placementStatus: student.placementStatus,
      internshipStatus: student.internshipStatus,
      certificationCount: student.certificationCount,
      skills: student.skills || [],
      certifications: student.certifications || [],
      careerGoal: student.careerGoal,
      targetRole: student.targetRole,
      feeStatus: feeDetails.feeStatus,
      feeDetails,
    },
    myMentor: student.mentor
      ? {
          id: student.mentor.id,
          fullName: student.mentor.fullName,
          phone: student.mentor.phone,
          designation: student.mentor.designation,
          email: student.mentor.user?.email || null,
        }
      : null,
    upcomingFollowUp: upcomingMeeting?.nextFollowUpDate ?? null,
    pendingActions: actions.filter((a: { status: string }) => a.status === "PENDING" || a.status === "IN_PROGRESS"),
    completedActions: actions.filter((a: { status: string }) => a.status === "COMPLETED"),
    allActions: actions,
    latestMeeting,
    mentorSuggestions: latestMeeting?.mentorSuggestions ?? null,
    latestRisk,
    feeDetails,
  };
}

function bucketAttendance(students: { attendancePercentage: number }[]) {
  const buckets = { "Below 65%": 0, "65-75%": 0, "75-85%": 0, "Above 85%": 0 };
  for (const s of students) {
    if (s.attendancePercentage < 65) buckets["Below 65%"]++;
    else if (s.attendancePercentage < 75) buckets["65-75%"]++;
    else if (s.attendancePercentage < 85) buckets["75-85%"]++;
    else buckets["Above 85%"]++;
  }
  return buckets;
}

function buildPriorityList(
  students: { id: string; fullName: string; attendancePercentage: number; arrearCount: number }[],
  riskMap: Map<string, string>
) {
  const rank: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  return students
    .map((s) => ({
      id: s.id,
      name: s.fullName,
      riskLevel: riskMap.get(s.id) ?? "LOW",
      attendance: s.attendancePercentage,
      arrears: s.arrearCount,
    }))
    .sort((a, b) => (rank[b.riskLevel] ?? 0) - (rank[a.riskLevel] ?? 0));
}
