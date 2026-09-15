import { prisma } from "../config/prisma";
import { whatsAppClient } from "./client";

/**
 * Background queue worker that processes pending WhatsApp notifications
 * and retries temporary failures with exponential backoff.
 */
export async function processWhatsAppQueue(batchSize = 25): Promise<{ processed: number; sent: number; failed: number }> {
  // If WhatsApp is NOT CONFIGURED, immediately return without doing work or generating fake statuses
  if (!whatsAppClient.isConfigured()) {
    return { processed: 0, sent: 0, failed: 0 };
  }

  const now = new Date();

  // Find notifications that are PENDING or eligible for retry
  const pendingNotifications = await prisma.whatsAppNotification.findMany({
    where: {
      OR: [
        { status: "PENDING", scheduledAt: { lte: now } },
        {
          status: "FAILED",
          attemptCount: { lt: 3 },
          nextRetryAt: { lte: now },
        },
      ],
    },
    take: batchSize,
    orderBy: { scheduledAt: "asc" },
  });

  let sentCount = 0;
  let failedCount = 0;

  for (const notif of pendingNotifications) {
    try {
      await prisma.whatsAppNotification.update({
        where: { id: notif.id },
        data: { status: "PROCESSING" },
      });

      const templateVars = (notif.templateVariables as any) || {};

      const sendResult = await whatsAppClient.sendMessage({
        toPhone: notif.recipientPhone,
        templateName: notif.templateName,
        templateVariables: templateVars,
      });

      const nextAttempt = notif.attemptCount + 1;

      if (sendResult.success) {
        sentCount++;
        await prisma.whatsAppNotification.update({
          where: { id: notif.id },
          data: {
            status: sendResult.status,
            providerMessageId: sendResult.providerMessageId,
            failureReason: null,
            sentAt: new Date(),
            attemptCount: nextAttempt,
          },
        });
      } else {
        failedCount++;
        // Calculate exponential backoff: 5m, 15m, 60m
        const retryDelaysMinutes = [5, 15, 60];
        const delay = retryDelaysMinutes[Math.min(nextAttempt - 1, retryDelaysMinutes.length - 1)] || 60;
        const nextRetryAt = new Date(Date.now() + delay * 60 * 1000);

        const isMaxReached = nextAttempt >= notif.maxAttempts;

        await prisma.whatsAppNotification.update({
          where: { id: notif.id },
          data: {
            status: isMaxReached ? "FAILED" : "PENDING",
            failureReason: sendResult.failureReason || "WhatsApp API dispatch failed.",
            attemptCount: nextAttempt,
            nextRetryAt: isMaxReached ? null : nextRetryAt,
          },
        });
      }
    } catch (err: any) {
      failedCount++;
      await prisma.whatsAppNotification.update({
        where: { id: notif.id },
        data: {
          status: "FAILED",
          failureReason: err.message || "Unexpected queue processing error.",
          attemptCount: { increment: 1 },
        },
      });
    }
  }

  return {
    processed: pendingNotifications.length,
    sent: sentCount,
    failed: failedCount,
  };
}
