# Phase 2 - Code Review Guide

Complete guide for reviewing the Phase 2 implementation.

---

## 🎯 Review Objective

Validate that the implementation:

- ✅ Creates proper `[locale]` segment structure
- ✅ Configures `NextIntlClientProvider` correctly
- ✅ Simplifies root layout appropriately
- ✅ Provides localized 404 page
- ✅ Aligns middleware with centralized routing
- ✅ Follows next-intl best practices
- ✅ Maintains type safety

---

## 📋 Review Approach

Phase 2 is split into **5 atomic commits**. You can:

**Option A: Commit-by-commit review** (recommended)

- Easier to digest (15-30 min per commit)
- Progressive validation
- Targeted feedback

**Option B: Global review at once**

- Faster (1.5-2h total)
- Immediate overview
- Requires more focus

**Estimated Total Time**: 1.5-2h

---

## 🔍 Commit-by-Commit Review

### Commit 2.1: Créer app/[locale]/layout.tsx

**Files**: `app/[locale]/layout.tsx` (~100 lines)
**Duration**: 25-30 minutes

#### Review Checklist

##### Provider Configuration

- [ ] `NextIntlClientProvider` wraps children
- [ ] `messages` prop passed from `getMessages()`
- [ ] No `locale` prop (automatically inferred)
- [ ] Provider is at correct level in tree

##### Locale Handling

- [ ] `generateStaticParams()` returns all locales
- [ ] Locale parameter properly typed
- [ ] Validation with `notFound()` for invalid locales
- [ ] Uses `routing.locales` for validation

##### HTML Structure

- [ ] `<html lang={locale}>` is dynamic
- [ ] `<body>` includes font classes
- [ ] `antialiased` class applied
- [ ] No duplicate html/body tags

##### Async Handling

- [ ] `getMessages()` is awaited
- [ ] Layout function is async
- [ ] Params destructured correctly (Next.js 15 pattern)

##### Code Quality

- [ ] No `any` types
- [ ] Proper TypeScript interfaces
- [ ] Clean imports organization
- [ ] No unnecessary code

#### Technical Validation

```bash
pnpm tsc
pnpm lint
pnpm dev
# Visit /fr and /en
```

**Expected Result**: Both locales render with Provider active

#### Questions to Ask

1. Is locale validation robust enough?
2. Are fonts properly configured for both locales?
3. Is the Provider at the correct level for Client Component access?

---

### Commit 2.2: Simplifier app/layout.tsx

**Files**: `app/layout.tsx` (~40 lines)
**Duration**: 15-20 minutes

#### Review Checklist

##### Structure Simplification

- [ ] No `<html>` tag
- [ ] No `<body>` tag
- [ ] Returns only children
- [ ] Minimal code

##### Imports

- [ ] globals.css imported
- [ ] Unnecessary imports removed
- [ ] No orphan font imports (if moved)

##### Metadata

- [ ] No metadata export
- [ ] No hardcoded lang attribute
- [ ] Clean separation of concerns

##### Code Quality

- [ ] Proper TypeScript types
- [ ] No commented code
- [ ] No debug statements

#### Technical Validation

```bash
pnpm tsc
pnpm lint
pnpm dev
# App should work correctly
```

**Expected Result**: Minimal root layout delegating to [locale]/layout

#### Questions to Ask

1. Is globals.css import in correct location?
2. Are all unnecessary exports removed?
3. Is the layout truly minimal?

---

### Commit 2.3: Créer app/[locale]/not-found.tsx

**Files**: `app/[locale]/not-found.tsx` (~50 lines)
**Duration**: 15-20 minutes

#### Review Checklist

##### Internationalization

- [ ] `useTranslations('error')` called
- [ ] All visible text uses translations
- [ ] No hardcoded strings
- [ ] Link from `@/src/i18n`

##### Client Component

- [ ] `'use client'` directive present
- [ ] Hooks used correctly
- [ ] No server-only imports

##### Design

- [ ] Centered layout
- [ ] Readable typography
- [ ] Consistent with site style
- [ ] Responsive

##### Functionality

- [ ] Return home link works
- [ ] Link uses correct href="/"
- [ ] Accessible (semantic HTML)

##### Code Quality

- [ ] Clean component structure
- [ ] Proper imports
- [ ] No unnecessary complexity

#### Technical Validation

```bash
pnpm tsc
pnpm lint
pnpm dev
# Visit /fr/nonexistent
# Visit /en/nonexistent
```

**Expected Result**: Localized 404 in both languages

#### Questions to Ask

1. Are all required translation keys present?
2. Is the design accessible?
3. Does the return link navigate correctly?

---

### Commit 2.4: Mettre à jour middleware

**Files**: `middleware.ts` (~30 lines)
**Duration**: 20-25 minutes

#### Review Checklist

##### Configuration Import

- [ ] Imports `routing` from `@/src/i18n/routing`
- [ ] Uses `createMiddleware(routing)`
- [ ] No duplicate locale arrays
- [ ] No duplicate defaultLocale

##### Matcher Configuration

- [ ] Includes root path `/`
- [ ] Includes locale paths `/(fr|en)/:path*`
- [ ] Excludes static assets properly
- [ ] Excludes `_next` and `_vercel`

