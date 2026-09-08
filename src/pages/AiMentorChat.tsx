import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Mic,
  MicOff,
  Paperclip,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Target,
  CheckCircle2,
  Calendar,
  FileCode,
  Lightbulb,
  Zap,
  BrainCircuit,
} from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { BackButton } from "../components/ui/BackButton";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestedActions?: string[];
  recommendedSkills?: string[];
  studyTips?: string[];
}

const STARTER_PROMPTS = [
  {
    icon: Target,
    label: "Check My Stats",
    query: "What is my current CGPA and attendance?",
  },
  {
    icon: FileCode,
    label: "Python Guidance",
    query: "I want to improve my Python skills for technical interviews.",
  },
  {
    icon: Lightbulb,
    label: "Explain Concept",
    query: "What is recursion and can you show an example?",
  },
  {
    icon: Calendar,
    label: "Career Advice",
    query: "I'm feeling a bit confused about my career path.",
  },
];

export default function AiMentorChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      role: "assistant",
      content: `Hey ${user?.email?.split("@")[0] || "there"}! 👋 How's it going? I'm here if you want to chat about your studies, code, career plans, or anything on your mind. What are you working on today?`,
      timestamp: "Just now",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.post("/ai/chat", {
        messages: history,
      });

      const reply = res.data?.data?.reply || res.data?.reply || res.data?.message;
      const data = res.data?.data;
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: reply || "I'm here to help with your studies and career roadmap.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedActions: data?.suggestedActions,
        recommendedSkills: data?.recommendedSkills,
        studyTips: data?.studyTips,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error("[AiMentorChat Error]:", err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      const botMsg: Message = {
        id: `bot-fallback-${Date.now()}`,
        role: "assistant",
        content: serverMsg || `I had trouble reaching the server for a moment. Could you try asking again? I'm ready to help!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleMicToggle = () => {
    if (!isListening) {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        setInput("How do I master Python data structures and algorithms in 4 weeks?");
      }, 2500);
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="h-[calc(100dvh-11rem)] md:h-[calc(100vh-8.5rem)] min-h-[480px] flex flex-col lg:flex-row gap-5 animate-in fade-in duration-200">
      {/* Center AI Conversation Container */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Chat Header with Back Navigation */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-white gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <BackButton fallback="/dashboard" />
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <Bot size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xs sm:text-sm font-bold text-slate-900 truncate">MentorHUB AI</h2>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate hidden sm:block">Academic & Career Advisor</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                setMessages([
                  {
                    id: `reset-${Date.now()}`,
                    role: "assistant",
                    content: "Conversation refreshed. How can I assist your studies or career goals today?",
                    timestamp: "Just now",
                  },
                ]);
              }}
              className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Clear conversation"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-4 sm:space-y-5 bg-slate-50/40">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 sm:gap-3 max-w-3xl ${
                m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.role === "user"
                    ? "bg-slate-900 text-white"
                    : "bg-blue-600 text-white"
                }`}
              >
                {m.role === "user" ? <User size={13} /> : <Sparkles size={13} />}
              </div>

              <div
                className={`space-y-1.5 max-w-[88%] sm:max-w-[80%] ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-xs shadow-xs"
                      : "bg-white text-slate-900 border border-slate-200/90 rounded-tl-xs shadow-xs"
                  }`}
                >
                  <div className={`prose prose-sm max-w-none break-words ${m.role === "user" ? "text-white prose-headings:text-white prose-strong:text-white" : "text-slate-900 prose-headings:text-slate-900 prose-strong:text-slate-900"} whitespace-pre-wrap`}>
                    {m.content}
                  </div>

                  {/* Actions & Skills Metadata if returned from assistant */}
                  {m.role === "assistant" && m.suggestedActions && m.suggestedActions.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5">
                      <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                        <CheckCircle2 size={13} /> Recommended Next Steps
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {m.suggestedActions.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(`Tell me more about how to: ${action}`)}
                            className="text-xs bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium px-2 py-1 rounded-lg border border-slate-200 transition-colors text-left cursor-pointer"
                          >
                            + {action}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {m.role === "assistant" && m.recommendedSkills && m.recommendedSkills.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500">
                        Skills:
                      </span>
                      {m.recommendedSkills.map((sk, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-[10px] font-mono font-medium bg-slate-100 text-slate-700 rounded border border-slate-200"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 px-1 text-[10px] sm:text-[11px] text-slate-400">
                  <span>{m.timestamp}</span>
                  {m.role === "assistant" && (
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="hover:text-blue-600 p-0.5 rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check size={11} className="text-emerald-600" />
                          <span className="text-[10px] text-emerald-600 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span className="text-[10px]">Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 max-w-xl">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles size={13} />
              </div>
              <div className="bg-white p-3 rounded-xl rounded-tl-xs border border-slate-200 shadow-xs flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-slate-600 font-medium ml-1.5">Reasoning...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Starter Prompt Chips */}
        {messages.length <= 2 && (
          <div className="px-3 sm:px-5 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 shrink-0">
              Suggestions:
            </span>
            {STARTER_PROMPTS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(p.query)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-medium border border-slate-200 shrink-0 transition-colors cursor-pointer"
                >
                  <Icon size={12} className="text-blue-600" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-2.5 sm:p-3.5 bg-white border-t border-slate-100">
          {isListening && (
            <div className="mb-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
              <span className="flex items-center gap-2 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                Listening... (Speech to text simulated)
              </span>
              <button
                onClick={() => setIsListening(false)}
                className="text-[10px] font-semibold text-blue-700 uppercase hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-1.5 sm:gap-2"
          >
            <button
              type="button"
              className="w-8 sm:w-9 h-8 sm:h-9 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              title="Attach assignment or syllabus doc"
            >
              <Paperclip size={16} />
            </button>

            <button
              type="button"
              onClick={handleMicToggle}
              className={`w-8 sm:w-9 h-8 sm:h-9 rounded-lg flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                isListening
                  ? "bg-rose-500 text-white"
                  : "text-slate-400 hover:text-blue-600 hover:bg-slate-100"
              }`}
              title="Voice Input"
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <input autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your mentor anything about studies, Python, career, or exams..."
              className="flex-1 px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs hover:bg-blue-700 active:scale-98 disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0 cursor-pointer"
              title="Send Message"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Right Side: Mentor Insights & Learning Roadmap Panel (Desktop) */}
      <div className="hidden xl:flex w-80 shrink-0 flex-col gap-4 overflow-y-auto">
        {/* Learning Goal Card */}
        <div className="app-card p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <Target size={14} /> Current Goal
            </span>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">
              Placement 2026
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">Full Stack AI Engineer</h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Targeted for Tier-1 Product Engineering & AI startups.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Readiness Index</span>
              <span className="font-semibold text-blue-700">84%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full w-[84%]" />
            </div>
          </div>
        </div>

        {/* Recommended Skills Matrix */}
        <div className="app-card p-5 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Zap size={14} className="text-blue-600" /> Focus Skills
          </h4>

          <div className="space-y-2.5">
            {[
              { skill: "Python & FastAPI", level: "Advanced", progress: 88 },
              { skill: "Data Structures & Algos", level: "Intermediate", progress: 75 },
              { skill: "System Architecture", level: "Learning", progress: 60 },
              { skill: "Cloud & Microservices", level: "Intermediate", progress: 70 },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800">{item.skill}</span>
                  <span className="text-[10px] font-mono text-slate-400">{item.level}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Next Action */}
        <div className="app-card p-5 space-y-3 bg-slate-50/50">
          <div className="flex items-center gap-1.5 text-blue-700">
            <BrainCircuit size={15} />
            <h4 className="text-xs font-semibold uppercase tracking-wider">Suggested Next Step</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Solve 3 problems on Dynamic Programming (0/1 Knapsack, Longest Common Subsequence) and document in Study Planner.
          </p>
        </div>
      </div>
    </div>
  );
}
