"use client";

import { Button } from "@/components/atoms/Button";
import { AuthMarketingSection } from "@/components/organisms/auth-marketing-section";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RegistrationForm } from "./components/RegistrationForm";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirectTo");
  const stepFlow = searchParams?.get("stepFlow") === "true";

  // If redirectTo is provided, we'll pass it to the registration steps later
  const redirect = redirectTo ? `?redirectTo=${redirectTo}` : "";

  return (
    <div className="flex min-h-screen bg-white w-full">
      <AuthMarketingSection />

      {stepFlow ? (
        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col items-center justify-center">
          <div className="w-full max-w-md space-y-8 text-center">
            <h1 className="text-3xl font-bold">Create Your Med Spa Account</h1>
            <p className="text-gray-600">
              Complete a simple multi-step process to set up your business account on Mentera
            </p>
            <Link href={`/register/steps${redirect}`}>
              <Button className="w-full mt-8 bg-[#C026D3] hover:bg-[#BD05DD] text-white">
                Start Registration
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <RegistrationForm />
      )}
    </div>
  );
}
