/**
 * Configuration constants for the application
 */

// API Base URL - use environment variable in production, localhost in development
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Remove /api suffix if present to get base server URL
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api$/, '');
