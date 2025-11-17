# Phase 2 - Code Review Guide

Complete guide for reviewing the Phase 2 implementation (Cookie Persistence & i18n Context).

---

## 🎯 Review Objective

Validate that the implementation:

- ✅ Creates secure, type-safe cookie utilities
- ✅ Implements root path redirection correctly
- ✅ Integrates next-intl middleware for i18n context
- ✅ Sets cookies with proper secure flags
- ✅ Follows project standards and best practices
- ✅ Is well-tested (unit + integration)
- ✅ Is documented and maintainable

---

## 📋 Review Approach

Phase 2 is split into **4 atomic commits**. You can:

**Option A: Commit-by-commit review** (recommended)

- Easier to digest (30-60 min per commit)
- Progressive validation
- Targeted feedback
- Better isolation of issues

**Option B: Global review at once**

- Faster (3-4h total)
- Immediate overview
- Requires more focus
- Risk of missing context

**Estimated Total Time**: 3-4 hours (commit-by-commit) or 2-3 hours (global)

---

## 🔍 Commit-by-Commit Review

### Commit 1: Implement cookie utility functions

**Files**: `src/lib/i18n/cookie.ts`, `src/lib/i18n/cookie.test.ts` (~250 lines)
**Duration**: 30-45 minutes

#### Review Checklist

##### Cookie Utilities

- [ ] `CookieOptions` interface has all needed fields:
  - `maxAge?: number`
  - `sameSite?: 'strict' | 'lax' | 'none'`
  - `secure?: boolean`
  - `httpOnly?: boolean`
  - `path?: string`
- [ ] `getCookie(request, name)` correctly extracts from request.cookies
- [ ] `setCookie(name, value, options)` creates valid Set-Cookie header
- [ ] All secure flags present in Set-Cookie:
  - HttpOnly flag (prevents JS access)
  - SameSite=Lax (CSRF protection)
  - Secure flag (HTTPS only in production)
  - maxAge=31536000 (1 year)
  - path=/ (site-wide access)
- [ ] `deleteCookie(name)` correctly creates header with maxAge=0
- [ ] `validateLocale(value)` checks against allowed locales ['fr', 'en']
- [ ] Cloudflare Workers compatible:
  - No Node.js `crypto` or `fs` imports
  - Uses only platform-standard APIs
  - No blocking I/O

##### Type Safety

- [ ] No `any` types
- [ ] Type exports (if applicable): `CookieOptions` properly exported
- [ ] Function signatures clear and well-typed
- [ ] Locale validation typed (string → boolean)

##### Code Quality

- [ ] Clear function names: `getCookie`, `setCookie`, `deleteCookie`
- [ ] Parameter names descriptive
- [ ] No commented-out code
- [ ] No debug statements (console.log)
- [ ] Proper error handling for invalid inputs
- [ ] Comments explain security decisions (e.g., why secure flag conditional)

##### Tests

- [ ] Tests independent (no test order dependencies)
- [ ] Tests cover happy path:
  - [ ] getCookie with valid cookie returns value
  - [ ] setCookie creates header with all flags
  - [ ] deleteCookie creates maxAge=0
  - [ ] validateLocale accepts 'fr', 'en'
- [ ] Tests cover edge cases:
  - [ ] getCookie with missing cookie returns undefined
  - [ ] validateLocale rejects invalid values
  - [ ] Secure flag conditional (dev vs. production)
  - [ ] Cookie TTL correctly set
- [ ] No skipped tests (no `.skip()`)
- [ ] Test names are clear: `test('should get cookie value from request')`
- [ ] Coverage >80% for cookie.ts

#### Questions to Ask

1. Are the secure flags appropriate for both development and production?
2. Does the TTL (1 year) align with product requirements?
3. Is error handling sufficient for malformed cookies?
4. Are there any edge cases with cookie encoding?

---

### Commit 2: Implement root path redirection logic

**Files**: `src/middleware.ts`, `src/lib/i18n/redirect.ts`, `src/lib/i18n/redirect.test.ts` (~260 lines)
**Duration**: 30-45 minutes

#### Review Checklist

##### Root Path Redirect Logic

- [ ] `handleRootPathRedirect()` correctly identifies root path:
  - `/` redirects
  - `/?query` redirects
  - `/en/` does NOT redirect
  - `/fr/` does NOT redirect
  - `/api/` does NOT redirect
