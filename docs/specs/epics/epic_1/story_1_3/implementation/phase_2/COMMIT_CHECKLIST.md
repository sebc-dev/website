# Phase 2 - Checklist per Commit

This document provides a detailed checklist for each atomic commit of Phase 2.

---

## 📋 Commit 1: Implement cookie utility functions

**Files**: `src/lib/i18n/cookie.ts`, `src/lib/i18n/cookie.test.ts`
**Estimated Duration**: 75-105 minutes

### Implementation Tasks

- [ ] Create `src/lib/i18n/cookie.ts` file
- [ ] Define `CookieOptions` interface with fields:
  - `maxAge?: number` (defaults to 31536000 for 1 year)
  - `sameSite?: 'strict' | 'lax' | 'none'` (default: 'lax')
  - `secure?: boolean` (conditionally set based on environment)
  - `httpOnly?: boolean` (default: true)
  - `path?: string` (default: '/')
- [ ] Implement `getCookie(request: NextRequest, name: string): string | undefined`
  - Parse cookies from `request.cookies`
  - Return cookie value or undefined
- [ ] Implement `setCookie(name: string, value: string, options?: CookieOptions): string`
  - Create Set-Cookie header value
  - Apply all secure flags
  - Set maxAge to 31536000 (1 year)
  - Return header string
- [ ] Implement `deleteCookie(name: string): string`
  - Create Set-Cookie header with maxAge=0
  - Return header string
- [ ] Implement `validateLocale(value: string): boolean`
  - Check if value is in allowed locales: ['fr', 'en']
  - Return true/false
- [ ] Ensure Cloudflare Workers compatibility
  - No Node.js `crypto` module
  - Use only platform-standard APIs
- [ ] Create unit tests in `src/lib/i18n/cookie.test.ts`:
  - [ ] Test getCookie with valid cookie
  - [ ] Test getCookie with missing cookie
  - [ ] Test setCookie creates header with all flags
  - [ ] Test setCookie respects options
  - [ ] Test deleteCookie creates maxAge=0 header
  - [ ] Test validateLocale accepts 'fr', 'en'
  - [ ] Test validateLocale rejects invalid values
  - [ ] Test cookie secure flag only set in production (env-based)
  - [ ] Test sameSite flag is 'lax' by default

### Validation

```bash
# Type checking
pnpm tsc src/lib/i18n/cookie.ts

# Run tests
pnpm test src/lib/i18n/cookie.test.ts

# Check coverage
pnpm test:coverage -- src/lib/i18n/cookie.ts
```

**Expected Result**:

- All unit tests passing
- Coverage >80% for cookie.ts
- Zero TypeScript errors

### Review Checklist

#### Cookie Utilities

- [ ] `CookieOptions` interface is type-safe and complete
- [ ] `getCookie()` correctly parses request cookies
- [ ] `setCookie()` creates valid Set-Cookie header
- [ ] All secure flags present: HttpOnly, SameSite, Secure, maxAge
- [ ] Secure flag conditional (only production)
- [ ] maxAge correctly set to 31536000 (1 year)
- [ ] `deleteCookie()` correctly creates deletion header
- [ ] `validateLocale()` handles all allowed/invalid cases

#### Code Quality

- [ ] No `any` types
- [ ] Clear function names and parameters
- [ ] No commented code
- [ ] No debug statements
- [ ] Proper error handling for invalid inputs

#### Tests

- [ ] Unit tests cover happy path
- [ ] Unit tests cover edge cases
- [ ] Tests are independent (no test order dependencies)
- [ ] No skipped tests
- [ ] Coverage report shows >80%

### Commit Message

```bash
git add src/lib/i18n/cookie.ts src/lib/i18n/cookie.test.ts
git commit -m "$(cat <<'EOF'
✨ feat(i18n): implement cookie utility functions with secure flags

- Create src/lib/i18n/cookie.ts with type-safe cookie management
- Implement getCookie, setCookie, deleteCookie functions
- Support HttpOnly, SameSite=Lax, Secure flags with 1-year TTL
- Validate cookie values against allowed locales (fr, en)
- Ensure Cloudflare Workers compatibility
- Add comprehensive unit tests with >80% coverage

Part of Phase 2 - Commit 1/4
EOF
)"
```

---

## 📋 Commit 2: Implement root path redirection logic

**Files**: `src/middleware.ts`, `src/lib/i18n/redirect.ts`, `src/lib/i18n/redirect.test.ts`
**Estimated Duration**: 75-105 minutes

### Implementation Tasks

