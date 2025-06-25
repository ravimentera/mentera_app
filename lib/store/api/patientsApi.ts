import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

interface Patient {
  id: string;
  patientId: string;
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  tags: string[];
  status: string;
  lastVisitDate: string | null;
  nextAppointment: string | null;
}

interface PatientsResponse {
  success: boolean;
  data: Patient[];
  message?: string;
}

export const patientsApi = createApi({
  reducerPath: "patientsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://34.204.48.222:5001/api",
    prepareHeaders: (headers, { getState }) => {
      // Get token from Redux state
      const state = getState() as RootState;
      const token = state.auth.token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      } else {
        // Fallback to localStorage if Redux state doesn't have token
        const fallbackToken = localStorage.getItem("auth_token");
        if (fallbackToken) {
          headers.set("Authorization", `Bearer ${fallbackToken}`);
        }
      }

      // Set required headers for the external API
      headers.set("x-medspa-id", "MS-1001");
      headers.set("Content-Type", "application/json");

      return headers;
    },
  }),
  tagTypes: ["Patient"],
  endpoints: (builder) => ({
    getPatientsByProvider: builder.query<Patient[], string>({
      query: (providerId) => `/patients/provider/${providerId}/patients`,
      transformResponse: (response: PatientsResponse) => {
        return response.success ? response.data : [];
      },
      transformErrorResponse: (response) => {
        return response;
      },
      providesTags: ["Patient"],
    }),
    // getPatientById: builder.query<Patient, string>({
    //   query: (patientId) => `/patients/${patientId}`,
    //   providesTags: (result, error, patientId) => [{ type: "Patient", id: patientId }],
    // }),
    // createPatient: builder.mutation<Patient, Partial<Patient>>({
    //   query: (newPatient) => ({
    //     url: "/patients",
    //     method: "POST",
    //     body: newPatient,
    //   }),
    //   invalidatesTags: ["Patient"],
    // }),
    // updatePatient: builder.mutation<Patient, { id: string; data: Partial<Patient> }>({
    //   query: ({ id, data }) => ({
    //     url: `/patients/${id}`,
    //     method: "PUT",
    //     body: data,
    //   }),
    //   invalidatesTags: (result, error, { id }) => [{ type: "Patient", id }],
    // }),
    // deletePatient: builder.mutation<void, string>({
    //   query: (id) => ({
    //     url: `/patients/${id}`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: ["Patient"],
    // }),
  }),
});

export const {
  useGetPatientsByProviderQuery,
  // useGetPatientByIdQuery,
  // useCreatePatientMutation,
  // useUpdatePatientMutation,
  // useDeletePatientMutation,
} = patientsApi;
