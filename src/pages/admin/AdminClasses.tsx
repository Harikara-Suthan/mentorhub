import React, { useEffect, useState } from "react";
import { Users, Sparkles, Building2, UserCheck, Calendar, Edit2, X, AlertCircle, Save, RefreshCw, CheckCircle2 } from "lucide-react";
import { BackButton } from "../../components/ui/BackButton";
import { useNavigate } from "react-router-dom";
import { api, apiErrorMessage } from "../../api/client";
import { LoadingState } from "../../components/ui/LoadingState";
import { useAuth } from "../../context/AuthContext";

interface SectionItem {
  id: string;
  year: string;
  sec: string;
  dept: string;
  advisor: string;
  students: number;
  hall: string;
  academicYear?: string;
  semester?: number;
}

export default function AdminClasses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const [editingSection, setEditingSection] = useState<SectionItem | null>(null);
  const [editAdvisor, setEditAdvisor] = useState("");
  const [editHall, setEditHall] = useState("");
  const [editStudents, setEditStudents] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editSec, setEditSec] = useState("");
  const [editDept, setEditDept] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/classes");
      setSections(res.data.data || []);
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

  const openEditModal = (sec: SectionItem) => {
    setEditingSection(sec);
    setEditAdvisor(sec.advisor || "");
    setEditHall(sec.hall || "");
    setEditStudents(String(sec.students || 0));
    setEditYear(sec.year || "1");
    setEditSec(sec.sec || "A");
    setEditDept(sec.dept || "CSE");
    setEditError("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    setSubmittingEdit(true);
    setEditError("");
    try {
      await api.put(`/admin/classes/${editingSection.id}`, {
        year: editYear.trim(),
        sec: editSec.trim().toUpperCase(),
        dept: editDept.trim().toUpperCase(),
        advisor: editAdvisor.trim(),
        hall: editHall.trim(),
        students: Number(editStudents) || 0,
      });

      setActionSuccess(`Section Year ${editYear}-${editSec} updated successfully.`);
      setEditingSection(null);
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
              <span className="text-xs text-blue-800/80 font-medium">Cohort Batch Sections</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
              Classes & Sections Directory
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              Batch cohorts, section advisors, classroom allocations, and enrollment headcounts.
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
        <LoadingState label="Loading class cohorts and sections..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((sec, idx) => (
            <div key={sec.id || idx} className="app-card p-5 space-y-3 hover:border-blue-200 transition-all shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Year {sec.year} · Section {sec.sec}
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-medium">{sec.hall}</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-950">Department of {sec.dept}</h3>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <UserCheck size={12} className="text-blue-600" />
                  Advisor: <span className="font-medium text-slate-700">{sec.advisor}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{sec.students} Enrolled</span>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      onClick={() => openEditModal(sec)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-md transition-colors border border-blue-200 cursor-pointer shadow-2xs"
                    >
                      <Edit2 size={11} /> Edit
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/students?year=${sec.year}&section=${sec.sec}`)}
                    className="text-blue-600 font-semibold hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    Roster →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  <Users size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-950">Edit Class Section</h3>
                  <p className="text-[11px] text-slate-500">Year {editingSection.year} - Sec {editingSection.sec} ({editingSection.dept})</p>
                </div>
              </div>
              <button
                onClick={() => setEditingSection(null)}
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
                  <input
                    type="text"
                    required
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    required
                    value={editSec}
                    onChange={(e) => setEditSec(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Section Advisor Faculty</label>
                <input
                  type="text"
                  required
                  value={editAdvisor}
                  onChange={(e) => setEditAdvisor(e.target.value)}
                  placeholder="e.g. Dr. Priya Raman"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lecture Hall / Room</label>
                  <input
                    type="text"
                    value={editHall}
                    onChange={(e) => setEditHall(e.target.value)}
                    placeholder="LH-101"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Enrolled Count</label>
                  <input
                    type="number"
                    value={editStudents}
                    onChange={(e) => setEditStudents(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
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
