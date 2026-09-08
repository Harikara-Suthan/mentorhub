import React from "react";
import { ShieldAlert, Sparkles, Clock, CheckCircle2, AlertCircle, KeyRound, UserCheck } from "lucide-react";
import { BackButton } from "../../components/ui/BackButton";

const LOGS = [
  {
    id: "l1",
    action: "USER_AUTHENTICATION_SUCCESS",
    user: "sabarivasan051@gmail.com (HOD)",
    ip: "10.0.4.12",
    time: "Just now",
    status: "SUCCESS",
    detail: "Authenticated via Google Workspace SSO session token",
  },
  {
    id: "l2",
    action: "MENTOR_ASSIGNMENT_UPDATE",
    user: "sabarivasan051@gmail.com (HOD)",
    ip: "10.0.4.12",
    time: "10 minutes ago",
    status: "SUCCESS",
    detail: "Reassigned cohort student 21CS042 to Dr. Priya Raman",
  },
  {
    id: "l3",
    action: "RISK_ASSESSMENT_EVALUATION",
    user: "SYSTEM_AGENT (AI Analytics)",
    ip: "127.0.0.1",
    time: "25 minutes ago",
    status: "SUCCESS",
    detail: "Recalculated risk score for 25 department students",
  },
  {
    id: "l4",
    action: "MEETING_LOGGED",
    user: "priya.raman@college.edu (MENTOR)",
    ip: "10.0.3.44",
    time: "1 hour ago",
    status: "SUCCESS",
    detail: "Logged 1-on-1 advisory session with Ananya Sen",
  },
  {
    id: "l5",
    action: "SECURITY_TOKEN_ROTATION",
    user: "SYSTEM_AUTH",
    ip: "127.0.0.1",
    time: "2 hours ago",
    status: "SUCCESS",
    detail: "Rotated session cookie signatures",
  },
];

export default function AuditLogs() {
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
              <span className="text-xs text-blue-800/80 font-medium">Compliance & Security Ledger</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
              Institutional Audit & Event Logs
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              Cryptographically verified audit trail tracking authentication, role escalations, mentor allocations, and records tampering.
            </p>
          </div>
        </div>
      </div>

      <div className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold">
                <th className="py-3 px-4">Event Action</th>
                <th className="py-3 px-4">Actor / Origin</th>
                <th className="py-3 px-4">Detail</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    <span className="inline-flex items-center gap-1 text-[11px] text-blue-700">
                      <KeyRound size={12} /> {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">{log.user}</td>
                  <td className="py-3 px-4 text-slate-600">{log.detail}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{log.ip}</td>
                  <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
