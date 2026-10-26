// Validation module for Weather Forecast App

export const ERROR_MESSAGES = {
  EMPTY_CITY: 'El nombre de ciudad es requerido.',
  CITY_TOO_LONG: 'El nombre de ciudad no debe superar los 100 caracteres.',
  INVALID_CHARS:
    'El nombre de ciudad contiene caracteres inválidos. Use solo letras, espacios, guiones o apóstrofes.',
};

/**
 * Validates a city name input.
 *
 * Rules (applied in order):
 *  1. null/undefined → treated as empty string.
 *  2. Trim whitespace before all checks.
 *  3. Empty or whitespace-only → EMPTY_CITY.
 *  4. Length > 100 after trim → CITY_TOO_LONG.
 *  5. Any character that is not a Unicode letter, space, hyphen or apostrophe → INVALID_CHARS.
 *
 * @param {*} raw - The raw user input.
 * @returns {{ valid: true } | { valid: false, error: string }}
 */
export function validateCityName(raw) {
  // Handle null / undefined gracefully
  const trimmed = (raw == null ? '' : String(raw)).trim();

  if (trimmed.length === 0) {
    return { valid: false, error: ERROR_MESSAGES.EMPTY_CITY };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: ERROR_MESSAGES.CITY_TOO_LONG };
  }

  // Allow: Unicode letters (\p{L}), spaces, hyphens, apostrophes
  // Any other character makes the input invalid.
  const VALID_CHARS = /^[\p{L}\s\-']+$/u;
  if (!VALID_CHARS.test(trimmed)) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_CHARS };
  }

  return { valid: true };
}
