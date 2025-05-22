"use client";

import { ApprovalsContainer } from "@/components/organisms/approvals/ApprovalsContainer";
import { transformAppointmentToApprovalCard } from "@/lib/store/approvalsSlice";
import { generateDailyAppointments } from "@/lib/utils/appointment-generator";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

export default function ApprovalsPage() {
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);

  useEffect(() => {
    // Function to fetch today's appointments
    const fetchTodayAppointments = async () => {
      try {
        // Get today's date
        const today = new Date();

        // Fetch appointments from the API
        const response = await fetch(`/api/appointments?date=${today.toISOString()}&view=day`);

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        const appointments = data.appointments;

        // Transform appointments to approval card format
        const approvalCards = appointments
          .map((appointment: any) => {
            // Create a notification status for each appointment if not exists
            if (!appointment.notificationStatus) {
              appointment.notificationStatus = {
                status: "pending",
                sent: false,
                message: `Message for ${appointment.patient.firstName} regarding ${appointment.patient.condition || "appointment"}`,
                type: Math.random() > 0.5 ? "pre-care" : "post-care",
              };
            }
            return transformAppointmentToApprovalCard(appointment);
          })
          .filter((card: any) => card !== null);

        setTodayAppointments(approvalCards);
      } catch (error) {
        console.error("Error fetching appointments:", error);

        // Fallback to direct generation if API fails
        const generatedAppointments = generateDailyAppointments(new Date());
        const approvalCards = generatedAppointments
          .map((appointment) => {
            // Ensure notification status exists
            if (!appointment.notificationStatus) {
              appointment.notificationStatus = {
                status: "pending",
                sent: false,
                message: `Message for ${appointment.patient.firstName} regarding ${appointment.patient.condition || "appointment"}`,
                type: Math.random() > 0.5 ? "pre-care" : "post-care",
              };
            }
            return transformAppointmentToApprovalCard(appointment);
          })
          .filter((card) => card !== null);

        setTodayAppointments(approvalCards);
      }
    };

    fetchTodayAppointments();
  }, []);

  // Handle approval card actions
  const handleCardAction = (cardId: string, actionType: "approved" | "disapproved") => {
    // Remove the card from local state when approved or declined
    setTodayAppointments((prevCards) => prevCards.filter((card) => card.id !== cardId));
  };

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="h-full w-full">
        <ApprovalsContainer cards={todayAppointments} onCardAction={handleCardAction} />
      </div>
    </>
  );
}
