import React, { useState } from "react";
import { useApp } from "../context/AppContext.js";
import { CheckIcon, PlusIcon, FlameIcon, CalendarIcon, AlertCircleIcon, ClockIcon } from "../components/common/Icons.js";

export function TodayView() {
  const {
    todayTasks,
    habits,
    toggleTask,
    toggleHabit,
    setActiveTab,
    createTask,
    isLoading
  } = useApp();

  const [newTitle, setNewTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completedHabitsCount = habits.filter(h => h.completed_today).length;
  const totalHabitsCount = habits.length;
  const pendingTasks = todayTasks.filter(t => !t.completed);
  const completedTasks = todayTasks.filter(t => t.completed);

  const handleQuickAddTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      await createTask({
        title: newTitle.trim(),
        description: "",
        priority: "Střední",
        due_date: todayStr,
        recurrence: "Žádné"
      });
      setNewTitle("");
    } catch (err) {
      alert("Chyba při ukládání úkolu: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "Vysoká":
        return "bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20";
      case "Střední":
        return "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Uvítací banner s dnešním shrnutím */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/15">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md mb-3">
            ☀️ Dnešní přehled
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Vítejte zpět v DailyTrack
          </h2>
          <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
            Dnes máte ke splnění <strong className="text-white underline">{pendingTasks.length} úkolů</strong> a{" "}
            <strong className="text-white underline">{completedHabitsCount} z {totalHabitsCount}</strong> splněných návyků.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 pt-2">
          <div className="bg-white/15 backdrop-blur-md rounded-xl px-4 py-2.5 flex items-center space-x-3 border border-white/20">
            <FlameIcon className="w-6 h-6 text-amber-300" />
            <div>
              <div className="text-xs text-indigo-100">Splněné návyky</div>
              <div className="text-lg font-bold">{completedHabitsCount} / {totalHabitsCount}</div>
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
        {/* Levý sloupec: Dnešní návyky */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FlameIcon className="w-5 h-5 text-amber-500" />
              Dnešní návyky
            </h3>
            <button
              onClick={() => setActiveTab("habits")}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Všechny návyky →
            </button>
          </div>

          <div className="space-y-3">
            {habits.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                Zatím žádné návyky. Vytvořte si první v záložce Návyky!
              </div>
            ) : (
              habits.map((habit) => (
                <div
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`
                    cursor-pointer p-4 rounded-2xl border transition-all duration-200
                    flex items-center justify-between
                    ${
                      habit.completed_today
                        ? "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60"
                        : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 hover:border-indigo-400 dark:hover:border-indigo-500"
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`
                        w-6 h-6 rounded-lg flex items-center justify-center transition-colors border
                        ${
                          habit.completed_today
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                        }
                      `}
                    >
                      {habit.completed_today && <CheckIcon className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {habit.name}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: habit.color || "#6366F1" }}
                        />
                        Série: <strong className="text-slate-600 dark:text-slate-300">{habit.current_streak} dní</strong>
                      </div>
                    </div>
                  </div>

                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    habit.completed_today
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  }`}>
                    {habit.completed_today ? "Splněno" : "Odbavit"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pravý sloupec: Dnešní úkoly */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-500" />
              Úkoly na dnešek & po termínu
            </h3>
            <button
              onClick={() => setActiveTab("tasks")}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Všechny úkoly →
            </button>
          </div>

          {/* Rychlé přidání úkolu na dnešek */}
          <form onSubmit={handleQuickAddTask} className="flex gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Rychle přidat úkol na dnešek..."
              className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newTitle.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Přidat</span>
            </button>
          </form>

          {/* Seznam dnešních úkolů */}
          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                Pro dnešek nemáte žádné čekající úkoly. Skvělá práce! 🎉
              </div>
            ) : (
              todayTasks.map((task) => (
                <div
                  key={task.id}
                  className={`
                    p-4 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-3
                    ${
                      task.completed
                        ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-75"
                        : task.is_overdue
                        ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                        : "bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/60 hover:shadow-sm"
                    }
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`
                        mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors
                        ${
                          task.completed
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-indigo-500"
                        }
                      `}
                    >
                      {task.completed && <CheckIcon className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className={`text-sm font-semibold ${
                        task.completed
                          ? "line-through text-slate-400 dark:text-slate-500"
                          : "text-slate-900 dark:text-white"
                      }`}>
                        {task.title}
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>

                        {task.due_date && (
                          <span className={`text-[11px] flex items-center gap-1 font-medium ${
                            task.is_overdue
                              ? "text-rose-500 font-bold"
                              : "text-slate-500 dark:text-slate-400"
                          }`}>
                            <ClockIcon className="w-3.5 h-3.5" />
                            {task.is_overdue ? "Zpožděno: " : "Termín: "} {task.due_date}
                          </span>
                        )}

                        {task.recurrence && task.recurrence !== "Žádné" && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            🔄 {task.recurrence}
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
