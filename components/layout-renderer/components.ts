import { AppointmentCalendar } from "@/app/(dashboard)/appointments/components/AppointmentCalendar";
import { CardComponent as Card } from "@/components/organisms/card";
import { ActionableInsightsCard } from "@/components/organisms/patientComponents/ActionableInsightsCard";
import { ActivePackagesCard } from "@/components/organisms/patientComponents/ActivePackagesCard";
import { CampaignsCard } from "@/components/organisms/patientComponents/CampaignsCard";
import { MedicalSummaryCard } from "@/components/organisms/patientComponents/MedicalSummaryCard";
import { NextAppointmentCard } from "@/components/organisms/patientComponents/NextAppointmentCard";
import { ObservationCard } from "@/components/organisms/patientComponents/ObservationCard";
import { ProcedureCard } from "@/components/organisms/patientComponents/ProcedureCard";
import { RecentDocumentsCard } from "@/components/organisms/patientComponents/RecentDocumentsCard";
import { RecommendationCard } from "@/components/organisms/patientComponents/RecommendationCard";
import { TreatmentNoteCard } from "@/components/organisms/patientComponents/TreatmentNoteCard";
import { UserHistoryCard } from "@/components/organisms/patientComponents/UserHistoryCard";

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
  Card,
};
