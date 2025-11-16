/**
 * Next.js Middleware for Next.js App Router with next-intl
 *
 * This middleware integrates next-intl library to provide automatic language
 * detection and routing for bilingual (French/English) URL structure.
 *
 * Detection Priority (highest to lowest):
 * 1. URL path prefix (e.g., `/fr/` or `/en/`)
 * 2. NEXT_LOCALE cookie value
 * 3. Browser Accept-Language header
 * 4. Default language (French)
 *
 * Middleware also:
 * - Excludes public routes for performance (/_next/*, /api/*, etc.)
 * - Validates language against supported locales
 * - Redirects unsupported language prefixes
 * - Preserves query parameters during redirects
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 * @see https://next-intl-docs.vercel.app/docs/getting-started/app-router
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import type { Locale } from '@/i18n';
import { locales } from '@/i18n/config';

/**
 * Detects the locale from the URL pathname prefix
 *
 * Extracts the language code from the beginning of the URL path.
 * For example:
 * - `/fr/articles` → `fr`
 * - `/en/search` → `en`
 * - `/de/articles` → `undefined` (invalid language)
 * - `/articles` → `undefined` (no prefix)
 * - `/` → `undefined` (root path)
 *
 * The function:
 * 1. Checks if pathname starts with a slash followed by a 2-letter code
 * 2. Extracts the potential locale code
 * 3. Validates it against the supported locales list
 * 4. Returns the locale if valid, undefined otherwise
 *
 * Edge cases handled:
 * - Root path `/` → returns undefined
 * - Trailing slashes `/fr/` → returns `fr`
 * - Nested paths `/fr/articles/slug` → returns `fr`
 * - Case sensitivity: `/FR/` → undefined (only lowercase supported)
 * - Invalid language codes `/de/` → undefined (not in supported locales)
 * - Paths without prefix `/articles` → undefined (no language code)
 *
 * @param pathname - The URL pathname (e.g., `/fr/articles`, `/en/search`)
 * @returns The detected locale if valid and supported, undefined otherwise
 *
 * @example
 * detectLocaleFromURL('/fr/articles')     // Returns: 'fr'
 * detectLocaleFromURL('/en/search')       // Returns: 'en'
 * detectLocaleFromURL('/de/articles')     // Returns: undefined
 * detectLocaleFromURL('/fr/articles/123') // Returns: 'fr'
 * detectLocaleFromURL('/')                // Returns: undefined
 * detectLocaleFromURL('/articles')        // Returns: undefined
 */
export function detectLocaleFromURL(pathname: string): Locale | undefined {
  // Skip processing if pathname doesn't contain enough characters for locale prefix
  if (!pathname || pathname === '/') {
    return undefined;
  }

  // Extract the first segment of the pathname
  // Example: '/fr/articles' → ['', 'fr', 'articles'] → segment = 'fr'
  const segments = pathname.split('/');
  const potentialLocale = segments[1];

  // Check if the first segment is exactly 2 characters (ISO 639-1 language code format)
  if (!potentialLocale || potentialLocale.length !== 2) {
    return undefined;
  }

  // Check if the extracted locale is in the supported locales list
  if (locales.includes(potentialLocale as Locale)) {
    return potentialLocale as Locale;
  }

  // Return undefined if locale is not supported
  return undefined;
}

/**
 * Middleware function entry point
 *
 * This function is called for every incoming request to the application.
 * It handles language detection and routing based on the configured
 * detection hierarchy.
 *
 * Currently implements URL-based detection only (Commit 2).
 * Additional detection sources (cookies, headers) will be added in Commit 3.
 * Redirect logic will be added in Commit 4.
 *
 * @param request - The incoming HTTP request
 * @returns The response (NextResponse.next() or redirect response)
 *
 * @remarks
 * The full detection and redirect logic will be completed in subsequent commits:
 * - Commit 2: URL-based detection (current)
 * - Commit 3: Cookie and header-based detection
 * - Commit 4: Redirect logic and middleware composition
 */
export function middleware(request: NextRequest): NextResponse | undefined {
  // Extract the pathname from the request
  const { pathname } = request.nextUrl;

  // Attempt URL-based language detection
  // This will be extended in Commit 3 with cookie and header detection
  const detectedLocale = detectLocaleFromURL(pathname);

  // Store the detected locale for use in Commit 3-4
  // For now, we just continue with the next middleware/handler
  // Redirect logic will be implemented in Commit 4
  if (detectedLocale) {
    // Language detected from URL - continue processing in Commit 4
  }

  return NextResponse.next();
}

/**
 * Matcher configuration for the middleware
 *
 * This regex pattern determines which requests are processed by the middleware.
 * The middleware will process requests that match this pattern.
 *
 * Current pattern processes:
 * - All app routes under [locale]/ (e.g., /fr/*, /en/*)
 * - Root path (/)
 *
 * Explicitly excluded:
 * - /_next/* (Next.js internal routes)
 * - /api/* (API routes)
 * - /public/* (Static public files)
 * - /images/* (Images)
 * - Static assets like .png, .svg, .jpg, .jpeg, .gif, .ico, .webp, .avif, .ttf, .otf, .woff, .woff2
 *
 * This matcher ensures the middleware runs only on user-facing routes,
 * avoiding unnecessary processing of static assets and API routes.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
 */
export const config = {
  matcher: [
    // Match all routes except the ones starting with the following
    '/((?!_next|api|public|images|.*\\..*|favicon\\.ico).*)',
  ],
};
