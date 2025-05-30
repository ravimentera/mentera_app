import { AppointmentCalendar } from "@/app/(dashboard)/appointments/components/AppointmentCalendar";
import { CardComponent as Card } from "@/components/organisms/Card";
import { FallbackCard } from "@/components/organisms/FallbackCard";
import { ActionableInsightsCard } from "@/components/organisms/patient-components/ActionableInsightsCard";
import { ActivePackagesCard } from "@/components/organisms/patient-components/ActivePackagesCard";
import { CampaignsCard } from "@/components/organisms/patient-components/CampaignsCard";
import { MedicalSummaryCard } from "@/components/organisms/patient-components/MedicalSummaryCard";
import { NextAppointmentCard } from "@/components/organisms/patient-components/NextAppointmentCard";
import { ObservationCard } from "@/components/organisms/patient-components/ObservationCard";
import { ProcedureCard } from "@/components/organisms/patient-components/ProcedureCard";
import { RecentDocumentsCard } from "@/components/organisms/patient-components/RecentDocumentsCard";
import { RecommendationCard } from "@/components/organisms/patient-components/RecommendationCard";
import { TreatmentNoteCard } from "@/components/organisms/patient-components/TreatmentNoteCard";
import { UserHistoryCard } from "@/components/organisms/patient-components/UserHistoryCard";

export const componentMap: Record<string, React.ComponentType<any>> = {
  UserHistoryCard,
  RecentDocumentsCard,
  ActivePackagesCard,
  CampaignsCard,
  NextAppointmentCard,
  MedicalSummaryCard,
  ObservationCard,
  ProcedureCard,
  RecommendationCard,
  TreatmentNoteCard,
  ActionableInsightsCard,
  AppointmentCalendar,
  FallbackCard,
  Card,
};
