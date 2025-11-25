import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';

import type { Locale } from '@/i18n';
import { locales } from '@/i18n';
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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
 * - Renders the HTML element with dynamic lang attribute based on locale
 * - Returns 404 for invalid locale parameters
 *
 * The HTML/body structure is now here (moved from root layout) to support
 * dynamic lang attributes per locale, preventing hydration mismatches.
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
    <html lang={locale} className='dark' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
