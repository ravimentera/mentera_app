"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/molecules";
import AppointmentsTab from "./AppointmentsTab";
import MedicalHistoryTab from "./MedicalHistoryTab";

const tabItems = [
  { id: "overview", label: "Overview" },
  { id: "appointments", label: "Appointments" },
  { id: "medical-history", label: "Medical History" },
  // { id: "inbox", label: "Inbox" },
  // { id: "resources", label: "Resources" },
  // { id: "documents", label: "Documents" },
  // { id: "notifications", label: "Notifications" },
  // { id: "settings", label: "Settings" },
];

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
  // Data for tabs
  appointments?: any[];
  medicalAlerts?: any[];
  enrichedVisits?: any[];
  treatments?: any[];
  isLoadingAppointments?: boolean;
  isLoadingMedical?: boolean;
}

export function ProfileTabs({
  activeTab,
  onTabChange,
  children,
  appointments = [],
  medicalAlerts = [],
  enrichedVisits = [],
  treatments = [],
  isLoadingAppointments = false,
  isLoadingMedical = false,
}: ProfileTabsProps) {
  return (
    <Tabs value={activeTab} defaultValue={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="flex py-1.5 bg-ui-background-subtle">
        {tabItems.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className={`px-4 py-2.5 text-sm font-medium rounded-lg border ${
              activeTab === tab.id
                ? "bg-brand-blue-light text-brand-blue border-brand-blue hover:bg-brand-blue-light hover:text-brand-blue"
                : "text-text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview">{children}</TabsContent>

      <TabsContent value="appointments">
        <AppointmentsTab appointments={appointments} isLoading={isLoadingAppointments} />
      </TabsContent>

      <TabsContent value="medical-history">
        <MedicalHistoryTab
          medicalAlerts={medicalAlerts}
          enrichedVisits={enrichedVisits}
          treatments={treatments}
          isLoading={isLoadingMedical}
        />
      </TabsContent>
    </Tabs>
  );
}
