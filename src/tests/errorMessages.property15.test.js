// Feature: weather-forecast-app, Property 15: Todos los mensajes de error tienen como máximo 200 caracteres

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { ERROR_MESSAGES } from '../validation.js';
import { GEO_ERRORS, WEATHER_ERRORS } from '../app.js';

/**
 * Property 15: All error messages have at most 200 characters.
 * Validates: Requirements 4.4
 *
 * Iterates over all error codes defined in the application modules
 * (EMPTY_CITY, CITY_TOO_LONG, INVALID_CHARS, CITY_NOT_FOUND,
 *  GEO_UNAVAILABLE, GEO_INVALID_RESPONSE, WEATHER_UNAVAILABLE, WEATHER_INVALID_DATA)
 * and verifies each message has length ≤ 200 characters.
 */

// Collect all error message entries from every module into one flat array.
// This is the source-of-truth set — tests run against the actual exported constants.
const allErrorEntries = [
  // From src/validation.js
  { code: 'EMPTY_CITY',            message: ERROR_MESSAGES.EMPTY_CITY },
  { code: 'CITY_TOO_LONG',         message: ERROR_MESSAGES.CITY_TOO_LONG },
  { code: 'INVALID_CHARS',         message: ERROR_MESSAGES.INVALID_CHARS },

  // From src/app.js (GEO_ERRORS)
  { code: 'CITY_NOT_FOUND',        message: GEO_ERRORS.not_found },
  { code: 'GEO_UNAVAILABLE',       message: GEO_ERRORS.unavailable },
  { code: 'GEO_INVALID_RESPONSE',  message: GEO_ERRORS.invalid_response },

  // From src/app.js (WEATHER_ERRORS)
  { code: 'WEATHER_UNAVAILABLE',   message: WEATHER_ERRORS.unavailable },
  { code: 'WEATHER_INVALID_DATA',  message: WEATHER_ERRORS.invalid_data },
];

describe('Property 15: todos los mensajes de error tienen ≤ 200 caracteres', () => {
  it('each error message sampled from the defined set has length ≤ 200', () => {
    // fc.constantFrom picks one entry per run from the fixed set of error messages.
    // With numRuns: 100, fast-check will sample the array repeatedly (cycling through
    // all 8 entries multiple times), confirming the property holds for every code.
    fc.assert(
      fc.property(
        fc.constantFrom(...allErrorEntries),
        ({ code, message }) => {
          // The property: every error message must have at most 200 characters
          return typeof message === 'string' && message.length <= 200;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all 8 error codes are present and their messages are non-empty strings ≤ 200 chars', () => {
    // Exhaustive deterministic check — ensures no error code is accidentally missing
    const expectedCodes = [
      'EMPTY_CITY',
      'CITY_TOO_LONG',
      'INVALID_CHARS',
      'CITY_NOT_FOUND',
      'GEO_UNAVAILABLE',
      'GEO_INVALID_RESPONSE',
      'WEATHER_UNAVAILABLE',
      'WEATHER_INVALID_DATA',
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...expectedCodes),
        (code) => {
          const entry = allErrorEntries.find(e => e.code === code);
          return (
            entry !== undefined &&
            typeof entry.message === 'string' &&
            entry.message.length > 0 &&
            entry.message.length <= 200
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
