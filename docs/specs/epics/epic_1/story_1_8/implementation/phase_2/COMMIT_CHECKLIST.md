# Phase 2 - Checklist per Commit

This document provides a detailed checklist for each atomic commit of Phase 2.

---

## 📋 Commit 2.1: Créer app/[locale]/layout.tsx

**Files**: `app/[locale]/layout.tsx`
**Estimated Duration**: 45-60 minutes

### Implementation Tasks

- [ ] Create `app/[locale]/` directory
- [ ] Create `layout.tsx` with TypeScript types
- [ ] Import `NextIntlClientProvider` from `next-intl`
- [ ] Import `getMessages` from `next-intl/server`
- [ ] Import fonts (Geist Sans, Geist Mono)
- [ ] Define `generateStaticParams()` for locales
- [ ] Implement async layout function with locale param
- [ ] Call `await getMessages()` to load translations
- [ ] Wrap children with `NextIntlClientProvider`
- [ ] Set `<html lang={locale}>` dynamically
- [ ] Apply font classes to body

### Code Structure

```typescript
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/src/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={/* font classes */}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### Validation

```bash
pnpm tsc
pnpm lint
pnpm dev
# Test: visit /fr and /en
```

**Expected Result**: Both locales render with Provider active

### Review Checklist

#### Provider Setup
- [ ] `NextIntlClientProvider` wraps all children
- [ ] `messages` prop passed correctly
- [ ] No unnecessary props (locale is inferred)

#### Locale Handling
- [ ] `generateStaticParams` returns all locales
- [ ] Locale validation with `notFound()`
- [ ] `<html lang={locale}>` is dynamic

#### Fonts & Styles
- [ ] Geist fonts imported correctly
- [ ] Font variables applied to body
- [ ] `antialiased` class applied

#### Code Quality
- [ ] No `any` types
- [ ] Proper TypeScript typing for params
- [ ] Clean imports organization

### Commit Message

```bash
git add app/[locale]/layout.tsx
git commit -m "🌐 feat(i18n): create localized layout with NextIntlClientProvider

- Implement app/[locale]/layout.tsx with Provider
- Add generateStaticParams for FR/EN locales
- Configure dynamic html lang attribute
- Setup Geist fonts and base styles

Part of Story 1.8 Phase 2 - Commit 1/5"
```

---

## 📋 Commit 2.2: Simplifier app/layout.tsx

**Files**: `app/layout.tsx`
**Estimated Duration**: 20-30 minutes

### Implementation Tasks

- [ ] Read current `app/layout.tsx` content
- [ ] Remove metadata export (moved to [locale]/layout)
- [ ] Remove `<html>` and `<body>` tags
- [ ] Keep font imports if needed globally
- [ ] Keep globals.css import
- [ ] Simplify to pass-through layout
- [ ] Update TypeScript types

### Code Structure

```typescript
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

### Validation

```bash
pnpm tsc
pnpm lint
pnpm dev
# Verify app still works, fonts load, styles apply
```

**Expected Result**: Minimal root layout, no duplicate HTML structure

### Review Checklist

#### Structure
- [ ] No `<html>` tag (handled by [locale]/layout)
- [ ] No `<body>` tag (handled by [locale]/layout)
- [ ] Only returns children

#### Imports
- [ ] globals.css still imported
- [ ] Unnecessary imports removed
- [ ] No orphan code

#### Metadata
- [ ] No metadata export (moved to localized layout)
- [ ] No hardcoded lang attribute

#### Code Quality
- [ ] Clean and minimal
- [ ] Proper TypeScript types
- [ ] No commented code

### Commit Message

```bash
git add app/layout.tsx
git commit -m "🔧 refactor(layout): simplify root layout for locale delegation

- Remove html/body tags (delegated to [locale]/layout)
- Remove metadata (moved to localized layout)
- Keep globals.css import
- Minimal pass-through layout

Part of Story 1.8 Phase 2 - Commit 2/5"
```

---

## 📋 Commit 2.3: Créer app/[locale]/not-found.tsx

**Files**: `app/[locale]/not-found.tsx`
**Estimated Duration**: 30-40 minutes

### Implementation Tasks

- [ ] Create `app/[locale]/not-found.tsx`
- [ ] Import `useTranslations` from `next-intl`
- [ ] Import `Link` from `@/src/i18n`
- [ ] Use `'use client'` directive
- [ ] Call `useTranslations('error')`
- [ ] Display localized 404 title
- [ ] Display localized description
- [ ] Add return home button/link
- [ ] Style consistently with site design

### Code Structure

```typescript
'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n';

export default function NotFound() {
  const t = useTranslations('error');

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">{t('notFound')}</h1>
        <p className="mt-4 text-muted-foreground">{t('notFoundDescription')}</p>
        <Link href="/" className="mt-6 inline-block">
          {t('backHome')}
        </Link>
      </div>
    </div>
  );
}
```

### Message Keys Required

Ensure these exist in `messages/fr.json` and `messages/en.json`:
```json
{
  "error": {
    "notFound": "Page non trouvée",
    "notFoundDescription": "La page que vous recherchez n'existe pas.",
    "backHome": "Retour à l'accueil"
  }
}
```

### Validation

```bash
pnpm tsc
pnpm lint
pnpm dev
# Visit /fr/this-page-does-not-exist
# Visit /en/this-page-does-not-exist
```

**Expected Result**: Localized 404 page in both languages

### Review Checklist

#### Internationalization
- [ ] `useTranslations('error')` called correctly
- [ ] All text from translations
- [ ] Link from `@/src/i18n` (not next/link)

#### Design
- [ ] Centered layout
- [ ] Readable typography
- [ ] Matches site style
- [ ] Responsive design

