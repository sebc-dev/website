/**
 * Unit tests for root path redirection utilities
 *
 * Tests cover:
 * - Root path detection (isRootPath)
 * - Root path redirection logic (handleRootPathRedirect)
 * - Query parameter preservation
 * - Edge cases (trailing slashes, multiple slashes, etc.)
 * - Status code validation (307)
 */

import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { handleRootPathRedirect, isRootPath } from './redirect';

/**
 * Test suite for isRootPath helper function
 */
describe('isRootPath', () => {
  it('should return true for root path /', () => {
    expect(isRootPath('/')).toBe(true);
  });

  it('should return true for root path with trailing slash //', () => {
    expect(isRootPath('//')).toBe(true);
  });

  it('should return true for root path with multiple slashes ///', () => {
    expect(isRootPath('///')).toBe(true);
  });

  it('should return false for language-prefixed path /en/', () => {
    expect(isRootPath('/en/')).toBe(false);
  });

  it('should return false for language-prefixed path /fr/', () => {
    expect(isRootPath('/fr/')).toBe(false);
  });

  it('should return false for API route /api/', () => {
    expect(isRootPath('/api/')).toBe(false);
  });

  it('should return false for article path /articles', () => {
    expect(isRootPath('/articles')).toBe(false);
  });

  it('should return false for nested path /fr/articles', () => {
    expect(isRootPath('/fr/articles')).toBe(false);
  });

  it('should return true for empty string', () => {
    expect(isRootPath('')).toBe(true); // Empty string is considered root after normalization
  });
});

/**
 * Test suite for handleRootPathRedirect function
 */
describe('handleRootPathRedirect', () => {
  /**
   * Helper to create a NextRequest mock
   */
  function createRequest(
    pathname: string,
    searchParams?: Record<string, string>,
  ): NextRequest {
    const url = new URL(`http://localhost${pathname}`);
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    return new NextRequest(url);
  }

  describe('Root path redirection', () => {
    it('should redirect root path / to /fr/ when detected language is fr', () => {
      const request = createRequest('/');
      const response = handleRootPathRedirect(request, 'fr');

      expect(response).not.toBeNull();
      expect(response?.status).toBe(307);

      const location = response?.headers.get('location');
      expect(location).toBe('http://localhost/fr/');
    });

    it('should redirect root path / to /en/ when detected language is en', () => {
      const request = createRequest('/');
      const response = handleRootPathRedirect(request, 'en');

      expect(response).not.toBeNull();
      expect(response?.status).toBe(307);

      const location = response?.headers.get('location');
      expect(location).toBe('http://localhost/en/');
    });

    it('should use 307 Temporary Redirect status code', () => {
      const request = createRequest('/');
      const response = handleRootPathRedirect(request, 'fr');

      expect(response?.status).toBe(307);
    });

    it('should redirect double slash // to language-prefixed path', () => {
      const request = createRequest('//');
      const response = handleRootPathRedirect(request, 'fr');

      expect(response).not.toBeNull();
      expect(response?.status).toBe(307);

      const location = response?.headers.get('location');
      expect(location).toBe('http://localhost/fr/');
    });
  });

  describe('Query parameter preservation', () => {
    it('should preserve single query parameter during redirect', () => {
      const request = createRequest('/', { utm_source: 'google' });
      const response = handleRootPathRedirect(request, 'fr');

      expect(response).not.toBeNull();

      const location = response?.headers.get('location');
      expect(location).toBe('http://localhost/fr/?utm_source=google');
    });

    it('should preserve multiple query parameters during redirect', () => {
      const request = createRequest('/', {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'test',
      });
      const response = handleRootPathRedirect(request, 'en');

      expect(response).not.toBeNull();

      const location = response?.headers.get('location');
      expect(location).toContain('/en/?');
      expect(location).toContain('utm_source=google');
      expect(location).toContain('utm_medium=cpc');
      expect(location).toContain('utm_campaign=test');
    });

    it('should preserve query parameters with special characters', () => {
      const request = createRequest('/', {
        search: 'hello world',
        category: 'tech&science',
      });
      const response = handleRootPathRedirect(request, 'fr');

      expect(response).not.toBeNull();

      const location = response?.headers.get('location');
      expect(location).toContain('/fr/?');
      // Query params are URL-encoded
      expect(location).toContain('search=hello+world');
    });
  });

  describe('Non-root paths (should NOT redirect)', () => {
    it('should return null for /en/ path', () => {
      const request = createRequest('/en/');
      const response = handleRootPathRedirect(request, 'fr');

      expect(response).toBeNull();
    });

    it('should return null for /fr/ path', () => {
      const request = createRequest('/fr/');
      const response = handleRootPathRedirect(request, 'en');

      expect(response).toBeNull();
    });

    it('should return null for /api/ path', () => {
      const request = createRequest('/api/');
      const response = handleRootPathRedirect(request, 'fr');

      expect(response).toBeNull();
    });

    it('should return null for /articles path', () => {
      const request = createRequest('/articles');
      const response = handleRootPathRedirect(request, 'fr');

      expect(response).toBeNull();
    });

    it('should return null for /fr/articles path', () => {
      const request = createRequest('/fr/articles');
      const response = handleRootPathRedirect(request, 'fr');

      expect(response).toBeNull();
    });

    it('should return null for /en/search path', () => {
      const request = createRequest('/en/search');
      const response = handleRootPathRedirect(request, 'en');

      expect(response).toBeNull();
    });

    it('should return null for nested path /fr/articles/123', () => {
      const request = createRequest('/fr/articles/123');
      const response = handleRootPathRedirect(request, 'fr');

      expect(response).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle root path with trailing slash correctly', () => {
      const request = createRequest('/');
      const response = handleRootPathRedirect(request, 'fr');

      expect(response).not.toBeNull();
      expect(response?.status).toBe(307);
    });

    it('should work with any detected language string', () => {
      const request = createRequest('/');

      // Test with 'fr'
      const responseFr = handleRootPathRedirect(request, 'fr');
      expect(responseFr?.headers.get('location')).toContain('/fr/');

      // Test with 'en'
      const responseEn = handleRootPathRedirect(request, 'en');
      expect(responseEn?.headers.get('location')).toContain('/en/');

      // Test with hypothetical other language (should still work as string)
      const responseDe = handleRootPathRedirect(request, 'de');
      expect(responseDe?.headers.get('location')).toContain('/de/');
    });

    it('should preserve HTTPS protocol if request uses HTTPS', () => {
      const url = new URL('https://example.com/');
      const request = new NextRequest(url);
      const response = handleRootPathRedirect(request, 'fr');

      expect(response).not.toBeNull();

      const location = response?.headers.get('location');
      expect(location).toBe('https://example.com/fr/');
    });

    it('should preserve custom port if present', () => {
      const url = new URL('http://localhost:3000/');
      const request = new NextRequest(url);
      const response = handleRootPathRedirect(request, 'en');

      expect(response).not.toBeNull();

      const location = response?.headers.get('location');
      expect(location).toBe('http://localhost:3000/en/');
    });
  });
});
