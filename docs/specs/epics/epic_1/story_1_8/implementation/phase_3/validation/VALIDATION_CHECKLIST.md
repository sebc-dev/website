# Phase 3 - Validation Checklist

**Story**: 1.8 - Correction Architecture next-intl
**Phase**: Internationalisation de la page d'accueil

Complete this checklist after all commits are done to validate the phase.

---

## Pre-Validation

- [ ] All 5 commits completed
- [ ] Working on clean branch (no uncommitted changes)
- [ ] Dev server running: `pnpm dev`

---

## Code Quality Validation

### TypeScript
```bash
pnpm tsc
```
- [ ] No errors
- [ ] No warnings

### Linting
```bash
pnpm lint
```
- [ ] No errors
- [ ] No warnings (or only pre-existing)

### Formatting
```bash
pnpm format:check
```
- [ ] All files formatted correctly

---

## Test Validation

### Unit Tests
```bash
pnpm test
```
- [ ] All tests pass
- [ ] No skipped tests

### Message Parity
```bash
pnpm test messages.test.ts
```
- [ ] `home` namespace: 10 keys in FR
- [ ] `home` namespace: 10 keys in EN
- [ ] `metadata` namespace: 4 keys in FR
- [ ] `metadata` namespace: 4 keys in EN
- [ ] All keys match between languages

### E2E Tests
```bash
pnpm preview
# In another terminal:
pnpm test:e2e
```
- [ ] French homepage tests pass
- [ ] English homepage tests pass
- [ ] Redirect tests pass

---

## Build Validation

### Production Build
```bash
pnpm build
```
- [ ] Build succeeds
- [ ] No warnings about missing translations
- [ ] Bundle size reasonable

### Preview
```bash
pnpm preview
```
- [ ] Server starts successfully
- [ ] `/fr` loads
- [ ] `/en` loads

---

## Functional Validation

### French Homepage (`/fr`)

#### Content
- [ ] Badge: "En développement"
- [ ] Title: "sebc.dev"
- [ ] Subtitle: "Un laboratoire d'apprentissage public"
- [ ] Description: Contains "IA", "UX", "ingénierie logicielle"
- [ ] Launch label: "Lancement prévu"
- [ ] Launch date: "Fin Novembre 2025"
- [ ] Tagline: "Blog technique • Articles • Guides"

#### Technical
- [ ] `<html lang="fr">`
- [ ] No console errors
- [ ] No 404 requests

### English Homepage (`/en`)

#### Content
- [ ] Badge: "In development"
- [ ] Title: "sebc.dev"
- [ ] Subtitle: "A public learning lab"
- [ ] Description: Contains "AI", "UX", "software engineering"
- [ ] Launch label: "Expected launch"
- [ ] Launch date: "Late November 2025"
- [ ] Tagline: "Tech blog • Articles • Guides"

#### Technical
- [ ] `<html lang="en">`
- [ ] No console errors
- [ ] No 404 requests

### Root Route
- [ ] `/` redirects to `/fr` or `/en`
- [ ] No 404 error

---

## Visual Validation

### Compare with Original

#### Screenshot Comparison
- [ ] Take screenshot of original `app/page.tsx` (before deletion)
- [ ] Take screenshot of `/fr`
- [ ] Take screenshot of `/en`
- [ ] Visual diff shows no regression

#### Elements Check
- [ ] Typography matches
- [ ] Colors match
- [ ] Spacing matches
- [ ] Alignment matches

### Animations

- [ ] Fade-in animations work
- [ ] Timing correct
- [ ] No jank or stutter
- [ ] Same in FR and EN

### Responsive

#### Mobile (375px)
- [ ] Layout correct
- [ ] Text readable
- [ ] No horizontal scroll

#### Tablet (768px)
- [ ] Layout correct
- [ ] Spacing appropriate

#### Desktop (1280px)
- [ ] Layout centered
- [ ] Full content visible

---

## File Structure Validation

### Created Files
- [ ] `app/[locale]/page.tsx` exists
- [ ] File contains `useTranslations('home')`

### Modified Files
- [ ] `messages/fr.json` has `home` namespace (10 keys)
- [ ] `messages/fr.json` has `metadata` namespace (4 keys)
- [ ] `messages/en.json` has `home` namespace (10 keys)
- [ ] `messages/en.json` has `metadata` namespace (4 keys)

### Deleted Files
- [ ] `app/page.tsx` deleted
- [ ] No broken imports

---

## Performance Validation

### Load Time
- [ ] `/fr` loads in <3s
- [ ] `/en` loads in <3s

### Bundle Size
- [ ] No significant increase from translations
- [ ] Lazy loading working if configured

---

## Accessibility Validation

### Basic Checks
- [ ] Heading hierarchy correct (h1 for title)
- [ ] Color contrast sufficient
- [ ] Text readable at 200% zoom

---

## Documentation Validation

### Code Comments
- [ ] No TODO comments left
- [ ] No placeholder text

### Git History
- [ ] 5 commits with proper messages
- [ ] Gitmoji convention followed

---

## Phase Sign-off

### Summary

| Check | Status |
|-------|--------|
| TypeScript | [ ] Pass |
| Lint | [ ] Pass |
| Unit Tests | [ ] Pass |
| E2E Tests | [ ] Pass |
| Build | [ ] Pass |
| FR Content | [ ] Pass |
| EN Content | [ ] Pass |
| Visual | [ ] Pass |
| Responsive | [ ] Pass |

### Blockers

List any blockers or issues:
- None / [Describe issues]

### Notes

Additional notes or observations:
- None / [Add notes]

---

## Approval

- [ ] **Phase 3 Validated**

**Validated by**: _______________
**Date**: _______________

---

## Next Steps

After validation:
1. [ ] Update EPIC_TRACKING.md (Phase 3 → COMPLETED)
2. [ ] Proceed to Phase 4: Métadonnées dynamiques et SEO
3. [ ] Notify team of completion (if applicable)

---

**Validation Checklist Created**: 2025-11-20
