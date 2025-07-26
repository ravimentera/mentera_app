import type {
  PatientChart,
  PatientContext,
  PatientDemographics,
  UsePatientContextOptions,
  UsePatientContextResult,
} from "@/lib/types/patientContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { providers } from "./providers";

/**
 * Custom hook for fetching and aggregating patient context data
 *
 * This hook fetches data from multiple sources in parallel and aggregates
 * them into a single PatientContext object that can be passed to the Bedrock agent.
 *
 * @param patientId - The patient ID to fetch context for
 * @param options - Configuration options
 * @returns Patient context data with loading/error states
 */
export const usePatientContext = (
  patientId: string | null,
  options: UsePatientContextOptions = {},
): UsePatientContextResult => {
  const {
    providerId,
    enableAutoRefetch = false,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    maxCharts = undefined, // No limit by default
  } = options;

  // State management
  const [context, setContext] = useState<PatientContext | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  // Add ref to track if we should skip fetch due to fresh data
  const lastFetchRef = useRef<number>(0);
  const contextRef = useRef<PatientContext | null>(null);

  // Use ref for fetchCount to avoid circular dependencies
  const fetchCountRef = useRef<number>(0);

  // Update refs when state changes
  useEffect(() => {
    lastFetchRef.current = lastFetch;
    contextRef.current = context;
  }, [lastFetch, context]);

  // Debug: Log when hook is called
  // useEffect(() => {
  //   console.log("[usePatientContext] Hook instantiated/re-rendered:", {
  //     patientId,
  //     timestamp: new Date().toISOString(),
  //     fetchCount
  //   });
  // });

  // Reset state when patientId changes
  useEffect(() => {
    if (patientId) {
      setContext(null);
      setIsError(false);
      setError(null);
    }
  }, [patientId]);

  /**
   * Main data fetching function
   */
  const fetchPatientContext = useCallback(async () => {
    if (!patientId) {
      setContext(null);
      setIsLoading(false);
      return;
    }

    // Check if we have fresh data (within stale time)
    const now = Date.now();
    const isFresh = contextRef.current && now - lastFetchRef.current < staleTime;

    if (isFresh && !enableAutoRefetch) {
      return; // Use cached data
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);

    const currentFetchCount = fetchCountRef.current + 1;
    try {
      fetchCountRef.current = currentFetchCount;

      // console.log(`[usePatientContext] 🚀 FETCH #${currentFetchCount} - Starting for patient: ${patientId}`);
      // console.log(`[usePatientContext] 📊 FETCH #${currentFetchCount} - Fresh data check: isFresh=${isFresh}, timeSinceLastFetch=${now - lastFetch}ms`);

      // Execute all providers in parallel
      const providerPromises = providers.map(async (provider) => {
        try {
          // console.log(`[usePatientContext] 📡 FETCH #${currentFetchCount} - ${provider.key} provider starting`);
          const data = await provider.fetch(patientId, providerId);
          // console.log(`[usePatientContext] ✅ FETCH #${currentFetchCount} - ${provider.key} provider completed`);
          return { key: provider.key, data, error: null };
        } catch (providerError) {
          console.error(
            `[usePatientContext] ❌ FETCH #${currentFetchCount} - Provider ${provider.key} failed:`,
            providerError,
          );
          return { key: provider.key, data: null, error: providerError };
        }
      });

      const results = await Promise.all(providerPromises);

      // Check for any critical errors (you can customize this logic)
      const errors = results.filter((r) => r.error !== null);
      if (errors.length === results.length) {
        // All providers failed
        throw new Error("All data providers failed to fetch patient context");
      }

      // Aggregate successful results into PatientContext
      const aggregatedData: any = {};
      results.forEach((result) => {
        if (result.data !== null) {
          aggregatedData[result.key] = result.data;
        }
      });

      // Ensure we have required data
      if (!aggregatedData.demographics) {
        throw new Error("Patient demographics data is required but could not be fetched");
      }

      // Build the final PatientContext object
      const patientContext: PatientContext = {
        patientId,
        demographics: aggregatedData.demographics as PatientDemographics,
        charts: (() => {
          const charts = (aggregatedData.charts as PatientChart[]) || [];
          // Apply maxCharts limit if specified
          if (maxCharts && maxCharts > 0 && charts.length > maxCharts) {
            // console.log(
            //   `[usePatientContext] Limiting charts from ${charts.length} to ${maxCharts} most recent`,
            // );
            return charts.slice(0, maxCharts);
          }
          return charts;
        })(),
        visits: aggregatedData.visits || {
          enrichedVisits: [],
          packages: { totalCount: 0, activeCount: 0, activePackages: [] },
          appointments: { totalCount: 0, upcomingAppointments: [] },
        },
        metadata: {
          sourceTimestamps: {
            demographics: new Date().toISOString(),
            charts: new Date().toISOString(),
            visits: new Date().toISOString(),
          },
          dataFreshness: new Date().toISOString(),
          contextVersion: "1.0.0",
        },
      };

      // console.log(`[usePatientContext] 🏁 FETCH #${currentFetchCount} - Context fetched successfully:`, {
      //   patientId,
      //   chartsCount: patientContext.charts.length,
      //   visitsCount: patientContext.visits.enrichedVisits.length,
      //   maxChartsLimit: maxCharts,
      //   fetchNumber: currentFetchCount,
      // });

      setContext(patientContext);
      setLastFetch(now);
      setIsLoading(false);
    } catch (fetchError) {
      console.error(
        `[usePatientContext] ❌ FETCH #${currentFetchCount} - Failed to fetch patient context:`,
        fetchError,
      );
      setError(fetchError);
      setIsError(true);
      setIsLoading(false);
    }
  }, [patientId, providerId, staleTime, enableAutoRefetch, maxCharts]);

  /**
   * Manual refetch function
   */
  const refetch = useCallback(() => {
    setLastFetch(0); // Force fresh fetch
    lastFetchRef.current = 0; // Also update ref
    fetchPatientContext();
  }, [fetchPatientContext]);

  // Auto-fetch when patientId changes
  useEffect(() => {
    if (patientId) {
      fetchPatientContext();
    }
  }, [patientId, fetchPatientContext]);

  return {
    context,
    isLoading,
    isError,
    error,
    refetch,
  };
};
