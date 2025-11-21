# Phase 1 - Code Review Guide

Complete guide for reviewing the Phase 1 implementation.

---

## 🎯 Review Objective

Validate that the implementation:

- ✅ Creates proper `src/i18n/` structure following next-intl best practices
- ✅ Uses new `requestLocale` API (Next.js 15)
- ✅ Exports typed navigation utilities
- ✅ Updates all imports without breaking existing functionality
- ✅ Cleanly removes old i18n folder
- ✅ Maintains full TypeScript type safety

---

## 📋 Review Approach

Phase 1 is split into **5 atomic commits**. You can:

**Option A: Commit-by-commit review** (recommended)

- Easier to digest (10-30 min per commit)
- Progressive validation
- Targeted feedback

**Option B: Global review at once**

- Faster (1-2h total)
- Immediate overview
- Requires more focus

**Estimated Total Time**: 1-2h

---

## 🔍 Commit-by-Commit Review

### Commit 1: Créer src/i18n/routing.ts

**Files**: `src/i18n/routing.ts` (~60 lines)
**Duration**: 15-20 minutes

#### Review Checklist

##### Configuration

- [ ] Uses `defineRouting` from `next-intl/routing`
- [ ] Uses `createNavigation` from `next-intl/navigation`
- [ ] Locales array is `['fr', 'en']`
- [ ] Default locale is `'fr'`
- [ ] Locale prefix is `'always'`

##### Exports

- [ ] `routing` configuration exported
- [ ] `Link` component exported
- [ ] `redirect` function exported
- [ ] `usePathname` hook exported
- [ ] `useRouter` hook exported
- [ ] `getPathname` function exported

##### Code Quality

- [ ] No `any` types
- [ ] Clean import structure
- [ ] No commented code
- [ ] Follows project conventions

#### Technical Validation

```bash
pnpm tsc --noEmit
```

**Expected Result**: No TypeScript errors

#### Questions to Ask

1. Is `localePrefix: 'always'` the correct choice for this project?
2. Are all required navigation utilities exported?
3. Is the typing correctly inferred from `defineRouting`?

---

### Commit 2: Créer src/i18n/request.ts

**Files**: `src/i18n/request.ts` (~50 lines)
**Duration**: 15-20 minutes

#### Review Checklist

##### API Usage

- [ ] Uses `getRequestConfig` from `next-intl/server`
- [ ] Uses `await requestLocale` (NOT old `{ locale }` pattern)
- [ ] Properly awaits the async request

##### Validation Logic

- [ ] Checks if locale is undefined/null
- [ ] Validates against `routing.locales`
- [ ] Falls back to `routing.defaultLocale`

##### Message Loading

- [ ] Dynamic import: `await import(...)`
- [ ] Correct path to messages: `../../messages/${locale}.json`
- [ ] Accesses `.default` for JSON module

##### Code Quality

- [ ] Imports routing from local `./routing`
- [ ] No unnecessary type assertions
- [ ] No debug/console statements

#### Technical Validation

```bash
pnpm tsc --noEmit
```

**Expected Result**: No TypeScript errors

#### Questions to Ask

1. Is the message path relative to `src/i18n/request.ts` correct?
2. Is error handling for invalid locales sufficient?
3. Should `timeZone` or `onError` be configured?

---

### Commit 3: Créer barrel export et types

**Files**: `src/i18n/index.ts`, `src/i18n/types.ts` (~40 lines)
**Duration**: 10-15 minutes

#### Review Checklist

##### Types

- [ ] `Locale` type derived from `routing.locales`
- [ ] Type is properly exported

##### Barrel Exports

- [ ] `Locale` type exported
- [ ] `routing` object exported
- [ ] `locales` array exported
- [ ] `defaultLocale` constant exported
- [ ] All navigation utilities re-exported
- [ ] `getRequestConfig` re-exported if needed

##### Code Quality

- [ ] No circular dependencies
- [ ] Clean re-export syntax
- [ ] Consistent with project patterns

#### Technical Validation

```bash
pnpm tsc --noEmit
```

**Expected Result**: All exports accessible from `@/src/i18n`

#### Questions to Ask

1. Are all necessary exports included?
2. Is the `Locale` type correctly inferred?
3. Are there any circular import risks?

---

### Commit 4: Mettre à jour imports projet

**Files**: `middleware.ts` + various (~100 lines across files)
**Duration**: 20-30 minutes

