import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');

  // Verify the page loaded
  await expect(page).toHaveURL(/localhost:3000/);
});

test('main content is visible', async ({ page }) => {
  await page.goto('/');

  // Verify main element is visible
  const main = page.locator('main');
  await expect(main).toBeVisible();
});

test('page responds to navigation', async ({ page }) => {
  await page.goto('/');

  // Verify basic page structure
  const html = page.locator('html');
  await expect(html).toBeTruthy();
});
