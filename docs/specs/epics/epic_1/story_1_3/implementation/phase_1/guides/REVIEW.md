# Phase 1 — Code Review Guide

Complete guide for reviewing the Phase 1 implementation (5 commits).

---

## 🎯 Review Objective

Validate that the implementation:

- ✅ Correctly detects user language from URL, cookie, and browser header
- ✅ Implements proper redirect logic for unsupported languages
- ✅ Excludes public routes for performance
- ✅ Handles all edge cases (quality values, language variants, etc.)
- ✅ Follows project standards and conventions
- ✅ Is well-tested with ≥80% coverage
- ✅ Has zero TypeScript errors
- ✅ Passes ESLint linting

---

## 📋 Review Approach

Phase 1 consists of **5 atomic commits**. You can review:

**Option A: Commit-by-commit review** (recommended for thorough review)

- Easier to digest (10–20 min per commit)
- Progressive understanding of architecture
- Targeted feedback per commit

**Option B: Global review at once** (faster for experienced reviewers)

- Faster (45–60 min total)
- Immediate overview of all changes
- Requires more context switching

**Estimated Total Time**: 45–60 minutes for all 5 commits

---

## 🔍 Commit-by-Commit Review

### Commit 1: Set Up Middleware Structure and Type Definitions

**Files Modified**: `src/middleware.ts`, `i18n/config.ts`, `i18n/types.ts`, `tsconfig.json`
**Size**: ~80 lines
**Review Time**: 10–15 minutes

#### Review Checklist

##### File Structure

- [ ] `src/middleware.ts` created at correct location
- [ ] Middleware function exported properly
- [ ] Imports are correct (from `@/i18n` and Next.js)
- [ ] No hardcoded values; uses configuration from `i18n/config.ts`

##### Type Definitions

- [ ] All types are properly imported from `i18n/types.ts`
- [ ] Type imports use `type` keyword (e.g., `import type { Locale }`)
- [ ] Generic types are correctly constrained
- [ ] No `any` types (unless justified with comment)

##### Configuration

- [ ] `i18n/config.ts` includes routing configuration
- [ ] `locales` array properly exported
- [ ] `defaultLocale` set to `fr` (French)
- [ ] Configuration is used consistently

##### Code Quality

- [ ] Middleware function has JSDoc header
- [ ] Comments explain routing and detection strategy
- [ ] Variable names are clear and descriptive
- [ ] No console.logs or debug code
- [ ] No commented-out code

##### TypeScript Validation

- [ ] `pnpm tsc --noEmit` passes (zero errors)
- [ ] No implicit `any` types
- [ ] Function signatures are complete

---

### Commit 2: Implement Language Detection from URL Path

**Files Modified**: `src/middleware.ts`
**Size**: ~80 lines
**Review Time**: 10–15 minutes

#### Review Checklist

##### URL Detection Logic

- [ ] Function `detectLocaleFromURL` correctly extracts locale from path
- [ ] Regex or parsing is accurate for `/fr/*`, `/en/*` patterns
- [ ] Returns correct value for nested paths (e.g., `/fr/articles/slug` → `fr`)
- [ ] Handles edge cases:
  - [ ] Root path `/` returns undefined
  - [ ] Path without prefix `/articles` returns undefined
  - [ ] Trailing slash `/fr/` returns `fr`
  - [ ] Invalid language `/de/articles` returns undefined
  - [ ] Uppercase `/FR/` (document expected behavior)

##### Validation

- [ ] Detected locale validated against `locales` array
- [ ] Only valid locales (`fr`, `en`) returned
- [ ] Invalid locales return undefined (not false/null)

##### Code Quality

- [ ] Function is pure (no side effects)
- [ ] JSDoc documents parameter and return type
- [ ] Examples included in JSDoc (e.g., `// detectLocaleFromURL('/fr/articles') → 'fr'`)
- [ ] Variable names are clear (`pathname`, `locale`, not abbreviated)
- [ ] Comments explain regex or parsing logic

##### Type Safety

- [ ] Return type is `Locale | undefined`
- [ ] Parameter type is `string`
- [ ] No `any` types
- [ ] TypeScript strict mode compatible

##### Performance

- [ ] Regex pattern is efficient (no backtracking)
- [ ] No unnecessary string operations
- [ ] Fast enough for every request (no expensive operations)

---

### Commit 3: Implement Language Detection from Cookies and Browser Headers

**Files Modified**: `src/middleware.ts`
**Size**: ~120 lines
**Review Time**: 15–20 minutes

#### Review Checklist

##### Cookie Detection

- [ ] `NEXT_LOCALE` cookie correctly extracted from request
- [ ] Cookie value validated against `locales` array
- [ ] Returns undefined if cookie missing or invalid
- [ ] Safe string handling (no XSS risks from cookie value)
- [ ] Handles empty/null cookie values gracefully

