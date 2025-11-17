# Phase 3 - Checklist per Commit

This document provides a detailed checklist for each atomic commit of Phase 3.

---

## 📋 Commit 1: E2E Test Suite - Core Scenarios

**Files**: `tests/middleware.spec.ts`, `tests/fixtures/i18n.ts`
**Estimated Duration**: 1-1.5 hours

### Implementation Tasks

- [ ] Create `tests/middleware.spec.ts` with Playwright test structure
- [ ] Create `tests/fixtures/i18n.ts` for language/cookie setup fixtures
- [ ] Test AC1: Language detection from URL (`/fr/`, `/en/`)
  - [ ] Test: `/fr/articles` → French page loads
  - [ ] Test: `/en/search` → English page loads
- [ ] Test AC2: Browser Accept-Language header detection
  - [ ] Test: Header `fr,en;q=0.9` → `/fr/` redirect
  - [ ] Test: Header `en,fr;q=0.5` → `/en/` redirect
  - [ ] Test: Header `de,es` → `/fr/` redirect (default)
- [ ] Test AC3: Cookie-based language detection
  - [ ] Test: Cookie `NEXT_LOCALE=en` → `/en/` redirect
  - [ ] Test: Cookie precedence over header
- [ ] Test AC4: Unsupported language redirects
  - [ ] Test: `/de/articles` → redirect to `/fr/articles` (307)
  - [ ] Test: Path and query params preserved
- [ ] Test AC5: Root path redirection
  - [ ] Test: `/` with French cookie → `/fr/` redirect
  - [ ] Test: `/` with English header → `/en/` redirect
  - [ ] Test: `/` with no cookie/header → `/fr/` redirect (default)
- [ ] Test AC6: next-intl context initialization
  - [ ] Test: Component can use `useTranslations()`
  - [ ] Test: Language available in Server Components
- [ ] Test AC7: Public route exclusion
  - [ ] Test: `/_next/static/...` bypasses middleware
  - [ ] Test: `/favicon.ico` bypasses middleware
- [ ] Test AC8: Language validation
  - [ ] Test: Only `fr` and `en` allowed
  - [ ] Test: `/it/articles` redirects to `/fr/`

### Validation

```bash
# Run E2E tests
pnpm test:e2e tests/middleware.spec.ts

# Run with debug output
DEBUG=pw:api pnpm test:e2e tests/middleware.spec.ts

# Expected: All 15+ tests pass
```

**Expected Result**: All core scenarios pass, AC 1-8 verified

### Review Checklist

#### Test Structure

- [ ] Tests use `test.describe()` for grouping
- [ ] Test names are descriptive (use "should..." format)
- [ ] Fixtures used for setup/teardown

#### Test Quality

- [ ] Explicit waits used (`waitForURL`, `waitForSelector`)
- [ ] No arbitrary `page.waitForTimeout()` (use specific waits)
- [ ] Tests are isolated (no shared state)
- [ ] Tests clean up after themselves

#### Assertions

- [ ] Assertions are specific (check URL, text, cookie)
- [ ] Error messages are helpful
- [ ] Edge cases covered

#### Code Quality

- [ ] No hardcoded URLs (use `baseURL` from config)
- [ ] Clear naming (test, fixture, helper functions)
- [ ] No commented code
- [ ] No debug statements (`console.log`)

### Commit Message

```bash
git add tests/middleware.spec.ts tests/fixtures/i18n.ts
git commit -m "test(i18n): add E2E test suite for middleware core scenarios

- AC1: Language detection from URL (/fr/, /en/)
- AC2: Browser Accept-Language header detection
- AC3: Cookie-based language detection (NEXT_LOCALE)
- AC4: Unsupported language redirects (307)
- AC5: Root path redirection logic
- AC6: next-intl context initialization
- AC7: Public route exclusion (_next, favicon)
- AC8: Language validation (fr, en only)

Playwright fixtures for language/cookie setup
15+ test scenarios covering all core acceptance criteria

Part of Phase 3 - Commit 1/4"
```

