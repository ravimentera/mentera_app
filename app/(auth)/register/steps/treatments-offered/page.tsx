"use client";

import { AUTH_ROUTES } from "@/app/constants/route-constants";
import { Button } from "@/components/atoms";
import { TreatmentOption, TreatmentPillGroup } from "@/components/molecules/treatment-pill-group";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useRegistration } from "../../context/RegistrationContext";

const treatmentOptions: TreatmentOption[] = [
  { value: "chemical-peels", label: "Chemical Peels" },
  { value: "botox", label: "Botox" },
  { value: "dermal-fillers", label: "Dermal Fillers" },
  { value: "laser-treatments", label: "Laser Treatments" },
  { value: "microdermabrasion", label: "Microdermabrasion" },
  { value: "facial-treatments", label: "Facial Treatments" },
  { value: "body-contouring", label: "Body Contouring" },
  { value: "prp-therapy", label: "PRP Therapy" },
];

export default function TreatmentsOfferedPage() {
  const { formData, updateFormData } = useRegistration();
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);

  const handleSelectionChange = (selections: string[]) => {
    setSelectedTreatments(selections);
  };

  const handleSubmit = async () => {
    console.log("Treatment selections:", selectedTreatments);
    updateFormData({
      treatmentCategories: selectedTreatments,
    });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    toast.success("Treatments saved successfully");
    console.log("Treatments saved successfully", formData);
    // Navigate to dashboard
    window.location.href = AUTH_ROUTES.LOGIN;
  };

  const handleSkip = () => {
    updateFormData({
      treatmentCategories: [],
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[20px] shadow-md p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Select the treatments your business offers (optional)
        </h2>

        <div className="space-y-6">
          <TreatmentPillGroup
            title="Treatments Offered"
            options={treatmentOptions}
            initialSelected={selectedTreatments}
            onChange={handleSelectionChange}
          />

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSubmit}
              className="bg-[#C026D3] hover:bg-[#BD05DD] text-white font-medium text-base rounded-lg px-4 py-2"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Link href={AUTH_ROUTES.LOGIN} onClick={handleSkip}>
          <Button type="button" variant="link" className="text-gray-500 hover:text-gray-700">
            Skip and go to login
          </Button>
        </Link>
      </div>
    </div>
  );
}
