import { useState, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { useAuth } from "./context/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";
import { LoadingState } from "./components/ui/LoadingState";
import { IntroSplash } from "./components/ui/IntroSplash";
import { safeSessionGetItem } from "./utils/storage";

import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import MentorDashboard from "./pages/MentorDashboard";
import HodDashboard from "./pages/HodDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AiMentorChat from "./pages/AiMentorChat";
import StudyPlanner from "./pages/StudyPlanner";
import CareerGuidance from "./pages/CareerGuidance";
import SkillsMatrix from "./pages/SkillsMatrix";
import StudentProgress from "./pages/StudentProgress";
import Students from "./pages/Students";
import StudentProfile from "./pages/StudentProfile";
import Meetings from "./pages/Meetings";
import Issues from "./pages/Issues";
import Actions from "./pages/Actions";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";

// Dedicated Domain Pages
import Faculty from "./pages/Faculty";
import MentorAssignments from "./pages/MentorAssignments";
import Academics from "./pages/Academics";
import Attendance from "./pages/Attendance";
import Arrears from "./pages/Arrears";
import RiskSuccess from "./pages/RiskSuccess";
import MyMentor from "./pages/MyMentor";
import NotFound from "./pages/NotFound";

// Admin Management Pages
import AdminHODs from "./pages/admin/AdminHODs";
import AdminDepartments from "./pages/admin/AdminDepartments";
import AdminPrograms from "./pages/admin/AdminPrograms";
import AdminClasses from "./pages/admin/AdminClasses";
import KnowledgeBase from "./pages/admin/KnowledgeBase";
import RolesPermissions from "./pages/admin/RolesPermissions";
import AuditLogs from "./pages/admin/AuditLogs";
import SystemSettings from "./pages/admin/SystemSettings";
import WhatsAppAlerts from "./pages/admin/WhatsAppAlerts";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface p-4">
        <LoadingState label="Initializing MentorHUB Intelligence Hub..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RoleDashboard() {
  const { user } = useAuth();
  if (user?.role === "ADMIN") return <AdminDashboard />;
  if (user?.role === "MENTOR") return <MentorDashboard />;
  if (user?.role === "HOD") return <HodDashboard />;
  return <StudentDashboard />;
}

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return safeSessionGetItem("mentorhub_intro_seen") !== "true";
  });

  const handleDismissSplash = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && <IntroSplash onComplete={handleDismissSplash} />}
      </AnimatePresence>

      <Routes>
        <Route path="/welcome" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Core Routes */}
          <Route path="/dashboard" element={<RoleDashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentProfile />} />
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/mentor-assignments" element={<MentorAssignments />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/arrears" element={<Arrears />} />
          <Route path="/risk" element={<RiskSuccess />} />

          {/* Mentoring & Sessions (supports both /mentoring and /meetings) */}
          <Route path="/mentoring" element={<Meetings />} />
          <Route path="/meetings" element={<Meetings />} />

          {/* Tasks & Actions (supports both /tasks and /actions) */}
          <Route path="/tasks" element={<Actions />} />
          <Route path="/actions" element={<Actions />} />

          {/* AI Assistants (supports /ai-mentor, /ai-insights, /ai) */}
          <Route path="/ai-mentor" element={<AiMentorChat />} />
          <Route path="/ai-insights" element={<AiMentorChat />} />
          <Route path="/ai" element={<AiMentorChat />} />

          {/* Planning & Development */}
          <Route path="/study-planner" element={<StudyPlanner />} />
          <Route path="/career-guidance" element={<CareerGuidance />} />
          <Route path="/career" element={<CareerGuidance />} />
          <Route path="/skills" element={<SkillsMatrix />} />
          <Route path="/student-insights" element={<StudentProgress />} />
          <Route path="/progress" element={<StudentProgress />} />
          <Route path="/my-mentor" element={<MyMentor />} />

          {/* Operations & Communication */}
          <Route path="/issues" element={<Issues />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/analytics" element={<Reports />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin Routes */}
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/hods" element={<AdminHODs />} />
          <Route path="/departments" element={<AdminDepartments />} />
          <Route path="/programs" element={<AdminPrograms />} />
          <Route path="/classes" element={<AdminClasses />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/roles" element={<RolesPermissions />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/settings" element={<SystemSettings />} />
          <Route path="/whatsapp" element={<WhatsAppAlerts />} />
          <Route path="/whatsapp-alerts" element={<WhatsAppAlerts />} />
          <Route path="/admin/whatsapp" element={<WhatsAppAlerts />} />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
