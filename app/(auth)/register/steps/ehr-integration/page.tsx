"use client";

import { AUTH_ROUTES } from "@/app/constants/route-constants";
import { EHRIntegrationStep } from "../../components/EHRIntegrationStep";
import { useRegistration } from "../../context/RegistrationContext";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function EHRIntegrationPage() {
  const { formData, updateFormData } = useRegistration();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle OAuth errors from callback
  useEffect(() => {
    const oauthError = searchParams?.get("error");
    const errorDetails = searchParams?.get("details");

    if (oauthError) {
      const errorMessage = oauthError === "oauth_failed" 
        ? `OAuth authorization failed: ${errorDetails || "Unknown error"}`
        : oauthError === "missing_code"
        ? "Authorization code was missing from the callback"
        : oauthError === "invalid_state"
        ? "Invalid state parameter - please try again"
        : `Integration error: ${oauthError}`;
      
      toast.error(errorMessage);
      
      // Clear the error from URL
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      url.searchParams.delete("details");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  // Generate a unique organization ID from the business information
  const organizationId = formData.businessName 
    ? `org-${formData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`
    : `org-${Date.now()}`;

  const handleComplete = (ehrData: any) => {
    console.log("✅ EHR integration completed:", ehrData);
    
    // Store EHR data in registration context
    updateFormData({
      ehrProvider: ehrData.provider,
      ehrClientId: ehrData.clientId,
      ehrStatus: ehrData.status,
      ehrOAuthUrl: ehrData.oauthUrl,
    });

    if (ehrData.oauthUrl) {
      console.log("🔄 OAuth URL provided - user will be redirected for authorization");
      toast.success("Redirecting to DrChrono for authorization...");
      // The EHRIntegrationStep component will handle the redirect
    } else {
      console.log("🚫 No OAuth URL - completing registration without external auth");
      toast.success("EHR integration completed successfully");
      completeRegistration();
    }
  };

  const handleSkip = () => {
    console.log("🚫 User chose to skip EHR integration - NO OAuth triggered");
    
    updateFormData({
      ehrProvider: null,
      ehrStatus: "skipped",
    });

    toast.success("Registration completed successfully");
    completeRegistration();
  };

  const completeRegistration = () => {
    // Final registration completion logic
    console.log("Final registration data:", formData);
    
    // In a real app, send all form data to your backend API
    // await api.completeRegistration(formData);
    
    // Redirect to login
    router.push(AUTH_ROUTES.LOGIN);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[20px] shadow-md p-8">
        <EHRIntegrationStep
          organizationId={organizationId}
          onComplete={handleComplete}
          onSkip={handleSkip}
        />
      </div>
    </div>
  );
} 