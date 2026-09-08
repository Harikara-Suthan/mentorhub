import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Bot,
  Calendar,
  Compass,
  Code2,
  ArrowRight,
  ShieldCheck,
  Layers,
  LayoutGrid,
} from "lucide-react";
import { MentorHubLogo } from "../components/ui/MentorHubLogo";
import { useIntro } from "../context/IntroContext";
import { useAuth } from "../context/AuthContext";
import { ProfessionalIntro } from "../components/ui/ProfessionalIntro";

export default function Onboarding() {
  const navigate = useNavigate();
  const { openIntro } = useIntro();
  const { login } = useAuth();
  const [viewMode, setViewMode] = useState<"summary" | "architecture">("summary");

  const handleDemoLaunch = async (email: string) => {
    try {
      await login(email, "Password@123");
      navigate("/dashboard");
    } catch {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-slate-50 flex flex-col justify-between p-4 md:p-8">
      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <MentorHubLogo size="md" animate />
        <div className="flex items-center gap-2.5">
          <button
            onClick={openIntro}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer"
          >
            <Sparkles size={13} className="text-blue-600" />
            <span>Platform Tour</span>
          </button>
          <Link
            to="/login"
            className="text-xs font-bold text-slate-700 hover:text-blue-800 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 transition-colors border border-slate-200 shadow-2xs"
          >
            Sign In →
          </Link>
        </div>
      </div>

      {/* Main Hero Onboarding Container */}
      <div className="max-w-4xl w-full mx-auto my-auto py-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Toggle Mode Pills */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-blue-50 border border-blue-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode("summary")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === "summary"
                ? "bg-white text-blue-900 shadow-xs"
                : "text-blue-700 hover:text-blue-950"
            }`}
          >
            <LayoutGrid size={13} />
            <span>Platform Overview</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("architecture")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === "architecture"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-blue-700 hover:text-blue-950"
            }`}
          >
            <Layers size={13} />
            <span>Enterprise Value Proposition</span>
          </button>
        </div>

        {viewMode === "summary" ? (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Heading */}
            <div className="space-y-3">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-navy tracking-tight leading-[1.1]">
                Your Journey. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600">
                  Your Mentor.
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
                Get personalized guidance for academics, skills and your career — all in one unified institutional hub.
              </p>
            </div>

            {/* 4 Feature Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
              {[
                { icon: Bot, title: "AI Mentor", desc: "24/7 academic & coding tutor in English & Tanglish" },
                { icon: Calendar, title: "Study Planner", desc: "Spaced repetition timetable & arrear recovery" },
                { icon: Compass, title: "Career Hub", desc: "ATS resume scoring & placement prep" },
                { icon: Code2, title: "Skill Matrix", desc: "Verified competency tracks & milestone review" },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="app-card p-4 space-y-1.5 border-blue-100/80 hover:border-blue-300 transition-all bg-white"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      <Icon size={16} />
                    </div>
                    <h4 className="font-bold text-xs text-navy">{item.title}</h4>
                    <p className="text-[11px] text-slate-muted leading-tight">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <button
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto btn-primary text-sm py-3.5 px-8 inline-flex items-center justify-center gap-2 cursor-pointer font-bold shadow-md"
              >
                <span>Get Started</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => setViewMode("architecture")}
                className="w-full sm:w-auto btn-secondary text-sm py-3.5 px-6 border-blue-200 text-blue-800 bg-blue-50/70 hover:bg-blue-50 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer font-semibold"
              >
                <Layers size={16} className="text-blue-600" />
                <span>Explore Value Proposition</span>
              </button>

              <button
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto btn-secondary text-sm py-3.5 px-6 border-line text-slate-700 hover:text-navy cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        ) : (
          <div className="text-left animate-in fade-in duration-200 bg-white p-6 sm:p-8 rounded-3xl border border-blue-100 shadow-xl max-w-4xl mx-auto">
            <ProfessionalIntro
              variant="light"
              onSelectDemo={handleDemoLaunch}
              onOpenTour={openIntro}
              showDemoLaunchers={true}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center py-4 border-t border-line/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-muted gap-2">
        <p>© 2026 MentorHUB. GUIDE • CONNECT • GROW.</p>
        <p className="flex items-center gap-1 text-blue-700 font-medium">
          <ShieldCheck size={14} /> Enterprise University Mentoring Standard
        </p>
      </div>
    </div>
  );
}
