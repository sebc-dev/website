# Phase 3 - Code Review Guide

**Story**: 1.8 - Correction Architecture next-intl
**Phase**: Internationalisation de la page d'accueil

This guide helps reviewers evaluate each commit in this phase.

---

## General Review Principles

### For This Phase
- **Visual Consistency**: Homepage must look identical in FR and EN
- **Translation Quality**: Professional, natural translations
- **No Hardcoded Text**: All visible text uses `useTranslations`
- **Animation Preservation**: All animations must work

### Review Time Estimates
- Commit 3.1: 5 min
- Commit 3.2: 5 min
- Commit 3.3: 15 min
- Commit 3.4: 5 min
- Commit 3.5: 5 min
- **Total**: ~35 min

---

## Commit 3.1 Review: Add home namespace FR

### What to Check

#### JSON Structure
- [ ] Valid JSON syntax (no trailing commas, proper quotes)
- [ ] `home` namespace at correct level (root level)
- [ ] Alphabetical ordering maintained (if project convention)

#### Translation Keys
- [ ] All 10 keys present
- [ ] Key names are semantic and clear
- [ ] Interpolation uses `{variable}` format correctly

#### Translation Content
- [ ] `badge`: "En développement" - correct
- [ ] `title`: "sebc.dev" - brand name unchanged
- [ ] `subtitle`: Natural French
- [ ] `description`: Interpolation placeholders present
- [ ] `ai`, `ux`, `engineering`: Values match FR conventions
- [ ] `launchLabel`, `launchDate`: Natural French
- [ ] `tagline`: Proper bullet separator (•)

### Red Flags
- Missing curly braces around interpolation variables
- English text instead of French
- Trailing commas in JSON

---

## Commit 3.2 Review: Add home namespace EN

### What to Check

#### Key Parity
- [ ] Exact same keys as FR (10 keys)
- [ ] Same interpolation format

#### Translation Quality
- [ ] `badge`: "In development" - correct
- [ ] `subtitle`: Natural English (not literal translation)
- [ ] `description`: "At the intersection of" - idiomatic
- [ ] `engineering`: "software engineering" (not "software engineer")
- [ ] `launchDate`: "Late November 2025" (not "End of November")
- [ ] `tagline`: Consistent separator

### Red Flags
- Direct literal translations that sound unnatural
- Missing or extra keys compared to FR
- Different interpolation variable names

---

## Commit 3.3 Review: Create internationalized homepage

### What to Check

#### Import and Setup
- [ ] `import { useTranslations } from 'next-intl';`
- [ ] `const t = useTranslations('home');`
- [ ] Correct namespace 'home'

#### Text Replacements
- [ ] All hardcoded text replaced with `t()` calls
- [ ] `t('badge')` for badge text
- [ ] `t('title')` for title
- [ ] `t('subtitle')` for subtitle
- [ ] `t.rich('description', {...})` for interpolated description
- [ ] `t('launchLabel')` and `t('launchDate')`
- [ ] `t('tagline')` for tagline

#### Rich Text Implementation
```typescript
t.rich('description', {
  ai: (chunks) => <span className="...">{chunks}</span>,
  ux: (chunks) => <span className="...">{chunks}</span>,
  engineering: (chunks) => <span className="...">{chunks}</span>,
})
```
- [ ] Correct syntax for `t.rich()`
- [ ] All three interpolation variables handled
- [ ] Styling preserved on interpolated elements

#### Styling Preservation
- [ ] All Tailwind classes from original page present
- [ ] Animation classes preserved (animate-fade-in, etc.)
- [ ] Responsive classes preserved
- [ ] Layout structure unchanged

#### Component Structure
- [ ] Default export
- [ ] Proper TypeScript (no type errors)
- [ ] Clean, readable code

### Red Flags
- Missing text that should be translated
- Hardcoded strings remaining
- Broken animations
- Layout differences from original
- TypeScript errors

### Visual Test
- [ ] Compare `/fr` screenshot with original
- [ ] Compare `/en` screenshot with original
- [ ] Verify animations work

---

## Commit 3.4 Review: Add metadata namespace

### What to Check

#### JSON Structure (Both Files)
- [ ] `metadata` namespace added
- [ ] 4 keys: title, description, ogTitle, ogDescription
- [ ] Valid JSON

#### Translation Content

**FR**:
- [ ] `title`: Includes "sebc.dev" and French descriptor
- [ ] `description`: SEO-friendly, ~150 characters
- [ ] `ogTitle`: Can be same as title
- [ ] `ogDescription`: Shorter version for social

**EN**:
- [ ] Same structure as FR
- [ ] Professional English translations
- [ ] SEO-appropriate length

#### Parity
- [ ] Same keys in both files
- [ ] Consistent structure

### Red Flags
- Overly long descriptions (>160 chars)
- Missing SEO keywords
- Literal translation of French SEO text

---

## Commit 3.5 Review: Remove old homepage

### What to Check

#### Pre-deletion Verification
- [ ] `/fr` works with new page
- [ ] `/en` works with new page
- [ ] No imports reference `app/page.tsx`

#### Deletion
- [ ] Only `app/page.tsx` deleted
- [ ] No other files accidentally deleted

#### Post-deletion
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Build succeeds
- [ ] Routes still work

### Red Flags
- Other files deleted
- Broken imports after deletion
- 404 errors on homepage routes

---

## Phase Completion Review

### Final Checks

#### Functionality
- [ ] `/fr` displays correctly
- [ ] `/en` displays correctly
- [ ] `/` redirects appropriately
- [ ] All animations work

#### Code Quality
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Clean commit history

#### Testing
- [ ] `pnpm test` passes
- [ ] Message parity tests pass
- [ ] `pnpm build` succeeds

#### Visual Comparison
- [ ] FR version matches original design
- [ ] EN version matches FR layout
- [ ] No text overflow or alignment issues

### Approval Criteria

**Approve if**:
- All checklist items pass
- No visual regressions
- All tests pass

**Request changes if**:
- Missing translations
- Broken animations
- TypeScript errors
- Build failures

---

**Review Guide Created**: 2025-11-20
