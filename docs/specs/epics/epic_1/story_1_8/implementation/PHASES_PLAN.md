# Story 1.8 - Implementation Phases Plan

**Story**: Correction Architecture next-intl et Internationalisation des Pages
**Total Phases**: 5
**Estimated Duration**: 4-5 days
**Total Commits**: ~18-20

---

## Phase Overview

| Phase | Name | Duration | Commits | Focus |
|-------|------|----------|---------|-------|
| 1 | Restructuration i18n | 1 jour | 5 | Nouvelle structure src/i18n/ conforme |
| 2 | Segment [locale] & Provider | 1.5 jours | 5 | App Router avec layout localisé |
| 3 | Internationalisation Homepage | 1 jour | 5 | Migration et traduction page d'accueil |
| 4 | Métadonnées SEO | 0.5 jour | 3 | Métadonnées dynamiques localisées |
| 5 | Tests & Documentation | 0.5-1 jour | 5 | Validation finale et docs |

---

## Phase 1: Restructuration i18n et nouveau routing

**Objectif**: Créer la nouvelle structure `src/i18n/` conforme aux best practices next-intl 2025

**Duration**: 1 jour

### Commits

#### Commit 1.1: Créer src/i18n/routing.ts
- Créer `src/i18n/routing.ts`
- Implémenter `defineRouting()` avec locales, defaultLocale, localePrefix
- Implémenter `createSharedPathnamesNavigation()`
- Exporter `Link`, `redirect`, `usePathname`, `useRouter`

**Files**: `src/i18n/routing.ts`

#### Commit 1.2: Créer src/i18n/request.ts
- Créer `src/i18n/request.ts`
- Utiliser nouvelle API `await requestLocale`
- Validation robuste avec fallback
- Import dynamique des messages
- Configuration timeZone et onError

**Files**: `src/i18n/request.ts`

#### Commit 1.3: Créer barrel export et types
- Créer `src/i18n/index.ts` avec tous les exports
- Créer/migrer `src/i18n/types.ts`
- Exporter Locale type, locales, defaultLocale
- Exporter utilitaires de navigation

**Files**: `src/i18n/index.ts`, `src/i18n/types.ts`

#### Commit 1.4: Mettre à jour imports projet
- Mettre à jour `middleware.ts` pour utiliser `src/i18n/routing`
- Mettre à jour tous les imports `@/i18n` → `@/src/i18n`
- Mettre à jour `lib/i18n/*` si nécessaire
- Vérifier tsconfig.json pour alias

**Files**: `middleware.ts`, fichiers avec imports i18n, `tsconfig.json`

#### Commit 1.5: Archiver ancien dossier i18n
- Supprimer `i18n/config.ts`
- Supprimer `i18n/types.ts`
- Supprimer `i18n/index.ts`
- Supprimer `i18n/README.md` ou migrer vers `src/i18n/`
- Valider que tout compile

**Files**: Suppression `i18n/` (4 fichiers)

### Validation Phase 1
- [ ] `pnpm tsc` passe sans erreur
- [ ] `pnpm lint` passe
- [ ] `pnpm test` passe (tests existants)
- [ ] Imports résolus correctement
- [ ] Structure `src/i18n/` complète

---

## Phase 2: Segment [locale] et Layout Provider

**Objectif**: Créer la structure App Router avec segment dynamique `[locale]` et Provider

**Duration**: 1.5 jours

### Commits

#### Commit 2.1: Créer app/[locale]/layout.tsx
- Créer `app/[locale]/layout.tsx`
- Implémenter `NextIntlClientProvider` avec messages
- Utiliser `getMessages()` pour charger traductions
- `<html lang={locale}>` dynamique
- Fonts et styles de base

**Files**: `app/[locale]/layout.tsx`

#### Commit 2.2: Simplifier app/layout.tsx
- Simplifier `app/layout.tsx` (version minimale)
- Garder uniquement fonts et globals.css
- Supprimer métadonnées (déplacées vers [locale]/layout)
- Retirer `<html>` et `<body>` tags (délégués)