##### Accept-Language Header Parsing

- [ ] Header parsing function handles various formats correctly:
  - [ ] Simple: `fr` → `['fr']`
  - [ ] Multiple: `fr,en` → `['fr', 'en']`
  - [ ] Quality values: `fr,en;q=0.9` → `['fr', 'en']` (correct order)
  - [ ] Reordered quality: `en;q=0.8,fr;q=0.9` → `['fr', 'en']` (respects q values)
  - [ ] Language variants: `fr-FR` → matches `fr`
  - [ ] Complex: `fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7` (correct priority)

- [ ] Quality value (q) parsing is correct:
  - [ ] Default q=1.0 if not specified
  - [ ] Properly handles `q=0.9`, `q=0.8`, etc.
  - [ ] Sorts by quality value (highest first)

- [ ] Edge cases handled:
  - [ ] Empty header → empty array
  - [ ] Malformed quality: `fr;q=invalid` → handled gracefully
  - [ ] Missing quality value → defaults to 1.0
  - [ ] Whitespace handling: `fr, en` vs `fr,en`

##### Locale Matching

- [ ] Parsed languages matched against `locales` array
- [ ] First supported language returned (respects priority)
- [ ] Language variants matched correctly (`en-US` matches `en`)
- [ ] Returns undefined if no supported language found

##### Code Quality

- [ ] Functions are pure (no side effects)
- [ ] `parseAcceptLanguage` returns array of strings
- [ ] `getLocaleFromHeader` returns `Locale | undefined`
- [ ] JSDoc with examples for complex parsing logic
- [ ] Comments explain quality value handling
- [ ] Clear variable names

##### Type Safety

- [ ] Return types are correct
- [ ] No `any` types (except justified)
- [ ] Array operations type-safe
- [ ] TypeScript strict mode compatible

##### Performance

- [ ] No expensive regex operations
- [ ] Parsing is efficient (O(n) for header length)
- [ ] Fast enough for every request

---

### Commit 4: Implement Redirect Logic for Unsupported Languages

**Files Modified**: `src/middleware.ts`
**Size**: ~100 lines
**Review Time**: 15–20 minutes

#### Review Checklist

##### Detection Priority

- [ ] `detectLocale` function implements correct priority:
  1. [ ] URL path detection (highest priority)
  2. [ ] Cookie detection
  3. [ ] Header detection
  4. [ ] Default to French (lowest priority)

