import { describe, it, expect } from 'vitest';
import { validateCityName } from '../validation.js';

describe('validateCityName', () => {
  // ─── 1. Valid city names ────────────────────────────────────────────────────
  describe('valid city names', () => {
    it('accepts a simple ASCII name: "Lima"', () => {
      expect(validateCityName('Lima')).toEqual({ valid: true });
    });

    it('accepts a name with internal spaces: "New York"', () => {
      expect(validateCityName('New York')).toEqual({ valid: true });
    });

    it('accepts a name with Unicode letters: "São Paulo"', () => {
      expect(validateCityName('São Paulo')).toEqual({ valid: true });
    });

    it('accepts a name with an apostrophe: "O\'Brien"', () => {
      expect(validateCityName("O'Brien")).toEqual({ valid: true });
    });

    it('accepts a name with a hyphen and accented letters: "Saint-Étienne"', () => {
      expect(validateCityName('Saint-Étienne')).toEqual({ valid: true });
    });
  });

  // ─── 2. Empty / whitespace ──────────────────────────────────────────────────
  describe('empty or whitespace input', () => {
    it('rejects an empty string', () => {
      const result = validateCityName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('El nombre de ciudad es requerido.');
    });

    it('rejects a string of only spaces', () => {
      const result = validateCityName('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('El nombre de ciudad es requerido.');
    });
  });

  // ─── 3. Invalid characters ──────────────────────────────────────────────────
  describe('names with invalid characters', () => {
    it('rejects a name with digits: "Lima123"', () => {
      const result = validateCityName('Lima123');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(
        'El nombre de ciudad contiene caracteres inválidos. Use solo letras, espacios, guiones o apóstrofes.'
      );
    });

    it('rejects a name with "@": "Lima@City"', () => {
      const result = validateCityName('Lima@City');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(
        'El nombre de ciudad contiene caracteres inválidos. Use solo letras, espacios, guiones o apóstrofes.'
      );
    });

    it('rejects a name with "#": "Lima#1"', () => {
      const result = validateCityName('Lima#1');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(
        'El nombre de ciudad contiene caracteres inválidos. Use solo letras, espacios, guiones o apóstrofes.'
      );
    });
  });

  // ─── 4. Length boundary ────────────────────────────────────────────────────
  describe('length boundary at 100 characters', () => {
    it('accepts exactly 100 valid letters', () => {
      const name = 'A'.repeat(100);
      expect(validateCityName(name)).toEqual({ valid: true });
    });

    it('rejects exactly 101 valid letters', () => {
      const name = 'A'.repeat(101);
      const result = validateCityName(name);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('El nombre de ciudad no debe superar los 100 caracteres.');
    });
  });

  // ─── 5. null / undefined ───────────────────────────────────────────────────
  describe('null and undefined inputs', () => {
    it('rejects null', () => {
      const result = validateCityName(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('El nombre de ciudad es requerido.');
    });

    it('rejects undefined', () => {
      const result = validateCityName(undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('El nombre de ciudad es requerido.');
    });
  });

  // ─── 6. Strings consisting only of allowed punctuation ─────────────────────
  describe('strings with only hyphens or apostrophes', () => {
    it('accepts "---" (hyphens are an allowed character)', () => {
      // The regex allows hyphens; no letters are required, so "---" passes.
      expect(validateCityName('---')).toEqual({ valid: true });
    });

    it("accepts \"'''\" (apostrophes are an allowed character)", () => {
      // The regex allows apostrophes; no letters are required, so "'''" passes.
      expect(validateCityName("'''")).toEqual({ valid: true });
    });
  });
});
