"use client";

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
import { getPatientProfile } from "./data";
import { CommunicationPreferences } from "./types";

export default function ProfileV2Page() {
  const {
    patient,
    appointments,
    packages,
    documents,
    medicalAlerts,
    userHistory,
    campaigns,
    communicationPreferences,
  } = getPatientProfile();

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
