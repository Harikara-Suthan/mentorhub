import React, { useState, useEffect } from "react";
import {
  X,
  User,
  GraduationCap,
  Phone,
  BookOpen,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Save,
  Building,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";
import { api, apiErrorMessage } from "../../api/client";
import { Department } from "../../types";

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  onSuccess: (updatedStudent: any) => void;
}

export function EditStudentModal({ isOpen, onClose, student, onSuccess }: EditStudentModalProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Academic fields
  const [departmentId, setDepartmentId] = useState("");
  const [mentorId, setMentorId] = useState("");
  const [degree, setDegree] = useState("");
  const [year, setYear] = useState("1");
  const [section, setSection] = useState("A");
  const [semester, setSemester] = useState("1");
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [batch, setBatch] = useState("");
  const [admissionYear, setAdmissionYear] = useState("2024");

  // Parent & Address
  const [parentName, setParentName] = useState("");
  const [parentContact, setParentContact] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [zipCode, setZipCode] = useState("");

  // Performance & Career
  const [cgpa, setCgpa] = useState("8.0");
  const [attendancePercentage, setAttendancePercentage] = useState("85");
  const [arrearCount, setArrearCount] = useState("0");
  const [placementStatus, setPlacementStatus] = useState("UNPLACED");
  const [internshipStatus, setInternshipStatus] = useState("NOT_STARTED");
  const [certificationCount, setCertificationCount] = useState("0");
  const [careerGoal, setCareerGoal] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [bio, setBio] = useState("");

  // State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<"general" | "academic" | "contact" | "career">("general");

  useEffect(() => {
    if (!isOpen || !student) return;

    // Populate initial state from student
    setFullName(student.fullName || "");
    setRegisterNumber(student.registerNumber || "");
    // Preserve Roll Number string, including any leading zeros
    setRollNumber(student.rollNumber !== null && student.rollNumber !== undefined ? String(student.rollNumber) : "");
    setAdmissionNumber(student.admissionNumber || "");
    setEmail(student.email || "");
    setPhone(student.phone || "");
    setGender(student.gender || "");
    setDateOfBirth(student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split("T")[0] : "");

    setDepartmentId(student.departmentId || "");
    setMentorId(student.mentorId || "");
    setDegree(student.degree || "B.E.");
    setYear(String(student.year || "1"));
    setSection(String(student.section || "A"));
    setSemester(student.semester ? String(student.semester) : "1");
    setAcademicYear(student.academicYear || "2025-2026");
    setBatch(student.batch || "2024-2028");
    setAdmissionYear(student.admissionYear ? String(student.admissionYear) : "2024");

    setParentName(student.parentName || "");
    setParentContact(student.parentContact || "");
    setAddress(student.address || "");
    setCity(student.city || "");
    setStateVal(student.state || "");
    setZipCode(student.zipCode || "");

    setCgpa(student.cgpa !== undefined && student.cgpa !== null ? String(student.cgpa) : "0");
    setAttendancePercentage(student.attendancePercentage !== undefined && student.attendancePercentage !== null ? String(student.attendancePercentage) : "0");
    setArrearCount(student.arrearCount !== undefined && student.arrearCount !== null ? String(student.arrearCount) : "0");
    setPlacementStatus(student.placementStatus || "UNPLACED");
    setInternshipStatus(student.internshipStatus || "NOT_STARTED");
    setCertificationCount(student.certificationCount !== undefined ? String(student.certificationCount) : "0");
    setCareerGoal(student.careerGoal || "");
    setTargetRole(student.targetRole || "");
    setBio(student.bio || "");

    setError("");

    // Load departments and mentors list
    setLoadingData(true);
    Promise.all([
      api.get("/departments").then((r) => r.data.data || []),
      api.get("/departments/mentors/all").catch(() => api.get("/admin/faculty")).then((r) => r.data.data || []),
    ])
      .then(([depts, facultyList]) => {
        setDepartments(depts);
        setMentors(facultyList);
      })
      .catch((err) => {
        console.error("Failed to load departments/mentors", err);
      })
      .finally(() => setLoadingData(false));
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client validation
    if (!fullName.trim()) {
      setError("Full Name is mandatory.");
      setActiveSection("general");
      return;
    }
    if (!registerNumber.trim()) {
      setError("Register Number is mandatory.");
      setActiveSection("general");
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        fullName: fullName.trim(),
        registerNumber: registerNumber.trim(),
        rollNumber: rollNumber.trim() ? rollNumber.trim() : null,
        admissionNumber: admissionNumber.trim() ? admissionNumber.trim() : null,
        email: email.trim() ? email.trim().toLowerCase() : null,
        phone: phone.trim() ? phone.trim() : null,
        gender: gender.trim() ? gender.trim() : null,
        dateOfBirth: dateOfBirth ? dateOfBirth : null,

        departmentId: departmentId || undefined,
        mentorId: mentorId ? mentorId : null,
        degree: degree.trim() ? degree.trim() : null,
        year: year.trim(),
        section: section.trim(),
        semester: semester ? Number(semester) : null,
        academicYear: academicYear.trim() ? academicYear.trim() : null,
        batch: batch.trim() ? batch.trim() : null,
        admissionYear: admissionYear ? Number(admissionYear) : null,

        parentName: parentName.trim() ? parentName.trim() : null,
        parentContact: parentContact.trim() ? parentContact.trim() : null,
        address: address.trim() ? address.trim() : null,
        city: city.trim() ? city.trim() : null,
        state: stateVal.trim() ? stateVal.trim() : null,
        zipCode: zipCode.trim() ? zipCode.trim() : null,

        cgpa: cgpa !== "" ? Number(cgpa) : 0,
        attendancePercentage: attendancePercentage !== "" ? Number(attendancePercentage) : 0,
        arrearCount: arrearCount !== "" ? Number(arrearCount) : 0,
        placementStatus,
        internshipStatus,
        certificationCount: certificationCount !== "" ? Number(certificationCount) : 0,
        careerGoal: careerGoal.trim() ? careerGoal.trim() : null,
        targetRole: targetRole.trim() ? targetRole.trim() : null,
        bio: bio.trim() ? bio.trim() : null,
      };

      const res = await api.put(`/students/${student.id}`, payload);
      onSuccess(res.data.data);
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20">
              <GraduationCap size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Edit Student Profile</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
                  Admin Authority
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Modifying record for <strong className="text-white">{student.fullName}</strong> ({student.registerNumber})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSection("general")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeSection === "general"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <User size={14} /> Identity & Identifiers
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("academic")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeSection === "academic"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <GraduationCap size={14} /> Academic & Mentorship
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("contact")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeSection === "contact"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Phone size={14} /> Contact & Family
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("career")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeSection === "career"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Briefcase size={14} /> Performance & Career
          </button>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: IDENTITY & IDENTIFIERS */}
          {activeSection === "general" && (
            <div className="space-y-4">
              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-xs text-blue-900">
                <strong>Important Identifier Rules:</strong> Register Number and Roll Number are separate fields. Roll numbers remain exact strings with leading zeros preserved (e.g. <code>24AIDS01</code> or <code>01</code>).
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aravind Swaminathan"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Register Number <span className="text-red-500">*</span> (University Registration)
                  </label>
                  <input
                    type="text"
                    required
                    value={registerNumber}
                    onChange={(e) => setRegisterNumber(e.target.value)}
                    placeholder="e.g. 717822P101"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Roll Number (Class Roll with Leading Zeros)
                  </label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. 24AIDS01"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">String format preserves leading digits</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admission Number
                  </label>
                  <input
                    type="text"
                    value={admissionNumber}
                    onChange={(e) => setAdmissionNumber(e.target.value)}
                    placeholder="e.g. ADM-2024-042"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: ACADEMIC & MENTORSHIP */}
          {activeSection === "academic" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                    Assigned Faculty Mentor
                  </label>
                  <select
                    value={mentorId}
                    onChange={(e) => setMentorId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">-- Unassigned --</option>
                    {mentors.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} {m.employeeId ? `(${m.employeeId})` : ""} - {m.department?.name || m.designation}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Degree / Program
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. B.Tech Artificial Intelligence"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
                    <input
                      type="text"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-sm"
                      placeholder="A"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Sem {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="2025-2026"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Batch / Cohort
                  </label>
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    placeholder="2024-2028"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: CONTACT & FAMILY */}
          {activeSection === "contact" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Official Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@institution.edu"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Contact / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Parent / Guardian Full Name
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="e.g. K. Swaminathan"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Parent WhatsApp / Contact Number
                  </label>
                  <input
                    type="text"
                    value={parentContact}
                    onChange={(e) => setParentContact(e.target.value)}
                    placeholder="+91 94441 23456"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Residential Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address, apartment or flat number"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 md:col-span-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Chennai"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      value={stateVal}
                      onChange={(e) => setStateVal(e.target.value)}
                      placeholder="Tamil Nadu"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Zip Code</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="600025"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: PERFORMANCE & CAREER */}
          {activeSection === "career" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cumulative CGPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Attendance Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={attendancePercentage}
                    onChange={(e) => setAttendancePercentage(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Active Arrear Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={arrearCount}
                    onChange={(e) => setArrearCount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Placement Status
                  </label>
                  <select
                    value={placementStatus}
                    onChange={(e) => setPlacementStatus(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                  >
                    <option value="UNPLACED">Unplaced</option>
                    <option value="PLACED">Placed</option>
                    <option value="HIGHER_STUDIES">Higher Studies</option>
                    <option value="ENTREPRENEUR">Entrepreneur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Internship Status
                  </label>
                  <select
                    value={internshipStatus}
                    onChange={(e) => setInternshipStatus(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="SEARCHING">Searching</option>
                    <option value="OFFERED">Offer Received</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Certifications Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={certificationCount}
                    onChange={(e) => setCertificationCount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Cloud Security Architect / Full Stack Engineer"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Career Goal
                  </label>
                  <input
                    type="text"
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    placeholder="e.g. Join Tier-1 Tech Company"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Bio / Notes
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Administrative observations, academic background, notable achievements..."
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Changes will be recorded in the institutional Audit Log.
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary text-xs py-2 px-5 shadow-xs flex items-center gap-1.5"
              >
                {submitting ? (
                  <>Saving Changes...</>
                ) : (
                  <>
                    <Save size={14} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
