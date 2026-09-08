import React from "react";
import { Shield, Sparkles, Check, X } from "lucide-react";
import { BackButton } from "../../components/ui/BackButton";

const ROLES = [
  {
    role: "HOD",
    title: "Head of Department",
    desc: "Departmental executive with oversight of faculty advisors, cohort analytics, risk escalations, and mentor allocations.",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    perms: [
      { name: "View All Department Students", allowed: true },
      { name: "Assign Faculty Mentors", allowed: true },
      { name: "Inspect Department Analytics & Reports", allowed: true },
      { name: "Resolve Escalated Risk Alerts", allowed: true },
      { name: "Create Institutional Users", allowed: false },
      { name: "System Wide Config", allowed: false },
    ],
  },
  {
    role: "MENTOR",
    title: "Faculty Advisor / Mentor",
    desc: "Direct academic and career guide assigned to a cohort of 15–20 student mentees.",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    perms: [
      { name: "View Assigned Mentees", allowed: true },
      { name: "Schedule & Log Advisory Meetings", allowed: true },
      { name: "Create Mentoring Action Items", allowed: true },
      { name: "AI Advisory Notes Synthesis", allowed: true },
      { name: "Reassign Mentees to Others", allowed: false },
      { name: "System Wide Config", allowed: false },
    ],
  },
  {
    role: "STUDENT",
    title: "Student Mentee",
    desc: "Learner accessing personalized academic roadmap, attendance telemetry, and direct advisor connection.",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    perms: [
      { name: "View Personal Academic Status", allowed: true },
      { name: "View Assigned Faculty Advisor", allowed: true },
      { name: "Schedule Advisory Sessions", allowed: true },
      { name: "Complete Mentoring Tasks", allowed: true },
      { name: "View Peer Roster Data", allowed: false },
      { name: "System Wide Config", allowed: false },
    ],
  },
  {
    role: "ADMIN",
    title: "System Administrator",
    desc: "Institution-wide governance of system accounts, department structures, security logs, and integrations.",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    perms: [
      { name: "Manage All System Users", allowed: true },
      { name: "Configure Departments & Programs", allowed: true },
      { name: "Inspect Audit Logs & Security", allowed: true },
      { name: "Institutional Settings & Integrations", allowed: true },
      { name: "Access All Role Portals", allowed: true },
      { name: "Export Compliance Archives", allowed: true },
    ],
  },
];

export default function RolesPermissions() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-6 md:p-7 rounded-2xl bg-sky-50 text-blue-950 border border-blue-100/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <BackButton fallback="/dashboard" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles size={11} className="text-blue-500" /> Security Core
              </span>
              <span className="text-xs text-blue-800/80 font-medium">Role-Based Access Control (RBAC)</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
              Roles & Permissions Matrix
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              Institutional security perimeter specifying privilege boundaries, data isolation, and operational authorities across roles.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ROLES.map((r) => (
          <div key={r.role} className="app-card p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${r.badge}`}>
                {r.role}
              </span>
              <span className="text-xs text-slate-500 font-medium">Standard Role</span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-950">{r.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{r.desc}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Access Rights</p>
              {r.perms.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-700">{p.name}</span>
                  {p.allowed ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <Check size={13} /> Granted
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                      <X size={13} /> Restricted
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
