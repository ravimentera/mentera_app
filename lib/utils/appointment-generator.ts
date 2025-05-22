import { patients } from "@/mock/patients.data";
import {
  addDays,
  addMinutes,
  differenceInDays,
  endOfMonth,
  format,
  isWeekend,
  setHours,
  setMinutes,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";

// Appointment types based on procedure
const PROCEDURE_TO_TYPE_MAP: Record<string, AppointmentType> = {
  Botox: "consultation",
  Juvederm: "consultation",
  "Laser Hair Removal": "therapy",
  HydraFacial: "therapy",
  CoolSculpting: "consultation",
  Microneedling: "therapy",
  "Chemical Peel": "therapy",
  "IPL Photofacial": "therapy",
  Kybella: "consultation",
  "RF Skin Tightening": "therapy",
  Dermaplaning: "therapy",
  "PRP Hair Restoration": "therapy",
  "LED Light Therapy": "general",
  Microblading: "consultation",
  "Body Contouring": "consultation",
};

// Possible appointment statuses with weights
const APPOINTMENT_STATUSES = [
  { status: "scheduled", weight: 6 },
  { status: "completed", weight: 3 },
  { status: "cancelled", weight: 1 },
  { status: "pending", weight: 2 },
] as const;

// Possible appointment durations in minutes
const APPOINTMENT_DURATIONS = [30, 45, 60, 90];

// Business hours (9am to 5pm PST) - keeping the same business hours, but ensuring PST timezone
const BUSINESS_HOURS = {
  start: 9, // 9am
  end: 17, // 5pm
};

// PST timezone
const PST_TIMEZONE = "America/Los_Angeles";

// Types
export type AppointmentType = "therapy" | "consultation" | "followup" | "general";
export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "pending";

export interface Appointment {
  id: string;
  patientId: string;
  chartId: string;
  patient: {
    firstName: string;
    lastName: string;
    condition?: string;
  };
  provider: {
    providerId: string;
    firstName: string;
    lastName: string;
    specialties: string[];
  };
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  notes?: string;
  type: AppointmentType;
  notificationStatus?: {
    status: "pending" | "approved" | "disapproved";
    sent: boolean;
    message?: string;
    type: "pre-care" | "post-care";
    editedMessage?: string;
  };
}

/**
 * Get a weighted random item from an array with weights
 */
function getWeightedRandomItem<T extends { status: string; weight: number }>(
  items: ReadonlyArray<T>,
): { status: string } {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      // Return only the status
      return { status: item.status };
    }
  }

  // Fallback to first item
  return { status: items[0].status };
}

/**
 * Convert local date to PST timezone
 */
function toPST(date: Date): Date {
  // First create a new date object to avoid mutation
  const newDate = new Date(date);
  // Then convert to PST
  return toZonedTime(newDate, PST_TIMEZONE);
}

/**
 * Get a random time within business hours for the given date in PST
 */
function getRandomBusinessHourTime(date: Date): Date {
  // Define possible appointment slots (9am to 5pm with 30-min intervals)
  // We'll only create appointments between 9am and 4:30pm to ensure
  // all appointments end by 5pm (even with the longest duration)
  const availableHours = [];

  // Start at 9:00am and end at 4:00pm (to allow for up to 1 hour appointments)
  for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour++) {
    // Skip anything that would result in an appointment after business hours
    // Maximum appointment duration is 90 minutes (1.5 hours)
    if (hour < BUSINESS_HOURS.end - 1.5) {
      availableHours.push(hour);
    }
  }

  const availableMinutes = [0, 30]; // Only allow appointments on the hour or half-hour

  // If no valid hours are available, default to the middle of the day
  if (availableHours.length === 0) {
    const middayHour = Math.floor((BUSINESS_HOURS.start + BUSINESS_HOURS.end) / 2);
    const defaultDate = new Date(date);
    defaultDate.setHours(middayHour, 0, 0, 0);
    return toPST(defaultDate);
  }

  // Pick a random hour and minute
  const randomHour = availableHours[Math.floor(Math.random() * availableHours.length)];
  const randomMinute = availableMinutes[Math.floor(Math.random() * availableMinutes.length)];

  // Create a new date with the date parts from the input date
  const newDate = new Date(date);
  newDate.setHours(randomHour, randomMinute, 0, 0);

  // Set the time and return as PST
  return toPST(newDate);
}

