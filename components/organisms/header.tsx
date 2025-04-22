"use client";

import { Button } from "@/components/atoms";
import { cn } from "@/lib/utils";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
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
    document.cookie =
      "auth_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={handleMenuClick}
            >
              <HamburgerMenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle mobile menu</span>
            </Button>
          </div>

          {/* Only show logo on desktop */}
          <div className="hidden lg:block">
            <Link
              href={isLoggedIn ? "/dashboard" : "/"}
              className="flex items-center gap-2 relative z-50"
            >
              <img
                src="/logo-with-name-light.svg"
                alt="Mentera AI Logo"
                className="w-36"
              />
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
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          isMobileMenuOpen ? "block" : "hidden"
        )}
      >
        <button
          type="button"
          className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 w-full max-w-xs border-r bg-background p-6 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <Link
              href={isLoggedIn ? "/dashboard" : "/"}
              className="flex items-center gap-2"
            >
              {/* Spa/Health Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-primary"
                style={{ display: "inline-block" }}
              >
                <path d="M18 20V8.5a4.5 4.5 0 0 0-9 0v5" />
                <path d="M6 12a4.5 4.5 0 0 0 9 0" />
                <circle cx="6" cy="12" r="1" />
                <path d="m18 20-3-6" />
                <path d="m18 20 3-6" />
              </svg>
              <span className="text-2xl font-bold text-primary">
                Mentera-AI
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
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
              href="/dashboard"
              className="text-base font-medium hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/appointments"
              className="text-base font-medium hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Appointments
            </Link>
            <Link
              href="/profile"
              className="text-base font-medium hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Profile
            </Link>
            <Link
              href="/settings"
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
