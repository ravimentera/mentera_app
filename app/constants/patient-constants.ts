export enum PatientStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum PatientStatusFilter {
  ALL = "All",
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export const PATIENT_STATUS_OPTIONS = [
  { value: PatientStatusFilter.ALL, label: "All Status" },
  { value: PatientStatusFilter.ACTIVE, label: "Active" },
  { value: PatientStatusFilter.INACTIVE, label: "Inactive" },
] as const;