---

## 📋 Commit 2: E2E Tests - Edge Cases & Mobile

**Files**: `tests/i18n-edge-cases.spec.ts`
**Estimated Duration**: 45 minutes - 1 hour

### Implementation Tasks

- [ ] Create `tests/i18n-edge-cases.spec.ts` with edge case test structure
- [ ] Test AC9: Cookie setting with secure flags
  - [ ] Test: Cookie `NEXT_LOCALE` set with correct flags
  - [ ] Test: HttpOnly flag enabled
  - [ ] Test: SameSite=Lax set
  - [ ] Test: Secure flag in production (skip in dev)
  - [ ] Test: Expiration set to 1 year
- [ ] Test AC10: Mobile deep links and dynamic routes
  - [ ] Test: Deep link `/fr/articles/post-123` preserves language
  - [ ] Test: Dynamic route `/[lang]/articles/[slug]` works
  - [ ] Test: Mobile viewport (iPhone 13, Pixel 5)
- [ ] Test AC11: Debug logging verification
  - [ ] Test: Debug logs show language source (URL, cookie, header, default)
  - [ ] Test: Logs disabled in production (or minimal)
- [ ] Test AC12: Infinite redirect prevention
  - [ ] Test: `/fr/articles` does not redirect if already French
  - [ ] Test: `/en/search` does not redirect if already English
  - [ ] Test: No redirect loops
- [ ] Edge case: Invalid cookies
  - [ ] Test: Cookie `NEXT_LOCALE=invalid` → reset to valid language
- [ ] Edge case: Malformed Accept-Language headers
  - [ ] Test: Header `invalid` → default language (French)
- [ ] Edge case: Missing route groups
  - [ ] Test: Middleware handles missing `[locale]` gracefully

### Validation

```bash
# Run edge case tests
pnpm test:e2e tests/i18n-edge-cases.spec.ts

# Run on mobile viewport
pnpm test:e2e tests/i18n-edge-cases.spec.ts --project=mobile

# Run with debug logging enabled
DEBUG=i18n:* pnpm test:e2e tests/i18n-edge-cases.spec.ts

# Expected: All 10+ tests pass
```

**Expected Result**: All AC 1-12 verified, edge cases handled gracefully

### Review Checklist

#### Coverage

- [ ] All remaining AC (9-12) tested
- [ ] Edge cases covered (invalid input, errors)
- [ ] Mobile viewports tested

#### Cookie Testing

- [ ] Cookie flags verified (HttpOnly, SameSite, Secure)
- [ ] Cookie expiration tested
- [ ] Invalid cookie handling tested

#### Mobile Testing

- [ ] Tests run on mobile viewports (iPhone, Android)
- [ ] Deep links work on mobile
- [ ] Touch interactions tested (if applicable)

#### Debug Logging

- [ ] Logs verified in test output
- [ ] Logs contain expected information (language source)
- [ ] Production mode tested (logs minimal)

#### Code Quality

- [ ] Clear test names
- [ ] No flaky tests (run 3+ times)
- [ ] Tests are maintainable

### Commit Message

```bash
git add tests/i18n-edge-cases.spec.ts
git commit -m "test(i18n): add edge case and mobile E2E tests for middleware

- AC9: Cookie secure flags (HttpOnly, SameSite, Secure, 1yr TTL)
- AC10: Mobile deep links and dynamic routes (/[lang]/articles/[slug])
- AC11: Debug logging verification
- AC12: Infinite redirect prevention

Edge cases:
- Invalid cookies → reset to valid language
- Malformed Accept-Language headers → default (French)
- Missing route groups → graceful handling

Mobile viewports: iPhone 13, Pixel 5
10+ test scenarios completing AC 1-12 coverage

Part of Phase 3 - Commit 2/4"
```

---

