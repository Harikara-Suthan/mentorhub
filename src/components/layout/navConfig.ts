import {
  LayoutDashboard,
  Users,
  CalendarClock,
  FlagTriangleRight,
  ListChecks,
  FileBarChart,
  Bell,
  Bot,
  Calendar,
  Compass,
  Code2,
  TrendingUp,
  MessageSquare,
  User,
  UserCog,
  ClipboardList,
  GraduationCap,
  ShieldAlert,
  AlertCircle,
  Building2,
  BookOpen,
  ShieldCheck,
  Sliders,
  KeyRound,
  UserCheck,
  LucideIcon,
} from "lucide-react";
import { Role } from "../../types";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  isAi?: boolean;
  aliases?: string[];
}

export const NAV_ITEMS_BY_ROLE: Record<Role, NavItem[]> = {
  HOD: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/students", label: "Students", icon: Users },
    { to: "/faculty", label: "Faculty / Mentors", icon: UserCog },
    { to: "/mentor-assignments", label: "Mentor Assignments", icon: ClipboardList },
    { to: "/academics", label: "Academics", icon: GraduationCap },
    { to: "/attendance", label: "Attendance", icon: CalendarClock },
    { to: "/arrears", label: "Arrears", icon: AlertCircle },
    { to: "/risk", label: "Risk & Student Success", icon: ShieldAlert },
    { to: "/mentoring", label: "Mentoring", icon: Users, aliases: ["/meetings"] },
    { to: "/tasks", label: "Tasks", icon: ListChecks, aliases: ["/actions"] },
    { to: "/whatsapp", label: "WhatsApp Alerts", icon: MessageSquare, aliases: ["/whatsapp-alerts"] },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/messages", label: "Messages", icon: MessageSquare },
    { to: "/reports", label: "Reports & Analytics", icon: FileBarChart, aliases: ["/analytics"] },
    { to: "/ai-insights", label: "AI Insights", icon: Bot, isAi: true, aliases: ["/ai-mentor", "/ai"] },
    { to: "/study-planner", label: "Study Planner", icon: Calendar },
    { to: "/profile", label: "My Profile", icon: User },
  ],
  MENTOR: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/students", label: "Students", icon: Users },
    { to: "/student-insights", label: "Student Insights", icon: TrendingUp, aliases: ["/progress"] },
    { to: "/mentoring", label: "Mentoring Sessions", icon: CalendarClock, aliases: ["/meetings"] },
    { to: "/tasks", label: "Tasks", icon: ListChecks, aliases: ["/actions"] },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/messages", label: "Messages", icon: MessageSquare },
    { to: "/ai-mentor", label: "AI Mentor", icon: Bot, isAi: true, aliases: ["/ai-insights", "/ai"] },
    { to: "/study-planner", label: "Study Planner", icon: Calendar },
    { to: "/career-guidance", label: "Career Guidance", icon: Compass, aliases: ["/career"] },
    { to: "/skills", label: "Skills Matrix", icon: Code2 },
    { to: "/issues", label: "Issues & Escalations", icon: FlagTriangleRight },
    { to: "/reports", label: "Reports", icon: FileBarChart },
    { to: "/profile", label: "My Profile", icon: User },
  ],
  STUDENT: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/profile", label: "My Profile", icon: User },
    { to: "/academics", label: "Academics", icon: GraduationCap, aliases: ["/progress"] },
    { to: "/attendance", label: "Attendance", icon: CalendarClock },
    { to: "/arrears", label: "Arrears", icon: AlertCircle },
    { to: "/my-mentor", label: "My Mentor", icon: UserCheck },
    { to: "/mentoring", label: "Mentoring", icon: Users, aliases: ["/meetings"] },
    { to: "/tasks", label: "Tasks", icon: ListChecks, aliases: ["/actions"] },
    { to: "/skills", label: "Skills", icon: Code2 },
    { to: "/career-guidance", label: "Career & Placement", icon: Compass, aliases: ["/career"] },
    { to: "/messages", label: "Messages", icon: MessageSquare },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/ai-mentor", label: "AI Mentor", icon: Bot, isAi: true, aliases: ["/ai-insights", "/ai"] },
  ],
  ADMIN: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/users", label: "Users", icon: UserCog },
    { to: "/students", label: "Students", icon: Users },
    { to: "/faculty", label: "Staff / Faculty", icon: UserCog },
    { to: "/hods", label: "HODs", icon: Building2 },
    { to: "/departments", label: "Departments", icon: Building2 },
    { to: "/programs", label: "Programs / Courses", icon: GraduationCap },
    { to: "/classes", label: "Classes & Sections", icon: Users },
    { to: "/mentor-assignments", label: "Mentor Assignments", icon: ClipboardList },
    { to: "/academics", label: "Academics", icon: GraduationCap },
    { to: "/attendance", label: "Attendance", icon: CalendarClock },
    { to: "/arrears", label: "Arrears", icon: AlertCircle },
    { to: "/mentoring", label: "Mentoring", icon: CalendarClock, aliases: ["/meetings"] },
    { to: "/study-planner", label: "Study Planner", icon: Calendar },
    { to: "/tasks", label: "Tasks", icon: ListChecks, aliases: ["/actions"] },
    { to: "/issues", label: "Issues & Escalations", icon: FlagTriangleRight },
    { to: "/whatsapp", label: "WhatsApp Alerts", icon: MessageSquare, aliases: ["/whatsapp-alerts", "/admin/whatsapp"] },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/messages", label: "Messages", icon: MessageSquare },
    { to: "/career-guidance", label: "Career & Placement", icon: Compass, aliases: ["/career"] },
    { to: "/reports", label: "Reports", icon: FileBarChart },
    { to: "/analytics", label: "Analytics", icon: TrendingUp },
    { to: "/ai-insights", label: "AI Insights", icon: Bot, isAi: true, aliases: ["/ai-mentor", "/ai"] },
    { to: "/knowledge-base", label: "Knowledge Base", icon: BookOpen },
    { to: "/roles", label: "Roles & Permissions", icon: ShieldCheck },
    { to: "/audit-logs", label: "Audit Logs", icon: KeyRound },
    { to: "/settings", label: "System Settings", icon: Sliders },
    { to: "/profile", label: "My Profile", icon: User },
  ],
};

export function isRouteActive(currentPath: string, itemPath: string, aliases: string[] = []): boolean {
  // Normalize by stripping trailing slash
  const normCurrent = currentPath.endsWith("/") && currentPath.length > 1 ? currentPath.slice(0, -1) : currentPath;
  const normItem = itemPath.endsWith("/") && itemPath.length > 1 ? itemPath.slice(0, -1) : itemPath;

  // Root or Dashboard require exact match
  if (normItem === "/dashboard" || normItem === "") {
    return normCurrent === "/dashboard" || normCurrent === "";
  }

  // Exact match
  if (normCurrent === normItem) {
    return true;
  }

  // Check aliases
  if (aliases.some((a) => normCurrent === a || (a !== "/dashboard" && a !== "" && normCurrent.startsWith(a + "/")))) {
    return true;
  }

  // Strict sub-path matching (e.g., /students/:id matches /students, but /students-archive won't)
  if (normCurrent.startsWith(normItem + "/")) {
    return true;
  }

  return false;
}
