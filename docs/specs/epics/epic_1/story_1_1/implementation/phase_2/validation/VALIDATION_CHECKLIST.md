# Phase 2 - Final Validation Checklist

Complete validation checklist before marking Phase 2 as complete.

---

## ✅ 1. Commits and Structure

- [ ] All 5 atomic commits completed
- [ ] Commit 1: Create base i18n configuration structure
- [ ] Commit 2: Define locale types and constants
- [ ] Commit 3: Implement getRequestConfig for Server Components
- [ ] Commit 4: Add TypeScript configuration and type exports
- [ ] Commit 5: Validate configuration and add documentation
- [ ] Commits follow Gitmoji convention (✨ for features)
- [ ] Commit messages use provided templates
- [ ] Commit order is logical and follows dependencies
- [ ] Each commit is focused (single responsibility)
- [ ] No merge commits in phase branch
- [ ] Git history is clean and meaningful

**Verification**:

```bash
# Check commit history
git log --oneline -5

# Should show 5 commits for Phase 2 with clear messages
```

---

## ✅ 2. Type Safety

- [ ] No TypeScript errors
- [ ] `Locale` type defined as `'fr' | 'en'`
- [ ] `locales` array uses `as const` assertion
- [ ] `defaultLocale` typed as `Locale` (not widened to `string`)
- [ ] `IntlMessages` type defined (placeholder acceptable)
- [ ] No `any` types (except in `IntlMessages` - acceptable for Phase 2)
- [ ] All interfaces/types documented with JSDoc
- [ ] Type inference works correctly
- [ ] IntelliSense/autocomplete shows locale values
- [ ] Type-only exports use `export type` keyword

**Validation**:

```bash
# TypeScript compilation
pnpm tsc --noEmit

# Should complete with no errors
```

**Manual Check**:

- Hover over `defaultLocale` in IDE → Should show `Locale`, not `string`
- Type `const x: Locale = ''` → Should autocomplete `'fr'` and `'en'`

---

## ✅ 3. Code Quality

- [ ] Code follows project style guide (Prettier/Biome)
- [ ] No code duplication
- [ ] Clear and consistent naming (PascalCase for types, camelCase for variables)
- [ ] All exports have JSDoc documentation
- [ ] No commented-out code
- [ ] No debug statements (console.log, console.warn used appropriately)
- [ ] Error handling is robust (invalid locale fallback)
- [ ] Imports are organized and clean
- [ ] No unused variables or imports

**Validation**:

```bash
# ESLint check
pnpm lint

# Should pass with no errors or warnings
```

---

## ✅ 4. Configuration Files

### config.ts

- [ ] File exists at `src/i18n/config.ts`
- [ ] Imports `getRequestConfig` from `'next-intl/server'`
- [ ] `Locale` type defined: `'fr' | 'en'`
- [ ] `locales` array: `['fr', 'en'] as const`
- [ ] `defaultLocale` set to `'fr'` (per PRD)
- [ ] `getRequestConfig()` implemented correctly
- [ ] Locale validation logic present
- [ ] Dynamic import path correct: `../../messages/${locale}.json`
- [ ] Default export present
- [ ] All exports documented with JSDoc

### types.ts

- [ ] File exists at `src/i18n/types.ts`
- [ ] `IntlMessages` type defined
- [ ] Utility types defined (e.g., `LocaleParam`)
- [ ] All types exported
- [ ] JSDoc documentation complete

### index.ts

- [ ] File exists at `src/i18n/index.ts`
- [ ] Default config re-exported as `i18nConfig`
- [ ] `Locale` type re-exported with `export type`
- [ ] `locales` and `defaultLocale` re-exported
- [ ] Types from `types.ts` re-exported
- [ ] Barrel export provides clean import interface

### README.md

- [ ] File exists at `src/i18n/README.md`
- [ ] Documents directory structure
- [ ] Lists supported locales (fr, en)
- [ ] Explains default locale (fr)
- [ ] Provides usage examples (Server and Client Components)
- [ ] Documents message files structure (Story 1.2)
- [ ] Explains next steps (Story 1.2, 1.3, 1.4)
- [ ] Includes links to documentation

**Verification**:

```bash
# Verify all files exist
ls -la src/i18n/

# Should show: config.ts, types.ts, index.ts, README.md
```

