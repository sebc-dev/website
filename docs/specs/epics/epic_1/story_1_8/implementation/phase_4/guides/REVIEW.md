# Phase 4 - Code Review Guide

**Phase**: 4 - Métadonnées SEO
**Commits**: 3

---

## Review Strategy

Cette phase est relativement simple avec un seul fichier modifié. Focus sur:

- Correction TypeScript (types Next.js 15)
- Traductions utilisées correctement
- Pas de conflits avec root layout

---

## Commit 4.1 Review: generateMetadata Base

### Critical Points

1. **Type Safety**

   ```typescript
   // CORRECT - Next.js 15 pattern
   type Props = {
     params: Promise<{ locale: string }>;
   };

   // INCORRECT - Old pattern
   type Props = {
     params: { locale: string };
   };
   ```

2. **Async/Await Pattern**

   ```typescript
   // CORRECT
   export async function generateMetadata({ params }: Props) {
     const { locale } = await params;
     // ...
   }
   ```

3. **Import from correct package**

   ```typescript
   // CORRECT
   import { getTranslations } from 'next-intl/server';

   // INCORRECT
   import { getTranslations } from 'next-intl';
   ```

### Checklist

- [ ] Type `Props` with Promise for params
- [ ] `await params` before destructuring
- [ ] `getTranslations` from `next-intl/server`
- [ ] Namespace `'metadata'` correct
- [ ] Title and description use translations
- [ ] Keywords array appropriate for each locale

---

## Commit 4.2 Review: Open Graph

### Critical Points

1. **Locale Format**

   ```typescript
   // CORRECT - OG locale format
   locale: locale === 'fr' ? 'fr_FR' : 'en_US',

   // INCORRECT - Using raw locale
   locale: locale, // 'fr' instead of 'fr_FR'
   ```

2. **alternateLocales**

   ```typescript
   // CORRECT
   alternateLocales: locale === 'fr' ? ['en_US'] : ['fr_FR'],
   ```

3. **URL Construction**

   ```typescript
   // CORRECT
   url: `https://sebc.dev/${locale}`,

   // INCORRECT - hardcoded or missing locale
   url: 'https://sebc.dev',
   ```

4. **Image Configuration**
   ```typescript
   images: [
     {
       url: '/og-image.png',
       width: 1200,
       height: 630,
       alt: t('ogTitle'), // Localized alt text
     },
   ],
   ```

### Checklist

- [ ] `og:locale` uses correct format (fr_FR/en_US)
- [ ] `alternateLocales` includes the other locale
- [ ] `type: 'website'` present
- [ ] `siteName` is brand name
- [ ] `url` includes locale segment
- [ ] `images` has width, height, and localized alt
- [ ] ogTitle and ogDescription use translations

---

## Commit 4.3 Review: Twitter & Robots

### Critical Points

1. **Twitter Card Type**

   ```typescript
   // CORRECT for blog/website
   card: 'summary_large_image',

   // ALSO valid but different display
   card: 'summary',
   ```

2. **Consistent Translations**

   ```typescript
   twitter: {
     title: t('ogTitle'),      // Reuse OG translations
     description: t('ogDescription'),
   },
   ```

3. **Robots Configuration**
   ```typescript
   robots: {
     index: true,
     follow: true,
     googleBot: {
       index: true,
       follow: true,
       'max-video-preview': -1,
       'max-image-preview': 'large',
       'max-snippet': -1,
     },
   },
   ```

### Checklist

- [ ] Twitter card type appropriate
- [ ] Twitter uses same translations as OG
- [ ] Twitter image path matches OG
- [ ] Robots allows indexing
- [ ] googleBot config complete
- [ ] No noindex in development

---

## Common Issues to Check

### 1. Conflicting Root Metadata

```typescript
// app/layout.tsx should NOT have:
export const metadata = {
  title: '...', // This would conflict!
};
```

### 2. Missing Await

```typescript
// WRONG - will cause runtime error
const { locale } = params; // params is a Promise!

// CORRECT
const { locale } = await params;
```

### 3. Wrong getTranslations Import

```typescript
// WRONG for Server Components
import { useTranslations } from 'next-intl';

// CORRECT for Server Components
import { getTranslations } from 'next-intl/server';
```

### 4. Missing Keys in Messages

Ensure all keys exist:

- `metadata.title`
- `metadata.description`
- `metadata.ogTitle`
- `metadata.ogDescription`

---

## Performance Considerations

1. **Single getTranslations Call**
   - One call for entire metadata object
   - Avoid multiple calls for same namespace

2. **Static Keywords**
   - Keywords are static per locale, not translated
   - Acceptable for performance

3. **No Dynamic Imports**
   - generateMetadata is already server-side
   - No need for dynamic message loading

---

## Accessibility & SEO

### Title Length

- Should be 50-60 characters
- Descriptive and unique

### Description Length

- Should be 120-160 characters
- Action-oriented, clear

### OG Image

- 1200x630 px recommended
- Alt text required

---

## Final Review Checklist

### TypeScript

- [ ] No type errors
- [ ] Props type correct for Next.js 15
- [ ] Proper imports

### Translations

- [ ] All keys exist in FR and EN
- [ ] getTranslations from server package
- [ ] Namespace correct

### SEO Best Practices

- [ ] Title descriptive
- [ ] Description appropriate length
- [ ] OG tags complete
- [ ] Twitter card complete
- [ ] Robots configured

### No Conflicts

- [ ] Root layout has no metadata
- [ ] Single source of truth for metadata

---

**Created**: 2025-11-20
**Last Updated**: 2025-11-20
