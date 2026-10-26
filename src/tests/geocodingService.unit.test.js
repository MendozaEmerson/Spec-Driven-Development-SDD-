import { describe, it, expect, vi, afterEach } from 'vitest';
import { geocodeCity } from '../geocodingService.js';

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Build a mock Response that resolves json() to `body`. */
function mockOkResponse(body) {
  return {
    ok: true,
    json: async () => body,
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

describe('geocodeCity', () => {
  afterEach(() => vi.restoreAllMocks());

  // ─── 1. Successful responses ─────────────────────────────────────────────────

  describe('successful response', () => {
    it('returns ok:true with correct name/latitude/longitude from results[0] when API returns 1 result', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          mockOkResponse({
            results: [{ name: 'Lima', latitude: -12.04318, longitude: -77.02824 }],
          })
        )
      );

      const result = await geocodeCity('Lima');

      expect(result).toEqual({
        ok: true,
        data: { name: 'Lima', latitude: -12.04318, longitude: -77.02824 },
      });
    });

    it('returns data from results[0] only when API returns 2+ results', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          mockOkResponse({
            results: [
              { name: 'Paris', latitude: 48.8566, longitude: 2.3522 },
              { name: 'Paris', latitude: 33.6609, longitude: -95.5555 }, // Paris, Texas
            ],
          })
        )
      );

      const result = await geocodeCity('Paris');

      expect(result).toEqual({
        ok: true,
        data: { name: 'Paris', latitude: 48.8566, longitude: 2.3522 },
      });
    });
  });

  // ─── 2. not_found ─────────────────────────────────────────────────────────────

  describe('not_found', () => {
    it('returns { ok: false, error: "not_found" } when results array is empty', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(mockOkResponse({ results: [] }))
      );

      const result = await geocodeCity('Xyznonexistentcity');

      expect(result).toEqual({ ok: false, error: 'not_found' });
    });
  });

  // ─── 3. invalid_response ──────────────────────────────────────────────────────

  describe('invalid_response', () => {
    it('returns { ok: false, error: "invalid_response" } when the "results" key is missing', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(mockOkResponse({ generationtime_ms: 1.2 }))
      );

      const result = await geocodeCity('Lima');

      expect(result).toEqual({ ok: false, error: 'invalid_response' });
    });

    it('returns { ok: false, error: "invalid_response" } when "results" is null (non-array)', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(mockOkResponse({ results: null }))
      );

      const result = await geocodeCity('Lima');

      expect(result).toEqual({ ok: false, error: 'invalid_response' });
    });

    it('returns { ok: false, error: "invalid_response" } when first result is missing "latitude"', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          mockOkResponse({
            results: [{ name: 'Lima', longitude: -77.02824 }], // latitude absent
          })
        )
      );

      const result = await geocodeCity('Lima');

      expect(result).toEqual({ ok: false, error: 'invalid_response' });
    });
  });

  // ─── 4. HTTP errors → unavailable ────────────────────────────────────────────

  describe('HTTP errors', () => {
    it('returns { ok: false, error: "unavailable" } on HTTP 500', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockErrorResponse(500)));

      const result = await geocodeCity('Lima');

      expect(result).toEqual({ ok: false, error: 'unavailable' });
    });

    it('returns { ok: false, error: "unavailable" } on HTTP 404', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockErrorResponse(404)));

      const result = await geocodeCity('Lima');

      expect(result).toEqual({ ok: false, error: 'unavailable' });
    });
  });

  // ─── 5. Network error → unavailable ──────────────────────────────────────────

  describe('network errors', () => {
    it('returns { ok: false, error: "unavailable" } when fetch throws a network error', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('network error'))
      );

      const result = await geocodeCity('Lima');

      expect(result).toEqual({ ok: false, error: 'unavailable' });
    });

    it('returns { ok: false, error: "unavailable" } when the request is aborted (timeout simulation)', async () => {
      const abortError = new DOMException('Aborted', 'AbortError');
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));

      const result = await geocodeCity('Lima');

      expect(result).toEqual({ ok: false, error: 'unavailable' });
    });
  });
});
