import React, { useState, useEffect } from "react";
import {
  Clock,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  Brain,
  X,
  User,
  GraduationCap,
  AlertTriangle,
  FileText,
  Bookmark,
} from "lucide-react";
import { BackButton } from "../components/ui/BackButton";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

interface StudyTask {
  id: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  completed: boolean;
  day: string;
}

const INITIAL_TASKS: StudyTask[] = [
  {
    id: "task-1",
    subject: "Distributed Systems & Cloud",
    topic: "Raft Consensus Algorithm & Vector Clocks",
    durationMinutes: 45,
    priority: "HIGH",
    completed: true,
    day: "Today",
  },
  {
    id: "task-2",
    subject: "Data Structures & Algos",
    topic: "Trie & Segment Tree range query implementations",
    durationMinutes: 60,
    priority: "HIGH",
    completed: false,
    day: "Today",
  },
  {
    id: "task-3",
    subject: "Machine Learning & AI",
    topic: "Transformer Attention mechanism math derivations",
    durationMinutes: 40,
    priority: "MEDIUM",
    completed: false,
    day: "Today",
  },
  {
    id: "task-4",
    subject: "Compiler Design",
    topic: "LR(1) Parser tables & syntax tree generation",
    durationMinutes: 45,
    priority: "MEDIUM",
    completed: false,
    day: "Tomorrow",
  },
  {
    id: "task-5",
    subject: "Software Engineering & ERP",
    topic: "Microservices saga pattern & event sourcing",
    durationMinutes: 30,
    priority: "LOW",
    completed: false,
    day: "Tomorrow",
  },
];

const UPCOMING_EXAMS = [
  {
    subject: "Distributed Systems (CS601)",
    date: "Sep 18, 2026",
    daysLeft: 16,
    credits: 4,
    syllabusProgress: 78,
  },
  {
    subject: "Machine Learning Foundations (CS602)",
    date: "Sep 22, 2026",
    daysLeft: 20,
    credits: 4,
    syllabusProgress: 65,
  },
  {
    subject: "Compiler Design (CS603)",
    date: "Sep 27, 2026",
    daysLeft: 25,
    credits: 3,
    syllabusProgress: 52,
  },
];

