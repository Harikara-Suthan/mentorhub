import React, { useEffect, useState } from "react";
import { GraduationCap, Sparkles, BookOpen, CheckCircle2, ShieldCheck, Edit2, X, AlertCircle, Save, RefreshCw } from "lucide-react";
import { BackButton } from "../../components/ui/BackButton";
import { api, apiErrorMessage } from "../../api/client";
import { LoadingState } from "../../components/ui/LoadingState";
import { useAuth } from "../../context/AuthContext";

interface ProgramItem {
  id: string;
  code: string;
  name: string;
  degree: string;
  duration: string;
  intake: number;
  reg: string;
  hodName?: string;
  status?: string;
}

export default function AdminPrograms() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const [editingProgram, setEditingProgram] = useState<ProgramItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editDegree, setEditDegree] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editIntake, setEditIntake] = useState("");
  const [editReg, setEditReg] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/programs");
      setPrograms(res.data.data || []);
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

  const openEditModal = (prog: ProgramItem) => {
    setEditingProgram(prog);
    setEditName(prog.name);
    setEditCode(prog.code);
    setEditDegree(prog.degree);
    setEditDuration(prog.duration);
    setEditIntake(String(prog.intake));
    setEditReg(prog.reg);
    setEditError("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram) return;

    setSubmittingEdit(true);
    setEditError("");
    try {
      await api.put(`/admin/programs/${editingProgram.id}`, {
        name: editName.trim(),
        code: editCode.trim().toUpperCase(),
        degree: editDegree.trim(),
        duration: editDuration.trim(),
        intake: Number(editIntake) || 60,
        reg: editReg.trim(),
      });

      setActionSuccess(`Program ${editCode} updated successfully.`);
      setEditingProgram(null);
      setTimeout(() => setActionSuccess(""), 4000);
      load();
    } catch (err) {
      setEditError(apiErrorMessage(err));
    } finally {
      setSubmittingEdit(false);
    }
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
              <span className="text-xs text-blue-800/80 font-medium">Curriculum & Degree Offerings</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
              Academic Programs & Degrees
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              Curriculum regulations, approved intake quotas, and graduation pathways approved under university statutes.
            </p>
          </div>
          <button
            onClick={load}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs self-start lg:self-auto cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {loading ? (
        <LoadingState label="Loading academic programs directory..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {programs.map((prog) => (
            <div key={prog.id} className="app-card p-5 space-y-4 hover:border-blue-200 transition-all shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <GraduationCap size={20} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {prog.code}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => openEditModal(prog)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg transition-colors border border-blue-200 cursor-pointer shadow-2xs"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-950">{prog.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{prog.degree} · {prog.duration}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-700">{prog.reg}</span>
                <span className="font-mono text-blue-700 font-semibold">{prog.intake} Seats / Year</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Program Modal */}
      {editingProgram && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  <GraduationCap size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-950">Edit Academic Program</h3>
                  <p className="text-[11px] text-slate-500">{editingProgram.code}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingProgram(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Program Title</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Program Code</label>
                  <input
                    type="text"
                    required
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Intake</label>
                  <input
                    type="number"
                    required
                    value={editIntake}
                    onChange={(e) => setEditIntake(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Degree Level</label>
                  <input
                    type="text"
                    value={editDegree}
                    onChange={(e) => setEditDegree(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Regulation</label>
                  <input
                    type="text"
                    value={editReg}
                    onChange={(e) => setEditReg(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProgram(null)}
                  disabled={submittingEdit}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Save size={13} />
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
