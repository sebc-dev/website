# Phase 0 - Nettoyage et Préparation

**Epic**: Epic 1 - Infrastructure & Testing
**Story**: Refonte de l'Architecture des Tests E2E pour Cloudflare Workers
**Phase**: Phase 0 (Prérequis Critique)
**Status**: 📋 Ready for Implementation
**Durée estimée**: 2-3h
**Complexity**: Faible (nettoyage et décisions)
**Priority**: P0 (Bloquant pour phases suivantes)

---

## Vue d'Ensemble

Cette phase prépare le projet pour une refonte propre de l'architecture E2E en:

- Résolvant les conflits architecturaux entre documentation
- Nettoyant l'état Git incohérent
- Supprimant le code mort et obsolète
- Archivant l'historique des décisions

**Objectif critique**: Partir d'une base propre et cohérente avant toute implémentation technique.

---

## Documentation

### 📘 Documents Principaux

- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** - Plan détaillé avec 6 commits atomiques
- **[COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md)** - Checklist exhaustive par commit
- **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** - Configuration environnement et prérequis

### 📚 Guides

- **[guides/REVIEW.md](./guides/REVIEW.md)** - Guide de code review commit par commit
- **[guides/TESTING.md](./guides/TESTING.md)** - Stratégie de validation (pas de tests unitaires pour cette phase)

### ✅ Validation

- **[validation/VALIDATION_CHECKLIST.md](./validation/VALIDATION_CHECKLIST.md)** - Checklist de validation finale

---

## Commits Atomiques (6 commits)

| #   | Type        | Description                                | Durée | Files      |
| --- | ----------- | ------------------------------------------ | ----- | ---------- |
| 1   | 📝 docs     | Résolution conflit architectural (ADR 002) | 30min | 1 nouveau  |
| 2   | 🗑️ remove   | Nettoyage Git (suppression + tracking)     | 20min | 3 modifiés |
| 3   | 🔧 config   | Mise à jour .gitignore (patterns logs)     | 10min | 1 modifié  |
| 4   | ♻️ refactor | Nettoyage playwright.config.ts             | 30min | 1 modifié  |
| 5   | 📝 docs     | Archivage commentaires CI (ADR 003)        | 30min | 2 modifiés |
| 6   | 📝 docs     | Documentation scripts et workflow          | 20min | 2 modifiés |

**Total**: ~2h20 (hors décisions architecturales)

---

## Aperçu Rapide

### Pourquoi cette phase?

L'analyse approfondie du projet a révélé un **état de transition** entre deux architectures E2E:

- **Score de conformité**: 61% vs guide Cloudflare/Playwright 2025
- **Conflits**: ADR 001 (preview deployments) vs Story (wrangler dev local)
- **Code mort**: Imports commentés, configurations obsolètes
- **Git incohérent**: Fichiers deleted non commités, nouveaux tests non trackés

### Que faisons-nous?

1. **Décision architecturale**: Choisir une approche E2E (recommandation: wrangler dev local)
2. **Nettoyage Git**: Commiter suppressions, tracker nouveaux fichiers, supprimer temporaires
3. **Suppression code mort**: Imports dotenv, configurations mobiles obsolètes
4. **Archivage historique**: Créer ADR 003 pour timeout CI, simplifier commentaires
5. **Documentation**: Clarifier différence dev/preview dans scripts et CLAUDE.md

### Critères de succès

- ✅ Décision architecturale documentée (ADR 002)
- ✅ Git status clean (pas de fichiers deleted ou untracked)
- ✅ Aucun code mort dans playwright.config.ts
- ✅ Historique CI archivé dans ADR 003
- ✅ Scripts documentés

---

## Navigation Rapide

### Pour l'Implémenteur

1. **Début**: Lire [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) en entier
2. **Configuration**: Suivre [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)
3. **Exécution**: Utiliser [COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md) commit par commit
4. **Validation**: Vérifier [validation/VALIDATION_CHECKLIST.md](./validation/VALIDATION_CHECKLIST.md)

### Pour le Reviewer

1. **Contexte**: Lire [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) section "Contexte"
2. **Review**: Suivre [guides/REVIEW.md](./guides/REVIEW.md) pour chaque commit
3. **Validation**: Vérifier les critères dans [validation/VALIDATION_CHECKLIST.md](./validation/VALIDATION_CHECKLIST.md)

### Pour le QA

1. **Stratégie**: Lire [guides/TESTING.md](./guides/TESTING.md)
2. **Validation**: Exécuter les checks dans [validation/VALIDATION_CHECKLIST.md](./validation/VALIDATION_CHECKLIST.md)

---

## Prérequis

### Outils Requis

