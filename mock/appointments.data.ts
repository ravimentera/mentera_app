import { addDays, addHours, setHours, setMinutes, subDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { patients } from "./patients.data";

// Helper function to create a date in PDT
const createPDTDate = (date: Date, hours: number, minutes = 0) => {
  // First set the hours/minutes in the local date
  const localDate = setMinutes(setHours(new Date(date), hours), minutes);

  // Convert the local date to PDT timezone
  return toZonedTime(localDate, "America/Los_Angeles");
};

// Helper function to generate notification message with more personalization and variety
const generateNotificationMessage = (
  type: "pre" | "post" | "marketing",
  appointment: AppointmentMock,
): string => {
  const { patient, provider, treatmentNotes } = appointment;
  const now = new Date();
  const time = appointment.startTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  // Calculate days since treatment (for post-care) or days until appointment (for pre-care)
  const daysDiff = Math.floor(
    (now.getTime() - appointment.startTime.getTime()) / (1000 * 60 * 60 * 24),
  );
  const daysSinceOrUntil = Math.abs(daysDiff);

  // Generate a treatment-specific tip based on the procedure
  const getTreatmentTip = () => {
    switch (treatmentNotes.procedure) {
      case "Botox":
        return "Remember to stay upright for 4 hours and avoid touching the treated areas.";
      case "Juvederm":
        return "Apply ice for 10 minutes each hour to reduce swelling, and avoid excessive heat.";
      case "Laser Hair Removal":
        return "Use SPF 30+ on treated areas and avoid sun exposure for at least a week.";
      case "HydraFacial":
        return "Your skin may be more sensitive to products, so avoid exfoliants for 2-3 days.";
      case "CoolSculpting":
        return "Gentle massage of the treated area can help reduce tenderness and improve results.";
      case "Microneedling":
        return "Keep your skin hydrated and avoid makeup for 24 hours post-treatment.";
      case "Chemical Peel":
        return "Peeling usually begins 2-3 days after treatment. Let it happen naturally, don't pick!";
      case "IPL Photofacial":
        return "Dark spots may appear darker initially - this is normal and part of the healing process.";
      default:
        return "Follow your personalized aftercare instructions for best results.";
    }
  };

  // Get follow-up timeframe based on procedure
  const getFollowUpTimeframe = () => {
    switch (treatmentNotes.procedure) {
      case "Botox":
        return "3-4 months";
      case "Juvederm":
        return "6-12 months";
      case "Laser Hair Removal":
        return "4-6 weeks";
      case "HydraFacial":
        return "4 weeks";
      case "CoolSculpting":
        return "8-12 weeks";
      case "Microneedling":
        return "4-6 weeks";
      case "Chemical Peel":
        return "4-6 weeks";
      case "IPL Photofacial":
        return "3-4 weeks";
      default:
        return "a few weeks";
    }
  };

  if (type === "pre") {
    // Pre-appointment templates with treatment-specific details
    const preTemplates = [
      `Hi ${patient.firstName}! Looking forward to seeing you for your ${treatmentNotes.procedure} appointment tomorrow at ${time}. ${getTreatmentTip()} See you soon!`,

      `Hey ${patient.firstName}! Just a quick reminder—your Botox appointment is tomorrow at ${time}. Can you come in 15 minutes early for a little paperwork? Let us know if you have any questions. Can’t wait to see you!`,

      `Hello ${patient.firstName}! Just confirming your ${treatmentNotes.procedure} treatment for tomorrow at ${time}. ${
        treatmentNotes.procedure === "Botox" || treatmentNotes.procedure === "Juvederm"
          ? "Remember to avoid alcohol and blood thinners 24hrs before your visit."
          : "Please come with clean skin, no makeup or lotions in the treatment area."
      }`,

      `${patient.firstName}! We're all set for your ${treatmentNotes.procedure} tomorrow at ${time}. ${
        treatmentNotes.procedure === "Chemical Peel" || treatmentNotes.procedure === "Microneedling"
          ? "Wear sunscreen and a hat when you leave our office."
          : "Wear comfortable clothing to your appointment."
      } See you then!`,

      `Reminder, ${patient.firstName}: Your ${treatmentNotes.procedure} appointment is confirmed for tomorrow at ${time}. ${
        treatmentNotes.procedure === "HydraFacial"
          ? "Stay hydrated before your treatment for best results!"
          : "We recommend having a light meal before your visit."
      }`,
    ];

    // Select a template based on patient ID for consistency
    const templateIndex =
      Number.parseInt(appointment.patientId.replace(/\D/g, "")) % preTemplates.length;
    return preTemplates[templateIndex];
  }

  if (type === "post") {
    // Post-appointment templates with time-appropriate phrasing and treatment-specific details
    const postTemplates = [
      // Recent appointment (0-1 days ago)
      daysSinceOrUntil <= 1
        ? `Hope you're feeling great after your ${treatmentNotes.procedure} today, ${patient.firstName}! ${getTreatmentTip()} If you have any questions, I'm here for you!`
        : `Hope you've been enjoying the results of your ${treatmentNotes.procedure}, ${patient.firstName}! ${getTreatmentTip()} Let me know if you have any questions.`,

      // Recent appointment (0-1 days ago)
      daysSinceOrUntil <= 1
        ? `${patient.firstName}, thank you for coming in today! ${treatmentNotes.observations} Remember to ${
            treatmentNotes.procedure === "Botox"
              ? "avoid exercise for 24 hours"
              : treatmentNotes.procedure === "Juvederm"
                ? "use ice as needed for any swelling"
                : "follow your aftercare instructions"
          }.`
        : `${patient.firstName}, how are you feeling since your ${treatmentNotes.procedure} treatment? ${treatmentNotes.observations} Your next treatment would be ideal in about ${getFollowUpTimeframe()}.`,

      // For any time frame
      `${patient.firstName}, I wanted to check in on your ${treatmentNotes.procedure} results! ${
        daysSinceOrUntil <= 3
          ? "The full effects will continue to develop over the next few days."
          : "I hope you're loving the results so far."
      } ${treatmentNotes.providerRecommendations}`,

      // For any time frame
      `How's everything going with your ${treatmentNotes.procedure} treatment, ${patient.firstName}? ${
        daysSinceOrUntil <= 2
          ? "Some patients experience mild sensitivity for 24-48 hours, which is completely normal."
          : "By now, you should be seeing the positive effects of your treatment."
      } We'd love to have you back in about ${getFollowUpTimeframe()} for your next session.`,

      // For any time frame
      `${patient.firstName}, just checking in after your ${treatmentNotes.procedure}! ${
        treatmentNotes.observations.split(".")[0]
      }. ${
        daysSinceOrUntil <= 1
          ? "Remember, proper aftercare is essential for optimal results."
          : "I hope you're continuing to follow the aftercare instructions for best results."
      }`,
    ];

    // Select a template based on patient ID and day difference for variety
    const templateIndex =
      (Number.parseInt(appointment.patientId.replace(/\D/g, "")) + daysDiff) % postTemplates.length;
    return postTemplates[templateIndex];
  }

  if (type === "marketing") {
    // Marketing message templates with treatment-specific offers
    const marketingTemplates = [
      `Hey ${patient.firstName}! We have some exciting new ${treatmentNotes.procedure} packages available. Would you like to hear more about our seasonal specials?`,

      `${patient.firstName}, we miss you! It's been a while since your last ${treatmentNotes.procedure} treatment. We're offering 15% off for returning clients this month. Want to book?`,

      `Special offer just for you, ${patient.firstName}! Book your next ${treatmentNotes.procedure} treatment and get a complimentary hydrating mask. Limited time offer!`,

      `${patient.firstName}, thinking about your next ${treatmentNotes.procedure}? We've just introduced new technology that enhances results with less downtime! Want to learn more?`,

      `${patient.firstName}! We've had clients asking about combining ${treatmentNotes.procedure} with our new ${
        treatmentNotes.procedure === "Botox"
          ? "collagen-boosting facial"
          : treatmentNotes.procedure === "HydraFacial"
            ? "LED light therapy"
            : treatmentNotes.procedure === "Chemical Peel"
              ? "custom mask treatment"
              : "premium skincare regimen"
      }. Interested in a consultation?`,
    ];

    // Select a template based on patient ID for consistency
    const templateIndex =
      Number.parseInt(appointment.patientId.replace(/\D/g, "")) % marketingTemplates.length;
    return marketingTemplates[templateIndex];
  }

  return "";
};

// Get today's date at midnight
const today = new Date();
today.setHours(0, 0, 0, 0);

// Generate 3 weeks of appointments (1 week before, current week, 1 week after)
const startDate = subDays(today, 7);

// Add today's date with specific pending notifications
const createTodayAppointmentsPendingApproval = () => {
  const appointments: AppointmentMock[] = [];
  const todayDate = new Date();

  // Create 3 pending approval appointments for today
  for (let i = 0; i < 3; i++) {
    const patientIdx = i % patients.length;
    const patient = patients[patientIdx];
    const patientName = getRandomPatientName(i);

    // Create appointment times
    const startHour = 10 + i * 2; // 10am, 12pm, 2pm
    const startTime = createPDTDate(todayDate, startHour);
    const endTime = addHours(startTime, 1);

    const appointment: AppointmentMock = {
      id: `today-approval-${i}`,
      patientId: patient.patientId,
      chartId: patient.chartId,
      patient: {
        firstName: patientName.firstName,
        lastName: patientName.lastName,
      },
      provider: {
        providerId: `PROV-${i}`,
        firstName: patient.provider.split(" ")[0],
        lastName: patient.provider.split(" ")[1],
        specialties: [patient.providerSpecialty],
      },
      startTime,
      endTime,
      // status: "scheduled",
      status: (["scheduled", "completed", "cancelled", "pending"] as const)[
        Math.floor(Math.random() * 4)
      ],
      type: getAppointmentType(patient.treatmentNotes.procedure),
      notes: patient.treatmentNotes.observations,
      treatmentNotes: patient.treatmentNotes,
      notificationStatus: {
        status: "pending" as const,
        sent: false,
        message: generateNotificationMessage("pre", {
          id: `today-approval-${i}`,
          patientId: patient.patientId,
          chartId: patient.chartId,
          patient: {
            firstName: patientName.firstName,
            lastName: patientName.lastName,
          },
          provider: {
            providerId: `PROV-${i}`,
            firstName: patient.provider.split(" ")[0],
            lastName: patient.provider.split(" ")[1],
            specialties: [patient.providerSpecialty],
          },
          startTime,
          endTime,
          status: "scheduled",
          type: getAppointmentType(patient.treatmentNotes.procedure),
          notes: patient.treatmentNotes.observations,
          treatmentNotes: patient.treatmentNotes,
        } as AppointmentMock),
        type: "pre-care" as const,
      },
    };

    // Add chat history to the third appointment
    if (i === 2) {
      const procedure = patient.treatmentNotes.procedure;
      const patientName = appointment.patient.firstName;
      // Create a timestamp for the conversation starting 3 days ago
      const conversationStart = new Date();
      conversationStart.setDate(conversationStart.getDate() - 3);

      appointment.chatHistory = [
        {
          id: "1",
          text: `Hi ${patientName}, I noticed you've scheduled a ${procedure} treatment. Is there anything specific you'd like to address during the session?`,
          sender: "provider",
          timestamp: new Date(conversationStart.getTime() + 3600000),
          isOutbound: false,
        },
        {
          id: "2",
          text: `Yes, I'm mainly concerned about the results from my last treatment. I didn't get the results I expected.`,
          sender: "patient",
          timestamp: new Date(conversationStart.getTime() + 4000000),
          isOutbound: true,
        },
        {
          id: "3",
          text: `I understand your concerns. I've looked at your record from the previous session. We'll definitely focus on improving upon your previous treatment results.`,
          sender: "provider",
          timestamp: new Date(conversationStart.getTime() + 4500000),
          isOutbound: false,
        },
      ];
    }

    appointments.push(appointment);
  }

  return appointments;
};

// Helper function to map procedure to appointment type
const getAppointmentType = (procedure: string): AppointmentMock["type"] => {
  const procedureMap: Record<string, AppointmentMock["type"]> = {
    Botox: "therapy",
    Juvederm: "therapy",
    "Laser Hair Removal": "therapy",
    HydraFacial: "therapy",
    CoolSculpting: "therapy",
    Microneedling: "therapy",
    "Chemical Peel": "therapy",
    "IPL Photofacial": "therapy",
    Kybella: "therapy",
    "RF Skin Tightening": "therapy",
    Dermaplaning: "therapy",
    "PRP Hair Restoration": "therapy",
    "LED Light Therapy": "therapy",
    Microblading: "therapy",
    "Body Contouring": "therapy",
  };

  // If it's a first visit or assessment, make it a consultation
  if (
    procedure.toLowerCase().includes("session 1") ||
    procedure.toLowerCase().includes("assessment")
  ) {
    return "consultation";
  }

  // If it's a follow-up session or check-up, make it a followup
  if (procedure.toLowerCase().includes("session") || procedure.toLowerCase().includes("check")) {
    return "followup";
  }

  return procedureMap[procedure] || "general";
};

// Helper function to create time slots for a day
const createTimeSlots = (date: Date) => {
  const morningSlots = [
    { start: 9, duration: 1 },
    { start: 10, duration: 2 },
    { start: 11, duration: 1 },
  ];

  const afternoonSlots = [
    { start: 13, duration: 1 },
    { start: 14, duration: 2 },
    { start: 15, duration: 1 },
  ];

  const eveningSlots = [
    { start: 16, duration: 2 },
    { start: 17, duration: 1 },
    { start: 18, duration: 1 },
  ];

  // Randomly select slots from each period
  const selectedSlots = [
    morningSlots[Math.floor(Math.random() * morningSlots.length)],
    afternoonSlots[Math.floor(Math.random() * afternoonSlots.length)],
    eveningSlots[Math.floor(Math.random() * eveningSlots.length)],
  ];

  // Add some randomization to start times (within 30 mins)
  return selectedSlots.map((slot) => ({
    start: slot.start + Math.random() * 0.5, // Add up to 30 mins
    duration: slot.duration,
  }));
};

// Define a set of patient first names and last names to generate random patient names
const patientFirstNames = [
  "Emma",
  "Noah",
  "Olivia",
  "Liam",
  "Ava",
  "Sophia",
  "Jackson",
  "Isabella",
  "Lucas",
  "Mia",
  "Ethan",
  "Harper",
  "Aiden",
  "Amelia",
  "Caden",
  "Abigail",
  "Grayson",
  "Emily",
  "Mason",
  "Charlotte",
];

const patientLastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Jones",
  "Brown",
  "Davis",
  "Miller",
  "Wilson",
  "Moore",
  "Taylor",
  "Anderson",
  "Thomas",
  "Jackson",
  "White",
  "Harris",
  "Martin",
  "Thompson",
  "Garcia",
  "Martinez",
  "Robinson",
];

