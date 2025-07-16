import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";
import type { RootState } from "../index";
import { logout } from "../slices/authSlice";

/**
 * Custom base query that handles 401 responses globally
 * Shows session timeout toast and automatically logs out user
 */
export const createAuthInterceptor = (
  baseUrl: string,
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
  const baseQuery = fetchBaseQuery({
    baseUrl,
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
  });

  return async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);

    // Handle 401 Unauthorized responses
    if (result.error && result.error.status === 401) {
      // Show session timeout toast
      toast.error("Session expired. Please log in again.", {
        description: "You will be redirected to the login page.",
        duration: 3000,
      });

      // Dispatch logout action to clear auth state
      api.dispatch(logout());

      // Clear all auth-related storage
      if (typeof window !== "undefined") {
        document.cookie = "auth_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        localStorage.removeItem("auth_token");
        localStorage.removeItem("loggedInUserRole");
      }

      // Redirect to login page after a short delay
      setTimeout(() => {
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          const loginUrl = `/login${currentPath !== "/" ? `?returnUrl=${encodeURIComponent(currentPath)}` : ""}`;
          window.location.href = loginUrl;
        }
      }, 1000);
    }

    return result;
  };
};

/**
 * Base query for proxy API calls with 401 handling
 */
export const proxyAuthBaseQuery = createAuthInterceptor("/api/proxy");
