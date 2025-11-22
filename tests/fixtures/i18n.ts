/**
 * Playwright fixtures for i18n testing
 *
 * Provides reusable fixtures for setting up language and cookie test scenarios.
 * These fixtures help maintain clean test isolation and reduce boilerplate code.
 *
 * @see https://playwright.dev/docs/test-fixtures
 */

/* eslint-disable react-hooks/rules-of-hooks */
import { type Page, test as base } from '@playwright/test';

/**
 * Fixture for setting the NEXT_LOCALE cookie before test execution
 *
 * Provides a page with the specified language cookie pre-configured.
 * Useful for testing cookie-based language detection.
 *
 * @example
 * ```typescript
 * test('should detect language from cookie', async ({ pageWithLocale }) => {
 *   const page = await pageWithLocale('en');
 *   await page.goto('/');
 *   await expect(page).toHaveURL('/en/');
 * });
 * ```
 */
export type I18nFixtures = {
  pageWithLocale: (locale: string) => Promise<Page>;
};

export const test = base.extend<I18nFixtures>({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pageWithLocale: async ({ browser }, use: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await use(async (locale: string) => {
      const context = await browser.newContext();
      // Set the NEXT_LOCALE cookie
      await context.addCookies([
        {
          name: 'NEXT_LOCALE',
          value: locale,
          url: 'http://localhost:3000',
        },
      ]);
      const page = await context.newPage();
      return page;
    });
  },
});

export { expect } from '@playwright/test';
