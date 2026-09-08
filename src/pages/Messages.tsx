import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Send,
  Search,
  Check,
  CheckCheck,
  ArrowLeft,
  Plus,
  X,
  User,
  ShieldCheck,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

interface Conversation {
  participantId: string;
  participantName: string;
  participantRole: "STUDENT" | "MENTOR" | "HOD";
  participantEmail?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "STUDENT" | "MENTOR" | "HOD";
  recipientId: string;
  recipientName: string;
  recipientRole: "STUDENT" | "MENTOR" | "HOD";
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "MENTOR" | "HOD";
}

export function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeParticipantId, setActiveParticipantId] = useState<string | null>(
    searchParams.get("userId") || null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // New Chat Modal
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactSearch, setContactSearch] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const res = await api.get("/messages/conversations");
      if (res.data.success) {
        const list: Conversation[] = res.data.data;
        setConversations(list);

        // Auto select first conversation if none selected
        if (!activeParticipantId && list.length > 0) {
          setActiveParticipantId(list[0].participantId);
        }
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchMessages = async (participantId: string) => {
    try {
      setLoadingMessages(true);
      const res = await api.get(`/messages/${participantId}`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await api.get("/messages/contacts");
      if (res.data.success) {
        setContacts(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load contacts:", err);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchContacts();
  }, []);

  useEffect(() => {
    if (activeParticipantId) {
      fetchMessages(activeParticipantId);
    }
  }, [activeParticipantId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeParticipantId || sending) return;

    const content = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      const res = await api.post("/messages", {
        recipientUserId: activeParticipantId,
        content,
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
        fetchConversations();
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleStartNewChat = (contactId: string) => {
    setActiveParticipantId(contactId);
    setShowNewChatModal(false);
    fetchMessages(contactId);
  };

  const activeConversation = conversations.find(
    (c) => c.participantId === activeParticipantId
  );

  const activeContact = contacts.find((c) => c.id === activeParticipantId);

  const activeName =
    activeConversation?.participantName || activeContact?.name || "Direct Message";
  const activeRole =
    activeConversation?.participantRole || activeContact?.role || "STUDENT";

  const filteredConversations = conversations.filter((c) =>
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.role.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      if (isToday) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "HOD":
        return {
          label: "Head of Dept",
          icon: ShieldCheck,
          className: "bg-blue-100 text-blue-700 border-blue-200",
        };
      case "MENTOR":
        return {
          label: "Faculty Mentor",
          icon: User,
          className: "bg-indigo-100 text-indigo-700 border-indigo-200",
        };
      default:
        return {
          label: "Student",
          icon: GraduationCap,
          className: "bg-emerald-100 text-emerald-700 border-emerald-200",
        };
    }
  };

  return (
    <div id="messages_page" className="p-4 md:p-6 max-w-7xl mx-auto h-[calc(100vh-5rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Advisory & Peer Messaging
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
              Direct Channel
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Connect directly with your assigned faculty mentors, mentees, and academic department leads.
          </p>
        </div>
        <button
          id="btn_new_message"
          onClick={() => setShowNewChatModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-medium shadow-sm transition-colors cursor-pointer"
        >
          <Plus size={16} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Main Messaging Container */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex min-h-0">
        {/* Left: Conversation List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 shrink-0 ${
            activeParticipantId ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Search Bar */}
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input autoComplete="off"
                id="input_search_conversations"
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingConversations ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare className="mx-auto text-slate-300 mb-2" size={28} />
                <p className="text-xs font-semibold text-slate-700">No conversations found</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Start a new chat with your mentor or student.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.participantId === activeParticipantId;
                const roleMeta = getRoleBadge(conv.participantRole);
                const RoleIcon = roleMeta.icon;

                return (
                  <button
                    key={conv.participantId}
                    id={`conversation_item_${conv.participantId}`}
                    onClick={() => setActiveParticipantId(conv.participantId)}
                    className={`w-full p-3.5 flex items-start gap-3 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/80 border-l-4 border-l-blue-600"
                        : "hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                        {conv.participantName.charAt(0)}
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {conv.participantName}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatTime(conv.lastMessageTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`text-[9px] font-medium px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${roleMeta.className}`}
                        >
                          <RoleIcon size={10} />
                          {roleMeta.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Chat Area */}
        <div
          className={`flex-1 flex flex-col bg-white ${
            !activeParticipantId ? "hidden md:flex" : "flex"
          }`}
        >
          {activeParticipantId ? (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    id="btn_back_to_conversations"
                    onClick={() => setActiveParticipantId(null)}
                    className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {activeName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900">{activeName}</h2>
                      {(() => {
                        const meta = getRoleBadge(activeRole);
                        return (
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${meta.className}`}
                          >
                            {meta.label}
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {activeConversation?.participantEmail || "Institutional Direct Line"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn_ask_ai_helper"
                    onClick={() => navigate("/ai-mentor")}
                    className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Sparkles size={13} />
                    <span>AI Copilot</span>
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full text-xs text-slate-400">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <MessageSquare size={36} className="text-slate-300 mb-2" />
                    <p className="text-xs font-semibold text-slate-700">
                      Start of conversation with {activeName}
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-sm mt-1">
                      Send a message regarding coursework, attendance check-ins, or academic action items.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        id={`message_item_${msg.id}`}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[10px] font-medium text-slate-500">
                            {isMe ? "You" : msg.senderName}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                        <div
                          className={`max-w-[85%] md:max-w-[70%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                            isMe
                              ? "bg-blue-600 text-white rounded-tr-xs"
                              : "bg-white text-slate-800 border border-slate-200 rounded-tl-xs"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                              isMe ? "text-blue-200" : "text-slate-400"
                            }`}
                          >
                            {isMe && (
                              <span>
                                {msg.isRead ? (
                                  <CheckCheck size={12} className="text-blue-200" />
                                ) : (
                                  <Check size={12} className="text-sky-300" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0"
              >
                <input autoComplete="off"
                  id="input_message_content"
                  type="text"
                  placeholder={`Write a message to ${activeName}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs md:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
                <button
                  id="btn_send_message"
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs md:text-sm font-medium shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={15} />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Select a Conversation</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Choose a contact from the left or click "New Chat" to begin a direct advisory message.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Start New Advisory Conversation</h3>
                <p className="text-xs text-slate-500 mt-0.5">Select a faculty mentor, mentee, or department staff.</p>
              </div>
              <button
                id="btn_close_new_chat_modal"
                onClick={() => setShowNewChatModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input autoComplete="off"
                  id="input_search_contacts"
                  type="text"
                  placeholder="Search by name, role, or email..."
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 p-2">
              {filteredContacts.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No matching contacts found.
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const roleMeta = getRoleBadge(contact.role);
                  return (
                    <button
                      key={contact.id}
                      id={`contact_option_${contact.id}`}
                      onClick={() => handleStartNewChat(contact.id)}
                      className="w-full p-2.5 rounded-xl flex items-center justify-between hover:bg-blue-50 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{contact.name}</p>
                          <p className="text-[10px] text-slate-400">{contact.email}</p>
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-medium px-2 py-0.5 rounded border ${roleMeta.className}`}
                      >
                        {roleMeta.label}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Messages;