## 📋 Commit 3: Debug Logging & Performance Monitoring

**Files**: `src/lib/i18n/logger.ts`, `src/middleware.ts`, `src/lib/i18n/performance.ts`
**Estimated Duration**: 45 minutes - 1 hour

### Implementation Tasks

- [ ] Create `src/lib/i18n/logger.ts` debug logging utility
  - [ ] Environment flag control (`DEBUG=i18n:*` or `NODE_ENV=development`)
  - [ ] Structured log format (timestamp, level, message)
  - [ ] No PII (Personally Identifiable Information) in logs
  - [ ] Log levels: `debug`, `info`, `warn`, `error`
- [ ] Update `src/middleware.ts` with debug logging
  - [ ] Log detected language source (URL, cookie, header, default)
  - [ ] Log redirects with reason
  - [ ] Log performance timing
  - [ ] Conditional logging (only if enabled)
- [ ] Create `src/lib/i18n/performance.ts` performance monitoring
  - [ ] Middleware execution timing (`performance.now()`)
  - [ ] Performance assertions (< 50ms)
  - [ ] Benchmark tests
- [ ] Add unit tests for logger (`src/lib/i18n/logger.test.ts`)
- [ ] Add unit tests for performance (`src/lib/i18n/performance.test.ts`)

### Validation

```bash
# Run middleware with debug logging
DEBUG=i18n:* pnpm dev
# Visit http://localhost:3000 and check console for logs

# Run performance benchmark
pnpm test src/lib/i18n/performance.test.ts

# Run all tests
pnpm test

# Type-checking
pnpm tsc

# Expected: Logs show language detection, performance < 50ms
```

**Expected Result**: Debug logs working, performance < 50ms verified

### Review Checklist

#### Logging

- [ ] Logging is conditional (environment flag)
- [ ] No PII in logs (no IP, user IDs, etc.)
- [ ] Logs are structured (JSON or key-value)
- [ ] Production logs are minimal (no debug spam)
- [ ] Logs help troubleshooting (show language source, decisions)

#### Performance

- [ ] Performance timing is accurate (`performance.now()`)
- [ ] Middleware execution < 50ms consistently
- [ ] Performance benchmarks pass
- [ ] No performance regressions from logging

#### Code Quality

- [ ] Logger is reusable (not middleware-specific)
- [ ] TypeScript types correct
- [ ] Unit tests for logger and performance utils
- [ ] No console.logs (use logger instead)

### Commit Message

```bash
git add src/lib/i18n/logger.ts src/middleware.ts src/lib/i18n/performance.ts src/lib/i18n/logger.test.ts src/lib/i18n/performance.test.ts
git commit -m "feat(i18n): add debug logging and performance monitoring to middleware

Debug Logging:
- Environment flag control (DEBUG=i18n:* or NODE_ENV=development)
- Structured logs: timestamp, level, message
- Language detection source logged (URL, cookie, header, default)
- Redirect reason logged
- No PII in logs (production-safe)

Performance Monitoring:
- Middleware execution timing (performance.now())
- Performance assertions: < 50ms target
- Benchmark tests
- Verified on local Cloudflare Workers (wrangler dev)

Unit tests for logger and performance utils
AC11 completed: Debug logging for troubleshooting

Part of Phase 3 - Commit 3/4"
```

---

## 📋 Commit 4: Documentation & Middleware Guide

**Files**: `docs/i18n/MIDDLEWARE.md`, `README.md`, `i18n/README.md`
**Estimated Duration**: 1-1.5 hours

### Implementation Tasks

- [ ] Create `docs/i18n/MIDDLEWARE.md` comprehensive guide (~500 lines)
  - [ ] Architecture overview (how middleware works)
  - [ ] Language detection priority (URL → Cookie → Header → Default)
  - [ ] Configuration guide (locales, routing, cookies)
  - [ ] Usage examples with code snippets
  - [ ] Troubleshooting guide (common issues + solutions)
  - [ ] Performance considerations
  - [ ] Security best practices
  - [ ] API reference (functions, types, configs)
  - [ ] Migration guide from other i18n solutions (if applicable)
