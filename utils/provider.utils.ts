import { providers } from "../mock/providers.data";
import { ProviderWithAvatar } from "../types/user.types";

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
  return `${provider.firstName} ${provider.lastName}`;
}

/**
 * Get provider's initials
 * @param provider - The provider object
 * @returns Initials string
 */
export function getProviderInitials(provider: ProviderWithAvatar): string {
  return `${provider.firstName.charAt(0)}${provider.lastName.charAt(0)}`;
}
