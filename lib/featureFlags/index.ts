// lib/featureFlags/index.ts
import { featureFlags } from "./config";
import { FeatureFlagKey } from "./types";

export class FeatureFlagService {
  private static instance: FeatureFlagService;
  private flags = featureFlags;

  static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  isEnabled(flag: FeatureFlagKey): boolean {
    return this.flags[flag] ?? false;
  }

  // Method to update flags at runtime (useful for admin panels)
  updateFlag(flag: FeatureFlagKey, value: boolean): void {
    this.flags[flag] = value;
  }

  // Batch update multiple flags
  updateFlags(updates: Partial<typeof this.flags>): void {
    this.flags = { ...this.flags, ...updates };
  }

  getAllFlags() {
    return { ...this.flags };
  }
}

// Export convenience functions
export const featureFlagService = FeatureFlagService.getInstance();
export const isFeatureEnabled = (flag: FeatureFlagKey) => featureFlagService.isEnabled(flag);

export type { FeatureFlagKey } from "./types";
