// Feature: weather-forecast-app, Property 14: Envíos repetidos siempre generan nuevas peticiones de red

/**
 * Validates: Requirements 5.3
 *
 * Property 14: Envíos repetidos siempre generan nuevas peticiones de red
 *
 * Para cualquier nombre de ciudad válido, enviar el mismo nombre dos veces
 * consecutivas SHALL producir exactamente 2 llamadas independientes a la
 * Weather API (api.open-meteo.com/v1/forecast) — sin reutilizar respuestas en
 * caché.
 *
 * Strategy:
 *  - Mock `ui.js` so getCityInput returns the generated city name without
 *    requiring a real DOM input value.
 *  - Use the REAL validation, geocodingService and weatherService modules so
 *    the actual fetch calls flow through them.
 *  - Stub global `fetch` with vi.stubGlobal to intercept network calls and
 *    count hits to the Weather API URL.
 *  - Generator: fc.constantFrom over a representative set of valid city names
 *    that cover ASCII letters, Unicode/diacritics, hyphens and apostrophes —
 *    all accepted by validateCityName.
 */

import { vi, describe, it, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';

// Mock only the UI module; the service modules must be real so that fetch is
// actually called by geocodingService.js and weatherService.js.
vi.mock('../ui.js');

import { getCityInput, showLoading, hideLoading, showResults, showError } from '../ui.js';
import { handleSubmit } from '../app.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Minimal DOM required by the real ui.js if ever called (safety net) */
function setupDom() {
  document.body.innerHTML = `
    <form id="weather-form">
      <input id="city-input" value="" />
      <button id="submit-btn" type="submit">Consultar</button>
    </form>
    <div id="spinner" hidden></div>
    <section id="results" hidden></section>
    <div id="error" hidden></div>
  `;
}

/**
 * Builds a stubbed fetch function that:
 *  - Returns a valid geocoding response for ANY city name.
 *  - Returns a valid weather response for ANY coordinates.
 *  - Increments counters so callers can assert call counts.
 *
 * @returns {{ stub: Function, getGeoCalls: Function, getWeatherCalls: Function }}
 */
function buildFetchStub(cityName) {
  let geoCalls = 0;
  let weatherCalls = 0;

  const stub = vi.fn(async (url) => {
    if (url.includes('geocoding-api.open-meteo.com')) {
      geoCalls++;
      return {
        ok: true,
        json: async () => ({
          results: [
            { name: cityName, latitude: -12.04, longitude: -77.03 },
          ],
        }),
      };
    }

    if (url.includes('api.open-meteo.com/v1/forecast')) {
      weatherCalls++;
      return {
        ok: true,
        json: async () => ({
          current: {
            temperature_2m: 22,
            relative_humidity_2m: 70,
            precipitation: 0,
          },
        }),
      };
    }

    // Unexpected URL — return a generic failure so the test surfaces the issue
    return { ok: false, status: 500, json: async () => ({}) };
  });

  return {
    stub,
    getGeoCalls: () => geoCalls,
    getWeatherCalls: () => weatherCalls,
  };
}

// ─── Generator ────────────────────────────────────────────────────────────────
// Valid city names: Unicode letters, spaces, hyphens, apostrophes, length 1-100.
// We use fc.constantFrom over a representative sample that covers:
//   - Simple ASCII names
//   - Names with diacritics (Unicode letters)
//   - Names with hyphens and apostrophes
//   - Multi-word names with internal spaces
const validCityNameArb = fc.constantFrom(
  'Lima',
  'Berlin',
  'Tokyo',
  'Paris',
  'Madrid',
  'São Paulo',
  'Köln',
  'Montréal',
  "N'Djamena",
  'Addis Abeba',
  'Ciudad de México',
  'Bogotá',
  'Buenos Aires',
  'Shenzhen',
  'Al-Qāhirah',
  'Reykjavík',
  'Los Angeles',
  'Nairobi',
  'Ulaanbaatar',
  'Łódź'
);

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('Property 14: Envíos repetidos siempre generan nuevas peticiones de red', () => {
  beforeEach(() => {
    setupDom();
    // Silence UI side effects — we only care about fetch call counts
    showLoading.mockReturnValue(undefined);
    hideLoading.mockReturnValue(undefined);
    showResults.mockReturnValue(undefined);
    showError.mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it(
    'cada submit genera exactamente una nueva llamada a la Weather API (sin caché)',
    async () => {
      await fc.assert(
        fc.asyncProperty(validCityNameArb, async (cityName) => {
          // Return the generated city name from the (mocked) UI input
          getCityInput.mockReturnValue(cityName);

          const { stub, getWeatherCalls } = buildFetchStub(cityName);
          vi.stubGlobal('fetch', stub);

          const event = { preventDefault: vi.fn() };

          // ── First submit ──────────────────────────────────────────────────
          await handleSubmit(event);
          const weatherCallsAfterFirst = getWeatherCalls();

          // ── Second submit ─────────────────────────────────────────────────
          await handleSubmit(event);
          const weatherCallsAfterSecond = getWeatherCalls();

          // Each submit must have triggered exactly one new Weather API call
          return weatherCallsAfterFirst === 1 && weatherCallsAfterSecond === 2;
        }),
        { numRuns: 100 }
      );
    }
  );
});
