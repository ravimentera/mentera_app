"use client";

import { ChatDrawer } from "@/components/organisms/ChatDrawer";
import { DashboardLayout } from "@/components/templates";

export default function DashboardLayoutWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardLayout>
      <ChatDrawer />
      {children}
    </DashboardLayout>
  );
}
