# Phase 1 - Configuration Locale

**Epic**: Epic 1 - Infrastructure & Testing
**Story**: Refonte de l'Architecture des Tests E2E pour Cloudflare Workers
**Phase**: Phase 1 (Configuration Implémentation)
**Status**: 📋 Ready for Implementation
**Durée estimée**: 1-2h
**Complexity**: Moyenne (configuration technique)
**Priority**: P0 (Bloquant pour phases suivantes)

---

## Vue d'Ensemble

Cette phase implémente la configuration locale pour exécuter les tests E2E contre le runtime Cloudflare Workers (`workerd`) via `wrangler dev`, au lieu du serveur Node.js.

**Objectif**: Transformer l'architecture E2E de Node.js → Cloudflare Workers runtime

**Changements majeurs**:
- Script `preview` utilise wrangler dev avec IPv4 forcé
- GlobalSetup D1 pour seeding automatique
- Playwright configuré pour `127.0.0.1:8788` (wrangler)
- Timeout étendu à 120s (cold start OpenNext)

---

## Documentation

### 📘 Documents Principaux

- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** - Plan détaillé avec 5 commits atomiques
- **[COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md)** - Checklist exhaustive par commit
- **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** - Configuration wrangler + D1

### 📚 Guides

- **[guides/REVIEW.md](./guides/REVIEW.md)** - Guide de code review commit par commit
- **[guides/TESTING.md](./guides/TESTING.md)** - Stratégie de tests (D1, wrangler, E2E)

### ✅ Validation

- **[validation/VALIDATION_CHECKLIST.md](./validation/VALIDATION_CHECKLIST.md)** - Checklist de validation finale

---

## Commits Atomiques (5 commits)

| # | Type | Description | Durée | Files |
|---|------|-------------|-------|-------|
| 1 | 🔧 config | Modifier package.json (script preview) | 10min | 1 modifié |
| 2 | ✨ feat | Créer tests/global-setup.ts (D1 seeding) | 30min | 1 nouveau |
| 3 | 🔧 config | Modifier playwright.config.ts (URLs) | 15min | 1 modifié |
| 4 | 🔧 config | Modifier playwright.config.ts (setup + timeout) | 15min | 1 modifié |
| 5 | ✅ test | Validation locale (tests compression) | 20min | 0 (tests) |

**Total**: ~1h30

---

## Aperçu Rapide

### Pourquoi cette phase?

Phase 0 a **nettoyé et documenté** les décisions. Phase 1 **implémente** ces décisions:
- Décision ADR 002: wrangler dev local → Implémentation script preview
- Tests E2E doivent tourner sur workerd → Configuration Playwright
- D1 database doit être seeded → GlobalSetup automatique

### Que faisons-nous?

1. **package.json**: Script `preview` → `wrangler dev --port 8788 --ip 127.0.0.1`
2. **global-setup.ts**: Nouveau fichier qui seed D1 avant tests
3. **playwright.config.ts**: BaseURL → `127.0.0.1:8788`, timeout → 120s
4. **Validation**: Exécuter `pnpm test:e2e` et vérifier que ça passe

### Critères de succès

- ✅ Script `pnpm preview` démarre wrangler sur `127.0.0.1:8788`
- ✅ Global setup seed D1 sans erreur
- ✅ Tests E2E locaux passent (compression, middleware, i18n)
- ✅ Timeout adapté (120s) pour cold start OpenNext

---

## Navigation Rapide

### Pour l'Implémenteur

1. **Prérequis**: Vérifier [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) (wrangler configuré)
2. **Plan**: Lire [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) en entier
3. **Exécution**: Suivre [COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md) commit par commit
4. **Validation**: Vérifier [validation/VALIDATION_CHECKLIST.md](./validation/VALIDATION_CHECKLIST.md)

### Pour le Reviewer

1. **Contexte**: Lire [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) section "Contexte"
2. **Review**: Suivre [guides/REVIEW.md](./guides/REVIEW.md) pour chaque commit
3. **Tests**: Vérifier [guides/TESTING.md](./guides/TESTING.md) pour stratégie validation

### Pour le QA

1. **Stratégie**: Lire [guides/TESTING.md](./guides/TESTING.md)
2. **Exécution**: Exécuter les checks dans [validation/VALIDATION_CHECKLIST.md](./validation/VALIDATION_CHECKLIST.md)

---

## Prérequis

### Outils Requis

- Git 2.30+
- Node.js 20+
- pnpm 9.15+
- **wrangler CLI 3.95+** (NOUVEAU par rapport à Phase 0)
- **D1 local database** (créé par wrangler)

### Connaissances Requises

- Configuration Playwright
- Bases de wrangler dev
- D1 local development (migrations, seeding)
- Différence Node.js vs workerd runtime

### Temps Estimé

