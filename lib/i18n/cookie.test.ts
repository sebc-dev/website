/**
 * Unit tests for cookie utility functions
 *
 * Tests cover:
 * - Cookie creation with all secure flags
 * - Cookie reading from requests
 * - Cookie deletion
 * - Locale validation
 * - Environment-based flag behavior
 *
 * @see ./cookie.ts
 */

import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

import {
  type CookieOptions,
  deleteCookie,
  getCookie,
  setCookie,
  validateLocale,
} from './cookie';

describe('Cookie Utilities', () => {
  // Helper to create a NextRequest with cookies
  function createRequestWithCookie(name: string, value: string): NextRequest {
    const url = new URL('http://localhost:3000/');
    const request = new NextRequest(url);
    // Set cookie directly on the request object
    Object.defineProperty(request.cookies, 'get', {
      value: (cookieName: string) => {
        if (cookieName === name) {
          return { value };
        }
        return undefined;
      },
    });
    return request;
  }

  describe('getCookie', () => {
    it('should return cookie value when cookie exists', () => {
      const request = createRequestWithCookie('NEXT_LOCALE', 'fr');
      const result = getCookie(request, 'NEXT_LOCALE');
      expect(result).toBe('fr');
    });

    it('should return undefined when cookie does not exist', () => {
      const url = new URL('http://localhost:3000/');
      const request = new NextRequest(url);
      const result = getCookie(request, 'NEXT_LOCALE');
      expect(result).toBeUndefined();
    });

    it('should return cookie value for different cookie names', () => {
      const request = createRequestWithCookie('customCookie', 'value123');
      const result = getCookie(request, 'customCookie');
      expect(result).toBe('value123');
    });

    it('should handle empty cookie values', () => {
      const request = createRequestWithCookie('NEXT_LOCALE', '');
      const result = getCookie(request, 'NEXT_LOCALE');
      expect(result).toBe('');
    });
  });

  describe('setCookie', () => {
    it('should create a Set-Cookie header with default options', () => {
      const result = setCookie('NEXT_LOCALE', 'fr');
      expect(result).toContain('NEXT_LOCALE=fr');
      expect(result).toContain('Max-Age=31536000');
      expect(result).toContain('SameSite=Lax');
      expect(result).toContain('HttpOnly');
      expect(result).toContain('Path=/');
    });

    it('should include Secure flag in production', () => {
      vi.stubEnv('NODE_ENV', 'production');

      const result = setCookie('NEXT_LOCALE', 'en');
      expect(result).toContain('Secure');

      vi.unstubAllEnvs();
    });

    it('should not include Secure flag in development', () => {
      vi.stubEnv('NODE_ENV', 'development');

      const result = setCookie('NEXT_LOCALE', 'fr');
      expect(result).not.toContain('Secure');

      vi.unstubAllEnvs();
    });

    it('should respect custom maxAge option', () => {
      const result = setCookie('NEXT_LOCALE', 'fr', { maxAge: 7200 });
      expect(result).toContain('Max-Age=7200');
      expect(result).not.toContain('Max-Age=31536000');
    });

    it('should respect custom sameSite option', () => {
      const resultStrict = setCookie('NEXT_LOCALE', 'fr', {
        sameSite: 'strict',
      });
      expect(resultStrict).toContain('SameSite=Strict');

      const resultNone = setCookie('NEXT_LOCALE', 'en', { sameSite: 'none' });
      expect(resultNone).toContain('SameSite=None');
    });

    it('should respect custom secure option', () => {
      const result = setCookie('NEXT_LOCALE', 'fr', { secure: false });
      expect(result).not.toContain('Secure');

      const resultSecure = setCookie('NEXT_LOCALE', 'en', { secure: true });
      expect(resultSecure).toContain('Secure');
    });

    it('should respect custom httpOnly option', () => {
      const result = setCookie('NEXT_LOCALE', 'fr', { httpOnly: false });
      expect(result).not.toContain('HttpOnly');

      const resultHttpOnly = setCookie('NEXT_LOCALE', 'en', { httpOnly: true });
      expect(resultHttpOnly).toContain('HttpOnly');
    });

    it('should respect custom path option', () => {
      const result = setCookie('NEXT_LOCALE', 'fr', { path: '/app' });
      expect(result).toContain('Path=/app');
      // Verify it's not using the default path
      expect(result).not.toMatch(/Path=\/(?!app)/);
    });

    it('should combine multiple custom options correctly', () => {
      const options: CookieOptions = {
        maxAge: 86400,
        sameSite: 'strict',
        secure: true,
        httpOnly: true,
        path: '/articles',
      };

      const result = setCookie('NEXT_LOCALE', 'en', options);

      expect(result).toContain('NEXT_LOCALE=en');
      expect(result).toContain('Max-Age=86400');
      expect(result).toContain('SameSite=Strict');
      expect(result).toContain('HttpOnly');
      expect(result).toContain('Path=/articles');
      expect(result).toContain('Secure');
    });

    it('should handle special characters in cookie values', () => {
      const result = setCookie('NEXT_LOCALE', 'en-US');
      expect(result).toContain('NEXT_LOCALE=en-US');
    });

    it('should create valid Set-Cookie header format', () => {
      const result = setCookie('NEXT_LOCALE', 'fr');
      // All parts should be separated by '; '
      const parts = result.split('; ');
      expect(parts.length).toBeGreaterThan(1);
      expect(parts[0]).toBe('NEXT_LOCALE=fr');
    });
  });

  describe('deleteCookie', () => {
    it('should create a Set-Cookie header with Max-Age=0', () => {
      const result = deleteCookie('NEXT_LOCALE');
      expect(result).toContain('NEXT_LOCALE=');
      expect(result).toContain('Max-Age=0');
    });

    it('should include all secure flags in deletion cookie', () => {
      const result = deleteCookie('NEXT_LOCALE');
      expect(result).toContain('SameSite=Lax');
      expect(result).toContain('HttpOnly');
      expect(result).toContain('Path=/');
    });

    it('should include Secure flag in production', () => {
      vi.stubEnv('NODE_ENV', 'production');

      const result = deleteCookie('NEXT_LOCALE');
      expect(result).toContain('Secure');

      vi.unstubAllEnvs();
    });

    it('should work for any cookie name', () => {
      const result = deleteCookie('customCookie');
      expect(result).toContain('customCookie=');
      expect(result).toContain('Max-Age=0');
    });
  });

  describe('validateLocale', () => {
    it('should accept valid locale "fr"', () => {
      const result = validateLocale('fr');
      expect(result).toBe(true);
    });

    it('should accept valid locale "en"', () => {
      const result = validateLocale('en');
      expect(result).toBe(true);
    });

    it('should reject invalid locale "de"', () => {
      const result = validateLocale('de');
      expect(result).toBe(false);
    });

    it('should reject invalid locale "it"', () => {
      const result = validateLocale('it');
      expect(result).toBe(false);
    });

    it('should reject uppercase locales', () => {
      expect(validateLocale('FR')).toBe(false);
      expect(validateLocale('EN')).toBe(false);
      expect(validateLocale('Fr')).toBe(false);
    });

    it('should reject empty string', () => {
      const result = validateLocale('');
      expect(result).toBe(false);
    });

    it('should reject null', () => {
      const result = validateLocale(null);
      expect(result).toBe(false);
    });

    it('should reject undefined', () => {
      const result = validateLocale(undefined);
      expect(result).toBe(false);
    });

    it('should reject numbers', () => {
      const result = validateLocale(123);
      expect(result).toBe(false);
    });

    it('should reject objects', () => {
      const result = validateLocale({});
      expect(result).toBe(false);
    });

    it('should reject arrays', () => {
      const result = validateLocale(['fr']);
      expect(result).toBe(false);
    });

    it('should reject boolean values', () => {
      expect(validateLocale(true)).toBe(false);
      expect(validateLocale(false)).toBe(false);
    });

    it('should reject whitespace strings', () => {
      expect(validateLocale(' fr ')).toBe(false);
      expect(validateLocale(' en ')).toBe(false);
    });

    it('should reject partial matches', () => {
      expect(validateLocale('f')).toBe(false);
      expect(validateLocale('fra')).toBe(false);
      expect(validateLocale('french')).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle full cookie lifecycle: create, read, delete', () => {
      // Create
      const cookieHeader = setCookie('NEXT_LOCALE', 'en');
      expect(cookieHeader).toContain('NEXT_LOCALE=en');

      // Read (simulated with a request)
      const request = createRequestWithCookie('NEXT_LOCALE', 'en');
      const value = getCookie(request, 'NEXT_LOCALE');
      expect(value).toBe('en');

      // Delete
      const deleteHeader = deleteCookie('NEXT_LOCALE');
      expect(deleteHeader).toContain('Max-Age=0');
    });

    it('should validate locale from cookie before using', () => {
      const request = createRequestWithCookie('NEXT_LOCALE', 'fr');
      const value = getCookie(request, 'NEXT_LOCALE');

      if (value) {
        const isValid = validateLocale(value);
        expect(isValid).toBe(true);
      }
    });

    it('should handle invalid locale from cookie gracefully', () => {
      const request = createRequestWithCookie('NEXT_LOCALE', 'de');
      const value = getCookie(request, 'NEXT_LOCALE');

      if (value) {
        const isValid = validateLocale(value);
        expect(isValid).toBe(false);
      }
    });

    it('should create new cookie with different value when locale changes', () => {
      const cookie1 = setCookie('NEXT_LOCALE', 'fr');
      expect(cookie1).toContain('NEXT_LOCALE=fr');

      const cookie2 = setCookie('NEXT_LOCALE', 'en');
      expect(cookie2).toContain('NEXT_LOCALE=en');

      expect(cookie1).not.toBe(cookie2);
    });
  });

  describe('Edge cases', () => {
    it('should handle very long cookie values', () => {
      const longValue = 'a'.repeat(1000);
      const result = setCookie('NEXT_LOCALE', longValue);
      expect(result).toContain(`NEXT_LOCALE=${longValue}`);
    });

    it('should handle cookie name with special characters', () => {
      const result = setCookie('NEXT_LOCALE-v2', 'fr');
      expect(result).toContain('NEXT_LOCALE-v2=fr');
    });

    it('should handle multiple consecutive calls', () => {
      const results = ['fr', 'en', 'fr', 'en'].map((locale) =>
        setCookie('NEXT_LOCALE', locale),
      );

      expect(results[0]).toContain('fr');
      expect(results[1]).toContain('en');
      expect(results[2]).toContain('fr');
      expect(results[3]).toContain('en');
    });

    it('should ensure Cookie header parts are properly formatted', () => {
      const result = setCookie('NEXT_LOCALE', 'fr');
      const parts = result.split('; ');

      // Each part should not have leading/trailing spaces
      parts.forEach((part) => {
        expect(part).toBe(part.trim());
      });
    });
  });
});
