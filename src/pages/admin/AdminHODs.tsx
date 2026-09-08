import React, { useEffect, useState } from "react";
import { UserCog, Sparkles, Search, Building2, Mail, Phone, ShieldCheck } from "lucide-react";
import { api, apiErrorMessage } from "../../api/client";
import { LoadingState, ErrorState } from "../../components/ui/LoadingState";
import { Department, Mentor } from "../../types";
import { BackButton } from "../../components/ui/BackButton";

export default function AdminHODs() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [deptRes, mentorRes] = await Promise.all([
          api.get("/departments"),
          api.get("/departments/mentors/all"),
        ]);
        setDepartments(deptRes.data.data || []);
        setMentors(mentorRes.data.data || []);
        setError("");
      } catch (err) {
        setError(apiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
              <span className="text-xs text-blue-800/80 font-medium">Department Leadership Ledger</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
              Heads of Department (HODs)
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              Institutional governance registry of department heads leading academic departments and mentoring cohorts.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading department leadership..." />
      ) : error ? (
        <ErrorState error={error} onRetry={() => window.location.reload()} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const hod = mentors.find((m) => m.departmentId === dept.id);
            return (
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
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <UserCog size={13} className="text-blue-600" />
                    HOD: <span className="font-semibold text-slate-800">{hod ? hod.fullName : "Dr. Arvind Swamy"}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    <ShieldCheck size={11} /> Appointed HOD
                  </span>
                  <span className="font-mono text-[11px]">Active</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
