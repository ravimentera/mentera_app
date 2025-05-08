"use client";

import { DASHBOARD_PATHS } from "@/app/constants/route-constants";
import { Tooltip, TooltipProvider } from "@/components/atoms";
import {
  CalendarIcon,
  ChatBubbleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon as CrumpledPaperIcon,
  GearIcon,
  MenteraIcon,
  PersonIcon,
} from "@/components/atoms/icons";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Define sidebar widths as constants
const SIDEBAR_EXPANDED_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 60;

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isCollapsed: boolean;
}

function SidebarItem({ href, icon, title, isCollapsed }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const linkContent = (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200 relative group",
        isActive
          ? "bg-primary text-primary-foreground font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <span className="h-5 w-5 shrink-0">{icon}</span>
      {!isCollapsed && <span className="transition-opacity duration-200">{title}</span>}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip content={title} side="right">
        {linkContent}
      </Tooltip>
    );
  }

  return linkContent;
}

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile device and load stored state
  useEffect(() => {
    // Get stored state from localStorage
    const storedState = localStorage.getItem("sidebarCollapsed");
    if (storedState) {
      setIsCollapsed(storedState === "true");
    }

    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Handle external open state (for mobile)
  useEffect(() => {
    if (open !== undefined && isMobile) {
      setIsCollapsed(!open);
    }
  }, [open, isMobile]);

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);

    // Store state in localStorage
    localStorage.setItem("sidebarCollapsed", String(newCollapsedState));

    // Call onClose if sidebar is being opened on mobile
    if (isMobile && !newCollapsedState && onClose) {
      onClose();
    }

    // Dispatch custom event for page layout
    const event = new CustomEvent("sidebarToggle", {
      detail: { collapsed: newCollapsedState },
    });
    window.dispatchEvent(event);
  };

  return (
    <TooltipProvider>
      <div className="relative">
        <div
          className={cn(
            "border-r bg-background h-full transition-all duration-300",
            isCollapsed ? `w-[${SIDEBAR_COLLAPSED_WIDTH}px]` : `w-[${SIDEBAR_EXPANDED_WIDTH}px]`,
            isMobile && isCollapsed ? `w-[${SIDEBAR_COLLAPSED_WIDTH}px]` : "",
            isMobile && !isCollapsed
              ? `fixed inset-y-0 left-0 w-[${SIDEBAR_EXPANDED_WIDTH}px] shadow-xl z-30`
              : "",
          )}
        >
          <div className="flex h-full flex-col">
            {/* Only show the header with logo on mobile */}
            {isMobile && (
              <div
                className={cn(
                  "border-b h-16 relative z-50 flex items-center",
                  isCollapsed ? "justify-center p-2" : "justify-between p-3",
                )}
              >
                {!isCollapsed && (
                  <Link href={DASHBOARD_PATHS.HOME} className="flex items-center gap-2">
                    <MenteraIcon className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold text-primary">Mentera-AI</span>
                  </Link>
                )}
                {isCollapsed && (
                  <Link href={DASHBOARD_PATHS.HOME} className="flex justify-center items-center">
                    <Tooltip content="Mentera-AI Dashboard" side="right">
                      <MenteraIcon className="h-6 w-6 text-primary" />
                    </Tooltip>
                  </Link>
                )}
              </div>
            )}
            <div
              className="flex flex-col h-full overflow-hidden"
              style={{ height: !isMobile ? "calc(100vh - 4rem)" : "100%" }}
            >
              <div className="flex-1 overflow-y-auto px-2 py-2 hide-scrollbar">
                <nav className="grid gap-1">
                  <SidebarItem
                    href={DASHBOARD_PATHS.HOME}
                    icon={<CrumpledPaperIcon className="h-5 w-5" />}
                    title="Dashboard"
                    isCollapsed={isCollapsed}
                  />
                  <SidebarItem
                    href={DASHBOARD_PATHS.APPOINTMENTS}
                    icon={<CalendarIcon className="h-5 w-5" />}
                    title="Appointments"
                    isCollapsed={isCollapsed}
                  />
                  <SidebarItem
                    href={DASHBOARD_PATHS.PROFILE}
                    icon={<PersonIcon className="h-5 w-5" />}
                    title="Profile"
                    isCollapsed={isCollapsed}
                  />
                  <SidebarItem
                    href={DASHBOARD_PATHS.SETTINGS}
                    icon={<GearIcon className="h-5 w-5" />}
                    title="Settings"
                    isCollapsed={isCollapsed}
                  />
                </nav>
              </div>
            </div>
          </div>
        </div>
        {/* Toggle button positioned to overlap sidebar and content */}
        <div
          className="absolute z-[100]"
          style={{
            top: "80px",
            right: "0",
            transform: "translateX(50%)",
          }}
        >
          <Tooltip content={isCollapsed ? "Expand" : "Collapse"} side="right">
            <button
              type="button"
              onClick={toggleSidebar}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border-2 border-border bg-card",
                "hover:bg-muted hover:text-primary transition-colors",
                "shadow-[0_2px_10px_rgba(0,0,0,0.1)]",
              )}
              style={{
                boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
              }}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRightIcon className="h-5 w-5" />
              ) : (
                <ChevronLeftIcon className="h-5 w-5" />
              )}
            </button>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
