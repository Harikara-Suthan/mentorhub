import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  X,
  LogOut,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { MentorHubLogo } from "../ui/MentorHubLogo";
import { NAV_ITEMS_BY_ROLE, isRouteActive } from "./navConfig";

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEMO_USERS = [
  {
    name: "Dr. Arvind Swamy",
    email: "hod@university.edu",
    role: "HOD",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    name: "Dr. Priya Raman",
    email: "mentor1@university.edu",
    role: "MENTOR",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    name: "Arun Kumar",
    email: "student1@university.edu",
    role: "STUDENT",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
];

export function MobileNavDrawer({ isOpen, onClose }: MobileNavDrawerProps) {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen || !user) return null;

  const items = NAV_ITEMS_BY_ROLE[user.role] || NAV_ITEMS_BY_ROLE.STUDENT;

  const handleSwitchUser = async (email: string) => {
    try {
      await login(email, "Password@123");
      onClose();
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to switch user", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer content */}
      <div className="relative w-[85vw] max-w-[320px] bg-[#0F172A] text-slate-200 h-full flex flex-col shadow-2xl border-r border-slate-800 z-10 animate-in slide-in-from-left duration-200 overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          <MentorHubLogo size="sm" theme="dark" animate={false} />
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card */}
        <div className="p-3.5 border-b border-slate-800 bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs uppercase shrink-0">
              {user.email[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {user.email.split("@")[0]}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-blue-500/20 text-sky-300 border border-blue-500/30">
                  {user.role}
                </span>
                <span className="text-[10px] text-slate-400 truncate">{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          <p className="px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Main Navigation
          </p>
          {items.map(({ to, label, icon: Icon, isAi, aliases }) => {
            const isActive = isRouteActive(location.pathname, to, aliases);

            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-5 h-5 flex items-center justify-center shrink-0 ${
                      isActive
                        ? "text-white"
                        : isAi
                        ? "text-sky-400"
                        : "text-slate-400"
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <span className="truncate">{label}</span>
                </div>
                {isAi && !isActive && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/25 text-sky-300 shrink-0">
                    AI
                  </span>
                )}
              </Link>
            );
          })}

          {/* Quick Demo Switcher in Mobile Drawer */}
          <div className="pt-4 mt-3 border-t border-slate-800">
            <p className="px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              <UserCheck size={12} className="text-sky-400" /> Switch Demo Role
            </p>
            <div className="space-y-1 mt-1">
              {DEMO_USERS.map((demo) => {
                const isCurrent = demo.email.toLowerCase() === user.email.toLowerCase();
                return (
                  <button
                    key={demo.email}
                    onClick={() => handleSwitchUser(demo.email)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isCurrent
                        ? "bg-slate-800 text-white font-semibold"
                        : "text-slate-300 hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{demo.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{demo.role}</p>
                    </div>
                    {isCurrent && <CheckCircle2 size={14} className="text-sky-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drawer Footer with Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
