import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Send,
  Sliders,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  Eye,
  Settings,
  PhoneOff,
  UserX,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { api, apiErrorMessage } from "../../api/client";
import {
  WhatsAppNotificationRecord,
  WhatsAppStatusResponse,
  WhatsAppRuleConfig,
} from "../../types";

export default function WhatsAppAlerts() {
  const [statusData, setStatusData] = useState<WhatsAppStatusResponse | null>(null);
  const [notifications, setNotifications] = useState<WhatsAppNotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [queueProcessing, setQueueProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEventType, setFilterEventType] = useState<string>("ALL");
  const [filterRecipientType, setFilterRecipientType] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Modals
  const [selectedNotification, setSelectedNotification] = useState<WhatsAppNotificationRecord | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  // Rule Config Form
  const [configForm, setConfigForm] = useState<Partial<WhatsAppRuleConfig>>({});
  const [savingConfig, setSavingConfig] = useState(false);

  // Test Message Form
  const [testPhone, setTestPhone] = useState("");
  const [testTemplate, setTestTemplate] = useState("attendance_risk");
  const [testStudentName, setTestStudentName] = useState("Hari Kumar");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.get("/api/whatsapp/status");
      if (res.data.success) {
        setStatusData(res.data);
        setConfigForm(res.data.ruleConfig);
      }
    } catch (err: any) {
      console.error("Failed to load WhatsApp status:", err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page,
        limit: 15,
      };
      if (filterEventType !== "ALL") params.eventType = filterEventType;
      if (filterRecipientType !== "ALL") params.recipientType = filterRecipientType;
      if (filterStatus !== "ALL") params.status = filterStatus;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get("/api/whatsapp/notifications", { params });
      if (res.data.success) {
        setNotifications(res.data.data);
        setTotalPages(res.data.pagination.totalPages || 1);
        setTotalCount(res.data.pagination.total || 0);
      }
    } catch (err: any) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [page, filterEventType, filterRecipientType, filterStatus, searchQuery]);

  useEffect(() => {
    fetchStatus();
    fetchNotifications();
  }, [fetchStatus, fetchNotifications]);

  const handleEvaluateRules = async () => {
    try {
      setEvaluating(true);
      setActionMessage({ text: "Evaluating automatic alert condition rules against PostgreSQL database...", type: "info" });
      const res = await api.post("/api/whatsapp/rules/evaluate", {});
      if (res.data.success) {
        const s = res.data.summary;
        setActionMessage({
          text: `Rule evaluation complete: ${s.totalGenerated} alert(s) evaluated (${s.attendanceAlertsGenerated} attendance, ${s.feeAlertsGenerated} fee, ${s.meetingRemindersGenerated} meetings, ${s.arrearAlertsGenerated} arrears, ${s.actionAlertsGenerated} tasks). ${s.totalSkippedDueToDedup} skipped as already sent in cooldown window.`,
          type: "success",
        });
        await fetchStatus();
        await fetchNotifications();
      }
    } catch (err: any) {
      setActionMessage({ text: `Evaluation error: ${err.response?.data?.message || err.message}`, type: "error" });
    } finally {
      setEvaluating(false);
    }
  };

  const handleProcessQueue = async () => {
    try {
      setQueueProcessing(true);
      const res = await api.post("/api/whatsapp/queue/process");
      if (res.data.success) {
        setActionMessage({
          text: `Queue worker sweep complete: ${res.data.result.processed} processed (${res.data.result.sent} sent, ${res.data.result.failed} failed/retrying).`,
          type: "success",
        });
        await fetchStatus();
        await fetchNotifications();
      }
    } catch (err: any) {
      setActionMessage({ text: `Queue error: ${err.message}`, type: "error" });
    } finally {
      setQueueProcessing(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingConfig(true);
      const res = await api.put("/api/whatsapp/rules/config", configForm);
      if (res.data.success) {
        setActionMessage({ text: "WhatsApp automatic notification rule thresholds updated.", type: "success" });
        setShowConfigModal(false);
        fetchStatus();
      }
    } catch (err: any) {
      setActionMessage({ text: `Failed to update configuration: ${err.message}`, type: "error" });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSendingTest(true);
      setTestResult(null);

      let vars: Record<string, any> = {};
      if (testTemplate === "attendance_risk") {
        vars = {
          student_name: testStudentName || "Hari Kumar",
          attendance_percentage: 68.5,
          department_name: "Computer Science & Engineering",
          mentor_name: "Dr. Priya Raman",
        };
      } else if (testTemplate === "fee_due" || testTemplate === "fee_overdue") {
        vars = {
          recipient_salutation: "Student",
          student_name: testStudentName || "Hari Kumar",
          fee_category: "Tuition & Development Fee",
          amount_due: "75,000",
          due_date: "30 Sept 2026",
        };
      } else if (testTemplate === "mentor_meeting_reminder") {
        vars = {
          faculty_name: "Dr. Priya Raman",
          meeting_time: "10:30 AM",
          meeting_type: "Individual Advisory",
          mentee_info: `${testStudentName || "Hari Kumar"} (71762310101)`,
        };
      }

      const res = await api.post("/api/whatsapp/test-send", {
        toPhone: testPhone,
        templateName: testTemplate,
        templateVariables: vars,
      });

      setTestResult(res.data);
      fetchStatus();
      fetchNotifications();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || err.message || "Failed to dispatch test message.",
      });
    } finally {
      setSendingTest(false);
    }
  };

  const isConfigured = statusData?.config?.isConfigured ?? false;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <MessageSquare size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Automatic WhatsApp Notification Engine
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Real Meta Cloud API
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Backend-driven alert system evaluating PostgreSQL records independent of browser tabs.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowTestModal(true)}
            id="whatsapp-test-btn"
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Send size={14} />
            Test Dispatch
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            id="whatsapp-config-btn"
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Sliders size={14} />
            Rule Thresholds
          </button>

          <button
            onClick={handleEvaluateRules}
            disabled={evaluating}
            id="whatsapp-evaluate-btn"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={evaluating ? "animate-spin" : ""} />
            {evaluating ? "Evaluating..." : "Evaluate DB Rules Now"}
          </button>
        </div>
      </div>

      {/* Action Notification Message Banner */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-xs font-medium ${
            actionMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : actionMessage.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-900"
              : "bg-blue-50 border-blue-200 text-blue-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionMessage.type === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : actionMessage.type === "error" ? (
              <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            ) : (
              <Info size={16} className="text-blue-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Official WhatsApp Cloud API Connection Diagnostic Card */}
      <div className={`p-5 rounded-2xl border ${isConfigured ? "bg-emerald-50/40 border-emerald-200" : "bg-slate-50 border-slate-300"}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isConfigured
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                  : "bg-slate-200 text-slate-700 border border-slate-300"
              }`}
            >
              {isConfigured ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {isConfigured
                    ? "Meta WhatsApp Business Cloud API Active"
                    : "WhatsApp Integration: NOT CONFIGURED"}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isConfigured
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-slate-200 text-slate-800 border-slate-300"
                  }`}
                >
                  {isConfigured ? "OFFICIAL API CONNECTED" : "NOT CONFIGURED"}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {isConfigured ? (
                  <span>
                    Phone Number ID: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200">{statusData?.config?.phoneNumberId}</code> | API Version: <code className="font-mono">{statusData?.config?.apiVersion}</code> | Real delivery enabled.
                  </span>
                ) : (
                  <span>
                    Missing WhatsApp credentials will <strong>NOT block MentorHUB startup</strong>. All other MentorHUB modules (Attendance, Mentoring, Meetings, Issues, Actions, Analytics, Reports, AI Risk) are <strong>WORKING normally</strong>. Fake WhatsApp sent/delivered statuses are strictly prohibited.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleProcessQueue}
              disabled={queueProcessing}
              id="whatsapp-queue-btn"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={12} className={queueProcessing ? "animate-spin" : ""} />
              {queueProcessing ? "Processing..." : "Sweep Queue"}
            </button>
            <button
              onClick={() => {
                fetchStatus();
                fetchNotifications();
              }}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Refresh status"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Evaluated</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{statusData?.metrics?.total ?? 0}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">PostgreSQL event triggers</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Sent / Delivered</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {(statusData?.metrics?.sent ?? 0) + (statusData?.metrics?.delivered ?? 0) + (statusData?.metrics?.read ?? 0)}
          </p>
          <p className="text-[10px] text-emerald-600 mt-0.5">
            {statusData?.metrics?.delivered ?? 0} confirmed delivered
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Pending Queue</p>
          <p className="text-2xl font-black text-blue-700 mt-1">{statusData?.metrics?.pending ?? 0}</p>
          <p className="text-[10px] text-blue-500 mt-0.5">Scheduled worker queue</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Failed / Notice</p>
          <p className="text-2xl font-black text-rose-700 mt-1">{statusData?.metrics?.failed ?? 0}</p>
          <p className="text-[10px] text-rose-500 mt-0.5">Recorded with exact reason</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Invalid Recipient</p>
          <p className="text-2xl font-black text-amber-700 mt-1">
            {statusData?.metrics?.recipientUnavailable ?? 0}
          </p>
          <p className="text-[10px] text-amber-600 mt-0.5">Missing phone / invalid E.164</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Active Rules</p>
          <p className="text-2xl font-black text-indigo-700 mt-1">5</p>
          <p className="text-[10px] text-indigo-500 mt-0.5">Attendance, Fee, Meet, Arrear, Task</p>
        </div>
      </div>

      {/* Audit Log Table & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header with Search and Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">Automatic Notification Audit Logs</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
              {totalCount} record{totalCount === 1 ? "" : "s"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search recipient or text..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48"
              />
            </div>

            {/* Event Type Filter */}
            <select
              value={filterEventType}
              onChange={(e) => {
                setFilterEventType(e.target.value);
                setPage(1);
              }}
              className="py-1.5 px-2.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Event Types</option>
              <option value="ATTENDANCE_RISK">Attendance Risk (&lt;75%)</option>
              <option value="FEE_DUE">Fee Due Alert</option>
              <option value="FEE_OVERDUE">Fee Overdue Alert</option>
              <option value="FACULTY_MEETING_REMINDER">Faculty Meeting Reminder</option>
              <option value="ARREAR_WARNING">Arrear Warning</option>
              <option value="ACTION_ITEM_OVERDUE">Overdue Action Task</option>
              <option value="MANUAL_ALERT">Test / Manual Alert</option>
            </select>

            {/* Recipient Filter */}
            <select
              value={filterRecipientType}
              onChange={(e) => {
                setFilterRecipientType(e.target.value);
                setPage(1);
              }}
              className="py-1.5 px-2.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Recipients</option>
              <option value="STUDENT">Students</option>
              <option value="PARENT">Parents</option>
              <option value="FACULTY">Faculty / Mentors</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="py-1.5 px-2.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="NOT_CONFIGURED">Not Configured</option>
              <option value="SENT">Sent</option>
              <option value="DELIVERED">Delivered</option>
              <option value="READ">Read</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="RECIPIENT_UNAVAILABLE">Recipient Unavailable</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <RefreshCw size={24} className="animate-spin text-emerald-500" />
              <p className="text-xs">Loading notification records...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <MessageSquare size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold">No notifications match the current filters</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Click "Evaluate DB Rules Now" to test condition checks against real database records.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Event Trigger</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Phone (E.164)</th>
                  <th className="py-3 px-4">Status & Reason</th>
                  <th className="py-3 px-4">Message Preview</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notifications.map((n) => {
                  let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
                  let eventLabel = n.eventType.replace(/_/g, " ");

                  if (n.eventType === "ATTENDANCE_RISK") badgeColor = "bg-rose-50 text-rose-700 border-rose-200";
                  else if (n.eventType === "FEE_OVERDUE") badgeColor = "bg-red-50 text-red-700 border-red-200";
                  else if (n.eventType === "FEE_DUE") badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
                  else if (n.eventType === "FACULTY_MEETING_REMINDER") badgeColor = "bg-sky-50 text-sky-700 border-sky-200";
                  else if (n.eventType === "ARREAR_WARNING") badgeColor = "bg-purple-50 text-purple-700 border-purple-200";
                  else if (n.eventType === "ACTION_ITEM_OVERDUE") badgeColor = "bg-orange-50 text-orange-700 border-orange-200";

                  let statusBadge = "bg-slate-100 text-slate-700 border-slate-200";
                  if (n.status === "SENT" || n.status === "DELIVERED" || n.status === "READ") {
                    statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  } else if (n.status === "FAILED") {
                    statusBadge = "bg-rose-50 text-rose-700 border-rose-200";
                  } else if (n.status === "PENDING" || n.status === "PROCESSING") {
                    statusBadge = "bg-blue-50 text-blue-700 border-blue-200";
                  } else if (n.status === "RECIPIENT_UNAVAILABLE") {
                    statusBadge = "bg-amber-50 text-amber-800 border-amber-200";
                  } else if (n.status === "NOT_CONFIGURED") {
                    statusBadge = "bg-slate-200 text-slate-800 border-slate-300";
                  }

                  return (
                    <tr key={n.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Event Type */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeColor}`}>
                          {eventLabel}
                        </span>
                      </td>

                      {/* Recipient */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{n.recipientName}</div>
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {n.recipientType}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-slate-700">
                          {n.recipientPhone}
                        </span>
                      </td>

                      {/* Status & Failure Reason */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                          {n.status === "SENT" || n.status === "DELIVERED" || n.status === "READ" ? (
                            <CheckCircle2 size={10} />
                          ) : n.status === "FAILED" ? (
                            <XCircle size={10} />
                          ) : n.status === "PENDING" ? (
                            <Clock size={10} />
                          ) : (
                            <PhoneOff size={10} />
                          )}
                          {n.status}
                        </span>
                        {n.failureReason && (
                          <p className="text-[10px] text-rose-600 font-medium line-clamp-1 max-w-xs mt-0.5" title={n.failureReason}>
                            {n.failureReason}
                          </p>
                        )}
                        {n.providerMessageId && (
                          <p className="text-[9px] font-mono text-emerald-700 mt-0.5">
                            ID: {n.providerMessageId}
                          </p>
                        )}
                      </td>

                      {/* Message Preview */}
                      <td className="py-3 px-4 max-w-xs">
                        <p className="line-clamp-2 text-[11px] text-slate-600 leading-snug">
                          {n.messageBody}
                        </p>
                      </td>

                      {/* Created */}
                      <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedNotification(n)}
                          className="px-2 py-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded border border-slate-200 transition-colors cursor-pointer"
                          title="View Full Details"
                        >
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing Page <span className="font-semibold">{page}</span> of{" "}
            <span className="font-semibold">{totalPages}</span> ({totalCount} items)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL: Rule Thresholds Configuration
          ========================================================================= */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sliders size={18} className="text-emerald-600" />
                <h3 className="font-bold text-slate-900">Automatic Notification Rule Thresholds</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Attendance Risk Alert Threshold (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="50"
                  max="95"
                  value={configForm.attendanceRiskThreshold ?? 75}
                  onChange={(e) =>
                    setConfigForm((prev) => ({ ...prev, attendanceRiskThreshold: parseFloat(e.target.value) }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Trigger automatic WhatsApp alert to students when attendance drops below this percentage.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fee Due Alert Notice Horizon (Days Before Due Date)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={configForm.feeDueAlertDaysBefore ?? 7}
                  onChange={(e) =>
                    setConfigForm((prev) => ({ ...prev, feeDueAlertDaysBefore: parseInt(e.target.value) }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Notify student and parent N days before an unpaid fee is due.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Faculty Meeting Reminder Window (Hours Before)
                </label>
                <input
                  type="number"
                  min="1"
                  max="72"
                  value={configForm.meetingReminderHoursBefore ?? 24}
                  onChange={(e) =>
                    setConfigForm((prev) => ({ ...prev, meetingReminderHoursBefore: parseInt(e.target.value) }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <p className="font-bold text-slate-800">Rule Enablement Toggles</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configForm.enableAttendanceAlerts ?? true}
                    onChange={(e) => setConfigForm((prev) => ({ ...prev, enableAttendanceAlerts: e.target.checked }))}
                    className="rounded text-emerald-600"
                  />
                  <span>Enable Student Attendance Risk Alerts</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configForm.enableFeeAlerts ?? true}
                    onChange={(e) => setConfigForm((prev) => ({ ...prev, enableFeeAlerts: e.target.checked }))}
                    className="rounded text-emerald-600"
                  />
                  <span>Enable Student & Parent Fee Due / Overdue Alerts</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configForm.enableMeetingReminders ?? true}
                    onChange={(e) => setConfigForm((prev) => ({ ...prev, enableMeetingReminders: e.target.checked }))}
                    className="rounded text-emerald-600"
                  />
                  <span>Enable Faculty Advisory Meeting Reminders</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configForm.enableArrearAlerts ?? true}
                    onChange={(e) => setConfigForm((prev) => ({ ...prev, enableArrearAlerts: e.target.checked }))}
                    className="rounded text-emerald-600"
                  />
                  <span>Enable Multi-Arrear Warning Alerts</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer disabled:opacity-50"
                >
                  {savingConfig ? "Saving..." : "Save Thresholds"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: Test Message Dispatch
          ========================================================================= */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Send size={18} className="text-emerald-600" />
                <h3 className="font-bold text-slate-900">Dispatch Test WhatsApp Notification</h3>
              </div>
              <button
                onClick={() => {
                  setShowTestModal(false);
                  setTestResult(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendTest} className="p-5 space-y-4 text-xs">
              {!isConfigured && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-700">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                    WhatsApp Integration: NOT CONFIGURED
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                    Live dispatch requires official Meta credentials (<code>WHATSAPP_PHONE_NUMBER_ID</code> and <code>WHATSAPP_ACCESS_TOKEN</code>). Missing credentials do not block MentorHUB; all other modules are active. Fake statuses are never generated.
                  </p>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Recipient Phone Number (E.164 with Country Code)
                </label>
                <input
                  type="text"
                  placeholder="+919876543210"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Must be a real phone registered on WhatsApp. Include country code (+91 for India).
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Template
                </label>
                <select
                  value={testTemplate}
                  onChange={(e) => setTestTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="attendance_risk">Attendance Risk Alert</option>
                  <option value="fee_due">Fee Due Notice</option>
                  <option value="fee_overdue">Fee Overdue Notice</option>
                  <option value="mentor_meeting_reminder">Faculty Meeting Reminder</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Student Name (Dynamic Variable)
                </label>
                <input
                  type="text"
                  value={testStudentName}
                  onChange={(e) => setTestStudentName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border ${
                    testResult.success
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-rose-50 border-rose-200 text-rose-900"
                  }`}
                >
                  <p className="font-bold flex items-center gap-1.5">
                    {testResult.success ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {testResult.success ? "Dispatched Successfully" : "Dispatch Failed / Notice"}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed">{testResult.message}</p>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowTestModal(false);
                    setTestResult(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={sendingTest}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send size={13} />
                  {sendingTest ? "Sending..." : "Dispatch Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: Notification Detail Inspection
          ========================================================================= */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-emerald-600" />
                <h3 className="font-bold text-slate-900">WhatsApp Notification Record</h3>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="text-slate-400 hover:text-slate-600 font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Event</p>
                  <p className="font-semibold text-slate-900">{selectedNotification.eventType}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Recipient Type</p>
                  <p className="font-semibold text-slate-900">{selectedNotification.recipientType}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Recipient Name</p>
                  <p className="font-semibold text-slate-900">{selectedNotification.recipientName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</p>
                  <p className="font-mono text-slate-900">{selectedNotification.recipientPhone}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Full Rendered WhatsApp Message Body
                </p>
                <div className="bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-xl font-sans whitespace-pre-line text-slate-800 text-xs leading-relaxed">
                  {selectedNotification.messageBody}
                </div>
              </div>

              {selectedNotification.failureReason && (
                <div>
                  <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">
                    Failure / Diagnostic Reason
                  </p>
                  <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-rose-800 text-[11px]">
                    {selectedNotification.failureReason}
                  </div>
                </div>
              )}

              <div className="text-[11px] text-slate-400 pt-2 flex justify-between">
                <span>Created: {new Date(selectedNotification.createdAt).toLocaleString()}</span>
                <span>Attempts: {selectedNotification.attemptCount} / {selectedNotification.maxAttempts}</span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
