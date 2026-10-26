// Feature: weather-forecast-app, Property 8: Los datos meteorológicos se extraen con fidelidad exacta

import { describe, it, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { fetchWeather } from '../weatherService.js';

/**
 * Property 8: Los datos meteorológicos se extraen con fidelidad exacta
 *
 * Validates: Requirements 3.2
 *
 * Para cualquier respuesta exitosa de la Weather API con valores numéricos
 * (t, h, p) en current.temperature_2m, current.relative_humidity_2m y
 * current.precipitation, fetchWeather SHALL retornar exactamente esos mismos
 * valores numéricos sin transformación.
 */
describe('fetchWeather — Property 8: exact data extraction without transformation', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return temperature, relativeHumidity, precipitation exactly as received from the API', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          temperature_2m: fc.double({ noNaN: true, noDefaultInfinity: true }),
          relative_humidity_2m: fc.double({ noNaN: true, noDefaultInfinity: true }),
          precipitation: fc.double({ noNaN: true, noDefaultInfinity: true }),
        }),
        async ({ temperature_2m, relative_humidity_2m, precipitation }) => {
          // Mock fetch to return the generated values in the expected API envelope
          vi.stubGlobal('fetch', async () => ({
            ok: true,
            json: async () => ({
              current: {
                temperature_2m,
                relative_humidity_2m,
                precipitation,
              },
            }),
          }));

          const response = await fetchWeather(0, 0);

          // The service must succeed
          if (response.ok !== true) return false;

          // Each field must be returned exactly — no rounding, scaling, or any transformation
          return (
            response.data.temperature === temperature_2m &&
            response.data.relativeHumidity === relative_humidity_2m &&
            response.data.precipitation === precipitation
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
