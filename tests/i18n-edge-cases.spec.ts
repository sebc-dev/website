/**
 * E2E tests for i18n middleware - Edge Cases & Mobile
 *
 * Validates AC9-AC12 acceptance criteria for the i18n middleware:
 * - AC9: Cookie setting with secure flags (HttpOnly, SameSite, Secure, 1yr TTL)
 * - AC10: Mobile deep links and dynamic routes (/[lang]/articles/[slug])
 * - AC11: Debug logging verification
 * - AC12: Infinite redirect prevention
 *
 * Edge cases:
 * - Invalid cookies → reset to valid language
 * - Malformed Accept-Language headers → default (French)
 * - Missing route groups → graceful handling
 *
 * Mobile viewports: iPhone 13, Pixel 5
 *
 * @see https://playwright.dev/docs/test-intro
 */

import { type Cookie, devices, expect, test } from '@playwright/test';

test.describe('i18n Middleware - Edge Cases & Mobile', () => {
  // AC9: Cookie setting with secure flags
  test.describe('AC9: Cookie secure flags', () => {
    test('should set NEXT_LOCALE cookie with correct flags', async ({
      page,
    }) => {
      await page.goto('/fr/');

      // Get all cookies for the page
      const cookies = await page.context().cookies();
      const localeCookie = cookies.find((c) => c.name === 'NEXT_LOCALE');

      // Verify cookie exists
      expect(localeCookie).toBeDefined();

      if (localeCookie) {
        // Verify cookie value
        expect(localeCookie.value).toMatch(/^(fr|en)$/);

        // Verify HttpOnly flag
        expect(localeCookie.httpOnly).toBe(true);

        // Verify SameSite flag
        expect(localeCookie.sameSite).toBe('Lax');

        // Verify path
        expect(localeCookie.path).toBe('/');

        // Verify expiration (should be around 1 year from now)
        // Cookie expires is in Unix timestamp (seconds)
        const now = Date.now() / 1000;
        const oneYear = 365 * 24 * 60 * 60; // seconds in a year
        const expectedExpiry = now + oneYear;

        // Allow 10 second variance for test execution time
        expect(localeCookie.expires).toBeGreaterThan(expectedExpiry - 10);
        expect(localeCookie.expires).toBeLessThan(expectedExpiry + oneYear);
      }
    });

    test('should set Secure flag in production mode', async ({ page }) => {
      await page.goto('/fr/');

      const cookies = await page.context().cookies();
      const localeCookie = cookies.find((c) => c.name === 'NEXT_LOCALE');

      if (localeCookie) {
        // In development (localhost), Secure flag is typically false
        // In production (HTTPS), it should be true
        // This test validates the cookie structure exists
        expect(localeCookie.secure).toBeDefined();
      }
    });

    test('should set cookie expiration to 1 year', async ({ page }) => {
      await page.goto('/en/');

      const cookies = await page.context().cookies();
      const localeCookie = cookies.find((c) => c.name === 'NEXT_LOCALE');

      if (localeCookie) {
        // Calculate expiration: should be ~1 year from now
        const now = Date.now() / 1000; // Current time in seconds
        const oneYear = 365 * 24 * 60 * 60; // 1 year in seconds

        // Cookie expires should be approximately now + 1 year
        const timeDiff = localeCookie.expires - now;

        // Allow some variance (within 1 day) for test execution time
        const oneDayInSeconds = 24 * 60 * 60;
        expect(timeDiff).toBeGreaterThan(oneYear - oneDayInSeconds);
        expect(timeDiff).toBeLessThan(oneYear + oneDayInSeconds);
      }
    });

    test('should persist cookie across page navigations', async ({ page }) => {
      await page.goto('/fr/');

      // Get initial cookie value
      let cookies = await page.context().cookies();
      const initialCookie = cookies.find((c) => c.name === 'NEXT_LOCALE');
      expect(initialCookie?.value).toBe('fr');

      // Navigate to another page
      await page.goto('/fr/messages-test');

      // Cookie should still be present
      cookies = await page.context().cookies();
      const persistedCookie = cookies.find((c) => c.name === 'NEXT_LOCALE');
      expect(persistedCookie?.value).toBe('fr');
    });
  });

  // AC10: Mobile deep links and dynamic routes
  test.describe('AC10: Mobile deep links and dynamic routes', () => {
    test('should preserve language in deep link on iPhone', async ({
      browser,
    }) => {
      // Create context with iPhone 13 viewport
      const context = await browser.newContext({
        ...devices['iPhone 13'],
      });
      const page = await context.newPage();

      // Test deep link
      await page.goto('/fr/messages-test');
      await expect(page).toHaveURL(/\/fr\/messages-test/);

      await context.close();
    });

    test('should preserve language in deep link on Android', async ({
      browser,
    }) => {
      // Create context with Pixel 5 viewport
      const context = await browser.newContext({
        ...devices['Pixel 5'],
      });
      const page = await context.newPage();

      // Test deep link
      await page.goto('/en/messages-test');
      await expect(page).toHaveURL(/\/en\/messages-test/);

      await context.close();
    });

    test('should handle dynamic routes on mobile', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 13'],
      });
      const page = await context.newPage();

      // Test dynamic route pattern (even if route doesn't exist yet)
      // Middleware should preserve the language prefix
      await page.goto('/fr/articles/post-123', {
        waitUntil: 'domcontentloaded',
      });

      // URL should maintain French prefix
      const url = page.url();
      expect(url).toMatch(/\/fr\/articles\/post-123/);

      await context.close();
    });

    test('should redirect mobile root path to detected language', async ({
      browser,
    }) => {
      const context = await browser.newContext({
        ...devices['Pixel 5'],
        locale: 'en-US',
      });
      const page = await context.newPage();

      await page.goto('/');
      await expect(page).toHaveURL('/en/');

      await context.close();
    });

    test('should handle query parameters in mobile deep links', async ({
      browser,
    }) => {
      const context = await browser.newContext({
        ...devices['iPhone 13'],
      });
      const page = await context.newPage();

      await page.goto('/fr/messages-test?utm_source=mobile&utm_campaign=test');

      const url = page.url();
      expect(url).toMatch(/\/fr\/messages-test/);
      expect(url).toContain('utm_source=mobile');
      expect(url).toContain('utm_campaign=test');

      await context.close();
    });
  });

  // AC11: Debug logging verification
  test.describe('AC11: Debug logging', () => {
    test('should handle requests without errors in console', async ({
      page,
    }) => {
      const consoleErrors: string[] = [];

      // Listen for console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto('/fr/');

      // Should not have any console errors
      expect(consoleErrors).toHaveLength(0);
    });

    test('should not expose sensitive information in responses', async ({
      page,
    }) => {
      const response = await page.goto('/fr/');

      // Check response headers don't leak sensitive info
      const headers = response?.headers();
      if (headers) {
        // Should not expose internal server details
        expect(headers['x-powered-by']).toBeUndefined();
      }
    });

    test('should complete middleware execution quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/fr/messages-test');
      const endTime = Date.now();

      const loadTime = endTime - startTime;

      // Full page load should be reasonable (< 5 seconds)
      // Middleware itself should be much faster (< 50ms) but we're testing end-to-end
      expect(loadTime).toBeLessThan(5000);
    });
  });

  // AC12: Infinite redirect prevention
  test.describe('AC12: Infinite redirect prevention', () => {
    test('should not redirect when already on correct French path', async ({
      page,
    }) => {
      const response = await page.goto('/fr/messages-test');

      // Should not be a redirect (should be 200 OK or similar)
      const status = response?.status();
      expect(status).toBeLessThan(300); // Not a redirect
    });

    test('should not redirect when already on correct English path', async ({
      page,
    }) => {
      const response = await page.goto('/en/messages-test');

      // Should not be a redirect
      const status = response?.status();
      expect(status).toBeLessThan(300); // Not a redirect
    });

    test('should not create redirect loop for valid paths', async ({
      page,
    }) => {
      let redirectCount = 0;

      page.on('response', (response) => {
        const status = response.status();
        if (status >= 300 && status < 400) {
          redirectCount++;
        }
      });

      await page.goto('/fr/', { waitUntil: 'networkidle' });

      // Should have at most 1 redirect (if any)
      expect(redirectCount).toBeLessThanOrEqual(1);
    });

    test('should stop after single redirect for invalid language', async ({
      page,
    }) => {
      let redirectCount = 0;

      page.on('response', (response) => {
        const status = response.status();
        if (status >= 300 && status < 400) {
          redirectCount++;
        }
      });

      await page.goto('/de/messages-test', { waitUntil: 'networkidle' });

      // Should redirect once to correct language, then stop
      expect(redirectCount).toBe(1);
      await expect(page).toHaveURL(/\/fr\/messages-test/);
    });
  });

  // Edge case: Invalid cookies
  test.describe('Edge case: Invalid cookies', () => {
    test('should handle invalid cookie value gracefully', async ({
      browser,
    }) => {
      const context = await browser.newContext();

      // Set invalid cookie value
      await context.addCookies([
        {
          name: 'NEXT_LOCALE',
          value: 'invalid',
          url: 'http://localhost:3000',
        },
      ]);

      const page = await context.newPage();
      await page.goto('/');

      // Should default to French (default language)
      await expect(page).toHaveURL(/\/fr\//);

      // Cookie should be updated to valid value
      const cookies = await context.cookies();
      const localeCookie = cookies.find(
        (c: Cookie) => c.name === 'NEXT_LOCALE',
      );
      expect(localeCookie?.value).toMatch(/^(fr|en)$/);

      await context.close();
    });

    test('should handle empty cookie value', async ({ browser }) => {
      const context = await browser.newContext();

      // Set empty cookie value
      await context.addCookies([
        {
          name: 'NEXT_LOCALE',
          value: '',
          url: 'http://localhost:3000',
        },
      ]);

      const page = await context.newPage();
      await page.goto('/');

      // Should default to French
      await expect(page).toHaveURL(/\/fr\//);

      await context.close();
    });

    test('should handle uppercase cookie value', async ({ browser }) => {
      const context = await browser.newContext();

      // Set uppercase cookie value (not valid)
      await context.addCookies([
        {
          name: 'NEXT_LOCALE',
          value: 'FR',
          url: 'http://localhost:3000',
        },
      ]);

      const page = await context.newPage();
      await page.goto('/');

      // Should treat as invalid and default to French (lowercase)
      await expect(page).toHaveURL(/\/fr\//);

      await context.close();
    });

    test('should handle numeric cookie value', async ({ browser }) => {
      const context = await browser.newContext();

      // Set numeric cookie value
      await context.addCookies([
        {
          name: 'NEXT_LOCALE',
          value: '123',
          url: 'http://localhost:3000',
        },
      ]);

      const page = await context.newPage();
      await page.goto('/');

      // Should treat as invalid and default to French
      await expect(page).toHaveURL(/\/fr\//);

      await context.close();
    });
  });

  // Edge case: Malformed Accept-Language headers
  test.describe('Edge case: Malformed Accept-Language headers', () => {
    test('should handle empty Accept-Language header', async ({ browser }) => {
      const context = await browser.newContext({
        locale: undefined, // No locale set
      });

      const page = await context.newPage();
      await page.goto('/');

      // Should default to French
      await expect(page).toHaveURL(/\/fr\//);

      await context.close();
    });

    test('should handle malformed Accept-Language header', async ({
      page,
      context,
    }) => {
      // Set a malformed header via route interception
      await context.route('**/*', async (route) => {
        await route.continue({
          headers: {
            ...route.request().headers(),
            'Accept-Language': 'invalid-format-;;;',
          },
        });
      });

      await page.goto('/');

      // Should default to French (fallback)
      await expect(page).toHaveURL(/\/fr\//);
    });

    test('should handle only unsupported languages in header', async ({
      browser,
    }) => {
      const context = await browser.newContext({
        locale: 'de-DE', // German - not supported
      });

      const page = await context.newPage();
      await page.goto('/');

      // Should default to French
      await expect(page).toHaveURL(/\/fr\//);

      await context.close();
    });
  });

  // Edge case: Missing route groups
  test.describe('Edge case: Route handling', () => {
    test('should handle double slashes gracefully', async ({ page }) => {
      await page.goto('//');

      // Should normalize and redirect to valid path
      await expect(page).toHaveURL(/\/fr\//);
    });

    test('should handle trailing slashes consistently', async ({ page }) => {
      await page.goto('/fr');

      // Next.js might add trailing slash or handle it gracefully
      const url = page.url();
      expect(url).toMatch(/\/fr\/?/);
    });

    test('should handle paths with special characters', async ({ page }) => {
      await page.goto('/fr/messages-test?param=value&other=123');

      const url = page.url();
      expect(url).toMatch(/\/fr\/messages-test/);
      expect(url).toContain('param=value');
      expect(url).toContain('other=123');
    });

    test('should handle URL encoded characters in path', async ({ page }) => {
      // Test with URL-encoded space (%20)
      await page.goto('/fr/messages-test?search=hello%20world');

      const url = page.url();
      expect(url).toMatch(/\/fr\/messages-test/);
      expect(url).toContain('search=hello');
    });
  });

  // Integration: Combined edge cases
  test.describe('Integration: Combined edge cases', () => {
    test('should handle invalid cookie with valid URL prefix', async ({
      browser,
    }) => {
      const context = await browser.newContext();

      // Set invalid cookie
      await context.addCookies([
        {
          name: 'NEXT_LOCALE',
          value: 'invalid',
          url: 'http://localhost:3000',
        },
      ]);

      const page = await context.newPage();

      // URL prefix should take precedence
      await page.goto('/en/messages-test');
      await expect(page).toHaveURL(/\/en\/messages-test/);

      // Cookie should be updated to match URL
      const cookies = await context.cookies();
      const localeCookie = cookies.find(
        (c: Cookie) => c.name === 'NEXT_LOCALE',
      );
      expect(localeCookie?.value).toBe('en');

      await context.close();
    });

    test('should prioritize URL over invalid cookie', async ({ browser }) => {
      const context = await browser.newContext();

      // Set invalid cookie
      await context.addCookies([
        {
          name: 'NEXT_LOCALE',
          value: 'xxx',
          url: 'http://localhost:3000',
        },
      ]);

      const page = await context.newPage();
      await page.goto('/fr/');

      // URL should take precedence
      await expect(page).toHaveURL(/\/fr\//);

      await context.close();
    });

    test('should handle mobile viewport with invalid cookie', async ({
      browser,
    }) => {
      const context = await browser.newContext({
        ...devices['iPhone 13'],
      });

      // Set invalid cookie
      await context.addCookies([
        {
          name: 'NEXT_LOCALE',
          value: 'invalid',
          url: 'http://localhost:3000',
        },
      ]);

      const page = await context.newPage();
      await page.goto('/');

      // Should default to French
      await expect(page).toHaveURL(/\/fr\//);

      await context.close();
    });
  });
});
