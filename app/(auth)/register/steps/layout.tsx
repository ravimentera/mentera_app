"use client";

import { FormStepper, Step } from "@/components/molecules/FormStepper";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { registrationSteps } from "../config/formConfig";
import { RegistrationProvider } from "../context/RegistrationContext";

const stepsConfig: Step[] = registrationSteps.map((step, index) => ({
  id: step.id,
  title: step.title,
  number: index + 1,
  href: `/register/steps/${step.id}`,
}));

function RegistrationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const currentStepId = pathname.split("/").pop() || "";

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-70 blur-[182px]"
          style={{
            background: `
              linear-gradient(90deg, 
                rgba(110, 241, 187, 1) 0%,
                rgba(255, 255, 255, 0) 100%
              ),
              linear-gradient(90deg, 
                rgba(255, 255, 255, 0) 0%,
                rgba(143, 3, 160, 1) 94%
              )
            `,
            backgroundSize: "100% 100%",
          }}
        />
      </div>

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
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-4">
        <div className="w-full max-w-[630px] space-y-8">
          {/* Stepper */}
          <FormStepper steps={stepsConfig} activeStep={currentStepId} />

          {/* Form content */}
          {children}
        </div>
      </main>
    </div>
  );
}

export default function RegistrationStepsLayout({ children }: { children: React.ReactNode }) {
  return (
    <RegistrationProvider>
      <RegistrationLayout>{children}</RegistrationLayout>
    </RegistrationProvider>
  );
}
