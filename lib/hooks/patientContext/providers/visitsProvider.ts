import { store } from "@/lib/store";
import { patientsApi } from "@/lib/store/api";
import type { ContextProvider, PatientPackage, PatientVisit } from "@/lib/types/patientContext";

/**
 * Visits Provider
 *
 * Fetches patient visit history, packages, and appointments using the patient visits API
 */
export const visitsProvider: ContextProvider<{
  enrichedVisits: PatientVisit[];
  packages: {
    totalCount: number;
    activeCount: number;
    activePackages: PatientPackage[];
  };
  appointments: {
    totalCount: number;
    upcomingAppointments: Array<{
      id: string;
      startTime: string;
      endTime: string;
      status: string;
      notes: string;
    }>;
  };
}> = {
  key: "visits",

  fetch: async (patientId: string) => {
    try {
      // Use RTK Query's direct API call through the store
      const result = await store
        .dispatch(patientsApi.endpoints.getPatientVisits.initiate(patientId))
        .unwrap();

      // Add defensive checks for undefined data
      if (!result?.data) {
        console.warn("[visitsProvider] API returned no data for patient:", patientId);
        return {
          enrichedVisits: [],
          packages: {
            totalCount: 0,
            activeCount: 0,
            activePackages: [],
          },
          appointments: {
            totalCount: 0,
            upcomingAppointments: [],
          },
        };
      }

      // Check if enrichedVisits exists and is an array
      const enrichedVisitsData = result.data.enrichedVisits;
      if (!Array.isArray(enrichedVisitsData)) {
        console.warn(
          "[visitsProvider] enrichedVisits is not an array:",
          enrichedVisitsData,
          "for patient:",
          patientId,
        );
      }

      // Transform the enriched visits data with safe array handling
      const enrichedVisits: PatientVisit[] = (enrichedVisitsData || []).map((visit) => ({
        id: visit.id,
        patientId: visit.patientId,
        visitDate: visit.visitDate,
        treatmentNotesId: visit.treatmentNotesId,
        providerId: visit.providerId,
        nextTreatment: visit.nextTreatment,
        followUpDate: visit.followUpDate,
        treatment: {
          id: visit.treatment.id,
          patientId: visit.treatment.patientId,
          procedure: visit.treatment.procedure,
          areasTreated: visit.treatment.areasTreated,
          unitsUsed: visit.treatment.unitsUsed,
          volumeUsed: visit.treatment.volumeUsed,
          observations: visit.treatment.observations,
          providerRecommendations: visit.treatment.providerRecommendations,
          sessionNumber: visit.treatment.sessionNumber,
          isPackageSession: visit.treatment.isPackageSession,
          sessionPrice: visit.treatment.sessionPrice,
        },
        preCheck: visit.preCheck.map((check) => ({
          id: check.id,
          visitId: check.visitId,
          medications: check.medications,
          consentSigned: check.consentSigned,
          allergyCheck: check.allergyCheck,
        })),
        postCare: visit.postCare.map((care) => ({
          id: care.id,
          visitId: care.visitId,
          instructionsProvided: care.instructionsProvided,
          followUpRecommended: care.followUpRecommended,
          productsRecommended: care.productsRecommended,
          aftercareNotes: care.aftercareNotes,
        })),
      }));

      // Transform packages data with safe array handling
      const packagesData = result.data.packages;
      const activePackagesData = packagesData?.activePackages;
      if (!Array.isArray(activePackagesData)) {
        console.warn(
          "[visitsProvider] activePackages is not an array:",
          activePackagesData,
          "for patient:",
          patientId,
        );
      }

      const activePackages: PatientPackage[] = (activePackagesData || []).map((pkg) => ({
        id: pkg.id,
        packageName: pkg.packageName,
        treatmentType: pkg.treatmentType,
        totalSessions: pkg.totalSessions,
        sessionsUsed: pkg.sessionsUsed,
        sessionsRemaining: pkg.sessionsRemaining,
        purchaseDate: pkg.purchaseDate,
        expirationDate: pkg.expirationDate,
        packageStatus: pkg.packageStatus,
        packagePrice: pkg.packagePrice,
      }));

      return {
        enrichedVisits,
        packages: {
          totalCount: packagesData?.totalCount || 0,
          activeCount: packagesData?.activeCount || 0,
          activePackages,
        },
        appointments: {
          totalCount: result.data.appointments?.totalCount || 0,
          upcomingAppointments: (result.data.appointments?.upcomingAppointments || []).map(
            (apt) => ({
              id: apt.id,
              startTime: apt.startTime,
              endTime: apt.endTime,
              status: apt.status,
              notes: apt.notes,
            }),
          ),
        },
      };
    } catch (error) {
      console.error("Visits provider error:", error);
      throw new Error(`Failed to fetch patient visits: ${error}`);
    }
  },
};
