import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  X,
  LayoutGrid,
  List,
  Filter,
  GraduationCap,
  Sparkles,
  Phone,
  Mail,
  ArrowRight,
  TrendingDown,
  Building2,
  SlidersHorizontal,
  UserCheck,
} from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/LoadingState";
import { RiskDot } from "../components/ui/RiskSeal";
import { Badge } from "../components/ui/Badge";
import { useAuth } from "../context/AuthContext";
import { Department, Mentor, Student } from "../types";

export default function Students() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [yearFilter, setYearFilter] = useState<string>("ALL");
  const [sectionFilter, setSectionFilter] = useState<string>("ALL");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [mentorFilter, setMentorFilter] = useState<string>("ALL");
  const [semesterFilter, setSemesterFilter] = useState<string>("ALL");
  const [attendanceFilter, setAttendanceFilter] = useState<string>("ALL");
  const [arrearsFilter, setArrearsFilter] = useState<string>("ALL");
  const [academicStatusFilter, setAcademicStatusFilter] = useState<string>("ALL");
  const [feeStatusFilter, setFeeStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);

  useEffect(() => {
    const tab = params.get("tab");
    if (tab === "attendance") {
      setAttendanceFilter("low");
    } else if (tab === "arrears") {
      setArrearsFilter("has");
    } else if (tab === "risk") {
      setRiskFilter("HIGH");
    } else if (tab === "academics") {
      setAcademicStatusFilter("Good");
    } else if (tab === "fees_due") {
      setFeeStatusFilter("OVERDUE");
    } else if (!tab) {
      // If no tab is specified, reset filters to default
      setAttendanceFilter("ALL");
      setArrearsFilter("ALL");
      setRiskFilter("ALL");
      setAcademicStatusFilter("ALL");
      setFeeStatusFilter("ALL");
    }
  }, [params]);

  function load() {
    setLoading(true);
    const queryParams: Record<string, any> = {
      page,
      pageSize,
    };
    if (search.trim()) queryParams.search = search;
    if (riskFilter !== "ALL") queryParams.riskLevel = riskFilter;
    if (yearFilter !== "ALL") queryParams.year = yearFilter;
    if (sectionFilter !== "ALL") queryParams.section = sectionFilter;
    if (deptFilter !== "ALL") queryParams.departmentId = deptFilter;
    if (mentorFilter !== "ALL") queryParams.mentorId = mentorFilter;
    if (semesterFilter !== "ALL") queryParams.semester = semesterFilter;
    if (attendanceFilter !== "ALL") queryParams.attendance = attendanceFilter;
    if (arrearsFilter !== "ALL") queryParams.arrears = arrearsFilter;
    if (academicStatusFilter !== "ALL") queryParams.academicStatus = academicStatusFilter;
    if (feeStatusFilter !== "ALL") queryParams.feeStatus = feeStatusFilter;

    api
      .get("/students", { params: queryParams })
      .then((res) => {
        setStudents(res.data.data.items || []);
        setTotal(res.data.data.total || 0);
        setError("");
      })
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, riskFilter, yearFilter, sectionFilter, deptFilter, mentorFilter, semesterFilter, attendanceFilter, arrearsFilter, academicStatusFilter, feeStatusFilter]);

  useEffect(() => {
    api.get("/departments").then((res) => setDepartments(res.data.data || []));
    api.get("/departments/mentors/all").then((res) => setMentors(res.data.data || []));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const tabValue = params.get("tab");
      const nextParams: Record<string, string> = {};
      if (search) nextParams.search = search;
      if (tabValue) nextParams.tab = tabValue;
      setParams(nextParams);
      setPage(1);
      load();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const renderFeeStatusBadge = (status?: string) => {
    switch (status) {
      case "PAID":
        return <Badge tone="success" size="sm">Paid</Badge>;
      case "PARTIALLY_PAID":
        return <Badge tone="warning" size="sm">Partial</Badge>;
      case "PENDING":
        return <Badge tone="info" size="sm">Pending</Badge>;
      case "OVERDUE":
        return <Badge tone="danger" size="sm">Overdue</Badge>;
      default:
        return <span className="text-[11px] text-slate-400 font-medium">Unavailable</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Directory</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/70">
              {total} Active Records
            </span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Student Cohort
          </h1>
        </div>

        {user?.role !== "STUDENT" && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary text-xs py-2 px-3.5 self-start sm:self-auto shadow-xs"
          >
            <Plus size={14} /> Add New Mentee
          </button>
        )}
      </div>

      {/* Filter and Control Bar */}
      <div className="app-card p-3.5 flex flex-col gap-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input autoComplete="off"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, reg. number, phone, email, advisor..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs md:text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-xl self-end md:self-auto">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "table" ? "bg-white shadow-xs text-slate-900" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Table View"
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-white shadow-xs text-slate-900" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>

        {/* Advance Filter Options Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          {/* Dept filter for HOD only */}
          {user?.role === "HOD" && (
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
              className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          )}

          {/* Mentor filter for HOD only */}
          {user?.role === "HOD" && (
            <select
              value={mentorFilter}
              onChange={(e) => { setMentorFilter(e.target.value); setPage(1); }}
              className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
            >
              <option value="ALL">All Staff Advisors</option>
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>{m.fullName}</option>
              ))}
            </select>
          )}

          {/* Year Filter */}
          <select
            value={yearFilter}
            onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
            className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          >
            <option value="ALL">All Years</option>
            <option value="I">Year I</option>
            <option value="II">Year II</option>
            <option value="III">Year III</option>
            <option value="IV">Year IV</option>
          </select>

          {/* Section Filter */}
          <select
            value={sectionFilter}
            onChange={(e) => { setSectionFilter(e.target.value); setPage(1); }}
            className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          >
            <option value="ALL">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
            <option value="D">Section D</option>
          </select>

          {/* Semester Filter */}
          <select
            value={semesterFilter}
            onChange={(e) => { setSemesterFilter(e.target.value); setPage(1); }}
            className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          >
            <option value="ALL">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
            <option value="7">Semester 7</option>
            <option value="8">Semester 8</option>
          </select>

          {/* Attendance Filter */}
          <select
            value={attendanceFilter}
            onChange={(e) => { setAttendanceFilter(e.target.value); setPage(1); }}
            className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          >
            <option value="ALL">All Attendance</option>
            <option value="low">Attendance below 85%</option>
          </select>

          {/* Arrears Filter */}
          <select
            value={arrearsFilter}
            onChange={(e) => { setArrearsFilter(e.target.value); setPage(1); }}
            className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          >
            <option value="ALL">All Arrears</option>
            <option value="has">With Backlogs</option>
          </select>

          {/* Academic Status Filter */}
          <select
            value={academicStatusFilter}
            onChange={(e) => { setAcademicStatusFilter(e.target.value); setPage(1); }}
            className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          >
            <option value="ALL">All Statuses</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Average">Average</option>
            <option value="At Risk">At Risk</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
            className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="CRITICAL">Critical Risk</option>
          </select>

          {/* Fee Status Filter */}
          <select
            value={feeStatusFilter}
            onChange={(e) => { setFeeStatusFilter(e.target.value); setPage(1); }}
            className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          >
            <option value="ALL">All Fee Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="PENDING">Pending</option>
            <option value="OVERDUE">Overdue</option>
            <option value="UNAVAILABLE">Fee Info Unavailable</option>
          </select>

          {/* Reset Filters Option */}
          {(search || riskFilter !== "ALL" || yearFilter !== "ALL" || sectionFilter !== "ALL" || deptFilter !== "ALL" || mentorFilter !== "ALL" || semesterFilter !== "ALL" || attendanceFilter !== "ALL" || arrearsFilter !== "ALL" || academicStatusFilter !== "ALL" || feeStatusFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearch("");
                setRiskFilter("ALL");
                setYearFilter("ALL");
                setSectionFilter("ALL");
                setDeptFilter("ALL");
                setMentorFilter("ALL");
                setSemesterFilter("ALL");
                setAttendanceFilter("ALL");
                setArrearsFilter("ALL");
                setAcademicStatusFilter("ALL");
                setFeeStatusFilter("ALL");
                setParams({});
                setPage(1);
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline px-2 cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {loading && !error && <LoadingState label="Searching real-time student directory database..." />}
      
      {!loading && !error && students.length === 0 && (
        <EmptyState
          title="No students found"
          hint="Try refining your search query, selecting another class filter, or clearing search criteria."
          action={search || riskFilter !== "ALL" || yearFilter !== "ALL" || sectionFilter !== "ALL" || deptFilter !== "ALL" || mentorFilter !== "ALL" ? {
            label: "Reset Directory Search",
            onClick: () => {
              setSearch("");
              setRiskFilter("ALL");
              setYearFilter("ALL");
              setSectionFilter("ALL");
              setDeptFilter("ALL");
              setMentorFilter("ALL");
              setPage(1);
            },
          } : undefined}
        />
      )}

      {/* TABLE VIEW */}
      {!loading && students.length > 0 && viewMode === "table" && (
        <div className="app-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="px-5 py-3">Student Information</th>
                  <th className="px-5 py-3">Roll No.</th>
                  <th className="px-5 py-3">Register No.</th>
                  <th className="px-5 py-3">Department & Advisor</th>
                  <th className="px-5 py-3">Year / Sec</th>
                  <th className="px-5 py-3">Attendance</th>
                  <th className="px-5 py-3">CGPA / Arrears</th>
                  <th className="px-5 py-3">Fee Status</th>
                  <th className="px-5 py-3">AI Risk Seal</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/students/${s.id}`)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200/70 shrink-0">
                          {s.fullName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {s.fullName}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">{s.email || "No email"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs">
                      {s.rollNumber ? (
                        <span className="font-bold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200/60">
                          {s.rollNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs font-medium text-slate-700">
                      {s.registerNumber}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{s.department?.name || "N/A"}</span>
                        {s.mentor && (
                          <span className="text-[10px] text-slate-400">Advisor: {s.mentor.fullName}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">
                      <span className="font-semibold">Yr {s.year}</span> · Sec {s.section}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            s.attendancePercentage < 75
                              ? "text-rose-600 font-bold"
                              : s.attendancePercentage < 85
                              ? "text-amber-600 font-bold"
                              : "text-slate-900"
                          }`}
                        >
                          {s.attendancePercentage}%
                        </span>
                        {s.attendancePercentage < 75 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200/60">
                            Low
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-900">{s.cgpa.toFixed(1)}</span>
                      <span className="text-slate-400 text-xs"> CGPA</span>
                      {s.arrearCount > 0 && (
                        <span className="ml-2 text-[11px] font-semibold text-rose-600">
                          ({s.arrearCount} Arrears)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {renderFeeStatusBadge(s.feeStatus)}
                    </td>
                    <td className="px-5 py-3.5">
                      {s.latestRisk ? (
                        <RiskDot level={s.latestRisk.riskLevel} />
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Pending Review</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/students/${s.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        Profile →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRID VIEW */}
      {!loading && students.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((s) => (
            <div
              key={s.id}
              onClick={() => navigate(`/students/${s.id}`)}
              className="app-card p-5 hover:shadow-cardHover transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center border border-slate-200/70 shrink-0">
                      {s.fullName[0]}
                    </div>
                    <div>
                      <p className="font-display text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                        {s.fullName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {s.rollNumber ? <span className="text-blue-700 font-semibold">{s.rollNumber} • </span> : ""}Reg: {s.registerNumber}
                      </p>
                    </div>
                  </div>
                  {s.latestRisk && <RiskDot level={s.latestRisk.riskLevel} compact />}
                </div>

                <div className="text-xs text-slate-500 space-y-1 my-3 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                  <p><span className="font-semibold text-slate-700">Dept:</span> {s.department?.name || "N/A"}</p>
                  {s.mentor && (
                    <p><span className="font-semibold text-slate-700">Advisor:</span> {s.mentor.fullName}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-center my-3">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Year/Sec</p>
                    <p className="text-xs font-semibold text-slate-900 mt-0.5">{s.year} - {s.section}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">CGPA</p>
                    <p className="text-xs font-semibold text-slate-900 mt-0.5">{s.cgpa.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Attendance</p>
                    <p className={`text-xs font-semibold mt-0.5 ${s.attendancePercentage < 75 ? "text-rose-600" : "text-slate-900"}`}>
                      {s.attendancePercentage}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">
                    {s.arrearCount > 0 ? `${s.arrearCount} Backlogs` : "0 Backlogs"}
                  </span>
                  <span className="text-slate-300">·</span>
                  {renderFeeStatusBadge(s.feeStatus)}
                </div>
                <span className="font-semibold text-blue-600 flex items-center gap-1">
                  View Dossier <ArrowRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Real Server-Side Pagination Controls */}
      {!loading && total > pageSize && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500 font-medium">
            Showing <span className="font-semibold text-slate-800">{(page - 1) * pageSize + 1}</span> to{" "}
            <span className="font-semibold text-slate-800">
              {Math.min(page * pageSize, total)}
            </span>{" "}
            of <span className="font-semibold text-slate-800">{total}</span> entries
          </p>
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.ceil(total / pageSize) }).map((_, idx) => {
                const pNum = idx + 1;
                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`w-7.5 h-7.5 rounded-lg text-xs font-semibold transition-all ${
                      page === pNum
                        ? "bg-blue-600 text-white shadow-xs font-bold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(Math.ceil(total / pageSize), p + 1))}
              disabled={page === Math.ceil(total / pageSize)}
              className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showModal && (
        <AddStudentModal
          departments={departments}
          mentors={mentors}
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function AddStudentModal({
  departments,
  mentors,
  onClose,
  onCreated,
}: {
  departments: Department[];
  mentors: Mentor[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    registerNumber: "",
    rollNumber: "",
    admissionYear: new Date().getFullYear(),
    year: "I",
    section: "A",
    departmentId: departments[0]?.id ?? "",
    mentorId: user?.mentor?.id ?? mentors[0]?.id ?? "",
    email: "",
    phone: "",
    attendancePercentage: 100,
    cgpa: 8.0,
    arrearCount: 0,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedDept = departments.find((d) => d.id === form.departmentId);
  const currentYearDigits = String(form.admissionYear).slice(-2);
  const deptCodePreview = selectedDept?.code ? selectedDept.code.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() : "DEPT";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/students", {
        ...form,
        admissionYear: Number(form.admissionYear) || new Date().getFullYear(),
        rollNumber: form.rollNumber.trim() ? form.rollNumber.trim().toUpperCase() : undefined,
      });
      onCreated();
    } catch (err) {
      setError(apiErrorMessage(err, "Unable to save student. Please check the fields and try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="app-card w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 md:p-7 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">Add New Mentee</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter academic details to enroll student into mentoring system</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Field label="Full Name" full required>
              <input autoComplete="off"
                required
                className="w-full px-3.5 py-2 text-xs md:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="e.g. Rahul Sundaram"
              />
            </Field>

            <Field label="Register Number" required>
              <input autoComplete="off"
                required
                className="w-full px-3.5 py-2 text-xs md:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 font-mono"
                value={form.registerNumber}
                onChange={(e) => setForm({ ...form, registerNumber: e.target.value })}
                placeholder="e.g. 724024243001"
              />
            </Field>

            <Field label="Admission Year" required>
              <input autoComplete="off"
                type="number"
                min={2000}
                max={2099}
                required
                className="w-full px-3.5 py-2 text-xs md:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 font-mono"
                value={form.admissionYear}
                onChange={(e) => setForm({ ...form, admissionYear: Number(e.target.value) })}
                placeholder="e.g. 2024"
              />
            </Field>

            <Field label="Roll Number (Optional - Auto-generated)">
              <input autoComplete="off"
                className="w-full px-3.5 py-2 text-xs md:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 font-mono uppercase"
                value={form.rollNumber}
                onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
                placeholder={`e.g. ${currentYearDigits}${deptCodePreview}01 (or leave blank)`}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Pattern: <span className="font-mono text-blue-700 font-semibold">{currentYearDigits}{deptCodePreview}NN</span> (Auto-assigned if left blank)
              </p>
            </Field>

            <Field label="Email Address">
              <input autoComplete="off"
                type="email"
                className="w-full px-3.5 py-2 text-xs md:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="student@university.edu"
              />
            </Field>

            <Field label="Academic Year">
              <select
                className="w-full px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              >
                {["I", "II", "III", "IV"].map((y) => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </Field>

            <Field label="Section">
              <select
                className="w-full px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
              >
                {["A", "B", "C", "D"].map((s) => (
                  <option key={s} value={s}>Section {s}</option>
                ))}
              </select>
            </Field>

            <Field label="Department" full>
              <select
                className="w-full px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </Field>

            {user?.role === "HOD" && (
              <Field label="Assign Faculty Mentor" full>
                <select
                  className="w-full px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                  value={form.mentorId}
                  onChange={(e) => setForm({ ...form, mentorId: e.target.value })}
                >
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <Field label="Attendance Percentage (%)">
              <input autoComplete="off"
                type="number"
                min={0}
                max={100}
                className="w-full px-3.5 py-2 text-xs md:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600"
                value={form.attendancePercentage}
                onChange={(e) => setForm({ ...form, attendancePercentage: Number(e.target.value) })}
              />
            </Field>

            <Field label="Current CGPA">
              <input autoComplete="off"
                type="number"
                step="0.01"
                min={0}
                max={10}
                className="w-full px-3.5 py-2 text-xs md:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600"
                value={form.cgpa}
                onChange={(e) => setForm({ ...form, cgpa: Number(e.target.value) })}
              />
            </Field>

            <Field label="Active Arrears / Backlogs">
              <input autoComplete="off"
                type="number"
                min={0}
                className="w-full px-3.5 py-2 text-xs md:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600"
                value={form.arrearCount}
                onChange={(e) => setForm({ ...form, arrearCount: Number(e.target.value) })}
              />
            </Field>

            <Field label="Contact Phone">
              <input autoComplete="off"
                className="w-full px-3.5 py-2 text-xs md:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </Field>
          </div>

          {error && <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl">{error}</p>}

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !form.fullName || !form.registerNumber}
              className="btn-primary text-xs px-5 py-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {submitting ? "Saving Student..." : "Enroll Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  full,
  required,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
  required?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

