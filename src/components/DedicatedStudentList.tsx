import { useEffect, useState } from "react";
import {
  Search,
  X,
  Users,
  GraduationCap,
  Sparkles,
  Phone,
  Mail,
  ArrowRight,
  TrendingDown,
  Building2,
  SlidersHorizontal,
  ChevronRight,
  MapPin,
  Calendar,
  Layers,
  HeartCrack,
} from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { LoadingState, ErrorState, EmptyState } from "./ui/LoadingState";
import { RiskDot } from "./ui/RiskSeal";
import { Badge } from "./ui/Badge";
import { Student } from "../types";
import { useNavigate } from "react-router-dom";

interface DedicatedStudentListProps {
  onClose?: () => void;
  title?: string;
}

export default function DedicatedStudentList({ onClose, title = "Dedicated Student Directory" }: DedicatedStudentListProps) {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
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
  }, []);

  // Filter students based on search query, risk, year, and section
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.registerNumber.toLowerCase().includes(search.toLowerCase()) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesRisk = riskFilter === "ALL" || (s.latestRisk && s.latestRisk.riskLevel === riskFilter);
    const matchesYear = yearFilter === "ALL" || s.year === yearFilter;
    const matchesSection = sectionFilter === "ALL" || s.section.toUpperCase() === sectionFilter.toUpperCase();
    return matchesSearch && matchesRisk && matchesYear && matchesSection;
  });

  // Extract unique sections for filters
  const sections = Array.from(new Set(students.map((s) => s.section.toUpperCase()))).sort();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs animate-in fade-in duration-200">
        <LoadingState label="Loading matching cohort profiles from database..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs animate-in fade-in duration-200">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Directory Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-slate-800 text-sky-300 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border border-slate-700">
              <Sparkles size={11} /> Multi-Tier Scope Check
            </span>
            <span className="text-xs text-slate-400 font-mono">Real-time DB-Synced View</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-xs text-slate-300">
            Dynamically displays <span className="font-semibold text-white">{filteredStudents.length} of {students.length} students</span> under your active administrative role boundary.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="self-start md:self-center flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl p-2 border border-slate-700 transition-colors shadow-xs"
            title="Return to Overview"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Control Panel: Search & Advanced Filter Bars */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input autoComplete="off"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or reg no..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 transition-all"
          />
        </div>
        <div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="CRITICAL">Critical Risk</option>
          </select>
        </div>
        <div>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          >
            <option value="ALL">All Years</option>
            <option value="I">Year I</option>
            <option value="II">Year II</option>
            <option value="III">Year III</option>
            <option value="IV">Year IV</option>
          </select>
        </div>
        <div>
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          >
            <option value="ALL">All Sections</option>
            {sections.map((sect) => (
              <option key={sect} value={sect}>
                Section {sect}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Directory & Detail QuickView Container */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Student Directory Feed */}
        <div className={`xl:col-span-2 space-y-3 ${selectedStudent ? "hidden md:block" : ""}`}>
          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
              <EmptyState
                title="No matching students found"
                hint="Refine your query filters or try a different keyword to search our directory records."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`app-card p-4 flex items-center justify-between gap-4 cursor-pointer hover:border-blue-500/50 hover:bg-blue-50/10 transition-all group ${
                    selectedStudent?.id === student.id ? "border-blue-600 bg-blue-50/15" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 uppercase border border-slate-200 text-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-colors">
                      {student.fullName[0]}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs md:text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                        {student.fullName}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                        {student.rollNumber ? <span className="text-slate-700 font-semibold">{student.rollNumber} • </span> : ""}Reg: {student.registerNumber} • Yr {student.year}-{student.section}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Badge tone={student.attendancePercentage < 85 ? "danger" : "success"} size="sm">
                          {student.attendancePercentage}% Att.
                        </Badge>
                        <Badge tone="info" size="sm">
                          {student.cgpa.toFixed(2)} CGPA
                        </Badge>
                        {student.arrearCount > 0 && (
                          <Badge tone="warning" size="sm">
                            {student.arrearCount} Arrears
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {student.latestRisk && (
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 rounded-lg p-0.5">
                        <RiskDot level={student.latestRisk.riskLevel} compact={true} />
                      </div>
                    )}
                    <ChevronRight size={15} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Student Profile QuickView / Details Drawer */}
        <div className={`xl:col-span-1 ${!selectedStudent ? "hidden xl:block" : ""}`}>
          {selectedStudent ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs sticky top-20 space-y-5 animate-in slide-in-from-right-4 duration-300">
              {/* Profile Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center uppercase text-base border border-blue-500 shadow-xs shrink-0">
                    {selectedStudent.fullName[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{selectedStudent.fullName}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {selectedStudent.rollNumber ? <span className="text-blue-700 font-semibold">{selectedStudent.rollNumber} • </span> : ""}Reg: {selectedStudent.registerNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Dynamic Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => navigate(`/students/${selectedStudent.id}`)}
                  className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold py-2 px-3 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Full Profile <ArrowRight size={12} />
                </button>
                <button
                  onClick={() => navigate(`/meetings?studentId=${selectedStudent.id}`)}
                  className="w-full flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold py-2 px-3 rounded-xl transition-colors cursor-pointer"
                >
                  Record Advisory
                </button>
              </div>

              {/* Detailed Academic Dashboard */}
              <div className="space-y-3.5 pt-3 border-t border-slate-100">
                <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Academic Overview</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
                    <p className="text-[10px] font-medium text-slate-400">Attendance</p>
                    <p className={`text-sm font-bold mt-0.5 ${selectedStudent.attendancePercentage < 85 ? "text-rose-600" : "text-emerald-600"}`}>
                      {selectedStudent.attendancePercentage}%
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
                    <p className="text-[10px] font-medium text-slate-400">CGPA</p>
                    <p className="text-sm font-bold text-indigo-600 mt-0.5">{selectedStudent.cgpa.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
                    <p className="text-[10px] font-medium text-slate-400">Arrears</p>
                    <p className={`text-sm font-bold mt-0.5 ${selectedStudent.arrearCount > 0 ? "text-amber-500" : "text-slate-700"}`}>
                      {selectedStudent.arrearCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Career & Placement status */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Placement & Career</h4>
                <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                  <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                    <span className="font-medium">Placement Eligibility</span>
                    <Badge tone={selectedStudent.placementStatus === "PLACED" ? "success" : "info"} size="sm">
                      {selectedStudent.placementStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                    <span className="font-medium">Internship Progress</span>
                    <Badge tone={selectedStudent.internshipStatus === "COMPLETED" ? "success" : "warning"} size="sm">
                      {selectedStudent.internshipStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                    <span className="font-medium">Industry Certifications</span>
                    <span className="font-bold text-slate-800">{selectedStudent.certificationCount} earned</span>
                  </div>
                </div>
              </div>

              {/* Parent & Contact details */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Contact & Parent Records</h4>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100 truncate">
                    <Phone size={13} className="text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{selectedStudent.phone || "No direct phone"}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100 truncate">
                    <Mail size={13} className="text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{selectedStudent.email || "No email"}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100 truncate">
                    <Users size={13} className="text-slate-400 shrink-0" />
                    <span className="font-medium truncate">Parent: {selectedStudent.parentName || "Unrecorded"}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100 truncate">
                    <Phone size={13} className="text-slate-400 shrink-0" />
                    <span className="font-medium truncate">Parent Contact: {selectedStudent.parentContact || "Unrecorded"}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 h-full flex flex-col items-center justify-center py-20">
              <Users size={24} className="text-slate-300 mb-2" />
              <p className="text-xs font-medium">Select a student record to trigger the QuickView detailed profile drawer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
