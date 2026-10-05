import React from "react";
import { useTheme } from "../../context/ThemeContext.js";
import { useApp } from "../../context/AppContext.js";
import {
  CalendarIcon,
  CheckSquareIcon,
  RepeatIcon,
  BarChartIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon
} from "../common/Icons.js";

const NAV_ITEMS = [
  { id: "today", label: "Dnes", icon: CalendarIcon, badgeKey: "todayPendingCount" },
  { id: "tasks", label: "Úkoly", icon: CheckSquareIcon, badgeKey: "pendingTasksCount" },
  { id: "habits", label: "Návyky", icon: RepeatIcon },
  { id: "stats", label: "Statistiky", icon: BarChartIcon },
  { id: "settings", label: "Nastavení", icon: SettingsIcon }
];

export function Sidebar({ isOpen, onClose }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { activeTab, setActiveTab, pendingTasksCount, todayPendingCount } = useApp();

  const handleSelect = (tabId) => {
    setActiveTab(tabId);
    if (onClose) onClose();
  };

  const getBadgeValue = (key) => {
    if (key === "todayPendingCount") return todayPendingCount;
    if (key === "pendingTasksCount") return pendingTasksCount;
    return 0;
  };

  return (
    <>
      {/* Mobilní backdrop při otevřeném sidebaru */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static top-0 left-0 z-50
          w-64 h-full min-h-screen flex flex-col justify-between
          bg-slate-950 dark:bg-[#090D16] text-slate-100
          border-r border-slate-800 dark:border-[#1E293B]
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Horní hlavička Sidebaru */}
        <div>
          <div className="px-6 pt-7 pb-5">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white font-bold text-lg">
                DT
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  DailyTrack
                </h1>
                <p className="text-xs text-slate-400 font-medium">Osobní organizér</p>
              </div>
            </div>
          </div>

          <div className="px-4 my-2">
            <div className="h-[1px] bg-slate-800/80" />
          </div>

          {/* Navigační položky */}
          <nav className="px-3 py-2 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const badge = item.badgeKey ? getBadgeValue(item.badgeKey) : 0;

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
                    <Icon
                      className={`w-5 h-5 transition-transform duration-150 ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {badge > 0 && (
                    <span
                      className={`
                        text-xs px-2 py-0.5 rounded-full font-bold
                        ${
                          isActive
                            ? "bg-indigo-700 text-white"
                            : "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
                        }
                      `}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Spodní akce a přepínač motivu */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-all duration-150 shadow-sm"
          >
            <div className="flex items-center space-x-3">
              {isDark ? (
                <MoonIcon className="w-5 h-5 text-indigo-400" />
              ) : (
                <SunIcon className="w-5 h-5 text-amber-400" />
              )}
              <span>{isDark ? "Tmavý režim" : "Světlý režim"}</span>
            </div>
            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center">
              <span className="text-[10px]">{isDark ? "🌙" : "☀️"}</span>
            </div>
          </button>

          <div className="text-[11px] text-center text-slate-500 pt-1">
            DailyTrack Web v1.0 • SQLite
          </div>
        </div>
      </aside>
    </>
  );
}
