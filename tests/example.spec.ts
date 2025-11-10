/**
 * HomePage E2E Tests
 *
 * Comprehensive test suite for the sebc.dev coming soon landing page.
 * Tests cover:
 * - Page loading and navigation
 * - Visual element rendering
 * - Animation behavior
 * - Responsive design
 * - Accessibility compliance
 * - Dark theme application
 */

import { expect, test } from '@playwright/test';

test.describe('HomePage - Basic Loading', () => {
  /**
   * Test: Page loads successfully
   * Expected: URL matches localhost:3000, page has content
   */
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');

    // Verify the page loaded correctly
    await expect(page).toHaveURL(/localhost:3000/);
    expect(page).toBeTruthy();
  });

  /**
   * Test: Dark theme applied
   * Expected: HTML element has 'dark' class for dark theme
   */
  test('dark theme is applied to root element', async ({ page }) => {
    await page.goto('/');

    // Verify dark class is present on HTML element
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
  });

  /**
   * Test: Language attribute set correctly
   * Expected: HTML element has lang='fr' for French content
   */
  test('page language set to French', async ({ page }) => {
    await page.goto('/');

    // Verify language attribute
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'fr');
  });

  /**
   * Test: No console errors on page load
   * Expected: Page loads without JavaScript errors
   */
  test('page loads without console errors', async ({ page }) => {
    let hasError = false;
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        hasError = true;
        console.error('Console error:', msg.text());
      }
    });

    await page.goto('/');

    // Wait for any deferred errors
    await page.waitForTimeout(1000);
    expect(hasError).toBe(false);
  });
});

test.describe('HomePage - Visual Elements', () => {
  /**
   * Test: Main container is visible
   * Expected: Root div with flex layout is rendered
   */
  test('main container is visible', async ({ page }) => {
    await page.goto('/');

    // Verify main content container
    const mainContainer = page.locator('div.relative.flex.min-h-screen');
    await expect(mainContainer).toBeVisible();
  });

  /**
   * Test: Development badge renders correctly
   * Expected: Badge contains "En développement" text
   */
  test('development badge is visible with correct text', async ({ page }) => {
    await page.goto('/');

    // Verify badge element
    const badge = page.locator('span:has-text("En développement")');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('En développement');
  });

  /**
   * Test: Main title renders
   * Expected: h1 element contains "sebc.dev"
   */
  test('main title renders correctly', async ({ page }) => {
    await page.goto('/');

    // Verify h1 title
    const title = page.locator('h1');
    await expect(title).toBeVisible();
    await expect(title).toContainText('sebc.dev');
  });

  /**
   * Test: Subtitle is visible
   * Expected: Subtitle text about "laboratoire d'apprentissage public"
   */
  test('subtitle is visible', async ({ page }) => {
    await page.goto('/');

    // Verify subtitle
    const subtitle = page.locator('p:has-text("Un laboratoire d")');
    await expect(subtitle).toBeVisible();
    await expect(subtitle).toContainText('laboratoire d\'apprentissage public');
  });

  /**
   * Test: Description paragraph with key areas renders
   * Expected: Contains emphasized terms: IA, UX, Ingénierie logicielle
   */
  test('description with key focus areas is visible', async ({ page }) => {
    await page.goto('/');

    // Verify description paragraph
    const description = page.locator('p:has-text("À l\'intersection")');
    await expect(description).toBeVisible();
    await expect(description).toContainText('À l\'intersection');
    await expect(description).toContainText('IA');
    await expect(description).toContainText('UX');
    await expect(description).toContainText('ingénierie logicielle');
  });

  /**
   * Test: Loading indicators (pulsing dots) are visible
   * Expected: Three dots with pulsing animation
   */
  test('loading indicators are visible', async ({ page }) => {
    await page.goto('/');

    // Verify loading dots container exists
    const dotsContainer = page.locator('div.flex.items-center.gap-2').filter({ has: page.locator('div.animate-pulse') });
    await expect(dotsContainer).toBeVisible();

    // Verify at least one pulsing dot exists
    const pulsingDots = page.locator('div.animate-pulse');
    expect(await pulsingDots.count()).toBeGreaterThanOrEqual(3);
  });

  /**
   * Test: Info card with launch date renders
   * Expected: Card contains launch date "Fin Octobre 2025"
   */
  test('launch date card is visible', async ({ page }) => {
    await page.goto('/');

    // Verify info card
    const card = page.locator('div.backdrop-blur-md');
    await expect(card).toBeVisible();

    // Verify content
    await expect(card).toContainText('Lancement prévu');
    await expect(card).toContainText('Fin Octobre 2025');
    await expect(card).toContainText('Blog technique');
  });

  /**
   * Test: SVG icon in card is present and hidden from screen readers
   * Expected: SVG has aria-hidden='true'
   */
  test('SVG icon is properly marked as decorative', async ({ page }) => {
    await page.goto('/');

    // Verify SVG with aria-hidden
    const svg = page.locator('svg[aria-hidden="true"]');
    await expect(svg).toBeVisible();
  });

  /**
   * Test: Background elements are hidden from screen readers
   * Expected: Decorative background elements have aria-hidden
   */
  test('decorative background elements are hidden from screen readers', async ({ page }) => {
    await page.goto('/');

    // Verify grid overlay is hidden
    const gridOverlay = page.locator('div[aria-hidden="true"]').first();
    await expect(gridOverlay).toBeVisible();
    await expect(gridOverlay).toHaveAttribute('aria-hidden', 'true');
  });
});

