import { getRequestConfig } from 'next-intl/server';

import { defaultLocale, type Locale, locales } from './config';

type Messages = Record<string, unknown>;

async function loadMessages(locale: string): Promise<Messages> {
  const imported = (await import(`../messages/${locale}.json`)) as {
    default: Messages;
  };
  return imported.default;
}

export default getRequestConfig(async ({ requestLocale }) => {
  // Get locale from request
  let locale = await requestLocale;

  // Validate and fallback
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  // Load messages with fallback for missing files
  let messages: Messages;
  try {
    messages = await loadMessages(locale);
  } catch (error) {
    console.error(
      `[i18n] Failed to load messages for locale "${locale}":`,
      error,
    );
    // Fallback to default locale messages, or empty object if that also fails
    try {
      messages = await loadMessages(defaultLocale);
    } catch {
      console.error(
        `[i18n] Failed to load fallback messages for default locale "${defaultLocale}"`,
      );
      messages = {};
    }
  }

  return {
    locale,
    messages,
  };
});
