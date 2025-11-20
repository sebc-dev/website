# Phase 5: Tests & Documentation - Implementation Plan

**Story**: 1.8 - Correction Architecture next-intl et Internationalisation des Pages
**Phase**: 5 of 5

---

## Atomic Commits Strategy

This phase contains **5 atomic commits** to validate the complete i18n implementation and update documentation.

---

## Commit 5.1: Unit Tests for i18n Core

### Objective

Create comprehensive unit tests for `src/i18n/routing.ts` and `src/i18n/request.ts`.

### Files to Create

- `src/i18n/__tests__/routing.test.ts`
- `src/i18n/__tests__/request.test.ts`

### Implementation Details

#### routing.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import { routing, Link, redirect, usePathname, useRouter } from '../routing';

describe('i18n routing configuration', () => {
  describe('routing config', () => {
    it('should have correct locales', () => {
      expect(routing.locales).toContain('fr');
      expect(routing.locales).toContain('en');
      expect(routing.locales).toHaveLength(2);
    });

    it('should have fr as defaultLocale', () => {
      expect(routing.defaultLocale).toBe('fr');
    });

    it('should use always localePrefix', () => {
      expect(routing.localePrefix).toBe('always');
    });
  });

  describe('navigation exports', () => {
    it('should export Link component', () => {
      expect(Link).toBeDefined();
    });

    it('should export redirect function', () => {
      expect(redirect).toBeDefined();
    });

    it('should export usePathname hook', () => {
      expect(usePathname).toBeDefined();
    });

    it('should export useRouter hook', () => {
      expect(useRouter).toBeDefined();
    });
  });
});
```

#### request.test.ts

```typescript
import { describe, it, expect, vi } from 'vitest';
import { getRequestConfig } from 'next-intl/server';

describe('i18n request configuration', () => {
  it('should return messages for fr locale', async () => {
    // Mock implementation test
    const messages = await import('@/messages/fr.json');
    expect(messages.default).toBeDefined();
    expect(messages.default.common).toBeDefined();
    expect(messages.default.home).toBeDefined();
    expect(messages.default.metadata).toBeDefined();
  });

  it('should return messages for en locale', async () => {
    const messages = await import('@/messages/en.json');
    expect(messages.default).toBeDefined();
    expect(messages.default.common).toBeDefined();
    expect(messages.default.home).toBeDefined();
    expect(messages.default.metadata).toBeDefined();
  });
});
```

### Validation

```bash
pnpm test src/i18n
```

### Estimated Time: 45 minutes

---

## Commit 5.2: E2E Tests for Localized Pages

### Objective

Create E2E tests to validate `/fr` and `/en` homepage functionality.

### Files to Modify

- `tests/home.spec.ts` (create or update)

### Implementation Details

```typescript
import { test, expect } from '@playwright/test';

test.describe('Homepage Internationalization', () => {
  test.describe('French homepage (/fr)', () => {
    test('should display French content', async ({ page }) => {
      await page.goto('/fr');

      // Check lang attribute
      const html = page.locator('html');
      await expect(html).toHaveAttribute('lang', 'fr');

      // Check French content
      await expect(page.locator('text=En développement')).toBeVisible();
      await expect(page.locator('text=Un laboratoire d\'apprentissage public')).toBeVisible();
      await expect(page.locator('text=Lancement prévu')).toBeVisible();
      await expect(page.locator('text=Fin Novembre 2025')).toBeVisible();
    });

    test('should have French metadata', async ({ page }) => {
      await page.goto('/fr');

      const title = await page.title();
      expect(title).toContain('Laboratoire');

      const description = page.locator('meta[name="description"]');
      await expect(description).toHaveAttribute('content', /intersection.*IA/);
    });
  });

  test.describe('English homepage (/en)', () => {
    test('should display English content', async ({ page }) => {
      await page.goto('/en');

      // Check lang attribute
      const html = page.locator('html');
      await expect(html).toHaveAttribute('lang', 'en');

      // Check English content
      await expect(page.locator('text=In development')).toBeVisible();
      await expect(page.locator('text=A public learning lab')).toBeVisible();
      await expect(page.locator('text=Expected launch')).toBeVisible();
      await expect(page.locator('text=Late November 2025')).toBeVisible();
    });

    test('should have English metadata', async ({ page }) => {
      await page.goto('/en');

      const title = await page.title();
      expect(title).toContain('Learning Lab');

      const description = page.locator('meta[name="description"]');
      await expect(description).toHaveAttribute('content', /intersection.*AI/);
    });
  });

  test.describe('Locale redirection', () => {
    test('should redirect / to /fr', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/\/fr/);
    });
  });
});
```

### Validation

```bash
pnpm test:e2e tests/home.spec.ts
```

### Estimated Time: 45 minutes

---

## Commit 5.3: Message Parity Tests Update

### Objective

Update message parity tests to include `home` and `metadata` namespaces.

### Files to Modify

- Existing message parity test file

### Implementation Details

Add checks for new namespaces:

```typescript
describe('Message parity - home namespace', () => {
  it('should have all home keys in both languages', () => {
    const frHome = frMessages.home;
    const enHome = enMessages.home;

    const frKeys = Object.keys(frHome);
    const enKeys = Object.keys(enHome);

    expect(frKeys.sort()).toEqual(enKeys.sort());

    // Verify specific keys
    const requiredKeys = [
      'badge', 'title', 'subtitle', 'description',
      'ai', 'ux', 'engineering',
      'launchLabel', 'launchDate', 'tagline'
    ];

    requiredKeys.forEach(key => {
      expect(frHome[key]).toBeDefined();
      expect(enHome[key]).toBeDefined();
    });
  });
});

