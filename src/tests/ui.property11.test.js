// Feature: weather-forecast-app, Property 11: Nuevos resultados reemplazan completamente el estado anterior

import { describe, it, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { showResults } from '../ui.js';

/**
 * Property 11: Nuevos resultados reemplazan completamente el estado anterior
 *
 * Validates: Requirements 4.2
 *
 * Para cualquier estado previo de la UI (resultados anteriores, mensaje de error,
 * o estado idle) y cualquier nuevo WeatherResult, invocar showResults SHALL eliminar
 * el contenido previo y mostrar únicamente los nuevos datos.
 */
describe('showResults — Property 11: new results completely replace previous state', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section id="results" hidden></section>
      <div id="error" hidden></div>
    `;
  });

  it('should replace all previous result content with the new WeatherResult', () => {
    // Use alphanumeric-only city names to avoid incidental HTML substring matches
    // (e.g. a single space or "<" would trivially appear in any HTML template)
    const cityNameArb = fc.stringOf(
      fc.char().filter(c => /[a-zA-Z0-9]/.test(c)),
      { minLength: 3 }
    );

    fc.assert(
      fc.property(
        // Generate two WeatherResult objects with guaranteed-different city names
        fc.tuple(cityNameArb, cityNameArb)
          .filter(([a, b]) => a !== b)
          .chain(([firstName, secondName]) =>
            fc.tuple(
              fc.record({
                cityName: fc.constant(firstName),
                temperature: fc.float(),
                relativeHumidity: fc.float(),
                precipitation: fc.float(),
              }),
              fc.record({
                cityName: fc.constant(secondName),
                temperature: fc.float(),
                relativeHumidity: fc.float(),
                precipitation: fc.float(),
              })
            )
          ),
        ([first, second]) => {
          // Show first result, then immediately replace with second
          showResults(first);
          showResults(second);

          const resultsEl = document.getElementById('results');
          const html = resultsEl.innerHTML;

          // The results panel must be visible
          if (resultsEl.hidden !== false) return false;

          // The second city's name must appear in the DOM
          if (!html.includes(second.cityName)) return false;

          // The first city's name must NOT appear in the DOM (names are guaranteed different)
          if (html.includes(first.cityName)) return false;

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
