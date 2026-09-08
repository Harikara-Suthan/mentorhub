import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { JwtPayload } from "../utils/jwt";
import { requireMentorId, assertMentorOwnsStudent } from "./accessControl";
import { logAudit } from "../middleware/audit";
import { Request } from "express";

export async function listActions(
  user: JwtPayload,
  filters: { studentId?: string; status?: string }
) {
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
  
  if (filters.status) {
    const norm = filters.status.toUpperCase();
    const valid = ["PENDING", "IN_PROGRESS", "COMPLETED", "OVERDUE"];
    if (valid.includes(norm)) {
      where.status = norm as any;
    }
  }

  return prisma.actionItem.findMany({
    where,
    include: { student: { select: { id: true, fullName: true, registerNumber: true, rollNumber: true } } },
    orderBy: { targetCompletionDate: "asc" },
  });
}

export async function createAction(user: JwtPayload, req: Request, data: Record<string, any>) {
  let mentorId = "";
  let assignerName = "Faculty Mentor";

  if (user.role === "MENTOR") {
    mentorId = await requireMentorId(user);
    const mentor = await prisma.mentor.findUnique({ where: { id: mentorId } });
    if (mentor) assignerName = mentor.fullName;
  } else if (user.role === "HOD") {
    const hod = await prisma.mentor.findFirst({ where: { userId: user.userId } });
    mentorId = hod ? hod.id : "mentor_hod";
    assignerName = "Head of Department (HOD)";
  } else {
    throw ApiError.forbidden("Students cannot assign tasks");
  }

  // Support batch assignment if target is multiple students
  const targetStudentIds: string[] = [];
  if (data.studentId) {
    targetStudentIds.push(data.studentId);
  } else if (data.studentIds && Array.isArray(data.studentIds)) {
    targetStudentIds.push(...data.studentIds);
  } else if (data.targetType === "MY_MENTEES") {
    const mentees = await prisma.student.findMany({ where: { mentorId } });
    targetStudentIds.push(...mentees.map((m: any) => m.id));
  } else if (data.targetType === "ALL_STUDENTS") {
    const mentor = await prisma.mentor.findUnique({ where: { userId: user.userId } });
    const all = await prisma.student.findMany({
      where: user.role === "HOD" && mentor ? { departmentId: mentor.departmentId } : {}
    });
    targetStudentIds.push(...all.map((m: any) => m.id));
  }

  if (targetStudentIds.length === 0) {
    throw ApiError.badRequest("At least one student must be targeted for task assignment");
  }

  const createdActions = [];
  const targetDate = data.targetCompletionDate ? new Date(data.targetCompletionDate) : new Date(Date.now() + 7 * 86400000);

  for (const sId of targetStudentIds) {
    const student = await prisma.student.findUnique({ where: { id: sId } });
    if (!student) continue;

    const action = await prisma.actionItem.create({
      data: {
        studentId: sId,
        meetingId: data.meetingId || undefined,
        issueId: data.issueId || undefined,
        mentorId: student.mentorId || mentorId,
        actionType: data.actionType ?? "STUDENT_ACTION",
        description: data.description || data.title,
        assignedTo: "STUDENT",
        targetCompletionDate: targetDate,
        status: "PENDING",
      },
    });

    createdActions.push(action);

    // If student has a user account, dispatch in-app notification
    if (student.userId) {
      await prisma.notification.create({
        data: {
          userId: student.userId,
          type: "GENERAL" as any,
          title: `New Task: ${data.title || data.description?.slice(0, 40)}`,
          message: `Assigned by ${assignerName}. Due: ${targetDate.toLocaleDateString()}. Description: ${data.description}`,
          entityId: action.id,
          isRead: false,
        },
      });
    }
  }

  await logAudit(req, `Assigned Task to ${targetStudentIds.length} students`, "ActionItem", createdActions[0]?.id || "");
  return createdActions.length === 1 ? createdActions[0] : { count: createdActions.length, actions: createdActions };
}

export async function updateAction(user: JwtPayload, req: Request, actionId: string, data: Record<string, any>) {
  const action = await prisma.actionItem.findUnique({ where: { id: actionId } });
  if (!action) throw ApiError.notFound("Action item not found");

  if (user.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student || action.studentId !== student.id) {
      throw ApiError.forbidden("You can only update status of your own assigned tasks");
    }
    // Student can update status (e.g. IN_PROGRESS, SUBMITTED, COMPLETED), progress, and remarks
    const allowedStatuses = ["PENDING", "IN_PROGRESS", "SUBMITTED", "COMPLETED"];
    if (data.status && !allowedStatuses.includes(data.status)) {
      throw ApiError.badRequest("Invalid status");
    }
    const payload: Record<string, unknown> = {
      status: data.status || action.status,
    };
    if (data.status === "COMPLETED") payload.completedDate = new Date();

    const updated = await prisma.actionItem.update({ where: { id: actionId }, data: payload });
    await logAudit(req, `Student updated task status to ${data.status}`, "ActionItem", actionId);
    return updated;
  }

  if (user.role === "MENTOR") {
    const mentorId = await requireMentorId(user);
    if (action.mentorId !== mentorId) {
      // Mentor can view/edit if assigned or within department
    }
  }

  const payload: Record<string, unknown> = { ...data };
  if (data.targetCompletionDate) payload.targetCompletionDate = new Date(data.targetCompletionDate);
  if (data.status === "COMPLETED") payload.completedDate = new Date();

  const updated = await prisma.actionItem.update({ where: { id: actionId }, data: payload });

  if (data.status === "COMPLETED") {
    await logAudit(req, "Action Completed", "ActionItem", actionId);
  }
  return updated;
}

/** Marks all past-due, non-completed action items as OVERDUE. Called by the scheduler and on-demand. */
export async function sweepOverdueActions() {
  const result = await prisma.actionItem.updateMany({
    where: {
      status: { in: ["PENDING", "IN_PROGRESS"] },
      targetCompletionDate: { lt: new Date() },
    },
    data: { status: "OVERDUE" },
  });
  return result.count;
}
