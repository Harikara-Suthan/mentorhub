export type Role = "HOD" | "MENTOR" | "STUDENT" | "ADMIN";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type FeeStatus = "PAID" | "PARTIALLY_PAID" | "PENDING" | "OVERDUE" | "UNAVAILABLE";

export interface StudentFeeRecord {
  id: string;
  feeCategory: string;
  academicYear?: string | null;
  semester?: number | null;
  totalFees: number;
  amountPaid: number;
  outstandingAmount: number;
  status: FeeStatus;
  statusLabel: string;
  dueDate?: string | null;
  lastPaymentDate?: string | null;
  paymentReference?: string | null;
  remarks?: string | null;
  createdAt?: string | null;
}

export interface StudentFeeSummary {
  hasFeeData: boolean;
  feeStatus: FeeStatus;
  feeStatusLabel: string;
  totalFees: number | null;
  amountPaid: number | null;
  outstandingAmount: number | null;
  academicYear?: string | null;
  semester?: number | null;
  lastPaymentDate?: string | null;
  paymentReference?: string | null;
  feeCategory?: string | null;
  remarks?: string | null;
  fees: StudentFeeRecord[];
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  profilePicture?: string | null;
  mentor?: { id: string; fullName: string; departmentId: string; profilePicture?: string | null } | null;
  student?: { id: string; fullName: string; profilePicture?: string | null } | null;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Mentor {
  id: string;
  fullName: string;
  employeeId: string;
  departmentId: string;
  profilePicture?: string | null;
  isCrossDepartment?: boolean;
  crossDepartmentLabel?: string;
}

export interface RiskAssessment {
  id: string;
  riskScore: number;
  riskLevel: RiskLevel;
  breakdown: { label: string; detail: string; points: number }[];
  createdAt: string;
}

export interface Student {
  id: string;
  fullName: string;
  registerNumber: string;
  rollNumber?: string | null;
  admissionYear?: number | null;
  profilePicture?: string | null;
  year: string;
  section: string;
  departmentId: string;
  department?: Department;
  mentorId: string;
  mentor?: { id: string; fullName: string };
  parentName?: string | null;
  parentContact?: string | null;
  email?: string | null;
  phone?: string | null;
  attendancePercentage: number;
  cgpa: number;
  arrearCount: number;
  placementStatus: "NOT_ELIGIBLE" | "ELIGIBLE" | "IN_PROGRESS" | "PLACED";
  internshipStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  certificationCount: number;
  feeStatus?: FeeStatus;
  feeDetails?: StudentFeeSummary;
  latestRisk?: RiskAssessment | null;
  riskAssessments?: RiskAssessment[];
  meetings?: Meeting[];
  issues?: Issue[];
  actionItems?: ActionItem[];
}

export interface Meeting {
  id: string;
  studentId: string;
  student?: { id: string; fullName: string; registerNumber: string; rollNumber?: string | null };
  mentorId: string;
  meetingDate: string;
  meetingType: "INDIVIDUAL" | "GROUP";
  discussionSummary: string;
  studentConcerns?: string | null;
  mentorSuggestions?: string | null;
  nextFollowUpDate?: string | null;
  aiSummary?: string | null;
  aiKeyConcerns: string[];
  aiImportantPoints: string[];
  aiRecommendedActions: string[];
  aiStatus: "PENDING" | "COMPLETED" | "FAILED";
  riskAssessment?: RiskAssessment | null;
}

export type IssueCategory =
  | "ACADEMIC_PERFORMANCE"
  | "ATTENDANCE"
  | "ARREAR_SUBJECTS"
  | "PLACEMENT_READINESS"
  | "INTERNSHIP_STATUS"
  | "FINANCIAL_CONCERNS"
  | "PERSONAL_WELLBEING"
  | "DISCIPLINE"
  | "OTHER";

export interface Issue {
  id: string;
  studentId: string;
  student?: { id: string; fullName: string; registerNumber: string; rollNumber?: string | null };
  category: IssueCategory;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  isRestricted: boolean;
  resolution?: string | null;
  createdAt: string;
}

export interface ActionItem {
  id: string;
  studentId: string;
  student?: { id: string; fullName: string; registerNumber: string; rollNumber?: string | null };
  description: string;
  assignedTo: string;
  actionType: "STUDENT_ACTION" | "MENTOR_ACTION";
  targetCompletionDate: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  entityId?: string | null;
}
