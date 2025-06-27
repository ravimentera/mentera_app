"use client";

import { Button } from "@/components/atoms";
import { AUTH_ROUTES } from "@/app/constants/route-constants";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export default function RegistrationSuccessPage() {
  const searchParams = useSearchParams();
  const [details, setDetails] = useState({
    connected: false,
    provider: "",
    org: "",
  });

  useEffect(() => {
    // Check if user completed EHR integration
    const connected = searchParams?.get("connected") === "true";
    const provider = searchParams?.get("provider") || "";
    const org = searchParams?.get("org") || "";

    setDetails({ connected, provider, org });

    // Celebration effect
    if (connected) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen bg-white w-full">
      <div className="w-full flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900">
              Registration Complete!
            </h1>
            
            <p className="text-gray-600">
              Your Mentera account has been successfully created.
            </p>
          </div>

          {details.connected && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">
                🎉 EHR Integration Successful
              </h3>
              <p className="text-sm text-green-700">
                Your {details.provider} integration is now active and ready to sync patient data.
                Organization ID: {details.org}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>What&apos;s next?</p>
              <ul className="mt-2 space-y-1 text-left">
                <li>• Access your dashboard to manage patients</li>
                <li>• Schedule appointments with integrated EHR data</li>
                <li>• Configure additional settings as needed</li>
                {details.connected && (
                  <li>• Your EHR data will begin syncing automatically</li>
                )}
              </ul>
            </div>

            <Link href={AUTH_ROUTES.LOGIN}>
              <Button className="w-full bg-brand-purple hover:bg-brand-purple-hover text-white">
                Sign In to Your Account
              </Button>
            </Link>

            <p className="text-xs text-gray-500">
              You can access your dashboard and manage all settings after signing in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 