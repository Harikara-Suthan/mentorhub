import cron from "node-cron";
import { prisma } from "../config/prisma";
import { sweepOverdueActions } from "../services/actionService";
import { createNotification } from "../services/notificationService";
import { evaluateAllRules } from "../whatsapp/ruleEngine";
import { processWhatsAppQueue } from "../whatsapp/worker";
import { whatsAppClient } from "../whatsapp/client";

/**
 * Background jobs. Runs on the backend server independent of any browser session.
 * Core MentorHUB jobs are always active.
 * WhatsApp background dispatcher only runs when WhatsApp credentials are configured.
 */
export function startScheduledJobs() {
  // Core MentorHUB scheduled jobs - ALWAYS ACTIVE regardless of WhatsApp configuration
  // Every day at 07:00 - overdue action sweep + overdue alerts
  cron.schedule("0 7 * * *", async () => {
    try {
      const count = await sweepOverdueActions();
      if (count > 0) console.log(`Marked ${count} action item(s) as overdue`);
      await notifyOverdueActions();
    } catch (err) {
      console.error("[Scheduler] Overdue action sweep failed:", err);
    }
  });

  // Every day at 07:30 - upcoming meeting / follow-up reminders (next 24h)
  cron.schedule("30 7 * * *", async () => {
    try {
      await notifyUpcomingFollowUps();
    } catch (err) {
      console.error("[Scheduler] Follow-up reminder job failed:", err);
    }
  });

  // Every day at 08:00 - repeated issue alerts
  cron.schedule("0 8 * * *", async () => {
    try {
      await notifyRepeatedIssues();
    } catch (err) {
      console.error("[Scheduler] Repeated issue alert job failed:", err);
    }
  });

  // 1st of every month at 09:00 - monthly mentoring record reminder
  cron.schedule("0 9 1 * *", async () => {
    try {
      await notifyMonthlyReminder();
    } catch (err) {
      console.error("[Scheduler] Monthly reminder job failed:", err);
    }
  });

  // =========================================================================
  // WHATSAPP BACKGROUND ENGINE
  // Missing WhatsApp credentials must NOT block MentorHUB startup.
  // When credentials are not configured, WhatsApp engine is idle and does not
  // generate fake statuses or flood the database.
  // =========================================================================
  const isWhatsAppConfigured = whatsAppClient.isConfigured();

  if (!isWhatsAppConfigured) {
    console.log(
      "[WhatsApp Integration] Status: NOT CONFIGURED. Missing Meta credentials (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN). " +
      "WhatsApp automated alert dispatcher is inactive. All other MentorHUB modules are WORKING normally."
    );
  } else {
    // Only schedule WhatsApp jobs when credentials are confirmed configured
    // Daily at 08:30 - Evaluate Faculty Meeting Reminders for today's scheduled meetings
    cron.schedule("30 8 * * *", async () => {
      try {
        if (!whatsAppClient.isConfigured()) return;
        console.log("[WhatsApp Engine] Running daily faculty meeting reminder evaluation...");
        const summary = await evaluateAllRules();
        console.log(`[WhatsApp Engine] Generated ${summary.meetingRemindersGenerated} meeting reminder(s)`);
      } catch (err) {
        console.error("[WhatsApp Engine Error] Faculty meeting reminder job failed:", err);
      }
    });

    // Daily at 09:00 - Evaluate Student Attendance Risk Alerts (< configured threshold)
    cron.schedule("0 9 * * *", async () => {
      try {
        if (!whatsAppClient.isConfigured()) return;
        console.log("[WhatsApp Engine] Running daily student attendance risk evaluation...");
        const summary = await evaluateAllRules();
        console.log(`[WhatsApp Engine] Generated ${summary.attendanceAlertsGenerated} attendance alert(s)`);
      } catch (err) {
        console.error("[WhatsApp Engine Error] Attendance risk alert job failed:", err);
      }
    });

    // Daily at 10:00 - Evaluate Fee Due / Overdue Alerts (Student + Parent)
    cron.schedule("0 10 * * *", async () => {
      try {
        if (!whatsAppClient.isConfigured()) return;
        console.log("[WhatsApp Engine] Running daily fee due/overdue alert evaluation...");
        const summary = await evaluateAllRules();
        console.log(`[WhatsApp Engine] Generated ${summary.feeAlertsGenerated} fee alert(s)`);
      } catch (err) {
        console.error("[WhatsApp Engine Error] Fee alert job failed:", err);
      }
    });

    // Every 15 minutes - Process pending queue & retry transient failures with exponential backoff
    cron.schedule("*/15 * * * *", async () => {
      try {
        if (!whatsAppClient.isConfigured()) return;
        const qResult = await processWhatsAppQueue(25);
        if (qResult.processed > 0) {
          console.log(`[WhatsApp Queue Worker] Processed ${qResult.processed} item(s) (Sent: ${qResult.sent}, Failed: ${qResult.failed})`);
        }
      } catch (err) {
        console.error("[WhatsApp Queue Error] Queue sweep failed:", err);
      }
    });

    // Initial automatic rule evaluation on server boot (delayed by 8 seconds) only when configured
    setTimeout(async () => {
      try {
        if (!whatsAppClient.isConfigured()) return;
        console.log("[WhatsApp Engine] Bootstrapping initial automatic alert condition evaluation from PostgreSQL...");
        const summary = await evaluateAllRules();
        console.log(`[WhatsApp Engine Initial Boot] Evaluation completed: ${summary.totalGenerated} alert(s) generated, ${summary.totalSkippedDueToDedup} skipped (dedup).`);
      } catch (err) {
        console.warn("[WhatsApp Engine Notice] Initial boot evaluation notice:", err);
      }
    }, 8000);
  }

  console.log("MentorHUB core background scheduler started successfully.");
}


