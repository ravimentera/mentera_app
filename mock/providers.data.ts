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
      "Lip Fillers",
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
        providerId: "PR-2001",
        avatar: {
          large: "https://randomuser.me/api/portraits/women/75.jpg",
          medium: "https://randomuser.me/api/portraits/med/women/75.jpg",
          thumbnail: "https://randomuser.me/api/portraits/thumb/women/75.jpg",
        },
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
        avatar: {
          large: "https://randomuser.me/api/portraits/women/63.jpg",
          medium: "https://randomuser.me/api/portraits/med/women/63.jpg",
          thumbnail: "https://randomuser.me/api/portraits/thumb/women/63.jpg",
        },
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
      {
        providerId: "NR-2003",
        avatar: {
          large: "https://randomuser.me/api/portraits/men/59.jpg",
          medium: "https://randomuser.me/api/portraits/med/men/59.jpg",
          thumbnail: "https://randomuser.me/api/portraits/thumb/men/59.jpg",
        },
        firstName: "Joel",
        lastName: "Holland",
        email: "joel.holland@medspa.com",
        phone: "924-778-1407",
        role: "Nurse Practitioner",
        specialties: ["Botox", "Chemical Peels", "Microneedling"],
        assignedPatients: [
          {
            patientId: "PT-1003",
            chartId: "CH-5003",
          },
          {
            patientId: "PT-1004",
            chartId: "CH-5004",
          },
        ],
        schedule: {
          nextAppointment: "2025-03-17T09:00:00",
          availability: ["Monday", "Tuesday", "Thursday"],
        },
      },
      {
        providerId: "NR-2004",
        avatar: {
          large: "https://randomuser.me/api/portraits/men/12.jpg",
          medium: "https://randomuser.me/api/portraits/med/men/12.jpg",
          thumbnail: "https://randomuser.me/api/portraits/thumb/men/12.jpg",
        },
        firstName: "Dean",
        lastName: "Prescott",
        email: "dean.prescott@medspa.com",
        phone: "858-691-4176",
        role: "Physician Assistant",
        specialties: ["CoolSculpting", "Laser Hair Removal", "RF Treatments"],
        assignedPatients: [
          {
            patientId: "PT-1005",
            chartId: "CH-5005",
          },
        ],
        schedule: {
          nextAppointment: "2025-03-18T14:30:00",
          availability: ["Wednesday", "Friday", "Saturday"],
        },
      },
      {
        providerId: "NR-2005",
        avatar: {
          large: "https://randomuser.me/api/portraits/women/45.jpg",
          medium: "https://randomuser.me/api/portraits/med/women/45.jpg",
          thumbnail: "https://randomuser.me/api/portraits/thumb/women/45.jpg",
        },
        firstName: "Edna",
        lastName: "Black",
        email: "edna.black@medspa.com",
        phone: "705-302-4109",
        role: "Registered Nurse",
        specialties: ["HydraFacial", "LED Therapy", "Dermaplaning"],
        assignedPatients: [
          {
            patientId: "PT-1006",
            chartId: "CH-5006",
          },
          {
            patientId: "PT-1007",
            chartId: "CH-5007",
          },
        ],
        schedule: {
          nextAppointment: "2025-03-19T10:15:00",
          availability: ["Monday", "Wednesday", "Friday"],
        },
      },
      {
        providerId: "NR-2006",
        avatar: {
          large: "https://randomuser.me/api/portraits/women/34.jpg",
          medium: "https://randomuser.me/api/portraits/med/women/34.jpg",
          thumbnail: "https://randomuser.me/api/portraits/thumb/women/34.jpg",
        },
        firstName: "Katie",
        lastName: "Bailey",
        email: "katie.bailey@medspa.com",
        phone: "200-596-8236",
        role: "Aesthetician",
        specialties: ["Facials", "Chemical Peels", "Microdermabrasion"],
        assignedPatients: [
          {
            patientId: "PT-1008",
            chartId: "CH-5008",
          },
        ],
        schedule: {
          nextAppointment: "2025-03-20T13:00:00",
          availability: ["Tuesday", "Thursday", "Saturday"],
        },
      },
      {
        providerId: "NR-2007",
        avatar: {
          large: "https://randomuser.me/api/portraits/women/8.jpg",
          medium: "https://randomuser.me/api/portraits/med/women/8.jpg",
          thumbnail: "https://randomuser.me/api/portraits/thumb/women/8.jpg",
        },
        firstName: "Nicole",
        lastName: "Warren",
        email: "nicole.warren@medspa.com",
        phone: "325-920-9292",
        role: "Medical Director",
        specialties: ["Injectables", "Body Contouring", "Advanced Procedures"],
        assignedPatients: [
          {
            patientId: "PT-1009",
            chartId: "CH-5009",
          },
          {
            patientId: "PT-1010",
            chartId: "CH-5010",
          },
          {
            patientId: "PT-1011",
            chartId: "CH-5011",
          },
        ],
        schedule: {
          nextAppointment: "2025-03-21T11:45:00",
          availability: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        },
      },
    ],
  },
];
