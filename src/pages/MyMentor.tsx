import React, { useEffect, useState } from "react";
import { User, Mail, Phone, CalendarCheck, MessageSquare, Sparkles, Building2, Shield, Calendar } from "lucide-react";
import { api, apiErrorMessage } from "../api/client";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/LoadingState";
import { BackButton } from "../components/ui/BackButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MyMentor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mentorData, setMentorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMentor() {
      setLoading(true);
      try {
        if (user?.role === "STUDENT") {
          const res = await api.get("/dashboard/student");
          setMentorData(res.data.data?.mentor || null);
        } else {
          // For staff/HOD viewing, fetch from mentors list
          const res = await api.get("/departments/mentors/all");
          const first = res.data.data?.[0];
          setMentorData(first || null);
        }
        setError("");
      } catch (err) {
        setError(apiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadMentor();
  }, [user]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="p-6 md:p-7 rounded-2xl bg-sky-50 text-blue-950 border border-blue-100/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <BackButton fallback="/dashboard" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles size={11} className="text-blue-500" /> Advisory Connection
              </span>
              <span className="text-xs text-blue-800/80 font-medium">Faculty Mentor Profile</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
              My Faculty Advisor & Mentor
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              Connect directly with your appointed faculty mentor for academic guidance, career roadmap planning, and personal mentoring.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate("/meetings")}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Calendar size={14} /> Schedule Meeting
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading assigned faculty advisor profile..." />
      ) : error ? (
        <ErrorState error={error} onRetry={() => window.location.reload()} />
      ) : !mentorData ? (
        <EmptyState
          title="No Mentor Assigned Yet"
          description="You do not currently have an assigned faculty advisor. Please contact your Department Head."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Mentor Card */}
          <div className="lg:col-span-2 app-card p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl uppercase shadow-md shrink-0">
                {mentorData.fullName?.[0] || "M"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="font-display text-xl font-bold text-slate-900">
                    {mentorData.fullName}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {mentorData.employeeId || "FACULTY ADVISOR"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Building2 size={13} className="text-slate-400" />
                  {mentorData.department?.name || "Department Faculty"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600 shrink-0">
                  <Mail size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Institutional Email</p>
                  <p className="text-xs font-medium text-slate-800 truncate">
                    {mentorData.user?.email || "advisor@university.edu"}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shrink-0">
                  <Phone size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Department Extension</p>
                  <p className="text-xs font-medium text-slate-800 truncate">
                    {mentorData.phone || "+91 44 2250 1234"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => navigate("/messages")}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <MessageSquare size={14} /> Send Direct Message
              </button>
              <button
                onClick={() => navigate("/meetings")}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer"
              >
                <CalendarCheck size={14} className="text-blue-600" /> View Advisory Sessions
              </button>
            </div>
          </div>

          {/* Guidelines / Office Hours Card */}
          <div className="app-card p-5 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Shield size={14} className="text-blue-600" /> Advisory Office Hours
              </h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-medium text-slate-700">Monday & Wednesday</span>
                  <span className="font-mono text-blue-700 font-semibold">03:30 PM – 05:00 PM</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-medium text-slate-700">Friday (Open Hour)</span>
                  <span className="font-mono text-blue-700 font-semibold">02:00 PM – 04:00 PM</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-medium text-slate-700">Location</span>
                  <span className="font-medium text-slate-900">Faculty Block 3, Room 304</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
              <p className="font-semibold mb-1">Mandatory Advisories:</p>
              Please attend at least 1 individual advisory session every month to maintain your mentoring portfolio compliance.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
