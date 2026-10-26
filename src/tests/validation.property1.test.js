// Feature: weather-forecast-app, Property 1: Nombres compuestos solo de espacios en blanco son rechazados

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { validateCityName } from '../validation.js';

/**
 * Property 1: Nombres compuestos solo de espacios en blanco son rechazados
 *
 * Validates: Requirements 1.2, 1.3
 *
 * Para cualquier cadena compuesta únicamente por caracteres de espacio en blanco
 * (espacio, tab, etc.) de longitud ≥ 1, validateCityName SHALL retornar { valid: false }.
 */
describe('validateCityName — Property 1: whitespace-only names are rejected', () => {
  it('should return { valid: false } for any string composed only of whitespace characters', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.char().filter(c => /\s/.test(c)), { minLength: 1 }),
        (whitespaceOnlyName) => {
          const result = validateCityName(whitespaceOnlyName);
          return result.valid === false;
        }
      ),
      { numRuns: 100 }
    );
  });
});
