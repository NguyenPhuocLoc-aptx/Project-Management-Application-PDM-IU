import { useState, useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { messageService, projectService } from "../services/api";
import { useAuth } from "../context/AuthContext";

const WS_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5054";

export function useChat(projectId) {
    const { token } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [project, setProject] = useState(null);
    const clientRef = useRef(null);

    // ── Load history + project meta ───────────────────────────────────
    useEffect(() => {
        if (!projectId) return;
        setMessages([]);
        setProject(null);
        setLoading(true);
        Promise.all([
            messageService.getByProject(projectId),
            projectService.getById(projectId),
        ])
            .then(([msgRes, projRes]) => {
                setMessages(Array.isArray(msgRes.data) ? msgRes.data : []);
                setProject(projRes.data || null);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [projectId]);

    // ── WebSocket connection ──────────────────────────────────────────
    useEffect(() => {
        if (!projectId || !token) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 5000,
            onConnect: () => {
                setConnected(true);
                // All messages (including our own) arrive here after the
                // server persists and broadcasts them — single source of truth
                client.subscribe(`/group/${projectId}`, (frame) => {
                    try {
                        const msg = JSON.parse(frame.body);
                        setMessages((prev) => {
                            if (prev.some((m) => m.id === msg.id)) return prev;
                            return [...prev, msg];
                        });
                    } catch {
                        // malformed frame — ignore
                    }
                });
            },
            onDisconnect: () => setConnected(false),
            onStompError:  () => setConnected(false),
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
            setConnected(false);
        };
    }, [projectId, token]);

    // ── Send via REST — broadcast handled server-side ─────────────────
    const sendMessage = useCallback(async (content) => {
        if (!content.trim()) return;
        // No optimistic append here — the message comes back via WebSocket
        await messageService.send(projectId, content);
    }, [projectId]);

    return { messages, loading, connected, project, sendMessage };
}