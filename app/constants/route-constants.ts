// Base route groups
export const BASE_ROUTES = {
  AUTH: "/auth",
  DASHBOARD: "/dashboard",
  REGISTER: "/register",
  API: "/api",
};

// Authentication Routes
export const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
};

// Registration Step Routes
export const REGISTRATION_ROUTES = {
  BASE: "/register/steps",
  BUSINESS_INFORMATION: "/register/steps/business-information",
  TREATMENTS_OFFERED: "/register/steps/treatments-offered",
  getStepRoute: (stepId: string) => `/register/steps/${stepId}`,
};

// Dashboard Routes - matching actual folder structure in (dashboard) group
export const DASHBOARD_PATHS = {
  HOME: "/dashboard", // This is a special case - it's at /dashboard path but in (dashboard)/dashboard folder
  PATIENTS: "/patients",
  APPOINTMENTS: "/appointments",
  APPROVALS: "/approvals",
  INBOX: "/inbox",
  TREATMENTS: "/treatments",
  ANALYTICS: "/analytics",
  SETTINGS: "/settings",
  PROFILE: "/profile",
};

// API Routes
export const API_PATHS = {
  // Auth API paths
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    RESET_PASSWORD: "/api/auth/reset-password",
  },
  // Resource API paths
  PATIENTS: "/api/patients",
  APPOINTMENTS: "/api/appointments",
  TREATMENTS: "/api/treatments",
};

// Static Page Routes
export const STATIC_ROUTES = {
  TERMS: "/terms",
  PRIVACY: "/privacy",
  CONTACT: "/contact",
  HOME: "/",
};

// Combine all routes for easy access
export const APP_ROUTES = {
  ...AUTH_ROUTES,
  ...REGISTRATION_ROUTES,
  ...DASHBOARD_PATHS,
  ...STATIC_ROUTES,
};

// Redirect paths
export const REDIRECT_PATHS = {
  AFTER_LOGIN: DASHBOARD_PATHS.HOME,
  AFTER_REGISTER: REGISTRATION_ROUTES.BUSINESS_INFORMATION,
  AFTER_LOGOUT: AUTH_ROUTES.LOGIN,
};
