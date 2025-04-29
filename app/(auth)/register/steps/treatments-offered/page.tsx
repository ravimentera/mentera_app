"use client";

import { Button } from "@/components/atoms";
import { TreatmentOption, TreatmentPillGroup } from "@/components/molecules/TreatmentPillGroup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useRegistration } from "../../context/RegistrationContext";

const treatmentOptions: TreatmentOption[] = [
  { value: "treatments-offered", label: "Treatments Offered" },
  { value: "chemical-peels", label: "Chemical Peels" },
  { value: "body-contouring", label: "Body Contouring" },
  { value: "skin-tightening", label: "Skin Tightening" },
  { value: "botox", label: "Botox" },
  { value: "laser-hair-removal", label: "Laser Hair Removal" },
  { value: "facial-treatments", label: "Facial Treatments" },
  { value: "dermal-fillers", label: "Dermal Fillers" },
  { value: "microdermabrasion", label: "Microdermabrasion" },
  { value: "prp-therapy", label: "PRP Therapy" },
];

export default function TreatmentsOfferedPage() {
  const { formData, updateFormData, steps } = useRegistration();
  const router = useRouter();
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>(
    formData.treatmentCategories || [],
  );

  const handleTreatmentsChange = (selected: string[]) => {
    setSelectedTreatments(selected);
  };

  const handleSubmit = async () => {
    try {
      if (selectedTreatments.length === 0) {
        toast.error("Please select at least one treatment");
        return;
      }

      // Update form data with selected treatments
      updateFormData({
        ...formData,
        treatmentCategories: selectedTreatments,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Registration completed successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error:", error);
      toast.error("There was an error completing your registration");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold text-[#1F2937] mb-8">
        Select treatments that you offered
      </h2>

      <TreatmentPillGroup
        title=""
        options={treatmentOptions}
        onChange={handleTreatmentsChange}
        initialSelected={formData.treatmentCategories || []}
      />

      <div className="flex justify-between mt-10">
        <Button
          variant="outline"
          onClick={() => router.push("/register/steps/business-information")}
        >
          Previous
        </Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </div>
    </div>
  );
}
