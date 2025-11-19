# Validation Checklist - Phase 0

**Phase**: Phase 0 - Nettoyage et Préparation
**Objectif**: Validation finale avant merge
**Dernière mise à jour**: 2025-01-19

---

## Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Checklist Rapide](#checklist-rapide)
3. [Validation Détaillée](#validation-détaillée)
4. [Script de Validation Automatique](#script-de-validation-automatique)
5. [Critères de Passage](#critères-de-passage)

---

## Vue d'Ensemble

### Objectif

Cette checklist valide que la Phase 0 est **complète et prête pour merge** dans la branche principale.

### Quand Utiliser

Exécuter cette validation:

- ✅ **Après les 6 commits** (implémentation complète)
- ✅ **Avant de créer la Pull Request**
- ✅ **Après chaque modification** suite à review

### Durée Estimée

- **Checklist manuelle**: 15-20min
- **Script automatique**: 2-3min
- **Total**: ~20-25min

---

## Checklist Rapide

### Checklist Visuelle (5min)

Cocher rapidement ces items pour un premier aperçu:

#### Git et Commits

- [ ] 6 commits présents sur la branche
- [ ] Tous les commits utilisent Gitmoji
- [ ] Git status est clean (aucun fichier non commité)
- [ ] Historique linéaire (pas de merge commits)

#### Fichiers Clés

- [ ] ADR 002 existe (`docs/decisions/002-e2e-local-wrangler-dev.md`)
- [ ] ADR 003 existe (`docs/decisions/003-e2e-ci-timeout-history.md`)
- [ ] .gitignore contient "test-output.log"
- [ ] playwright.config.ts ne contient pas "dotenv"
- [ ] scripts/dev-quiet.sh a un header de documentation
- [ ] CLAUDE.md mentionne "Development Servers"

#### Tests et Build

- [ ] `pnpm lint` passe sans erreur
- [ ] `pnpm test` passe sans erreur
- [ ] `pnpm build` passe sans erreur

**Si tous ✅**: Continuer avec la validation détaillée.
**Si des ❌**: Fixer avant de continuer.

---

## Validation Détaillée

### 1. Validation Git

#### 1.1 Nombre de Commits

```bash
# Compter les commits depuis main
git log main..HEAD --oneline | wc -l
```

**Attendu**: Exactement **6 commits**

- [ ] 6 commits présents

#### 1.2 Messages de Commits

```bash
# Afficher les messages
git log main..HEAD --oneline
```

**Vérifier**:

**Commit 1**:

- [ ] Utilise `📝 docs(e2e)`
- [ ] Titre mentionne "ADR 002"
- [ ] Corps explique la décision architecturale

**Commit 2**:

- [ ] Utilise `🗑️ remove` et `✅ test`
- [ ] Titre mentionne "Playwright example template"
- [ ] Corps liste les fichiers changés

**Commit 3**:

- [ ] Utilise `🔧 config(git)`
- [ ] Titre mentionne ".gitignore"
- [ ] Corps liste les patterns ajoutés

**Commit 4**:

- [ ] Utilise `♻️ refactor(test)`
- [ ] Titre mentionne "playwright.config.ts"
- [ ] Corps explique le nettoyage (dotenv, mobile configs)

**Commit 5**:

- [ ] Utilise `📝 docs(ci)`
- [ ] Titre mentionne "ADR 003"
- [ ] Corps explique l'archivage des commentaires CI

**Commit 6**:

- [ ] Utilise `📝 docs(scripts)`
- [ ] Titre mentionne "dev vs preview"
- [ ] Corps explique la documentation ajoutée

#### 1.3 État Git

```bash
# Vérifier l'état
git status
```

**Attendu**: "working tree clean" (ou seulement fichiers de documentation phase_0)

- [ ] Aucun fichier untracked imprévu
- [ ] Aucun fichier modified non commité
- [ ] Aucun fichier deleted non commité

#### 1.4 Historique Linéaire

```bash
# Vérifier l'historique
git log --graph --oneline main..HEAD
```

**Attendu**: Historique linéaire sans merge commits

- [ ] Pas de "Merge branch..." dans l'historique
- [ ] Pas de croisements dans le graph

---

### 2. Validation Documentation

#### 2.1 ADR 002

```bash
# Vérifier que le fichier existe et est bien formé
test -f docs/decisions/002-e2e-local-wrangler-dev.md && echo "✅ Existe" || echo "❌ Manquant"
```

**Contenu**:

```bash
cat docs/decisions/002-e2e-local-wrangler-dev.md
```

**Checklist**:

- [ ] **Statut**: "Accepté"
- [ ] **Date**: Présente (2025-01-19 ou similaire)
- [ ] **Contexte**: Explique le conflit ADR 001 vs Story
- [ ] **Décision**: Explicite ("Option B: Wrangler Dev Local")
- [ ] **Rationale**: Au moins 5 raisons (performance, coût, debugging, etc.)
- [ ] **Alternatives**: Option A documentée avec avantages/inconvénients
- [ ] **Conséquences**: Liste les actions (Phases 1-4)
- [ ] **Références**: Liens vers Story, ADR 001, guide Cloudflare
- [ ] **Markdown valide**: Pas d'erreurs de syntaxe

**Validation automatique**:

```bash
# Vérifier les sections requises
grep -q "## Statut" docs/decisions/002-e2e-local-wrangler-dev.md && echo "✅ Statut"
grep -q "## Décision" docs/decisions/002-e2e-local-wrangler-dev.md && echo "✅ Décision"
grep -q "## Rationale" docs/decisions/002-e2e-local-wrangler-dev.md && echo "✅ Rationale"
grep -q "wrangler dev" docs/decisions/002-e2e-local-wrangler-dev.md && echo "✅ Mentionne wrangler"
```

- [ ] Toutes les vérifications passent

#### 2.2 ADR 003

```bash
# Vérifier existence
test -f docs/decisions/003-e2e-ci-timeout-history.md && echo "✅ Existe" || echo "❌ Manquant"
```

**Checklist**:

- [ ] **Titre**: "Historique des Timeouts Tests E2E en CI"
- [ ] **Statut**: "Résolu" avec date
- [ ] **Contexte**: Explique le problème de timeout (>60s)
- [ ] **Cause Racine**: Identifiée (cold start OpenNext)
- [ ] **Résolution**: Documentée (wrangler dev + 120s timeout)
- [ ] **Références**: Liens vers quality.yml, Story, ADR 002

**Validation automatique**:

```bash
grep -q "Timeouts Tests E2E" docs/decisions/003-e2e-ci-timeout-history.md && echo "✅ Titre"
grep -q "Résolu" docs/decisions/003-e2e-ci-timeout-history.md && echo "✅ Statut"
grep -q "cold start" docs/decisions/003-e2e-ci-timeout-history.md && echo "✅ Cause"
```

- [ ] Toutes les vérifications passent

#### 2.3 Workflow CI (quality.yml)

```bash
# Vérifier la simplification
grep -A 5 "E2E Tests" .github/workflows/quality.yml
```

**Checklist**:

- [ ] Commentaires longs supprimés (plus de 15 lignes)
- [ ] Référence ADR 003 présente
- [ ] Echo mis à jour avec chemin vers ADR 003
- [ ] YAML valide (pas d'erreur de syntaxe)

**Validation YAML**:

```bash
# Si yamllint installé
yamllint .github/workflows/quality.yml || echo "⚠️ Installer yamllint pour vérification"
```

- [ ] YAML valide

#### 2.4 Scripts (dev-quiet.sh)

```bash
# Vérifier le header
head -15 scripts/dev-quiet.sh
```

**Checklist**:

- [ ] Header présent (13 lignes)
- [ ] Explique l'usage ("pnpm dev")
- [ ] Note que E2E utilisent "pnpm preview"
- [ ] Référence CLAUDE.md

**Validation**:

```bash
grep -q "E2E tests use" scripts/dev-quiet.sh && echo "✅ Note E2E présente"
```

- [ ] Header documenté

#### 2.5 CLAUDE.md

```bash
# Vérifier la section Development Servers
grep -A 30 "Development Servers" CLAUDE.md
```

**Checklist**:

- [ ] Section "Development Servers" existe
- [ ] Distingue "pnpm dev" (Node.js, localhost:3000)
- [ ] Distingue "pnpm preview" (Cloudflare Workers, 127.0.0.1:8788)
- [ ] Explique les use cases de chaque serveur
- [ ] Mentionne workerd, D1, R2, etc.
- [ ] Référence Story document

**Validation**:

```bash
grep -q "Development Servers" CLAUDE.md && echo "✅ Section existe"
grep -q "pnpm preview" CLAUDE.md && echo "✅ Mentionne preview"
grep -q "workerd" CLAUDE.md && echo "✅ Mentionne workerd"
```

- [ ] Section complète et exacte

---

### 3. Validation Configuration

#### 3.1 .gitignore

```bash
# Vérifier les patterns ajoutés
grep -A 5 "# Test logs" .gitignore
```

**Checklist**:

- [ ] Commentaire "# Test logs" présent
- [ ] Pattern "test-output.log" présent
- [ ] Pattern "playwright-output.log" présent
- [ ] Pattern "\*.test.log" présent
- [ ] Pattern "e2e-\*.log" présent

**Test fonctionnel**:

```bash
# Créer un fichier test
touch test-validation.test.log
git status --ignored | grep "test-validation.test.log" && echo "✅ Pattern fonctionne"
rm test-validation.test.log
```

- [ ] Patterns fonctionnent correctement

#### 3.2 playwright.config.ts

```bash
# Vérifier absence de dotenv
grep -i "dotenv" playwright.config.ts
# Attendu: Rien (exit code 1)
```

**Checklist**:

- [ ] Aucun import dotenv (commenté ou non)
- [ ] Mobile Safari toujours présent dans projects
- [ ] Nouveau commentaire webServer présent
- [ ] Commentaire mentionne "Phase 1 will migrate"

**Validation**:

```bash
! grep -q "dotenv" playwright.config.ts && echo "✅ Pas de dotenv"
grep -q "Mobile Safari" playwright.config.ts && echo "✅ Mobile Safari présent"
grep -q "Phase 1 will migrate" playwright.config.ts && echo "✅ Commentaire mis à jour"
```

- [ ] Configuration nettoyée et documentée

---

### 4. Validation Tests et Build

#### 4.1 TypeScript

```bash
# Vérifier la compilation
pnpm exec tsc --noEmit
```

**Attendu**: Aucune erreur de type

- [ ] TypeScript compile sans erreur

#### 4.2 Linter

```bash
# Exécuter le linter
pnpm lint
```

**Attendu**: 0 erreurs (warnings OK si préexistants)

- [ ] Linter passe sans erreur

#### 4.3 Build Next.js

```bash
# Exécuter le build
pnpm build
```

**Attendu**: Build réussit, dossier .next généré

- [ ] Build passe sans erreur
- [ ] Dossier .next existe

#### 4.4 Tests Unitaires

```bash
# Exécuter tous les tests unitaires
pnpm test
```

**Attendu**: Tous les tests passent (100% success rate)

- [ ] Tous les tests unitaires passent
- [ ] Aucun nouveau test échoué

---

### 5. Validation Fichiers Modifiés

#### 5.1 Fichiers Supprimés

```bash
# Vérifier que example.spec.ts n'existe plus
! test -f tests/example.spec.ts && echo "✅ example.spec supprimé" || echo "❌ Fichier encore présent"
```

- [ ] tests/example.spec.ts n'existe plus
- [ ] Aucun autre fichier supprimé par erreur

#### 5.2 Fichiers Ajoutés

```bash
# Vérifier les nouveaux fichiers
test -f tests/compression.spec.ts && echo "✅ compression.spec ajouté"
test -f tests/fixtures/compression.ts && echo "✅ fixture ajouté"
```

- [ ] tests/compression.spec.ts existe
- [ ] tests/fixtures/compression.ts existe
- [ ] ADR 002 et 003 existent

#### 5.3 Fichiers Modifiés

```bash
# Lister les fichiers modifiés par rapport à main
git diff main --name-only
```

**Attendu** (environ):

- .gitignore
- playwright.config.ts
- .github/workflows/quality.yml
- scripts/dev-quiet.sh
- CLAUDE.md

- [ ] Fichiers modifiés cohérents avec les commits
- [ ] Aucun fichier modifié de manière inattendue

---

### 6. Validation Métriques

#### 6.1 Métriques Quantitatives

| Métrique                         | Cible | Validation                        |
| -------------------------------- | ----- | --------------------------------- | ------ |
| **Commits**                      | 6     | [ ] `git log main..HEAD --oneline | wc -l` |
| **Fichiers modifiés**            | ~10   | [ ] `git diff main --name-only    | wc -l` |
| **ADR créés**                    | 2     | [ ] ADR 002 + 003                 |
| **Lignes ajoutées .gitignore**   | 5     | [ ] Patterns logs                 |
| **Lignes supprimées playwright** | ~15   | [ ] dotenv + mobiles              |
| **Tests unitaires passing**      | 100%  | [ ] `pnpm test`                   |

#### 6.2 Métriques Qualitatives

**Review humaine requise**:

- [ ] **Clarté documentation**: Un nouveau dev peut comprendre les décisions
- [ ] **Cohérence Git**: Historique propre et logique
- [ ] **Qualité commits**: Messages clairs, Gitmoji correct
- [ ] **Complétude**: Tous les objectifs Phase 0 atteints

---

### 7. Validation Alignement Équipe

#### 7.1 Décisions Validées

- [ ] **ADR 002**: Décision architecturale validée par tech lead/architecte
- [ ] **ADR 002**: Aucune objection majeure de l'équipe
- [ ] **Configs mobiles**: Décision sur suppression/archivage documentée

#### 7.2 Communication

- [ ] Équipe informée de la décision ADR 002 (wrangler dev local)
- [ ] Équipe informée que Phase 1 peut démarrer après merge

---

## Script de Validation Automatique

### Script Complet

Copier ce script dans `scripts/validate-phase-0.sh`:

```bash
#!/bin/bash
# =============================================================================
# Phase 0 - Script de Validation Automatique
# =============================================================================
# Usage: ./scripts/validate-phase-0.sh
#
# Ce script exécute tous les checks automatisables de la Phase 0.
# Les checks manuels (qualité documentation) restent requis.
# =============================================================================

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Phase 0 - Validation Automatique                             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

ERRORS=0

# --- 1. Environnement ---
echo "1️⃣  Vérification environnement..."
if node --version | grep -q "v20"; then
  echo "    ✅ Node.js 20.x"
else
  echo "    ❌ Node.js 20 requis (trouvé: $(node --version))"
  ERRORS=$((ERRORS + 1))
fi

if command -v pnpm >/dev/null 2>&1; then
  echo "    ✅ pnpm $(pnpm --version)"
else
  echo "    ❌ pnpm introuvable"
  exit 1
fi
echo ""

# --- 2. Git Commits ---
echo "2️⃣  Vérification Git..."
COMMIT_COUNT=$(git log main..HEAD --oneline 2>/dev/null | wc -l)
if [ "$COMMIT_COUNT" -eq 6 ]; then
  echo "    ✅ 6 commits présents"
else
  echo "    ⚠️  $COMMIT_COUNT commits (attendu: 6)"
fi

if git status | grep -q "working tree clean"; then
  echo "    ✅ Working tree clean"
else
  echo "    ⚠️  Working tree non clean"
  git status --short
fi
echo ""

# --- 3. Fichiers Clés ---
echo "3️⃣  Vérification fichiers clés..."
if [ -f docs/decisions/002-e2e-local-wrangler-dev.md ]; then
  echo "    ✅ ADR 002"
else
  echo "    ❌ ADR 002 manquant"
  ERRORS=$((ERRORS + 1))
fi

if [ -f docs/decisions/003-e2e-ci-timeout-history.md ]; then
  echo "    ✅ ADR 003"
else
  echo "    ❌ ADR 003 manquant"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "test-output.log" .gitignore; then
  echo "    ✅ .gitignore mis à jour"
else
  echo "    ❌ .gitignore patterns manquants"
  ERRORS=$((ERRORS + 1))
fi

if ! grep -q "dotenv" playwright.config.ts; then
  echo "    ✅ playwright.config.ts nettoyé"
else
  echo "    ❌ dotenv encore présent"
  ERRORS=$((ERRORS + 1))
fi

if [ -f tests/compression.spec.ts ]; then
  echo "    ✅ compression.spec.ts ajouté"
else
  echo "    ⚠️  compression.spec.ts manquant"
fi

if ! [ -f tests/example.spec.ts ]; then
  echo "    ✅ example.spec.ts supprimé"
else
  echo "    ❌ example.spec.ts encore présent"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# --- 4. TypeScript ---
echo "4️⃣  Vérification TypeScript..."
if pnpm exec tsc --noEmit 2>&1 | grep -q "error TS"; then
  echo "    ❌ TypeScript erreurs détectées"
  ERRORS=$((ERRORS + 1))
else
  echo "    ✅ TypeScript OK"
fi
echo ""

# --- 5. Linter ---
echo "5️⃣  Vérification Linter..."
if pnpm lint >/dev/null 2>&1; then
  echo "    ✅ Linter OK"
else
  echo "    ❌ Linter erreurs"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# --- 6. Build ---
echo "6️⃣  Vérification Build..."
if pnpm build >/dev/null 2>&1; then
  echo "    ✅ Build OK"
else
  echo "    ❌ Build échoué"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# --- 7. Tests Unitaires ---
echo "7️⃣  Vérification Tests Unitaires..."
if pnpm test >/dev/null 2>&1; then
  echo "    ✅ Tests OK"
else
  echo "    ❌ Tests échoués"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# --- 8. Documentation ---
echo "8️⃣  Vérification Documentation..."
if grep -q "Development Servers" CLAUDE.md; then
  echo "    ✅ CLAUDE.md mis à jour"
else
  echo "    ⚠️  Section Development Servers manquante dans CLAUDE.md"
fi

if head -15 scripts/dev-quiet.sh | grep -q "E2E tests use"; then
  echo "    ✅ dev-quiet.sh documenté"
else
  echo "    ⚠️  Header manquant dans dev-quiet.sh"
fi
echo ""

# --- Résumé ---
echo "╔════════════════════════════════════════════════════════════════╗"
if [ $ERRORS -eq 0 ]; then
  echo "║  ✅ VALIDATION RÉUSSIE                                         ║"
  echo "╚════════════════════════════════════════════════════════════════╝"
  echo ""
  echo "Phase 0 prête pour:"
  echo "  - Code review (voir guides/REVIEW.md)"
  echo "  - Pull Request"
  echo "  - Merge dans main"
  echo ""
  exit 0
else
  echo "║  ❌ VALIDATION ÉCHOUÉE ($ERRORS erreurs)                        ║"
  echo "╚════════════════════════════════════════════════════════════════╝"
  echo ""
  echo "Veuillez corriger les erreurs ci-dessus avant de continuer."
  echo ""
  exit 1
fi
```

### Exécution du Script

```bash
# Rendre exécutable (première fois)
chmod +x scripts/validate-phase-0.sh

# Exécuter
./scripts/validate-phase-0.sh
```

### Résultat Attendu

```
╔════════════════════════════════════════════════════════════════╗
║  Phase 0 - Validation Automatique                             ║
╚════════════════════════════════════════════════════════════════╝

1️⃣  Vérification environnement...
    ✅ Node.js 20.x
    ✅ pnpm 9.15.0

2️⃣  Vérification Git...
    ✅ 6 commits présents
    ✅ Working tree clean

3️⃣  Vérification fichiers clés...
    ✅ ADR 002
    ✅ ADR 003
    ✅ .gitignore mis à jour
    ✅ playwright.config.ts nettoyé
    ✅ compression.spec.ts ajouté
    ✅ example.spec.ts supprimé

4️⃣  Vérification TypeScript...
    ✅ TypeScript OK

5️⃣  Vérification Linter...
    ✅ Linter OK

6️⃣  Vérification Build...
    ✅ Build OK

7️⃣  Vérification Tests Unitaires...
    ✅ Tests OK

8️⃣  Vérification Documentation...
    ✅ CLAUDE.md mis à jour
    ✅ dev-quiet.sh documenté

╔════════════════════════════════════════════════════════════════╗
║  ✅ VALIDATION RÉUSSIE                                         ║
╚════════════════════════════════════════════════════════════════╝

Phase 0 prête pour:
  - Code review (voir guides/REVIEW.md)
  - Pull Request
  - Merge dans main
```

- [ ] Script exécuté avec succès (exit code 0)

---

## Critères de Passage

### Validation Complète

Pour considérer la Phase 0 comme **validée**, TOUS les critères suivants doivent être ✅:

#### Critères Automatiques (Script)

- [ ] 6 commits présents
- [ ] Git status clean
- [ ] ADR 002 et 003 créés
- [ ] .gitignore mis à jour
- [ ] playwright.config.ts nettoyé
- [ ] TypeScript compile sans erreur
- [ ] Linter passe sans erreur
- [ ] Build passe sans erreur
- [ ] Tests unitaires passent (100%)

#### Critères Manuels (Review Humaine)

- [ ] ADR 002 clair et consensuel (équipe alignée)
- [ ] ADR 003 complet (historique CI archivé)
- [ ] Documentation CLAUDE.md exacte (URLs, runtimes)
- [ ] Messages de commits clairs et cohérents
- [ ] Aucune régression fonctionnelle détectée

### Décision Finale

**✅ PHASE 0 VALIDÉE** si:

- ✅ Script de validation passe (0 erreurs)
- ✅ Tous les critères manuels cochés
- ✅ Review team approuvée

**Action**: Créer PR et demander merge.

**❌ PHASE 0 NON VALIDÉE** si:

- ❌ Script échoue (>0 erreurs)
- ❌ Critères manuels incomplets
- ❌ Décisions non consensuelles

**Action**: Fixer les problèmes et re-valider.

---

## Prochaines Étapes

### Après Validation Réussie

1. **Créer la Pull Request**

   ```bash
   # Pusher la branche
   git push origin phase-0/cleanup-and-preparation

   # Créer la PR (avec gh CLI)
   gh pr create \
     --title "🧹 refactor(e2e): Phase 0 - Nettoyage et Préparation" \
     --body "See: docs/specs/epics/epic_1/refactoring_e2e/implementation/phase_0/INDEX.md"
   ```

2. **Demander Review**
   - Assigner reviewer(s)
   - Lien vers [guides/REVIEW.md](../guides/REVIEW.md)
   - Mentionner que validation automatique a passé

3. **Répondre aux Commentaires**
   - Adresser feedback reviewer
   - Re-valider après modifications

4. **Merger**
   - Après approbation review
   - Squash merge OU preserve commits (selon convention projet)

5. **Communiquer**
   - Informer équipe du merge
   - Annoncer que Phase 1 peut démarrer

---

## Changelog

| Date       | Version | Changement                                     |
| ---------- | ------- | ---------------------------------------------- |
| 2025-01-19 | 1.0.0   | Création de la checklist de validation Phase 0 |

---

**Validation complète? Créez la PR et mergez! 🎉**
