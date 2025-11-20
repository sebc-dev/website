# Phase 4 - Implementation Plan

**Objective**: Implémenter les métadonnées dynamiques localisées pour le SEO
**Duration**: 0.5 jour
**Total Commits**: 3

---

## Atomic Commits Strategy

Cette phase est relativement simple avec 3 commits progressifs qui construisent le système de métadonnées complet.

### Commit Sizing Rationale

- **Phase Size**: Small (3 commits)
- **Average Lines**: ~50-80 lignes par commit
- **Review Time**: ~15-20 minutes par commit
- **Total Implementation**: ~1h20-2h

---

## Commit 4.1: Implémenter generateMetadata dans layout

### Objective
Ajouter la fonction `generateMetadata()` au layout localisé avec title et description dynamiques.

### Estimated Time
30-45 minutes

### Files to Modify

#### `app/[locale]/layout.tsx`

```typescript
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
    keywords: locale === 'fr'
      ? ['IA', 'UX', 'ingénierie logicielle', 'blog technique']
      : ['AI', 'UX', 'software engineering', 'tech blog'],
  };
}
```

### Implementation Steps

1. Importer `getTranslations` de `next-intl/server`
2. Importer type `Metadata` de `next`
3. Définir le type `Props` avec params Promise
4. Créer fonction `generateMetadata` async
5. Extraire locale avec await
6. Récupérer traductions du namespace `metadata`
7. Retourner objet Metadata avec title et description
8. Ajouter keywords localisés

### Validation

- [ ] `pnpm tsc` passe
- [ ] `pnpm dev` démarre sans erreur
- [ ] View source `/fr` montre `<title>` en français
- [ ] View source `/en` montre `<title>` en anglais

---

## Commit 4.2: Open Graph localisé

### Objective
Ajouter les métadonnées Open Graph complètes avec locale et traductions.

### Estimated Time
30-45 minutes

### Files to Modify

#### `app/[locale]/layout.tsx`

Étendre le return de `generateMetadata`:

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
    keywords: locale === 'fr'
      ? ['IA', 'UX', 'ingénierie logicielle', 'blog technique']
      : ['AI', 'UX', 'software engineering', 'tech blog'],
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      alternateLocales: locale === 'fr' ? ['en_US'] : ['fr_FR'],
      type: 'website',
      siteName: 'sebc.dev',
      url: `https://sebc.dev/${locale}`,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: t('ogTitle'),
        },
      ],
    },
  };
}
```

### Implementation Steps

1. Ajouter objet `openGraph` au retour
2. Utiliser `t('ogTitle')` et `t('ogDescription')`
3. Définir `locale` avec format Open Graph (`fr_FR`, `en_US`)
4. Ajouter `alternateLocales` pour la locale non-active
5. Définir `type: 'website'`
6. Ajouter `siteName: 'sebc.dev'`
7. Construire `url` dynamique avec locale
8. Configurer `images` avec alt localisé

### Validation

- [ ] View source `/fr` montre `og:locale` = `fr_FR`
- [ ] View source `/en` montre `og:locale` = `en_US`
- [ ] `og:title` et `og:description` traduits
- [ ] `og:alternate_locale` présent
- [ ] `og:site_name` = sebc.dev

---

## Commit 4.3: Twitter card et robots

### Objective
Compléter les métadonnées avec Twitter card et configuration robots.

### Estimated Time
20-30 minutes

### Files to Modify

#### `app/[locale]/layout.tsx`

Compléter `generateMetadata`:

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
    keywords: locale === 'fr'
      ? ['IA', 'UX', 'ingénierie logicielle', 'blog technique']
      : ['AI', 'UX', 'software engineering', 'tech blog'],
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      alternateLocales: locale === 'fr' ? ['en_US'] : ['fr_FR'],
      type: 'website',
      siteName: 'sebc.dev',
      url: `https://sebc.dev/${locale}`,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: t('ogTitle'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: ['/og-image.png'],
    },
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
  };
}
```

### Implementation Steps

1. Ajouter objet `twitter` avec card type `summary_large_image`
2. Réutiliser `t('ogTitle')` et `t('ogDescription')` pour Twitter
3. Ajouter `images` pour Twitter card
4. Configurer `robots` avec index/follow
5. Ajouter configuration `googleBot` complète

### Validation

- [ ] `twitter:card` = `summary_large_image`
- [ ] `twitter:title` et `twitter:description` traduits
- [ ] `robots` meta tag présent
- [ ] Configuration googleBot complète

---

## Final generateMetadata Structure

```typescript
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
    keywords: locale === 'fr'
      ? ['IA', 'UX', 'ingénierie logicielle', 'blog technique']
      : ['AI', 'UX', 'software engineering', 'tech blog'],
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      alternateLocales: locale === 'fr' ? ['en_US'] : ['fr_FR'],
      type: 'website',
      siteName: 'sebc.dev',
      url: `https://sebc.dev/${locale}`,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: t('ogTitle'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: ['/og-image.png'],
    },
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
  };
}
```

---

## Risk Mitigation

### Potential Issues

1. **Conflit avec métadonnées root**
   - Root layout ne doit pas avoir de métadonnées conflictuelles
   - Vérifier `app/layout.tsx` et supprimer métadonnées si présentes

2. **Erreur await params**
   - Next.js 15 requiert `await` pour params dans generateMetadata
   - Type doit être `Promise<{ locale: string }>`

3. **Traductions manquantes**
   - Vérifier que namespace `metadata` existe avec toutes les clés
   - Clés requises: title, description, ogTitle, ogDescription

### Validation Points

- [ ] Pas de duplicate title/description
- [ ] Root layout simplifié (pas de métadonnées)
- [ ] TypeScript compile sans erreur
- [ ] Messages FR/EN complets pour metadata

---

## Dependencies

### Required from Previous Phases

- Phase 3: Namespace `metadata` dans messages/fr.json et en.json
- Phase 2: Layout `app/[locale]/layout.tsx` existant
- Phase 1: Structure i18n fonctionnelle

### Keys Required in Messages

```json
{
  "metadata": {
    "title": "...",
    "description": "...",
    "ogTitle": "...",
    "ogDescription": "..."
  }
}
```

---

**Created**: 2025-11-20
**Last Updated**: 2025-11-20
