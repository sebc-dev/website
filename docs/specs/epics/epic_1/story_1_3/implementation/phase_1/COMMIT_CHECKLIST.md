# Phase 1 — Checklist per Commit

This document provides a detailed checklist for each atomic commit of Phase 1.

---

## 📋 Commit 1: Set Up Middleware Structure and Type Definitions

**Files**: `src/middleware.ts`, `i18n/config.ts`, `i18n/types.ts`, `tsconfig.json`
**Estimated Duration**: 20–30 minutes

### Implementation Tasks

- [ ] Create `src/middleware.ts` file with middleware skeleton
  - [ ] Export `middleware` function (empty implementation for now)
  - [ ] Import types from `@/i18n`
  - [ ] Add JSDoc header with description
  - [ ] Implement matcher pattern (returns `NextRequest | undefined`)
  - [ ] Start function: `export function middleware(request: NextRequest): NextResponse | undefined`

- [ ] Update `i18n/config.ts`
  - [ ] Add routing configuration (if not present)
  - [ ] Define `localePrefix` configuration (e.g., "as-needed" or "always")
  - [ ] Define `prefixMode` configuration (e.g., "default")
  - [ ] Export locale types for middleware use

- [ ] Update `i18n/types.ts`
  - [ ] Ensure `Locale` type is properly exported
  - [ ] Add types for request/response context if needed
  - [ ] Verify all types are documented with JSDoc

- [ ] Configure `tsconfig.json`
  - [ ] Ensure `src/middleware.ts` is recognized by TypeScript
  - [ ] Check path aliases are correct (`@/*`)
  - [ ] Verify edge runtime types are available (if using Cloudflare Workers types)

- [ ] Add documentation
  - [ ] JSDoc comments on middleware function
  - [ ] Comments explaining routing strategy
  - [ ] Comments referencing i18n/config.ts for configuration

### Validation

```bash
# Type-checking - must pass with zero errors
pnpm tsc --noEmit

# Linting
pnpm lint src/middleware.ts i18n/

# Ensure project still builds
pnpm build
```

**Expected Result**:

- `src/middleware.ts` created with middleware skeleton
- No TypeScript errors
- ESLint passes
- Build succeeds

### Review Checklist

#### Structure & Files

- [ ] `src/middleware.ts` exists at correct location
- [ ] `i18n/config.ts` includes routing configuration
- [ ] `i18n/types.ts` exports required types
- [ ] `tsconfig.json` properly configured

#### Type Safety

- [ ] No `any` types without justification
- [ ] All imports are typed correctly
- [ ] Generic types use proper constraints
- [ ] Types from `next-intl` are used correctly

#### Code Quality

- [ ] Middleware function has clear JSDoc comment
- [ ] Comments explain routing and detection strategy
- [ ] Configuration is well-documented
- [ ] No hardcoded values; everything comes from config

#### Standards Compliance

- [ ] Follows conventions from CLAUDE.md
- [ ] Uses project path aliases (`@/i18n`)
- [ ] No console.logs or debug code
- [ ] No commented-out code

### Commit Message

```bash
git add src/middleware.ts i18n/config.ts i18n/types.ts tsconfig.json

git commit -m "feat(middleware): initialize middleware structure and type definitions (1/5)

- Create src/middleware.ts with middleware skeleton
- Add routing configuration to i18n/config.ts
- Export locale types from i18n/types.ts for type-safe detection
- Ensure TypeScript recognizes middleware.ts

This commit establishes the foundation for language detection logic
in subsequent commits. No logic implemented yet - purely structural setup.

Part of Phase 1 — Language Detection Foundation
Story 1.3 — Create Next.js Middleware with next-intl"
```

---

## 📋 Commit 2: Implement Language Detection from URL Path

**Files**: `src/middleware.ts`
**Estimated Duration**: 30–45 minutes

### Implementation Tasks

- [ ] Implement URL path parsing
  - [ ] Create function `detectLocaleFromURL(pathname: string): Locale | undefined`
  - [ ] Parse URL pathname to extract language prefix (e.g., `/fr/*` → `fr`)
  - [ ] Use regex or pathname splitting to identify language code
  - [ ] Return undefined if no language prefix found