#### Functionality
- [ ] Link returns to homepage
- [ ] Works in both FR and EN
- [ ] No console errors

#### Code Quality
- [ ] `'use client'` directive present
- [ ] Clean component structure
- [ ] Proper imports

### Commit Message

```bash
git add app/[locale]/not-found.tsx
git commit -m "🌐 feat(i18n): create internationalized 404 page

- Add app/[locale]/not-found.tsx with useTranslations
- Display localized title and description
- Add return home link using next-intl Link
- Style consistent with site design

Part of Story 1.8 Phase 2 - Commit 3/5"
```

---

## 📋 Commit 2.4: Mettre à jour middleware

**Files**: `middleware.ts`
**Estimated Duration**: 30-40 minutes

### Implementation Tasks

- [ ] Read current `middleware.ts`
- [ ] Import `routing` from `@/src/i18n/routing`
- [ ] Remove duplicate locale configuration
- [ ] Use `createMiddleware` with routing config
- [ ] Verify matcher configuration
- [ ] Test redirections

### Code Structure

```typescript
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    '/',
    '/(fr|en)/:path*',
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};
```

### Validation

```bash
pnpm tsc
pnpm lint
pnpm dev
# Test redirections:
# / → /fr/ (or /en/ based on Accept-Language)
# /fr → works
# /en → works
# /de → redirects to default locale
```

**Expected Result**: Middleware uses centralized routing config

### Review Checklist

#### Configuration
- [ ] Imports from `@/src/i18n/routing`
- [ ] No duplicate locale arrays
- [ ] No duplicate defaultLocale

#### Functionality
- [ ] Root `/` redirects correctly
- [ ] Locale detection works
- [ ] Invalid locales redirect
- [ ] Static assets not intercepted

#### Matcher
- [ ] Includes root path `/`
- [ ] Includes locale paths `/(fr|en)/:path*`
- [ ] Excludes `_next`, `_vercel`, files with extensions

#### Code Quality
- [ ] Clean, minimal code
- [ ] Single source of truth for config
- [ ] No hardcoded values

### Commit Message

```bash
git add middleware.ts
git commit -m "🔧 refactor(middleware): use centralized routing configuration

- Import routing from @/src/i18n/routing
- Remove duplicate locale configuration
- Maintain matcher for correct path handling
- Single source of truth for i18n config

Part of Story 1.8 Phase 2 - Commit 4/5"
```

---

## 📋 Commit 2.5: Migrer messages-test page

**Files**: `app/[locale]/(test)/messages-test/page.tsx`
**Estimated Duration**: 30-45 minutes

### Implementation Tasks

- [ ] Create `app/[locale]/(test)/messages-test/` directory
- [ ] Create or migrate `page.tsx`
- [ ] Import `useTranslations` from `next-intl`
- [ ] Display all namespaces for testing
- [ ] Style for easy visual validation
- [ ] Add locale indicator

### Code Structure

```typescript
'use client';

import { useTranslations } from 'next-intl';

export default function MessagesTestPage() {
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const tError = useTranslations('error');
  // ... other namespaces

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Messages Test</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold">Common</h2>
        <pre>{JSON.stringify({
          appName: tCommon('appName'),
          // ... other keys
        }, null, 2)}</pre>
      </section>

      {/* Other namespaces... */}
    </div>
  );
}
```

### Validation

```bash
pnpm tsc
pnpm lint
pnpm dev
# Visit /fr/messages-test
# Visit /en/messages-test
```

**Expected Result**: All translations visible for manual verification

### Review Checklist

#### Functionality
- [ ] All namespaces displayed
- [ ] Works in both FR and EN
- [ ] No missing keys errors
- [ ] Readable format

#### Structure
- [ ] Route group `(test)` used correctly
- [ ] Clean component structure
- [ ] Easy to add new namespaces

#### Code Quality
- [ ] `'use client'` directive present
- [ ] Proper imports
- [ ] No hardcoded strings

#### Purpose
- [ ] Useful for development testing
- [ ] Easy visual validation
- [ ] Documents available keys

### Commit Message

```bash
git add app/[locale]/\(test\)/messages-test/
git commit -m "🔧 feat(i18n): migrate messages-test page to localized route

- Move to app/[locale]/(test)/messages-test/
- Display all translation namespaces
- Enable visual validation of i18n setup
- Support both FR and EN locales

Part of Story 1.8 Phase 2 - Commit 5/5"
```

---

## ✅ Final Phase Validation

After all commits:

### Complete Phase Checklist

- [ ] All 5 commits completed
- [ ] All TypeScript compiles without errors
- [ ] Linter passes with no errors
- [ ] `/fr` route works correctly
- [ ] `/en` route works correctly
- [ ] `<html lang>` is dynamic
- [ ] Provider transmits messages
- [ ] 404 page is localized
- [ ] Middleware redirects correctly
- [ ] Test page shows all translations

### Final Validation Commands

```bash
# Type-checking
pnpm tsc

# Linting
pnpm lint

# Unit tests
pnpm test

# Manual testing
pnpm dev
# Visit: /fr, /en, /fr/messages-test, /en/messages-test
# Visit: /fr/nonexistent, /en/nonexistent (404 test)
# Visit: / (redirect test)
```

### Browser Testing Checklist

- [ ] `/fr` - French layout renders
- [ ] `/en` - English layout renders
- [ ] `/` - Redirects to default locale
- [ ] `/fr/messages-test` - Shows French translations
- [ ] `/en/messages-test` - Shows English translations
- [ ] `/fr/404test` - Shows French 404
- [ ] `/en/404test` - Shows English 404
- [ ] View source: `<html lang="fr">` or `<html lang="en">`

**Phase 2 is complete when all checkboxes are checked! 🎉**
