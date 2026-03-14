import { SERVER_BASE_URL } from './config';

/**
 * Resolves profile picture URL for display.
 * - Relative paths (e.g. /uploads/xxx) are prefixed with the API server base URL so Next/Image can load them.
 * - Absolute URLs (http/https, e.g. Google avatar) are returned as-is.
 */
export function getProfilePictureUrl(profilePicture: string | undefined | null): string | undefined {
  if (!profilePicture || !profilePicture.trim()) return undefined;
  const trimmed = profilePicture.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/')) return `${SERVER_BASE_URL}${trimmed}`;
  return `${SERVER_BASE_URL}/${trimmed}`;
}
