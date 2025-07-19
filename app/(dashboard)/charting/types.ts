export interface Chart {
  id: string;
  visitId: string;
  providerIds: string[];
  patientId: string;
  chartType: "prechart" | "postchart";
  treatmentType: string;
  templateId: string;
  content: string;
  approved: boolean;
  version: number;
  medspaId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChartsApiResponse {
  success: boolean;
  data: {
    charts: Chart[];
  };
}

export interface ChartGenerationRequest {
  providerIds: string[];
  primaryProviderId: string;
  patientId: string;
  visitId: string;
  treatmentId: string;
  chartType: "prechart" | "postchart";
  templateId: string;
  additionalContext?: string;
  useAI: boolean;
  aiOptions: {
    tone: "professional" | "casual" | "detailed";
    detail: "standard" | "detailed" | "brief";
  };
}

export interface ChartGenerationResponse {
  success: boolean;
  data: {
    chartId: string;
    content: string;
    templateUsed: string;
    approved: boolean;
    version: number;
    generatedAt: string;
  };
}

export interface ChartDetailResponse {
  success: boolean;
  data: {
    chart: Chart;
  };
}

export interface ChartingFilters {
  period: "today" | "tomorrow" | "all";
  searchQuery?: string;
}

export type ChartingPeriod = "today" | "tomorrow" | "all";

export interface ChartingPageProps {
  charts: Chart[];
  isLoading?: boolean;
  onNewCharting?: () => void;
  onChartClick?: (chart: Chart) => void;
}