- [ ] Create `src/lib/i18n/redirect.ts` file
- [ ] Implement `handleRootPathRedirect(request: NextRequest, detectedLanguage: string): NextResponse | null`
  - Check if request path is exactly `/` or `/` with trailing slash variations
  - If not root path, return null
  - Use detectedLanguage to determine target: `/fr/` or `/en/`
  - Preserve query parameters from original request
  - Create NextResponse with 307 Temporary Redirect status
- [ ] Implement `isRootPath(pathname: string): boolean` helper
  - Return true for `/`, `/?query`, `//?query`, etc.
  - Return false for `/en/`, `/fr/`, `/api/`, etc.
- [ ] Export types for middleware integration
- [ ] Modify `src/middleware.ts` to call redirect handler
  - Call `handleRootPathRedirect()` early in middleware
  - If redirect returned, return the response immediately
  - Otherwise continue with normal flow
- [ ] Create unit tests in `src/lib/i18n/redirect.test.ts`:
  - [ ] Test root path `/` redirects to `/fr/` (default)
  - [ ] Test root path redirects to detected language
  - [ ] Test query parameters preserved during redirect
  - [ ] Test trailing slashes handled correctly
  - [ ] Test `/en/` path NOT redirected
  - [ ] Test `/api/` path NOT redirected
  - [ ] Test various query parameter scenarios
  - [ ] Test redirect status code is 307

### Validation

```bash
# Type checking
pnpm tsc src/middleware.ts src/lib/i18n/redirect.ts

# Run tests
pnpm test src/lib/i18n/redirect.test.ts

# Check coverage
pnpm test:coverage -- src/lib/i18n/redirect.ts
```

**Expected Result**:

- All unit tests passing
- Coverage >80% for redirect.ts
- Zero TypeScript errors
- Middleware builds successfully

### Review Checklist

#### Root Path Redirect Logic

- [ ] Correctly identifies root path (`/` and variations)
- [ ] Redirect status code is 307 (Temporary Redirect)
- [ ] Query parameters preserved in redirect location
- [ ] Non-root paths are NOT redirected
- [ ] Uses detected language from Phase 1
- [ ] No infinite redirect loops
- [ ] Handles edge cases (empty path, multiple slashes, etc.)

#### Integration with Middleware

- [ ] `handleRootPathRedirect()` called early in middleware
- [ ] Response returned immediately if redirect needed
- [ ] Doesn't interfere with normal request flow
- [ ] Type-safe integration

#### Code Quality

- [ ] No `any` types
- [ ] Clear helper function names
- [ ] Proper error handling
- [ ] No commented code

#### Tests

- [ ] Tests cover all redirect scenarios
- [ ] Tests cover all non-redirect scenarios
- [ ] Query parameter handling tested
- [ ] Edge cases covered
- [ ] Coverage >80%

### Commit Message

```bash
git add src/middleware.ts src/lib/i18n/redirect.ts src/lib/i18n/redirect.test.ts
git commit -m "$(cat <<'EOF'
✨ feat(i18n): implement root path redirection to language-prefixed routes

- Create src/lib/i18n/redirect.ts with handleRootPathRedirect function
- Redirect root path / to /fr/ or /en/ based on detected language
- Preserve query parameters during redirect
- Use 307 Temporary Redirect status code
- Handle edge cases: trailing slashes, empty paths, query strings
- Integrate with middleware early in request flow
- Add comprehensive unit tests with >80% coverage

Part of Phase 2 - Commit 2/4
EOF
)"
```

---

## 📋 Commit 3: Integrate next-intl middleware function

**Files**: `src/middleware.ts`, `i18n/config.ts`
**Estimated Duration**: 105-135 minutes

### Implementation Tasks

