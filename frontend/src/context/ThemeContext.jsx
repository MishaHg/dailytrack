import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api.js";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    // 1. Zkusíme localStorage
    const saved = localStorage.getItem("dailytrack_theme");
    if (saved) return saved;
    // 2. Jinak výchozí dark (jak bylo v desktop verzi)
    return "dark";
  });

  // Aplikace třídy na <html> při změně tématu
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("dailytrack_theme", theme);
  }, [theme]);

  // Načtení preferovaného tématu z backendové SQLite databáze
  useEffect(() => {
    api.getSettings()
      .then((settings) => {
        if (settings && settings.theme && settings.theme !== theme) {
          setThemeState(settings.theme);
        }
      })
      .catch((err) => {
        console.warn("Nelze načíst téma ze serveru, použito lokální nastavení:", err);
      });
  }, []);

  const setTheme = async (newTheme) => {
    setThemeState(newTheme);
    try {
      await api.updateSetting("theme", newTheme);
    } catch (err) {
      console.warn("Nelze uložit téma na server:", err);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === "dark", toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme musí být použit uvnitř ThemeProvider");
  }
  return context;
}
