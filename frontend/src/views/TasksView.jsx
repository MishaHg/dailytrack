import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext.js";
import {
  PlusIcon,
  SearchIcon,
  TrashIcon,
  EditIcon,
  CheckIcon,
  ClockIcon,
  RepeatIcon,
  XIcon
} from "../components/common/Icons.js";

export function TasksView() {
  const { tasks, toggleTask, createTask, updateTask, deleteTask } = useApp();

  const [statusFilter, setStatusFilter] = useState("all"); // all, pending, completed
  const [priorityFilter, setPriorityFilter] = useState("all"); // all, Vysoká, Střední, Nízká
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog stav
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

  // Filtrování v paměti pro okamžitou reaktivitu
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter === "pending" && t.completed) return false;
      if (statusFilter === "completed" && !t.completed) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = (t.description || "").toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, searchQuery]);

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
      {/* Horní panel s vyhledáváním a akcemi */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <SearchIcon className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Hledat v úkolech a poznámkách..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
          />
        </div>

        <button
          onClick={openCreateDialog}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 hover:scale-[1.01]"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Přidat úkol</span>
        </button>
      </div>

      {/* Filtrační lišta */}
      <div className="flex flex-wrap gap-2 items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
        {/* Status filtry */}
        <div className="flex gap-1">
          {[
            { id: "all", label: "Všechny" },
            { id: "pending", label: "K vyřízení" },
            { id: "completed", label: "Dokončené" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Priority filtr */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Priorita:</span>
          {["all", "Vysoká", "Střední", "Nízká"].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                priorityFilter === p
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
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
            Nebyly nalezeny žádné úkoly odpovídající zadaným filtrům.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`
                p-4 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-4 group
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
                    ${
                      task.completed
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-indigo-500"
                    }
                  `}
                >
                  {task.completed && <CheckIcon className="w-4 h-4" />}
                </button>

                <div className="flex-1">
                  <h4 className={`text-base font-semibold ${
                    task.completed
                      ? "line-through text-slate-400 dark:text-slate-500"
                      : "text-slate-900 dark:text-white"
                  }`}>
                    {task.title}
                  </h4>

                  {task.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-2.5">
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
                      <span className="text-[11px] flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        <RepeatIcon className="w-3 h-3" />
                        {task.recurrence}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Akce: Úprava a Smazání */}
              <div className="flex items-center space-x-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditDialog(task)}
                  className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Upravit úkol"
                >
                  <EditIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(task.id, task.title)}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Smazat úkol"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dialog pro vytvoření / úpravu úkolu */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingTask ? "Upravit úkol" : "Nový úkol"}
              </h3>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Název úkolu *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Např. Připravit týdenní report"
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Popis
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Volitelné doplňující poznámky..."
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priorita
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Nízká">Nízká</option>
                    <option value="Střední">Střední</option>
                    <option value="Vysoká">Vysoká</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Opakování
                  </label>
                  <select
                    value={formData.recurrence}
                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Žádné">Žádné</option>
                    <option value="Denně">Denně</option>
                    <option value="Týdně">Týdně</option>
                    <option value="Měsíčně">Měsíčně</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Termín splnění
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25"
                >
                  {editingTask ? "Uložit změny" : "Vytvořit úkol"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
