/**
 * Configuration constants for the application
 */

// API Base URL - use environment variable in production, localhost in development
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Remove /api suffix if present to get base server URL (used for static uploads)
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

/**
 * Resolve image URL for display. Backend returns paths like /uploads/xxx;
 * they must be loaded from the API server origin, not the frontend origin.
 */
export function getUploadImageUrl(path: string | undefined | null): string {
  if (!path || typeof path !== 'string') return '';
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `${SERVER_BASE_URL}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}
