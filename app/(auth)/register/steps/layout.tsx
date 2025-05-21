"use client";

import { REGISTRATION_ROUTES } from "@/app/constants/route-constants";
import { GRADIENTS } from "@/app/constants/theme-constants";
import { FormStepper, Step } from "@/components/molecules/form-stepper";
import { GradientBackground } from "@/components/templates";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { REGISTRATION_STEPS } from "../config/formConfig";
import { RegistrationProvider, useRegistration } from "../context/RegistrationContext";

function RegistrationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const currentStepId = pathname.split("/").pop() || "";
  const { canNavigateToStep, isStepComplete } = useRegistration();

  // Create steps config with completion status
  const stepsConfig: Step[] = REGISTRATION_STEPS.map((step, index) => ({
    id: step.id,
    title: step.title,
    number: index + 1,
    href: REGISTRATION_ROUTES.getStepRoute(step.id),
    isCompleted: isStepComplete(step.id),
    isNavigable: canNavigateToStep(step.id) || step.id === currentStepId,
  }));

  return (
    <>
      {/* Gradient background */}
      <GradientBackground
        gradientColors={GRADIENTS.REGISTER_BACKGROUND}
        className="-z-10 blur-[82px]"
      />
      <div className="min-h-screen flex flex-col relative">
        {/* Header with logo */}
        <header className="w-full py-6 px-4 flex justify-center">
          <Image
            src="/logo-with-name-light.svg"
            alt="Mentera Logo"
            width={150}
            height={44}
            className="h-11 w-auto"
          />
        </header>
        {/* Main content */}
        <main className="flex-1 flex flex-col items-center px-4 py-4 pt-2">
          <div className="w-full max-w-[630px] space-y-8">
            {/* Stepper */}
            <FormStepper
              steps={stepsConfig}
              activeStep={currentStepId}
              disableForwardNavigation={true}
            />
            {/* Form content */}
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

export default function StepsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RegistrationProvider>
      <RegistrationLayout>{children}</RegistrationLayout>
    </RegistrationProvider>
  );
}
