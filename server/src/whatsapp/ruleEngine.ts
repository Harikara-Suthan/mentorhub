import { prisma } from "../config/prisma";
import { sanitizeAndValidatePhone } from "./phoneUtils";
import { renderWhatsAppTemplate } from "./templates";
import { whatsAppClient } from "./client";
import {
  RuleEvaluationSummary,
  WhatsAppEventType,
  WhatsAppRecipientType,
  WhatsAppTemplateVariableMap,
} from "./types";

export interface WhatsAppNotificationPayload {
  eventType: WhatsAppEventType;
  sourceRecordId?: string;
  sourceTable?: string;
  recipientType: WhatsAppRecipientType;
  recipientName: string;
  rawPhone?: string | null;
  studentId?: string;
  departmentId?: string;
  mentorId?: string;
  templateName: string;
  templateVariables: WhatsAppTemplateVariableMap;
  dedupKey?: string;
  scheduledAt?: Date;
  dispatchImmediately?: boolean;
}

/**
 * Creates and queues/dispatches an individual WhatsApp notification record.
 * Handles deduplication, recipient validation, opt-in checking, and API dispatch.
 */
export async function createAndDispatchNotification(
  payload: WhatsAppNotificationPayload
): Promise<{ id: string; status: string; skippedReason?: string }> {
  const {
    eventType,
    sourceRecordId,
    sourceTable,
    recipientType,
    recipientName,
    rawPhone,
    studentId,
    departmentId,
    mentorId,
    templateName,
    templateVariables,
    dedupKey,
    scheduledAt = new Date(),
    dispatchImmediately = true,
  } = payload;

  // 1. Deduplication Check
  if (dedupKey) {
    const existing = await prisma.whatsAppNotification.findFirst({
      where: {
        dedupKey,
        status: { in: ["PENDING", "PROCESSING", "SENT", "DELIVERED", "READ"] },
      },
    });

    if (existing) {
      return {
        id: existing.id,
        status: "SKIPPED_DEDUPLICATED",
        skippedReason: `Notification already issued with deduplication key: ${dedupKey}`,
      };
    }
  }

  // 2. Recipient Phone Validation
  const phoneValidation = sanitizeAndValidatePhone(rawPhone);
  const messageBody = renderWhatsAppTemplate(templateName, templateVariables);

  if (!phoneValidation.isValid) {
    // Record explicit failure without faking
    const failedRecord = await prisma.whatsAppNotification.create({
      data: {
        eventType,
        sourceRecordId,
        sourceTable,
        recipientType,
        recipientName,
        recipientPhone: rawPhone || "UNKNOWN",
        studentId,
        departmentId,
        mentorId,
        templateName,
        templateVariables: templateVariables as any,
        messageBody,
        status: "RECIPIENT_UNAVAILABLE",
        failureReason: `Recipient phone validation failed: ${phoneValidation.error}`,
        dedupKey,
        scheduledAt,
        attemptCount: 1,
      },
    });

    return {
      id: failedRecord.id,
      status: "RECIPIENT_UNAVAILABLE",
      skippedReason: phoneValidation.error,
    };
  }

  const validPhone = phoneValidation.formattedPhone;

  // 3. Opt-in / Consent Verification
  const optInRecord = await prisma.whatsAppOptIn.findUnique({
    where: { phone: validPhone },
  });

  if (optInRecord && !optInRecord.optedIn) {
    const optedOutRecord = await prisma.whatsAppNotification.create({
      data: {
        eventType,
        sourceRecordId,
        sourceTable,
        recipientType,
        recipientName,
        recipientPhone: validPhone,
        studentId,
        departmentId,
        mentorId,
        templateName,
        templateVariables: templateVariables as any,
        messageBody,
        status: "RECIPIENT_OPTED_OUT",
        failureReason: "Recipient has explicitly requested to opt-out of institutional WhatsApp notifications.",
        dedupKey,
        scheduledAt,
        attemptCount: 0,
      },
    });

    return {
      id: optedOutRecord.id,
      status: "RECIPIENT_OPTED_OUT",
      skippedReason: "Recipient is opted out.",
    };
  }

  // 4. Dispatch or prepare payload
  let status = "PENDING";
  let providerMessageId: string | undefined = undefined;
  let failureReason: string | undefined = undefined;
  let sentAt: Date | null = null;
  let attemptCount = 0;

  if (!whatsAppClient.isConfigured()) {
    status = "NOT_CONFIGURED";
    failureReason = "WhatsApp integration is NOT CONFIGURED. Meta API credentials not provided in environment.";
    attemptCount = 0;
  } else if (dispatchImmediately) {
    const sendResult = await whatsAppClient.sendMessage({
      toPhone: validPhone,
      templateName,
      templateVariables,
    });
    status = sendResult.status;
    providerMessageId = sendResult.providerMessageId;
    failureReason = sendResult.failureReason;
    sentAt = sendResult.success ? new Date() : null;
    attemptCount = 1;
  }

  // 5. Create Notification Record in PostgreSQL (single atomic insert)
  const notification = await prisma.whatsAppNotification.create({
    data: {
      eventType,
      sourceRecordId,
      sourceTable,
      recipientType,
      recipientName,
      recipientPhone: validPhone,
      studentId,
      departmentId,
      mentorId,
      templateName,
      templateVariables: templateVariables as any,
      messageBody,
      status,
      providerMessageId,
      failureReason,
      sentAt,
      dedupKey,
      scheduledAt,
      attemptCount,
    },
  });

  return { id: notification.id, status: notification.status };
}

