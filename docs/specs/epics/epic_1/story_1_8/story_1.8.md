# Story 1.8 - Correction Architecture next-intl et Internationalisation des Pages

**Status**: PLANNING
**Epic**: Epic 1 - Internationalisation (i18n)
**Created**: 2025-11-20
**Estimated Duration**: 4-5 days

---

## Story Description

Cette story corrige l'implémentation actuelle de next-intl pour l'aligner avec les best practices documentées dans le rapport technique "Cloudflare Workers + Next.js 15 + next-intl" (novembre 2025). Elle inclut également la migration des pages existantes vers le segment `[locale]` et l'internationalisation complète de leur contenu.

---

## Background & Context

### Problèmes identifiés dans l'implémentation actuelle

1. **API `getRequestConfig` obsolète**: Utilise `({ locale })` au lieu de `({ requestLocale })` avec `await`
2. **Structure de fichiers non standard**:
   - `i18n/config.ts` au lieu de `src/i18n/routing.ts` + `src/i18n/request.ts`
   - Pas de segment dynamique `[locale]` dans `app/`
3. **Absence de routing centralisé**:
   - Pas de `defineRouting()` de next-intl
   - Utilitaires de navigation typés manquants (`Link`, `redirect`, `useRouter`)
4. **Layout racine hardcodé**:
   - `<html lang='fr'>` au lieu de `<html lang={locale}>`
   - Pas de `NextIntlClientProvider` pour les Client Components
5. **Contenu non internationalisé**:
   - Page d'accueil avec texte hardcodé en français
   - Métadonnées statiques en français uniquement

### Contenu à internationaliser

Page d'accueil (`app/page.tsx`) - Textes identifiés :

- "En développement"
- "sebc.dev" (conservé tel quel - nom de marque)
- "Un laboratoire d'apprentissage public"
- "À l'intersection de l'IA, de l'UX et de l'ingénierie logicielle"
- "Lancement prévu"
- "Fin Novembre 2025"
- "Blog technique • Articles • Guides"

Layout racine (`app/layout.tsx`) - Métadonnées :

- Title, description, keywords
- Open Graph metadata
- Twitter card metadata

### Référence technique

- Document: `/docs/tech/cloudflare-workers/cloudflare-nextjs-nextintl.md`
- Sections clés: 3.2 (routing.ts), 3.3 (request.ts), 6.2 (Provider), 2.2 (OpenNext cache)

---

## User Stories & Acceptance Criteria

### User Story

> En tant qu'utilisateur, je veux voir le site dans ma langue préférée (FR/EN) avec un contenu entièrement traduit afin de comprendre et naviguer facilement sur le site.

> En tant que développeur, je veux que l'implémentation i18n suive les best practices next-intl 2025 afin d'avoir une architecture maintenable et performante.

### Acceptance Criteria

#### AC1: Structure des fichiers conforme

- [ ] Fichiers i18n déplacés vers `src/i18n/`
- [ ] `src/i18n/routing.ts` créé avec `defineRouting()` et `createSharedPathnamesNavigation()`
- [ ] `src/i18n/request.ts` créé avec la nouvelle API `requestLocale`
- [ ] Barrel export dans `src/i18n/index.ts`

#### AC2: Segment [locale] dans App Router

- [ ] Structure `app/[locale]/layout.tsx` créée
- [ ] `app/[locale]/page.tsx` créée avec contenu internationalisé
- [ ] `app/[locale]/not-found.tsx` créée
- [ ] Ancien `app/page.tsx` supprimé ou redirigé

#### AC3: Layout localisé avec Provider

- [ ] `app/[locale]/layout.tsx` utilise `<html lang={locale}>`
- [ ] `NextIntlClientProvider` wrapping les children avec les messages
- [ ] `getMessages()` utilisé pour charger les traductions côté serveur
- [ ] Métadonnées dynamiques selon la locale (title, description, OG)

#### AC4: Page d'accueil internationalisée

- [ ] Tous les textes utilisent `useTranslations()` ou `getTranslations()`
- [ ] Namespace `home` créé dans messages FR et EN
- [ ] Traductions complètes pour les 7 textes identifiés
- [ ] Contenu identique visuellement dans les deux langues

#### AC5: Messages FR/EN enrichis

- [ ] Namespace `home` ajouté à `messages/fr.json`
- [ ] Namespace `home` ajouté à `messages/en.json`
- [ ] Namespace `metadata` pour les métadonnées SEO
- [ ] Tests de parité mis à jour

#### AC6: Utilitaires de navigation typés

- [ ] Export de `Link`, `redirect`, `usePathname`, `useRouter` depuis routing.ts
- [ ] Composants utilisent ces utilitaires au lieu des natifs Next.js
- [ ] Type-safety complète sur les navigations

#### AC7: Configuration request.ts mise à jour

- [ ] Utilisation de `await requestLocale` (API Next.js 15)
- [ ] Validation robuste avec fallback sur `defaultLocale`
- [ ] Import dynamique des messages conservé

