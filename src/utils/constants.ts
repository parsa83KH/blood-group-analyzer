/**
 * Application constants and configuration values
 */

export const APP_CONFIG = {
  NAME: 'Blood Group Analyzer',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI-powered genetic blood group analysis system',
} as const;

export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  GEMINI_MODEL: 'gemini-2.5-flash',
} as const;

export const BLOOD_TYPES = {
  ABO_OPTIONS: ['Unknown', 'A', 'B', 'AB', 'O', 'AA', 'AO', 'BB', 'BO', 'AB', 'OO'] as const,
  RH_OPTIONS: ['Unknown', '+', '-', 'DD', 'Dd', 'dd'] as const,
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000,
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;
