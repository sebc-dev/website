# Phase 5: Tests & Documentation - Commit Checklist

**Story**: 1.8 - Correction Architecture next-intl et Internationalisation des Pages
**Phase**: 5 of 5

---

## Commit 5.1: Unit Tests for i18n Core

### Pre-commit Checklist

- [ ] Read existing test patterns in the project
- [ ] Understand `src/i18n/routing.ts` exports
- [ ] Understand `src/i18n/request.ts` functionality

### Implementation Checklist

- [ ] Create `src/i18n/__tests__/` directory
- [ ] Create `routing.test.ts`
  - [ ] Test `routing.locales` contains 'fr' and 'en'
  - [ ] Test `routing.defaultLocale` is 'fr'
  - [ ] Test `routing.localePrefix` is 'always'
  - [ ] Test `Link` export exists
  - [ ] Test `redirect` export exists
  - [ ] Test `usePathname` export exists
  - [ ] Test `useRouter` export exists
- [ ] Create `request.test.ts`
  - [ ] Test French messages import
  - [ ] Test English messages import
  - [ ] Test all namespaces present
  - [ ] Test `home` namespace exists
  - [ ] Test `metadata` namespace exists

### Validation Checklist

- [ ] `pnpm test src/i18n` passes
- [ ] No TypeScript errors
- [ ] Coverage meets target (≥80%)

### Commit Message

```
✅ test(i18n): add unit tests for routing and request configuration

- Add routing.test.ts with locale and navigation export tests
- Add request.test.ts with message loading tests
- Verify all namespaces including home and metadata

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Commit 5.2: E2E Tests for Localized Pages

### Pre-commit Checklist

- [ ] Review existing Playwright test patterns
- [ ] Understand page content in both locales
- [ ] Check Playwright selectors for text content

### Implementation Checklist

- [ ] Create or update `tests/home.spec.ts`
- [ ] French homepage tests
  - [ ] Test `<html lang="fr">` attribute
  - [ ] Test "En développement" badge
  - [ ] Test "Un laboratoire d'apprentissage public" subtitle
  - [ ] Test "Lancement prévu" label
  - [ ] Test "Fin Novembre 2025" date
  - [ ] Test French metadata title
  - [ ] Test French meta description
- [ ] English homepage tests
  - [ ] Test `<html lang="en">` attribute
  - [ ] Test "In development" badge
  - [ ] Test "A public learning lab" subtitle
  - [ ] Test "Expected launch" label
  - [ ] Test "Late November 2025" date
  - [ ] Test English metadata title
  - [ ] Test English meta description
- [ ] Locale redirection tests
  - [ ] Test `/` redirects to `/fr`

### Validation Checklist

- [ ] `pnpm test:e2e tests/home.spec.ts` passes
- [ ] All assertions work correctly
- [ ] No flaky tests

### Commit Message

```
✅ test(e2e): add localized homepage tests for FR and EN

- Test French homepage content and metadata
- Test English homepage content and metadata
- Test locale redirection from / to /fr

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Commit 5.3: Message Parity Tests Update

### Pre-commit Checklist

- [ ] Find existing message parity test file
- [ ] Understand current test structure
- [ ] Review `home` and `metadata` namespaces

### Implementation Checklist

- [ ] Update message parity test file
- [ ] Add `home` namespace tests
  - [ ] Test all keys present in FR
  - [ ] Test all keys present in EN
  - [ ] Test keys match between languages
  - [ ] Test required keys: badge, title, subtitle, description, ai, ux, engineering, launchLabel, launchDate, tagline
- [ ] Add `metadata` namespace tests
  - [ ] Test all keys present in FR
  - [ ] Test all keys present in EN
  - [ ] Test keys match between languages
  - [ ] Test required keys: title, description, ogTitle, ogDescription
- [ ] Update namespace count in tests if needed

### Validation Checklist

- [ ] `pnpm test messages.test.ts` passes
- [ ] All parity checks pass
- [ ] No missing keys reported

### Commit Message

```
✅ test(i18n): update message parity tests with home and metadata namespaces

- Add home namespace parity tests (10 keys)
- Add metadata namespace parity tests (4 keys)
- Verify 100% translation coverage

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Commit 5.4: Documentation Update

### Pre-commit Checklist

- [ ] Review current CLAUDE.md i18n section
- [ ] Identify outdated information
- [ ] Plan new src/i18n/README.md structure

### Implementation Checklist

- [ ] Update `CLAUDE.md`
  - [ ] Change `i18n/` to `src/i18n/`
  - [ ] Update file list (routing.ts, request.ts)
  - [ ] Update namespace count (10 namespaces)
  - [ ] Update key count (~85 keys)
  - [ ] Add navigation import example
  - [ ] Update import patterns
  - [ ] Update component usage example
- [ ] Create `src/i18n/README.md`
  - [ ] Architecture overview
  - [ ] File structure explanation
  - [ ] Server Components usage
  - [ ] Client Components usage
  - [ ] Navigation utilities
  - [ ] Adding new translations
  - [ ] Best practices
  - [ ] Troubleshooting

### Validation Checklist

- [ ] All links work correctly
- [ ] Examples are accurate
- [ ] No outdated information
- [ ] Consistent formatting

### Commit Message

```
📝 docs(i18n): update CLAUDE.md and create src/i18n/README.md

- Update i18n section with new src/i18n structure
- Add navigation utilities documentation
- Create comprehensive README for src/i18n/

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Commit 5.5: Final Validation

### Pre-commit Checklist

- [ ] All previous commits completed
- [ ] No pending changes

### Validation Checklist

#### Build & Compilation

- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] No TypeScript errors
- [ ] No ESLint errors

#### Testing

- [ ] `pnpm test` - all unit tests pass
- [ ] `pnpm test:e2e` - all E2E tests pass
- [ ] Coverage targets met

#### Production

- [ ] `pnpm build` succeeds
- [ ] No build warnings
- [ ] Bundle size acceptable

#### Preview

- [ ] `pnpm preview` starts successfully
- [ ] `/fr` loads correctly
- [ ] `/en` loads correctly
- [ ] No console errors

#### Manual Verification

- [ ] French content displays correctly
- [ ] English content displays correctly
- [ ] `<html lang>` correct for each locale
- [ ] Metadata in page source correct
- [ ] Animations work
- [ ] Styles correct
- [ ] Visual parity between locales

### Commit Message

```
✅ chore(validation): final validation of i18n implementation

- All unit tests passing
- All E2E tests passing
- Production build successful
- Documentation complete

Story 1.8 Phase 5 complete - i18n architecture fully validated

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Post-Phase Checklist

After completing all commits:

- [ ] Update `EPIC_TRACKING.md` - mark Phase 5 as complete
- [ ] Update story status to COMPLETED
- [ ] Create PR if applicable
- [ ] Notify stakeholders

---

## Rollback Plan

If issues are discovered:

1. **Unit test failures**: Fix tests or adjust implementation
2. **E2E failures**: Check selectors, add waits, increase timeouts
3. **Build failures**: Check for missing dependencies or type errors
4. **Documentation errors**: Update incorrect information

---

**Created**: 2025-11-20
**Last Updated**: 2025-11-20
