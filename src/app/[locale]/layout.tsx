import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';

import type { Locale } from '@/i18n';
import { locales } from '@/i18n';

/**
 * Generate static params for all supported locales
 *
 * This enables static generation for all locale routes at build time.
 * Next.js will pre-render pages for each locale in the locales array.
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * LocaleLayout - Layout wrapper for internationalized routes
 *
 * This layout:
 * - Validates the locale parameter against supported locales
 * - Sets the request locale for server components
 * - Provides NextIntlClientProvider for client components
 * - Returns 404 for invalid locale parameters
 *
 * The layout does not include HTML/body tags as those are in the root layout.
 * It serves as a validation and context-setting layer for i18n.
 */
export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale against supported locales
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering for this locale
  setRequestLocale(locale);

  // Get messages for client components
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
