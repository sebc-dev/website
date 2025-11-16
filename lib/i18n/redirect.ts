/**
 * Root path redirection utilities for i18n routing
 *
 * Provides functions to handle redirection from the root path `/` to language-prefixed
 * routes `/fr/` or `/en/` based on detected language preferences.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Checks if a pathname is the root path
 *
 * Identifies whether the given pathname is the application root path `/` or
 * variations like `/?query` or `//?query`.
 *
 * Returns true for:
 * - `/`
 * - `/?foo=bar`
 * - `//?foo=bar` (double slash edge case)
 *
 * Returns false for:
 * - `/en/`
 * - `/fr/`
 * - `/api/`
 * - `/articles`
 *
 * @param pathname - The URL pathname to check
 * @returns true if the pathname is the root path, false otherwise
 *
 * @example
 * isRootPath('/');              // true
 * isRootPath('/?foo=bar');      // true (query params don't affect root check)
 * isRootPath('/en/');           // false
 * isRootPath('/fr/articles');   // false
 * isRootPath('/articles');      // false
 */
export function isRootPath(pathname: string): boolean {
  // Remove leading slashes and check if anything remains
  const normalized = pathname.replace(/^\/+/, '');

  // If the normalized string is empty, it's the root path
  return normalized === '';
}

/**
 * Handles root path redirection to language-prefixed routes
 *
 * Implements AC5: Redirect root path `/` to `/fr/` or `/en/` based on detected language.
 *
 * Logic:
 * 1. Check if the request is for the root path using `isRootPath()`
 * 2. If not root path, return null (no redirect needed)
 * 3. If root path, construct redirect URL with detected language prefix
 * 4. Preserve query parameters from the original request
 * 5. Return NextResponse with 307 Temporary Redirect status
 *
 * Why 307 Temporary Redirect?
 * - Preserves HTTP method (important for POST/PUT requests)
 * - Indicates the redirect is temporary (language preferences may change)
 * - Better for SEO than 302 Found
 *
 * Edge cases handled:
 * - Root path with query parameters: `/?foo=bar` → `/fr/?foo=bar`
 * - Multiple slashes: `//?foo=bar` → `/fr/?foo=bar`
 * - Already language-prefixed: `/fr/` → null (no redirect)
 * - Non-root paths: `/articles` → null (no redirect)
 *
 * @param request - The incoming HTTP request
 * @param detectedLanguage - The detected language code ('fr' or 'en')
 * @returns NextResponse redirect if root path, null otherwise
 *
 * @example
 * // Request: GET /
 * // detectedLanguage: 'fr'
 * handleRootPathRedirect(request, 'fr')
 * // Returns: NextResponse redirect to '/fr/' with 307 status
 *
 * @example
 * // Request: GET /?utm_source=google
 * // detectedLanguage: 'en'
 * handleRootPathRedirect(request, 'en')
 * // Returns: NextResponse redirect to '/en/?utm_source=google' with 307 status
 *
 * @example
 * // Request: GET /fr/articles
 * // detectedLanguage: 'fr'
 * handleRootPathRedirect(request, 'fr')
 * // Returns: null (not root path, no redirect needed)
 */
export function handleRootPathRedirect(
  request: NextRequest,
  detectedLanguage: string,
): NextResponse | null {
  const { pathname } = request.nextUrl;

  // Check if this is the root path
  if (!isRootPath(pathname)) {
    return null;
  }

  // Build the redirect URL with language prefix
  const url = new URL(request.nextUrl);
  url.pathname = `/${detectedLanguage}/`;

  // Preserve query parameters (they're already part of the URL object)

  // Return 307 Temporary Redirect
  return NextResponse.redirect(url, { status: 307 });
}
