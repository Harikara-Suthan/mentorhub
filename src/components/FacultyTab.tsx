import { useState } from "react";
import { Search, User, Mail, Phone, CalendarCheck, Shield, Sparkles } from "lucide-react";
import { Mentor } from "../types";

interface FacultyTabProps {
  mentors: Mentor[];
  charts: {
    mentorWiseActivity?: Array<{ mentor: string; meetings: number }>;
  };
}

export default function FacultyTab({ mentors, charts }: FacultyTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const activityMap = new Map<string, number>();
  if (charts.mentorWiseActivity) {
    charts.mentorWiseActivity.forEach((act) => {
      activityMap.set(act.mentor.toLowerCase(), act.meetings);
    });
  }

  const filteredMentors = mentors.filter((m) =>
    m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.employeeId && m.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Tab Banner */}
      <div className="p-6 md:p-7 rounded-2xl bg-sky-50 text-blue-950 border border-blue-100/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles size={11} className="text-blue-500" /> Department Faculty
              </span>
              <span className="text-xs text-blue-800/80 font-medium">Advisory Analytics</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
              Faculty Mentors Directory
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              Review active advisors, monitor advisory meeting volume, and coordinate student-mentor relationships.
            </p>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="app-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input autoComplete="off"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search faculty by name or ID..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 transition-all"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-semibold text-slate-800">{filteredMentors.length}</span> of <span className="font-semibold">{mentors.length}</span> mentors
        </div>
      </div>

      {/* Directory Grid */}
      {filteredMentors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <User size={32} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-medium">No mentors found matching "{searchTerm}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMentors.map((mentor) => {
            const meetingsCount = activityMap.get(mentor.fullName.toLowerCase()) ?? 0;
            return (
              <div
                key={mentor.id}
                className="app-card p-5 border border-slate-200/80 hover:border-blue-500/50 hover:shadow-xs transition-all group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center uppercase border border-blue-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-colors text-sm">
                        {mentor.fullName[0]}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate max-w-[160px]">
                          {mentor.fullName}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          ID: {mentor.employeeId || "N/A"}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200/80 rounded-lg px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      <Shield size={11} className="text-slate-400" /> Advisor
                    </span>
                  </div>

                  {/* Core stats block */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                    <div className="text-center py-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Meetings</p>
                      <div className="flex items-center justify-center gap-1.5 mt-1">
                        <CalendarCheck size={13} className="text-emerald-500" />
                        <span className="text-xs font-bold text-slate-800">{meetingsCount}</span>
                      </div>
                    </div>
                    <div className="text-center py-1 border-l border-slate-200/60">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Role</p>
                      <p className="text-xs font-bold text-slate-800 mt-1">Faculty Mentor</p>
                    </div>
                  </div>
                </div>

                {/* Card Contact details */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-slate-400" />
                    <span className="truncate">{mentor.fullName.toLowerCase().replace(/\s+/g, ".")}@university.edu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-slate-400" />
                    <span>+91 98401 23456</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
