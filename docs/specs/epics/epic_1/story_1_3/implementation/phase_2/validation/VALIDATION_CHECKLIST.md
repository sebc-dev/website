# Phase 2 - Final Validation Checklist

Complete validation checklist before marking Phase 2 as complete.

---

## ✅ 1. Commits and Structure

- [ ] All 4 atomic commits completed
- [ ] Commits follow naming convention (gitmoji + description)
- [ ] Commit order is logical:
  - Commit 1: Cookie utilities
  - Commit 2: Root path redirect
  - Commit 3: next-intl integration
  - Commit 4: Tests
- [ ] Each commit is focused (single responsibility)
- [ ] No merge commits in phase branch
- [ ] Git history is clean (no fixup commits unless necessary)
- [ ] Branch is up to date with main

---

## ✅ 2. Type Safety (TypeScript)

- [ ] No TypeScript errors: `pnpm tsc --noEmit`
- [ ] No `any` types (unless justified and documented)
- [ ] All interfaces exported from `i18n/types.ts` or appropriate module
- [ ] Type inference works correctly
- [ ] NextRequest/NextResponse types correct
- [ ] next-intl types imported and used correctly
- [ ] No type warnings in build output

**Validation**:

```bash
pnpm tsc --noEmit
```

**Expected Output**:

```
# No errors
```

---

## ✅ 3. Code Quality

- [ ] Code follows project style guide (naming conventions, spacing)
- [ ] No code duplication
- [ ] Clear and consistent naming:
  - Variables: `detectedLanguage`, `setCookieHeader`, `isRootPath`
  - Functions: `getCookie()`, `handleRootPathRedirect()`, `validateLocale()`
  - Files: Use hyphens for file names
- [ ] Complex logic is documented
- [ ] No commented-out code
- [ ] No debug statements (console.log, debugger)
- [ ] Error handling is robust
- [ ] No unnecessary imports or exports
- [ ] Helper functions extracted and reused

**Validation**:

```bash
pnpm lint
```

**Expected Output**:

```
✓ No errors
```

---

## ✅ 4. Tests

- [ ] All unit tests passing: `pnpm test`
- [ ] All integration tests passing: `pnpm test`
- [ ] Coverage >80% for all Phase 2 code:
  - `src/lib/i18n/cookie.ts`: >80%
  - `src/lib/i18n/redirect.ts`: >80%
  - `src/middleware.ts`: >80%
- [ ] Tests are meaningful (not just for coverage)
- [ ] Edge cases tested:
  - [ ] Cookie operations (create, read, delete, validate)
  - [ ] Redirect scenarios (root, non-root, query params, status codes)
  - [ ] Language scenarios (fr, en, invalid)
- [ ] Error cases tested
- [ ] No flaky tests (run twice, should pass both times)
- [ ] No skipped tests (`.skip()`, `.only()`)
- [ ] Tests run in CI successfully

**Validation**:

```bash
pnpm test
pnpm test:coverage
```

**Expected Output**:

```
Tests: XX passed, XX total (>25 tests)
Coverage: >80% for Phase 2 files
```

---

## ✅ 5. Build and Compilation

- [ ] Build succeeds without errors: `pnpm build`
- [ ] Build succeeds without warnings (or documented)
- [ ] No dependency conflicts
- [ ] Build artifacts generated correctly
- [ ] No console errors during build

**Validation**:

```bash
pnpm build
```

**Expected Output**:

```
✓ Build completed successfully
✓ Output in .next/ directory
```

---

## ✅ 6. Linting and Formatting

- [ ] ESLint passes with no errors: `pnpm lint`
- [ ] ESLint passes with no warnings (or documented)
- [ ] Code formatted consistently
- [ ] Import statements organized
- [ ] No trailing whitespace
- [ ] File ends with newline

**Validation**:

```bash
pnpm lint
pnpm exec prettier --check .
```

**Expected Output**:

```
✓ No linting errors
✓ Code is properly formatted
```

