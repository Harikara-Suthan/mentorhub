import React, { useEffect, useState } from "react";
import { Building2, Sparkles, Plus, Search, Users, ShieldCheck, Edit2, X, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { api, apiErrorMessage } from "../../api/client";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/LoadingState";
import { BackButton } from "../../components/ui/BackButton";

interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  studentCount: number;
  mentorCount: number;
  hod?: { id: string; fullName: string; phone?: string; user?: { email: string } } | null;
}

export default function AdminDepartments() {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createCode, setCreateCode] = useState("");
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit Modal
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/departments");
      setDepartments(res.data.data || []);
      setError("");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setSubmittingCreate(true);
    try {
      await api.post("/admin/departments", {
        name: createName,
        code: createCode,
      });

      setShowCreateModal(false);
      setCreateName("");
      setCreateCode("");
      setActionSuccess("Department created successfully.");
      setTimeout(() => setActionSuccess(""), 4000);
      load();
    } catch (err) {
      setCreateError(apiErrorMessage(err));
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    if (!editingDept) return;
    setEditError("");
    setSubmittingEdit(true);
    try {
      await api.patch(`/admin/departments/${editingDept.id}`, {
        name: editName,
        code: editCode,
      });

      setEditingDept(null);
      setActionSuccess("Department updated successfully.");
      setTimeout(() => setActionSuccess(""), 4000);
      load();
    } catch (err) {
      setEditError(apiErrorMessage(err));
    } finally {
      setSubmittingEdit(false);
    }
  };

  const openEditModal = (d: DepartmentItem) => {
    setEditingDept(d);
    setEditName(d.name);
    setEditCode(d.code);
    setEditError("");
  };

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
              <span className="text-xs text-blue-800/80 font-medium">Academic Organizational Units</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
              Academic Departments
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              Configure institutional departments, code prefixes, faculty allocations, and student enrollments.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Plus size={14} /> Add Department
            </button>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess("")} className="text-emerald-700 hover:text-emerald-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="app-card p-4 flex items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search departments..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">{filtered.length} Departments Active</span>
          <button
            onClick={() => load()}
            className="p-1.5 text-slate-600 hover:text-blue-600 rounded-lg"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading academic departments..." />
      ) : error ? (
        <div className="p-6">
          <ErrorState error={error} onRetry={() => load()} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8">
          <EmptyState title="No departments found" description="Create your first academic department." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((dept) => (
            <div key={dept.id} className="app-card p-5 space-y-4 hover:border-blue-200 transition-all shadow-2xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs uppercase">
                    {dept.code[0]}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {dept.code}
                    </span>
                    <button
                      onClick={() => openEditModal(dept)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded-md cursor-pointer"
                      title="Edit Department"
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-950">{dept.name}</h3>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span>{dept.studentCount} Students</span>
                    <span>•</span>
                    <span>{dept.mentorCount} Mentors</span>
                  </div>
                </div>

                {dept.hod && (
                  <div className="text-[11px] text-slate-600 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 font-medium">Head of Department:</span>
                    <div className="font-semibold text-slate-900 mt-0.5">{dept.hod.fullName}</div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  <ShieldCheck size={11} /> NAAC Accredited
                </span>
                <span className="font-mono text-[11px] text-blue-700 font-medium">Undergraduate / PG</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Department Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Plus size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Create Academic Department</h2>
                  <p className="text-[11px] text-slate-500">Register a new academic department unit</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              {createError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Artificial Intelligence & Data Science"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createCode}
                  onChange={(e) => setCreateCode(e.target.value.toUpperCase())}
                  placeholder="e.g. AI-DS"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium font-mono uppercase"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingCreate ? "Creating..." : "Create Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {editingDept && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Edit2 size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Edit Department</h2>
                  <p className="text-[11px] text-slate-500">Update naming or code prefix</p>
                </div>
              </div>
              <button
                onClick={() => setEditingDept(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Code</label>
                <input
                  type="text"
                  required
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium font-mono uppercase"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
