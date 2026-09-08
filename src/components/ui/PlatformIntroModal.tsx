import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Bot,
  Calendar,
  Compass,
  Code2,
  Users,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  GraduationCap,
  Activity,
  Award,
  Layers,
  FileCheck,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { MentorHubEmblemSvg } from "./MentorHubLogo";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface PlatformIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoleLogin?: (email: string) => void;
}

const INTRO_STEPS = [
  {
    id: "vision",
    badge: "EXECUTIVE OVERVIEW",
    title: "Enterprise University Mentoring & Intelligence Hub",
    subtitle: "Closing the gap between students, faculty advisors, and academic leadership with continuous telemetry and AI mentorship.",
  },
  {
    id: "innovations",
    badge: "CORE CAPABILITIES",
    title: "Autonomous Intelligence & Real-Time Student Radar",
    subtitle: "Transforming reactive counseling into proactive student success with continuous telemetry.",
  },
  {
    id: "roles",
    badge: "TRI-TIER ARCHITECTURE",
    title: "Tailored Workspaces for Every Academic Stakeholder",
    subtitle: "A unified system connecting Students, Faculty Advisors, and Department Heads in real time.",
  },
  {
    id: "launch",
    badge: "EXPLORE & TEST DRIVE",
    title: "Experience MentorHUB in Action",
    subtitle: "Launch an instant session with pre-configured institutional test roles.",
  },
];

const ROLES_INFO = [
  {
    role: "STUDENT",
    title: "Student Mentee Workspace",
    tagline: "24/7 Academic Copilot & Career Roadmap",
    email: "student1@university.edu",
    name: "Arun Kumar",
    avatar: "A",
    color: "emerald",
    icon: GraduationCap,
    features: [
      "24/7 AI Mentor fluent in English, Tamil, and Tanglish",
      "Dynamic study timetable with spaced-repetition tracking",
      "Placement readiness scoring & ATS resume analysis",
      "Transparent arrear recovery & continuous CGPA trajectory",
    ],
  },
  {
    role: "MENTOR",
    title: "Faculty Advisor Console",
    tagline: "Cohort Intelligence & Proactive Interventions",
    email: "mentor1@university.edu",
    name: "Dr. Priya Raman",
    avatar: "P",
    color: "indigo",
    icon: Users,
    features: [
      "Automated Early Warning Radar for attendance (<75%) & backlogs",
      "One-click 1:1 advisory meeting logger with transcription notes",
      "Action item assignment & parent communication logs",
      "Comprehensive 360° mentee portfolio with historical audit trail",
    ],
  },
  {
    role: "HOD",
    title: "Head of Department Governance",
    tagline: "Institutional Analytics & NAAC Compliance",
    email: "hod@university.edu",
    name: "Dr. Arvind Swamy",
    avatar: "H",
    color: "purple",
    icon: ShieldCheck,
    features: [
      "Department-wide telemetry: 50+ students across risk tiers",
      "Faculty mentor allocation & advisory session adherence tracking",
      "One-click NBA & NAAC accreditation report exports",
      "Departmental escalation workflows for critical academic alerts",
    ],
  },
];

