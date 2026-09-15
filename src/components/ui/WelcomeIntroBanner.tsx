import { useState, useEffect } from "react";
import { Sparkles, X, GraduationCap, Users, ShieldCheck, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useIntro } from "../../context/IntroContext";
import { safeGetItem, safeSetItem } from "../../utils/storage";

export function WelcomeIntroBanner() {
  const { user } = useAuth();
  const { openIntro } = useIntro();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!user) return;
    const isDismissed = safeGetItem(`mentorhub_dismiss_banner_${user.role}`) === "true";
    setDismissed(isDismissed);
  }, [user]);

  if (dismissed || !user) return null;

  const handleDismiss = () => {
    safeSetItem(`mentorhub_dismiss_banner_${user.role}`, "true");
    setDismissed(true);
  };

  const getRoleContent = () => {
    switch (user.role) {
      case "STUDENT":
        return {
          badge: "STUDENT SUCCESS SUITE",
          title: "Welcome to your Academic Copilot",
          desc: "Access 24/7 AI mentorship in English & Tanglish, monitor attendance, and follow a spaced-repetition study schedule.",
          icon: GraduationCap,
          primaryAction: "Explore Platform Guide",
          tagline: "Always available to help you excel",
        };
      case "MENTOR":
        return {
          badge: "COHORT INTELLIGENCE",
          title: "Faculty Advisory Command Center",
          desc: "Continuous telemetry tracks student mentees. Early warning alerts detect attendance drops and arrears automatically.",
          icon: Users,
          primaryAction: "Review Advisory System",
          tagline: "Proactive, data-backed mentoring",
        };
      case "HOD":
        return {
          badge: "DEPARTMENT GOVERNANCE",
          title: "Department-Wide Academic Oversight",
          desc: "Full telemetry for 50+ students across risk tiers, faculty advisory compliance, and automated NAAC Criteria 2.3 reporting.",
          icon: ShieldCheck,
          primaryAction: "Inspect Governance Metrics",
          tagline: "Accreditation & audit ready",
        };
      default:
        return {
          badge: "MENTORHUB SYSTEM",
          title: "Welcome to MentorHUB",
          desc: "The next-generation academic advisory intelligence platform.",
          icon: Sparkles,
          primaryAction: "Explore Features",
          tagline: "Intelligent mentoring platform",
        };
    }
  };

  const content = getRoleContent();
  const Icon = content.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#170E30] via-[#1F123F] to-[#120B24] text-white p-4 sm:p-5 border border-blue-500/30 shadow-md mb-6">
      {/* Background glow dots */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-blue-600/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-sky-300 shrink-0 mt-0.5">
            <Icon size={20} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/25 text-blue-200 border border-blue-400/30">
                {content.badge}
              </span>
              <span className="text-[11px] text-sky-300/80 font-medium hidden sm:inline">
                {content.tagline}
              </span>
            </div>
            <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-tight">
              {content.title}
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {content.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            onClick={openIntro}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Sparkles size={13} />
            <span>{content.primaryAction}</span>
            <ChevronRight size={13} />
          </button>

          <button
            onClick={handleDismiss}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss welcome banner"
            aria-label="Dismiss banner"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
