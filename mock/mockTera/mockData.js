// lib/mock/mockData.js
// Ensure this file is in a location accessible by your API route, e.g., "@/lib/mock/mockData.js"

export const mockData = [
  {
    query: "When was the last time this patient came in?",
    markdown: "The last treatment patient PT-1004 received was a HydraFacial on 2025-03-05.",
    layout: {
      // This one was already an object, which is good.
      type: "Layout",
      title: "Patient Visit Overview",
      layout: [
        {
          type: "Grid",
          columns: 2,
          gap: 6,
          rows: [
            {
              type: "Row",
              components: [
                {
                  type: "Component",
                  name: "UserHistoryCard",
                  props: {
                    data: {
                      lastVisitedOn: "2025-03-05",
                      lastConnectedEmail: "2025-03-05",
                      lastConnectedSMS: "2025-03-05",
                      createdOn: "2025-03-01",
                    },
                    userInitial: "P",
                  },
                },
                {
                  type: "Component",
                  name: "ProcedureCard",
                  props: {
                    procedure: "HydraFacial",
                    areasTreated: "Full Face",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    query: "Can I get some history for this patient?",
    markdown: `Patient Overview
Information on patient PT-1004's recent treatment and follow-up plan was requested.
Patient History

* Received HydraFacial treatment on the Full Face.
* The treatment was performed by Megan Wilson and the outcome was Positive.
* Their next follow-up is scheduled for 2025-04-05.

Actionable Insights

* The treatment notes for patient PT-1004 indicate:
* Procedure: HydraFacial
* Areas treated: Full Face
* Observations: Skin appeared visibly hydrated and glowing post-treatment. Patient noted improved texture and reduced fine lines. Recommended monthly sessions.
`,
    layout: {
      type: "Layout",
      title: "Treatment History & Insights",
      layout: [
        {
          type: "Grid",
          columns: 2,
          gap: 6,
          rows: [
            {
              type: "Row",
              components: [
                {
                  type: "Component",
                  name: "ProcedureCard",
                  props: {
                    procedure: "HydraFacial",
                    areasTreated: "Full Face",
                  },
                },
                {
                  type: "Component",
                  name: "TreatmentNoteCard",
                  props: {
                    title: "Procedure Summary",
                    content: "Procedure: HydraFacial\nAreas treated: Full Face",
                  },
                },
              ],
            },
            {
              type: "Row",
              components: [
                {
                  type: "Component",
                  name: "NextAppointmentCard",
                  props: {
                    upcomingAppointment: {
                      title: "Follow-up: HydraFacial",
                      time: "2025-04-05",
                      doctor: "Megan Wilson",
                    },
                    futureAppointments: [],
                    onViewAllLink: "/appointments",
                  },
                },
                {
                  type: "Component",
                  name: "ObservationCard",
                  props: {
                    notes:
                      "Skin appeared visibly hydrated and glowing post-treatment. Patient noted improved texture and reduced fine lines. Recommended monthly sessions.",
                  },
                },
              ],
            },
            {
              type: "Row",
              components: [
                {
                  type: "Component",
                  name: "ActionableInsightsCard",
                  props: {
                    procedure: "HydraFacial",
                    areasTreated: "Full Face",
                    observations:
                      "Skin appeared visibly hydrated and glowing post-treatment. Patient noted improved texture and reduced fine lines. Recommended monthly sessions.",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    query:
      "I want to consider doing microneedling for this patient give me some pre care and post care instructions",
    markdown: `Pre-Care Instructions for Microneedling

* Avoid sun exposure and tanning beds for at least one week before the procedure.
* Avoid alcohol and caffeine for 24-48 hours before the procedure to reduce inflammation.

Post-Care Instructions for Microneedling

* Apply a gentle, fragrance-free moisturizer to the treated area.
* Avoid sun exposure and use a broad-spectrum sunscreen with an SPF of 30 or higher.
* Avoid strenuous exercise and sweating for at least 24 hours after the procedure.
* Avoid using any harsh skincare products or treatments for at least one week after the procedure.

Precautions

* Microneedling should only be performed by a trained and licensed professional.`,
    layout: {
      // Converted from string to direct object
      type: "Layout",
      title: "Microneedling Care Instructions",
      layout: [
        {
          type: "Grid",
          columns: 2,
          gap: 6,
          rows: [
            {
              type: "Row",
              components: [
                {
                  type: "Component",
                  name: "TreatmentNoteCard",
                  props: {
                    title: "Micro Needling Pre-Care Instructions",
                    content:
                      "- Avoid sun exposure and tanning beds for at least one week before the procedure.\n- Avoid alcohol and caffeine for 24-48 hours before the procedure to reduce inflammation.",
                  },
                },
                {
                  type: "Component",
                  name: "TreatmentNoteCard",
                  props: {
                    title: "Micro Needling Post-Care Instructions",
                    content:
                      "- Apply a gentle, fragrance-free moisturizer to the treated area.\n- Avoid sun exposure and use a broad-spectrum sunscreen with an SPF of 30 or higher.\n- Avoid strenuous exercise and sweating for at least 24 hours after the procedure.\n- Avoid using any harsh skincare products or treatments for at least one week after the procedure.",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    query: "I would like to book them for an appointment",
    markdown:
      "Sure! I’ve scheduled an appointment for patient PT-1004 on 13 May 2025 at 12:30 PM for Microneedling. Let me know if you’d like to make any changes or add notes for the provider.",
    layout: {
      type: "Layout",
      title: "Micro Needling Appointment",
      layout: [
        {
          type: "Grid",
          columns: 1,
          gap: 6,
          rows: [
            {
              type: "Row",
              components: [
                {
                  type: "Component",
                  name: "AppointmentCalendar",
                  props: {
                    appointments: [
                      {
                        id: "appt-001",
                        patientId: "PT-1004",
                        chartId: "CHT-1004",
                        patient: {
                          firstName: "John",
                          lastName: "Doe",
                          condition: "N/A",
                        },
                        provider: {
                          providerId: "PRV-001",
                          firstName: "Megan",
                          lastName: "Wilson",
                          specialties: ["Aesthetics"],
                        },
                        startTime: "2025-05-13T12:30:00.000Z",
                        endTime: "2025-05-13T13:30:00.000Z",
                        status: "scheduled",
                        notes: "Microneedling session scheduled by assistant.",
                        type: "therapy",
                        notificationStatus: {
                          status: "pending",
                          sent: false,
                          type: "pre-care",
                        },
                      },
                    ],
                    initialView: "month",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  },
  // Add other mock data entries here, ensuring 'layout' is always an object
];
