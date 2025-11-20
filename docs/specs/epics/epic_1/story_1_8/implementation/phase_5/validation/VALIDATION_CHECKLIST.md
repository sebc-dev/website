# Phase 5: Tests & Documentation - Validation Checklist

**Story**: 1.8 - Correction Architecture next-intl et Internationalisation des Pages
**Phase**: 5 of 5

---

## Pre-Implementation Validation

### Environment Ready

- [ ] All previous phases (1-4) completed
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] `src/i18n/` structure complete
- [ ] `app/[locale]/` structure complete
- [ ] Message files have `home` and `metadata` namespaces

---

## Commit Validation

### Commit 5.1: Unit Tests

- [ ] `src/i18n/__tests__/routing.test.ts` created
- [ ] `src/i18n/__tests__/request.test.ts` created
- [ ] Tests cover all routing exports
- [ ] Tests verify configuration values
- [ ] Tests pass: `pnpm test src/i18n`
- [ ] Coverage ≥80% for new code

### Commit 5.2: E2E Tests

- [ ] `tests/home.spec.ts` created/updated
- [ ] French homepage tests pass
- [ ] English homepage tests pass
- [ ] Redirection test passes
- [ ] Tests pass: `pnpm test:e2e tests/home.spec.ts`
- [ ] No flaky tests

### Commit 5.3: Message Parity Tests

- [ ] `home` namespace parity tests added
- [ ] `metadata` namespace parity tests added
- [ ] All 10 `home` keys verified
- [ ] All 4 `metadata` keys verified
- [ ] Tests pass: `pnpm test messages.test.ts`

### Commit 5.4: Documentation

- [ ] `CLAUDE.md` i18n section updated
- [ ] `src/i18n/README.md` created
- [ ] All links work
- [ ] Examples are accurate
- [ ] No outdated information

### Commit 5.5: Final Validation

- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes (all unit tests)
- [ ] `pnpm test:e2e` passes (all E2E tests)
- [ ] `pnpm build` succeeds
- [ ] `pnpm preview` works

---

## Functional Validation

### Unit Test Coverage

- [ ] routing.ts fully tested
- [ ] request.ts adequately tested
- [ ] All exports verified
- [ ] Configuration values verified

### E2E Test Coverage

#### French Homepage

- [ ] `<html lang="fr">` verified
- [ ] "En développement" visible
- [ ] "sebc.dev" visible
- [ ] "Un laboratoire d'apprentissage public" visible
- [ ] "À l'intersection..." visible
- [ ] "Lancement prévu" visible
- [ ] "Fin Novembre 2025" visible
- [ ] "Blog technique • Articles • Guides" visible
- [ ] Title contains "Laboratoire"
- [ ] Meta description in French

#### English Homepage

- [ ] `<html lang="en">` verified
- [ ] "In development" visible
- [ ] "sebc.dev" visible
- [ ] "A public learning lab" visible
- [ ] "At the intersection..." visible
- [ ] "Expected launch" visible
- [ ] "Late November 2025" visible
- [ ] "Tech blog • Articles • Guides" visible
- [ ] Title contains "Learning Lab"
- [ ] Meta description in English

#### Navigation

- [ ] `/` redirects to `/fr`

### Message Parity

- [ ] `home` namespace has 10 keys in FR
- [ ] `home` namespace has 10 keys in EN
- [ ] `metadata` namespace has 4 keys in FR
- [ ] `metadata` namespace has 4 keys in EN
- [ ] All keys match between languages

---

## Quality Validation

### Test Quality

- [ ] Tests are deterministic (not flaky)
- [ ] Tests are isolated
- [ ] Tests have clear descriptions
- [ ] Tests cover edge cases
- [ ] No console.log in tests
- [ ] No commented code

### Documentation Quality

- [ ] Information is accurate
- [ ] Examples work when copied
- [ ] Formatting is consistent
- [ ] Language is clear
- [ ] Dates are updated

### Code Quality

- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Consistent style
- [ ] Proper naming

---

## Performance Validation

### Test Performance

- [ ] Unit tests run in <30 seconds
- [ ] E2E tests run in <2 minutes
- [ ] No unnecessary delays

### Build Performance

- [ ] Build time acceptable
- [ ] No build warnings
- [ ] Bundle size stable

---

## Production Validation

### Build

- [ ] `pnpm build` completes without errors
- [ ] No TypeScript errors
- [ ] No missing dependencies
- [ ] Output in `.next/`

### Preview

- [ ] `pnpm preview` starts successfully
- [ ] Server responds at http://127.0.0.1:8788
- [ ] `/fr` loads correctly
- [ ] `/en` loads correctly
- [ ] No console errors
- [ ] No network errors

### Manual Verification

#### French (/fr)

- [ ] Page loads completely
- [ ] All text in French
- [ ] Animations work
- [ ] Styles correct
- [ ] No layout issues
- [ ] View source shows correct metadata

#### English (/en)

- [ ] Page loads completely
- [ ] All text in English
- [ ] Animations work
- [ ] Styles correct
- [ ] No layout issues
- [ ] View source shows correct metadata

---

## Phase Completion Checklist

### All Commits Done

- [ ] Commit 5.1: Unit tests ✓
- [ ] Commit 5.2: E2E tests ✓
- [ ] Commit 5.3: Message parity tests ✓
- [ ] Commit 5.4: Documentation ✓
- [ ] Commit 5.5: Final validation ✓

### All Tests Pass

- [ ] Unit tests: 100% pass rate
- [ ] E2E tests: 100% pass rate
- [ ] Parity tests: 100% pass rate

### Documentation Complete

- [ ] CLAUDE.md updated
- [ ] src/i18n/README.md created
- [ ] All information accurate

### Story Complete

- [ ] All phases (1-5) done
- [ ] Build successful
- [ ] Preview works
- [ ] Ready for code review

---

## Post-Phase Actions

- [ ] Update `EPIC_TRACKING.md` - Phase 5 complete
- [ ] Update story status to COMPLETED
- [ ] Create PR if applicable
- [ ] Notify stakeholders
- [ ] Close related issues

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| Reviewer | | | |

---

## Notes

_Add any observations, issues encountered, or recommendations here._

---

**Validation Date**: ________________

**Phase Status**: ☐ PASSED / ☐ FAILED

---

**Created**: 2025-11-20
**Last Updated**: 2025-11-20
