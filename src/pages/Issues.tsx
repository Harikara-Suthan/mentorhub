import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Filter,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/LoadingState";
import { Badge } from "../components/ui/Badge";
import { Issue } from "../types";
import { useAuth } from "../context/AuthContext";
import { BackButton } from "../components/ui/BackButton";

const SEVERITY_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  LOW: "info",
  MEDIUM: "warning",
  HIGH: "danger",
  CRITICAL: "danger",
};

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  OPEN: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
  CLOSED: "neutral",
};

const CATEGORIES = [
  "ACADEMIC_PERFORMANCE",
  "ATTENDANCE",
  "ARREAR_SUBJECTS",
  "PLACEMENT_READINESS",
  "INTERNSHIP_STATUS",
  "FINANCIAL_CONCERNS",
  "PERSONAL_WELLBEING",
  "DISCIPLINE",
  "OTHER",
];

export default function Issues() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ category: "", severity: "", status: "", search: "" });
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    const { search, ...rest } = filters;
    const params = Object.fromEntries(Object.entries(rest).filter(([, v]) => v));
    api
      .get("/issues", { params })
      .then((res) => setIssues(res.data.data))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filters.category, filters.severity, filters.status]);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      await api.put(`/issues/${id}`, { status });
      setIssues((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: status as any } : item))
      );
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to update issue status."));
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredIssues = issues.filter((i) => {
    if (!filters.search) return true;
    const q = filters.search.toLowerCase();
    return (
      i.description.toLowerCase().includes(q) ||
      i.student?.fullName?.toLowerCase().includes(q) ||
      i.student?.registerNumber?.toLowerCase().includes(q) ||
      (i.student?.rollNumber && i.student.rollNumber.toLowerCase().includes(q)) ||
      i.category.toLowerCase().includes(q)
    );
  });

  const criticalCount = issues.filter((i) => i.severity === "CRITICAL" || i.severity === "HIGH").length;
  const openCount = issues.filter((i) => i.status === "OPEN" || i.status === "IN_PROGRESS").length;
  const resolvedCount = issues.filter((i) => i.status === "RESOLVED" || i.status === "CLOSED").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <BackButton fallback="/dashboard" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Advisory Escalations</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {issues.length} Logged
            </span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Flagged Student Issues
          </h1>
        </div>

        {/* Quick Tally Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center gap-1.5">
            <AlertTriangle size={13} className="text-rose-600" />
            <span className="text-xs font-semibold text-rose-700">{criticalCount} High/Critical</span>
          </div>
          <div className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center gap-1.5">
            <Clock size={13} className="text-amber-600" />
            <span className="text-xs font-semibold text-amber-700">{openCount} Active</span>
          </div>
          <div className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">{resolvedCount} Resolved</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="app-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/90">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-muted" />
          <input autoComplete="off"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder="Search by student, description, or topic..."
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-surface rounded-xl border border-line focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="text-xs border border-line rounded-xl px-3 py-2 bg-surface text-navy font-medium"
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          <select
            className="text-xs border border-line rounded-xl px-3 py-2 bg-surface text-navy font-medium"
            value={filters.severity}
            onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value }))}
          >
            <option value="">All Severities</option>
            {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((s) => (
              <option key={s} value={s}>
                {s} Severity
              </option>
            ))}
          </select>

          <select
            className="text-xs border border-line rounded-xl px-3 py-2 bg-surface text-navy font-medium"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="">All Statuses</option>
            {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>

          {(filters.category || filters.severity || filters.status || filters.search) && (
            <button
              onClick={() => setFilters({ category: "", severity: "", status: "", search: "" })}
              className="p-2 rounded-xl text-slate-muted hover:text-navy hover:bg-slate-100 transition-colors"
              title="Reset Filters"
            >
              <RotateCcw size={15} />
            </button>
          )}
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {loading && !error && <LoadingState label="Filtering flagged student concerns..." />}
      {!loading && filteredIssues.length === 0 && (
        <EmptyState
          title="No issues found"
          hint="Try adjusting the filters or search keywords."
        />
      )}

      {/* Issues Cards */}
      <div className="space-y-3.5">
        {filteredIssues.map((i) => (
          <div
            key={i.id}
            className={`app-card p-5 md:p-6 transition-all duration-200 border-l-4 ${
              i.severity === "CRITICAL"
                ? "border-l-rose-600"
                : i.severity === "HIGH"
                ? "border-l-amber-500"
                : i.severity === "MEDIUM"
                ? "border-l-yellow-400"
                : "border-l-blue-400"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {i.isRestricted && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                      <ShieldAlert size={12} /> RESTRICTED / PRIVATE
                    </span>
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {i.category.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-slate-muted">
                    Logged {new Date(i.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {i.student && (
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/students/${i.student.id}`}
                      className="font-display text-sm md:text-base font-bold text-navy hover:text-brand-600 transition-colors"
                    >
                      {i.student.fullName}
                    </Link>
                    {i.student.rollNumber && (
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {i.student.rollNumber}
                      </span>
                    )}
                    <span className="font-mono text-xs text-slate-muted">
                      ({i.student.registerNumber})
                    </span>
                  </div>
                )}

                <p className="text-sm text-navy leading-relaxed bg-surface/40 p-3 rounded-xl border border-line">
                  {i.description}
                </p>
              </div>

              {/* Status Switcher and Actions */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0 pt-2 sm:pt-0">
                <div className="flex items-center gap-1.5">
                  <Badge tone={SEVERITY_TONE[i.severity]}>{i.severity}</Badge>
                  <Badge tone={STATUS_TONE[i.status]}>{i.status.replace("_", " ")}</Badge>
                </div>

                {user?.role === "MENTOR" && i.status !== "CLOSED" && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-muted font-semibold hidden sm:inline">
                      Update:
                    </span>
                    <select
                      disabled={updatingId === i.id}
                      className="text-xs border border-line rounded-lg px-2.5 py-1 bg-surface text-navy font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 cursor-pointer"
                      value={i.status}
                      onChange={(e) => updateStatus(i.id, e.target.value)}
                    >
                      {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
                        <option key={s} value={s}>
                          → {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {i.student && (
                  <Link
                    to={`/students/${i.student.id}`}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 mt-1"
                  >
                    Mentee Dossier <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