- [ ] Implement locale validation
  - [ ] Check detected locale against `locales` array from `i18n/config.ts`
  - [ ] Return only valid locales (fr, en)
  - [ ] Return undefined for invalid locales (de, it, es, etc.)

- [ ] Handle edge cases
  - [ ] Root path `/` (no locale prefix) → return undefined
  - [ ] Path with trailing slash `/fr/` → return `fr`
  - [ ] Path without trailing slash `/en` → return `en` (or handle as invalid)
  - [ ] Nested paths `/fr/articles/slug` → return `fr`
  - [ ] Case sensitivity: `/FR/` should probably be invalid (depends on spec)

- [ ] Add documentation
  - [ ] JSDoc for `detectLocaleFromURL` with parameter and return type
  - [ ] Example: `// detectLocaleFromURL('/fr/articles') → 'fr'`
  - [ ] Explain handling of invalid paths

- [ ] Integrate into middleware
  - [ ] Call `detectLocaleFromURL` from middleware function
  - [ ] Store detected locale for later use in Commit 3

### Validation

```bash
# Type-checking
pnpm tsc --noEmit

# Linting
pnpm lint src/middleware.ts

# Build
pnpm build
```

**Expected Result**:

- URL detection function works correctly
- No TypeScript errors
- ESLint passes
- Build succeeds
- Ready for testing in Commit 5

### Review Checklist

#### URL Detection Logic

- [ ] Regex pattern or path parsing is correct
- [ ] Correctly identifies `/fr/*`, `/en/*` patterns
- [ ] Returns undefined for root path `/`
- [ ] Handles edge cases (trailing slashes, nested paths)
- [ ] Performance is acceptable (no inefficient regex)

#### Validation

- [ ] Detected locale is validated against `locales` array
- [ ] Only valid locales (fr, en) are returned
- [ ] Invalid locales return undefined
- [ ] No mutation of input parameters

#### Code Quality

- [ ] Function is pure (no side effects)
- [ ] Function has comprehensive JSDoc
- [ ] Clear variable names
- [ ] No hardcoded locale values
- [ ] Comments explain the detection logic

#### Type Safety

- [ ] Return type is `Locale | undefined`
- [ ] No `any` types
- [ ] Imports from `i18n/config.ts` are correct
- [ ] TypeScript strict mode passes

### Commit Message

```bash
git add src/middleware.ts

git commit -m "feat(middleware): implement language detection from URL path (2/5)

- Extract locale from URL pathname prefix (/fr/, /en/, etc)
- Validate detected locale against supported locales from i18n/config
- Return undefined for invalid language codes
- Handle edge cases: root path, trailing slashes, nested paths

Examples:
- /fr/articles → 'fr'
- /en/search → 'en'
- / → undefined (no prefix)
- /de/articles → undefined (invalid language)
- /fr/articles/slug → 'fr'

This establishes URL-based language detection as the highest priority
source in the detection hierarchy (URL > Cookie > Header > Default).

Part of Phase 1 — Language Detection Foundation
Story 1.3 — Create Next.js Middleware with next-intl"
```

---

## 📋 Commit 3: Implement Language Detection from Cookies and Browser Headers

**Files**: `src/middleware.ts`
**Estimated Duration**: 45–60 minutes

### Implementation Tasks

- [ ] Implement cookie-based detection
  - [ ] Create function `getLocaleFromCookie(cookieValue?: string): Locale | undefined`
  - [ ] Extract `NEXT_LOCALE` cookie value from request
  - [ ] Validate cookie value against `locales` array
  - [ ] Return undefined if cookie missing or invalid

- [ ] Implement Accept-Language header parsing
  - [ ] Create function `parseAcceptLanguage(headerValue: string): string[]`
  - [ ] Parse header format: `fr,en;q=0.9,de;q=0.5`
  - [ ] Extract language codes respecting quality values
  - [ ] Return array of locale codes in priority order (highest q first)
  - [ ] Handle edge cases:
    - [ ] Language variants: `fr-FR` → check for `fr` support
    - [ ] Multiple quality values: `en;q=0.8,fr;q=0.9` (return `fr` first despite order)
    - [ ] Empty or malformed headers
    - [ ] Missing quality values (default q=1.0)

- [ ] Create header detection function
  - [ ] Create `getLocaleFromHeader(headerValue: string): Locale | undefined`
  - [ ] Call `parseAcceptLanguage(headerValue)`
  - [ ] Find first supported locale from parsed array
  - [ ] Return undefined if no supported locale found

