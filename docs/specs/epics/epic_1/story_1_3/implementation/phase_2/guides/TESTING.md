# Phase 2 - Testing Guide

Complete testing strategy for Phase 2 (Cookie Persistence & i18n Context).

---

## 🎯 Testing Strategy

Phase 2 uses a multi-layered testing approach:

1. **Unit Tests**: Cookie utilities, redirect logic, locale validation
2. **Integration Tests**: Middleware → Cookie → Context flow
3. **Type Tests**: TypeScript compilation and type safety

**Target Coverage**: >80%
**Estimated Test Count**: 25-35 tests

---

## 🧪 Unit Tests

### Purpose

Test individual functions in isolation, without middleware or next-intl context.

### Running Unit Tests

```bash
# Run all unit tests
pnpm test

# Run specific test file
pnpm test src/lib/i18n/cookie.test.ts

# Run tests in watch mode (during development)
pnpm test --watch

# Coverage report
pnpm test:coverage
```

### Expected Results

```
✓ src/lib/i18n/cookie.test.ts (9 tests)
✓ src/lib/i18n/redirect.test.ts (8 tests)
✓ src/middleware.test.ts (6 tests)

Tests: 23 passed, 23 total
Coverage: >80%
```

### Test Files Structure

```
src/lib/i18n/
├── cookie.ts (production code)
├── cookie.test.ts (unit tests)
├── redirect.ts (production code)
├── redirect.test.ts (unit tests)
└── [other files]

src/
├── middleware.ts (production code)
└── middleware.test.ts (integration tests)
```

### Adding New Unit Tests

#### Template: Cookie Utility Test

```typescript
// src/lib/i18n/cookie.test.ts
import { describe, it, expect, vi } from 'vitest';
import { getCookie, setCookie, validateLocale } from './cookie';
import type { NextRequest } from 'next/server';

describe('Cookie Utilities', () => {
  describe('getCookie', () => {
    it('should return cookie value when present', () => {
      // Create mock request with cookie
      const mockRequest = {
        cookies: {
          get: (name: string) => ({
            name,
            value: 'fr',
          }),
        },
      } as unknown as NextRequest;

      const result = getCookie(mockRequest, 'NEXT_LOCALE');
      expect(result).toBe('fr');
    });

    it('should return undefined when cookie missing', () => {
      const mockRequest = {
        cookies: {
          get: (name: string) => undefined,
        },
      } as unknown as NextRequest;

      const result = getCookie(mockRequest, 'NEXT_LOCALE');
      expect(result).toBeUndefined();
    });
  });

  describe('setCookie', () => {
    it('should create Set-Cookie header with secure flags', () => {
      const header = setCookie('NEXT_LOCALE', 'fr');

      expect(header).toContain('NEXT_LOCALE=fr');
      expect(header).toContain('HttpOnly');
      expect(header).toContain('SameSite=Lax');
      expect(header).toContain('Max-Age=31536000');
    });

    it('should include Secure flag in production', () => {
      process.env.NODE_ENV = 'production';
      const header = setCookie('NEXT_LOCALE', 'fr');

      expect(header).toContain('Secure');
    });

    it('should not include Secure flag in development', () => {
      process.env.NODE_ENV = 'development';
      const header = setCookie('NEXT_LOCALE', 'fr');

      expect(header).not.toContain('Secure');
    });
  });

  describe('validateLocale', () => {
    it('should accept valid locales: fr, en', () => {
      expect(validateLocale('fr')).toBe(true);
      expect(validateLocale('en')).toBe(true);
    });

    it('should reject invalid locales', () => {
      expect(validateLocale('de')).toBe(false);
      expect(validateLocale('es')).toBe(false);
      expect(validateLocale('')).toBe(false);
    });
  });
});
```

#### Template: Redirect Logic Test

```typescript
// src/lib/i18n/redirect.test.ts
import { describe, it, expect } from 'vitest';
import { handleRootPathRedirect } from './redirect';
import type { NextRequest } from 'next/server';

describe('Root Path Redirect', () => {
  it('should redirect / to /fr/ (default locale)', () => {
    const mockRequest = {
      nextUrl: {
        pathname: '/',
        clone: function () {
          return this;
        },
      },
    } as unknown as NextRequest;

    const response = handleRootPathRedirect(mockRequest, 'fr');

    expect(response).not.toBeNull();
    expect(response?.status).toBe(307); // Temporary Redirect
    expect(response?.headers.get('location')).toBe('/fr/');
  });

  it('should preserve query parameters', () => {
    const mockRequest = {
      nextUrl: {
        pathname: '/',
        search: '?foo=bar',
        clone: function () {
          return this;
        },
      },
    } as unknown as NextRequest;

    const response = handleRootPathRedirect(mockRequest, 'fr');

    expect(response?.headers.get('location')).toBe('/fr/?foo=bar');
  });

  it('should not redirect non-root paths', () => {
    const mockRequest = {
      nextUrl: {
        pathname: '/fr/about',
        clone: function () {
          return this;
        },
      },
    } as unknown as NextRequest;

    const response = handleRootPathRedirect(mockRequest, 'fr');

    expect(response).toBeNull();
  });
});
```

