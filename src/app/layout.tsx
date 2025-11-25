import './globals.css';

import type { Metadata, Viewport } from 'next';
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
 * Viewport configuration for the root layout
 *
 * Defines responsive viewport settings for mobile devices.
 * Uses device-width for responsive design and prevents zooming.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-viewport
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

/**
 * Metadata configuration for the root layout
 *
 * Defines the primary SEO and social sharing metadata for the sebc.dev platform.
 * Includes Open Graph configuration for proper preview generation on social media.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export const metadata: Metadata = {
  title: "sebc.dev - Laboratoire d'apprentissage public",
  description:
    "À l'intersection de l'IA, de l'UX et de l'ingénierie logicielle. Blog technique, articles et guides sur le développement moderne.",
  keywords: [
    'IA',
    'UX',
    'ingénierie logicielle',
    'développement',
    'blog technique',
    'Next.js',
    'React',
  ],
  authors: [{ name: 'sebc.dev', url: 'https://sebc.dev' }],
  creator: 'sebc.dev',
  openGraph: {
    title: "sebc.dev - Laboratoire d'apprentissage public",
    description:
      "À l'intersection de l'IA, de l'UX et de l'ingénierie logicielle.",
    type: 'website',
    locale: 'fr_FR',
    url: 'https://sebc.dev',
    siteName: 'sebc.dev',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "sebc.dev - Laboratoire d'apprentissage public",
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "sebc.dev - Laboratoire d'apprentissage public",
    description:
      "À l'intersection de l'IA, de l'UX et de l'ingénierie logicielle.",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
};

/**
 * RootLayout Component
 *
 * The root layout component for the entire application. Provides:
 * - Font variable initialization (Geist Sans and Mono)
 * - Global styling context through globals.css
 *
 * Note: The <html> element is now in the localized layout (src/app/[locale]/layout.tsx)
 * to support dynamic lang attribute based on the active locale. This prevents hydration
 * mismatches when switching between locales.
 *
 * Performance:
 * - Font loading optimized via next/font/google
 * - CSS variables minimize duplicate theme definitions
 * - Minimal layout shift due to early font specification
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Font variables and global styles are inherited by all child components */}
      {/* Dark theme and HTML structure are provided by the localized layout */}
      {children}
    </>
  );
}
