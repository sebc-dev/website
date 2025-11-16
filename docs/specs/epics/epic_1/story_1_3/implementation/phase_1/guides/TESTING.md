# Phase 1 — Testing Guide

Complete testing strategy for Phase 1 implementation.

---

## 🎯 Testing Strategy

Phase 1 uses **unit tests** to validate language detection logic. The testing approach is:

1. **Unit tests** (Commit 5): Test individual functions in isolation
2. **Pure function testing**: All detection functions are pure (no side effects)
3. **Coverage target**: ≥80% code coverage (aim for 85%+)
4. **Test framework**: Vitest (project standard for unit tests)
5. **No integration tests** in Phase 1 (Phase 2 adds cookie persistence, Phase 3 adds E2E)

---

## 🧪 Unit Tests Overview

### Test File Structure

```
src/
├── middleware.ts           (implementation)
├── middleware.test.ts      (unit tests)
└── lib/i18n/
    └── detection.test.ts   (optional: helper function tests)
```

### Test Organization

Organize tests by function tested:

```typescript
// src/middleware.test.ts

describe('URL Detection', () => {
  it('should detect language from /fr/ prefix', () => { ... });
  it('should detect language from /en/ prefix', () => { ... });
  // ... more tests
});

describe('Cookie Detection', () => {
  it('should read valid NEXT_LOCALE cookie', () => { ... });
  it('should return undefined for missing cookie', () => { ... });
  // ... more tests
});

describe('Header Parsing', () => {
  it('should parse simple Accept-Language header', () => { ... });
  it('should respect quality values', () => { ... });
  // ... more tests
});

describe('Detection Hierarchy', () => {
  it('should prioritize URL over cookie', () => { ... });
  it('should fall back to default locale', () => { ... });
  // ... more tests
});

describe('Redirect Logic', () => {
  it('should redirect unsupported language', () => { ... });
  it('should preserve query parameters during redirect', () => { ... });
  // ... more tests
});
```

---

## 🧪 Running Unit Tests

### Run All Tests

```bash
# Run all unit tests
pnpm test

# Expected output:
# ✓ src/middleware.test.ts (37 tests)
# ✓ Total: 37 tests passed
```

### Run Specific Test File

```bash
# Run only middleware tests
pnpm test middleware.test.ts

# Run only detection tests
pnpm test detection.test.ts
```

### Run Tests in Watch Mode

During development, use watch mode for rapid feedback:

```bash
# Run tests in watch mode (re-runs on file changes)
pnpm test:watch

# Or with UI
pnpm test:ui
```

### Run Tests Matching Pattern

```bash
# Run only URL detection tests
pnpm test --grep "URL Detection"

# Run only tests with "locale" in name
pnpm test --grep "locale"
```

### Generate Coverage Report

```bash
# Generate coverage report
pnpm test:coverage

# Expected output shows:
# - Statements: XX%
# - Branches: XX%
# - Functions: XX%
# - Lines: XX%
```

---

## 📋 Test Cases to Implement

### 1. URL Detection Tests

**Function**: `detectLocaleFromURL(pathname: string): Locale | undefined`

```typescript
describe('URL Detection', () => {
  // Valid URL patterns
  it('should detect language from /fr/ prefix', () => {
    expect(detectLocaleFromURL('/fr/')).toBe('fr');
    expect(detectLocaleFromURL('/fr/articles')).toBe('fr');
  });

  it('should detect language from /en/ prefix', () => {
    expect(detectLocaleFromURL('/en/')).toBe('en');
    expect(detectLocaleFromURL('/en/search')).toBe('en');
  });

  // Invalid URL patterns
  it('should return undefined for unsupported language', () => {
    expect(detectLocaleFromURL('/de/')).toBeUndefined();
    expect(detectLocaleFromURL('/de/articles')).toBeUndefined();
  });

  it('should return undefined for root path', () => {
    expect(detectLocaleFromURL('/')).toBeUndefined();
  });

  it('should return undefined for path without language prefix', () => {
    expect(detectLocaleFromURL('/articles')).toBeUndefined();
    expect(detectLocaleFromURL('/search')).toBeUndefined();
  });

  // Edge cases
  it('should handle nested paths correctly', () => {
    expect(detectLocaleFromURL('/fr/articles/slug')).toBe('fr');
    expect(detectLocaleFromURL('/en/blog/post-123')).toBe('en');
  });

  it('should handle trailing slashes', () => {
    expect(detectLocaleFromURL('/fr')).toBe('fr'); // or undefined depending on spec
    expect(detectLocaleFromURL('/fr/')).toBe('fr');
  });

  it('should be case-sensitive', () => {
    // Document expected behavior
    expect(detectLocaleFromURL('/FR/')).toBeUndefined(); // FR ≠ fr
  });

  // Coverage: All URL parsing branches tested
});
```

