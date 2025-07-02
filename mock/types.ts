export type Sender = "user" | "assistant";

export type ChatMessage = {
  id: string;
  sender: Sender;
  text: string;
};

export type Patient = {
  id: string;
  chartId: string;
  treatmentNotes: {
    procedure: string;
    areasTreated: string[];
    unitsUsed: number | null;
    sessionNumber?: number;
    observations?: string;
    providerRecommendations?: string;
  };
  preProcedureCheck: {
    medications: string[];
    consentSigned: boolean;
    allergyCheck: string;
  };
  postProcedureCare: {
    instructionsProvided: boolean;
    followUpRecommended: string;
    productsRecommended: string[];
  };
  nextTreatment: string;
  followUpDate: string;
  alerts: string[];
  medspaId: string;
  providerSpecialty: string;
  treatmentOutcome: string;
};

export type WebSocketResponseMessage = {
  type: string;
  chunk?: any;
  response?: {
    content?: string | { [key: string]: any };
    metadata?: {
      model?: string;
      processingTime?: number;
      cache?: {
        hit?: boolean;
        ttl?: number;
      };
      contextIntegration?: {
        score?: number;
      };
    };
  };
  error?: string;
};
