import React, { useEffect, useState } from "react";
import { CalendarClock, Sparkles, AlertCircle, CheckCircle2, Search, ArrowRight, BellRing } from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/LoadingState";
import { Student } from "../types";
import { useAuth } from "../context/AuthContext";
import { BackButton } from "../components/ui/BackButton";
import { useNavigate } from "react-router-dom";

export default function Attendance() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await api.get("/students", { params: { pageSize: 50 } });
        setStudents(res.data.data.items || []);
        setError("");
      } catch (err) {
        setError(apiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const total = students.length;
  const avgAttendance =
    total > 0
      ? (students.reduce((acc, s) => acc + (s.attendancePercentage || 0), 0) / total).toFixed(1)
      : "0.0";
  const critical = students.filter((s) => s.attendancePercentage < 75).length;
  const warning = students.filter((s) => s.attendancePercentage >= 75 && s.attendancePercentage < 85).length;
  const safe = students.filter((s) => s.attendancePercentage >= 85).length;

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.registerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesYear = yearFilter === "ALL" || s.year === yearFilter;
    const matchesAttendance =
      attendanceFilter === "ALL" ||
      (attendanceFilter === "CRITICAL" && s.attendancePercentage < 75) ||
      (attendanceFilter === "WARNING" && s.attendancePercentage >= 75 && s.attendancePercentage < 85) ||
      (attendanceFilter === "SAFE" && s.attendancePercentage >= 85);
    return matchesSearch && matchesYear && matchesAttendance;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="p-6 md:p-7 rounded-2xl bg-sky-50 text-blue-950 border border-blue-100/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <BackButton fallback="/dashboard" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles size={11} className="text-blue-500" /> Attendance Ledger
              </span>
              <span className="text-xs text-blue-800/80 font-medium">Regulatory Cutoff Tracking</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
              Institutional Attendance Tracking
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              Monitor attendance compliance against the mandatory 75% threshold. Proactively identify at-risk students before semester examinations.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="app-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Cohort Average</span>
            <CalendarClock size={16} className="text-blue-600" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900 mt-2 font-mono">{avgAttendance}%</p>
          <span className="text-[11px] text-slate-500 mt-1">Across all sections</span>
        </div>

        <div className="app-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Critical Defaulters (&lt; 75%)</span>
            <AlertCircle size={16} className="text-rose-600" />
          </div>
          <p className="font-display text-2xl font-bold text-rose-600 mt-2 font-mono">{critical}</p>
          <span className="text-[11px] text-rose-600 font-medium mt-1">
            Immediate intervention required
          </span>
        </div>

        <div className="app-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Warning Zone (75% – 84%)</span>
            <AlertCircle size={16} className="text-amber-600" />
          </div>
          <p className="font-display text-2xl font-bold text-amber-600 mt-2 font-mono">{warning}</p>
          <span className="text-[11px] text-slate-500 mt-1">At risk of semester detention</span>
        </div>

        <div className="app-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Safe Standing (≥ 85%)</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <p className="font-display text-2xl font-bold text-emerald-700 mt-2 font-mono">{safe}</p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1">Compliant with exam norms</span>
        </div>
      </div>

      {/* Control Filter Toolbar */}
      <div className="app-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input autoComplete="off"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student or register no..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
          >
            <option value="ALL">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>

          <select
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
          >
            <option value="ALL">All Attendance Tiers</option>
            <option value="CRITICAL">Critical (&lt; 75%)</option>
            <option value="WARNING">Warning (75% – 84%)</option>
            <option value="SAFE">Safe Standing (≥ 85%)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingState label="Loading student attendance metrics..." />
      ) : error ? (
        <ErrorState error={error} onRetry={() => window.location.reload()} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No Students Found" description="No students match the attendance filter." />
      ) : (
        <div className="app-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Year & Section</th>
                  <th className="py-3 px-4">Attendance Progress</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Advisor</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => {
                  const pct = s.attendancePercentage || 0;
                  const isCritical = pct < 75;
                  const isWarning = pct >= 75 && pct < 85;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold text-slate-900">{s.fullName}</p>
                          <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                            {s.rollNumber && (
                              <span className="font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                                {s.rollNumber}
                              </span>
                            )}
                            <span>Reg: {s.registerNumber}</span>
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        Year {s.year} · Sec {s.section}
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-36">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-mono font-bold text-slate-900">{pct}%</span>
                            <span className="text-[10px] text-slate-400">Req: 75%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isCritical ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isCritical ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Defaulter (&lt;75%)
                          </span>
                        ) : isWarning ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Warning
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Compliant
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {s.mentor?.fullName || "Unassigned"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`/students/${s.id}`)}
                          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                        >
                          Details <ArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
