# Phase 2 - Atomic Implementation Plan

**Objective**: Implement HTTP cookie handling with secure flags and integrate next-intl context initialization for component access to translations.

---

## 🎯 Overview

### Why an Atomic Approach?

The implementation is split into **4 independent commits** to:

✅ **Facilitate review** - Each commit focuses on a single responsibility
✅ **Enable rollback** - If a commit has issues, revert it without breaking everything
✅ **Progressive type-safety** - Types validate at each step
✅ **Tests as you go** - Tests accompany the relevant code
✅ **Continuous documentation** - Each commit can be documented independently

### Global Strategy

```
[Commit 1] → [Commit 2] → [Commit 3] → [Commit 4]
   Cookie       Root Path    next-intl      Unit +
   Utilities    Redirect     Context        Integration
                                           Tests
↓             ↓             ↓              ↓
100%          100%          100%           100%
complete      complete      complete       coverage
```

---

## 📦 The 4 Atomic Commits

### Commit 1: Implement cookie utility functions

**Files**:

- `src/lib/i18n/cookie.ts` (new, ~100 lines)
- `src/lib/i18n/cookie.test.ts` (new, ~150 lines)

**Size**: ~250 lines
**Duration**: 45-60 min (implementation) + 30-45 min (review)

**Content**:

- Create `src/lib/i18n/cookie.ts` with type-safe cookie utilities
- Export `getCookie(name)` - Read cookie value from request headers
- Export `setCookie(name, value, options)` - Create cookie header with secure flags
- Cookie options: `httpOnly=true`, `sameSite='lax'`, `secure=true` (prod only), `maxAge=31536000` (1 year)
- Validate cookie value against allowed locales
- Handle `Cloudflare Workers` runtime constraints (no Node.js `crypto` imports)
- Export `deleteCookie(name)` for future logout support
- Unit tests for cookie read/write/validation

**Why it's atomic**:

- Single responsibility: Cookie utility functions only
- No dependencies on other commits (can test in isolation)
- Provides reusable functions for Commit 2 & 3
- Fully testable without middleware integration

**Technical Validation**:

```bash
pnpm tsc src/lib/i18n/cookie.ts
pnpm test src/lib/i18n/cookie.test.ts
```

**Expected Result**:

- Cookie creation/reading working correctly
- All secure flags properly set
- Unit tests passing with >80% coverage
- No TypeScript errors

**Review Criteria**:

- [ ] Cookie functions are type-safe
- [ ] Secure flags match requirements (httpOnly, sameSite, secure)
- [ ] Cookie TTL correctly set to 1 year (31536000 seconds)
- [ ] Validation against allowed locales
- [ ] Cloudflare Workers runtime compatible (no Node.js crypto)
- [ ] Unit tests cover happy path and edge cases
- [ ] Error handling for invalid cookies

---

### Commit 2: Implement root path redirection logic

**Files**:

- `src/middleware.ts` (modified, add ~60 lines)
- `src/lib/i18n/redirect.ts` (new, ~80 lines)
- `src/lib/i18n/redirect.test.ts` (new, ~120 lines)

**Size**: ~260 lines
**Duration**: 45-60 min (implementation) + 30-45 min (review)

**Content**:

- Implement `handleRootPathRedirect(request, detectedLanguage)` in `src/lib/i18n/redirect.ts`
- Redirect root path `/` to `/fr/` or `/en/` based on detected language
- Use language detection priority from Phase 1: URL → Cookie → Header → Default (fr)
- Create appropriate `NextResponse` with 307 Temporary Redirect
- Preserve query parameters during redirect
- Handle edge cases: Empty paths, paths with trailing slashes
- Add type-safe response creation helper
- Unit tests for redirect logic (various language scenarios)

**Why it's atomic**:

- Single responsibility: Root path redirection only
- Builds on cookie utilities from Commit 1
- Can be tested independently with mocked detection
- No coupling to next-intl middleware yet

**Technical Validation**:

```bash
pnpm tsc src/middleware.ts src/lib/i18n/redirect.ts
pnpm test src/lib/i18n/redirect.test.ts
```

**Expected Result**:

- Root path `/` correctly redirected to `/fr/` or `/en/`
- Query parameters preserved
- Redirect status code 307 (Temporary)
- Edge cases handled (trailing slashes, empty paths)
- Unit tests passing

**Review Criteria**:

- [ ] Redirect logic uses correct language detection priority
- [ ] HTTP redirect status code is 307 (not 302 or 301)
- [ ] Query parameters preserved during redirect
- [ ] Handles trailing slashes correctly
- [ ] Type-safe response construction
- [ ] Tests cover all language scenarios (fr, en, unsupported)
- [ ] No infinite redirect loops

---

### Commit 3: Integrate next-intl middleware function

**Files**:

- `src/middleware.ts` (modified, add ~120 lines)
- `i18n/config.ts` (modified, update routing config)

