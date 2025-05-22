"use client";

import { DrawerComponent } from "@/components/organisms/Drawer";
import { DashboardLayout } from "@/components/templates";

export default function DashboardLayoutWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardLayout>
      <DrawerComponent />
      {children}
    </DashboardLayout>
  );
}