---

## 🔗 Integration Tests

### Purpose

Test that middleware, cookie utilities, and next-intl context work together correctly.

### Running Integration Tests

```bash
# Run all tests (includes integration)
pnpm test

# Run specific integration test
pnpm test src/lib/i18n/context.integration.test.ts

# Run with verbose output
pnpm test -- --reporter=verbose
```

### Integration Test Structure

#### Template: Middleware → Cookie → Context Flow

```typescript
// src/lib/i18n/context.integration.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import middleware from '@/middleware';

describe('Middleware Integration: Cookie → Context Flow', () => {
  it('should set cookie and initialize context on root path', async () => {
    // Create request for root path
    const request = new NextRequest(new URL('http://localhost:3000/'), {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
    });

    // Mock next-intl middleware
    vi.mock('next-intl/server', () => ({
      middleware: vi.fn((req, config) => {
        const response = NextResponse.next();
        response.headers.set('x-intl-context', 'initialized');
        return response;
      }),
    }));

    // Call middleware
    const response = await middleware(request);

    // Verify response
    expect(response).not.toBeUndefined();
    expect(response?.status).toBe(307); // Redirect to /fr/
    expect(response?.headers.get('set-cookie')).toContain('NEXT_LOCALE');
  });

  it('should initialize context for language path without redirect', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/fr/'), {
      headers: {},
    });

    // Mock next-intl middleware
    vi.mock('next-intl/server', () => ({
      middleware: vi.fn((req, config) => {
        const response = NextResponse.next();
        response.headers.set('x-intl-context', 'initialized');
        return response;
      }),
    }));

    const response = await middleware(request);

    // Should not redirect (already on /fr/)
    expect(response?.status).not.toBe(307);
    // Context should be initialized
    expect(response?.headers.get('x-intl-context')).toBe('initialized');
  });

  it('should set NEXT_LOCALE cookie with detected language', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/'), {
      headers: {
        'accept-language': 'en-US,en;q=0.9',
      },
    });

    const response = await middleware(request);

    // Verify cookie set with detected language
    const setCookieHeader = response?.headers.get('set-cookie');
    expect(setCookieHeader).toContain('NEXT_LOCALE');
    expect(setCookieHeader).toContain('en'); // Detected from Accept-Language
  });
});
```

#### Template: Component Access to i18n Context

```typescript
// src/lib/i18n/context.integration.test.ts (additional)
import { render } from '@testing-library/react';
import { useTranslations } from 'next-intl';

// Mock component that uses translations
function TestComponent() {
  const t = useTranslations('common');
  return <div>{t('appName')}</div>;
}

describe('Component i18n Context Access', () => {
  it('should allow components to use useTranslations()', () => {
    // Mock next-intl to provide context
    vi.mock('next-intl', () => ({
      useTranslations: vi.fn(() => {
        return (key: string) => {
          const translations: Record<string, string> = {
            appName: 'My App',
            welcome: 'Welcome'
          };
          return translations[key] || key;
        };
      })
    }));

    const { getByText } = render(<TestComponent />);

    expect(getByText('My App')).toBeDefined();
  });
});
```

---

## 📊 Coverage Report

### Generate Coverage

```bash
# Generate coverage report
pnpm test:coverage

# View HTML report
pnpm test:coverage
# Open coverage/index.html in browser
```

### Coverage Goals by File

| File                       | Target | Description            |
| -------------------------- | ------ | ---------------------- |
| `src/lib/i18n/cookie.ts`   | >80%   | Cookie utilities       |
| `src/lib/i18n/redirect.ts` | >80%   | Redirect logic         |
| `src/middleware.ts`        | >80%   | Middleware integration |
| **Overall Phase 2**        | >80%   | All new/modified code  |

### Sample Coverage Report

```
File                       | % Stmts | % Branch | % Funcs | % Lines
-----|---------|----------|---------|---------|
All files                  |   82.5  |   79.2   |   85.0  |   82.5
src/lib/i18n/cookie.ts    |   88.0  |   85.7   |   90.0  |   88.0
src/lib/i18n/redirect.ts  |   81.2  |   79.0   |   83.3  |   81.2
src/middleware.ts         |   78.4  |   75.0   |   80.0  |   78.4
```

