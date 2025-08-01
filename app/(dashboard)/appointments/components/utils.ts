import { addDays, startOfWeek } from "date-fns";
import { Appointment } from "./types";

// Color mapping functions for Appointment Status
export const getAppointmentStatusColors = (status: Appointment["status"]) => {
  switch (status) {
    case "cancelled":
      return "bg-red-100 hover:bg-red-200 border-red-300 group-hover:bg-red-200";
    case "pending":
      return "bg-yellow-100 hover:bg-yellow-200 border-yellow-300 group-hover:bg-yellow-200";
    default:
      return "";
  }
};

// Color mapping functions
export const getAppointmentColors = (type: Appointment["type"]) => {
  switch (type) {
    case "therapy":
      return "bg-brand-blue-background hover:bg-brand-blue/20 border-brand-blue/20 group-hover:bg-brand-blue/20";
    case "consultation":
      return "bg-brand-blue-background hover:bg-brand-blue/20 border-brand-blue/20 group-hover:bg-brand-blue/20";
    case "followup":
      return "bg-brand-amber-background hover:bg-brand-amber/20 border-brand-amber/20 group-hover:bg-brand-amber/20";
    default:
      return "bg-brand-green-background hover:bg-brand-green/20 border-brand-green/20 group-hover:bg-brand-green/20";
  }
};

export const getAvatarColors = (type: Appointment["type"]) => {
  switch (type) {
    case "therapy":
      return "bg-brand-blue-dark text-white";
    case "consultation":
      return "bg-brand-blue text-white";
    case "followup":
      return "bg-brand-amber text-white";
    default:
      return "bg-brand-green text-white";
  }
};

export const getAppointmentTextColor = (type: Appointment["type"]) => {
  switch (type) {
    case "therapy":
      return "text-brand-blue-dark";
    case "consultation":
      return "text-brand-blue";
    case "followup":
      return "text-brand-amber";
    default:
      return "text-brand-green";
  }
};

// Style calculation for appointments
export const getAppointmentStyle = (
  appointment: Appointment,
  index: number,
  overlappingCount: number,
) => {
  const date = new Date(appointment.startTime);
  const minutesSinceStartOfDay = date.getHours() * 60 + date.getMinutes();
  const top = `${(minutesSinceStartOfDay / (24 * 60)) * 100}%`;

  const start = new Date(appointment.startTime);
  const end = new Date(appointment.endTime);
  const height = `${
    ((end.getHours() * 60 + end.getMinutes() - (start.getHours() * 60 + start.getMinutes())) /
      (24 * 60)) *
    100
  }%`;

  // Calculate width and left position for overlapping appointments with overlap effect
  const width = overlappingCount > 1 ? `${100 / overlappingCount + 10}%` : "95%";
  const left = overlappingCount > 1 ? `${(85 / overlappingCount) * index}%` : "2.5%";
  const zIndex = index + 1;

  return {
    top,
    height,
    width,
    left,
    minHeight: "12px",
    zIndex,
  };
};

// Filtering functions
export const filterAppointmentsByDate = (appointments: Appointment[], selectedDate: Date) => {
  return appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.startTime);
    return (
      appointmentDate.getFullYear() === selectedDate.getFullYear() &&
      appointmentDate.getMonth() === selectedDate.getMonth() &&
      appointmentDate.getDate() === selectedDate.getDate()
    );
  });
};

export const filterAppointmentsByDateRange = (
  appointments: Appointment[],
  startDate: Date,
  endDate: Date,
) => {
  return appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.startTime);
    return appointmentDate >= startOfWeek(startDate) && appointmentDate <= endDate;
  });
};

// Function to find overlapping appointments
export const getOverlappingAppointments = (appointments: Appointment[]) => {
  const sortedAppointments = [...appointments].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime(),
  );
  const overlappingGroups: Appointment[][] = [];

  for (const appointment of sortedAppointments) {
    let added = false;
    for (const group of overlappingGroups) {
      const lastAppointment = group[group.length - 1];
      if (appointment.startTime < lastAppointment.endTime) {
        group.push(appointment);
        added = true;
        break;
      }
    }
    if (!added) {
      overlappingGroups.push([appointment]);
    }
  }

  return overlappingGroups;
};

// Date-related functions
export const getWeekDays = (currentDate: Date) => {
  const start = startOfWeek(currentDate, { weekStartsOn: 0 }); // Start from Sunday
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

// Function to determine if an appointment is in the future
export const isFutureAppointment = (appointment: Appointment) => {
  return new Date(appointment.startTime) > new Date();
};

// Function to generate care instructions based on appointment type and timing
export const generateCareInstructions = (appointment: Appointment) => {
  const isPreCare = isFutureAppointment(appointment);
  const type = isPreCare ? "pre-care" : "post-care";
  const patientName = `${appointment.patient.firstName}`;
  const appointmentDate = new Date(appointment.startTime).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  console.log({ isPreCare, appointment });

  if (isPreCare) {
    return {
      message: `Hi ${patientName},

It's Meghan here 😊—excited to see you for your ${patientName !== "Emiley" && patientName !== "Erica" ? "Botox" : "microneedling"} on ${appointmentDate}! A couple quick reminders: try to avoid sun/tanning this week, skip alcohol/caffeine 24–48 hrs before, and stay extra hydrated. Let me know if you have any questions before we start 💖.`,
      type: "pre-care" as const,
    };
  }

  return {
    message: `Hi ${patientName},

Just checking in after your microneedling treatment — I hope you're feeling well and your skin is responding beautifully.

You should begin noticing improvements within a few days, with full results becoming visible over the next 7–14 days. To support your recovery:

• Avoid strenuous exercise for the rest of today.  
• Keep your skin moisturized and avoid harsh products.  
• Protect your skin from direct sunlight and use a gentle SPF.

We've tentatively scheduled your next appointment for 13 May 2025 to follow up and ensure your skin is healing as expected. Let us know if you'd like to confirm or adjust the timing.

Take care, and don't hesitate to reach out if you need anything in the meantime.`,
    type: "post-care" as const,
  };
};

export function getAppointmentTypeStyles(type: Appointment["type"]) {
  switch (type) {
    case "consultation":
      return "bg-brand-blue-background hover:bg-brand-blue-dark/20 border-brand-blue-dark/20 group-hover:bg-brand-blue-dark/20";
    case "followup":
      return "bg-brand-blue-background hover:bg-brand-blue/20 border-brand-blue/20 group-hover:bg-brand-blue/20";
    case "therapy":
      return "bg-brand-amber-background hover:bg-brand-amber/20 border-brand-amber/20 group-hover:bg-brand-amber/20";
    case "general":
      return "bg-brand-green-background hover:bg-brand-green/20 border-brand-green/20 group-hover:bg-brand-green/20";
    default:
      return "";
  }
}

export function getAppointmentTypeColor(type: Appointment["type"]) {
  switch (type) {
    case "consultation":
      return "bg-brand-blue-dark text-white";
    case "followup":
      return "bg-brand-blue text-white";
    case "therapy":
      return "bg-brand-amber text-white";
    case "general":
      return "bg-brand-green text-white";
    default:
      return "";
  }
}

export function getAppointmentTypeTextColor(type: Appointment["type"]) {
  switch (type) {
    case "consultation":
      return "text-brand-blue-dark";
    case "followup":
      return "text-brand-blue";
    case "therapy":
      return "text-brand-amber";
    case "general":
      return "text-brand-green";
    default:
      return "";
  }
}