- Git 2.30+
- Node.js 20+
- pnpm 9.15+
- Accès au repository GitHub (pour décisions)

### Connaissances Requises

- Gitmoji (convention de commits du projet)
- Git workflow (add, commit, status)
- ADR (Architecture Decision Records)
- Structure du projet Next.js/Cloudflare

### Temps Estimé

- **Lecture documentation**: 20min
- **Implémentation**: 2-3h
- **Review**: 30min
- **Total**: 3-4h (incluant discussions décisions)

---

## Dépendances

### Bloquants (AVANT Phase 0)

- Aucun (phase de démarrage)

### Débloque (APRÈS Phase 0)

- ✅ Phase 1 - Configuration Locale
- ✅ Phase 2 - Stabilisation et Debug
- ✅ Phase 3 - Intégration CI
- ✅ Phase 4 - Documentation et Formation

**Note**: Les phases 1-4 NE PEUVENT PAS démarrer sans completion de Phase 0.

---

## Risques et Mitigations

| Risque                             | Probabilité | Impact | Mitigation                                         |
| ---------------------------------- | ----------- | ------ | -------------------------------------------------- |
| Décision architecturale retardée   | Moyenne     | Élevé  | Préparer comparaison détaillée Option A vs B       |
| Désaccord sur choix mobile configs | Faible      | Faible | Examiner git log pour contexte historique          |
| Perte d'historique important       | Très faible | Moyen  | Archiver dans ADR, ne jamais supprimer sans backup |

---

## Métriques de Succès

### Métriques Quantitatives

- **Fichiers Git untracked**: 0 (après commit)
- **Fichiers Git deleted non commités**: 0
- **Imports dotenv dans playwright.config**: 0
- **ADR créés**: 2 (ADR 002, ADR 003)
- **Lignes de commentaires supprimées**: ~15 (CI workflow)

### Métriques Qualitatives

- Documentation claire de la décision architecturale
- Historique Git propre et compréhensible
- Code sans ambiguïté (pas de commentaires "TODO" ou "FIXME")

---

## Références

### Documents Internes

- **[../STORY_E2E_CLOUDFLARE_REFACTOR.md](../STORY_E2E_CLOUDFLARE_REFACTOR.md)** - Story complète
- **[../PHASE_0_SUMMARY.md](../PHASE_0_SUMMARY.md)** - Résumé Phase 0
- **[/docs/guide_cloudflare_playwright.md](/docs/guide_cloudflare_playwright.md)** - Guide de référence
- **[/docs/decisions/001-e2e-tests-preview-deployments.md](/docs/decisions/001-e2e-tests-preview-deployments.md)** - ADR à résoudre
- **[/docs/gitmoji.md](/docs/gitmoji.md)** - Convention de commits

### Documentation Externe

- [ADR Template](https://github.com/joelparkerhenderson/architecture-decision-record)
- [Git Best Practices](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project)
- [Semantic Git Commits](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716)

---

## Workflow de Travail

### 1. Préparation (15min)

```bash
# Créer une branche de travail
git checkout -b phase-0/cleanup-and-preparation

# Vérifier l'état actuel
git status

# Lire la documentation complète
cat docs/specs/epics/epic_1/refactoring_e2e/implementation/phase_0/IMPLEMENTATION_PLAN.md
```

### 2. Implémentation (2-3h)

Suivre [COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md) étape par étape, commit par commit.

### 3. Validation (30min)

Exécuter tous les checks de [validation/VALIDATION_CHECKLIST.md](./validation/VALIDATION_CHECKLIST.md).

### 4. Pull Request

```bash
# Pusher la branche
git push origin phase-0/cleanup-and-preparation

# Créer une PR avec template
gh pr create --title "🧹 refactor(e2e): Phase 0 - Nettoyage et Préparation" \
  --body "$(cat .github/PULL_REQUEST_TEMPLATE.md)"
```

---

## Support et Questions

### Besoin d'aide?

- **Bloqué sur une décision?** Consulter le tech lead ou architecte
- **Problème Git?** Voir [guides/REVIEW.md](./guides/REVIEW.md) section "Troubleshooting"
- **Clarification spec?** Commenter dans [../STORY_E2E_CLOUDFLARE_REFACTOR.md](../STORY_E2E_CLOUDFLARE_REFACTOR.md)

### Feedback sur cette documentation

Créer une issue ou PR pour améliorer cette documentation.

---

## Changelog de la Phase

| Date       | Version | Changement                                    |
| ---------- | ------- | --------------------------------------------- |
| 2025-01-19 | 1.0.0   | Création initiale de la documentation Phase 0 |

---

**Prêt à démarrer? Consultez [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) pour le plan détaillé!**
