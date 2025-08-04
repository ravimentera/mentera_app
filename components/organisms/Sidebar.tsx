"use client";

import { AUTH_ROUTES, DASHBOARD_PATHS } from "@/app/constants/route-constants";
import { Tooltip, TooltipProvider } from "@/components/atoms";
import { MenteraLogoFull, MenteraLogoIcon } from "@/components/atoms/icons";
import { useLogoutMutation } from "@/lib/store/api";
import { cn } from "@/lib/utils";
import {
  CheckSquare,
  ChevronRight,
  FileText,
  Home,
  LogOut,
  MessageSquare,
  PanelLeft,
  PanelRight,
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
          ? "bg-sidebar-active text-white font-medium"
          : "text-slate-300 hover:bg-sidebar-active",
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
  const [logout] = useLogoutMutation();

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
      name: "Home",
      href: DASHBOARD_PATHS.HOME,
      icon: <Home className="h-5 w-5" />,
    },
    // {
    //   name: "Appointments",
    //   href: DASHBOARD_PATHS.APPOINTMENTS,
    //   icon: <CalendarDays className="h-5 w-5" />,
    // },
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
    {
      name: "Charting",
      href: DASHBOARD_PATHS.CHARTING,
      icon: <FileText className="h-5 w-5" />,
    },
  ];

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      router.push(AUTH_ROUTES.LOGIN);
    } catch (error) {
      console.error("Logout failed:", error);
      // Still redirect on error
      router.push(AUTH_ROUTES.LOGIN);
    }
  };

  return (
    <TooltipProvider>
      <div className="relative">
        <div
          className={cn(
            "bg-background h-full transition-all duration-300 ease-in-out fixed lg:relative",
            isCollapsed ? "w-15" : "w-60",
            isMobile && isCollapsed ? "w-15" : "",
            isMobile && !isCollapsed ? "shadow-xl z-30" : "",
          )}
        >
          <div className="flex h-full flex-col">
            {/* Sidebar header for desktop */}
            {!isMobile && (
              <div
                className={cn(
                  "h-16 flex items-center overflow-hidden bg-theme-blue rounded-tr-2xl",
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
              className="flex flex-col h-full overflow-hidden bg-theme-blue rounded-br-2xl"
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
                    <span className="text-sm font-medium text-slate-300">{providerName}</span>
                  )}
                </div>
                {!isCollapsed && (
                  <button
                    type="button"
                    className="p-1 rounded-sm hover:text-slate-200"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <ChevronRight
                      size={16}
                      className={cn(
                        "text-slate-300 transition-transform",
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
                      onClick={handleLogout}
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
                        handleLogout();
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
                      onClick={handleLogout}
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
          className="absolute z-[60]"
          style={{
            top: "50px",
            right: "0",
            transform: "translateX(50%)",
          }}
        >
          <Tooltip content={isCollapsed ? "Expand" : "Collapse"} side="right">
            <button
              type="button"
              onClick={toggleSidebar}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-sm bg-secondary",
                "hover:bg-muted transition-colors shadow-md",
              )}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <PanelLeft className="h-3 w-3 text-icon" />
              ) : (
                <PanelRight className="h-3 w-3 text-icon" />
              )}
            </button>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
