/**
 * DailyTrack - API klient pro komunikaci s FastAPI backendem
 */

const API_BASE = "/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Chyba serveru: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error na ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Úkoly (Tasks)
  getTasks: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append("status", params.status);
    if (params.priority) query.append("priority", params.priority);
    if (params.search) query.append("search", params.search);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return request(`/tasks${qs}`);
  },
  getTodayTasks: () => request("/tasks/today"),
  getTask: (id) => request(`/tasks/${id}`),
  createTask: (task) => request("/tasks", { method: "POST", body: JSON.stringify(task) }),
  updateTask: (id, task) => request(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(task) }),
  toggleTask: (id) => request(`/tasks/${id}/toggle`, { method: "POST" }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: "DELETE" }),

  // Návyky (Habits)
  getHabits: (days = 7) => request(`/habits?days=${days}`),
  getHabit: (id) => request(`/habits/${id}`),
  createHabit: (habit) => request("/habits", { method: "POST", body: JSON.stringify(habit) }),
  updateHabit: (id, habit) => request(`/habits/${id}`, { method: "PUT", body: JSON.stringify(habit) }),
  toggleHabit: (id, date = null) => request(`/habits/${id}/toggle`, {
    method: "POST",
    body: JSON.stringify({ date })
  }),
  deleteHabit: (id) => request(`/habits/${id}`, { method: "DELETE" }),

  // Statistiky (Stats)
  getOverallStats: () => request("/stats"),
  getTaskStats: () => request("/stats/tasks"),
  getHabitStats: () => request("/stats/habits"),
  getHabitActivity: (days = 14) => request(`/stats/habits/activity?days=${days}`),

  // Nastavení (Settings)
  getSettings: () => request("/settings"),
  updateSetting: (key, value) => request("/settings", {
    method: "POST",
    body: JSON.stringify({ key, value })
  }),
  clearCompletedTasks: () => request("/settings/clear-completed", { method: "POST" }),
  resetData: () => request("/settings/reset-data", { method: "POST" })
};
