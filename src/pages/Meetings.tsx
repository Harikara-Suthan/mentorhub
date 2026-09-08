import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  X,
  Sparkles,
  Calendar,
  User,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  MessageSquare,
  AlertTriangle,
  Lightbulb,
  FileText,
} from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/LoadingState";
import { Badge } from "../components/ui/Badge";
import { Meeting, Student } from "../types";
import { useAuth } from "../context/AuthContext";
import { BackButton } from "../components/ui/BackButton";

export default function Meetings() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  function load() {
    setLoading(true);
    api
      .get("/meetings")
      .then((res) => setMeetings(res.data.data.items))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const filteredMeetings = meetings.filter((m) => {
    if (typeFilter !== "ALL" && m.meetingType !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = m.student?.fullName?.toLowerCase().includes(q);
      const matchReg = m.student?.registerNumber?.toLowerCase().includes(q);
      const matchRoll = m.student?.rollNumber?.toLowerCase().includes(q);
      const matchSummary = (m.aiSummary || m.discussionSummary || "").toLowerCase().includes(q);
      if (!matchName && !matchReg && !matchRoll && !matchSummary) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <BackButton fallback="/dashboard" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Advisory Sessions</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {meetings.length} Sessions
            </span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Mentoring Sessions Log
          </h1>
        </div>

        {user?.role === "MENTOR" && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <Plus size={15} /> Record 1:1 Session
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="app-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/90">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-muted" />
          <input autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meetings by student or discussion..."
            className="w-full pl-10 pr-3.5 py-2 text-xs md:text-sm bg-surface rounded-xl border border-line focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-navy"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs border border-line rounded-xl px-3 py-2 bg-surface text-navy font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="ALL">All Session Types</option>
            <option value="INDIVIDUAL">Individual (1:1)</option>
            <option value="GROUP">Group Advisory</option>
          </select>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {loading && !error && <LoadingState label="Loading recorded mentoring sessions..." />}
      {!loading && filteredMeetings.length === 0 && (
        <EmptyState
          title="No meetings found"
          hint="Record your first mentoring session to generate AI summaries and action commitments."
          action={
            user?.role === "MENTOR"
              ? {
                  label: "Record Session",
                  onClick: () => setShowForm(true),
                }
              : undefined
          }
        />
      )}

      {/* Meetings List */}
      <div className="space-y-4">
        {filteredMeetings.map((m) => (
          <div
            key={m.id}
            className="app-card p-5 md:p-6 hover:border-brand-300/80 transition-all duration-200 shadow-xs hover:shadow-cardHover"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-navy font-bold text-sm flex items-center justify-center border border-line shrink-0">
                  {m.student?.fullName ? m.student.fullName[0] : "S"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/students/${m.studentId}`}
                      className="font-display text-sm md:text-base font-bold text-navy hover:text-brand-600 transition-colors"
                    >
                      {m.student?.fullName}
                    </Link>
                    {m.student?.rollNumber && (
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {m.student.rollNumber}
                      </span>
                    )}
                    <span className="font-mono text-xs text-slate-muted">
                      ({m.student?.registerNumber})
                    </span>
                  </div>
                  <p className="text-xs text-slate-muted flex items-center gap-1.5 mt-0.5">
                    <Calendar size={12} />
                    {new Date(m.meetingDate).toLocaleDateString(undefined, {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {m.meetingType}
                </span>
                <Badge
                  tone={
                    m.aiStatus === "COMPLETED"
                      ? "success"
                      : m.aiStatus === "FAILED"
                      ? "danger"
                      : "neutral"
                  }
                >
                  <Sparkles size={11} className="inline mr-1" />
                  AI {m.aiStatus.toLowerCase()}
                </Badge>
              </div>
            </div>

            {/* Content Body */}
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs font-bold text-slate-muted uppercase tracking-wider mb-1">
                  Synthesized Advisory Summary
                </p>
                <p className="text-sm text-navy leading-relaxed bg-surface/50 p-3.5 rounded-xl border border-line">
                  {m.aiSummary ?? m.discussionSummary}
                </p>
              </div>

              {m.aiKeyConcerns && m.aiKeyConcerns.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs font-bold text-slate-muted mr-1">Concerns:</span>
                  {m.aiKeyConcerns.map((c, i) => (
                    <Badge key={i} tone="warning">
                      {c}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Links */}
            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs text-slate-muted">
              <span>Recorded with AI Copilot</span>
              <Link
                to={`/students/${m.studentId}`}
                className="font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                View Full Student History <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Record Meeting Modal */}
      {showForm && (
        <RecordMeetingModal
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function RecordMeetingModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState({
    studentId: "",
    meetingDate: new Date().toISOString().slice(0, 10),
    meetingType: "INDIVIDUAL",
    discussionSummary: "",
    studentConcerns: "",
    mentorSuggestions: "",
    nextFollowUpDate: "",
  });
  const [status, setStatus] = useState<"idle" | "saving" | "analyzing" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Meeting | null>(null);

  useEffect(() => {
    api.get("/students", { params: { pageSize: 200 } }).then((res) => setStudents(res.data.data.items));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("saving");
    try {
      setStatus("analyzing");
      const res = await api.post("/meetings", form);
      setResult(res.data.data);
      setStatus("done");
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to save meeting. Please try again."));
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 bg-navy/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="app-card w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border-white/20">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-wider mb-0.5">
              <Sparkles size={14} /> AI-Powered Advisory Logger
            </div>
            <h2 className="font-display text-lg font-bold text-navy">Record 1:1 Mentoring Session</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-muted hover:text-navy transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {status === "done" && result ? (
          <MeetingResult meeting={result} onClose={onSaved} />
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-1">
                Select Mentee <span className="text-rose-500">*</span>
              </label>
              <select
                required
                className="w-full px-3.5 py-2.5 text-xs md:text-sm border border-slate-200 rounded-xl bg-surface focus:outline-none focus:border-brand-500 font-medium"
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              >
                <option value="">Select a student...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} — {s.rollNumber ? `${s.rollNumber} • ` : ""}Reg: {s.registerNumber} ({s.year}-{s.section})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-1">
                  Meeting Date <span className="text-rose-500">*</span>
                </label>
                <input autoComplete="off"
                  type="date"
                  required
                  className="w-full px-3.5 py-2 text-xs md:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                  value={form.meetingDate}
                  onChange={(e) => setForm({ ...form, meetingDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-1">
                  Session Type
                </label>
                <select
                  className="w-full px-3.5 py-2 text-xs md:text-sm border border-slate-200 rounded-xl bg-surface focus:outline-none focus:border-brand-500 font-medium"
                  value={form.meetingType}
                  onChange={(e) => setForm({ ...form, meetingType: e.target.value })}
                >
                  <option value="INDIVIDUAL">Individual 1:1</option>
                  <option value="GROUP">Group Session</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-1">
                Session Discussion Summary <span className="text-rose-500">*</span>
              </label>
              <textarea autoComplete="off"
                required
                rows={3}
                className="w-full px-3.5 py-2 text-xs md:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                value={form.discussionSummary}
                onChange={(e) => setForm({ ...form, discussionSummary: e.target.value })}
                placeholder="Key topics discussed (academics, projects, attendance, personal well-being)..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-1">
                Student Concerns / Challenges
              </label>
              <textarea autoComplete="off"
                rows={2}
                className="w-full px-3.5 py-2 text-xs md:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                value={form.studentConcerns}
                onChange={(e) => setForm({ ...form, studentConcerns: e.target.value })}
                placeholder="Specific roadblocks expressed by the student..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-1">
                Mentor Advice & Next Commitments
              </label>
              <textarea autoComplete="off"
                rows={2}
                className="w-full px-3.5 py-2 text-xs md:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                value={form.mentorSuggestions}
                onChange={(e) => setForm({ ...form, mentorSuggestions: e.target.value })}
                placeholder="Actionable recommendations and goals set for student..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-1">
                Next Scheduled Follow-up Date
              </label>
              <input autoComplete="off"
                type="date"
                className="w-full px-3.5 py-2 text-xs md:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                value={form.nextFollowUpDate}
                onChange={(e) => setForm({ ...form, nextFollowUpDate: e.target.value })}
              />
            </div>

            {error && (
              <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2.5 pt-4 border-t border-line">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!form.studentId || !form.discussionSummary || status === "saving" || status === "analyzing"}
                className="btn-primary text-xs px-5 py-2 flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                <Sparkles size={15} />
                {status === "saving" || status === "analyzing"
                  ? "Synthesizing with AI..."
                  : "Save & Run AI Analysis"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function MeetingResult({ meeting, onClose }: { meeting: Meeting; onClose: () => void }) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200">
        <p className="text-xs font-bold text-gold-dark uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Sparkles size={14} /> AI Session Synthesis
        </p>
        <p className="text-sm text-navy leading-relaxed">{meeting.aiSummary}</p>
      </div>

      {meeting.aiKeyConcerns && meeting.aiKeyConcerns.length > 0 && (
        <div className="app-card p-4">
          <p className="text-xs font-bold text-slate-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-amber-500" /> Extracted Key Concerns
          </p>
          <ul className="space-y-1.5 text-xs text-navy">
            {meeting.aiKeyConcerns.map((c, i) => (
              <li key={i} className="flex items-start gap-2 bg-surface p-2 rounded-lg border border-line">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {meeting.aiRecommendedActions && meeting.aiRecommendedActions.length > 0 && (
        <div className="app-card p-4">
          <p className="text-xs font-bold text-slate-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lightbulb size={14} className="text-emerald-500" /> Auto-Generated Action Tasks
          </p>
          <ul className="space-y-1.5 text-xs text-navy">
            {meeting.aiRecommendedActions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 bg-surface p-2 rounded-lg border border-line">
                <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[11px] text-slate-muted bg-slate-100 p-2.5 rounded-lg text-center font-medium">
        Issues, action roadmap, and AI risk seals have been automatically recalculated and saved.
      </p>

      <div className="flex justify-end pt-2">
        <button onClick={onClose} className="btn-primary text-xs px-6 py-2 shadow-md">
          Complete & Close
        </button>
      </div>
    </div>
  );
}

