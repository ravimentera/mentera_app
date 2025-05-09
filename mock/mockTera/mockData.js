// lib/mock/mockData.js
// Ensure this file is in a location accessible by your API route, e.g., "@/lib/mock/mockData.js"

export const mockData = [
  {
    query: "When was the last time this patient came in?",
    markdown: "The last treatment patient PT-1004 received was a HydraFacial on 2025-03-05.",
    layout: {
      // This one was already an object, which is good.
      type: "Layout",
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
      // Converted from string to direct object
      type: "Layout",
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
              ],
            },
            {
              type: "Row",
              components: [
                {
                  type: "Component",
                  name: "TreatmentNoteCard",
                  props: {
                    title: "Procedure Summary",
                    // Newlines in props' string values are fine in JS objects
                    content: "Procedure: HydraFacial\nAreas treated: Full Face",
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
                    title: "Pre-Care Instructions",
                    content:
                      "- Avoid sun exposure and tanning beds for at least one week before the procedure.\n- Avoid alcohol and caffeine for 24-48 hours before the procedure to reduce inflammation.",
                  },
                },
                {
                  type: "Component",
                  name: "TreatmentNoteCard",
                  props: {
                    title: "Post-Care Instructions",
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
  // Add other mock data entries here, ensuring 'layout' is always an object
];
