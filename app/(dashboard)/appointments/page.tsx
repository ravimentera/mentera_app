"use client";

import { Button, Input } from "@/components/atoms";
import { RoleToggle } from "@/components/molecules";
import { Card, LineChart } from "@/components/organisms";
import { PlusIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { AppointmentCalendar } from "./components/AppointmentCalendar";

interface Appointment {
  id: string;
  customerName: string;
  customerEmail: string;
  treatment: string;
  date: string;
  time: string;
  duration: string;
  status: "upcoming" | "completed" | "cancelled";
}

// Update to fetch from API
const fetchAppointmentsForTable = async (): Promise<Appointment[]> => {
  try {
    // Fetch a month's worth of appointments for the table view
    const params = new URLSearchParams({
      date: new Date().toISOString(),
      view: "month",
      page: "0",
      pageSize: "50",
    });

    const response = await fetch(`/api/appointments?${params}`);

    if (!response.ok) {
      throw new Error("Failed to fetch appointments");
    }

    const data = await response.json();

    // Convert the API appointments to the table format
    return data.appointments.map((appointment: any) => {
      // Format the date and time
      const date = new Date(appointment.startTime);
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      // Calculate duration in hours
      const endTime = new Date(appointment.endTime);
      const durationMs = endTime.getTime() - date.getTime();
      const durationHours = Math.round(durationMs / (1000 * 60 * 60));
      const formattedDuration = `${durationHours} hour${durationHours > 1 ? "s" : ""}`;

      // If the appointment date is in the past, set status to completed
      const now = new Date();
      let tableStatus = appointment.status === "scheduled" ? "upcoming" : appointment.status;

      // For past appointments, set status to completed
      if (date < now) {
        tableStatus = "completed";
      }

      // Generate email based on patient name
      const email = `${appointment.patient.firstName.toLowerCase()}.${appointment.patient.lastName.toLowerCase()}@example.com`;

      return {
        id: appointment.patientId,
        customerName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        customerEmail: email,
        treatment: appointment.patient.condition || "General Consultation",
        date: formattedDate,
        time: formattedTime,
        duration: formattedDuration,
        status: tableStatus as "upcoming" | "completed" | "cancelled",
      };
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
};

// Update to fetch trends from the API
const fetchAppointmentTrend = async () => {
  try {
    // Fetch all appointments for the month to generate trends
    const params = new URLSearchParams({
      date: new Date().toISOString(),
      view: "month",
    });

    const response = await fetch(`/api/appointments?${params}`);

    if (!response.ok) {
      throw new Error("Failed to fetch appointments for trends");
    }

    const data = await response.json();
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Group appointments by day of week
    const appointmentsByDay = data.appointments.reduce(
      (acc: Record<string, number>, appointment: any) => {
        const dayOfWeek = new Date(appointment.startTime).getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to 0 = Monday, ..., 6 = Sunday
        const day = days[dayIndex];

        acc[day] = (acc[day] || 0) + 1;
        return acc;
      },
      {},
    );

    // Create trend data with counts for each day
    return days.map((day) => ({
      date: day,
      value: appointmentsByDay[day] || 0,
    }));
  } catch (error) {
    console.error("Error fetching appointment trends:", error);
    // Return empty trend data if fetch fails
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day) => ({ date: day, value: 0 }));
  }
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [trendData, setTrendData] = useState<{ date: string; value: number }[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch data from our API
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [appointmentsData, trendsData] = await Promise.all([
          fetchAppointmentsForTable(),
          fetchAppointmentTrend(),
        ]);

        setAppointments(appointmentsData);
        setTrendData(trendsData);
      } catch (error) {
        console.error("Error loading appointment data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter appointments based on search term and status
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.treatment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get status badge styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-brand-blue dark:text-blue-100";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  const handleEventClick = (appointment: any) => {
    console.log("Clicked appointment:", appointment);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
          <p className="text-gray-500">View and manage your upcoming and past appointments.</p>
        </div>
        <div className="flex items-center gap-2">
          <RoleToggle className="mr-2" />
          <Button>
            <PlusIcon /> <span className="ml-2">New Appointment</span>
          </Button>
        </div>
      </div>

      <AppointmentCalendar />
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Weekly Trend</h3>
            <Button variant="outline" size="sm">
              This Week
            </Button>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-blue"></div>
            </div>
          ) : (
            <LineChart data={trendData} title="Daily Appointments" height={200} />
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Appointment Stats</h3>
          {isLoading ? (
            <div className="flex justify-center items-center h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-blue"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Appointments</p>
                <p className="text-2xl font-bold">{appointments.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Upcoming</p>
                <p className="text-2xl font-bold">
                  {appointments.filter((a) => a.status === "upcoming").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold">
                  {appointments.filter((a) => a.status === "completed").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cancelled</p>
                <p className="text-2xl font-bold">
                  {appointments.filter((a) => a.status === "cancelled").length}
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="p-6 border-b">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-medium">All Appointments</h3>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Search appointments..."
                className="w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="p-2 border rounded-md text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Treatment
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Date & Time
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Duration
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-blue"></div>
                        <p className="mt-4 text-gray-500">Loading appointments...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-muted/50">
                      <td className="py-3 px-4">{appointment.id}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{appointment.customerName}</p>
                          <p className="text-sm text-gray-500">{appointment.customerEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{appointment.treatment}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p>{appointment.date}</p>
                          <p className="text-sm text-gray-500">{appointment.time}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{appointment.duration}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${getStatusBadge(appointment.status)}`}
                        >
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          {appointment.status === "upcoming" && (
                            <Button variant="outline" size="sm">
                              Reschedule
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-500">
                      No appointments found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {filteredAppointments.length} of {appointments.length} appointments
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