- [ ] Update `README.md` with i18n section (~50 lines)
  - [ ] Link to middleware docs
  - [ ] Quick start for i18n
  - [ ] Language switching instructions
- [ ] Update `i18n/README.md` with middleware reference (~20 lines)
  - [ ] Link to MIDDLEWARE.md
  - [ ] Explain middleware role in i18n

### Validation

```bash
# Validate documentation links
npx markdown-link-check docs/i18n/MIDDLEWARE.md

# Verify code examples compile
pnpm tsc --noEmit

# Run all tests (final validation)
pnpm test && pnpm test:e2e

# Expected: All links valid, examples compile, all tests pass
```

**Expected Result**: Complete, accurate documentation ready for production

### Review Checklist

#### Completeness

- [ ] All sections present (architecture, config, usage, troubleshooting, API)
- [ ] Code examples for all common use cases
- [ ] Troubleshooting covers frequent issues

#### Accuracy

- [ ] Code examples are accurate and tested
- [ ] Configuration matches actual implementation
- [ ] Links work correctly (internal and external)
- [ ] Examples use project conventions (pnpm, TypeScript)

#### Clarity

- [ ] Explanations are clear for junior devs
- [ ] Diagrams/visuals included if helpful
- [ ] API reference is complete (all functions documented)
- [ ] Migration guide is step-by-step

#### Usability

- [ ] Table of contents for navigation
- [ ] Quick start section at top
- [ ] Copy-paste ready code snippets
- [ ] Common errors documented with solutions

### Commit Message

```bash
git add docs/i18n/MIDDLEWARE.md README.md i18n/README.md
git commit -m "📝 docs(i18n): add comprehensive middleware documentation

Complete middleware guide:
- Architecture: Language detection flow (URL → Cookie → Header → Default)
- Configuration: Locales, routing modes, cookie settings
- Usage examples: Code snippets for common scenarios
- Troubleshooting: Common issues + solutions
- Performance: <50ms execution, optimization tips
- Security: Cookie flags, input validation, XSS prevention
- API reference: All functions, types, configs documented
- Migration guide: From other i18n solutions

Updated README.md: i18n quick start and language switching
Updated i18n/README.md: Link to middleware docs

~570 lines of production-ready documentation
Story 1.3 documentation complete

Part of Phase 3 - Commit 4/4"
```

---

## ✅ Final Phase Validation

After all commits:

### Complete Phase Checklist

- [ ] All 4 commits completed
- [ ] All E2E tests pass (15+ core + 10+ edge case tests)
- [ ] All AC 1-12 verified
- [ ] Performance < 50ms verified
- [ ] Debug logging working
- [ ] Documentation complete
- [ ] TypeScript passes: `pnpm tsc`
- [ ] Linter passes: `pnpm lint`
- [ ] Build succeeds: `pnpm build`
- [ ] VALIDATION_CHECKLIST.md completed

### Final Validation Commands

```bash
# Run all tests (unit + integration + E2E)
pnpm test && pnpm test:e2e

# Run linter
pnpm lint

# Run type-checking
pnpm tsc

# Run build
pnpm build

# All must pass with no errors
```

**Phase 3 is complete when all checkboxes are checked! 🎉**

---

## 🚀 Next Steps After Phase 3

1. [ ] Mark Phase 3 as ✅ COMPLETED in INDEX.md
2. [ ] Update EPIC_TRACKING.md: Story 1.3 status → ✅ COMPLETED
3. [ ] Create git tag: `story-1.3-complete`
4. [ ] Prepare for Story 1.4 (Bilingual URL structure)
5. [ ] Document lessons learned
6. [ ] Celebrate! 🎉 Story 1.3 middleware is production-ready
