import React, { useState } from "react";
import { BookOpen, Sparkles, Search, ChevronRight, FileText, CheckCircle2, Shield } from "lucide-react";
import { BackButton } from "../../components/ui/BackButton";

const ARTICLES = [
  {
    id: "kb1",
    category: "NAAC Criteria 2.3",
    title: "Mentoring System & Student Support Guidelines",
    summary: "Institutional ratio mandates, continuous log book maintenance, and bi-weekly advisory documentation required for NAAC compliance.",
    updated: "August 2024",
  },
  {
    id: "kb2",
    category: "Academic Regulations",
    title: "Attendance Shortage & Condonation Rules",
    summary: "Standard 75% attendance threshold rules, medical condonation procedures (65%-74%), and semester detention protocols.",
    updated: "July 2024",
  },
  {
    id: "kb3",
    category: "Advisory Playbook",
    title: "Handling High-Risk Students & Early Warning Triggers",
    summary: "Protocol for scheduling emergency mentoring sessions, alerting parents, and coordinating with peer tutors when arrears exceed 2 subjects.",
    updated: "September 2024",
  },
  {
    id: "kb4",
    category: "AI & Telemetry",
    title: "MentorHUB AI Assistant Best Practices",
    summary: "Guidance on using the AI Copilot for drafting action items, meeting minutes summarization, and study plan synthesis.",
    updated: "October 2024",
  },
];

export default function KnowledgeBase() {
  const [search, setSearch] = useState("");

  const filtered = ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-6 md:p-7 rounded-2xl bg-sky-50 text-blue-950 border border-blue-100/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <BackButton fallback="/dashboard" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles size={11} className="text-blue-500" /> Reference Core
              </span>
              <span className="text-xs text-blue-800/80 font-medium">Institutional Operating Manual</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
              Knowledge Base & Standard Procedures
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              Official policies, mentoring compliance frameworks, NAAC documentation criteria, and institutional advisory SOPs.
            </p>
          </div>
        </div>
      </div>

      <div className="app-card p-4">
        <div className="relative w-full md:w-96">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input autoComplete="off"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search regulations, SOPs, NAAC criteria..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="app-card p-5 space-y-3 hover:border-blue-200 transition-all shadow-2xs group cursor-pointer">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {item.category}
              </span>
              <span className="text-[10px] text-slate-400">Updated {item.updated}</span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-950 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {item.summary}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold">
              <span className="flex items-center gap-1">
                <FileText size={12} /> Read Full SOP
              </span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
