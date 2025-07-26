// lib/featureFlags/types.ts
export interface FeatureFlags {
  dynamicLayout: boolean;
  // Add other features here
}

export type FeatureFlagKey = keyof FeatureFlags;