#### AC8: Middleware aligné

- [ ] Middleware utilise la configuration centralisée de `routing.ts`
- [ ] Pattern de chaînage manuel conservé
- [ ] Redirection `/` vers `/fr/` ou `/en/` fonctionnelle

#### AC9: Tests et validation

- [ ] Tests unitaires mis à jour pour la nouvelle structure
- [ ] Tests E2E passent avec le nouveau routage
- [ ] Tests de parité des traductions passent
- [ ] TypeScript compile sans erreur
- [ ] Build production réussit

---

## Technical Requirements

### Dependencies

- `next-intl` v4.5.3+ (déjà installé)
- `@opennextjs/cloudflare` (déjà configuré)

### Files to Create

```
src/
├── i18n/
│   ├── routing.ts      # defineRouting + createSharedPathnamesNavigation
│   ├── request.ts      # getRequestConfig avec await requestLocale
│   └── index.ts        # Barrel exports
app/
├── [locale]/
│   ├── layout.tsx      # Layout localisé avec Provider + métadonnées
│   ├── page.tsx        # Page d'accueil internationalisée
│   └── not-found.tsx   # Page 404 localisée
```

### Files to Modify

- `messages/fr.json` - Ajouter namespaces `home` et `metadata`
- `messages/en.json` - Ajouter namespaces `home` et `metadata`
- `middleware.ts` - Utiliser config de `src/i18n/routing.ts`
- `app/layout.tsx` - Simplifier (garder uniquement fonts/globals)
- Tests de parité des messages

### Files to Delete/Archive

- `i18n/` (ancien dossier) - Migrer vers `src/i18n/`
- `app/page.tsx` - Remplacé par `app/[locale]/page.tsx`

### New Message Keys

#### messages/fr.json - Namespace "home"

```json
{
  "home": {
    "badge": "En développement",
    "title": "sebc.dev",
    "subtitle": "Un laboratoire d'apprentissage public",
    "description": "À l'intersection de l'{ai}, de l'{ux} et de l'{engineering}",
    "ai": "IA",
    "ux": "UX",
    "engineering": "ingénierie logicielle",
    "launchLabel": "Lancement prévu",
    "launchDate": "Fin Novembre 2025",
    "tagline": "Blog technique • Articles • Guides"
  },
  "metadata": {
    "title": "sebc.dev - Laboratoire d'apprentissage public",
    "description": "À l'intersection de l'IA, de l'UX et de l'ingénierie logicielle. Blog technique, articles et guides sur le développement moderne.",
    "ogTitle": "sebc.dev - Laboratoire d'apprentissage public",
    "ogDescription": "À l'intersection de l'IA, de l'UX et de l'ingénierie logicielle."
  }
}
```

#### messages/en.json - Namespace "home"

```json
{
  "home": {
    "badge": "In development",
    "title": "sebc.dev",
    "subtitle": "A public learning lab",
    "description": "At the intersection of {ai}, {ux}, and {engineering}",
    "ai": "AI",
    "ux": "UX",
    "engineering": "software engineering",
    "launchLabel": "Expected launch",
    "launchDate": "Late November 2025",
    "tagline": "Tech blog • Articles • Guides"
  },
  "metadata": {
    "title": "sebc.dev - Public Learning Lab",
    "description": "At the intersection of AI, UX, and software engineering. Tech blog, articles, and guides on modern development.",
    "ogTitle": "sebc.dev - Public Learning Lab",
    "ogDescription": "At the intersection of AI, UX, and software engineering."
  }
}
```

---

## Implementation Phases

### Phase 1: Restructuration i18n et nouveau routing (1 jour)

**Objectif**: Créer la nouvelle structure conforme aux best practices

**Commits**:

1. Créer `src/i18n/routing.ts` avec `defineRouting()` et navigation typée
2. Créer `src/i18n/request.ts` avec nouvelle API `requestLocale`
3. Créer barrel export `src/i18n/index.ts`
4. Mettre à jour tous les imports existants
5. Archiver/supprimer l'ancien dossier `i18n/`

**Validation**:

- TypeScript compile
- Imports résolus correctement
- Tests unitaires passent

---

### Phase 2: Segment [locale] et Layout Provider (1.5 jours)

**Objectif**: Créer la structure App Router avec segment dynamique et Provider

**Commits**:

1. Créer `app/[locale]/layout.tsx` avec `NextIntlClientProvider`
2. Simplifier `app/layout.tsx` (fonts/globals uniquement)
3. Créer `app/[locale]/not-found.tsx` internationalisé
4. Mettre à jour le middleware pour la nouvelle structure
5. Migrer `app/[locale]/(test)/messages-test/` si nécessaire

**Validation**:

- Routes `/fr` et `/en` répondent
- Provider transmet les messages
- `<html lang>` dynamique selon locale
- Middleware redirige `/` correctement

---

