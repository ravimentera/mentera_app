import { addDays, startOfWeek } from "date-fns";
import { Appointment } from "./types";

// Color mapping functions
export const getAppointmentColors = (type: Appointment["type"]) => {
  switch (type) {
    case "therapy":
      return "bg-[#8A03D3]/10 hover:bg-[#8A03D3]/20 border-[#8A03D3]/20 group-hover:bg-[#8A03D3]/20";
    case "consultation":
      return "bg-[#035DD3]/10 hover:bg-[#035DD3]/20 border-[#035DD3]/20 group-hover:bg-[#035DD3]/20";
    case "followup":
      return "bg-[#D36203]/10 hover:bg-[#D36203]/20 border-[#D36203]/20 group-hover:bg-[#D36203]/20";
    default:
      return "bg-[#03A10B]/10 hover:bg-[#03A10B]/20 border-[#03A10B]/20 group-hover:bg-[#03A10B]/20";
  }
};

export const getAvatarColors = (type: Appointment["type"]) => {
  switch (type) {
    case "therapy":
      return "bg-[#8A03D3] text-white";
    case "consultation":
      return "bg-[#035DD3] text-white";
    case "followup":
      return "bg-[#D36203] text-white";
    default:
      return "bg-[#03A10B] text-white";
  }
};

export const getAppointmentTextColor = (type: Appointment["type"]) => {
  switch (type) {
    case "therapy":
      return "text-[#8A03D3]";
    case "consultation":
      return "text-[#035DD3]";
    case "followup":
      return "text-[#D36203]";
    default:
      return "text-[#03A10B]";
  }
};

// Style calculation for appointments
export const getAppointmentStyle = (
  appointment: Appointment,
  index: number,
  overlappingCount: number,
) => {
  const top = `${((appointment.startTime.getHours() * 60 + appointment.startTime.getMinutes()) / (24 * 60)) * 100}%`;
  const height = `${
    ((appointment.endTime.getHours() * 60 +
      appointment.endTime.getMinutes() -
      (appointment.startTime.getHours() * 60 + appointment.startTime.getMinutes())) /
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
  return appointment.startTime > new Date();
};

// Function to generate care instructions based on appointment type and timing
export const generateCareInstructions = (appointment: Appointment) => {
  const isPreCare = isFutureAppointment(appointment);
  const type = isPreCare ? "pre-care" : "post-care";
  const patientName = `${appointment.patient.firstName}`;

  if (isPreCare) {
    return {
      message: `Hi ${patientName}! Here are your pre-care instructions for your upcoming ${appointment.type} treatment. Please make sure to:
1. Avoid any blood thinning medications 24 hours before treatment
2. Avoid alcohol consumption 24 hours before treatment
3. Stay hydrated and get plenty of rest
4. Arrive 10 minutes early for your appointment
5. Let us know if you have any concerns or questions

Looking forward to seeing you soon!`,
      type: "pre-care" as const,
    };
  }
  return {
    message: `Hi ${patientName}! Just wanted to check in and see how you're doing after your ${appointment.type} treatment. I hope everything's feeling great so far. You should start noticing results soon, with full effects showing up in about 7-14 days. Try to take it easy today and avoid any heavy exercise. Let's go ahead and get your follow-up scheduled in two weeks so we can make sure everything's looking perfect. want me to take care of that for you?`,
    type: "post-care" as const,
  };
};