export default function StudyPlanner() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [tasks, setTasks] = useState<StudyTask[]>(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState<"TODAY" | "WEEK" | "EXAMS" | "PROFILE">("TODAY");

  // Pomodoro Focus Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<"FOCUS" | "SHORT_BREAK" | "LONG_BREAK">("FOCUS");
  const [completedSessions, setCompletedSessions] = useState(2);

  // Add Task Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newDuration, setNewDuration] = useState("45");
  const [newPriority, setNewPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");

  // Load students for Mentor or HOD, or load student's own context
  useEffect(() => {
    if (user?.role === "MENTOR" || user?.role === "HOD") {
      setLoading(true);
      api.get("/students", { params: { pageSize: 100 } })
        .then((res) => {
          const list = res.data.data?.items || [];
          setStudents(list);
          if (list.length > 0) {
            setSelectedStudentId(list[0].id);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (user?.role === "STUDENT") {
      setLoading(true);
      api.get("/dashboard")
        .then((res) => {
          setSelectedStudent(res.data.data?.student || null);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  // When a student is selected by Mentor or HOD, fetch their full profile details
  useEffect(() => {
    if (selectedStudentId && (user?.role === "MENTOR" || user?.role === "HOD")) {
      api.get(`/students/${selectedStudentId}`)
        .then((res) => {
          setSelectedStudent(res.data.data || null);
        })
        .catch(console.error);
    }
  }, [selectedStudentId, user]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      if (timerMode === "FOCUS") {
        setCompletedSessions((c) => c + 1);
        setTimerMode("SHORT_BREAK");
        setTimeLeft(5 * 60);
      } else {
        setTimerMode("FOCUS");
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, timerMode]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = (mode: "FOCUS" | "SHORT_BREAK" | "LONG_BREAK") => {
    setIsTimerRunning(false);
    setTimerMode(mode);
    if (mode === "FOCUS") setTimeLeft(25 * 60);
    if (mode === "SHORT_BREAK") setTimeLeft(5 * 60);
    if (mode === "LONG_BREAK") setTimeLeft(15 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newTopic.trim()) return;

    const newTask: StudyTask = {
      id: `task-${Date.now()}`,
      subject: newSubject,
      topic: newTopic,
      durationMinutes: parseInt(newDuration, 10) || 30,
      priority: newPriority,
      completed: false,
      day: "Today",
    };

    setTasks((prev) => [newTask, ...prev]);
    setShowAddModal(false);
    setNewSubject("");
    setNewTopic("");
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100) || 0;

  // Compute live AI recommendations based on selected student parameters
  const getAiRecommendation = () => {
    if (!selectedStudent) {
      return "Select a student record to generate academic advice and tailored spaced-repetition schedules.";
    }

    const { fullName, attendancePercentage, arrearCount, cgpa, year, section } = selectedStudent;
    const items: string[] = [];

    if (attendancePercentage < 85) {
      items.push(`Attendance is currently ${attendancePercentage}%, which is below the expected 85% guideline. Highly recommend allocating daily 45-minute recovery sessions to cover missed classroom lectures.`);
    }

    if (arrearCount > 0) {
      items.push(`Student has ${arrearCount} backlogs. Ensure that high-priority daily blocks are dedicated strictly to backlog subjects first before general syllabus review.`);
    }

    if (cgpa < 6.5) {
      items.push(`Academic standing indicates a CGPA of ${cgpa.toFixed(2)}. Suggest dividing study schedules into smaller 25-minute Pomodoro sprints for better conceptual reinforcement.`);
    } else if (cgpa >= 8.5) {
      items.push(`With a stellar CGPA of ${cgpa.toFixed(2)}, standard curriculum requirements are easily met. Allocate advanced 60-minute blocks for industry certifications or placement readiness coding.`);
    }

    if (items.length === 0) {
      items.push("Student's primary performance criteria are robust and fully compliant with regulations. Focus blocks can be split between standard semester syllabus coverage and active-recall mock tests.");
    }

    return items.join(" ");
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header Banner with Back Navigation & Brand Treated Style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-5 sm:p-6 md:p-8 rounded-2xl bg-sky-50 text-blue-950 border border-blue-100 shadow-xs relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <BackButton fallback="/dashboard" />
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800 border border-blue-200">
              <Sparkles size={12} className="text-blue-600" /> Spaced Repetition Engine
            </span>
            <span className="text-xs text-blue-800/80">Deep Work Scheduling Hub</span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
            Study Planner & Curriculum Scheduler
          </h1>
          <p className="text-xs md:text-sm text-slate-600 max-w-xl leading-relaxed">
            AI-optimized daily timetable, active recall milestones, and personalized coaching time-boxing.
          </p>
        </div>

        {user?.role !== "STUDENT" && (
          <div className="flex items-center gap-3 shrink-0 relative z-10 self-start md:self-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary text-xs py-2.5 px-4 shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={15} /> Add Study Block
            </button>
          </div>
        )}
      </div>

      {/* Student Profile & Cohort Context Selector for Mentors and HODs */}
      {(user?.role === "MENTOR" || user?.role === "HOD") && (
        <div className="app-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-50 pb-3">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm">Mentee Selection</h3>
              <p className="text-xs text-slate-500">Select an authorized student to review and coordinate their active study plans</p>
            </div>
            <div className="relative min-w-[240px]">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition-colors cursor-pointer"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} ({st.registerNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedStudent && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium flex items-center gap-1">
                  <User size={13} className="text-blue-500" /> Student Profile
                </p>
                <p className="text-slate-900 font-bold mt-1 truncate">{selectedStudent.fullName}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{selectedStudent.registerNumber}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium flex items-center gap-1">
                  <GraduationCap size={13} className="text-blue-500" /> Academic & Class
                </p>
                <p className="text-slate-900 font-bold mt-1">Year {selectedStudent.year} · Sec {selectedStudent.section}</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Sem {selectedStudent.semester || "N/A"} · CGPA {selectedStudent.cgpa?.toFixed(2)}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium flex items-center gap-1">
                  <Clock size={13} className="text-blue-500" /> Attendance Rate
                </p>
                <p className={`font-bold mt-1 text-sm ${selectedStudent.attendancePercentage < 85 ? "text-rose-600" : "text-emerald-600"}`}>
                  {selectedStudent.attendancePercentage}%
                </p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                  {selectedStudent.attendancePercentage < 85 ? "Below 85% threshold" : "Compliant with norms"}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium flex items-center gap-1">
                  <AlertTriangle size={13} className="text-blue-500" /> Backlogs & Issues
                </p>
                <p className={`font-bold mt-1 text-sm ${selectedStudent.arrearCount > 0 ? "text-rose-600" : "text-slate-700"}`}>
                  {selectedStudent.arrearCount} Arrears
                </p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                  Issues: {selectedStudent.issues?.length || 0} logged
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Student Personal Study Parameters */}
      {user?.role === "STUDENT" && selectedStudent && (
        <div className="app-card p-5 space-y-4">
          <div className="border-b border-blue-50 pb-3">
            <h3 className="font-display font-bold text-slate-900 text-sm">My Academic Standings</h3>
            <p className="text-xs text-slate-500">Your profile details integrated directly into your Pomodoro workspace planner</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-slate-400 font-medium flex items-center gap-1">
                <User size={13} className="text-blue-500" /> Mentee Name
              </p>
              <p className="text-slate-900 font-bold mt-1">{selectedStudent.fullName}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{selectedStudent.registerNumber}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-slate-400 font-medium flex items-center gap-1">
                <GraduationCap size={13} className="text-blue-500" /> Academic & Class
              </p>
              <p className="text-slate-900 font-bold mt-1">Year {selectedStudent.year} · Sec {selectedStudent.section}</p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Sem {selectedStudent.semester || "N/A"} · CGPA {selectedStudent.cgpa?.toFixed(2)}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-slate-400 font-medium flex items-center gap-1">
                <Clock size={13} className="text-blue-500" /> Attendance Rate
              </p>
              <p className={`font-bold mt-1 text-sm ${selectedStudent.attendancePercentage < 85 ? "text-rose-600" : "text-emerald-600"}`}>
                {selectedStudent.attendancePercentage}%
              </p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                {selectedStudent.attendancePercentage < 85 ? "Below 85% threshold" : "Compliant with norms"}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-slate-400 font-medium flex items-center gap-1">
                <AlertTriangle size={13} className="text-blue-500" /> Backlogs & Issues
              </p>
              <p className={`font-bold mt-1 text-sm ${selectedStudent.arrearCount > 0 ? "text-rose-600" : "text-slate-700"}`}>
                {selectedStudent.arrearCount} Arrears
              </p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                Keep track of backlogged subject modules
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Schedule & Daily Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Overview Bar */}
          <div className="app-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                <Flame size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Target</p>
                <h3 className="font-display text-base font-bold text-slate-900">
                  {completedCount} of {tasks.length} Modules Completed
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-4 min-w-[200px]">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Efficiency</span>
                  <span className="font-semibold text-blue-700">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Task View Tabs & List */}
          <div className="app-card overflow-hidden">
            <div className="p-4 md:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("TODAY")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === "TODAY"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Today's Schedule ({tasks.filter((t) => t.day === "Today").length})
                </button>
                <button
                  onClick={() => setActiveTab("WEEK")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === "WEEK"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Weekly Roadmap
                </button>
                <button
                  onClick={() => setActiveTab("EXAMS")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === "EXAMS"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Exam Deadlines
                </button>
              </div>

              <span className="text-xs text-slate-400 hidden sm:inline">
                Spaced Repetition Active
              </span>
            </div>

            {/* Task list rendering */}
            {activeTab !== "EXAMS" ? (
              <div className="divide-y divide-slate-100">
                {tasks
                  .filter((t) => (activeTab === "TODAY" ? t.day === "Today" : true))
                  .map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`p-4 md:px-6 flex items-start justify-between gap-4 cursor-pointer transition-colors ${
                        task.completed ? "bg-slate-50/60 opacity-70" : "hover:bg-slate-50/80"
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <button
                          type="button"
                          className="mt-0.5 text-blue-600 shrink-0"
                        >
                          {task.completed ? (
                            <CheckCircle2 size={18} className="text-emerald-600" />
                          ) : (
                            <Circle size={18} className="text-slate-300 hover:text-blue-600" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <p
                            className={`text-sm font-semibold text-slate-900 ${
                              task.completed ? "line-through text-slate-400" : ""
                            }`}
                          >
                            {task.topic}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                            <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {task.subject}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} /> {task.durationMinutes} min
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>{task.day}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                            task.priority === "HIGH"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : task.priority === "MEDIUM"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-6 space-y-3">
                {UPCOMING_EXAMS.map((exam, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">{exam.subject}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Exam Date: {exam.date}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {exam.daysLeft} days left
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Syllabus Covered</span>
                        <span className="font-semibold text-blue-700">{exam.syllabusProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${exam.syllabusProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Pomodoro Focus Timer & AI Insights */}
        <div className="space-y-6">
          {/* Deep Work Focus Timer */}
          <div className="app-card p-6 text-center space-y-4">
            <div className="flex items-center justify-between text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Brain size={15} className="text-blue-600" /> Deep Work Timer
              </span>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">
                Session {completedSessions}/4
              </span>
            </div>

            {/* Mode Selectors */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => resetTimer("FOCUS")}
                className={`py-1 rounded-lg transition-colors cursor-pointer ${
                  timerMode === "FOCUS"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Focus (25m)
              </button>
              <button
                onClick={() => resetTimer("SHORT_BREAK")}
                className={`py-1 rounded-lg transition-colors cursor-pointer ${
                  timerMode === "SHORT_BREAK"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Short (5m)
              </button>
              <button
                onClick={() => resetTimer("LONG_BREAK")}
                className={`py-1 rounded-lg transition-colors cursor-pointer ${
                  timerMode === "LONG_BREAK"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Long (15m)
              </button>
            </div>

            {/* Digital Timer Display */}
            <div className="py-4 my-1">
              <div className="font-mono text-5xl font-bold tracking-tight text-slate-900">
                {formatTime(timeLeft)}
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                {timerMode === "FOCUS"
                  ? "High focus interval — notifications muted"
                  : "Rest and hydrate before next session"}
              </p>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-2.5">
              <button
                onClick={toggleTimer}
                className="btn-primary text-xs py-2.5 px-5 shadow-xs cursor-pointer flex items-center gap-2"
              >
                {isTimerRunning ? <Pause size={15} /> : <Play size={15} />}
                <span>{isTimerRunning ? "Pause" : "Start Focus"}</span>
              </button>

              <button
                onClick={() => resetTimer(timerMode)}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>

          {/* AI Study Recommendations - Connected directly to student profile context */}
          <div className="app-card p-5 space-y-2.5 bg-slate-50/50">
            <div className="flex items-center gap-1.5 text-blue-700">
              <Sparkles size={15} />
              <h4 className="text-xs font-semibold uppercase tracking-wider">AI Optimization Insights</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {getAiRecommendation()}
            </p>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="app-card max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-display text-base font-bold text-slate-900">Add Study Block</h3>
            <form onSubmit={handleAddTask} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Subject / Course</label>
                <input autoComplete="off"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Data Structures or Machine Learning"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Target Topic</label>
                <input autoComplete="off"
                  required
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g. Graph Traversal BFS/DFS Practice"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Duration (mins)</label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  >
                    <option value="25">25 mins (1 Pomodoro)</option>
                    <option value="45">45 mins</option>
                    <option value="60">60 mins</option>
                    <option value="90">90 mins</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs py-2 px-3.5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-4 shadow-xs cursor-pointer"
                >
                  Save Study Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
