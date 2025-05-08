"use client";

import { AUTH_ROUTES, DASHBOARD_PATHS } from "@/app/constants/route-constants";
import { Tooltip, TooltipProvider } from "@/components/atoms";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MenteraLogoFull,
  MenteraLogoIcon,
} from "@/components/atoms/icons";
import { cn } from "@/lib/utils";
import { CalendarDays, CheckSquare, ChevronRight, Home, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isCollapsed: boolean;
  isActive: boolean;
}

function SidebarItem({ href, icon, title, isCollapsed, isActive, ...props }: SidebarItemProps) {
  const linkContent = (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-300 ease-in-out relative group whitespace-nowrap",
        isActive
          ? "bg-[#8A03D31A] text-[#8A03D3] font-medium"
          : "text-gray-500 hover:bg-muted hover:text-foreground",
      )}
    >
      <span className="h-5 w-5 shrink-0 transition-transform duration-300 ease-in-out">{icon}</span>
      <span
        className={cn(
          "transition-all duration-300 ease-in-out",
          isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto",
        )}
      >
        {title}
      </span>
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
  const pathname = usePathname();
  const router = useRouter();

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

  const sidebarItems = [
    {
      name: "Dashboard",
      href: DASHBOARD_PATHS.HOME,
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Appointments",
      href: DASHBOARD_PATHS.APPOINTMENTS,
      icon: <CalendarDays className="h-5 w-5" />,
    },
    {
      name: "Approvals",
      href: DASHBOARD_PATHS.APPROVALS,
      icon: <CheckSquare className="h-5 w-5" />,
    },
    {
      name: "Inbox",
      href: DASHBOARD_PATHS.INBOX,
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      name: "Patients",
      href: DASHBOARD_PATHS.PATIENTS,
      icon: <Users className="h-5 w-5" />,
    },
  ];

  return (
    <TooltipProvider>
      <div className="relative">
        <div
          className={cn(
            "border-r bg-background h-full transition-all duration-300 ease-in-out fixed lg:relative",
            isCollapsed ? "w-[60px]" : "w-[240px]",
            isMobile && isCollapsed ? "w-[60px]" : "",
            isMobile && !isCollapsed ? "shadow-xl z-30" : "",
          )}
        >
          <div className="flex h-full flex-col">
            {/* Sidebar header for desktop */}
            {!isMobile && (
              <div
                className={cn(
                  "h-16 flex items-center overflow-hidden bg-slate-50",
                  isCollapsed ? "justify-center p-2" : "justify-start px-4",
                )}
              >
                <Link
                  href={DASHBOARD_PATHS.HOME}
                  className={cn(
                    "flex items-center transition-all duration-300 ease-in-out",
                    isCollapsed ? "justify-center" : "justify-start",
                  )}
                >
                  {isCollapsed ? (
                    <MenteraLogoIcon className="h-8 w-8 transition-all duration-300 ease-in-out" />
                  ) : (
                    <MenteraLogoFull className="h-10 transition-all duration-300 ease-in-out" />
                  )}
                </Link>
              </div>
            )}
            {/* Sidebar header for mobile */}
            {isMobile && (
              <div
                className={cn(
                  "border-b h-16 relative z-50 flex items-center",
                  isCollapsed ? "justify-center p-2" : "justify-between p-3",
                )}
              >
                <Link href={DASHBOARD_PATHS.HOME} className="flex items-center gap-2">
                  {isCollapsed ? (
                    <MenteraLogoIcon className="h-8 w-8" />
                  ) : (
                    <MenteraLogoFull className="h-10" />
                  )}
                </Link>
              </div>
            )}
            <div
              className="flex flex-col h-full overflow-hidden bg-slate-50"
              style={{ height: !isMobile ? "calc(100vh - 4rem)" : "100%" }}
            >
              <div className="flex-1 overflow-y-auto px-2 py-2 hide-scrollbar">
                <nav className="grid gap-1">
                  {sidebarItems.map((item) => (
                    <SidebarItem
                      title={item.name}
                      isCollapsed={isCollapsed}
                      key={item.name}
                      {...item}
                      isActive={pathname?.includes(item.href) ?? false}
                    />
                  ))}
                </nav>
              </div>
              <div className="p-4 flex items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-10 h-10 rounded-full bg-[#F4F1FE] flex items-center justify-center">
                    <span className="text-[#6941C6] font-medium">SD</span>
                  </div>
                  <span className="text-sm font-medium text-[#09090B]">Sarah Doe</span>
                </div>
                <button
                  type="button"
                  className="p-1 hover:bg-gray-100 rounded-md"
                  onClick={() => {
                    router.push(AUTH_ROUTES.LOGIN);
                  }}
                >
                  <ChevronRight size={16} className="text-[#A1A1AA]" />
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Toggle button positioned to overlap sidebar and content */}
        <div
          className="absolute z-10"
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
                "flex h-6 w-6 items-center justify-center rounded-full border-2 border-border bg-card",
                "hover:bg-muted hover:text-primary transition-colors",
                "shadow-[0_2px_10px_rgba(0,0,0,0.1)]",
              )}
              style={{
                boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
              }}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRightIcon className="h-3 w-3" />
              ) : (
                <ChevronLeftIcon className="h-3 w-3" />
              )}
            </button>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
