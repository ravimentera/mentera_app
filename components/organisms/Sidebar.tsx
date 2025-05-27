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
import {
  CalendarDays,
  CheckSquare,
  ChevronRight,
  Home,
  LogOut,
  MessageSquare,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  getFirstProvider,
  getProviderFullName,
  getProviderInitials,
} from "../../utils/provider.utils";
import { UserAvatar } from "../molecules";

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
          ? "bg-brand-purple-background text-brand-purple-dark font-medium"
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
  const [showDropdown, setShowDropdown] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  // Get first provider's details
  const firstProvider = getFirstProvider();
  const providerName = firstProvider ? getProviderFullName(firstProvider) : "Sarah Doe";
  const providerInitials = firstProvider ? getProviderInitials(firstProvider) : "SD";

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
              <div className="flex-1 overflow-y-auto p-2 hide-scrollbar">
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
              <div className="p-2 flex items-center gap-4 relative" ref={dropdownRef}>
                <div
                  className={cn(
                    "flex items-center gap-2",
                    isCollapsed ? "justify-center w-full" : "flex-1",
                  )}
                >
                  {firstProvider?.avatar && (
                    <UserAvatar avatar={firstProvider.avatar} name={providerName} size="small" />
                  )}
                  {!isCollapsed && (
                    <span className="text-sm font-medium text-text">{providerName}</span>
                  )}
                </div>
                {!isCollapsed && (
                  <button
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded-md"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <ChevronRight
                      size={16}
                      className={cn(
                        "text-ui-icon-muted transition-transform",
                        showDropdown && "rotate-90",
                      )}
                    />
                  </button>
                )}

                {/* Dropdown menu */}
                {showDropdown && !isCollapsed && (
                  <div className="absolute bottom-full mb-1 right-2 w-36 bg-white border rounded-md shadow-md z-50 overflow-hidden">
                    <button
                      type="button"
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-100"
                      onClick={() => {
                        router.push(AUTH_ROUTES.LOGIN);
                      }}
                    >
                      <LogOut size={16} className="text-gray-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}

                {/* Avatar-only dropdown trigger for collapsed state */}
                {isCollapsed && (
                  <button
                    type="button"
                    className="absolute inset-0 w-full h-full cursor-pointer"
                    onClick={() => {
                      if (isMobile) {
                        router.push(AUTH_ROUTES.LOGIN);
                      } else {
                        setShowDropdown(!showDropdown);
                      }
                    }}
                    aria-label="User menu"
                  />
                )}

                {/* Dropdown for collapsed state */}
                {showDropdown && isCollapsed && (
                  <div className="absolute left-full ml-2 bottom-0 w-36 bg-white border rounded-md shadow-md z-50 overflow-hidden">
                    <button
                      type="button"
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-100"
                      onClick={() => {
                        router.push(AUTH_ROUTES.LOGIN);
                      }}
                    >
                      <LogOut size={16} className="text-gray-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
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