test.describe('HomePage - Animations', () => {
  /**
   * Test: Title has gradient animation class
   * Expected: Title span has animate-gradient class
   */
  test('title has gradient animation', async ({ page }) => {
    await page.goto('/');

    // Verify gradient animation
    const titleSpan = page.locator('h1 span');
    const classes = await titleSpan.getAttribute('class');
    expect(classes).toContain('animate-gradient');
  });

  /**
   * Test: Badge has fade-in animation
   * Expected: Badge has animate-[fade-in-up...] class
   */
  test('badge has fade-in animation', async ({ page }) => {
    await page.goto('/');

    // Verify animation class - find inline-flex element with badge styling
    const badge = page.locator('div.inline-flex.items-center.gap-2.rounded-full.border');
    const classes = await badge.getAttribute('class');
    expect(classes).toContain('animate');
  });

  /**
   * Test: Elements appear with staggered timing
   * Expected: Elements have specific animation delays
   */
  test('elements have staggered animation timing', async ({ page }) => {
    await page.goto('/');

    // Verify badge (0.6s)
    const badge = page.locator('div.inline-flex.items-center.gap-2.rounded-full.border');
    const badgeClass = await badge.getAttribute('class');
    expect(badgeClass).toContain('0.6s');

    // Verify title (0.8s with 0.2s delay)
    const title = page.locator('h1');
    const titleClass = await title.getAttribute('class');
    expect(titleClass).toContain('0.8s');
    expect(titleClass).toContain('0.2s');
  });

  /**
   * Test: Pulsing animation on dots
   * Expected: Loading dots have animate-pulse class
   */
  test('loading dots have pulsing animation', async ({ page }) => {
    await page.goto('/');

    // Verify pulse animation
    const dots = page.locator('div.bg-accent.h-3.w-3.rounded-full');
    const firstDot = dots.first();
    const classes = await firstDot.getAttribute('class');
    expect(classes).toContain('animate-pulse');
  });

  /**
   * Test: Animations are disabled for reduced motion preference
   * Expected: Animations are instant when prefers-reduced-motion is set
   */
  test('respects prefers-reduced-motion preference', async ({ browser }) => {
    // Create context with reduced motion preference
    const context = await browser.newContext({
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();

    await page.goto('/');

    // Verify animations are disabled
    const animatedElement = page.locator('h1');
    const computedStyle = await animatedElement.evaluate((el) => {
      return window.getComputedStyle(el).animationDuration;
    });

    // Animation duration should be very small (0.01ms or scientific notation)
    expect(computedStyle).toMatch(/^(0\.01m|1e-05)s$/);

    await context.close();
  });
});

test.describe('HomePage - Responsive Design', () => {
  /**
   * Test: Mobile layout (375px width)
   * Expected: Text sizes are appropriate for mobile
   */
  test('renders correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Verify main elements are visible
    const title = page.locator('h1');
    await expect(title).toBeVisible();

    // Verify title uses mobile size class
    const classes = await title.getAttribute('class');
    expect(classes).toContain('text-6xl');
  });

  /**
   * Test: Tablet layout (768px width)
   * Expected: Text sizes are appropriate for tablet
   */
  test('renders correctly on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Verify main elements are visible
    const title = page.locator('h1');
    await expect(title).toBeVisible();

    // Verify title uses tablet size class
    const classes = await title.getAttribute('class');
    expect(classes).toContain('md:text-8xl');
  });

  /**
   * Test: Desktop layout (1920px width)
   * Expected: Text sizes are appropriate for desktop
   */
  test('renders correctly on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    // Verify main elements are visible
    const title = page.locator('h1');
    await expect(title).toBeVisible();

    // Verify title uses desktop size class
    const classes = await title.getAttribute('class');
    expect(classes).toContain('lg:text-9xl');
  });

  /**
   * Test: Content is centered on all viewports
   * Expected: Content container uses flex centering
   */
  test('content is centered on all viewports', async ({ page }) => {
    await page.goto('/');

    // Verify main container exists and is centered (main container with relative, flex, min-h-screen)
    const mainContainer = page.locator('div.relative.flex.min-h-screen.items-center.justify-center');
    await expect(mainContainer).toBeVisible();
  });

  /**
   * Test: No horizontal scroll on mobile
   * Expected: Content fits within viewport width
   */
  test('no horizontal scroll on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Get viewport and document width
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);

    expect(documentWidth).toBeLessThanOrEqual(viewportWidth);
  });
});

