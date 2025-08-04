import { getFullName, getInitials } from "@/lib/utils";
import { providers } from "../mock/providers.data";
import { ProviderWithAvatar } from "../types/user.types";

// Logged-in user configuration - single source of truth
const LOGGED_IN_USER_PROVIDER_ID = "PR-2001";

/**
 * Get the first provider from the providers data
 * @returns The first provider or null if no providers exist
 */
export function getFirstProvider(): ProviderWithAvatar | null {
  return providers[0]?.providers[0] || null;
}

/**
 * Get provider by ID
 * @param providerId - The provider ID to search for
 * @returns The provider or null if not found
 */
export function getProviderById(providerId: string): ProviderWithAvatar | null {
  for (const medspa of providers) {
    const provider = medspa.providers.find((p) => p.providerId === providerId);
    if (provider) {
      return provider;
    }
  }
  return null;
}

/**
 * Get all providers from all medspas
 * @returns Array of all providers
 */
export function getAllProviders(): ProviderWithAvatar[] {
  return providers.flatMap((medspa) => medspa.providers);
}

/**
 * Get provider's full name
 * @param provider - The provider object
 * @returns Full name string
 */
export function getProviderFullName(provider: ProviderWithAvatar): string {
  return getFullName(provider.firstName, provider.lastName);
}

/**
 * Get provider's initials
 * @param provider - The provider object
 * @returns Initials string
 */
export function getProviderInitials(provider: ProviderWithAvatar): string {
  return getInitials(getFullName(provider.firstName, provider.lastName));
}

/**
 * Get the currently logged-in user as a provider
 * @returns The logged-in provider or null if not found
 */
export function getLoggedInUser(): ProviderWithAvatar | null {
  return getProviderById(LOGGED_IN_USER_PROVIDER_ID);
}

/**
 * Get the logged-in user's first name
 * @returns First name of the logged-in user
 */
export function getLoggedInUserFirstName(): string {
  const user = getLoggedInUser();
  return user?.firstName || "User";
}

/**
 * Get the logged-in user's full name
 * @returns Full name of the logged-in user
 */
export function getLoggedInUserFullName(): string {
  const user = getLoggedInUser();
  return user ? getProviderFullName(user) : "Unknown User";
}

/**
 * Get the logged-in user's provider ID
 * @returns Provider ID of the logged-in user
 */
export function getLoggedInUserProviderId(): string {
  return LOGGED_IN_USER_PROVIDER_ID;
}
