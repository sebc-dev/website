# Phase 3 - Testing Guide

Complete E2E testing strategy for Phase 3 (middleware validation with Playwright).

---

## 🎯 Testing Strategy

Phase 3 focuses exclusively on **E2E testing** to verify all 12 acceptance criteria with real browser interactions.

**Test Layers**:

1. **E2E Tests (Playwright)**: Full user flows with real browser (primary focus)
2. **Performance Tests**: Middleware execution timing (<50ms target)

**Target Coverage**: >80% scenario coverage (all AC 1-12 verified)
**Estimated Test Count**: 25+ E2E tests across all scenarios

---

## 🧪 E2E Tests with Playwright

### Purpose

Verify middleware behavior with real browser interactions, including:

- Language detection (URL, cookie, header)
- Redirects with correct status codes
- Cookie persistence
- Mobile viewports
- Edge cases

### Running E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e tests/middleware.spec.ts

# Run with UI (debug mode)
pnpm test:e2e:ui

# Run in debug mode (step-through)
pnpm test:e2e:debug

# Run on specific browser
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox
pnpm test:e2e --project=webkit

# Run on mobile viewport
pnpm test:e2e --project=mobile

# Watch mode (during development)
pnpm test:e2e --watch
```

### Expected Results

```
Running 25 tests using 4 workers

  ✓ tests/middleware.spec.ts:12:5 › AC1: Language detection from URL › /fr/ loads French page (523ms)
  ✓ tests/middleware.spec.ts:18:5 › AC1: Language detection from URL › /en/ loads English page (498ms)
  ✓ tests/middleware.spec.ts:24:5 › AC2: Accept-Language header › French header redirects to /fr/ (612ms)
  ...
  ✓ tests/i18n-edge-cases.spec.ts:45:5 › AC12: Infinite redirect prevention › No redirect loop (387ms)

  25 passed (15.3s)
```

**Coverage Goal**: All 12 AC verified, >80% scenario coverage

---

## 📁 Test Files Structure

```
tests/
├── middleware.spec.ts           # Core scenarios (AC 1-8)
├── i18n-edge-cases.spec.ts     # Edge cases & mobile (AC 9-12)
└── fixtures/
    └── i18n.ts                 # Playwright fixtures for setup
```

---

## 🧩 Playwright Fixtures

### What are Fixtures?

Fixtures provide reusable setup/teardown logic for tests. They ensure:

- Consistent test environment
- Isolated test state
- Clean setup and cleanup

### i18n Fixtures

**File**: `tests/fixtures/i18n.ts`

```typescript
import { test as base } from '@playwright/test';

type I18nFixtures = {
  frenchContext: Page;
  englishContext: Page;
  withCookie: (locale: 'fr' | 'en') => Promise<Page>;
};

export const test = base.extend<I18nFixtures>({
  // Fixture: Page with French language
  frenchContext: async ({ page }, use) => {
    await page.goto('/fr/');
    await use(page);
  },

  // Fixture: Page with English language
  englishContext: async ({ page }, use) => {
    await page.goto('/en/');
    await use(page);
  },

  // Fixture: Page with language cookie
  withCookie: async ({ context }, use) => {
    const helper = async (locale: 'fr' | 'en') => {
      await context.addCookies([
        {
          name: 'NEXT_LOCALE',
          value: locale,
          domain: 'localhost',
          path: '/',
        },
      ]);
      const page = await context.newPage();
      return page;
    };
    await use(helper);
  },
});
```

**Usage**:

```typescript
import { test } from './fixtures/i18n';

test('French page loads', async ({ frenchContext }) => {
  await expect(frenchContext).toHaveURL('/fr/');
});

test('Cookie persistence', async ({ withCookie }) => {
  const page = await withCookie('en');
  await page.goto('/');
  await expect(page).toHaveURL('/en/');
});
```

---

## 📝 Writing E2E Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('AC1: Language detection from URL', () => {
  test('should load French page for /fr/', async ({ page }) => {
    // Navigate
    await page.goto('/fr/');

    // Wait for URL
    await page.waitForURL('/fr/');

    // Assert
    await expect(page).toHaveURL('/fr/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });

  test('should load English page for /en/', async ({ page }) => {
    await page.goto('/en/');
    await page.waitForURL('/en/');
    await expect(page).toHaveURL('/en/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});
```

