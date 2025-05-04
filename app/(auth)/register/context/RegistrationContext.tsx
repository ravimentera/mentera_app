"use client";

import { ReactNode, createContext, useContext, useState } from "react";
import { REGISTRATION_STEPS, getInitialValues } from "../config/formConfig";

interface RegistrationContextType {
  formData: Record<string, any>;
  updateFormData: (stepData: Record<string, any>) => void;
  resetForm: () => void;
  currentStep: string;
  setCurrentStep: (step: string) => void;
  steps: typeof REGISTRATION_STEPS;
  isStepComplete: (stepId: string) => boolean;
  canNavigateToStep: (stepId: string) => boolean;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<Record<string, any>>(getInitialValues());
  const [currentStep, setCurrentStep] = useState<string>(REGISTRATION_STEPS[0].id);

  const updateFormData = (stepData: Record<string, any>) => {
    setFormData((prevData) => ({
      ...prevData,
      ...stepData,
    }));
  };

  const resetForm = () => {
    setFormData(getInitialValues());
    setCurrentStep(REGISTRATION_STEPS[0].id);
  };

  // Check if a specific step is completed (all required fields filled)
  const isStepComplete = (stepId: string) => {
    const step = REGISTRATION_STEPS.find((s) => s.id === stepId);
    if (!step) return false;

    // If the step is optional, consider it complete
    if (step.isOptional) return true;

    // Check if all required fields are filled
    const requiredFields = step.fields.filter((field) => field.required);
    return requiredFields.every((field) => {
      const value = formData[field.id];
      return (
        value !== undefined && value !== "" && (Array.isArray(value) ? value.length > 0 : true)
      );
    });
  };

  // Check if user can navigate to a specific step
  const canNavigateToStep = (stepId: string) => {
    // Get the index of the step we want to navigate to
    const targetStepIndex = REGISTRATION_STEPS.findIndex((s) => s.id === stepId);
    if (targetStepIndex === -1) return false;

    // Always allow navigating to the first step
    if (targetStepIndex === 0) return true;

    // Check if all previous mandatory steps are completed
    for (let i = 0; i < targetStepIndex; i++) {
      if (!isStepComplete(REGISTRATION_STEPS[i].id)) {
        return false;
      }
    }

    return true;
  };

  return (
    <RegistrationContext.Provider
      value={{
        formData,
        updateFormData,
        resetForm,
        currentStep,
        setCurrentStep,
        steps: REGISTRATION_STEPS,
        isStepComplete,
        canNavigateToStep,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (context === undefined) {
    throw new Error("useRegistration must be used within a RegistrationProvider");
  }
  return context;
}
