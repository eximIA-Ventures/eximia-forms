"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [mode, setMode] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("eximia-theme");
    if (stored === "light") setMode("light");
  }, []);

  function toggle() {
    const next = mode === "dark" ? "light" : "dark";
    setMode(next);
    localStorage.setItem("eximia-theme", next);
    document.documentElement.classList.toggle("light", next === "light");
  }

  return (
    <button
      onClick={toggle}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted hover:bg-elevated hover:text-primary transition-colors"
      title={mode === "dark" ? "Modo claro" : "Modo escuro"}
    >
      {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      {mode === "dark" ? "Modo claro" : "Modo escuro"}
    </button>
  );
}