---

## 🐛 Debugging Tests

### Common Issues

#### Issue: Tests fail locally but pass in CI

**Solutions**:

1. Ensure environment variables set:

   ```bash
   NEXT_PUBLIC_DEFAULT_LOCALE=fr NEXT_PUBLIC_SUPPORTED_LOCALES=fr,en pnpm test
   ```

2. Clear cache and reinstall:

   ```bash
   rm -rf node_modules .next
   pnpm install
   pnpm test
   ```

3. Check Node.js version:
   ```bash
   node --version  # Should be v18+
   ```

#### Issue: Tests are flaky (intermittent failures)

**Solutions**:

1. Increase timeouts:

   ```typescript
   it(
     'should work',
     async () => {
       // test code
     },
     { timeout: 10000 },
   ); // 10 second timeout
   ```

2. Remove timing dependencies:

   ```typescript
   // Bad: relies on timing
   it('should update', () => {
     setTimeout(() => {
       expect(value).toBe(expected);
     }, 100);
   });

   // Good: direct expectation
   it('should update', () => {
     updateValue();
     expect(value).toBe(expected);
   });
   ```

3. Mock time if using timers:

   ```typescript
   import { vi } from 'vitest';

   it('should expire cookie', () => {
     vi.useFakeTimers();
     // test code
     vi.runAllTimers();
     vi.restoreAllMocks();
   });
   ```

### Debug Commands

```bash
# Run single test in verbose mode
pnpm test -- src/lib/i18n/cookie.test.ts --reporter=verbose

# Run with debugging output
DEBUG=* pnpm test

# Run test in isolation (to rule out interference)
pnpm test -- src/lib/i18n/cookie.test.ts --run
```

---

## ✅ Testing Checklist

Before marking Phase 2 complete:

- [ ] All unit tests passing: `pnpm test`
- [ ] All integration tests passing: `pnpm test`
- [ ] Coverage >80%: `pnpm test:coverage`
- [ ] No skipped tests (`.skip()`, `.only()`)
- [ ] No console.log in test code
- [ ] Tests run in CI without modification
- [ ] Type errors zero: `pnpm tsc`
- [ ] No flaky tests (run multiple times)

---

## 📝 Best Practices

### Writing Tests

✅ **Do**:

- Test behavior, not implementation
- Use descriptive test names: `should redirect root path to detected language`
- One concept per test
- Test happy path AND edge cases
- Mock external dependencies (next-intl)
- Use fixtures for common setup

❌ **Don't**:

- Test framework internals
- Over-mock utilities being tested
- Write implementation-specific tests
- Skip failing tests (fix them instead)
- Write flaky timing-dependent tests

### Test Naming

Good test names:

```typescript
// Good: describes behavior
it('should redirect root path to detected language', () => {});
it('should preserve query parameters during redirect', () => {});
it('should set secure flags on production cookies', () => {});

// Bad: too vague
it('should work', () => {});
it('tests redirect logic', () => {});
it('tests cookies', () => {});
```

### Test Organization

```typescript
describe('Cookie Utilities', () => {
  describe('getCookie', () => {
    it('should get value when present', () => {});
    it('should return undefined when missing', () => {});
  });

  describe('setCookie', () => {
    it('should set secure flags', () => {});
    it('should include Secure in production', () => {});
  });
});
```

---

## 🚀 Integration with CI/CD

### GitHub Actions Example

Tests should run automatically in CI:

```yaml
name: Test Phase 2

on: [pull_request, push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test
      - run: pnpm test:coverage
```

### Quality Gates

All PRs must:

- [ ] Pass `pnpm test`
- [ ] Pass `pnpm tsc`
- [ ] Pass `pnpm lint`
- [ ] Achieve >80% coverage
- [ ] Have review approval

---

## ❓ FAQ

**Q: How much should I test?**
A: Aim for >80% coverage, focus on critical paths and edge cases. Each function should have at least 2-3 tests.

**Q: Should I test [specific scenario]?**
A: If it's critical business logic or error-prone, yes. Cookie security, locale validation - definitely test.

**Q: Tests are slow, what to do?**
A: Run only affected tests during dev (`pnpm test -- src/lib/i18n/`), full suite before commit.

**Q: Can I skip tests?**
A: No. Tests ensure quality. If a test fails, fix the code or update the test based on new findings.

**Q: Should I mock next-intl?**
A: Yes, for unit tests. Integration tests can use real next-intl behavior (if available).

**Q: How do I test async code in middleware?**
A: Middleware is async. Use `async/await` in tests: `it('should...', async () => { })`

**Q: What about E2E tests?**
A: Phase 3 handles E2E tests with Playwright. Phase 2 focuses on unit + integration.
