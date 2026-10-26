// Weather service module for Weather Forecast App

const WEATHER_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const TIMEOUT_MS = 10_000;

/**
 * Fetches current weather data for the given coordinates from the Open-Meteo
 * Weather Forecast API.
 *
 * @param {number} lat - Latitude of the location.
 * @param {number} lon - Longitude of the location.
 * @returns {Promise<
 *   | { ok: true;  data: { temperature: number, relativeHumidity: number, precipitation: number } }
 *   | { ok: false; error: 'unavailable' | 'invalid_data' }
 * >}
 */
export async function fetchWeather(lat, lon) {
  const url =
    `${WEATHER_BASE_URL}?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,precipitation`;

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

  // Parse JSON — treat parse failures as unavailable (can't determine data validity)
  let json;
  try {
    json = await res.json();
  } catch (_err) {
    return { ok: false, error: 'unavailable' };
  }

  // Extract the three required fields from current
  const current = json?.current;
  const temperature = current?.temperature_2m;
  const relativeHumidity = current?.relative_humidity_2m;
  const precipitation = current?.precipitation;

  // Validate: each field must be a finite number (rejects undefined, null, NaN, non-numbers)
  if (
    typeof temperature !== 'number' || isNaN(temperature) ||
    typeof relativeHumidity !== 'number' || isNaN(relativeHumidity) ||
    typeof precipitation !== 'number' || isNaN(precipitation)
  ) {
    return { ok: false, error: 'invalid_data' };
  }

  return {
    ok: true,
    data: {
      temperature,
      relativeHumidity,
      precipitation,
    },
  };
}