---

## ✅ 7. Documentation

- [ ] README or comments explain cookie configuration
- [ ] Middleware integration documented
- [ ] ENVIRONMENT_SETUP.md complete and accurate
- [ ] All commands in docs work
- [ ] Examples/usage documented
- [ ] Migration guide (if needed)
- [ ] This INDEX.md updated with actual dates/status
- [ ] Guides (REVIEW.md, TESTING.md) are complete

---

## ✅ 8. Cookie Management

- [ ] Cookie created with correct name: `NEXT_LOCALE`
- [ ] Cookie value is valid locale: 'fr' or 'en'
- [ ] Secure flags applied:
  - [ ] HttpOnly: true (prevents XSS access)
  - [ ] SameSite: 'lax' (CSRF protection)
  - [ ] Secure: true in production, false in dev
  - [ ] maxAge: 31536000 (1 year, verified)
  - [ ] path: / (site-wide)
- [ ] Cookie reading validates locale
- [ ] Cookie deletion works (maxAge=0)
- [ ] Cookie persists across requests
- [ ] Cloudflare Workers compatibility verified

---

## ✅ 9. Root Path Redirection

- [ ] Root path `/` redirects correctly
- [ ] Redirect status code: 307 Temporary Redirect
- [ ] Redirect target: `/fr/` or `/en/` based on detected language
- [ ] Non-root paths NOT redirected:
  - [ ] `/en/` stays `/en/`
  - [ ] `/fr/` stays `/fr/`
  - [ ] `/api/*` not affected
  - [ ] `/_next/*` not affected
- [ ] Query parameters preserved:
  - [ ] `/?foo=bar` → `/fr/?foo=bar`
- [ ] Edge cases handled:
  - [ ] Trailing slashes
  - [ ] Multiple query params
  - [ ] Empty paths
- [ ] No infinite redirect loops

---

## ✅ 10. next-intl Integration

- [ ] next-intl `middleware()` function imported
- [ ] Configuration correct:
  - [ ] `locales: ['fr', 'en']`
  - [ ] `defaultLocale: 'fr'`
  - [ ] `localePrefix: 'always'`
- [ ] i18n context properly initialized
- [ ] Components can use `useTranslations()`:
  - [ ] Test page uses `useTranslations('common')`
  - [ ] `getTranslations()` available in Server Components
- [ ] Middleware returns correct type: `NextResponse`
- [ ] Middleware matcher configured correctly
- [ ] Build includes next-intl types

---

## ✅ 11. Middleware Functionality

- [ ] Middleware runs on all routes (based on matcher)
- [ ] Public routes excluded:
  - [ ] Static assets (`/_next/*`)
  - [ ] API routes (if public)
  - [ ] Other public routes
- [ ] Language detection works (from Phase 1)
- [ ] Cookie set in response headers
- [ ] No infinite loops or conflicts
- [ ] Error handling for edge cases
- [ ] Cloudflare Workers runtime compatible

---

## ✅ 12. Code Review

- [ ] Self-review completed
- [ ] Code follows project standards
- [ ] Commit messages clear and descriptive
- [ ] All review checklist items from guides/REVIEW.md addressed
- [ ] Peer review (if required) approval obtained
- [ ] All feedback incorporated
- [ ] No unresolved review comments

---

## ✅ 13. Acceptance Criteria

Verify all AC from Phase 2 scope are met:

- [ ] AC5: Root path (`/`) redirects to `/fr/` or `/en/` ✅
- [ ] AC6: next-intl context initialized, `useTranslations()` available ✅
- [ ] AC9: Cookie set with HttpOnly, SameSite, Secure flags ✅
- [ ] Cookie persists across sessions (TTL: 1 year) ✅
- [ ] Related AC from Phase 1 still working:
  - [ ] AC1: Language detected from URL
  - [ ] AC2: Language detected from Accept-Language header
  - [ ] AC3: Language detected from cookie
  - [ ] AC4: Unsupported languages handled
  - [ ] AC7: Public routes excluded
  - [ ] AC8: Language validated