**Expected Coverage**: 100% of URL detection code

### 2. Cookie Detection Tests

**Function**: `getLocaleFromCookie(cookieValue?: string): Locale | undefined`

```typescript
describe('Cookie Detection', () => {
  // Valid cookies
  it('should detect language from NEXT_LOCALE=fr cookie', () => {
    expect(getLocaleFromCookie('fr')).toBe('fr');
  });

  it('should detect language from NEXT_LOCALE=en cookie', () => {
    expect(getLocaleFromCookie('en')).toBe('en');
  });

  // Invalid cookies
  it('should return undefined for unsupported locale', () => {
    expect(getLocaleFromCookie('de')).toBeUndefined();
    expect(getLocaleFromCookie('it')).toBeUndefined();
  });

  it('should return undefined for missing cookie', () => {
    expect(getLocaleFromCookie(undefined)).toBeUndefined();
  });

  it('should return undefined for empty cookie', () => {
    expect(getLocaleFromCookie('')).toBeUndefined();
  });

  it('should handle malformed cookie values', () => {
    expect(getLocaleFromCookie('fr-FR')).toBeUndefined(); // or match 'fr'?
    expect(getLocaleFromCookie('en_US')).toBeUndefined();
  });

  // Coverage: All cookie validation branches tested
});
```

**Expected Coverage**: 100% of cookie detection code

### 3. Accept-Language Header Parsing Tests

**Functions**: `parseAcceptLanguage(header: string): string[]`, `getLocaleFromHeader(headerValue: string): Locale | undefined`

```typescript
describe('Header Parsing', () => {
  // Simple formats
  it('should parse single language header', () => {
    const result = parseAcceptLanguage('fr');
    expect(result).toContain('fr');
  });

  it('should parse multiple languages', () => {
    const result = parseAcceptLanguage('fr,en');
    expect(result[0]).toBe('fr'); // fr has higher default q
  });

  // Quality values
  it('should respect quality values', () => {
    const result = parseAcceptLanguage('fr,en;q=0.9');
    expect(result[0]).toBe('fr'); // q=1.0 (default)
    expect(result[1]).toBe('en'); // q=0.9
  });

  it('should reorder by quality value', () => {
    const result = parseAcceptLanguage('en;q=0.8,fr;q=0.9');
    expect(result[0]).toBe('fr'); // q=0.9 (higher)
    expect(result[1]).toBe('en'); // q=0.8 (lower)
  });

  // Language variants
  it('should handle language variants', () => {
    const result = parseAcceptLanguage('fr-FR,en-US');
    expect(result).toContain('fr');
    expect(result).toContain('en');
  });

  it('should match variants to base language', () => {
    const locale = getLocaleFromHeader('en-US,fr-FR');
    // Should match 'en' (from en-US) as supported locale
  });

  // Complex scenarios
  it('should parse complex header with multiple languages and quality values', () => {
    const result = parseAcceptLanguage('fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7');
    expect(result[0]).toBe('fr');
    expect(result[1]).toBe('en');
    // ... verify order
  });

  // Edge cases
  it('should handle empty header', () => {
    const result = parseAcceptLanguage('');
    expect(result).toEqual([]);
  });

  it('should handle malformed quality value', () => {
    const result = parseAcceptLanguage('fr;q=invalid');
    // Handle gracefully (skip or default)
  });

  it('should handle missing quality value', () => {
    const result = parseAcceptLanguage('fr,en');
    expect(result[0]).toBe('fr'); // Defaults to q=1.0
  });

  it('should ignore unsupported languages in header', () => {
    const result = parseAcceptLanguage('de,fr,it');
    expect(result).toContain('fr'); // Supported
    expect(result).not.toContain('de'); // Unsupported
    expect(result).not.toContain('it'); // Unsupported
  });

  // Coverage: All header parsing branches tested
});
```

**Expected Coverage**: 100% of header parsing code

### 4. Detection Hierarchy Tests

**Function**: `detectLocale(request: NextRequest): Locale`

