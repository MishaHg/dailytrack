const { useState, useEffect, useContext, createContext, useCallback, useMemo } = React;

// ==========================================
// 1. API SERVICE
// ==========================================
const api = {
  getTasks: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`/api/tasks${qs ? '?' + qs : ''}`);
    return res.json();
  },
  getTodayTasks: async () => {
    const res = await fetch('/api/tasks/today');
    return res.json();
  },
  createTask: async (task) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    return res.json();
  },
  updateTask: async (id, task) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    return res.json();
  },
  toggleTask: async (id) => {
    const res = await fetch(`/api/tasks/${id}/toggle`, { method: 'POST' });
    return res.json();
  },
  deleteTask: async (id) => {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    return res.json();
  },
  getHabits: async (days = 7) => {
    const res = await fetch(`/api/habits?days=${days}`);
    return res.json();
  },
  createHabit: async (habit) => {
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(habit)
    });
    return res.json();
  },
  updateHabit: async (id, habit) => {
    const res = await fetch(`/api/habits/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(habit)
    });
    return res.json();
  },
  toggleHabit: async (id, date = null) => {
    const res = await fetch(`/api/habits/${id}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date })
    });
    return res.json();
  },
  deleteHabit: async (id) => {
    const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
    return res.json();
  },
  getOverallStats: async () => {
    const res = await fetch('/api/stats');
    return res.json();
  },
  getSettings: async () => {
    const res = await fetch('/api/settings');
    return res.json();
  },
  updateSetting: async (key, value) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    });
    return res.json();
  },
  clearCompletedTasks: async () => {
    const res = await fetch('/api/settings/clear-completed', { method: 'POST' });
    return res.json();
  },
  resetData: async () => {
    const res = await fetch('/api/settings/reset-data', { method: 'POST' });
    return res.json();
  },
  exportData: async () => {
    const res = await fetch('/api/settings/export');
    return res.json();
  },
  importData: async (data) => {
    const res = await fetch('/api/settings/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};

// ==========================================
// 2. ICONS (Lucide Style SVG)
// ==========================================
const SunIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const CalendarIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const CheckSquareIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const RepeatIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>
);

const BarChartIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" x2="12" y1="20" y2="10" />
    <line x1="18" x2="18" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="16" />
  </svg>
);

const SettingsIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const PlusIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" x2="12" y1="5" y2="19" />
    <line x1="5" x2="19" y1="12" y2="12" />
  </svg>
);

const TrashIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const EditIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ClockIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const FlameIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
  </svg>
);

const SearchIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" x2="16.65" y1="21" y2="16.65" />
  </svg>
);

const MenuIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const XIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" x2="6" y1="6" y2="18" />
    <line x1="6" x2="18" y1="6" y2="18" />
  </svg>
);

const AwardIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

