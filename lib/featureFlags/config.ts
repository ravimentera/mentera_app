// lib/featureFlags/config.ts
import { FeatureFlags } from "./types";

// Default feature flag values
const defaultFlags: FeatureFlags = {
  dynamicLayout: false,
};

// Environment-based overrides
const environmentFlags: Partial<FeatureFlags> = {
  // Override flags based on environment
  ...(process.env.NODE_ENV === "development" && {
    dynamicLayout: process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_LAYOUT === "true",
  }),
  ...(process.env.NODE_ENV === "production" && {
    dynamicLayout: process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_LAYOUT === "true",
  }),
};

export const featureFlags: FeatureFlags = {
  ...defaultFlags,
  ...environmentFlags,
};