// Helper function to generate a random patient name
const getRandomPatientName = (index: number) => {
  const firstName = patientFirstNames[index % patientFirstNames.length];
  const lastName =
    patientLastNames[Math.floor(index / patientFirstNames.length) % patientLastNames.length];
  return { firstName, lastName };
};

// Helper function to create appointment slots for a day
const createDayAppointments = (date: Date, patientIndex: number): AppointmentMock[] => {
  const appointments: AppointmentMock[] = [];
  const timeSlots = createTimeSlots(date);
  // Number of appointments should not exceed available time slots
  const numAppointments = Math.min(Math.floor(Math.random() * 2) + 3, timeSlots.length);

  // Reference to current date for determining past vs. future appointments
  const now = new Date();

  for (let i = 0; i < numAppointments; i++) {
    const slot = timeSlots[i];
    if (!slot) continue; // Skip if no slot available

    const patientIdx = (patientIndex + i) % patients.length;
    const patient = patients[patientIdx];
    const patientName = getRandomPatientName(patientIndex + i);

    // Round the start time to nearest 15 minutes for more realistic scheduling
    const roundedStart = Math.round(slot.start * 4) / 4;
    const startTime = createPDTDate(date, roundedStart);
    const endTime = addHours(startTime, slot.duration);

    // Determine if this is a past appointment
    const isPastAppointment = startTime < now;

    // Set appropriate message type and status based on appointment time
    const messageType = isPastAppointment ? "post-care" : "pre-care";
    const messageTemplate = isPastAppointment ? "post" : "pre";
    const status = isPastAppointment ? "completed" : "scheduled";

    const appointment: AppointmentMock = {
      id: `apt-${date.getTime()}-${i}`,
      patientId: patient.patientId, // Use exact patient ID from patients data
      chartId: patient.chartId, // Use exact chart ID from patients data
      patient: {
        firstName: patientName.firstName,
        lastName: patientName.lastName,
      },
      provider: {
        providerId: `PROV-${i}`,
        firstName: patient.provider.split(" ")[0],
        lastName: patient.provider.split(" ")[1],
        specialties: [patient.providerSpecialty],
      },
      startTime,
      endTime,
      status: status as "scheduled" | "completed",
      type: getAppointmentType(patient.treatmentNotes.procedure),
      notes: patient.treatmentNotes.observations,
      treatmentNotes: patient.treatmentNotes,
      notificationStatus: {
        status: "pending" as const,
        sent: false,
        message: "",
        type: messageType as "pre-care" | "post-care",
      },
    };

    // Generate notification message after appointment object is created
    if (appointment.notificationStatus) {
      appointment.notificationStatus.message = generateNotificationMessage(
        messageTemplate,
        appointment,
      );
    }

    // Add chat history to the third appointment of each day (index 2)
    if (i === 2) {
      const procedure = patient.treatmentNotes.procedure;
      const patientName = appointment.patient.firstName;
      // Create a timestamp for the conversation starting 3 days ago
      const conversationStart = new Date();
      conversationStart.setDate(conversationStart.getDate() - 3);

      console.log(`Adding chat history to appointment ${appointment.id} (day index ${i})`);

      appointment.chatHistory = [
        {
          id: "1",
          text: `Hi ${patientName}, I noticed you've scheduled a ${procedure} treatment. Is there anything specific you'd like to address during the session?`,
          sender: "provider",
          timestamp: new Date(conversationStart.getTime() + 3600000), // 1 hour after start
          isOutbound: false,
        },
        {
          id: "2",
          text: `Yes, I'm mainly concerned about the ${
            procedure === "Botox"
              ? "fine lines around my eyes"
              : procedure === "HydraFacial"
                ? "dryness in my T-zone"
                : procedure === "Chemical Peel"
                  ? "dark spots on my cheeks"
                  : procedure === "Laser Hair Removal"
                    ? "persistent hair growth"
                    : "results from my last treatment"
          }. I didn't get the results I expected last time.`,
          sender: "patient",
          timestamp: new Date(conversationStart.getTime() + 4000000), // A bit later
          isOutbound: true,
        },
        {
          id: "3",
          text: `I understand your concerns. I've looked at your record from the previous ${procedure} session. We'll definitely focus on ${
            procedure === "Botox"
              ? "those areas around the eyes with a more tailored approach"
              : procedure === "HydraFacial"
                ? "enhanced hydration for your T-zone with additional serums"
                : procedure === "Chemical Peel"
                  ? "a slightly stronger formula to target those dark spots"
                  : procedure === "Laser Hair Removal"
                    ? "adjusting the settings for more effective reduction"
                    : "improving upon your previous treatment results"
          }.`,
          sender: "provider",
          timestamp: new Date(conversationStart.getTime() + 4500000),
          isOutbound: false,
        },
        {
          id: "4",
          text: "That sounds great! I've also been wondering if there are any pre-treatment recommendations I should follow?",
          sender: "patient",
          timestamp: new Date(conversationStart.getTime() + 86400000), // Next day
          isOutbound: true,
        },
        {
          id: "5",
          text: `Absolutely! For ${procedure}, I recommend ${
            procedure === "Botox"
              ? "avoiding blood thinners like aspirin and alcohol for 24 hours before treatment"
              : procedure === "HydraFacial"
                ? "staying well-hydrated and avoiding exfoliation for 48 hours prior"
                : procedure === "Chemical Peel"
                  ? "discontinuing retinol products for 5-7 days before your appointment"
                  : procedure === "Laser Hair Removal"
                    ? "shaving the area 24 hours before and avoiding sun exposure"
                    : "following the standard preparation instructions we discussed previously"
          }. This will help optimize your results.`,
          sender: "provider",
          timestamp: new Date(conversationStart.getTime() + 90000000),
          isOutbound: false,
        },
        {
          id: "6",
          text: "Perfect, thank you! One last question - how long should I expect the results to last?",
          sender: "patient",
          timestamp: new Date(conversationStart.getTime() + 172800000), // 2 days later
          isOutbound: true,
        },
        {
          id: "7",
          text: `With ${procedure}, most patients see results lasting ${
            procedure === "Botox"
              ? "3-4 months"
              : procedure === "HydraFacial"
                ? "4-6 weeks, with cumulative benefits from regular treatments"
                : procedure === "Chemical Peel"
                  ? "several months, especially with proper skincare maintenance"
                  : procedure === "Laser Hair Removal"
                    ? "permanently after a full series of 6-8 treatments"
                    : "for the expected duration based on the treatment type"
          }. Remember that factors like skincare routine, sun exposure, and lifestyle can affect longevity. We can discuss a maintenance plan during your appointment.`,
          sender: "provider",
          timestamp: new Date(conversationStart.getTime() + 176400000),
          isOutbound: false,
        },
        {
          id: "8",
          text: "Thanks so much for all the information! I'm looking forward to my appointment.",
          sender: "patient",
          timestamp: new Date(conversationStart.getTime() + 180000000),
          isOutbound: true,
        },
      ];
    }

    appointments.push(appointment);
  }

  return appointments;
};