// ==========================================
// 3. CONTEXTS (Theme & App State)
// ==========================================
const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem("dailytrack_theme") || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("dailytrack_theme", theme);
  }, [theme]);

  useEffect(() => {
    api.getSettings().then((s) => {
      if (s && s.theme && s.theme !== theme) {
        setThemeState(s.theme);
      }
    }).catch(() => {});
  }, []);

  const setTheme = async (newTheme) => {
    setThemeState(newTheme);
    try {
      await api.updateSetting("theme", newTheme);
    } catch (e) {}
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === "dark", toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

const useTheme = () => useContext(ThemeContext);

const AppContext = createContext();

function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState("today");
  const [tasks, setTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async (params = {}) => {
    try {
      const data = await api.getTasks(params);
      setTasks(data);
      return data;
    } catch (e) {}
  }, []);

  const fetchTodayTasks = useCallback(async () => {
    try {
      const data = await api.getTodayTasks();
      setTodayTasks(data);
      return data;
    } catch (e) {}
  }, []);

  const fetchHabits = useCallback(async (days = 7) => {
    try {
      const data = await api.getHabits(days);
      setHabits(data);
      return data;
    } catch (e) {}
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getOverallStats();
      setStats(data);
      return data;
    } catch (e) {}
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
      return data;
    } catch (e) {}
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchTasks(),
        fetchTodayTasks(),
        fetchHabits(),
        fetchStats(),
        fetchSettings()
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchTasks, fetchTodayTasks, fetchHabits, fetchStats, fetchSettings]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Synchronizace stavu po toggle úkolu
  const toggleTask = async (taskId) => {
    try {
      const updated = await api.toggleTask(taskId);
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      setTodayTasks(prev => {
        const exists = prev.some(t => t.id === taskId);
        return exists ? prev.map(t => t.id === taskId ? updated : t) : prev;
      });
      fetchStats();
      fetchSettings();
      return updated;
    } catch (e) {
      console.error(e);
    }
  };

  const createTask = async (taskData) => {
    const created = await api.createTask(taskData);
    await Promise.all([fetchTasks(), fetchTodayTasks(), fetchStats(), fetchSettings()]);
    return created;
  };

  const updateTask = async (taskId, taskData) => {
    const updated = await api.updateTask(taskId, taskData);
    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    setTodayTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    fetchStats();
    return updated;
  };

  const deleteTask = async (taskId) => {
    await api.deleteTask(taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setTodayTasks(prev => prev.filter(t => t.id !== taskId));
    fetchStats();
    fetchSettings();
  };

  // Synchronizace stavu po toggle návyku
  const toggleHabit = async (habitId, dateStr = null) => {
    const res = await api.toggleHabit(habitId, dateStr);
    if (res && res.habit) {
      setHabits(prev => prev.map(h => h.id === habitId ? res.habit : h));
    } else {
      await fetchHabits();
    }
    fetchStats();
  };

  const createHabit = async (habitData) => {
    const created = await api.createHabit(habitData);
    await Promise.all([fetchHabits(), fetchStats(), fetchSettings()]);
    return created;
  };

  const updateHabit = async (habitId, habitData) => {
    const updated = await api.updateHabit(habitId, habitData);
    setHabits(prev => prev.map(h => h.id === habitId ? updated : h));
    return updated;
  };

  const deleteHabit = async (habitId) => {
    await api.deleteHabit(habitId);
    setHabits(prev => prev.filter(h => h.id !== habitId));
    fetchStats();
    fetchSettings();
  };

  const clearCompletedTasks = async () => {
    await api.clearCompletedTasks();
    await refreshAll();
  };

  const resetAllData = async () => {
    await api.resetData();
    await refreshAll();
  };

  const exportAllData = async () => {
    return await api.exportData();
  };

  const importAllData = async (jsonData) => {
    const res = await api.importData(jsonData);
    await refreshAll();
    return res;
  };

  const pendingTasksCount = tasks.filter(t => !t.completed).length;
  const todayPendingCount = todayTasks.filter(t => !t.completed).length;

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        tasks,
        todayTasks,
        habits,
        stats,
        settings,
        isLoading,
        pendingTasksCount,
        todayPendingCount,
        toggleTask,
        createTask,
        updateTask,
        deleteTask,
        toggleHabit,
        createHabit,
        updateHabit,
        deleteHabit,
        clearCompletedTasks,
        resetAllData,
        exportAllData,
        importAllData,
        refreshAll
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

const useApp = () => useContext(AppContext);

// ==========================================
// 4. SIDEBAR COMPONENT
// ==========================================
function Sidebar({ isOpen, onClose }) {
  const { isDark, toggleTheme } = useTheme();
  const { activeTab, setActiveTab, pendingTasksCount, todayPendingCount } = useApp();

  const NAV_ITEMS = [
    { id: "today", label: "Dnes", icon: CalendarIcon, badge: todayPendingCount },
    { id: "tasks", label: "Úkoly", icon: CheckSquareIcon, badge: pendingTasksCount },
    { id: "habits", label: "Návyky", icon: RepeatIcon },
    { id: "stats", label: "Statistiky", icon: BarChartIcon },
    { id: "settings", label: "Nastavení", icon: SettingsIcon }
  ];

  const handleSelect = (id) => {
    setActiveTab(id);
    if (onClose) onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static top-0 left-0 z-50
          w-64 h-full min-h-screen flex flex-col justify-between
          bg-[#090D16] text-slate-100
          border-r border-[#1E293B]
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div>
          <div className="px-6 pt-7 pb-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white font-bold text-lg">
                DT
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white">DailyTrack</h1>
                <p className="text-xs text-slate-400 font-medium">Osobní organizér</p>
              </div>
            </div>
          </div>

          <div className="px-4 my-2">
            <div className="h-[1px] bg-slate-800" />
          </div>

          <nav className="px-3 py-2 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-150 group
                    ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive ? "bg-indigo-700 text-white" : "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-all shadow-sm"
          >
            <div className="flex items-center space-x-3">
              {isDark ? <MoonIcon className="w-5 h-5 text-indigo-400" /> : <SunIcon className="w-5 h-5 text-amber-400" />}
              <span>{isDark ? "Tmavý režim" : "Světlý režim"}</span>
            </div>
            <span className="text-xs">{isDark ? "🌙" : "☀️"}</span>
          </button>

          <div className="text-[11px] text-center text-slate-500 pt-1">
            DailyTrack Web • SQLite Edition
          </div>
        </div>
      </aside>
    </>
  );
}

// ==========================================
// 5. HEADER COMPONENT
// ==========================================
function Header({ onOpenSidebar }) {
  const { isDark, toggleTheme } = useTheme();
  const { activeTab } = useApp();

  const titles = {
    today: "Dnes (Dashboard)",
    tasks: "Správa úkolů",
    habits: "Sledování návyků",
    stats: "Statistiky a vizualizace",
    settings: "Nastavení aplikace"
  };

  const todayStr = new Intl.DateTimeFormat("cs-CZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3.5 bg-white/85 dark:bg-[#0F172A]/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <MenuIcon className="w-6 h-6" />
        </button>

        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white capitalize">
            {titles[activeTab] || "DailyTrack"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize hidden sm:block">
            {todayStr}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 transition-colors"
          title="Přepnout Tmavý / Světlý režim"
        >
          {isDark ? <SunIcon className="w-5 h-5 text-amber-400" /> : <MoonIcon className="w-5 h-5 text-indigo-600" />}
        </button>
      </div>
    </header>
  );
}

// ==========================================
// 6. TODAY VIEW
// ==========================================
function TodayView() {
  const { todayTasks, habits, toggleTask, toggleHabit, setActiveTab, createTask } = useApp();
  const [quickTitle, setQuickTitle] = useState("");

  const pendingTasks = todayTasks.filter(t => !t.completed);
  const completedHabitsCount = habits.filter(h => h.completed_today).length;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    const todayIso = new Date().toISOString().split("T")[0];
    await createTask({
      title: quickTitle.trim(),
      description: "",
      priority: "Střední",
      due_date: todayIso,
      recurrence: "Žádné"
    });
    setQuickTitle("");
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Vysoká": return "bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20";
      case "Střední": return "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20";
      default: return "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/15">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md mb-3">
          ☀️ Dnešní přehled
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold">Vítejte v DailyTrack Web</h2>
        <p className="mt-2 text-indigo-100 text-sm sm:text-base">
          Dnes máte ke splnění <strong className="text-white underline">{pendingTasks.length} úkolů</strong> a{" "}
          <strong className="text-white underline">{completedHabitsCount} z {habits.length}</strong> splněných návyků.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          <div className="bg-white/15 backdrop-blur-md rounded-xl px-4 py-2.5 flex items-center space-x-3 border border-white/20">
            <FlameIcon className="w-6 h-6 text-amber-300" />
            <div>
              <div className="text-xs text-indigo-100">Splněné návyky</div>
              <div className="text-lg font-bold">{completedHabitsCount} / {habits.length}</div>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-xl px-4 py-2.5 flex items-center space-x-3 border border-white/20">
            <CalendarIcon className="w-6 h-6 text-emerald-300" />
            <div>
              <div className="text-xs text-indigo-100">Zbývající úkoly</div>
              <div className="text-lg font-bold">{pendingTasks.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dnešní návyky */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FlameIcon className="w-5 h-5 text-amber-500" />
              Dnešní návyky
            </h3>
            <button onClick={() => setActiveTab("habits")} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Vše →
            </button>
          </div>

          <div className="space-y-3">
            {habits.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
                Žádné návyky. Vytvořte si první v záložce Návyky!
              </div>
            ) : (
              habits.map((habit) => (
                <div
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`
                    cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between
                    ${
                      habit.completed_today
                        ? "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60"
                        : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 hover:border-indigo-400"
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                        habit.completed_today ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                      }`}
                    >
                      {habit.completed_today && <CheckIcon className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{habit.name}</div>
                      <div className="text-xs text-slate-400">Série: <strong>{habit.current_streak} dní</strong></div>
                    </div>
                  </div>

                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    habit.completed_today ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  }`}>
                    {habit.completed_today ? "Splněno" : "Odbavit"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dnešní úkoly */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-500" />
              Úkoly na dnešek & po termínu
            </h3>
            <button onClick={() => setActiveTab("tasks")} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Vše →
            </button>
          </div>

          <form onSubmit={handleQuickAdd} className="flex gap-2">
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="Rychle přidat úkol na dnešek..."
              className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!quickTitle.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm flex items-center gap-1.5 shadow-sm"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Přidat</span>
            </button>
          </form>

          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                Pro dnešek nemáte žádné čekající úkoly. Vše hotovo! 🎉
              </div>
            ) : (
              todayTasks.map((task) => (
                <div
                  key={task.id}
                  className={`
                    p-4 rounded-2xl border transition-all flex items-start justify-between gap-3
                    ${
                      task.completed
                        ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70"
                        : task.is_overdue
                        ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                        : "bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/60"
                    }
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`
                        mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors
                        ${task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-indigo-500"}
                      `}
                    >
                      {task.completed && <CheckIcon className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className={`text-sm font-semibold ${task.completed ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-white"}`}>
                        {task.title}
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{task.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getPriorityClass(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.due_date && (
                          <span className={`text-[11px] flex items-center gap-1 ${task.is_overdue ? "text-rose-500 font-bold" : "text-slate-400"}`}>
                            <ClockIcon className="w-3.5 h-3.5" />
                            {task.is_overdue ? "Zpožděno: " : "Termín: "}{task.due_date}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. TASKS VIEW
// ==========================================
function TasksView() {
  const { tasks, toggleTask, createTask, updateTask, deleteTask } = useApp();
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Střední",
    due_date: "",
    recurrence: "Žádné"
  });

  const openCreateDialog = () => {
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      priority: "Střední",
      due_date: new Date().toISOString().split("T")[0],
      recurrence: "Žádné"
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority || "Střední",
      due_date: task.due_date || "",
      recurrence: task.recurrence || "Žádné"
    });
    setIsDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    if (editingTask) {
      await updateTask(editingTask.id, formData);
    } else {
      await createTask(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id, title) => {
    if (confirm(`Opravdu chcete smazat úkol "${title}"?`)) {
      await deleteTask(id);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter === "pending" && t.completed) return false;
      if (statusFilter === "completed" && !t.completed) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return t.title.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, searchQuery]);

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Vysoká": return "bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20";
      case "Střední": return "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20";
      default: return "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <SearchIcon className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Hledat v úkolech a poznámkách..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={openCreateDialog}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Přidat úkol</span>
        </button>
      </div>

      {/* Filtrační lišta */}
      <div className="flex flex-wrap gap-2 items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex gap-1">
          {[
            { id: "all", label: "Všechny" },
            { id: "pending", label: "K vyřízení" },
            { id: "completed", label: "Dokončené" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                statusFilter === tab.id ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Priorita:</span>
          {["all", "Vysoká", "Střední", "Nízká"].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                priorityFilter === p ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {p === "all" ? "Vše" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Seznam úkolů */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
            Nebyly nalezeny žádné úkoly.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`
                p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 group
                ${
                  task.completed
                    ? "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-75"
                    : task.is_overdue
                    ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                    : "bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/60 hover:shadow-md"
                }
              `}
            >
              <div className="flex items-start space-x-3.5 flex-1">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`
                    mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors flex-shrink-0
                    ${task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-indigo-500"}
                  `}
                >
                  {task.completed && <CheckIcon className="w-4 h-4" />}
                </button>

                <div className="flex-1">
                  <h4 className={`text-base font-semibold ${task.completed ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-white"}`}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getPriorityClass(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.due_date && (
                      <span className={`text-[11px] flex items-center gap-1 font-medium ${task.is_overdue ? "text-rose-500 font-bold" : "text-slate-500 dark:text-slate-400"}`}>
                        <ClockIcon className="w-3.5 h-3.5" />
                        {task.is_overdue ? "Zpožděno: " : "Termín: "}{task.due_date}
                      </span>
                    )}
                    {task.recurrence && task.recurrence !== "Žádné" && (
                      <span className="text-[11px] flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        <RepeatIcon className="w-3 h-3" />
                        {task.recurrence}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditDialog(task)}
                  className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Upravit"
                >
                  <EditIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(task.id, task.title)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  title="Smazat"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dialog pro úkol */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTask ? "Upravit úkol" : "Nový úkol"}
              </h3>
              <button onClick={() => setIsDialogOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Název *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Název úkolu..."
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Popis</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Doplňující podrobnosti..."
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priorita</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Nízká">Nízká</option>
                    <option value="Střední">Střední</option>
                    <option value="Vysoká">Vysoká</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Opakování</label>
                  <select
                    value={formData.recurrence}
                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Žádné">Žádné</option>
                    <option value="Denně">Denně</option>
                    <option value="Týdně">Týdně</option>
                    <option value="Měsíčně">Měsíčně</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Termín splnění</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25"
                >
                  Uložit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 8. HABITS VIEW
// ==========================================
function HabitsView() {
  const { habits, toggleHabit, createHabit, updateHabit, deleteHabit } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", color: "#6366F1" });

  const PRESET_COLORS = ["#6366F1", "#10B981", "#06B6D4", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

  const openCreateDialog = () => {
    setEditingHabit(null);
    setFormData({ name: "", description: "", color: "#6366F1" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (habit) => {
    setEditingHabit(habit);
    setFormData({ name: habit.name, description: habit.description || "", color: habit.color || "#6366F1" });
    setIsDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (editingHabit) {
      await updateHabit(editingHabit.id, formData);
    } else {
      await createHabit(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Opravdu chcete smazat návyk "${name}"?`)) {
      await deleteHabit(id);
    }
  };

  const getDaysHeader = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().split("T")[0];
      const dayName = new Intl.DateTimeFormat("cs-CZ", { weekday: "short" }).format(d);
      days.push({ iso, label: `${dayName} ${d.getDate()}`, isToday: i === 0 });
    }
    return days;
  };

  const daysHeader = getDaysHeader();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sledování denních návyků</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kliknutím na jednotlivé dny můžete návyk zpětně označit nebo odznačit.
          </p>
        </div>

        <button
          onClick={openCreateDialog}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center gap-2 shadow-md shadow-indigo-600/20"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Přidat návyk</span>
        </button>
      </div>

      <div className="space-y-4">
        {habits.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
            Zatím nemáte žádné návyky. Vytvořte si první kliknutím na tlačítko výše!
          </div>
        ) : (
          habits.map((habit) => {
            const habitColor = habit.color || "#6366F1";
            return (
              <div
                key={habit.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5 flex-1">
                    <div className="w-3.5 h-12 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: habitColor }} />
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{habit.name}</h3>
                      {habit.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{habit.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 dark:text-amber-400">
                          <FlameIcon className="w-4 h-4" />
                          <span>Aktuální: {habit.current_streak} dní</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                          <AwardIcon className="w-4 h-4 text-indigo-400" />
                          <span>Rekord: {habit.best_streak} dní</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 7denní mřížka */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                    {daysHeader.map((d) => {
                      const isDone = Boolean(habit.recent_history && habit.recent_history[d.iso]);
                      return (
                        <button
                          key={d.iso}
                          onClick={() => toggleHabit(habit.id, d.iso)}
                          title={`Změnit splnění pro ${d.iso}`}
                          className={`
                            flex flex-col items-center justify-center w-11 h-13 py-1.5 rounded-xl border text-xs font-semibold transition-all
                            ${isDone ? "text-white shadow-sm border-transparent" : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"}
                            ${d.isToday ? "ring-2 ring-indigo-500/50" : ""}
                          `}
                          style={isDone ? { backgroundColor: habitColor } : {}}
                        >
                          <span className="text-[10px] opacity-80 uppercase leading-none">{d.label.split(" ")[0]}</span>
                          <span className="text-xs font-bold mt-1 leading-none">{d.label.split(" ")[1]}</span>
                          <div className="mt-1">
                            {isDone ? <CheckIcon className="w-3.5 h-3.5 text-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex md:flex-col items-center justify-end space-x-1 md:space-x-0 md:space-y-1">
                    <button onClick={() => openEditDialog(habit)} className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700">
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(habit.id, habit.name)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{editingHabit ? "Upravit návyk" : "Nový návyk"}</h3>
              <button onClick={() => setIsDialogOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Název návyku *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Např. Cvičení, Čtení, Pitný režim..."
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Popis / Cíl</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Např. 20 minut denně..."
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Barva návyku</label>
                <div className="flex items-center gap-3">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-7 h-7 rounded-full transition-transform ${formData.color === c ? "scale-125 ring-2 ring-offset-2 ring-slate-900 dark:ring-white" : "hover:scale-110"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25"
                >
                  Uložit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 9. STATS VIEW
// ==========================================
function StatsView() {
  const { stats } = useApp();

  const tasks = stats?.tasks || { total: 0, completed: 0, pending: 0, overdue: 0, completion_rate: 0.0 };
  const habits = stats?.habits || { total_habits: 0, completed_today: 0, best_overall_streak: 0, current_max_streak: 0, total_checkins: 0 };
  const activity = stats?.activity_14_days || [];
  const maxActivity = Math.max(...activity.map(a => a.count), 1);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (tasks.completion_rate / 100) * circumference;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Přehled produktivity a statistiky</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Agregovaná data a vizualizace vašeho pokroku.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Splněné úkoly</span>
            <CheckSquareIcon className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {tasks.completed} <span className="text-xs text-slate-400 font-normal">/ {tasks.total} celkem</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{tasks.completion_rate}% úspěšnost</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">K vyřízení</span>
            <ClockIcon className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {tasks.pending} {tasks.overdue > 0 && <span className="text-xs text-rose-500">({tasks.overdue} zpožděno)</span>}
          </div>
          <div className="mt-2 text-xs text-slate-400">Aktivní úkoly</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Rekordní série</span>
            <AwardIcon className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {habits.best_overall_streak} <span className="text-xs text-slate-400 font-normal">dní</span>
          </div>
          <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Aktuální max: {habits.current_max_streak} dní</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Celkem odbavení</span>
            <FlameIcon className="w-5 h-5 text-rose-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {habits.total_checkins} <span className="text-xs text-slate-400 font-normal">check-inů</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">Dnes: {habits.completed_today} / {habits.total_habits}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prstencový graf */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 self-start">Poměr splnění úkolů</h3>
          <div className="relative w-40 h-40 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r={radius} className="text-slate-100 dark:text-slate-700 stroke-current" strokeWidth="12" fill="transparent" />
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="text-indigo-600 stroke-current transition-all duration-700"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{tasks.completion_rate}%</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Hotovo</span>
            </div>
          </div>
          <div className="w-full mt-4 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <div className="text-emerald-600 font-bold">{tasks.completed}</div>
              <div className="text-slate-400 text-[11px]">Dokončeno</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <div className="text-amber-500 font-bold">{tasks.pending}</div>
              <div className="text-slate-400 text-[11px]">Čeká</div>
            </div>
          </div>
        </div>

        {/* Sloupcový graf */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Aktivita návyků za posledních 14 dní</h3>
            <p className="text-xs text-slate-400 mb-6">Denní počet splněných a zaznamenaných návyků.</p>
          </div>

          <div className="h-44 flex items-end justify-between gap-1 sm:gap-2 pt-6 pb-2 border-b border-slate-200 dark:border-slate-700">
            {activity.map((item) => {
              const heightPercent = Math.round((item.count / maxActivity) * 100);
              return (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="absolute -top-7 hidden group-hover:flex bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow z-10 whitespace-nowrap">
                    {item.label}: {item.count} splněno
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700/40 rounded-t-lg h-32 flex items-end justify-center p-1">
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${item.count > 0 ? "bg-indigo-600 dark:bg-indigo-500" : "bg-transparent"}`}
                      style={{ height: `${Math.max(heightPercent, item.count > 0 ? 12 : 0)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white truncate">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-xs text-slate-400 pt-3">
            <span>Před 14 dny</span>
            <span className="font-semibold text-indigo-500">Dnes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 10. SETTINGS VIEW
// ==========================================
function SettingsView() {
  const { theme, setTheme } = useTheme();
  const { settings, clearCompletedTasks, resetAllData, exportAllData, importAllData } = useApp();
  const [notification, setNotification] = useState("");
  const fileInputRef = React.useRef(null);

  const showNotify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  };

  const handleClear = async () => {
    if (confirm("Opravdu chcete smazat všechny dokončené úkoly?")) {
      await clearCompletedTasks();
      showNotify("Dokončené úkoly byly smazány.");
    }
  };

  const handleReset = async () => {
    if (confirm("POZOR: Tato akce smaže veškerá data a obnoví ukázková. Pokračovat?")) {
      await resetAllData();
      showNotify("Data byla resetována do ukázkového stavu.");
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `dailytrack-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotify("Záloha byla úspěšně stažena.");
    } catch (e) {
      alert("Chyba při exportu dat: " + e.message);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || (!parsed.tasks && !parsed.habits)) {
        throw new Error("Neplatný formát zálohy DailyTrack.");
      }
      if (confirm(`Opravdu chcete importovat zálohu z ${file.name}? Stávající data budou nahrazena.`)) {
        await importAllData(parsed);
        showNotify("Data byla úspěšně obnovena ze zálohy.");
      }
    } catch (err) {
      alert("Chyba při importu zálohy: " + err.message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:8000";

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nastavení aplikace</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Volba motivu, zálohování a informace o webovém připojení.</p>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-2">
          <CheckIcon className="w-5 h-5" />
          <span>{notification}</span>
        </div>
      )}

      {/* Web & Cloud Server Info */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/20 via-slate-900/40 to-slate-900/20 border border-indigo-500/30 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Webový server & Internetové připojení</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tato stránka je dostupná přes webový prohlížeč z jakéhokoliv zařízení.</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Online
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Webová adresa (URL)</span>
            <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 truncate mt-0.5">{currentOrigin}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">REST API Rozhraní</span>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">FastAPI + OpenAPI</div>
            </div>
            <a
              href={`${currentOrigin}/docs`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-indigo-500 hover:text-indigo-400 underline underline-offset-2"
            >
              Swagger /docs &rarr;
            </a>
          </div>
        </div>
      </div>

      {/* Téma */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Grafické téma</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setTheme("dark")}
            className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition-all ${
              theme === "dark" ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-600 ring-2 ring-indigo-500/20" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
            }`}
          >
            <div className="p-2.5 rounded-lg bg-slate-900 text-indigo-400"><MoonIcon className="w-5 h-5" /></div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Tmavý režim (Dark)</div>
              <p className="text-xs text-slate-400 mt-1">Hluboká břidlicová modř pro práci večer.</p>
            </div>
          </button>

          <button
            onClick={() => setTheme("light")}
            className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition-all ${
              theme === "light" ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-600 ring-2 ring-indigo-500/20" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
            }`}
          >
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-600"><SunIcon className="w-5 h-5" /></div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Světlý režim (Light)</div>
              <p className="text-xs text-slate-400 mt-1">Čistý světlý podklad s vysokým kontrastem.</p>
            </div>
          </button>
        </div>
      </div>

      {/* Záloha a přenos dat */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Záloha a přenos dat</h3>
          <p className="text-xs text-slate-400 mt-1">Stáhněte si kompletní data do souboru JSON pro přenos na jiné zařízení nebo zálohu.</p>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,application/json"
          style={{ display: "none" }}
        />

        <div className="flex flex-col sm:flex-row gap-4 pt-1">
          <button
            onClick={handleExport}
            className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm shadow-indigo-600/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            <span>Stáhnout zálohu (Export JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            <span>Obnovit ze zálohy (Import JSON)</span>
          </button>
        </div>
      </div>

      {/* Databáze */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Informace o databázi SQLite</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-400">Velikost souboru</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{settings?.db_size_kb || 0} KB</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-400">Celkem úkolů</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{settings?.tasks_count || 0}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-400">Aktivní návyky</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{settings?.habits_count || 0}</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button
            onClick={handleClear}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <TrashIcon className="w-4 h-4 text-amber-500" />
            <span>Vyčistit dokončené úkoly</span>
          </button>

          <button
            onClick={handleReset}
            className="flex-1 px-4 py-3 rounded-xl border border-rose-300 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <RepeatIcon className="w-4 h-4" />
            <span>Obnovit ukázková data (Reset)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 11. MAIN APP
// ==========================================
function MainLayout() {
  const { activeTab } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
          {activeTab === "today" && <TodayView />}
          {activeTab === "tasks" && <TasksView />}
          {activeTab === "habits" && <HabitsView />}
          {activeTab === "stats" && <StatsView />}
          {activeTab === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
