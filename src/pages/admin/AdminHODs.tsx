import React, { useEffect, useState } from "react";
import { UserCog, Sparkles, Building2, Mail, Phone, ShieldCheck, UserCheck, RefreshCw, X, AlertCircle, CheckCircle2, Edit2, Save } from "lucide-react";
import { api, apiErrorMessage } from "../../api/client";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/LoadingState";
import { BackButton } from "../../components/ui/BackButton";

interface HODItem {
  department: {
    id: string;
    name: string;
    code: string;
    studentCount: number;
    mentorCount: number;
  };
  hod: {
    id: string;
    userId: string;
    fullName: string;
    email?: string;
    phone?: string;
    designation: string;
    employeeId: string;
    qualification?: string;
    experienceYears?: number;
    specialization?: string;
    isActive: boolean;
  } | null;
  availableFaculty: {
    id: string;
    fullName: string;
    email?: string;
    designation: string;
    isCurrentHOD: boolean;
  }[];
}

export default function AdminHODs() {
  const [data, setData] = useState<HODItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Assign HOD Modal
  const [selectedDept, setSelectedDept] = useState<HODItem | null>(null);
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");

  // Edit HOD Modal
  const [editingHOD, setEditingHOD] = useState<{ id: string; deptName: string; fullName: string; phone: string; designation: string; employeeId: string; qualification: string; experienceYears: string; specialization: string } | null>(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/hods");
      setData(res.data.data || []);
      setError("");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAssignModal = (item: HODItem) => {
    setSelectedDept(item);
    setSelectedMentorId(item.hod?.id || (item.availableFaculty[0]?.id || ""));
    setAssignError("");
  };

  const openEditHODModal = (item: HODItem) => {
    if (!item.hod) return;
    setEditingHOD({
      id: item.hod.id,
      deptName: item.department.name,
      fullName: item.hod.fullName,
      phone: item.hod.phone || "",
      designation: item.hod.designation || "Professor & Head of Department",
      employeeId: item.hod.employeeId || "",
      qualification: item.hod.qualification || "",
      experienceYears: item.hod.experienceYears ? String(item.hod.experienceYears) : "",
      specialization: item.hod.specialization || "",
    });
    setEditError("");
  };

  const handleEditHODSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHOD) return;

    setSubmittingEdit(true);
    setEditError("");
    try {
      await api.put(`/admin/hods/${editingHOD.id}`, {
        fullName: editingHOD.fullName,
        phone: editingHOD.phone || undefined,
        designation: editingHOD.designation,
        employeeId: editingHOD.employeeId || undefined,
        qualification: editingHOD.qualification || undefined,
        experienceYears: editingHOD.experienceYears ? Number(editingHOD.experienceYears) : undefined,
        specialization: editingHOD.specialization || undefined,
      });

      setActionSuccess(`Head of Department profile for ${editingHOD.fullName} updated successfully.`);
      setEditingHOD(null);
      setTimeout(() => setActionSuccess(""), 5000);
      loadData();
    } catch (err) {
      setEditError(apiErrorMessage(err));
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept || !selectedMentorId) return;

    setAssigning(true);
    setAssignError("");
    try {
      const res = await api.post("/admin/hods/assign", {
        departmentId: selectedDept.department.id,
        mentorId: selectedMentorId,
      });

      setActionSuccess(res.data.data?.message || "HOD designated successfully.");
      setSelectedDept(null);
      setTimeout(() => setActionSuccess(""), 4000);
      loadData();
    } catch (err) {
      setAssignError(apiErrorMessage(err));
    } finally {
      setAssigning(false);
    }
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
              <span className="text-xs text-blue-800/80 font-medium">Department Leadership Ledger</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
              Heads of Department (HODs) Administration
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              Designate and manage departmental leadership across academic units, grant executive governance, and monitor cohort allocations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => loadData()}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <RefreshCw size={13} /> Refresh
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

      {loading ? (
        <LoadingState label="Loading department leadership..." />
      ) : error ? (
        <div className="p-6">
          <ErrorState error={error} onRetry={() => loadData()} />
        </div>
      ) : data.length === 0 ? (
        <div className="p-8">
          <EmptyState title="No departments found" description="Create departments to assign leadership." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => {
            const { department, hod, availableFaculty } = item;
            return (
              <div key={department.id} className="app-card p-5 space-y-4 hover:border-blue-200 transition-all shadow-2xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs uppercase">
                      {department.code[0]}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {department.code}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-950">{department.name}</h3>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span>{department.studentCount} Students</span>
                      <span>•</span>
                      <span>{department.mentorCount} Faculty</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCog size={13} className="text-blue-600" /> Appointed Head of Department
                    </div>
                    {hod ? (
                      <div>
                        <div className="text-xs font-bold text-slate-900">{hod.fullName}</div>
                        <div className="text-[11px] text-slate-500">{hod.designation}</div>
                        {hod.email && (
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                            <Mail size={11} /> {hod.email}
                          </div>
                        )}
                        {hod.phone && (
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                            <Phone size={11} /> {hod.phone}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-amber-700 italic font-medium">
                        No HOD appointed yet
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                    hod
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200/60"
                      : "text-amber-700 bg-amber-50 border-amber-200/60"
                  }`}>
                    <ShieldCheck size={11} /> {hod ? "Appointed HOD" : "Vacant Post"}
                  </span>
                  <button
                    onClick={() => openAssignModal(item)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    {hod ? "Change HOD" : "Appoint HOD"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign / Appoint HOD Modal */}
      {selectedDept && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserCog size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Appoint Head of Department</h2>
                  <p className="text-[11px] text-slate-500">{selectedDept.department.name} ({selectedDept.department.code})</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDept(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-5 space-y-4">
              {assignError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{assignError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Faculty Member <span className="text-rose-500">*</span>
                </label>
                {selectedDept.availableFaculty.length === 0 ? (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs">
                    No faculty members currently registered in this department. Please register a faculty mentor in this department first.
                  </div>
                ) : (
                  <select
                    required
                    value={selectedMentorId}
                    onChange={(e) => setSelectedMentorId(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  >
                    {selectedDept.availableFaculty.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.fullName} ({f.designation}) {f.isCurrentHOD ? "— [Current HOD]" : ""}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Promotes selected faculty to Role HOD and updates department governance permissions.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDept(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning || selectedDept.availableFaculty.length === 0}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {assigning ? "Appointing..." : "Confirm Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