**Size**: ~120 lines
**Duration**: 60-75 min (implementation) + 45-60 min (review)

**Content**:

- Import next-intl's `middleware` function
- Wrap detection and redirect logic with next-intl `middleware()`
- Configure middleware with `locales: ['fr', 'en']`, `defaultLocale: 'fr'`, `localePrefix: 'always'`
- Initialize i18n context via `middleware()` return value
- Set `NEXT_LOCALE` cookie via next-intl middleware or custom logic
- Ensure middleware runs before static file serving (check matcher config)
- Handle next-intl configuration in `i18n/config.ts` (routing mode)
- Type `NextRequest` and `NextResponse` correctly
- Add comments explaining next-intl integration points

**Why it's atomic**:

- Single responsibility: next-intl integration
- Depends on Commits 1 & 2 (cookie utilities, redirect logic)
- Enables component-level `useTranslations()` access
- Final piece before testing

**Technical Validation**:

```bash
pnpm tsc
pnpm build
```

**Expected Result**:

- next-intl middleware properly integrated
- i18n context available to components
- Components can use `useTranslations()` without errors
- Build succeeds without type errors
- Cookie set via middleware response headers

**Review Criteria**:

- [ ] next-intl `middleware()` correctly configured
- [ ] `localePrefix: 'always'` ensures `/fr/` and `/en/` prefixes
- [ ] i18n context properly initialized
- [ ] No type errors in middleware return
- [ ] Cookie set with correct headers from middleware
- [ ] Middleware matcher configured correctly
- [ ] Comments explain integration points

---

### Commit 4: Add unit + integration tests

**Files**:

- `src/lib/i18n/cookie.test.ts` (extended with integration scenarios)
- `src/lib/i18n/context.integration.test.ts` (new, ~180 lines)
- `src/middleware.test.ts` (new, ~200 lines)

**Size**: ~380 lines
**Duration**: 60-90 min (implementation) + 30-45 min (review)

**Content**:

- Unit tests for cookie creation with secure flags
- Unit tests for cookie reading and validation
- Unit tests for cookie expiration (TTL verification)
- Integration tests: Root path redirect → Cookie set → Context available
- Integration tests: Component can access `useTranslations()` after middleware
- Integration tests: Cookie persists across requests
- Mock next-intl `middleware()` function for isolated testing
- Mock `NextRequest` and `NextResponse` for middleware testing
- Test coverage for all success paths and error cases
- Coverage report targeting >80%

**Why it's atomic**:

- Single responsibility: Testing the entire Phase 2 implementation
- Validates all previous commits work together
- Ensures acceptance criteria AC5, AC6, AC9 met
- Final gate before moving to Phase 3

**Technical Validation**:

```bash
pnpm test src/lib/i18n/ src/middleware.test.ts
pnpm test:coverage
```

**Expected Result**:

- All unit tests passing
- All integration tests passing
- Code coverage >80%
- Zero type errors
- Ready for manual testing (Commit 3 output)

**Review Criteria**:

- [ ] Unit tests cover cookie create/read/delete/validation
- [ ] Integration tests verify middleware → cookie → context flow
- [ ] Edge cases tested (invalid cookies, missing headers, etc.)
- [ ] Mock usage appropriate (next-intl mocked, utilities tested)
- [ ] Coverage >80% for cookie, redirect, middleware code
- [ ] No flaky tests (timing issues, race conditions)
- [ ] Test names clearly describe what is tested

---

## 🔄 Implementation Workflow

### Step-by-Step

1. **Read specification**: Understand Phase 2 requirements fully
2. **Setup environment**: Follow ENVIRONMENT_SETUP.md
3. **Implement Commit 1**: Follow COMMIT_CHECKLIST.md - Create cookie utilities
4. **Validate Commit 1**: Run `pnpm test`, `pnpm tsc` - Must pass
5. **Review Commit 1**: Self-review against criteria
6. **Commit Commit 1**: Use provided commit message
7. **Implement Commit 2**: Create root path redirect logic
8. **Validate Commit 2**: Run validation commands - Must pass
9. **Review Commit 2**: Self-review against criteria
10. **Commit Commit 2**: Use provided commit message
11. **Implement Commit 3**: Integrate next-intl middleware
12. **Validate Commit 3**: Run `pnpm build` - Build must succeed
13. **Review Commit 3**: Self-review against criteria
14. **Commit Commit 3**: Use provided commit message
15. **Implement Commit 4**: Write comprehensive tests
16. **Validate Commit 4**: Run `pnpm test:coverage` - Coverage >80%
17. **Review Commit 4**: Self-review against criteria
18. **Commit Commit 4**: Use provided commit message
19. **Final validation**: Complete VALIDATION_CHECKLIST.md

### Validation at Each Step

After each commit:

```bash
# Type-checking
pnpm tsc

# Linting
pnpm lint

# Unit tests
pnpm test

# Build (especially after Commit 3)
pnpm build
```

