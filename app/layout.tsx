import './globals.css';

import type { Metadata } from 'next';
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
 * Metadata configuration for the root layout
 *
 * Defines the primary SEO and social sharing metadata for the sebc.dev platform.
 * Includes Open Graph configuration for proper preview generation on social media.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export const metadata: Metadata = {
  title: 'sebc.dev - Laboratoire d\'apprentissage public',
  description:
    'À l\'intersection de l\'IA, de l\'UX et de l\'ingénierie logicielle. Blog technique, articles et guides sur le développement moderne.',
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
    title: 'sebc.dev - Laboratoire d\'apprentissage public',
    description:
      'À l\'intersection de l\'IA, de l\'UX et de l\'ingénierie logicielle.',
    type: 'website',
    locale: 'fr_FR',
    url: 'https://sebc.dev',
    siteName: 'sebc.dev',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'sebc.dev - Laboratoire d\'apprentissage public',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'sebc.dev - Laboratoire d\'apprentissage public',
    description:
      'À l\'intersection de l\'IA, de l\'UX et de l\'ingénierie logicielle.',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
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
 * - Dark theme application via `className='dark'` on HTML element
 * - Font variable initialization (Geist Sans and Mono)
 * - Global styling context through globals.css
 * - Language setting (French: lang='fr')
 *
 * Accessibility:
 * - Language properly set to 'fr' for French content
 * - Semantic HTML structure maintained
 * - CSS variables for theming accessible to all child components
 * - Font smoothing enabled via `antialiased` Tailwind class
 *
 * Styling:
 * - Dark theme class applied globally (className='dark')
 * - This enables Tailwind's dark mode for all descendants
 * - Custom Geist font variables for consistent typography
 * - Antialiasing for improved text rendering (especially in Safari)
 *
 * Performance:
 * - Font loading optimized via next/font/google
 * - CSS variables minimize duplicate theme definitions
 * - Minimal layout shift due to early font specification
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='fr' className='dark'>
      {/* Dark theme applied at root level for entire application */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* CSS variables available: --font-geist-sans, --font-geist-mono */}
        {children}
      </body>
    </html>
  );
}
