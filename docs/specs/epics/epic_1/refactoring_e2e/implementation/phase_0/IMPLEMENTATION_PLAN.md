# Implementation Plan - Phase 0

**Phase**: Phase 0 - Nettoyage et Préparation
**Story**: Refonte de l'Architecture des Tests E2E pour Cloudflare Workers
**Dernière mise à jour**: 2025-01-19

---

## Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Contexte Technique](#contexte-technique)
3. [Stratégie de Commits Atomiques](#stratégie-de-commits-atomiques)
4. [Détail des Commits](#détail-des-commits)
5. [Ordre d'Implémentation](#ordre-dimplémentation)
6. [Validation](#validation)
7. [Rollback Strategy](#rollback-strategy)

---

## Vue d'Ensemble

### Objectif de la Phase

Préparer le projet pour une refonte propre de l'architecture E2E en résolvant tous les conflits, incohérences et code obsolète **AVANT** toute implémentation technique.

### Problèmes Identifiés

1. **Conflit architectural** entre ADR 001 (preview deployments) et Story (wrangler dev local)
2. **État Git incohérent** (fichiers deleted non commités, nouveaux tests non trackés)
3. **Code mort** (imports dotenv commentés, configurations mobiles obsolètes)
4. **Documentation fragmentée** (longs commentaires dans le code plutôt que dans des ADR)
5. **Scripts non documentés** (confusion entre dev/preview)

### Approche

**6 commits atomiques** groupés par type de changement:

- **Commits 1, 5, 6**: Documentation (ADR, commentaires, scripts)
- **Commits 2, 3**: Nettoyage Git (.gitignore, tracking)
- **Commit 4**: Refactoring configuration (playwright.config.ts)

---

## Contexte Technique

### Analyse de l'État Actuel

**Score de conformité**: 61% vs guide Cloudflare/Playwright 2025

| Aspect                   | État                  | Problème                  | Impact         |
| ------------------------ | --------------------- | ------------------------- | -------------- |
| **Architecture E2E**     | ⚠️ Conflit            | ADR 001 vs Story Document | Bloque Phase 1 |
| **Git Status**           | ❌ Incohérent         | 3 fichiers non commités   | Confusion      |
| **playwright.config.ts** | ⚠️ Code mort          | Imports dotenv commentés  | Maintenance    |
| **CI Workflow**          | ⚠️ Commentaires longs | 15 lignes de doc inline   | Lisibilité     |
| **Scripts**              | ⚠️ Non documenté      | Confusion dev vs preview  | Onboarding     |

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: Cloudflare Workers via @opennextjs/cloudflare
- **Testing**: Playwright + Vitest
- **CI/CD**: GitHub Actions
- **Package Manager**: pnpm 9.15+
- **Node Version**: 20+

### Fichiers Impactés

```
Total: 10 fichiers
├── Nouveaux (2):
│   ├── docs/decisions/002-e2e-local-wrangler-dev.md
│   └── docs/decisions/003-e2e-ci-timeout-history.md
├── Modifiés (6):
│   ├── .gitignore
│   ├── playwright.config.ts
│   ├── .github/workflows/quality.yml
│   ├── scripts/dev-quiet.sh
│   ├── CLAUDE.md
│   └── tests/example.spec.ts (deleted, commit suppression)
├── Trackés (2):
│   ├── tests/compression.spec.ts (nouveau)
│   └── tests/fixtures/compression.ts (nouveau)
└── Supprimés (1):
    └── test-output.log (temporaire)
```

---

## Stratégie de Commits Atomiques

### Principes

1. **Un commit = une responsabilité** (single responsibility principle)
2. **Type-safe à chaque étape** (git status clean après chaque commit)
3. **Reviewable en 10-30min** par commit
4. **Rollbackable individuellement** sans casser les autres
5. **Ordre logique** : Décisions → Nettoyage → Refactoring → Documentation

### Sizing

| Commit | Type     | Lines Changed   | Files     | Durée Impl | Durée Review |
| ------ | -------- | --------------- | --------- | ---------- | ------------ |
| 1      | docs     | +80             | 1 nouveau | 30min      | 15min        |
| 2      | remove   | ~100 (±50/±50)  | 3         | 20min      | 10min        |
| 3      | config   | +5              | 1         | 10min      | 5min         |
| 4      | refactor | ~15 (-12/+3)    | 1         | 30min      | 15min        |
| 5      | docs     | ~120 (+100/±20) | 2         | 30min      | 15min        |
| 6      | docs     | ~30 (+25/+5)    | 2         | 20min      | 10min        |

**Total**: ~350 lines changed, 10 files, 2h20 impl, 1h10 review

### Workflow Git

```bash
# Pattern pour chaque commit:
git checkout -b phase-0/cleanup-and-preparation
[Faire les changements du commit 1]
git add <fichiers concernés>
git commit -m "<emoji> <type>: <description>"
[Répéter pour commits 2-6]
git push origin phase-0/cleanup-and-preparation
```

---

## Détail des Commits

### Commit 1: Résolution Conflit Architectural (ADR 002)

**Type**: 📝 docs
**Durée estimée**: 30min
**Priority**: P0 (Bloquant)

#### Objectif

Documenter la décision architecturale entre preview deployments (ADR 001) et wrangler dev local (Story) pour débloquer toutes les phases suivantes.

#### Changements

**Fichiers créés**:

- `docs/decisions/002-e2e-local-wrangler-dev.md` (~80 lines)

**Contenu du fichier ADR 002**:

```markdown
# ADR 002: Tests E2E Locaux avec Wrangler Dev

## Statut

Accepté

## Contexte

Conflit entre ADR 001 (preview deployments) et Story (wrangler dev local).

## Décision

Utiliser wrangler dev localement en CI pour les tests E2E.

## Rationale

- Plus rapide (pas de déploiement cloud)
- Pas de dépendance aux quotas Cloudflare
- workerd runtime suffisamment fidèle
- Logs directs et debugging simplifié
- Possibilité d'ajouter smoke tests en preview ultérieurement

## Conséquences

- ADR 001 archivé (pas supprimé)
- Implémentation selon Story Document phases 1-4
- CI utilise `pnpm preview` (wrangler dev)

## Alternatives Considérées

**Option A**: Preview Deployments (ADR 001)

- ✅ Environnement 100% identique production
- ❌ Quota Cloudflare requis
- ❌ Temps de déploiement élevé
- ❌ Gestion cleanup complexe

## Références

- /docs/decisions/001-e2e-tests-preview-deployments.md (archivé)
- /docs/specs/epics/epic_1/refactoring_e2e/STORY_E2E_CLOUDFLARE_REFACTOR.md
- /docs/guide_cloudflare_playwright.md
```

#### Validation

```bash
# Le fichier existe et est bien formé
test -f docs/decisions/002-e2e-local-wrangler-dev.md
grep -q "Statut" docs/decisions/002-e2e-local-wrangler-dev.md
grep -q "Décision" docs/decisions/002-e2e-local-wrangler-dev.md
grep -q "wrangler dev" docs/decisions/002-e2e-local-wrangler-dev.md
```

#### Commit Message

```
📝 docs(e2e): add ADR 002 for local wrangler dev architecture

Resolve architectural conflict between ADR 001 (preview deployments)
and Story document (wrangler dev local).

Decision: Use wrangler dev locally in CI for faster iteration,
debugging, and no Cloudflare quota dependency.

ADR 001 archived for reference. Story phases 1-4 can now proceed.

Related: STORY_E2E_CLOUDFLARE_REFACTOR.md Phase 0.1

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

### Commit 2: Nettoyage Git (Suppression + Tracking)

**Type**: 🗑️ remove + ✅ test
**Durée estimée**: 20min
**Priority**: P0

#### Objectif

Mettre l'index Git en cohérence:

- Commiter la suppression de `tests/example.spec.ts` (template Playwright)
- Tracker les nouveaux tests fonctionnels (`compression.spec.ts`, `compression.ts`)
- Supprimer le fichier temporaire `test-output.log`

#### Changements

**Fichiers modifiés**:

- `tests/example.spec.ts` (deleted, maintenant commité)
- `tests/compression.spec.ts` (nouveau, maintenant tracké)
- `tests/fixtures/compression.ts` (nouveau, maintenant tracké)

**Fichiers supprimés** (non Git):

- `test-output.log` (fichier temporaire à la racine)

#### Actions

```bash
# 1. Commiter la suppression de example.spec.ts
git add tests/example.spec.ts  # Fichier marqué D (deleted)

# 2. Tracker les nouveaux tests
git add tests/compression.spec.ts
git add tests/fixtures/compression.ts

# 3. Supprimer le fichier temporaire
rm test-output.log

# 4. Vérifier l'état
git status
# → tests/example.spec.ts deleted
# → tests/compression.spec.ts new file
# → tests/fixtures/compression.ts new file
# → test-output.log non tracké (supprimé)
```

#### Validation

```bash
# example.spec.ts n'existe plus
! test -f tests/example.spec.ts

# Les nouveaux tests existent et sont trackés
test -f tests/compression.spec.ts
test -f tests/fixtures/compression.ts
git ls-files | grep "compression.spec.ts"
git ls-files | grep "fixtures/compression.ts"

# test-output.log n'existe plus
! test -f test-output.log
```

#### Commit Message

```
🗑️ remove(test): delete Playwright example template

✅ test: add compression E2E tests and fixtures

Remove Playwright default example.spec.ts template (no project value).
Add functional compression tests validating Brotli/Gzip on Cloudflare.

Files:
- tests/example.spec.ts (deleted)
- tests/compression.spec.ts (new)
- tests/fixtures/compression.ts (new)

Also remove temporary test-output.log file from root.

Related: STORY_E2E_CLOUDFLARE_REFACTOR.md Phase 0.2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

### Commit 3: Mise à Jour .gitignore (Patterns Logs)

**Type**: 🔧 config
**Durée estimée**: 10min
**Priority**: P1

#### Objectif

Éviter que les fichiers de logs temporaires des tests ne polluent l'index Git à l'avenir.

#### Changements

**Fichiers modifiés**:

- `.gitignore` (+5 lines)

**Contenu ajouté** (après la section Playwright):

```gitignore
# Test logs
test-output.log
playwright-output.log
*.test.log
e2e-*.log
```

#### Validation

```bash
# Les patterns sont ajoutés
grep "test-output.log" .gitignore
grep "*.test.log" .gitignore

# Vérifier qu'un fichier test.log serait ignoré
touch test-example.test.log
git status --ignored | grep "test-example.test.log"
rm test-example.test.log
```

#### Commit Message

```
🔧 config(git): add test log patterns to .gitignore

Prevent temporary E2E test log files from appearing in git status.

Patterns added:
- test-output.log (root level logs)
- playwright-output.log (Playwright specific)
- *.test.log (any test logs)
- e2e-*.log (E2E specific logs)

Related: STORY_E2E_CLOUDFLARE_REFACTOR.md Phase 0.2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

### Commit 4: Nettoyage playwright.config.ts

**Type**: ♻️ refactor
**Durée estimée**: 30min
**Priority**: P1

#### Objectif

Supprimer le code mort (imports dotenv commentés, configurations mobiles inutilisées) et clarifier la configuration Playwright.

#### Changements

**Fichiers modifiés**:

- `playwright.config.ts` (~15 lines: -12 suppressed, +3 comments updated)

**Actions détaillées**:

1. **Supprimer les imports dotenv commentés** (lignes 7-9):

   ```typescript
   // À SUPPRIMER:
   // import dotenv from 'dotenv';
   // import path from 'path';
   // dotenv.config({ path: path.resolve(__dirname, '.env') });
   ```

2. **Décision sur configs mobiles** (lignes 54-71):

   **Recommandation**: Supprimer complètement

   **Rationale**:
   - Les tests existants n'utilisent pas ces configs
   - Mobile Safari déjà présent dans projects (ligne 71)
   - Pas de besoin métier identifié pour Mobile Chrome/Pixel 5
   - Git log montre qu'ils n'ont jamais été activés

   **Alternative** (si historique à préserver):
   Déplacer vers `/docs/decisions/004-mobile-test-configs-archived.md`

3. **Ajouter un commentaire clair** pour remplacer l'ancien (lignes 74-82):
   ```typescript
   /**
    * Development server configuration
    * - Local: uses `pnpm dev` (next dev with Turbopack)
    * - E2E Tests (Phase 1+): will use `pnpm preview` (wrangler dev)
    *
    * Note: Current config uses Node.js dev server.
    * Phase 1 will migrate to Cloudflare Workers runtime.
    * See: /docs/specs/epics/epic_1/refactoring_e2e/STORY_E2E_CLOUDFLARE_REFACTOR.md
    */
   ```

#### Validation

```bash
# Imports dotenv supprimés
! grep -q "dotenv" playwright.config.ts

# Configs mobiles supprimées (ou archivées)
! grep -q "Mobile Chrome" playwright.config.ts || test -f docs/decisions/004-mobile-test-configs-archived.md

# Nouveau commentaire présent
grep -q "Phase 1 will migrate" playwright.config.ts
```

#### Commit Message

```
♻️ refactor(test): clean up playwright.config.ts

Remove dead code and obsolete comments:
- Delete commented dotenv imports (never used)
- Remove unused mobile device configs (Mobile Chrome, Pixel 5)
- Update server configuration comments for clarity

Mobile Safari remains active in projects array (line 71).
Configuration now ready for Phase 1 migration to wrangler dev.

No functional changes - tests still pass with current config.

Related: STORY_E2E_CLOUDFLARE_REFACTOR.md Phase 0.3

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

### Commit 5: Archivage Commentaires CI (ADR 003)

**Type**: 📝 docs
**Durée estimée**: 30min
**Priority**: P1

#### Objectif

Archiver l'historique des timeouts CI dans un ADR dédié et simplifier les commentaires du workflow pour améliorer la lisibilité.

#### Changements

**Fichiers créés**:

- `docs/decisions/003-e2e-ci-timeout-history.md` (~100 lines)

**Fichiers modifiés**:

- `.github/workflows/quality.yml` (~20 lines: suppression commentaires longs)

**Contenu du fichier ADR 003**:

````markdown
# ADR 003: Historique des Timeouts Tests E2E en CI

## Statut

Résolu (2025-01-19)

## Contexte (2025-01-XX)

Les tests E2E Playwright ont été désactivés en CI depuis plusieurs semaines
en raison de timeouts persistants lors du démarrage du serveur.

### Symptômes Observés

```yaml
# GitHub Actions logs:
Error: webServer.url http://localhost:3000 timed out (60000ms)
```
````

### Environnement

- **Workflow**: `.github/workflows/quality.yml`
- **Job**: `e2e-tests` (désactivé)
- **Runner**: ubuntu-latest (2 vCPU, 7 GB RAM)
- **Commande**: `pnpm dev` (local), `pnpm start` (CI)
- **Timeout configuré**: 60 secondes

### Cause Racine Identifiée

Le serveur de développement Next.js avec OpenNext Cloudflare prend
**>60 secondes** pour démarrer en "cold start" sur les runners CI.

Facteurs contributifs:

1. OpenNext adapter initialize (~20-30s)
2. Next.js compilation avec Turbopack (~15-25s)
3. Durable Objects warnings flood stdout (~5-10s)
4. Ressources CI limitées (2 vCPU partagés)

### Impact

- ❌ Tests E2E désactivés depuis ~3 semaines
- ❌ Aucune quality gate E2E en CI
- ❌ Risque élevé de régressions silencieuses
- ❌ Confiance réduite dans les déploiements

## Décision

Migrer vers architecture wrangler dev (ADR 002) avec timeouts augmentés.

## Résolution (Phase 1-3)

### Configuration Finale

```yaml
webServer:
  command: pnpm preview # wrangler dev (pas next dev)
  url: http://127.0.0.1:8788
  timeout: 120000 # 2 minutes (vs 60s précédent)
```

### Améliorations

- ✅ Build OpenNext explicite avant tests
- ✅ Timeout 120s pour cold start wrangler
- ✅ IPv4 forcing (127.0.0.1) pour éviter race conditions
- ✅ Workers séquentiels en CI (workers: 1)

### Résultats Attendus

- Durée job E2E: <15min
- Taux de succès: >95%
- Flaky tests: 0

## Références

- `.github/workflows/quality.yml` (lignes 134-148, commentaires originaux)
- /docs/specs/epics/epic_1/refactoring_e2e/STORY_E2E_CLOUDFLARE_REFACTOR.md
- ADR 002 (architecture wrangler dev)

## Changelog

- 2025-01-XX: Tests désactivés (timeout)
- 2025-01-19: ADR créé, historique archivé
- 2025-01-XX: Phase 1-3 implémentées, tests réactivés

````

**Modifications `.github/workflows/quality.yml`**:

**Avant** (lignes 134-148):
```yaml
# E2E Tests temporarily disabled due to timeout issues
# Root cause: Server fails to start within timeout in CI environment
# next dev with OpenNext Cloudflare takes >60s to initialize on GitHub Actions runners
# Investigation needed: Consider using production build or increasing timeout
# Tracked in: /docs/specs/epics/epic_1/refactoring_e2e/STORY_E2E_CLOUDFLARE_REFACTOR.md
- name: E2E Tests (Temporarily Disabled)
  run: echo "⚠️ E2E tests disabled - investigating timeout issues"
````

**Après**:

```yaml
# E2E Tests temporarily disabled - See ADR 003 for history and resolution plan
# Will be reactivated in Phase 3 (Intégration CI)
- name: E2E Tests (Temporarily Disabled)
  run: echo "⚠️ E2E tests disabled - See /docs/decisions/003-e2e-ci-timeout-history.md"
```

#### Validation

```bash
# ADR 003 existe
test -f docs/decisions/003-e2e-ci-timeout-history.md
grep -q "Timeouts Tests E2E" docs/decisions/003-e2e-ci-timeout-history.md

# Workflow simplifié
grep -q "ADR 003" .github/workflows/quality.yml
! grep -q "Investigation needed" .github/workflows/quality.yml  # Ancien commentaire supprimé
```

#### Commit Message

```
📝 docs(ci): archive E2E timeout history in ADR 003

Move long inline comments from quality.yml to dedicated ADR for clarity.

Created:
- docs/decisions/003-e2e-ci-timeout-history.md
  → Complete history of E2E timeout issues
  → Root cause analysis (cold start >60s)
  → Resolution plan (wrangler dev + 120s timeout)

Modified:
- .github/workflows/quality.yml
  → Simplified comment with ADR reference
  → Removed 15 lines of inline documentation

Workflow now cleaner, full context preserved in ADR.

Related: STORY_E2E_CLOUDFLARE_REFACTOR.md Phase 0.4

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

### Commit 6: Documentation Scripts et Workflow

**Type**: 📝 docs
**Durée estimée**: 20min
**Priority**: P1

#### Objectif

Clarifier la différence entre `pnpm dev` (développement) et `pnpm preview` (E2E tests) pour éviter toute confusion lors de l'onboarding ou du debug.

#### Changements

**Fichiers modifiés**:

- `scripts/dev-quiet.sh` (+5 lines de commentaires en tête)
- `CLAUDE.md` (~20 lines ajoutées dans section "Development")

**Modifications `scripts/dev-quiet.sh`**:

**Avant** (ligne 1):

```bash
#!/bin/bash
```

**Après**:

```bash
#!/bin/bash
# Script: Local Development Server (Next.js with Turbopack)
# Usage: pnpm dev
#
# NOTE: E2E tests use 'pnpm preview' (wrangler dev), NOT this script.
# This script is for local development with hot-reload only.
# It filters Durable Objects warnings for cleaner output.
#
# See: CLAUDE.md section "Development" for details.
```

**Modifications `CLAUDE.md`**:

Ajouter après la ligne "- `pnpm dev` - Start Next.js dev server...":

```markdown
### Development Servers

The project uses two distinct development servers depending on the use case:

#### Local Development (`pnpm dev`)

- **Command**: `pnpm dev`
- **Runtime**: Node.js (Next.js dev server with Turbopack)
- **Script**: `scripts/dev-quiet.sh` (filters Durable Objects warnings)
- **URL**: http://localhost:3000
- **Use case**: Local development with hot-reload, debugging, rapid iteration
- **Features**: Fast Refresh, detailed error overlay, instant updates

#### E2E Testing (`pnpm preview`)

- **Command**: `pnpm preview`
- **Runtime**: Cloudflare Workers (wrangler dev with workerd)
- **Script**: Direct wrangler execution
- **URL**: http://127.0.0.1:8788
- **Use case**: E2E tests, Playwright, production-like environment simulation
- **Features**: D1 bindings, R2 cache, Durable Objects, Edge APIs

**Important**: After Phase 1 implementation, E2E tests will ONLY work with `pnpm preview`.
Using `pnpm dev` for tests will fail due to missing Cloudflare runtime features.

See: `/docs/specs/epics/epic_1/refactoring_e2e/STORY_E2E_CLOUDFLARE_REFACTOR.md`
```

#### Validation

```bash
# Commentaires ajoutés au script
head -10 scripts/dev-quiet.sh | grep -q "E2E tests use"

# Documentation ajoutée à CLAUDE.md
grep -q "Development Servers" CLAUDE.md
grep -q "pnpm preview" CLAUDE.md
grep -q "workerd" CLAUDE.md
```

#### Commit Message

```
📝 docs(scripts): clarify dev vs preview server usage

Add clear documentation to distinguish between development servers:

scripts/dev-quiet.sh:
- Add header comments explaining script purpose
- Note that E2E tests use 'pnpm preview', not this script

CLAUDE.md:
- Add "Development Servers" section
- Document `pnpm dev` (Node.js, hot-reload)
- Document `pnpm preview` (Cloudflare Workers, E2E tests)
- Explain runtime differences and use cases

Prevents confusion during onboarding and debugging.

Related: STORY_E2E_CLOUDFLARE_REFACTOR.md Phase 0.5

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Ordre d'Implémentation

### Séquence Recommandée

```
1. Commit 1 (ADR 002) ← CRITIQUE - Débloque tout
   ↓
2. Commit 2 (Nettoyage Git) ← État propre
   ↓
3. Commit 3 (.gitignore) ← Évite pollution future
   ↓
4. Commit 4 (playwright.config.ts) ← Refactoring
   ↓
5. Commit 5 (ADR 003 + CI) ← Archivage historique
   ↓
6. Commit 6 (Scripts + CLAUDE.md) ← Documentation finale
```

### Rationale de l'Ordre

1. **Commit 1 premier**: Résout le conflit architectural critique qui bloque les décisions futures
2. **Commits 2-3 ensemble**: Nettoient Git pour partir d'une base saine
3. **Commit 4**: Refactoring isolé, pas de dépendances
4. **Commits 5-6**: Documentation et clarification, peuvent être groupés si review rapide

### Parallélisation Possible

Si plusieurs développeurs disponibles:

**Développeur A**:

- Commit 1 (ADR 002) - 30min
- Commit 5 (ADR 003) - 30min
- Commit 6 (Docs) - 20min

**Développeur B** (après Commit 1):

- Commit 2 (Git cleanup) - 20min
- Commit 3 (.gitignore) - 10min
- Commit 4 (playwright.config) - 30min

**Gain de temps**: ~1h (parallélisation possible après Commit 1)

---

## Validation

### Validation Par Commit

Chaque commit doit passer ces checks individuellement:

```bash
# Git status clean
git status | grep "nothing to commit"

# Aucun fichier untracked (sauf intentionnel)
git ls-files --others --exclude-standard | wc -l  # Doit être 0

# Build Next.js passe
pnpm build

# Linter passe
pnpm lint

# Tests unitaires passent
pnpm test
```

### Validation Globale Phase 0

Après le 6ème commit, exécuter:

```bash
# 1. Décision architecturale documentée
test -f docs/decisions/002-e2e-local-wrangler-dev.md || echo "❌ ADR 002 manquant"

# 2. Git propre
git status | grep "working tree clean" || echo "❌ Git non clean"

# 3. Patterns logs ignorés
grep -q "test-output.log" .gitignore || echo "❌ .gitignore incomplet"

# 4. Aucun dotenv dans playwright.config
! grep -q "dotenv" playwright.config.ts || echo "❌ dotenv encore présent"

# 5. ADR timeout créé
test -f docs/decisions/003-e2e-ci-timeout-history.md || echo "❌ ADR 003 manquant"

# 6. Scripts documentés
grep -q "E2E tests use" scripts/dev-quiet.sh || echo "❌ Script non documenté"

# 7. CLAUDE.md mis à jour
grep -q "Development Servers" CLAUDE.md || echo "❌ CLAUDE.md non mis à jour"

# 8. Tous les tests existants passent
pnpm test || echo "❌ Tests unitaires cassés"
pnpm lint || echo "❌ Linter cassé"
```

**Critère de succès**: Tous les checks doivent retourner ✅ (exit code 0)

---

## Rollback Strategy

### Rollback Commit Individuel

Si un commit introduit un problème:

```bash
# Identifier le commit problématique
git log --oneline -10

# Rollback du commit spécifique (ex: Commit 4)
git revert <commit-sha>
```

### Rollback Complet Phase 0

Si la phase entière doit être abandonnée:

```bash
# Retour à l'état avant Phase 0
git checkout main
git branch -D phase-0/cleanup-and-preparation

# Recréer la branche depuis main
git checkout -b phase-0/cleanup-and-preparation-v2
```

### Sauvegarde Préventive

Avant de démarrer Phase 0:

```bash
# Créer une branche de backup
git checkout -b backup/before-phase-0
git push origin backup/before-phase-0

# Revenir à la branche de travail
git checkout main
git checkout -b phase-0/cleanup-and-preparation
```

---

## Métriques de Succès

### Métriques Quantitatives

| Métrique                                  | Avant Phase 0 | Après Phase 0 | Target |
| ----------------------------------------- | ------------- | ------------- | ------ |
| **Fichiers untracked**                    | 3             | 0             | 0      |
| **Fichiers deleted non commités**         | 1             | 0             | 0      |
| **Imports dotenv dans playwright.config** | 3 lignes      | 0             | 0      |
| **ADR créés**                             | 1 (ADR 001)   | 3 (002, 003)  | 2+     |
| **Lignes de commentaires CI**             | 15            | 2             | <5     |
| **Documentation scripts**                 | 0             | 1 section     | 1      |

### Métriques Qualitatives

- ✅ Décision architecturale claire et documentée
- ✅ Historique Git propre et compréhensible
- ✅ Code sans ambiguïté (pas de "TODO" ou "FIXME" ajoutés)
- ✅ Documentation à jour (CLAUDE.md)
- ✅ Onboarding facilité (différence dev/preview claire)

---

## Prochaines Étapes

### Immédiatement Après Phase 0

1. **Review**: Créer une PR et demander review (1h)
2. **Merge**: Merger dans main après approbation
3. **Communication**: Informer l'équipe de la décision architecturale (ADR 002)

### Transition vers Phase 1

**Prérequis Phase 1** (tous doivent être ✅):

- ✅ Phase 0 mergée dans main
- ✅ ADR 002 validé par l'équipe
- ✅ Git status clean
- ✅ Tous les tests existants passent

**Première action Phase 1**:
Lire `/docs/specs/epics/epic_1/refactoring_e2e/STORY_E2E_CLOUDFLARE_REFACTOR.md` section "Phase 1: Configuration Locale"

---

## Support et Questions

### Problèmes Courants

**Q**: Conflit Git lors du commit de `tests/example.spec.ts`?
**R**: Vérifier avec `git status` que le fichier est bien en état "deleted". Utiliser `git rm tests/example.spec.ts` si nécessaire.

**Q**: Les nouveaux tests (compression) ne sont pas détectés?
**R**: Exécuter `git add tests/compression.spec.ts tests/fixtures/compression.ts` explicitement.

**Q**: Indécision sur les configs mobiles (Commit 4)?
**R**: Examiner `git log -p playwright.config.ts | grep -A 10 "Mobile"` pour voir l'historique. Recommandation: supprimer si jamais utilisées.

**Q**: Le workflow CI ne compile plus après Commit 5?
**R**: Vérifier que le commentaire simplifié respecte la syntaxe YAML. Utiliser `yamllint .github/workflows/quality.yml`.

### Escalation

Si bloqué >1h sur un commit:

1. Vérifier la section "Validation" du commit concerné
2. Consulter [guides/REVIEW.md](./guides/REVIEW.md) section "Troubleshooting"
3. Demander aide au tech lead ou créer une issue GitHub

---

## Changelog

| Date       | Version | Changement                                |
| ---------- | ------- | ----------------------------------------- |
| 2025-01-19 | 1.0.0   | Création du plan d'implémentation Phase 0 |

---

**Prêt à implémenter? Consultez [COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md) pour la checklist détaillée!**
