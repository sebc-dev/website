/**
 * Cookie utility functions for i18n language persistence
 *
 * Provides type-safe functions for managing the NEXT_LOCALE cookie with secure flags.
 * Supports HTTP cookie operations with security best practices (HttpOnly, SameSite, Secure).
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 * @see https://owasp.org/www-community/attacks/Cookie_Security
 */

import type { NextRequest } from 'next/server';

/**
 * Configuration options for cookie creation
 *
 * Allows customization of cookie behavior while enforcing security defaults.
 */
export interface CookieOptions {
  /**
   * Cookie expiration time in seconds
   *
   * Defaults to 31536000 (1 year)
   */
  maxAge?: number;

  /**
   * SameSite attribute for CSRF protection
   *
   * - 'strict': Cookie only sent in same-site requests (most secure)
   * - 'lax': Cookie sent in top-level navigation from other sites (default)
   * - 'none': Cookie sent in all requests (requires Secure flag)
   *
   * Defaults to 'lax'
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
   */
  sameSite?: 'strict' | 'lax' | 'none';

  /**
   * Secure flag for HTTPS-only transmission
   *
   * When set to true, cookie is only sent over HTTPS connections.
   * In development (NODE_ENV !== 'production'), this is conditionally set to false
   * to allow testing over HTTP.
   *
   * Defaults to true in production, false in development
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#secure
   */
  secure?: boolean;

  /**
   * HttpOnly flag to prevent JavaScript access
   *
   * When set to true, cookie cannot be accessed from JavaScript (document.cookie),
   * only sent with HTTP requests. This protects against XSS attacks.
   *
   * Defaults to true
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#httponly
   */
  httpOnly?: boolean;

  /**
   * Cookie path scope
   *
   * Restricts the cookie to a specific URL path within the domain.
   *
   * Defaults to '/'
   */
  path?: string;
}

/**
 * Allowed locale values for cookie validation
 *
 * Only these values are accepted in the NEXT_LOCALE cookie.
 *
 * @internal
 */
const ALLOWED_LOCALES = ['fr', 'en'] as const;

/**
 * Reads a cookie value from the request
 *
 * Extracts a cookie by name from the incoming HTTP request.
 *
 * @param request - The incoming HTTP request
 * @param name - The cookie name to read (e.g., 'NEXT_LOCALE')
 * @returns The cookie value if found, undefined otherwise
 *
 * @example
 * // In middleware:
 * const localeFromCookie = getCookie(request, 'NEXT_LOCALE');
 * console.log(localeFromCookie); // 'fr' or 'en' or undefined
 */
export function getCookie(
  request: NextRequest,
  name: string,
): string | undefined {
  const cookieValue = request.cookies.get(name)?.value;
  return cookieValue;
}

/**
 * Creates a Set-Cookie header value with secure flags
 *
 * Generates an HTTP Set-Cookie header string with all security flags applied.
 * The secure flag is conditionally set based on the environment.
 *
 * @param name - The cookie name (e.g., 'NEXT_LOCALE')
 * @param value - The cookie value (e.g., 'fr' or 'en')
 * @param options - Optional cookie configuration
 * @returns The Set-Cookie header value
 *
 * @example
 * ```ts
 * // Create a language preference cookie
 * const cookieHeader = setCookie('NEXT_LOCALE', 'en', {
 *   maxAge: 31536000,
 *   sameSite: 'lax',
 * });
 * // Returns: 'NEXT_LOCALE=en; Max-Age=31536000; SameSite=Lax; HttpOnly; Path=/; Secure' (in prod)
 * ```
 *
 * @remarks
 * The cookie includes these default security flags:
 * - **HttpOnly**: Prevents JavaScript access, mitigates XSS attacks
 * - **SameSite=Lax**: Prevents CSRF attacks while allowing cross-site navigation
 * - **Secure**: Only sent over HTTPS (in production)
 * - **Max-Age**: Sets expiration time (default: 1 year)
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
): string {
  const {
    maxAge = 31536000, // 1 year in seconds
    sameSite = 'lax',
    secure = process.env.NODE_ENV === 'production',
    httpOnly = true,
    path = '/',
  } = options;

  // Start with name=value
  const parts: string[] = [`${name}=${value}`];

  // Add Max-Age (controls expiration)
  parts.push(`Max-Age=${maxAge}`);

  // Add SameSite (CSRF protection)
  parts.push(`SameSite=${sameSite.charAt(0).toUpperCase()}${sameSite.slice(1)}`);

  // Add HttpOnly (XSS protection)
  if (httpOnly) {
    parts.push('HttpOnly');
  }

  // Add Path (scope restriction)
  parts.push(`Path=${path}`);

  // Add Secure (HTTPS-only transmission) - conditionally in production
  if (secure) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

/**
 * Creates a Set-Cookie header to delete a cookie
 *
 * Generates an HTTP Set-Cookie header that removes a cookie by setting
 * its expiration to the past (Max-Age=0).
 *
 * @param name - The cookie name to delete
 * @returns The Set-Cookie header value for deletion
 *
 * @example
 * // Delete the language preference cookie
 * const deleteCookieHeader = deleteCookie('NEXT_LOCALE');
 * // Returns: 'NEXT_LOCALE=; Max-Age=0; SameSite=Lax; HttpOnly; Path=/; Secure'
 *
 * @remarks
 * This function uses Set-Cookie with Max-Age=0, which is the standard way to delete cookies.
 * The cookie will be immediately removed from the client's browser.
 */
export function deleteCookie(name: string): string {
  return setCookie(name, '', { maxAge: 0 });
}

/**
 * Validates if a value is an allowed locale
 *
 * Checks if the provided value is one of the supported language codes.
 *
 * @param value - The value to validate
 * @returns true if the value is an allowed locale, false otherwise
 *
 * @example
 * validateLocale('fr');  // true
 * validateLocale('en');  // true
 * validateLocale('de');  // false
 * validateLocale('FR');  // false (case-sensitive)
 * validateLocale('');    // false
 * validateLocale(null);  // false
 *
 * @remarks
 * Currently supported locales: 'fr', 'en'
 * Validation is case-sensitive - only lowercase codes are accepted.
 */
export function validateLocale(value: unknown): value is 'fr' | 'en' {
  return typeof value === 'string' && ALLOWED_LOCALES.includes(value as 'fr' | 'en');
}
