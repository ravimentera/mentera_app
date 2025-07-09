import { AppointmentCard } from "@/app/(dashboard)/patients/[patientId]/components/AppointmentCard";
import { CommunicationCard } from "@/app/(dashboard)/patients/[patientId]/components/CommunicationCard";
import { TreatmentCard } from "@/app/(dashboard)/patients/[patientId]/components/TreatmentCard";
import TreatmentHistoryCard from "@/app/(dashboard)/patients/[patientId]/components/TreatmentHistoryCard";
import { UserHistoryCard } from "@/app/(dashboard)/patients/[patientId]/components/UserHistoryCard";
import { CommunicationPreferences } from "@/app/(dashboard)/patients/[patientId]/types";
import { Badge } from "@/components/atoms";
import {
  type VisitsResponse,
  useGetPatientDetailsQuery,
  useGetPatientMedicalHistoryQuery,
  useGetPatientVisitsQuery,
} from "@/lib/store/api";
import { cn } from "@/lib/utils";
import { ApprovalItem, getApprovalPatientInfo } from "@/mock/approvals.data";
import type { PatientWithProfile } from "@/types/user.types";
import {
  transformAppointmentsData,
  transformCommunicationPreferences,
  transformTreatmentsData,
  transformUserHistoryData,
} from "@/utils/patient.utils";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PatientOverviewProps {
  approval: ApprovalItem;
  patient?: PatientWithProfile | null; // Optional patient prop for consistent data
  className?: string;
}

export function PatientOverview({ approval, patient, className }: PatientOverviewProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [preferences, setPreferences] = useState<CommunicationPreferences>({
    emailNotifications: false,
    smsReminders: false,
  });
  const router = useRouter();

  const patientId = approval.patientId;

  // API calls using Redux
  const {
    data: patientDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useGetPatientDetailsQuery(patientId, { skip: !patientId });

  const {
    data: medicalHistory,
    isLoading: isLoadingHistory,
    error: historyError,
  } = useGetPatientMedicalHistoryQuery(patientId, { skip: !patientId });

  const {
    data: visitsData,
    isLoading: isLoadingVisits,
    error: visitsError,
  } = useGetPatientVisitsQuery(patientId, { skip: !patientId });

  // Update communication preferences when patient data loads
  useEffect(() => {
    if (patientDetails?.data?.communicationPreference) {
      setPreferences(transformCommunicationPreferences(patientDetails));
    }
  }, [patientDetails]);

  const handleTogglePreference = (key: keyof CommunicationPreferences, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Use the patient prop if available, otherwise fall back to approval patient info or API data
  const patientInfo = patient
    ? {
        firstName: patient.profile.firstName,
        lastName: patient.profile.lastName,
      }
    : patientDetails?.data
      ? {
          firstName: patientDetails.data.firstName || "N/A",
          lastName: patientDetails.data.lastName || "N/A",
        }
      : getApprovalPatientInfo(approval);

  const handlePatientRedirect = () => {
    router.push(`/patients/${approval.patientId}`);
  };

  // Transform API data for components
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

  const defaultPatientDetails = {
    success: true,
    data: {
      id: "",
      patientId: "",
      chartId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      allergies: [],
      alerts: [],
      tags: [],
      providerIds: [],
      status: "",
      medspaId: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      createdAt: "",
      updatedAt: "",
      communicationPreference: {
        emailOptIn: false,
        smsOptIn: false,
        pushOptIn: false,
        voiceOptIn: false,
        directMailOptIn: false,
      },
    },
    timestamp: "",
  };

  const appointments = transformAppointmentsData(visitsData ?? defaultVisitsData);
  const treatments = transformTreatmentsData(visitsData ?? defaultVisitsData);
  const userHistory = transformUserHistoryData(
    visitsData ?? defaultVisitsData,
    patientDetails ?? defaultPatientDetails,
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="flex flex-col gap-4">
            {/* Patient Detail Card */}
            <div className="space-y-4">
              <div className="w-full flex gap-8">
                <div className="text-sm text-muted-foreground max-w-11 flex flex-col gap-1">
                  <div> Name</div>
                  <div>Phone</div>
                  <div>Email</div>
                </div>
                <div className="font-medium text-text text-sm flex flex-col gap-1">
                  <div>{patientInfo?.firstName + " " + patientInfo?.lastName || "N/A"}</div>{" "}
                  <div>{patientDetails?.data?.phone || "N/A"}</div>
                  <div>{patientDetails?.data?.email || "N/A"}</div>
                </div>
              </div>
            </div>
            {patientDetails?.data?.tags && patientDetails?.data?.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {patientDetails?.data?.tags.map((tag) => (
                  <Badge variant="primary" key={tag}>
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <div className="bg-white border-b border-border space-y-4"></div>

            {/* Treatment History */}
            <TreatmentHistoryCard
              enrichedVisits={visitsData?.data?.enrichedVisits}
              isLoading={isLoadingVisits}
              onViewAll={() => router.push(`/patients/${approval.patientId}`)}
              showBorder={false}
            />
            <div className="bg-white border-b border-border space-y-4"></div>

            {/* Active Treatments */}
            <TreatmentCard
              treatments={treatments}
              onViewAll={() => router.push(`/patients/${approval.patientId}`)}
              showBorder={false}
            />
            <div className="bg-white border-b border-border space-y-4"></div>

            {/* Next Appointment */}
            <AppointmentCard
              appointments={appointments}
              onViewAll={() => router.push(`/patients/${approval.patientId}/appointments`)}
              showBorder={false}
            />
            <div className="bg-white border-b border-border space-y-4"></div>

            {/* User History */}
            <UserHistoryCard history={userHistory} showBorder={false} />

            <div className="bg-white border-b border-border space-y-4"></div>

            {/* Communication */}
            <CommunicationCard
              preferences={preferences}
              onToggle={handleTogglePreference}
              showBorder={false}
            />
          </div>
        );
      default:
        return (
          <div className="h-96 flex items-center justify-center text-gray-500">
            <p>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} content coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className={cn("overflow-y-auto", className)}>
      {/* Header */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Patient Overview</h2>
          <button
            type="button"
            onClick={handlePatientRedirect}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="View patient details"
          >
            <ExternalLink className="w-5 h-5 text-interactive" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-1 overflow-y-auto">{renderTabContent()}</div>
    </div>
  );
}
