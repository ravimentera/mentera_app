/**
 * Patient Context Hook
 *
 * A reusable React hook for fetching and aggregating patient context data
 * from multiple API sources. Designed to provide comprehensive patient
 * information to the Bedrock agent for enhanced conversations.
 *
 * Usage:
 * ```tsx
 * import { usePatientContext } from '@/lib/hooks/patientContext';
 *
 * const { context, isLoading, isError } = usePatientContext(patientId, {
 *   providerId: 'PR-2001'
 * });
 * ```
 *
 * Features:
 * - Parallel data fetching from multiple sources
 * - Extensible provider pattern for future data sources
 * - Built-in caching and stale data management
 * - Comprehensive error handling
 * - TypeScript support with full type safety
 */

// Export the main hook
export { usePatientContext } from "./usePatientContext";

// Export providers for advanced usage
export * from "./providers";

// Re-export types for convenience
export type {
  PatientContext,
  PatientDemographics,
  PatientChart,
  PatientVisit,
  PatientPackage,
  ContextProvider,
  UsePatientContextResult,
  UsePatientContextOptions,
} from "@/lib/types/patientContext";
