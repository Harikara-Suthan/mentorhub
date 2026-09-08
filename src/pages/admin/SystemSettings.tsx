import React, { useState } from "react";
import { Settings, Sparkles, Save, CheckCircle2, Bell, Shield, Database, Sliders } from "lucide-react";
import { BackButton } from "../../components/ui/BackButton";

export default function SystemSettings() {
  const [saved, setSaved] = useState(false);
  const [minAttendance, setMinAttendance] = useState("75");
  const [arrearThreshold, setArrearThreshold] = useState("3");
  const [autoRiskEval, setAutoRiskEval] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-6 md:p-7 rounded-2xl bg-sky-50 text-blue-950 border border-blue-100/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <BackButton fallback="/dashboard" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles size={11} className="text-blue-500" /> Admin Core
              </span>
              <span className="text-xs text-blue-800/80 font-medium">Institution Configuration</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
              System Settings & Rules
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              Global parameters for attendance thresholds, risk trigger heuristics, notification gateways, and semester timelines.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Regulatory Thresholds */}
          <div className="app-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2">
              <Sliders size={16} className="text-blue-600" /> Regulatory Thresholds
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mandatory Minimum Attendance (%)
                </label>
                <input autoComplete="off"
                  type="number"
                  value={minAttendance}
                  onChange={(e) => setMinAttendance(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                />
                <p className="text-[11px] text-slate-400 mt-1">Students below this threshold are flagged as Defaulters.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Critical Arrear Trigger Count
                </label>
                <input autoComplete="off"
                  type="number"
                  value={arrearThreshold}
                  onChange={(e) => setArrearThreshold(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                />
                <p className="text-[11px] text-slate-400 mt-1">Triggers emergency escalation to HOD when exceeded.</p>
              </div>
            </div>
          </div>

          {/* Automation & Gateways */}
          <div className="app-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2">
              <Bell size={16} className="text-blue-600" /> Notifications & AI Engine
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-slate-900">Auto Early Warning Evaluation</p>
                  <p className="text-[11px] text-slate-500">Run AI risk synthesis on weekly attendance & marks</p>
                </div>
                <input autoComplete="off"
                  type="checkbox"
                  checked={autoRiskEval}
                  onChange={(e) => setAutoRiskEval(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-slate-900">WhatsApp Defaulter Alerts</p>
                  <p className="text-[11px] text-slate-500">Notify parents when attendance falls below 75%</p>
                </div>
                <input autoComplete="off"
                  type="checkbox"
                  checked={whatsappEnabled}
                  onChange={(e) => setWhatsappEnabled(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer">
                <div>
                  <p className="text-xs font-semibold text-slate-900">Weekly HOD Summary Digest</p>
                  <p className="text-[11px] text-slate-500">Email weekly briefing of unresolved issues and risk scores</p>
                </div>
                <input autoComplete="off"
                  type="checkbox"
                  checked={emailDigest}
                  onChange={(e) => setEmailDigest(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
              <CheckCircle2 size={14} /> Settings Saved Successfully
            </span>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Save size={14} /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
