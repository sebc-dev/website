# Phase 1 - Final Validation Checklist

Complete validation checklist before marking Phase 1 as complete.

---

## ✅ 1. Commits and Structure

- [ ] All 5 atomic commits completed
- [ ] Commits follow gitmoji naming convention
- [ ] Commit order is logical (routing → request → barrel → imports → cleanup)
- [ ] Each commit is focused (single responsibility)
- [ ] No merge commits in phase branch
- [ ] Git history is clean

---

## ✅ 2. Type Safety

- [ ] No TypeScript errors
- [ ] No `any` types (unless justified and documented)
- [ ] `Locale` type correctly inferred from routing
- [ ] All navigation utilities properly typed
- [ ] `getRequestConfig` return type correct

**Validation**:
```bash
pnpm tsc --noEmit
```

---

## ✅ 3. Code Quality

- [ ] Code follows project style guide
- [ ] No code duplication
- [ ] Clear and consistent naming
- [ ] Proper file organization in src/i18n/
- [ ] No commented-out code
- [ ] No debug statements (console.log, etc.)
- [ ] Clean imports

**Validation**:
```bash
pnpm lint
```

---

## ✅ 4. Tests

- [ ] All existing unit tests pass
- [ ] Message parity tests pass
- [ ] No test regressions
- [ ] Optional: New unit tests for routing/request
- [ ] Tests run in CI successfully

**Validation**:
```bash
pnpm test
```

---

## ✅ 5. Build and Compilation

- [ ] Build succeeds without errors
- [ ] Build succeeds without warnings
- [ ] No dependency conflicts
- [ ] Build output correct

**Validation**:
```bash
pnpm build
```

---

## ✅ 6. Linting and Formatting

- [ ] Linter passes with no errors
- [ ] Linter passes with no warnings
- [ ] Code is formatted consistently

**Validation**:
```bash
pnpm lint
```

---

## ✅ 7. New i18n Structure

### Files Created
- [ ] `src/i18n/routing.ts` exists and exports correctly
- [ ] `src/i18n/request.ts` exists and exports correctly
- [ ] `src/i18n/types.ts` exists with Locale type
- [ ] `src/i18n/index.ts` barrel export complete

### Configuration Correct
- [ ] `routing.locales` = `['fr', 'en']`
- [ ] `routing.defaultLocale` = `'fr'`
- [ ] `routing.localePrefix` = `'always'`

### API Usage
- [ ] Uses `await requestLocale` (not old API)
- [ ] Dynamic message import works
- [ ] Locale validation with fallback

**Verification**:
```bash
ls -la src/i18n/
# Should show: index.ts, request.ts, routing.ts, types.ts
```

---

## ✅ 8. Old i18n Removed

- [ ] `i18n/config.ts` deleted
- [ ] `i18n/types.ts` deleted
- [ ] `i18n/index.ts` deleted
- [ ] `i18n/README.md` deleted or migrated
- [ ] `i18n/` directory removed
- [ ] No orphaned imports

**Verification**:
```bash
ls i18n/
# Should fail: No such file or directory
```

---

## ✅ 9. Imports Updated

- [ ] `middleware.ts` uses `@/src/i18n/routing`
- [ ] No remaining `@/i18n` imports anywhere
- [ ] No remaining `from 'i18n'` imports
- [ ] All components use new paths

**Verification**:
```bash
grep -r "from.*['\"]@/i18n" --include="*.ts" --include="*.tsx" .
# Should return no results

grep -r "from.*['\"]i18n['\"]" --include="*.ts" --include="*.tsx" .
# Should return no results
```

---

## ✅ 10. Middleware Functionality

- [ ] Middleware chains correctly
- [ ] Locale detection works
- [ ] Redirection `/` → `/fr/` works
- [ ] Both `/fr/` and `/en/` routes accessible

**Manual Test** (optional):
```bash
pnpm dev
# Visit http://localhost:3000 - should redirect to /fr/
# Visit http://localhost:3000/en/ - should work
```

---

## ✅ 11. Security and Performance

### Security
- [ ] No sensitive data exposed
- [ ] No hardcoded secrets

### Performance
- [ ] No obvious import issues
- [ ] Clean tree-shaking possible

---

## ✅ 12. Code Review

- [ ] Self-review completed (guides/REVIEW.md)
- [ ] All review criteria met
- [ ] No blocking issues

---

## 📋 Validation Commands Summary

Run all these commands before final approval:

```bash
# TypeScript check
pnpm tsc --noEmit

# Linting
pnpm lint

# Tests
pnpm test

# Build
pnpm build

# Verify structure
ls -la src/i18n/

# Verify old removed
ls i18n/ 2>&1 | grep "No such file"

# Check for old imports
grep -r "from.*['\"]@/i18n" --include="*.ts" --include="*.tsx" . || echo "✓ No old imports"
```

**All must pass with no errors.**

---

## 📊 Success Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Commits | 5 | - | ⏳ |
| TypeScript Errors | 0 | - | ⏳ |
| Lint Errors | 0 | - | ⏳ |
| Test Pass Rate | 100% | - | ⏳ |
| Build Status | ✅ | - | ⏳ |
| Old Files Removed | 4 | - | ⏳ |

---

## 🎯 Final Verdict

Select one:

- [ ] ✅ **APPROVED** - Phase 1 is complete and ready
- [ ] 🔧 **CHANGES REQUESTED** - Issues to fix:
  - [List issues]
- [ ] ❌ **REJECTED** - Major rework needed:
  - [List major issues]

---

## 📝 Next Steps

### If Approved ✅

1. [ ] Update INDEX.md status to ✅ COMPLETED
2. [ ] Merge phase 1 commits to main (or keep in feature branch)
3. [ ] Update EPIC_TRACKING.md
4. [ ] Prepare for Phase 2 - Segment [locale] & Provider

### If Changes Requested 🔧

1. [ ] Address all feedback items
2. [ ] Re-run validation commands
3. [ ] Request re-review

### If Rejected ❌

1. [ ] Document issues
2. [ ] Plan rework
3. [ ] Schedule review

---

**Validation completed by**: [Name]
**Date**: [Date]
**Notes**: [Additional notes]

---

## 🎉 Phase 1 Complete!

When all checkboxes are checked, Phase 1 is complete and you can proceed to Phase 2.

Phase 2 will:
- Create `app/[locale]/layout.tsx` with Provider
- Simplify `app/layout.tsx`
- Create `app/[locale]/not-found.tsx`
- Update middleware for new structure
