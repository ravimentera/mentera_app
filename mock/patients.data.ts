export const patients = [
  {
    patientId: "PT-1001",
    chartId: "CH-5001",
    visitDate: "2025-03-10",
    provider: "Rachel Garcia",
    treatmentNotes: {
      procedure: "Botox",
      areasTreated: ["Forehead", "Crow's Feet"],
      unitsUsed: 35,
      observations:
        "Mild redness post-procedure, resolved within 2 hours. Patient reported minimal discomfort. Skin texture improved, wrinkles visibly reduced.",
      providerRecommendations:
        "Consider adding glabellar lines in next session for comprehensive facial rejuvenation.",
    },
    preProcedureCheck: {
      medications: ["Vitamin C"],
      consentSigned: true,
      allergyCheck: "No contraindications",
    },
    postProcedureCare: {
      instructionsProvided: true,
      followUpRecommended: "2025-06-10",
      productsRecommended: ["Arnica Gel"],
    },
    nextTreatment: "Glabellar lines",
    followUpDate: "2025-06-10",
    alerts: [],
    providerSpecialty: "Botox",
    treatmentOutcome: "Positive",
  },
  {
    patientId: "PT-1002",
    chartId: "CH-5002",
    visitDate: "2025-03-08",
    provider: "Samantha Taylor",
    treatmentNotes: {
      procedure: "Juvederm",
      areasTreated: ["Upper Lip", "Lower Lip"],
      volumeUsed: "1 ml",
      observations:
        "Slight swelling observed in the upper lip area, peaked at 24 hours, resolved by 48 hours. Patient comfortable with appearance, expressed satisfaction.",
      providerRecommendations:
        "Patient may benefit from cheek augmentation with fillers; discuss options at next visit.",
    },
    preProcedureCheck: {
      medications: ["Ibuprofen (stopped 48hrs prior)"],
      consentSigned: true,
      allergyCheck: "No known allergies",
    },
    postProcedureCare: {
      instructionsProvided: true,
      followUpRecommended: "2025-04-08",
      productsRecommended: ["Lip Hydration Balm"],
    },
    nextTreatment: "Cheek augmentation",
    followUpDate: "2025-04-08",
    alerts: [],
    providerSpecialty: "Juvederm",
    treatmentOutcome: "Positive",
  },
  {
    patientId: "PT-1003",
    chartId: "CH-5003",
    visitDate: "2025-02-27",
    provider: "Veronica Miller",
    treatmentNotes: {
      procedure: "Laser Hair Removal",
      areasTreated: ["Underarms"],
      sessionNumber: 3,
      observations:
        "No adverse reactions. Patient reported 80% reduction in hair growth, high satisfaction with results.",
      providerRecommendations:
        "Continue with remaining sessions as planned; assess after session 5 for potential maintenance treatments.",
    },
    preProcedureCheck: {
      medications: ["None"],
      consentSigned: true,
      allergyCheck: "Latex allergy confirmed, precautions taken",
    },
    postProcedureCare: {
      instructionsProvided: true,
      followUpRecommended: "2025-03-27",
      productsRecommended: ["Aloe Vera Gel"],
    },
    nextTreatment: "Laser Hair Removal session 4",
    followUpDate: "2025-03-27",
    alerts: ["Latex allergy"],
    providerSpecialty: "Laser Hair Removal",
    treatmentOutcome: "Positive",
  },
  {
    patientId: "PT-1004",
    chartId: "CH-5004",
    visitDate: "2025-03-05",
    provider: "Megan Wilson",
    treatmentNotes: {
      procedure: "HydraFacial",
      areasTreated: ["Full Face"],
      sessionDuration: "60 mins",
      observations:
        "Skin appeared visibly hydrated and glowing post-treatment. Patient noted improved texture and reduced fine lines. Recommended monthly sessions.",
      providerRecommendations:
        "Incorporate booster treatments for enhanced results, such as LED light therapy or lymphatic drainage.",
    },
    preProcedureCheck: {
      medications: ["Retinol (paused 24hrs prior)"],
      consentSigned: true,
      allergyCheck: "No allergies",
    },
    postProcedureCare: {
      instructionsProvided: true,
      followUpRecommended: "2025-04-05",
      productsRecommended: ["Moisturizing Sunscreen SPF 50"],
    },
    nextTreatment: "HydraFacial with booster treatments",
    followUpDate: "2025-04-05",
    alerts: [],
    providerSpecialty: "HydraFacial",
    treatmentOutcome: "Positive",
  },
  {
    patientId: "PT-1005",
    chartId: "CH-5005",
    visitDate: "2025-03-09",
    provider: "Jessica Brown",
    treatmentNotes: {
      procedure: "CoolSculpting",
      areasTreated: ["Abdomen"],
      cyclesCompleted: 2,
      observations:
        "Mild discomfort during procedure (3/10 pain scale), relieved with cooling pads post-treatment. Initial measurements show 1-inch reduction in waist circumference.",
      providerRecommendations:
        "Monitor fat reduction progress; consider additional cycles if needed for optimal results.",
    },
    preProcedureCheck: {
      medications: ["None"],
      consentSigned: true,
      allergyCheck: "Sensitive to Aspirin, verified safe to proceed",
    },
    postProcedureCare: {
      instructionsProvided: true,
      followUpRecommended: "2025-04-09",
      productsRecommended: ["Compression Garment"],
    },
    nextTreatment: "CoolSculpting additional cycles",
    followUpDate: "2025-04-09",
    alerts: ["Aspirin sensitivity"],
    providerSpecialty: "CoolSculpting",
    treatmentOutcome: "Positive",
  },
];
