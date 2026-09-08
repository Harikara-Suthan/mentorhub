import React from "react";
import { GraduationCap, Sparkles, BookOpen, CheckCircle2, ShieldCheck } from "lucide-react";
import { BackButton } from "../../components/ui/BackButton";

const PROGRAMS = [
  {
    id: "p1",
    code: "BE-CSE",
    name: "B.E. Computer Science & Engineering",
    degree: "Undergraduate (B.E)",
    duration: "4 Years (8 Semesters)",
    intake: 120,
    reg: "Regulation 2021",
  },
  {
    id: "p2",
    code: "BTECH-AIDS",
    name: "B.Tech. Artificial Intelligence & Data Science",
    degree: "Undergraduate (B.Tech)",
    duration: "4 Years (8 Semesters)",
    intake: 60,
    reg: "Regulation 2021",
  },
  {
    id: "p3",
    code: "BE-ECE",
    name: "B.E. Electronics & Communication Engineering",
    degree: "Undergraduate (B.E)",
    duration: "4 Years (8 Semesters)",
    intake: 60,
    reg: "Regulation 2021",
  },
  {
    id: "p4",
    code: "ME-CSE",
    name: "M.E. Computer Science & Engineering",
    degree: "Postgraduate (M.E)",
    duration: "2 Years (4 Semesters)",
    intake: 18,
    reg: "Regulation 2022",
  },
];

export default function AdminPrograms() {
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
              <span className="text-xs text-blue-800/80 font-medium">Curriculum & Degree Offerings</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
              Academic Programs & Degrees
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              Curriculum regulations, approved intake quotas, and graduation pathways approved under university statutes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROGRAMS.map((prog) => (
          <div key={prog.id} className="app-card p-5 space-y-4 hover:border-blue-200 transition-all shadow-2xs">
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <GraduationCap size={20} />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {prog.code}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-950">{prog.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{prog.degree} · {prog.duration}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-700">{prog.reg}</span>
              <span className="font-mono text-blue-700 font-semibold">{prog.intake} Seats / Year</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
