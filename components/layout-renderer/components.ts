import { CardComponent as Card } from "@/components/organisms/card";
import { ActivePackagesCard } from "@/components/organisms/patientComponents/ActivePackagesCard";
import { CampaignsCard } from "@/components/organisms/patientComponents/CampaignsCard";
import { MedicalSummaryCard } from "@/components/organisms/patientComponents/MedicalSummaryCard";
import { NextAppointmentCard } from "@/components/organisms/patientComponents/NextAppointmentCard";
import { RecentDocumentsCard } from "@/components/organisms/patientComponents/RecentDocumentsCard";
import { UserHistoryCard } from "@/components/organisms/patientComponents/UserHistoryCard";

export const componentMap: Record<string, React.ComponentType<any>> = {
  UserHistoryCard,
  RecentDocumentsCard,
  ActivePackagesCard,
  CampaignsCard,
  NextAppointmentCard,
  MedicalSummaryCard,
  Card,
};
