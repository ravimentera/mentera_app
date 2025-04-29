"use client";

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return <div className="flex min-h-screen items-center justify-center w-full">{children}</div>;
}
