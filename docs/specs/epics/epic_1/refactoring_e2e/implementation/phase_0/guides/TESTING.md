# Testing Strategy - Phase 0

**Phase**: Phase 0 - Nettoyage et Préparation
**Type de Phase**: Documentation et Nettoyage
**Dernière mise à jour**: 2025-01-19

---

## Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Nature de la Phase 0](#nature-de-la-phase-0)
3. [Stratégie de Validation](#stratégie-de-validation)
4. [Tests Automatisés](#tests-automatisés)
5. [Tests Manuels](#tests-manuels)
6. [Non-Régression](#non-régression)
7. [Validation Finale](#validation-finale)

---

## Vue d'Ensemble

### Particularité de la Phase 0

La Phase 0 est une **phase de préparation** (nettoyage, documentation, décisions) et **non une phase d'implémentation de fonctionnalités**. Par conséquent:

❌ **Pas de tests unitaires à écrire** (pas de nouvelle logique métier)
❌ **Pas de tests E2E à ajouter** (pas de nouvelles features)
❌ **Pas de tests d'intégration** (pas de nouvelles API)

✅ **Tests de non-régression** (s'assurer que rien n'est cassé)
✅ **Validation manuelle** (vérifier la qualité des documents)
✅ **Checks automatisés** (linter, TypeScript, build)

### Objectif de la Stratégie

S'assurer que les modifications de la Phase 0:
1. Ne cassent **rien** (tests existants passent toujours)
2. Sont de **haute qualité** (documentation claire, code propre)
3. Sont **complètes** (tous les fichiers prévus sont modifiés)

---

## Nature de la Phase 0

### Types de Modifications

| Type | Commits | Tests Requis |
|------|---------|--------------|
| **Documentation** | 1, 5, 6 | Validation manuelle (liens, clarté) |
| **Nettoyage Git** | 2, 3 | Vérification automatique (git status) |
| **Refactoring Config** | 4 | Non-régression (tests existants) |

### Aucune Logique Métier

Phase 0 ne contient **aucun** des éléments suivants:
- Nouvelles fonctions ou classes
- Nouveaux endpoints API
- Nouvelle logique de calcul
- Nouvelles intégrations

**Conséquence**: Pas besoin d'écrire de nouveaux tests unitaires.

---

## Stratégie de Validation

### 1. Validation Automatique (CI/CD)

Exécuter les tests automatisés **existants** pour détecter les régressions:

```bash
# Linter (vérifie style de code)
pnpm lint

# TypeScript (vérifie types)
pnpm exec tsc --noEmit

# Build (vérifie que le projet compile)
pnpm build

# Tests unitaires existants
pnpm test

# Note: Tests E2E sont désactivés (raison de la Phase 0)
# Ne pas exécuter pnpm test:e2e pour l'instant
```

**Fréquence**: Après **chaque commit** (local) et sur la **PR** (CI).

### 2. Validation Manuelle (Review)

Chaque type de modification nécessite une validation spécifique:

#### Documentation (Commits 1, 5, 6)

**Checklist manuelle**:
- [ ] Markdown valide (pas d'erreurs de syntaxe)
- [ ] Liens fonctionnels (pas de 404)
- [ ] Clarté du contenu (compréhensible par un nouveau dev)
- [ ] Orthographe et grammaire correctes
- [ ] Structure cohérente (titres, sections)

**Outils**:
- Markdownlint (VS Code extension)
- Lecture humaine (le plus important!)

#### Configuration (Commit 4)

**Checklist manuelle**:
- [ ] Syntaxe TypeScript correcte (compilable)
- [ ] Aucune option supprimée par erreur
- [ ] Commentaires clairs et à jour

**Outils**:
- `tsc --noEmit` (compilation TypeScript)
- Lecture du diff Git

#### Nettoyage Git (Commits 2, 3)

**Checklist automatique**:
- [ ] Git status clean (pas de fichiers oubliés)
- [ ] Fichiers trackés sont les bons
- [ ] Patterns .gitignore fonctionnent

**Commandes**:
```bash
git status
git ls-files | grep compression
git status --ignored | grep test-output.log
```

### 3. Validation de Non-Régression

**Objectif**: S'assurer qu'aucune fonctionnalité existante n'est cassée.

**Méthode**:
- Exécuter **tous** les tests existants (unitaires)
- Vérifier que le build passe
- Vérifier que le linter passe

**Commandes complètes**:
```bash
# Installation fresh (si doute)
pnpm install

# Linter
pnpm lint || { echo "❌ Lint failed"; exit 1; }

# TypeScript
pnpm exec tsc --noEmit || { echo "❌ TypeScript failed"; exit 1; }

# Build
pnpm build || { echo "❌ Build failed"; exit 1; }

# Tests unitaires
pnpm test || { echo "❌ Tests failed"; exit 1; }

echo "✅ Tous les checks passent"
```

---

## Tests Automatisés

### Tests Existants à Exécuter

#### 1. Tests Unitaires (Vitest)

**Commande**:
```bash
pnpm test
```

**Fichiers testés** (exemples):
- `**/*.{test,spec}.{ts,tsx}` (sauf /tests directory)
- Par exemple: `lib/**/*.test.ts`, `components/**/*.spec.tsx`

**Critère de succès**:
- ✅ Tous les tests passent (100% success rate)
- ✅ Aucune nouvelle erreur introduite
- ✅ Coverage ne doit pas diminuer (si metrics activées)

**En cas d'échec**:
1. Identifier le commit responsable
2. Examiner le diff du commit
3. Fixer ou rollback le commit

#### 2. Linter (ESLint/Biome)

**Commande**:
```bash
pnpm lint
```

**Vérifie**:
- Style de code (indentation, guillemets, etc.)
- Bonnes pratiques (pas de console.log, etc.)
- Imports inutilisés

**Critère de succès**:
- ✅ 0 erreurs
- ⚠️ Warnings acceptables si préexistants

**En cas d'échec**:
```bash
# Auto-fix si possible
pnpm lint:fix

# Sinon, corriger manuellement
```

#### 3. TypeScript (Vérification de Types)

**Commande**:
```bash
pnpm exec tsc --noEmit
```

**Vérifie**:
- Types corrects dans playwright.config.ts (Commit 4)
- Pas de `any` implicites
- Imports/exports corrects

**Critère de succès**:
- ✅ 0 erreurs de type

**En cas d'échec** (Commit 4):
- Vérifier que les imports de `@playwright/test` sont présents
- Vérifier que `devices` est importé si utilisé

#### 4. Build Next.js

**Commande**:
```bash
pnpm build
```

**Vérifie**:
- Compilation de toutes les pages
- Génération des assets
- Pas d'erreurs de bundling

**Critère de succès**:
- ✅ Build réussit sans erreur
- ✅ Dossier `.next` généré

**En cas d'échec**:
- Examiner les logs de build
- Vérifier les imports/exports dans les fichiers modifiés

### Tests NON Exécutés (Intentionnel)

#### Tests E2E (Playwright)

**Commande**: `pnpm test:e2e` ❌ **NE PAS EXÉCUTER**

**Raison**: Les tests E2E sont **désactivés en CI** (raison d'être de la Phase 0). Ils échoueront jusqu'à la Phase 3.

**Note**: Le Commit 2 ajoute `tests/compression.spec.ts` mais ce test ne sera pas exécuté avant Phase 3.

---

## Tests Manuels

### 1. Validation des ADR (Commits 1 et 5)

**Procédure manuelle**:

```bash
# Lire ADR 002
cat docs/decisions/002-e2e-local-wrangler-dev.md

# Vérifier:
# - [ ] Titre présent et clair
# - [ ] Statut "Accepté"
# - [ ] Date présente
# - [ ] Décision explicite
# - [ ] Rationale convaincant (3+ raisons)
# - [ ] Alternatives documentées
# - [ ] Références présentes

# Lire ADR 003
cat docs/decisions/003-e2e-ci-timeout-history.md

# Vérifier:
# - [ ] Historique complet du problème CI
# - [ ] Cause racine identifiée
# - [ ] Résolution documentée
```

**Critère de succès**:
- ✅ Un nouveau développeur peut comprendre les décisions
- ✅ Les liens sont fonctionnels
- ✅ Pas de sections manquantes

### 2. Validation des Scripts (Commit 6)

**Procédure manuelle**:

```bash
# Lire le header de dev-quiet.sh
head -20 scripts/dev-quiet.sh

# Vérifier:
# - [ ] Header de documentation présent
# - [ ] Usage expliqué ("pnpm dev")
# - [ ] Note sur E2E ("pnpm preview")
# - [ ] Référence à CLAUDE.md

# Tester le script (optionnel, ne pas laisser tourner)
pnpm dev
# Ctrl+C après 5 secondes
# Vérifier que les logs apparaissent et sont filtrés
```

**Critère de succès**:
- ✅ Header clair et informatif
- ✅ Script toujours fonctionnel

### 3. Validation CLAUDE.md (Commit 6)

**Procédure manuelle**:

```bash
# Lire la section Development Servers
grep -A 40 "Development Servers" CLAUDE.md

# Vérifier:
# - [ ] Section "Development Servers" existe
# - [ ] Distingue clairement `pnpm dev` vs `pnpm preview`
# - [ ] URLs correctes (localhost:3000 vs 127.0.0.1:8788)
# - [ ] Runtimes corrects (Node.js vs Cloudflare Workers)
# - [ ] Use cases clairs
```

**Critère de succès**:
- ✅ Un nouveau développeur comprend quand utiliser dev vs preview
- ✅ Pas de typos ou erreurs factuelles

### 4. Validation .gitignore (Commit 3)

**Procédure manuelle**:

```bash
# Créer un fichier de test
touch test-example.test.log

# Vérifier qu'il est ignoré
git status | grep test-example.test.log
# Ne doit PAS apparaître dans "Untracked files"

git status --ignored | grep test-example.test.log
# Doit apparaître dans "Ignored files"

# Nettoyer
rm test-example.test.log
```

**Critère de succès**:
- ✅ Fichiers de logs de test sont ignorés
- ✅ Patterns fonctionnent correctement

### 5. Validation playwright.config.ts (Commit 4)

**Procédure manuelle**:

```bash
# Vérifier qu'aucun import dotenv
grep -i "dotenv" playwright.config.ts
# Ne doit rien retourner (exit code 1)

# Vérifier que Mobile Safari est toujours présent
grep "Mobile Safari" playwright.config.ts
# Doit retourner une ligne (dans projects array)

# Vérifier le nouveau commentaire
grep -A 5 "Development server configuration" playwright.config.ts
# Doit montrer le commentaire mis à jour
```

**Critère de succès**:
- ✅ Code mort supprimé
- ✅ Fonctionnalités préservées
- ✅ Commentaires clairs

---

## Non-Régression

### Checklist de Non-Régression

Après **tous les 6 commits**:

#### Builds et Compilations

```bash
# 1. Clean install
pnpm install

# 2. TypeScript compile
pnpm exec tsc --noEmit
# ✅ Attendu: Success, no errors

# 3. Build Next.js
pnpm build
# ✅ Attendu: Build completed, .next folder exists

# 4. Linter
pnpm lint
# ✅ Attendu: No errors
```

- [ ] Tous les builds passent

#### Tests Unitaires

```bash
# Exécuter tous les tests unitaires
pnpm test

# Vérifier le résultat
# ✅ Attendu: All tests passed
```

- [ ] Tous les tests unitaires passent

#### Git Status

```bash
# Vérifier l'état Git
git status

# ✅ Attendu: "working tree clean" (ou seulement docs/specs modifiés)
```

- [ ] Git status est propre

#### Fonctionnalités Clés (Smoke Tests)

**Note**: Ces tests sont manuels et rapides (5min total).

```bash
# 1. Dev server démarre
pnpm dev &
sleep 10
curl -I http://localhost:3000
# ✅ Attendu: HTTP 200 OK
kill %1  # Arrêter le serveur

# 2. Preview server démarre (si wrangler configuré)
# Sinon, skippé (Phase 1 le configurera)
```

- [ ] Dev server fonctionne

### Métriques de Non-Régression

| Métrique | Avant Phase 0 | Après Phase 0 | Status |
|----------|---------------|---------------|--------|
| **Tests unitaires** | X passed | X passed | ✅ Identique |
| **Linter errors** | 0 | 0 | ✅ Identique |
| **TypeScript errors** | 0 | 0 | ✅ Identique |
| **Build time** | ~30s | ~30s | ✅ Similaire |
| **Dev server start** | Fonctionne | Fonctionne | ✅ OK |

**Critère de succès**: Toutes les métriques sont identiques ou améliorées.

---

## Validation Finale

### Script de Validation Complet

Exécuter ce script en fin de Phase 0 (après les 6 commits):

```bash
#!/bin/bash
set -e  # Exit on error

echo "=== Phase 0 - Validation Finale ==="
echo ""

# 1. Environnement
echo "1️⃣ Vérification environnement..."
node --version | grep "v20" || { echo "❌ Node.js 20 requis"; exit 1; }
pnpm --version || { echo "❌ pnpm introuvable"; exit 1; }
echo "✅ Environnement OK"
echo ""

# 2. Git
echo "2️⃣ Vérification Git..."
git status | grep "working tree clean" || { echo "⚠️ Working tree non clean"; }
COMMITS=$(git log main..HEAD --oneline | wc -l)
if [ "$COMMITS" -ne 6 ]; then
  echo "⚠️ $COMMITS commits (attendu: 6)"
else
  echo "✅ 6 commits présents"
fi
echo ""

# 3. Fichiers clés
echo "3️⃣ Vérification fichiers..."
test -f docs/decisions/002-e2e-local-wrangler-dev.md && echo "✅ ADR 002" || echo "❌ ADR 002 manquant"
test -f docs/decisions/003-e2e-ci-timeout-history.md && echo "✅ ADR 003" || echo "❌ ADR 003 manquant"
grep -q "test-output.log" .gitignore && echo "✅ .gitignore" || echo "❌ .gitignore incomplet"
! grep -q "dotenv" playwright.config.ts && echo "✅ playwright.config" || echo "❌ dotenv encore présent"
echo ""

# 4. TypeScript
echo "4️⃣ Vérification TypeScript..."
pnpm exec tsc --noEmit && echo "✅ TypeScript OK" || { echo "❌ TypeScript erreurs"; exit 1; }
echo ""

# 5. Linter
echo "5️⃣ Vérification Linter..."
pnpm lint && echo "✅ Linter OK" || { echo "❌ Linter erreurs"; exit 1; }
echo ""

# 6. Build
echo "6️⃣ Vérification Build..."
pnpm build && echo "✅ Build OK" || { echo "❌ Build échoué"; exit 1; }
echo ""

# 7. Tests unitaires
echo "7️⃣ Vérification Tests..."
pnpm test && echo "✅ Tests OK" || { echo "❌ Tests échoués"; exit 1; }
echo ""

echo "=== ✅ Validation Finale RÉUSSIE ==="
echo ""
echo "Phase 0 prête pour review et merge!"
```

**Sauvegarder** ce script dans `scripts/validate-phase-0.sh`:

```bash
# Créer le script
cat > scripts/validate-phase-0.sh << 'EOF'
[copier le script ci-dessus]
EOF

# Rendre exécutable
chmod +x scripts/validate-phase-0.sh

# Exécuter
./scripts/validate-phase-0.sh
```

### Résultat Attendu

```
=== Phase 0 - Validation Finale ===

1️⃣ Vérification environnement...
✅ Environnement OK

2️⃣ Vérification Git...
✅ 6 commits présents

3️⃣ Vérification fichiers...
✅ ADR 002
✅ ADR 003
✅ .gitignore
✅ playwright.config

4️⃣ Vérification TypeScript...
✅ TypeScript OK

5️⃣ Vérification Linter...
✅ Linter OK

6️⃣ Vérification Build...
✅ Build OK

7️⃣ Vérification Tests...
✅ Tests OK

=== ✅ Validation Finale RÉUSSIE ===

Phase 0 prête pour review et merge!
```

**Si tous les ✅**: Phase 0 complète et validée! 🎉

---

## Coverage et Métriques

### Coverage NON Applicable

**Phase 0 n'ajoute pas de code métier**, donc:
- ❌ Pas de nouveau code à couvrir par des tests
- ❌ Pas de metrics de coverage à vérifier
- ❌ Pas de seuils de coverage à atteindre

**Note**: Les phases futures (1-4) auront des objectifs de coverage spécifiques.

### Métriques Qualité Documentation

**Métriques subjectives** (review humaine requise):

| Critère | Score Cible | Validation |
|---------|-------------|------------|
| **Clarté ADR** | 5/5 | Compréhensible par nouveau dev |
| **Complétude Docs** | 100% | Toutes sections présentes |
| **Liens Fonctionnels** | 100% | Aucun lien 404 |
| **Orthographe** | >95% | Peu de typos |

---

## Troubleshooting Tests

### Problème: Tests unitaires échouent après Commit 4

**Symptôme**:
```
pnpm test
# ❌ FAIL tests/example.test.ts
```

**Diagnostic**:
```bash
# Voir quel commit a cassé
git bisect start
git bisect bad HEAD
git bisect good main
pnpm test
# Git bisect identifiera le commit
```

**Solution**:
- Si Commit 4: Vérifier playwright.config.ts (imports manquants?)
- Rollback ou fix du commit responsable

### Problème: TypeScript erreurs après Commit 4

**Symptôme**:
```
pnpm exec tsc --noEmit
# error TS2304: Cannot find name 'devices'
```

**Solution**:
```typescript
// Vérifier que l'import est présent dans playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
```

### Problème: Build échoue

**Symptôme**:
```
pnpm build
# ❌ Failed to compile
```

**Diagnostic**:
```bash
# Voir les logs détaillés
pnpm build 2>&1 | less
```

**Solution**:
- Vérifier les imports/exports dans fichiers modifiés
- Vérifier que CLAUDE.md ou autres docs n'ont pas d'impact sur le build (normalement non)

---

## Conclusion

### Résumé de la Stratégie

Phase 0 n'a **pas de tests automatisés spécifiques** car c'est une phase de documentation/nettoyage.

**La validation repose sur**:
1. ✅ **Non-régression**: Tests existants passent
2. ✅ **Qualité manuelle**: Review des documents
3. ✅ **Checks automatiques**: Linter, TypeScript, Build

### Prochaines Étapes Testing

Les phases futures (1-4) nécessiteront:
- **Phase 1**: Tests du globalSetup D1
- **Phase 2**: Validation tests compression/middleware
- **Phase 3**: Tests CI end-to-end

Voir les guides TESTING.md respectifs de ces phases.

---

## Changelog

| Date | Version | Changement |
|------|---------|------------|
| 2025-01-19 | 1.0.0 | Création du guide de testing Phase 0 |

---

**Tests validés? Consultez [../validation/VALIDATION_CHECKLIST.md](../validation/VALIDATION_CHECKLIST.md) pour validation finale! ✅**