---

## ✅ 5. Build and Compilation

- [ ] TypeScript compilation succeeds without errors
- [ ] TypeScript compilation succeeds without warnings
- [ ] No dependency conflicts
- [ ] All imports resolve correctly
- [ ] Dynamic import syntax is valid

**Validation**:

```bash
# TypeScript check
pnpm tsc --noEmit

# Should complete successfully with no output
```

---

## ✅ 6. Linting and Formatting

- [ ] ESLint passes with no errors
- [ ] ESLint passes with no warnings (or only pre-existing)
- [ ] Code is formatted consistently
- [ ] Follows project Prettier/Biome config
- [ ] All files pass linter

**Validation**:

```bash
# Lint check
pnpm lint

# Format check (if using Prettier)
pnpm exec prettier --check src/i18n/
```

---

## ✅ 7. Documentation

- [ ] `src/i18n/README.md` is comprehensive
- [ ] All code has JSDoc comments where appropriate
- [ ] `CLAUDE.md` updated with i18n configuration notes
- [ ] Usage examples are correct and helpful
- [ ] Links to next-intl documentation included
- [ ] Next steps clearly documented (Story 1.2, 1.3)
- [ ] Code examples in docs are runnable
- [ ] No broken links or references
- [ ] Markdown formatting correct

**Verification**:

```bash
# Check README exists and is comprehensive
cat src/i18n/README.md

# Check CLAUDE.md updated
grep -A 10 "Internationalization" CLAUDE.md
```

---

## ✅ 8. Integration with Previous Phase

- [ ] Phase 1 completed (next-intl installed)
- [ ] Configuration uses next-intl package correctly
- [ ] No breaking changes from Phase 1
- [ ] Dependencies from Phase 1 available
- [ ] TypeScript types from next-intl accessible

**Integration Tests**:

```bash
# Verify next-intl package is installed
pnpm list next-intl

# Should show version 4.5.3 or compatible
```

---

## ✅ 9. Runtime Validation

- [ ] Next.js dev server starts successfully
- [ ] No console errors on server startup
- [ ] No warnings related to i18n configuration
- [ ] Configuration is loaded by Next.js
- [ ] No runtime errors in browser console
- [ ] Server compiles without issues

**Validation**:

```bash
# Start dev server
pnpm dev

# Should output:
# ✓ Ready in Xs
# - Local: http://localhost:3000

# Check console for errors (should be none related to i18n)
# Stop with Ctrl+C
```

**Browser Check**:

- [ ] Open http://localhost:3000
- [ ] Check browser console (F12) - no errors
- [ ] No i18n-related warnings

---

## ✅ 10. Exports and Imports

- [ ] Barrel export (`index.ts`) works correctly
- [ ] Can import from `@/i18n` instead of specific files
- [ ] All exports are accessible
- [ ] Type exports are type-only (`export type`)
- [ ] Value exports work correctly
- [ ] No circular dependencies
- [ ] IntelliSense shows exports when importing

**Validation**:
Create temporary test file to verify:

```typescript
// src/test-imports.ts
import {
  type Locale,
  locales,
  defaultLocale,
  i18nConfig,
  type IntlMessages,
} from '@/i18n';

// All imports should resolve without errors
```

```bash
# Type-check test file
pnpm tsc --noEmit

# Remove test file
rm src/test-imports.ts
```

---

## ✅ 11. Code Review

- [ ] Self-review completed using guides/REVIEW.md
- [ ] All 5 commits reviewed individually
- [ ] Peer review requested (if required by team)
- [ ] All review feedback addressed
- [ ] No outstanding review comments
- [ ] Approved by tech lead/reviewer (if applicable)
- [ ] Review notes documented

---

## ✅ 12. Acceptance Criteria (from PHASES_PLAN.md)

- [ ] Configuration file created with supported locales (fr, en)
- [ ] Supported locales defined: `['fr', 'en']`
- [ ] Default locale set: `'fr'`
- [ ] `getRequestConfig()` implemented
- [ ] TypeScript setup for type-safe translations
- [ ] Message import structure prepared (ready for Story 1.2)
- [ ] Code follows Next.js 15 App Router patterns

---

## ✅ 13. Final Validation

