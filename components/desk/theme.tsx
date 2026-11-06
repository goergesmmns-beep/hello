"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";
const Ctx = createContext<{ theme: Theme; toggle: () => void }>({ theme: "dark", toggle: () => {} });
/** The desk theme lives in a cookie so the server renders the right one. Menus render outside this box, so <html> gets the class too. */
export function DeskTheme({ initial, children }: { initial: Theme; children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initial);
  useEffect(() => { const h = document.documentElement; h.classList.toggle("dark", theme === "dark"); h.style.colorScheme = theme; return () => { h.classList.remove("dark"); h.style.colorScheme = ""; }; }, [theme]);
  const toggle = () => { const t = theme === "dark" ? "light" : "dark"; setTheme(t); document.cookie = `desk_theme=${t}; path=/; max-age=31536000; samesite=lax`; };
  return <Ctx.Provider value={{ theme, toggle }}><div className={`${theme === "dark" ? "dark" : ""} min-h-dvh bg-background text-foreground`}>{children}</div></Ctx.Provider>;
}
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useContext(Ctx);
  return <button id="theme-toggle" type="button" onClick={toggle} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} title={theme === "dark" ? "Light theme" : "Dark theme"} className={`grid size-9 cursor-pointer place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground ${className}`}>{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>;
}
