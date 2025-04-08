"use client";

import { Switch } from "@/components/atoms";
import { cn } from "@/lib/utils";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    // Prefetch both themes to prevent FOUC
    const style = document.createElement("style");
    style.innerText = `
      .light-theme, .dark-theme {
        display: none;
      }
    `;
    document.head.appendChild(style);

    // Preload both theme styles
    const linkLight = document.createElement("link");
    linkLight.rel = "stylesheet";
    linkLight.href = "data:text/css;charset=UTF-8,";
    linkLight.id = "light-theme-preload";
    document.head.appendChild(linkLight);

    const linkDark = document.createElement("link");
    linkDark.rel = "stylesheet";
    linkDark.href = "data:text/css;charset=UTF-8,";
    linkDark.id = "dark-theme-preload";
    document.head.appendChild(linkDark);

    setMounted(true);

    return () => {
      document.head.removeChild(style);
      if (document.head.contains(linkLight)) document.head.removeChild(linkLight);
      if (document.head.contains(linkDark)) document.head.removeChild(linkDark);
    };
  }, []);

  // Prevent multiple rapid clicks during transition
  useEffect(() => {
    if (isChanging) {
      const timer = setTimeout(() => {
        setIsChanging(false);
      }, 600); // Safety timeout to ensure isChanging gets reset
      return () => clearTimeout(timer);
    }
  }, [isChanging]);

  if (!mounted) return <div className="h-6 w-12 rounded-full bg-muted" />; // Skeleton loader

  const isDark = resolvedTheme === "dark";

  const handleThemeChange = (checked: boolean) => {
    if (isChanging) return; // Prevent multiple transitions

    setIsChanging(true);
    // Apply CSS class to body during transition
    document.body.classList.add("theme-transitioning");

    // Small delay to allow the animation to complete
    setTimeout(() => {
      setTheme(checked ? "dark" : "light");

      // Remove transition class after theme has changed
      setTimeout(() => {
        document.body.classList.remove("theme-transitioning");
        setIsChanging(false);
      }, 500);
    }, 200);
  };

  return (
    <div className="relative inline-flex items-center">
      <Switch
        checked={isDark}
        onCheckedChange={handleThemeChange}
        className={cn(
          "h-7 w-12 rounded-full border flex items-center justify-between px-0.5",
          isDark ? "bg-gray-900 border-gray-800" : "bg-sky-100 border-sky-200",
          isChanging && "pointer-events-none",
        )}
      >
        {/* Track icons for better context */}
        <SunIcon
          className={cn(
            "h-4 w-4 text-amber-400 transition-opacity duration-300 z-0",
            isDark ? "opacity-30" : "opacity-100",
          )}
        />
        <MoonIcon
          className={cn(
            "h-4 w-4 text-indigo-300 transition-opacity duration-300 z-0",
            isDark ? "opacity-100" : "opacity-30",
          )}
        />

        {/* Thumb with icon */}
        <span
          className={cn(
            "pointer-events-none absolute flex h-5 w-5 items-center justify-center rounded-full shadow-md ring-0 z-10",
            "transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]", // Bouncy effect
            isDark
              ? "translate-x-[22px] bg-purple-500 border border-purple-600"
              : "translate-x-[1px] bg-amber-400 border border-amber-500",
          )}
        >
          {isDark ? (
            <MoonIcon className="h-3 w-3 text-white transition-opacity duration-300" />
          ) : (
            <SunIcon className="h-3 w-3 text-white transition-opacity duration-300" />
          )}
        </span>
      </Switch>
    </div>
  );
}
