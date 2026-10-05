import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext.js";
import { useApp } from "../context/AppContext.js";
import {
  SunIcon,
  MoonIcon,
  TrashIcon,
  RepeatIcon,
  CheckIcon
} from "../components/common/Icons.js";

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const { settings, clearCompletedTasks, resetAllData } = useApp();

  const [notification, setNotification] = useState("");

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  };

  const handleClearCompleted = async () => {
    if (confirm("Opravdu chcete trvale smazat všechny dokončené úkoly?")) {
      try {
        await clearCompletedTasks();
        showNotification("Dokončené úkoly byly úspěšně vyčištěny.");
      } catch (err) {
        alert("Chyba: " + err.message);
      }
    }
  };

  const handleResetData = async () => {
    if (confirm("POZOR: Tato akce smaže veškeré úkoly a historii návyků a obnoví výchozí ukázková data. Pokračovat?")) {
      try {
        await resetAllData();
        showNotification("Data byla úspěšně resetována na výchozí ukázkový stav.");
      } catch (err) {
        alert("Chyba: " + err.message);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Hlavička */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Nastavení aplikace a data
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Přizpůsobení vzhledu rozhraní a správa lokální SQLite databáze.
        </p>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-2 animate-fade-in">
          <CheckIcon className="w-5 h-5" />
          <span>{notification}</span>
        </div>
      )}

      {/* Sekce 1: Grafický motiv */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Vzhled rozhraní (Theme)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tmavý motiv */}
          <button
            onClick={() => setTheme("dark")}
            className={`
              p-4 rounded-xl border text-left flex items-start space-x-3 transition-all
              ${
                theme === "dark"
                  ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300"
              }
            `}
          >
            <div className="p-2.5 rounded-lg bg-slate-900 text-indigo-400 flex-shrink-0">
              <MoonIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Tmavý režim (Dark)
                {theme === "dark" && <span className="text-xs text-indigo-500 font-semibold">✓ Aktivní</span>}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tmavé břidlicové pozadí příjemné pro oči při večerní práci.
              </p>
            </div>
          </button>

          {/* Světlý motiv */}
          <button
            onClick={() => setTheme("light")}
            className={`
              p-4 rounded-xl border text-left flex items-start space-x-3 transition-all
              ${
                theme === "light"
                  ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300"
              }
            `}
          >
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-600 flex-shrink-0">
              <SunIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Světlý režim (Light)
                {theme === "light" && <span className="text-xs text-indigo-500 font-semibold">✓ Aktivní</span>}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Čisté bílé a šedé tóny s vysokým kontrastem pro denní světlo.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Sekce 2: Informace o databázi */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Informace o databázi SQLite
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-400">Velikost souboru</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {settings?.db_size_kb || 0} KB
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-400">Celkem evidovaných úkolů</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {settings?.tasks_count || 0}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-400">Aktivní návyky</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {settings?.habits_count || 0}
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
          <span>Soubor:</span>
          <code className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-slate-600 dark:text-slate-300">
            dailytrack.db
          </code>
        </div>
      </div>

      {/* Sekce 3: Správa dat a údržba */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Správa dat a údržba
        </h3>

        <div className="flex flex-col sm:flex-row gap-4 items-stretch">
          <button
            onClick={handleClearCompleted}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <TrashIcon className="w-4 h-4 text-amber-500" />
            <span>Vyčistit dokončené úkoly</span>
          </button>

          <button
            onClick={handleResetData}
            className="flex-1 px-4 py-3 rounded-xl border border-rose-300 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <RepeatIcon className="w-4 h-4" />
            <span>Obnovit ukázková data (Reset)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
