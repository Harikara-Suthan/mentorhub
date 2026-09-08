import React, { useEffect, useState } from "react";
import { Search, UserCog, Mail, Phone, CalendarCheck, Shield, Sparkles, Building2, Users, ArrowRight } from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/LoadingState";
import { Mentor, Department } from "../types";
import { BackButton } from "../components/ui/BackButton";
import { useNavigate } from "react-router-dom";

export default function Faculty() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [activity, setActivity] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [mentorsRes, deptsRes] = await Promise.allSettled([
          api.get("/departments/mentors/all"),
          api.get("/departments"),
        ]);

        if (mentorsRes.status === "fulfilled" && mentorsRes.value.data.data) {
          setMentors(mentorsRes.value.data.data);
        }
        if (deptsRes.status === "fulfilled" && deptsRes.value.data.data) {
          setDepartments(deptsRes.value.data.data);
        }

        // Try to get activity chart data if available
        try {
          const hodRes = await api.get("/dashboard/hod");
          const actList = hodRes.data.data?.charts?.mentorWiseActivity || [];
          const map: Record<string, number> = {};
          actList.forEach((a: any) => {
            map[a.mentor.toLowerCase()] = a.meetings;
          });
          setActivity(map);
        } catch {
          // If not HOD role or fails, proceed with default activity
        }
        setError("");
      } catch (err) {
        setError(apiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredMentors = mentors.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.employeeId && m.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = deptFilter === "ALL" || m.departmentId === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Tab Banner */}
      <div className="p-6 md:p-7 rounded-2xl bg-sky-50 text-blue-950 border border-blue-100/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <BackButton fallback="/dashboard" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles size={11} className="text-blue-500" /> Institutional Governance
              </span>
              <span className="text-xs text-blue-800/80 font-medium">Faculty Advisory Ledger</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
              Faculty / Mentors Directory
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              Review institutional mentors, monitor advisories logged, inspect departmental distribution, and coordinate student success.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate("/mentor-assignments")}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Users size={14} /> Manage Assignments
            </button>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="app-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input autoComplete="off"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search faculty by name or ID..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Building2 size={14} />
            <span>Department:</span>
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="flex-1 md:flex-none text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState label="Loading faculty directory and advisory telemetry..." />
      ) : error ? (
        <ErrorState error={error} onRetry={() => window.location.reload()} />
      ) : filteredMentors.length === 0 ? (
        <EmptyState
          title="No Faculty Members Found"
          description={searchTerm ? `No faculty match "${searchTerm}".` : "No faculty mentors registered under selected filter."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMentors.map((mentor) => {
            const dept = departments.find((d) => d.id === mentor.departmentId);
            const meetingsCount = activity[mentor.fullName.toLowerCase()] || 0;
            return (
              <div
                key={mentor.id}
                className="app-card p-5 hover:border-blue-200 transition-all flex flex-col justify-between group shadow-2xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs uppercase">
                      {mentor.fullName[0]}
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                      {mentor.employeeId || "FACULTY"}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-950 group-hover:text-blue-600 transition-colors">
                    {mentor.fullName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium flex flex-col gap-1.5 mt-0.5 items-start">
                    <span className="flex items-center gap-1.5">
                      <Building2 size={12} className="text-slate-400" />
                      {dept ? dept.name : "Department Faculty"}
                    </span>
                    {mentor.isCrossDepartment && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {mentor.crossDepartmentLabel}
                      </span>
                    )}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <CalendarCheck size={13} className="text-blue-600" /> Advisories Logged
                    </span>
                    <span className="font-bold font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {meetingsCount} sessions
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    <Shield size={10} /> Active Advisor
                  </span>
                  <button
                    onClick={() => navigate(`/students?mentorId=${mentor.id}`)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    View Mentees <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
