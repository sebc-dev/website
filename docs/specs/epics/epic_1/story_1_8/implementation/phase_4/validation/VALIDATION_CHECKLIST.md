# Phase 4 - Validation Checklist

**Phase**: 4 - Métadonnées SEO
**Status**: [ ] NOT STARTED / [ ] IN PROGRESS / [ ] COMPLETE

---

## Pre-Implementation Validation

### Prerequisites
- [ ] Phase 1 complete and validated
- [ ] Phase 2 complete and validated
- [ ] Phase 3 complete and validated
- [ ] Namespace `metadata` exists in messages/fr.json
- [ ] Namespace `metadata` exists in messages/en.json
- [ ] All 4 required keys present (title, description, ogTitle, ogDescription)

---

## Commit-by-Commit Validation

### Commit 4.1: generateMetadata Base
- [ ] `pnpm tsc` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm dev` starts without errors
- [ ] `/fr` has French title in view source
- [ ] `/en` has English title in view source
- [ ] `<meta name="description">` present
- [ ] Keywords differ between FR and EN

### Commit 4.2: Open Graph
- [ ] `og:locale` = `fr_FR` for French
- [ ] `og:locale` = `en_US` for English
- [ ] `og:title` is translated
- [ ] `og:description` is translated
- [ ] `og:type` = `website`
- [ ] `og:site_name` = `sebc.dev`
- [ ] `og:url` includes locale
- [ ] `og:image` present
- [ ] `og:image:alt` is translated
- [ ] `og:alternate_locale` present

### Commit 4.3: Twitter & Robots
- [ ] `twitter:card` = `summary_large_image`
- [ ] `twitter:title` present and translated
- [ ] `twitter:description` present and translated
- [ ] `twitter:image` present
- [ ] `robots` meta allows index and follow
- [ ] googleBot configuration present

---

## Technical Validation

### TypeScript
- [ ] `pnpm tsc` passes without errors
- [ ] No type errors in generateMetadata
- [ ] Props type uses Promise<{locale: string}>
- [ ] Correct imports from next-intl/server

### Build
- [ ] `pnpm build` succeeds
- [ ] No warnings related to metadata
- [ ] No duplicate metadata warnings

### Lint
- [ ] `pnpm lint` passes
- [ ] No unused imports

---

## Functional Validation

### French Locale (/fr)
- [ ] Title: "sebc.dev - Laboratoire d'apprentissage public"
- [ ] Description contains: "IA", "UX", "ingénierie"
- [ ] og:locale = fr_FR
- [ ] OG title/description in French
- [ ] Twitter card in French
- [ ] Keywords in French

### English Locale (/en)
- [ ] Title: "sebc.dev - Public Learning Lab"
- [ ] Description contains: "AI", "UX", "engineering"
- [ ] og:locale = en_US
- [ ] OG title/description in English
- [ ] Twitter card in English
- [ ] Keywords in English

---

## SEO Validation

### Best Practices
- [ ] Title length: 50-60 characters
- [ ] Description length: 120-160 characters
- [ ] OG image: 1200x630 recommended
- [ ] No duplicate titles between pages
- [ ] No duplicate descriptions

### Meta Tags Complete
- [ ] title
- [ ] description
- [ ] keywords
- [ ] og:title
- [ ] og:description
- [ ] og:locale
- [ ] og:type
- [ ] og:site_name
- [ ] og:url
- [ ] og:image
- [ ] og:image:width
- [ ] og:image:height
- [ ] og:image:alt
- [ ] twitter:card
- [ ] twitter:title
- [ ] twitter:description
- [ ] twitter:image
- [ ] robots

---

## No Conflicts Validation

### Root Layout
- [ ] `app/layout.tsx` has NO `export const metadata`
- [ ] `app/layout.tsx` has NO `export function generateMetadata`
- [ ] Metadata only defined in `app/[locale]/layout.tsx`

### No Duplicates
- [ ] Single title tag in HTML
- [ ] Single description meta
- [ ] No conflicting OG tags

---

## Test Validation

### Unit Tests
- [ ] `pnpm test` passes
- [ ] Message parity tests pass
- [ ] Metadata keys tested

### E2E Tests (if created)
- [ ] `pnpm test:e2e` passes
- [ ] Metadata E2E tests pass
- [ ] Both locales tested

---

## Manual Testing Checklist

### View Source Check
- [ ] Open `/fr` > View Source
- [ ] Search for `<title>` - correct FR text
- [ ] Search for `og:locale` - fr_FR
- [ ] Search for `twitter:card` - present
- [ ] Open `/en` > View Source
- [ ] Search for `<title>` - correct EN text
- [ ] Search for `og:locale` - en_US

### DevTools Check
- [ ] Open `/fr` in browser
- [ ] DevTools > Elements > head
- [ ] Verify all meta tags present
- [ ] Switch to `/en`
- [ ] Verify content changes correctly

---

## External Validation (Optional)

### Social Sharing Preview
- [ ] Facebook Sharing Debugger shows correct preview
- [ ] Twitter Card Validator shows correct preview

### SEO Tools
- [ ] Lighthouse SEO score ≥ 90
- [ ] No critical SEO issues
- [ ] Google Rich Results Test passes

---

## Final Approval

### Code Quality
- [ ] Code follows project conventions
- [ ] No hardcoded strings (all from translations)
- [ ] Proper error handling implicit

### Documentation
- [ ] generateMetadata well structured
- [ ] Code is self-documenting
- [ ] No unnecessary comments

### Ready for Phase 5
- [ ] All commits pushed
- [ ] All validations passed
- [ ] No blocking issues

---

## Sign-off

**Validated by**: _______________
**Date**: _______________
**Notes**:

---

**Created**: 2025-11-20
**Last Updated**: 2025-11-20
