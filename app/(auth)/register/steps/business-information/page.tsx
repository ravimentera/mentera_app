"use client";

import { DynamicForm } from "@/components/organisms/DynamicForm";
import { FormikHelpers } from "formik";
import { toast } from "sonner";
import { useRegistration } from "../../context/RegistrationContext";

export default function BusinessInformationPage() {
  const { formData, updateFormData, steps } = useRegistration();

  const businessInfoStep = steps.find((step) => step.id === "business-information");

  if (!businessInfoStep) {
    return <div>Step configuration not found</div>;
  }

  const handleSubmit = async (values: any, helpers: FormikHelpers<any>) => {
    try {
      // Store form data in the context
      updateFormData(values);

      // You can also send data to an API here
      // await api.saveBusinessInfo(values);

      toast.success("Business information saved successfully");
      helpers.setSubmitting(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("There was an error saving your information");
      helpers.setSubmitting(false);
    }
  };

  return (
    <DynamicForm
      title={businessInfoStep.title}
      description={businessInfoStep.description}
      fields={businessInfoStep.fields}
      initialValues={formData}
      validationSchema={businessInfoStep.validationSchema}
      onSubmit={handleSubmit}
      nextStep="/register/steps/treatments-offered"
    />
  );
}
