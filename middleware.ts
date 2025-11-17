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
import createMiddleware from 'next-intl/middleware';

import type { Locale } from '@/i18n';
import { defaultLocale, locales, routingConfig } from '@/i18n/config';
import { validateLocale } from '@/lib/i18n/cookie';
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
  if (validateLocale(potentialLocale)) {
    return potentialLocale;
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
 * 4. Skip languages with q=0 (explicitly refused by client)
 * 5. For language variants (e.g., fr-FR), extract just the language code (fr)
 * 6. Sort by quality value (descending)
 * 7. Return array of unique language codes in priority order
 *
 * Edge cases handled:
 * - Language variants: `fr-FR` → `fr`, `en-US` → `en`
 * - Missing quality values: treated as q=1.0 (highest priority)
 * - Quality value of 0: language is ignored (explicitly refused)
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
 *
 * @example
 * parseAcceptLanguage('fr,en;q=0')
 * // Returns: ['fr'] (en with q=0 is ignored)
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

    // Skip languages with quality=0 (explicitly refused)
    if (quality === 0) continue;

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

  // Trim and validate against supported locales using centralized validation
  const trimmedValue = cookieValue.trim();

  if (validateLocale(trimmedValue)) {
    return trimmedValue;
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
    if (validateLocale(lang)) {
      return lang;
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
 * 4. Default locale from config (lowest priority)
 *
 * This function always returns a valid `Locale` (never undefined).
 * If none of the detection sources provide a valid locale, uses the configured default.
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
 * detectLocale(request) // Returns: 'fr' (configured default)
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

  // Priority 4: Default locale from config
  return defaultLocale;
}

/**
 * next-intl middleware configuration
 *
 * Creates the next-intl middleware handler with routing configuration.
 * This handler initializes the i18n context and makes it available to
 * Server Components and Client Components via `useTranslations()`.
 *
 * Configuration:
 * - locales: ['fr', 'en'] - Supported language codes
 * - defaultLocale: 'fr' - Fallback language
 * - localePrefix: 'always' - All routes require language prefix (/fr/ or /en/)
 *
 * The middleware automatically:
 * - Detects locale from URL, cookie, or Accept-Language header
 * - Redirects to appropriate locale-prefixed route if missing
 * - Sets NEXT_LOCALE cookie for persistence
 * - Initializes i18n context for component access
 *
 * @see https://next-intl.dev/docs/routing/middleware
 */
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  ...routingConfig,
});

/**
 * Cookie options for NEXT_LOCALE cookie
 *
 * Consistent configuration used across all locale cookie operations.
 */
const LOCALE_COOKIE_OPTIONS = {
  maxAge: 31536000, // 1 year in seconds
  sameSite: 'lax' as const,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

/**
 * Middleware function entry point
 *
 * This function wraps next-intl middleware with custom logic for:
 * 1. Language detection from URL, cookie, and Accept-Language header
 * 2. Root path redirection (/ → /fr/ or /en/)
 * 3. Cookie persistence with secure flags
 * 4. i18n context initialization for components
 *
 * Execution flow:
 * 1. Detect locale from all sources (URL → cookie → header → default)
 * 2. Handle root path redirection early (before next-intl)
 * 3. Call next-intl middleware to initialize i18n context
 * 4. Set NEXT_LOCALE cookie in response headers with secure flags
 * 5. Return response with i18n context available to components
 *
 * Detection priority (highest to lowest):
 * 1. URL path prefix (e.g., /fr/*, /en/*)
 * 2. NEXT_LOCALE cookie
 * 3. Accept-Language header
 * 4. Default to French
 *
 * Cookie management:
 * - Cookie name: NEXT_LOCALE
 * - Cookie value: detected locale ('fr' or 'en')
 * - Secure flags: HttpOnly, SameSite=Lax, Secure (production only)
 * - TTL: 1 year (31536000 seconds)
 *
 * @param request - The incoming HTTP request
 * @returns NextResponse with i18n context initialized
 *
 * @remarks
 * Public routes are excluded by the matcher config, so this middleware
 * only runs on user-facing app routes.
 *
 * @see matcher configuration below for excluded routes
 */
export function middleware(request: NextRequest): NextResponse {
  // Step 1: Detect the appropriate locale from all sources
  // This uses our custom detection hierarchy: URL → cookie → header → default
  const detectedLocale = detectLocale(request);

  // Step 2: Early check - Handle root path redirection
  // Redirect `/` to `/fr/` or `/en/` based on detected language
  // This must happen BEFORE next-intl middleware to avoid conflicts
  const rootPathRedirect = handleRootPathRedirect(request, detectedLocale);
  if (rootPathRedirect) {
    // Set cookie in the redirect response using Next.js cookies API
    rootPathRedirect.cookies.set(
      'NEXT_LOCALE',
      detectedLocale,
      LOCALE_COOKIE_OPTIONS,
    );
    return rootPathRedirect;
  }

  // Step 3: Call next-intl middleware to initialize i18n context
  // This makes the locale available to components via useTranslations()
  // next-intl handles locale detection and routing automatically
  const response = intlMiddleware(request);

  // Step 4: Set NEXT_LOCALE cookie only if missing or different
  // This persists the user's language preference across sessions
  // Only set cookie when necessary to avoid redundant Set-Cookie headers
  const existingCookie = request.cookies.get('NEXT_LOCALE')?.value;
  if (existingCookie !== detectedLocale) {
    response.cookies.set('NEXT_LOCALE', detectedLocale, LOCALE_COOKIE_OPTIONS);
  }

  // Step 5: Return response with i18n context initialized
  // Components can now use useTranslations() to access messages
  return response;
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
 * - Routes with dots in segments (e.g., /fr/version-2.0/features)
 *
 * Explicitly excluded:
 * - /_next/* (Next.js internal routes)
 * - /api/* (API routes)
 * - /public/* (Static public files)
 * - /images/* (Images)
 * - Static files with common extensions in the final path segment
 *   (.png, .svg, .jpg, .jpeg, .gif, .ico, .webp, .avif, .ttf, .otf, .woff, .woff2,
 *    .js, .css, .json, .xml, .txt, .pdf, .zip)
 *
 * This matcher ensures the middleware runs only on user-facing routes,
 * avoiding unnecessary processing of static assets and API routes while
 * allowing dotted route segments like version numbers.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
 */
export const config = {
  matcher: [
    // Match all routes except those starting with excluded prefixes or ending with static file extensions
    '/((?!_next|api|public|images|.*\\.(png|svg|jpg|jpeg|gif|ico|webp|avif|ttf|otf|woff|woff2|js|css|json|xml|txt|pdf|zip)$|favicon\\.ico).*)',
  ],
};
