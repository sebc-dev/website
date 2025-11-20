# Phase 3 - Testing Guide

**Story**: 1.8 - Correction Architecture next-intl
**Phase**: Internationalisation de la page d'accueil

---

## Testing Strategy Overview

### Test Types for This Phase

| Type | Focus | Tools |
|------|-------|-------|
| Unit | Message parity | Vitest |
| Integration | Translation loading | Vitest + next-intl |
| E2E | Visual + functionality | Playwright |
| Manual | Visual regression | Browser |

---

## Unit Tests

### Message Parity Tests

Ensure FR and EN have identical keys.

#### Test File Location
`tests/messages.test.ts` or `src/__tests__/messages.test.ts`

#### Test Cases

```typescript
import fr from '@/messages/fr.json';
import en from '@/messages/en.json';

describe('Message Parity - home namespace', () => {
  it('should have home namespace in both languages', () => {
    expect(fr.home).toBeDefined();
    expect(en.home).toBeDefined();
  });

  it('should have identical keys in home namespace', () => {
    const frKeys = Object.keys(fr.home).sort();
    const enKeys = Object.keys(en.home).sort();
    expect(frKeys).toEqual(enKeys);
  });

  it('should have all 10 home keys', () => {
    const expectedKeys = [
      'badge', 'title', 'subtitle', 'description',
      'ai', 'ux', 'engineering',
      'launchLabel', 'launchDate', 'tagline'
    ];

    expectedKeys.forEach(key => {
      expect(fr.home[key]).toBeDefined();
      expect(en.home[key]).toBeDefined();
    });
  });
});

describe('Message Parity - metadata namespace', () => {
  it('should have metadata namespace in both languages', () => {
    expect(fr.metadata).toBeDefined();
    expect(en.metadata).toBeDefined();
  });

  it('should have identical keys in metadata namespace', () => {
    const frKeys = Object.keys(fr.metadata).sort();
    const enKeys = Object.keys(en.metadata).sort();
    expect(frKeys).toEqual(enKeys);
  });

  it('should have all 4 metadata keys', () => {
    const expectedKeys = ['title', 'description', 'ogTitle', 'ogDescription'];

    expectedKeys.forEach(key => {
      expect(fr.metadata[key]).toBeDefined();
      expect(en.metadata[key]).toBeDefined();
    });
  });
});
```

#### Run Unit Tests
```bash
pnpm test messages.test.ts
```

---

## Integration Tests

### Translation Loading Tests

Test that translations load correctly in components.

```typescript
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import HomePage from '@/app/[locale]/page';
import messages from '@/messages/fr.json';

describe('HomePage Integration', () => {
  const renderWithIntl = (locale: string, msgs: typeof messages) => {
    return render(
      <NextIntlClientProvider locale={locale} messages={msgs}>
        <HomePage />
      </NextIntlClientProvider>
    );
  };

  it('renders French content', () => {
    renderWithIntl('fr', messages);
    expect(screen.getByText('En développement')).toBeInTheDocument();
    expect(screen.getByText('sebc.dev')).toBeInTheDocument();
    expect(screen.getByText(/Un laboratoire/)).toBeInTheDocument();
  });

  it('renders English content', async () => {
    const enMessages = await import('@/messages/en.json');
    renderWithIntl('en', enMessages.default);
    expect(screen.getByText('In development')).toBeInTheDocument();
    expect(screen.getByText('A public learning lab')).toBeInTheDocument();
  });
});
```

---

## E2E Tests

### Playwright Tests

Test full page functionality in browser.

#### Test File
`tests/homepage.spec.ts`

#### Test Cases

