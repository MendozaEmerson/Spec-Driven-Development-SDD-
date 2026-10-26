// App controller module for Weather Forecast App

import { validateCityName } from './validation.js';
import { geocodeCity } from './geocodingService.js';
import { fetchWeather } from './weatherService.js';
import { getCityInput, showLoading, hideLoading, showResults, showError } from './ui.js';

// Error messages for geocoding failures (keyed by geocodingService error codes)
export const GEO_ERRORS = {
  not_found: 'No se encontró la ciudad. Verifica el nombre e intenta de nuevo.',
  unavailable: 'El servicio de geocodificación no está disponible. Intenta más tarde.',
  invalid_response: 'El servicio de geocodificación devolvió una respuesta inesperada.',
};

// Error messages for weather service failures (keyed by weatherService error codes)
export const WEATHER_ERRORS = {
  unavailable: 'El servicio meteorológico no está disponible. Intenta más tarde.',
  invalid_data: 'Los datos meteorológicos no pudieron ser procesados.',
};

/**
 * Handles the weather form submit event.
 * Orchestrates: validation → geocoding → weather fetch → display results.
 * The loading indicator is always hidden in the finally block.
 *
 * @param {Event} event
 */
export async function handleSubmit(event) {
  event.preventDefault();

  const cityName = getCityInput();
  const validationResult = validateCityName(cityName);

  if (!validationResult.valid) {
    showError(validationResult.error);
    return;
  }

  showLoading();

  try {
    const geoResult = await geocodeCity(cityName);
    if (!geoResult.ok) {
      showError(GEO_ERRORS[geoResult.error]);
      return;
    }

    const weatherResult = await fetchWeather(
      geoResult.data.latitude,
      geoResult.data.longitude
    );
    if (!weatherResult.ok) {
      showError(WEATHER_ERRORS[weatherResult.error]);
      return;
    }

    showResults({
      cityName: geoResult.data.name,
      temperature: weatherResult.data.temperature,
      relativeHumidity: weatherResult.data.relativeHumidity,
      precipitation: weatherResult.data.precipitation,
    });
  } finally {
    // Always hide the loading indicator, regardless of success or error
    hideLoading();
  }
}

// Register the submit listener only when the form is present in the DOM
// (guard allows the module to be imported in test environments without a DOM form)
const form = document.getElementById('weather-form');
if (form) {
  form.addEventListener('submit', handleSubmit);
}