/**
 * Generate appointment for a specific patient
 */
function generateAppointmentForPatient(
  patient: (typeof patients)[number],
  date: Date,
  timeOverride?: Date,
): Appointment {
  const patientName = patient.patientId.split("-")[1] || "";
  const appointmentId = `apt-${date.getTime()}-${patientName}`;

  // Use provided time or generate random time within business hours
  const startTime = timeOverride || getRandomBusinessHourTime(date);

  // Random duration
  const durationMinutes =
    APPOINTMENT_DURATIONS[Math.floor(Math.random() * APPOINTMENT_DURATIONS.length)];
  const endTime = addMinutes(startTime, durationMinutes);

  // Determine appointment type based on procedure
  const procedureType = patient.treatmentNotes.procedure;
  const appointmentType = PROCEDURE_TO_TYPE_MAP[procedureType] || "general";

  // Get weighted random status
  const { status } = getWeightedRandomItem(APPOINTMENT_STATUSES);

  // Generate appointment
  return {
    id: appointmentId,
    patientId: patient.patientId,
    chartId: patient.chartId,
    patient: {
      firstName: patient.provider.split(" ")[0],
      lastName: patient.provider.split(" ")[1],
      condition: patient.treatmentNotes.procedure,
    },
    provider: {
      providerId: `PROV-${patient.provider.split(" ")[0].charAt(0)}${patient.provider.split(" ")[1].charAt(0)}`,
      firstName: patient.provider.split(" ")[0],
      lastName: patient.provider.split(" ")[1],
      specialties: [patient.providerSpecialty],
    },
    startTime,
    endTime,
    status: status as AppointmentStatus,
    notes: patient.treatmentNotes.observations,
    type: appointmentType,
  };
}

/**
 * Check if a new appointment conflicts with any existing appointments
 */
function hasTimeConflict(
  newAppointment: Appointment,
  existingAppointments: Appointment[],
): boolean {
  return existingAppointments.some((existing) => {
    return (
      (newAppointment.startTime >= existing.startTime &&
        newAppointment.startTime < existing.endTime) ||
      (newAppointment.endTime > existing.startTime && newAppointment.endTime <= existing.endTime) ||
      (newAppointment.startTime <= existing.startTime && newAppointment.endTime >= existing.endTime)
    );
  });
}

/**
 * Generate appointments for a specific day
 * @param date The day to generate appointments for
 * @param count Number of appointments to generate (default: 3-4 per day)
 * @returns Array of generated appointments
 */