- [ ] Integrate into middleware
  - [ ] Update middleware to call cookie and header detection
  - [ ] Store results for Commit 4 (detection priority)

- [ ] Add documentation
  - [ ] JSDoc for all new functions with examples
  - [ ] Example: `// parseAcceptLanguage('fr,en;q=0.9') → ['fr', 'en']`
  - [ ] Comment explaining quality value handling
  - [ ] Examples of edge cases

### Validation

```bash
# Type-checking
pnpm tsc --noEmit

# Linting
pnpm lint src/middleware.ts

# Build
pnpm build
```

**Expected Result**:

- Cookie and header detection functions work correctly
- Accept-Language parsing handles quality values
- No TypeScript errors
- ESLint passes
- Build succeeds

### Review Checklist

#### Cookie Handling

- [ ] `NEXT_LOCALE` cookie correctly extracted
- [ ] Cookie value is validated against supported locales
- [ ] Returns undefined if cookie missing or invalid
- [ ] No security issues (safe string parsing)

#### Header Parsing

- [ ] Accept-Language header correctly parsed
- [ ] Quality values (q=X.X) handled correctly
- [ ] Higher quality values take priority
- [ ] Language variants (en-US) properly matched
- [ ] Edge cases handled: empty header, malformed values
- [ ] Performance acceptable (no unnecessary processing)

#### Code Quality

- [ ] Functions are pure (no side effects)
- [ ] Comprehensive JSDoc with examples
- [ ] Variable names are clear
- [ ] Comments explain complex parsing logic
- [ ] No hardcoded locale values

#### Type Safety

- [ ] Return types are correct
- [ ] No `any` types without justification
- [ ] All parameters are typed
- [ ] TypeScript strict mode passes

### Commit Message

```bash
git add src/middleware.ts

git commit -m "feat(middleware): implement language detection from cookie and header (3/5)

- Extract and validate NEXT_LOCALE cookie value
- Parse Accept-Language header with quality value support
- Match parsed languages against supported locales
- Return first supported locale in priority order

Cookie detection:
- Read NEXT_LOCALE cookie
- Validate value against supported locales
- Return undefined if missing or invalid

Header detection:
- Parse Accept-Language: fr,en;q=0.9,de;q=0.5
- Respect quality values (q=X.X)
- Return locales in priority order: ['fr', 'en']
- Match against supported locales
- Skip unsupported languages

Detection hierarchy (so far):
1. URL path (from Commit 2)
2. Cookie value (from this commit)
3. Accept-Language header (from this commit)
4. Default to French (coming in Commit 4)

Handles edge cases:
- Multiple quality values
- Language variants (en-US → en)
- Malformed headers
- Missing quality values (default q=1.0)

Part of Phase 1 — Language Detection Foundation
Story 1.3 — Create Next.js Middleware with next-intl"
```

---

## 📋 Commit 4: Implement Redirect Logic for Unsupported Languages

**Files**: `src/middleware.ts`
**Estimated Duration**: 30–45 minutes

### Implementation Tasks

- [ ] Create detection priority function
  - [ ] Create `detectLocale(request: NextRequest): Locale`
  - [ ] Implement detection hierarchy:
    1. URL path detection (from Commit 2)
    2. Cookie detection (from Commit 3)
    3. Header detection (from Commit 3)
    4. Default to French
  - [ ] Return detected `Locale` (never undefined)

- [ ] Implement redirect logic
  - [ ] Determine if redirect is needed
  - [ ] Only redirect if URL has invalid language prefix
  - [ ] Example: `/de/articles` → detected as `fr` → redirect to `/fr/articles`
  - [ ] Preserve path and query parameters during redirect
  - [ ] Use HTTP 307 (Temporary Redirect)
  - [ ] Don't redirect if URL already has correct language

- [ ] Configure public route exclusion
  - [ ] Define routes to exclude: `/_next/*`, `/api/*`, `/public/*`, `/images/*`
  - [ ] Use NextRequest matcher or custom function
  - [ ] Skip middleware processing for public routes (performance)
  - [ ] Return `NextResponse.next()` for excluded routes without processing

