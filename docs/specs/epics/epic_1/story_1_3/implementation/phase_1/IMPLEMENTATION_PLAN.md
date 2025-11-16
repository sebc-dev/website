# Phase 1 — Atomic Implementation Plan

**Objective**: Implement core language detection logic from URL, cookies, and browser headers with proper validation and redirect handling.

---

## 🎯 Overview

### Why an Atomic Approach?

The implementation is split into **5 independent commits** to:

✅ **Facilitate review** - Each commit focuses on a single responsibility (types → URL detection → header detection → redirects → tests)
✅ **Enable rollback** - If a commit has issues, revert it without breaking everything else
✅ **Progressive type-safety** - Types validate at each step; detection logic builds progressively
✅ **Tests as you go** - Commit 5 adds comprehensive tests to validate all previous work
✅ **Continuous documentation** - Each commit can be understood independently

### Global Strategy

```
[Commit 1]  →  [Commit 2]   →  [Commit 3]   →  [Commit 4]    →  [Commit 5]
   Types      URL Detection   Header & Cookie  Redirect Logic    Unit Tests
    ↓             ↓               ↓               ↓                ↓
  Foundation   Language         Language       Language        Validation
              Detection from    Detection from  Routing         & Coverage
              URL Path          Browser/Cookie
```

---

## 📦 The 5 Atomic Commits

### Commit 1: Set Up Middleware Structure and Type Definitions

**Files**: `src/middleware.ts`, `i18n/config.ts`, `i18n/types.ts`, `tsconfig.json`
**Size**: ~80 lines of code
**Duration**: 20–30 min (implementation) + 10 min (review)

**Content**:

- Create `src/middleware.ts` with middleware skeleton (no logic yet)
- Export empty middleware function from `src/middleware.ts`
- Configure `i18n/config.ts` with routing configuration (localePrefix, prefixMode)
- Export locale types for type-safe language handling
- Register middleware path in `tsconfig.json` if needed
- Create type definitions for request/response context

**Why it's atomic**:

- Establishes foundation for all subsequent language detection logic
- Types are usable independently for validation
- No complex logic—purely structural setup
- Can be validated with TypeScript only
- Sets up import paths and configuration patterns

**Technical Validation**:

```bash
pnpm tsc --noEmit
pnpm lint
```

**Expected Result**: TypeScript accepts middleware skeleton, no type errors.

**Review Criteria**:

- [ ] `src/middleware.ts` exists and exports middleware function
- [ ] Type definitions are clear and well-documented
- [ ] `i18n/config.ts` includes routing configuration
- [ ] `tsconfig.json` has middleware path registered
- [ ] No TypeScript errors (`pnpm tsc --noEmit` passes)
- [ ] Code follows project conventions from CLAUDE.md

---

### Commit 2: Implement Language Detection from URL Path

**Files**: `src/middleware.ts`
**Size**: ~80 lines of code
**Duration**: 30–45 min (implementation) + 15 min (review)

**Content**:

- Extract locale from URL path (e.g., `/fr/articles` → `fr`)
- Use regex or pathname parsing to detect language prefix
- Validate detected language against `locales` from `i18n/config.ts`
- Return detected locale if valid, undefined if invalid
- Create utility function: `detectLocaleFromURL(pathname: string): Locale | undefined`
- Handle edge cases: root path `/`, trailing slashes, case-sensitivity
- Document detection logic with JSDoc comments

**Why it's atomic**:

- Single responsibility: URL detection only (no redirects, no cookie handling)
- Can be tested independently with URL patterns
- Builds on foundation from Commit 1
- Clear input/output contract
- No external dependencies or side effects

**Technical Validation**:

```bash
pnpm tsc --noEmit
pnpm lint
```

**Expected Result**: Middleware can parse URL paths and extract locale. No type errors.

**Review Criteria**:

- [ ] URL parsing is correct for `/fr/*`, `/en/*` patterns
- [ ] Invalid language prefixes are handled gracefully
- [ ] Regex patterns are efficient and well-documented
- [ ] Edge cases tested (root path, trailing slashes, uppercase)
- [ ] Function is pure (no side effects)
- [ ] JSDoc comments document parameters and return types

---

### Commit 3: Implement Language Detection from Cookies and Browser Headers

**Files**: `src/middleware.ts`
**Size**: ~120 lines of code
**Duration**: 45–60 min (implementation) + 15 min (review)

**Content**:

