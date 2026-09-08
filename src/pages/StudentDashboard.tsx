import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Bot,
  Calendar,
  Compass,
  Code2,
  Send,
  Mic,
  MicOff,
  CheckCircle2,
  Clock,
  ArrowRight,
  Award,
  ListTodo,
  Mail,
  Phone,
  Target,
  Zap,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api, apiErrorMessage } from "../api/client";
import { LoadingState, ErrorState } from "../components/ui/LoadingState";
import { useAuth } from "../context/AuthContext";
import { StatCard } from "../components/ui/StatCard";
import { Badge } from "../components/ui/Badge";
import { WelcomeIntroBanner } from "../components/ui/WelcomeIntroBanner";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    api
      .get("/dashboard/student")
      .then((res) => setData(res.data.data))
      .catch((err) => setError(apiErrorMessage(err)));
  }, []);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim()) {
      navigate(`/ai-mentor?prompt=${encodeURIComponent(queryInput.trim())}`);
    } else {
      navigate("/ai-mentor");
    }
  };

  const handleMicToggle = () => {
    if (!isListening) {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        setQueryInput("How do I master Python data structures and algorithms for placements?");
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!data) return <LoadingState label="Connecting to MentorHUB AI Intelligence Core..." />;

  const pendingCount = data.pendingActions?.length || 0;
  const completedCount = data.completedActions?.length || 0;
  const totalActions = pendingCount + completedCount;
  const progressPercent = totalActions > 0 ? Math.round((completedCount / totalActions) * 100) : 100;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <WelcomeIntroBanner />

      {/* Top Banner / Hero Card */}
      <div className="p-5 sm:p-6 md:p-7 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-slate-800 text-slate-300 border border-slate-700">
                <Sparkles size={11} className="text-blue-400" /> AI Student Suite
              </span>
              <span className="text-xs text-slate-400 font-medium">Academic Year 2025–26</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
              {getTimeGreeting()}, {user?.email ? user.email.split("@")[0] : "Student"}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
              Your personalized academic companion for course mastery, verified skill roadmaps, and placement preparation.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <div className="bg-slate-800/80 p-3.5 sm:p-4 rounded-xl border border-slate-700/60 text-center w-full sm:w-auto sm:min-w-[130px]">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Goal Completion</p>
              <p className="font-display text-2xl font-bold text-white mt-0.5">{progressPercent}%</p>
              <div className="w-24 h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden mx-auto">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Mentor Card: "How can I help you today?" */}
      <div className="app-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="font-display text-base sm:text-lg font-bold text-slate-900">
              How can I help you today?
            </h2>
            <p className="text-xs text-slate-500">
              Ask your AI mentor anything about coursework, algorithms, placement prep, or exam strategy.
            </p>
          </div>
        </div>

        {/* AI Input Field & Critical Action Button */}
        <form onSubmit={handleHeroSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <div className="relative flex-1">
            <input autoComplete="off"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Ask about Python algorithms, exam preparation, placement tips..."
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
            />
            <button
              type="button"
              onClick={handleMicToggle}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                isListening
                  ? "bg-rose-500 text-white animate-pulse"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              }`}
              title="Voice Input"
            >
              {isListening ? <MicOff size={14} /> : <Mic size={14} />}
            </button>
          </div>

          <button
            type="submit"
            className="btn-primary text-xs py-2.5 px-4.5 shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Ask AI</span>
            <Send size={13} />
          </button>
        </form>

        {/* Quick Prompt Chips */}
        <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5 overflow-x-auto no-scrollbar sm:flex-wrap pb-1 sm:pb-0">
          <span className="text-[11px] font-medium text-slate-400 shrink-0">Suggestions:</span>
          {[
            "Improve Python for Interviews",
            "Spaced Repetition Schedule",
            "ATS Resume Review",
            "Top 25 SQL Questions",
          ].map((tag, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQueryInput(tag);
                navigate(`/ai-mentor?prompt=${encodeURIComponent(tag)}`);
              }}
              className="text-xs bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-medium px-2.5 py-1 rounded-lg border border-slate-200/80 transition-colors shrink-0 cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Academic Telemetry KPIs - Compact 1-line (sm/lg) grid */}
      <div>
        <div className="flex items-center justify-between mb-2 px-0.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Academic Standing</h3>
          <Link to="/progress" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            View Analytics →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          <StatCard
            label="Cumulative GPA"
            value={data.student?.cgpa !== undefined && data.student?.cgpa !== null ? String(data.student.cgpa) : "N/A"}
            icon={<Award size={14} />}
            accent="navy"
            subtext={data.student?.cgpa >= 8.5 ? "First Class with Distinction" : "In Good Standing"}
            onClick={() => navigate("/progress")}
            compact
          />
          <StatCard
            label="Attendance"
            value={data.student?.attendancePercentage !== undefined ? `${data.student.attendancePercentage}%` : "N/A"}
            icon={<CheckCircle2 size={14} />}
            accent={data.student?.attendancePercentage < 75 ? "risk-high" : "risk-low"}
            subtext={data.student?.attendancePercentage >= 75 ? "Above 75% threshold" : "Below 75% minimum"}
            onClick={() => navigate("/progress")}
            compact
          />
          <StatCard
            label="Active Arrears"
            value={data.student?.arrearCount !== undefined ? String(data.student.arrearCount) : "0"}
            icon={<ShieldCheck size={14} />}
            accent={data.student?.arrearCount > 0 ? "risk-high" : "risk-low"}
            subtext={data.student?.arrearCount === 0 ? "Clean academic record" : "Immediate attention"}
            onClick={() => navigate("/progress")}
            compact
          />
          <StatCard
            label="Placement Readiness"
            value={data.student?.placementStatus ? data.student.placementStatus.replace(/_/g, " ") : "NOT ELIGIBLE"}
            icon={<Target size={14} />}
            accent={data.student?.placementStatus === "ELIGIBLE" || data.student?.placementStatus === "PLACED" ? "blue" : "navy"}
            subtext={`${data.student?.certificationCount || 0} Certifications`}
            onClick={() => navigate("/career-guidance")}
            compact
          />
        </div>
      </div>

      {/* Quick Actions - Compact 1-line (lg) / 2-line (sm) grid */}
      <div>
        <div className="flex items-center justify-between mb-2 px-0.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Zap size={13} className="text-blue-600" /> Quick Launch
          </h3>
          <span className="text-xs text-slate-400 font-mono">4 Core Tools</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
          <Link
            to="/ai-mentor"
            className="app-card p-2.5 sm:p-3 hover:border-blue-300 hover:shadow-xs transition-all group flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0 group-hover:scale-105 transition-transform">
              <Bot size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-display text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                AI Mentor
              </h4>
              <p className="text-[10px] text-slate-400 truncate">24/7 Academic Tutoring</p>
            </div>
            <ArrowRight size={12} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          <Link
            to="/study-planner"
            className="app-card p-2.5 sm:p-3 hover:border-blue-300 hover:shadow-xs transition-all group flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0 group-hover:scale-105 transition-transform">
              <Calendar size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-display text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                Study Planner
              </h4>
              <p className="text-[10px] text-slate-400 truncate">Timetables & Pomodoro</p>
            </div>
            <ArrowRight size={12} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          <Link
            to="/career-guidance"
            className="app-card p-2.5 sm:p-3 hover:border-blue-300 hover:shadow-xs transition-all group flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0 group-hover:scale-105 transition-transform">
              <Compass size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-display text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                Career Guide
              </h4>
              <p className="text-[10px] text-slate-400 truncate">Placement & Resumes</p>
            </div>
            <ArrowRight size={12} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          <Link
            to="/skills"
            className="app-card p-2.5 sm:p-3 hover:border-blue-300 hover:shadow-xs transition-all group flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0 group-hover:scale-105 transition-transform">
              <Code2 size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-display text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                Skill Matrix
              </h4>
              <p className="text-[10px] text-slate-400 truncate">Verified Rubrics</p>
            </div>
            <ArrowRight size={12} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        </div>
      </div>

      {/* Main Grid: Student Progress Dashboard & Right Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Student Progress Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Metrics Panel */}
          <div className="app-card p-5 sm:p-6 space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm sm:text-base font-bold text-slate-900">Your Progress Dashboard</h3>
                <p className="text-xs text-slate-500 mt-0.5">Continuous telemetry synchronization</p>
              </div>
              <Link
                to="/progress"
                className="text-xs font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
              >
                <span>Full Telemetry</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5">
              {/* Academic Progress */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>Academic Standing</span>
                  <Award size={15} className="text-blue-600" />
                </div>
                <p className="font-display text-xl font-bold text-slate-900">
                  {data.student?.cgpa !== undefined ? `${data.student.cgpa} CGPA` : "Not evaluated"}
                </p>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${Math.min(100, (Number(data.student?.cgpa || 0) / 10) * 100)}%` }}
                  />
                </div>
                <p className={`text-[11px] font-medium ${data.student?.attendancePercentage < 75 ? "text-rose-700" : "text-emerald-700"}`}>
                  Attendance: {data.student?.attendancePercentage ?? 0}% ({data.student?.attendancePercentage < 75 ? "Critical" : "Safe"})
                </p>
              </div>

              {/* Skill Progress */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>Skill Mastery</span>
                  <Code2 size={15} className="text-blue-600" />
                </div>
                <p className="font-display text-xl font-bold text-slate-900">
                  {data.student?.skills?.length || 0} Competencies
                </p>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-700 rounded-full"
                    style={{ width: `${Math.min(100, ((data.student?.skills?.length || 0) / 6) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-600 font-medium truncate">
                  {data.student?.skills?.length > 0 ? data.student.skills.slice(0, 3).join(", ") : "Add target skills in Profile"}
                </p>
              </div>

              {/* Career Readiness */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>Career Readiness</span>
                  <Compass size={15} className="text-blue-600" />
                </div>
                <p className="font-display text-xl font-bold text-slate-900">
                  {data.student?.placementStatus ? data.student.placementStatus.replace(/_/g, " ") : "In Progress"}
                </p>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width:
                        data.student?.placementStatus === "PLACED"
                          ? "100%"
                          : data.student?.placementStatus === "ELIGIBLE"
                          ? "85%"
                          : "40%",
                    }}
                  />
                </div>
                <p className="text-[11px] text-emerald-700 font-medium">
                  {data.student?.targetRole || "Software Engineer"}
                </p>
              </div>
            </div>
          </div>

          {/* Pending Actions & Mentor Guidance */}
          <div className="app-card overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <ListTodo size={16} className="text-blue-600" />
                <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900">Mentor Assigned Action Items</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/70">
                {pendingCount} Pending
              </span>
            </div>

            <div className="p-4 sm:p-5 divide-y divide-slate-100">
              {pendingCount === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <CheckCircle2 size={26} className="mx-auto text-emerald-500 mb-2" />
                  <p className="text-sm font-semibold text-slate-900">All action items completed</p>
                  <p className="text-xs mt-0.5">Great job keeping up with your faculty mentoring roadmap.</p>
                </div>
              ) : (
                data.pendingActions.map((a: any) => (
                  <div key={a.id} className="py-3 flex items-start justify-between gap-3 sm:gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-4 h-4 rounded border border-slate-300 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 break-words">{a.description}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Clock size={11} /> Target Date: {new Date(a.targetCompletionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-50 text-amber-700 border border-amber-200/60 shrink-0">
                      {a.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Recent Activity & Assigned Advisor */}
        <div className="space-y-6">
          {/* Upcoming Tasks Card */}
          <div className="app-card p-5 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock size={13} className="text-slate-500" /> Upcoming Tasks
            </h4>

            <div className="space-y-2">
              {[
                { title: "Complete Python OOP module", tag: "Today", color: "bg-slate-100 text-slate-700 border-slate-200/60" },
                { title: "Review today's study plan", tag: "Today", color: "bg-slate-100 text-slate-700 border-slate-200/60" },
                { title: "Career assessment checkpoint", tag: "Tomorrow", color: "bg-slate-100 text-slate-700 border-slate-200/60" },
                { title: "Mentor meeting with Dr. Priya Raman", tag: "Sep 8", color: "bg-emerald-50 text-emerald-700 border-emerald-200/60" },
              ].map((task, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-slate-200/60 bg-slate-50/60 flex items-center justify-between gap-2 hover:bg-slate-100/60 transition-colors"
                >
                  <p className="text-xs font-medium text-slate-900 leading-tight truncate">{task.title}</p>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium shrink-0 border ${task.color}`}>
                    {task.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Faculty Advisor Card */}
          <div className="app-card p-5 space-y-3.5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Faculty Mentor</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm flex items-center justify-center border border-blue-100 shrink-0">
                {data.myMentor?.fullName ? data.myMentor.fullName[0] : "P"}
              </div>
              <div className="min-w-0">
                <p className="font-display text-sm font-bold text-slate-900 truncate">
                  {data.myMentor?.fullName ?? "Dr. Priya Raman"}
                </p>
                <p className="text-xs text-slate-500 truncate">Department Faculty Advisor</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              {data.myMentor?.email && (
                <div className="flex items-center gap-2 truncate">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{data.myMentor.email}</span>
                </div>
              )}
              {data.myMentor?.phone && (
                <div className="flex items-center gap-2 truncate">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <span>{data.myMentor.phone}</span>
                </div>
              )}
            </div>

            <Link
              to="/ai-mentor"
              className="btn-secondary w-full py-2 text-xs flex items-center justify-center gap-1.5"
            >
              <Bot size={13} /> Request 1:1 Advisory Prep
            </Link>
          </div>

          {/* Student Fee Standing Card (Real DB) */}
          <div className="app-card p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard size={13} className="text-blue-600" /> Fee Standing
              </p>
              {data.feeDetails?.hasFeeData ? (
                (() => {
                  switch (data.feeDetails.feeStatus) {
                    case "PAID":
                      return <Badge tone="success" size="sm">Paid</Badge>;
                    case "PARTIALLY_PAID":
                      return <Badge tone="warning" size="sm">Partial</Badge>;
                    case "PENDING":
                      return <Badge tone="info" size="sm">Pending</Badge>;
                    case "OVERDUE":
                      return <Badge tone="danger" size="sm">Overdue</Badge>;
                    default:
                      return <Badge tone="neutral" size="sm">Unknown</Badge>;
                  }
                })()
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                  Unavailable
                </span>
              )}
            </div>

            {data.feeDetails?.hasFeeData ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Fee</p>
                    <p className="font-bold text-slate-800 font-mono mt-0.5">
                      ₹{data.feeDetails.totalFees?.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Outstanding</p>
                    <p className={`font-bold font-mono mt-0.5 ${data.feeDetails.outstandingAmount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                      ₹{data.feeDetails.outstandingAmount?.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                {data.feeDetails.academicYear && (
                  <p className="text-[11px] text-slate-500">
                    Academic Year: <span className="font-semibold text-slate-700">{data.feeDetails.academicYear}</span>
                    {data.feeDetails.semester ? ` (Sem ${data.feeDetails.semester})` : ""}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                FEE DATA: NOT PRESENT IN DATABASE. No fee billing records are linked to your student account.
              </p>
            )}

            <Link
              to="/profile"
              className="btn-secondary w-full py-2 text-xs flex items-center justify-center gap-1.5"
            >
              <span>View Full Ledger</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
