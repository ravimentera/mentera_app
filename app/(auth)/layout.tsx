"use client";

import { AuthLayout } from "@/components/templates";

export default function AuthLayoutWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthLayout>{children}</AuthLayout>;
}
