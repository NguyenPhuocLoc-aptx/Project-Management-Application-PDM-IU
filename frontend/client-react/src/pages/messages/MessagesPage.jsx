import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useProjects } from "../../hooks/useProjects";
import { useChat } from "../../hooks/useChat";
import { useToast } from "../../context/ToastContext";
import Avatar from "../../components/ui/Avatar";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

// ── Helpers ────────────────────────────────────────────────────────
function formatTimestamp(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isSameDay(a, b) {
    return new Date(a).toDateString() === new Date(b).toDateString();
}

function dayLabel(iso) {
    const d = new Date(iso);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === now.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

// ── Project selector sidebar ───────────────────────────────────────
function ProjectList({ projects, activeId, onSelect, loading }) {
    return (
        <div className="
      w-64 flex-shrink-0 border-r border-slate-100
      flex flex-col bg-slate-50/60
    ">
            <div className="px-4 py-4 border-b border-slate-100">
                <h2 className="text-sm font-extrabold text-slate-800">Project Chats</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Select a project to chat</p>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <LoadingSpinner size="sm" className="border-slate-200 border-t-primary" />
                    </div>
                ) : projects.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8 px-4">
                        No projects yet. Create one to start chatting.
                    </p>
                ) : (
                    projects.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => onSelect(p.id)}
                            className={`
                w-full flex items-center gap-3 px-4 py-3
                text-left transition-colors
                ${activeId === p.id
                                    ? "bg-blue-50 border-r-2 border-primary"
                                    : "hover:bg-slate-100"}
              `}
                        >
                            <div
                                className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-black"
                                style={{ background: "linear-gradient(135deg,#0051ae,#0969da)" }}
                            >
                                {(p.name || "P")[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold truncate ${activeId === p.id ? "text-primary" : "text-slate-800"}`}>
                                    {p.name}
                                </p>
                                <p className="text-[11px] text-slate-400 truncate">
                                    {p.workspace?.name || "Workspace"}
                                </p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}

// ── Message bubble ─────────────────────────────────────────────────
function MessageBubble({ message, isOwn }) {
    return (
        <div className={`flex items-end gap-2.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
            {!isOwn && (
                <Avatar
                    name={message.sender?.fullName || message.sender?.email || "?"}
                    size="sm"
                    className="flex-shrink-0 mb-1"
                />
            )}
            <div className={`max-w-[70%] space-y-1 ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                {!isOwn && (
                    <span className="text-[11px] font-bold text-slate-500 px-1">
                        {message.sender?.fullName || message.sender?.email || "Unknown"}
                    </span>
                )}
                <div className={`
          px-4 py-2.5 rounded-2xl text-sm leading-relaxed
          ${isOwn
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-white text-slate-800 border border-slate-100 rounded-bl-md shadow-sm"}
        `}>
                    {message.content}
                </div>
                <span className="text-[10px] text-slate-400 px-1">
                    {formatTimestamp(message.createdAt)}
                </span>
            </div>
        </div>
    );
}

// ── Day divider ────────────────────────────────────────────────────
function DayDivider({ label }) {
    return (
        <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                {label}
            </span>
            <div className="flex-1 h-px bg-slate-100" />
        </div>
    );
}

// ── Chat area ──────────────────────────────────────────────────────
function ChatArea({ projectId }) {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { messages, loading, connected, project, sendMessage } = useChat(projectId);

    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || sending) return;
        setSending(true);
        try {
            await sendMessage(input.trim());
            setInput("");
            inputRef.current?.focus();
        } catch {
            addToast("Failed to send message.", "error");
        } finally {
            setSending(false);
        }
    };

    // Group messages by day for dividers
    const messagesWithDividers = useMemo(() => {
        const result = [];
        messages.forEach((msg, idx) => {
            const prev = messages[idx - 1];
            if (!prev || !isSameDay(prev.createdAt, msg.createdAt)) {
                result.push({ type: "divider", label: dayLabel(msg.createdAt), id: `div-${idx}` });
            }
            result.push({ type: "message", ...msg });
        });
        return result;
    }, [messages]);

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* Chat header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                        style={{ background: "linear-gradient(135deg,#0051ae,#0969da)" }}
                    >
                        {(project?.name || "P")[0].toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">{project?.name || "Loading…"}</h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-500" : "bg-slate-300"}`} />
                            <span className="text-[11px] text-slate-400">
                                {connected ? "Connected" : "Connecting…"}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/board/${projectId}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-primary hover:bg-blue-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">view_kanban</span>
                    Open Board
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-slate-50/40">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <LoadingSpinner size="md" className="border-slate-200 border-t-primary" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-200">chat_bubble</span>
                        <p className="text-sm font-semibold text-slate-400">
                            No messages yet. Start the conversation!
                        </p>
                    </div>
                ) : (
                    messagesWithDividers.map((item) =>
                        item.type === "divider" ? (
                            <DayDivider key={item.id} label={item.label} />
                        ) : (
                            <MessageBubble
                                key={item.id}
                                message={item}
                                isOwn={item.sender?.email === user?.email}
                            />
                        )
                    )
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex-shrink-0">
                <div className="flex items-end gap-3">
                    <Avatar
                        name={user?.fullName || user?.email || "?"}
                        size="sm"
                        className="flex-shrink-0 mb-1"
                    />
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder={`Message ${project?.name || ""}… (Enter to send)`}
                            rows={1}
                            className="input-field resize-none pr-12 text-sm max-h-32"
                            style={{ overflowY: "auto" }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={sending || !input.trim()}
                            className="
                absolute right-2 bottom-2
                w-8 h-8 rounded-lg btn-primary
                disabled:opacity-40 disabled:cursor-not-allowed
              "
                        >
                            {sending
                                ? <LoadingSpinner size="sm" />
                                : <span className="material-symbols-outlined text-sm">send</span>
                            }
                        </button>
                    </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 ml-10">
                    Enter to send · Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}

// ── Empty chat placeholder ─────────────────────────────────────────
function NoChatSelected() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center bg-slate-50/40">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-primary">chat</span>
            </div>
            <div>
                <h3 className="font-bold text-slate-800">Select a project chat</h3>
                <p className="text-sm text-slate-400 mt-1">
                    Choose a project from the left to start messaging.
                </p>
            </div>
        </div>
    );
}

// ── Page root ──────────────────────────────────────────────────────
export default function MessagesPage() {
    const { projects, loading: projectsLoading } = useProjects();
    const [activeProjectId, setActiveProjectId] = useState(null);

    // Auto-select first project
    useEffect(() => {
        if (!activeProjectId && projects.length > 0) {
            setActiveProjectId(projects[0].id);
        }
    }, [projects, activeProjectId]);

    return (
        <div className="flex h-[calc(100vh-4rem-3rem)] -m-6 overflow-hidden rounded-none">
            {/* Left: project list */}
            <ProjectList
                projects={projects}
                activeId={activeProjectId}
                onSelect={setActiveProjectId}
                loading={projectsLoading}
            />

            {/* Right: chat area */}
            {activeProjectId ? (
                <ChatArea key={activeProjectId} projectId={activeProjectId} />
            ) : (
                <NoChatSelected />
            )}
        </div>
    );
}