---

## ✅ 14. Performance

- [ ] No obvious bottlenecks
- [ ] Middleware execution lightweight
- [ ] Cookie parsing efficient
- [ ] Redirect logic efficient
- [ ] No large bundles added
- [ ] Build time reasonable
- [ ] No performance degradation from Phase 1

---

## ✅ 15. Security

- [ ] No sensitive data in cookies
- [ ] No information leakage in error messages
- [ ] Input validation present (locale validation)
- [ ] Cookie flags appropriate for production
- [ ] No CSRF vulnerabilities (SameSite flag set)
- [ ] No XSS vulnerabilities (HttpOnly flag set)
- [ ] HTTPS enforced in production (Secure flag)

---

## ✅ 16. Environment and Deployment

- [ ] Works in development environment
- [ ] Works with `pnpm dev`
- [ ] Works with `pnpm build && pnpm start` (production build)
- [ ] Environment variables documented
- [ ] All dependencies listed in package.json
- [ ] No hardcoded values (use env vars)
- [ ] Cookie behavior correct in both dev and production
- [ ] Cloudflare Workers runtime verified (via `pnpm preview` if available)

---

## 📋 Validation Commands Summary

Run all these commands before final approval:

```bash
# Install/update dependencies (if needed)
pnpm install

# Type-checking
pnpm tsc --noEmit

# Linting
pnpm lint

# Tests
pnpm test

# Coverage
pnpm test:coverage

# Build
pnpm build

# Verify no uncommitted changes (after all fixes)
git status
```

**All must pass with green checkmarks.**

---

## 📊 Success Metrics

| Metric            | Target             | Actual | Status |
| ----------------- | ------------------ | ------ | ------ |
| Commits           | 4                  | -      | ⏳     |
| Type Coverage     | 100% (zero errors) | -      | ⏳     |
| Test Coverage     | >80%               | -      | ⏳     |
| Unit Tests        | All pass           | -      | ⏳     |
| Integration Tests | All pass           | -      | ⏳     |
| Build Status      | ✅ Success         | -      | ⏳     |
| Lint Status       | ✅ Pass            | -      | ⏳     |
| AC Completion     | 100%               | -      | ⏳     |
| Code Quality      | No issues          | -      | ⏳     |

---

## 🎯 Final Verdict

Select one:

- [ ] ✅ **APPROVED** - Phase 2 is complete and ready
- [ ] 🔧 **CHANGES REQUESTED** - Issues to fix:
  - [List issues here]
- [ ] ❌ **REJECTED** - Major rework needed:
  - [List major issues here]

---

## 📝 Next Steps

### If Approved ✅

1. [ ] Update INDEX.md status to ✅ COMPLETED
2. [ ] Record actual implementation time
3. [ ] Prepare for Phase 3 (Testing, Edge Cases & Documentation)
4. [ ] Update EPIC_TRACKING.md:
   - Mark Phase 2 as complete
   - Update overall story status
5. [ ] Create feature branch for Phase 3
6. [ ] Schedule Phase 3 kickoff (E2E tests, edge cases, documentation)

### If Changes Requested 🔧

1. [ ] Address all feedback items (above)
2. [ ] Re-run validation: `pnpm test`, `pnpm build`, `pnpm lint`
3. [ ] Request re-review
4. [ ] Update status once approved

### If Rejected ❌

1. [ ] Document major issues
2. [ ] Schedule discussion with team
3. [ ] Plan rework strategy
4. [ ] Update timeline and estimates

---

## 📋 Sign-Off

**Validation completed by**: [Name/Role]
**Date**: [Date]
**Duration**: [Actual time spent on Phase 2]
**Notes**: [Any additional notes or observations]

---

**Phase 2 is complete when all checkboxes are checked! 🎉**

Once approved, Phase 3 can begin: Testing, Edge Cases & Documentation.
