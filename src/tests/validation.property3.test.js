// Feature: weather-forecast-app, Property 3: Caracteres inválidos en el nombre producen error de validación

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { validateCityName } from '../validation.js';

/**
 * Property 3: Caracteres inválidos en el nombre producen error de validación
 *
 * Para cualquier cadena que contenga al menos un carácter distinto a letras
 * Unicode, espacios, guiones (-) o apóstrofes ('), validateCityName SHALL
 * retornar { valid: false }.
 *
 * Validates: Requirements 1.6
 *
 * Strategy:
 *  - Generate an invalid character (not a Unicode letter, not whitespace,
 *    not a hyphen, not an apostrophe) using fc.char() filtered.
 *  - Combine it with any base string by injecting it into the middle.
 *  - Keep the combined string ≤ 100 chars after trim so that, when the
 *    input is not empty, the only active rule is INVALID_CHARS.
 *    (Both CITY_TOO_LONG and INVALID_CHARS produce { valid: false }, so
 *    the property holds regardless, but staying ≤ 100 keeps the test
 *    focused on the chars rule.)
 */
describe('validateCityName — Property 3: strings with invalid characters are rejected', () => {
  it('should return { valid: false } for any string containing at least one prohibited character', () => {
    // Generator for a single character that is NOT allowed:
    //   not a Unicode letter (\p{L}), not whitespace (\s),
    //   not a hyphen (-), not an apostrophe (')
    const invalidChar = fc
      .char()
      .filter(c => !/[\p{L}\s\-']/u.test(c));

    // Base string: any string up to 49 chars (leaves room for the injected char)
    const baseString = fc.string({ maxLength: 49 });

    fc.assert(
      fc.property(invalidChar, baseString, baseString, (badChar, prefix, suffix) => {
        // Build: prefix + badChar + suffix, ensuring ≤ 100 chars after trim
        const combined = (prefix + badChar + suffix).slice(0, 100);

        const result = validateCityName(combined);
        return result.valid === false;
      }),
      { numRuns: 100 },
    );
  });
});
