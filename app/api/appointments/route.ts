import {
  Appointment,
  generateDailyAppointments,
  generateMonthlyAppointments,
  generateWeeklyAppointments,
} from "@/lib/utils/appointment-generator";
import { addDays, endOfMonth, startOfMonth, startOfWeek } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dateParam = searchParams.get("date") || new Date().toISOString();
  const viewType = (searchParams.get("view") || "week") as "day" | "week" | "month";
  const page = Number.parseInt(searchParams.get("page") || "0", 10);
  const pageSize = Number.parseInt(searchParams.get("pageSize") || "10", 10);

  const date = new Date(dateParam);

  let appointments: Appointment[] = [];
  let totalCount = 0;

  switch (viewType) {
    case "day": {
      // For day view, just get appointments for that specific day
      appointments = generateDailyAppointments(date);
      totalCount = appointments.length;
      break;
    }

    case "week": {
      // For week view, get all appointments for the full week
      const weekStart = startOfWeek(date, { weekStartsOn: 0 }); // Starting Sunday
      appointments = generateWeeklyAppointments(weekStart);
      totalCount = appointments.length;
      break;
    }

    case "month": {
      // For month view, we might want to paginate since there could be many appointments
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      // We'll implement a simple pagination based on weeks in the month
      // For example, if page=0, we show the first week, page=1 shows the second week, etc.
      const startDate = addDays(monthStart, page * 7);
      const endDate = addDays(startDate, 6);

      // Make sure we don't go beyond the month end
      const effectiveEndDate = endDate > monthEnd ? monthEnd : endDate;

      // Generate appointments for this week range
      appointments = [];
      for (let i = 0; i <= 6; i++) {
        const currentDate = addDays(startDate, i);
        if (currentDate <= effectiveEndDate) {
          const dailyAppointments = generateDailyAppointments(currentDate);
          appointments = [...appointments, ...dailyAppointments];
        }
      }

      // For total count, we need to calculate the total appointments in the month
      const allMonthAppointments = generateMonthlyAppointments(date);
      totalCount = allMonthAppointments.length;
      break;
    }

    default: {
      // Default to week view if an invalid view type is provided
      const weekStart = startOfWeek(date, { weekStartsOn: 0 });
      appointments = generateWeeklyAppointments(weekStart);
      totalCount = appointments.length;
      break;
    }
  }

  // Sort appointments by time
  appointments.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  return NextResponse.json({
    appointments,
    totalCount,
    page,
    pageSize,
    view: viewType,
    date: date.toISOString(),
  });
}
