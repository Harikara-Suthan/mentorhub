import React, { useState } from "react";
import {
  Code2,
  Sparkles,
  Award,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  Terminal,
  Database,
  Layers,
  Cpu,
  Zap,
  Lock,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { BackButton } from "../components/ui/BackButton";

interface SkillItem {
  id: string;
  name: string;
  category: "TECHNICAL" | "AI_DATA" | "CLOUD_DEVOPS" | "CORE_CS" | "SOFT_SKILLS";
  level: "Beginner" | "Intermediate" | "Advanced" | "Mastered";
  progress: number;
  verified: boolean;
  projectsCount: number;
}

const INITIAL_SKILLS: SkillItem[] = [
  {
    id: "sk-1",
    name: "Python 3.12 (FastAPI, AsyncIO, PyTest)",
    category: "TECHNICAL",
    level: "Advanced",
    progress: 88,
    verified: true,
    projectsCount: 4,
  },
  {
    id: "sk-2",
    name: "Data Structures & Algorithm Patterns (DSA)",
    category: "CORE_CS",
    level: "Advanced",
    progress: 82,
    verified: true,
    projectsCount: 6,
  },
  {
    id: "sk-3",
    name: "React, TypeScript & Tailwind CSS",
    category: "TECHNICAL",
    level: "Intermediate",
    progress: 75,
    verified: true,
    projectsCount: 3,
  },
  {
    id: "sk-4",
    name: "Generative AI & LLM Systems (LangChain, Gemini)",
    category: "AI_DATA",
    level: "Intermediate",
    progress: 70,
    verified: false,
    projectsCount: 2,
  },
  {
    id: "sk-5",
    name: "Docker, Kubernetes & CI/CD Pipelines",
    category: "CLOUD_DEVOPS",
    level: "Intermediate",
    progress: 65,
    verified: false,
    projectsCount: 2,
  },
  {
    id: "sk-6",
    name: "Database Systems & SQL Indexing (PostgreSQL)",
    category: "CORE_CS",
    level: "Advanced",
    progress: 85,
    verified: true,
    projectsCount: 3,
  },
  {
    id: "sk-7",
    name: "Technical Communication & STAR Interview Framing",
    category: "SOFT_SKILLS",
    level: "Intermediate",
    progress: 78,
    verified: true,
    projectsCount: 5,
  },
];

export default function SkillsMatrix() {
  const [skills, setSkills] = useState<SkillItem[]>(INITIAL_SKILLS);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const filteredSkills = skills.filter((s) => {
    if (activeCategory === "ALL") return true;
    return s.category === activeCategory;
  });

  return (
    <div className="space-y-6 sm:space-y-7 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="p-5 sm:p-6 md:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 text-white border border-blue-500/20 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <BackButton fallback="/dashboard" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-blue-500/25 text-blue-200 border border-blue-400/30">
                <Sparkles size={11} className="text-sky-300" /> Skill Competency Engine
              </span>
              <span className="text-xs text-blue-200/70 font-medium">Verified Competencies</span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              Skill Development Matrix
            </h1>
            <p className="text-xs md:text-sm text-blue-200/70 mt-1 max-w-xl font-normal leading-relaxed">
              Track technical benchmarks, verified credentials, and AI-recommended skill expansion trees.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <Link
              to="/ai-mentor"
              className="btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-2"
            >
              <Zap size={14} /> AI Skill Assessment
            </Link>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: "ALL", label: "All Competencies" },
          { id: "TECHNICAL", label: "Languages & Frameworks" },
          { id: "CORE_CS", label: "Core Computer Science" },
          { id: "AI_DATA", label: "AI & Machine Learning" },
          { id: "CLOUD_DEVOPS", label: "Cloud & DevOps" },
          { id: "SOFT_SKILLS", label: "Soft Skills" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              activeCategory === tab.id
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((sk) => (
          <div
            key={sk.id}
            className="app-card p-5 space-y-4 hover:border-blue-300 transition-all group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 border border-blue-100">
                <Code2 size={20} />
              </div>
              <div className="flex items-center gap-1.5">
                {sk.verified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={11} /> Verified
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    In Progress
                  </span>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-display text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {sk.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {sk.projectsCount} validated projects logged
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Mastery</span>
                <span className="font-semibold text-blue-700">{sk.progress}% ({sk.level})</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${sk.progress}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">{sk.category}</span>
              <button
                onClick={() => {
                  setSkills((prev) =>
                    prev.map((item) =>
                      item.id === sk.id
                        ? { ...item, progress: Math.min(100, item.progress + 5), verified: true }
                        : item
                    )
                  );
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                + Log Practice
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
