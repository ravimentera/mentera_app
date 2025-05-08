import { NextResponse } from "next/server";

export async function GET() {
  //   const layout = {
  //     type: "Layout",
  //     layout: [
  //       {
  //         type: "Grid",
  //         columns: 2,
  //         gap: 6, // Tailwind supports up to gap-96, so 24 -> 6
  //         rows: [
  //           {
  //             type: "Row",
  //             components: [
  //               {
  //                 type: "Component",
  //                 name: "UserHistoryCard",
  //                 props: {
  //                   data: {
  //                     lastVisitedOn: "2025-03-03",
  //                     lastConnectedEmail: "2025-03-03",
  //                     lastConnectedSMS: "2025-03-03",
  //                     createdOn: "2025-03-03",
  //                   },
  //                   userInitial: "R",
  //                 },
  //               },
  //               {
  //                 type: "Component",
  //                 name: "RecentDocumentsCard",
  //                 props: {
  //                   documents: [
  //                     {
  //                       title: "Treatment Consent Form",
  //                       signedOn: "Mar 1, 2025",
  //                     },
  //                   ],
  //                   onViewAllLink: "/documents",
  //                 },
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //     ],
  //   };

  // const layout = {
  //   "type": "Layout",
  //   "version": "1.0",
  //   "layout": [
  //     {
  //       "type": "Grid",
  //       "columns": 2,
  //       "gap": 24,
  //       "rows": [
  //         {
  //           "type": "Row",
  //           "components": [
  //             {
  //               "type": "Component",
  //               "name": "UserHistoryCard",
  //               "props": {
  //                 "data": {
  //                   "lastVisitedOn": "2025-03-03",
  //                   "lastConnectedEmail": "2025-03-03",
  //                   "lastConnectedSMS": "2025-03-03",
  //                   "createdOn": "2025-03-03"
  //                 },
  //                 "userInitial": "R"
  //               }
  //             },
  //             {
  //               "type": "Component",
  //               "name": "RecentDocumentsCard",
  //               "props": {
  //                 "documents": [
  //                   { "title": "Treatment Consent Form", "signedOn": "Mar 1, 2025" }
  //                 ],
  //                 "onViewAllLink": "/documents"
  //               }
  //             }
  //           ]
  //         },
  //         {
  //           "type": "Row",
  //           "components": [
  //             {
  //               "type": "Component",
  //               "name": "ActivePackagesCard",
  //               "props": {
  //                 "totalActive": 2,
  //                 "totalAvailable": 7,
  //                 "packages": [
  //                   { "name": "Botox Package", "completedSessions": 3, "totalSessions": 6, "color": "violet" },
  //                   { "name": "Facelift Package", "completedSessions": 3, "totalSessions": 8, "color": "rose" }
  //                 ],
  //                 "onViewAllLink": "/packages"
  //               }
  //             },
  //             {
  //               "type": "Component",
  //               "name": "CampaignsCard",
  //               "props": {
  //                 "campaigns": [
  //                   { "channel": "email", "title": "Last Email Campaign", "label": "Follow - Up" },
  //                   { "channel": "sms", "title": "SMS Last Campaign", "label": "New Year Offer" }
  //                 ],
  //                 "onViewAllLink": "/campaigns"
  //               }
  //             }
  //           ]
  //         },
  //         {
  //           "type": "Row",
  //           "components": [
  //             {
  //               "type": "Component",
  //               "name": "NextAppointmentCard",
  //               "props": {
  //                 "upcomingAppointment": {
  //                   "title": "Botox Treatment",
  //                   "time": "Tomorrow, 2:00 PM",
  //                   "doctor": "Dr. Sarah Wilson"
  //                 },
  //                 "futureAppointments": [
  //                   {
  //                     "title": "Lip Treatment",
  //                     "time": "2025-05-06, 2:00 PM",
  //                     "doctor": "Dr. Sarah Wilson"
  //                   }
  //                 ],
  //                 "onViewAllLink": "/appointments"
  //               }
  //             },
  //             {
  //               "type": "Component",
  //               "name": "MedicalSummaryCard",
  //               "props": {
  //                 "allergies": [
  //                   { "name": "Amfearmone", "reactions": "Fever" },
  //                   { "name": "Paracitamole", "reactions": "Breathing issue, Rashes" }
  //                 ],
  //                 "onEditLink": "/medical-summary/edit"
  //               }
  //             }
  //           ]
  //         }
  //       ]
  //     }
  //   ]
  // }

  const layout = {
    type: "Layout",
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
                name: "UserHistoryCard",
                props: {
                  data: {
                    lastVisitedOn: "2025-03-04",
                    lastConnectedEmail: "2025-03-04",
                    lastConnectedSMS: "2025-03-04",
                    createdOn: "2024-12-01",
                  },
                  userInitial: "P",
                },
              },
              {
                type: "Component",
                name: "NextAppointmentCard",
                props: {
                  upcomingAppointment: {
                    title: "HydraFacial Follow-up",
                    time: "2025-04-05, 10:00 AM",
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
                name: "MedicalSummaryCard",
                props: {
                  allergies: [
                    {
                      name: "None Reported",
                      reactions: "N/A",
                    },
                  ],
                  onEditLink: "/medical-summary/edit",
                },
              },
              {
                type: "Component",
                name: "RecentDocumentsCard",
                props: {
                  documents: [
                    {
                      title: "HydraFacial Consent Form",
                      signedOn: "2025-03-01",
                    },
                  ],
                  onViewAllLink: "/documents",
                },
              },
            ],
          },
          {
            type: "Row",
            components: [
              {
                type: "Component",
                name: "ActivePackagesCard",
                props: {
                  totalActive: 1,
                  totalAvailable: 3,
                  packages: [
                    {
                      name: "HydraFacial Monthly Plan",
                      completedSessions: 1,
                      totalSessions: 3,
                      color: "violet",
                    },
                  ],
                  onViewAllLink: "/packages",
                },
              },
              {
                type: "Component",
                name: "CampaignsCard",
                props: {
                  campaigns: [
                    {
                      channel: "email",
                      title: "HydraFacial Booster Promo",
                      label: "LED Light Therapy Suggestion",
                    },
                    {
                      channel: "sms",
                      title: "Reminder for Monthly Session",
                      label: "Lymphatic Add-on Offer",
                    },
                  ],
                  onViewAllLink: "/campaigns",
                },
              },
            ],
          },
        ],
      },
    ],
  };
  return NextResponse.json(layout);
}
