"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import { Calendar, Clock, User } from "lucide-react";

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  doctor: string;
  status: "upcoming" | "completed";
}

interface AppointmentsTabProps {
  appointments: Appointment[];
  isLoading?: boolean;
}

const AppointmentsTab = ({ appointments, isLoading }: AppointmentsTabProps) => {
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "upcoming":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-semibold">All Appointments</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!appointments.length) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-semibold">All Appointments</h1>
        </div>
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-500">
            This patient doesn&apos;t have any appointments scheduled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h1 className="text-xl font-semibold">All Appointments</h1>
        <span className="text-sm text-gray-500">({appointments.length} total)</span>
      </div>

      <div className="bg-white rounded-lg border border-ui-border h-fit">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow className="border-b border-ui-border hover:bg-white">
              <TableHead className="text-xs uppercase">Appointment</TableHead>
              <TableHead className="text-xs uppercase">Date & Time</TableHead>
              <TableHead className="text-xs uppercase">Provider</TableHead>
              <TableHead className="text-xs uppercase">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="overflow-y-auto">
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell className="text-sm font-medium text-text-gray-900">
                  {appointment.title}
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-text">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    {formatDate(appointment.date)}
                  </div>
                  <div className="flex items-center text-sm text-text-muted mt-1">
                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                    {appointment.time}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-text">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    {appointment.doctor}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={getStatusBadge(appointment.status)}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AppointmentsTab;
