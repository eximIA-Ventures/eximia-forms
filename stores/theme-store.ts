"use client";

import { create } from "zustand";

type ThemeMode = "dark" | "light";

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

function getInitialMode(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("eximia-theme");
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: typeof window !== "undefined" ? getInitialMode() : "dark",
  setMode: (mode) => {
    localStorage.setItem("eximia-theme", mode);
    set({ mode });
  },
  toggle: () =>
    set((state) => {
      const next = state.mode === "dark" ? "light" : "dark";
      localStorage.setItem("eximia-theme", next);
      return { mode: next };
    }),
}));