- Implement cookie reading: Extract `NEXT_LOCALE` cookie value
- Implement cookie validation: Verify cookie contains valid locale code
- Implement browser header parsing: Parse `Accept-Language` header
- Handle quality values: `Accept-Language: fr,en;q=0.9,de;q=0.5`
- Extract language codes from Accept-Language (split by `,`, parse quality values)
- Match parsed languages against supported locales in priority order
- Create utility functions:
  - `getLocaleFromCookie(cookies: RequestCookies): Locale | undefined`
  - `getLocaleFromHeader(headerValue: string): Locale | undefined`
  - `parseAcceptLanguage(header: string): string[]` (returns locales in priority order)
- Fallback to `defaultLocale` (French) if no match found
- Document detection logic with examples

**Why it's atomic**:

- Focuses on reading and parsing (no redirect logic)
- Complements URL detection from Commit 2
- Can be tested independently with various header formats
- Clear input/output contracts
- Builds on middleware structure from Commit 1

**Technical Validation**:

```bash
pnpm tsc --noEmit
pnpm lint
```

**Expected Result**: Middleware can detect language from cookies and headers. All parsing works correctly.

**Review Criteria**:

- [ ] Cookie reading is correct and safe (no undefined errors)
- [ ] Accept-Language header parsing handles quality values
- [ ] Language code extraction respects priority order
- [ ] Fallback to default locale works
- [ ] All utility functions are pure and testable
- [ ] JSDoc includes examples of header parsing
- [ ] No XSS vulnerabilities in string parsing

---

### Commit 4: Implement Redirect Logic for Unsupported Languages

**Files**: `src/middleware.ts`
**Size**: ~100 lines of code
**Duration**: 30–45 min (implementation) + 15 min (review)

**Content**:

- Implement detection priority: URL → Cookie → Header → Default
- Create main detection function: `detectLocale(request: NextRequest): Locale`
- Determine when redirect is needed (unsupported language in URL)
- Build redirect response: `NextResponse.redirect()`
- Preserve path and query parameters during redirect (e.g., `/de/articles?page=2` → `/fr/articles?page=2`)
- Use HTTP 307 (Temporary Redirect) for protocol-safe redirects
- Configure public route exclusion (`/_next/*`, `/api/*`, `/public/*`)
- Create matcher function to determine if route needs middleware processing
- Add early returns for public routes (performance optimization)

**Why it's atomic**:

- Completes language detection pipeline (combines Commits 2 + 3)
- Implements core redirect logic
- Can be tested independently
- Builds on pure utility functions from previous commits
- Clear detection priority prevents ambiguity

**Technical Validation**:

```bash
pnpm tsc --noEmit
pnpm lint
pnpm build
```

**Expected Result**: Middleware can detect unsupported language and redirect appropriately. Build succeeds.

**Review Criteria**:

