import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";
import type { RootState } from "../index";
import type { AuthState } from "../types";

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
};

// Auth slice
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      // Clear localStorage items (as backup, main cleanup is in logout API)
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("loggedInUserRole");
        localStorage.removeItem("chatThreads");
        localStorage.removeItem("chatMessages");
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload.replace(/^Bearer\s+/, "");
      state.isAuthenticated = true;
      // Also store in localStorage as backup
      localStorage.setItem("auth_token", action.payload.replace(/^Bearer\s+/, ""));
    },
    setUser: (state, action: PayloadAction<AuthState["user"]>) => {
      state.user = action.payload;
      if (action.payload) {
        state.isAuthenticated = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle login API
      .addMatcher(authApi.endpoints.login.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success && action.payload.user && action.payload.token) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token.replace(/^Bearer\s+/, "");
          // Store in localStorage as backup
          localStorage.setItem("auth_token", action.payload.token.replace(/^Bearer\s+/, ""));
        }
      })
      .addMatcher(authApi.endpoints.login.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Login failed";
      })
      // Handle generate token API
      .addMatcher(authApi.endpoints.generateToken.matchFulfilled, (state, action) => {
        state.token = action.payload.token.replace(/^Bearer\s+/, "");
        state.isAuthenticated = true;
        // Store in localStorage as backup
        localStorage.setItem("auth_token", action.payload.token.replace(/^Bearer\s+/, ""));
      })
      // Handle logout API
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.token = null;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      });
  },
});

export const { logout, clearError, setToken, setUser } = authSlice.actions;

// Selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
