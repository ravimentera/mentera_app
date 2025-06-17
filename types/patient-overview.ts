export interface PatientOverviewCard {
  id: string;
  title: string;
  backgroundColor: string;
  data: PatientOverviewData[];
}

export interface PatientOverviewData {
  label: string;
  value: string;
  description?: string;
}

export interface PatientOverviewPanelProps {
  className?: string;
}

export interface PatientOverviewCardProps {
  card: PatientOverviewCard;
  className?: string;
}
