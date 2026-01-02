"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type ThemeContextType = {
  primary: string;
  secondary: string;
  setTheme: (p: string, s: string) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  primary: "#0f766e",
  secondary: "#e0f2f1",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [primary, setPrimary] = useState("#0f766e");
  const [secondary, setSecondary] = useState("#e0f2f1");

  // Load stored colors from localStorage
  useEffect(() => {
    const p = localStorage.getItem("primaryColor");
    const s = localStorage.getItem("secondaryColor");
    if (p && s) {
      setPrimary(p);
      setSecondary(s);
      document.documentElement.style.setProperty("--primary-color", p);
      document.documentElement.style.setProperty("--secondary-color", s);
    }
  }, []);

  const setTheme = (p: string, s: string) => {
    setPrimary(p);
    setSecondary(s);
    document.documentElement.style.setProperty("--primary-color", p);
    document.documentElement.style.setProperty("--secondary-color", s);
    localStorage.setItem("primaryColor", p);
    localStorage.setItem("secondaryColor", s);
  };

  return (
    <ThemeContext.Provider value={{ primary, secondary, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
