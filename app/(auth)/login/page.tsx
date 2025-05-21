"use client";

import { AuthMarketingSection } from "@/components/organisms/auth-marketing-section";
import { LoginForm } from "./components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-white w-full">
      <AuthMarketingSection />
      <LoginForm />
    </div>
  );
}