// Generate appointments for 3 weeks
let mockAppointments: AppointmentMock[] = [];
let patientIndex = 0;

for (let i = 0; i < 21; i++) {
  const currentDate = addDays(startDate, i);
  // Skip weekends for regular generation
  if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
    const dayAppointments = createDayAppointments(currentDate, patientIndex);
    mockAppointments.push(...dayAppointments);
    patientIndex += dayAppointments.length;
  }
}

// Add today's date with specific pending notifications
const todayAppointmentsPendingApproval = createTodayAppointmentsPendingApproval();
mockAppointments.push(...todayAppointmentsPendingApproval);
patientIndex += todayAppointmentsPendingApproval.length;

// Add specific appointments for coming weekend
// Helper function to create weekend appointments with specified times
const createWeekendAppointments = (
  date: Date,
  startHours: number[],
  patientStartIndex: number,
): AppointmentMock[] => {
  const appointments: AppointmentMock[] = [];

  for (let i = 0; i < startHours.length; i++) {
    const patientIdx = (patientStartIndex + i) % patients.length;
    const patient = patients[patientIdx];
    const patientName = getRandomPatientName(patientStartIndex + i);

    const startTime = createPDTDate(date, startHours[i]);
    const endTime = addHours(startTime, 1); // 1 hour appointments for weekends

    // Determine if this is a past appointment
    const now = new Date();
    const isPastAppointment = startTime < now;

    // Set appropriate message type and status based on appointment time
    const messageType = isPastAppointment ? "post-care" : "pre-care";
    const messageTemplate = isPastAppointment ? "post" : "pre";
    const status = isPastAppointment ? "completed" : "scheduled";

    const appointment: AppointmentMock = {
      id: `weekend-apt-${date.getTime()}-${i}`,
      patientId: patient.patientId,
      chartId: patient.chartId,
      patient: {
        firstName: patientName.firstName,
        lastName: patientName.lastName,
      },
      provider: {
        providerId: `PROV-${i}`,
        firstName: patient.provider.split(" ")[0],
        lastName: patient.provider.split(" ")[1],
        specialties: [patient.providerSpecialty],
      },
      startTime,
      endTime,
      status: status as "scheduled" | "completed",
      type: getAppointmentType(patient.treatmentNotes.procedure),
      notes: patient.treatmentNotes.observations,
      treatmentNotes: patient.treatmentNotes,
      notificationStatus: {
        status: "pending" as const,
        sent: false,
        message: "",
        type: messageType as "pre-care" | "post-care",
      },
    };

    // Generate notification message after appointment object is created
    if (appointment.notificationStatus) {
      appointment.notificationStatus.message = generateNotificationMessage(
        messageTemplate,
        appointment,
      );
    }

    appointments.push(appointment);
  }

  return appointments;
};