**Files**: `app/layout.tsx`

#### Commit 2.3: Créer app/[locale]/not-found.tsx
- Créer page 404 internationalisée
- Utiliser `useTranslations('error')`
- Design cohérent avec le site
- Lien retour vers accueil

**Files**: `app/[locale]/not-found.tsx`

#### Commit 2.4: Mettre à jour middleware
- Utiliser configuration de `src/i18n/routing`
- Importer `routing` au lieu de config manuelle
- Vérifier redirection `/` → `/fr/` ou `/en/`
- Tester avec les deux locales

**Files**: `middleware.ts`

#### Commit 2.5: Migrer messages-test page
- Déplacer/adapter `app/[locale]/(test)/messages-test/`
- Vérifier que la page fonctionne
- Optionnel: améliorer avec la nouvelle structure

**Files**: `app/[locale]/(test)/messages-test/page.tsx`

### Validation Phase 2
- [ ] `/fr` répond avec layout français
- [ ] `/en` répond avec layout anglais
- [ ] `<html lang>` correct dans source
- [ ] Provider transmet messages
- [ ] `/fr/not-found-page` affiche 404
- [ ] Middleware redirige `/` correctement

---

## Phase 3: Internationalisation de la page d'accueil

**Objectif**: Migrer et internationaliser complètement la page d'accueil

**Duration**: 1 jour

### Commits

#### Commit 3.1: Ajouter namespace home à messages/fr.json
- Ajouter namespace `home` avec 10 clés
- badge, title, subtitle, description
- ai, ux, engineering (pour interpolation)
- launchLabel, launchDate, tagline
- Respecter structure existante du fichier

**Files**: `messages/fr.json`

#### Commit 3.2: Ajouter namespace home à messages/en.json
- Ajouter namespace `home` avec mêmes 10 clés
- Traductions anglaises professionnelles
- Cohérence avec ton du site

**Files**: `messages/en.json`

#### Commit 3.3: Créer app/[locale]/page.tsx internationalisée
- Créer `app/[locale]/page.tsx`
- Copier structure de l'ancien `app/page.tsx`
- Remplacer textes hardcodés par `t('home.key')`
- Utiliser `useTranslations('home')`
- Conserver toutes les animations et styles

**Files**: `app/[locale]/page.tsx`

#### Commit 3.4: Ajouter namespace metadata
- Ajouter `metadata` à `messages/fr.json`
- Ajouter `metadata` à `messages/en.json`
- title, description, ogTitle, ogDescription
- Préparer pour generateMetadata

**Files**: `messages/fr.json`, `messages/en.json`

#### Commit 3.5: Supprimer ancien app/page.tsx
- Supprimer `app/page.tsx`
- Vérifier qu'aucun import ne référence ce fichier
- Tester que `/fr` et `/en` fonctionnent

**Files**: Suppression `app/page.tsx`

### Validation Phase 3
- [ ] `/fr` affiche tous les textes en français
- [ ] `/en` affiche tous les textes en anglais
- [ ] Visuellement identique dans les deux langues
- [ ] Animations fonctionnent
- [ ] Tests de parité passent
- [ ] `pnpm test` passe

---

## Phase 4: Métadonnées dynamiques et SEO

**Objectif**: Implémenter les métadonnées localisées pour le SEO

**Duration**: 0.5 jour

### Commits

#### Commit 4.1: Implémenter generateMetadata dans layout
- Ajouter `generateMetadata()` à `app/[locale]/layout.tsx`
- Utiliser `getTranslations('metadata')`
- Title et description dynamiques
- Keywords localisés

**Files**: `app/[locale]/layout.tsx`

#### Commit 4.2: Open Graph localisé
- Ajouter OG title, description, locale
- `og:locale` = `fr_FR` ou `en_US`
- OG image avec alt localisé
- Sitename constant

**Files**: `app/[locale]/layout.tsx`