export function generateDailyAppointments(date: Date, count = -1): Appointment[] {
  // Don't generate appointments for weekends
  if (isWeekend(date)) {
    return [];
  }

  // If count is -1 (default), randomly choose 3 or 4 appointments
  const appointmentCount = count === -1 ? (Math.random() < 0.5 ? 3 : 4) : count;

  const dailyAppointments: Appointment[] = [];
  const availablePatients = [...patients];

  // Try to add the requested number of appointments
  let attempts = 0;
  while (
    dailyAppointments.length < appointmentCount &&
    attempts < appointmentCount * 5 &&
    availablePatients.length > 0
  ) {
    attempts++;

    // Select a random patient
    const patientIndex = Math.floor(Math.random() * availablePatients.length);
    const patient = availablePatients[patientIndex];

    // Remove this patient from available pool to prevent duplicates on same day
    availablePatients.splice(patientIndex, 1);

    // Generate appointment
    const appointment = generateAppointmentForPatient(patient, date);

    // Check for time conflicts
    if (!hasTimeConflict(appointment, dailyAppointments)) {
      dailyAppointments.push(appointment);
    }
  }

  // Ensure we never exceed the max count (this is an extra safeguard)
  if (dailyAppointments.length > appointmentCount) {
    dailyAppointments.length = appointmentCount;
  }

  // Sort appointments by start time
  return dailyAppointments.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

/**
 * Generate appointments for a week
 * @param weekStartDate Start date of the week
 * @param appointmentsPerDay Number of appointments to generate per day
 * @returns Array of generated appointments
 */
export function generateWeeklyAppointments(
  weekStartDate: Date,
  appointmentsPerDay = -1,
): Appointment[] {
  const weeklyAppointments: Appointment[] = [];

  // Generate for each day of the week
  for (let i = 0; i < 7; i++) {
    const currentDate = addDays(weekStartDate, i);

    // Skip weekends
    if (isWeekend(currentDate)) {
      continue;
    }

    const dailyAppointments = generateDailyAppointments(currentDate, appointmentsPerDay);
    weeklyAppointments.push(...dailyAppointments);
  }

  return weeklyAppointments;
}

/**
 * Generate appointments for a month
 * @param monthDate Any date in the target month
 * @param appointmentsPerDay Number of appointments to generate per day
 * @returns Array of generated appointments
 */
export function generateMonthlyAppointments(
  monthDate: Date,
  appointmentsPerDay = -1,
): Appointment[] {
  const monthStartDate = startOfMonth(monthDate);
  const monthEndDate = endOfMonth(monthDate);
  const daysInMonth = differenceInDays(monthEndDate, monthStartDate) + 1;

  const monthlyAppointments: Appointment[] = [];

  // Generate for each day of the month
  for (let i = 0; i < daysInMonth; i++) {
    const currentDate = addDays(monthStartDate, i);

    // Skip weekends
    if (isWeekend(currentDate)) {
      continue;
    }

    const dailyAppointments = generateDailyAppointments(currentDate, appointmentsPerDay);
    monthlyAppointments.push(...dailyAppointments);
  }

  return monthlyAppointments;
}

/**
 * Generate appointments for a date range
 * @param startDate Start date of the range
 * @param endDate End date of the range
 * @param appointmentsPerDay Number of appointments to generate per day
 * @returns Array of generated appointments
 */
export function generateDateRangeAppointments(
  startDate: Date,
  endDate: Date,
  appointmentsPerDay = -1,
): Appointment[] {
  const daysInRange = differenceInDays(endDate, startDate) + 1;
  const rangeAppointments: Appointment[] = [];

  // Generate for each day in the range
  for (let i = 0; i < daysInRange; i++) {
    const currentDate = addDays(startDate, i);

    // Skip weekends
    if (isWeekend(currentDate)) {
      continue;
    }

    const dailyAppointments = generateDailyAppointments(currentDate, appointmentsPerDay);
    rangeAppointments.push(...dailyAppointments);
  }

  return rangeAppointments;
}

/**
 * Generate a paginated list of appointments
 * @param date Reference date
 * @param page Page number (0-based)
 * @param pageSize Number of appointments per page
 * @returns Paginated array of appointments
 */
export function getPaginatedAppointments(
  date: Date = new Date(),
  page = 0,
  pageSize = 10,
): {
  appointments: Appointment[];
  totalCount: number;
} {
  // Generate a pool of appointments for a reasonable date range (e.g., current month)
  const startOfCurrentMonth = startOfMonth(date);
  const endOfCurrentMonth = endOfMonth(date);

  // Generate all appointments for the month
  const allAppointments = generateDateRangeAppointments(startOfCurrentMonth, endOfCurrentMonth);

  // Sort appointments by date
  allAppointments.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  // Calculate pagination
  const totalCount = allAppointments.length;
  const start = page * pageSize;
  const end = start + pageSize;

  // Return paginated result
  return {
    appointments: allAppointments.slice(start, end),
    totalCount,
  };
}

/**
 * Generate appointments filtered by view type
 * @param date Reference date
 * @param view View type (day, week, month)
 * @returns Filtered array of appointments
 */
export function getAppointmentsByView(
  date: Date = new Date(),
  view: "day" | "week" | "month" = "week",
): Appointment[] {
  let appointments: Appointment[] = [];

  // Define max appointments per day
  const MAX_APPOINTMENTS_PER_DAY = 4;

  switch (view) {
    case "day":
      // For day view, just generate the appointments directly with the limit
      return generateDailyAppointments(date, MAX_APPOINTMENTS_PER_DAY);

    case "week": {
      const weekStart = startOfWeek(date, { weekStartsOn: 0 }); // 0 = Sunday
      appointments = generateWeeklyAppointments(weekStart);
      break;
    }

    case "month":
      appointments = generateMonthlyAppointments(date);
      break;

    default:
      appointments = generateDailyAppointments(date, MAX_APPOINTMENTS_PER_DAY);
      break;
  }

  // We need to ensure the total appointments per day never exceeds 4
  // For that, we'll group appointments by day and add pending notifications only if there's room
  const appointmentsByDay: Record<string, Appointment[]> = {};

  // Group appointments by day
  appointments.forEach((appointment) => {
    const dateKey = appointment.startTime.toISOString().split("T")[0];
    if (!appointmentsByDay[dateKey]) {
      appointmentsByDay[dateKey] = [];
    }

    // Only add appointments if we haven't hit the maximum per day
    if (appointmentsByDay[dateKey].length < MAX_APPOINTMENTS_PER_DAY) {
      appointmentsByDay[dateKey].push(appointment);
    }
  });

  // Generate a small number of pending notifications
  const pendingNotifications = generatePendingNotifications(date, 1);

  // Add pending notifications only if there's room on that day
  pendingNotifications.forEach((notification) => {
    const dateKey = notification.startTime.toISOString().split("T")[0];
    // Initialize if the day doesn't exist
    if (!appointmentsByDay[dateKey]) {
      appointmentsByDay[dateKey] = [];
    }
    // Only add if there's room
    if (appointmentsByDay[dateKey].length < MAX_APPOINTMENTS_PER_DAY) {
      appointmentsByDay[dateKey].push(notification);
    }
  });

  // Flatten the appointments back to an array
  return Object.values(appointmentsByDay).flat();
}

/**
 * Generate a notification message for an appointment
 * @param type The type of notification: pre-care or post-care
 * @param appointment The appointment to generate a notification for
 * @returns A personalized notification message
 */
export function generateNotificationMessage(
  type: "pre-care" | "post-care",
  appointment: Appointment,
): string {
  const { patient, startTime, provider } = appointment;
  const providerName = `${patient.firstName} ${patient.lastName}`;
  const dateString = format(startTime, "EEEE, MMMM d");
  const timeString = format(startTime, "h:mm a");
  const procedure = patient.condition || "your appointment";

  if (type === "pre-care") {
    return `Hi,
    
This is a reminder that your ${procedure} appointment with Dr. ${providerName} is scheduled for ${dateString} at ${timeString}.

Please arrive 15 minutes early to complete any necessary paperwork. If you need to reschedule, please call us at least 24 hours in advance.

Looking forward to seeing you!

Best regards,
The Mentera Team`;
  }

  return `Hi,

Thank you for coming in for your ${procedure} appointment with Dr. ${providerName} on ${dateString}.

We hope everything went well and you're satisfied with the treatment. If you have any questions or concerns, please don't hesitate to contact us.

We value your feedback! Please take a moment to rate your experience by replying to this message with a number from 1-5, with 5 being excellent.

Best regards,
The Mentera Team`;
}

/**
 * Generate an appointment with notification status
 * Extends the basic appointment generation with notification data
 */
export function generateAppointmentWithNotification(date: Date, createPreCare = true): Appointment {
  // Select a random patient
  const patientIndex = Math.floor(Math.random() * patients.length);
  const patient = patients[patientIndex];

  // Generate basic appointment
  const appointment = generateAppointmentForPatient(patient, date);

  // Add notification status
  const notificationType = createPreCare ? "pre-care" : "post-care";
  const message = generateNotificationMessage(notificationType, appointment);

  return {
    ...appointment,
    notificationStatus: {
      status: "pending",
      sent: false,
      message,
      type: notificationType,
    },
  };
}

/**
 * Generate appointments with pending notifications
 * @param date The reference date
 * @param count Number of notifications to generate (max 1 per day)
 * @returns Array of appointments with pending notifications
 */
export function generatePendingNotifications(date: Date = new Date(), count = 1): Appointment[] {
  const pendingAppointments: Appointment[] = [];

  // Limit count to ensure we don't create too many
  const actualCount = Math.min(count, 2);

  // Create at most 1 notification per day for a few days
  for (let i = 0; i < actualCount; i++) {
    // Create appointment times - spread them across different days
    const dayOffset = i; // Each notification is on a different day
    const appointmentDate = addDays(date, dayOffset);
    const startTime = toPST(setHours(setMinutes(new Date(appointmentDate), 0), 11 + i)); // 11am, 12pm, etc.

    // Alternate between pre-care and post-care
    const isPreCare = i % 2 === 0;

    // Generate appointment with notification
    const appointment = generateAppointmentWithNotification(startTime, isPreCare);

    pendingAppointments.push(appointment);
  }

  return pendingAppointments;
}
