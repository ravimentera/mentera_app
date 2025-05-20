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
      "Sure! I’ve scheduled an appointment for patient PT-1004 on 13 May 2025 at 12:30 PM to 1:30 PM for Microneedling. Let me know if you’d like to make any changes or add notes for the provider.",
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
                          firstName: "Emily",
                          lastName: "Johnson",
                          condition: "N/A",
                        },
                        provider: {
                          providerId: "PRV-001",
                          firstName: "Megan",
                          lastName: "Wilson",
                          specialties: ["Aesthetics"],
                        },
                        startTime: "2025-05-13T06:30:00.000Z",
                        endTime: "2025-05-13T07:30:00.000Z",
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
  // ✅ Patient Conversation
  {
    query: "Can you summarize my last chat with patient Emily Johnson?",
    markdown:
      "Emily Johnson's last conversation included a post-treatment check-in where she reported improved skin texture and glow after her HydraFacial. No concerns were raised.",
    layout: {
      type: "Layout",
      title: "Patient Conversation Summary",
      layout: [
        {
          type: "Grid",
          columns: 2,
          gap: 24,
          rows: [
            {
              type: "Row",
              components: [
                {
                  type: "Component",
                  name: "ObservationCard",
                  props: {
                    notes:
                      "Emily Johnson reported improved skin texture and glow after her HydraFacial. No concerns were raised during the post-treatment check-in.",
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
    query: "What concerns did Emily bring up in his last visit?",

    markdown:
      "Emily mentioned recurring dryness on his cheeks and asked about options for skin hydration and anti-aging during his last consultation.",
    layout: {
      type: "Layout",
      title: "Patient Concerns",
      layout: [
        {
          type: "Grid",
          columns: 2,
          gap: 24,
          rows: [
            {
              type: "Row",
              components: [
                {
                  type: "Component",
                  name: "ObservationCard",
                  props: {
                    notes:
                      "Emily mentioned recurring dryness on his cheeks and asked about options for skin hydration and anti-aging during his last consultation.",
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
    query: "Did this patient ask any skincare questions in the past?",
    markdown:
      "Yes, the patient asked about microneedling benefits, pre- and post-care instructions, and whether it would help reduce fine lines and discoloration.",
    layout: {
      type: "Layout",
      title: "Skinare Questions",
      layout: [
        {
          type: "Grid",
          columns: 2,
          gap: 24,
          rows: [
            {
              type: "Row",
              components: [
                {
                  type: "Component",
                  name: "TreatmentNoteCard",
                  props: {
                    title: "Skincare Questions",
                    content:
                      "The patient asked about microneedling benefits, pre- and post-care instructions, and whether it would help reduce fine lines and discoloration.",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  },

  // 🗓 Scheduling Appointments

  {
    query: "Can you book a Botox appointment for Sarah next Friday?",
    markdown:
      "A Botox appointment has been booked for Sarah on Friday, 2025-05-23, at 3:00 PM with Dr. Emily.",
    layout: {
      type: "Layout",
      title: "Botox Appointment for Sarah",
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
                        id: "appt-002",
                        patientId: "PT-1023",
                        chartId: "CHT-1023",
                        patient: {
                          firstName: "Sarah",
                          lastName: "",
                          condition: "N/A",
                        },
                        provider: {
                          providerId: "PRV-009",
                          firstName: "Emily",
                          lastName: "",
                          specialties: ["Injectables"],
                        },
                        startTime: "2025-05-23T08:00:00.000Z",
                        endTime: "2025-05-23T09:00:00.000Z",
                        status: "scheduled",
                        notes: "Botox appointment auto-scheduled from chat intent.",
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
  {
    query: "Show me available slots for provider Jenny this week.",
    markdown:
      "Provider Jenny has the following available slots this week:\n- Tuesday at 10:00 AM\n- Wednesday at 2:30 PM\n- Friday at 4:00 PM\n\n I have scheduled it for Firday 4:00 PM, 2025-05-23",
    layout: {
      type: "Layout",
      title: "Scheduled Botox with Jenny",
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
                        id: "appt-003",
                        patientId: "PT-1090",
                        chartId: "CHT-1090",
                        patient: {
                          firstName: "Jenny",
                          lastName: "",
                          condition: "N/A",
                        },
                        provider: {
                          providerId: "PRV-010",
                          firstName: "Jenny",
                          lastName: "",
                          specialties: ["Botox"],
                        },
                        startTime: "2025-05-23T10:30:00.000Z",
                        endTime: "2025-05-23T11:30:00.000Z",
                        status: "scheduled",
                        notes:
                          "Auto-booked from assistant response for available Friday 4:00 PM PST slot.",
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
  {
    query: "Move Lisa’s appointment from 3 PM to a later time on the same day.",
    markdown:
      "Lisa’s appointment has been successfully rescheduled from 3:00 PM to 5:30 PM on the 2025-05-21.",
    layout: {
      type: "Layout",
      title: "Updated Appointment for Lisa",
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
                        id: "appt-004",
                        patientId: "PT-1015",
                        chartId: "CHT-1015",
                        patient: {
                          firstName: "Lisa",
                          lastName: "",
                          condition: "N/A",
                        },
                        provider: {
                          providerId: "PRV-007",
                          firstName: "Dr.",
                          lastName: "Stone",
                          specialties: ["Consultation"],
                        },
                        startTime: "2025-05-21T09:30:00.000Z",
                        endTime: "2025-05-22T10:30:00.000Z",
                        status: "scheduled",
                        notes: "Rescheduled from 3:00 PM to 5:30 PM by assistant.",
                        type: "consultation",
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
  {
    query: "Recommend the earliest available slot for a microneedling session with Erica.",
    markdown:
      "The earliest available microneedling session with Erica is on Monday, 2025-05-24, at 11:00 AM.",
    layout: {
      type: "Layout",
      title: "Botox Appointment for Sarah",
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
                        id: "appt-002",
                        patientId: "PT-1023",
                        chartId: "CHT-1023",
                        patient: {
                          firstName: "Erica",
                          lastName: "",
                          condition: "N/A",
                        },
                        provider: {
                          providerId: "PRV-009",
                          firstName: "Emily",
                          lastName: "",
                          specialties: ["Aesthetics"],
                        },
                        startTime: "2025-05-24T05:30:00.000Z",
                        endTime: "2025-05-24T06:30:00.000Z",
                        status: "scheduled",
                        notes: "Microneedling appointment auto-scheduled from chat intent.",
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

  // 📩 Communication (SMS/Email/Marketing)

  {
    query: "Generate a follow-up SMS for PT-1004 3 days post filler",
    markdown:
      "Hi Emiley, this is Nurse Kelly checking in 😊 How are you feeling after your filler treatment on Tuesday? If you have any swelling or questions, I’m here for you. Can’t wait to see your results!",
    layout: {
      type: "Layout",
      title: "Follow-up Message",
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
                  name: "ApprovalsContainer",
                  props: {
                    cards: [
                      {
                        id: "1",
                        appointmentId: "12345",
                        patientName: "Emiley",
                        patientId: "PT-1004",
                        isVip: false,
                        time: "Today, 12:00 PM",
                        subject: "Follow-up after filler treatment",
                        message:
                          "Hi Emiley, this is Nurse Kelly checking in 😊 How are you feeling after your filler treatment on Tuesday? If you have any swelling or questions, I’m here for you. Can’t wait to see your results!",
                        originalMessage:
                          "Hi Emiley, this is Nurse Kelly checking in 😊 How are you feeling after your filler treatment on Tuesday? If you have any swelling or questions, I’m here for you. Can’t wait to see your results!",
                        notificationType: "post-care",
                      },
                    ],
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
    query: "Create a pre-care email for PT-1004 PRP session",
    markdown:
      "Subject: Get Ready for Your PRP Treatment – A Note from Nurse Kelly\n\nHi Emiley,\n\nWe’re excited to see you for your PRP session this Thursday! Before your visit, please:\n- Avoid NSAIDs (like ibuprofen) and alcohol for 48 hours\n- Stay well hydrated\n- Limit sun exposure\n\nIf you have questions or need to reschedule, just reply here. You’re in great hands!\n\nWarmly,\nNurse Kelly",
    layout: {
      type: "Layout",
      title: "Pre-Care Email – PRP Session with Nurse Kelly",
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
                  name: "ApprovalsContainer",
                  props: {
                    cards: [
                      {
                        id: "prp-precare-2025-05-21-emiley",
                        appointmentId: "apt-2025-05-21-emiley-prp",
                        patientName: "Emiley",
                        patientId: "PT-1004",
                        isVip: false,
                        time: "2025-05-20T09:00:00.000Z",
                        subject: "Get Ready for Your PRP Treatment – A Note from Nurse Kelly",
                        message:
                          "Hi Emiley,\n\nWe’re excited to see you for your PRP session this Thursday! Before your visit, please:\n- Avoid NSAIDs (like ibuprofen) and alcohol for 48 hours\n- Stay well hydrated\n- Limit sun exposure\n\nIf you have questions or need to reschedule, just reply here. You’re in great hands!\n\nWarmly,\nNurse Kelly",
                        originalMessage:
                          "Hi Emiley,\n\nWe’re excited to see you for your PRP session this Thursday! Before your visit, please:\n- Avoid NSAIDs (like ibuprofen) and alcohol for 48 hours\n- Stay well hydrated\n- Limit sun exposure\n\nIf you have questions or need to reschedule, just reply here. You’re in great hands!\n\nWarmly,\nNurse Kelly",
                        notificationType: "pre-care",
                        aiGeneratedMessage:
                          "PRP pre-care from Nurse Kelly: Avoid NSAIDs & alcohol, stay hydrated, and protect from sun. See you soon!",
                        messageVariant: 2,
                        showTeraCompose: false,
                      },
                    ],
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
    query: "Write a spring skincare promo email for PT-1004",
    markdown:
      "Subject: Spring Glow-Up with Nurse Kelly 🌸\n\nHi Emiley,\n\nSpring is the perfect time to refresh your glow! We're offering **20% off** all facials, microneedling, and PRP treatments through the end of the month.\n\nI’d love to help you choose the best option for your skin goals—just reply and we can book a time that works for you.\n\nLet’s get glowing!\n\n— Nurse Kelly & Your MedSpa Team",
    layout: {
      type: "Layout",
      title: "Spring Promo Email – Personal Note from Nurse Kelly",
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
                  name: "ApprovalsContainer",
                  props: {
                    cards: [
                      {
                        id: "promo-2025-05-21-spring-sale-emiley",
                        appointmentId: "promo-2025-05-21-spring-sale",
                        patientName: "Emiley",
                        patientId: "PT-1004",
                        isVip: false,
                        time: "2025-05-21T08:00:00.000Z",
                        subject: "Spring Glow-Up with Nurse Kelly 🌸",
                        message:
                          "Hi Emiley,\n\nSpring is the perfect time to refresh your glow! We're offering **20% off** all facials, microneedling, and PRP treatments through the end of the month.\n\nI’d love to help you choose the best option for your skin goals—just reply and we can book a time that works for you.\n\nLet’s get glowing!\n\n— Nurse Kelly & Your MedSpa Team",
                        originalMessage:
                          "Hi Emiley,\n\nSpring is the perfect time to refresh your glow! We're offering **20% off** all facials, microneedling, and PRP treatments through the end of the month.\n\nI’d love to help you choose the best option for your skin goals—just reply and we can book a time that works for you.\n\nLet’s get glowing!\n\n— Nurse Kelly & Your MedSpa Team",
                        notificationType: "pre-care",
                        aiGeneratedMessage:
                          "Spring Special: 20% off treatments. Nurse Kelly can help pick the best option for your skin!",
                        messageVariant: 3,
                        showTeraCompose: false,
                      },
                    ],
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
    query: "Send a thankyou SMS for PT-1004 after today’s visit",
    markdown:
      "Hi Emiley, it was such a pleasure seeing you today! I hope you’re loving how your skin feels already. If anything comes up or you just want to check in, feel free to text me. Warm regards, Nurse Kelly 💖",
    layout: {
      type: "Layout",
      title: "Thank You SMS from Nurse Kelly – Post Appointment",
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
                  name: "ApprovalsContainer",
                  props: {
                    cards: [
                      {
                        id: "thankyou-2025-05-21-emiley",
                        appointmentId: "thankyou-2025-05-21",
                        patientName: "Emiley",
                        patientId: "PT-1004",
                        isVip: false,
                        time: "2025-05-21T17:00:00.000Z",
                        subject: "Thank You for Visiting – A Note from Nurse Kelly",
                        message:
                          "Hi Emiley, it was such a pleasure seeing you today! I hope you’re loving how your skin feels already. If anything comes up or you just want to check in, feel free to text me. Warm regards, Nurse Kelly 💖",
                        originalMessage:
                          "Hi Emiley, it was such a pleasure seeing you today! I hope you’re loving how your skin feels already. If anything comes up or you just want to check in, feel free to text me. Warm regards, Nurse Kelly 💖",
                        notificationType: "post-care",
                        aiGeneratedMessage:
                          "Nurse Kelly's thank you: 'Hope your skin is glowing already! I'm just a text away if needed 💖'",
                        messageVariant: 4,
                        showTeraCompose: false,
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  },

  // 👩‍⚕️ Provider Conversations / Expertise

  {
    query: "What treatments does Dr. Emily specialize in?",
    markdown:
      "Dr. Emily specializes in Botox, Dermal Fillers, and PRP Microneedling treatments. She is known for her natural aesthetic approach and patient-centered care.",
  },
  {
    query: "Can you summarize provider Monica’s training for new nurses?",
    markdown:
      "Provider Monica conducts training in safe injectable practices, skincare consultation, microneedling technique, and post-treatment care protocols for new nurses.",
  },
  {
    query: "What’s the protocol for a chemical peel according to provider Natalie?",
    markdown:
      "According to provider Natalie, the chemical peel protocol includes pre-treatment skin priming for 1 week, application of the peel under supervision, and post-care involving hydration, sun protection, and follow-up assessment at 1 week.",
  },

  // Add other mock data entries here, ensuring 'layout' is always an object
];
