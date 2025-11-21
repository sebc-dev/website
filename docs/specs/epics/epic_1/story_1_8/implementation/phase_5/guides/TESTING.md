# Phase 5: Tests & Documentation - Testing Guide

**Story**: 1.8 - Correction Architecture next-intl et Internationalisation des Pages
**Phase**: 5 of 5

---

## Testing Overview

This phase focuses entirely on testing the i18n implementation from phases 1-4.

### Test Types

| Type   | Framework  | Location              | Purpose                         |
| ------ | ---------- | --------------------- | ------------------------------- |
| Unit   | Vitest     | `src/i18n/__tests__/` | Test i18n configuration         |
| E2E    | Playwright | `tests/`              | Test localized pages            |
| Parity | Vitest     | `messages.test.ts`    | Verify translation completeness |

---

## Unit Testing Strategy

### What to Test

1. **routing.ts exports**
   - Configuration values (locales, defaultLocale, localePrefix)
   - Navigation utilities (Link, redirect, usePathname, useRouter)

2. **request.ts behavior**
   - Message loading for each locale
   - Namespace availability

### Test Patterns

```typescript
// Configuration tests
describe('routing configuration', () => {
  it('should have correct locales', () => {
    expect(routing.locales).toContain('fr');
    expect(routing.locales).toContain('en');
  });
});

// Export tests
describe('navigation exports', () => {
  it('should export Link', () => {
    expect(Link).toBeDefined();
  });
});
```

### Running Unit Tests

```bash
# Run all i18n tests
pnpm test src/i18n

# Run with coverage
pnpm test:coverage src/i18n

# Run in watch mode
pnpm test:watch src/i18n
```

---

## E2E Testing Strategy

### What to Test

1. **French homepage (/fr)**
   - HTML lang attribute
   - Text content
   - Metadata

2. **English homepage (/en)**
   - HTML lang attribute
   - Text content
   - Metadata

3. **Redirection**
   - `/` redirects to `/fr`

### Test Patterns

```typescript
// Content tests
test('should display French content', async ({ page }) => {
  await page.goto('/fr');
  await expect(page.locator('text=En développement')).toBeVisible();
});

// Metadata tests
test('should have French metadata', async ({ page }) => {
  await page.goto('/fr');
  const title = await page.title();
  expect(title).toContain('Laboratoire');
});

// Attribute tests
test('should have correct lang attribute', async ({ page }) => {
  await page.goto('/fr');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('lang', 'fr');
});
```

### Running E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e tests/home.spec.ts

# Run with UI
pnpm test:e2e:ui

# Run in debug mode
pnpm test:e2e:debug
```

### E2E Best Practices

1. **Use appropriate selectors**

   ```typescript
   // Good: semantic
   page.locator('text=Expected launch');

   // Good: data-testid
   page.locator('[data-testid="launch-label"]');

   // Avoid: brittle CSS
   page.locator('.mt-4.text-sm');
   ```

2. **Add proper waits**

   ```typescript
   // Wait for element
   await expect(element).toBeVisible();

   // Wait for navigation
   await page.waitForURL(/\/fr/);
   ```

3. **Use descriptive test names**
   ```typescript
   test('should display French badge with "En développement"', ...)
   ```

---

## Message Parity Testing

### What to Test

1. **Namespace existence**
   - Both FR and EN have all namespaces

2. **Key parity**
   - All keys in FR exist in EN
   - All keys in EN exist in FR

3. **Specific keys**
   - Required keys for `home` namespace
   - Required keys for `metadata` namespace

### Test Patterns

```typescript
describe('Message parity - home namespace', () => {
  const frHome = frMessages.home;
  const enHome = enMessages.home;

  it('should have matching keys', () => {
    const frKeys = Object.keys(frHome);
    const enKeys = Object.keys(enHome);
    expect(frKeys.sort()).toEqual(enKeys.sort());
  });

  it('should have required keys', () => {
    const requiredKeys = ['badge', 'title', 'subtitle'];
    requiredKeys.forEach((key) => {
      expect(frHome[key]).toBeDefined();
      expect(enHome[key]).toBeDefined();
    });
  });
});
```

### Running Parity Tests

```bash
# Run message tests
pnpm test messages.test.ts

# Run with verbose output
pnpm test messages.test.ts --reporter=verbose
```

---

## Coverage Targets

| Area           | Target | Reason                  |
| -------------- | ------ | ----------------------- |
| routing.ts     | 100%   | Small, critical file    |
| request.ts     | 80%    | Some parts hard to test |
| E2E homepage   | 100%   | Full user journey       |
| Message parity | 100%   | Must verify all keys    |

### Checking Coverage

```bash
# Generate coverage report
pnpm test:coverage

# View HTML report
open coverage/index.html
```

---

## Troubleshooting

### Unit Tests

#### Tests fail to import modules

```bash
# Check module resolution
pnpm tsc --noEmit

# Verify vitest config
cat vitest.config.ts
```

#### Mock issues

```typescript
// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));
```

### E2E Tests

#### Tests timeout

```typescript
// Increase timeout
test.setTimeout(60000);

// Or in config
test('name', { timeout: 60000 }, async () => {
  // ...
});
```

#### Content not found

```typescript
// Add wait
await page.waitForLoadState('networkidle');

// Use more specific selector
await page.locator('[data-testid="badge"]').waitFor();
```

#### Server not running

```bash
# Ensure preview server is running
pnpm preview &

# Or use webServer in playwright.config.ts
```

### Parity Tests

#### Keys mismatch

```typescript
// Debug missing keys
const missingInEn = frKeys.filter((k) => !enKeys.includes(k));
const missingInFr = enKeys.filter((k) => !frKeys.includes(k));
console.log({ missingInEn, missingInFr });
```

---

## Test Commands Summary

```bash
# Unit tests
pnpm test                      # All unit tests
pnpm test src/i18n            # i18n tests only
pnpm test:coverage            # With coverage

# E2E tests
pnpm test:e2e                 # All E2E tests
pnpm test:e2e tests/home.spec.ts  # Specific file
pnpm test:e2e:ui              # With UI

# Parity tests
pnpm test messages.test.ts    # Parity tests

# All tests
pnpm test && pnpm test:e2e    # Complete suite
```

---

## CI/CD Considerations

### Test Order

1. Unit tests (fast feedback)
2. Message parity tests
3. E2E tests (slow but comprehensive)
4. Build validation

### Parallel Execution

```bash
# Run in parallel in CI
pnpm test & pnpm test:e2e
```

### Artifacts

- Coverage reports
- Playwright traces on failure
- Test results summary

---

**Created**: 2025-11-20
**Last Updated**: 2025-11-20