#### Review Checklist

##### Middleware

- [ ] Imports from `@/src/i18n/routing`
- [ ] Uses correct `createMiddleware` pattern
- [ ] Chains correctly with other middleware
- [ ] Redirection logic preserved

##### Import Updates

- [ ] All `@/i18n` → `@/src/i18n`
- [ ] All `from 'i18n'` → `from '@/src/i18n'`
- [ ] Components use new navigation utilities
- [ ] Test files updated

##### Functionality

- [ ] No broken imports
- [ ] TypeScript resolves all modules
- [ ] Existing functionality preserved

##### Code Quality

- [ ] Consistent import paths
- [ ] No unused imports
- [ ] No temporary hacks

#### Technical Validation

```bash
pnpm tsc --noEmit
pnpm lint
pnpm test
```

**Expected Result**: All validations pass

#### Questions to Ask

1. Were all import locations found and updated?
2. Does the middleware still work correctly?
3. Are there any edge cases with path aliases?

---

### Commit 5: Archiver ancien dossier i18n

**Files**: Deletions only (~-200 lines)
**Duration**: 10-15 minutes

#### Review Checklist

##### Deletions

- [ ] `i18n/config.ts` deleted
- [ ] `i18n/types.ts` deleted
- [ ] `i18n/index.ts` deleted
- [ ] `i18n/README.md` deleted or migrated
- [ ] `i18n/` directory removed

##### Validation

- [ ] No remaining references to old paths
- [ ] Build succeeds
- [ ] All tests pass
- [ ] No orphaned code

##### Code Quality

- [ ] Clean git diff (only deletions)
- [ ] No accidental deletions

#### Technical Validation

```bash
pnpm tsc --noEmit
pnpm lint
pnpm test
pnpm build
```

**Expected Result**: Full build succeeds

#### Questions to Ask

1. Was the README content worth preserving?
2. Are there any hidden references to old paths?
3. Is git history clean?

---

## ✅ Global Validation

After reviewing all commits:

### Architecture & Design

- [ ] New structure follows next-intl 2025 best practices
- [ ] Proper separation: routing vs request config
- [ ] Clean barrel export pattern
- [ ] No breaking changes to existing features

### Code Quality

- [ ] Consistent naming conventions
- [ ] Clear file organization
- [ ] No dead code
- [ ] Proper TypeScript usage

### Type Safety

- [ ] No `any` types (except justified cases)
- [ ] `Locale` type properly inferred
- [ ] All exports typed correctly
- [ ] Navigation utilities fully typed

### Testing

- [ ] All existing tests pass
- [ ] No test updates needed (structure change only)
- [ ] Middleware still testable

### Documentation

- [ ] Code is self-documenting
- [ ] Complex logic explained if present

---

## 📝 Feedback Template

Use this template for feedback:

```markdown
## Review Feedback - Phase 1

**Reviewer**: [Name]
**Date**: [Date]
**Commits Reviewed**: all 5

### ✅ Strengths

- [What was done well]
- [Highlight good practices]

### 🔧 Required Changes

1. **[File/Area]**: [Issue description]
   - **Why**: [Explanation]
   - **Suggestion**: [How to fix]

### 💡 Suggestions (Optional)

- [Nice-to-have improvements]

### 📊 Verdict

- [ ] ✅ **APPROVED** - Ready to merge
- [ ] 🔧 **CHANGES REQUESTED** - Needs fixes
- [ ] ❌ **REJECTED** - Major rework needed

### Next Steps

[What should happen next]
```

---

## 🎯 Review Actions

### If Approved ✅

1. Merge the commits
2. Update phase status to COMPLETED
3. Proceed to Phase 2

### If Changes Requested 🔧

1. Create detailed feedback
2. Discuss with developer
3. Re-review after fixes

### If Rejected ❌

1. Document major issues
2. Schedule discussion
3. Plan rework strategy

---

## ❓ FAQ

**Q: Should I test the dev server?**
A: Optional for this phase since it's structure only. Existing tests are sufficient.

**Q: What about E2E tests?**
A: Not needed for Phase 1. E2E tests come in Phase 5.

**Q: Can I approve with minor nits?**
A: Yes, note as optional improvements.

**Q: Should I check next-intl documentation?**
A: Yes, reference the [technical document](/docs/tech/cloudflare-workers/cloudflare-nextjs-nextintl.md) for correct patterns.
