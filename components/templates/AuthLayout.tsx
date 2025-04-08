"use client";

import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 md:p-8">
      {/* <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div> */}

      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="space-y-4 text-center mb-8">
          <div className="flex justify-center">
            <img src="/logo-with-name-light.svg" alt="Mentera AI Logo" className="w-48" />
          </div>
        </div>

        <div className={cn("rounded-lg border bg-card p-6 shadow-sm")}>{children}</div>

        <div className="text-center text-sm">
          <p className="text-muted-foreground">
            © Mentera-AI {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
