/**
 * TypeScript type definitions for i18n system
 *
 * This file contains type definitions for the internationalization
 * infrastructure. These types will be refined when message files
 * are created in Story 1.2.
 *
 * These types are used throughout the application for:
 * - Middleware language detection (src/middleware.ts)
 * - Component props and routing
 * - API response types
 * - Cookie value types
 */

import type { Locale } from './config';

export type { Locale };

/**
 * Structure of translation messages
 *
 * This type will be refined in Story 1.2 when actual message
 * structure is defined. For now, it's a generic object type.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IntlMessages = Record<string, any>;

/**
 * Locale parameter type for use in components and utilities
 */
export type LocaleParam = {
  locale: Locale;
};