### Best Practices

✅ **Do**:

- Use descriptive test names (`should redirect to /fr/ when...`)
- Use explicit waits (`waitForURL`, `waitForSelector`)
- Group related tests with `test.describe()`
- Use fixtures for setup/teardown
- Test one thing per test
- Clean up after tests (Playwright does this automatically)

❌ **Don't**:

- Use arbitrary timeouts (`page.waitForTimeout(1000)`)
- Share state between tests
- Hardcode URLs (use `baseURL` from config)
- Test multiple scenarios in one test
- Ignore flaky tests (fix them)

---

## 🎭 Testing Patterns

### Pattern 1: Testing Redirects

```typescript
test('should redirect /de/ to /fr/', async ({ page }) => {
  // Listen for redirect
  const response = await page.goto('/de/');

  // Assert redirect
  expect(response?.status()).toBe(307); // Temporary redirect
  await expect(page).toHaveURL('/fr/');
});
```

### Pattern 2: Testing Cookies

```typescript
test('should set NEXT_LOCALE cookie', async ({ page, context }) => {
  await page.goto('/en/');

  // Get cookies
  const cookies = await context.cookies();
  const localeCookie = cookies.find((c) => c.name === 'NEXT_LOCALE');

  // Assert cookie
  expect(localeCookie).toBeDefined();
  expect(localeCookie?.value).toBe('en');
  expect(localeCookie?.httpOnly).toBe(true);
  expect(localeCookie?.sameSite).toBe('Lax');
});
```

### Pattern 3: Testing Accept-Language Header

```typescript
test('should detect French from header', async ({ browser }) => {
  // Create context with French header
  const context = await browser.newContext({
    locale: 'fr-FR',
    extraHTTPHeaders: {
      'Accept-Language': 'fr,en;q=0.9',
    },
  });

  const page = await context.newPage();
  await page.goto('/');

  // Assert redirect to French
  await expect(page).toHaveURL('/fr/');

  await context.close();
});
```

### Pattern 4: Testing Mobile Viewports

```typescript
test('should work on iPhone 13', async ({ browser }) => {
  // Create mobile context
  const context = await browser.newContext({
    ...devices['iPhone 13'],
  });

  const page = await context.newPage();
  await page.goto('/fr/articles/post-123');

  // Assert deep link works
  await expect(page).toHaveURL('/fr/articles/post-123');

  await context.close();
});
```

### Pattern 5: Testing Edge Cases

```typescript
test('should handle invalid cookie', async ({ page, context }) => {
  // Set invalid cookie
  await context.addCookies([
    {
      name: 'NEXT_LOCALE',
      value: 'invalid',
      domain: 'localhost',
      path: '/',
    },
  ]);

  await page.goto('/');

  // Should fallback to default (French)
  await expect(page).toHaveURL('/fr/');

  // Cookie should be reset
  const cookies = await context.cookies();
  const localeCookie = cookies.find((c) => c.name === 'NEXT_LOCALE');
  expect(localeCookie?.value).toBe('fr');
});
```

---

## 🐛 Debugging E2E Tests

### Common Issues

#### Issue: Test fails with "Timeout exceeded"

**Cause**: Page takes too long to load or element not found

**Solutions**:

1. Increase timeout in test:

   ```typescript
   test('slow test', async ({ page }) => {
     test.setTimeout(60000); // 60 seconds
     await page.goto('/fr/');
   });
   ```

2. Use explicit waits:

   ```typescript
   await page.waitForURL('/fr/', { timeout: 10000 });
   ```

3. Check network issues (VPN, firewall)

---

#### Issue: Test is flaky (passes sometimes, fails others)

**Cause**: Race conditions, timing issues

**Solutions**:

1. Use explicit waits (not arbitrary timeouts):

   ```typescript
   // Bad
   await page.waitForTimeout(1000);

   // Good
   await page.waitForURL('/fr/');
   await page.waitForSelector('h1');
   ```

2. Use Playwright's auto-waiting (built-in):

   ```typescript
   // Playwright automatically waits for element
   await page.click('button');
   ```

3. Check for shared state between tests (use fixtures)

---