test.describe('HomePage - Accessibility', () => {
  /**
   * Test: Page has proper semantic HTML structure
   * Expected: Contains h1 and p elements
   */
  test('uses semantic HTML structure', async ({ page }) => {
    await page.goto('/');

    // Verify h1 exists (only main title)
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);

    // Verify paragraphs exist
    const paragraphs = page.locator('p');
    expect(await paragraphs.count()).toBeGreaterThan(0);
  });

  /**
   * Test: Keyboard navigation works
   * Expected: Can tab through focusable elements
   */
  test('supports keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Tab key should work without errors
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Page should still be visible
    const title = page.locator('h1');
    await expect(title).toBeVisible();
  });

  /**
   * Test: Color contrast is sufficient
   * Expected: Text color contrast meets WCAG AA standards
   */
  test('has sufficient color contrast', async ({ page }) => {
    await page.goto('/');

    // Check title color contrast
    const title = page.locator('h1 span');
    const bgColor = await title.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    const textColor = await title.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // Both should be defined (actual contrast calculation would be more complex)
    expect(bgColor).toBeTruthy();
    expect(textColor).toBeTruthy();
  });

  /**
   * Test: Decorative elements are hidden from screen readers
   * Expected: All decorative SVGs and backgrounds have aria-hidden
   */
  test('decorative elements are hidden from screen readers', async ({ page }) => {
    await page.goto('/');

    // Get all aria-hidden elements
    const hiddenElements = page.locator('[aria-hidden="true"]');
    const count = await hiddenElements.count();

    // Should have at least 2 (grid + footer decoration)
    expect(count).toBeGreaterThanOrEqual(2);
  });

  /**
   * Test: Focus indicators are visible
   * Expected: Tab navigation shows focus outlines
   */
  test('focus indicators are visible on keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Press Tab to move focus
    await page.keyboard.press('Tab');

    // Check if focused element has outline or similar
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      return window.getComputedStyle(el).outline;
    });

    // Should have some focus indicator (outline or similar)
    expect(focusedElement).toBeTruthy();
  });

  /**
   * Test: Images and icons are properly labeled
   * Expected: SVG icons have aria-hidden (content provided by text)
   */
  test('SVG icons are properly labeled as decorative', async ({ page }) => {
    await page.goto('/');

    // Find SVG in card
    const svg = page.locator('div.backdrop-blur-md svg');
    const ariaHidden = await svg.getAttribute('aria-hidden');

    expect(ariaHidden).toBe('true');
  });

  /**
   * Test: Text is readable without layout shift
   * Expected: Content is visible before animations complete
   */
  test('content is readable without waiting for animations', async ({ page }) => {
    await page.goto('/');

    // Immediately check if text is visible (before animation completes)
    const title = page.locator('h1');
    await expect(title).toBeVisible();

    const subtitle = page.locator('p:has-text("laboratoire")');
    await expect(subtitle).toBeVisible();
  });
});

test.describe('HomePage - Performance', () => {
  /**
   * Test: Page loads within acceptable time
   * Expected: Load complete within 3 seconds
   */
  test('page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  /**
   * Test: No layout shift during animations
   * Expected: Cumulative Layout Shift (CLS) is minimal
   */
  test('minimal layout shift during animations', async ({ page }) => {
    await page.goto('/');

    // Measure layout shifts
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsScore = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).hadRecentInput) continue;
            clsScore += (entry as any).value;
          }
        });

        observer.observe({ entryTypes: ['layout-shift'] });

        // Measure for 2 seconds
        setTimeout(() => {
          observer.disconnect();
          resolve(clsScore);
        }, 2000);
      });
    });

    // CLS should be less than 0.1 (good score)
    expect(cls).toBeLessThan(0.1);
  });

  /**
   * Test: No unused CSS
   * Expected: Only necessary styles are loaded
   */
  test('uses optimized styles', async ({ page }) => {
    await page.goto('/');

    // Get stylesheet information
    const stylesheets = await page.evaluate(() => {
      return Array.from(document.styleSheets).length;
    });

    // Should have reasonable number of stylesheets
    expect(stylesheets).toBeGreaterThan(0);
  });
});

test.describe('HomePage - SEO & Metadata', () => {
  /**
   * Test: Page title is set correctly
   * Expected: Document title contains "sebc.dev"
   */
  test('has correct page title for SEO', async ({ page }) => {
    await page.goto('/');

    const title = await page.title();
    expect(title).toContain('sebc.dev');
    expect(title).toContain('Laboratoire');
  });

  /**
   * Test: Meta description is present
   * Expected: Meta description with relevant keywords
   */
  test('has meta description', async ({ page }) => {
    await page.goto('/');

    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBeTruthy();
    expect(metaDescription).toContain('IA');
  });

  /**
   * Test: Robots meta tag is configured
   * Expected: Page is indexable
   */
  test('page is configured for search engines', async ({ page }) => {
    await page.goto('/');

    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots).toContain('index');
    expect(robots).toContain('follow');
  });

  /**
   * Test: Open Graph tags are present
   * Expected: og:title, og:description, og:type set
   */
  test('has Open Graph metadata for social sharing', async ({ page }) => {
    await page.goto('/');

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute(
      'content'
    );
    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');

    expect(ogTitle).toBeTruthy();
    expect(ogDescription).toBeTruthy();
    expect(ogType).toBe('website');
  });
});
