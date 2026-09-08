import React, { useState } from "react";
import {
  Briefcase,
  Target,
  Sparkles,
  TrendingUp,
  FileCheck2,
  Building2,
  Code2,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Award,
  BookOpen,
  ArrowRight,
  Compass,
  FileText,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { BackButton } from "../components/ui/BackButton";

const TARGET_ROLES = [
  {
    id: "fs-ai",
    title: "Full Stack AI Engineer",
    demand: "Very High",
    avgPackage: "₹14–28 LPA",
    matchScore: 88,
    requiredSkills: ["Python", "FastAPI", "React/TypeScript", "PyTorch/GenAI", "PostgreSQL", "Docker"],
    roadmapStatus: "82% Complete",
  },
  {
    id: "cloud-devops",
    title: "Cloud & DevOps Architect",
    demand: "High",
    avgPackage: "₹12–24 LPA",
    matchScore: 79,
    requiredSkills: ["Kubernetes", "AWS/GCP", "Terraform", "CI/CD Pipelines", "Linux Scripting"],
    roadmapStatus: "65% Complete",
  },
  {
    id: "data-scientist",
    title: "Data Scientist / ML Engineer",
    demand: "High",
    avgPackage: "₹15–30 LPA",
    matchScore: 74,
    requiredSkills: ["Python", "Scikit-Learn", "Deep Learning", "SQL", "Statistics", "MLOps"],
    roadmapStatus: "58% Complete",
  },
];

const RESUME_CRITERIA = [
  { label: "ATS-Compliant Single Column Layout", status: "PASSED", tip: "Clean semantic hierarchy" },
  { label: "Action Verbs & Quantifiable Metrics (STAR)", status: "PASSED", tip: "e.g. 'Reduced API latency by 35%'" },
  { label: "Live Project Links & Active GitHub", status: "PASSED", tip: "Verified GitHub repositories" },
  { label: "Core CS Fundamentals (OS, DBMS, Networks)", status: "REVIEW_NEEDED", tip: "Add specific indexing & caching keywords" },
];

const TOP_INTERVIEW_QUESTIONS = [
  {
    category: "Data Structures & Algos",
    question: "How do you detect and remove a cycle in a singly linked list in O(1) space?",
    answer: "Use Floyd's Cycle-Finding Algorithm (Tortoise and Hare). Maintain two pointers (slow moving 1 step, fast moving 2 steps). If they meet, a cycle exists. To find the start node, reset slow to head and move both 1 step until they meet again.",
  },
  {
    category: "System Design",
    question: "What is the difference between horizontal and vertical scaling, and how does database sharding work?",
    answer: "Vertical scaling increases CPU/RAM on a single machine (bound by physical hardware limits). Horizontal scaling adds more machines behind a load balancer. Sharding partitions database rows across multiple independent database nodes using a shard key.",
  },
  {
    category: "Operating Systems",
    question: "Explain Deadlock conditions and the Banker's Algorithm.",
    answer: "A deadlock requires four conditions simultaneously: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait. The Banker's Algorithm avoids deadlock by simulating resource allocation for safety before granting requests.",
  },
];

export default function CareerGuidance() {
  const [selectedRole, setSelectedRole] = useState(TARGET_ROLES[0]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  return (
    <div className="space-y-6 sm:space-y-7 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="p-5 sm:p-6 md:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 text-white border border-blue-500/20 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <BackButton fallback="/dashboard" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-blue-500/25 text-blue-200 border border-blue-400/30">
                <Sparkles size={11} className="text-sky-300" /> Career Intelligence
              </span>
              <span className="text-xs text-blue-200/70 font-medium">Placement & Industry Ready</span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              Career Guidance & Placement Hub
            </h1>
            <p className="text-xs md:text-sm text-blue-200/70 mt-1 max-w-xl font-normal leading-relaxed">
              Target role roadmaps, ATS resume review, placement eligibility metrics, and technical interview simulations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <Link
              to="/ai-mentor"
              className="btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-2"
            >
              <Sparkles size={14} /> AI Mock Interview
            </Link>
          </div>
        </div>
      </div>

      {/* Placement Readiness Score Banner */}
      <div className="app-card p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-600 text-white flex flex-col items-center justify-center font-display font-black text-xl sm:text-2xl shrink-0">
            86
            <span className="text-[9px] font-sans font-bold tracking-wider uppercase opacity-80">/ 100</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base sm:text-lg font-bold text-slate-900">Placement Readiness Index</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Tier-1 Eligible
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Calculated using DSA solved (140+), CGPA (8.65), resume strength, and completed projects.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="grid grid-cols-3 gap-4 text-center divide-x divide-slate-200 w-full sm:w-auto">
            <div className="px-2">
              <p className="text-xs text-slate-500 font-medium">DSA Solved</p>
              <p className="font-display text-base sm:text-lg font-bold text-slate-900 mt-0.5">142</p>
            </div>
            <div className="px-2">
              <p className="text-xs text-slate-500 font-medium">Resume ATS</p>
              <p className="font-display text-base sm:text-lg font-bold text-blue-700 mt-0.5">92%</p>
            </div>
            <div className="px-2">
              <p className="text-xs text-slate-500 font-medium">Mock Score</p>
              <p className="font-display text-base sm:text-lg font-bold text-emerald-700 mt-0.5">8.8/10</p>
            </div>
          </div>
        </div>
      </div>

      {/* Target Roles & Roadmaps Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Target Career Specializations
          </p>
          <span className="text-xs text-slate-400">Curated to market demand</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TARGET_ROLES.map((role) => (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`app-card p-5 cursor-pointer transition-all ${
                selectedRole.id === role.id
                  ? "border-blue-600 bg-blue-50/20 shadow-xs ring-1 ring-blue-600/30"
                  : "hover:border-blue-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                  {role.demand} Demand
                </span>
                <span className="text-xs font-bold text-emerald-600">{role.avgPackage}</span>
              </div>

              <h4 className="font-display text-base font-bold text-navy mt-3">{role.title}</h4>

              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-muted font-medium">Skill Match</span>
                  <span className="font-bold text-blue-700">{role.matchScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${role.matchScore}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-line flex flex-wrap gap-1">
                {role.requiredSkills.slice(0, 4).map((sk, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-surface text-[10px] font-mono text-slate-600 border border-line"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column: ATS Resume Checklist + Interview Question Bank */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ATS Resume Audit */}
        <div className="app-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-navy flex items-center gap-2">
              <FileCheck2 size={18} className="text-blue-600" /> ATS Resume Scorecard
            </h3>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">
              92 / 100
            </span>
          </div>

          <p className="text-xs text-slate-muted leading-relaxed">
            AI evaluated your latest submitted curriculum vitae against Fortune 500 ATS filters.
          </p>

          <div className="space-y-3">
            {RESUME_CRITERIA.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-line bg-surface/40 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-navy">{item.label}</p>
                  <p className="text-[11px] text-slate-muted mt-0.5">{item.tip}</p>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 ${
                    item.status === "PASSED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {item.status === "PASSED" ? "PASS" : "CHECK"}
                </span>
              </div>
            ))}
          </div>

          <Link
            to="/ai-mentor"
            className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold border border-blue-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sparkles size={14} className="text-blue-700" /> Ask AI to Review Project Bullets →
          </Link>
        </div>

        {/* Technical Interview Q&A Repository */}
        <div className="app-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-navy flex items-center gap-2">
              <Code2 size={18} className="text-blue-600" /> Core Placement Questions
            </h3>
            <span className="text-xs text-slate-muted">High Frequency Rounds</span>
          </div>

          <div className="space-y-3">
            {TOP_INTERVIEW_QUESTIONS.map((q, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-line bg-surface/30 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    className="w-full p-3.5 text-left flex items-center justify-between gap-3 hover:bg-blue-50/40"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                        {q.category}
                      </span>
                      <p className="text-xs font-bold text-navy mt-0.5">{q.question}</p>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-slate-muted transition-transform shrink-0 ${
                        isExpanded ? "rotate-180 text-blue-600" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-line/60 bg-white text-xs text-slate-700 leading-relaxed font-normal">
                      {q.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
