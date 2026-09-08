import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Bot,
  Activity,
  FileCheck,
  GraduationCap,
  Users,
  ShieldCheck,
  Calendar,
  Compass,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Cpu,
  BarChart3,
  BookOpen,
  MessageSquareCode,
  Zap,
} from "lucide-react";

export interface ProfessionalIntroProps {
  variant?: "dark" | "light" | "glass";
  onSelectDemo?: (email: string) => void;
  onOpenTour?: () => void;
  showDemoLaunchers?: boolean;
  className?: string;
}

interface ValuePillar {
  id: string;
  icon: React.ElementType;
  tag: string;
  title: string;
  headline: string;
  summary: string;
  bulletPoints: string[];
  telemetrySnippet?: {
    label: string;
    value: string;
    subtext: string;
  };
}

const VALUE_PILLARS: ValuePillar[] = [
  {
    id: "radar",
    icon: Activity,
    tag: "TELEMETRY & RISK RADAR",
    title: "Continuous Student Telemetry",
    headline: "Detect Distress Before It Compounds",
    summary:
      "Automated multivariate risk scoring analyzes attendance rates (<75%), recurring arrears, internal assessment dips, and submission delays to alert faculty proactively.",
    bulletPoints: [
      "Dynamic risk categorizations (Low, Medium, High Alert)",
      "Automated SMS/Email notification workflows for academic guardians",
      "One-click intervention strategy generator for standing arrears",
    ],
    telemetrySnippet: {
      label: "Intervention Latency",
      value: "< 24 Hours",
      subtext: "From attendance drop to advisory session scheduled",
    },
  },
  {
    id: "copilot",
    icon: Bot,
    tag: "NEURAL TUTORING",
    title: "Multilingual AI Academic Copilot",
    headline: "24/7 Contextual Guidance in English & Tanglish",
    summary:
      "Empowered by advanced Gemini AI, the copilot understands each mentee's exact syllabus, CGPA goals, and learning velocity to provide step-by-step code guidance and emotional reassurance.",
    bulletPoints: [
      "Fluent in English, Tamil, and conversational Tanglish",
      "DSA & technical debugging with Socratic walkthroughs",
      "Stress relief & motivational mentorship during exam weeks",
    ],
    telemetrySnippet: {
      label: "AI Availability",
      value: "99.9% Uptime",
      subtext: "Instant responses with full academic context retention",
    },
  },
  {
    id: "accreditation",
    icon: FileCheck,
    tag: "GOVERNANCE & AUDIT",
    title: "NAAC & NBA Compliance Engine",
    headline: "Zero-Friction Institutional Record Keeping",
    summary:
      "Eliminate cumbersome paperwork with digital meeting minute transcription, parent counseling audit logs, and one-click criterion exports designed for accreditation committees.",
    bulletPoints: [
      "Automated NAAC Criteria 2.3.3 mentee logbook generation",
      "Timestamped 1:1 advisory notes with action-item checklists",
      "Department-wide mentor-mentee ratio & load balancing telemetry",
    ],
    telemetrySnippet: {
      label: "Audit Readiness",
      value: "100% Digital",
      subtext: "Cryptographically verified mentee meeting logs",
    },
  },
  {
    id: "career",
    icon: Compass,
    tag: "CAREER & ROADMAP",
    title: "Spaced Repetition & Placement Readiness",
    headline: "From Academic Recovery to High-Tier Placement",
    summary:
      "Combines spaced-repetition revision timetables with ATS resume auditing, GitHub portfolio reviews, and role-based career milestones.",
    bulletPoints: [
      "Intelligent exam revision planner prioritized by credit weighting",
      "Keyword-matched ATS resume audit & recruiter readiness scoring",
      "Curated learning tracks: Full Stack, Data Science & Cloud",
    ],
    telemetrySnippet: {
      label: "Placement Readiness",
      value: "+42% Boost",
      subtext: "In technical interview competency and milestone tracking",
    },
  },
];

const DEMO_PERSONAS = [
  {
    role: "STUDENT",
    name: "Arun Kumar",
    email: "student1@university.edu",
    desc: "AI Academic Copilot, Spaced-Repetition Planner & Career Roadmap",
    icon: GraduationCap,
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    buttonColor: "hover:bg-emerald-950/40 border-emerald-500/30",
  },
  {
    role: "MENTOR",
    name: "Dr. Priya Raman",
    email: "mentor1@university.edu",
    desc: "20 Mentees, Automated Early-Warning Radar & Advisory Minutes",
    icon: Users,
    badgeColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    buttonColor: "hover:bg-indigo-950/40 border-indigo-500/30",
  },
  {
    role: "HOD",
    name: "Dr. Arvind Swamy",
    email: "hod@university.edu",
    desc: "Department Analytics, Mentor Allocation & NAAC Criteria Exports",
    icon: ShieldCheck,
    badgeColor: "bg-blue-500/15 text-sky-300 border-blue-500/30",
    buttonColor: "hover:bg-blue-950/40 border-blue-500/30",
  },
];