#### Issue: "Page not found" or "Connection refused"

**Cause**: Dev server not running

**Solutions**:

1. Start dev server: `pnpm dev`
2. Verify server running: `curl http://localhost:3000`
3. Check `playwright.config.ts` has `webServer` configured

---

### Debug Commands

```bash
# Run with debug output
DEBUG=pw:api pnpm test:e2e

# Run with UI (step-through)
pnpm test:e2e:ui

# Run in headed mode (see browser)
pnpm test:e2e --headed

# Run specific test with debug
pnpm test:e2e tests/middleware.spec.ts:12

# Trace viewer (after test failure)
npx playwright show-trace trace.zip
```

---

## 📊 Test Coverage Report

### Generate Coverage

Playwright doesn't generate code coverage like Jest/Vitest, but we measure **scenario coverage**.

**Scenario Coverage**: Percentage of acceptance criteria verified

```bash
# Run all E2E tests
pnpm test:e2e

# Check results
# Expected: 25+ tests pass (all AC 1-12 covered)
```

### Coverage Goals

| Area               | Target | Current |
| ------------------ | ------ | ------- |
| AC Coverage (1-12) | 100%   | -       |
| Browser Coverage   | Chrome | -       |
| Mobile Coverage    | iOS+An | -       |
| Edge Case Coverage | >80%   | -       |

---

## 🤖 CI/CD Integration

### GitHub Actions (or other CI)

E2E tests run automatically on:

- [ ] Pull requests
- [ ] Push to main branch
- [ ] Nightly builds (optional)

### CI Test Configuration

**File**: `.github/workflows/e2e.yml`

```yaml
name: E2E Tests

on:
  pull_request:
  push:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

### Required Checks

All PRs must:

- [ ] Pass all E2E tests (25+ tests)
- [ ] No flaky tests (run 3 times successfully)
- [ ] Pass on Chromium (minimum)
- [ ] Pass TypeScript: `pnpm tsc`
- [ ] Pass linter: `pnpm lint`

---

## ✅ Testing Checklist

Before merging Phase 3:

- [ ] All 25+ E2E tests pass
- [ ] All AC 1-12 verified
- [ ] Tests run on Chromium (minimum)
- [ ] Mobile tests pass (iPhone 13, Pixel 5)
- [ ] No flaky tests (run 3+ times successfully)
- [ ] Edge cases tested
- [ ] Tests run in CI successfully
- [ ] Test report uploaded

---

## 📝 Test Maintenance

### Adding New Tests

1. Identify new scenario (from AC or edge case)
2. Create test in appropriate file (`middleware.spec.ts` or `i18n-edge-cases.spec.ts`)
3. Use fixtures for setup
4. Follow naming convention: `should [action] when [condition]`
5. Run test 3+ times to check for flakiness

### Updating Tests

1. Identify failing test
2. Determine root cause (test issue or code issue)
3. Fix test or code
4. Re-run all tests to avoid regressions
5. Document changes in commit message

---

## ❓ FAQ

**Q: How do I run tests faster during development?**
A: Use `--headed` to see browser, or run specific test: `pnpm test:e2e tests/middleware.spec.ts:12`

**Q: Should I test on all browsers (Chromium, Firefox, WebKit)?**
A: Focus on Chromium for development. Run Firefox/WebKit in CI or before merge.

**Q: How do I test performance (<50ms)?**
A: Use `performance.now()` in middleware, verify in unit tests (not E2E).

**Q: What if tests are flaky?**
A: Use explicit waits, fixtures, and avoid arbitrary timeouts. Run 3+ times to verify fix.

**Q: How do I test on mobile?**
A: Use `--project=mobile` or create context with mobile device: `...devices['iPhone 13']`

---

## 📚 Additional Resources

### Playwright Documentation

- [Playwright Official Docs](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Fixtures Guide](https://playwright.dev/docs/test-fixtures)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci)

### Next.js Testing

- [Next.js E2E Testing](https://nextjs.org/docs/app/building-your-application/testing/playwright)
- [Testing Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware#testing)

### Middleware Testing

- [next-intl Testing Guide](https://next-intl-docs.vercel.app/docs/testing)
- [Cloudflare Workers Testing](https://developers.cloudflare.com/workers/testing/)
