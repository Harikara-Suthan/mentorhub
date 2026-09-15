export type WhatsAppEventType =
  | "ATTENDANCE_RISK"
  | "FEE_DUE"
  | "FEE_OVERDUE"
  | "FACULTY_MEETING_REMINDER"
  | "ARREAR_WARNING"
  | "ACTION_ITEM_OVERDUE"
  | "PLACEMENT_REMINDER"
  | "MANUAL_ALERT";

export type WhatsAppRecipientType = "STUDENT" | "PARENT" | "FACULTY" | "HOD" | "ADMIN";

export type WhatsAppDeliveryStatus =
  | "NOT_CONFIGURED"
  | "PENDING"
  | "PROCESSING"
  | "SENT"
  | "DELIVERED"
  | "READ"
  | "FAILED"
  | "CANCELLED"
  | "RECIPIENT_UNAVAILABLE"
  | "RECIPIENT_OPTED_OUT";

export interface WhatsAppTemplateVariableMap {
  student_name?: string;
  attendance_percentage?: string | number;
  department_name?: string;
  mentor_name?: string;
  faculty_name?: string;
  meeting_time?: string;
  meeting_type?: string;
  mentee_info?: string;
  fee_category?: string;
  amount_due?: string | number;
  due_date?: string;
  arrear_count?: string | number;
  action_description?: string;
  assigned_name?: string;
  recipient_salutation?: string;
  [key: string]: any;
}

export interface WhatsAppSendResult {
  success: boolean;
  providerMessageId?: string;
  status: WhatsAppDeliveryStatus;
  failureReason?: string;
  isSimulated?: boolean;
}

export interface WhatsAppCloudApiConfig {
  phoneNumberId: string;
  accessToken: string;
  wabaId?: string;
  apiVersion?: string;
}

export interface RuleEvaluationSummary {
  evaluatedAt: string;
  attendanceAlertsGenerated: number;
  feeAlertsGenerated: number;
  meetingRemindersGenerated: number;
  arrearAlertsGenerated: number;
  actionAlertsGenerated: number;
  totalGenerated: number;
  totalSkippedDueToDedup: number;
  totalSkippedDueToInvalidRecipient: number;
  errors: string[];
}
