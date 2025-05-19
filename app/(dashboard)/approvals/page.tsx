"use client";

import { ApprovalsContainer } from "@/components/organisms/approvals/ApprovalsContainer";
import { Toaster } from "sonner";

export default function ApprovalsPage() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="h-full w-full">
        <ApprovalsContainer />
      </div>
    </>
  );
}