// Calculate the dates for the coming Friday, Saturday, and Sunday
const daysUntilFriday = (5 - today.getDay() + 7) % 7;
const fridayDate = addDays(today, daysUntilFriday);
const saturdayDate = addDays(fridayDate, 1);
const sundayDate = addDays(fridayDate, 2);

// Add Friday extra appointments (2 more, non-overlapping with existing ones)
// First check what hours are already taken on Friday
const existingFridayAppointments = mockAppointments.filter((apt) => {
  const aptDate = new Date(apt.startTime);
  aptDate.setHours(0, 0, 0, 0);
  return aptDate.getTime() === fridayDate.getTime();
});

const takenFridayHours = existingFridayAppointments.map((apt) => apt.startTime.getHours());

// Find available hours for Friday
const availableFridayHours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
  .filter((hour) => !takenFridayHours.includes(hour))
  .slice(0, 2); // Take only 2 slots

if (availableFridayHours.length > 0) {
  const fridayExtraAppointments = createWeekendAppointments(
    fridayDate,
    availableFridayHours,
    patientIndex,
  );
  mockAppointments.push(...fridayExtraAppointments);
  patientIndex += fridayExtraAppointments.length;
}

// Add Saturday appointments (3 appointments)
const saturdayHours = [10, 13, 16]; // Morning, afternoon, and evening
const saturdayAppointments = createWeekendAppointments(saturdayDate, saturdayHours, patientIndex);
mockAppointments.push(...saturdayAppointments);
patientIndex += saturdayAppointments.length;

