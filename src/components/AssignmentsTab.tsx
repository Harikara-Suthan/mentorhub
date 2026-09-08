import { useEffect, useState } from "react";
import { Search, Users, RefreshCw, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { Mentor, Student } from "../types";
import { LoadingState, ErrorState } from "./ui/LoadingState";

interface AssignmentsTabProps {
  mentors: Mentor[];
}

export default function AssignmentsTab({ mentors }: AssignmentsTabProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  function loadStudents() {
    setLoading(true);
    api
      .get("/students")
      .then((res) => {
        setStudents(res.data.data.items || []);
        setError("");
      })
      .catch((err) => {
        setError(apiErrorMessage(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const handleAssignMentor = async (studentId: string, mentorId: string) => {
    setUpdatingId(studentId);
    setSuccessMessage("");
    try {
      await api.put(`/students/${studentId}`, { mentorId });
      
      // Update local state to reflect the change
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, mentorId } : s))
      );
      
      const studentName = students.find((s) => s.id === studentId)?.fullName || "Student";
      const mentorName = mentors.find((m) => m.id === mentorId)?.fullName || "new advisor";
      
      setSuccessMessage(`Successfully reassigned ${studentName} to ${mentorName}.`);
      
      // Auto-clear success toast after 4 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (err) {
      setError("Failed to update mentor assignment. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.registerNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs animate-in fade-in duration-200">
        <LoadingState label="Fetching active cohort directories from database..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
        <ErrorState message={error} onRetry={loadStudents} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Control Toolbar */}
      <div className="app-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input autoComplete="off"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students by name or Reg No..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 transition-all"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-semibold text-slate-800">{filteredStudents.length}</span> of <span className="font-semibold">{students.length}</span> students
        </div>
      </div>

      {/* Students Assignment Table */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <Users size={32} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-medium">No students found matching "{searchTerm}"</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 md:px-6">Student Details</th>
                  <th className="py-3.5 px-4 md:px-6">Cohort Info</th>
                  <th className="py-3.5 px-4 md:px-6">Performance</th>
                  <th className="py-3.5 px-4 md:px-6 min-w-[200px]">Assigned Mentor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/40 transition-colors">
                    {/* Student Name and Registration No */}
                    <td className="py-3 px-4 md:px-6">
                      <div className="font-bold text-slate-900">{student.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">Reg: {student.registerNumber}</div>
                    </td>

                    {/* Academic Cohort */}
                    <td className="py-3 px-4 md:px-6">
                      <div className="font-medium text-slate-700">Year {student.year}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Section {student.section.toUpperCase()}</div>
                    </td>

                    {/* Core KPI metrics */}
                    <td className="py-3 px-4 md:px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-slate-700">{student.cgpa.toFixed(2)} CGPA</span>
                        <span className={`text-[10px] ${student.attendancePercentage < 85 ? "text-rose-600 font-semibold" : "text-slate-400"}`}>
                          {student.attendancePercentage}% Attendance
                        </span>
                      </div>
                    </td>

                    {/* Assigned Mentor Advisor dropdown */}
                    <td className="py-3 px-4 md:px-6">
                      <div className="flex items-center gap-2.5">
                        <select
                          value={student.mentorId || ""}
                          disabled={updatingId === student.id}
                          onChange={(e) => handleAssignMentor(student.id, e.target.value)}
                          className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition-all disabled:opacity-50 min-w-[180px]"
                        >
                          <option value="" disabled>Select Faculty Mentor...</option>
                          {mentors.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.fullName} ({m.employeeId || "No ID"})
                            </option>
                          ))}
                        </select>
                        {updatingId === student.id && (
                          <RefreshCw size={13} className="animate-spin text-blue-500 shrink-0" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
