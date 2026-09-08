import { useEffect, useState } from "react";
import {
  Download,
  FileText,
  Calendar,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Users,
  Clock,
  Sparkles,
  TrendingUp,
  FileCheck,
} from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { LoadingState, ErrorState } from "../components/ui/LoadingState";
import { ChartPanel } from "../components/charts/ChartPanel";
import { BarDistributionChart } from "../components/charts/BarDistributionChart";
import { BackButton } from "../components/ui/BackButton";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function Reports() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [monthly, setMonthly] = useState<any>(null);
  const [issues, setIssues] = useState<any>(null);
  const [actionsReport, setActionsReport] = useState<any>(null);
  const [error, setError] = useState("");

  function loadMonthly() {
    api
      .get("/reports/monthly", { params: { month, year } })
      .then((res) => setMonthly(res.data.data))
      .catch((e) => setError(apiErrorMessage(e)));
  }

  useEffect(loadMonthly, [month, year]);
  useEffect(() => {
    api.get("/reports/issues").then((res) => setIssues(res.data.data));
    api.get("/reports/actions").then((res) => setActionsReport(res.data.data));
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <BackButton fallback="/dashboard" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Institutional Intelligence
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
              Audit & Compliance
            </span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Analytics & Executive Reports
          </h1>
        </div>

        {/* Period Selector & Exports */}
        <div className="flex items-center gap-2 flex-wrap bg-white p-2 rounded-2xl border border-line shadow-xs">
          <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-slate-muted">
            <Calendar size={14} className="text-brand-600" />
            <span>Period:</span>
          </div>
          <select
            className="text-xs border border-line rounded-xl px-3 py-1.5 bg-surface text-navy font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            className="text-xs border border-line rounded-xl px-3 py-1.5 bg-surface text-navy font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <a
            href={`/api/export/monthly/pdf?month=${month}&year=${year}`}
            target="_blank"
            rel="noreferrer"
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-xs"
          >
            <FileText size={13} /> Export PDF
          </a>
          <a
            href={`/api/export/monthly/excel?month=${month}&year=${year}`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Download size={13} /> Excel
          </a>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={loadMonthly} />}

      {/* Monthly Metrics Card Grid */}
      <div className="app-card p-6 md:p-7 space-y-5">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h2 className="font-display text-base md:text-lg font-bold text-navy">
              Monthly Mentoring Progress ({MONTHS[month - 1]} {year})
            </h2>
            <p className="text-xs text-slate-muted mt-0.5">
              Summary of mentorship hours, student reach, escalations, and resolved action tasks.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-lg hidden sm:inline">
            Active Period
          </span>
        </div>

        {!monthly && !error ? (
          <LoadingState label="Computing institutional monthly report..." />
        ) : (
          monthly && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 md:gap-4">
              <ReportMetric
                icon={<Users size={16} className="text-brand-600" />}
                label="Sessions Logged"
                value={monthly.meetingsConducted}
                subtext="1:1 advisory meetings"
              />
              <ReportMetric
                icon={<FileCheck size={16} className="text-emerald-600" />}
                label="Mentees Reached"
                value={monthly.studentsMentored}
                subtext="Unique students counseled"
              />
              <ReportMetric
                icon={<AlertTriangle size={16} className="text-amber-500" />}
                label="Issues Flagged"
                value={monthly.issuesIdentified}
                subtext="New concerns logged"
              />
              <ReportMetric
                icon={<CheckCircle2 size={16} className="text-emerald-500" />}
                label="Issues Resolved"
                value={monthly.issuesResolved}
                subtext="Successfully closed"
              />
              <ReportMetric
                icon={<Clock size={16} className="text-indigo-600" />}
                label="Actions Assigned"
                value={monthly.actionsAssigned}
                subtext="Action roadmap items"
              />
              <ReportMetric
                icon={<TrendingUp size={16} className="text-brand-600" />}
                label="Actions Completed"
                value={monthly.actionsCompleted}
                subtext="Tasks fulfilled on time"
              />
              <ReportMetric
                icon={<Calendar size={16} className="text-blue-600" />}
                label="Follow-ups Done"
                value={monthly.followUpsCompleted}
                subtext="Scheduled reviews held"
              />
              <ReportMetric
                icon={<AlertTriangle size={16} className="text-rose-600" />}
                label="High Risk Mentees"
                value={monthly.highRiskStudents}
                subtext="Requiring priority care"
                warn={monthly.highRiskStudents > 0}
              />
            </div>
          )
        )}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartPanel title="Issue Category Distribution" subtitle="System-wide student concern clusters">
          {issues ? (
            <div className="space-y-4">
              <BarDistributionChart
                data={issues.byCategory.map((c: any) => ({
                  name: c.category.replace(/_/g, " "),
                  value: c.count,
                }))}
                color="#C9A15A"
              />
              <div className="p-3 rounded-xl bg-surface/70 border border-line flex items-center justify-between text-xs">
                <span className="text-slate-muted">Recurring Concern Patterns:</span>
                <span className="font-display font-bold text-navy">
                  {issues.repeatedIssueCount} patterns detected
                </span>
              </div>
            </div>
          ) : (
            <LoadingState label="Synthesizing issue distribution..." />
          )}
        </ChartPanel>

        <ChartPanel title="Action Item Completion Efficacy" subtitle="Resolution rate of assigned follow-ups">
          {actionsReport ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-surface border border-emerald-200">
                <div>
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Overall Completion Velocity
                  </p>
                  <p className="font-display text-3xl font-bold text-emerald-700 mt-1">
                    {actionsReport.completionPercentage}%
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-300">
                  <CheckCircle2 size={28} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="app-card p-3 bg-surface/40">
                  <p className="text-[10px] uppercase font-bold text-slate-muted">Total Actions</p>
                  <p className="font-display text-xl font-bold text-navy mt-0.5">{actionsReport.total}</p>
                </div>
                <div className="app-card p-3 bg-emerald-50/50 border-emerald-200/50">
                  <p className="text-[10px] uppercase font-bold text-emerald-700">Completed</p>
                  <p className="font-display text-xl font-bold text-emerald-800 mt-0.5">{actionsReport.completed}</p>
                </div>
                <div className="app-card p-3 bg-amber-50/50 border-amber-200/50">
                  <p className="text-[10px] uppercase font-bold text-amber-700">Pending</p>
                  <p className="font-display text-xl font-bold text-amber-800 mt-0.5">{actionsReport.pending}</p>
                </div>
                <div className="app-card p-3 bg-rose-50/50 border-rose-200/50">
                  <p className="text-[10px] uppercase font-bold text-rose-700">Overdue</p>
                  <p className="font-display text-xl font-bold text-rose-800 mt-0.5">{actionsReport.overdue}</p>
                </div>
              </div>
            </div>
          ) : (
            <LoadingState label="Computing action completion metrics..." />
          )}
        </ChartPanel>
      </div>

      {/* Guide Card */}
      <div className="app-card p-6 border-brand-100 bg-gradient-to-r from-brand-50/50 via-white to-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-sm font-bold text-navy flex items-center gap-1.5">
            <Sparkles size={15} className="text-gold-dark" /> Granular Student Dossier Exports
          </h3>
          <p className="text-xs text-slate-muted mt-1 leading-relaxed max-w-2xl">
            Access any student's individual profile in the Cohort Directory to export comprehensive 1:1 meeting minutes,
            AI risk timeline assessments, issue escalations, and official signed mentoring records.
          </p>
        </div>
        <a
          href="/students"
          className="btn-secondary text-xs px-4 py-2 self-start md:self-center shrink-0"
        >
          Open Cohort Directory
        </a>
      </div>
    </div>
  );
}

function ReportMetric({
  icon,
  label,
  value,
  subtext,
  warn,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtext?: string;
  warn?: boolean;
}) {
  return (
    <div className="app-card p-4 flex flex-col justify-between border-line hover:border-brand-200 transition-colors">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-muted">{label}</span>
          <div className="p-1 rounded-md bg-surface">{icon}</div>
        </div>
        <p className={`font-display text-2xl font-bold ${warn ? "text-rose-600" : "text-navy"}`}>
          {value}
        </p>
      </div>
      {subtext && <p className="text-[11px] text-slate-muted mt-2 truncate">{subtext}</p>}
    </div>
  );
}

