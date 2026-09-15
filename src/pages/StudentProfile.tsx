import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Download,
  FileText,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  User,
  GraduationCap,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  FileCheck,
  Edit3,
} from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/LoadingState";
import { RiskSeal } from "../components/ui/RiskSeal";
import { Badge } from "../components/ui/Badge";
import { Student } from "../types";
import { useAuth } from "../context/AuthContext";
import { BackButton } from "../components/ui/BackButton";
import { StudentFeeSection } from "../components/StudentFeeSection";
import { EditStudentModal } from "../components/admin/EditStudentModal";

const SEVERITY_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  LOW: "info",
  MEDIUM: "warning",
  HIGH: "danger",
  CRITICAL: "danger",
};

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  OPEN: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
  CLOSED: "neutral",
  PENDING: "warning",
  COMPLETED: "success",
  OVERDUE: "danger",
};

export default function StudentProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [student, setStudent] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"meetings" | "issues" | "actions" | "risk">("meetings");
  const [showEditModal, setShowEditModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  function load() {
    if (!id) return;
    api
      .get(`/students/${id}`)
      .then((res) => setStudent(res.data.data))
      .catch((err) => setError(apiErrorMessage(err)));
  }

  useEffect(load, [id]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!student) return <LoadingState label="Loading comprehensive student dossier..." />;

  const latestRisk = student.riskAssessments?.[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl">
      {/* Navigation & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackButton fallback="/students" label="Back to Students" />
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Dossier ID:</span>
          <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{student.id.slice(0, 8)}</span>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg("")}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Student Header Card */}
      <div className="app-card p-5 sm:p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-blue-50 text-blue-700 font-display text-2xl font-bold flex items-center justify-center border border-blue-100 shadow-xs shrink-0">
            {student.fullName[0]}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
                {student.fullName}
              </h1>
              {student.rollNumber ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200" title="Roll Number">
                  Roll: {student.rollNumber}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono text-slate-400 bg-slate-50 border border-slate-200">
                  Roll: Unassigned
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-100 text-slate-800 border border-slate-200" title="Register Number">
                Reg: {student.registerNumber}
              </span>
            </div>

            <p className="text-xs md:text-sm text-slate-500 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-700">Year {student.year} · Section {student.section}</span>
              <span>•</span>
              <span>{student.department?.name || "Department of Engineering"}</span>
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <User size={13} className="text-blue-600" />
                <span>Mentor: <strong className="text-slate-900">{student.mentor?.fullName || "Not assigned"}</strong></span>
              </span>
              {student.email && (
                <span className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  <Mail size={13} className="text-slate-400" />
                  <span>{student.email}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Seal & Action Exports */}
        <div className="flex flex-wrap items-center gap-3 self-start lg:self-center shrink-0">
          {latestRisk && <RiskSeal level={latestRisk.riskLevel} score={latestRisk.riskScore} size={56} />}
          
          {/* Admin Edit Button */}
          {user?.role === "ADMIN" && (
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all hover:shadow-md"
            >
              <Edit3 size={15} /> Edit Student
            </button>
          )}

          {user?.role !== "STUDENT" && (
            <div className="flex flex-row gap-2">
              <a
                href={`/api/export/student/${student.id}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary text-xs py-2 px-3.5 shadow-xs flex items-center gap-1.5"
              >
                <FileText size={14} /> Official PDF
              </a>
              <a
                href={`/api/export/student/${student.id}/excel`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
              >
                <Download size={14} /> Excel
              </a>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-4">
        <InfoCard
          label="Attendance Rate"
          value={`${student.attendancePercentage}%`}
          warn={student.attendancePercentage < 85}
          subtext={student.attendancePercentage < 85 ? "Below 85% threshold" : "Compliant with regulations"}
        />
        <InfoCard
          label="Academic CGPA"
          value={student.cgpa.toFixed(2)}
          subtext="Cumulative Performance"
        />
        <InfoCard
          label="Active Arrears"
          value={student.arrearCount}
          warn={student.arrearCount > 0}
          subtext={student.arrearCount > 0 ? "Requires academic coaching" : "Clean academic record"}
        />
        <InfoCard
          label="Certifications"
          value={student.certificationCount}
          subtext="Skill validations logged"
        />
        <InfoCard
          label="Placement Status"
          value={student.placementStatus.replace(/_/g, " ")}
          subtext="Campus recruitment readiness"
        />
        <InfoCard
          label="Internship Track"
          value={student.internshipStatus.replace(/_/g, " ")}
          subtext="Industry training credits"
        />
        <InfoCard
          label="Parent Contact"
          value={student.parentContact ?? "Not on record"}
          subtext="Emergency & communication"
        />
        <InfoCard
          label="Advisory Sessions"
          value={student.meetings?.length || 0}
          subtext="1:1 meetings logged"
        />
        <InfoCard
          label="Fee Status"
          value={student.feeDetails?.feeStatusLabel || "Unavailable"}
          warn={student.feeDetails?.feeStatus === "OVERDUE"}
          subtext={
            student.feeDetails?.hasFeeData
              ? student.feeDetails?.feeStatus === "PAID"
                ? "All dues settled"
                : student.feeDetails?.outstandingAmount !== null && student.feeDetails?.outstandingAmount !== undefined
                ? `Due: ₹${student.feeDetails.outstandingAmount.toLocaleString("en-IN")}`
                : "Active fee schedule"
              : "No fee record logged"
          }
        />
      </div>

      {/* Academic & Professional Profiling Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Academic Details */}
        <div className="app-card p-5 sm:p-6 space-y-4">
          <div className="border-b border-blue-50 pb-2.5">
            <h3 className="font-display font-bold text-slate-900 text-sm">Academic Standings</h3>
            <p className="text-[10px] text-slate-500">Official university registration parameters</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Roll Number</p>
              <p className="text-blue-700 font-mono font-bold mt-0.5">{student.rollNumber || "Not assigned"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Register Number</p>
              <p className="text-slate-800 font-mono font-bold mt-0.5">{student.registerNumber}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Semester</p>
              <p className="text-slate-800 font-bold mt-0.5">Semester {student.semester || "N/A"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Admission Year</p>
              <p className="text-slate-800 font-bold mt-0.5">{student.admissionYear || "N/A"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Admission ID</p>
              <p className="text-slate-800 font-mono font-bold mt-0.5">{student.admissionNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Branch Section</p>
              <p className="text-slate-800 font-bold mt-0.5">Year {student.year} - Sec {student.section}</p>
            </div>
          </div>
        </div>

        {/* Career & Skills Info */}
        <div className="app-card p-5 sm:p-6 space-y-4">
          <div className="border-b border-blue-50 pb-2.5">
            <h3 className="font-display font-bold text-slate-900 text-sm">Career & Professional Readiness</h3>
            <p className="text-[10px] text-slate-500">Skills, aspirations, and industrial profiling</p>
          </div>
          <div className="space-y-3.5 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Career Aspiration</p>
              <p className="text-slate-800 font-semibold mt-0.5">{student.careerGoal || "Not specified"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Target Industry Role</p>
              <p className="text-slate-800 font-semibold mt-0.5">{student.targetRole || "Not specified"}</p>
            </div>
            {student.skills && student.skills.length > 0 && (
              <div>
                <p className="text-slate-400 font-medium mb-1">Core Tech Stack & Skills</p>
                <div className="flex flex-wrap gap-1">
                  {student.skills.map((s: string, idx: number) => (
                    <span key={idx} className="bg-sky-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-medium border border-blue-100">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {student.certifications && student.certifications.length > 0 && (
              <div>
                <p className="text-slate-400 font-medium mb-1">Earned Certifications</p>
                <div className="flex flex-wrap gap-1">
                  {student.certifications.map((c: string, idx: number) => (
                    <span key={idx} className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-100">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Student Fee Details & Status Section */}
      <StudentFeeSection
        studentId={student.id}
        feeDetails={student.feeDetails}
        userRole={user?.role}
        onFeeUpdated={load}
      />

      {/* Interactive Tabbed Detail History */}
      <div className="app-card overflow-hidden">
        <div className="flex border-b border-line bg-surface/40 px-3 pt-2 gap-1 overflow-x-auto">
          {[
            { id: "meetings", label: "Mentoring Sessions", count: student.meetings?.length },
            { id: "issues", label: "Flagged Concerns", count: student.issues?.length },
            { id: "actions", label: "Action Roadmap", count: student.actionItems?.length },
            { id: "risk", label: "AI Risk History", count: student.riskAssessments?.length },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                tab === t.id
                  ? "border-blue-600 text-blue-700 bg-white shadow-xs rounded-t-lg"
                  : "border-transparent text-slate-muted hover:text-navy hover:bg-white/50"
              }`}
            >
              <span>{t.label}</span>
              {typeof t.count === "number" && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    tab === t.id ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5 md:p-6">
          {/* TAB: MEETINGS */}
          {tab === "meetings" && (
            <div className="space-y-4">
              {(student.meetings ?? []).length === 0 ? (
                <EmptyState
                  title="No meetings recorded"
                  hint="Schedule a 1:1 meeting with this mentee to document progress and concerns."
                />
              ) : (
                student.meetings?.map((m: any) => (
                  <div
                    key={m.id}
                    className="border border-line rounded-xl p-5 hover:border-blue-200 transition-colors bg-white space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={15} className="text-blue-600" />
                        <span className="font-display font-bold text-navy text-sm">
                          {new Date(m.meetingDate).toLocaleDateString(undefined, {
                            dateStyle: "full",
                          })}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                          {m.meetingType}
                        </span>
                      </div>
                      <Badge
                        tone={
                          m.aiStatus === "COMPLETED"
                            ? "success"
                            : m.aiStatus === "FAILED"
                            ? "danger"
                            : "neutral"
                        }
                      >
                        AI {m.aiStatus.toLowerCase()}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-muted uppercase tracking-wider mb-1">
                        Discussion / AI Summary
                      </p>
                      <p className="text-sm text-navy leading-relaxed bg-surface/40 p-3 rounded-lg border border-line">
                        {m.aiSummary ?? m.discussionSummary}
                      </p>
                    </div>

                    {m.aiKeyConcerns?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-slate-muted uppercase tracking-wider mb-1.5">
                          Identified Key Points
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {m.aiKeyConcerns.map((c: any, i: any) => (
                            <Badge key={i} tone="warning">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: ISSUES */}
          {tab === "issues" && (
            <div className="space-y-3">
              {(student.issues ?? []).length === 0 ? (
                <EmptyState
                  title="No recorded issues"
                  hint="This student currently has zero unresolved escalations."
                  icon={<FileCheck size={32} className="text-emerald-500" />}
                />
              ) : (
                student.issues?.map((i: any) => (
                  <div
                    key={i.id}
                    className="border border-line rounded-xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-white"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {i.category.replace(/_/g, " ")}
                      </span>
                      <p className="text-sm font-semibold text-navy mt-2 leading-relaxed">
                        {i.description}
                      </p>
                      <p className="text-xs text-slate-muted mt-1">
                        Logged on {new Date(i.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                      <Badge tone={SEVERITY_TONE[i.severity]}>{i.severity}</Badge>
                      <Badge tone={STATUS_TONE[i.status]}>{i.status.replace("_", " ")}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: ACTIONS */}
          {tab === "actions" && (
            <div className="space-y-3">
              {(student.actionItems ?? []).length === 0 ? (
                <EmptyState
                  title="No assigned action tasks"
                  hint="Create actionable follow-up commitments from your mentoring sessions."
                />
              ) : (
                student.actionItems?.map((a: any) => (
                  <div
                    key={a.id}
                    className="border border-line rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white"
                  >
                    <div>
                      <p className="text-sm font-bold text-navy">{a.description}</p>
                      <p className="text-xs text-slate-muted mt-1 flex items-center gap-1.5">
                        <Clock size={12} />
                        Due {new Date(a.targetCompletionDate).toLocaleDateString()} · Assigned to {a.assignedTo}
                      </p>
                    </div>
                    <Badge tone={STATUS_TONE[a.status]}>{a.status.replace("_", " ")}</Badge>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: RISK */}
          {tab === "risk" && (
            <div className="space-y-4">
              {(student.riskAssessments ?? []).length === 0 ? (
                <EmptyState
                  title="No risk assessments recorded"
                  hint="AI risk seals are automatically computed when sessions and grades are submitted."
                />
              ) : (
                student.riskAssessments?.map((r: any) => (
                  <div
                    key={r.id}
                    className="border border-line rounded-xl p-5 bg-white space-y-4 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-muted uppercase tracking-wider">
                          Evaluation Timestamp
                        </p>
                        <p className="font-display text-sm font-bold text-navy mt-0.5">
                          {new Date(r.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <RiskSeal level={r.riskLevel} score={r.riskScore} size={48} />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-muted uppercase tracking-wider mb-2">
                        Weighted Factor Breakdown
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {r.breakdown?.map((b: any, idx: any) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs bg-surface/70 border border-line rounded-lg px-3 py-2"
                          >
                            <span className="text-slate-700 font-medium">{b.label}</span>
                            <span className="font-mono text-navy font-bold">+{b.points} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Admin Edit Modal */}
      {user?.role === "ADMIN" && (
        <EditStudentModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          student={student}
          onSuccess={(updatedStudent) => {
            setStudent(updatedStudent);
            setSuccessMsg(`Changes saved successfully for ${updatedStudent.fullName}.`);
            setTimeout(() => setSuccessMsg(""), 6000);
            load();
          }}
        />
      )}
    </div>
  );
}

function InfoCard({
  label,
  value,
  warn,
  subtext,
}: {
  label: string;
  value: string | number;
  warn?: boolean;
  subtext?: string;
}) {
  return (
    <div className="app-card p-4 flex flex-col justify-between">
      <div>
        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-muted mb-1">{label}</p>
        <p className={`font-display text-xl font-bold ${warn ? "text-rose-600" : "text-navy"}`}>
          {value}
        </p>
      </div>
      {subtext && <p className="text-[11px] text-slate-muted mt-2 truncate">{subtext}</p>}
    </div>
  );
}

