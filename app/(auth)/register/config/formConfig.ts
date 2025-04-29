import * as Yup from "yup";

// Types for our form configuration
export interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "select" | "checkbox" | "radio" | "password";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  width?: "full" | "half";
  validation?: any;
}

export interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  validationSchema: any;
}

// Define the steps for the registration process
export const registrationSteps: FormStep[] = [
  {
    id: "business-information",
    title: "Business Information",
    description: "Provide your business information",
    fields: [
      {
        id: "businessName",
        label: "Business Name",
        type: "text",
        placeholder: "Enter your full name",
        required: true,
        width: "full",
      },
      {
        id: "website",
        label: "Website",
        type: "text",
        placeholder: "Enter your full name",
        required: true,
        width: "full",
      },
      {
        id: "email",
        label: "Email",
        type: "email",
        placeholder: "Enter your full name",
        required: true,
        width: "half",
      },
      {
        id: "phoneNumber",
        label: "Phone Number",
        type: "tel",
        placeholder: "Enter your full name",
        required: true,
        width: "half",
      },
      {
        id: "city",
        label: "City",
        type: "select",
        placeholder: "Enter your full name",
        required: true,
        width: "half",
        options: [
          { value: "new-york", label: "New York" },
          { value: "los-angeles", label: "Los Angeles" },
          { value: "chicago", label: "Chicago" },
          { value: "houston", label: "Houston" },
          { value: "phoenix", label: "Phoenix" },
        ],
      },
      {
        id: "country",
        label: "Country",
        type: "select",
        placeholder: "Enter your full name",
        required: true,
        width: "half",
        options: [
          { value: "us", label: "United States" },
          { value: "ca", label: "Canada" },
          { value: "uk", label: "United Kingdom" },
          { value: "au", label: "Australia" },
        ],
      },
    ],
    validationSchema: Yup.object({
      businessName: Yup.string().required("Business name is required"),
      website: Yup.string().url("Must be a valid URL").required("Website is required"),
      email: Yup.string().email("Must be a valid email").required("Email is required"),
      phoneNumber: Yup.string().required("Phone number is required"),
      city: Yup.string().required("City is required"),
      country: Yup.string().required("Country is required"),
    }),
  },
  {
    id: "treatments-offered",
    title: "Treatments Offered",
    description: "Select the treatments your business offers",
    fields: [
      {
        id: "treatmentCategories",
        label: "Treatment Categories",
        type: "checkbox",
        required: true,
        width: "full",
        options: [
          { value: "injectables", label: "Injectables" },
          { value: "laser", label: "Laser Treatments" },
          { value: "skincare", label: "Skincare" },
          { value: "body-contouring", label: "Body Contouring" },
          { value: "hair-removal", label: "Hair Removal" },
          { value: "facial-treatments", label: "Facial Treatments" },
        ],
      },
      {
        id: "specificTreatments",
        label: "Specific Treatments",
        type: "checkbox",
        required: true,
        width: "full",
        options: [
          { value: "botox", label: "Botox" },
          { value: "fillers", label: "Dermal Fillers" },
          { value: "prp", label: "PRP Therapy" },
          { value: "microdermabrasion", label: "Microdermabrasion" },
          { value: "chemical-peels", label: "Chemical Peels" },
          { value: "coolsculpting", label: "CoolSculpting" },
        ],
      },
    ],
    validationSchema: Yup.object({
      treatmentCategories: Yup.array().min(1, "Select at least one treatment category"),
      specificTreatments: Yup.array().min(1, "Select at least one specific treatment"),
    }),
  },
];

// Initial form values based on the form configuration
export const getInitialValues = () => {
  const initialValues: Record<string, any> = {};

  registrationSteps.forEach((step) => {
    step.fields.forEach((field) => {
      if (field.type === "checkbox") {
        initialValues[field.id] = [];
      } else {
        initialValues[field.id] = "";
      }
    });
  });

  return initialValues;
};