export function PlatformIntroModal({ isOpen, onClose, onSelectRoleLogin }: PlatformIntroModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRoleTab, setSelectedRoleTab] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    if (dontShowAgain) {
      localStorage.setItem("mentorhub_intro_walkthrough_seen", "true");
    }
    onClose();
  }, [dontShowAgain, onClose]);

  // Keyboard navigation: Escape to close, Left/Right arrow to navigate
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowRight") {
        setCurrentStep((prev) => Math.min(prev + 1, INTRO_STEPS.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleLaunchRole = async (email: string) => {
    if (onSelectRoleLogin) {
      onSelectRoleLogin(email);
      handleClose();
      return;
    }
    try {
      await login(email, "Password@123");
      handleClose();
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to switch role from intro modal", err);
    }
  };

  const stepMeta = INTRO_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Dark Ambient Backdrop with Blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-[#080511]/80 backdrop-blur-md transition-opacity"
      />

      {/* Main Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden z-10 flex flex-col my-auto max-h-[92vh]"
      >
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-white to-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0F172A] p-1.5 flex items-center justify-center shadow-xs border border-blue-500/30">
              <MentorHubEmblemSvg className="w-full h-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-base text-navy tracking-tight">MentorHUB</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold border border-blue-200">
                  PLATFORM OVERVIEW
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Enterprise University Mentoring Intelligence</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close intro"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Progress Tracker Tabs */}
        <div className="px-6 pt-3 pb-2 bg-slate-50/60 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {INTRO_STEPS.map((s, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : isCompleted
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive ? "bg-white/20 text-white" : isCompleted ? "bg-blue-200 text-blue-800" : "bg-slate-100 text-slate-600"
                }`}>
                  {idx + 1}
                </span>
                <span>{s.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          {/* Step Heading */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-blue-600" />
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-blue-700">
                {stepMeta.badge}
              </span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-black text-navy tracking-tight leading-snug">
              {stepMeta.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              {stepMeta.subtitle}
            </p>
          </div>

          {/* SLIDE 1: VISION & OVERVIEW */}
          {currentStep === 0 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* 3 Core Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-2xl bg-gradient-to-b from-blue-50/80 to-white border border-blue-100/90 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Activity size={17} />
                  </div>
                  <h4 className="font-bold text-xs text-navy">Real-Time Telemetry</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Continuously aggregates attendance, active arrears, test trends, and mentee submissions to spot distress before it compounds.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-50/80 to-white border border-indigo-100/90 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <Bot size={17} />
                  </div>
                  <h4 className="font-bold text-xs text-navy">Multi-Turn AI Mentor</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Instant 24/7 academic tutoring, step-by-step coding walkthroughs, and emotional reassurance in English, Tamil, and Tanglish.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-50/80 to-white border border-emerald-100/90 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <FileCheck size={17} />
                  </div>
                  <h4 className="font-bold text-xs text-navy">Accreditation Ready</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Automates advisory session records, mentee action logs, and department summaries for seamless NAAC & NBA documentation.
                  </p>
                </div>
              </div>

              {/* Institutional Stats Banner */}
              <div className="p-4 rounded-2xl bg-[#0F172A] text-white flex flex-wrap items-center justify-between gap-4 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-sky-300">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Institutional Mentoring Standard</p>
                    <p className="text-[11px] text-slate-400">Deployed for higher education institutes and universities.</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-center">
                  <div>
                    <p className="font-display font-black text-lg text-sky-300">50+</p>
                    <p className="text-[10px] text-slate-400 font-mono">STUDENT TELEMETRY</p>
                  </div>
                  <div>
                    <p className="font-display font-black text-lg text-emerald-300">100%</p>
                    <p className="text-[10px] text-slate-400 font-mono">AUDIT TRAIL</p>
                  </div>
                  <div>
                    <p className="font-display font-black text-lg text-indigo-300">&lt;1s</p>
                    <p className="text-[10px] text-slate-400 font-mono">AI COPILOT LATENCY</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: CORE INNOVATIONS */}
          {currentStep === 1 && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/30 space-y-2 hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Bot size={18} />
                    <h4 className="font-bold text-xs text-navy">Conversational AI Mentor</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Understands student academic context (CGPA, active courses, mentor details). Responds natively in English, Tamil, and conversational Tanglish with emotional empathy.
                  </p>
                  <div className="text-[10px] font-mono text-blue-700 bg-blue-100/70 p-2 rounded-xl">
                    "enna panrathu?" → "First-u tension aagadha! Enna problem nu sollu, let's sort it out."
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/30 space-y-2 hover:border-indigo-300 transition-colors">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <Activity size={18} />
                    <h4 className="font-bold text-xs text-navy">Early Warning Risk Radar</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Multivariate risk scoring tracks attendance drops, backlogs, and missed deadlines. Alerts mentors and HODs instantly with proactive remediation proposals.
                  </p>
                  <div className="text-[10px] font-mono text-indigo-700 bg-indigo-100/70 p-2 rounded-xl">
                    High Risk: Attendance &lt; 75% + 2 Standing Arrears → Escalation Alert
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 space-y-2 hover:border-emerald-300 transition-colors">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Calendar size={18} />
                    <h4 className="font-bold text-xs text-navy">Study Planner & Arrear Recovery</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Generates customized revision schedules utilizing spaced-repetition science, high-credit course priorities, and personalized subject difficulty weighting.
                  </p>
                  <div className="text-[10px] font-mono text-emerald-700 bg-emerald-100/70 p-2 rounded-xl">
                    Dynamic Spaced Repetition + Exam Countdown Sync
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/30 space-y-2 hover:border-amber-300 transition-colors">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Compass size={18} />
                    <h4 className="font-bold text-xs text-navy">Career Guidance & Skill Matrix</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Curates role-based career roadmaps (Data Scientist, Full-Stack Developer, Cloud Engineer) with ATS resume audits and verified skill assessments.
                  </p>
                  <div className="text-[10px] font-mono text-amber-700 bg-amber-100/70 p-2 rounded-xl">
                    ATS Resume Scanner + LeetCode & GitHub Progress Alignment
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: ROLES ARCHITECTURE */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Role Selection Tabs */}
              <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
                {ROLES_INFO.map((r, idx) => {
                  const isSelected = selectedRoleTab === idx;
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.role}
                      onClick={() => setSelectedRoleTab(idx)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-white text-navy shadow-xs font-bold"
                          : "text-slate-600 hover:text-navy hover:bg-white/50"
                      }`}
                    >
                      <Icon size={14} className={isSelected ? "text-blue-600" : "text-slate-400"} />
                      <span>{r.role}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Role Detail Card */}
              {(() => {
                const role = ROLES_INFO[selectedRoleTab];
                const Icon = role.icon;
                return (
                  <div className="p-5 rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/40 via-white to-slate-50/30 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                          <Icon size={22} />
                        </div>
                        <div>
                          <h3 className="font-display font-black text-sm text-navy">{role.title}</h3>
                          <p className="text-xs text-blue-700 font-medium">{role.tagline}</p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">Demo User: {role.name} ({role.email})</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleLaunchRole(role.email)}
                        className="btn-primary text-xs py-1.5 px-3.5 inline-flex items-center gap-1.5 shadow-xs cursor-pointer font-bold"
                      >
                        <span>Test This Role</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-blue-100/70">
                      {role.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/70">
                          <CheckCircle2 size={15} className="text-blue-600 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* SLIDE 4: QUICK LAUNCH & TEST DRIVE */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <p className="text-xs text-slate-600">
                Click on any persona below to immediately log in and explore MentorHUB from that specific perspective:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ROLES_INFO.map((demo) => {
                  const Icon = demo.icon;
                  const isCurrent = user?.email.toLowerCase() === demo.email.toLowerCase();
                  return (
                    <div
                      key={demo.email}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                        isCurrent
                          ? "border-blue-500 bg-blue-50/50 shadow-sm"
                          : "border-slate-200/80 bg-white hover:border-blue-300 hover:shadow-xs"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                            <Icon size={16} />
                          </div>
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {demo.role}
                          </span>
                        </div>

                        <div>
                          <p className="font-bold text-xs text-navy">{demo.name}</p>
                          <p className="text-[11px] text-slate-500">{demo.tagline}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-1">{demo.email}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleLaunchRole(demo.email)}
                        className="w-full btn-primary text-xs py-2 inline-flex items-center justify-center gap-1.5 cursor-pointer font-bold shadow-xs"
                      >
                        <span>{isCurrent ? "Active Role" : `Log in as ${demo.role}`}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Tips banner */}
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200/70 flex items-center gap-2.5 text-xs text-blue-900">
                <Sparkles size={16} className="text-blue-600 shrink-0" />
                <span>
                  <strong>Tip:</strong> You can switch roles at any time while using the app using the fast role pill switcher in the top navigation bar!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
            <input autoComplete="off"
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Don't show this intro automatically on launch</span>
          </label>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                className="btn-secondary text-xs py-2 px-3.5 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
            )}

            {currentStep < INTRO_STEPS.length - 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => Math.min(prev + 1, INTRO_STEPS.length - 1))}
                className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 cursor-pointer font-bold shadow-xs"
              >
                <span>Next Section</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-1.5 cursor-pointer font-bold shadow-sm"
              >
                <span>Start Exploring</span>
                <CheckCircle2 size={14} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
