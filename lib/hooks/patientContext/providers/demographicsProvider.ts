import { store } from "@/lib/store";
import { patientsApi } from "@/lib/store/api";
import type { ContextProvider, PatientDemographics } from "@/lib/types/patientContext";

/**
 * Demographics Provider
 *
 * Fetches patient demographic information using the patient details API
 */
export const demographicsProvider: ContextProvider<PatientDemographics> = {
  key: "demographics",

  fetch: async (patientId: string): Promise<PatientDemographics> => {
    try {
      // Use RTK Query's direct API call through the store
      const result = await store
        .dispatch(patientsApi.endpoints.getPatientDetails.initiate(patientId))
        .unwrap();

      // Transform the API response to match our PatientDemographics interface
      return {
        patientId: result.data.patientId,
        firstName: result.data.firstName,
        lastName: result.data.lastName,
        email: result.data.email,
        phone: result.data.phone,
        dateOfBirth: result.data.dateOfBirth,
        gender: result.data.gender,
        address: result.data.address,
        city: result.data.city,
        state: result.data.state,
        zipCode: result.data.zipCode,
        country: result.data.country,
        allergies: result.data.allergies,
        alerts: result.data.alerts,
        tags: result.data.tags,
        status: result.data.status,
        communicationPreference: result.data.communicationPreference,
      };
    } catch (error) {
      console.error("Demographics provider error:", error);
      throw new Error(`Failed to fetch patient demographics: ${error}`);
    }
  },
};
