/**
 * Validation utility functions
 */

import { BLOOD_TYPES } from './constants';

/**
 * Validate if a blood type is valid
 */
export function isValidBloodType(abo: string, rh: string): boolean {
  return (
    BLOOD_TYPES.ABO_OPTIONS.includes(abo as any) &&
    BLOOD_TYPES.RH_OPTIONS.includes(rh as any)
  );
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate if a string is not empty
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validate if a number is within a range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validate if a value is a valid percentage (0-1)
 */
export function isValidPercentage(value: number): boolean {
  return isInRange(value, 0, 1);
}

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Validate API key format
 */
export function isValidApiKey(apiKey: string): boolean {
  return typeof apiKey === 'string' && apiKey.length > 10 && !apiKey.includes(' ');
}
