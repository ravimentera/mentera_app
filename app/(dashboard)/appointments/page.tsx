"use client";

import { Button, Input } from "@/components/atoms";
import { Card, LineChart } from "@/components/organisms";
import { useEffect, useState } from "react";

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

const generateRandomAppointments = (): Appointment[] => {
  const treatments = [
    "Facial Treatment",
    "Laser Therapy",
    "Body Massage",
    "Skin Rejuvenation",
    "Hair Removal",
    "Botox Injection",
    "Manicure & Pedicure",
  ];

  const names = [
    "Emma Davis",
    "Michael Wilson",
    "Sophia Lee",
    "James Johnson",
    "Olivia Brown",
    "William Smith",
    "Ava Martinez",
    "Robert Taylor",
    "Isabella Thomas",
    "David Rodriguez",
  ];

  const statuses: Array<"upcoming" | "completed" | "cancelled"> = [
    "upcoming",
    "completed",
    "cancelled",
  ];

  // Generate 10 random appointments
  return Array.from({ length: 10 }, (_, i) => {
    const nameIndex = Math.floor(Math.random() * names.length);
    const name = names[nameIndex];
    const email = name.toLowerCase().replace(" ", ".") + "@example.com";

    // Generate a random date within the next 14 days or past 14 days
    const today = new Date();
    const dayOffset = Math.floor(Math.random() * 28) - 14; // -14 to +14 days
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);

    // Format the date and time
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const hour = Math.floor(Math.random() * 10) + 8; // 8 AM to 6 PM
    const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)]; // 0, 15, 30, or 45 minutes
    const formattedTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

    // Determine status based on date
    let status: "upcoming" | "completed" | "cancelled";
    if (date < today) {
      status = Math.random() > 0.1 ? "completed" : "cancelled"; // 10% chance of cancellation for past appointments
    } else {
      status = Math.random() > 0.05 ? "upcoming" : "cancelled"; // 5% chance of cancellation for future appointments
    }

    return {
      id: `APT-${1000 + i}`,
      customerName: name,
      customerEmail: email,
      treatment: treatments[Math.floor(Math.random() * treatments.length)],
      date: formattedDate,
      time: formattedTime,
      duration: `${Math.floor(Math.random() * 3) + 1} hour${Math.floor(Math.random() * 3) + 1 > 1 ? "s" : ""}`,
      status,
    };
  });
};

// Generate data for appointment trend chart
const generateAppointmentTrend = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day) => ({
    date: day,
    value: Math.floor(Math.random() * 8) + 1, // 1-9 appointments per day
  }));
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [trendData, setTrendData] = useState(generateAppointmentTrend());
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    // Simulate data fetching
    setAppointments(generateRandomAppointments());
    setTrendData(generateAppointmentTrend());
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
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Appointments</h1>
        <p className="text-muted-foreground">
          View and manage your upcoming and past appointments.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Weekly Trend</h3>
            <Button variant="outline" size="sm">
              This Week
            </Button>
          </div>
          <LineChart data={trendData} title="Daily Appointments" height={200} />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Appointment Stats</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Appointments</p>
              <p className="text-2xl font-bold">{appointments.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="text-2xl font-bold">
                {appointments.filter((a) => a.status === "upcoming").length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">
                {appointments.filter((a) => a.status === "completed").length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cancelled</p>
              <p className="text-2xl font-bold">
                {appointments.filter((a) => a.status === "cancelled").length}
              </p>
            </div>
          </div>
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
              <Button>+ New Appointment</Button>
            </div>
          </div>
        </div>

        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Treatment
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Date & Time
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Duration
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-muted/50">
                      <td className="py-3 px-4">{appointment.id}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{appointment.customerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.customerEmail}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{appointment.treatment}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p>{appointment.date}</p>
                          <p className="text-sm text-muted-foreground">{appointment.time}</p>
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
                    <td colSpan={7} className="py-10 text-center text-muted-foreground">
                      No appointments found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
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