### Phase 3: Internationalisation de la page d'accueil (1 jour)

**Objectif**: Migrer et internationaliser la page d'accueil

**Commits**:

1. Ajouter namespace `home` à `messages/fr.json`
2. Ajouter namespace `home` à `messages/en.json`
3. Créer `app/[locale]/page.tsx` avec `useTranslations('home')`
4. Ajouter namespace `metadata` pour les métadonnées SEO
5. Supprimer ancien `app/page.tsx`

**Validation**:

- `/fr` affiche contenu en français
- `/en` affiche contenu en anglais
- Visuellement identique aux deux langues
- Tests de parité passent

---

### Phase 4: Métadonnées dynamiques et SEO (0.5 jour)

**Objectif**: Métadonnées localisées pour le SEO

**Commits**:

1. Implémenter `generateMetadata()` dans layout avec traductions
2. Open Graph localisé (title, description, locale)
3. Twitter card localisé
4. Validation des métadonnées dans les deux langues

**Validation**:

- `<title>` dynamique selon locale
- OG tags corrects
- Inspection source HTML correcte

---

### Phase 5: Tests et documentation (0.5-1 jour)

**Objectif**: Validation complète et documentation

**Commits**:

1. Mettre à jour tests unitaires
2. Mettre à jour tests E2E Playwright
3. Mettre à jour tests de parité des messages
4. Mettre à jour CLAUDE.md et documentation i18n
5. Valider build production et preview

**Validation**:

- `pnpm test` passe
- `pnpm test:e2e` passe
- `pnpm build` réussit
- `pnpm preview` fonctionne
- Documentation à jour

---

## Testing Strategy

### Unit Tests

- Tests pour `routing.ts` (locales, defaultLocale)
- Tests pour la validation dans `request.ts`
- Tests pour les utilitaires de navigation
- Tests de parité FR/EN (tous les namespaces)

### Integration Tests

- `NextIntlClientProvider` transmet les messages
- `getTranslations('home')` retourne les bonnes clés
- Navigation entre locales fonctionne

### E2E Tests

- `/fr` affiche page d'accueil en français
- `/en` affiche page d'accueil en anglais
- Switching de langue préserve la page
- `<html lang>` correct dans le DOM
- Métadonnées dynamiques selon locale
- Tous les textes visibles dans les deux langues

### Message Parity Tests

- Tous les namespaces présents dans FR et EN
- Toutes les clés présentes dans les deux fichiers
- Aucune clé manquante

---

## Risks & Mitigations

| Risk                                   | Impact | Mitigation                                                     |
| -------------------------------------- | ------ | -------------------------------------------------------------- |
| Breaking changes sur routes existantes | High   | Migrations incrémentales, tests E2E complets avant suppression |
| Régression visuelle page d'accueil     | Medium | Screenshots de référence, vérification manuelle                |
| Incompatibilité middleware             | Medium | Tests extensifs, pattern conservé                              |
| Traductions incorrectes                | Low    | Review des textes, tests de parité                             |

---

## Dependencies

### Stories prérequises

- Story 1.1: Installation next-intl - COMPLETED
- Story 1.2: Message files - COMPLETED
- Story 1.3: Middleware - IN PROGRESS (doit être terminé)

### Cette story absorbe partiellement

- Story 1.4: Bilingual URL structure (segment `[locale]`)

### Cette story bloque

- Story 1.5: Content fallback
- Story 1.6: SEO hreflang (métadonnées de base ici, hreflang dans 1.6)
- Story 1.7: Language selector

---

## Definition of Done

- [ ] Structure `src/i18n/` conforme au document technique
- [ ] Segment `app/[locale]/` fonctionnel avec layout et page
- [ ] `NextIntlClientProvider` dans le layout localisé
- [ ] Page d'accueil 100% internationalisée (7 textes + métadonnées)
- [ ] Namespaces `home` et `metadata` complets FR/EN
- [ ] Utilitaires de navigation typés exportés
- [ ] Configuration `request.ts` avec nouvelle API
- [ ] Métadonnées SEO dynamiques selon locale
- [ ] Tests passent (unit + E2E + parité)
- [ ] Build production réussit
- [ ] Documentation mise à jour
- [ ] Code review approuvée

---

## Out of Scope

- Configuration OpenNext R2/D1 avancée (story séparée si nécessaire)
- hreflang et canonical tags (Story 1.6)
- Language selector UI (Story 1.7)
- Content fallback badges (Story 1.5)

---

## References

- [Document technique](/docs/tech/cloudflare-workers/cloudflare-nextjs-nextintl.md)
- [next-intl App Router docs](https://next-intl.dev/docs/getting-started/app-router)
- [next-intl routing setup](https://next-intl.dev/docs/routing/setup)
- [next-intl Server Components](https://next-intl.dev/docs/environments/server-client-components)

---

**Created**: 2025-11-20
**Last Updated**: 2025-11-20
**Author**: Claude Code
