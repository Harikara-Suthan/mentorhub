import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Github,
  Linkedin,
  Globe,
  FileText,
  LogOut,
  Save,
  X,
  MessageSquare,
  Camera,
  Upload,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { BackButton } from "../components/ui/BackButton";
import { getUserAvatar, setUserAvatar } from "../utils/avatar";
import { StudentFeeSection } from "../components/StudentFeeSection";

export function Profile() {
  const { user, logout, refreshUser, updateUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [mentorData, setMentorData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    city: "",
    state: "",
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactPhone: "",
    careerGoal: "",
    targetRole: "",
    skills: "",
    certifications: "",
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
    resumeUrl: "",
    bio: "",
    specialization: "",
    profilePicture: "",
  });

  const fetchProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const authRes = await api.get("/auth/me");
      const authUser = authRes.data.data;

      if (user.role === "STUDENT") {
        const res = await api.get("/students/me");
        if (res.data.success) {
          const s = res.data.data;
          setProfileData(s);
          setFormData({
            phone: s.phone || "",
            address: s.address || "",
            city: s.city || "",
            state: s.state || "",
            emergencyContactName: s.emergencyContactName || s.parentName || "",
            emergencyContactRelation: s.emergencyContactRelation || (s.parentName ? "Parent" : ""),
            emergencyContactPhone: s.emergencyContactPhone || s.parentContact || "",
            careerGoal: s.careerGoal || "",
            targetRole: s.targetRole || "",
            skills: Array.isArray(s.skills) ? s.skills.join(", ") : "",
            certifications: Array.isArray(s.certifications) ? s.certifications.join(", ") : "",
            githubUrl: s.githubUrl || "",
            linkedinUrl: s.linkedinUrl || "",
            portfolioUrl: s.portfolioUrl || "",
            resumeUrl: s.resumeUrl || "",
            bio: s.bio || "",
            specialization: "",
            profilePicture: s.profilePicture || authUser.profilePicture || "",
          });
        }
      } else {
        // MENTOR, HOD, or ADMIN
        const mentor = authUser.mentor;
        const facultyInfo = {
          fullName: mentor?.fullName || authUser.email || "Faculty Member",
          employeeId: mentor?.employeeId || "Not assigned",
          designation: mentor?.designation || (user.role === "HOD" ? "Head of Department" : "Faculty Advisor"),
          department: mentor?.department?.name || "Not assigned",
          departmentCode: mentor?.department?.code || "",
          email: mentor?.email || authUser.email,
          phone: mentor?.phone || "",
          profilePicture: mentor?.profilePicture || authUser.profilePicture || "",
          officeAddress: mentor?.address || "",
          qualification: mentor?.qualification || "",
          specialization: mentor?.specialization || "",
          experience: mentor?.experience || "",
          dateOfJoining: mentor?.dateOfJoining
            ? new Date(mentor.dateOfJoining).toLocaleDateString()
            : mentor?.createdAt
            ? new Date(mentor.createdAt).toLocaleDateString()
            : "",
          assignedStudentsCount: mentor?.menteeCount || 0,
          activeMeetingsCount: 0,
          bio: mentor?.bio || "",
        };
        setMentorData(facultyInfo);
        setFormData({
          phone: facultyInfo.phone || "",
          address: mentor?.address || "",
          city: mentor?.city || "",
          state: mentor?.state || "",
          emergencyContactName: "",
          emergencyContactRelation: "",
          emergencyContactPhone: "",
          careerGoal: "",
          targetRole: "",
          skills: "",
          certifications: "",
          githubUrl: "",
          linkedinUrl: "",
          portfolioUrl: "",
          resumeUrl: "",
          bio: mentor?.bio || "",
          specialization: mentor?.specialization || "",
          profilePicture: mentor?.profilePicture || authUser.profilePicture || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSaveError("");

    try {
      if (user?.role === "STUDENT" && profileData?.id) {
        await api.put(`/students/${profileData.id}`, {
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          careerGoal: formData.careerGoal,
          targetRole: formData.targetRole,
          skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
          certifications: formData.certifications.split(",").map((s) => s.trim()).filter(Boolean),
          githubUrl: formData.githubUrl,
          linkedinUrl: formData.linkedinUrl,
          portfolioUrl: formData.portfolioUrl,
          resumeUrl: formData.resumeUrl,
          bio: formData.bio,
          profilePicture: formData.profilePicture,
        });
      }

      const res = await api.put("/auth/profile", {
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        bio: formData.bio,
        specialization: formData.specialization,
        profilePicture: formData.profilePicture,
      });

      const updatedUser = res.data?.data;
      if (updatedUser) {
        updateUser(updatedUser);
      } else {
        updateUser({ profilePicture: formData.profilePicture });
      }
      setUserAvatar(user?.email || "", formData.profilePicture);

      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 4000);
      if (refreshUser) await refreshUser();
      await fetchProfile();
    } catch (err: any) {
      setSaveError(err.response?.data?.message || "Failed to update profile settings.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isStudent = user?.role === "STUDENT";
  const name = isStudent
    ? profileData?.fullName || user?.student?.fullName || user?.email || "Student"
    : mentorData?.fullName || user?.mentor?.fullName || user?.email || "Faculty Member";

  const email = user?.email || "";

  const actualProfilePicture =
    (isStudent ? profileData?.profilePicture : mentorData?.profilePicture) ||
    user?.profilePicture ||
    user?.student?.profilePicture ||
    user?.mentor?.profilePicture ||
    getUserAvatar(user?.email, user?.role);

  return (
    <div id="profile_page" className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton label="Back" fallback="/dashboard" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
              {name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isStudent ? (
                <>
                  Roll: <span className="font-mono font-semibold text-blue-700">{profileData?.rollNumber || "Not assigned"}</span> • Reg: <span className="font-mono font-semibold text-slate-700">{profileData?.registerNumber || "Not assigned"}</span> • {profileData?.degree || "Undergraduate Degree"}
                </>
              ) : (
                <>
                  Employee ID: <span className="font-mono font-semibold text-slate-700">{mentorData?.employeeId || "Not assigned"}</span> • {mentorData?.department || "Department"}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <button
            id="btn_edit_profile"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Edit3 size={14} />
            <span>Edit Profile</span>
          </button>
          <button
            id="btn_profile_logout"
            onClick={() => logout()}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>Profile records updated successfully.</span>
        </div>
      )}

      {/* Main Profile Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Cover Banner */}
        <div className="h-32 sm:h-36 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 relative flex items-start justify-end p-4 sm:p-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-xs">
            <ShieldCheck size={13} className="text-sky-300" />
            {user?.role} Account
          </span>
        </div>

        {/* Profile Info & Quick Actions Row */}
        <div className="px-5 sm:px-7 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-5">
              {/* Round Profile Picture - Top Layer above banner */}
              <div className="-mt-12 sm:-mt-16 relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-slate-200/80 group">
                <img
                  src={actualProfilePicture}
                  alt={name}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  title="Change Profile Picture"
                  className="absolute inset-0 bg-slate-900/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs"
                >
                  <Camera size={20} className="mb-0.5" />
                  <span className="text-[10px] font-semibold">Change</span>
                </button>
              </div>
              <div className="space-y-1 pb-1 pt-1 sm:pt-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                    {name}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/70 shrink-0">
                    <ShieldCheck size={13} className="text-blue-600" /> Verified
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-normal">
                  {isStudent
                    ? `${profileData?.degree || "Undergraduate"} • Year ${profileData?.year || "I"}, Sec ${profileData?.section || "A"}`
                    : mentorData?.designation || "Faculty Advisor"}
                </p>
              </div>
            </div>

            <div className="flex items-center shrink-0 sm:pb-1 w-full sm:w-auto">
              <button
                id="btn_quick_message"
                onClick={() => navigate("/messages")}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 text-xs font-semibold transition-colors cursor-pointer w-full sm:w-auto shadow-2xs"
              >
                <MessageSquare size={14} />
                <span>Open Messages</span>
              </button>
            </div>
          </div>

          {/* Quick Statistics Grid */}
          {isStudent ? (
            <div className="border-t border-slate-100 pt-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                <div className="flex flex-col justify-center sm:px-2 pt-2 sm:pt-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Roll Number
                  </p>
                  <p className="font-bold text-blue-700 text-sm sm:text-base mt-1 font-mono">
                    {profileData?.rollNumber || "Not assigned"}
                  </p>
                </div>
                <div className="flex flex-col justify-center sm:px-3 pt-2 sm:pt-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Register Number
                  </p>
                  <p className="font-bold text-slate-800 text-sm sm:text-base mt-1 font-mono">
                    {profileData?.registerNumber || "Not provided"}
                  </p>
                </div>
                <div className="flex flex-col justify-center sm:px-3 pt-2 sm:pt-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Cumulative CGPA
                  </p>
                  <p className="font-bold text-emerald-600 text-sm sm:text-base mt-1">
                    {profileData?.cgpa !== undefined && profileData?.cgpa !== null ? `${profileData.cgpa} ` : "Not provided "}
                    <span className="text-xs text-slate-400 font-normal">/ 10.0</span>
                  </p>
                </div>
                <div className="flex flex-col justify-center sm:px-3 pt-2 sm:pt-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Attendance Rate
                  </p>
                  <p className="font-bold text-blue-600 text-sm sm:text-base mt-1">
                    {profileData?.attendancePercentage !== undefined ? `${profileData.attendancePercentage}%` : "Not provided"}
                  </p>
                </div>
                <div className="flex flex-col justify-center sm:px-3 pt-2 sm:pt-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Standing Arrears
                  </p>
                  <p className="font-bold text-slate-800 text-sm sm:text-base mt-1">
                    {profileData?.arrearCount ?? 0} <span className="text-xs text-slate-500 font-normal">Active</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t border-slate-100 pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                <div className="flex flex-col justify-center sm:px-2 pt-2 sm:pt-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Employee ID
                  </p>
                  <p className="font-bold text-slate-800 text-sm sm:text-base mt-1 font-mono">
                    {mentorData?.employeeId || "Not assigned"}
                  </p>
                </div>
                <div className="flex flex-col justify-center sm:px-4 pt-2 sm:pt-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Department
                  </p>
                  <p className="font-bold text-blue-700 text-sm sm:text-base mt-1">
                    {mentorData?.department || "Not assigned"}
                  </p>
                </div>
                <div className="flex flex-col justify-center sm:px-4 pt-2 sm:pt-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Assigned Mentees
                  </p>
                  <p className="font-bold text-slate-800 text-sm sm:text-base mt-1">
                    {mentorData?.assignedStudentsCount ?? 0} <span className="text-xs text-slate-500 font-normal">Students</span>
                  </p>
                </div>
                <div className="flex flex-col justify-center sm:px-4 pt-2 sm:pt-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Experience
                  </p>
                  <p className="font-bold text-slate-800 text-sm sm:text-base mt-1">
                    {mentorData?.experience || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Sections: 2-Column Responsive SaaS Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Contact & Location */}
        <div className="space-y-6 lg:col-span-1">
          {/* Contact Information */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Contact & Location
            </h3>
            <div className="space-y-3.5">
              {/* Institutional Email */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Institutional Email
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 truncate mt-0.5">
                    {email || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Phone Line */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Phone Line
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 truncate mt-0.5">
                    {formData.phone || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Address & Location */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Address & Location
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 leading-snug mt-0.5">
                    {[formData.address, formData.city, formData.state].filter(Boolean).join(", ") || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mentoring Relationship Card (Student Only) */}
          {isStudent && profileData?.mentor && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Assigned Faculty Mentor
              </h3>
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-blue-50/70 border border-blue-100/80">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                  {profileData.mentor.fullName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {profileData.mentor.fullName}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {profileData.mentor.designation || "Faculty Advisor"}
                  </p>
                </div>
              </div>
              <button
                id="btn_message_assigned_mentor"
                onClick={() => navigate("/messages")}
                className="w-full py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold text-center transition-colors cursor-pointer shadow-xs inline-flex items-center justify-center gap-2"
              >
                <MessageSquare size={14} />
                <span>Message Mentor Directly</span>
              </button>
            </div>
          )}

          {/* Emergency Contact (Student Only) */}
          {isStudent && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Emergency Contact
              </h3>
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  {formData.emergencyContactName || "Not provided"}
                </p>
                {formData.emergencyContactRelation && (
                  <p className="text-[11px] text-slate-500">
                    Relation: <span className="font-semibold text-slate-700">{formData.emergencyContactRelation}</span>
                  </p>
                )}
                <p className="text-xs text-blue-700 font-semibold font-mono pt-0.5">
                  {formData.emergencyContactPhone || "Not provided"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Academic, Career & Technical Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Biography & Objective */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Profile Summary & Objective
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {formData.bio || "No summary provided."}
            </p>
          </div>

          {/* Student Career & Technical Portfolio */}
          {isStudent ? (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Career Goals & Technical Portfolio
              </h3>

              {/* Target Role & Milestone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-center">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Target Placement Role
                  </p>
                  <p className="font-bold text-slate-800 text-xs sm:text-sm mt-1 leading-snug">
                    {formData.targetRole || "Not specified"}
                  </p>
                </div>
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-center">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Primary Career Milestone
                  </p>
                  <p className="font-bold text-blue-700 text-xs sm:text-sm mt-1 leading-snug">
                    {formData.careerGoal || "Not specified"}
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700">
                  Verified Skills & Technologies
                </p>
                {formData.skills ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.split(",").map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-medium"
                      >
                        {sk.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Not provided</p>
                )}
              </div>

              {/* Certifications if available */}
              {formData.certifications && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    Certifications & Honors
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.certifications.split(",").map((cert, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-medium"
                      >
                        {cert.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Developer Profiles & Artifacts */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700">
                  Developer Profiles & Artifacts
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {formData.githubUrl && (
                    <a
                      href={formData.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 text-slate-700 transition-colors group min-w-0"
                    >
                      <Github size={15} className="text-slate-700 shrink-0 group-hover:text-blue-600" />
                      <span className="truncate font-medium flex-1">GitHub Profile</span>
                    </a>
                  )}
                  {formData.linkedinUrl && (
                    <a
                      href={formData.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 text-slate-700 transition-colors group min-w-0"
                    >
                      <Linkedin size={15} className="text-blue-600 shrink-0" />
                      <span className="truncate font-medium flex-1">LinkedIn Profile</span>
                    </a>
                  )}
                  {formData.portfolioUrl && (
                    <a
                      href={formData.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 text-slate-700 transition-colors group min-w-0"
                    >
                      <Globe size={15} className="text-emerald-600 shrink-0" />
                      <span className="truncate font-medium flex-1">Personal Portfolio</span>
                    </a>
                  )}
                  {formData.resumeUrl && (
                    <a
                      href={formData.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 text-slate-700 transition-colors group min-w-0"
                    >
                      <FileText size={15} className="text-blue-600 shrink-0" />
                      <span className="truncate font-medium flex-1">Verified Resume PDF</span>
                    </a>
                  )}
                  {!formData.githubUrl && !formData.linkedinUrl && !formData.portfolioUrl && !formData.resumeUrl && (
                    <p className="text-xs text-slate-400 col-span-2">No links provided</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Academic Qualifications & Research Focus
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Highest Qualification
                  </p>
                  <p className="font-bold text-slate-800 text-xs sm:text-sm mt-0.5">
                    {mentorData?.qualification || "Not specified"}
                  </p>
                </div>
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Research & Teaching Specialization
                  </p>
                  <p className="font-bold text-blue-700 text-xs sm:text-sm mt-0.5">
                    {mentorData?.specialization || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Masked Financial Information (Student Only) */}
          {isStudent && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Direct Benefit & Scholarship Account
                </h3>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  Verified Active
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-medium">Bank Name</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {profileData?.bankName || "Not provided"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-medium">Account Number</p>
                  <p className="font-semibold text-slate-800 mt-0.5 font-mono">
                    {profileData?.maskedAccountNumber || "Not provided"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-medium">IFSC Code</p>
                  <p className="font-semibold text-slate-800 mt-0.5 font-mono">
                    {profileData?.ifscCode || "Not provided"}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                🔒 Account numbers are masked for data privacy according to institutional security standards.
              </p>
            </div>
          )}

          {/* Student Official Fee Ledger & Payment Status */}
          {isStudent && profileData?.id && (
            <StudentFeeSection
              studentId={profileData.id}
              feeDetails={profileData.feeDetails}
              userRole={user?.role}
              onFeeUpdated={fetchProfile}
            />
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden my-auto flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Edit Profile Records
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your contact details, bio, and profile records stored in database.
                </p>
              </div>
              <button
                id="btn_close_edit_profile"
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {saveError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Profile Picture */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-200 bg-white shrink-0">
                    <img
                      src={formData.profilePicture || actualProfilePicture}
                      alt="Profile preview"
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input autoComplete="off"
                      id="input_profile_picture"
                      type="text"
                      placeholder="Enter photo URL or use upload button"
                      value={formData.profilePicture}
                      onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                    <div className="flex items-center gap-3 mt-1.5">
                      <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md cursor-pointer transition-colors">
                        <Upload size={12} className="text-blue-600" />
                        <span>Upload photo</span>
                        <input autoComplete="off"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                if (typeof reader.result === "string") {
                                  setFormData((prev) => ({ ...prev, profilePicture: reader.result as string }));
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {formData.profilePicture && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, profilePicture: "" }))}
                          className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                        >
                          Clear Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Summary / Bio
                </label>
                <textarea autoComplete="off"
                  id="input_bio"
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Phone & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <input autoComplete="off"
                    id="input_phone"
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    City
                  </label>
                  <input autoComplete="off"
                    id="input_city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* State & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    State
                  </label>
                  <input autoComplete="off"
                    id="input_state"
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Address
                  </label>
                  <input autoComplete="off"
                    id="input_address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Faculty Specific: Specialization */}
              {!isStudent && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Research & Teaching Specialization
                  </label>
                  <input autoComplete="off"
                    id="input_specialization"
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                </div>
              )}

              {isStudent && (
                <>
                  {/* Emergency Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Emergency Contact Person
                      </label>
                      <input autoComplete="off"
                        id="input_emergency_name"
                        type="text"
                        value={formData.emergencyContactName}
                        onChange={(e) =>
                          setFormData({ ...formData, emergencyContactName: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Emergency Contact Phone
                      </label>
                      <input autoComplete="off"
                        id="input_emergency_phone"
                        type="text"
                        value={formData.emergencyContactPhone}
                        onChange={(e) =>
                          setFormData({ ...formData, emergencyContactPhone: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Career & Skills */}
                  <div className="space-y-3.5 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Target Placement Role
                      </label>
                      <input autoComplete="off"
                        id="input_target_role"
                        type="text"
                        value={formData.targetRole}
                        onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Career Goal / Milestone
                      </label>
                      <input autoComplete="off"
                        id="input_career_goal"
                        type="text"
                        value={formData.careerGoal}
                        onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Skills (comma separated)
                      </label>
                      <input autoComplete="off"
                        id="input_skills"
                        type="text"
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        GitHub Profile URL
                      </label>
                      <input autoComplete="off"
                        id="input_github_url"
                        type="url"
                        value={formData.githubUrl}
                        onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        LinkedIn Profile URL
                      </label>
                      <input autoComplete="off"
                        id="input_linkedin_url"
                        type="url"
                        value={formData.linkedinUrl}
                        onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  id="btn_cancel_edit"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn_save_profile_submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Save size={14} />
                  <span>{submitting ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default Profile;
