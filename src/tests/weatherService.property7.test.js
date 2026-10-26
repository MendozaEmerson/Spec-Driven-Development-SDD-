// Feature: weather-forecast-app, Property 7: El servicio de clima incluye las coordenadas y variables requeridas en la URL

import { describe, it, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { fetchWeather } from '../weatherService.js';

/**
 * Property 7: El servicio de clima incluye las coordenadas y variables requeridas en la URL
 *
 * Validates: Requirements 3.1
 *
 * Para cualquier par de coordenadas (lat, lon) válidas, fetchWeather SHALL construir
 * una URL que contenga los parámetros `latitude`, `longitude` y los tres parámetros
 * `current` requeridos: `temperature_2m`, `relative_humidity_2m`, `precipitation`.
 */
describe('fetchWeather — Property 7: URL includes required coordinates and variables', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should include latitude, longitude and all three current parameters in the fetch URL', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.float({ min: -90, max: 90 }),
          fc.float({ min: -180, max: 180 })
        ),
        async ([lat, lon]) => {
          let capturedUrl = null;

          vi.stubGlobal('fetch', async (url) => {
            capturedUrl = url;
            return {
              ok: true,
              json: async () => ({
                current: { temperature_2m: 20, relative_humidity_2m: 50, precipitation: 0 }
              })
            };
          });

          await fetchWeather(lat, lon);

          // fetch must have been called
          if (capturedUrl === null) return false;

          // The URL must contain the key parameter names
          if (!capturedUrl.includes('latitude=')) return false;
          if (!capturedUrl.includes('longitude=')) return false;
          if (!capturedUrl.includes('temperature_2m')) return false;
          if (!capturedUrl.includes('relative_humidity_2m')) return false;
          if (!capturedUrl.includes('precipitation')) return false;

          // The actual numeric values passed must appear in the URL
          // We compare by reconstructing the expected URL fragment to avoid
          // issues with floating-point string representations
          const expectedUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
            `&current=temperature_2m,relative_humidity_2m,precipitation`;

          return capturedUrl === expectedUrl;
        }
      ),
      { numRuns: 100 }
    );
  });
});
