"use client";

import { patients } from "@/mock/patients.data";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AppointmentCard } from "./components/AppointmentCard";
import { CampaignsCard } from "./components/CampaignsCard";
import { CommunicationCard } from "./components/CommunicationCard";
import { DocumentsCard } from "./components/DocumentsCard";
import { MedicalAlertsCard } from "./components/MedicalAlertsCard";
import { PackageCard } from "./components/PackageCard";
import { ProfileCard } from "./components/ProfileCard";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileTabs } from "./components/ProfileTabs";
import { UserHistoryCard } from "./components/UserHistoryCard";
import { CommunicationPreferences } from "./types";

export default function PatientProfilePage() {
  const params = useParams();
  const patientId = params?.patientId as string;

  // Find patient from mock data
  const patientData = patients.find((p) => p.patientId === patientId);

  // Transform patient data to match the expected format
  const patient = patientData
    ? {
        id: patientData.patientId,
        firstName: patientData.provider.split(" ")[0],
        lastName: patientData.provider.split(" ")[1] || "",
        email: `${patientData.provider.toLowerCase().replace(" ", ".")}@example.com`,
        phone: "(555) 123-4567", // Mock phone number since it's not in the data
        status: "active" as const,
        tags: [patientData.providerSpecialty],
        address: {
          street: "1901 Thornridge Cir.",
          city: "Shiloh",
          state: "HI",
          zip: "81063",
        },
        dateOfBirth: "1990-01-01", // Mock DOB since it's not in the data
        gender: "Not specified", // Mock gender since it's not in the data
      }
    : null;

  // Mock data for other sections that aren't in the patients.data.ts
  const appointments = patientData
    ? [
        {
          id: "1",
          title: patientData.nextTreatment,
          date: patientData.followUpDate,
          time: "2:00 PM",
          doctor: patientData.provider,
          status: "upcoming" as const,
        },
      ]
    : [];

  const packages = [
    {
      id: "1",
      name: patientData?.treatmentNotes.procedure || "Treatment Package",
      progress: 50,
      totalSessions: 6,
      completedSessions: 3,
    },
  ];

  const documents = [
    {
      id: "1",
      title: "Treatment Consent Form",
      signedDate: patientData?.visitDate || new Date().toISOString().split("T")[0],
      type: "consent" as const,
    },
  ];

  const medicalAlerts =
    patientData?.alerts.map((alert, index) => ({
      id: String(index + 1),
      type: alert,
      description: alert,
      reaction: patientData.preProcedureCheck.allergyCheck,
    })) || [];

  const userHistory = {
    lastVisited: patientData?.visitDate || "",
    lastEmailConnected: patientData?.visitDate || "",
    lastSMSConnected: patientData?.visitDate || "",
    createdOn: patientData?.visitDate || "",
  };

  const campaigns = [
    {
      id: "1",
      type: "email" as const,
      name: "Follow-up",
      date: patientData?.followUpDate || "",
    },
  ];

  const communicationPreferences = {
    emailNotifications: true,
    smsReminders: true,
  };

  const [activeTab, setActiveTab] = useState("overview");
  const [preferences, setPreferences] =
    useState<CommunicationPreferences>(communicationPreferences);

  const handleTogglePreference = (key: keyof CommunicationPreferences, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleViewAll = (section: string) => {
    setActiveTab(section);
  };

  if (!patient || !patientData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Patient not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ProfileHeader patient={patient} />

      <div className="flex-1 flex">
        <ProfileCard patient={patient} />
        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === "overview" && (
            <div className="grid grid-cols-2 gap-6 p-6">
              <div className="grid grid-cols-1 gap-6">
                <MedicalAlertsCard
                  alerts={medicalAlerts}
                  onEdit={() => handleViewAll("medical-history")}
                />
                <AppointmentCard
                  appointments={appointments}
                  onViewAll={() => handleViewAll("appointments")}
                />
                <CampaignsCard
                  campaigns={campaigns}
                  onViewAll={() => handleViewAll("notifications")}
                />
                <CommunicationCard preferences={preferences} onToggle={handleTogglePreference} />
              </div>
              <div className="grid grid-cols-1 gap-6 h-fit">
                <PackageCard packages={packages} onViewAll={() => handleViewAll("packages")} />
                <DocumentsCard documents={documents} onViewAll={() => handleViewAll("documents")} />
                <UserHistoryCard history={userHistory} />
              </div>
            </div>
          )}

          {/* Other tabs content */}
          {activeTab !== "overview" && (
            <div className="h-[calc(100vh-16rem)] flex items-center justify-center text-gray-500">
              <p>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} content coming soon...</p>
            </div>
          )}
        </ProfileTabs>
      </div>
    </div>
  );
}
