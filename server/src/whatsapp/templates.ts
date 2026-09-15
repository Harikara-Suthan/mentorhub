import { WhatsAppEventType, WhatsAppTemplateVariableMap } from "./types";

export interface WhatsAppTemplateDefinition {
  name: string;
  category: "UTILITY" | "AUTHENTICATION" | "MARKETING";
  language: string;
  eventType: WhatsAppEventType;
  description: string;
  variables: string[];
  renderText: (vars: WhatsAppTemplateVariableMap) => string;
}

export const WHATSAPP_TEMPLATES: Record<string, WhatsAppTemplateDefinition> = {
  attendance_risk: {
    name: "attendance_risk",
    category: "UTILITY",
    language: "en_US",
    eventType: "ATTENDANCE_RISK",
    description: "Automatic alert sent to student when attendance drops below configured risk threshold.",
    variables: ["student_name", "attendance_percentage", "department_name", "mentor_name"],
    renderText: (vars) => {
      const studentName = vars.student_name || "Student";
      const attendance = vars.attendance_percentage ?? "--";
      const mentor = vars.mentor_name ? `\nPlease connect with your mentor ${vars.mentor_name} for advisory guidance.` : "";
      return `Dear ${studentName},\n\nYour attendance is currently at risk.\nCurrent attendance: ${attendance}%.\n\nPlease attend college regularly to avoid further shortage.${mentor}\n\nRegards,\nMentorHUB`;
    },
  },

  fee_due: {
    name: "fee_due",
    category: "UTILITY",
    language: "en_US",
    eventType: "FEE_DUE",
    description: "Notification sent to student or parent when college fee is due.",
    variables: ["recipient_salutation", "student_name", "fee_category", "amount_due", "due_date"],
    renderText: (vars) => {
      const isParent = vars.recipient_salutation?.toLowerCase().includes("parent");
      const studentName = vars.student_name || "Student";
      const category = vars.fee_category ? ` for ${vars.fee_category}` : "";
      const amount = vars.amount_due ? ` of ₹${Number(vars.amount_due).toLocaleString("en-IN")}` : "";
      const due = vars.due_date ? ` (Due date: ${vars.due_date})` : "";

      if (isParent) {
        return `Dear Parent,\n\n${studentName}'s college fee payment${category}${amount} is due${due}.\nKindly ensure the fee is paid at the earliest.\n\nRegards,\nMentorHUB`;
      }
      return `Dear ${studentName},\n\nYour college fee payment${category}${amount} is due${due}.\nPlease complete the payment at the earliest.\n\nRegards,\nMentorHUB`;
    },
  },

  fee_overdue: {
    name: "fee_overdue",
    category: "UTILITY",
    language: "en_US",
    eventType: "FEE_OVERDUE",
    description: "Urgent alert sent to student and parent when fee due date has passed.",
    variables: ["recipient_salutation", "student_name", "fee_category", "amount_due", "due_date"],
    renderText: (vars) => {
      const isParent = vars.recipient_salutation?.toLowerCase().includes("parent");
      const studentName = vars.student_name || "Student";
      const category = vars.fee_category ? ` for ${vars.fee_category}` : "";
      const amount = vars.amount_due ? ` of ₹${Number(vars.amount_due).toLocaleString("en-IN")}` : "";
      const due = vars.due_date ? ` which was due on ${vars.due_date}` : "";

      if (isParent) {
        return `Dear Parent,\n\n${studentName}'s college fee payment${category}${amount}${due} is currently OVERDUE.\nKindly arrange for payment clearance immediately to avoid academic hold.\n\nRegards,\nMentorHUB`;
      }
      return `Dear ${studentName},\n\nYour college fee payment${category}${amount}${due} is currently OVERDUE.\nPlease clear the pending dues immediately.\n\nRegards,\nMentorHUB`;
    },
  },

  mentor_meeting_reminder: {
    name: "mentor_meeting_reminder",
    category: "UTILITY",
    language: "en_US",
    eventType: "FACULTY_MEETING_REMINDER",
    description: "Dedicated personal reminder sent to faculty member for upcoming mentoring meeting.",
    variables: ["faculty_name", "meeting_time", "meeting_type", "mentee_info"],
    renderText: (vars) => {
      const facultyName = vars.faculty_name || "Faculty";
      const time = vars.meeting_time || "today";
      const mentee = vars.mentee_info ? ` with ${vars.mentee_info}` : "";
      return `Dear ${facultyName},\n\nYou have a mentoring meeting scheduled today at ${time}${mentee}.\nPlease attend the meeting on time.\n\nRegards,\nMentorHUB`;
    },
  },

  arrear_alert: {
    name: "arrear_alert",
    category: "UTILITY",
    language: "en_US",
    eventType: "ARREAR_WARNING",
    description: "Advisory warning for students with active arrears.",
    variables: ["student_name", "arrear_count", "mentor_name"],
    renderText: (vars) => {
      const studentName = vars.student_name || "Student";
      const count = vars.arrear_count || 1;
      const mentor = vars.mentor_name ? `\nPlease meet with your mentor ${vars.mentor_name} to review the academic remedial plan.` : "";
      return `Dear ${studentName},\n\nYou have ${count} pending arrear subject(s) recorded in the academic database.${mentor}\n\nRegards,\nMentorHUB`;
    },
  },

  action_item_overdue: {
    name: "action_item_overdue",
    category: "UTILITY",
    language: "en_US",
    eventType: "ACTION_ITEM_OVERDUE",
    description: "Overdue action item notification for assignees.",
    variables: ["assigned_name", "action_description", "due_date", "student_name"],
    renderText: (vars) => {
      const name = vars.assigned_name || "Student";
      const task = vars.action_description || "Action Item";
      const due = vars.due_date || "recently";
      return `Dear ${name},\n\nThe assigned mentoring action item "${task}" was due on ${due} and is now overdue.\nPlease update your progress in MentorHUB.\n\nRegards,\nMentorHUB`;
    },
  },

  placement_reminder: {
    name: "placement_reminder",
    category: "UTILITY",
    language: "en_US",
    eventType: "PLACEMENT_REMINDER",
    description: "Placement and interview schedule notification for eligible students.",
    variables: ["student_name", "company_name", "drive_date", "role_title"],
    renderText: (vars) => {
      const studentName = vars.student_name || "Student";
      const company = vars.company_name || "Campus Placement Drive";
      const date = vars.drive_date || "upcoming";
      const role = vars.role_title ? ` for the position of ${vars.role_title}` : "";
      return `Dear ${studentName},\n\nYou are registered for the ${company} recruitment drive${role} scheduled for ${date}.\nPlease review your resume and interview preparation roadmap in MentorHUB.\n\nRegards,\nMentorHUB Placement Advisory`;
    },
  },
};

export function renderWhatsAppTemplate(templateName: string, vars: WhatsAppTemplateVariableMap): string {
  const tpl = WHATSAPP_TEMPLATES[templateName];
  if (tpl) {
    return tpl.renderText(vars);
  }
  // Generic fallback if custom template name
  return `Notice from MentorHUB:\n\n${JSON.stringify(vars, null, 2)}\n\nRegards,\nMentorHUB`;
}

/**
 * Builds Meta WhatsApp Cloud API template components payload
 */
export function buildMetaTemplatePayload(
  templateName: string,
  vars: WhatsAppTemplateVariableMap,
  languageCode = "en_US"
) {
  const tpl = WHATSAPP_TEMPLATES[templateName];
  if (!tpl) {
    return null;
  }

  const parameters = tpl.variables.map((varName) => ({
    type: "text",
    text: String(vars[varName] ?? ""),
  }));

  return {
    name: templateName,
    language: {
      code: languageCode,
    },
    components: [
      {
        type: "body",
        parameters,
      },
    ],
  };
}