export function ProfessionalIntro({
  variant = "dark",
  onSelectDemo,
  onOpenTour,
  showDemoLaunchers = true,
  className = "",
}: ProfessionalIntroProps) {
  const [activeTab, setActiveTab] = useState<string>("radar");
  const selectedPillar = VALUE_PILLARS.find((p) => p.id === activeTab) || VALUE_PILLARS[0];
  const PillarIcon = selectedPillar.icon;

  const isDark = variant === "dark" || variant === "glass";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`relative flex flex-col justify-between space-y-6 md:space-y-8 ${
        isDark ? "text-white" : "text-navy"
      } ${className}`}
    >
      {/* 1. Header & Value Proposition Pitch */}
      <div className="space-y-4">
        {/* Subtle Institutional Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/25 text-[11px] font-mono font-semibold tracking-wider text-sky-300">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span>ENTERPRISE ACADEMIC ADVISORY &amp; INTELLIGENCE</span>
        </div>

        {/* Dynamic Display Headline */}
        <div className="space-y-2.5">
          <h2
            className={`font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-[1.18] ${
              isDark ? "text-white" : "text-navy"
            }`}
          >
            Intelligent Mentoring. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
              Proactive Academic Success.
            </span>
          </h2>
          <p
            className={`text-xs sm:text-sm leading-relaxed max-w-xl ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            MentorHUB bridges students, faculty advisors, and departmental leadership. By unifying
            real-time student telemetry with continuous 24/7 AI mentorship, the platform transforms
            advisory counseling from reactive firefighting into guaranteed academic growth.
          </p>
        </div>
      </div>

      {/* 2. Interactive Value Proposition Feature Showcase */}
      <div
        className={`rounded-2xl border p-4 sm:p-5 transition-all ${
          isDark
            ? "bg-white/[0.03] border-white/10 shadow-2xl backdrop-blur-md"
            : "bg-white border-blue-100 shadow-md"
        }`}
      >
        {/* Feature Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 border-b border-white/10">
          {VALUE_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            const isActive = pillar.id === activeTab;
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setActiveTab(pillar.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : isDark
                    ? "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                    : "text-slate-600 hover:text-navy hover:bg-slate-100"
                }`}
              >
                <Icon size={14} className={isActive ? "text-white" : "text-sky-400"} />
                <span>{pillar.title}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Pillar Content View */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPillar.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="pt-4 space-y-3.5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-sky-300 flex items-center justify-center font-bold">
                  <PillarIcon size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-sky-300 tracking-wider">
                    {selectedPillar.tag}
                  </span>
                  <h3
                    className={`font-display text-sm sm:text-base font-bold leading-tight ${
                      isDark ? "text-white" : "text-navy"
                    }`}
                  >
                    {selectedPillar.headline}
                  </h3>
                </div>
              </div>

              {selectedPillar.telemetrySnippet && (
                <div
                  className={`hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border ${
                    isDark
                      ? "bg-blue-950/30 border-blue-500/30"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <Zap size={14} className="text-sky-400" />
                  <div>
                    <div className="text-[10px] font-mono text-sky-300 uppercase">
                      {selectedPillar.telemetrySnippet.label}
                    </div>
                    <div className="font-display font-black text-xs text-white">
                      {selectedPillar.telemetrySnippet.value}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <p
              className={`text-xs leading-relaxed ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              {selectedPillar.summary}
            </p>

            {/* Bullet Point Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {selectedPillar.bulletPoints.map((point, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 p-2 rounded-xl text-[11px] border ${
                    isDark
                      ? "bg-white/[0.02] border-white/[0.06] text-slate-300"
                      : "bg-slate-50 border-slate-100 text-slate-700"
                  }`}
                >
                  <CheckCircle2 size={13} className="text-sky-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{point}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. Demo Persona Instant Test Drive Launcher */}
      {showDemoLaunchers && onSelectDemo && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-sky-400" />
              <span
                className={`text-xs font-bold uppercase tracking-wider font-mono ${
                  isDark ? "text-white" : "text-navy"
                }`}
              >
                Instant Test Drive
              </span>
            </div>
            {onOpenTour && (
              <button
                type="button"
                onClick={onOpenTour}
                className="text-[11px] font-semibold text-sky-300 hover:text-blue-200 inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Full System Tour</span>
                <ChevronRight size={12} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {DEMO_PERSONAS.map((demo) => {
              const Icon = demo.icon;
              return (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => onSelectDemo(demo.email)}
                  className={`p-3 rounded-xl border text-left transition-all group cursor-pointer flex flex-col justify-between ${
                    isDark
                      ? "bg-white/[0.04] hover:bg-white/[0.09] border-white/10 hover:border-blue-400/40"
                      : "bg-white hover:bg-blue-50/50 border-blue-100 hover:border-blue-300 shadow-2xs"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${demo.badgeColor}`}
                      >
                        {demo.role}
                      </span>
                      <ChevronRight
                        size={13}
                        className="text-slate-500 group-hover:text-sky-300 group-hover:translate-x-0.5 transition-all"
                      />
                    </div>
                    <p
                      className={`text-xs font-bold group-hover:text-sky-300 transition-colors ${
                        isDark ? "text-white" : "text-navy"
                      }`}
                    >
                      {demo.name}
                    </p>
                    <p
                      className={`text-[10px] leading-snug mt-0.5 line-clamp-2 ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {demo.desc}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-sky-400 group-hover:text-sky-300 mt-2 flex items-center gap-1">
                    <span>Log in as {demo.role}</span> →
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
