import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCityInput,
  showLoading,
  hideLoading,
  showResults,
  showError,
  clearResults,
} from '../ui.js';

// Set up the DOM structure before each test
beforeEach(() => {
  document.body.innerHTML = `
    <input type="text" id="city-input" value="" />
    <button id="submit-btn" type="submit">Consultar</button>
    <div id="spinner" hidden></div>
    <section id="results" hidden></section>
    <div id="error" hidden></div>
  `;
});

// ─── showResults ──────────────────────────────────────────────────────────────

describe('showResults', () => {
  const sampleData = {
    cityName: 'Lima',
    temperature: 22.5,
    relativeHumidity: 80,
    precipitation: 1.2,
  };

  it('renders the city name in the DOM', () => {
    showResults(sampleData);
    expect(document.getElementById('results').textContent).toContain('Lima');
  });

  it('renders temperature with °C unit', () => {
    showResults(sampleData);
    const resultsEl = document.getElementById('results');
    expect(resultsEl.textContent).toContain('22.5');
    expect(resultsEl.innerHTML).toContain('°C');
  });

  it('renders relativeHumidity with % unit', () => {
    showResults(sampleData);
    const resultsEl = document.getElementById('results');
    expect(resultsEl.textContent).toContain('80');
    expect(resultsEl.innerHTML).toContain('%');
  });

  it('renders precipitation with mm unit', () => {
    showResults(sampleData);
    const resultsEl = document.getElementById('results');
    expect(resultsEl.textContent).toContain('1.2');
    expect(resultsEl.innerHTML).toContain('mm');
  });

  it('makes #results visible', () => {
    showResults(sampleData);
    expect(document.getElementById('results').hidden).toBe(false);
  });

  it('hides #error panel', () => {
    // First make error visible to ensure showResults actually hides it
    const errorEl = document.getElementById('error');
    errorEl.hidden = false;

    showResults(sampleData);
    expect(errorEl.hidden).toBe(true);
  });
});

// ─── showError ────────────────────────────────────────────────────────────────

describe('showError', () => {
  it('displays the message in #error', () => {
    showError('Something went wrong');
    expect(document.getElementById('error').textContent).toBe('Something went wrong');
  });

  it('truncates a 201-character message to exactly 200 characters', () => {
    const longMessage = 'A'.repeat(201);
    showError(longMessage);
    const displayed = document.getElementById('error').textContent;
    expect(displayed).toHaveLength(200);
    expect(displayed).toBe('A'.repeat(200));
  });

  it('does not truncate a message of exactly 200 characters', () => {
    const exactMessage = 'B'.repeat(200);
    showError(exactMessage);
    expect(document.getElementById('error').textContent).toHaveLength(200);
  });

  it('makes #error visible', () => {
    showError('Error!');
    expect(document.getElementById('error').hidden).toBe(false);
  });

  it('hides #results panel', () => {
    // Make results visible first
    const resultsEl = document.getElementById('results');
    resultsEl.hidden = false;

    showError('Error!');
    expect(resultsEl.hidden).toBe(true);
  });
});

// ─── showLoading / hideLoading ────────────────────────────────────────────────

describe('showLoading', () => {
  it('makes the spinner visible', () => {
    showLoading();
    expect(document.getElementById('spinner').hidden).toBe(false);
  });

  it('disables the submit button', () => {
    showLoading();
    expect(document.getElementById('submit-btn').disabled).toBe(true);
  });
});

describe('hideLoading', () => {
  it('hides the spinner', () => {
    // Ensure spinner is visible first
    document.getElementById('spinner').hidden = false;
    hideLoading();
    expect(document.getElementById('spinner').hidden).toBe(true);
  });

  it('re-enables the submit button', () => {
    // Disable button first
    document.getElementById('submit-btn').disabled = true;
    hideLoading();
    expect(document.getElementById('submit-btn').disabled).toBe(false);
  });
});

// ─── showLoading → hideLoading toggle ─────────────────────────────────────────

describe('showLoading / hideLoading toggle', () => {
  it('toggles spinner visibility correctly across calls', () => {
    const spinner = document.getElementById('spinner');
    expect(spinner.hidden).toBe(true); // initial state from beforeEach (hidden attr present)

    showLoading();
    expect(spinner.hidden).toBe(false);

    hideLoading();
    expect(spinner.hidden).toBe(true);
  });

  it('toggles button disabled state correctly across calls', () => {
    const btn = document.getElementById('submit-btn');
    expect(btn.disabled).toBe(false); // enabled by default

    showLoading();
    expect(btn.disabled).toBe(true);

    hideLoading();
    expect(btn.disabled).toBe(false);
  });
});

// ─── clearResults ─────────────────────────────────────────────────────────────

describe('clearResults', () => {
  it('empties the #results innerHTML', () => {
    showResults({ cityName: 'Lima', temperature: 20, relativeHumidity: 70, precipitation: 0 });
    clearResults();
    expect(document.getElementById('results').innerHTML).toBe('');
  });

  it('hides #results panel', () => {
    document.getElementById('results').hidden = false;
    clearResults();
    expect(document.getElementById('results').hidden).toBe(true);
  });

  it('clears the #error textContent', () => {
    document.getElementById('error').textContent = 'Some error';
    clearResults();
    expect(document.getElementById('error').textContent).toBe('');
  });

  it('hides #error panel', () => {
    document.getElementById('error').hidden = false;
    clearResults();
    expect(document.getElementById('error').hidden).toBe(true);
  });
});
