import React, { useEffect, useState } from "react";
import { Building2, Sparkles, Plus, Search, Users, ShieldCheck } from "lucide-react";
import { api, apiErrorMessage } from "../../api/client";
import { LoadingState, ErrorState } from "../../components/ui/LoadingState";
import { Department } from "../../types";
import { BackButton } from "../../components/ui/BackButton";

export default function AdminDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/departments");
        setDepartments(res.data.data || []);
        setError("");
      } catch (err) {
        setError(apiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-6 md:p-7 rounded-2xl bg-sky-50 text-blue-950 border border-blue-100/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <BackButton fallback="/dashboard" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles size={11} className="text-blue-500" /> Admin Core
              </span>
              <span className="text-xs text-blue-800/80 font-medium">Academic Organizational Units</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
              Academic Departments
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              Configure institutional departments, code prefixes, faculty allocations, and student enrollments.
            </p>
          </div>
        </div>
      </div>

      <div className="app-card p-4 flex items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input autoComplete="off"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search departments..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 transition-all"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">{filtered.length} Departments Active</span>
      </div>

      {loading ? (
        <LoadingState label="Loading academic departments..." />
      ) : error ? (
        <ErrorState error={error} onRetry={() => window.location.reload()} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((dept) => (
            <div key={dept.id} className="app-card p-5 space-y-4 hover:border-blue-200 transition-all shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs uppercase">
                  {dept.code[0]}
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {dept.code}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-950">{dept.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Faculty of Engineering & Technology</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  <ShieldCheck size={11} /> NAAC Accredited
                </span>
                <span className="font-mono text-[11px] text-blue-700 font-medium">4 Cohort Years</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