- [ ] Priority is respected in code:
  - [ ] URL detected → stop (don't check cookie)
  - [ ] URL missing, cookie detected → stop (don't check header)
  - [ ] Both missing, header detected → use header
  - [ ] All missing → default to French

##### Redirect Logic

- [ ] Redirect only when needed:
  - [ ] Unsupported language in URL → redirect to default
  - [ ] Already-correct URL → no redirect
  - [ ] `/de/articles` → redirects to `/fr/articles`
  - [ ] `/fr/articles` → no redirect

- [ ] Redirect preserves path and query:
  - [ ] `/de/articles` → `/fr/articles` (path preserved)
  - [ ] `/de/articles?page=2` → `/fr/articles?page=2` (query preserved)
  - [ ] `/de/api/search?q=test` → `/fr/api/search?q=test` (nested, query preserved)

- [ ] HTTP status code:
  - [ ] Uses HTTP 307 (Temporary Redirect)
  - [ ] Not 301 (permanent) or 302 (ambiguous)

##### Public Route Exclusion

- [ ] Public routes correctly excluded:
  - [ ] `/_next/*` (Next.js internals)
  - [ ] `/api/*` (API routes)
  - [ ] `/public/*` (static files)
  - [ ] `/images/*` (image files)

- [ ] Exclusion is efficient:
  - [ ] Early returns for public routes
  - [ ] No processing overhead
  - [ ] Matcher pattern is clear

##### Infinite Redirect Prevention

- [ ] Code prevents infinite redirects:
  - [ ] Checks if URL already has correct language
  - [ ] Only redirects if mismatch found
  - [ ] Example: `/fr/articles` with `fr` detected → no redirect

- [ ] Edge cases handled:
  - [ ] User manually navigates to wrong language
  - [ ] Cookie changes language mid-session
  - [ ] Browser header changes

##### Code Quality

- [ ] `detectLocale` returns `Locale` (never undefined)
- [ ] Main middleware function is well-organized
- [ ] Comments explain redirect decision logic
- [ ] JSDoc documents function behavior
- [ ] Variable names are clear
- [ ] No magic strings (use constants for routes)

##### Type Safety

- [ ] All types are correct
- [ ] No `any` types
- [ ] TypeScript strict mode compatible
- [ ] Request/Response types correct

##### Cloudflare Compatibility

- [ ] No Node.js-only APIs used (fs, crypto from node)
- [ ] Uses Web APIs (Request, Response, URL)
- [ ] Compatible with edge runtime constraints
- [ ] No process.env in edge context

---

### Commit 5: Write Comprehensive Unit Tests and Achieve ≥80% Coverage

**Files Created**: `src/middleware.test.ts`, possibly `src/lib/i18n/detection.test.ts`
**Size**: ~450 lines
**Review Time**: 20–25 minutes

#### Review Checklist

##### Test Structure

- [ ] Tests organized logically (by function tested)
- [ ] Setup/teardown properly configured
- [ ] Mocks declared at top of file
- [ ] Test utilities imported correctly

##### URL Detection Tests

- [ ] Tests for valid URLs:
  - [ ] `/fr/*` patterns
  - [ ] `/en/*` patterns
  - [ ] Nested paths: `/fr/articles/slug`

- [ ] Tests for invalid URLs:
  - [ ] Unsupported language: `/de/*`
  - [ ] No language prefix: `/articles`
  - [ ] Root path: `/`

- [ ] Tests for edge cases:
  - [ ] Trailing slashes: `/fr/` vs `/fr`
  - [ ] Uppercase: `/FR/articles` (document behavior)
  - [ ] Double slashes: `/fr//articles`

- [ ] Coverage: All URL parsing code tested

##### Cookie Detection Tests

- [ ] Tests for valid values:
  - [ ] `NEXT_LOCALE=fr`
  - [ ] `NEXT_LOCALE=en`

- [ ] Tests for invalid/missing:
  - [ ] Unsupported: `NEXT_LOCALE=de`
  - [ ] Missing cookie
  - [ ] Empty value: `NEXT_LOCALE=`

- [ ] Coverage: All cookie code tested

##### Header Parsing Tests

- [ ] Tests for simple formats:
  - [ ] Single locale: `fr`
  - [ ] Multiple: `fr,en`

- [ ] Tests for quality values:
  - [ ] With q: `fr,en;q=0.9`
  - [ ] Reordered by q: `en;q=0.8,fr;q=0.9`
  - [ ] Complex: `fr-FR,fr;q=0.9,en-US;q=0.8`

- [ ] Tests for edge cases:
  - [ ] Malformed quality: `fr;q=invalid`
  - [ ] Language variants: `en-US` → `en`
  - [ ] Empty header

- [ ] Coverage: All header parsing code tested

##### Detection Hierarchy Tests

- [ ] Tests for priority:
  - [ ] URL > Cookie: `/fr/*` + cookie `en` → `fr`
  - [ ] URL > Header: `/en/*` + header `fr` → `en`
  - [ ] Cookie > Header: cookie `en` + header `fr` → `en`
  - [ ] Header > Default: header `en` + no URL/cookie → `en`
  - [ ] Default only: no sources → `fr`

- [ ] Coverage: All priority logic tested

##### Redirect Logic Tests

- [ ] Tests for redirect necessity:
  - [ ] No redirect if correct: `/fr/articles` → no redirect
  - [ ] Redirect if invalid: `/de/articles` → `/fr/articles`

- [ ] Tests for preservation:
  - [ ] Path preserved: `/de/articles/slug` → `/fr/articles/slug`
  - [ ] Query preserved: `/de/?page=2` → `/fr/?page=2`

- [ ] Tests for public routes:
  - [ ] `/_next/*` excluded
  - [ ] `/api/*` excluded
  - [ ] `/public/*` excluded

- [ ] Coverage: All redirect code tested

##### Test Quality

- [ ] Test names are descriptive:
  - [ ] ✅ "should detect language from /fr/ URL path"
  - [ ] ❌ "test URL" (too vague)

- [ ] Each test focuses on single behavior (not multiple assertions when possible)

- [ ] Edge cases are tested (empty, null, invalid values)

- [ ] Mocks are appropriate:
  - [ ] Next.js modules mocked correctly
  - [ ] Mock setup is clear and documented

- [ ] No flaky tests:
  - [ ] Deterministic (same input always same output)
  - [ ] No timing dependencies
  - [ ] No external service calls

- [ ] Tests focused on behavior, not implementation:
  - [ ] Testing what function returns (behavior)
  - [ ] Not testing internal variable names (implementation)

##### Coverage Report

- [ ] All tests run successfully: `pnpm test` passes
- [ ] Coverage report generated: `pnpm test:coverage`
- [ ] Overall coverage ≥80% (target 85%+)
- [ ] Individual modules covered:
  - [ ] URL detection: 100%
  - [ ] Cookie detection: 100%
  - [ ] Header parsing: 100%
  - [ ] Redirect logic: 100%

- [ ] No critical untested code paths

##### Type Safety in Tests

- [ ] All test code is typed
- [ ] Mock types are correct
- [ ] No `any` types in tests (except justified)
- [ ] Test utilities are typed

---

## ✅ Global Validation After All 5 Commits

After reviewing all commits, perform final validation:

### Architecture & Design

- [ ] Detection priority is logical (URL > Cookie > Header > Default)
- [ ] Functions have clear separation of concerns
- [ ] No code duplication
- [ ] Reusable utility functions (not mixed with logic)
- [ ] Design is extensible (easy to add new detection sources)

### Type Safety

- [ ] No `any` types (unless justified)
- [ ] All functions properly typed
- [ ] TypeScript strict mode compatible
- [ ] Return types always valid (no "impossible" undefined cases)

### Performance

- [ ] No obvious bottlenecks
- [ ] Public route exclusion works (early returns)
- [ ] No expensive operations in hot path
- [ ] Regex patterns efficient (no backtracking)

### Cloudflare Compatibility

- [ ] No Node.js-only APIs (fs, node crypto, process)
- [ ] Uses Web APIs only
- [ ] Works with edge runtime constraints
- [ ] No synchronous I/O or blocking operations

### Documentation

- [ ] JSDoc comments on all public functions
- [ ] Complex logic has explanatory comments
- [ ] Examples in documentation where helpful
- [ ] Type definitions clear and documented

### Code Quality

- [ ] Consistent naming conventions
- [ ] No console.logs or debug code
- [ ] No commented-out code
- [ ] Follows project style from CLAUDE.md

---

## 📝 Feedback Template

Use this template to provide comprehensive review feedback:

```markdown
## Review Feedback - Phase 1

**Reviewer**: [Your Name]
**Date**: [Date]
**Commits Reviewed**: [1/5, 2/5, etc., or "all"]

### ✅ Strengths

- [What was done well]
- [Specific example: e.g., "Excellent handling of Accept-Language quality values"]
- [Good pattern observed: e.g., "Pure functions with no side effects"]

### 🔧 Required Changes

1. **[Commit Number] - [File/Function]**: [Issue description]
   - **Why**: [Why this is important]
   - **Suggestion**: [How to fix]
   - **Example**: [Code example if helpful]

2. [Repeat for each required change]

### 💡 Suggestions (Optional)

- [Nice-to-have improvements]
- [Alternative approaches to consider]
- [Performance optimization ideas]

### ❓ Questions

1. [Question about implementation choice]
2. [Question about edge case handling]

### 📊 Verdict

- [ ] ✅ **APPROVED** - Ready to merge
- [ ] 🔧 **CHANGES REQUESTED** - Address items above, then re-submit
- [ ] ❌ **REJECTED** - Major rework needed

### Next Steps

[What should happen next - approve, request changes, schedule discussion, etc.]
```

---

## 🎯 Review Checklist Summary

Use this quick checklist to ensure thorough review:

### Before Reviewing

- [ ] Read IMPLEMENTATION_PLAN.md to understand strategy
- [ ] Understand detection hierarchy: URL > Cookie > Header > Default
- [ ] Know expected behavior from story specification

### During Review

- [ ] Review Commit 1: Types and structure
- [ ] Review Commit 2: URL detection
- [ ] Review Commit 3: Cookie and header detection
- [ ] Review Commit 4: Redirect logic
- [ ] Review Commit 5: Unit tests
- [ ] Check TypeScript: `pnpm tsc --noEmit`
- [ ] Check linting: `pnpm lint`
- [ ] Check tests: `pnpm test`
- [ ] Check coverage: `pnpm test:coverage` (≥80%)

### After Reviewing

- [ ] Provide feedback using feedback template
- [ ] Set verdict: Approved / Changes Requested / Rejected
- [ ] Approve for merge if all checks pass
- [ ] Document any follow-up tasks

---

## ❓ FAQ

**Q: What if I disagree with an implementation choice?**
A: Discuss with developer. If it works correctly and follows spec, it may be acceptable. Document rationale.

**Q: Should I review tests as thoroughly as code?**
A: Yes. Tests are critical. Check test quality, coverage, and edge cases.

**Q: How detailed should feedback be?**
A: Specific enough to be actionable. Include file, function, and suggestion.

**Q: Can I approve with minor comments?**
A: Yes. Mark as approved and note that comments are optional improvements.

**Q: What if tests don't have 80% coverage?**
A: Request changes to achieve target coverage.

---

## 📚 Reference Documents

- **Story Specification**: [story_1.3.md](../../story_1.3.md)
- **Implementation Plan**: [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md)
- **Commit Checklist**: [COMMIT_CHECKLIST.md](../COMMIT_CHECKLIST.md)
- **Testing Guide**: [TESTING.md](./TESTING.md)
- **Project Standards**: [CLAUDE.md](/CLAUDE.md)

---

**Phase 1 — Code Review Guide Complete** ✅
