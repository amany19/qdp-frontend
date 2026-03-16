/**
 * Parse Google Maps share/link URLs to extract latitude and longitude.
 * Supports common formats:
 * - https://www.google.com/maps?q=25.2854,51.5074
 * - https://www.google.com/maps/@25.2854,51.5074,17z
 * - https://maps.google.com/?q=25.2854,51.5074
 * - https://goo.gl/maps/... and maps.app.goo.gl/... may redirect; we parse when possible.
 * Google Maps uses (latitude, longitude) order in URLs.
 */
export function parseGoogleMapsLink(
  input: string
): { lat: number; lng: number } | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Match ?q=LAT,LNG or ?q=LAT,LNG&...
  const qMatch = trimmed.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (qMatch) {
    const lat = parseFloat(qMatch[1]);
    const lng = parseFloat(qMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // Match @LAT,LNG (e.g. /@25.2854,51.5074,17z)
  const atMatch = trimmed.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // Match place/...!3dLNG!4dLAT (3d=lng, 4d=lat in some share links)
  const placeMatch = trimmed.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
  if (placeMatch) {
    const lng = parseFloat(placeMatch[1]);
    const lat = parseFloat(placeMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // Match /place/.../LAT,LNG
  const placeLatLng = trimmed.match(/\/place\/[^/]+\/@?(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (placeLatLng) {
    const lat = parseFloat(placeLatLng[1]);
    const lng = parseFloat(placeLatLng[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  return null;
}

function isValidLatLng(lat: number, lng: number): boolean {
  return (
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
