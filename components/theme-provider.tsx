"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";
import { useEffect, useState } from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark");
    root.classList.add("light");
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <NextThemeProvider {...props}>{children}</NextThemeProvider>;
}
