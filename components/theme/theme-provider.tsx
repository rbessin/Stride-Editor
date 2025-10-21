"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Define theme color type
type Theme = "light" | "dark";
// Define theme context
const ThemeContext = createContext<{
  theme: Theme; setTheme: (theme: Theme) => void;
}>({
  theme: "light",setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Check localStorage for saved theme, default to light
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(stored);
    } else {
      // Set initial light mode
      document.documentElement.classList.add("light");
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);