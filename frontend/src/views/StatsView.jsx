import React from "react";
import { useApp } from "../context/AppContext.js";
import {
  BarChartIcon,
  TrendingUpIcon,
  AwardIcon,
  CheckSquareIcon,
  FlameIcon,
  ClockIcon
} from "../components/common/Icons.js";

export function StatsView() {
  const { stats, isLoading } = useApp();

  if (isLoading && !stats) {
    return (
      <div className="p-12 text-center text-slate-500">
        Načítání statistik a vizualizací...
      </div>
    );
  }

  const tasks = stats?.tasks || {
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    completion_rate: 0.0,
    priority_counts: {}
  };

  const habits = stats?.habits || {
    total_habits: 0,
    completed_today: 0,
    best_overall_streak: 0,
    current_max_streak: 0,
    total_checkins: 0
  };

  const activity = stats?.activity_14_days || [];
  const maxActivityCount = Math.max(...activity.map(a => a.count), 1);

  // Výpočet SVG prstence pro úspěšnost úkolů
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (tasks.completion_rate / 100) * circumference;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Hlavička */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Přehled produktivity a statistiky
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Komplexní data a vizualizace vašeho pokroku v plnění úkolů a návyků.
        </p>
      </div>

      {/* KPI karty */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Karta 1: Dokončené úkoly */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Splněné úkoly</span>
            <CheckSquareIcon className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {tasks.completed}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ {tasks.total} celkem</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            {tasks.completion_rate}% úspěšnost
          </div>
        </div>

        {/* Karta 2: Čekající & Zpožděné */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">K vyřízení</span>
            <ClockIcon className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {tasks.pending}
            </span>
            {tasks.overdue > 0 && (
              <span className="text-xs text-rose-500 font-bold">({tasks.overdue} po termínu)</span>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-400 font-medium">
            Aktivní úkoly
          </div>
        </div>

        {/* Karta 3: Nejdelší série (Streak) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Rekordní série</span>
            <AwardIcon className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {habits.best_overall_streak}
            </span>
            <span className="text-xs text-slate-400 font-medium">dní</span>
          </div>
          <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
            Aktuální max: {habits.current_max_streak} dní
          </div>
        </div>

        {/* Karta 4: Celkem odbavení návyků */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Celkem check-inů</span>
            <FlameIcon className="w-5 h-5 text-rose-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {habits.total_checkins}
            </span>
            <span className="text-xs text-slate-400 font-medium">splnění</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 font-medium">
            Dnes splněno: {habits.completed_today} / {habits.total_habits}
          </div>
        </div>
      </div>

      {/* Grafy: Poměr úkolů a 14denní aktivita */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prstencový graf dokončených úkolů */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 self-start">
            Poměr splnění úkolů
          </h3>

          <div className="relative w-40 h-40 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="text-slate-100 dark:text-slate-700 stroke-current"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="text-indigo-600 stroke-current transition-all duration-1000 ease-out"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {tasks.completion_rate}%
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Hotovo
              </span>
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

        {/* Sloupcový graf aktivity návyků za 14 dní */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Denní aktivita návyků (posledních 14 dní)
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Počet úspěšně splněných a zaznamenaných návyků v jednotlivých dnech.
            </p>
          </div>

          {/* Sloupce */}
          <div className="h-44 flex items-end justify-between gap-1 sm:gap-2 pt-6 pb-2 border-b border-slate-200 dark:border-slate-700">
            {activity.map((item, index) => {
              const heightPercent = Math.round((item.count / maxActivityCount) * 100);

              return (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-8 hidden group-hover:flex bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                    {item.label}: {item.count} splněno
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-700/40 rounded-t-lg h-32 flex items-end justify-center p-1">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        item.count > 0 ? "bg-indigo-600 dark:bg-indigo-500 group-hover:bg-indigo-500" : "bg-transparent"
                      }`}
                      style={{ height: `${Math.max(heightPercent, item.count > 0 ? 12 : 0)}%` }}
                    />
                  </div>

                  <span className="text-[10px] text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 pt-3">
            <span>Před 14 dny</span>
            <span className="font-semibold text-indigo-500">Dnes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
