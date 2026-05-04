// src/hooks/useChat.js
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

    // ── Fetch project info + message history ─────────────────────────
    useEffect(() => {
        if (!projectId) return;
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
            webSocketFactory: () =>
                new SockJS(`${WS_URL}/ws`),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            onConnect: () => {
                setConnected(true);
                // Subscribe to the project's group channel
                client.subscribe(`/group/${projectId}`, (frame) => {
                    try {
                        const msg = JSON.parse(frame.body);
                        setMessages((prev) => {
                            // Avoid duplicate messages
                            if (prev.some((m) => m.id === msg.id)) return prev;
                            return [...prev, msg];
                        });
                    } catch {
                        // Malformed frame — ignore
                    }
                });
            },
            onDisconnect: () => setConnected(false),
            onStompError: () => setConnected(false),
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
            setConnected(false);
        };
    }, [projectId, token]);

    // ── Send message via REST (more reliable than STOMP publish) ──────
    const sendMessage = useCallback(async (content) => {
        if (!content.trim()) return;
        try {
            const { data } = await messageService.send(projectId, content);
            // Add our own message to the list if WS doesn't echo it
            setMessages((prev) => {
                if (prev.some((m) => m.id === data.id)) return prev;
                return [...prev, data];
            });
        } catch {
            throw new Error("Failed to send message.");
        }
    }, [projectId]);

    return { messages, loading, connected, project, sendMessage };
}