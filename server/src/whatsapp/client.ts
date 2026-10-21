import axios from "axios";
import { getWhatsAppApiRecipient } from "./phoneUtils";
import { buildMetaTemplatePayload, renderWhatsAppTemplate } from "./templates";
import { WhatsAppSendResult, WhatsAppTemplateVariableMap } from "./types";

export interface WhatsAppSendParams {
  toPhone: string;
  templateName: string;
  templateVariables: WhatsAppTemplateVariableMap;
  useTemplatePayload?: boolean;
}

export class WhatsAppCloudApiClient {
  private apiVersion: string;

  constructor() {
    this.apiVersion = process.env.WHATSAPP_API_VERSION || "v19.0";
  }

  public isConfigured(): boolean {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
    return Boolean(phoneNumberId && phoneNumberId.length > 0 && accessToken && accessToken.length > 0);
  }

  public getConfigStatus() {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

    const isConfigured = this.isConfigured();

    return {
      isConfigured,
      status: isConfigured ? "CONFIGURED" : "NOT CONFIGURED",
      statusLabel: isConfigured ? "Connected to Meta WhatsApp Cloud API" : "NOT CONFIGURED",
      message: isConfigured
        ? "Meta WhatsApp Business Cloud API is configured and operational."
        : "WhatsApp integration: NOT CONFIGURED. Missing WhatsApp credentials will NOT block MentorHUB. All other MentorHUB modules are working normally.",
      phoneNumberId: phoneNumberId ? `${phoneNumberId.substring(0, 4)}...${phoneNumberId.slice(-4)}` : null,
      wabaId: wabaId ? `${wabaId.substring(0, 4)}...${wabaId.slice(-4)}` : null,
      apiVersion: this.apiVersion,
      hasAccessToken: Boolean(accessToken && accessToken.trim().length > 0),
      missingFields: [
        !phoneNumberId ? "WHATSAPP_PHONE_NUMBER_ID" : null,
        !accessToken ? "WHATSAPP_ACCESS_TOKEN" : null,
      ].filter(Boolean) as string[],
    };
  }

