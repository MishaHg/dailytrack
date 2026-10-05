import React from "react";
import { useTheme } from "../../context/ThemeContext.js";
import { useApp } from "../../context/AppContext.js";
import { MenuIcon, SunIcon, MoonIcon } from "../common/Icons.js";

export function Header({ onOpenSidebar }) {
  const { isDark, toggleTheme } = useTheme();
  const { activeTab } = useApp();

  const getTabTitle = () => {
    switch (activeTab) {
      case "today": return "Dnes";
      case "tasks": return "Správa úkolů";
      case "habits": return "Sledování návyků";
      case "stats": return "Statistiky a přehled";
      case "settings": return "Nastavení aplikace";
      default: return "DailyTrack";
    }
  };

  const todayDateFormatted = new Intl.DateTimeFormat("cs-CZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3.5 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center space-x-3">
        {/* Mobilní hamburger menu */}
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Otevřít menu"
        >
          <MenuIcon className="w-6 h-6" />
        </button>

        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white capitalize">
            {getTabTitle()}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize hidden sm:block">
            {todayDateFormatted}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Rychlý přepínač motivu v hlavičce */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 transition-colors"
          title={isDark ? "Přepnout na světlý režim" : "Přepnout na tmavý režim"}
        >
          {isDark ? (
            <SunIcon className="w-5 h-5 text-amber-400" />
          ) : (
            <MoonIcon className="w-5 h-5 text-indigo-600" />
          )}
        </button>
      </div>
    </header>
  );
}
