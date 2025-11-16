/**
 * next-intl configuration for Next.js 15 App Router
 *
 * This file configures internationalization (i18n) for the application
 * using next-intl's Server Components integration pattern.
 *
 * @see https://next-intl-docs.vercel.app/docs/getting-started/app-router
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getRequestConfig } from 'next-intl/server';

/**
 * Supported locale codes
 *
 * The application supports French (fr) and English (en).
 */
export type Locale = 'fr' | 'en';

/**
 * Array of all supported locales
 *
 * Used for locale validation and routing configuration.
 */
export const locales = ['fr', 'en'] as const;

/**
 * Default locale for the application
 *
 * French (fr) is the primary language per PRD requirements.
 */
export const defaultLocale: Locale = 'fr';

// getRequestConfig implementation will be added in subsequent commits
