"use client";

import { Sidebar } from "@/components/organisms";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface SidebarToggleEvent extends Event {
  detail: { collapsed: boolean };
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define sidebar widths as constants
  const SIDEBAR_EXPANDED_WIDTH = 240;
  const SIDEBAR_COLLAPSED_WIDTH = 60;

  useEffect(() => {
    setIsMounted(true);

    // Check for sidebar collapsed state in localStorage
    const storedState = localStorage.getItem("sidebarCollapsed");
    if (storedState) {
      setIsSidebarCollapsed(storedState === "true");
    }

    // Listen for custom event from Sidebar component
    const handleSidebarToggle = (e: SidebarToggleEvent) => {
      setIsSidebarCollapsed(e.detail.collapsed);
    };

    window.addEventListener("sidebarToggle", handleSidebarToggle as EventListener);

    return () => {
      window.removeEventListener("sidebarToggle", handleSidebarToggle as EventListener);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      {isMounted && (
        <div
          className={cn(
            "h-screen transition-[width] duration-300 ease-in-out",
            isSidebarCollapsed ? "w-15" : "w-60",
          )}
        >
          <Sidebar open={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <main className={"flex-1 transition-all duration-300 ease-in-out h-screen overflow-auto"}>
        {children}
      </main>
    </div>
  );
}
