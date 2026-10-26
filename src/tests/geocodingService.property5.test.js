// Feature: weather-forecast-app, Property 5: La geocodificación siempre usa el primer resultado

import { describe, it, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { geocodeCity } from '../geocodingService.js';

/**
 * Property 5: La geocodificación siempre usa el primer resultado
 *
 * Validates: Requirements 2.2
 *
 * Para cualquier respuesta de la Geocoding API que contenga uno o más resultados,
 * geocodeCity SHALL extraer exclusivamente la latitud y la longitud del elemento
 * en el índice 0 del array `results`.
 */
describe('geocodeCity — Property 5: always uses the first result', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should extract name, latitude, and longitude exclusively from results[0]', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1 }),
            latitude: fc.double({ noNaN: true, noDefaultInfinity: true }),
            longitude: fc.double({ noNaN: true, noDefaultInfinity: true }),
          }),
          { minLength: 1 }
        ),
        async (results) => {
          // Mock fetch to return the generated results array
          vi.stubGlobal('fetch', async () => ({
            ok: true,
            json: async () => ({ results }),
          }));

          const response = await geocodeCity('TestCity');

          // The service must succeed and return data from index 0
          if (response.ok !== true) return false;

          return (
            response.data.name === results[0].name &&
            response.data.latitude === results[0].latitude &&
            response.data.longitude === results[0].longitude
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
