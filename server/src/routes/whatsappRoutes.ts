import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import { authenticate, authorize } from "../middleware/auth";
import { ApiError } from "../utils/ApiError";
import { whatsAppClient } from "../whatsapp/client";
import { evaluateAllRules, getWhatsAppRuleConfig } from "../whatsapp/ruleEngine";
import { processWhatsAppQueue } from "../whatsapp/worker";
import { WHATSAPP_TEMPLATES } from "../whatsapp/templates";
import { sanitizeAndValidatePhone } from "../whatsapp/phoneUtils";
import { env } from "../config/env";

const router = Router();

/**
 * Safe constant-time token comparison to prevent timing side-channel attacks
 */
function safeTokenCompare(provided: string, expected: string): boolean {
  if (typeof provided !== "string" || typeof expected !== "string") {
    return false;
  }
  const bufA = Buffer.from(provided);
  const bufB = Buffer.from(expected);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// ============================================================================
// Public Webhooks for Meta WhatsApp Cloud API
// ============================================================================

/**
 * Meta Webhook Verification Challenge
 * Supports both /webhook and /webhook/
 */
router.get(["/webhook", "/webhook/"], (req: Request, res: Response) => {
  const mode = req.query["hub.mode"] as string | undefined;
  const token = req.query["hub.verify_token"] as string | undefined;
  const challenge = req.query["hub.challenge"] as string | undefined;

  const configuredToken = env.whatsappWebhookVerifyToken;

  // 1. Validate presence of required parameters
  if (!mode || !token || challenge === undefined) {
    return res.status(400).type("text/plain").send("Missing required hub parameters.");
  }

  // 2. Validate mode is subscribe and verify token matches configured token
  if (mode === "subscribe" && safeTokenCompare(token, configuredToken)) {
    console.log("[WhatsApp Webhook] Verification successful. Returning challenge to Meta.");
    // Return exact challenge as plain text with HTTP 200 (mandatory for Meta validation)
    return res.status(200).type("text/plain").send(String(challenge));
  }

  // 3. Reject invalid mode or mismatched token with HTTP 403
  console.warn("[WhatsApp Webhook] Verification failed: token mismatch or invalid mode.");
  return res.sendStatus(403);
});

/**
 * Meta Webhook Event Receiver (Statuses: SENT, DELIVERED, READ, FAILED & Inbound Messages)
 * Supports both /webhook and /webhook/
 */
router.post(["/webhook", "/webhook/"], async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (!body || typeof body !== "object") {
      return res.status(400).json({ error: "Invalid payload body" });
    }

    if (body.object === "whatsapp_business_account") {
      const entries = body.entry || [];

      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value;
          if (!value) continue;

          // Process status updates (sent, delivered, read, failed)
          if (Array.isArray(value.statuses)) {
            for (const statusObj of value.statuses) {
              const messageId = statusObj.id;
              const status = statusObj.status; // sent | delivered | read | failed
              const timestamp = statusObj.timestamp ? new Date(parseInt(statusObj.timestamp) * 1000) : new Date();

              const updateData: any = {};
              if (status === "delivered") {
                updateData.status = "DELIVERED";
                updateData.deliveredAt = timestamp;
              } else if (status === "read") {
                updateData.status = "READ";
                updateData.readAt = timestamp;
              } else if (status === "failed") {
                updateData.status = "FAILED";
                const errorInfo = statusObj.errors?.[0];
                updateData.failureReason = errorInfo
                  ? `Meta Delivery Failure [${errorInfo.code}]: ${errorInfo.title || errorInfo.message}`
                  : "WhatsApp delivery failed";
              }

              if (Object.keys(updateData).length > 0 && messageId) {
                await prisma.whatsAppNotification.updateMany({
                  where: { providerMessageId: messageId },
                  data: updateData,
                });
              }
            }
          }

          // Process inbound messages safely without throwing or dropping
          if (Array.isArray(value.messages)) {
            for (const msg of value.messages) {
              console.log(`[WhatsApp Webhook] Received inbound message from sender (+${msg.from}), type: ${msg.type}`);
            }
          }
        }
      }

      // Fast HTTP 200 response required by Meta within 5 seconds
      return res.status(200).json({ status: "EVENT_RECEIVED" });
    }

    // Acknowledge gracefully for non-WABA objects
    return res.status(200).json({ status: "IGNORED_NON_WABA_OBJECT" });
  } catch (err) {
    console.warn("[WhatsApp Webhook Processing Notice]", err);
    return res.status(500).json({ error: "Webhook processing error" });
  }
});

