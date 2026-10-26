// Feature: weather-forecast-app, Property 6: Respuestas malformadas de la Geocoding API producen error invalid_response

import { describe, it, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { geocodeCity } from '../geocodingService.js';

/**
 * Property 6: Respuestas malformadas de la Geocoding API producen error `invalid_response`
 *
 * Validates: Requirements 2.7
 *
 * Para cualquier respuesta HTTP 200 cuyo cuerpo JSON no cumpla el esquema esperado
 * (sin campo `results` como array, o primer elemento sin los campos requeridos),
 * geocodeCity SHALL retornar { ok: false, error: 'invalid_response' }.
 */
describe('geocodeCity — Property 6: malformed API responses produce invalid_response', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /**
   * Sub-property 6a: Objects without a `results` array → invalid_response
   *
   * Generates objects where `results` is absent or explicitly not an array
   * (null, integer, string, boolean), so the top-level schema check fails.
   */
  it('6a — should return invalid_response when the response has no results array', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Either a plain object() without a results array, or one where results
        // is explicitly a non-array scalar.
        fc.oneof(
          // Arbitrary object that happens to lack a results array
          fc.object().filter(obj => !Array.isArray(obj.results)),
          // Explicitly non-array results field
          fc.record({
            results: fc.oneof(
              fc.constant(null),
              fc.integer(),
              fc.string(),
              fc.boolean(),
            ),
          }),
        ),
        async (malformedBody) => {
          vi.stubGlobal('fetch', async () => ({
            ok: true,
            json: async () => malformedBody,
          }));

          const response = await geocodeCity('TestCity');

          return response.ok === false && response.error === 'invalid_response';
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Sub-property 6b: Objects with a results array but first element missing required
   * fields (name / latitude / longitude) → invalid_response
   *
   * Generates non-empty arrays whose first element is missing at least one of the
   * three required fields or has them with the wrong type.
   */
  it('6b — should return invalid_response when results[0] is missing required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          // Missing latitude and longitude — only name present
          fc.record({
            results: fc.array(
              fc.record({ name: fc.string() }),
              { minLength: 1 }
            ),
          }),
          // Missing name — only latitude and longitude present
          fc.record({
            results: fc.array(
              fc.record({
                latitude: fc.double({ noNaN: true, noDefaultInfinity: true }),
                longitude: fc.double({ noNaN: true, noDefaultInfinity: true }),
              }),
              { minLength: 1 }
            ),
          }),
          // All three present but with wrong types (non-string name or non-number coords)
          fc.record({
            results: fc.array(
              fc.record({
                name: fc.oneof(fc.integer(), fc.boolean(), fc.constant(null)),
                latitude: fc.double({ noNaN: true, noDefaultInfinity: true }),
                longitude: fc.double({ noNaN: true, noDefaultInfinity: true }),
              }),
              { minLength: 1 }
            ),
          }),
          fc.record({
            results: fc.array(
              fc.record({
                name: fc.string({ minLength: 1 }),
                latitude: fc.oneof(fc.string(), fc.boolean(), fc.constant(null)),
                longitude: fc.double({ noNaN: true, noDefaultInfinity: true }),
              }),
              { minLength: 1 }
            ),
          }),
          fc.record({
            results: fc.array(
              fc.record({
                name: fc.string({ minLength: 1 }),
                latitude: fc.double({ noNaN: true, noDefaultInfinity: true }),
                longitude: fc.oneof(fc.string(), fc.boolean(), fc.constant(null)),
              }),
              { minLength: 1 }
            ),
          }),
        ),
        async (malformedBody) => {
          vi.stubGlobal('fetch', async () => ({
            ok: true,
            json: async () => malformedBody,
          }));

          const response = await geocodeCity('TestCity');

          return response.ok === false && response.error === 'invalid_response';
        }
      ),
      { numRuns: 100 }
    );
  });
});
