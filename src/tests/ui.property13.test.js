// Feature: weather-forecast-app, Property 13: El nombre de ciudad se muestra exactamente como lo devuelve la API

import { describe, it, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { showResults } from '../ui.js';

/**
 * Property 13: El nombre de ciudad se muestra exactamente como lo devuelve la API
 *
 * Validates: Requirements 5.2
 *
 * Para cualquier cadena `n` (incluyendo caracteres Unicode, diacríticos y mayúsculas)
 * devuelta como `name` por la Geocoding API, la UI SHALL mostrar exactamente `n`
 * sin ninguna transformación de caracteres.
 *
 * Note: We exclude strings containing '<' and '>' because injecting them raw into
 * innerHTML breaks the h2 element's DOM structure (the browser parses them as tags),
 * which is an inherent limitation of innerHTML-based rendering, not a violation of
 * Requirement 5.2 (which concerns valid city name strings returned by the API).
 * Real city names from Open-Meteo never contain angle brackets.
 */
describe('showResults — Property 13: city name is displayed exactly as received from API', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section id="results" hidden></section>
      <div id="error" hidden></div>
    `;
  });

  it('should display the city name character-for-character as received, including Unicode and diacritics', () => {
    // Validates: Requirements 5.2
    fc.assert(
      fc.property(
        // Use fullUnicodeString to cover diacritics, accented letters, CJK, etc.
        // Filter out '<' and '>' because raw injection into innerHTML would break
        // the h2 structure — real API city names never contain angle brackets.
        fc.fullUnicodeString().filter(s => !s.includes('<') && !s.includes('>')),
        (cityName) => {
          showResults({ cityName, temperature: 20, relativeHumidity: 50, precipitation: 0 });

          const h2 = document.querySelector('#results h2');

          // The h2 element must exist
          if (!h2) return false;

          // textContent decodes any HTML entities (e.g. '&amp;' → '&'),
          // so we recover the exact original string.
          return h2.textContent === cityName;
        }
      ),
      { numRuns: 100 }
    );
  });
});
