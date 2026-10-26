import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchWeather } from '../weatherService.js';

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build a mock fetch Response that resolves json() to `{ current }`.
 * Mirrors the real Open-Meteo weather response envelope.
 */
function mockWeatherResponse(current) {
  return {
    ok: true,
    json: async () => ({
      current,
    }),
  };
}

/** Build a mock Response that represents an HTTP error. */
function mockErrorResponse(status = 500) {
  return {
    ok: false,
    status,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('fetchWeather', () => {
  afterEach(() => vi.restoreAllMocks());

  // ─── 1. Successful response ───────────────────────────────────────────────

  describe('successful response', () => {
    it('returns ok:true with exact temperature, relativeHumidity, precipitation when all fields are valid numbers', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          mockWeatherResponse({
            temperature_2m: 22.5,
            relative_humidity_2m: 65,
            precipitation: 0.3,
          })
        )
      );

      const result = await fetchWeather(-12.04318, -77.02824);

      expect(result).toEqual({
        ok: true,
        data: {
          temperature: 22.5,
          relativeHumidity: 65,
          precipitation: 0.3,
        },
      });
    });
  });

  // ─── 2. HTTP errors → unavailable ────────────────────────────────────────

  describe('HTTP errors', () => {
    it('returns { ok: false, error: "unavailable" } on HTTP 500', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockErrorResponse(500)));

      const result = await fetchWeather(-12.04318, -77.02824);

      expect(result).toEqual({ ok: false, error: 'unavailable' });
    });

    it('returns { ok: false, error: "unavailable" } on HTTP 404', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockErrorResponse(404)));

      const result = await fetchWeather(-12.04318, -77.02824);

      expect(result).toEqual({ ok: false, error: 'unavailable' });
    });
  });

  // ─── 3. Network / timeout errors → unavailable ───────────────────────────

  describe('network and timeout errors', () => {
    it('returns { ok: false, error: "unavailable" } when fetch throws a network error', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('network error'))
      );

      const result = await fetchWeather(-12.04318, -77.02824);

      expect(result).toEqual({ ok: false, error: 'unavailable' });
    });

    it('returns { ok: false, error: "unavailable" } when fetch is aborted (timeout simulation)', async () => {
      const abortError = new DOMException('Aborted', 'AbortError');
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));

      const result = await fetchWeather(-12.04318, -77.02824);

      expect(result).toEqual({ ok: false, error: 'unavailable' });
    });
  });

  // ─── 4. Invalid data → invalid_data ──────────────────────────────────────

  describe('invalid data fields', () => {
    it('returns { ok: false, error: "invalid_data" } when temperature_2m is null', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          mockWeatherResponse({
            temperature_2m: null,
            relative_humidity_2m: 65,
            precipitation: 0.3,
          })
        )
      );

      const result = await fetchWeather(-12.04318, -77.02824);

      expect(result).toEqual({ ok: false, error: 'invalid_data' });
    });

    it('returns { ok: false, error: "invalid_data" } when relative_humidity_2m is undefined (field absent)', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          mockWeatherResponse({
            temperature_2m: 22.5,
            // relative_humidity_2m intentionally absent
            precipitation: 0.3,
          })
        )
      );

      const result = await fetchWeather(-12.04318, -77.02824);

      expect(result).toEqual({ ok: false, error: 'invalid_data' });
    });

    it('returns { ok: false, error: "invalid_data" } when precipitation is NaN', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          mockWeatherResponse({
            temperature_2m: 22.5,
            relative_humidity_2m: 65,
            precipitation: NaN,
          })
        )
      );

      const result = await fetchWeather(-12.04318, -77.02824);

      expect(result).toEqual({ ok: false, error: 'invalid_data' });
    });

    it('returns { ok: false, error: "invalid_data" } when temperature_2m is a string', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          mockWeatherResponse({
            temperature_2m: '22.5',
            relative_humidity_2m: 65,
            precipitation: 0.3,
          })
        )
      );

      const result = await fetchWeather(-12.04318, -77.02824);

      expect(result).toEqual({ ok: false, error: 'invalid_data' });
    });

    it('returns { ok: false, error: "invalid_data" } when current itself is null', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(mockWeatherResponse(null))
      );

      const result = await fetchWeather(-12.04318, -77.02824);

      expect(result).toEqual({ ok: false, error: 'invalid_data' });
    });
  });
});
