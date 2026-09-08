import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  User,
  CheckCircle,
  Circle,
  Search,
  ArrowRight,
  ListTodo,
  Plus,
  X,
  Send,
} from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/LoadingState";
import { Badge } from "../components/ui/Badge";
import { ActionItem, Student } from "../types";
import { useAuth } from "../context/AuthContext";
import { BackButton } from "../components/ui/BackButton";

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  PENDING: "warning",
  IN_PROGRESS: "info",
  COMPLETED: "success",
  OVERDUE: "danger",
};

export default function Actions() {
  const { user } = useAuth();
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [completingId, setCompletingId] = useState<string | null>(null);

  // New task modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskTarget, setTaskTarget] = useState<"MY_MENTEES" | "ALL_STUDENTS" | "SINGLE">("MY_MENTEES");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskType, setTaskType] = useState("STUDENT_ACTION");
  const [targetDate, setTargetDate] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);

  function load() {
    setLoading(true);
    api
      .get("/actions", { params: statusFilter ? { status: statusFilter } : {} })
      .then((res) => setActions(res.data.data))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));

    if (user?.role === "MENTOR" || user?.role === "HOD") {
      api
        .get("/students", { params: { pageSize: 100 } })
        .then((res) => setStudents(res.data.data.items || []))
        .catch(() => {});
    }
  }

  useEffect(load, [statusFilter]);

  async function markComplete(id: string) {
    setCompletingId(id);
    try {
      await api.put(`/actions/${id}`, { status: "COMPLETED" });
      setActions((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "COMPLETED" as any } : item))
      );
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to complete action item."));
    } finally {
      setCompletingId(null);
    }
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskDescription) return;
    setCreatingTask(true);
    try {
      const payload: any = {
        description: taskDescription,
        actionType: taskType,
        targetCompletionDate: targetDate ? new Date(targetDate).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString(),
      };

      if (taskTarget === "SINGLE") {
        payload.studentId = selectedStudentId || students[0]?.id;
      } else {
        payload.targetType = taskTarget;
      }

      await api.post("/actions", payload);
      setShowCreateModal(false);
      setTaskDescription("");
      load();
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to create task"));
    } finally {
      setCreatingTask(false);
    }
  }

  const filteredActions = actions.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.description.toLowerCase().includes(q) ||
      a.student?.fullName?.toLowerCase().includes(q) ||
      a.student?.registerNumber?.toLowerCase().includes(q) ||
      (a.student?.rollNumber && a.student.rollNumber.toLowerCase().includes(q)) ||
      a.assignedTo.toLowerCase().includes(q)
    );
  });

  const pendingCount = actions.filter((a) => a.status === "PENDING").length;
  const inProgressCount = actions.filter((a) => a.status === "IN_PROGRESS").length;
  const overdueCount = actions.filter((a) => a.status === "OVERDUE").length;
  const completedCount = actions.filter((a) => a.status === "COMPLETED").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <BackButton fallback="/dashboard" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Advisory Commitments</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {actions.length} Tasks
            </span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Mentoring Action Roadmap
          </h1>
        </div>

        {/* Action button & Status Breakdown Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {(user?.role === "MENTOR" || user?.role === "HOD") && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-xl shadow-xs cursor-pointer"
            >
              <Plus size={14} /> Assign New Task
            </button>
          )}

          {overdueCount > 0 && (
            <div className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center gap-1.5 text-xs font-semibold text-rose-700">
              <AlertCircle size={13} /> {overdueCount} Overdue
            </div>
          )}
          <div className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
            <Clock size={13} /> {pendingCount + inProgressCount} In Progress
          </div>
          <div className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={13} /> {completedCount} Finished
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600 font-display font-bold text-base">
                <Plus size={18} />
                <span>Assign Action Task</span>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Assignee(s)</label>
                <select
                  value={taskTarget}
                  onChange={(e) => setTaskTarget(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="MY_MENTEES">All Assigned Mentees</option>
                  <option value="SINGLE">Individual Student</option>
                  {user?.role === "HOD" && <option value="ALL_STUDENTS">Entire Department Students</option>}
                </select>
              </div>

              {taskTarget === "SINGLE" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} {s.rollNumber ? `[${s.rollNumber}] ` : ""}({s.registerNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Category</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="STUDENT_ACTION">Student Action</option>
                  <option value="ACADEMIC_REMEDY">Academic Remediation</option>
                  <option value="SKILL_BUILDING">Skill & Coding Practice</option>
                  <option value="RESUME_UPDATE">Resume & Placement Prep</option>
                  <option value="ATTENDANCE_RECOVERY">Attendance Recovery</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Description & Deliverable</label>
                <textarea autoComplete="off"
                  required
                  rows={3}
                  placeholder="e.g. Complete LeetCode 15 dynamic programming problems and push to GitHub repository."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Due Date</label>
                <input autoComplete="off"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTask}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>{creatingTask ? "Assigning..." : "Assign Task"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="app-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/90">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-muted" />
          <input autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by mentee, keyword, or assignee..."
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-surface rounded-xl border border-line focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "", label: "All Tasks" },
            { id: "PENDING", label: "Pending" },
            { id: "IN_PROGRESS", label: "In Progress" },
            { id: "OVERDUE", label: "Overdue" },
            { id: "COMPLETED", label: "Completed" },
          ].map((s) => (
            <button
              key={s.id || "all"}
              onClick={() => setStatusFilter(s.id)}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === s.id
                  ? "bg-navy text-gold border-navy shadow-xs"
                  : "bg-white border-line text-slate-muted hover:text-navy hover:bg-slate-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {loading && !error && <LoadingState label="Loading action commitments..." />}
      {!loading && filteredActions.length === 0 && (
        <EmptyState
          title="No action items found"
          hint="Action tasks are generated automatically from advisory meetings or assigned directly."
          icon={<ListTodo size={32} className="text-slate-400" />}
        />
      )}

      {/* Action Items List */}
      <div className="space-y-3">
        {filteredActions.map((a) => {
          const isOverdue = a.status === "OVERDUE" || (new Date(a.targetCompletionDate) < new Date() && a.status !== "COMPLETED");
          const isCompleted = a.status === "COMPLETED";

          return (
            <div
              key={a.id}
              className={`app-card p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 border-l-4 ${
                isCompleted
                  ? "border-l-emerald-500 opacity-80"
                  : isOverdue
                  ? "border-l-rose-500"
                  : "border-l-brand-500"
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                {!isCompleted ? (
                  <button
                    disabled={completingId === a.id}
                    onClick={() => markComplete(a.id)}
                    className="mt-0.5 text-slate-300 hover:text-emerald-600 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                    title="Mark as completed"
                  >
                    <Circle size={20} />
                  </button>
                ) : (
                  <CheckCircle size={20} className="mt-0.5 text-emerald-600 shrink-0" />
                )}

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {a.student && (
                      <>
                        <Link
                          to={`/students/${a.student.id}`}
                          className="font-display text-xs md:text-sm font-bold text-navy hover:text-brand-600 transition-colors"
                        >
                          {a.student.fullName}
                        </Link>
                        {a.student.rollNumber && (
                          <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            {a.student.rollNumber}
                          </span>
                        )}
                      </>
                    )}
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.2 rounded bg-slate-100 text-slate-600">
                      {a.actionType?.replace(/_/g, " ") || "GENERAL"}
                    </span>
                    <span className="text-xs text-slate-muted">
                      Assigned to: <strong className="text-navy font-semibold">{a.assignedTo}</strong>
                    </span>
                  </div>

                  <p
                    className={`text-sm leading-relaxed ${
                      isCompleted ? "line-through text-slate-400 font-normal" : "text-navy font-semibold"
                    }`}
                  >
                    {a.description}
                  </p>

                  <p className="text-xs text-slate-muted flex items-center gap-1.5 pt-0.5">
                    <Calendar size={12} />
                    <span>
                      Target Due: <strong>{new Date(a.targetCompletionDate).toLocaleDateString(undefined, { dateStyle: "medium" })}</strong>
                    </span>
                  </p>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-line">
                <Badge tone={STATUS_TONE[a.status]}>{a.status.replace("_", " ")}</Badge>

                {!isCompleted && (
                  <button
                    disabled={completingId === a.id}
                    onClick={() => markComplete(a.id)}
                    className="text-xs font-bold text-brand-600 hover:text-brand-800 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {completingId === a.id ? "Saving..." : "Complete Task"} <ArrowRight size={11} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