- [ ] Review next-intl middleware documentation (https://next-intl-docs.vercel.app/)
- [ ] Modify `src/middleware.ts`:
  - [ ] Import next-intl's `middleware` function: `import { middleware as intlMiddleware } from 'next-intl/server'`
  - [ ] Define middleware configuration:
    ```typescript
    const intlConfig = {
      locales: ['fr', 'en'],
      defaultLocale: 'fr',
      localePrefix: 'always' as const, // Always require /fr/ or /en/ prefix
    };
    ```
  - [ ] Wrap detection + redirect logic with next-intl middleware
  - [ ] Call `intlMiddleware(request, intlConfig)` after language detection
  - [ ] Extract detected language from request/cookie/header
  - [ ] Set `NEXT_LOCALE` cookie via middleware response
  - [ ] Ensure i18n context initialized via `middleware()` return value
  - [ ] Type `request` as `NextRequest` and return `NextResponse | undefined`
  - [ ] Add comments explaining:
    - next-intl integration point
    - Middleware execution order
    - Context initialization for components
- [ ] Update `i18n/config.ts`:
  - [ ] Verify `defaultLocale: 'fr'` set
  - [ ] Verify `locales: ['fr', 'en']` configured
  - [ ] Verify `localePrefix: 'always'` enables prefixed routes
  - [ ] Add routing mode configuration if applicable
- [ ] Verify middleware matcher in `next.config.ts` or inline matcher
  - [ ] Should match: `/`, `/(fr|en)/*`, `/api/*` (public), `/_next/*` (public)
  - [ ] Should exclude: static assets, `/_next/`, `/api/`
- [ ] Ensure cookie setting happens via middleware response headers
  - [ ] Use `response.cookies.set()` or Set-Cookie header
  - [ ] Apply all secure flags from Commit 1

### Validation

```bash
# Type checking
pnpm tsc

# Lint
pnpm lint

# Build (important - ensures middleware syntax correct)
pnpm build
```

**Expected Result**:

- Build succeeds without errors or warnings
- TypeScript errors: zero
- Lint errors: zero
- Components can import and use `useTranslations()` (will test in Commit 4)

### Review Checklist

#### next-intl Integration

- [ ] `middleware` function imported from 'next-intl/server'
- [ ] Configuration correct: locales, defaultLocale, localePrefix
- [ ] `localePrefix: 'always'` ensures `/fr/` and `/en/` prefixes
- [ ] `intlMiddleware()` called with correct config
- [ ] i18n context properly initialized
- [ ] Comments explain integration points

#### Cookie Management

- [ ] Cookie set via middleware response headers
- [ ] All secure flags applied (from Commit 1 functions)
- [ ] Cookie name: `NEXT_LOCALE`
- [ ] Cookie TTL: 1 year

#### Middleware Configuration

- [ ] Middleware matcher configured correctly
- [ ] Public routes excluded (static, API, \_next)
- [ ] Returns `NextResponse` with correct type
- [ ] Handles `NextRequest` parameter

#### Code Quality

- [ ] Clear variable names
- [ ] Explanatory comments
- [ ] No commented code
- [ ] Proper error handling

#### Build & Types

- [ ] `pnpm build` succeeds
- [ ] `pnpm tsc` reports zero errors
- [ ] Middleware syntax valid
- [ ] Type annotations correct

### Commit Message

```bash
git add src/middleware.ts i18n/config.ts
git commit -m "$(cat <<'EOF'
✨ feat(i18n): integrate next-intl middleware for i18n context initialization

- Import and configure next-intl middleware function
- Set localePrefix: 'always' to enforce /fr/ and /en/ prefixes
- Initialize i18n context for component access to useTranslations()
- Set NEXT_LOCALE cookie via middleware response headers
- Configure middleware matcher for public route exclusion
- Add explanatory comments for integration points
- Build succeeds without errors or type issues

Part of Phase 2 - Commit 3/4
EOF
)"
```

---

## 📋 Commit 4: Add unit + integration tests

**Files**: `src/lib/i18n/cookie.test.ts`, `src/lib/i18n/context.integration.test.ts`, `src/middleware.test.ts`
**Estimated Duration**: 90-135 minutes

### Implementation Tasks

#### Unit Tests - Cookies (Expand existing)

- [ ] Test `getCookie()` with valid Set-Cookie header
- [ ] Test `getCookie()` with missing header
- [ ] Test `setCookie()` creates header with:
  - [ ] Correct name and value
  - [ ] HttpOnly flag
  - [ ] SameSite=Lax flag
  - [ ] Secure flag (production only)
  - [ ] maxAge=31536000
- [ ] Test `deleteCookie()` creates maxAge=0 header
- [ ] Test `validateLocale()` accepts 'fr', 'en'
- [ ] Test `validateLocale()` rejects invalid values
- [ ] Test cookie secure flag behavior (dev vs. production)

#### Unit Tests - Redirect

- [ ] Test root path `/` identifies correctly
- [ ] Test redirect to `/fr/` for default
- [ ] Test redirect to detected language (`/en/`)
- [ ] Test query parameters preserved
- [ ] Test non-root paths NOT redirected
- [ ] Test trailing slash variations
- [ ] Test 307 status code

#### Integration Tests - Context (New file)

- [ ] Create `src/lib/i18n/context.integration.test.ts`
- [ ] Test flow: Middleware → Cookie set → Context initialized
- [ ] Mock next-intl's `middleware()` function
- [ ] Mock `NextRequest` with language header
- [ ] Verify context available after middleware
- [ ] Test `useTranslations()` accessible (mock test)
- [ ] Test cookie persists in response headers
- [ ] Test flow with different detected languages

#### Middleware Tests (New file)

- [ ] Create `src/middleware.test.ts`
- [ ] Test middleware initialization
- [ ] Test integration of detection + redirect + next-intl
- [ ] Mock `NextRequest` with various scenarios:
  - [ ] Root path request (should redirect)
  - [ ] Language path request (should not redirect)
  - [ ] Request with Accept-Language header
  - [ ] Request with NEXT_LOCALE cookie
- [ ] Test response headers include Set-Cookie
- [ ] Test no infinite redirect loops
- [ ] Test public routes excluded
- [ ] Test middleware execution order

### Coverage and Reporting

- [ ] Run full test suite: `pnpm test`
- [ ] Generate coverage report: `pnpm test:coverage`
- [ ] Verify coverage >80% for:
  - `src/lib/i18n/cookie.ts`
  - `src/lib/i18n/redirect.ts`
  - `src/middleware.ts`
- [ ] Document coverage results

### Validation

```bash
# Unit tests
pnpm test src/lib/i18n/cookie.test.ts
pnpm test src/lib/i18n/redirect.test.ts

# Integration tests
pnpm test src/lib/i18n/context.integration.test.ts
pnpm test src/middleware.test.ts

# Coverage
pnpm test:coverage

# Type checking
pnpm tsc

# Lint
pnpm lint

# Full build
pnpm build
```

**Expected Result**:

- All unit tests passing
- All integration tests passing
- Coverage >80% for Phase 2 code
- Zero TypeScript errors
- Zero lint errors
- Build succeeds

### Review Checklist

#### Unit Tests

- [ ] Tests are independent (no order dependencies)
- [ ] Tests cover happy path
- [ ] Tests cover edge cases
- [ ] Tests cover error scenarios
- [ ] No skipped tests
- [ ] Test names are clear and descriptive

#### Integration Tests

- [ ] Mock usage appropriate (next-intl mocked, utilities used)
- [ ] Tests verify middleware → cookie → context flow
- [ ] Tests check response headers correctly set
- [ ] Tests verify no infinite redirects
- [ ] Flow tested with multiple language scenarios

#### Middleware Tests

- [ ] Test various request scenarios
- [ ] Test detection logic works with middleware
- [ ] Test redirect logic integrated
- [ ] Test public route exclusion
- [ ] Test cookie management in response

#### Code Quality

- [ ] No skipped tests (`.skip`, `.only`)
- [ ] No console.log in test code
- [ ] Clear test descriptions
- [ ] Proper assertions
- [ ] No duplicate tests

#### Coverage

- [ ] Coverage >80% for all Phase 2 files
- [ ] Coverage report generated
- [ ] No significant gaps in coverage
- [ ] Lines/branches/functions all covered

### Commit Message

```bash
git add src/lib/i18n/context.integration.test.ts src/middleware.test.ts
git commit -m "$(cat <<'EOF'
🧪 test(i18n): add comprehensive unit and integration tests for Phase 2

- Add unit tests for cookie utilities (create, read, validate, delete)
- Expand redirect tests (root path, query params, status codes)
- Create integration tests: middleware → cookie → context flow
- Create middleware tests with mocked dependencies
- Test Phase 2 scenarios: detection, redirect, context initialization
- Verify cookie persistence and secure flags
- Achieve >80% code coverage for Phase 2 implementation
- All tests passing, zero flaky tests

Part of Phase 2 - Commit 4/4
EOF
)"
```

---

## ✅ Final Phase 2 Validation

After all 4 commits:

### Complete Phase Checklist

- [ ] All 4 commits completed
- [ ] All unit tests passing (`pnpm test`)
- [ ] All integration tests passing (`pnpm test`)
- [ ] Coverage >80%
- [ ] `pnpm tsc` reports zero errors
- [ ] `pnpm lint` reports zero errors
- [ ] `pnpm build` succeeds
- [ ] Documentation complete (INDEX.md, guides complete)

### Acceptance Criteria Verification

- [ ] AC5: Root path (`/`) redirects to `/fr/` or `/en/` ✅
- [ ] AC6: next-intl context initialized, `useTranslations()` available ✅
- [ ] AC9: Cookie set with HttpOnly, SameSite, Secure flags ✅
- [ ] Cookie persists across sessions (TTL: 1 year) ✅

### Phase 2 Success Metrics

| Metric              | Target | Actual |
| ------------------- | ------ | ------ |
| Commits             | 4      | -      |
| Implementation time | 6-8h   | -      |
| Code coverage       | >80%   | -      |
| TypeScript errors   | 0      | -      |
| Lint errors         | 0      | -      |
| Build successful    | Yes    | -      |

**Phase 2 is complete when all checkboxes are checked! 🎉**