- [ ] Detection priority is correct (URL > Cookie > Header > Default)
- [ ] Redirect preserves path and query parameters
- [ ] HTTP 307 is used for redirects
- [ ] Public routes are excluded from middleware processing
- [ ] No infinite redirect loops (already-correct URLs don't redirect)
- [ ] Performance is acceptable (early returns for public routes)
- [ ] Cloudflare Workers runtime compatible (no Node.js APIs)

---

### Commit 5: Write Comprehensive Unit Tests and Achieve ≥80% Coverage

**Files**: `src/middleware.test.ts`, `src/lib/i18n/detection.test.ts`
**Size**: ~400–500 lines of test code
**Duration**: 60–90 min (implementation) + 20 min (review)

**Content**:

- Create unit tests for all detection functions from Commits 2–4
- Test URL detection with various patterns: `/fr/`, `/en/`, `/de/`, `/`, root
- Test cookie reading: valid cookie, missing cookie, invalid values
- Test Accept-Language parsing:
  - Simple: `fr`, `en`
  - With quality values: `fr,en;q=0.9`, `de;q=0.5,en;q=0.8`
  - Multiple locales: `fr-FR,fr;q=0.9,en-US;q=0.8`
  - Fallback to default: unsupported language only
- Test redirect logic:
  - Unsupported language redirect
  - Path preservation during redirect
  - Query parameter preservation
  - No redirect for already-correct URLs
- Test middleware matcher function:
  - Public routes excluded (`/_next/*`, `/api/*`)
  - App routes included (`/fr/*`, `/en/*`, `/`)
- Mock next-intl and Next.js modules as needed
- Use Vitest for test framework (project standard)
- Achieve ≥80% code coverage (target: 85%+)
- Document test patterns and edge cases
- Test coverage report: `pnpm test:coverage`

**Why it's atomic**:

- Comprehensive validation of previous 4 commits
- Can be implemented after Commit 4 (no code changes to middleware)
- Achieves coverage target for Phase 1
- Documents expected behavior through tests
- Ensures all AC 1–4, 7–8 are testable

**Technical Validation**:

```bash
pnpm test
pnpm test:coverage
pnpm tsc --noEmit
pnpm lint
```

**Expected Result**: All tests pass, coverage ≥80%, no type errors or lint issues.

**Review Criteria**:

- [ ] All detection functions tested with edge cases
- [ ] URL detection tests cover: /fr/, /en/, /de/, /, root path
- [ ] Cookie tests cover: valid, missing, invalid values
- [ ] Header parsing tests cover: simple, quality values, multiple locales
- [ ] Redirect logic tests verify path and query preservation
- [ ] Public route exclusion tests pass
- [ ] Code coverage ≥80% (preferably 85%+)
- [ ] Test names are descriptive (`detect locale from URL with /fr/ prefix`)
- [ ] No flaky tests; all tests are deterministic
- [ ] Mocks are appropriate and clearly documented

---

## 🔄 Implementation Workflow

### Step-by-Step

1. **Read specification**: Understand Commit 1-5 scope from COMMIT_CHECKLIST.md
2. **Setup environment**: Follow ENVIRONMENT_SETUP.md (ensure next-intl installed)
3. **Implement Commit 1**: Follow COMMIT_CHECKLIST.md section for Commit 1
4. **Validate Commit 1**: Run validation commands
5. **Commit Commit 1**: Use provided commit message
6. **Repeat for Commits 2–5**: Each follows same pattern
7. **Final validation**: Complete VALIDATION_CHECKLIST.md
8. **Code review**: Use guides/REVIEW.md for self-review
9. **Phase completion**: Mark Phase 1 as ✅ COMPLETED

### Validation at Each Step

After each commit:

```bash
# Type-checking
pnpm tsc --noEmit

# Linting
pnpm lint

# Tests (for Commit 5 onwards)
pnpm test

# Build
pnpm build
```

All must pass before moving to next commit.

---

## 📊 Commit Metrics

| Commit    | Purpose                | Files | Lines    | Implementation | Review     | Total      |
| --------- | ---------------------- | ----- | -------- | -------------- | ---------- | ---------- |
| 1         | Structure & Types      | 4     | ~80      | 20–30 min      | 10 min     | 30–40 min  |
| 2         | URL Detection          | 1     | ~80      | 30–45 min      | 15 min     | 45–60 min  |
| 3         | Cookie & Header        | 1     | ~120     | 45–60 min      | 15 min     | 60–75 min  |
| 4         | Redirect Logic         | 1     | ~100     | 30–45 min      | 15 min     | 45–60 min  |
| 5         | Unit Tests             | 2     | ~450     | 60–90 min      | 20 min     | 80–110 min |
| **TOTAL** | **Language Detection** | **9** | **~830** | **3.5–4.5h**   | **1.5–2h** | **5–6.5h** |

---

## ✅ Atomic Approach Benefits

### For Developers

- 🎯 **Clear focus**: One commit at a time with single responsibility
- 🧪 **Testable**: Each commit validated independently
- 📝 **Documented**: Clear commit messages and JSDoc comments
- 🔙 **Rollback-safe**: Can revert individual commits if needed

### For Reviewers

- ⚡ **Fast review**: 10–20 min per commit (except tests: 20 min)
- 🔍 **Focused**: Single responsibility to check
- ✅ **Quality**: Easier to spot logic issues
- 📊 **Metrics**: Clear progress after each commit

### For the Project

- 🔄 **Rollback-safe**: Revert without breaking everything
- 📚 **Historical**: Clear progression in git history
- 🏗️ **Maintainable**: Easy to understand later
- 🧪 **Tested**: Coverage increases progressively

---

## 📝 Best Practices

### Commit Messages

Format:

```
feat(middleware): implement language detection from URL path (Commit 1/5)

- Extract locale from URL path prefix (/fr/, /en/)
- Validate against supported locales from i18n/config
- Return undefined for invalid language codes
- Set foundation for language detection pipeline

Part of Phase 1 — Language Detection Foundation (Story 1.3)
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

### Code Quality Standards

- ✅ Use TypeScript with full type coverage
- ✅ Add JSDoc comments for exported functions and complex logic
- ✅ Follow project conventions from CLAUDE.md
- ✅ Keep functions pure (no side effects when possible)
- ✅ Use meaningful variable names
- ✅ Handle edge cases explicitly

### Testing Standards

- ✅ Test behavior, not implementation details
- ✅ Use descriptive test names: `should detect language from /fr/ URL path`
- ✅ One assertion per test (when possible)
- ✅ Test edge cases: empty strings, null values, invalid formats
- ✅ Mock external dependencies appropriately
- ✅ Achieve ≥80% coverage for Commit 5

---

## ⚠️ Important Points

### Do's

- ✅ Follow the commit order (dependencies are sequential)
- ✅ Validate after each commit using provided commands
- ✅ Write tests in Commit 5 to validate previous work
- ✅ Use provided commit messages as templates
- ✅ Consult COMMIT_CHECKLIST.md for detailed checklists
- ✅ Check Cloudflare Workers compatibility (no Node.js fs/crypto)

### Don'ts

- ❌ Skip commits or combine them (breaks atomic principle)
- ❌ Commit without running validations
- ❌ Add features not in this phase spec
- ❌ Create infinite redirects or redirect loops
- ❌ Use Node.js-only APIs (fs, node crypto, etc.)
- ❌ Ignore TypeScript errors or ESLint warnings

---

## 🔗 Dependencies and Prerequisites

### Before Phase 1

- ✅ **Story 1.1 complete**: next-intl library installed and configured
- ✅ **Story 1.2 complete**: Message files created (fr.json, en.json)
- ✅ **Node.js 18+**: Project environment ready
- ✅ **pnpm installed**: Package manager available

### External Dependencies

This phase uses:

- **next-intl** (already installed from Story 1.1)
- **Next.js 15** (already in project)
- **TypeScript** (already configured)
- **Vitest** (already configured)

No new dependencies need to be installed.

---

## 🚨 Common Pitfalls and Solutions

### Pitfall 1: Infinite Redirects

**Issue**: Middleware redirects user to `/fr/` → checks path → redirects again

**Solution**: Check if URL already has correct language prefix before redirecting

```typescript
// DON'T: Always redirect
if (!hasLanguagePrefix(pathname)) {
  return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
}

// DO: Check if redirect is necessary
if (
  hasLanguagePrefix(pathname) &&
  getLocaleFromURL(pathname) === detectedLocale
) {
  return NextResponse.next(); // Already correct, don't redirect
}
```

### Pitfall 2: Accept-Language Parsing

**Issue**: Complex header format causes parsing errors

**Solution**: Handle quality values, multiple locales, and language variants

```
Header: "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.5"

Parse order:
1. "fr" (from fr-FR, q=1.0)
2. "fr" (q=0.9) - skip (duplicate)
3. "en" (from en-US, q=0.8)
4. "de" (q=0.5) - unsupported, skip

Result: Try fr first, then en, default to fr
```

### Pitfall 3: Query Parameter Loss

**Issue**: Redirecting `/de/articles?page=2` to `/fr/articles` loses query params

**Solution**: Use `NextResponse.redirect()` which preserves query string

```typescript
const url = new URL(`/${detectedLocale}${pathname}`, request.url);
// url.search is automatically preserved from request.url
return NextResponse.redirect(url);
```

---

## ❓ FAQ

**Q: Why 5 commits? Can I combine them?**
A: Each commit serves a purpose. Combining them defeats atomic principle and makes review harder. Follow the sequence.

**Q: What if URL detection fails?**
A: Fall back to cookie detection, then header detection, then default to French.

**Q: Should I implement cookie creation in Phase 1?**
A: No. Cookie creation is Phase 2. Phase 1 only reads existing cookies.

**Q: How do I test middleware without running the app?**
A: Write unit tests using Vitest. Mock Next.js modules. Test pure functions independently.

**Q: Can I skip the types in Commit 1?**
A: No. Types ensure type-safety for all subsequent commits.

**Q: What about root path `/`? How do I handle it?**
A: Detect language, then redirect to `/fr/` or `/en/` in Phase 2. Phase 1 focuses on detection only.

---

## 📚 Reference Documents

### Internal

- Story Specification: [story_1.3.md](../../story_1.3.md)
- Phase Planning: [PHASES_PLAN.md](../PHASES_PLAN.md)
- Commit Checklist: [COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md)
- Environment Setup: [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)
- Testing Guide: [guides/TESTING.md](./guides/TESTING.md)
- Review Guide: [guides/REVIEW.md](./guides/REVIEW.md)

### External

- next-intl documentation: https://next-intl-docs.vercel.app/
- Next.js middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
- HTTP Accept-Language: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language
- Cloudflare Workers: https://developers.cloudflare.com/workers/

---

**Phase 1 — Implementation Plan Complete** ✅
