/**
 * Patient Context Providers Registry
 *
 * This file exports all available context providers and manages the provider registry.
 * To add a new provider, simply import it and add it to the providers array.
 */

import type { ContextProvider } from "@/lib/types/patientContext";
import { chartsProvider } from "./chartsProvider";
import { demographicsProvider } from "./demographicsProvider";
import { visitsProvider } from "./visitsProvider";

// Registry of all available providers
export const providers: ContextProvider<any>[] = [
  demographicsProvider,
  visitsProvider,
  chartsProvider,
];

// Export individual providers for direct use if needed
export { chartsProvider } from "./chartsProvider";
export { demographicsProvider } from "./demographicsProvider";
export { visitsProvider } from "./visitsProvider";

/**
 * Get provider by key
 */
export const getProviderByKey = (key: string): ContextProvider<any> | undefined => {
  return providers.find((provider) => provider.key === key);
};

/**
 * Get all provider keys
 */
export const getProviderKeys = (): string[] => {
  return providers.map((provider) => provider.key as string);
};
