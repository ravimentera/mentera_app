"use client";

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

      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Appointment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{appointment.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    {formatDate(appointment.date)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                    {appointment.time}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    {appointment.doctor}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(appointment.status)}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentsTab;
