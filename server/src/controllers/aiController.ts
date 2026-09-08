import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { runMeetingSummaryAgent } from "../ai/meetingSummaryAgent";
import { computeAndStoreRisk } from "../services/meetingService";
import { recommendInterventions } from "../ai/interventionAgent";
import { prisma } from "../config/prisma";
import * as reportService from "../services/reportService";
import { runMentorChatAgent } from "../ai/mentorChatAgent";

export const chatWithMentorAI = asyncHandler(async (req: Request, res: Response) => {
  let messages = req.body.messages;
  const rawMessage = req.body.message;
  const conversationId = req.body.conversationId || `conv_${Date.now()}`;
  const studentContext = req.body.studentContext;

  if (!messages && rawMessage) {
    messages = [{ role: "user", content: String(rawMessage) }];
  } else if (!Array.isArray(messages)) {
    messages = [];
  }

  let userProfile: Record<string, any> | undefined = undefined;

  if (req.user) {
    if (req.user.role === "STUDENT") {
      let student = await prisma.student.findFirst({
        where: { userId: req.user.userId },
        include: {
          department: true,
          mentor: true,
          actionItems: {
            where: { status: { in: ["PENDING", "IN_PROGRESS", "OVERDUE"] } },
            orderBy: { targetCompletionDate: "asc" },
            take: 5,
          },
        },
      });

      if (!student && req.user.email) {
        student = await prisma.student.findFirst({
          where: { email: req.user.email },
          include: {
            department: true,
            mentor: true,
            actionItems: {
              where: { status: { in: ["PENDING", "IN_PROGRESS", "OVERDUE"] } },
              orderBy: { targetCompletionDate: "asc" },
              take: 5,
            },
          },
        });
      }

      if (student) {
        userProfile = {
          role: "STUDENT",
          name: student.fullName,
          registerNumber: student.registerNumber,
          rollNumber: student.rollNumber || undefined,
          department: student.department?.name || "Computer Science & Engineering",
          deptCode: student.department?.code || "CSE",
          year: student.year,
          section: student.section,
          cgpa: student.cgpa,
          attendance: student.attendancePercentage,
          arrears: student.arrearCount,
          mentorName: student.mentor?.fullName || "Dr. Priya Raman",
          mentorDesignation: student.mentor?.designation || "Associate Professor & Senior Advisor",
          mentorPhone: student.mentor?.phone || "+91 98765 10001",
          placementStatus: student.placementStatus,
          internshipStatus: student.internshipStatus,
          pendingTasks: (student.actionItems || []).map((a: any) => a.description || a.title || "Academic task"),
        };
      } else {
        userProfile = {
          role: "STUDENT",
          name: "Arun Kumar",
          email: req.user.email,
          cgpa: studentContext?.cgpa ?? 8.5,
          attendance: studentContext?.attendance ?? 84.5,
          department: studentContext?.department ?? "Computer Science & Engineering",
          mentorName: "Dr. Priya Raman",
        };
      }
    } else if (req.user.role === "MENTOR") {
      let mentor = await prisma.mentor.findFirst({
        where: { userId: req.user.userId },
        include: { department: true },
      });

      if (!mentor && req.user.email) {
        const u = await prisma.user.findFirst({ where: { email: req.user.email } });
        if (u) {
          mentor = await prisma.mentor.findFirst({
            where: { userId: u.id },
            include: { department: true },
          });
        }
      }

      if (mentor) {
        const mentees = await prisma.student.findMany({
          where: { mentorId: mentor.id },
          include: {
            riskAssessments: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        });

        const atRisk = mentees
          .filter((s: any) => {
            const r = s.riskAssessments?.[0]?.riskLevel;
            return r === "HIGH" || r === "CRITICAL";
          })
          .map((s: any) => `${s.fullName} (${s.rollNumber ? `Roll: ${s.rollNumber}, ` : ""}Reg: ${s.registerNumber}) - Risk: ${s.riskAssessments?.[0]?.riskLevel || "HIGH"}`);

        userProfile = {
          role: "MENTOR",
          name: mentor.fullName,
          employeeId: mentor.employeeId,
          designation: mentor.designation,
          department: mentor.department?.name || "Computer Science & Engineering",
          phone: mentor.phone,
          menteeCount: mentees.length,
          atRiskMentees: atRisk,
        };
      } else {
        userProfile = {
          role: "MENTOR",
          name: "Dr. Priya Raman",
          designation: "Associate Professor & Senior Advisor",
          department: "Computer Science & Engineering",
          menteeCount: 10,
          atRiskMentees: ["Arun Kumar (23CSE101) - Risk: MEDIUM"],
        };
      }
    } else if (req.user.role === "HOD") {
      const hod = await prisma.mentor.findUnique({
        where: { userId: req.user.userId },
        include: { department: true }
      });
      const hodDeptId = hod?.departmentId;
      const allFaculty = await prisma.mentor.findMany({
        where: hodDeptId ? {
          OR: [
            { departmentId: hodDeptId },
            { students: { some: { departmentId: hodDeptId } } }
          ]
        } : {}
      });
      const allStudents = await prisma.student.findMany({
        where: hodDeptId ? { departmentId: hodDeptId } : {},
        include: {
          riskAssessments: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      });

      const criticalStudents = allStudents.filter((s: any) => {
        const r = s.riskAssessments?.[0]?.riskLevel;
        return r === "HIGH" || r === "CRITICAL";
      });

      userProfile = {
        role: "HOD",
        name: hod?.fullName || "Dr. Arvind Swamy",
        designation: hod?.designation || "Professor & Head of Department",
        department: hod?.department?.name || "Computer Science & Engineering",
        facultyCount: allFaculty.length,
        studentCount: allStudents.length,
        criticalStudentCount: criticalStudents.length,
      };
    }
  }

  if (!userProfile) {
    userProfile = {
      role: "STUDENT",
      name: "Arun Kumar",
      cgpa: 8.5,
      attendance: 84.5,
      department: "Computer Science & Engineering",
      mentorName: "Dr. Priya Raman",
    };
  }

  const result = await runMentorChatAgent({
    messages,
    userRole: req.user?.role || "STUDENT",
    userProfile,
    studentContext,
  });

  res.json({
    success: true,
    data: {
      ...result,
      conversationId,
    },
    reply: result.reply,
    message: result.reply,
    conversationId,
  });
});

export const summarizeMeeting = asyncHandler(async (req: Request, res: Response) => {
  const { discussionSummary, studentConcerns, mentorSuggestions } = req.body;
  const result = await runMeetingSummaryAgent({ discussionSummary, studentConcerns, mentorSuggestions });
  res.json({ success: true, data: result });
});

export const riskAssessment = asyncHandler(async (req: Request, res: Response) => {
  const { studentId } = req.body;
  const result = await computeAndStoreRisk(studentId);
  res.json({ success: true, data: result });
});

export const intervention = asyncHandler(async (req: Request, res: Response) => {
  const { concernAreas } = req.body;
  const result = recommendInterventions(concernAreas ?? []);
  res.json({ success: true, data: result });
});

export const analyzeIssues = asyncHandler(async (req: Request, res: Response) => {
  const result = await reportService.getIssueAnalysisReport(req.user!);
  res.json({ success: true, data: result });
});
