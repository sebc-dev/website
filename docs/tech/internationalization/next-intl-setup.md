# Internationalization avec next-intl

## Vue d'ensemble

`next-intl` est la solution de référence pour l'internationalisation dans Next.js 15 App Router avec support complet des React Server Components (RSC).

## Avantages pour sebc.dev

✅ **App Router Native** : Support complet du nouvel App Router
✅ **RSC Support** : Fonctionne avec les Server Components
✅ **Type-safe** : TypeScript intégré
✅ **Middleware** : Détection automatique de locale
✅ **Fallback** : Gestion des traductions manquantes
✅ **Performance** : Code splitting par langue

## Installation

```bash
npm install next-intl
```

## Configuration

### 1. Structure des Fichiers

```
src/
├── messages/
│   ├── en.json
│   ├── fr.json
│   └── es.json
├── middleware.ts
├── i18n.config.ts
└── app/
    └── [locale]/
        ├── layout.tsx
        └── page.tsx
```

### 2. Fichiers de Traductions

```json
// src/messages/fr.json
{
  "homepage": {
    "title": "Bienvenue",
    "subtitle": "Mon blog personnel"
  },
  "article": {
    "readMore": "Lire la suite",
    "published": "Publié le {date}"
  }
}
```

```json
// src/messages/en.json
{
  "homepage": {
    "title": "Welcome",
    "subtitle": "My personal blog"
  },
  "article": {
    "readMore": "Read More",
    "published": "Published on {date}"
  }
}
```

### 3. Configuration next-intl

```typescript
// src/i18n.config.ts
import { getRequestConfig } from "next-intl/server";

export const defaultLocale = "fr";
export const locales = ["fr", "en", "es"] as const;

export default getRequestConfig(async ({ locale }) => ({
  messages: (
    await import(`./messages/${locale}.json`)
  ).default,
}));
```

### 4. Middleware

```typescript
// src/middleware.ts
import createMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "@/i18n.config";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always", // /fr/... , /en/...
});

export const config = {
  matcher: [
    // Inclure tous les chemins sauf les fichiers statiques
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

### 5. App Router Structure

```typescript
// src/app/[locale]/layout.tsx
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { locales } from "@/i18n.config";

export const metadata = {
  title: "Mon Blog",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Valider la locale
  if (!locales.includes(params.locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={params.locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

## Utilisation

### Server Component

```typescript
// src/app/[locale]/page.tsx
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("homepage");

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("subtitle")}</p>
    </div>
  );
}
```

### Client Component

```typescript
// src/components/article-card.tsx
"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

export function ArticleCard({ article, publishDate }) {
  const t = useTranslations("article");
  const locale = useLocale();

  return (
    <article>
      <h2>{article.title}</h2>
      <p>
        {t("published", {
          date: publishDate.toLocaleDateString(locale),
        })}
      </p>
      <a href="#">{t("readMore")}</a>
    </article>
  );
}
```

## Traductions Dynamiques

### Format de Messages Complexes

```json
{
  "article": {
    "comments": "{count, plural, =0 {Pas de commentaires} one {# commentaire} other {# commentaires}}"
  }
}
```

### Utilisation

```typescript
const t = useTranslations("article");
const message = t("comments", { count: 5 }); // "5 commentaires"
```

## Navigation entre Locales

### Link Helper

```typescript
// src/components/locale-switcher.tsx
import Link from "next/link";
import { useLocale } from "next-intl";

export function LocaleSwitcher() {
  const locale = useLocale();
  const locales = ["fr", "en", "es"];

  return (
    <div>
      {locales.map((loc) => (
        <Link
          key={loc}
          href={`/${loc}`}
          className={locale === loc ? "active" : ""}
        >
          {loc.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
```

## Fallback et Défauts

### Gestion des Clés Manquantes

```typescript
// Configuration dans i18n.config.ts
export default getRequestConfig(async ({ locale }) => ({
  messages: (
    await import(`./messages/${locale}.json`)
  ).default,
  defaultTranslationValues: {
    // Valeurs par défaut pour les variables manquantes
    br: <br />,
  },
  onError(error) {
    console.warn(`Missing translation: ${error.message}`);
  },
}));
```

## Optimisations

### Code Splitting par Langue

next-intl charge automatiquement les messages de la langue requise :

```typescript
// Seules les traductions FR sont chargées en production
await import(`./messages/fr.json`)
```

### Statique Generation (SSG)

```typescript
export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
```

Cela pré-rend toutes les pages pour chaque locale.

## Considérations de Performance

✅ Utilisez `useTranslations` dans les Server Components
✅ Chargez les messages au démarrage de l'app
✅ Utilisez SSG pour les pages statiques
✅ Compressez les fichiers JSON de traductions

❌ Ne créez pas de fichiers de traduction par page
❌ N'utilisez pas les traductions dans les métadonnées sans SSG
❌ Ne chargez pas toutes les langues au startup

## Ressources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [App Router Integration](https://next-intl-docs.vercel.app/docs/getting-started/app-router)
- [RSC Support](https://next-intl-docs.vercel.app/docs/use-cases/rsc)
