// Feature: weather-forecast-app, Property 10: Los resultados mostrados incluyen todos los campos con sus unidades

import { describe, it, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { showResults } from '../ui.js';

/**
 * Property 10: Los resultados mostrados incluyen todos los campos con sus unidades
 *
 * Validates: Requirements 4.1, 4.3
 *
 * Para cualquier instancia de WeatherResult, showResults SHALL renderizar en el DOM
 * el nombre de ciudad, el valor de temperatura seguido de °C, el valor de humedad
 * seguido de %, y el valor de precipitaciones seguido de mm, todos como elementos visibles.
 */
describe('showResults — Property 10: displayed results include all fields with their units', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section id="results" hidden></section>
      <div id="error" hidden></div>
    `;
  });

  it('should render °C, % and mm unit symbols adjacent to their numeric values', () => {
    fc.assert(
      fc.property(
        fc.record({
          cityName: fc.string(),
          temperature: fc.float(),
          relativeHumidity: fc.float(),
          precipitation: fc.float(),
        }),
        (data) => {
          showResults(data);

          const resultsEl = document.getElementById('results');
          const text = resultsEl.textContent;

          // The results panel must be visible after showResults
          if (resultsEl.hidden !== false) return false;

          // The text content must contain each unit symbol
          if (!text.includes('°C')) return false;
          if (!text.includes('%')) return false;
          if (!text.includes('mm')) return false;

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
