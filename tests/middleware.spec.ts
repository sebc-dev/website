/**
 * E2E tests for i18n middleware - Core Scenarios
 *
 * Validates AC1-AC8 acceptance criteria for the i18n middleware:
 * - AC1: Language detection from URL (/fr/, /en/)
 * - AC2: Browser Accept-Language header detection
 * - AC3: Cookie-based language detection (NEXT_LOCALE)
 * - AC4: Unsupported language redirects (307)
 * - AC5: Root path redirection logic
 * - AC6: next-intl context initialization
 * - AC7: Public route exclusion (_next, favicon)
 * - AC8: Language validation (fr, en only)
 *
 * Test Strategy:
 * - Use Playwright's built-in request/response handling
 * - Test real navigation flows
 * - Validate URL, cookies, and content changes
 * - Use explicit waits to avoid flakiness
 *
 * @see https://playwright.dev/docs/test-intro
 */

import { expect, test } from './fixtures/i18n';

test.describe('i18n Middleware - Core Scenarios', () => {
  // AC1: Language detection from URL
  test.describe('AC1: Language detection from URL', () => {
    test('should load French page for /fr/ path', async ({ page }) => {
      await page.goto('/fr/');
      await expect(page).toHaveURL(/\/fr\//);
    });

    test('should load English page for /en/ path', async ({ page }) => {
      await page.goto('/en/');
      await expect(page).toHaveURL(/\/en\//);
    });

    test('should preserve language in nested paths', async ({ page }) => {
      await page.goto('/fr/messages-test');
      await expect(page).toHaveURL(/\/fr\/messages-test/);
    });

    test('should preserve language with English nested path', async ({
      page,
    }) => {
      await page.goto('/en/messages-test');
      await expect(page).toHaveURL(/\/en\/messages-test/);
    });
  });

  // AC2: Browser Accept-Language header detection
  test.describe('AC2: Accept-Language header detection', () => {
    test('should redirect to French for French Accept-Language header', async ({
      browser,
    }) => {
      const context = await browser.newContext({
        locale: 'fr-FR',
      });
      const page = await context.newPage();
      await page.goto('/');
      await expect(page).toHaveURL(/\/fr\//);
      await context.close();
    });

    test('should redirect to English for English Accept-Language header', async ({
      browser,
    }) => {
      const context = await browser.newContext({
        locale: 'en-US',
      });
      const page = await context.newPage();
      await page.goto('/');
      await expect(page).toHaveURL(/\/en\//);
      await context.close();
    });

    test('should default to French for unsupported language in header', async ({
      browser,
    }) => {
      const context = await browser.newContext({
        locale: 'de-DE', // German - not supported
      });
      const page = await context.newPage();
      await page.goto('/');
      await expect(page).toHaveURL(/\/fr\//);
      await context.close();
    });
  });

  // AC3: Cookie-based language detection
  test.describe('AC3: Cookie-based language detection', () => {
    test('should detect English from NEXT_LOCALE cookie', async ({
      pageWithLocale,
    }) => {
      const page = await pageWithLocale('en');
      await page.goto('/');
      await expect(page).toHaveURL(/\/en\//);
    });

    test('should detect French from NEXT_LOCALE cookie', async ({
      pageWithLocale,
    }) => {
      const page = await pageWithLocale('fr');
      await page.goto('/');
      await expect(page).toHaveURL(/\/fr\//);
    });

    test('cookie should take precedence over Accept-Language header', async ({
      browser,
    }) => {
      const context = await browser.newContext({
        locale: 'en-US', // English header
      });
      // Add French cookie
      await context.addCookies([
        {
          name: 'NEXT_LOCALE',
          value: 'fr',
          url: 'http://localhost:3000',
        },
      ]);
      const page = await context.newPage();
      await page.goto('/');
      await expect(page).toHaveURL(/\/fr\//);
      await context.close();
    });
  });

  // AC4: Unsupported language redirects
  test.describe('AC4: Unsupported language redirects', () => {
    test('should redirect from unsupported language to French', async ({
      page,
    }) => {
      const response = await page.goto('/de/articles', {
        waitUntil: 'networkidle',
      });
      // Should be a redirect (3xx status)
      expect([307, 302, 301]).toContain(response?.status());
      // Should end up on French version
      await expect(page).toHaveURL(/\/fr\/articles/);
    });

    test('should preserve path when redirecting unsupported language', async ({
      page,
    }) => {
      await page.goto('/it/messages-test', { waitUntil: 'networkidle' });
      // Should redirect to French version of same path
      await expect(page).toHaveURL(/\/fr\/messages-test/);
    });

    test('should preserve query parameters during language redirect', async ({
      page,
    }) => {
      await page.goto('/es/articles?page=2', { waitUntil: 'networkidle' });
      // Should redirect but preserve query params
      const url = page.url();
      expect(url).toMatch(/\/fr\/articles/);
      expect(url).toContain('page=2');
    });
  });

  // AC5: Root path redirection
  test.describe('AC5: Root path redirection', () => {
    test('should redirect root path to French by default', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL('/fr/');
    });

    test('should redirect root path to detected language from cookie', async ({
      pageWithLocale,
    }) => {
      const page = await pageWithLocale('en');
      await page.goto('/');
      await expect(page).toHaveURL('/en/');
    });

    test('should redirect root path based on Accept-Language header', async ({
      browser,
    }) => {
      const context = await browser.newContext({
        locale: 'en-US',
      });
      const page = await context.newPage();
      await page.goto('/');
      await expect(page).toHaveURL('/en/');
      await context.close();
    });

    test('should preserve query parameters during root path redirect', async ({
      page,
    }) => {
      await page.goto('/?utm_source=test');
      const url = page.url();
      expect(url).toMatch(/\/fr\//);
      expect(url).toContain('utm_source=test');
    });
  });

  // AC6: next-intl context initialization
  test.describe('AC6: next-intl context initialization', () => {
    test('should initialize i18n context for French', async ({ page }) => {
      await page.goto('/fr/messages-test');
      // The messages-test page displays all available translations
      // It should load without error
      await expect(page).toHaveURL(/\/fr\/messages-test/);
      // Wait for page content to load
      await page.waitForLoadState('networkidle');
      // Page should be visible and functional
      const headings = await page.locator('h1').count();
      expect(headings).toBeGreaterThan(0);
    });

    test('should initialize i18n context for English', async ({ page }) => {
      await page.goto('/en/messages-test');
      await expect(page).toHaveURL(/\/en\/messages-test/);
      // Wait for page content to load
      await page.waitForLoadState('networkidle');
      // Page should be visible and functional
      const headings = await page.locator('h1').count();
      expect(headings).toBeGreaterThan(0);
    });
  });

  // AC7: Public route exclusion
  test.describe('AC7: Public route exclusion', () => {
    test('should allow access to static assets', async ({ page }) => {
      // Request a favicon which should bypass middleware
      const response = await page.goto('/favicon.ico');
      // Should not be intercepted by i18n middleware
      // Status could be 200 (exists) or 404 (doesn't exist) but not redirected
      const status = response?.status();
      // Verify status is defined and not in 3xx redirect range
      expect(status).toBeDefined();
      if (typeof status === 'number') {
        expect(status < 300 || status >= 400).toBeTruthy();
      }
    });

    test('should allow access to Next.js static files', async ({ page }) => {
      // These routes should not trigger middleware redirection
      // We verify by checking that the page doesn't redirect to a language prefix
      const response = await page.goto('/_next/static/test.js', {
        waitUntil: 'domcontentloaded',
      });
      // Should get 404 or actual content, but not a redirect to /fr/ or /en/
      const status = response?.status();
      if (status && status >= 300 && status < 400) {
        // If there is a redirect, verify it's not language-based
        const redirectUrl = page.url();
        expect(redirectUrl).not.toMatch(/\/(fr|en)\//);
      }
    });
  });

  // AC8: Language validation
  test.describe('AC8: Language validation', () => {
    test('should only allow fr and en locales', async ({ page }) => {
      // Test with valid locale
      await page.goto('/fr/');
      await expect(page).toHaveURL(/\/fr\//);

      await page.goto('/en/');
      await expect(page).toHaveURL(/\/en\//);
    });

    test('should reject invalid locale codes', async ({ page }) => {
      // Test with invalid locales
      const invalidLocales = ['de', 'es', 'it', 'pt', 'xx'];

      for (const locale of invalidLocales) {
        await page.goto(`/${locale}/articles`, { waitUntil: 'networkidle' });
        const url = page.url();
        // Should redirect to French (default)
        expect(url).toMatch(/\/fr\/articles/);
      }
    });

    test('should reject 3-letter language codes', async ({ page }) => {
      await page.goto('/eng/articles', { waitUntil: 'networkidle' });
      // Should redirect to French
      await expect(page).toHaveURL(/\/fr\/articles/);
    });

    test('should be case-sensitive for language codes', async ({ page }) => {
      await page.goto('/FR/articles', { waitUntil: 'networkidle' });
      // Uppercase should be treated as invalid
      await expect(page).toHaveURL(/\/fr\/articles/);
    });
  });

  // Integration tests
  test.describe('Integration Tests', () => {
    test('should maintain language across page navigation', async ({
      page,
    }) => {
      await page.goto('/fr/');
      await expect(page).toHaveURL('/fr/');

      // Navigate to another page
      await page.goto('/fr/messages-test');
      await expect(page).toHaveURL(/\/fr\/messages-test/);
    });

    test('should maintain language when switching between languages explicitly', async ({
      page,
    }) => {
      await page.goto('/fr/');
      await expect(page).toHaveURL('/fr/');

      await page.goto('/en/');
      await expect(page).toHaveURL('/en/');

      // Go back to French
      await page.goto('/fr/');
      await expect(page).toHaveURL('/fr/');
    });

    test('should handle double slash root path edge case', async ({ page }) => {
      await page.goto('//');
      // Should normalize to single slash and redirect
      await expect(page).toHaveURL(/\/fr\//);
    });
  });
});
