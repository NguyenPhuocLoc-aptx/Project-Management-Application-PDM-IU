const API_BASE_URL = 'http://localhost:5054';

class ApiService {
    static getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AuthService.getToken()}`
        };
    }

    static async request(method, path, body = null) {
        try {
            const options = {
                method,
                headers: this.getHeaders(),
                credentials: 'include'
            };
            if (body) options.body = JSON.stringify(body);
            const response = await fetch(`${API_BASE_URL}${path}`, options);
            if (response.status === 401) {
                AuthService.logout();
                return null;
            }
            const text = await response.text();
            const data = text ? JSON.parse(text) : {};
            if (!response.ok) throw new Error(data.message || `Error ${response.status}`);
            return data;
        } catch (error) {
            console.error(`API ${method} ${path}:`, error);
            throw error;
        }
    }

    // ── Workspaces ──
    static getWorkspaces() { return this.request('GET', '/workspaces'); }
    static createWorkspace(data) { return this.request('POST', '/workspaces', data); }
    static getWorkspace(id) { return this.request('GET', `/workspaces/${id}`); }

    // ── Projects ──
    static getProjects(workspaceId) { return this.request('GET', `/workspaces/${workspaceId}/projects`); }
    static createProject(workspaceId, data) { return this.request('POST', `/workspaces/${workspaceId}/projects`, data); }
    static getProject(id) { return this.request('GET', `/projects/${id}`); }
    static updateProject(id, data) { return this.request('PUT', `/projects/${id}`, data); }
    static deleteProject(id) { return this.request('DELETE', `/projects/${id}`); }

    // ── Tasks ──
    static getTasks(projectId) { return this.request('GET', `/projects/${projectId}/tasks`); }
    static createTask(projectId, data) { return this.request('POST', `/projects/${projectId}/tasks`, data); }
    static getTask(id) { return this.request('GET', `/tasks/${id}`); }
    static updateTask(id, data) { return this.request('PUT', `/tasks/${id}`, data); }
    static deleteTask(id) { return this.request('DELETE', `/tasks/${id}`); }
    static updateTaskStatus(id, status) { return this.request('PATCH', `/tasks/${id}/status`, { status }); }

    // ── Comments ──
    static getComments(taskId) { return this.request('GET', `/tasks/${taskId}/comments`); }
    static createComment(taskId, content) { return this.request('POST', `/tasks/${taskId}/comments`, { content }); }
    static deleteComment(id) { return this.request('DELETE', `/comments/${id}`); }

    // ── Members ──
    static getProjectMembers(projectId) { return this.request('GET', `/projects/${projectId}/members`); }
    static getWorkspaceMembers(workspaceId) { return this.request('GET', `/workspaces/${workspaceId}/members`); }

    // ── Notifications ──
    static getNotifications() { return this.request('GET', '/notifications'); }
    static markNotificationRead(id) { return this.request('PATCH', `/notifications/${id}/read`); }
    static markAllRead() { return this.request('PATCH', '/notifications/read-all'); }

    // ── Labels ──
    static getLabels(projectId) { return this.request('GET', `/projects/${projectId}/labels`); }
    static createLabel(projectId, data) { return this.request('POST', `/projects/${projectId}/labels`, data); }
}
