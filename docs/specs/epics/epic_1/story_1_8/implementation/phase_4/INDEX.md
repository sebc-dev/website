# Phase 4 - Métadonnées SEO

**Story**: 1.8 - Correction Architecture next-intl et Internationalisation des Pages
**Phase**: 4/5
**Status**: NOT_STARTED
**Duration**: 0.5 jour
**Commits**: 3

---

## Overview

Cette phase implémente les métadonnées dynamiques et localisées pour le SEO. Elle utilise `generateMetadata()` de Next.js avec les traductions next-intl pour générer des métadonnées title, description, Open Graph et Twitter card selon la locale.

## Quick Links

| Document | Description |
|----------|-------------|
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Plan détaillé des 3 commits |
| [COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md) | Checklists par commit |
| [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) | Configuration environnement |
| [guides/REVIEW.md](./guides/REVIEW.md) | Guide de code review |
| [guides/TESTING.md](./guides/TESTING.md) | Stratégie de test |
| [validation/VALIDATION_CHECKLIST.md](./validation/VALIDATION_CHECKLIST.md) | Checklist de validation finale |

## Commits Overview

| # | Commit | Focus | Est. Time |
|---|--------|-------|-----------|
| 4.1 | Implémenter generateMetadata | Title, description dynamiques | 30-45 min |
| 4.2 | Open Graph localisé | OG tags complets | 30-45 min |
| 4.3 | Twitter card et robots | Twitter, robots config | 20-30 min |

**Total estimé**: 1h20 - 2h

## Prerequisites

- [ ] Phase 1 complète (Structure src/i18n/)
- [ ] Phase 2 complète (Layout avec Provider)
- [ ] Phase 3 complète (Homepage internationalisée)
- [ ] Namespace `metadata` présent dans messages/fr.json et en.json

## Success Criteria

- [ ] `<title>` correct en FR et EN
- [ ] `<meta name="description">` localisé
- [ ] `og:locale` = `fr_FR` ou `en_US`
- [ ] OG title et description localisés
- [ ] Twitter card avec traductions
- [ ] View source HTML montre métadonnées correctes
- [ ] Pas de duplicate ou conflits avec métadonnées root

## Dependencies

```
Phase 3 (Homepage i18n)
    ↓
Phase 4 (Metadata SEO) ← Current
    ↓
Phase 5 (Tests/Docs)
```

## Files Modified

- `app/[locale]/layout.tsx` - Ajout de generateMetadata()

## Key Technologies

- Next.js 15 generateMetadata API
- next-intl getTranslations
- Open Graph Protocol
- Twitter Card metadata

---

**Created**: 2025-11-20
**Last Updated**: 2025-11-20
