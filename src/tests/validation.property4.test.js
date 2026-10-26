// Feature: weather-forecast-app, Property 4: Nombres que superan los 100 caracteres son rechazados

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { validateCityName } from '../validation.js';

/**
 * Property 4: Nombres que superan los 100 caracteres son rechazados
 *
 * Validates: Requirements 1.5
 *
 * Para cualquier cadena de longitud mayor a 100 caracteres, validateCityName
 * SHALL retornar { valid: false }, independientemente del contenido de los
 * primeros 100 caracteres.
 */
describe('validateCityName — Property 4: names exceeding 100 characters are rejected', () => {
  it('should return { valid: false } for any string of valid characters with length > 100', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom('a', 'b', 'c', 'd', 'e'), { minLength: 101 }),
        (longName) => {
          const result = validateCityName(longName);
          return result.valid === false;
        }
      ),
      { numRuns: 100 }
    );
  });
});
