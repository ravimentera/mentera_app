import { Sparkles } from "lucide-react";

interface HealthInsights {
  healthPatterns: string[];
  preventativeSuggestions: string[];
  lifestyleRecommendations: string[];
  treatmentOptimizationIdeas: string[];
  overallSummary: string;
}

interface TeraInsightsCardProps {
  insights?: HealthInsights;
  isLoading?: boolean;
}

const TeraInsightsCard = ({ insights, isLoading }: TeraInsightsCardProps) => {
  // Helper function to convert camelCase to Title Case with spaces
  const formatSectionTitle = (key: string): string => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Helper function to check if a value is an array with content
  const isValidArray = (value: any): value is string[] => {
    return Array.isArray(value) && value.length > 0;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl !border-2 border-gradient-blue p-4 h-fit">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-brand-blue" />
          <h2 className="text-lg font-semibold bg-gradient-brand bg-clip-text text-transparent">
            Tera Insights
          </h2>{" "}
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="bg-white rounded-xl !border-2 border-gradient-blue p-4 h-fit">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-brand-blue" />
          <h2 className="text-lg font-semibold bg-gradient-brand bg-clip-text text-transparent">
            Tera Insights
          </h2>
        </div>
        <p className="text-gray-500">No insights available</p>
      </div>
    );
  }

  // Filter out non-array fields and overallSummary for the dynamic sections
  const dynamicSections = Object.entries(insights)
    .filter(([key, value]) => key !== "overallSummary" && isValidArray(value))
    .map(([key, value]) => ({ key, title: formatSectionTitle(key), items: value as string[] }));

  return (
    <div className="bg-white rounded-xl !border-2 border-gradient-blue p-4 h-fit">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-brand-blue" />
        <h2 className="text-lg font-semibold bg-gradient-brand bg-clip-text text-transparent">
          Tera Insights
        </h2>
      </div>

      <div className="space-y-4">
        {dynamicSections.map(({ key, title, items }) => (
          <div key={key}>
            <h3 className="font-semibold text-gray-900 mb-2 tw-text-sm">{title}</h3>
            <ul className="space-y-1">
              {items.map((item, index) => (
                <li
                  key={`${key}-${index}-${item.slice(0, 20)}`}
                  className="text-gray-600 tw-text-sm pl-2"
                >
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Overall Summary section if it exists */}
        {insights.overallSummary && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Overall Summary</h3>
            <p className="text-gray-600">{insights.overallSummary}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeraInsightsCard;
