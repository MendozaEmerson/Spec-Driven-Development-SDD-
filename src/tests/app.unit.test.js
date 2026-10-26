/**
 * Unit tests for app.js — handleSubmit orchestration
 *
 * Validates: Requirements 2.5, 3.6, 4.4, 5.3
 *
 * All direct dependencies are mocked so these tests exercise only the
 * orchestration logic in handleSubmit without hitting real DOM elements,
 * network calls or external modules.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';

// ─── Mock all dependencies before importing app.js ────────────────────────────
// vi.mock() calls are hoisted to the top of the file by Vitest, so the mocked
// versions are in place when handleSubmit is imported below.

vi.mock('../validation.js');
vi.mock('../geocodingService.js');
vi.mock('../weatherService.js');
vi.mock('../ui.js');

import { validateCityName } from '../validation.js';
import { geocodeCity } from '../geocodingService.js';
import { fetchWeather } from '../weatherService.js';
import { getCityInput, showLoading, hideLoading, showResults, showError } from '../ui.js';
import { handleSubmit } from '../app.js';

// ─── DOM fixture ──────────────────────────────────────────────────────────────
// app.js registers the submit listener on #weather-form when the module loads.
// We recreate a minimal DOM before each test so that element exists and mock
// state is reset between tests.

beforeEach(() => {
  document.body.innerHTML = `
    <form id="weather-form">
      <input id="city-input" value="" />
      <button id="submit-btn" type="submit">Consultar</button>
    </form>
    <div id="spinner" hidden></div>
    <section id="results" hidden></section>
    <div id="error" hidden></div>
  `;
  vi.clearAllMocks();
});

// ─── Shared mock event ────────────────────────────────────────────────────────

const mockEvent = { preventDefault: vi.fn() };

// ─── Helpers for common mock setups ──────────────────────────────────────────

function setupValidInput(city = 'Lima') {
  getCityInput.mockReturnValue(city);
  validateCityName.mockReturnValue({ valid: true });
}

function setupSuccessfulGeo(city = 'Lima') {
  geocodeCity.mockResolvedValue({
    ok: true,
    data: { name: city, latitude: -12.04, longitude: -77.03 },
  });
}

function setupSuccessfulWeather() {
  fetchWeather.mockResolvedValue({
    ok: true,
    data: { temperature: 22, relativeHumidity: 70, precipitation: 0 },
  });
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('handleSubmit', () => {

  // Test 1 ─── Validation failure ──────────────────────────────────────────────
  it('calls showError with validation message and does NOT call showLoading or any service when validation fails', async () => {
    getCityInput.mockReturnValue('');
    validateCityName.mockReturnValue({ valid: false, error: 'El nombre de ciudad es requerido.' });

    await handleSubmit(mockEvent);

    expect(showError).toHaveBeenCalledOnce();
    expect(showError).toHaveBeenCalledWith('El nombre de ciudad es requerido.');
    expect(showLoading).not.toHaveBeenCalled();
    expect(geocodeCity).not.toHaveBeenCalled();
    expect(fetchWeather).not.toHaveBeenCalled();
  });

  // Test 2 ─── showLoading called before geocoding ───────────────────────────
  it('calls showLoading before geocodeCity when validation passes', async () => {
    setupValidInput();

    const callOrder = [];
    showLoading.mockImplementation(() => callOrder.push('showLoading'));
    geocodeCity.mockImplementation(async () => {
      callOrder.push('geocodeCity');
      return { ok: false, error: 'not_found' }; // fail to keep test simple
    });

    await handleSubmit(mockEvent);

    expect(callOrder.indexOf('showLoading')).toBeLessThan(callOrder.indexOf('geocodeCity'));
    expect(callOrder[0]).toBe('showLoading');
  });

  // Test 3 ─── Geocoding failure: not_found ─────────────────────────────────
  it('shows the "no se encontró" error and does NOT call fetchWeather when geocoding returns not_found', async () => {
    setupValidInput();
    geocodeCity.mockResolvedValue({ ok: false, error: 'not_found' });

    await handleSubmit(mockEvent);

    expect(showError).toHaveBeenCalledOnce();
    expect(showError.mock.calls[0][0]).toMatch(/no se encontr/i);
    expect(fetchWeather).not.toHaveBeenCalled();
  });

  // Test 4 ─── Geocoding failure: unavailable ────────────────────────────────
  it('shows the geocoding unavailable error message when geocoding returns unavailable', async () => {
    setupValidInput();
    geocodeCity.mockResolvedValue({ ok: false, error: 'unavailable' });

    await handleSubmit(mockEvent);

    expect(showError).toHaveBeenCalledOnce();
    expect(showError.mock.calls[0][0]).toMatch(/geocodificaci/i);
    expect(showError.mock.calls[0][0]).toMatch(/disponible/i);
  });

  // Test 5 ─── Weather failure: unavailable ─────────────────────────────────
  it('shows the weather unavailable error message when fetchWeather returns unavailable', async () => {
    setupValidInput();
    setupSuccessfulGeo();
    fetchWeather.mockResolvedValue({ ok: false, error: 'unavailable' });

    await handleSubmit(mockEvent);

    expect(showError).toHaveBeenCalledOnce();
    expect(showError.mock.calls[0][0]).toMatch(/meteorol/i);
    expect(showError.mock.calls[0][0]).toMatch(/disponible/i);
  });

  // Test 6 ─── Full success ─────────────────────────────────────────────────
  it('calls showResults with combined city name and weather data on full success', async () => {
    setupValidInput('Buenos Aires');
    geocodeCity.mockResolvedValue({
      ok: true,
      data: { name: 'Buenos Aires', latitude: -34.61, longitude: -58.37 },
    });
    fetchWeather.mockResolvedValue({
      ok: true,
      data: { temperature: 18, relativeHumidity: 65, precipitation: 2 },
    });

    await handleSubmit(mockEvent);

    expect(showResults).toHaveBeenCalledOnce();
    expect(showResults).toHaveBeenCalledWith({
      cityName: 'Buenos Aires',
      temperature: 18,
      relativeHumidity: 65,
      precipitation: 2,
    });
    expect(showError).not.toHaveBeenCalled();
  });

  // Test 7 ─── hideLoading called after full success ────────────────────────
  it('calls hideLoading after a successful full flow', async () => {
    setupValidInput();
    setupSuccessfulGeo();
    setupSuccessfulWeather();

    await handleSubmit(mockEvent);

    expect(hideLoading).toHaveBeenCalledOnce();
  });

  // Test 8 ─── hideLoading called after geocoding failure ───────────────────
  it('calls hideLoading even when geocoding fails (finally block)', async () => {
    setupValidInput();
    geocodeCity.mockResolvedValue({ ok: false, error: 'not_found' });

    await handleSubmit(mockEvent);

    expect(hideLoading).toHaveBeenCalledOnce();
  });

  // Test 9 ─── hideLoading called after weather failure ─────────────────────
  it('calls hideLoading even when fetchWeather fails (finally block)', async () => {
    setupValidInput();
    setupSuccessfulGeo();
    fetchWeather.mockResolvedValue({ ok: false, error: 'unavailable' });

    await handleSubmit(mockEvent);

    expect(hideLoading).toHaveBeenCalledOnce();
  });

  // Test 10 ─── geocodeCity receives the trimmed city name ──────────────────
  it('passes the exact string returned by getCityInput to geocodeCity', async () => {
    const city = 'Cusco';
    getCityInput.mockReturnValue(city);
    validateCityName.mockReturnValue({ valid: true });
    geocodeCity.mockResolvedValue({ ok: false, error: 'not_found' });

    await handleSubmit(mockEvent);

    expect(geocodeCity).toHaveBeenCalledOnce();
    expect(geocodeCity).toHaveBeenCalledWith(city);
  });

});
