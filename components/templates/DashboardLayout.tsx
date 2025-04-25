"use client";

import { Header, Sidebar } from "@/components/organisms";
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

  // Handle mobile menu toggle
  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <Header onMenuClick={handleMenuToggle} />

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        {isMounted && (
          <div
            className={cn(
              "fixed top-16 bottom-0 left-0 h-[calc(100vh-4rem)] hidden lg:block z-30 overflow-visible",
              isSidebarCollapsed
                ? `w-[${SIDEBAR_COLLAPSED_WIDTH}px]`
                : `w-[${SIDEBAR_EXPANDED_WIDTH}px]`,
            )}
          >
            <Sidebar open={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* Mobile sidebar overlay - shown only on mobile when menu is open */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-background/80 z-20"
            onClick={() => setIsMobileMenuOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsMobileMenuOpen(false);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Close mobile menu"
          />
        )}

        {/* Main content */}
        <main
          className={cn(
            "flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300 h-[calc(100vh-4rem)]",
            isSidebarCollapsed
              ? `lg:ml-[${SIDEBAR_COLLAPSED_WIDTH}px]`
              : `lg:ml-[${SIDEBAR_EXPANDED_WIDTH}px]`,
          )}
        >
          <div className="flex flex-col h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
