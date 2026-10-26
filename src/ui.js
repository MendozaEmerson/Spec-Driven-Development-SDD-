// UI module for Weather Forecast App

/**
 * Reads and returns the current value of the city text input.
 * @returns {string}
 */
export function getCityInput() {
  return document.getElementById('city-input').value;
}

/**
 * Shows the loading spinner and disables the submit button.
 */
export function showLoading() {
  document.getElementById('spinner').hidden = false;
  document.getElementById('submit-btn').disabled = true;
}

/**
 * Hides the loading spinner and re-enables the submit button.
 */
export function hideLoading() {
  document.getElementById('spinner').hidden = true;
  document.getElementById('submit-btn').disabled = false;
}

/**
 * Renders weather data in the results panel and hides the error panel.
 * Replaces any previous content.
 *
 * @param {{ cityName: string, temperature: number, relativeHumidity: number, precipitation: number }} data
 */
export function showResults(data) {
  const resultsEl = document.getElementById('results');
  const errorEl = document.getElementById('error');

  // Replace previous content with new data
  resultsEl.innerHTML = `
    <h2>${data.cityName}</h2>
    <p class="temperature">${data.temperature} °C</p>
    <p class="humidity">${data.relativeHumidity} %</p>
    <p class="precipitation">${data.precipitation} mm</p>
  `;

  resultsEl.hidden = false;
  errorEl.hidden = true;
}

/**
 * Displays an error message (truncated to 200 chars) in the error panel
 * and hides the results panel.
 *
 * @param {string} message
 */
export function showError(message) {
  const resultsEl = document.getElementById('results');
  const errorEl = document.getElementById('error');

  errorEl.textContent = message.slice(0, 200);
  errorEl.hidden = false;
  resultsEl.hidden = true;
}

/**
 * Clears both the results and error panels and ensures they are hidden.
 */
export function clearResults() {
  const resultsEl = document.getElementById('results');
  const errorEl = document.getElementById('error');

  resultsEl.innerHTML = '';
  resultsEl.hidden = true;

  errorEl.textContent = '';
  errorEl.hidden = true;
}