async function notifyOverdueActions() {
  const overdue = await prisma.actionItem.findMany({
    where: { status: "OVERDUE" },
    include: { mentor: { include: { user: true } }, student: true },
  });
  for (const item of overdue) {
    await createNotification(item.mentor.user.id, {
      type: "OVERDUE_ACTION",
      title: "Action item overdue",
      message: `"${item.description}" for ${item.student.fullName} was due ${item.targetCompletionDate.toLocaleDateString()}.`,
      entityId: item.id,
    });
  }
}

async function notifyUpcomingFollowUps() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startOfTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
  const endOfTomorrow = new Date(startOfTomorrow);
  endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);

  const meetings = await prisma.meeting.findMany({
    where: { nextFollowUpDate: { gte: startOfTomorrow, lt: endOfTomorrow } },
    include: { mentor: { include: { user: true } }, student: true },
  });

  for (const meeting of meetings) {
    await createNotification(meeting.mentor.user.id, {
      type: "FOLLOW_UP",
      title: "Follow-up due tomorrow",
      message: `Follow up with ${meeting.student.fullName} is scheduled for tomorrow.`,
      entityId: meeting.id,
    });
  }
}

async function notifyRepeatedIssues() {
  const grouped = await prisma.studentIssue.groupBy({
    by: ["studentId", "category"],
    where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
    _count: { category: true },
    having: { category: { _count: { gte: 3 } } },
  });

  for (const g of grouped) {
    const student = await prisma.student.findUnique({ where: { id: g.studentId }, include: { mentor: { include: { user: true } } } });
    if (!student) continue;
    await createNotification(student.mentor.user.id, {
      type: "REPEATED_ISSUE",
      title: "Repeated issue alert",
      message: `${student.fullName} has reported ${g.category.replace(/_/g, " ").toLowerCase()} issues ${g._count.category} times.`,
      entityId: student.id,
    });
  }
}

async function notifyMonthlyReminder() {
  const mentors = await prisma.mentor.findMany({ include: { user: true } });
  const monthName = new Date().toLocaleString("default", { month: "long" });
  for (const mentor of mentors) {
    await createNotification(mentor.user.id, {
      type: "MONTHLY_REMINDER",
      title: "Monthly mentoring records due",
      message: `Please complete the mentoring records for ${monthName}.`,
    });
  }
}
