"use client";

import { ReactNode, createContext, useContext, useState } from "react";
import { getInitialValues, registrationSteps } from "../config/formConfig";

interface RegistrationContextType {
  formData: Record<string, any>;
  updateFormData: (stepData: Record<string, any>) => void;
  resetForm: () => void;
  currentStep: string;
  setCurrentStep: (step: string) => void;
  steps: typeof registrationSteps;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<Record<string, any>>(getInitialValues());
  const [currentStep, setCurrentStep] = useState<string>(registrationSteps[0].id);

  const updateFormData = (stepData: Record<string, any>) => {
    setFormData((prevData) => ({
      ...prevData,
      ...stepData,
    }));
  };

  const resetForm = () => {
    setFormData(getInitialValues());
    setCurrentStep(registrationSteps[0].id);
  };

  return (
    <RegistrationContext.Provider
      value={{
        formData,
        updateFormData,
        resetForm,
        currentStep,
        setCurrentStep,
        steps: registrationSteps,
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
