import React, { useEffect, useState, useRef } from "react";
import {
  Bell,
  LogOut,
  Search,
  Plus,
  UserCheck,
  GraduationCap,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  User,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useIntro } from "../../context/IntroContext";
import { api } from "../../api/client";
import { AppNotification, Student } from "../../types";
import { RiskDot } from "../ui/RiskSeal";
import { MentorHubLogo } from "../ui/MentorHubLogo";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { getUserAvatar } from "../../utils/avatar";

const DEMO_USERS = [
  {
    name: "Dr. Arvind Swamy",
    email: "hod@university.edu",
    role: "HOD",
    desc: "Department Head (All Dept Analytics)",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    name: "Dr. Priya Raman",
    email: "mentor1@university.edu",
    role: "MENTOR",
    desc: "Faculty Advisor (20 Mentees)",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    name: "Arun Kumar",
    email: "student1@university.edu",
    role: "STUDENT",
    desc: "Student Mentee (AI Assistant & Planner)",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
];

export function Header() {
  const { user, logout, login } = useAuth();
  const { openIntro } = useIntro();
  const navigate = useNavigate();

  const userProfilePicture =
    user?.profilePicture ||
    user?.student?.profilePicture ||
    user?.mentor?.profilePicture ||
    getUserAvatar(user?.email, user?.role);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSearchLayerOpen, setIsSearchLayerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Keyboard shortcut ⌘K / Ctrl+K and Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchLayerOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isSearchLayerOpen) {
        setIsSearchLayerOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSearchLayerOpen]);

  useEffect(() => {
    api
      .get("/notifications", { params: { unread: true } })
      .then((res) => setNotifications(res.data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setProfileOpen(false);
        setSwitchOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Live search debouncing
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(() => {
      setIsSearching(true);
      api
        .get("/students", { params: { search: searchQuery, pageSize: 5 } })
        .then((res) => setSearchResults(res.data.data.items || []))
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false));
    }, 200);
    return () => clearTimeout(t);
  }, [searchQuery]);

  async function markAllRead() {
    await api.put("/notifications/read-all");
    setNotifications([]);
  }

  async function handleSwitchUser(email: string) {
    try {
      await login(email, "Password@123");
      setProfileOpen(false);
      setSwitchOpen(false);
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to switch user", err);
    }
  }

  return (
    <>
      <header className="h-16 sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 flex items-center justify-between px-3 sm:px-4 md:px-5 lg:px-6 transition-all shadow-2xs w-full min-w-0">
        {/* Mobile Brand & Navigation Drawer Trigger (< md) */}
        <div className="flex md:hidden items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all border border-slate-200/80 shadow-2xs shrink-0 cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu size={18} />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2 focus:outline-none group shrink-0" aria-label="MentorHUB Dashboard">
            <MentorHubLogo size="xs" animate={false} showTagline={false} />
          </Link>
        </div>

        {/* Desktop Quick Search Trigger (>= md) */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsSearchLayerOpen(true)}
            className="flex items-center gap-2 pl-3 pr-2.5 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/90 rounded-xl border border-slate-200/80 text-slate-400 hover:text-slate-600 transition-all cursor-pointer shadow-2xs group"
            aria-label="Open search layer"
          >
            <Search size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
            <span className="font-medium text-slate-500">Search students, reg. no, records...</span>
            <kbd className="font-mono text-[10px] text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs ml-1 shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Actions & Utilities */}
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0" ref={ref}>
          {/* Quick Search Button (Mobile view or quick click) */}
          <div className="shrink-0 md:hidden">
            <button
              onClick={() => setIsSearchLayerOpen(true)}
              id="header_search_btn"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-blue-700 hover:border-blue-200/80 border border-transparent transition-all shrink-0 cursor-pointer active:scale-95"
              aria-label="Open Search Layer"
              title="Search students & records (⌘K)"
            >
              <Search size={18} />
            </button>
          </div>

          {/* Quick Switch Demo Persona Dropdown (Desktop screens) */}
          <div className="relative hidden lg:block shrink-0">
            <button
              onClick={() => setSwitchOpen((o) => !o)}
              className="h-9 flex items-center gap-1.5 px-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Fast switch between demo roles"
            >
              <UserCheck size={13} className="text-blue-600" />
              <span className="truncate max-w-[85px]">{user?.role}</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {switchOpen && (
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-24px)] bg-white border border-slate-200 rounded-xl shadow-dropdown py-2 z-50">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900">Switch Persona</p>
                  <p className="text-[11px] text-slate-500">Instant test accounts</p>
                </div>
                <div className="p-1 space-y-1">
                  {DEMO_USERS.map((demo) => {
                    const isCurrent = demo.email.toLowerCase() === user?.email.toLowerCase();
                    return (
                      <button
                        key={demo.email}
                        onClick={() => handleSwitchUser(demo.email)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isCurrent ? "bg-blue-50 font-semibold text-blue-900" : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900">{demo.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${demo.badge}`}>
                              {demo.role}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">{demo.desc}</p>
                        </div>
                        {isCurrent && <CheckCircle2 size={14} className="text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Platform Intro Tour Button */}
          <button
            onClick={openIntro}
            id="header_platform_tour_btn"
            className="hidden xl:inline-flex items-center gap-1.5 h-9 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 text-xs font-semibold transition-all cursor-pointer shadow-2xs shrink-0"
            title="Explore MentorHUB Platform Tour & Architecture"
            aria-label="Platform Tour"
          >
            <Sparkles size={14} className="text-blue-600 shrink-0" />
            <span>Tour</span>
          </button>

          {/* Direct Messaging Link */}
          <Link
            to="/messages"
            id="header_messages_link"
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200 transition-all cursor-pointer shrink-0 active:scale-95"
            aria-label="Direct Messages"
            title="Advisory & Peer Messages"
          >
            <MessageSquare size={18} />
          </Link>

          {/* Notifications Popover */}
          <div className="relative shrink-0">
            <button
              onClick={() => setOpen((o) => !o)}
              id="header_notifications_btn"
              className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200 transition-all cursor-pointer shrink-0 active:scale-95"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
              )}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-24px)] bg-white rounded-xl border border-slate-200 shadow-dropdown py-2 z-50 max-h-[400px] flex flex-col">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-slate-900">Notifications</p>
                    {notifications.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                        {notifications.length}
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button onClick={markAllRead} className="text-xs font-medium text-blue-600 hover:underline cursor-pointer">
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-slate-400">
                      <p className="font-semibold text-slate-700 mb-0.5">All caught up</p>
                      <p>No new unread notifications.</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="px-4 py-2.5 hover:bg-slate-50 transition-colors">
                        <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-slate-100 text-center bg-slate-50/50">
                  <Link
                    to="/notifications"
                    onClick={() => setOpen(false)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View All Notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setProfileOpen((o) => !o)}
              id="header_profile_btn"
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer shrink-0 active:scale-95"
              aria-label="User Profile Menu"
              title={`Profile (${user?.email})`}
            >
              <div className="w-7 h-7 rounded-lg overflow-hidden ring-1 ring-slate-200 shadow-2xs shrink-0 bg-slate-100 flex items-center justify-center">
                <img
                  src={userProfilePicture}
                  alt={user?.student?.fullName || user?.mentor?.fullName || user?.email || "User profile"}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-60 max-w-[calc(100vw-24px)] bg-white rounded-xl border border-slate-200 shadow-dropdown py-1.5 z-50">
                <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 ring-1 ring-slate-200/80 bg-slate-100">
                    <img
                      src={userProfilePicture}
                      alt={user?.email || "User avatar"}
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {user?.student?.fullName || user?.mentor?.fullName || user?.email}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate font-medium">Role: {user?.role}</p>
                  </div>
                </div>

                <div className="p-1">
                  <Link
                    to="/profile"
                    id="header_profile_link"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <User size={14} className="text-blue-600" /> My Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <GraduationCap size={14} className="text-blue-600" /> My Dashboard
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Interactive Global Search Layer Modal */}
      {isSearchLayerOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center p-3 sm:p-4 md:p-6 pt-12 sm:pt-20 animate-in fade-in duration-150"
          onClick={() => setIsSearchLayerOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <Search size={18} className="text-blue-600 shrink-0" />
              <input autoComplete="off"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students, register number, email..."
                className="w-full text-sm bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    setIsSearchLayerOpen(false);
                    navigate(`/students?search=${encodeURIComponent(searchQuery)}`);
                  }
                  if (e.key === "Escape") {
                    setIsSearchLayerOpen(false);
                  }
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/40 cursor-pointer shrink-0"
                  aria-label="Clear query"
                >
                  <X size={15} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsSearchLayerOpen(false)}
                className="px-2 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 bg-slate-200/40 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                aria-label="Close search layer"
              >
                <kbd className="font-mono text-[10px]">ESC</kbd>
                <X size={13} />
              </button>
            </div>

            {/* Results only */}
            <div className="flex-1 overflow-y-auto p-3">
              {searchQuery.trim().length >= 2 ? (
                <div>
                  <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span>Matching Students</span>
                    {isSearching && <span className="text-blue-600 font-normal normal-case animate-pulse">Searching...</span>}
                  </div>

                  {searchResults.length === 0 && !isSearching ? (
                    <div className="py-8 text-center">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-2 text-slate-400">
                        <Search size={18} className="text-slate-300" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700">No students found</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        No students match "{searchQuery}".
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {searchResults.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setIsSearchLayerOpen(false);
                            setSearchQuery("");
                            navigate(`/students/${s.id}`);
                          }}
                          className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition-all border border-transparent hover:border-slate-100 cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {s.fullName[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-950 truncate group-hover:text-blue-600">
                                {s.fullName}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono truncate">
                                {s.rollNumber ? `${s.rollNumber} • ` : ""}Reg: {s.registerNumber}
                                {s.department?.name ? ` · ${s.department.name}` : ""} · Year {s.year} ({s.section})
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {s.latestRisk && <RiskDot level={s.latestRisk.riskLevel} compact />}
                            <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1 opacity-80 group-hover:opacity-100">
                              View <ArrowRight size={12} />
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400 font-medium">
                  Type name, roll number (e.g. 24AIDS01), register number, or email to search directory...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Drawer for Mobile */}
      <MobileNavDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