##### Functionality

- [ ] Root `/` redirects correctly
- [ ] Accept-Language detection works
- [ ] Invalid locales redirect
- [ ] Locale prefix behavior correct

##### Code Quality

- [ ] Single source of truth
- [ ] No hardcoded values
- [ ] Clean, minimal code

#### Technical Validation

```bash
pnpm tsc
pnpm lint
pnpm dev
# Test: / redirects
# Test: /fr works
# Test: /en works
# Test: /de redirects
```

**Expected Result**: Middleware uses centralized config

#### Questions to Ask

1. Is the matcher pattern optimal?
2. Are all edge cases handled?
3. Is locale detection working correctly?

---

### Commit 2.5: Migrer messages-test page

**Files**: `app/[locale]/(test)/messages-test/page.tsx` (~75 lines)
**Duration**: 15-20 minutes

#### Review Checklist

##### Route Structure

- [ ] Uses route group `(test)`
- [ ] Correct directory nesting
- [ ] Page accessible at expected URL

##### Internationalization

- [ ] `useTranslations` for each namespace
- [ ] All namespaces displayed
- [ ] No hardcoded strings
- [ ] Works in both locales

##### Client Component

- [ ] `'use client'` directive present
- [ ] Hooks used correctly
- [ ] Proper error boundaries if needed

##### Usefulness

- [ ] Displays all available translations
- [ ] Easy to read format
- [ ] Helpful for development
- [ ] Easy to add new namespaces

##### Code Quality

- [ ] Clean structure
- [ ] Proper formatting
- [ ] No debug code in production

#### Technical Validation

```bash
pnpm tsc
pnpm lint
pnpm dev
# Visit /fr/messages-test
# Visit /en/messages-test
```

**Expected Result**: All translations visible for verification

#### Questions to Ask

1. Are all namespaces included?
2. Is the format readable?
3. Should this page be excluded from production?

---

## ✅ Global Validation

After reviewing all commits:

### Architecture & Design

- [ ] Proper separation: root layout vs localized layout
- [ ] NextIntlClientProvider at correct level
- [ ] Single source of truth for routing config
- [ ] Clean file organization

### next-intl Best Practices

- [ ] Uses `getMessages()` server function
- [ ] Uses `useTranslations` in Client Components
- [ ] Uses `routing` object from centralized config
- [ ] Link component from project i18n module

### Type Safety

- [ ] No `any` types (unless justified)
- [ ] Proper typing for locale params
- [ ] Interface definitions where needed
- [ ] `pnpm tsc` passes

### Code Quality

- [ ] Consistent style throughout
- [ ] Clear naming conventions
- [ ] Appropriate comments
- [ ] No dead code

### Testing

- [ ] Both locales render correctly
- [ ] 404 page works in both locales
- [ ] Middleware redirects work
- [ ] Test page shows all translations

### Performance

- [ ] No unnecessary re-renders
- [ ] Messages loaded efficiently
- [ ] No blocking operations

---

## 📝 Feedback Template

Use this template for feedback:

```markdown
## Review Feedback - Phase 2

**Reviewer**: [Name]
**Date**: [Date]
**Commits Reviewed**: [list or "all"]

### ✅ Strengths

- [What was done well]
- [Highlight good practices]

### 🔧 Required Changes

1. **[File/Area]**: [Issue description]
   - **Why**: [Explanation]
   - **Suggestion**: [How to fix]

2. [Repeat for each required change]

### 💡 Suggestions (Optional)

- [Nice-to-have improvements]
- [Alternative approaches to consider]

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
2. Update phase status to COMPLETED in INDEX.md
3. Archive review notes
4. Prepare for Phase 3

### If Changes Requested 🔧

1. Create detailed feedback (use template)
2. Discuss with developer
3. Re-review after fixes

### If Rejected ❌

1. Document major issues
2. Schedule discussion
3. Plan rework strategy

---

## 🔍 Common Issues to Watch For

### Provider Issues

- ❌ Provider wrapping wrong elements
- ❌ Missing messages prop
- ❌ Unnecessary locale prop

### Layout Issues

- ❌ Duplicate html/body tags
- ❌ Missing globals.css import
- ❌ Hardcoded lang attribute

### Middleware Issues

- ❌ Duplicate locale configuration
- ❌ Incorrect matcher pattern
- ❌ Missing redirect handling

### Client Component Issues

- ❌ Missing 'use client' directive
- ❌ Server imports in client components
- ❌ Incorrect hook usage

---

## ❓ FAQ

**Q: What if I disagree with an implementation choice?**
A: Discuss with the developer. If it works and follows best practices, it might be acceptable.

**Q: Should I review tests?**
A: Yes! Verify that changes can be tested and that existing tests still pass.

**Q: How detailed should feedback be?**
A: Specific enough to be actionable. Include file, line, and suggestion.

**Q: Can I approve with minor comments?**
A: Yes, mark as approved and note that comments are optional improvements.

**Q: What's the most critical aspect of Phase 2?**
A: The NextIntlClientProvider setup - it's the foundation for all Client Component i18n.
