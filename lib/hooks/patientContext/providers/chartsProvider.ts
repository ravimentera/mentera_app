import { store } from "@/lib/store";
import { chartsApi } from "@/lib/store/api";
import type { ContextProvider, PatientChart } from "@/lib/types/patientContext";

/**
 * Charts Provider
 *
 * Fetches detailed patient charts by:
 * 1. Getting all provider charts and filtering by patientId
 * 2. For each patient chart, fetching detailed chart data using getChartDetail
 * 3. Returning charts with full content and details
 */
export const chartsProvider: ContextProvider<PatientChart[]> = {
  key: "charts",

  fetch: async (patientId: string, providerId?: string): Promise<PatientChart[]> => {
    if (!providerId) {
      throw new Error("Provider ID is required for charts provider");
    }

    try {
      // console.log(
      //   `[chartsProvider] Fetching charts for patient ${patientId} from provider ${providerId}`,
      // );

      // Step 1: Get all provider charts
      const providerChartsResult = await store
        .dispatch(chartsApi.endpoints.getProviderCharts.initiate(providerId))
        .unwrap();

      // console.log(
      //   `[chartsProvider] Retrieved ${providerChartsResult.length} total charts from provider ${providerId}`,
      // );
      // console.log(
      //   `[chartsProvider] All chart patientIds:, ${providerChartsResult.map((chart) => ({ id: chart.id, patientId: chart.patientId }))}`,
      // );

      // Step 2: Filter charts for the specific patient (with robust filtering)
      const patientChartSummaries = providerChartsResult.filter((chart) => {
        const matches = chart.patientId === patientId;
        if (matches) {
          // console.log(`[chartsProvider] ✅ Chart ${chart.id} matches patient ${patientId}`);
        } else {
          console.log(
            // `[chartsProvider] ❌ Chart ${chart.id} has patientId ${chart.patientId}, doesn't match ${patientId}`,
          );
        }
        return matches;
      });

      // console.log(
      //   `[chartsProvider] Found ${patientChartSummaries.length} charts for patient ${patientId}`,
      // );
      // console.log(
      //   `[chartsProvider] Filtered chart IDs: ${patientChartSummaries.map((chart) => chart.id)}`,
      // );

      if (patientChartSummaries.length === 0) {
        console.log(`[chartsProvider] No charts found for patient ${patientId}`);
        return [];
      }

      const firstPatientSummary = patientChartSummaries.slice(0, 1);

      // Step 3: For each patient chart, fetch detailed chart data
      const detailedChartsPromises = firstPatientSummary.map(async (chartSummary) => {
        try {
          console.log(`[chartsProvider] Fetching detailed data for chart ${chartSummary.id}`);

          // Get detailed chart data using the chartId
          const detailedChartResult = await store
            .dispatch(chartsApi.endpoints.getChartDetail.initiate(chartSummary.id))
            .unwrap();

          // Verify this chart still belongs to the correct patient
          if (detailedChartResult.patientId !== patientId) {
            console.warn(
              `[chartsProvider] Chart detail ${chartSummary.id} has different patientId: ${detailedChartResult.patientId} vs expected ${patientId}`,
            );
          }

          // Transform to PatientChart format with detailed content
          const detailedChart: PatientChart = {
            id: detailedChartResult.id,
            chartId: detailedChartResult.id,
            patientId: detailedChartResult.patientId,
            content: detailedChartResult.content, // This is the detailed content we want
            approved: detailedChartResult.approved,
            version: detailedChartResult.version,
            chartType: detailedChartResult.chartType,
            treatmentType: detailedChartResult.treatmentType,
            providerIds: detailedChartResult.providerIds,
            createdAt: detailedChartResult.createdAt,
            updatedAt: detailedChartResult.updatedAt,
          };

          console.log(
            `[chartsProvider] Successfully fetched detailed chart ${chartSummary.id} with content length: ${detailedChart.content?.length || 0}`,
          );
          return detailedChart;
        } catch (chartDetailError) {
          console.error(
            `[chartsProvider] Failed to fetch chart detail for ${chartSummary.id}:`,
            chartDetailError,
          );

          // If detailed fetch fails, return chart with basic info from summary
          const fallbackChart: PatientChart = {
            id: chartSummary.id,
            chartId: chartSummary.id,
            patientId: chartSummary.patientId,
            content: chartSummary.content || "", // Fallback to summary content
            approved: chartSummary.approved,
            version: chartSummary.version,
            chartType: chartSummary.chartType,
            treatmentType: chartSummary.treatmentType,
            providerIds: chartSummary.providerIds,
            createdAt: chartSummary.createdAt,
            updatedAt: chartSummary.updatedAt,
          };

          return fallbackChart;
        }
      });

      // Step 4: Wait for all detailed chart fetches to complete
      const detailedCharts = await Promise.all(detailedChartsPromises);

      // Step 5: Sort charts by creation date (most recent first) and verify patient filtering
      const sortedAndFilteredCharts = detailedCharts
        .filter((chart) => {
          const belongsToPatient = chart.patientId === patientId;
          if (!belongsToPatient) {
            console.warn(
              `[chartsProvider] Removing chart ${chart.id} - belongs to ${chart.patientId}, not ${patientId}`,
            );
          }
          return belongsToPatient;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Debugging Logs
      // console.log(
      //   `[chartsProvider] Final result: ${sortedAndFilteredCharts.length} charts for patient ${patientId}`,
      // );
      // console.log(
      //   "[chartsProvider] Chart details:",
      //   sortedAndFilteredCharts.map((chart) => ({
      //     id: chart.id,
      //     patientId: chart.patientId,
      //     chartType: chart.chartType,
      //     treatmentType: chart.treatmentType,
      //     approved: chart.approved,
      //     createdAt: chart.createdAt,
      //     contentLength: chart.content?.length || 0,
      //   })),
      // );

      return sortedAndFilteredCharts;
    } catch (error) {
      console.error("[chartsProvider] Charts provider error:", error);
      throw new Error(`Failed to fetch patient charts: ${error}`);
    }
  },
};
