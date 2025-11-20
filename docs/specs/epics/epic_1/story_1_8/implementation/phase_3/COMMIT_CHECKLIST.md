# Phase 3 - Commit Checklist

**Story**: 1.8 - Correction Architecture next-intl
**Phase**: Internationalisation de la page d'accueil

Use this checklist to track progress through each commit. Check items as you complete them.

---

## Commit 3.1: Add home namespace to messages/fr.json

### Pre-commit
- [ ] Read current `messages/fr.json` structure
- [ ] Identify insertion point for `home` namespace

### Implementation
- [ ] Add `home` object to `messages/fr.json`
- [ ] Add `badge` key: "En développement"
- [ ] Add `title` key: "sebc.dev"
- [ ] Add `subtitle` key: "Un laboratoire d'apprentissage public"
- [ ] Add `description` key with interpolation: "À l'intersection de l'{ai}, de l'{ux} et de l'{engineering}"
- [ ] Add `ai` key: "IA"
- [ ] Add `ux` key: "UX"
- [ ] Add `engineering` key: "ingénierie logicielle"
- [ ] Add `launchLabel` key: "Lancement prévu"
- [ ] Add `launchDate` key: "Fin Novembre 2025"
- [ ] Add `tagline` key: "Blog technique • Articles • Guides"

### Validation
- [ ] JSON syntax is valid (no parse errors)
- [ ] All 10 keys present in `home` namespace
- [ ] Interpolation uses `{variable}` format
- [ ] Keys are in logical order

### Commit
- [ ] Stage `messages/fr.json`
- [ ] Commit message: `🌐 i18n(messages): add home namespace to fr.json`

---

## Commit 3.2: Add home namespace to messages/en.json

### Pre-commit
- [ ] Verify commit 3.1 completed
- [ ] Read current `messages/en.json` structure

### Implementation
- [ ] Add `home` object to `messages/en.json`
- [ ] Add `badge` key: "In development"
- [ ] Add `title` key: "sebc.dev"
- [ ] Add `subtitle` key: "A public learning lab"
- [ ] Add `description` key: "At the intersection of {ai}, {ux}, and {engineering}"
- [ ] Add `ai` key: "AI"
- [ ] Add `ux` key: "UX"
- [ ] Add `engineering` key: "software engineering"
- [ ] Add `launchLabel` key: "Expected launch"
- [ ] Add `launchDate` key: "Late November 2025"
- [ ] Add `tagline` key: "Tech blog • Articles • Guides"

### Validation
- [ ] JSON syntax is valid
- [ ] All 10 keys match FR structure exactly
- [ ] Translations are natural and professional
- [ ] `pnpm test messages.test.ts` passes (if parity tests exist)

### Commit
- [ ] Stage `messages/en.json`
- [ ] Commit message: `🌐 i18n(messages): add home namespace to en.json`

---

## Commit 3.3: Create internationalized homepage

### Pre-commit
- [ ] Verify commits 3.1-3.2 completed
- [ ] Read current `app/page.tsx` to understand structure
- [ ] Note all CSS classes and animations

### Implementation
- [ ] Create `app/[locale]/page.tsx`
- [ ] Import `useTranslations` from `next-intl`
- [ ] Define `HomePage` component
- [ ] Add `const t = useTranslations('home');`
- [ ] Copy main element with all classes from old page
- [ ] Replace badge text with `{t('badge')}`
- [ ] Replace title with `{t('title')}`
- [ ] Replace subtitle with `{t('subtitle')}`
- [ ] Implement `t.rich('description', {...})` for interpolated text
- [ ] Replace launch label with `{t('launchLabel')}`
- [ ] Replace launch date with `{t('launchDate')}`
- [ ] Replace tagline with `{t('tagline')}`
- [ ] Preserve ALL Tailwind classes exactly
- [ ] Preserve ALL animation classes

### Validation
- [ ] TypeScript compiles: `pnpm tsc`
- [ ] ESLint passes: `pnpm lint`
- [ ] `/fr` shows French content
- [ ] `/en` shows English content
- [ ] Animations work correctly
- [ ] Layout matches original design
- [ ] All text elements visible

### Commit
- [ ] Stage `app/[locale]/page.tsx`
- [ ] Commit message: `✨ feat(home): create internationalized homepage with useTranslations`

---

## Commit 3.4: Add metadata namespace

### Pre-commit
- [ ] Verify commit 3.3 completed
- [ ] Plan metadata structure for SEO

### Implementation - FR
- [ ] Add `metadata` object to `messages/fr.json`
- [ ] Add `title` key
- [ ] Add `description` key
- [ ] Add `ogTitle` key
- [ ] Add `ogDescription` key

### Implementation - EN
- [ ] Add `metadata` object to `messages/en.json`
- [ ] Add `title` key
- [ ] Add `description` key
- [ ] Add `ogTitle` key
- [ ] Add `ogDescription` key

### Validation
- [ ] Both JSON files are valid
- [ ] All 4 keys present in both files
- [ ] Keys match between FR and EN
- [ ] Translations are SEO-appropriate
- [ ] `pnpm test` passes

### Commit
- [ ] Stage `messages/fr.json` and `messages/en.json`
- [ ] Commit message: `🌐 i18n(messages): add metadata namespace for SEO`

---

## Commit 3.5: Remove old homepage

### Pre-commit
- [ ] Verify all previous commits completed
- [ ] Test `/fr` homepage works
- [ ] Test `/en` homepage works
- [ ] Test `/` redirects correctly
- [ ] Search for imports of `app/page.tsx`

### Implementation
- [ ] Delete `app/page.tsx`

### Validation
- [ ] No TypeScript errors: `pnpm tsc`
- [ ] No ESLint errors: `pnpm lint`
- [ ] `/fr` still works
- [ ] `/en` still works
- [ ] `/` redirects to `/fr` or `/en`
- [ ] Build succeeds: `pnpm build`
- [ ] All tests pass: `pnpm test`

### Commit
- [ ] Stage deletion of `app/page.tsx`
- [ ] Commit message: `🔥 refactor(home): remove old non-localized homepage`

---

## Phase Completion

### Final Validation
- [ ] All 5 commits completed
- [ ] `pnpm tsc` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
- [ ] `pnpm build` succeeds
- [ ] `/fr` displays correctly
- [ ] `/en` displays correctly
- [ ] Visual regression check passed

### Documentation
- [ ] Update EPIC_TRACKING.md status if applicable
- [ ] Note any deviations from plan

### Next Phase
- [ ] Phase 4: Métadonnées dynamiques et SEO is ready to start

---

**Checklist Created**: 2025-11-20
