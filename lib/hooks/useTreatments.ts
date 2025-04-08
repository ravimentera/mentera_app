import { TreatmentPreference } from "@/lib/mock-data";
import { useEffect, useState } from "react";

/**
 * Custom hook for fetching treatment preference data
 */
export function useTreatments() {
  const [treatments, setTreatments] = useState<TreatmentPreference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchTreatments() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/treatments");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (isMounted) {
          setTreatments(data.treatments);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching treatments:", err);
          setError(err instanceof Error ? err : new Error("Unknown error occurred"));
          setIsLoading(false);
        }
      }
    }

    fetchTreatments();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    treatments,
    isLoading,
    error,
    // Refetch function to manually trigger a refresh
    refetch: async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/treatments");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTreatments(data.treatments);
        setError(null);
      } catch (err) {
        console.error("Error refetching treatments:", err);
        setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      } finally {
        setIsLoading(false);
      }
    },
  };
}
