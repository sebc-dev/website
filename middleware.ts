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
import { handleRootPathRedirect } from '@/lib/i18n/redirect';

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
 * Parses the Accept-Language header with quality value support
 *
 * Extracts language codes from the Accept-Language header and returns them
 * in priority order (highest quality value first).
 *
 * Format: `Accept-Language: fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7`
 *
 * Parsing logic:
 * 1. Split by comma to get individual language entries
 * 2. For each entry, extract language code and quality value (q=X.X)
 * 3. Default quality value is 1.0 if not specified
 * 4. For language variants (e.g., fr-FR), extract just the language code (fr)
 * 5. Sort by quality value (descending)
 * 6. Return array of unique language codes in priority order
 *
 * Edge cases handled:
 * - Language variants: `fr-FR` → `fr`, `en-US` → `en`
 * - Missing quality values: treated as q=1.0 (highest priority)
 * - Multiple quality values: properly sorted in order
 * - Malformed quality values: skipped gracefully
 * - Empty header: returns empty array
 * - Whitespace: properly trimmed
 *
 * @param headerValue - The Accept-Language header value (e.g., "fr,en;q=0.9")
 * @returns Array of language codes in priority order (highest q first)
 *
 * @example
 * parseAcceptLanguage('fr,en;q=0.9')
 * // Returns: ['fr', 'en']
 *
 * @example
 * parseAcceptLanguage('en;q=0.8,fr;q=0.9')
 * // Returns: ['fr', 'en'] (reordered by quality)
 *
 * @example
 * parseAcceptLanguage('fr-FR,fr;q=0.9,en-US;q=0.8')
 * // Returns: ['fr', 'en'] (language variants extracted)
 */
export function parseAcceptLanguage(headerValue: string): string[] {
  if (!headerValue || typeof headerValue !== 'string') {
    return [];
  }

  // Split by comma to get individual language entries
  const entries = headerValue.split(',');

  // Parse each entry to extract language code and quality value
  const parsedEntries: Array<{ lang: string; quality: number }> = [];

  for (const entry of entries) {
    const trimmed = entry.trim();
    if (!trimmed) continue;

    // Split by semicolon to separate language from quality value
    const [langPart, ...qualityParts] = trimmed.split(';');
    const lang = langPart.trim();

    if (!lang) continue;

    // Extract just the language code (first 2 characters before any dash)
    // Example: fr-FR → fr, en-US → en
    const languageCode = lang.split('-')[0].toLowerCase();

    // Parse quality value (default is 1.0 if not specified)
    let quality = 1.0;
    if (qualityParts.length > 0) {
      const qualityStr = qualityParts[0].trim();
      if (qualityStr.startsWith('q=')) {
        const qValue = parseFloat(qualityStr.substring(2));
        if (!isNaN(qValue)) {
          quality = qValue;
        }
      }
    }

    parsedEntries.push({ lang: languageCode, quality });
  }

  // Sort by quality value (descending) to get highest priority first
  parsedEntries.sort((a, b) => b.quality - a.quality);

  // Extract unique language codes while preserving order
  const seen = new Set<string>();
  const result: string[] = [];

  for (const { lang } of parsedEntries) {
    if (!seen.has(lang)) {
      seen.add(lang);
      result.push(lang);
    }
  }

  return result;
}

/**
 * Detects the locale from the NEXT_LOCALE cookie
 *
 * Reads the `NEXT_LOCALE` cookie from the request and validates its value
 * against the supported locales.
 *
 * The cookie name `NEXT_LOCALE` follows next-intl convention for storing
 * user's language preference.
 *
 * Logic:
 * 1. Read `NEXT_LOCALE` cookie from request
 * 2. Validate the value against supported locales
 * 3. Return the locale if valid, undefined otherwise
 *
 * Edge cases handled:
 * - Missing cookie: returns undefined
 * - Invalid cookie value: returns undefined
 * - Empty string: returns undefined
 * - Unsupported locale: returns undefined
 * - Case sensitivity: only lowercase locale codes supported
 *
 * @param cookieValue - The value of the NEXT_LOCALE cookie (optional)
 * @returns The detected locale if valid, undefined otherwise
 *
 * @example
 * getLocaleFromCookie('fr')
 * // Returns: 'fr'
 *
 * @example
 * getLocaleFromCookie('en')
 * // Returns: 'en'
 *
 * @example
 * getLocaleFromCookie('de')
 * // Returns: undefined (not supported)
 *
 * @example
 * getLocaleFromCookie(undefined)
 * // Returns: undefined (missing cookie)
 */
