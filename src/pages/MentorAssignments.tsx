import React, { useEffect, useState } from "react";
import { ClipboardList, Sparkles, UserCheck } from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { LoadingState, ErrorState } from "../components/ui/LoadingState";
import { Mentor } from "../types";
import { BackButton } from "../components/ui/BackButton";
import AssignmentsTab from "../components/AssignmentsTab";

export default function MentorAssignments() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMentors() {
      setLoading(true);
      try {
        const res = await api.get("/departments/mentors/all");
        setMentors(res.data.data || []);
        setError("");
      } catch (err) {
        setError(apiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadMentors();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="p-6 md:p-7 rounded-2xl bg-sky-50 text-blue-950 border border-blue-100/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <BackButton fallback="/dashboard" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles size={11} className="text-blue-500" /> Department Operations
              </span>
              <span className="text-xs text-blue-800/80 font-medium">Cohort Reallocation Matrix</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
              Mentor Assignments
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              Review and allocate student mentees to faculty advisors. Ensure balanced cohort ratios and clear accountability across all academic years.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading faculty advisors for assignment..." />
      ) : error ? (
        <ErrorState error={error} onRetry={() => window.location.reload()} />
      ) : (
        <AssignmentsTab mentors={mentors} />
      )}
    </div>
  );
}
