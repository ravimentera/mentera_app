import type { PatientOverviewCard } from "@/types/patient-overview";

export const MOCK_PATIENT_OVERVIEW_TITLE = "Mock Patient Overview";

export const MOCK_PATIENT_OVERVIEW_CARDS: PatientOverviewCard[] = [
  {
    id: "provider-recommendations",
    title: "Provider Recommendations",
    backgroundColor: "bg-gray-50",
    data: [
      {
        label: "Recommended Frequency:",
        value: "Every 4-6 weeks",
      },
      {
        label: "Next Appointment:",
        value: "Schedule within 2 weeks",
      },
      {
        label: "Treatment Notes:",
        value: "Continue current protocol",
        description:
          "Patient responding well to HydraFacial treatments. Skin texture and hydration have improved significantly.",
      },
    ],
  },
  {
    id: "patient-observations",
    title: "Patient Observations",
    backgroundColor: "bg-gray-50",
    data: [
      {
        label: "Skin Condition:",
        value: "Improved texture and hydration",
      },
      {
        label: "Treatment Response:",
        value: "Positive",
      },
      {
        label: "Observations:",
        value: "Visible improvement",
        description:
          "Skin appeared visibly hydrated and glowing post-treatment. Patient noted improved texture and reduced fine lines.",
      },
    ],
  },
  {
    id: "actionable-insights",
    title: "Actionable Insights",
    backgroundColor: "bg-gray-50",
    data: [
      {
        label: "Procedure:",
        value: "HydraFacial",
      },
      {
        label: "Areas Treated:",
        value: "Full Face",
      },
      {
        label: "Observations:",
        value: "Positive treatment outcome",
        description:
          "Skin appeared hydrated and glowing. Patient noted improved texture and reduced fine lines. Recommended monthly sessions.",
      },
    ],
  },
  {
    id: "user-history",
    title: "User History",
    backgroundColor: "bg-gray-50",
    data: [
      {
        label: "Last Visited On:",
        value: "2025-04-05",
      },
      {
        label: "Last Connected on Email:",
        value: "2025-04-05",
      },
      {
        label: "Last Connected on SMS:",
        value: "2025-04-05",
      },
      {
        label: "Created On:",
        value: "2025-04-05",
      },
    ],
  },
  {
    id: "procedure-details",
    title: "Procedure Details",
    backgroundColor: "bg-gray-50",
    data: [
      {
        label: "Procedure:",
        value: "HydraFacial",
      },
      {
        label: "Areas Treated:",
        value: "Full Face",
      },
    ],
  },
];
