// Geocoding service module for Weather Forecast App

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const TIMEOUT_MS = 10_000;

/**
 * Geocodes a city name using the Open-Meteo Geocoding API.
 *
 * @param {string} cityName - The city name to geocode (already validated).
 * @returns {Promise<
 *   | { ok: true;  data: { name: string, latitude: number, longitude: number } }
 *   | { ok: false; error: 'not_found' | 'unavailable' | 'invalid_response' }
 * >}
 */
export async function geocodeCity(cityName) {
  const encoded = encodeURIComponent(cityName);
  const url = `${GEOCODING_BASE_URL}?name=${encoded}&count=1&language=es&format=json`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(url, { signal: controller.signal });
  } catch (_err) {
    // Network error or abort (timeout)
    clearTimeout(timeoutId);
    return { ok: false, error: 'unavailable' };
  }

  clearTimeout(timeoutId);

  // HTTP-level error (4xx, 5xx, etc.)
  if (!res.ok) {
    return { ok: false, error: 'unavailable' };
  }

  // Parse JSON — treat parse failures as invalid_response
  let json;
  try {
    json = await res.json();
  } catch (_err) {
    return { ok: false, error: 'invalid_response' };
  }

  // Validate top-level structure: results must be an array
  if (!Array.isArray(json.results)) {
    return { ok: false, error: 'invalid_response' };
  }

  // Empty results array → city not found
  if (json.results.length === 0) {
    return { ok: false, error: 'not_found' };
  }

  // Validate required fields in the first result
  const first = json.results[0];
  if (
    typeof first.name !== 'string' ||
    typeof first.latitude !== 'number' ||
    typeof first.longitude !== 'number'
  ) {
    return { ok: false, error: 'invalid_response' };
  }

  return {
    ok: true,
    data: {
      name: first.name,
      latitude: first.latitude,
      longitude: first.longitude,
    },
  };
}
