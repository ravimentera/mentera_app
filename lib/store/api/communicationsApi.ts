import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";
import type { ApprovalsResponse, ConversationResponse } from "../types";

export const communicationsApi = createApi({
  reducerPath: "communicationsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/proxy",
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.token || localStorage.getItem("auth_token");

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      // Add required headers for Next.js API routes
      headers.set("Content-Type", "application/json");
      headers.set("Accept", "application/json");
      headers.set("x-medspa-id", "MS-1001");

      return headers;
    },
    credentials: "include", // This ensures cookies are sent with requests
  }),
  tagTypes: ["Approvals", "Conversations"],
  endpoints: (builder) => ({
    getPendingApprovals: builder.query<
      ApprovalsResponse,
      { providerId: string; limit?: number; offset?: number }
    >({
      query: ({ providerId, limit = 50, offset = 0 }) =>
        `/communication/approvals/pending/${providerId}?limit=${limit}&offset=${offset}`,
      providesTags: ["Approvals"],
    }),
    getPatientConversation: builder.query<
      ConversationResponse,
      { patientId: string; providerId: string }
    >({
      query: ({ patientId, providerId }) =>
        `/communication/communications/patient/${patientId}/conversation?providerId=${providerId}`,
      providesTags: ["Conversations"],
    }),
  }),
});

export const { useGetPendingApprovalsQuery, useGetPatientConversationQuery } = communicationsApi;