- [ ] Redirect status code is **307 Temporary Redirect**
  - Not 301 (Permanent - would be cached)
  - Not 302 (Found - different semantics)
  - 307 is correct for temporary language redirect
- [ ] Query parameters preserved:
  - `/?lang=en` → `/fr/?lang=en` (not `/fr/` alone)
  - Test with various query scenarios
- [ ] Uses detected language from Phase 1 correctly
- [ ] No infinite redirect loops:
  - Redirect only happens for root path `/`
  - After redirect to `/fr/` or `/en/`, middleware doesn't redirect again
  - Test: Direct request to `/fr/` should NOT redirect to `/fr/` again
- [ ] Middleware integration:
  - `handleRootPathRedirect()` called early
  - If redirect returned, response sent immediately
  - Normal flow continues if no redirect

##### Type Safety

- [ ] `NextRequest` properly typed
- [ ] `NextResponse | null` return type correct
- [ ] No `any` types
- [ ] Locale type validated

##### Code Quality

- [ ] `isRootPath()` helper function extracted (DRY)
- [ ] Variable names descriptive: `pathname`, `targetLocale`, `redirectUrl`
- [ ] No commented code
- [ ] No debug statements
- [ ] Comments explain redirect strategy

##### Tests

- [ ] Tests cover all redirect scenarios:
  - [ ] Root path `/` redirects to `/fr/` (default)
  - [ ] Root path with detected language redirects correctly
  - [ ] Root path with query params preserves them
  - [ ] Root path with trailing slash handled
- [ ] Tests cover non-redirect scenarios:
  - [ ] `/en/` NOT redirected
  - [ ] `/fr/` NOT redirected
  - [ ] `/api/` NOT redirected
- [ ] Status code tests:
  - [ ] Redirect response has 307 status
  - [ ] Non-redirect response has 200 status
- [ ] Query parameter tests:
  - [ ] `/?foo=bar` → `/fr/?foo=bar`
  - [ ] Multiple params preserved
- [ ] Coverage >80%

#### Questions to Ask

1. Is 307 the right status code? (Should verify HTTP semantics)
2. Are there any edge cases with special characters in query strings?
3. How does this interact with caching middleware (if any)?
4. Should root path redirect be conditional based on environment?

---

### Commit 3: Integrate next-intl middleware function

**Files**: `src/middleware.ts`, `i18n/config.ts` (~120 lines)
**Duration**: 45-60 minutes

#### Review Checklist

##### next-intl Integration

- [ ] `middleware` function imported from 'next-intl/server'
- [ ] Middleware configuration correct:
  - [ ] `locales: ['fr', 'en']` matches supported languages
  - [ ] `defaultLocale: 'fr'` matches env variable
  - [ ] `localePrefix: 'always'` ensures `/fr/` and `/en/` prefixes
- [ ] `intlMiddleware(request, config)` called with correct parameters
- [ ] Return value properly typed as `NextResponse | NextResponse<unknown>`
- [ ] i18n context properly initialized:
  - [ ] Components can import `useTranslations`
  - [ ] `useTranslations()` returns correct namespace translations
  - [ ] Server components can use `getTranslations()`

##### Cookie Management

- [ ] Cookie set via middleware response:
  - [ ] Cookie name: `NEXT_LOCALE`
  - [ ] Cookie value: detected language ('fr' or 'en')
  - [ ] All secure flags applied (from Commit 1)
  - [ ] Cookie appears in response headers
- [ ] Cookie uses secure flags from Commit 1 functions
- [ ] TTL: 1 year (31536000 seconds)

##### Middleware Configuration

- [ ] Middleware matcher configured correctly
  - [ ] Includes root path: `/`
  - [ ] Includes locale paths: `/(fr|en)/*`
  - [ ] Excludes static files: `/_next/*`, `/api/*`
  - [ ] Excludes other public routes as needed
- [ ] Returns correct type: `NextResponse | undefined`
- [ ] Handles `NextRequest` parameter
- [ ] No infinite loops (detection + redirect + next-intl)

##### Code Quality

- [ ] Clear variable names for configuration
- [ ] Comments explain:
  - next-intl integration purpose
  - Why `localePrefix: 'always'`
  - How context is initialized
  - Middleware execution order
- [ ] No commented code
- [ ] Proper error handling (if applicable)
- [ ] Configuration matches `i18n/config.ts`

##### Build & Types