```typescript
describe('Detection Hierarchy', () => {
  // URL takes priority
  it('should prioritize URL over cookie', () => {
    const request = createMockRequest({
      pathname: '/fr/articles',
      cookies: { NEXT_LOCALE: 'en' },
    });
    expect(detectLocale(request)).toBe('fr');
  });

  it('should prioritize URL over header', () => {
    const request = createMockRequest({
      pathname: '/en/search',
      headers: { 'Accept-Language': 'fr' },
    });
    expect(detectLocale(request)).toBe('en');
  });

  // Cookie takes priority over header
  it('should prioritize cookie over header', () => {
    const request = createMockRequest({
      pathname: '/',
      cookies: { NEXT_LOCALE: 'en' },
      headers: { 'Accept-Language': 'fr' },
    });
    expect(detectLocale(request)).toBe('en');
  });

  // Header takes priority over default
  it('should use header if no URL or cookie', () => {
    const request = createMockRequest({
      pathname: '/articles',
      headers: { 'Accept-Language': 'en' },
    });
    expect(detectLocale(request)).toBe('en');
  });

  // Default fallback
  it('should fall back to default locale (French)', () => {
    const request = createMockRequest({
      pathname: '/',
      // No cookie, no header
    });
    expect(detectLocale(request)).toBe('fr');
  });

  it('should fall back to default if no supported language in header', () => {
    const request = createMockRequest({
      pathname: '/',
      headers: { 'Accept-Language': 'de,it,es' }, // All unsupported
    });
    expect(detectLocale(request)).toBe('fr');
  });

  // Complex scenarios
  it('should handle complex scenario: invalid URL, valid cookie, valid header', () => {
    const request = createMockRequest({
      pathname: '/de/articles', // Invalid language
      cookies: { NEXT_LOCALE: 'en' }, // Valid
      headers: { 'Accept-Language': 'fr' }, // Valid
    });
    // URL is invalid, so check cookie
    expect(detectLocale(request)).toBe('en');
  });

  // Coverage: All priority branches tested
});
```

**Expected Coverage**: 100% of detection hierarchy code

### 5. Redirect Logic Tests

**Function**: Middleware redirect behavior

```typescript
describe('Redirect Logic', () => {
  // No redirect cases
  it('should not redirect if URL already has correct language', () => {
    const request = createMockRequest({
      pathname: '/fr/articles',
    });
    const response = middleware(request);
    expect(response.status).not.toBe(307); // Not a redirect
  });

  it('should not redirect if language is correct based on cookie', () => {
    const request = createMockRequest({
      pathname: '/articles',
      cookies: { NEXT_LOCALE: 'fr' },
    });
    const response = middleware(request);
    expect(response.status).not.toBe(307);
  });

  // Redirect cases
  it('should redirect unsupported language to default', () => {
    const request = createMockRequest({
      pathname: '/de/articles',
    });
    const response = middleware(request);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('/fr/articles');
  });

  it('should preserve path during redirect', () => {
    const request = createMockRequest({
      pathname: '/de/articles/my-post',
    });
    const response = middleware(request);
    expect(response.headers.get('location')).toBe('/fr/articles/my-post');
  });

  it('should preserve query parameters during redirect', () => {
    const request = createMockRequest({
      pathname: '/de/articles',
      search: '?page=2&sort=date',
    });
    const response = middleware(request);
    expect(response.headers.get('location')).toBe(
      '/fr/articles?page=2&sort=date',
    );
  });

  it('should redirect with both path and query parameters', () => {
    const request = createMockRequest({
      pathname: '/de/search',
      search: '?q=test&lang=en',
    });
    const response = middleware(request);
    expect(response.headers.get('location')).toContain('/fr/search');
    expect(response.headers.get('location')).toContain('q=test');
  });

  // HTTP status code
  it('should use HTTP 307 for redirects', () => {
    const request = createMockRequest({
      pathname: '/de/articles',
    });
    const response = middleware(request);
    expect(response.status).toBe(307);
  });

  // Coverage: All redirect code branches tested
});
```

**Expected Coverage**: 100% of redirect logic code

### 6. Public Route Exclusion Tests

**Function**: Public route matcher logic

