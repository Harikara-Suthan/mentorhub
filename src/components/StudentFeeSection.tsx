import React, { useState } from "react";
import {
  CreditCard,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Calendar,
  FileText,
  Plus,
  Shield,
  HelpCircle,
} from "lucide-react";
import { Badge } from "./ui/Badge";
import { StudentFeeSummary, FeeStatus } from "../types";
import { api, apiErrorMessage } from "../api/client";

interface StudentFeeSectionProps {
  studentId: string;
  feeDetails?: StudentFeeSummary;
  userRole?: string;
  onFeeUpdated?: () => void;
}

export const StudentFeeSection: React.FC<StudentFeeSectionProps> = ({
  studentId,
  feeDetails,
  userRole,
  onFeeUpdated,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    feeCategory: "Tuition & Academic Fees",
    academicYear: "2025-2026",
    semester: "1",
    totalFees: "",
    amountPaid: "",
    status: "PENDING",
    dueDate: "",
    lastPaymentDate: "",
    paymentReference: "",
    remarks: "",
  });

  const isMentor = userRole === "MENTOR";
  const canManageFees = userRole === "HOD" || userRole === "ADMIN";

  const getStatusBadge = (status?: FeeStatus) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} className="text-emerald-600" />
            Paid
          </span>
        );
      case "PARTIALLY_PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={13} className="text-amber-600" />
            Partially Paid
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={13} className="text-blue-600" />
            Pending
          </span>
        );
      case "OVERDUE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle size={13} className="text-rose-600" />
            Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <HelpCircle size={13} className="text-slate-400" />
            Fee information unavailable
          </span>
        );
    }
  };

  const handleAddFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.post(`/students/${studentId}/fees`, {
        feeCategory: formData.feeCategory.trim(),
        academicYear: formData.academicYear.trim() || undefined,
        semester: formData.semester ? Number(formData.semester) : undefined,
        totalFees: Number(formData.totalFees) || 0,
        amountPaid: Number(formData.amountPaid) || 0,
        status: formData.status,
        dueDate: formData.dueDate || undefined,
        lastPaymentDate: formData.lastPaymentDate || undefined,
        paymentReference: formData.paymentReference.trim() || undefined,
        remarks: formData.remarks.trim() || undefined,
      });

      setShowAddModal(false);
      setFormData({
        feeCategory: "Tuition & Academic Fees",
        academicYear: "2025-2026",
        semester: "1",
        totalFees: "",
        amountPaid: "",
        status: "PENDING",
        dueDate: "",
        lastPaymentDate: "",
        paymentReference: "",
        remarks: "",
      });
      if (onFeeUpdated) onFeeUpdated();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const hasData = feeDetails?.hasFeeData && feeDetails.feeStatus !== "UNAVAILABLE";

  return (
    <div className="app-card p-5 sm:p-6 space-y-5 border-slate-200 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shrink-0">
            <CreditCard size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-slate-900 text-base">Fee Details & Status</h3>
              {hasData && getStatusBadge(feeDetails?.feeStatus)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isMentor
                ? "Academic mentoring financial status overview"
                : "Real-time institutional fee accounting records from database"}
            </p>
          </div>
        </div>

        {canManageFees && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 self-start sm:self-center"
          >
            <Plus size={14} /> Record Fee / Payment
          </button>
        )}
      </div>

      {/* When NO fee data exists in the database */}
      {!hasData && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-6 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-200/70 text-slate-500 flex items-center justify-center mx-auto mb-2">
            <CreditCard size={18} />
          </div>
          <h4 className="font-display font-semibold text-slate-800 text-sm">
            Fee information unavailable
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No active fee assessment or payment records exist for this student in the database.
          </p>
          {canManageFees && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
              >
                <Plus size={13} /> Add first fee schedule for student
              </button>
            </div>
          )}
        </div>
      )}

      {/* If Mentor View: Restricted Privacy Display (Status Only) */}
      {hasData && isMentor && (
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">Mentee Fee Status</p>
              <div className="flex items-center gap-2">
                {getStatusBadge(feeDetails?.feeStatus)}
                {feeDetails?.academicYear && (
                  <span className="text-xs text-slate-600 font-medium">
                    (AY: {feeDetails.academicYear} {feeDetails.semester ? `· Sem ${feeDetails.semester}` : ""})
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
              <Shield size={13} className="text-slate-500" />
              <span>Sensitive details protected</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Faculty mentors have access to mentee fee status for academic clearance and enrollment monitoring. Detailed bank transaction references and billing statements are restricted.
          </p>
        </div>
      )}

      {/* If Student / HOD / Admin View with Real Database Data */}
      {hasData && !isMentor && (
        <div className="space-y-5">
          {/* Key Financial Totals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Fees</span>
              <p className="font-display text-xl font-bold text-slate-900 mt-1">
                ₹{feeDetails?.totalFees?.toLocaleString("en-IN") ?? "0"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                AY {feeDetails?.academicYear || "Current"} {feeDetails?.semester ? `· Semester ${feeDetails.semester}` : ""}
              </p>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Amount Paid</span>
              <p className="font-display text-xl font-bold text-emerald-800 mt-1">
                ₹{feeDetails?.amountPaid?.toLocaleString("en-IN") ?? "0"}
              </p>
              <p className="text-[11px] text-emerald-700/80 mt-1">
                {feeDetails?.lastPaymentDate
                  ? `Last paid: ${new Date(feeDetails.lastPaymentDate).toLocaleDateString()}`
                  : "Verified receipts"}
              </p>
            </div>

            <div
              className={`rounded-xl p-4 border ${
                (feeDetails?.outstandingAmount ?? 0) > 0
                  ? "bg-rose-50/60 border-rose-200/80 text-rose-900"
                  : "bg-slate-50/80 border-slate-200 text-slate-900"
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  (feeDetails?.outstandingAmount ?? 0) > 0 ? "text-rose-700" : "text-slate-400"
                }`}
              >
                Outstanding Due
              </span>
              <p
                className={`font-display text-xl font-bold mt-1 ${
                  (feeDetails?.outstandingAmount ?? 0) > 0 ? "text-rose-700" : "text-slate-800"
                }`}
              >
                ₹{feeDetails?.outstandingAmount?.toLocaleString("en-IN") ?? "0"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {(feeDetails?.outstandingAmount ?? 0) > 0 ? "Pending collection" : "All cleared"}
              </p>
            </div>
          </div>

          {/* Detailed Fee Records Table */}
          {feeDetails?.fees && feeDetails.fees.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Fee Breakdown & Transaction Ledgers
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3.5">Category & Term</th>
                      <th className="py-2.5 px-3.5 text-right">Total Fees</th>
                      <th className="py-2.5 px-3.5 text-right">Amount Paid</th>
                      <th className="py-2.5 px-3.5 text-right">Outstanding</th>
                      <th className="py-2.5 px-3.5">Status</th>
                      <th className="py-2.5 px-3.5">Transaction ID / Date</th>
                      <th className="py-2.5 px-3.5">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {feeDetails.fees.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3.5 font-medium text-slate-900">
                          <div>{record.feeCategory}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            {record.academicYear || "—"} {record.semester ? `· Sem ${record.semester}` : ""}
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono font-medium text-slate-900">
                          ₹{record.totalFees.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono font-medium text-emerald-700">
                          ₹{record.amountPaid.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono font-bold text-rose-700">
                          ₹{record.outstandingAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-3.5">{getStatusBadge(record.status)}</td>
                        <td className="py-3 px-3.5 text-slate-600">
                          {record.paymentReference ? (
                            <div className="font-mono text-[11px] font-semibold text-slate-800">
                              {record.paymentReference}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                          {record.lastPaymentDate && (
                            <div className="text-[10px] text-slate-400">
                              {new Date(record.lastPaymentDate).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-slate-500 text-[11px]">
                          {record.remarks || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal for Recording Real Database Fee Record */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-slate-900 text-lg">Record Fee Schedule / Payment</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleAddFeeSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fee Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.feeCategory}
                    onChange={(e) => setFormData({ ...formData, feeCategory: e.target.value })}
                    placeholder="e.g. Tuition Fee"
                    className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder="2025-2026"
                    className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Fees (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.totalFees}
                    onChange={(e) => setFormData({ ...formData, totalFees: e.target.value })}
                    placeholder="e.g. 75000"
                    className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount Paid (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.amountPaid}
                    onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                    placeholder="e.g. 75000"
                    className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-600 outline-none bg-white"
                  >
                    <option value="PAID">Paid</option>
                    <option value="PARTIALLY_PAID">Partially Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="OVERDUE">Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Transaction Ref / Receipt No</label>
                  <input
                    type="text"
                    value={formData.paymentReference}
                    onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                    placeholder="e.g. TXN987214"
                    className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Payment Date</label>
                  <input
                    type="date"
                    value={formData.lastPaymentDate}
                    onChange={(e) => setFormData({ ...formData, lastPaymentDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks</label>
                <input
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="e.g. Cleared 1st installment via NEFT"
                  className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs py-2 px-4 shadow-xs"
                >
                  {saving ? "Saving to PostgreSQL..." : "Save Fee Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