export function getLocaleFromCookie(cookieValue?: string): Locale | undefined {
  if (!cookieValue || typeof cookieValue !== 'string') {
    return undefined;
  }

  // Trim and validate against supported locales
  const trimmedValue = cookieValue.trim();

  if (locales.includes(trimmedValue as Locale)) {
    return trimmedValue as Locale;
  }

  return undefined;
}

/**
 * Detects the locale from the Accept-Language header
 *
 * Parses the Accept-Language header and finds the first language code
 * that is supported by the application.
 *
 * Logic:
 * 1. Parse the Accept-Language header using parseAcceptLanguage()
 * 2. Iterate through parsed languages in priority order
 * 3. Return the first language that is in supported locales
 * 4. Return undefined if no supported language found
 *
 * Edge cases handled:
 * - Empty or missing header: returns undefined
 * - No supported languages in header: returns undefined
 * - Multiple supported languages: returns highest priority one
 * - Language variants (en-US): properly matched to base language (en)
 *
 * @param headerValue - The Accept-Language header value
 * @returns The detected locale if found, undefined otherwise
 *
 * @example
 * getLocaleFromHeader('fr,en;q=0.9')
 * // Returns: 'fr' (highest priority, supported)
 *
 * @example
 * getLocaleFromHeader('en;q=0.8,fr;q=0.9')
 * // Returns: 'fr' (reordered by quality, returns highest)
 *
 * @example
 * getLocaleFromHeader('de,it;q=0.9')
 * // Returns: undefined (no supported languages)
 *
 * @example
 * getLocaleFromHeader('en-US,en;q=0.9')
 * // Returns: 'en' (variant matched to base language)
 */
export function getLocaleFromHeader(headerValue: string): Locale | undefined {
  if (!headerValue) {
    return undefined;
  }

  // Parse the header to get language codes in priority order
  const parsedLanguages = parseAcceptLanguage(headerValue);

  // Find the first supported locale
  for (const lang of parsedLanguages) {
    if (locales.includes(lang as Locale)) {
      return lang as Locale;
    }
  }

  return undefined;
}

/**
 * Detects the locale based on the full detection hierarchy
 *
 * Implements the complete detection priority order:
 * 1. URL path prefix (highest priority)
 * 2. NEXT_LOCALE cookie
 * 3. Accept-Language header
 * 4. Default to French (lowest priority)
 *
 * This function always returns a valid `Locale` (never undefined).
 * If none of the detection sources provide a valid locale, defaults to French.
 *
 * @param request - The incoming HTTP request
 * @returns The detected locale (always valid, never undefined)
 *
 * @example
 * // With URL: /en/articles
 * detectLocale(request) // Returns: 'en'
 *
 * @example
 * // No URL prefix, cookie is fr
 * detectLocale(request) // Returns: 'fr'
 *
 * @example
 * // No URL, no cookie, header has en
 * detectLocale(request) // Returns: 'en'
 *
 * @example
 * // No detection sources
 * detectLocale(request) // Returns: 'fr' (default)
 */
function detectLocale(request: NextRequest): Locale {
  const { pathname } = request.nextUrl;

  // Priority 1: URL path prefix (highest)
  const localeFromURL = detectLocaleFromURL(pathname);
  if (localeFromURL) {
    return localeFromURL;
  }

  // Priority 2: Cookie
  const cookieValue = request.cookies.get('NEXT_LOCALE')?.value;
  const localeFromCookie = getLocaleFromCookie(cookieValue);
  if (localeFromCookie) {
    return localeFromCookie;
  }

  // Priority 3: Header
  const acceptLanguageHeader = request.headers.get('Accept-Language') || '';
  const localeFromHeader = getLocaleFromHeader(acceptLanguageHeader);
  if (localeFromHeader) {
    return localeFromHeader;
  }

  // Priority 4: Default to French
  return 'fr';
}