// Add Sunday appointments (2 appointments)
const sundayHours = [11, 15]; // Late morning and afternoon
const sundayAppointments = createWeekendAppointments(sundayDate, sundayHours, patientIndex);
mockAppointments.push(...sundayAppointments);
patientIndex += sundayAppointments.length;

// Load persisted notification statuses from localStorage if available
if (typeof window !== "undefined") {
  const savedNotificationStatuses = localStorage.getItem("appointmentNotificationStatuses");
  if (savedNotificationStatuses) {
    try {
      const statuses = JSON.parse(savedNotificationStatuses);
      mockAppointments = mockAppointments.map((appointment) => {
        const savedStatus = statuses[appointment.id];
        if (savedStatus && appointment.notificationStatus) {
          return {
            ...appointment,
            notificationStatus: {
              ...appointment.notificationStatus,
              ...savedStatus,
            },
          };
        }
        return appointment;
      });
    } catch (error) {
      console.error("Error loading saved notification statuses:", error);
    }
  }
}

// Function to update appointment notification status and persist to localStorage
export const updateAppointmentNotificationStatus = (
  appointmentId: string,
  status: "pending" | "approved" | "disapproved",
  sent: boolean,
  editedMessage?: string,
) => {
  // Update the appointment in memory
  mockAppointments = mockAppointments.map((appointment) => {
    if (appointment.id === appointmentId && appointment.notificationStatus) {
      const updatedNotification = {
        ...appointment.notificationStatus,
        status,
        sent,
        editedMessage,
      };

      return {
        ...appointment,
        notificationStatus: updatedNotification,
      };
    }
    return appointment;
  });

  // Save to localStorage
  if (typeof window !== "undefined") {
    try {
      // Get existing data
      const existingData = localStorage.getItem("appointmentNotificationStatuses");
      const statuses = existingData ? JSON.parse(existingData) : {};

      // Update with new status
      const targetAppointment = mockAppointments.find((a) => a.id === appointmentId);
      if (targetAppointment?.notificationStatus) {
        statuses[appointmentId] = {
          status,
          sent,
          editedMessage: editedMessage || targetAppointment.notificationStatus.editedMessage,
        };

        // Save back to localStorage
        localStorage.setItem("appointmentNotificationStatuses", JSON.stringify(statuses));
      }
    } catch (error) {
      console.error("Error saving notification status:", error);
    }
  }

  return mockAppointments;
};

export { mockAppointments };

export interface AppointmentMock {
  id: string;
  patientId: string;
  chartId: string;
  patient: {
    firstName: string;
    lastName: string;
  };
  provider: {
    providerId: string;
    firstName: string;
    lastName: string;
    specialties: string[];
  };
  startTime: Date;
  endTime: Date;
  status: "scheduled" | "completed" | "cancelled" | "pending";
  type: "therapy" | "consultation" | "followup" | "general";
  notes: string;
  treatmentNotes: any;
  notificationStatus?: {
    status: "pending" | "approved" | "disapproved";
    sent: boolean;
    message: string;
    type: "pre-care" | "post-care";
    editedMessage?: string;
  };
  chatHistory?: {
    id: string;
    text: string;
    sender: string;
    timestamp: Date;
    isOutbound: boolean;
  }[];
}
