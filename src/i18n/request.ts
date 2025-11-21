import { getRequestConfig } from 'next-intl/server';

import { defaultLocale, type Locale, locales } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  // Get locale from request
  let locale = await requestLocale;

  // Validate and fallback
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  // Load messages with fallback for missing files
  let messages: Record<string, unknown>;
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`[i18n] Failed to load messages for locale "${locale}":`, error);
    // Fallback to default locale messages, or empty object if that also fails
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      messages = (await import(`../../messages/${defaultLocale}.json`)).default;
    } catch {
      console.error(`[i18n] Failed to load fallback messages for default locale "${defaultLocale}"`);
      messages = {};
    }
  }

  return {
    locale,
    messages,
  };
});
