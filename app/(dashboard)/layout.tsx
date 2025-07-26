"use client";

import { ChatDrawer } from "@/components/organisms/ChatDrawer";
import { DashboardLayout } from "@/components/templates";
import { usePathname } from "next/navigation";

export default function DashboardLayoutWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <DashboardLayout>
      {pathname !== "/home" && <ChatDrawer />}
      {children}
    </DashboardLayout>
  );
}