```typescript
import { test, expect } from '@playwright/test';

test.describe('Homepage Internationalization', () => {
  test.describe('French Homepage', () => {
    test('displays French content', async ({ page }) => {
      await page.goto('/fr');

      // Badge
      await expect(page.getByText('En développement')).toBeVisible();

      // Title
      await expect(page.getByRole('heading', { name: 'sebc.dev' })).toBeVisible();

      // Subtitle
      await expect(page.getByText('Un laboratoire d\'apprentissage public')).toBeVisible();

      // Description (partial match due to interpolation)
      await expect(page.getByText(/À l'intersection/)).toBeVisible();

      // Launch info
      await expect(page.getByText('Lancement prévu')).toBeVisible();
      await expect(page.getByText('Fin Novembre 2025')).toBeVisible();

      // Tagline
      await expect(page.getByText('Blog technique • Articles • Guides')).toBeVisible();
    });

    test('has correct html lang attribute', async ({ page }) => {
      await page.goto('/fr');
      const html = page.locator('html');
      await expect(html).toHaveAttribute('lang', 'fr');
    });
  });

  test.describe('English Homepage', () => {
    test('displays English content', async ({ page }) => {
      await page.goto('/en');

      // Badge
      await expect(page.getByText('In development')).toBeVisible();

      // Title
      await expect(page.getByRole('heading', { name: 'sebc.dev' })).toBeVisible();

      // Subtitle
      await expect(page.getByText('A public learning lab')).toBeVisible();

      // Description
      await expect(page.getByText(/At the intersection/)).toBeVisible();

      // Launch info
      await expect(page.getByText('Expected launch')).toBeVisible();
      await expect(page.getByText('Late November 2025')).toBeVisible();

      // Tagline
      await expect(page.getByText('Tech blog • Articles • Guides')).toBeVisible();
    });

    test('has correct html lang attribute', async ({ page }) => {
      await page.goto('/en');
      const html = page.locator('html');
      await expect(html).toHaveAttribute('lang', 'en');
    });
  });

  test.describe('Homepage Visual', () => {
    test('animations are present', async ({ page }) => {
      await page.goto('/fr');

      // Check for animation classes
      const animatedElements = page.locator('[class*="animate-"]');
      expect(await animatedElements.count()).toBeGreaterThan(0);
    });

    test('layout is responsive', async ({ page }) => {
      // Desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/fr');
      await expect(page.locator('main')).toBeVisible();

      // Mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('main')).toBeVisible();
    });
  });

  test.describe('Root redirect', () => {
    test('/ redirects to locale', async ({ page }) => {
      await page.goto('/');
      // Should redirect to /fr or /en based on browser preference
      await expect(page).toHaveURL(/\/(fr|en)/);
    });
  });
});
```

#### Run E2E Tests
```bash
# Start preview server first
pnpm preview

# In another terminal
pnpm test:e2e tests/homepage.spec.ts
```

---

## Manual Testing Checklist

### Visual Regression

#### French Homepage (`/fr`)

- [ ] Badge text: "En développement"
- [ ] Title: "sebc.dev"
- [ ] Subtitle visible and styled
- [ ] Description with bold terms (IA, UX, ingénierie)
- [ ] Launch section visible
- [ ] Tagline visible
- [ ] All animations play correctly
- [ ] Spacing and alignment correct

#### English Homepage (`/en`)

- [ ] Badge text: "In development"
- [ ] Title: "sebc.dev"
- [ ] Subtitle: "A public learning lab"
- [ ] Description with bold terms (AI, UX, software engineering)
- [ ] Launch section with English text
- [ ] Tagline in English
- [ ] Layout identical to FR version
- [ ] Animations identical to FR version

#### Comparison

- [ ] Side-by-side comparison FR vs EN
- [ ] No text overflow in either language
- [ ] Consistent spacing
- [ ] Consistent typography

### Browser Testing

Test in multiple browsers:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari (if available)

### Responsive Testing

Test viewports:
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1280px)

---

## Test Commands Summary

```bash
# All unit tests
pnpm test

# Specific message tests
pnpm test messages.test.ts

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# E2E tests
pnpm test:e2e

# E2E with UI
pnpm test:e2e:ui

# Specific E2E test
pnpm test:e2e tests/homepage.spec.ts
```

---

## Expected Test Results

### After Phase 3 Completion

| Test Suite | Expected Result |
|------------|-----------------|
| Message parity (home) | PASS |
| Message parity (metadata) | PASS |
| Homepage integration FR | PASS |
| Homepage integration EN | PASS |
| E2E French homepage | PASS |
| E2E English homepage | PASS |
| TypeScript compilation | PASS |
| ESLint | PASS |
| Build | PASS |

### Coverage Targets

For new code in this phase:
- Statements: >80%
- Branches: >80%
- Functions: >80%
- Lines: >80%

---

**Testing Guide Created**: 2025-11-20