/**
 * Determines if a redirect is needed for the request
 *
 * A redirect is needed when:
 * 1. The URL contains a language prefix (e.g., /fr/, /en/)
 * 2. The detected locale from all sources differs from the URL prefix
 * 3. The URL prefix is invalid (e.g., /de/, /it/)
 *
 * A redirect is NOT needed when:
 * 1. No language prefix in URL (handled by next-intl routing)
 * 2. URL prefix already matches detected locale
 * 3. Route is public/static (excluded by matcher)
 *
 * @param pathname - The URL pathname
 * @param detectedLocale - The locale detected from all sources
 * @returns true if redirect is needed, false otherwise
 *
 * @example
 * // URL: /de/articles, detected: 'fr' (no de in supported locales)
 * shouldRedirect('/de/articles', 'fr') // Returns: true
 *
 * @example
 * // URL: /fr/articles, detected: 'fr'
 * shouldRedirect('/fr/articles', 'fr') // Returns: false
 *
 * @example
 * // URL: /articles (no prefix), detected: 'en' (from header)
 * shouldRedirect('/articles', 'en') // Returns: false (no URL prefix to redirect)
 */
function shouldRedirect(pathname: string, detectedLocale: Locale): boolean {
  // Extract locale from URL
  const localeFromURL = detectLocaleFromURL(pathname);

  // No redirect needed if URL has no language prefix
  if (!localeFromURL) {
    return false;
  }

  // No redirect needed if URL prefix matches detected locale
  if (localeFromURL === detectedLocale) {
    return false;
  }

  // Redirect needed: URL has invalid or mismatched locale
  return true;
}

/**
 * Middleware function entry point
 *
 * This function is called for every incoming request to the application.
 * It handles language detection and routing based on the configured
 * detection hierarchy.
 *
 * Implements (Commit 4):
 * - Full language detection with priority hierarchy
 * - Redirect logic for unsupported language prefixes
 * - Public route exclusion for performance
 * - Fallback to French as default language
 *
 * Detection process (in priority order):
 * 1. URL path prefix (e.g., /fr/*, /en/*)
 * 2. NEXT_LOCALE cookie
 * 3. Accept-Language header
 * 4. Default to French
 *
 * Redirect behavior:
 * - Only redirects if URL has invalid language prefix
 * - Uses HTTP 307 (Temporary Redirect) for protocol safety
 * - Preserves path and query parameters during redirect
 * - Avoids infinite redirects (checks if URL already correct)
 *
 * @param request - The incoming HTTP request
 * @returns NextResponse.next() to continue, or redirect response
 *
 * @remarks
 * Public routes are excluded by the matcher config, so this middleware
 * only runs on user-facing app routes.
 *
 * @see matcher configuration below for excluded routes
 */
export function middleware(request: NextRequest): NextResponse | undefined {
  const { pathname } = request.nextUrl;

  // Detect the appropriate locale from all sources
  const detectedLocale = detectLocale(request);

  // Early check: Handle root path redirection
  // Redirect `/` to `/fr/` or `/en/` based on detected language
  const rootPathRedirect = handleRootPathRedirect(request, detectedLocale);
  if (rootPathRedirect) {
    return rootPathRedirect;
  }

  // Check if redirect is needed (unsupported language in URL)
  if (shouldRedirect(pathname, detectedLocale)) {
    // Build the redirect URL with the correct locale
    const segments = pathname.split('/');
    // Replace the invalid locale prefix with the detected one
    segments[1] = detectedLocale;
    const newPathname = segments.join('/');

    // Create new URL and preserve query parameters
    const url = new URL(request.nextUrl);
    url.pathname = newPathname;

    // Return 307 Temporary Redirect for protocol safety
    return NextResponse.redirect(url, { status: 307 });
  }

  // No redirect needed, continue to next handler
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
