import { Patient } from "./types";

export function filterPatients(patients: Patient[], searchQuery: string) {
  if (!searchQuery) return patients;

  const query = searchQuery.toLowerCase();
  return patients.filter((patient) => {
    return (
      patient.patientId.toLowerCase().includes(query) ||
      patient.provider.toLowerCase().includes(query) ||
      patient.treatmentNotes.procedure.toLowerCase().includes(query)
    );
  });
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatPhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
}
