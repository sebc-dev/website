# Phase 4 - Testing Strategy

**Phase**: 4 - Métadonnées SEO

---

## Testing Overview

Cette phase modifie uniquement les métadonnées. Les tests se concentrent sur:

- Vérification HTML output
- Localisation correcte
- Pas de régression

---

## Manual Testing

### Browser DevTools

1. **French Locale**

   ```
   URL: http://localhost:3000/fr
   DevTools > Elements > <head>
   ```

   Check for:
   - `<title>sebc.dev - Laboratoire d'apprentissage public</title>`
   - `<meta name="description" content="À l'intersection...">`
   - `<meta property="og:locale" content="fr_FR">`

2. **English Locale**

   ```
   URL: http://localhost:3000/en
   DevTools > Elements > <head>
   ```

   Check for:
   - `<title>sebc.dev - Public Learning Lab</title>`
   - `<meta name="description" content="At the intersection...">`
   - `<meta property="og:locale" content="en_US">`

### View Source

```bash
# French page source
curl -s http://localhost:3000/fr | grep -E '<title>|og:|twitter:'

# English page source
curl -s http://localhost:3000/en | grep -E '<title>|og:|twitter:'
```

---

## Unit Tests (Optional)

Si vous souhaitez ajouter des tests unitaires pour les métadonnées:

### Test File: `app/[locale]/__tests__/metadata.test.ts`

```typescript
import { describe, it, expect } from 'vitest';

describe('Metadata', () => {
  it('should have title key in FR messages', async () => {
    const messages = await import('@/messages/fr.json');
    expect(messages.metadata.title).toBeDefined();
    expect(messages.metadata.title.length).toBeGreaterThan(0);
  });

  it('should have title key in EN messages', async () => {
    const messages = await import('@/messages/en.json');
    expect(messages.metadata.title).toBeDefined();
    expect(messages.metadata.title.length).toBeGreaterThan(0);
  });

  it('should have all required metadata keys', async () => {
    const fr = await import('@/messages/fr.json');
    const en = await import('@/messages/en.json');

    const requiredKeys = ['title', 'description', 'ogTitle', 'ogDescription'];

    for (const key of requiredKeys) {
      expect(fr.metadata[key]).toBeDefined();
      expect(en.metadata[key]).toBeDefined();
    }
  });
});
```

---

## E2E Tests

### Test File: `tests/metadata.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('SEO Metadata', () => {
  test('French page has correct metadata', async ({ page }) => {
    await page.goto('/fr');

    // Check title
    await expect(page).toHaveTitle(/sebc\.dev.*Laboratoire/);

    // Check description
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    expect(description).toContain('IA');
    expect(description).toContain('UX');

    // Check OG locale
    const ogLocale = await page
      .locator('meta[property="og:locale"]')
      .getAttribute('content');
    expect(ogLocale).toBe('fr_FR');

    // Check OG title
    const ogTitle = await page
      .locator('meta[property="og:title"]')
      .getAttribute('content');
    expect(ogTitle).toContain('Laboratoire');
  });

  test('English page has correct metadata', async ({ page }) => {
    await page.goto('/en');

    // Check title
    await expect(page).toHaveTitle(/sebc\.dev.*Learning Lab/);

    // Check description
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    expect(description).toContain('AI');
    expect(description).toContain('UX');

    // Check OG locale
    const ogLocale = await page
      .locator('meta[property="og:locale"]')
      .getAttribute('content');
    expect(ogLocale).toBe('en_US');
  });

  test('Twitter card is configured', async ({ page }) => {
    await page.goto('/fr');

    const twitterCard = await page
      .locator('meta[name="twitter:card"]')
      .getAttribute('content');
    expect(twitterCard).toBe('summary_large_image');

    const twitterTitle = await page
      .locator('meta[name="twitter:title"]')
      .getAttribute('content');
    expect(twitterTitle).toBeTruthy();
  });

  test('Robots meta allows indexing', async ({ page }) => {
    await page.goto('/fr');

    // Check robots allows indexing
    const robots = await page
      .locator('meta[name="robots"]')
      .getAttribute('content');
    expect(robots).toContain('index');
    expect(robots).toContain('follow');
  });
});
```

---

## Message Parity Tests

### Existing Test Update

Update existing message parity test to include `metadata` namespace:

```typescript
// In messages.test.ts
const namespaces = [
  'common',
  'nav',
  'footer',
  'form',
  'article',
  'complexity',
  'search',
  'error',
  'home', // Added in Phase 3
  'metadata', // Added in Phase 3, tested here
];
```

---

## Validation Commands

### TypeScript

```bash
pnpm tsc
```

### Lint

```bash
pnpm lint
```

### Unit Tests

```bash
pnpm test
```

### E2E Tests

```bash
pnpm test:e2e tests/metadata.spec.ts
```

### Build

```bash
pnpm build
```

---

## Lighthouse SEO Audit

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "SEO" category
4. Run audit on `/fr` and `/en`
5. Target score: ≥90

### Common SEO Issues

- Missing meta description
- Title too long/short
- Missing OG tags
- No robots meta

---

## External Validation Tools

### Facebook Sharing Debugger

```
https://developers.facebook.com/tools/debug/
```

Test: `https://your-preview-url/fr`

### Twitter Card Validator

```
https://cards-dev.twitter.com/validator
```

Test: `https://your-preview-url/fr`

### Google Rich Results Test

```
https://search.google.com/test/rich-results
```

---

## Test Coverage Goals

| Type         | Coverage Target                             |
| ------------ | ------------------------------------------- |
| Message keys | 100% (all metadata keys tested)             |
| Locales      | 100% (FR and EN)                            |
| Meta tags    | Core tags (title, description, OG, Twitter) |

---

## Regression Testing

### Before Phase 4

- Take screenshots of `/fr` and `/en`
- Note existing metadata (if any)

### After Phase 4

- Compare view source output
- Ensure no visual regression
- Verify build still works

---

**Created**: 2025-11-20
**Last Updated**: 2025-11-20
