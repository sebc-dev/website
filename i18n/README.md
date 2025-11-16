# i18n Configuration

This directory contains the internationalization (i18n) configuration for the application using **next-intl** with Next.js 15 App Router.

## 📁 Structure

```text
i18n/
├── config.ts     # next-intl request configuration
├── types.ts      # TypeScript type definitions
├── index.ts      # Barrel exports
└── README.md     # This file
```

## 🌍 Supported Locales

- **French (fr)** - Default locale
- **English (en)**

The default locale is French (`fr`) as specified in the PRD requirements.

## 🔧 Configuration

### Locale Types and Constants

```typescript
import { type Locale, locales, defaultLocale } from '@/i18n';

// Locale type: 'fr' | 'en'
const currentLocale: Locale = 'fr';

// All supported locales
console.log(locales); // ['fr', 'en']

// Default locale
console.log(defaultLocale); // 'fr'
```

### Request Configuration

The `config.ts` file exports a `getRequestConfig` function that next-intl uses to load translations for each request:

```typescript
// This is handled automatically by next-intl
// You don't need to call this directly
```

## 📝 Message Files

Message files will be created in **Story 1.2** at:

```text
messages/
├── fr.json       # French translations
└── en.json       # English translations
```

The configuration is already set up to dynamically import these files based on the current locale.

## 🚀 Usage

### In Server Components

```typescript
import { useTranslations } from 'next-intl';

export default function MyPage() {
  const t = useTranslations();

  return <h1>{t('welcome')}</h1>;
}
```

### In Client Components

```typescript
'use client';

import { useTranslations } from 'next-intl';

export default function MyClientComponent() {
  const t = useTranslations();

  return <p>{t('description')}</p>;
}
```

## 📋 Next Steps

1. **Story 1.2**: Create message files (`messages/fr.json`, `messages/en.json`)
2. **Story 1.3**: Implement middleware for locale detection and routing
3. **Story 1.4**: Configure bilingual URL structure (`/fr/*`, `/en/*`)

## 🔗 Resources

- [next-intl Documentation](https://next-intl.dev/)
- [Next.js 15 i18n Guide](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [Project PRD](../docs/specs/PRD.md) - Epic 1: Internationalisation

---

**Configuration Status**: ✅ Complete (Phase 2)
**Ready for**: Story 1.2 (Message Files), Story 1.3 (Middleware)
