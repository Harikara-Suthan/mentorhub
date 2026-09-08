import React, { useEffect, useState } from "react";
import { AlertCircle, Sparkles, CheckCircle2, AlertTriangle, Search, ArrowRight, BookOpen } from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/LoadingState";
import { Student } from "../types";
import { BackButton } from "../components/ui/BackButton";
import { useNavigate } from "react-router-dom";

export default function Arrears() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [arrearFilter, setArrearFilter] = useState("ALL");
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
  const totalArrears = students.reduce((acc, s) => acc + (s.arrearCount || 0), 0);
  const allClear = students.filter((s) => (s.arrearCount || 0) === 0).length;
  const manageable = students.filter((s) => (s.arrearCount || 0) >= 1 && (s.arrearCount || 0) <= 2).length;
  const severe = students.filter((s) => (s.arrearCount || 0) >= 3).length;

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.registerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesYear = yearFilter === "ALL" || s.year === yearFilter;
    const count = s.arrearCount || 0;
    const matchesArrears =
      arrearFilter === "ALL" ||
      (arrearFilter === "CLEAR" && count === 0) ||
      (arrearFilter === "MANAGEABLE" && count >= 1 && count <= 2) ||
      (arrearFilter === "SEVERE" && count >= 3);
    return matchesSearch && matchesYear && matchesArrears;
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
                <Sparkles size={11} className="text-blue-500" /> Academic Remediation
              </span>
              <span className="text-xs text-blue-800/80 font-medium">Standing Arrears & Remedial Tracker</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
              Arrears & Backlog Management
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              Track standing backlogs across departments and cohorts. Target remediation coaching before university supplementary examinations.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="app-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Standing Backlogs</span>
            <BookOpen size={16} className="text-blue-600" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900 mt-2 font-mono">{totalArrears}</p>
          <span className="text-[11px] text-slate-500 mt-1">Accumulated across students</span>
        </div>

        <div className="app-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>All Clear (0 Arrears)</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <p className="font-display text-2xl font-bold text-emerald-700 mt-2 font-mono">{allClear}</p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1">
            {total > 0 ? ((allClear / total) * 100).toFixed(0) : 0}% of department
          </span>
        </div>

        <div className="app-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>1 – 2 Arrears</span>
            <AlertCircle size={16} className="text-amber-600" />
          </div>
          <p className="font-display text-2xl font-bold text-amber-700 mt-2 font-mono">{manageable}</p>
          <span className="text-[11px] text-slate-500 mt-1">Manageable backlog load</span>
        </div>

        <div className="app-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Severe Backlogs (3+)</span>
            <AlertTriangle size={16} className="text-rose-600" />
          </div>
          <p className="font-display text-2xl font-bold text-rose-600 mt-2 font-mono">{severe}</p>
          <span className="text-[11px] text-rose-600 font-medium mt-1">Critical remediation needed</span>
        </div>
      </div>

      {/* Control Filter Bar */}
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
            value={arrearFilter}
            onChange={(e) => setArrearFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
          >
            <option value="ALL">All Backlog Statuses</option>
            <option value="CLEAR">All Clear (0)</option>
            <option value="MANAGEABLE">Manageable (1 – 2)</option>
            <option value="SEVERE">Critical Backlogs (3+)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingState label="Loading arrears and backlog records..." />
      ) : error ? (
        <ErrorState error={error} onRetry={() => window.location.reload()} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No Students Found" description="No students match the specified arrear filter." />
      ) : (
        <div className="app-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Year & Section</th>
                  <th className="py-3 px-4">Standing Arrears</th>
                  <th className="py-3 px-4">CGPA</th>
                  <th className="py-3 px-4">Advisor</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => {
                  const count = s.arrearCount || 0;
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
                        {count === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={11} /> All Clear (0)
                          </span>
                        ) : count <= 2 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertCircle size={11} /> {count} Subject{count > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle size={11} /> {count} Critical
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-medium text-slate-700">
                          {s.cgpa ? s.cgpa.toFixed(2) : "N/A"}
                        </span>
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
