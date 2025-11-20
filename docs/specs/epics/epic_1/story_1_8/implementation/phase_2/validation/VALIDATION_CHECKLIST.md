# Phase 2 - Final Validation Checklist

Complete validation checklist before marking Phase 2 as complete.

---

## ✅ 1. Commits and Structure

- [ ] All 5 atomic commits completed
- [ ] Commits follow gitmoji naming convention
- [ ] Commit order is logical (layout → cleanup → 404 → middleware → test)
- [ ] Each commit is focused (single responsibility)
- [ ] No merge commits in phase branch
- [ ] Git history is clean

---

## ✅ 2. Type Safety

- [ ] No TypeScript errors (`pnpm tsc` passes)
- [ ] No `any` types (unless justified and documented)
- [ ] Locale parameter properly typed
- [ ] Props interfaces defined
- [ ] `generateStaticParams` return type correct

**Validation**:
```bash
pnpm tsc
```

---

## ✅ 3. Code Quality

- [ ] Code follows project style guide
- [ ] No code duplication
- [ ] Clear and consistent naming
- [ ] Complex logic is documented
- [ ] No commented-out code
- [ ] No debug statements (console.log, etc.)
- [ ] Error handling is robust

**Validation**:
```bash
pnpm lint
```

---

## ✅ 4. Tests

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Coverage >80% for new code
- [ ] Tests are meaningful (not just for coverage)
- [ ] Edge cases tested (invalid locale)
- [ ] Error cases tested
- [ ] No flaky tests
- [ ] Tests run in CI successfully

**Validation**:
```bash
pnpm test
pnpm test:coverage
```

---

## ✅ 5. Build and Compilation

- [ ] Build succeeds without errors
- [ ] Build succeeds without warnings
- [ ] No dependency conflicts
- [ ] Build size reasonable

**Validation**:
```bash
pnpm build
```

---

## ✅ 6. Linting and Formatting

- [ ] Linter passes with no errors
- [ ] Linter passes with no warnings
- [ ] Code is formatted consistently
- [ ] Prettier/Biome applied

**Validation**:
```bash
pnpm lint
pnpm format:check
```

---

## ✅ 7. Internationalization Specifics

### Layout Configuration
- [ ] `NextIntlClientProvider` wraps children correctly
- [ ] `getMessages()` awaited in layout
- [ ] `<html lang={locale}>` dynamic
- [ ] `generateStaticParams` returns ['fr', 'en']
- [ ] Locale validation with `notFound()`

### Root Layout
- [ ] Simplified to minimum
- [ ] No duplicate html/body tags
- [ ] globals.css imported
- [ ] No metadata (moved to [locale])

### Not Found Page
- [ ] `useTranslations('error')` works
- [ ] All text localized
- [ ] Link from @/src/i18n
- [ ] Design consistent

### Middleware
- [ ] Imports from @/src/i18n/routing
- [ ] No duplicate configuration
- [ ] Redirects work correctly

### Test Page
- [ ] All namespaces displayed
- [ ] Works in both locales
- [ ] Route group (test) correct

---

## ✅ 8. Browser Testing

### Route Testing
- [ ] `/fr` - French layout renders correctly
- [ ] `/en` - English layout renders correctly
- [ ] `/` - Redirects to default locale
- [ ] `/de` - Invalid locale redirects

### 404 Testing
- [ ] `/fr/nonexistent` - French 404 page
- [ ] `/en/nonexistent` - English 404 page
- [ ] Return home link works

### Test Page
- [ ] `/fr/messages-test` - French translations
- [ ] `/en/messages-test` - English translations

### View Source
- [ ] `<html lang="fr">` on French pages
- [ ] `<html lang="en">` on English pages
- [ ] No duplicate html tags

### Console
- [ ] No JavaScript errors
- [ ] No translation warnings
- [ ] No hydration mismatches

---

## ✅ 9. Integration with Phase 1

- [ ] Imports from `@/src/i18n` work correctly
- [ ] `routing` object used in middleware
- [ ] `Link` component from i18n works
- [ ] No broken imports

**Validation**:
```bash
# Check all imports resolve
pnpm tsc
```

---

## ✅ 10. Security and Performance

### Security
- [ ] No sensitive data exposed
- [ ] Environment variables used correctly
- [ ] No security warnings

### Performance
- [ ] No unnecessary re-renders
- [ ] Messages loaded efficiently
- [ ] Fonts load correctly
- [ ] No layout shift

---

## ✅ 11. Documentation

- [ ] Code is self-documenting
- [ ] Complex logic has comments
- [ ] Test page serves as documentation
- [ ] ENVIRONMENT_SETUP.md reflects actual setup

---

## ✅ 12. Code Review

- [ ] Self-review completed (guides/REVIEW.md)
- [ ] Peer review completed (if required)
- [ ] All feedback addressed
- [ ] Review approved

---

## ✅ 13. Final Validation

- [ ] All previous checklist items checked
- [ ] Phase objectives met:
  - [locale] segment structure created
  - NextIntlClientProvider configured
  - Root layout simplified
  - 404 page localized
  - Middleware aligned
- [ ] Ready for Phase 3

---

## 📋 Validation Commands Summary

Run all these commands before final approval:

```bash
# Type-checking
pnpm tsc

# Linting
pnpm lint

# Format check
pnpm format:check

# Tests
pnpm test

# Coverage
pnpm test:coverage

# Build
pnpm build

# Manual testing
pnpm dev
# Test all URLs listed in Browser Testing section
```

**All must pass with no errors.**

---

## 📊 Success Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Commits | 5 | - | ⏳ |
| TypeScript | 100% pass | - | ⏳ |
| Test Coverage | >80% | - | ⏳ |
| Build Status | ✅ | - | ⏳ |
| Lint Status | ✅ | - | ⏳ |
| FR Locale | ✅ Works | - | ⏳ |
| EN Locale | ✅ Works | - | ⏳ |
| 404 Pages | ✅ Localized | - | ⏳ |

---

## 🎯 Final Verdict

Select one:

- [ ] ✅ **APPROVED** - Phase 2 is complete and ready
- [ ] 🔧 **CHANGES REQUESTED** - Issues to fix:
  - [List issues]
- [ ] ❌ **REJECTED** - Major rework needed:
  - [List major issues]

---

## 📝 Next Steps

### If Approved ✅

1. [ ] Update INDEX.md status to ✅ COMPLETED
2. [ ] Merge phase branch to main
3. [ ] Create git tag: `story-1.8-phase-2-complete`
4. [ ] Update EPIC_TRACKING.md
5. [ ] Prepare for Phase 3: Internationalisation Homepage

### If Changes Requested 🔧

1. [ ] Address all feedback items
2. [ ] Re-run validation
3. [ ] Request re-review

### If Rejected ❌

1. [ ] Document issues
2. [ ] Plan rework
3. [ ] Schedule review

---

## 🔗 Related Documents

- [INDEX.md](../INDEX.md)
- [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md)
- [COMMIT_CHECKLIST.md](../COMMIT_CHECKLIST.md)
- [Phase 3 Documentation](../../phase_3/) (next)

---

**Validation completed by**: [Name]
**Date**: [Date]
**Notes**: [Additional notes]

---

**Phase 2 establishes the foundation for all localized pages. Thorough validation is essential before proceeding to Phase 3!**