- [ ] Implement main middleware logic
  - [ ] Check if route is public (if yes, skip processing)
  - [ ] Extract pathname from request
  - [ ] Detect locale using all sources
  - [ ] If unsupported language in URL, redirect to default language
  - [ ] Otherwise, continue to next middleware/handler

- [ ] Add safety checks
  - [ ] Prevent infinite redirects (if URL already correct, don't redirect)
  - [ ] Validate redirect URL
  - [ ] Ensure query parameters preserved

- [ ] Add documentation
  - [ ] JSDoc for `detectLocale` function
  - [ ] Comments explaining redirect decision logic
  - [ ] Examples of redirect scenarios
  - [ ] Comment about performance optimization (public routes)

### Validation

```bash
# Type-checking
pnpm tsc --noEmit

# Linting
pnpm lint src/middleware.ts

# Build (important to verify middleware works in build)
pnpm build
```

**Expected Result**:

- Full detection pipeline works
- Redirects are appropriate
- Public routes are excluded
- No infinite redirects
- Build succeeds

### Review Checklist

#### Detection Logic

- [ ] Detection hierarchy is correct (URL > Cookie > Header > Default)
- [ ] All detection sources are used appropriately
- [ ] Default to French works correctly
- [ ] Detected locale is always valid (never undefined)

#### Redirect Logic

- [ ] Redirect happens only when needed (unsupported language)
- [ ] Path and query parameters are preserved
- [ ] HTTP 307 is used (protocol-safe)
- [ ] No infinite redirects (URL already correct → no redirect)
- [ ] Redirect URL is valid and safe

#### Public Route Exclusion

- [ ] Public routes are correctly excluded (`/_next/*`, `/api/*`)
- [ ] Configuration is clear and maintainable
- [ ] Performance impact is minimal (early returns)
- [ ] No routes are incorrectly excluded

#### Code Quality

- [ ] Functions are well-documented with JSDoc
- [ ] Comments explain decision logic
- [ ] Variable names are clear
- [ ] No magic strings (use constants for route patterns)
- [ ] Error handling is appropriate

#### Type Safety

- [ ] `detectLocale` always returns `Locale` (never undefined)
- [ ] All types are correct
- [ ] No `any` types
- [ ] TypeScript strict mode passes

#### Cloudflare Compatibility

- [ ] No Node.js-only APIs used
- [ ] Uses Web APIs and Cloudflare Workers APIs
- [ ] Compatible with edge runtime constraints

### Commit Message

```bash
git add src/middleware.ts

git commit -m "feat(middleware): implement redirect logic and public route exclusion (4/5)

- Create detectLocale() with full detection hierarchy
- Implement language detection priority: URL > Cookie > Header > Default
- Redirect unsupported language codes to default language
- Preserve path and query parameters during redirect
- Exclude public routes for performance (_next, /api, /public, /images)
- Prevent infinite redirects (skip if already correct)

Detection examples:
- URL: /fr/articles → detected as 'fr' → no redirect
- URL: /de/articles → detected as 'fr' → redirect to /fr/articles
- Cookie: NEXT_LOCALE=en → detected as 'en' → no redirect (if no URL)
- Header: Accept-Language: en,fr;q=0.9 → detected as 'en' → no redirect (if no URL)
- No source: → default to 'fr'

Redirect behavior:
- HTTP 307 (Temporary Redirect)
- Preserves query parameters: /de/?page=2 → /fr/?page=2
- Preserves path: /de/articles/slug → /fr/articles/slug
- No redirect if URL already correct

Public routes excluded:
- /_next/* (Next.js internals)
- /api/* (API routes)
- /public/* (static files)
- /images/* (image files)

This completes the core language detection pipeline. Ready for testing.

Part of Phase 1 — Language Detection Foundation
Story 1.3 — Create Next.js Middleware with next-intl"
```

---

## 📋 Commit 5: Write Comprehensive Unit Tests and Achieve ≥80% Coverage

**Files**: `src/middleware.test.ts`, potentially `src/lib/i18n/detection.test.ts`
**Estimated Duration**: 60–90 minutes

### Implementation Tasks

- [ ] Create test file: `src/middleware.test.ts`
  - [ ] Setup Vitest configuration and imports
  - [ ] Import functions to test from `src/middleware.ts`
  - [ ] Setup mocks for Next.js modules if needed

- [ ] Write tests for URL detection
  - [ ] Test `/fr/*` → returns `fr`
  - [ ] Test `/en/*` → returns `en`
  - [ ] Test `/de/*` → returns undefined (invalid)
  - [ ] Test `/` (root) → returns undefined
  - [ ] Test `/articles` (no prefix) → returns undefined
  - [ ] Test `/fr/articles/slug` (nested) → returns `fr`
  - [ ] Test `/Fr/articles` (uppercase) → returns undefined or `fr` (document)
  - [ ] Test `/fr/` (with trailing slash) → returns `fr`
  - [ ] Test `/articles/fr` (suffix, not prefix) → returns undefined
  - [ ] Aim for 100% coverage of URL detection

- [ ] Write tests for cookie detection
  - [ ] Test valid cookie `NEXT_LOCALE=fr` → returns `fr`
  - [ ] Test valid cookie `NEXT_LOCALE=en` → returns `en`
  - [ ] Test invalid cookie `NEXT_LOCALE=de` → returns undefined
  - [ ] Test missing cookie → returns undefined
  - [ ] Test empty cookie value → returns undefined
  - [ ] Test malformed cookie → returns undefined
  - [ ] Aim for 100% coverage of cookie detection

- [ ] Write tests for Accept-Language parsing
  - [ ] Test simple header: `fr` → returns `['fr']`
  - [ ] Test multiple: `fr,en` → returns `['fr', 'en']` or `['en', 'fr']` (in quality order)
  - [ ] Test quality values: `fr,en;q=0.9` → returns `['fr', 'en']`
  - [ ] Test reordered by quality: `en;q=0.8,fr;q=0.9` → returns `['fr', 'en']`
  - [ ] Test language variants: `fr-FR,en-US` → returns `['fr', 'en']` (after matching)
  - [ ] Test partial match: `de,en` → returns `['en']` (fr unsupported)
  - [ ] Test empty header → returns empty array
  - [ ] Test malformed quality: `fr;q=invalid` → handles gracefully
  - [ ] Aim for 100% coverage of header parsing

- [ ] Write tests for detection hierarchy
  - [ ] Test priority: URL > Cookie > Header > Default
  - [ ] Test URL + Cookie (URL wins): path `/fr/*` + cookie `en` → returns `fr`
  - [ ] Test URL + Header (URL wins): path `/en/*` + header `fr` → returns `en`
  - [ ] Test Cookie + Header (Cookie wins): cookie `en` + header `fr` → returns `en`
  - [ ] Test Header + Default (Header wins): header `en` + no others → returns `en`
  - [ ] Test Default only: no URL/Cookie/Header → returns `fr`
  - [ ] Aim for 100% coverage of hierarchy

- [ ] Write tests for redirect logic
  - [ ] Test no redirect if URL correct: `/fr/articles` → no redirect
  - [ ] Test redirect if URL invalid: `/de/articles` → redirect to `/fr/articles`
  - [ ] Test redirect preserves path: `/de/articles/slug` → `/fr/articles/slug`
  - [ ] Test redirect preserves query: `/de/articles?page=2` → `/fr/articles?page=2`
  - [ ] Test HTTP 307 used for redirects
  - [ ] Test public routes excluded: `/_next/*` → skip middleware
  - [ ] Test API routes excluded: `/api/*` → skip middleware
  - [ ] Aim for 100% coverage of redirect logic

- [ ] Test coverage report
  - [ ] Run `pnpm test:coverage`
  - [ ] Verify coverage ≥80% (target 85%+)
  - [ ] Document any untested edge cases
  - [ ] If coverage <80%, add additional tests

- [ ] Add documentation
  - [ ] JSDoc comments explaining test structure
  - [ ] Comments for complex test setups (mocks, fixtures)
  - [ ] Explain edge cases tested and why

### Validation

```bash
# Run unit tests - all must pass
pnpm test

# Generate coverage report
pnpm test:coverage

# Type-checking
pnpm tsc --noEmit

# Linting
pnpm lint src/middleware.test.ts

# Build
pnpm build
```

**Expected Result**:

- All unit tests pass
- Coverage ≥80% (ideally 85%+)
- No TypeScript errors
- ESLint passes
- Build succeeds
- All acceptance criteria AC1–4, 7–8 can be verified

### Review Checklist

#### Test Coverage

- [ ] URL detection tested with ≥8 test cases
- [ ] Cookie detection tested with ≥6 test cases
- [ ] Header parsing tested with ≥8 test cases
- [ ] Detection hierarchy tested with ≥6 test cases
- [ ] Redirect logic tested with ≥6 test cases
- [ ] Public route exclusion tested with ≥3 test cases
- [ ] **Total: ≥35 test cases**
- [ ] Coverage report shows ≥80% (target 85%+)

#### Test Quality

- [ ] Test names are descriptive: `should detect language from /fr/ URL path`
- [ ] Each test focuses on single behavior
- [ ] Edge cases are tested (empty strings, null, invalid values)
- [ ] Mocks are appropriate and clearly documented
- [ ] No flaky tests (deterministic, not timing-dependent)
- [ ] Tests are focused on behavior, not implementation

#### Code Quality

- [ ] Tests are organized logically (group by function)
- [ ] Setup code is DRY (no repetition)
- [ ] Assertions are clear and specific
- [ ] No console.logs or debug code in tests
- [ ] Comments explain complex test scenarios

#### Coverage Goals

- [ ] URL detection: 100% coverage
- [ ] Cookie detection: 100% coverage
- [ ] Header parsing: 100% coverage
- [ ] Redirect logic: 100% coverage
- [ ] Overall: ≥80% coverage (ideally 85%+)

### Commit Message

```bash
git add src/middleware.test.ts src/lib/i18n/detection.test.ts

git commit -m "test(middleware): add comprehensive unit tests with 80%+ coverage (5/5)

Test coverage:
- URL detection: 8+ test cases (100% coverage)
  * /fr/*, /en/*, /de/*, /, /articles, nested paths
- Cookie detection: 6+ test cases (100% coverage)
  * Valid values, invalid values, missing, empty
- Header parsing: 8+ test cases (100% coverage)
  * Simple, quality values, reordered, variants, malformed
- Detection hierarchy: 6+ test cases (100% coverage)
  * URL > Cookie > Header > Default priority
- Redirect logic: 6+ test cases (100% coverage)
  * No redirect, redirect, path/query preservation, public routes
- Public route exclusion: 3+ test cases

Total: 37+ test cases, ≥80% code coverage (achieved ~85%)

All acceptance criteria AC1-4, 7-8 verified:
✓ AC1: URL detection works
✓ AC2: Header parsing works
✓ AC3: Cookie reading works
✓ AC4: Unsupported language redirects
✓ AC7: Public routes excluded
✓ AC8: Language validation works
✓ AC12: No infinite redirects

Test quality:
- Descriptive test names
- Single responsibility per test
- Edge cases thoroughly tested
- Mocks documented
- Deterministic (no timing issues)
- Focused on behavior, not implementation

Part of Phase 1 — Language Detection Foundation
Story 1.3 — Create Next.js Middleware with next-intl"
```

---

## ✅ Final Phase Validation

After all 5 commits:

### Complete Phase Checklist

- [ ] All 5 commits completed in order
- [ ] AC1: Language detected from URL
- [ ] AC2: Language detected from Accept-Language header
- [ ] AC3: Cookie-based language detection working
- [ ] AC4: Unsupported language redirects
- [ ] AC7: Public routes excluded
- [ ] AC8: Language validated against scope
- [ ] AC12: No infinite redirects
- [ ] All unit tests pass (`pnpm test`)
- [ ] Test coverage ≥80% (`pnpm test:coverage`)
- [ ] TypeScript zero errors (`pnpm tsc --noEmit`)
- [ ] ESLint passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Code reviewed and approved

### Final Validation Commands

```bash
# Type-checking
pnpm tsc --noEmit

# Linting and formatting
pnpm lint

# Unit tests with coverage
pnpm test
pnpm test:coverage

# Build project
pnpm build
```

**All checks must pass before Phase 1 completion.**

### Completion Status

Phase 1 is **complete** when:

- [x] All 5 commits are merged to Phase 1 branch
- [x] All validation commands pass
- [x] Unit test coverage ≥80%
- [x] Code review complete and approved
- [x] Documentation complete
- [x] Ready for Phase 2 (no blockers)

Update [INDEX.md](./INDEX.md) status to: **✅ COMPLETED**

---

**Phase 1 — Commit Checklist Complete** ✅