#### Commit 4.3: Twitter card et robots
- Twitter card avec traductions
- Robots configuration
- Valider structure complète des métadonnées

**Files**: `app/[locale]/layout.tsx`

### Validation Phase 4
- [ ] `<title>` correct en FR et EN
- [ ] `<meta name="description">` localisé
- [ ] `og:locale` correct
- [ ] View source montre métadonnées correctes
- [ ] Pas de duplicate ou conflits

---

## Phase 5: Tests et Documentation

**Objectif**: Validation complète de l'implémentation et documentation

**Duration**: 0.5-1 jour

### Commits

#### Commit 5.1: Mettre à jour tests unitaires
- Tests pour `src/i18n/routing.ts`
- Tests pour `src/i18n/request.ts`
- Adapter tests existants aux nouveaux imports
- Vérifier couverture

**Files**: `src/i18n/__tests__/`, tests existants

#### Commit 5.2: Mettre à jour tests E2E
- Tests pour `/fr` et `/en` homepage
- Vérifier contenu traduit
- Tester navigation entre locales
- Vérifier `<html lang>`

**Files**: `tests/*.spec.ts`

#### Commit 5.3: Mettre à jour tests de parité
- Ajouter namespace `home` aux tests
- Ajouter namespace `metadata` aux tests
- Vérifier toutes les clés FR/EN
- `pnpm test messages.test.ts`

**Files**: Tests de parité des messages

#### Commit 5.4: Mettre à jour documentation
- Mettre à jour `CLAUDE.md` section i18n
- Mettre à jour `i18n/README.md` ou `src/i18n/README.md`
- Documenter nouvelle structure
- Exemples d'utilisation

**Files**: `CLAUDE.md`, `src/i18n/README.md`

#### Commit 5.5: Validation finale
- `pnpm build` production
- `pnpm preview` test local
- Vérification manuelle FR et EN
- Screenshots de référence

**Files**: Aucun (validation uniquement)

### Validation Phase 5
- [ ] `pnpm test` passe (tous les tests)
- [ ] `pnpm test:e2e` passe
- [ ] `pnpm build` réussit
- [ ] `pnpm preview` fonctionne
- [ ] Documentation à jour
- [ ] Code review ready

---

## Dependencies Between Phases

```
Phase 1 (Structure)
    ↓
Phase 2 (Layout/Provider) ←── Dépend de Phase 1
    ↓
Phase 3 (Homepage i18n) ←── Dépend de Phase 2
    ↓
Phase 4 (Metadata SEO) ←── Dépend de Phase 3
    ↓
Phase 5 (Tests/Docs) ←── Dépend de toutes les phases
```

**Note**: Les phases doivent être exécutées dans l'ordre. Chaque phase doit être validée avant de passer à la suivante.

---

## Risk Mitigation

### Phase 1 Risks
- **Import breaks**: Commit 1.4 critique - tester exhaustivement
- **Mitigation**: Garder ancien dossier jusqu'à validation complète

### Phase 2 Risks
- **Provider errors**: Tester avec Client Components
- **Mitigation**: Créer composant client test simple

### Phase 3 Risks
- **Visual regression**: Page d'accueil doit être identique
- **Mitigation**: Screenshots avant/après, review visuelle

### Phase 4 Risks
- **SEO breaks**: Métadonnées critiques pour indexation
- **Mitigation**: Valider avec outils SEO (Lighthouse, etc.)

### Phase 5 Risks
- **Tests flaky**: E2E peuvent échouer sur timing
- **Mitigation**: Retry logic, timeouts appropriés

---

## Success Metrics

- **Build time**: Pas de régression significative
- **Test coverage**: ≥80% pour nouveau code i18n
- **Lighthouse SEO**: Score ≥90
- **E2E pass rate**: 100%
- **Bundle size**: Pas d'augmentation >5%

---

**Plan Created**: 2025-11-20
**Last Updated**: 2025-11-20
**Author**: Claude Code
