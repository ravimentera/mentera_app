export const providers = [
  {
    medspaId: "MS-1001",
    name: "Destination Aesthetics",
    location: "Sacramento, CA",
    website: "https://www.destinationaesthetics.com",
    contact: {
      email: "info@destinationaesthetics.com",
      phone: "916-555-1000",
    },
    treatments: [
      "Botox",
      "Juvederm",
      "CoolSculpting",
      "Laser Hair Removal",
      "HydraFacial",
      "Microneedling",
      "Chemical Peels",
      "Dermal Fillers",
    ],
    providers: [
      {
        providerId: "NR-2001",
        firstName: "Rachel",
        lastName: "Garcia",
        email: "rachel.garcia@medspa.com",
        phone: "415-555-7001",
        role: "Registered Nurse",
        specialties: ["Botox", "Juvederm"],
        assignedPatients: [
          {
            patientId: "PT-1001",
            chartId: "CH-5001",
          },
        ],
        schedule: {
          nextAppointment: "2025-03-15T10:00:00",
          availability: ["Monday", "Wednesday", "Friday"],
        },
      },
      {
        providerId: "NR-2002",
        firstName: "Samantha",
        lastName: "Taylor",
        email: "samantha.taylor@medspa.com",
        phone: "415-555-7002",
        role: "Registered Nurse",
        specialties: ["Juvederm", "CoolSculpting"],
        assignedPatients: [
          {
            patientId: "PT-1002",
            chartId: "CH-5002",
          },
        ],
        schedule: {
          nextAppointment: "2025-03-16T11:30:00",
          availability: ["Tuesday", "Thursday", "Saturday"],
        },
      },
    ],
  },
];
