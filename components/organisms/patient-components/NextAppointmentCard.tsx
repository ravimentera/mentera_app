"use client";

import { CalendarDays, Clock, User2 } from "lucide-react";
import Link from "next/link";
import { v4 as uuid } from "uuid";
import { Card, CardContent } from "../Card";

type Appointment = {
  title: string;
  time: string; // Formatted (e.g., "Tomorrow, 2:00 PM" or "2025-05-06, 2:00 PM")
  doctor: string;
  isUpcoming?: boolean;
};

interface NextAppointmentCardProps {
  upcomingAppointment: Appointment;
  futureAppointments?: Appointment[];
  onViewAllLink?: string;
}

export function NextAppointmentCard({
  upcomingAppointment,
  futureAppointments = [],
  onViewAllLink = "#",
}: NextAppointmentCardProps) {
  return (
    <Card className="w-full max-w-md border rounded-lg shadow-md">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarDays className="text-blue-600 w-5 h-5" />
            <h3 className="text-sm font-semibold text-gray-900">Next Appointment</h3>
          </div>
          <Link href={onViewAllLink} className="text-sm text-blue-600 hover:underline">
            View All
          </Link>
        </div>

        {/* Upcoming Appointment */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-1 text-sm text-gray-700">
          <div className="font-semibold text-gray-900">{upcomingAppointment.title}</div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{upcomingAppointment.time}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <User2 className="w-4 h-4" />
            <span>{upcomingAppointment.doctor}</span>
          </div>
        </div>

        {/* Future Appointments */}
        {futureAppointments.map((appt) => (
          <div
            key={uuid()}
            className="border border-blue-400 bg-green-50 rounded-md p-4 space-y-1 text-sm text-gray-700"
          >
            <div className="font-semibold text-gray-900">{appt.title}</div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{appt.time}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <User2 className="w-4 h-4" />
              <span>{appt.doctor}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
