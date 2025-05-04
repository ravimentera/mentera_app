import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

export interface Step {
  id: string;
  title: string;
  number: number;
  href: string;
  isCompleted?: boolean;
  isNavigable?: boolean;
}

interface FormStepperProps {
  steps: Step[];
  activeStep: string;
  className?: string;
  disableForwardNavigation?: boolean;
}

export function FormStepper({
  steps,
  activeStep,
  className,
  disableForwardNavigation = false,
}: FormStepperProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      {steps.map((step, index) => {
        const isActive = step.id === activeStep;
        const isCompleted = step.isCompleted || steps.findIndex((s) => s.id === activeStep) > index;
        const isLastStep = index === steps.length - 1;
        const activeStepIndex = steps.findIndex((s) => s.id === activeStep);

        // Only allow navigating to previous steps or the current step
        // if disableForwardNavigation is true
        const isNavigable =
          step.isNavigable !== undefined
            ? step.isNavigable
            : !disableForwardNavigation || index <= activeStepIndex || isCompleted;

        return (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                "flex items-center",
                isActive && "py-2.5 px-5 rounded-full bg-[#FAE8FF]",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 text-sm font-medium rounded-full",
                  isActive
                    ? "bg-[#C026D3] text-white"
                    : isCompleted
                      ? "bg-[#F1F5F9] text-[#C026D3]"
                      : "bg-gray-100 text-gray-500",
                  !isNavigable && "opacity-50 cursor-not-allowed",
                )}
              >
                {isNavigable ? (
                  <Link href={step.href} className="flex items-center justify-center w-full h-full">
                    {step.number}
                  </Link>
                ) : (
                  <span className="flex items-center justify-center w-full h-full">
                    {step.number}
                  </span>
                )}
              </div>
              <div className="ml-3">
                {isNavigable ? (
                  <Link
                    href={step.href}
                    className={cn(
                      "text-base font-medium",
                      isActive
                        ? "bg-gradient-to-r from-[#111A53] to-[#BD05DD] bg-clip-text text-transparent font-semibold text-xl"
                        : "text-gray-500",
                    )}
                  >
                    {step.title}
                  </Link>
                ) : (
                  <span className={cn("text-base font-medium text-gray-400 cursor-not-allowed")}>
                    {step.title}
                  </span>
                )}
              </div>
            </div>

            {!isLastStep && (
              <div className="flex items-center mx-4">
                <hr className="w-16 border-0 h-[1px] bg-[#9CA3AF]" />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
