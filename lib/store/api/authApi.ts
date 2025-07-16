import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { LoginCredentials, LoginResponse, TokenResponse } from "../types";

// Simple base query for auth operations (no 401 interceptor needed)
const authBaseQuery = fetchBaseQuery({
  baseUrl: "/api",
  prepareHeaders: (headers) => {
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    return headers;
  },
  credentials: "include",
});

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: authBaseQuery,
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

          // Set both session cookie and JWT token cookie for unified auth
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 1);
          document.cookie = `auth_session=demo_authenticated; expires=${expiryDate.toUTCString()}; path=/`;
          document.cookie = `auth_token=${tokenData.token.replace(/^Bearer\s+/, "")}; expires=${expiryDate.toUTCString()}; path=/`;

          // Return login response with user data and token
          return {
            data: {
              success: true,
              user: {
                id: "test-user-id",
                email: credentials.email,
                role: "admin",
                medspaId: "MS-1001",
                providerId: "PR-2001",
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
          // Clear both session and JWT token cookies
          document.cookie = "auth_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

          // Clear all authentication-related localStorage items
          localStorage.removeItem("auth_token");
          localStorage.removeItem("loggedInUserRole");
          localStorage.removeItem("chatThreads");
          localStorage.removeItem("chatMessages");
          // Keep UI preferences like sidebarCollapsed

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