All must pass before moving to next commit.

---

## 📊 Commit Metrics

| Commit        | Files  | Lines     | Implementation  | Review       | Total        |
| ------------- | ------ | --------- | --------------- | ------------ | ------------ |
| 1. Cookie     | 2      | ~250      | 45-60 min       | 30-45 m      | 75-105 m     |
| 2. Redirect   | 3      | ~260      | 45-60 min       | 30-45 m      | 75-105 m     |
| 3. Middleware | 2      | ~120      | 60-75 min       | 45-60 m      | 105-135m     |
| 4. Tests      | 3      | ~380      | 60-90 min       | 30-45 m      | 90-135 m     |
| **TOTAL**     | **10** | **~1010** | **210-285 min** | **135-195m** | **345-480m** |

**Total Time Estimate**: 5.75-8 hours (implementation + review + validation)

---

## ✅ Atomic Approach Benefits

### For Developers

- 🎯 **Clear focus**: One thing at a time (utilities → redirect → integration → testing)
- 🧪 **Testable**: Each commit validated independently
- 📝 **Documented**: Clear commit messages and purpose

### For Reviewers

- ⚡ **Fast review**: 30-60 min per commit
- 🔍 **Focused**: Single responsibility per commit
- ✅ **Quality**: Easier to spot issues in focused changes

### For the Project

- 🔄 **Rollback-safe**: Revert without breaking rest of middleware
- 📚 **Historical**: Clear progression in git history
- 🏗️ **Maintainable**: Easy to understand later

---

## 📝 Best Practices

### Commit Messages

Format:

```
type(scope): short description (max 50 chars)

- Point 1: detail
- Point 2: detail
- Point 3: justification if needed

Part of Phase 2 - Commit X/4
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

Examples:

```
✨ feat(i18n): implement cookie utility functions with secure flags

- Create src/lib/i18n/cookie.ts with type-safe cookie management
- Support HttpOnly, SameSite=Lax, Secure flags with 1-year TTL
- Add validation against allowed locales (fr, en)
- Export getCookie, setCookie, deleteCookie functions

Part of Phase 2 - Commit 1/4
```

### Review Checklist

Before committing:

- [ ] Code follows project style guide
- [ ] All tests pass (`pnpm test`)
- [ ] Types are correct (`pnpm tsc`)
- [ ] No console.logs or debug code
- [ ] Documentation updated if needed
- [ ] Lint passes (`pnpm lint`)

---

## ⚠️ Important Points

### Do's

- ✅ Follow the commit order (dependencies)
- ✅ Validate after each commit
- ✅ Write tests alongside code
- ✅ Use provided commit messages as template
- ✅ Handle Cloudflare Workers constraints (no Node.js crypto for now)

### Don'ts

- ❌ Skip commits or combine them
- ❌ Commit without running validations
- ❌ Change files from previous commits (unless fixing a bug)
- ❌ Add features not in the Phase 2 scope
- ❌ Use Node.js-specific APIs in middleware

---

## ❓ FAQ

**Q: What if a commit is too big?**
A: Split it into smaller commits (update this plan). Current sizes are balanced.

**Q: What if I need to fix a previous commit?**
A: If not pushed, amend. If pushed, create a fixup commit in this phase.

**Q: Can I change the commit order?**
A: Only if dependencies allow. Current order: utilities → redirect → integration → tests.

**Q: What if tests fail?**
A: Don't commit until they pass. Fix the code or update tests based on new findings.

**Q: Should I set Secure flag for cookies in dev?**
A: No - set `secure` only in production. Use conditional logic based on environment.

**Q: How do I test this without running the full application?**
A: Use unit tests with mocked dependencies. Integration tests use mocked next-intl.

---

## 🔗 Dependencies and Constraints

### Depends On

- Phase 1: Language detection foundation (must be complete)
- Story 1.1: next-intl library installed
- TypeScript, Vitest configured

### Blocks

- Phase 3: Edge cases, E2E tests, documentation

### Constraints

- Cloudflare Workers runtime (no Node.js `fs`, `crypto` in middleware)
- HTTP cookie header limits (4KB per cookie)
- next-intl type inference rules
- Browser cookie policies (SameSite enforcement)

---

## 🚀 Success Criteria

By end of Phase 2:

- [ ] Commit 1: Cookie utilities created and tested
- [ ] Commit 2: Root path redirection working
- [ ] Commit 3: next-intl middleware integrated, components can use `useTranslations()`
- [ ] Commit 4: All tests passing, coverage >80%
- [ ] AC5: Root path redirects correctly ✅
- [ ] AC6: next-intl context initialized ✅
- [ ] AC9: Cookie set with secure flags ✅
- [ ] Build succeeds: `pnpm build` ✅
- [ ] No TypeScript errors: `pnpm tsc` ✅
- [ ] Lint passes: `pnpm lint` ✅
- [ ] Ready for Phase 3 (Edge cases, E2E tests)
