import { useEffect, useState } from "react";
import {
  Users,
  CalendarCheck,
  Clock,
  TrendingDown,
  AlertTriangle,
  Briefcase,
  GraduationCap as Cap,
  Award,
  Sparkles,
  Plus,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { StatCard } from "../components/ui/StatCard";
import { ChartPanel } from "../components/charts/ChartPanel";
import { RiskDistributionChart } from "../components/charts/RiskDistributionChart";
import { BarDistributionChart } from "../components/charts/BarDistributionChart";
import { RiskDot } from "../components/ui/RiskSeal";
import { LoadingState, ErrorState } from "../components/ui/LoadingState";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { WelcomeIntroBanner } from "../components/ui/WelcomeIntroBanner";
import DedicatedStudentList from "../components/DedicatedStudentList";

export default function MentorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [showDedicatedList, setShowDedicatedList] = useState(false);

  useEffect(() => {
    api
      .get("/dashboard/mentor")
      .then((res) => setData(res.data.data))
      .catch((err) => setError(apiErrorMessage(err)));
  }, []);

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!data) return <LoadingState label="Analyzing mentee cohort telemetry with MentorHUB AI..." />;

  const { cards, charts, priorityStudents } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {showDedicatedList ? (
        <DedicatedStudentList onClose={() => setShowDedicatedList(false)} title="My Assigned Class & Mentee Directory" />
      ) : (
        <>
          <WelcomeIntroBanner />

          {/* Top Banner / Hero Greeting */}
          <div className="p-6 md:p-7 rounded-2xl bg-sky-50 text-blue-950 border border-blue-100/80 shadow-xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-blue-50 text-blue-700 border border-blue-200">
                    <Sparkles size={11} className="text-blue-500" /> Faculty Advisory Core
                  </span>
                  <span className="text-xs text-blue-800/80 font-medium">Academic Term 2025–26</span>
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
                  Welcome back, {user?.email ? user.email.split("@")[0] : "Advisor"}
                </h1>
                <p className="text-xs md:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
                  Managing <span className="font-semibold text-blue-900">{cards.totalStudents} assigned mentees</span>.{" "}
                  {priorityStudents.length > 0
                    ? `${priorityStudents.length} students require mentoring follow-ups.`
                    : "All mentees are currently within safe academic thresholds."}
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => setShowDedicatedList(true)}
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3.5 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  <Users size={14} /> QuickView Workspace List
                </button>
                <button
                  onClick={() => navigate("/meetings")}
                  className="inline-flex items-center gap-1.5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-xs font-medium py-2 px-3.5 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus size={14} /> Record Session
                </button>
              </div>
            </div>
          </div>

      {/* Cohort KPIs & Performance Telemetry - Compact 1-line (xl) / 2-line (sm) grid */}
      <div>
        <div className="flex items-center justify-between mb-2 px-0.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cohort Overview</h3>
          <span className="text-xs text-slate-400 font-mono">8 Core Indicators</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2 sm:gap-2.5">
          <StatCard
            label="Total Mentees"
            value={cards.totalStudents}
            icon={<Users size={14} />}
            accent="navy"
            onClick={() => navigate("/students")}
            compact
          />
          <StatCard
            label="Sessions"
            value={cards.meetingsCompleted}
            icon={<CalendarCheck size={14} />}
            accent="gold"
            onClick={() => navigate("/meetings")}
            compact
          />
          <StatCard
            label="Follow-ups"
            value={cards.pendingFollowUps}
            icon={<Clock size={14} />}
            accent={cards.pendingFollowUps > 0 ? "risk-high" : "navy"}
            onClick={() => navigate("/actions")}
            compact
          />
          <StatCard
            label="Att. below 85%"
            value={cards.lowAttendance}
            icon={<TrendingDown size={14} />}
            accent={cards.lowAttendance > 0 ? "risk-high" : "risk-low"}
            compact
          />
          <StatCard
            label="Arrears"
            value={cards.studentsWithArrears}
            icon={<AlertTriangle size={14} />}
            accent={cards.studentsWithArrears > 0 ? "risk-high" : "risk-low"}
            compact
          />
          <StatCard
            label="Placement Ready"
            value={cards.placementEligible}
            icon={<Briefcase size={14} />}
            accent="risk-low"
            compact
          />
          <StatCard
            label="Internships"
            value={cards.internshipInProgress}
            icon={<Cap size={14} />}
            accent="blue"
            compact
          />
          <StatCard
            label="Certifications"
            value={cards.totalCertifications}
            icon={<Award size={14} />}
            accent="navy"
            compact
          />
        </div>
      </div>

      {/* Visual Telemetry Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartPanel
          title="Cohort Risk Profile"
          subtitle="Multi-factor AI academic vulnerability"
        >
          <RiskDistributionChart data={charts.riskDistribution} />
        </ChartPanel>

        <ChartPanel
          title="Attendance Bands"
          subtitle="Percentage distribution across cohort"
        >
          <BarDistributionChart
            data={Object.entries(charts.attendanceDistribution).map(([name, value]) => ({
              name,
              value,
            }))}
            color="#6366F1"
          />
        </ChartPanel>

        <ChartPanel
          title="Issue Categorization"
          subtitle="Identified student problem domains"
        >
          <BarDistributionChart
            data={charts.issueCategoryDistribution.map((i: any) => ({
              name: i.category.replace(/_/g, " "),
              value: i.count,
            }))}
            color="#475569"
          />
        </ChartPanel>
      </div>

      {/* Students Requiring Immediate Attention Spotlight */}
      <div className="app-card overflow-hidden">
        <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <h2 className="font-display text-sm font-bold text-navy">
                Mentees Requiring Immediate Attention
              </h2>
            </div>
            <p className="text-xs text-slate-muted mt-0.5">
              Prioritized by MentorHUB AI risk model based on attendance, backlogs, and unresolved issues.
            </p>
          </div>
          <Link
            to="/students"
            className="text-xs font-medium text-slate-600 hover:text-blue-600 inline-flex items-center gap-1 shrink-0"
          >
            <span>View all {cards.totalStudents} students</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {priorityStudents.length === 0 ? (
            <div className="p-8 text-center text-slate-muted">
              <UserCheck size={26} className="mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-navy">No students flagged as critical</p>
              <p className="text-xs mt-0.5">All mentees currently meet minimum academic benchmarks.</p>
            </div>
          ) : (
            priorityStudents.map((s: any) => (
              <div
                key={s.id}
                className="p-4 md:px-6 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200/70 shrink-0">
                    {s.name[0]}
                  </div>
                  <div className="min-w-0">
                    <Link
                      to={`/students/${s.id}`}
                      className="text-sm font-semibold text-navy hover:text-blue-600 truncate block transition-colors"
                    >
                      {s.name}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-muted">
                      <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-700 text-[11px] font-medium border border-slate-200/70">
                        Attendance: <span className={s.attendance < 75 ? "text-rose-600 font-bold" : ""}>{s.attendance}%</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-700 text-[11px] font-medium border border-slate-200/70">
                        Arrears: <span className={s.arrears > 0 ? "text-rose-600 font-bold" : ""}>{s.arrears}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <RiskDot level={s.riskLevel} />
                  <Link
                    to={`/students/${s.id}`}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Review Profile →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
