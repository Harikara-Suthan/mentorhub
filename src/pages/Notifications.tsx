import { useEffect, useState } from "react";
import {
  Trash2,
  CheckCheck,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Clock,
  Send,
  Plus,
  X,
  Megaphone,
} from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/LoadingState";
import { AppNotification } from "../types";
import { BackButton } from "../components/ui/BackButton";
import { useAuth } from "../context/AuthContext";

export default function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Broadcast modal state for Mentors / HOD
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [recipientType, setRecipientType] = useState<"MY_MENTEES" | "ALL_STUDENTS" | "SECTION">("MY_MENTEES");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState("");

  function load() {
    setLoading(true);
    api
      .get("/notifications")
      .then((res) => setItems(res.data.data))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function markRead(id: string) {
    try {
      await api.put(`/notifications/${id}/read`);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
      );
    } catch {
      load();
    }
  }

  async function markAllRead() {
    try {
      await api.put("/notifications/read-all");
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch {
      load();
    }
  }

  async function remove(id: string) {
    try {
      await api.delete(`/notifications/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      load();
    }
  }

  const unreadCount = items.filter((n) => !n.isRead).length;
  const filteredItems = items.filter((n) => (filter === "unread" ? !n.isRead : true));

  async function handleSendBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    setSendingBroadcast(true);
    setBroadcastSuccess("");
    try {
      const res = await api.post("/notifications/broadcast", {
        recipientType,
        title: broadcastTitle,
        message: broadcastMessage,
        priority: "IMPORTANT",
      });
      setBroadcastSuccess(res.data.message || "Announcement broadcast successfully!");
      setBroadcastTitle("");
      setBroadcastMessage("");
      setTimeout(() => {
        setShowBroadcastModal(false);
        setBroadcastSuccess("");
        load();
      }, 1200);
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to broadcast announcement"));
    } finally {
      setSendingBroadcast(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <BackButton fallback="/dashboard" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Activity & Alerts
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Notification Center
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {(user?.role === "MENTOR" || user?.role === "HOD") && (
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-xl shadow-xs cursor-pointer"
            >
              <Megaphone size={14} /> Send Announcement
            </button>
          )}

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100/70 px-3 py-1.5 rounded-xl border border-blue-200 cursor-pointer"
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600 font-display font-bold text-base">
                <Megaphone size={18} />
                <span>Broadcast Announcement</span>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {broadcastSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 size={16} /> {broadcastSuccess}
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Audience</label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="MY_MENTEES">Assigned Mentees Cohort</option>
                  {user?.role === "HOD" && <option value="ALL_STUDENTS">Entire Department Students</option>}
                  {user?.role === "HOD" && <option value="SECTION">Specific Section / Year</option>}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Subject</label>
                <input autoComplete="off"
                  required
                  placeholder="e.g. Mandatory 1:1 Review Session, Resume Deadline"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notification Message</label>
                <textarea autoComplete="off"
                  required
                  rows={3}
                  placeholder="Details of the announcement, upcoming deadlines, or actionable instructions..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingBroadcast}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>{sendingBroadcast ? "Broadcasting..." : "Send Announcement"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-line pb-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            filter === "all"
              ? "bg-navy text-gold shadow-xs"
              : "text-slate-muted hover:text-navy hover:bg-slate-100"
          }`}
        >
          All Activity ({items.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            filter === "unread"
              ? "bg-navy text-gold shadow-xs"
              : "text-slate-muted hover:text-navy hover:bg-slate-100"
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {loading && !error && <LoadingState label="Loading your notification feed..." />}
      {!loading && filteredItems.length === 0 && (
        <EmptyState
          title="All caught up"
          hint={filter === "unread" ? "You have no unread notifications." : "No activity notifications logged yet."}
          icon={<Bell size={32} className="text-slate-400" />}
        />
      )}

      {/* List */}
      <div className="space-y-3">
        {filteredItems.map((n) => {
          const isWarning =
            n.title.toLowerCase().includes("risk") ||
            n.title.toLowerCase().includes("overdue") ||
            n.title.toLowerCase().includes("urgent");

          return (
            <div
              key={n.id}
              className={`app-card p-4 md:p-5 flex items-start justify-between gap-4 transition-all duration-200 border-l-4 ${
                !n.isRead
                  ? isWarning
                    ? "border-l-rose-500 bg-rose-50/20"
                    : "border-l-brand-600 bg-brand-50/20"
                  : "border-l-transparent"
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isWarning
                      ? "bg-rose-100 text-rose-700"
                      : !n.isRead
                      ? "bg-brand-100 text-brand-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isWarning ? <AlertTriangle size={16} /> : <Info size={16} />}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${!n.isRead ? "font-bold text-navy" : "font-semibold text-slate-700"}`}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-slate-muted leading-relaxed">
                    {n.message}
                  </p>

                  <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                    <Clock size={11} />
                    {new Date(n.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-0.5">
                {!n.isRead && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="text-xs font-bold text-brand-600 hover:text-brand-800 transition-colors px-2 py-1 rounded-lg hover:bg-brand-50 cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => remove(n.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete notification"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

