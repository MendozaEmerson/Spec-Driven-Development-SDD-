// Feature: weather-forecast-app, Property 9: Respuestas con campos faltantes o no-numéricos producen invalid_data

import { describe, it, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { fetchWeather } from '../weatherService.js';

/**
 * Property 9: Respuestas de la Weather API con campos faltantes o no-numéricos
 * producen `invalid_data`.
 *
 * Validates: Requirements 3.5
 *
 * Para cualquier respuesta de la Weather API en la que al menos uno de los tres
 * campos requeridos (temperature_2m, relative_humidity_2m, precipitation) esté
 * ausente, sea null o tenga un valor no-numérico, fetchWeather SHALL retornar
 * { ok: false, error: 'invalid_data' }.
 */
describe('fetchWeather — Property 9: Missing or non-numeric fields produce invalid_data', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ─── Sub-property 9a: At least one field has an invalid value ──────────────

  it('9a — should return invalid_data when one of the three fields has an invalid (non-numeric) value', async () => {
    // Generates values that are definitely not valid numbers
    const invalidValue = fc.oneof(
      fc.constant(null),
      fc.constant(undefined),
      fc.string({ maxLength: 5 }),
      fc.boolean(),
      fc.constant(NaN)
    );

    // A valid finite number for the "good" fields
    const validNumber = fc.double({ noNaN: true, noDefaultInfinity: true });

    // Corrupt exactly one of the three required fields
    const corruptedCurrent = fc
      .tuple(
        fc.integer({ min: 0, max: 2 }), // which field to corrupt
        validNumber,
        validNumber,
        validNumber,
        invalidValue
      )
      .map(([fieldIndex, t, h, p, bad]) => {
        const base = {
          temperature_2m: t,
          relative_humidity_2m: h,
          precipitation: p,
        };
        const fields = ['temperature_2m', 'relative_humidity_2m', 'precipitation'];
        return { ...base, [fields[fieldIndex]]: bad };
      });

    await fc.assert(
      fc.asyncProperty(corruptedCurrent, async (current) => {
        vi.stubGlobal('fetch', async () => ({
          ok: true,
          json: async () => ({ current }),
        }));

        const result = await fetchWeather(-12.0, -77.0);

        return result.ok === false && result.error === 'invalid_data';
      }),
      { numRuns: 100 }
    );
  });

  // ─── Sub-property 9b: The `current` object itself is null or missing ───────

  it('9b — should return invalid_data when current is null or absent', async () => {
    const missingCurrent = fc.oneof(
      fc.constant(null),
      fc.constant(undefined)
    );

    await fc.assert(
      fc.asyncProperty(missingCurrent, async (current) => {
        vi.stubGlobal('fetch', async () => ({
          ok: true,
          json: async () => ({ current }),
        }));

        const result = await fetchWeather(-12.0, -77.0);

        return result.ok === false && result.error === 'invalid_data';
      }),
      { numRuns: 100 }
    );
  });
});
