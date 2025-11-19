# Code Review Guide - Phase 0

**Phase**: Phase 0 - Nettoyage et Préparation
**Total Commits à Review**: 6
**Durée Estimée Review**: 1h10 (total)
**Dernière mise à jour**: 2025-01-19

---

## Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Processus de Review](#processus-de-review)
3. [Review Par Commit](#review-par-commit)
4. [Critères d'Approbation](#critères-dapprobation)
5. [Checklist Globale](#checklist-globale)
6. [Troubleshooting Review](#troubleshooting-review)

---

## Vue d'Ensemble

### Nature de la Phase 0

Cette phase contient **principalement de la documentation et du nettoyage**:
- **Pas de logique métier** à reviewer
- **Pas de tests unitaires** à valider (phase de nettoyage)
- **Pas de code algorithmique** complexe

### Focus de la Review

✅ **Qualité de la documentation** (clarté, complétude)
✅ **Cohérence Git** (historique propre, messages clairs)
✅ **Décisions architecturales** (ADR bien justifiés)
✅ **Aucune régression** (tests existants passent toujours)

### Durée Estimée

| Commit | Type | Durée Review | Complexité |
|--------|------|--------------|------------|
| 1 | ADR 002 | 15min | Moyenne (décision critique) |
| 2 | Nettoyage Git | 10min | Faible |
| 3 | .gitignore | 5min | Très faible |
| 4 | playwright.config | 15min | Moyenne (refactoring) |
| 5 | ADR 003 + CI | 15min | Moyenne (documentation) |
| 6 | Scripts/CLAUDE.md | 10min | Faible |

**Total**: ~1h10

---

## Processus de Review

### Workflow Général

1. **Checkout de la branche**
   ```bash
   git fetch origin
   git checkout phase-0/cleanup-and-preparation
   ```

2. **Review commit par commit** (dans l'ordre)
   - Lire le commit message
   - Examiner le diff
   - Exécuter les validations
   - Cocher la checklist

3. **Validation globale**
   - Exécuter les tests
   - Vérifier l'état Git
   - Approuver ou demander modifications

### Outils Recommandés

- **GitHub UI**: Pour commentaires inline et discussion
- **Git CLI**: Pour examiner historique et diffs
- **VS Code**: Pour lecture de documentation longue

### Conventions de Commentaires

Utiliser les conventions GitHub:

- **💬 Comment**: Question ou suggestion non-bloquante
- **🚨 Request Changes**: Problème bloquant à fixer
- **✅ Approve**: Tout est OK, peut merger

---

## Review Par Commit

### Commit 1: ADR 002 (Décision Architecturale)

**Type**: 📝 docs
**Durée review**: 15min
**Priority**: CRITIQUE (décision bloquante)

#### Objectifs

- [ ] Valider que la décision architecturale est claire
- [ ] Vérifier que les alternatives sont documentées
- [ ] S'assurer que le rationale est convaincant
- [ ] Confirmer que l'équipe est alignée sur la décision

#### Actions

**1. Examiner le commit**

```bash
# Voir le commit
git show <commit-sha-commit-1>

# Ou si sur la branche:
git log --oneline -6  # Voir les 6 commits
git show HEAD~5  # Voir Commit 1 (si sur HEAD de la branche)
```

**2. Lire le fichier ADR 002**

```bash
cat docs/decisions/002-e2e-local-wrangler-dev.md
```

**3. Checklist de validation**

- [ ] **Statut**: Doit être "Accepté" (pas "Proposé" ou "En discussion")
- [ ] **Date**: Présente et cohérente
- [ ] **Contexte**: Explique clairement le problème (ADR 001 vs Story)
- [ ] **Décision**: Explicite et sans ambiguïté ("Option B: Wrangler Dev Local")
- [ ] **Rationale**: Au moins 3-5 raisons solides (performance, coût, debugging, etc.)
- [ ] **Alternatives**: Option A (preview deployments) documentée avec avantages/inconvénients
- [ ] **Conséquences**: Liste claire des actions à mener (Phases 1-4)
- [ ] **Références**: Liens vers Story, ADR 001, guide Cloudflare
- [ ] **Markdown valide**: Pas d'erreurs de syntaxe

**4. Vérifier le message de commit**

- [ ] Utilise Gitmoji (`📝 docs(e2e)`)
- [ ] Titre clair (<72 caractères)
- [ ] Corps explique le **pourquoi** (pas juste le quoi)
- [ ] Référence la Story Phase 0.1
- [ ] Inclut Co-Authored-By Claude

**5. Questions à se poser**

- ❓ La décision est-elle réversible si erreur?
  → **Oui**: Le rollback vers ADR 001 est possible (documenté dans ADR 002)

- ❓ L'équipe est-elle alignée sur cette décision?
  → **Action**: Vérifier avec tech lead ou architecte si doute

- ❓ Les risques sont-ils acceptables?
  → **Oui**: Limites documentées (pas de latence réseau réelle) mais acceptées

#### Critères d'Approbation

✅ **APPROVE** si:
- ADR complet et bien structuré
- Décision clairement documentée
- Rationale convaincant
- Équipe alignée (si confirmé)

🚨 **REQUEST CHANGES** si:
- Sections manquantes (Statut, Décision, Rationale)
- Rationale flou ou insuffisant
- Références cassées
- Décision non consensuelle (à escalader)

---

### Commit 2: Nettoyage Git

**Type**: 🗑️ remove + ✅ test
**Durée review**: 10min
**Priority**: Normale

#### Objectifs

- [ ] Vérifier que les bons fichiers sont supprimés/ajoutés
- [ ] Confirmer que les nouveaux tests sont valides
- [ ] S'assurer qu'aucun fichier important n'est supprimé par erreur

#### Actions

**1. Examiner le diff**

```bash
git show <commit-sha-commit-2>
```

**2. Vérifier les fichiers**

Devrait montrer:
- **Deleted**: `tests/example.spec.ts` (template Playwright, ~50 lines)
- **New**: `tests/compression.spec.ts` (~80 lines)
- **New**: `tests/fixtures/compression.ts` (~30 lines)

**3. Lire les nouveaux tests**

```bash
# Lire compression.spec.ts
git show <commit-sha>:tests/compression.spec.ts

# Lire la fixture
git show <commit-sha>:tests/fixtures/compression.ts
```

**Checklist du contenu**:
- [ ] Tests utilisent Playwright API correctement
- [ ] Tests valident compression Brotli/Gzip
- [ ] Assertions claires (expect... toBe...)
- [ ] Pas de hardcoded URLs ou secrets
- [ ] Fixture bien typée (TypeScript)

**4. Vérifier example.spec.ts supprimé**

```bash
# Confirmer que c'était bien un template
git show <commit-sha>^:tests/example.spec.ts | head -20

# Devrait ressembler à:
# "// Example test for Playwright"
# "test('has title', async ({ page }) => { ... })"
```

- [ ] Confirmé: example.spec.ts était un template sans valeur

**5. Message de commit**

- [ ] Utilise double Gitmoji (`🗑️ remove` + `✅ test`)
- [ ] Explique **pourquoi** (template vs fonctionnel)
- [ ] Liste les fichiers changés

#### Critères d'Approbation

✅ **APPROVE** si:
- example.spec.ts était bien un template
- compression tests semblent valides
- Aucun fichier important supprimé

🚨 **REQUEST CHANGES** si:
- example.spec.ts contenait de la logique métier
- Tests compression mal écrits (pas d'assertions, etc.)
- Fichiers supprimés par erreur

---

### Commit 3: .gitignore

**Type**: 🔧 config
**Durée review**: 5min
**Priority**: Faible

#### Objectifs

- [ ] Vérifier que les patterns sont corrects
- [ ] S'assurer qu'aucun pattern existant n'est supprimé

#### Actions

**1. Examiner le diff**

```bash
git show <commit-sha-commit-3>
```

**2. Vérifier les patterns ajoutés**

Devrait montrer:
```diff
+# Test logs
+test-output.log
+playwright-output.log
+*.test.log
+e2e-*.log
```

**Checklist**:
- [ ] Patterns ajoutés **après** section Playwright (pas au début du fichier)
- [ ] Syntaxe gitignore correcte (pas de regex complexe)
- [ ] Aucun pattern existant supprimé
- [ ] Commentaire "# Test logs" présent

**3. Tester les patterns (optionnel)**

```bash
# Créer un fichier test
touch test-example.test.log

# Vérifier qu'il est ignoré
git status --ignored | grep "test-example.test.log"

# Nettoyer
rm test-example.test.log
```

#### Critères d'Approbation

✅ **APPROVE** si:
- Patterns corrects et bien placés
- Aucune suppression accidentelle
- Commentaire clair

🚨 **REQUEST CHANGES** si:
- Patterns mal formés (syntaxe invalide)
- Patterns trop larges (risque d'ignorer fichiers importants)
- Suppression de patterns existants

---

### Commit 4: playwright.config.ts

**Type**: ♻️ refactor
**Durée review**: 15min
**Priority**: Moyenne

#### Objectifs

- [ ] Vérifier que le code mort est bien supprimé
- [ ] Confirmer qu'aucune fonctionnalité n'est cassée
- [ ] Valider les commentaires mis à jour

#### Actions

**1. Examiner le diff complet**

```bash
git show <commit-sha-commit-4>
```

**2. Vérifier les imports dotenv supprimés**

Devrait montrer:
```diff
-// import dotenv from 'dotenv';
-// import path from 'path';
-// dotenv.config({ path: path.resolve(__dirname, '.env') });
```

**Checklist**:
- [ ] 3 lignes d'imports supprimées
- [ ] Aucun autre import dotenv restant dans le fichier

**3. Vérifier les configs mobiles**

**Si supprimées** (décision A):
```diff
-  // {
-  //   name: 'Mobile Chrome',
-  //   use: { ...devices['Pixel 5'] },
-  // },
```

**Checklist**:
- [ ] Configs commentées supprimées (~18 lines)
- [ ] Mobile Safari reste actif (ligne 71 préservée)
- [ ] **OU** ADR 004 créé si archivées (décision B)

**4. Vérifier le nouveau commentaire**

Devrait montrer:
```diff
+  /**
+   * Development server configuration
+   * - Local dev: uses `pnpm dev` (next dev with Turbopack)
+   * - E2E Tests (Phase 1+): will use `pnpm preview` (wrangler dev)
+   ...
+   */
```

**Checklist**:
- [ ] Commentaire clair et documenté
- [ ] Mentionne Phase 1 migration
- [ ] Référence Story document

**5. Vérifier compilation TypeScript**

```bash
# Après checkout de la branche
pnpm exec tsc --noEmit playwright.config.ts
# Doit passer sans erreur
```

- [ ] TypeScript compile sans erreur

**6. Vérifier tests existants**

```bash
# Exécuter un test simple
pnpm test:e2e --project=chromium tests/compression.spec.ts || echo "⚠️ À vérifier"
```

- [ ] Tests passent (ou raison connue si échec)

#### Critères d'Approbation

✅ **APPROVE** si:
- Code mort supprimé
- Commentaires clairs
- TypeScript compile
- Tests non cassés

🚨 **REQUEST CHANGES** si:
- Fonctionnalité cassée (tests échouent)
- Suppression trop agressive (configs nécessaires)
- Commentaires ambigus

---

### Commit 5: ADR 003 + CI Workflow

**Type**: 📝 docs
**Durée review**: 15min
**Priority**: Moyenne

#### Objectifs

- [ ] Vérifier que l'historique CI est bien archivé
- [ ] Confirmer que le workflow est simplifié
- [ ] Valider la syntaxe YAML

#### Actions

**1. Examiner le commit**

```bash
git show <commit-sha-commit-5>
```

Devrait montrer:
- **New**: `docs/decisions/003-e2e-ci-timeout-history.md`
- **Modified**: `.github/workflows/quality.yml`

**2. Lire ADR 003**

```bash
git show <commit-sha>:docs/decisions/003-e2e-ci-timeout-history.md | less
```

**Checklist ADR 003**:
- [ ] Titre clair ("Historique des Timeouts...")
- [ ] Statut "Résolu" avec date
- [ ] Contexte explique le problème (timeout >60s)
- [ ] Cause racine identifiée (cold start OpenNext)
- [ ] Résolution documentée (wrangler dev + 120s timeout)
- [ ] Références vers Story et ADR 002

**3. Examiner le diff du workflow**

```bash
git show <commit-sha> -- .github/workflows/quality.yml
```

**Avant** (~15 lignes de commentaires):
```yaml
# E2E Tests temporarily disabled due to timeout issues
# Root cause: Server fails to start...
# Investigation needed...
```

**Après** (~2 lignes):
```yaml
# E2E Tests temporarily disabled - See ADR 003 for history
# Will be reactivated in Phase 3
```

**Checklist workflow**:
- [ ] Commentaires longs supprimés
- [ ] Référence ADR 003 ajoutée
- [ ] Echo mis à jour avec chemin ADR
- [ ] Syntaxe YAML valide

**4. Valider YAML**

```bash
# Si yamllint installé
yamllint .github/workflows/quality.yml

# Ou vérifier manuellement l'indentation
cat .github/workflows/quality.yml | grep -A 5 "E2E Tests"
```

- [ ] YAML valide (pas d'erreur)

#### Critères d'Approbation

✅ **APPROVE** si:
- ADR 003 complet et clair
- Workflow simplifié
- YAML valide
- Historique préservé

🚨 **REQUEST CHANGES** si:
- ADR incomplet ou confus
- YAML invalide (indentation, syntaxe)
- Historique perdu (commentaires supprimés sans archivage)

---

### Commit 6: Scripts + CLAUDE.md

**Type**: 📝 docs
**Durée review**: 10min
**Priority**: Faible

#### Objectifs

- [ ] Vérifier que les scripts sont bien documentés
- [ ] Confirmer que CLAUDE.md est clair
- [ ] S'assurer que les informations sont exactes

#### Actions

**1. Examiner le commit**

```bash
git show <commit-sha-commit-6>
```

**2. Lire le header de dev-quiet.sh**

```bash
git show <commit-sha>:scripts/dev-quiet.sh | head -20
```

**Checklist**:
- [ ] Header de 13 lignes ajouté
- [ ] Explique l'usage (local dev, pas E2E)
- [ ] Note "E2E tests use pnpm preview"
- [ ] Référence CLAUDE.md

**3. Lire la section CLAUDE.md**

```bash
git show <commit-sha>:CLAUDE.md | grep -A 40 "Development Servers"
```

**Checklist**:
- [ ] Section "Development Servers" ajoutée (~30 lignes)
- [ ] Distingue clairement `pnpm dev` vs `pnpm preview`
- [ ] Explique les use cases de chaque serveur
- [ ] Mentionne workerd, D1, R2, etc.
- [ ] Référence Story document

**4. Vérifier l'exactitude**

- [ ] URL correctes (localhost:3000 pour dev, 127.0.0.1:8788 pour preview)
- [ ] Runtimes corrects (Node.js vs Cloudflare Workers)
- [ ] Pas de typos ou erreurs factuelles

#### Critères d'Approbation

✅ **APPROVE** si:
- Documentation claire et complète
- Informations exactes
- Distinction dev/preview bien expliquée

🚨 **REQUEST CHANGES** si:
- URLs incorrectes
- Confusion possible entre dev et preview
- Typos ou erreurs factuelles

---

## Critères d'Approbation

### Checklist Globale PR

Après review des 6 commits individuels:

#### Validation Technique

```bash
# 1. Checkout de la branche
git checkout phase-0/cleanup-and-preparation

# 2. Git status clean
git status | grep "working tree clean"

# 3. Build passe
pnpm build

# 4. Linter passe
pnpm lint

# 5. Tests unitaires passent
pnpm test

# 6. Nombre de commits
git log main..HEAD --oneline | wc -l  # Doit être 6
```

- [ ] Tous les checks techniques passent

#### Validation Contenu

- [ ] **Commit 1 (ADR 002)**: Décision architecturale claire et consensuelle
- [ ] **Commit 2 (Git cleanup)**: Fichiers corrects supprimés/ajoutés
- [ ] **Commit 3 (.gitignore)**: Patterns logs ajoutés
- [ ] **Commit 4 (playwright.config)**: Code mort supprimé sans casser tests
- [ ] **Commit 5 (ADR 003)**: Historique CI archivé, workflow simplifié
- [ ] **Commit 6 (Docs)**: Scripts et CLAUDE.md documentés

#### Validation Qualité

- [ ] **Messages de commit**: Tous utilisent Gitmoji et format cohérent
- [ ] **Historique Git**: Propre et linéaire (pas de merge commits)
- [ ] **Documentation**: Markdown valide, pas de liens cassés
- [ ] **Aucune régression**: Tests existants passent toujours

### Décision Finale

**✅ APPROVE et MERGE** si:
- ✅ Tous les commits validés individuellement
- ✅ Checklist globale complète
- ✅ Équipe alignée sur décisions (ADR 002)

**💬 COMMENT (demande modifications mineures)** si:
- Typos à corriger
- Commentaires à clarifier
- Améliorations suggestions (non-bloquantes)

**🚨 REQUEST CHANGES (bloquant)** si:
- Tests cassés
- Décision ADR 002 non consensuelle
- YAML invalide (CI)
- Fichiers importants supprimés par erreur

---

## Checklist Globale

### Reviewer Final Checklist

Avant d'approuver la PR, cocher:

#### Documentation

- [ ] 2 ADR créés (002, 003) et complets
- [ ] Workflow CI simplifié avec référence ADR
- [ ] Scripts documentés (dev-quiet.sh)
- [ ] CLAUDE.md mis à jour

#### Git et Fichiers

- [ ] Git status clean (pas de fichiers non commités)
- [ ] example.spec.ts supprimé
- [ ] compression.spec.ts et fixture ajoutés
- [ ] .gitignore contient patterns logs
- [ ] playwright.config.ts nettoyé (pas de dotenv)

#### Tests et Build

- [ ] `pnpm lint` passe
- [ ] `pnpm test` passe
- [ ] `pnpm build` passe
- [ ] TypeScript compile (`tsc --noEmit`)

#### Commits

- [ ] 6 commits présents
- [ ] Tous les commits suivent Gitmoji
- [ ] Messages clairs et référencent la Story
- [ ] Historique linéaire (pas de merge commits)

#### Alignement Équipe

- [ ] Décision ADR 002 validée par tech lead/architecte
- [ ] Aucune objection majeure de l'équipe
- [ ] Communication faite sur la décision architecturale

---

## Troubleshooting Review

### Problème: Tests cassés après Commit 4

**Symptôme**: `pnpm test:e2e` échoue

**Diagnostic**:
```bash
# Vérifier le diff de playwright.config.ts
git show <commit-4-sha> -- playwright.config.ts

# Identifier les changements suspects
```

**Solution**:
- Demander rollback du commit 4
- Ou proposer un fix commit
- Vérifier que Mobile Safari n'a pas été supprimé par erreur

### Problème: YAML invalide dans quality.yml

**Symptôme**: GitHub Actions ne démarre pas

**Diagnostic**:
```bash
yamllint .github/workflows/quality.yml
# Erreur: indentation incorrecte
```

**Solution**:
```bash
# Demander fix de l'indentation
# Ou proposer le bon YAML dans un commentaire
```

### Problème: Liens cassés dans ADR

**Symptôme**: Liens vers Story ou autres docs 404

**Diagnostic**:
```bash
# Vérifier les liens
grep -r "\[.*\](.*)" docs/decisions/002-e2e-local-wrangler-dev.md
```

**Solution**:
- Vérifier que les chemins sont relatifs corrects
- Proposer les bons chemins dans un commentaire

### Problème: Décision ADR 002 non consensuelle

**Symptôme**: Membre de l'équipe en désaccord

**Action**:
1. **Ne pas merger**
2. Escalader au tech lead ou architecte
3. Organiser une discussion d'équipe
4. Mettre la PR en "Draft" en attendant consensus

### Problème: Nombre de commits incorrect

**Symptôme**: 5 ou 7 commits au lieu de 6

**Diagnostic**:
```bash
git log main..HEAD --oneline
# Compter manuellement
```

**Solution**:
- Si <6: Demander les commits manquants
- Si >6: Vérifier si commits additionnels sont valides (fix commits OK)
- Demander rebase si historique pollué

---

## Commentaires Suggérés (Templates)

### Approval

```markdown
✅ **LGTM (Looks Good To Me)**

Phase 0 review completed. All commits validated:
- ADR 002 and 003 are clear and well-justified
- Git cleanup is correct
- No regressions detected (tests pass)
- Documentation is comprehensive

Approving for merge. Great work! 🚀
```

### Request Changes

```markdown
🚨 **Request Changes**

Issues found that need to be addressed before merge:

1. **Commit 4** (playwright.config.ts):
   - TypeScript compilation fails: `error TS2304: Cannot find name 'devices'`
   - Possible missing import after refactoring

2. **Commit 5** (quality.yml):
   - YAML indentation error at line 138
   - Suggestion: Use yamllint to validate

Please fix these issues and push corrections. Will re-review once fixed.
```

### Comment (Non-blocking)

```markdown
💬 **Comments (Non-blocking suggestions)**

Overall looks good! Few minor suggestions:

1. **ADR 002**: Consider adding a "Timeline" section for when this will be fully implemented
2. **CLAUDE.md**: Typo line 45: "excution" → "execution"

These are minor and can be fixed in a follow-up commit if preferred.

Approving as-is.
```

---

## Changelog

| Date | Version | Changement |
|------|---------|------------|
| 2025-01-19 | 1.0.0 | Création du guide de review Phase 0 |

---

**Review terminé? Consultez [../validation/VALIDATION_CHECKLIST.md](../validation/VALIDATION_CHECKLIST.md) pour validation finale! ✅**