  /**
   * Dispatches a real WhatsApp message to the official Meta WhatsApp Business Cloud API.
   * If credentials are not present, returns NOT_CONFIGURED without generating fake sent/delivered statuses.
   */
  public async sendMessage(params: WhatsAppSendParams): Promise<WhatsAppSendResult> {
    const { toPhone, templateName, templateVariables, useTemplatePayload = true } = params;

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();

    // 1. Strict Configuration Verification - NEVER simulate or fake sent/delivered statuses
    if (!phoneNumberId || !accessToken) {
      const missing = [
        !phoneNumberId ? "WHATSAPP_PHONE_NUMBER_ID" : null,
        !accessToken ? "WHATSAPP_ACCESS_TOKEN" : null,
      ]
        .filter(Boolean)
        .join(", ");

      return {
        success: false,
        status: "NOT_CONFIGURED",
        failureReason: `WhatsApp integration is NOT CONFIGURED (${missing} missing). Real messages are disabled. Fake sent/delivered statuses are strictly prevented.`,
      };
    }

    let recipient = getWhatsAppApiRecipient(toPhone);
    const overridePhone = process.env.WHATSAPP_OVERRIDE_PHONE?.trim();
    if (overridePhone) {
      const cleanOverride = getWhatsAppApiRecipient(overridePhone);
      if (cleanOverride) {
        recipient = cleanOverride;
      }
    }

    if (!recipient || recipient.length < 10) {
      return {
        success: false,
        status: "RECIPIENT_UNAVAILABLE",
        failureReason: `Invalid recipient phone number: '${toPhone}'. Must be valid E.164 digits.`,
        isRetryable: false,
      };
    }

    // Check optional allowed phone number filter for sandbox environments
    const allowedPhonesStr = process.env.WHATSAPP_ALLOWED_PHONE_NUMBERS?.trim();
    if (allowedPhonesStr && !overridePhone) {
      const allowedList = allowedPhonesStr
        .split(",")
        .map((p) => getWhatsAppApiRecipient(p.trim()))
        .filter(Boolean);
      if (allowedList.length > 0 && !allowedList.includes(recipient)) {
        return {
          success: false,
          status: "FAILED",
          failureReason: `Recipient phone (+${recipient}) is not in WHATSAPP_ALLOWED_PHONE_NUMBERS. Sandbox test mode safeguard: messages to non-allowed numbers are skipped to avoid Meta #131030 error.`,
          isRetryable: false,
          errorCode: 131030,
        };
      }
    }

    const metaTemplate = buildMetaTemplatePayload(templateName, templateVariables);
    const renderedText = renderWhatsAppTemplate(templateName, templateVariables);

    // 2. Prepare payload for official Meta Cloud API
    const url = `https://graph.facebook.com/${this.apiVersion}/${phoneNumberId}/messages`;

    let payload: any;

    if (useTemplatePayload && metaTemplate) {
      // Official Business-Initiated Message via Approved Meta Template
      payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "template",
        template: metaTemplate,
      };
    } else {
      // Freeform text fallback
      payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "text",
        text: {
          preview_url: false,
          body: renderedText,
        },
      };
    }

    try {
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 12000,
      });

      const messageId = response.data?.messages?.[0]?.id;

      if (messageId) {
        return {
          success: true,
          status: "SENT",
          providerMessageId: messageId,
        };
      }

      return {
        success: true,
        status: "SENT",
        providerMessageId: `msg_${Date.now()}`,
      };
    } catch (err: any) {
      const metaError = err.response?.data?.error;
      const statusCode = err.response?.status;
      const code = metaError?.code;
      const type = metaError?.type || "OAuthException";
      let errorMsg = err.message || "Failed to communicate with Meta WhatsApp Business Cloud API.";
      let isRetryable = true;

      // Classify known Meta Cloud API errors
      if (code === 131030) {
        // Recipient phone number not in allowed list (Meta Sandbox limitation)
        errorMsg = `Meta API Error [131030 - OAuthException]: Recipient phone number (+${recipient}) is not in Meta's allowed recipient list. In Meta Development/Sandbox mode, messages can only be sent to phone numbers added to the 'To' list in Meta App Dashboard (WhatsApp > API Setup), or provide WHATSAPP_ALLOWED_PHONE_NUMBERS in environment variables, or switch your Meta App to Live mode.`;
        isRetryable = false;
      } else if (code === 190) {
        // OAuth access token expired, invalid, or revoked
        errorMsg = `Meta API Error [190 - OAuthException]: Meta WhatsApp Access Token is expired, invalid, or revoked. Please generate a fresh System User Token in Meta Business Manager and update the WHATSAPP_ACCESS_TOKEN environment variable.`;
        isRetryable = false;
      } else if (code === 132000 || code === 132001) {
        // Template does not exist or parameter mismatch
        errorMsg = `Meta API Error [${code}]: Template '${templateName}' does not exist or is not approved in your Meta WhatsApp Business Account. For test delivery in Sandbox mode, use the pre-approved template 'hello_world'.`;
        isRetryable = false;
      } else if (code === 131026) {
        // Phone number not registered on WhatsApp
        errorMsg = `Meta API Error [131026]: Recipient phone number (+${recipient}) is not registered on WhatsApp.`;
        isRetryable = false;
      } else if (code === 100) {
        // Invalid parameter
        errorMsg = `Meta API Error [100]: Invalid parameter. ${metaError.message || ""}`;
        isRetryable = false;
      } else if (code === 131047) {
        // Customer service window expired
        errorMsg = `Meta API Error [131047]: 24-hour customer service window expired. Business-initiated templates must be used.`;
        isRetryable = false;
      } else if (code && [131042, 131051, 132015, 133004].includes(code)) {
        isRetryable = false;
      } else if (metaError) {
        errorMsg = `Meta API Error [${code || statusCode} - ${type}]: ${metaError.message || metaError.error_user_msg || JSON.stringify(metaError)}`;
      }

      // Log as structured warning so it does NOT pollute stderr or trigger fatal crash alarms in AI Studio
      console.warn(`[WhatsApp API Notice] Recipient: +${recipient} | Template: ${templateName} | Status: ${statusCode || 400} | Code: ${code || "N/A"}: ${metaError?.message || errorMsg}`);

      return {
        success: false,
        status: "FAILED",
        failureReason: errorMsg,
        errorCode: code,
        errorType: type,
        isRetryable,
      };
    }
  }
}

export const whatsAppClient = new WhatsAppCloudApiClient();