```typescript
describe('Public Route Exclusion', () => {
  it('should skip middleware for Next.js internals /_next/*', () => {
    const request = createMockRequest({
      pathname: '/_next/static/chunks/main.js',
    });
    const response = middleware(request);
    expect(response).toEqual(NextResponse.next()); // No processing
  });

  it('should skip middleware for API routes /api/*', () => {
    const request = createMockRequest({
      pathname: '/api/articles',
    });
    const response = middleware(request);
    expect(response).toEqual(NextResponse.next());
  });

  it('should skip middleware for public files /public/*', () => {
    const request = createMockRequest({
      pathname: '/public/logo.png',
    });
    const response = middleware(request);
    expect(response).toEqual(NextResponse.next());
  });

  it('should skip middleware for image files /images/*', () => {
    const request = createMockRequest({
      pathname: '/images/header.jpg',
    });
    const response = middleware(request);
    expect(response).toEqual(NextResponse.next());
  });

  it('should process regular routes', () => {
    const request = createMockRequest({
      pathname: '/articles',
    });
    const response = middleware(request);
    // Should not be NextResponse.next() - should process
    expect(response).not.toEqual(NextResponse.next());
  });

  // Coverage: All route matcher branches tested
});
```

**Expected Coverage**: 100% of route matching code

---

## 🧪 Test Utilities and Mocks

### Mock Factory for Requests

Create helper function to generate mock NextRequest objects:

```typescript
// Helper function
function createMockRequest(options: {
  pathname: string;
  search?: string;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
}): NextRequest {
  const url = new URL(
    `http://localhost:3000${options.pathname}${options.search || ''}`,
  );

  const request = {
    nextUrl: { pathname: options.pathname },
    cookies: {
      get: (name: string) => options.cookies?.[name],
    },
    headers: {
      get: (name: string) => options.headers?.[name],
    },
  } as unknown as NextRequest;

  return request;
}
```

### Mock next-intl Module

```typescript
// Mock next-intl
vi.mock('next-intl/server', () => ({
  getRequestConfig: vi.fn(() => ({
    locale: 'fr',
    messages: {},
  })),
}));
```

---

## 📊 Coverage Report

### Generate Coverage

```bash
# Generate coverage report
pnpm test:coverage

# Expected output:
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  File             | Statements | Branches | Functions | Lines
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  middleware.ts    |    85%     |   85%    |    85%    |  85%
#  detection.ts     |    90%     |   90%    |    90%    |  90%
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  Total            |    87%     |   87%    |    87%    |  87%
```

### Coverage Goals

| Module           | Target   | Justification                                          |
| ---------------- | -------- | ------------------------------------------------------ |
| URL Detection    | 100%     | Core logic, no reason to leave untested                |
| Cookie Detection | 100%     | Small, critical function                               |
| Header Parsing   | 100%     | Complex, edge cases important                          |
| Redirect Logic   | 100%     | Critical for user experience                           |
| **Overall**      | **≥80%** | Industry standard, achievable with comprehensive tests |

### Coverage Improvement

If coverage is below 80%:

1. Run coverage report to identify untested lines
2. Write tests for missing branches
3. Re-run coverage until ≥80%

```bash
# Identify untested code
pnpm test:coverage

# Review coverage report (usually in coverage/index.html)
open coverage/index.html

# Write tests for red (uncovered) lines
# Re-run coverage
pnpm test:coverage
```

---

## 🔍 Debugging Tests

### Run Single Test

```bash
# Run single test using .only
it.only('should detect language from /fr/ prefix', () => {
  expect(detectLocaleFromURL('/fr/')).toBe('fr');
});

# Run: pnpm test
```

### Verbose Output

```bash
# Run tests with detailed output
pnpm test --reporter=verbose
```

### Debug Mode

```bash
# Run tests with Node debugger
node --inspect-brk ./node_modules/vitest/vitest.mjs

# Or use IDE debugger integration
```

---

## ✅ Testing Checklist

Before completing Commit 5:

- [ ] All 37+ test cases written
- [ ] URL detection: 8+ tests
- [ ] Cookie detection: 6+ tests
- [ ] Header parsing: 8+ tests
- [ ] Detection hierarchy: 6+ tests
- [ ] Redirect logic: 6+ tests
- [ ] Public route exclusion: 3+ tests
- [ ] All tests pass: `pnpm test` succeeds
- [ ] Coverage ≥80%: `pnpm test:coverage` shows ≥80%
- [ ] No TypeScript errors in test code
- [ ] Test names are descriptive
- [ ] Edge cases are covered
- [ ] No flaky tests
- [ ] Mocks are clearly documented

---

## 📚 Reference Documents

- **Vitest Documentation**: https://vitest.dev/
- **Testing Library**: https://testing-library.com/
- **Jest/Vitest Matchers**: https://vitest.dev/api/expect.html
- **Project Testing Setup**: CLAUDE.md (testing section)

---

**Phase 1 — Testing Guide Complete** ✅