/**
 * Generates ISO week string (e.g. 2026-W37) for weekly cooldowns
 */
function getIsoWeek(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function getYearMonth(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getDayString(date = new Date()): string {
  return date.toISOString().split("T")[0];
}

/**
 * Fetches the global or department-scoped WhatsApp rule configuration
 */
export async function getWhatsAppRuleConfig(departmentId?: string) {
  let config = await prisma.whatsAppRuleConfig.findFirst({
    where: departmentId ? { departmentId } : { id: "GLOBAL" },
  });

  if (!config) {
    config = await prisma.whatsAppRuleConfig.findFirst({
      where: { id: "GLOBAL" },
    });
  }

  return (
    config || {
      id: "GLOBAL",
      departmentId: null,
      attendanceRiskThreshold: 75.0,
      feeDueAlertDaysBefore: 7,
      meetingReminderHoursBefore: 24,
      enableAttendanceAlerts: true,
      enableFeeAlerts: true,
      enableMeetingReminders: true,
      enableArrearAlerts: true,
      enableOverdueActionAlerts: true,
      dedupCooldownHours: 168,
      quietHoursStart: "21:00",
      quietHoursEnd: "08:00",
      updatedAt: new Date(),
    }
  );
}

/**
 * Core Rule Evaluation Engine:
 * Queries PostgreSQL database records, checks event conditions, and triggers WhatsApp alerts.
 */
export async function evaluateAllRules(options: { departmentId?: string; dispatchImmediately?: boolean } = {}): Promise<RuleEvaluationSummary> {
  const { departmentId, dispatchImmediately = true } = options;

  const summary: RuleEvaluationSummary = {
    evaluatedAt: new Date().toISOString(),
    attendanceAlertsGenerated: 0,
    feeAlertsGenerated: 0,
    meetingRemindersGenerated: 0,
    arrearAlertsGenerated: 0,
    actionAlertsGenerated: 0,
    totalGenerated: 0,
    totalSkippedDueToDedup: 0,
    totalSkippedDueToInvalidRecipient: 0,
    errors: [],
  };

  // If WhatsApp is NOT CONFIGURED, skip automatic alert evaluation entirely
  if (!whatsAppClient.isConfigured()) {
    return summary;
  }

  const config = await getWhatsAppRuleConfig(departmentId);

  const currentWeek = getIsoWeek();
  const currentMonth = getYearMonth();
  const todayStr = getDayString();

  // =========================================================================
  // 1. AUTOMATIC STUDENT ATTENDANCE ALERT
  // Condition: Student attendance percentage < configured risk threshold
  // =========================================================================
  if (config.enableAttendanceAlerts) {
    try {
      const atRiskStudents = await prisma.student.findMany({
        where: {
          attendancePercentage: { lt: config.attendanceRiskThreshold },
          ...(departmentId ? { departmentId } : {}),
        },
        include: {
          department: true,
          mentor: true,
        },
      });

      for (const student of atRiskStudents) {
        const dedupKey = `ATTENDANCE_RISK:${student.id}:${currentWeek}`;

        const result = await createAndDispatchNotification({
          eventType: "ATTENDANCE_RISK",
          sourceRecordId: student.id,
          sourceTable: "Student",
          recipientType: "STUDENT",
          recipientName: student.fullName,
          rawPhone: student.phone,
          studentId: student.id,
          departmentId: student.departmentId,
          mentorId: student.mentorId,
          templateName: "attendance_risk",
          templateVariables: {
            student_name: student.fullName,
            attendance_percentage: student.attendancePercentage,
            department_name: student.department?.name || "Your Department",
            mentor_name: student.mentor?.fullName || "Faculty Advisor",
          },
          dedupKey,
          dispatchImmediately,
        });

        if (result.status === "SKIPPED_DEDUPLICATED") {
          summary.totalSkippedDueToDedup++;
        } else if (result.status === "RECIPIENT_UNAVAILABLE") {
          summary.totalSkippedDueToInvalidRecipient++;
          summary.attendanceAlertsGenerated++;
        } else {
          summary.attendanceAlertsGenerated++;
          summary.totalGenerated++;
        }
      }
    } catch (err: any) {
      summary.errors.push(`Attendance rule evaluation error: ${err.message}`);
    }
  }

  // =========================================================================
  // 2. AUTOMATIC FEE DUE / OVERDUE ALERTS (Student + Parent)
  // Condition: Fee record has status PENDING / OVERDUE or dueDate has passed
  // =========================================================================
  if (config.enableFeeAlerts) {
    try {
      const noticeHorizon = new Date();
      noticeHorizon.setDate(noticeHorizon.getDate() + config.feeDueAlertDaysBefore);

      const pendingOrOverdueFees = await prisma.studentFee.findMany({
        where: {
          status: { in: ["PENDING", "OVERDUE", "PARTIALLY_PAID"] },
          dueDate: { lte: noticeHorizon },
          ...(departmentId ? { student: { departmentId } } : {}),
        },
        include: {
          student: {
            include: {
              department: true,
              mentor: true,
            },
          },
        },
      });

      const now = new Date();

      for (const fee of pendingOrOverdueFees) {
        const isOverdue = fee.status === "OVERDUE" || (fee.dueDate && fee.dueDate < now);
        const templateName = isOverdue ? "fee_overdue" : "fee_due";
        const eventType: WhatsAppEventType = isOverdue ? "FEE_OVERDUE" : "FEE_DUE";
        const amountDue = fee.totalFees - fee.amountPaid;
        const dueDateFormatted = fee.dueDate ? new Date(fee.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Immediate";

        // A. Student Alert
        const studentDedupKey = `FEE_STUDENT:${fee.id}:${isOverdue ? "OVERDUE" : "DUE"}:${currentMonth}`;
        const studentRes = await createAndDispatchNotification({
          eventType,
          sourceRecordId: fee.id,
          sourceTable: "StudentFee",
          recipientType: "STUDENT",
          recipientName: fee.student.fullName,
          rawPhone: fee.student.phone,
          studentId: fee.student.id,
          departmentId: fee.student.departmentId,
          mentorId: fee.student.mentorId,
          templateName,
          templateVariables: {
            recipient_salutation: "Student",
            student_name: fee.student.fullName,
            fee_category: fee.feeCategory || "Institutional Fees",
            amount_due: amountDue,
            due_date: dueDateFormatted,
          },
          dedupKey: studentDedupKey,
          dispatchImmediately,
        });

        if (studentRes.status === "SKIPPED_DEDUPLICATED") {
          summary.totalSkippedDueToDedup++;
        } else if (studentRes.status === "RECIPIENT_UNAVAILABLE") {
          summary.totalSkippedDueToInvalidRecipient++;
          summary.feeAlertsGenerated++;
        } else {
          summary.feeAlertsGenerated++;
          summary.totalGenerated++;
        }

        // B. Parent Alert
        const parentPhone = fee.student.parentContact || fee.student.emergencyContactPhone;
        const parentDedupKey = `FEE_PARENT:${fee.id}:${isOverdue ? "OVERDUE" : "DUE"}:${currentMonth}`;
        const parentRes = await createAndDispatchNotification({
          eventType,
          sourceRecordId: fee.id,
          sourceTable: "StudentFee",
          recipientType: "PARENT",
          recipientName: fee.student.parentName || `Parent of ${fee.student.fullName}`,
          rawPhone: parentPhone,
          studentId: fee.student.id,
          departmentId: fee.student.departmentId,
          mentorId: fee.student.mentorId,
          templateName,
          templateVariables: {
            recipient_salutation: "Parent",
            student_name: fee.student.fullName,
            fee_category: fee.feeCategory || "Institutional Fees",
            amount_due: amountDue,
            due_date: dueDateFormatted,
          },
          dedupKey: parentDedupKey,
          dispatchImmediately,
        });

        if (parentRes.status === "SKIPPED_DEDUPLICATED") {
          summary.totalSkippedDueToDedup++;
        } else if (parentRes.status === "RECIPIENT_UNAVAILABLE") {
          summary.totalSkippedDueToInvalidRecipient++;
          summary.feeAlertsGenerated++;
        } else {
          summary.feeAlertsGenerated++;
          summary.totalGenerated++;
        }
      }
    } catch (err: any) {
      summary.errors.push(`Fee rule evaluation error: ${err.message}`);
    }
  }

  // =========================================================================
  // 3. AUTOMATIC FACULTY / MENTOR MEETING REMINDER
  // Condition: Upcoming scheduled meeting for today / within next 24 hours
  // =========================================================================
  if (config.enableMeetingReminders) {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const reminderWindowEnd = new Date();
      reminderWindowEnd.setDate(reminderWindowEnd.getDate() + 1);
      reminderWindowEnd.setHours(23, 59, 59, 999);

      const upcomingMeetings = await prisma.meeting.findMany({
        where: {
          meetingDate: { gte: todayStart, lte: reminderWindowEnd },
          ...(departmentId ? { mentor: { departmentId } } : {}),
        },
        include: {
          mentor: true,
          student: true,
        },
      });

      for (const meeting of upcomingMeetings) {
        const meetingDateObj = new Date(meeting.meetingDate);
        const timeStr = meetingDateObj.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        const dedupKey = `FACULTY_MEETING:${meeting.id}:${todayStr}`;

        const result = await createAndDispatchNotification({
          eventType: "FACULTY_MEETING_REMINDER",
          sourceRecordId: meeting.id,
          sourceTable: "Meeting",
          recipientType: "FACULTY",
          recipientName: meeting.mentor.fullName,
          rawPhone: meeting.mentor.phone,
          studentId: meeting.studentId,
          departmentId: meeting.mentor.departmentId,
          mentorId: meeting.mentorId,
          templateName: "mentor_meeting_reminder",
          templateVariables: {
            faculty_name: meeting.mentor.fullName,
            meeting_time: timeStr,
            meeting_type: meeting.meetingType === "GROUP" ? "Group Advisory" : "Individual Mentoring",
            mentee_info: `${meeting.student.fullName} (${meeting.student.registerNumber})`,
          },
          dedupKey,
          dispatchImmediately,
        });

        if (result.status === "SKIPPED_DEDUPLICATED") {
          summary.totalSkippedDueToDedup++;
        } else if (result.status === "RECIPIENT_UNAVAILABLE") {
          summary.totalSkippedDueToInvalidRecipient++;
          summary.meetingRemindersGenerated++;
        } else {
          summary.meetingRemindersGenerated++;
          summary.totalGenerated++;
        }
      }
    } catch (err: any) {
      summary.errors.push(`Meeting reminder evaluation error: ${err.message}`);
    }
  }

  // =========================================================================
  // 4. AUTOMATIC ARREAR WARNING ALERT
  // Condition: Student has 2 or more active arrears
  // =========================================================================
  if (config.enableArrearAlerts) {
    try {
      const arrearStudents = await prisma.student.findMany({
        where: {
          arrearCount: { gte: 2 },
          ...(departmentId ? { departmentId } : {}),
        },
        include: {
          mentor: true,
          department: true,
        },
      });

      for (const student of arrearStudents) {
        const dedupKey = `ARREAR_WARNING:${student.id}:${student.arrearCount}:${currentMonth}`;

        const result = await createAndDispatchNotification({
          eventType: "ARREAR_WARNING",
          sourceRecordId: student.id,
          sourceTable: "Student",
          recipientType: "STUDENT",
          recipientName: student.fullName,
          rawPhone: student.phone,
          studentId: student.id,
          departmentId: student.departmentId,
          mentorId: student.mentorId,
          templateName: "arrear_alert",
          templateVariables: {
            student_name: student.fullName,
            arrear_count: student.arrearCount,
            mentor_name: student.mentor?.fullName || "Faculty Mentor",
          },
          dedupKey,
          dispatchImmediately,
        });

        if (result.status === "SKIPPED_DEDUPLICATED") {
          summary.totalSkippedDueToDedup++;
        } else if (result.status === "RECIPIENT_UNAVAILABLE") {
          summary.totalSkippedDueToInvalidRecipient++;
          summary.arrearAlertsGenerated++;
        } else {
          summary.arrearAlertsGenerated++;
          summary.totalGenerated++;
        }
      }
    } catch (err: any) {
      summary.errors.push(`Arrear warning evaluation error: ${err.message}`);
    }
  }

  // =========================================================================
  // 5. AUTOMATIC OVERDUE ACTION ITEM ALERT
  // Condition: Action item is OVERDUE or past target date
  // =========================================================================
  if (config.enableOverdueActionAlerts) {
    try {
      const now = new Date();
      const overdueActions = await prisma.actionItem.findMany({
        where: {
          OR: [{ status: "OVERDUE" }, { targetCompletionDate: { lt: now }, status: "PENDING" }],
          ...(departmentId ? { student: { departmentId } } : {}),
        },
        include: {
          student: true,
          mentor: true,
        },
      });

      for (const action of overdueActions) {
        const isStudentAssignee = action.actionType === "STUDENT_ACTION";
        const recipientName = isStudentAssignee ? action.student.fullName : action.mentor.fullName;
        const recipientPhone = isStudentAssignee ? action.student.phone : action.mentor.phone;
        const recipientType: WhatsAppRecipientType = isStudentAssignee ? "STUDENT" : "FACULTY";

        const dedupKey = `ACTION_OVERDUE:${action.id}:${currentWeek}`;

        const result = await createAndDispatchNotification({
          eventType: "ACTION_ITEM_OVERDUE",
          sourceRecordId: action.id,
          sourceTable: "ActionItem",
          recipientType,
          recipientName,
          rawPhone: recipientPhone,
          studentId: action.studentId,
          departmentId: action.student.departmentId,
          mentorId: action.mentorId,
          templateName: "action_item_overdue",
          templateVariables: {
            assigned_name: recipientName,
            action_description: action.description,
            due_date: new Date(action.targetCompletionDate).toLocaleDateString("en-IN"),
            student_name: action.student.fullName,
          },
          dedupKey,
          dispatchImmediately,
        });

        if (result.status === "SKIPPED_DEDUPLICATED") {
          summary.totalSkippedDueToDedup++;
        } else if (result.status === "RECIPIENT_UNAVAILABLE") {
          summary.totalSkippedDueToInvalidRecipient++;
          summary.actionAlertsGenerated++;
        } else {
          summary.actionAlertsGenerated++;
          summary.totalGenerated++;
        }
      }
    } catch (err: any) {
      summary.errors.push(`Action item evaluation error: ${err.message}`);
    }
  }

  return summary;
}
