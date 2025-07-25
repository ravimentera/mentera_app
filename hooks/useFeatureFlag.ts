// hooks/useFeatureFlag.ts
import { useCallback, useEffect, useState } from "react";
import { featureFlagService, FeatureFlagKey } from "@/lib/featureFlags";

export function useFeatureFlag(flag: FeatureFlagKey) {
  const [isEnabled, setIsEnabled] = useState(featureFlagService.isEnabled(flag));

  useEffect(() => {
    // Listen for flag changes if you implement real-time updates
    const handleFlagChange = () => {
      setIsEnabled(featureFlagService.isEnabled(flag));
    };

    // For now, just set the initial value
    setIsEnabled(featureFlagService.isEnabled(flag));
  }, [flag]);

  return isEnabled;
}

// Convenience hook for multiple flags
export function useFeatureFlags<T extends FeatureFlagKey[]>(...flags: T) {
  const [flagStates, setFlagStates] = useState(() =>
    flags.reduce(
      (acc, flag) => ({
        // biome-ignore lint/performance/noAccumulatingSpread: reason to ignore
        ...acc,
        [flag]: featureFlagService.isEnabled(flag),
      }),
      {} as Record<T[number], boolean>,
    ),
  );

  useEffect(() => {
    const newStates = flags.reduce(
      (acc, flag) => ({
        // biome-ignore lint/performance/noAccumulatingSpread: reason to ignore
        ...acc,
        [flag]: featureFlagService.isEnabled(flag),
      }),
      {} as Record<T[number], boolean>,
    );

    setFlagStates(newStates);
  }, [flags]);

  return flagStates;
}
