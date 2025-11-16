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

/**
 * Middleware function entry point
 *
 * This function is called for every incoming request to the application.
 * It handles language detection and routing based on the configured
 * detection hierarchy.
 *
 * @param request - The incoming HTTP request
 * @returns The response (NextResponse.next() or redirect response)
 *
 * @remarks
 * The actual detection and redirect logic will be implemented in subsequent commits:
 * - Commit 2: URL-based detection
 * - Commit 3: Cookie and header-based detection
 * - Commit 4: Redirect logic and middleware composition
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(request: NextRequest): NextResponse | undefined {
  // Placeholder for middleware implementation
  // Detection logic will be added in Commits 2-4
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
