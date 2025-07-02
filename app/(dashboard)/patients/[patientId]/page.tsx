"use client";

import {
  type HealthInsightsResponse,
  type MedicalHistoryResponse,
  type VisitsResponse,
  useCreateHealthInsightsMutation,
  useGetHealthInsightsQuery,
  useGetPatientDetailsQuery,
  useGetPatientMedicalHistoryQuery,
  useGetPatientVisitsQuery,
} from "@/lib/store/api";
import {
  transformAppointmentsData,
  transformCampaignsData,
  transformCommunicationPreferences,
  transformDocumentsData,
  transformMedicalAlertsData,
  transformPatientData,
  transformTreatmentHistoryData,
  transformTreatmentsData,
  transformUserHistoryData,
} from "@/utils/patient.utils";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppointmentCard } from "./components/AppointmentCard";
import { CommunicationCard } from "./components/CommunicationCard";
import { ProfileCard } from "./components/ProfileCard";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileTabs } from "./components/ProfileTabs";
import TeraInsightsCard from "./components/TeraInsightsCard";
import { TreatmentCard } from "./components/TreatmentCard";
import TreatmentHistoryCard from "./components/TreatmentHistoryCard";
import { UserHistoryCard } from "./components/UserHistoryCard";
import { CommunicationPreferences } from "./types";

// Configuration: Number of days after which insights are considered outdated
const INSIGHTS_REFRESH_THRESHOLD_DAYS = 7;

export default function PatientProfilePage() {
  const params = useParams();
  const patientId = params?.patientId as string;
  const [activeTab, setActiveTab] = useState("overview");
  const [preferences, setPreferences] = useState<CommunicationPreferences>({
    emailNotifications: false,
    smsReminders: false,
  });

  // API calls using Redux
  const {
    data: patientDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useGetPatientDetailsQuery(patientId);

  const {
    data: medicalHistory,
    isLoading: isLoadingHistory,
    error: historyError,
  } = useGetPatientMedicalHistoryQuery(patientId);

  const {
    data: visitsData,
    isLoading: isLoadingVisits,
    error: visitsError,
  } = useGetPatientVisitsQuery(patientId);

  // Health insights API calls
  const {
    data: healthInsights,
    isLoading: isLoadingInsights,
    error: insightsError,
    refetch: refetchInsights,
  } = useGetHealthInsightsQuery(patientId);

  const [createHealthInsights, { isLoading: isCreatingInsights }] =
    useCreateHealthInsightsMutation();

  const handleTogglePreference = (key: keyof CommunicationPreferences, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleViewAll = (section: string) => {
    setActiveTab(section);
  };

  // Effect to handle insights creation if needed
  useEffect(() => {
    const shouldRefreshInsights = (insights: HealthInsightsResponse | undefined): boolean => {
      if (!insights?.data?.dataQuality?.lastUpdated) return true;

      const lastUpdated = new Date(insights.data.dataQuality.lastUpdated);
      const now = new Date();
      const daysDifference = Math.floor(
        (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24),
      );

      return daysDifference >= INSIGHTS_REFRESH_THRESHOLD_DAYS;
    };

    const handleInsightsCreation = async () => {
      // Only proceed if we have patient data and insights query has completed
      if (!patientDetails?.data || isLoadingInsights) return;

      // If insights don't exist or are outdated, create new ones
      if (!healthInsights || insightsError || shouldRefreshInsights(healthInsights)) {
        try {
          await createHealthInsights(patientId).unwrap();
          // Refetch the insights after creation
          refetchInsights();
        } catch (error) {
          console.error("Failed to create health insights:", error);
        }
      }
    };

    handleInsightsCreation();
  }, [
    patientDetails,
    healthInsights,
    insightsError,
    isLoadingInsights,
    patientId,
    createHealthInsights,
    refetchInsights,
  ]);

  useEffect(() => {
    if (patientDetails?.data?.communicationPreference) {
      setPreferences(transformCommunicationPreferences(patientDetails));
    }
  }, [patientDetails]);

  // Loading state
  if (isLoadingDetails || isLoadingHistory || isLoadingVisits) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading patient data...</p>
      </div>
    );
  }

  // Error state
  if (detailsError || historyError || visitsError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Error loading patient data</p>
      </div>
    );
  }

  // No data state
  if (!patientDetails?.data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Patient not found</p>
      </div>
    );
  }

  const patient = transformPatientData(patientDetails);
  const defaultVisitsData: VisitsResponse = {
    success: true,
    data: {
      appointments: {
        totalCount: 0,
        upcomingAppointments: [],
      },
      packages: {
        totalCount: 0,
        inactiveCount: 0,
        activeCount: 0,
        activePackages: [],
        inactivePackages: [],
      },
      enrichedVisits: [],
    },
    timestamp: "",
  };

  const defaultMedicalHistory: MedicalHistoryResponse = {
    success: true,
    data: {
      patientId: "",
      conditions: [],
      visitHistory: defaultVisitsData.data,
    },
    timestamp: "",
  };

  const appointments = transformAppointmentsData(visitsData ?? defaultVisitsData);
  const treatments = transformTreatmentsData(visitsData ?? defaultVisitsData);
  const treatmentHistory = transformTreatmentHistoryData(visitsData ?? defaultVisitsData);
  const medicalAlerts = transformMedicalAlertsData(
    medicalHistory ?? defaultMedicalHistory,
    patientDetails,
  );
  const documents = transformDocumentsData(visitsData ?? defaultVisitsData);
  const userHistory = transformUserHistoryData(visitsData ?? defaultVisitsData, patientDetails);
  const campaigns = transformCampaignsData(visitsData ?? defaultVisitsData);

  return (
    <div className="flex flex-col min-h-screen px-6 pb-6">
      <ProfileHeader patient={patient} />

      <div className="flex-1 flex gap-6 pb-6">
        <ProfileCard patient={patient} />
        <div className="flex flex-1">
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            appointments={appointments}
            medicalAlerts={medicalAlerts}
            treatmentHistory={treatmentHistory}
            treatments={treatments}
            isLoadingAppointments={isLoadingVisits}
            isLoadingMedical={isLoadingHistory || isLoadingVisits}
          >
            {activeTab === "overview" && (
              <div className="grid grid-cols-2 gap-6">
                <div className="grid grid-cols-1 gap-6 h-fit">
                  <TeraInsightsCard
                    insights={healthInsights?.data?.insights}
                    isLoading={isLoadingInsights || isCreatingInsights}
                  />
                  <CommunicationCard preferences={preferences} onToggle={handleTogglePreference} />
                  {/* <MedicalAlertsCard
                    alerts={medicalAlerts}
                    onEdit={() => handleViewAll("medical-history")}
                  /> */}
                  {/* <CampaignsCard
                    campaigns={campaigns}
                    onViewAll={() => handleViewAll("notifications")}
                  /> */}
                </div>
                <div className="grid grid-cols-1 gap-6 h-fit">
                  <TreatmentHistoryCard
                    treatments={treatmentHistory}
                    isLoading={isLoadingVisits}
                    onViewAll={() => handleViewAll("medical-history")}
                  />
                  <TreatmentCard
                    treatments={treatments}
                    onViewAll={() => handleViewAll("medical-history")}
                  />
                  <AppointmentCard
                    appointments={appointments}
                    onViewAll={() => handleViewAll("appointments")}
                  />

                  {/* <DocumentsCard
                    documents={documents}
                    onViewAll={() => handleViewAll("documents")}
                  /> */}
                  <UserHistoryCard history={userHistory} />
                </div>
              </div>
            )}
          </ProfileTabs>
        </div>
      </div>
    </div>
  );
}
