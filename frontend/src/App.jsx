import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext.js";
import { ThemeProvider } from "./context/ThemeContext.js";
import { Sidebar } from "./components/layout/Sidebar.js";
import { Header } from "./components/layout/Header.js";
import { TodayView } from "./views/TodayView.js";
import { TasksView } from "./views/TasksView.js";
import { HabitsView } from "./views/HabitsView.js";
import { StatsView } from "./views/StatsView.js";
import { SettingsView } from "./views/SettingsView.js";

function MainContent() {
  const { activeTab } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case "today":
        return <TodayView />;
      case "tasks":
        return <TasksView />;
      case "habits":
        return <HabitsView />;
      case "stats":
        return <StatsView />;
      case "settings":
        return <SettingsView />;
      default:
        return <TodayView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Responzivní Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Hlavní obsahová oblast */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
          <div className="animate-fade-in transition-opacity">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ThemeProvider>
  );
}
