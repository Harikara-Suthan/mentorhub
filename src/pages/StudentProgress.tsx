import React from "react";
import {
  TrendingUp,
  Sparkles,
  Award,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  BarChart3,
  BookOpen,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { SimpleLineChart } from "../components/charts/SimpleLineChart";
import { SimpleBarChart } from "../components/charts/SimpleBarChart";
import { Link } from "react-router-dom";
import { BackButton } from "../components/ui/BackButton";
import { StatCard } from "../components/ui/StatCard";

const SEMESTER_PERFORMANCE = [
  { name: "Sem 1", value: 8.2 },
  { name: "Sem 2", value: 8.4 },
  { name: "Sem 3", value: 8.35 },
  { name: "Sem 4", value: 8.7 },
  { name: "Sem 5", value: 8.9 },
  { name: "Sem 6 (Cur)", value: 8.65 },
];

const ATTENDANCE_BREAKDOWN = [
  { name: "Distributed Sys", value: 94 },
  { name: "Machine Learning", value: 90 },
  { name: "Compiler Design", value: 88 },
  { name: "Software Eng", value: 92 },
  { name: "Cloud Lab", value: 96 },
];

export default function StudentProgress() {
  return (
    <div className="space-y-6 sm:space-y-7 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="p-5 sm:p-6 md:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 text-white border border-blue-500/20 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <BackButton fallback="/dashboard" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-blue-500/25 text-blue-200 border border-blue-400/30">
                <Sparkles size={11} className="text-sky-300" /> Academic Telemetry Core
              </span>
              <span className="text-xs text-blue-200/70 font-medium">Verified Academic Ledger</span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              Student Progress & Telemetry
            </h1>
            <p className="text-xs md:text-sm text-blue-200/70 mt-1 max-w-xl font-normal leading-relaxed">
              Comprehensive academic GPA trajectory, attendance verification, skill growth, and career readiness.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <Link
              to="/reports"
              className="btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-2"
            >
              <Award size={14} /> Export Academic Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Top 4 Stat Cards - Compact 1-line (lg) / 2-line (sm) grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        <StatCard
          label="Cumulative GPA"
          value="8.65"
          icon={<GraduationCap size={14} />}
          accent="navy"
          subtext="Top 5% in Department"
          compact
        />
        <StatCard
          label="Overall Attendance"
          value="91.4%"
          icon={<CheckCircle2 size={14} />}
          accent="risk-low"
          subtext="Threshold: 75% Safe"
          compact
        />
        <StatCard
          label="Active Arrears"
          value="0"
          icon={<ShieldCheck size={14} />}
          accent="risk-low"
          subtext="Clean Academic Record"
          compact
        />
        <StatCard
          label="Career Readiness"
          value="86%"
          icon={<Target size={14} />}
          accent="blue"
          subtext="Tier-1 Product Placement"
          compact
        />
      </div>

      {/* 2-Column Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Semester GPA Trend */}
        <div className="app-card p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-sm sm:text-base font-bold text-slate-900">SGPA Progression Curve</h3>
              <p className="text-xs text-slate-400 mt-0.5">Semester-wise grade point average</p>
            </div>
            <span className="text-xs font-mono font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
              Consistent Upward Trend
            </span>
          </div>

          <div className="pt-2 overflow-hidden">
            <SimpleLineChart data={SEMESTER_PERFORMANCE} color="#7E22CE" />
          </div>
        </div>

        {/* Subject Attendance Radar */}
        <div className="app-card p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-sm sm:text-base font-bold text-slate-900">Subject Attendance Matrix</h3>
              <p className="text-xs text-slate-400 mt-0.5">Active semester course compliance</p>
            </div>
            <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
              All Courses &gt; 85%
            </span>
          </div>

          <div className="pt-2 overflow-hidden">
            <SimpleBarChart data={ATTENDANCE_BREAKDOWN} color="#6366F1" />
          </div>
        </div>
      </div>
    </div>
  );
}