// ============================================================================
// Authenticated API Routes
// ============================================================================
router.use(authenticate);

/**
 * GET /api/whatsapp/status
 * Provides real-time WhatsApp Cloud API configuration status & aggregate metrics.
 */
router.get("/status", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const configStatus = whatsAppClient.getConfigStatus();

    // Aggregated metrics from PostgreSQL
    const [
      totalCount,
      sentCount,
      deliveredCount,
      readCount,
      failedCount,
      unavailableCount,
      pendingCount,
      unconfiguredCount,
    ] = await Promise.all([
      prisma.whatsAppNotification.count(),
      prisma.whatsAppNotification.count({ where: { status: "SENT" } }),
      prisma.whatsAppNotification.count({ where: { status: "DELIVERED" } }),
      prisma.whatsAppNotification.count({ where: { status: "READ" } }),
      prisma.whatsAppNotification.count({ where: { status: "FAILED" } }),
      prisma.whatsAppNotification.count({ where: { status: "RECIPIENT_UNAVAILABLE" } }),
      prisma.whatsAppNotification.count({ where: { status: "PENDING" } }),
      prisma.whatsAppNotification.count({ where: { status: "NOT_CONFIGURED" } }),
    ]);

    const ruleConfig = await getWhatsAppRuleConfig();

    res.json({
      success: true,
      integrationStatus: configStatus.isConfigured ? "CONFIGURED" : "NOT CONFIGURED",
      config: configStatus,
      templatesCount: Object.keys(WHATSAPP_TEMPLATES).length,
      templates: Object.values(WHATSAPP_TEMPLATES),
      ruleConfig,
      metrics: {
        total: totalCount,
        sent: sentCount,
        delivered: deliveredCount,
        read: readCount,
        failed: failedCount,
        recipientUnavailable: unavailableCount,
        pending: pendingCount,
        unconfigured: unconfiguredCount,
        successRate: totalCount > 0 && (sentCount + deliveredCount + readCount) > 0
          ? Math.round(((sentCount + deliveredCount + readCount) / totalCount) * 100)
          : 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/whatsapp/notifications
 * Lists notification logs with full pagination, search, and role-based filtering.
 */
router.get("/notifications", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const eventType = req.query.eventType as string | undefined;
    const recipientType = req.query.recipientType as string | undefined;
    const status = req.query.status as string | undefined;
    const departmentId = req.query.departmentId as string | undefined;
    const studentId = req.query.studentId as string | undefined;
    const search = req.query.search as string | undefined;

    const where: any = {};

    if (eventType) where.eventType = eventType;
    if (recipientType) where.recipientType = recipientType;
    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;
    if (studentId) where.studentId = studentId;

    if (search && search.trim().length > 0) {
      const q = search.trim();
      where.OR = [
        { recipientName: { contains: q, mode: "insensitive" } },
        { recipientPhone: { contains: q } },
        { messageBody: { contains: q, mode: "insensitive" } },
        { providerMessageId: { contains: q } },
      ];
    }

    // Role-based visibility enforcement
    if (user.role === "HOD") {
      const hodMentor = await prisma.mentor.findUnique({ where: { userId: user.userId } });
      if (hodMentor?.departmentId) {
        where.departmentId = hodMentor.departmentId;
      }
    } else if (user.role === "MENTOR") {
      const mentor = await prisma.mentor.findUnique({ where: { userId: user.userId } });
      if (mentor) {
        where.OR = [
          { mentorId: mentor.id },
          { recipientPhone: mentor.phone ? { contains: mentor.phone } : undefined },
        ].filter(Boolean);
      }
    } else if (user.role === "STUDENT") {
      const student = await prisma.student.findUnique({ where: { userId: user.userId } });
      if (student) {
        where.studentId = student.id;
      }
    }

    const [total, items] = await Promise.all([
      prisma.whatsAppNotification.count({ where }),
      prisma.whatsAppNotification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/whatsapp/notifications/:id
 * Retrieves full details of a specific WhatsApp notification.
 */
router.get("/notifications/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.whatsAppNotification.findUnique({
      where: { id: req.params.id },
    });

    if (!item) {
      throw ApiError.notFound("WhatsApp notification record not found.");
    }

    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/whatsapp/rules/evaluate
 * Triggers on-demand evaluation of PostgreSQL rules (Admin & HOD).
 */
router.post("/rules/evaluate", authorize("ADMIN", "HOD"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!whatsAppClient.isConfigured()) {
      return res.json({
        success: true,
        message: "WhatsApp integration: NOT CONFIGURED. Alert dispatcher is inactive. All other MentorHUB modules are working normally.",
        summary: {
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
        },
      });
    }

    const user = req.user!;
    let targetDeptId: string | undefined = undefined;

    if (user.role === "HOD") {
      const hodMentor = await prisma.mentor.findUnique({ where: { userId: user.userId } });
      targetDeptId = hodMentor?.departmentId;
    } else if (req.body.departmentId) {
      targetDeptId = req.body.departmentId;
    }

    const summary = await evaluateAllRules({
      departmentId: targetDeptId,
      dispatchImmediately: true,
    });

    res.json({
      success: true,
      message: "Automatic rule condition evaluation completed against PostgreSQL data.",
      summary,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/whatsapp/rules/config
 */
router.get("/rules/config", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await getWhatsAppRuleConfig();
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/whatsapp/rules/config
 * Updates the automatic notification rule thresholds (Admin only).
 */
router.put("/rules/config", authorize("ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      attendanceRiskThreshold,
      feeDueAlertDaysBefore,
      meetingReminderHoursBefore,
      enableAttendanceAlerts,
      enableFeeAlerts,
      enableMeetingReminders,
      enableArrearAlerts,
      enableOverdueActionAlerts,
      dedupCooldownHours,
      quietHoursStart,
      quietHoursEnd,
    } = req.body;

    const updated = await prisma.whatsAppRuleConfig.upsert({
      where: { id: "GLOBAL" },
      update: {
        ...(attendanceRiskThreshold !== undefined ? { attendanceRiskThreshold: Number(attendanceRiskThreshold) } : {}),
        ...(feeDueAlertDaysBefore !== undefined ? { feeDueAlertDaysBefore: Number(feeDueAlertDaysBefore) } : {}),
        ...(meetingReminderHoursBefore !== undefined ? { meetingReminderHoursBefore: Number(meetingReminderHoursBefore) } : {}),
        ...(enableAttendanceAlerts !== undefined ? { enableAttendanceAlerts: Boolean(enableAttendanceAlerts) } : {}),
        ...(enableFeeAlerts !== undefined ? { enableFeeAlerts: Boolean(enableFeeAlerts) } : {}),
        ...(enableMeetingReminders !== undefined ? { enableMeetingReminders: Boolean(enableMeetingReminders) } : {}),
        ...(enableArrearAlerts !== undefined ? { enableArrearAlerts: Boolean(enableArrearAlerts) } : {}),
        ...(enableOverdueActionAlerts !== undefined ? { enableOverdueActionAlerts: Boolean(enableOverdueActionAlerts) } : {}),
        ...(dedupCooldownHours !== undefined ? { dedupCooldownHours: Number(dedupCooldownHours) } : {}),
        ...(quietHoursStart !== undefined ? { quietHoursStart } : {}),
        ...(quietHoursEnd !== undefined ? { quietHoursEnd } : {}),
      },
      create: {
        id: "GLOBAL",
        attendanceRiskThreshold: Number(attendanceRiskThreshold ?? 75.0),
        feeDueAlertDaysBefore: Number(feeDueAlertDaysBefore ?? 7),
        meetingReminderHoursBefore: Number(meetingReminderHoursBefore ?? 24),
        enableAttendanceAlerts: Boolean(enableAttendanceAlerts ?? true),
        enableFeeAlerts: Boolean(enableFeeAlerts ?? true),
        enableMeetingReminders: Boolean(enableMeetingReminders ?? true),
        enableArrearAlerts: Boolean(enableArrearAlerts ?? true),
        enableOverdueActionAlerts: Boolean(enableOverdueActionAlerts ?? true),
        dedupCooldownHours: Number(dedupCooldownHours ?? 168),
        quietHoursStart: quietHoursStart || "21:00",
        quietHoursEnd: quietHoursEnd || "08:00",
      },
    });

    res.json({ success: true, message: "WhatsApp notification rule configuration updated.", data: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/whatsapp/test-send
 * Allows Admin/HOD to test real delivery to an authorized test number with approved template.
 * Strictly prevents fake sent/delivered statuses if credentials are not configured.
 */
router.post("/test-send", authorize("ADMIN", "HOD"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!whatsAppClient.isConfigured()) {
      return res.status(400).json({
        success: false,
        status: "NOT_CONFIGURED",
        message: "WhatsApp integration: NOT CONFIGURED. Provide Meta WhatsApp Cloud API credentials (WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN) in environment to enable real message delivery. No fake sent or delivered statuses are generated.",
      });
    }

    const { toPhone, templateName, templateVariables } = req.body;

    if (!toPhone) {
      throw ApiError.badRequest("Destination phone number is required.");
    }
    if (!templateName || !WHATSAPP_TEMPLATES[templateName]) {
      throw ApiError.badRequest(`Invalid template name '${templateName}'. Choose from approved templates.`);
    }

    const phoneValidation = sanitizeAndValidatePhone(toPhone);
    if (!phoneValidation.isValid) {
      throw ApiError.badRequest(`Invalid phone number: ${phoneValidation.error}`);
    }

    const sendResult = await whatsAppClient.sendMessage({
      toPhone: phoneValidation.formattedPhone,
      templateName,
      templateVariables: templateVariables || {},
    });

    // Save record to database
    const notification = await prisma.whatsAppNotification.create({
      data: {
        eventType: "MANUAL_ALERT",
        recipientType: "ADMIN",
        recipientName: "Test Recipient",
        recipientPhone: phoneValidation.formattedPhone,
        templateName,
        templateVariables: templateVariables || {},
        messageBody: WHATSAPP_TEMPLATES[templateName].renderText(templateVariables || {}),
        status: sendResult.status,
        providerMessageId: sendResult.providerMessageId,
        failureReason: sendResult.failureReason,
        sentAt: sendResult.success ? new Date() : null,
        attemptCount: 1,
      },
    });

    res.json({
      success: sendResult.success,
      result: sendResult,
      notificationId: notification.id,
      message: sendResult.success
        ? `WhatsApp test message successfully dispatched to ${phoneValidation.formattedPhone} (Provider ID: ${sendResult.providerMessageId})`
        : `WhatsApp delivery could not be completed: ${sendResult.failureReason}`,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/whatsapp/queue/process
 * Manually trigger pending queue worker sweep.
 */
router.post("/queue/process", authorize("ADMIN"), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    if (!whatsAppClient.isConfigured()) {
      return res.json({
        success: true,
        message: "WhatsApp integration: NOT CONFIGURED. Queue processing is inactive.",
        result: { processed: 0, sent: 0, failed: 0 },
      });
    }

    const result = await processWhatsAppQueue(50);
    res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/whatsapp/opt-in
 * Manage WhatsApp opt-in / opt-out state
 */
router.post("/opt-in", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, optedIn, recipientName, recipientType, consentSource } = req.body;

    const phoneVal = sanitizeAndValidatePhone(phone);
    if (!phoneVal.isValid) {
      throw ApiError.badRequest(phoneVal.error || "Invalid phone number");
    }

    const record = await prisma.whatsAppOptIn.upsert({
      where: { phone: phoneVal.formattedPhone },
      update: {
        optedIn: Boolean(optedIn),
        ...(optedIn ? { optedInAt: new Date(), optedOutAt: null } : { optedOutAt: new Date() }),
      },
      create: {
        phone: phoneVal.formattedPhone,
        recipientType: recipientType || "STUDENT",
        recipientName: recipientName || null,
        optedIn: Boolean(optedIn),
        optedInAt: new Date(),
        consentSource: consentSource || "USER_MANAGED",
      },
    });

    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
});

export default router;