- [ ] `pnpm build` succeeds (no build errors)
- [ ] `pnpm tsc` reports zero errors
- [ ] Middleware syntax valid
- [ ] Type annotations correct for Next.js version
- [ ] No TypeScript warnings

#### Questions to Ask

1. How does next-intl initialize context? (Review docs if unclear)
2. Is the `localePrefix: 'always'` choice correct? (Vs. 'as-needed')
3. What happens to requests without a locale prefix?
4. Are there any next-intl version-specific behaviors to consider?

---

### Commit 4: Add unit + integration tests

**Files**: `src/lib/i18n/context.integration.test.ts`, `src/middleware.test.ts` (~380 lines)
**Duration**: 30-45 minutes

#### Review Checklist

##### Unit Tests - Cookies

- [ ] Tests cover cookie creation with all flags
- [ ] Tests cover cookie reading with valid/invalid input
- [ ] Tests cover cookie deletion
- [ ] Tests cover locale validation
- [ ] Tests cover Cloudflare Workers compatibility
- [ ] No skipped tests

##### Unit Tests - Redirect

- [ ] Tests cover root path detection
- [ ] Tests cover redirect to language path
- [ ] Tests cover query parameter preservation
- [ ] Tests cover non-redirect cases
- [ ] Tests cover status codes (307)
- [ ] No skipped tests

##### Integration Tests

- [ ] Tests verify flow: Request → Detection → Redirect → Cookie → Context
- [ ] Tests mock next-intl appropriately:
  - [ ] Mock next-intl's `middleware` function
  - [ ] Don't mock utilities being tested (cookie, redirect)
- [ ] Tests with various request scenarios:
  - [ ] Request with language path `/fr/`
  - [ ] Request with root path `/`
  - [ ] Request with Accept-Language header
  - [ ] Request with NEXT_LOCALE cookie
- [ ] Tests verify:
  - [ ] Response headers include Set-Cookie
  - [ ] Context available after middleware
  - [ ] No infinite redirects
  - [ ] Cookie persists

##### Middleware Tests

- [ ] Test middleware initialization
- [ ] Test integration of all three features:
  - Detection (from Phase 1)
  - Redirect (Commit 2)
  - next-intl integration (Commit 3)
- [ ] Mock `NextRequest` with realistic scenarios
- [ ] Verify response headers correct
- [ ] Test edge cases:
  - [ ] Missing language header
  - [ ] Invalid language value
  - [ ] Various Accept-Language formats

##### Code Quality

- [ ] Test names are clear and descriptive
- [ ] Tests are independent (no order dependencies)
- [ ] No skipped tests (`.skip`, `.only`)
- [ ] No console.log in test code
- [ ] Mock usage appropriate
- [ ] No duplicate tests

##### Coverage

- [ ] Coverage report generated: `pnpm test:coverage`
- [ ] Coverage >80% for:
  - [ ] `src/lib/i18n/cookie.ts`
  - [ ] `src/lib/i18n/redirect.ts`
  - [ ] `src/middleware.ts`
- [ ] Coverage report shows:
  - [ ] Lines covered
  - [ ] Branches covered
  - [ ] Functions covered
  - [ ] No large gaps

#### Questions to Ask

1. Are all realistic request scenarios tested?
2. Are there any flaky tests (timing-dependent)?
3. Is coverage adequate for the critical paths?
4. Should E2E tests supplement these unit tests? (Answer: Phase 3)

---

## ✅ Global Validation (After All Commits)

After reviewing all commits:

### Architecture & Design

- [ ] Design follows Phase 1 (detection) cleanly
- [ ] Separation of concerns:
  - Cookies in `src/lib/i18n/cookie.ts`
  - Redirect in `src/lib/i18n/redirect.ts`
  - Middleware in `src/middleware.ts`
- [ ] No tight coupling between modules
- [ ] Reusable functions (not tied to middleware)
- [ ] next-intl integration doesn't violate design

### Code Quality

- [ ] Consistent style throughout
- [ ] Clear naming conventions
- [ ] Appropriate comments (especially for next-intl integration)
- [ ] No code duplication
- [ ] DRY principle followed (e.g., `isRootPath()` helper)

### Testing

- [ ] Unit tests cover all functions
- [ ] Integration tests verify module interaction
- [ ] Edge cases tested
- [ ] Coverage >80% overall
- [ ] No flaky tests
- [ ] Tests are maintainable

### Type Safety

