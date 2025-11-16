/**
 * next-intl configuration for Next.js 15 App Router
 *
 * This file configures internationalization (i18n) for the application
 * using next-intl's Server Components integration pattern.
 *
 * @see https://next-intl-docs.vercel.app/docs/getting-started/app-router
 */

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

/**
 * next-intl request configuration for Server Components
 *
 * This function is called by next-intl for each request to load
 * the appropriate translations based on the current locale.
 *
 * Message files will be created in Story 1.2 (messages/fr.json, messages/en.json).
 * The dynamic import prepares the structure for those files.
 *
 * @param locale - The current locale (provided by next-intl middleware)
 * @returns Configuration object with messages for the locale
 *
 * @see https://next-intl-docs.vercel.app/docs/usage/configuration#i18n-request
 */
export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale is valid
  const validLocale: Locale = locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale;

  if (validLocale !== locale) {
    console.warn(`Invalid locale requested: ${locale}. Falling back to ${defaultLocale}.`);
  }

  return {
    locale: validLocale,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});