describe('Message parity - metadata namespace', () => {
  it('should have all metadata keys in both languages', () => {
    const frMeta = frMessages.metadata;
    const enMeta = enMessages.metadata;

    const frKeys = Object.keys(frMeta);
    const enKeys = Object.keys(enMeta);

    expect(frKeys.sort()).toEqual(enKeys.sort());

    // Verify specific keys
    const requiredKeys = ['title', 'description', 'ogTitle', 'ogDescription'];

    requiredKeys.forEach(key => {
      expect(frMeta[key]).toBeDefined();
      expect(enMeta[key]).toBeDefined();
    });
  });
});
```

### Validation

```bash
pnpm test messages.test.ts
```

### Estimated Time: 30 minutes

---

## Commit 5.4: Documentation Update

### Objective

Update `CLAUDE.md` and i18n documentation to reflect new architecture.

### Files to Modify

- `CLAUDE.md` - i18n section
- `src/i18n/README.md` - New documentation

### Implementation Details

#### CLAUDE.md Updates

Update the i18n section to reflect:

```markdown
### Internationalization (i18n)

- **Library**: next-intl v4.5.3 (supports Next.js 15 + edge runtime)
- **Configuration**: `src/i18n/` directory
  - `routing.ts` - Route configuration with `defineRouting()` and typed navigation
  - `request.ts` - Server request configuration with `await requestLocale`
  - `index.ts` - Barrel exports for clean imports
  - `types.ts` - TypeScript type definitions
  - `README.md` - Comprehensive usage documentation
- **Supported Locales**: French (fr) - default, English (en)
- **Message Files**: `messages/fr.json`, `messages/en.json`
  - **10 namespaces**: common, nav, footer, form, article, complexity, search, error, home, metadata
  - **~85 total keys** organized into semantic groups
  - **100% translation parity** between French and English (validated by tests)
- **Import Pattern**: Use `import { ... } from '@/src/i18n'` for clean imports
- **Navigation**: Use typed navigation from routing.ts
  ```typescript
  import { Link, useRouter, usePathname } from '@/src/i18n';
  ```
- **Component Usage**:
  ```typescript
  import { useTranslations } from 'next-intl';

  export function MyComponent() {
    const t = useTranslations('home');
    return <div>{t('title')}</div>;
  }
  ```
```

#### src/i18n/README.md

Create comprehensive documentation covering:

- Architecture overview
- File structure
- Usage examples
- Server vs Client Components
- Best practices

### Validation

- Manual review of documentation
- Links work correctly
- Examples are accurate

### Estimated Time: 45 minutes

---

## Commit 5.5: Final Validation

### Objective

Run complete validation suite and ensure production readiness.

### Validation Steps

#### 1. TypeScript Compilation

```bash
pnpm tsc --noEmit
```

#### 2. Linting

```bash
pnpm lint
```

#### 3. Unit Tests

```bash
pnpm test
```

#### 4. E2E Tests

```bash
pnpm test:e2e
```

#### 5. Production Build

```bash
pnpm build
```

#### 6. Preview

```bash
pnpm preview
```

#### 7. Manual Verification

- [ ] Visit `/fr` - verify French content
- [ ] Visit `/en` - verify English content
- [ ] Check `<html lang>` attribute
- [ ] Verify metadata in page source
- [ ] Check console for errors

### No Files Modified

This commit is validation only.

### Estimated Time: 30 minutes

---

## Commit Sequence Diagram

```
Commit 5.1: Unit Tests i18n
    ↓
Commit 5.2: E2E Tests locales
    ↓
Commit 5.3: Message parity tests
    ↓
Commit 5.4: Documentation update
    ↓
Commit 5.5: Final validation
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Unit test coverage | ≥80% for new code |
| E2E test pass rate | 100% |
| Build success | Yes |
| Preview works | Yes |
| Documentation complete | Yes |

---

## Gitmoji Commits

```
✅ test(i18n): add unit tests for routing and request configuration
✅ test(e2e): add localized homepage tests for FR and EN
✅ test(i18n): update message parity tests with home and metadata namespaces
📝 docs(i18n): update CLAUDE.md and create src/i18n/README.md
✅ chore(validation): final validation of i18n implementation
```

---

**Created**: 2025-11-20
**Last Updated**: 2025-11-20
