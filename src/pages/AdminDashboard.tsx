import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  Sparkles,
  Users,
  GraduationCap,
  Building2,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  ArrowUpRight,
  UserPlus,
  Settings,
  History,
  CheckCircle2,
  RefreshCw,
  Search,
  ChevronRight,
  ShieldCheck,
  Clock,
  UserCog
} from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { LoadingState, ErrorState } from "../components/ui/LoadingState";
import { BackButton } from "../components/ui/BackButton";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await api.get("/admin/dashboard");
      setData(res.data.data);
      setError("");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <LoadingState label="Synthesizing institutional administration metrics..." />;
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <ErrorState error={error || "Failed to load admin telemetry"} onRetry={() => loadData()} />
      </div>
    );
  }

  const { cards, charts, priorityStudents, recentAuditLogs } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 md:p-7 rounded-2xl bg-sky-50 text-blue-950 border border-blue-100/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <BackButton fallback="/dashboard" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles size={11} className="text-blue-500" /> Executive Authority
              </span>
              <span className="text-xs text-blue-800/80 font-medium">Institution-Wide Command Center</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
              Admin & Governance Hub
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-2xl font-normal leading-relaxed">
              Full application-level control across all academic departments, faculty advisory networks, student telemetry, and institutional audit compliance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title="Refresh telemetry"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin text-blue-600" : ""} />
              {refreshing ? "Updating..." : "Refresh"}
            </button>
            <button
              onClick={() => navigate("/admin/users")}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <UserPlus size={13} />
              Manage Users
            </button>
            <button
              onClick={() => navigate("/admin/settings")}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <Settings size={13} />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Students */}
        <div
          onClick={() => navigate("/students")}
          className="app-card p-4 flex flex-col justify-between hover:border-blue-300 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Students</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <GraduationCap size={15} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-bold text-slate-900">{cards.totalStudents}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
              <span className="text-rose-600 font-semibold">{cards.lowAttendance75}</span> below 75% att.
            </div>
          </div>
        </div>

        {/* Total Faculty */}
        <div
          onClick={() => navigate("/faculty")}
          className="app-card p-4 flex flex-col justify-between hover:border-blue-300 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Faculty</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Users size={15} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-bold text-slate-900">{cards.totalMentors}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {cards.totalHODs} Dept Heads (HODs)
            </div>
          </div>
        </div>

        {/* Departments */}
        <div
          onClick={() => navigate("/admin/departments")}
          className="app-card p-4 flex flex-col justify-between hover:border-blue-300 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Departments</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Building2 size={15} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-bold text-slate-900">{cards.totalDepartments}</div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
              Academic Units
            </div>
          </div>
        </div>

        {/* System Users */}
        <div
          onClick={() => navigate("/admin/users")}
          className="app-card p-4 flex flex-col justify-between hover:border-blue-300 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Accounts</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <ShieldCheck size={15} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-bold text-slate-900">{cards.totalUsers}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              <span className="text-emerald-600 font-semibold">{cards.activeUsers} Active</span>
              {cards.inactiveUsers > 0 && <span className="text-slate-400"> · {cards.inactiveUsers} Inact</span>}
            </div>
          </div>
        </div>

        {/* Meetings Logged */}
        <div
          onClick={() => navigate("/meetings")}
          className="app-card p-4 flex flex-col justify-between hover:border-blue-300 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Advisories</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <CalendarCheck size={15} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-bold text-slate-900">{cards.meetingsCompleted}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {cards.pendingFollowUps} upcoming follow-ups
            </div>
          </div>
        </div>

        {/* Fees Overdue */}
        <div
          onClick={() => navigate("/fees")}
          className="app-card p-4 flex flex-col justify-between hover:border-blue-300 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Fees Due</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <CreditCard size={15} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-bold text-rose-600">{cards.feeOverdueCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate" title={`₹${cards.totalFeeOutstanding?.toLocaleString("en-IN")}`}>
              ₹{cards.totalFeeOutstanding > 100000 ? `${(cards.totalFeeOutstanding / 100000).toFixed(1)}L` : cards.totalFeeOutstanding?.toLocaleString("en-IN")} pending
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Status Alert Bar */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
        cards.whatsAppConfigured
          ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
          : "bg-slate-50 border-slate-200 text-slate-800"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
            cards.whatsAppConfigured ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
          }`}>
            <MessageSquare size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">Meta WhatsApp Business Gateway</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                cards.whatsAppConfigured
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-slate-200 text-slate-700 border border-slate-300"
              }`}>
                {cards.whatsAppStatus}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {cards.whatsAppConfigured
                ? `${cards.totalWhatsAppAlerts} total alerts dispatched across attendance, fee, and arrear rules.`
                : "Integration is currently NOT CONFIGURED. Background worker will safely idle until official Meta credentials are provided."}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/admin/whatsapp-alerts")}
          className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1 shrink-0 cursor-pointer self-end sm:self-center"
        >
          View Alert Ledger <ArrowUpRight size={13} />
        </button>
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Roster Table (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="app-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 size={16} className="text-blue-600" />
                  Academic Departments & Leadership
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Institutional organizational units and faculty advisor allocations
                </p>
              </div>
              <button
                onClick={() => navigate("/admin/departments")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                Manage Departments <ChevronRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Department Name</th>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3 text-center">Students</th>
                    <th className="py-2.5 px-3 text-center">Faculty</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {charts.departmentBreakdown?.map((dept: any) => (
                    <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {dept.name}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {dept.code}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-medium text-slate-700">
                        {dept.studentCount}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-medium text-slate-700">
                        {dept.mentorCount}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => navigate(`/students?departmentId=${dept.id}`)}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          View Cohort
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Critical Risk Students Feed */}
          <div className="app-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-600" />
                  High-Priority Intervention Cohort
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Students flagged with critical risk score or low attendance needing immediate review
                </p>
              </div>
              <button
                onClick={() => navigate("/students")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                All Students <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-2">
              {priorityStudents?.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No critical student escalations active at this time.
                </div>
              ) : (
                priorityStudents?.map((s: any) => (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/students/${s.id}`)}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/70 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {s.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {s.registerNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Year {s.year}-{s.section}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>Attendance: <strong className={s.attendance < 75 ? "text-rose-600" : "text-slate-700"}>{s.attendance}%</strong></span>
                        <span>Arrears: <strong className={s.arrears > 0 ? "text-rose-600" : "text-slate-700"}>{s.arrears}</strong></span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      s.riskLevel === "CRITICAL"
                        ? "bg-rose-100 text-rose-700 border border-rose-200"
                        : s.riskLevel === "HIGH"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}>
                      {s.riskLevel} Risk
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Commands & Audit Ledger (1 col) */}
        <div className="space-y-6">
          {/* Quick Admin Actions */}
          <div className="app-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles size={16} className="text-blue-600" />
              Administrative Command Deck
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => navigate("/admin/users")}
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <UserPlus size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">User Accounts</div>
                    <div className="text-[11px] text-slate-500">Add, activate, deactivate, or reset logins</div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-blue-600" />
              </button>

              <button
                onClick={() => navigate("/faculty")}
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Users size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Faculty & Mentors</div>
                    <div className="text-[11px] text-slate-500">Register new mentors & advisor rosters</div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-indigo-600" />
              </button>

              <button
                onClick={() => navigate("/admin/hods")}
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <UserCog size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Appoint HODs</div>
                    <div className="text-[11px] text-slate-500">Designate departmental leadership</div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-purple-600" />
              </button>

              <button
                onClick={() => navigate("/mentor-assignments")}
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <GraduationCap size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Batch Mentee Allocation</div>
                    <div className="text-[11px] text-slate-500">Assign student cohorts to mentors</div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-emerald-600" />
              </button>

              <button
                onClick={() => navigate("/admin/audit-logs")}
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <History size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Audit & Security Ledger</div>
                    <div className="text-[11px] text-slate-500">Inspect real database audit trails</div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-amber-600" />
              </button>
            </div>
          </div>

          {/* Recent Audit Ledger */}
          <div className="app-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-600" />
                Live Security & Audit Feed
              </h3>
              <button
                onClick={() => navigate("/admin/audit-logs")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                View Full
              </button>
            </div>

            <div className="space-y-3">
              {recentAuditLogs?.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No recent audit events logged yet.
                </div>
              ) : (
                recentAuditLogs?.map((log: any) => (
                  <div key={log.id} className="text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono font-semibold text-blue-700 text-[11px] truncate max-w-[170px]">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                      By <span className="font-medium text-slate-800">{log.actor}</span> ({log.role})
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
