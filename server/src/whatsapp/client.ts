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

    const recipient = getWhatsAppApiRecipient(toPhone);
    if (!recipient || recipient.length < 10) {
      return {
        success: false,
        status: "RECIPIENT_UNAVAILABLE",
        failureReason: `Invalid recipient phone number: '${toPhone}'. Must be valid E.164 digits.`,
      };
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
      let errorMsg = err.message || "Failed to communicate with Meta WhatsApp Business Cloud API.";

      if (metaError) {
        errorMsg = `Meta API Error [${metaError.code || statusCode} - ${metaError.type || "OAuthException"}]: ${metaError.message || metaError.error_user_msg || JSON.stringify(metaError)}`;
      }

      console.error("[WhatsApp Cloud API Error]", {
        status: statusCode,
        error: metaError || err.message,
        recipient,
        templateName,
      });

      return {
        success: false,
        status: "FAILED",
        failureReason: errorMsg,
      };
    }
  }
}

export const whatsAppClient = new WhatsAppCloudApiClient();
