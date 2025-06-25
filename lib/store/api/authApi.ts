import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { LoginCredentials, LoginResponse, TokenResponse } from "../types";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
  }),
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    // Generate JWT token using existing /api/token endpoint
    generateToken: builder.query<TokenResponse, void>({
      query: () => "/token",
      providesTags: ["Auth"],
    }),

    // Login endpoint (currently just calls token generation)
    login: builder.mutation<LoginResponse, LoginCredentials>({
      queryFn: async (credentials) => {
        try {
          // Simulate login validation (replace with actual API call later)
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Generate token using existing endpoint
          const tokenResponse = await fetch("/api/token");
          if (!tokenResponse.ok) {
            throw new Error(`Token generation failed: ${tokenResponse.status}`);
          }

          const tokenData = await tokenResponse.json();

          // Set cookie for UI navigation (existing functionality)
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 1);
          document.cookie = `auth_session=demo_authenticated; expires=${expiryDate.toUTCString()}; path=/`;

          // Return login response with user data and token
          return {
            data: {
              success: true,
              user: {
                id: "test-user-id",
                email: credentials.email,
                role: "admin",
                medspaId: "MS-1001",
                providerId: "NR-2001",
              },
              token: tokenData.token,
            },
          };
        } catch (error: any) {
          return { error: { status: "FETCH_ERROR", error: error.message } };
        }
      },
      invalidatesTags: ["Auth"],
    }),

    // Logout endpoint
    logout: builder.mutation<void, void>({
      queryFn: async () => {
        try {
          // Clear cookie
          document.cookie = "auth_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          // Clear localStorage
          localStorage.removeItem("auth_token");

          return { data: undefined };
        } catch (error: any) {
          return { error: { status: "FETCH_ERROR", error: error.message } };
        }
      },
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useGenerateTokenQuery,
  useLazyGenerateTokenQuery,
  useLoginMutation,
  useLogoutMutation,
} = authApi;
