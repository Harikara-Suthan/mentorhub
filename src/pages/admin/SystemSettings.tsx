import React, { useState, useEffect } from "react";
import {
  Settings,
  Sparkles,
  Save,
  CheckCircle2,
  Bell,
  Shield,
  Sliders,
  AlertCircle,
  MessageSquare,
  Clock,
  RefreshCw,
  Building,
  Check,
  AlertTriangle
} from "lucide-react";
import { api, apiErrorMessage } from "../../api/client";
import { LoadingState, ErrorState } from "../../components/ui/LoadingState";
import { BackButton } from "../../components/ui/BackButton";

export default function SystemSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  // Institutional Info & WhatsApp Status
  const [institution, setInstitution] = useState<any>(null);
  const [whatsAppGateway, setWhatsAppGateway] = useState<any>(null);

  // Form State
  const [minAttendance, setMinAttendance] = useState("75");
  const [feeDueDays, setFeeDueDays] = useState("7");
  const [meetingReminderHours, setMeetingReminderHours] = useState("24");
  const [enableAttendanceAlerts, setEnableAttendanceAlerts] = useState(true);
  const [enableFeeAlerts, setEnableFeeAlerts] = useState(true);
  const [enableMeetingReminders, setEnableMeetingReminders] = useState(true);
  const [enableArrearAlerts, setEnableArrearAlerts] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState("21:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("08:00");

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/system-settings");
      const data = res.data.data;
      setInstitution(data.institution);
      setWhatsAppGateway(data.whatsAppGateway);

      const rules = data.alertRules || {};
      setMinAttendance(String(rules.attendanceRiskThreshold ?? 75));
      setFeeDueDays(String(rules.feeDueAlertDaysBefore ?? 7));
      setMeetingReminderHours(String(rules.meetingReminderHoursBefore ?? 24));
      setEnableAttendanceAlerts(Boolean(rules.enableAttendanceAlerts ?? true));
      setEnableFeeAlerts(Boolean(rules.enableFeeAlerts ?? true));
      setEnableMeetingReminders(Boolean(rules.enableMeetingReminders ?? true));
      setEnableArrearAlerts(Boolean(rules.enableArrearAlerts ?? true));
      setQuietHoursStart(rules.quietHoursStart || "21:00");
      setQuietHoursEnd(rules.quietHoursEnd || "08:00");
      setError("");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      await api.put("/admin/system-settings", {
        attendanceRiskThreshold: Number(minAttendance),
        feeDueAlertDaysBefore: Number(feeDueDays),
        meetingReminderHoursBefore: Number(meetingReminderHours),
        enableAttendanceAlerts,
        enableFeeAlerts,
        enableMeetingReminders,
        enableArrearAlerts,
        quietHoursStart,
        quietHoursEnd,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setSaveError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading institutional parameters and rule engine..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 md:p-7 rounded-2xl bg-sky-50 text-blue-950 border border-blue-100/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <BackButton fallback="/dashboard" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles size={11} className="text-blue-500" /> Admin Core
              </span>
              <span className="text-xs text-blue-800/80 font-medium">Institutional Rules & Parameters</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
              System Settings & Rules Engine
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              Global parameters for attendance thresholds, risk trigger heuristics, notification gateways, and semester timelines.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => loadSettings()}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="p-6">
          <ErrorState error={error} onRetry={() => loadSettings()} />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {saveError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Institutional Info Header Card */}
          {institution && (
            <div className="app-card p-5 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <Building size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">{institution.name}</h2>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                    <span>Code: {institution.code}</span>
                    <span>•</span>
                    <span>Academic Year: {institution.academicYear}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">{institution.naacStatus}</span>
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-semibold bg-blue-100/80 text-blue-800 self-start sm:self-center">
                Active Term: {institution.currentSemester}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Regulatory Thresholds */}
            <div className="app-card p-5 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                <Sliders size={16} className="text-blue-600" /> Regulatory Thresholds
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mandatory Minimum Attendance (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    step="0.5"
                    required
                    value={minAttendance}
                    onChange={(e) => setMinAttendance(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Students below this threshold are flagged as Defaulters.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fee Due Warning Window (Days in Advance)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={feeDueDays}
                    onChange={(e) => setFeeDueDays(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Days before invoice due date to dispatch reminder alert.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Meeting Reminder Advance (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="72"
                    required
                    value={meetingReminderHours}
                    onChange={(e) => setMeetingReminderHours(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Lead time for automated WhatsApp advisory reminders.</p>
                </div>
              </div>
            </div>

            {/* Automation & Notification Gateways */}
            <div className="app-card p-5 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                <Bell size={16} className="text-blue-600" /> Notifications & Rule Automation
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer hover:bg-slate-100/60 transition-colors">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Attendance Defaulter Alerts</p>
                    <p className="text-[11px] text-slate-500">Notify student/parent when attendance drops below threshold</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableAttendanceAlerts}
                    onChange={(e) => setEnableAttendanceAlerts(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer hover:bg-slate-100/60 transition-colors">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Tuition Fee Due Reminders</p>
                    <p className="text-[11px] text-slate-500">Automated payment reminders for pending fee installments</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableFeeAlerts}
                    onChange={(e) => setEnableFeeAlerts(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer hover:bg-slate-100/60 transition-colors">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Advisory Meeting Reminders</p>
                    <p className="text-[11px] text-slate-500">Scheduled session alerts sent to mentees and mentors</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableMeetingReminders}
                    onChange={(e) => setEnableMeetingReminders(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer hover:bg-slate-100/60 transition-colors">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Arrear & Risk Alerts</p>
                    <p className="text-[11px] text-slate-500">Escalate critical risk academic notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableArrearAlerts}
                    onChange={(e) => setEnableArrearAlerts(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                  />
                </label>
              </div>

              {/* Quiet Hours */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Clock size={13} className="text-blue-600" /> Quiet Hours Window (No Non-Urgent Outbound Messages)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium">Start Time</span>
                    <input
                      type="time"
                      value={quietHoursStart}
                      onChange={(e) => setQuietHoursStart(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-600 text-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium">End Time</span>
                    <input
                      type="time"
                      value={quietHoursEnd}
                      onChange={(e) => setQuietHoursEnd(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-600 text-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Meta WhatsApp Integration Status Card */}
          <div className="app-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2">
              <MessageSquare size={16} className="text-emerald-600" /> Meta WhatsApp Business Platform Gateway Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] font-semibold uppercase">Gateway Status</span>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${whatsAppGateway?.configured ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                  <span className="font-bold text-slate-900 font-mono">
                    {whatsAppGateway?.configured ? "CONFIGURED (LIVE)" : "NOT CONFIGURED"}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] font-semibold uppercase">API Version</span>
                <div className="mt-1 font-mono font-medium text-slate-800">
                  {whatsAppGateway?.apiVersion || "v21.0"}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] font-semibold uppercase">Phone Number ID</span>
                <div className="mt-1 font-mono text-slate-700">
                  {whatsAppGateway?.phoneNumberId ? `${whatsAppGateway.phoneNumberId.slice(0, 5)}...` : "None configured"}
                </div>
              </div>
            </div>

            {!whatsAppGateway?.configured && (
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                <AlertTriangle size={15} className="text-blue-600 shrink-0 mt-0.5" />
                <p>
                  MentorHUB operates normally with WhatsApp in <strong>NOT CONFIGURED</strong> mode. In this mode, no fake sent/delivered statuses are recorded. Once official Meta WhatsApp Business Platform credentials are provided, automatic message delivery will engage.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {saved && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
                <CheckCircle2 size={14} /> Settings Saved Successfully in Database
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Save size={14} /> {saving ? "Saving Changes..." : "Save Configuration"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
