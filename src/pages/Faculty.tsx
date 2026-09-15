import React, { useEffect, useState } from "react";
import {
  Search,
  UserCog,
  Mail,
  Phone,
  CalendarCheck,
  Shield,
  Sparkles,
  Building2,
  Users,
  ArrowRight,
  Plus,
  Edit2,
  Power,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Award
} from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/LoadingState";
import { Department } from "../types";
import { BackButton } from "../components/ui/BackButton";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface FacultyItem {
  id: string;
  userId?: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  designation: string;
  employeeId?: string | null;
  qualification?: string | null;
  experienceYears?: number | null;
  specialization?: string | null;
  departmentId: string;
  department?: { id: string; name: string; code: string } | null;
  isActive?: boolean;
  role?: string;
  assignedMenteesCount?: number;
  meetingsLoggedCount?: number;
  isCrossDepartment?: boolean;
  crossDepartmentLabel?: string;
}

export default function Faculty() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const { id: urlFacultyId } = useParams();
  const [viewingFaculty, setViewingFaculty] = useState<FacultyItem | null>(null);
  const [mentors, setMentors] = useState<FacultyItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [actionSuccess, setActionSuccess] = useState("");

  // Create Faculty Modal (Admin only)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFullName, setCreateFullName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createDesignation, setCreateDesignation] = useState("Assistant Professor");
  const [createDeptId, setCreateDeptId] = useState("");
  const [createEmployeeId, setCreateEmployeeId] = useState("");
  const [createQualification, setCreateQualification] = useState("M.E., Ph.D.");
  const [createExperience, setCreateExperience] = useState("5");
  const [createSpecialization, setCreateSpecialization] = useState("");
  const [createIsHOD, setCreateIsHOD] = useState(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit Faculty Modal
  const [editingFaculty, setEditingFaculty] = useState<FacultyItem | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [editDeptId, setEditDeptId] = useState("");
  const [editEmployeeId, setEditEmployeeId] = useState("");
  const [editQualification, setEditQualification] = useState("");
  const [editExperience, setEditExperience] = useState("");
  const [editSpecialization, setEditSpecialization] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [facultyRes, deptsRes] = await Promise.all([
          api.get("/admin/faculty"),
          api.get("/departments"),
        ]);
        setMentors(facultyRes.data.data || []);
        const depts = deptsRes.data.data || [];
        setDepartments(depts);
        if (depts.length > 0 && !createDeptId) {
          setCreateDeptId(depts[0].id);
        }
      } else {
        const [mentorsRes, deptsRes] = await Promise.all([
          api.get("/departments/mentors/all"),
          api.get("/departments"),
        ]);
        setMentors(mentorsRes.data.data || []);
        setDepartments(deptsRes.data.data || []);
      }
      setError("");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  useEffect(() => {
    if (urlFacultyId && mentors.length > 0) {
      const found = mentors.find((m) => m.id === urlFacultyId);
      if (found) setViewingFaculty(found);
    }
  }, [urlFacultyId, mentors]);

  const filteredMentors = mentors.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.employeeId && m.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = deptFilter === "ALL" || m.departmentId === deptFilter;
    return matchesSearch && matchesDept;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setSubmittingCreate(true);
    try {
      await api.post("/admin/faculty", {
        fullName: createFullName,
        email: createEmail,
        phone: createPhone || undefined,
        designation: createDesignation,
        departmentId: createDeptId,
        employeeId: createEmployeeId || undefined,
        qualification: createQualification || undefined,
        experienceYears: createExperience ? Number(createExperience) : undefined,
        specialization: createSpecialization || undefined,
        isHOD: createIsHOD,
      });

      setShowCreateModal(false);
      resetCreateForm();
      setActionSuccess("Faculty member registered successfully.");
      setTimeout(() => setActionSuccess(""), 4000);
      loadData();
    } catch (err) {
      setCreateError(apiErrorMessage(err));
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    if (!editingFaculty) return;
    setEditError("");
    setSubmittingEdit(true);
    try {
      await api.patch(`/admin/faculty/${editingFaculty.id}`, {
        fullName: editFullName,
        phone: editPhone || undefined,
        designation: editDesignation,
        departmentId: editDeptId,
        employeeId: editEmployeeId || undefined,
        qualification: editQualification || undefined,
        experienceYears: editExperience ? Number(editExperience) : undefined,
        specialization: editSpecialization || undefined,
      });

      setEditingFaculty(null);
      setActionSuccess(`Faculty member ${editFullName} updated successfully.`);
      setTimeout(() => setActionSuccess(""), 4000);
      loadData();
    } catch (err) {
      setEditError(apiErrorMessage(err));
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleToggleStatus = async (faculty: FacultyItem) => {
    try {
      const newStatus = !(faculty.isActive ?? true);
      await api.post(`/admin/faculty/${faculty.id}/status`, { isActive: newStatus });
      setMentors((prev) =>
        prev.map((m) => (m.id === faculty.id ? { ...m, isActive: newStatus } : m))
      );
      setActionSuccess(
        `Faculty member ${faculty.fullName} ${newStatus ? "restored and activated" : "deactivated"} successfully.`
      );
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const resetCreateForm = () => {
    setCreateFullName("");
    setCreateEmail("");
    setCreatePhone("");
    setCreateEmployeeId("");
    setCreateSpecialization("");
    setCreateIsHOD(false);
  };

  const openEditModal = (f: FacultyItem) => {
    setEditingFaculty(f);
    setEditFullName(f.fullName);
    setEditPhone(f.phone || "");
    setEditDesignation(f.designation || "Assistant Professor");
    setEditDeptId(f.departmentId);
    setEditEmployeeId(f.employeeId || "");
    setEditQualification(f.qualification || "");
    setEditExperience(f.experienceYears ? String(f.experienceYears) : "");
    setEditSpecialization(f.specialization || "");
    setEditError("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Tab Banner */}
      <div className="p-6 md:p-7 rounded-2xl bg-sky-50 text-blue-950 border border-blue-100/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <BackButton fallback="/dashboard" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles size={11} className="text-blue-500" /> Institutional Governance
              </span>
              <span className="text-xs text-blue-800/80 font-medium">Faculty Advisory Ledger</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
              Faculty / Mentors Directory
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              Review institutional mentors, monitor advisories logged, inspect departmental distribution, and coordinate student success.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Plus size={14} /> Add Faculty
              </button>
            )}
            <button
              onClick={() => navigate("/mentor-assignments")}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all border border-slate-200 shadow-2xs cursor-pointer"
            >
              <Users size={14} /> Manage Assignments
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

      {/* Control Toolbar */}
      <div className="app-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search faculty by name, email, or employee ID..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Building2 size={14} />
            <span>Department:</span>
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="flex-1 md:flex-none text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
          <button
            onClick={() => loadData()}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh list"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState label="Loading faculty directory and advisory telemetry..." />
      ) : error ? (
        <div className="p-6">
          <ErrorState error={error} onRetry={() => loadData()} />
        </div>
      ) : filteredMentors.length === 0 ? (
        <div className="p-8">
          <EmptyState
            title="No Faculty Members Found"
            description={searchTerm ? `No faculty match "${searchTerm}".` : "No faculty mentors registered under selected filter."}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMentors.map((mentor) => {
            const dept = departments.find((d) => d.id === mentor.departmentId) || mentor.department;
            const isInactive = mentor.isActive === false;
            return (
              <div
                key={mentor.id}
                className={`app-card p-5 hover:border-blue-200 transition-all flex flex-col justify-between group shadow-2xs ${
                  isInactive ? "opacity-75 bg-slate-50/70" : ""
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs uppercase">
                      {mentor.fullName[0]}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                        {mentor.employeeId || "FACULTY"}
                      </span>
                      {mentor.role === "HOD" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                          HOD
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    onClick={() => setViewingFaculty(mentor)}
                    className="cursor-pointer"
                  >
                    <h3 className="text-sm font-bold text-slate-950 group-hover:text-blue-600 transition-colors">
                      {mentor.fullName}
                    </h3>
                    <div className="text-xs text-slate-500 font-medium flex flex-col gap-1 mt-0.5">
                      <span className="text-slate-700 font-semibold">{mentor.designation}</span>
                      <span className="flex items-center gap-1.5">
                        <Building2 size={12} className="text-slate-400" />
                        {dept ? dept.name : "Department Faculty"}
                      </span>
                      {mentor.email && (
                        <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                          <Mail size={11} /> {mentor.email}
                        </span>
                      )}
                      {mentor.phone && (
                        <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                          <Phone size={11} /> {mentor.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Assigned Mentees: <strong className="text-slate-900">{mentor.assignedMenteesCount ?? 0}</strong></span>
                      <span>Advisories: <strong className="text-slate-900">{mentor.meetingsLoggedCount ?? 0}</strong></span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                      isInactive
                        ? "text-slate-500 bg-slate-100 border-slate-200"
                        : "text-emerald-700 bg-emerald-50 border-emerald-200/60"
                    }`}
                  >
                    <Shield size={10} /> {isInactive ? "Deactivated" : "Active Advisor"}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isAdmin && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(mentor);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg transition-colors border border-blue-200 cursor-pointer shadow-2xs"
                          title="Edit Faculty Details"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(mentor);
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isInactive
                              ? "text-emerald-600 hover:bg-emerald-50"
                              : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          }`}
                          title={isInactive ? "Restore & Activate Faculty" : "Deactivate Faculty (Safe Archive)"}
                        >
                          <Power size={13} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/students?mentorId=${mentor.id}`);
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer ml-1"
                    >
                      Mentees <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Faculty Modal (Admin only) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Plus size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Add Faculty Member</h2>
                  <p className="text-[11px] text-slate-500">Register mentor and provision portal login</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 overflow-y-auto">
              {createError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createFullName}
                    onChange={(e) => setCreateFullName(e.target.value)}
                    placeholder="Dr. Rajesh Kannan"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="rajesh.k@college.edu"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={createDeptId}
                    onChange={(e) => setCreateDeptId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createDesignation}
                    onChange={(e) => setCreateDesignation(e.target.value)}
                    placeholder="Associate Professor"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={createEmployeeId}
                    onChange={(e) => setCreateEmployeeId(e.target.value)}
                    placeholder="EMP-1044"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={createQualification}
                    onChange={(e) => setCreateQualification(e.target.value)}
                    placeholder="M.Tech, Ph.D."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={createExperience}
                    onChange={(e) => setCreateExperience(e.target.value)}
                    placeholder="8"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization Area</label>
                <input
                  type="text"
                  value={createSpecialization}
                  onChange={(e) => setCreateSpecialization(e.target.value)}
                  placeholder="Machine Learning, Cloud Systems"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                />
              </div>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createIsHOD}
                  onChange={(e) => setCreateIsHOD(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-900">Appoint as Head of Department (HOD)</span>
                  <p className="text-[11px] text-slate-500">Grants departmental administrative authority</p>
                </div>
              </label>

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
                  {submittingCreate ? "Registering..." : "Register Faculty"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Faculty Modal */}
      {editingFaculty && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Edit2 size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Edit Faculty Profile</h2>
                  <p className="text-[11px] text-slate-500">{editingFaculty.fullName}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingFaculty(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 overflow-y-auto">
              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    required
                    value={editDeptId}
                    onChange={(e) => setEditDeptId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={editEmployeeId}
                    onChange={(e) => setEditEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={editExperience}
                    onChange={(e) => setEditExperience(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={editQualification}
                    onChange={(e) => setEditQualification(e.target.value)}
                    placeholder="e.g. M.E., Ph.D."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={editSpecialization}
                    onChange={(e) => setEditSpecialization(e.target.value)}
                    placeholder="e.g. Artificial Intelligence, Data Systems"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingFaculty(null)}
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

      {/* Detailed Faculty Profile Modal */}
      {viewingFaculty && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl font-bold border border-white/20 uppercase">
                  {viewingFaculty.fullName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">{viewingFaculty.fullName}</h2>
                    {viewingFaculty.role === "HOD" && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-200 text-purple-900">
                        HOD
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-blue-100">
                    {viewingFaculty.designation} · {departments.find(d => d.id === viewingFaculty.departmentId)?.name || viewingFaculty.department?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={() => {
                      const f = viewingFaculty;
                      setViewingFaculty(null);
                      openEditModal(f);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Edit2 size={13} /> Edit Faculty
                  </button>
                )}
                <button
                  onClick={() => setViewingFaculty(null)}
                  className="p-1.5 text-white/80 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Employee ID</span>
                  <span className="font-mono font-bold text-slate-800">{viewingFaculty.employeeId || "Unassigned"}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Status</span>
                  <span className={`font-semibold ${viewingFaculty.isActive !== false ? "text-emerald-700" : "text-slate-500"}`}>
                    {viewingFaculty.isActive !== false ? "Active Advisor" : "Deactivated"}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Official Email</span>
                  <span className="font-mono text-slate-800">{viewingFaculty.email || "—"}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Phone</span>
                  <span className="font-mono text-slate-800">{viewingFaculty.phone || "—"}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Qualification</span>
                  <span className="font-medium text-slate-800">{viewingFaculty.qualification || "—"}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Experience</span>
                  <span className="font-medium text-slate-800">{viewingFaculty.experienceYears ? `${viewingFaculty.experienceYears} Years` : "—"}</span>
                </div>
              </div>

              {viewingFaculty.specialization && (
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs">
                  <span className="text-blue-600 font-semibold block mb-0.5">Specialization Area</span>
                  <span className="text-slate-800">{viewingFaculty.specialization}</span>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block">Assigned Mentees</span>
                  <strong className="text-sm font-bold text-slate-900">{viewingFaculty.assignedMenteesCount ?? 0} Students</strong>
                </div>
                <button
                  onClick={() => {
                    navigate(`/students?mentorId=${viewingFaculty.id}`);
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  View Mentees List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
