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
  isOptional?: boolean;
}

// City options for registration
export const CITY_OPTIONS = [
  { value: "new-york", label: "New York" },
  { value: "los-angeles", label: "Los Angeles" },
  { value: "chicago", label: "Chicago" },
  { value: "houston", label: "Houston" },
  { value: "phoenix", label: "Phoenix" },
];

// Country options for registration
export const COUNTRY_OPTIONS = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "uk", label: "United Kingdom" },
  { value: "au", label: "Australia" },
];

// Treatment category options
export const TREATMENT_CATEGORY_OPTIONS = [
  { value: "injectables", label: "Injectables" },
  { value: "laser", label: "Laser Treatments" },
  { value: "skincare", label: "Skincare" },
  { value: "body-contouring", label: "Body Contouring" },
  { value: "hair-removal", label: "Hair Removal" },
  { value: "facial-treatments", label: "Facial Treatments" },
];

// Specific treatment options
export const SPECIFIC_TREATMENT_OPTIONS = [
  { value: "botox", label: "Botox" },
  { value: "fillers", label: "Dermal Fillers" },
  { value: "prp", label: "PRP Therapy" },
  { value: "microdermabrasion", label: "Microdermabrasion" },
  { value: "chemical-peels", label: "Chemical Peels" },
  { value: "coolsculpting", label: "CoolSculpting" },
];

// Validation schemas
export const BUSINESS_INFO_VALIDATION_SCHEMA = Yup.object({
  businessName: Yup.string().required("Business name is required"),
  website: Yup.string().url("Must be a valid URL").required("Website is required"),
  email: Yup.string().email("Must be a valid email").required("Email is required"),
  phoneNumber: Yup.string().required("Phone number is required"),
  city: Yup.string().required("City is required"),
  country: Yup.string().required("Country is required"),
});

export const TREATMENTS_VALIDATION_SCHEMA = Yup.object({
  treatmentCategories: Yup.array(),
  specificTreatments: Yup.array(),
});

export const EHR_INTEGRATION_VALIDATION_SCHEMA = Yup.object({
  ehrProvider: Yup.string(),
  clientId: Yup.string(),
  clientSecret: Yup.string(),
});

// Define the steps for the registration process
export const REGISTRATION_STEPS: FormStep[] = [
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
        options: CITY_OPTIONS,
      },
      {
        id: "country",
        label: "Country",
        type: "select",
        placeholder: "Enter your full name",
        required: true,
        width: "half",
        options: COUNTRY_OPTIONS,
      },
    ],
    validationSchema: BUSINESS_INFO_VALIDATION_SCHEMA,
  },
  {
    id: "treatments-offered",
    title: "Treatments Offered",
    description: "Select the treatments your business offers (optional)",
    fields: [
      {
        id: "treatmentCategories",
        label: "Treatment Categories",
        type: "checkbox",
        required: false,
        width: "full",
        options: TREATMENT_CATEGORY_OPTIONS,
      },
      {
        id: "specificTreatments",
        label: "Specific Treatments",
        type: "checkbox",
        required: false,
        width: "full",
        options: SPECIFIC_TREATMENT_OPTIONS,
      },
    ],
    validationSchema: TREATMENTS_VALIDATION_SCHEMA,
    isOptional: true,
  },
  {
    id: "ehr-integration",
    title: "EHR Integration",
    description: "Connect your Electronic Health Record system (optional)",
    fields: [
      {
        id: "ehrProvider",
        label: "EHR Provider",
        type: "select",
        required: false,
        width: "full",
        options: [
          { value: "", label: "Skip EHR Integration" },
          { value: "drchrono", label: "DrChrono" },
          { value: "epic", label: "Epic (Coming Soon)" },
          { value: "cerner", label: "Cerner (Coming Soon)" },
        ],
      },
      {
        id: "clientId",
        label: "Client ID",
        type: "text",
        placeholder: "Enter your EHR Client ID",
        required: false,
        width: "full",
      },
      {
        id: "clientSecret",
        label: "Client Secret",
        type: "password",
        placeholder: "Enter your EHR Client Secret",
        required: false,
        width: "full",
      },
    ],
    validationSchema: EHR_INTEGRATION_VALIDATION_SCHEMA,
    isOptional: true,
  },
];

// Initial form values for registration
export const getInitialValues = () => {
  const initialValues: Record<string, any> = {};

  REGISTRATION_STEPS.forEach((step) => {
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

// Login form initial values
export const LOGIN_INITIAL_VALUES = {
  email: "",
  password: "",
};
