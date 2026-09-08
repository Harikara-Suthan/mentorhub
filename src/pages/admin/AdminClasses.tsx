import React from "react";
import { Users, Sparkles, Building2, UserCheck, Calendar } from "lucide-react";
import { BackButton } from "../../components/ui/BackButton";
import { useNavigate } from "react-router-dom";

const SECTIONS = [
  { year: "1", sec: "A", dept: "CSE", advisor: "Dr. Priya Raman", students: 58, hall: "LH-101" },
  { year: "1", sec: "B", dept: "CSE", advisor: "Prof. Rajesh Kannan", students: 60, hall: "LH-102" },
  { year: "2", sec: "A", dept: "CSE", advisor: "Dr. Ananya Sen", students: 56, hall: "LH-201" },
  { year: "2", sec: "B", dept: "CSE", advisor: "Prof. Karthik S", students: 57, hall: "LH-202" },
  { year: "3", sec: "A", dept: "CSE", advisor: "Dr. Meenakshi Sundaram", students: 54, hall: "LH-301" },
  { year: "3", sec: "B", dept: "CSE", advisor: "Dr. Arvind Swamy", students: 55, hall: "LH-302" },
  { year: "4", sec: "A", dept: "CSE", advisor: "Prof. Sangeetha R", students: 52, hall: "LH-401" },
  { year: "4", sec: "B", dept: "CSE", advisor: "Dr. Vignesh Kumar", students: 53, hall: "LH-402" },
];

export default function AdminClasses() {
  const navigate = useNavigate();

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
              <span className="text-xs text-blue-800/80 font-medium">Cohort Batch Sections</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
              Classes & Sections Directory
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              Batch cohorts, section advisors, classroom allocations, and enrollment headcounts.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SECTIONS.map((sec, idx) => (
          <div key={idx} className="app-card p-5 space-y-3 hover:border-blue-200 transition-all shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Year {sec.year} · Section {sec.sec}
              </span>
              <span className="text-[11px] font-mono text-slate-400 font-medium">{sec.hall}</span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-950">Department of {sec.dept}</h3>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <UserCheck size={12} className="text-blue-600" />
                Advisor: <span className="font-medium text-slate-700">{sec.advisor}</span>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">{sec.students} Enrolled</span>
              <button
                onClick={() => navigate(`/students?year=${sec.year}&section=${sec.sec}`)}
                className="text-blue-600 font-semibold hover:text-blue-800 transition-colors cursor-pointer"
              >
                View Roster →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
