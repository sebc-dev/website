/**
 * i18n module barrel exports
 *
 * This file provides a clean import interface for the i18n system.
 * Import from '\@/i18n' instead of specific files.
 */

// Re-export locale types and constants
export { defaultLocale, type Locale, locales } from './config';
// Re-export configuration
export { default as i18nConfig } from './config';
// Re-export type definitions
export type { IntlMessages, LocaleParam } from './types';
