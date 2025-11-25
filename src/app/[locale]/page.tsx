import { setRequestLocale } from 'next-intl/server';

import type { Locale } from '@/i18n';
import { locales } from '@/i18n';
import { HomePageContent } from './home-page-content';

/**
 * Generate static params for all supported locales
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

/**
 * HomePage Component - Coming Soon Landing Page
 *
 * A visually impressive dark-themed landing page introducing the sebc.dev platform.
 * Features a sophisticated multi-layer animated background, gradient-animated title,
 * and glassmorphic UI elements with progressive stagger animations.
 *
 * Now fully internationalized using next-intl for French/English support.
 */
export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  // Enable static rendering for this locale
  setRequestLocale(locale as Locale);

  return <HomePageContent />;
}
