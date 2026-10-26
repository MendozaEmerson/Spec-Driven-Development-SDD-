// Feature: weather-forecast-app, Property 12: Los valores numéricos mostrados son fieles a los recibidos de la API

import { describe, it, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { showResults } from '../ui.js';

describe('Property 12: Fidelidad numérica en la UI', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section id="results" hidden></section>
      <div id="error" hidden></div>
    `;
  });

  it('los valores parseados del DOM difieren del original en menos de 0.005', () => {
    // Validates: Requirements 5.1
    fc.assert(
      fc.property(
        fc.float({ noNaN: true, noDefaultInfinity: true }),
        fc.float({ noNaN: true, noDefaultInfinity: true }),
        fc.float({ noNaN: true, noDefaultInfinity: true }),
        (temperature, relativeHumidity, precipitation) => {
          showResults({ cityName: 'Test', temperature, relativeHumidity, precipitation });

          const tempText = document.querySelector('.temperature').textContent;   // "22.5 °C"
          const humText  = document.querySelector('.humidity').textContent;      // "78 %"
          const precText = document.querySelector('.precipitation').textContent; // "0.1 mm"

          const renderedTemp  = parseFloat(tempText);
          const renderedHum   = parseFloat(humText);
          const renderedPrec  = parseFloat(precText);

          return (
            Math.abs(renderedTemp  - temperature)      < 0.005 &&
            Math.abs(renderedHum   - relativeHumidity) < 0.005 &&
            Math.abs(renderedPrec  - precipitation)    < 0.005
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
