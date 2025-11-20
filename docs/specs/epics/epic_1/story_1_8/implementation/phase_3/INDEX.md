# Phase 3 - Internationalisation de la page d'accueil

**Story**: 1.8 - Correction Architecture next-intl et Internationalisation des Pages
**Phase**: 3 of 5
**Status**: NOT STARTED
**Duration**: 1 jour
**Commits**: 5

---

## Overview

Cette phase migre et internationalise complètement la page d'accueil. Elle ajoute les namespaces de traduction `home` et `metadata` aux fichiers de messages, crée la page localisée `app/[locale]/page.tsx`, et supprime l'ancien `app/page.tsx`.

### Objectives

1. Ajouter namespace `home` avec 10 clés (FR et EN)
2. Ajouter namespace `metadata` pour SEO
3. Créer `app/[locale]/page.tsx` internationalisée
4. Supprimer l'ancien `app/page.tsx`
5. Conserver toutes les animations et styles existants

### Success Criteria

- `/fr` affiche tous les textes en français
- `/en` affiche tous les textes en anglais
- Visuellement identique dans les deux langues
- Animations fonctionnent
- Tests de parité passent
- `pnpm test` passe

---

## Navigation

### Core Documentation

| Document | Description |
|----------|-------------|
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Atomic commit strategy (5 commits) |
| [COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md) | Detailed checklist per commit |
| [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) | Prerequisites and environment |

### Guides

| Guide | Description |
|-------|-------------|
| [guides/REVIEW.md](./guides/REVIEW.md) | Code review guide per commit |
| [guides/TESTING.md](./guides/TESTING.md) | Testing strategy (unit + E2E) |

### Validation

| Document | Description |
|----------|-------------|
| [validation/VALIDATION_CHECKLIST.md](./validation/VALIDATION_CHECKLIST.md) | Final validation checklist |

---

## Dependencies

### From Previous Phases

- **Phase 1**: Structure `src/i18n/` (routing.ts, request.ts, types.ts)
- **Phase 2**: Layout `app/[locale]/layout.tsx` avec `NextIntlClientProvider`

### External Dependencies

- `next-intl` v4.5.3+
- Messages files: `messages/fr.json`, `messages/en.json`
- Existing `app/page.tsx` content

---

## Files Overview

### Files to Create

| File | Description | Commit |
|------|-------------|--------|
| `app/[locale]/page.tsx` | Homepage internationalisée | 3.3 |

### Files to Modify

| File | Description | Commit |
|------|-------------|--------|
| `messages/fr.json` | Namespace `home` + `metadata` | 3.1, 3.4 |
| `messages/en.json` | Namespace `home` + `metadata` | 3.2, 3.4 |

### Files to Delete

| File | Description | Commit |
|------|-------------|--------|
| `app/page.tsx` | Ancien fichier page d'accueil | 3.5 |

---

## Commit Summary

| # | Commit | Description | Est. Time |
|---|--------|-------------|-----------|
| 3.1 | Add home namespace FR | 10 clés FR dans messages/fr.json | 20 min |
| 3.2 | Add home namespace EN | 10 clés EN dans messages/en.json | 20 min |
| 3.3 | Create localized homepage | app/[locale]/page.tsx avec useTranslations | 45 min |
| 3.4 | Add metadata namespace | Métadonnées SEO FR/EN | 25 min |
| 3.5 | Remove old homepage | Supprimer app/page.tsx | 15 min |

**Total Estimated Time**: ~2 heures de développement

---

## Quick Start

1. **Read** [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for prerequisites
2. **Follow** [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) commit by commit
3. **Check off** items in [COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md)
4. **Validate** with [validation/VALIDATION_CHECKLIST.md](./validation/VALIDATION_CHECKLIST.md)
5. **Review** using [guides/REVIEW.md](./guides/REVIEW.md)

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Visual regression | High | Screenshots avant/après, review visuelle |
| Missing translation keys | Medium | Tests de parité automatiques |
| Broken animations | Medium | Test manuel animations FR/EN |
| Build failure | Low | `pnpm build` après chaque commit |

---

**Phase Created**: 2025-11-20
**Last Updated**: 2025-11-20
