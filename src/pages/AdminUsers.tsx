import React, { useState, useEffect } from "react";
import {
  Users,
  Sparkles,
  Search,
  UserPlus,
  Shield,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Edit2,
  RefreshCw,
  Power,
  Building2,
  GraduationCap
} from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/LoadingState";
import { BackButton } from "../components/ui/BackButton";

interface UserItem {
  id: string;
  email: string;
  role: "ADMIN" | "HOD" | "MENTOR" | "STUDENT";
  isActive: boolean;
  displayName: string;
  createdAt: string;
  department: { id: string; name: string; code: string } | null;
  mentor?: { id: string; fullName: string; employeeId: string; designation: string } | null;
  student?: { id: string; fullName: string; registerNumber: string; year: string; section: string } | null;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string; code: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create User Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createRole, setCreateRole] = useState<"ADMIN" | "HOD" | "MENTOR" | "STUDENT">("MENTOR");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("Welcome@123");
  const [createFullName, setCreateFullName] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createDeptId, setCreateDeptId] = useState("");
  const [createEmployeeId, setCreateEmployeeId] = useState("");
  const [createDesignation, setCreateDesignation] = useState("Assistant Professor");
  const [createRegNum, setCreateRegNum] = useState("");
  const [createYear, setCreateYear] = useState("1");
  const [createSection, setCreateSection] = useState("A");
  const [createBatch, setCreateBatch] = useState("2024-2028");
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit / Password Reset Modal State
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"ADMIN" | "HOD" | "MENTOR" | "STUDENT">("MENTOR");
  const [editFullName, setEditFullName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, deptsRes] = await Promise.all([
        api.get("/admin/users", {
          params: {
            role: roleFilter !== "ALL" ? roleFilter : undefined,
            isActive: statusFilter !== "ALL" ? (statusFilter === "ACTIVE" ? "true" : "false") : undefined,
            search: searchTerm ? searchTerm : undefined,
          },
        }),
        api.get("/departments"),
      ]);

      setUsers(usersRes.data.data?.items || []);
      const depts = deptsRes.data.data || [];
      setDepartments(depts);
      if (depts.length > 0 && !createDeptId) {
        setCreateDeptId(depts[0].id);
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
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleToggleStatus = async (user: UserItem) => {
    try {
      const newStatus = !user.isActive;
      await api.post(`/admin/users/${user.id}/status`, { isActive: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: newStatus } : u))
      );
      setActionSuccess(`User ${user.email} ${newStatus ? "restored and activated" : "deactivated"} successfully.`);
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setSubmittingCreate(true);
    try {
      await api.post("/admin/users", {
        email: createEmail,
        password: createPassword,
        role: createRole,
        fullName: createFullName,
        phone: createPhone || undefined,
        departmentId: createDeptId || undefined,
        employeeId: createEmployeeId || undefined,
        designation: createDesignation || undefined,
        registerNumber: createRegNum || undefined,
        year: createYear,
        section: createSection,
        batch: createBatch,
      });

      setShowCreateModal(false);
      resetCreateForm();
      setActionSuccess(`User account created successfully.`);
      setTimeout(() => setActionSuccess(""), 4000);
      loadData();
    } catch (err) {
      setCreateError(apiErrorMessage(err));
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    if (!editingUser) return;
    setEditError("");
    setSubmittingEdit(true);
    try {
      await api.patch(`/admin/users/${editingUser.id}`, {
        email: editEmail,
        role: editRole,
        fullName: editFullName || undefined,
        password: editPassword.trim() ? editPassword.trim() : undefined,
      });

      setEditingUser(null);
      setActionSuccess(`User ${editEmail} updated successfully.`);
      setTimeout(() => setActionSuccess(""), 4000);
      loadData();
    } catch (err) {
      setEditError(apiErrorMessage(err));
    } finally {
      setSubmittingEdit(false);
    }
  };

  const resetCreateForm = () => {
    setCreateEmail("");
    setCreatePassword("Welcome@123");
    setCreateFullName("");
    setCreatePhone("");
    setCreateEmployeeId("");
    setCreateRegNum("");
    setCreateError("");
  };

  const openEditModal = (u: UserItem) => {
    setEditingUser(u);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditFullName(u.displayName);
    setEditPassword("");
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
              <span className="text-xs text-blue-800/80 font-medium">Identity & Access Control</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
              User Accounts Administration
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              Create and manage institutional accounts for Administrators, Heads of Department, Faculty Mentors, and Students.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <UserPlus size={14} />
              Create New User
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

      {/* Search and Filters Bar */}
      <div className="app-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by email, name, or register no..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 transition-all"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-500">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium text-slate-800"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Administrators</option>
              <option value="HOD">Heads of Department</option>
              <option value="MENTOR">Faculty Mentors</option>
              <option value="STUDENT">Students</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium text-slate-800"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Accounts</option>
              <option value="INACTIVE">Deactivated</option>
            </select>
          </div>

          <button
            onClick={() => loadData()}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh list"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="app-card overflow-hidden">
        {loading ? (
          <LoadingState label="Loading user directory..." />
        ) : error ? (
          <div className="p-6">
            <ErrorState error={error} onRetry={() => loadData()} />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No users found"
              description="No user accounts match the current filter and search criteria."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold">
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department / Cohort</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{u.displayName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                      {u.student?.registerNumber && (
                        <div className="text-[10px] text-blue-600 font-mono mt-0.5">
                          Reg: {u.student.registerNumber}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          u.role === "ADMIN"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : u.role === "HOD"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : u.role === "MENTOR"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {u.department ? (
                        <div>
                          <span className="font-medium text-slate-800">{u.department.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono ml-1">({u.department.code})</span>
                          {u.student && (
                            <div className="text-[10px] text-slate-500">
                              Year {u.student.year} · Sec {u.student.section}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Institution-Wide</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {u.isActive ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Deactivated
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit User / Reset Password"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            u.isActive
                              ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              : "text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={u.isActive ? "Deactivate User (Safe Archive)" : "Restore & Activate User"}
                        >
                          <Power size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserPlus size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Create Institutional User</h2>
                  <p className="text-[11px] text-slate-500">Provision a new account with RBAC credentials</p>
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Application Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["ADMIN", "HOD", "MENTOR", "STUDENT"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setCreateRole(r)}
                      className={`py-2 text-center text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        createRole === r
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="user@college.edu"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="Welcome@123"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>

              {(createRole === "HOD" || createRole === "MENTOR" || createRole === "STUDENT") && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
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
                        placeholder="Dr. Rajesh / Ananya Sen"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                      />
                    </div>

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

                  {(createRole === "MENTOR" || createRole === "HOD") && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID</label>
                        <input
                          type="text"
                          value={createEmployeeId}
                          onChange={(e) => setCreateEmployeeId(e.target.value)}
                          placeholder="EMP-1042"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                        <input
                          type="text"
                          value={createDesignation}
                          onChange={(e) => setCreateDesignation(e.target.value)}
                          placeholder="Assistant Professor"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                        />
                      </div>
                    </div>
                  )}

                  {createRole === "STUDENT" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Register Number <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={createRegNum}
                            onChange={(e) => setCreateRegNum(e.target.value)}
                            placeholder="21CS042"
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Period</label>
                          <input
                            type="text"
                            value={createBatch}
                            onChange={(e) => setCreateBatch(e.target.value)}
                            placeholder="2024-2028"
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
                          <select
                            value={createYear}
                            onChange={(e) => setCreateYear(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                          >
                            <option value="1">Year 1</option>
                            <option value="2">Year 2</option>
                            <option value="3">Year 3</option>
                            <option value="4">Year 4</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
                          <input
                            type="text"
                            value={createSection}
                            onChange={(e) => setCreateSection(e.target.value)}
                            placeholder="A"
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium uppercase"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                  {submittingCreate ? "Creating User..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Edit2 size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Edit User & Password Reset</h2>
                  <p className="text-[11px] text-slate-500">Update credentials for {editingUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="HOD">HOD</option>
                  <option value="MENTOR">MENTOR</option>
                  <option value="STUDENT">STUDENT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Display / Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reset Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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