- **Lecture documentation**: 20min
- **Setup wrangler**: 10min (si première fois)
- **Implémentation**: 1h30
- **Review**: 45min
- **Total**: 3h

---

## Dépendances

### Bloquants (AVANT Phase 1)

- ✅ **Phase 0 mergée** dans main
- ✅ **ADR 002 validé** par l'équipe
- ✅ **wrangler.jsonc** déjà configuré (DB binding)
- ✅ **Migrations D1** existantes dans `/drizzle/migrations`
- ✅ **Seeds D1** existants dans `/drizzle/seeds`

### Débloque (APRÈS Phase 1)

- ✅ Phase 2 - Stabilisation et Debug
- ✅ Phase 3 - Intégration CI
- ✅ Phase 4 - Documentation et Formation

**Note**: Phases 2-4 NE PEUVENT PAS démarrer sans Phase 1 complétée et validée.

---

## Risques et Mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| wrangler dev timeout >120s | Moyenne | Élevé | Augmenter timeout à 180s si nécessaire |
| D1 seeding échoue (SQL invalide) | Faible | Élevé | Tester seeds manuellement avant commit |
| IPv4/IPv6 race conditions persistent | Faible | Moyen | Triple vérification `--ip 127.0.0.1` |
| Tests E2E échouent sur wrangler | Moyenne | Élevé | Phase 2 dédiée au debug |

---

## Métriques de Succès

### Métriques Quantitatives

- **Script preview démarre**: < 90s (incluant build OpenNext)
- **D1 seeding**: < 10s
- **Tests E2E locaux**: 100% passing (3 tests: compression, middleware, i18n)
- **Timeout adapté**: 120s minimum

### Métriques Qualitatives

- wrangler logs montrent `Ready on http://127.0.0.1:8788`
- D1 database seeded avec categories + articles
- Tests exécutés contre workerd (pas Node.js)
- Aucune régression (tests passent toujours)

---

## Références

### Documents Internes

- **[../STORY_E2E_CLOUDFLARE_REFACTOR.md](../STORY_E2E_CLOUDFLARE_REFACTOR.md)** - Story complète
- **[../phase_0/INDEX.md](../phase_0/INDEX.md)** - Phase 0 (prérequis)
- **[/docs/guide_cloudflare_playwright.md](/docs/guide_cloudflare_playwright.md)** - Guide de référence
- **[/docs/decisions/002-e2e-local-wrangler-dev.md](/docs/decisions/002-e2e-local-wrangler-dev.md)** - ADR architecture

### Documentation Externe

- [Wrangler Dev Docs](https://developers.cloudflare.com/workers/wrangler/commands/#dev)
- [D1 Local Development](https://developers.cloudflare.com/d1/best-practices/local-development/)
- [Playwright Global Setup](https://playwright.dev/docs/test-global-setup-teardown)
- [OpenNext Cloudflare](https://opennext.js.org/cloudflare/get-started)

---

## Workflow de Travail

### 1. Préparation (10min)

```bash
# Partir de main avec Phase 0 mergée
git checkout main
git pull origin main

# Créer une branche de travail
git checkout -b phase-1/local-configuration

# Vérifier que wrangler est installé
wrangler --version
# Attendu: ⛅️ wrangler 3.95.0 ou supérieur

# Lire la documentation complète
cat docs/specs/epics/epic_1/refactoring_e2e/implementation/phase_1/IMPLEMENTATION_PLAN.md
```

### 2. Implémentation (1h30)

Suivre [COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md) étape par étape, commit par commit.

### 3. Validation (30min)

Exécuter tous les checks de [validation/VALIDATION_CHECKLIST.md](./validation/VALIDATION_CHECKLIST.md).

### 4. Pull Request

```bash
# Pusher la branche
git push origin phase-1/local-configuration

# Créer une PR
gh pr create --title "🔧 config(e2e): Phase 1 - Configuration Locale" \
  --body "See: docs/specs/epics/epic_1/refactoring_e2e/implementation/phase_1/INDEX.md"
```

---

## Support et Questions

### Besoin d'aide?

- **Bloqué sur wrangler?** Voir [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) section "Troubleshooting"
- **D1 seeding échoue?** Voir [guides/TESTING.md](./guides/TESTING.md) section "Tests D1"
- **Tests timeout?** Augmenter timeout à 180s dans playwright.config.ts
- **Clarification spec?** Commenter dans [../STORY_E2E_CLOUDFLARE_REFACTOR.md](../STORY_E2E_CLOUDFLARE_REFACTOR.md)

### Feedback sur cette documentation

Créer une issue ou PR pour améliorer cette documentation.

---

## Changelog de la Phase

| Date | Version | Changement |
|------|---------|------------|
| 2025-01-19 | 1.0.0 | Création initiale de la documentation Phase 1 |

---

**Prêt à démarrer? Consultez [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) pour le plan détaillé!**
