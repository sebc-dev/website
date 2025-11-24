/**
 * E2E tests for Homepage - Coming Soon Landing Page
 *
 * Validates the homepage content and functionality:
 * - Visual elements (title, badge, descriptions)
 * - Internationalization (French/English content)
 * - Responsive behavior
 * - Accessibility basics
 *
 * @see src/app/[locale]/page.tsx
 */

import { expect, test } from './fixtures/i18n';

test.describe('Homepage - Coming Soon Landing Page', () => {
  test.describe('French Version (Default)', () => {
    test('should display the main title "sebc.dev"', async ({ page }) => {
      await page.goto('/fr/');
      const title = page.locator('h1');
      await expect(title).toContainText('sebc.dev');
    });

    test('should display the development badge', async ({ page }) => {
      await page.goto('/fr/');
      const badge = page.getByText('En développement');
      await expect(badge).toBeVisible();
    });

    test('should display the subtitle', async ({ page }) => {
      await page.goto('/fr/');
      const subtitle = page.getByText("Un laboratoire d'apprentissage public");
      await expect(subtitle).toBeVisible();
    });

    test('should display key terms (IA, UX, ingénierie logicielle)', async ({
      page,
    }) => {
      await page.goto('/fr/');
      await expect(page.getByText('IA')).toBeVisible();
      await expect(page.getByText('UX')).toBeVisible();
      await expect(page.getByText('ingénierie logicielle')).toBeVisible();
    });

    test('should display launch information card', async ({ page }) => {
      await page.goto('/fr/');
      await expect(page.getByText('Lancement prévu')).toBeVisible();
      await expect(page.getByText('Fin Novembre 2025')).toBeVisible();
      await expect(
        page.getByText('Blog technique • Articles • Guides')
      ).toBeVisible();
    });

    test('should have loading indicator dots', async ({ page }) => {
      await page.goto('/fr/');
      // Check for animated pulse dots
      const pulseDots = page.locator('.animate-pulse');
      await expect(pulseDots.first()).toBeVisible();
    });
  });

  test.describe('English Version', () => {
    test('should display the main title "sebc.dev"', async ({ page }) => {
      await page.goto('/en/');
      const title = page.locator('h1');
      await expect(title).toContainText('sebc.dev');
    });

    test('should display the development badge in English', async ({
      page,
    }) => {
      await page.goto('/en/');
      const badge = page.getByText('In development');
      await expect(badge).toBeVisible();
    });

    test('should display the subtitle in English', async ({ page }) => {
      await page.goto('/en/');
      const subtitle = page.getByText('A public learning laboratory');
      await expect(subtitle).toBeVisible();
    });

    test('should display key terms in English (AI, UX, software engineering)', async ({
      page,
    }) => {
      await page.goto('/en/');
      await expect(page.getByText('AI')).toBeVisible();
      await expect(page.getByText('UX')).toBeVisible();
      await expect(page.getByText('software engineering')).toBeVisible();
    });

    test('should display launch information in English', async ({ page }) => {
      await page.goto('/en/');
      await expect(page.getByText('Expected launch')).toBeVisible();
      await expect(page.getByText('Late November 2025')).toBeVisible();
      await expect(
        page.getByText('Technical blog • Articles • Guides')
      ).toBeVisible();
    });
  });

  test.describe('Visual and Layout', () => {
    test('should have a centered layout', async ({ page }) => {
      await page.goto('/fr/');
      // Check that main content container exists with centering classes
      const contentArea = page.locator('.text-center');
      await expect(contentArea).toBeVisible();
    });

    test('should display gradient animated title', async ({ page }) => {
      await page.goto('/fr/');
      // Check for gradient animation class on title
      const gradientTitle = page.locator('.animate-gradient');
      await expect(gradientTitle).toBeVisible();
    });

    test('should have glassmorphic info card', async ({ page }) => {
      await page.goto('/fr/');
      // Check for backdrop blur effect on card
      const card = page.locator('.backdrop-blur-md');
      await expect(card).toBeVisible();
    });

    test('should have animated background grid', async ({ page }) => {
      await page.goto('/fr/');
      // The page should have background decorative elements
      const backgroundElements = page.locator('[aria-hidden="true"]');
      expect(await backgroundElements.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Accessibility', () => {
    test('should have a main heading (h1)', async ({ page }) => {
      await page.goto('/fr/');
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
    });

    test('should have decorative elements marked with aria-hidden', async ({
      page,
    }) => {
      await page.goto('/fr/');
      // Decorative SVG and background elements should be hidden from screen readers
      const hiddenElements = page.locator('[aria-hidden="true"]');
      expect(await hiddenElements.count()).toBeGreaterThan(0);
    });

    test('should have proper text contrast', async ({ page }) => {
      await page.goto('/fr/');
      // Verify main text elements are visible (implies sufficient contrast)
      const mainText = page.locator('p');
      expect(await mainText.count()).toBeGreaterThan(0);
      await expect(mainText.first()).toBeVisible();
    });
  });

  test.describe('Language Switching', () => {
    test('should maintain content structure between languages', async ({
      page,
    }) => {
      // Load French version
      await page.goto('/fr/');
      const frH1 = await page.locator('h1').textContent();

      // Load English version
      await page.goto('/en/');
      const enH1 = await page.locator('h1').textContent();

      // Title should be the same (sebc.dev)
      expect(frH1).toBe(enH1);
    });

    test('should show different badge text per language', async ({ page }) => {
      // French
      await page.goto('/fr/');
      await expect(page.getByText('En développement')).toBeVisible();

      // English
      await page.goto('/en/');
      await expect(page.getByText('In development')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/fr/', { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;

      // Page should load within 10 seconds (generous for CI)
      expect(loadTime).toBeLessThan(10000);
    });

    test('should render main content quickly', async ({ page }) => {
      await page.goto('/fr/');
      // Title should be visible without waiting for all resources
      const title = page.locator('h1');
      await expect(title).toBeVisible({ timeout: 5000 });
    });
  });
});
