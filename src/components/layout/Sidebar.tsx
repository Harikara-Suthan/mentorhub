import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useIntro } from "../../context/IntroContext";
import { MentorHubLogo } from "../ui/MentorHubLogo";
import { NAV_ITEMS_BY_ROLE, isRouteActive } from "./navConfig";

const ROLE_INFO: Record<string, { label: string; badge: string; color: string }> = {
  HOD: { label: "Department Head", badge: "HOD", color: "bg-blue-500/10 text-blue-700 border-blue-200" },
  MENTOR: { label: "Faculty Advisor", badge: "Mentor", color: "bg-sky-500/10 text-sky-700 border-sky-200" },
  STUDENT: { label: "Student Mentee", badge: "Student", color: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
  ADMIN: { label: "Administrator", badge: "Admin", color: "bg-red-500/10 text-red-700 border-red-200" },
};

export function Sidebar() {
  const { user } = useAuth();
  const { openIntro } = useIntro();
  const location = useLocation();

  if (!user) return null;
  const items = NAV_ITEMS_BY_ROLE[user.role] || NAV_ITEMS_BY_ROLE.STUDENT;
  const roleMeta = ROLE_INFO[user.role] || ROLE_INFO.MENTOR;

  return (
    <aside className="w-64 shrink-0 bg-white text-slate-800 flex flex-col h-screen sticky top-0 border-r border-blue-100 shadow-xs z-20">
      {/* Brand Header */}
      <div className="px-5 h-16 flex items-center justify-between border-b border-blue-50 bg-sky-50/50">
        <MentorHubLogo size="md" theme="light" animate={false} />
      </div>

      {/* User Role Card in Sidebar */}
      <div className="px-3.5 pt-4 pb-2">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-blue-100/50 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold uppercase shrink-0">
            {user.email[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-900 truncate">{user.email.split("@")[0]}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${roleMeta.color}`}>
                {roleMeta.badge}
              </span>
              <span className="text-[10px] text-slate-500 truncate">{roleMeta.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Workspace
        </p>
        {items.map(({ to, label, icon: Icon, isAi, aliases }) => {
          const isActive = isRouteActive(location.pathname, to, aliases);

          return (
            <Link
              key={to}
              to={to}
              id={`nav-item-${to.replace(/[^a-zA-Z0-9]/g, "-")}`}
              className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-sky-50/50 hover:text-slate-950"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                    isActive
                      ? "text-blue-600"
                      : isAi
                      ? "text-blue-500 group-hover:text-blue-600"
                      : "text-slate-400 group-hover:text-slate-600"
                  }`}
                >
                  <Icon size={16} />
                </div>
                <span className="truncate">{label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {isAi && !isActive && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600">
                    AI
                  </span>
                )}
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Intro Tutorial Launcher */}
      <div className="px-3.5 py-3 border-t border-blue-50 bg-sky-50/30">
        <button
          onClick={openIntro}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50/80 rounded-xl transition-colors cursor-pointer"
        >
          <span className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[11px]">
            ?
          </span>
          <span>Tour & Guidance</span>
        </button>
      </div>
    </aside>
  );
}
