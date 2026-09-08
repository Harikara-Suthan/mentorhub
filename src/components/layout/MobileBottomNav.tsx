import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  Calendar,
  Compass,
  TrendingUp,
  UserCheck,
  Bell,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { isRouteActive } from "./navConfig";

export function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return null;

  const isStudent = user.role === "STUDENT";

  const navItems = isStudent
    ? [
        { to: "/dashboard", label: "Home", icon: LayoutDashboard },
        { to: "/ai-mentor", label: "AI Mentor", icon: Bot, isAi: true, aliases: ["/ai-insights", "/ai"] },
        { to: "/study-planner", label: "Planner", icon: Calendar },
        { to: "/academics", label: "Academics", icon: TrendingUp, aliases: ["/progress"] },
        { to: "/career-guidance", label: "Career", icon: Compass, aliases: ["/career"] },
      ]
    : [
        { to: "/dashboard", label: "Home", icon: LayoutDashboard },
        { to: "/students", label: "Students", icon: UserCheck },
        { to: "/ai-insights", label: "AI Intel", icon: Bot, isAi: true, aliases: ["/ai-mentor", "/ai"] },
        { to: "/mentoring", label: "Meetings", icon: Calendar, aliases: ["/meetings"] },
        { to: "/notifications", label: "Alerts", icon: Bell },
      ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-sm px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map(({ to, label, icon: Icon, isAi, aliases }) => {
          const isActive = isRouteActive(location.pathname, to, aliases);

          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors min-w-[56px] ${
                isActive
                  ? "text-blue-600 font-semibold"
                  : "text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <div className="relative">
                <div
                  className={`w-9 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isActive ? "bg-blue-50 text-blue-600" : "text-slate-500"
                  }`}
                >
                  <Icon size={17} />
                </div>
                {isAi && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