- [ ] No `any` types
- [ ] Proper type inference
- [ ] next-intl types used correctly
- [ ] NextRequest/NextResponse types correct
- [ ] `pnpm tsc` passes with zero errors

### Performance

- [ ] No obvious bottlenecks
- [ ] Cookie parsing efficient
- [ ] Redirect logic lightweight
- [ ] No expensive operations in middleware path

### Security

- [ ] Cookie flags appropriate:
  - [ ] HttpOnly (prevents XSS access)
  - [ ] SameSite=Lax (CSRF protection)
  - [ ] Secure (HTTPS in production)
- [ ] No sensitive data in cookies
- [ ] No information leakage in error handling
- [ ] Input validation present

### Documentation

- [ ] Code comments explain "why" not just "what"
- [ ] Configuration documented
- [ ] Comments in middleware explain next-intl setup
- [ ] Commit messages are clear

### Build & Deployment

- [ ] `pnpm build` succeeds
- [ ] `pnpm tsc` zero errors
- [ ] `pnpm lint` zero errors
- [ ] Ready to merge to main

---

## 📝 Feedback Template

Use this template when providing review feedback:

```markdown
## Review Feedback - Phase 2

**Reviewer**: [Name]
**Date**: [Date]
**Commits Reviewed**: [1, 2, 3, 4 or specify]

### ✅ Strengths

- Clean separation of concerns (cookie, redirect, next-intl)
- Comprehensive test coverage with good naming
- Security-conscious cookie configuration
- Good comments explaining next-intl integration

### 🔧 Required Changes

1. **src/lib/i18n/cookie.ts** (Commit 1): Secure flag handling
   - **Issue**: Secure flag should be conditional on `process.env.NODE_ENV === 'production'`
   - **Why**: Development uses HTTP, production uses HTTPS
   - **Suggestion**: Add conditional: `secure: process.env.NODE_ENV === 'production'`

2. **src/middleware.ts** (Commit 3): Documentation
   - **Issue**: No comment explaining `localePrefix: 'always'`
   - **Why**: This is a key configuration decision affecting URL structure
   - **Suggestion**: Add comment: `// localePrefix: 'always' ensures all routes are prefixed /fr/ or /en/`

### 💡 Suggestions (Optional)

- Consider extracting middleware configuration to a separate file (e.g., `lib/i18n/middleware.config.ts`)
- Add a helper function to create NextResponse with consistent headers
- Consider adding performance logging to measure middleware execution time

### 📊 Verdict

- [ ] ✅ **APPROVED** - Ready to merge
- [ ] 🔧 **CHANGES REQUESTED** - Needs fixes above
- [ ] ❌ **REJECTED** - Major rework needed

### Next Steps

1. Address required changes (items 1-2 above)
2. Re-run tests: `pnpm test`
3. Re-run build: `pnpm build`
4. Request re-review
```

---

## 🎯 Review Actions

### If Approved ✅

1. All checks passed
2. No required changes
3. Approve and prepare to merge
4. Update EPIC_TRACKING.md if all phases complete

### If Changes Requested 🔧

1. Create GitHub issue or notes with feedback
2. Developer addresses changes
3. Re-run validation tests
4. Request re-review

### If Rejected ❌

1. Document major issues found
2. Schedule discussion with developer
3. Plan rework strategy

---

## ⏱️ Review Time Estimate

| Commit    | Time     | Focus                    |
| --------- | -------- | ------------------------ |
| 1         | 30m      | Cookie utilities + tests |
| 2         | 30m      | Redirect logic + tests   |
| 3         | 45m      | next-intl integration    |
| 4         | 30m      | Test coverage + quality  |
| **Total** | **2.5h** | Full Phase 2 review      |

---

## ❓ FAQ

**Q: What if I disagree with a design choice?**
A: Discuss with the developer. If it works and meets requirements, it might be fine. Consider the PHASES_PLAN context.

**Q: Should I review tests as carefully as code?**
A: Yes! Tests are as important as production code. Check test quality, coverage, and real assertions.

**Q: How detailed should feedback be?**
A: Specific enough to be actionable. Include file, line number (if possible), and suggestion.

**Q: Can I approve with minor comments?**
A: Yes - mark as approved and note that comments are optional improvements.

**Q: Should I test the changes locally?**
A: Not required for code review, but helpful for complex changes (especially next-intl integration).

**Q: What about performance - how do I review that?**
A: Check for obvious issues (loops, large operations). Detailed performance testing happens in Phase 3.
