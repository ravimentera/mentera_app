import { User } from "@/lib/mock-data";
import { useEffect, useState } from "react";

/**
 * Custom hook for fetching user data
 */
export function useUser(id = "random") {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchUser() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/users/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (isMounted) {
          setUser(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching user:", err);
          setError(err instanceof Error ? err : new Error("Unknown error occurred"));
          setIsLoading(false);
        }
      }
    }

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return {
    user,
    isLoading,
    error,
    // Refetch function to manually trigger a refresh
    refetch: async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUser(data);
        setError(null);
      } catch (err) {
        console.error("Error refetching user:", err);
        setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      } finally {
        setIsLoading(false);
      }
    },
  };
}
