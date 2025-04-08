"use client";

import { Header, Sidebar } from "@/components/organisms";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface SidebarToggleEvent extends Event {
  detail: { collapsed: boolean };
}

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
    <div className="flex h-screen">
      {/* Sidebar - fixed position */}
      {isMounted && (
        <div
          className={cn(
            "fixed left-0 top-0 h-screen z-30",
            isSidebarCollapsed ? "w-[60px]" : "w-[240px]",
          )}
        >
          <Sidebar />
        </div>
      )}

      {/* Main content area */}
      <div
        className={cn(
          "flex flex-col w-full",
          isSidebarCollapsed ? "lg:ml-[60px]" : "lg:ml-[240px]",
        )}
      >
        {/* Header */}
        <Header />

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
