"use client";

import { AUTH_ROUTES, DASHBOARD_PATHS, STATIC_ROUTES } from "@/app/constants/route-constants";
import { Button } from "@/components/atoms";
import { Cross1Icon, HamburgerMenuIcon, MenteraIcon } from "@/components/atoms/icons";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const hasAuthCookie = document.cookie.includes("auth_session=");
      setIsLoggedIn(hasAuthCookie);
    };

    checkAuth();

    // Check if mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const handleMenuClick = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (onMenuClick) {
      onMenuClick();
    }
  };

  const handleLogout = () => {
    // Clear auth cookie
    document.cookie = "auth_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setIsLoggedIn(false);

    // Show logout toast notification
    toast.info("You have been successfully logged out");

    // Redirect to login
    router.push("/login");
  };

  return (
    <header className="w-full border-b bg-background sticky top-0 z-40">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <div className="lg:hidden">
            <Button variant="ghost" size="icon" className="mr-2" onClick={handleMenuClick}>
              <HamburgerMenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle mobile menu</span>
            </Button>
          </div>

          {/* Only show logo on desktop */}
          <div className="hidden lg:block">
            <Link
              href={isLoggedIn ? DASHBOARD_PATHS.HOME : STATIC_ROUTES.HOME}
              className="flex items-center gap-2 relative z-50"
            >
              <img src="/logo-with-name-light.svg" alt="Mentera AI Logo" className="w-36" />
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* <ThemeToggle /> */}
          {isLoggedIn ? (
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Link href={AUTH_ROUTES.LOGIN}>
              <Button variant="outline">Login</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu drawer */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", isMobileMenuOpen ? "block" : "hidden")}>
        <button
          type="button"
          className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 w-full max-w-xs border-r bg-background p-6 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <Link
              href={isLoggedIn ? DASHBOARD_PATHS.HOME : STATIC_ROUTES.HOME}
              className="flex items-center gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {/* Spa/Health Icon */}
              <MenteraIcon className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">Mentera-AI</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
              <span className="sr-only">Close</span>
              <Cross1Icon className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex flex-col gap-4">
            <Link
              href="/"
              className="text-base font-medium hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href={DASHBOARD_PATHS.HOME}
              className="text-base font-medium hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href={DASHBOARD_PATHS.APPOINTMENTS}
              className="text-base font-medium hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Appointments
            </Link>
            <Link
              href={DASHBOARD_PATHS.PROFILE}
              className="text-base font-medium hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Profile
            </Link>
            <Link
              href={DASHBOARD_PATHS.SETTINGS}
              className="text-base font-medium hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Settings
            </Link>

            {isLoggedIn && (
              <Button
                variant="ghost"
                className="justify-start p-0 text-base font-medium text-foreground hover:text-primary"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                Logout
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
