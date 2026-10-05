import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../services/api.js";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState("today"); // 'today' | 'tasks' | 'habits' | 'stats' | 'settings'
  const [tasks, setTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Načtení všech dat
  const fetchTasks = useCallback(async (params = {}) => {
    try {
      const data = await api.getTasks(params);
      setTasks(data);
      return data;
    } catch (err) {
      console.error("Chyba při načítání úkolů:", err);
    }
  }, []);

  const fetchTodayTasks = useCallback(async () => {
    try {
      const data = await api.getTodayTasks();
      setTodayTasks(data);
      return data;
    } catch (err) {
      console.error("Chyba při načítání dnešních úkolů:", err);
    }
  }, []);

  const fetchHabits = useCallback(async (days = 7) => {
    try {
      const data = await api.getHabits(days);
      setHabits(data);
      return data;
    } catch (err) {
      console.error("Chyba při načítání návyků:", err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getOverallStats();
      setStats(data);
      return data;
    } catch (err) {
      console.error("Chyba při načítání statistik:", err);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
      return data;
    } catch (err) {
      console.error("Chyba při načítání nastavení:", err);
    }
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
      setError(null);
    } catch (err) {
      setError("Nepodařilo se synchronizovat data se serverem.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchTasks, fetchTodayTasks, fetchHabits, fetchStats, fetchSettings]);

  // První načtení po startu
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // ==========================================
  // REAKTIVNÍ AKCE PRO ÚKOLY
  // ==========================================

  const toggleTask = async (taskId) => {
    try {
      const updated = await api.toggleTask(taskId);
      
      // Okamžitá reaktivní aktualizace obou seznamů v paměti
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      
      // Aktualizujeme i todayTasks
      setTodayTasks(prev => {
        const exists = prev.some(t => t.id === taskId);
        if (exists) {
          return prev.map(t => t.id === taskId ? updated : t);
        }
        return prev;
      });

      // Okamžitě aktualizujeme statistiky a nastavení na pozadí
      fetchStats();
      fetchSettings();
      return updated;
    } catch (err) {
      console.error("Chyba při přepnutí úkolu:", err);
      throw err;
    }
  };

  const createTask = async (taskData) => {
    try {
      const created = await api.createTask(taskData);
      await Promise.all([fetchTasks(), fetchTodayTasks(), fetchStats(), fetchSettings()]);
      return created;
    } catch (err) {
      console.error("Chyba při vytváření úkolu:", err);
      throw err;
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      const updated = await api.updateTask(taskId, taskData);
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      setTodayTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      fetchStats();
      return updated;
    } catch (err) {
      console.error("Chyba při úpravě úkolu:", err);
      throw err;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setTodayTasks(prev => prev.filter(t => t.id !== taskId));
      fetchStats();
      fetchSettings();
    } catch (err) {
      console.error("Chyba při mazání úkolu:", err);
      throw err;
    }
  };

  // ==========================================
  // REAKTIVNÍ AKCE PRO NÁVYKY
  // ==========================================

  const toggleHabit = async (habitId, dateStr = null) => {
    try {
      const res = await api.toggleHabit(habitId, dateStr);
      if (res && res.habit) {
        setHabits(prev => prev.map(h => h.id === habitId ? res.habit : h));
      } else {
        await fetchHabits();
      }
      // Okamžitě přepočítáme statistiky pro grafy
      fetchStats();
      return res;
    } catch (err) {
      console.error("Chyba při toggle návyku:", err);
      throw err;
    }
  };

  const createHabit = async (habitData) => {
    try {
      const created = await api.createHabit(habitData);
      await Promise.all([fetchHabits(), fetchStats(), fetchSettings()]);
      return created;
    } catch (err) {
      console.error("Chyba při vytváření návyku:", err);
      throw err;
    }
  };

  const updateHabit = async (habitId, habitData) => {
    try {
      const updated = await api.updateHabit(habitId, habitData);
      setHabits(prev => prev.map(h => h.id === habitId ? updated : h));
      return updated;
    } catch (err) {
      console.error("Chyba při úpravě návyku:", err);
      throw err;
    }
  };

  const deleteHabit = async (habitId) => {
    try {
      await api.deleteHabit(habitId);
      setHabits(prev => prev.filter(h => h.id !== habitId));
      fetchStats();
      fetchSettings();
    } catch (err) {
      console.error("Chyba při mazání návyku:", err);
      throw err;
    }
  };

  // ==========================================
  // NASTAVENÍ A ČIŠTĚNÍ DAT
  // ==========================================

  const clearCompletedTasks = async () => {
    try {
      await api.clearCompletedTasks();
      await refreshAll();
    } catch (err) {
      console.error("Chyba při čištění hotových úkolů:", err);
      throw err;
    }
  };

  const resetAllData = async () => {
    try {
      await api.resetData();
      await refreshAll();
    } catch (err) {
      console.error("Chyba při resetu dat:", err);
      throw err;
    }
  };

  // Počty pro notifikační odznaky v navigaci
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
        error,
        pendingTasksCount,
        todayPendingCount,
        fetchTasks,
        fetchTodayTasks,
        fetchHabits,
        fetchStats,
        fetchSettings,
        refreshAll,
        toggleTask,
        createTask,
        updateTask,
        deleteTask,
        toggleHabit,
        createHabit,
        updateHabit,
        deleteHabit,
        clearCompletedTasks,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp musí být použit uvnitř AppProvider");
  }
  return context;
}