- [ ] All previous checklist items checked
- [ ] Phase objectives met (configuration complete)
- [ ] All 5 commits successfully implemented
- [ ] TypeScript compilation passes
- [ ] ESLint passes
- [ ] Dev server starts and runs
- [ ] Documentation complete and reviewed
- [ ] Known issues documented (if any)
- [ ] Ready for Phase 3 (Integration Validation)
- [ ] Ready for Story 1.2 (Create message files)

---

## 📋 Validation Commands Summary

Run all these commands before final approval:

```bash
# 1. Verify files exist
ls -la src/i18n/
# Should show: config.ts, types.ts, index.ts, README.md

# 2. TypeScript type checking
pnpm tsc --noEmit
# Should complete with no errors

# 3. Linting
pnpm lint
# Should pass with no errors

# 4. Dev server test
pnpm dev
# Should start successfully
# Visit http://localhost:3000 to verify
# Check console for errors
# Ctrl+C to stop

# 5. Verify git commits
git log --oneline -5
# Should show 5 commits for Phase 2

# 6. Check documentation
cat src/i18n/README.md
grep "Internationalization" CLAUDE.md
```

**All must pass with no errors.**

---

## 📊 Success Metrics

| Metric            | Target    | Actual | Status |
| ----------------- | --------- | ------ | ------ |
| Commits           | 5         | -      | ⏳     |
| Files Created     | 4         | -      | ⏳     |
| TypeScript Errors | 0         | -      | ⏳     |
| ESLint Errors     | 0         | -      | ⏳     |
| Type Coverage     | 100%      | -      | ⏳     |
| Dev Server        | Starts OK | -      | ⏳     |
| Documentation     | Complete  | -      | ⏳     |

**Update "Actual" column and "Status" (✅ or ❌) as you validate each metric.**

---

## 🎯 Final Verdict

Select one:

- [ ] ✅ **APPROVED** - Phase 2 is complete and ready for Phase 3
- [ ] 🔧 **CHANGES REQUESTED** - Issues to fix (list below)
- [ ] ❌ **REJECTED** - Major rework needed (list below)

### Issues to Fix (if not approved)

1. [Issue 1]
2. [Issue 2]
3. [Issue 3]

### Notes

[Any additional notes or context about the validation]

---

## 📝 Next Steps

### If Approved ✅

1. [ ] Update INDEX.md status to ✅ COMPLETED
2. [ ] Update EPIC_TRACKING.md:
   - Story 1.1 progress: 2/3 phases complete
   - Update completion percentage
3. [ ] Merge phase commits to story branch
4. [ ] Create git tag: `story-1.1-phase-2-complete` (optional)
5. [ ] Update project documentation (if needed)
6. [ ] Prepare for Phase 3 (Integration Validation)
7. [ ] Ready to start Story 1.2 (Create message files)

### If Changes Requested 🔧

1. [ ] Document all issues clearly
2. [ ] Prioritize fixes (critical vs nice-to-have)
3. [ ] Fix issues commit-by-commit
4. [ ] Re-run validation commands
5. [ ] Request re-review

### If Rejected ❌

1. [ ] Document all major issues
2. [ ] Schedule discussion with team
3. [ ] Plan rework strategy
4. [ ] Determine if phase should be redesigned
5. [ ] Create action plan for corrections

---

## 🔗 Related Documents

- [PHASES_PLAN.md](../PHASES_PLAN.md) - Phase planning and objectives
- [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md) - Atomic commit strategy
- [COMMIT_CHECKLIST.md](../COMMIT_CHECKLIST.md) - Per-commit checklists
- [guides/REVIEW.md](../guides/REVIEW.md) - Code review guidelines
- [guides/TESTING.md](../guides/TESTING.md) - Testing and validation
- [Story 1.1 Spec](../../story_1.1.md) - Original story specification
- [Epic 1 Tracking](../../../../EPIC_TRACKING.md) - Epic progress tracking

---

**Validation completed by**: [Name]
**Date**: [Date]
**Result**: [✅ Approved / 🔧 Changes Requested / ❌ Rejected]

---

## 📝 Sign-Off

**Developer**: ********\_******** Date: **\_\_\_**
**Reviewer**: ********\_******** Date: **\_\_\_**
**Tech Lead**: ********\_******** Date: **\_\_\_**

---

**Phase 2 Validation Complete** - Proceed to Phase 3 when approved! 🎉
