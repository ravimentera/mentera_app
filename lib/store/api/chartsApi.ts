import type {
  Chart,
  ChartDetailResponse,
  ChartGenerationRequest,
  ChartGenerationResponse,
  ChartsApiResponse,
} from "@/app/(dashboard)/charting/types";
import { createApi } from "@reduxjs/toolkit/query/react";
import { proxyAuthBaseQuery } from "./authInterceptor";

// Type for chart content update
export interface UpdateChartContentRequest {
  content: string;
}

export interface UpdateChartContentResponse {
  success: boolean;
  data: {
    chart: Chart;
  };
  message: string;
}

// Type for chart approval
export interface ApproveChartRequest {
  approved: boolean;
}

export interface ApproveChartResponse {
  success: boolean;
  data: {
    chart: Chart;
  };
  message: string;
}

export const chartsApi = createApi({
  reducerPath: "chartsApi",
  baseQuery: proxyAuthBaseQuery,
  tagTypes: ["Charts"],
  endpoints: (builder) => ({
    getProviderCharts: builder.query<Chart[], string>({
      query: (providerId) => `/providers/charts/providers/${providerId}/charts`,
      transformResponse: (response: ChartsApiResponse) => response.data.charts,
      providesTags: (result, error, providerId) => [
        { type: "Charts", id: providerId },
        ...(result ?? []).map(({ id }) => ({ type: "Charts" as const, id })),
      ],
    }),
    getChartDetail: builder.query<Chart, string>({
      query: (chartId) => `/providers/charts/charts/${chartId}`,
      transformResponse: (response: ChartDetailResponse) => response.data.chart,
      providesTags: (result, error, chartId) => [{ type: "Charts", id: chartId }],
    }),
    generateChart: builder.mutation<Chart, ChartGenerationRequest>({
      query: (body) => ({
        url: "/providers/charts/generate",
        method: "POST",
        body,
      }),
      transformResponse: (response: ChartGenerationResponse) => response.data.chart,
      invalidatesTags: (result, error, arg) => [{ type: "Charts", id: arg.primaryProviderId }],
    }),
    updateChartContent: builder.mutation<Chart, { chartId: string; content: string }>({
      query: ({ chartId, content }) => ({
        url: `/providers/charts/charts/${chartId}/content`,
        method: "PUT",
        body: { content },
      }),
      transformResponse: (response: UpdateChartContentResponse) => response.data.chart,
      invalidatesTags: (result, error, { chartId }) => [
        { type: "Charts", id: chartId },
        // Also invalidate the list view to refresh any summary data
        { type: "Charts", id: "LIST" },
      ],
    }),
    approveChart: builder.mutation<Chart, { chartId: string; approved: boolean }>({
      query: ({ chartId, approved }) => ({
        url: `/providers/charts/charts/${chartId}/approve`,
        method: "PUT",
        body: { approved },
      }),
      transformResponse: (response: ApproveChartResponse) => response.data.chart,
      invalidatesTags: (result, error, { chartId }) => [
        { type: "Charts", id: chartId },
        // Also invalidate the list view to refresh approval status
        { type: "Charts", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetProviderChartsQuery,
  useGetChartDetailQuery,
  useGenerateChartMutation,
  useUpdateChartContentMutation,
  useApproveChartMutation,
} = chartsApi;
