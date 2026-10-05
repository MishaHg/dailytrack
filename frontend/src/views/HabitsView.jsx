import React, { useState } from "react";
import { useApp } from "../context/AppContext.js";
import {
  PlusIcon,
  FlameIcon,
  AwardIcon,
  CheckIcon,
  EditIcon,
  TrashIcon,
  XIcon
} from "../components/common/Icons.js";

const PRESET_COLORS = [
  "#6366F1", // Indigo
  "#10B981", // Emerald
  "#06B6D4", // Cyan
  "#F59E0B", // Amber
  "#EF4444", // Rose
  "#8B5CF6", // Purple
  "#EC4899"  // Pink
];

export function HabitsView() {
  const { habits, toggleHabit, createHabit, updateHabit, deleteHabit } = useApp();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#6366F1"
  });

  const openCreateDialog = () => {
    setEditingHabit(null);
    setFormData({
      name: "",
      description: "",
      color: "#6366F1"
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (habit) => {
    setEditingHabit(habit);
    setFormData({
      name: habit.name,
      description: habit.description || "",
      color: habit.color || "#6366F1"
    });
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
    if (confirm(`Opravdu chcete smazat návyk "${name}" včetně celé historie?`)) {
      await deleteHabit(id);
    }
  };

  // Získání popisků pro 7 dní (od 6 dní zpět až po dnešek)
  const getDaysHeader = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().split("T")[0];
      const dayName = new Intl.DateTimeFormat("cs-CZ", { weekday: "short" }).format(d);
      const dayNum = d.getDate();
      days.push({ iso, label: `${dayName} ${dayNum}`, isToday: i === 0 });
    }
    return days;
  };

  const daysHeader = getDaysHeader();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Horní hlavička s tlačítkem přidat */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Sledování denních návyků
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Udržujte si dlouhé série (streaky) a budujte pravidelnou rutinu.
          </p>
        </div>

        <button
          onClick={openCreateDialog}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 hover:scale-[1.01]"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Přidat návyk</span>
        </button>
      </div>

      {/* Karty návyků */}
      <div className="space-y-4">
        {habits.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
            Zatím nemáte žádné sledované návyky. Vytvořte si první kliknutím na tlačítko výše!
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
                  {/* Informace o návyku */}
                  <div className="flex items-start space-x-3.5 flex-1">
                    <div
                      className="w-4 h-12 rounded-full flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: habitColor }}
                    />

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {habit.name}
                      </h3>
                      {habit.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {habit.description}
                        </p>
                      )}

                      {/* Streaky */}
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

                  {/* Interaktivní 7denní mřížka */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                    {daysHeader.map((d) => {
                      const isDone = Boolean(habit.recent_history && habit.recent_history[d.iso]);

                      return (
                        <button
                          key={d.iso}
                          onClick={() => toggleHabit(habit.id, d.iso)}
                          title={`Kliknutím přepnete stav pro ${d.iso}`}
                          className={`
                            flex flex-col items-center justify-center w-11 h-13 py-1.5 rounded-xl border text-xs font-semibold
                            transition-all duration-150
                            ${
                              isDone
                                ? "text-white shadow-sm border-transparent"
                                : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-400"
                            }
                            ${d.isToday ? "ring-2 ring-indigo-500/50" : ""}
                          `}
                          style={isDone ? { backgroundColor: habitColor } : {}}
                        >
                          <span className="text-[10px] opacity-80 uppercase leading-none">
                            {d.label.split(" ")[0]}
                          </span>
                          <span className="text-xs font-bold mt-1 leading-none">
                            {d.label.split(" ")[1]}
                          </span>
                          <div className="mt-1">
                            {isDone ? (
                              <CheckIcon className="w-3.5 h-3.5 text-white" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Akce */}
                  <div className="flex md:flex-col items-center justify-end space-x-1 md:space-x-0 md:space-y-1">
                    <button
                      onClick={() => openEditDialog(habit)}
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Upravit návyk"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(habit.id, habit.name)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Smazat návyk"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dialog pro vytvoření / úpravu návyku */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingHabit ? "Upravit návyk" : "Nový návyk"}
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
                  Název návyku *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Např. Cvičení, Čtení knihy, Pitný režim"
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Popis nebo denní cíl
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Např. Alespoň 20 minut denně"
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Barva návyku
                </label>
                <div className="flex items-center gap-3">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        formData.color === c ? "scale-125 ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-900" : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
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
                  {editingHabit ? "Uložit změny" : "Vytvořit návyk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
