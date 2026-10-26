// Feature: weather-forecast-app, Property 2: El trim no cambia la validez de entradas válidas

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { validateCityName } from '../validation.js';

/**
 * Property 2: El trim no cambia la validez de entradas válidas
 *
 * Para cualquier nombre de ciudad válido `c`, añadir espacios en blanco
 * arbitrarios al inicio y al final SHALL producir el mismo resultado de
 * validación que `validateCityName(c)`.
 *
 * Validates: Requirements 1.4
 */
describe('Property 2: Trim invariance for valid city names', () => {
  it('adding leading/trailing spaces does not change validation result', () => {
    // Known valid city names used as base inputs
    const validCityNames = fc.constantFrom(
      'Lima',
      'Berlin',
      'São Paulo',
      'New York',
      "O'Brien",
      'Paris',
      'Tokio',
      'Buenos Aires',
      'México',
      'Bogotá',
    );

    // Generators for leading/trailing space padding (0–10 spaces each)
    const spaces = fc.stringOf(fc.constant(' '), { minLength: 0, maxLength: 10 });

    fc.assert(
      fc.property(validCityNames, spaces, spaces, (base, leading, trailing) => {
        const paddedName = leading + base + trailing;

        const resultBase = validateCityName(base);
        const resultPadded = validateCityName(paddedName);

        // Both must agree on validity — trim must not affect the outcome
        return resultBase.valid === resultPadded.valid;
      }),
      { numRuns: 100 },
    );
  });
});
