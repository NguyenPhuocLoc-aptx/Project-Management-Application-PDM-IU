import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5054";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

// ── Request interceptor: attach JWT if present ──────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            // Dispatch a custom event so AuthContext can react
            // without a direct import cycle
            window.dispatchEvent(new Event("auth:logout"));
            if (window.location.pathname !== "/auth") {
                window.location.href = "/auth";
            }
        }
        return Promise.reject(error);
    }
);

export default api;

// ── Auth ─────────────────────────────────────────────────────────────
export const authService = {
    signup: (fullName, email, password) =>
        api.post("/auth/signup", { fullName, email, password }),
    signin: (email, password) =>
        api.post("/auth/signin", { email, password }),
};

// ── Workspaces ────────────────────────────────────────────────────────
export const workspaceService = {
    getAll: () => api.get("/api/workspaces"),
    create: (data) => api.post("/api/workspaces", data),
    getById: (id) => api.get(`/api/workspaces/${id}`),
    getProjects: (id) => api.get(`/api/workspaces/${id}/projects`),
    createProject: (id, data) => api.post(`/api/workspaces/${id}/projects`, data),
};

// ── Projects ──────────────────────────────────────────────────────────
export const projectService = {
    getAll: (params) => api.get("/api/projects", { params }),
    getById: (id) => api.get(`/api/projects/${id}`),
    create: (data) => api.post("/api/projects", data),
    update: (id, data) => api.put(`/api/projects/${id}`, data),
    delete: (id) => api.delete(`/api/projects/${id}`),
    search: (keyword) => api.get("/api/projects/search", { params: { keyword } }),
    getMembers: (id) => api.get(`/api/projects/${id}/members`),
    getChat: (id) => api.get(`/api/projects/${id}/chat`),
};

// ── Tasks ─────────────────────────────────────────────────────────────

export const taskService = {
    getByProject: (projectId) => api.get(`/api/projects/${projectId}/tasks`),
    getById: (id) => api.get(`/api/tasks/${id}`),
    create: (projectId, data) => api.post(`/api/projects/${projectId}/tasks`, data),
    update: (id, data) => api.patch(`/api/tasks/${id}`, data),
    delete: (id) => api.delete(`/api/tasks/${id}`),
    updateStatus: (id, status) => api.patch(`/api/tasks/${id}/status`, { status }),
};

// ── Comments ──────────────────────────────────────────────────────────
export const commentService = {
    getByTask: (taskId) => api.get(`/api/tasks/${taskId}/comments`),
    create: (taskId, content) => api.post(`/api/tasks/${taskId}/comments`, { content }),
    delete: (id) => api.delete(`/api/comments/${id}`),
};

// ── Notifications ─────────────────────────────────────────────────────
export const notificationService = {
    getAll: () => api.get("/api/notifications"),
    markRead: (id) => api.patch(`/api/notifications/${id}/read`),
    markAllRead: () => api.patch("/api/notifications/read-all"),
};

// ── My Tasks (assigned to current user) ───────────────────────────────
export const myTasksService = {
    getAssigned: () => api.get("/api/tasks/my-tasks"),
};

// ── Chat & Messages ────────────────────────────────────────────────────
export const chatService = {
    getOnlineUsers: () => api.get("/api/chat/users/online"),
    sendMessage: (data) => api.post("/api/chat/messages", data),
    getMessages: (userId) => api.get(`/api/chat/messages/${userId}`),
    getConversations: () => api.get("/api/chat/conversations"),
    deleteMessage: (id) => api.delete(`/api/chat/messages/${id}`),
};

// ── Project Messages ───────────────────────────────────────────────────
export const projectMessagesService = {
    getByProject: (projectId) => api.get(`/api/messages/chat/${projectId}`),
    send: (projectId, content) =>
        api.post("/api/messages/send", { chatId: projectId, content }),
};

// ── Message Service (used by useChat.js) ──────────────────────────────
export const messageService = {
    getByProject: (projectId) => api.get(`/api/messages/chat/${projectId}`),
    send: (projectId, content) =>
        api.post("/api/messages/send", { chatId: projectId, content, projectId }),
};