"use client";

import { Button } from "@/components/atoms/Button";
import React, { useState } from "react";
import { EHRIntegrationStep } from "../components/EHRIntegrationStep";

type RegistrationStep = "business-info" | "ehr-integration" | "complete";

export default function TestEHRRegistrationPage() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("business-info");
  const [registrationData, setRegistrationData] = useState({
    businessName: "",
    organizationId: "",
    ehrData: null as any,
  });

  const handleBusinessInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const businessName = formData.get("businessName") as string;
    const organizationId = `ORG-${Date.now()}`; // Generate a test org ID

    setRegistrationData((prev) => ({
      ...prev,
      businessName,
      organizationId,
    }));

    setCurrentStep("ehr-integration");
  };

  const handleEHRComplete = (ehrData: any) => {
    console.log("🎉 EHR Integration completed:", ehrData);
    setRegistrationData((prev) => ({
      ...prev,
      ehrData,
    }));

    // Note: The EHR component will redirect to OAuth, so we won't reach 'complete' immediately
    // The user will come back after OAuth and land on the success page
    setCurrentStep("complete");
  };

  const handleEHRSkip = () => {
    console.log("⏭️ EHR Integration skipped");
    setCurrentStep("complete");
  };

  // Business Info Step
  if (currentStep === "business-info") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Register Your Med Spa</h1>
            <p className="text-gray-600 mt-2">Let&apos;s start with your business information</p>
          </div>

          <form onSubmit={handleBusinessInfoSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="businessName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Business Name *
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                required
                placeholder="Enter your med spa name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 text-sm mb-1">🧪 Test Mode</h3>
              <p className="text-blue-700 text-xs">
                This is a test of the EHR integration flow during registration
              </p>
            </div>

            <Button type="submit" className="w-full">
              Continue to EHR Setup →
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // EHR Integration Step
  if (currentStep === "ehr-integration") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">
                  ✓
                </div>
                <span className="text-sm text-gray-600">Business Info</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                  2
                </div>
                <span className="text-sm font-medium">EHR Integration</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm">
                  3
                </div>
                <span className="text-sm text-gray-400">Complete</span>
              </div>
            </div>
          </div>

          <EHRIntegrationStep
            organizationId={registrationData.organizationId}
            onComplete={handleEHRComplete}
            onSkip={handleEHRSkip}
          />
        </div>
      </div>
    );
  }

  // Complete Step
  if (currentStep === "complete") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-2xl">✓</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h1>
          <p className="text-gray-600 mb-6">Welcome to Mentera, {registrationData.businessName}!</p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-sm mb-2">Registration Summary:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>Business:</strong> {registrationData.businessName}
              </p>
              <p>
                <strong>Organization ID:</strong> {registrationData.organizationId}
              </p>
              <p>
                <strong>EHR Integration:</strong>{" "}
                {registrationData.ehrData
                  ? `${registrationData.ehrData.provider} (${registrationData.ehrData.status})`
                  : "Skipped"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => {
                window.location.href = "/dashboard";
              }}
              className="w-full"
            >
              Go to Dashboard
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setCurrentStep("business-info");
                setRegistrationData({ businessName: "", organizationId: "", ehrData: null });
              }}
              className="w-full"
            >
              Test Again
            </Button>
          </div>

          {registrationData.ehrData && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                🎉 EHR integration initiated! The OAuth flow should have triggered your Keragon
                workflow.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
