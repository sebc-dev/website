# Commit Checklist - Phase 0

**Phase**: Phase 0 - Nettoyage et Préparation
**Total Commits**: 6
**Durée Totale Estimée**: 2h20

---

## Comment Utiliser Cette Checklist

### Format

Chaque commit contient:
1. **Pré-requis**: Ce qui doit être fait AVANT de commencer
2. **Actions**: Étapes détaillées à suivre
3. **Validation**: Tests à exécuter AVANT le commit
4. **Commit**: Message exact à utiliser
5. **Post-commit**: Vérifications APRÈS le commit

### Workflow

```bash
# Pour chaque commit:
[ ] Lire la section "Pré-requis"
[ ] Exécuter les "Actions" étape par étape
[ ] Cocher chaque item ✅
[ ] Exécuter la "Validation"
[ ] Si validation OK → Faire le "Commit"
[ ] Exécuter "Post-commit"
[ ] Passer au commit suivant
```

### Conventions

- ✅ Action complétée
- ⚠️ Attention particulière requise
- 🔍 Vérification critique
- 💡 Astuce ou note

---

## Commit 1: Résolution Conflit Architectural (ADR 002)

**Type**: 📝 docs
**Durée estimée**: 30min
**Priority**: P0 (BLOQUANT)

### Pré-requis

- [ ] Lire [../STORY_E2E_CLOUDFLARE_REFACTOR.md](../STORY_E2E_CLOUDFLARE_REFACTOR.md) section 1.2
- [ ] Lire `/docs/decisions/001-e2e-tests-preview-deployments.md` (ADR existant)
- [ ] Comprendre les deux approches:
  - **Option A**: Preview Deployments (ADR 001)
  - **Option B**: Wrangler Dev Local (Story)
- [ ] ⚠️ **DÉCISION REQUISE**: Choisir Option A ou B (recommandation: Option B)

💡 **Note**: Cette décision débloque toutes les phases suivantes. Prendre le temps nécessaire.

### Actions

#### 1. Créer le fichier ADR 002

```bash
# Créer le fichier
touch docs/decisions/002-e2e-local-wrangler-dev.md
```

- [ ] Fichier créé

#### 2. Rédiger le contenu ADR 002

Copier le template suivant dans le fichier:

```markdown
# ADR 002: Tests E2E Locaux avec Wrangler Dev

## Statut
Accepté

## Date
2025-01-19

## Contexte

Le projet nécessite une stratégie de tests E2E pour valider le comportement
de l'application Next.js sur le runtime Cloudflare Workers.

Deux approches ont été évaluées:

### Option A: Preview Deployments (ADR 001)
- Tests exécutés contre des déploiements Cloudflare réels (preview URLs)
- Environnement 100% identique à la production
- Standard de l'industrie (Vercel, Netlify)

### Option B: Wrangler Dev Local (Story Document)
- Tests exécutés contre `wrangler dev` localement en CI
- Simulation du runtime Cloudflare Workers avec `workerd`
- URL de test: `http://127.0.0.1:8788`

## Décision

Nous adoptons **Option B: Wrangler Dev Local** pour les tests E2E.

## Rationale

### Avantages de l'Option B

1. **Performance**: Build + start wrangler (~60-90s) vs déploiement cloud (~5-10min)
2. **Coût**: Aucune consommation de quota Cloudflare pour les tests
3. **Debugging**: Logs directs et stdout/stderr accessibles immédiatement
4. **Contrôle**: Configuration locale complète (D1, R2, DO, variables)
5. **Itération**: Pas de cleanup de preview deployments à gérer
6. **Offline**: Tests possibles sans connexion internet stable

### Fidélité du Runtime

Le runtime `workerd` (utilisé par `wrangler dev`) est le **même** que
celui utilisé en production Cloudflare Workers. Il détecte donc:
- ✅ Bugs spécifiques au Edge runtime
- ✅ Limitations I/O (pas de `fs`, `child_process`)
- ✅ API manquantes ou contraintes mémoire
- ✅ Comportement des bindings (D1, R2, DO)

### Limites Acceptées

- ❌ Latence réseau réelle non simulée (non critique pour tests fonctionnels)
- ❌ Infrastructure Cloudflare globale non testée (Anycast, etc.)

**Mitigation**: Possibilité d'ajouter des tests de smoke sur preview
deployments APRÈS stabilisation des tests locaux (Phase future).

## Conséquences

### Implémentation (Phases 1-4)

- Modification de `playwright.config.ts` (baseURL: `http://127.0.0.1:8788`)
- Modification de `package.json` (script `preview` avec `--ip 127.0.0.1`)
- Création de `tests/global-setup.ts` (seeding D1)
- Réactivation du job `e2e-tests` dans `.github/workflows/quality.yml`

### Documentation

- ADR 001 archivé (pas supprimé) pour référence historique
- Story Document devient la spec de référence
- CLAUDE.md mis à jour avec différence dev/preview

### Évolution Future

Si l'Option B s'avère insuffisante (non anticipé), nous pouvons:
1. Ajouter des tests de smoke en preview (complémentaires)
2. Migrer complètement vers ADR 001 (rollback possible)

## Alternatives Considérées

### Option A: Preview Deployments (Rejetée)

**Avantages**:
- ✅ Environnement 100% identique à production
- ✅ Tests l'infrastructure Cloudflare complète
- ✅ Standard de l'industrie

**Inconvénients**:
- ❌ Quota Cloudflare requis (coût potentiel)
- ❌ Temps de déploiement élevé (5-10min)
- ❌ Gestion cleanup complexe (preview URLs persistantes)
- ❌ Debugging difficile (logs sur dashboard cloud)
- ❌ Dépendance connexion internet stable

**Décision**: Rejetée pour les raisons de performance et coût.

## Références

- `/docs/decisions/001-e2e-tests-preview-deployments.md` (archivé)
- `/docs/specs/epics/epic_1/refactoring_e2e/STORY_E2E_CLOUDFLARE_REFACTOR.md`
- `/docs/guide_cloudflare_playwright.md` (guide de référence)
- [Cloudflare Workers Runtime](https://developers.cloudflare.com/workers/runtime-apis/)
- [Wrangler Dev Docs](https://developers.cloudflare.com/workers/wrangler/commands/#dev)

## Auteurs

- [Votre nom] (implémenteur)
- [Tech Lead] (revieweur)
- Claude Code (assistant AI)

## Changelog

- 2025-01-19: ADR créé et accepté
```

- [ ] Contenu copié et adapté (remplacer [Votre nom], ajuster la date)

#### 3. Optionnel: Marquer ADR 001 comme archivé

Si ADR 001 existe, ajouter en tête:

```bash
# Ouvrir ADR 001
vim docs/decisions/001-e2e-tests-preview-deployments.md

# Modifier le statut:
## Statut
Archivé (2025-01-19) - Remplacé par ADR 002
```

- [ ] ADR 001 marqué archivé (si existe)

### Validation

Exécuter ces checks AVANT le commit:

```bash
# 1. Le fichier existe
test -f docs/decisions/002-e2e-local-wrangler-dev.md && echo "✅ Fichier existe" || echo "❌ Fichier manquant"

# 2. Contient les sections requises
grep -q "## Statut" docs/decisions/002-e2e-local-wrangler-dev.md && echo "✅ Section Statut" || echo "❌ Manque Statut"
grep -q "## Décision" docs/decisions/002-e2e-local-wrangler-dev.md && echo "✅ Section Décision" || echo "❌ Manque Décision"
grep -q "## Rationale" docs/decisions/002-e2e-local-wrangler-dev.md && echo "✅ Section Rationale" || echo "❌ Manque Rationale"

# 3. Mentionne "wrangler dev"
grep -q "wrangler dev" docs/decisions/002-e2e-local-wrangler-dev.md && echo "✅ Mentionne wrangler" || echo "❌ Pas de wrangler"

# 4. Git status montre 1 fichier nouveau
git status --short | grep "?? docs/decisions/002-e2e-local-wrangler-dev.md" && echo "✅ Fichier non tracké" || echo "❌ Fichier déjà tracké?"
```

- [ ] ✅ Tous les checks passent

### Commit

```bash
# Ajouter le fichier
git add docs/decisions/002-e2e-local-wrangler-dev.md

# Si ADR 001 modifié:
git add docs/decisions/001-e2e-tests-preview-deployments.md

# Commiter avec message complet
git commit -m "📝 docs(e2e): add ADR 002 for local wrangler dev architecture

Resolve architectural conflict between ADR 001 (preview deployments)
and Story document (wrangler dev local).

Decision: Use wrangler dev locally in CI for faster iteration,
debugging, and no Cloudflare quota dependency.

Rationale:
- Performance: 60-90s vs 5-10min deployment
- Cost: No quota consumption
- Debugging: Direct logs and stdout/stderr
- Control: Full local configuration
- workerd runtime is identical to production

ADR 001 archived for reference. Story phases 1-4 can now proceed.

Related: STORY_E2E_CLOUDFLARE_REFACTOR.md Phase 0.1

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

- [ ] Commit exécuté sans erreur

### Post-commit

```bash
# Vérifier le commit
git log -1 --oneline

# Vérifier le contenu du commit
git show HEAD

# Confirmer que le fichier est dans l'historique
git ls-files | grep "002-e2e-local-wrangler-dev.md"
```

- [ ] Commit visible dans `git log`
- [ ] Fichier présent dans `git ls-files`

💡 **Next**: Passer au Commit 2

---

## Commit 2: Nettoyage Git (Suppression + Tracking)

**Type**: 🗑️ remove + ✅ test
**Durée estimée**: 20min
**Priority**: P0

### Pré-requis

- [ ] Commit 1 complété et vérifié
- [ ] Lire [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) section "Commit 2"
- [ ] Comprendre les fichiers concernés:
  - `tests/example.spec.ts` (à supprimer)
  - `tests/compression.spec.ts` (à tracker)
  - `tests/fixtures/compression.ts` (à tracker)
  - `test-output.log` (à supprimer)

### Actions

#### 1. Vérifier l'état actuel

```bash
# Voir les fichiers non commités
git status
```

Vous devriez voir:
- `tests/example.spec.ts` (deleted, non commité)
- `tests/compression.spec.ts` (untracked)
- `tests/fixtures/compression.ts` (untracked)
- `test-output.log` (untracked, si présent)

- [ ] État Git vérifié

#### 2. Commiter la suppression de example.spec.ts

```bash
# Ajouter le fichier deleted
git add tests/example.spec.ts
```

- [ ] `example.spec.ts` staged (deleted)

#### 3. Tracker les nouveaux tests

```bash
# Ajouter les nouveaux fichiers
git add tests/compression.spec.ts
git add tests/fixtures/compression.ts
```

- [ ] `compression.spec.ts` staged (new file)
- [ ] `compression.ts` staged (new file)

#### 4. Supprimer le fichier temporaire

```bash
# Vérifier qu'il existe
test -f test-output.log && echo "Fichier existe" || echo "Fichier absent"

# Supprimer si présent
rm -f test-output.log
```

- [ ] `test-output.log` supprimé (ou absent)

### Validation

```bash
# 1. example.spec.ts n'existe plus
! test -f tests/example.spec.ts && echo "✅ example.spec supprimé" || echo "❌ Fichier encore présent"

# 2. compression.spec.ts existe
test -f tests/compression.spec.ts && echo "✅ compression.spec existe" || echo "❌ Fichier manquant"

# 3. fixtures/compression.ts existe
test -f tests/fixtures/compression.ts && echo "✅ fixture existe" || echo "❌ Fixture manquant"

# 4. test-output.log n'existe plus
! test -f test-output.log && echo "✅ Log supprimé" || echo "❌ Log encore présent"

# 5. Git status montre 3 fichiers staged
git status --short | grep -E "^D.*example\.spec\.ts" && echo "✅ example deleted"
git status --short | grep -E "^A.*compression\.spec\.ts" && echo "✅ compression added"
git status --short | grep -E "^A.*compression\.ts" && echo "✅ fixture added"

# 6. Aucun fichier untracked (sauf intentionnel)
git ls-files --others --exclude-standard | wc -l  # Devrait être 0 ou très faible
```

- [ ] ✅ Tous les checks passent

### Commit

```bash
git commit -m "🗑️ remove(test): delete Playwright example template

✅ test: add compression E2E tests and fixtures

Remove Playwright default example.spec.ts template (no project value).
Add functional compression tests validating Brotli/Gzip on Cloudflare.

Files changed:
- tests/example.spec.ts (deleted)
- tests/compression.spec.ts (new, ~80 lines)
- tests/fixtures/compression.ts (new, ~30 lines)

Also removed temporary test-output.log file from root.

Tests validate:
- Brotli compression for text/html
- Gzip compression fallback
- Content-Encoding headers
- Decompression correctness

Related: STORY_E2E_CLOUDFLARE_REFACTOR.md Phase 0.2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

- [ ] Commit exécuté sans erreur

### Post-commit

```bash
# Vérifier le commit
git log -1 --stat

# Confirmer les fichiers dans l'historique
git ls-files | grep "compression.spec.ts"
git ls-files | grep "fixtures/compression.ts"
! git ls-files | grep "example.spec.ts"  # Ne doit rien retourner
```

- [ ] Commit visible avec stat correct
- [ ] Fichiers compression trackés
- [ ] example.spec n'est plus tracké

💡 **Next**: Passer au Commit 3

---

## Commit 3: Mise à Jour .gitignore (Patterns Logs)

**Type**: 🔧 config
**Durée estimée**: 10min
**Priority**: P1

### Pré-requis

- [ ] Commits 1-2 complétés
- [ ] Comprendre pourquoi on ignore les logs de test

### Actions

#### 1. Ouvrir .gitignore

```bash
# Ouvrir avec votre éditeur préféré
vim .gitignore
# ou
code .gitignore
```

- [ ] Fichier ouvert

#### 2. Localiser la section Playwright

Chercher une section ressemblant à:

```gitignore
# Playwright
test-results/
playwright-report/
playwright/.cache/
```

- [ ] Section Playwright localisée

#### 3. Ajouter les patterns de logs

Après la section Playwright, ajouter:

```gitignore
# Test logs
test-output.log
playwright-output.log
*.test.log
e2e-*.log
```

- [ ] Patterns ajoutés après section Playwright

#### 4. Sauvegarder et fermer

- [ ] Fichier sauvegardé

### Validation

```bash
# 1. Les patterns sont présents
grep -q "test-output.log" .gitignore && echo "✅ test-output.log"
grep -q "*.test.log" .gitignore && echo "✅ *.test.log pattern"

# 2. Tester qu'un log serait ignoré
touch test-example.test.log
git status --ignored | grep "test-example.test.log" && echo "✅ Log ignoré" || echo "❌ Log pas ignoré"
rm test-example.test.log

# 3. Git status montre 1 fichier modifié
git status --short | grep "M .gitignore" && echo "✅ .gitignore modifié"
```

- [ ] ✅ Tous les checks passent

### Commit

```bash
git add .gitignore

git commit -m "🔧 config(git): add test log patterns to .gitignore

Prevent temporary E2E test log files from appearing in git status.

Patterns added:
- test-output.log (root level logs)
- playwright-output.log (Playwright specific)
- *.test.log (any test logs)
- e2e-*.log (E2E specific logs)

Avoids pollution of git status after test runs, particularly when
using 'pnpm test:e2e 2>&1 | tee test-output.log' for debugging.

Related: STORY_E2E_CLOUDFLARE_REFACTOR.md Phase 0.2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

- [ ] Commit exécuté

### Post-commit

```bash
# Vérifier le commit
git log -1 --oneline

# Confirmer les patterns dans .gitignore
grep "test-output.log" .gitignore
```

- [ ] Commit vérifié
- [ ] Patterns présents

💡 **Next**: Passer au Commit 4

---

## Commit 4: Nettoyage playwright.config.ts

**Type**: ♻️ refactor
**Durée estimée**: 30min
**Priority**: P1

### Pré-requis

- [ ] Commits 1-3 complétés
- [ ] Lire `playwright.config.ts` actuel en entier
- [ ] ⚠️ **DÉCISION REQUISE**: Que faire des configs mobiles commentées?
  - **Option A**: Supprimer (recommandé si jamais utilisées)
  - **Option B**: Archiver dans ADR 004
  - **Option C**: Laisser commentées mais documenter

💡 **Recommandation**: Option A (supprimer) si `git log -p playwright.config.ts | grep "Mobile"` montre qu'elles n'ont jamais été activées.

### Actions

#### 1. Examiner l'historique des configs mobiles (Décision)

```bash
# Voir l'historique
git log -p playwright.config.ts | grep -A 10 "Mobile Chrome"
```

Si jamais activées → **Décision**: Supprimer

- [ ] Historique examiné
- [ ] Décision prise: [ ] Supprimer [ ] Archiver [ ] Laisser

#### 2. Ouvrir playwright.config.ts

```bash
vim playwright.config.ts
# ou
code playwright.config.ts
```

- [ ] Fichier ouvert

#### 3. Supprimer les imports dotenv commentés

**Lignes à supprimer** (~7-9):

```typescript
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });
```

- [ ] Imports dotenv supprimés (3 lignes)

#### 4. Gérer les configs mobiles commentées

**Si décision = Supprimer**:

Supprimer les lignes suivantes (~54-71):

```typescript
// {
//   name: 'Mobile Chrome',
//   use: { ...devices['Pixel 5'] },
// },
// {
//   name: 'Mobile Safari',
//   use: { ...devices['iPhone 12'] },
// },
```

- [ ] Configs mobiles commentées supprimées

**Si décision = Archiver**:

Créer `docs/decisions/004-mobile-test-configs-archived.md` et y déplacer l'explication, puis supprimer les lignes commentées.

- [ ] ADR 004 créé (si applicable)
- [ ] Configs supprimées

#### 5. Mettre à jour le commentaire du webServer

**Remplacer** le commentaire actuel (~74-82) par:

```typescript
  /**
   * Development server configuration
   * - Local dev: uses `pnpm dev` (next dev with Turbopack)
   * - E2E Tests (Phase 1+): will use `pnpm preview` (wrangler dev)
   *
   * Current config uses Node.js dev server (localhost:3000).
   * Phase 1 will migrate to Cloudflare Workers runtime (127.0.0.1:8788).
   *
   * See: /docs/specs/epics/epic_1/refactoring_e2e/STORY_E2E_CLOUDFLARE_REFACTOR.md
   */
  webServer: {
```

- [ ] Commentaire mis à jour

#### 6. Sauvegarder le fichier

- [ ] Fichier sauvegardé

### Validation

```bash
# 1. Aucun import dotenv
! grep -q "dotenv" playwright.config.ts && echo "✅ Pas de dotenv" || echo "❌ dotenv encore présent"

# 2. Aucune config mobile commentée (si supprimer)
! grep -q "Mobile Chrome" playwright.config.ts && echo "✅ Configs mobiles supprimées" || echo "⚠️ Vérifier décision"

# 3. Nouveau commentaire présent
grep -q "Phase 1 will migrate" playwright.config.ts && echo "✅ Commentaire mis à jour"

# 4. Le fichier compile toujours
pnpm exec tsc --noEmit playwright.config.ts && echo "✅ TypeScript OK"

# 5. Git status montre 1 fichier modifié
git status --short | grep "M playwright.config.ts"
```

- [ ] ✅ Tous les checks passent

### Commit

```bash
git add playwright.config.ts

# Si ADR 004 créé:
git add docs/decisions/004-mobile-test-configs-archived.md

git commit -m "♻️ refactor(test): clean up playwright.config.ts

Remove dead code and obsolete comments:
- Delete commented dotenv imports (never used)
- Remove unused mobile device configs (Mobile Chrome, Pixel 5)
- Update webServer configuration comments for clarity

Mobile Safari remains active in projects array.
Configuration now ready for Phase 1 migration to wrangler dev.

Changes:
- Lines deleted: ~15 (dotenv imports + mobile configs)
- Comments updated: webServer section
- No functional changes

Validation:
- TypeScript compiles without errors
- Existing tests unaffected

Related: STORY_E2E_CLOUDFLARE_REFACTOR.md Phase 0.3

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

- [ ] Commit exécuté

### Post-commit

```bash
# Vérifier le commit
git show HEAD

# Confirmer que dotenv n'est plus là
! git grep "dotenv" HEAD:playwright.config.ts

# Vérifier que les tests passent toujours (si possible localement)
pnpm test:e2e --project=chromium tests/compression.spec.ts || echo "⚠️ Tests à vérifier"
```

- [ ] Commit vérifié
- [ ] Code clean confirmé

💡 **Next**: Passer au Commit 5

---

## Commit 5: Archivage Commentaires CI (ADR 003)

**Type**: 📝 docs
**Durée estimée**: 30min
**Priority**: P1

### Pré-requis

- [ ] Commits 1-4 complétés
- [ ] Lire `.github/workflows/quality.yml` section E2E (lignes ~134-148)

### Actions

#### 1. Créer le fichier ADR 003

```bash
touch docs/decisions/003-e2e-ci-timeout-history.md
```

- [ ] Fichier créé

#### 2. Rédiger le contenu ADR 003

Copier le template depuis [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) section "Commit 5" ou utiliser:

```markdown
# ADR 003: Historique des Timeouts Tests E2E en CI

## Statut
Résolu (2025-01-19)

## Contexte (Décembre 2024 - Janvier 2025)

Les tests E2E Playwright ont été désactivés en CI depuis plusieurs semaines
en raison de timeouts persistants lors du démarrage du serveur.

[... copier le contenu complet depuis IMPLEMENTATION_PLAN.md ...]
```

- [ ] Contenu ADR 003 rédigé (~100 lines)

#### 3. Ouvrir .github/workflows/quality.yml

```bash
vim .github/workflows/quality.yml
# ou
code .github/workflows/quality.yml
```

- [ ] Fichier ouvert

#### 4. Localiser la section E2E Tests

Chercher autour des lignes 134-148:

```yaml
# E2E Tests temporarily disabled due to timeout issues
# Root cause: Server fails to start within timeout...
```

- [ ] Section localisée

#### 5. Remplacer les commentaires longs

**Avant** (~15 lignes de commentaires):
```yaml
# E2E Tests temporarily disabled due to timeout issues
# Root cause: Server fails to start within timeout in CI environment
# next dev with OpenNext Cloudflare takes >60s to initialize on GitHub Actions runners
# Investigation needed: Consider using production build or increasing timeout
# Tracked in: /docs/specs/epics/epic_1/refactoring_e2e/STORY_E2E_CLOUDFLARE_REFACTOR.md
```

**Après** (2 lignes):
```yaml
# E2E Tests temporarily disabled - See ADR 003 for history and resolution plan
# Will be reactivated in Phase 3 (Intégration CI)
```

- [ ] Commentaires remplacés
- [ ] Référence ADR 003 ajoutée

#### 6. Mettre à jour le echo du step

**Avant**:
```yaml
run: echo "⚠️ E2E tests disabled - investigating timeout issues"
```

**Après**:
```yaml
run: echo "⚠️ E2E tests disabled - See /docs/decisions/003-e2e-ci-timeout-history.md"
```

- [ ] Echo mis à jour

#### 7. Sauvegarder les fichiers

- [ ] ADR 003 sauvegardé
- [ ] quality.yml sauvegardé

### Validation

```bash
# 1. ADR 003 existe et est bien formé
test -f docs/decisions/003-e2e-ci-timeout-history.md && echo "✅ ADR existe"
grep -q "Timeouts Tests E2E" docs/decisions/003-e2e-ci-timeout-history.md && echo "✅ Titre correct"

# 2. Workflow référence ADR 003
grep -q "ADR 003" .github/workflows/quality.yml && echo "✅ Référence ADR"

# 3. Anciens commentaires supprimés
! grep -q "Investigation needed" .github/workflows/quality.yml && echo "✅ Vieux commentaires supprimés"

# 4. YAML valide
yamllint .github/workflows/quality.yml && echo "✅ YAML valide" || echo "⚠️ Installer yamllint ou vérifier syntaxe"

# 5. Git status montre 2 fichiers
git status --short | grep "?? docs/decisions/003"
git status --short | grep "M .github/workflows/quality.yml"
```

- [ ] ✅ Tous les checks passent

### Commit

```bash
git add docs/decisions/003-e2e-ci-timeout-history.md
git add .github/workflows/quality.yml

git commit -m "📝 docs(ci): archive E2E timeout history in ADR 003

Move long inline comments from quality.yml to dedicated ADR for clarity.

Created:
- docs/decisions/003-e2e-ci-timeout-history.md (~100 lines)
  → Complete history of E2E timeout issues since Dec 2024
  → Root cause analysis (cold start >60s)
  → Resolution plan (wrangler dev + 120s timeout in Phase 1-3)

Modified:
- .github/workflows/quality.yml
  → Replaced 15 lines of inline documentation with ADR reference
  → Simplified comments for better readability

Workflow now cleaner, full context preserved in ADR.
Will be resolved by Phase 3 implementation.

Related: STORY_E2E_CLOUDFLARE_REFACTOR.md Phase 0.4

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

- [ ] Commit exécuté

### Post-commit

```bash
# Vérifier le commit
git log -1 --stat

# Confirmer l'ADR
cat docs/decisions/003-e2e-ci-timeout-history.md | head -20
```

- [ ] Commit vérifié
- [ ] ADR accessible

💡 **Next**: Passer au Commit 6 (dernier!)

---

## Commit 6: Documentation Scripts et Workflow

**Type**: 📝 docs
**Durée estimée**: 20min
**Priority**: P1

### Pré-requis

- [ ] Commits 1-5 complétés
- [ ] Lire `scripts/dev-quiet.sh`
- [ ] Lire `CLAUDE.md` section "Development"

### Actions

#### 1. Ouvrir scripts/dev-quiet.sh

```bash
vim scripts/dev-quiet.sh
# ou
code scripts/dev-quiet.sh
```

- [ ] Fichier ouvert

#### 2. Ajouter un header de documentation

**Avant** (ligne 1):
```bash
#!/bin/bash
```

**Après**:
```bash
#!/bin/bash
# ============================================================================
# Script: Local Development Server (Next.js with Turbopack)
# ============================================================================
# Usage: pnpm dev
#
# Description:
#   Starts Next.js development server with hot-reload and Turbopack.
#   Filters Durable Objects warnings for cleaner console output.
#
# IMPORTANT:
#   E2E tests use 'pnpm preview' (wrangler dev), NOT this script.
#   This script is ONLY for local development with hot-reload.
#
# See: CLAUDE.md section "Development Servers" for details.
# ============================================================================
```

- [ ] Header ajouté (13 lignes)

#### 3. Sauvegarder dev-quiet.sh

- [ ] Fichier sauvegardé

#### 4. Ouvrir CLAUDE.md

```bash
vim CLAUDE.md
# ou
code CLAUDE.md
```

- [ ] Fichier ouvert

#### 5. Localiser la section "Development"

Chercher:
```markdown
### Development

- `pnpm dev` - Start Next.js dev server with Turbopack...
```

- [ ] Section localisée

#### 6. Ajouter la sous-section "Development Servers"

**Après** la ligne `- pnpm dev ...`, ajouter:

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
- **Script**: Direct wrangler execution (as of Phase 1)
- **URL**: http://127.0.0.1:8788 (IPv4 forced)
- **Use case**: E2E tests, Playwright, production-like environment simulation
- **Features**: D1 bindings, R2 cache, Durable Objects, Edge APIs

**Important**: After Phase 1 implementation, E2E tests will ONLY work with `pnpm preview`.
Using `pnpm dev` for tests will fail due to missing Cloudflare runtime features
(D1 database, R2 cache, Durable Objects, etc.).

**When to use which:**
- Development/debugging → `pnpm dev` (faster, hot-reload)
- E2E tests/validation → `pnpm preview` (production-like)
- Manual testing against Workers → `pnpm preview`

See: `/docs/specs/epics/epic_1/refactoring_e2e/STORY_E2E_CLOUDFLARE_REFACTOR.md`
```

- [ ] Section "Development Servers" ajoutée (~30 lignes)

#### 7. Sauvegarder CLAUDE.md

- [ ] Fichier sauvegardé

### Validation

```bash
# 1. Header ajouté à dev-quiet.sh
head -15 scripts/dev-quiet.sh | grep -q "E2E tests use" && echo "✅ Header présent"

# 2. Section ajoutée à CLAUDE.md
grep -q "Development Servers" CLAUDE.md && echo "✅ Section ajoutée"
grep -q "pnpm preview" CLAUDE.md && echo "✅ Mentionne preview"
grep -q "workerd" CLAUDE.md && echo "✅ Mentionne workerd"

# 3. Git status montre 2 fichiers modifiés
git status --short | grep "M scripts/dev-quiet.sh"
git status --short | grep "M CLAUDE.md"
```

- [ ] ✅ Tous les checks passent

### Commit

```bash
git add scripts/dev-quiet.sh
git add CLAUDE.md

git commit -m "📝 docs(scripts): clarify dev vs preview server usage

Add clear documentation to distinguish between development servers.

scripts/dev-quiet.sh:
- Add comprehensive header comments (13 lines)
- Explain script purpose (local dev with hot-reload)
- Note that E2E tests use 'pnpm preview', not this script
- Reference CLAUDE.md for detailed information

CLAUDE.md:
- Add \"Development Servers\" section (~30 lines)
- Document 'pnpm dev' (Node.js, hot-reload, localhost:3000)
- Document 'pnpm preview' (Cloudflare Workers, E2E, 127.0.0.1:8788)
- Explain runtime differences and use cases
- Clarify when to use which server

Prevents confusion during:
- Onboarding (new developers understand the distinction)
- Debugging (choosing the right environment)
- E2E test troubleshooting (Phase 1+)

Related: STORY_E2E_CLOUDFLARE_REFACTOR.md Phase 0.5

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

- [ ] Commit exécuté

### Post-commit

```bash
# Vérifier le commit
git log -1 --stat

# Lire le header du script
head -20 scripts/dev-quiet.sh

# Vérifier CLAUDE.md
grep -A 10 "Development Servers" CLAUDE.md
```

- [ ] Commit vérifié
- [ ] Documentation accessible

🎉 **TERMINÉ**: Phase 0 complète! 6 commits atomiques créés.

---

## Validation Finale Phase 0

Après les 6 commits, exécuter cette checklist complète:

### Checklist Globale

```bash
#!/bin/bash
echo "=== Validation Finale Phase 0 ==="

# 1. ADR 002 existe
if test -f docs/decisions/002-e2e-local-wrangler-dev.md; then
  echo "✅ ADR 002 créé"
else
  echo "❌ ADR 002 manquant"
fi

# 2. Git status clean
if git status | grep -q "working tree clean"; then
  echo "✅ Git status clean"
else
  echo "❌ Fichiers non commités détectés"
  git status --short
fi

# 3. .gitignore contient les patterns
if grep -q "test-output.log" .gitignore; then
  echo "✅ .gitignore mis à jour"
else
  echo "❌ .gitignore incomplet"
fi

# 4. playwright.config.ts sans dotenv
if ! grep -q "dotenv" playwright.config.ts; then
  echo "✅ playwright.config.ts nettoyé"
else
  echo "❌ dotenv encore présent"
fi

# 5. ADR 003 existe
if test -f docs/decisions/003-e2e-ci-timeout-history.md; then
  echo "✅ ADR 003 créé"
else
  echo "❌ ADR 003 manquant"
fi

# 6. Scripts documentés
if grep -q "E2E tests use" scripts/dev-quiet.sh; then
  echo "✅ Script dev-quiet.sh documenté"
else
  echo "❌ Script non documenté"
fi

# 7. CLAUDE.md mis à jour
if grep -q "Development Servers" CLAUDE.md; then
  echo "✅ CLAUDE.md mis à jour"
else
  echo "❌ CLAUDE.md non mis à jour"
fi

# 8. Nombre de commits
COMMIT_COUNT=$(git log main..HEAD --oneline | wc -l)
if [ "$COMMIT_COUNT" -eq 6 ]; then
  echo "✅ 6 commits créés"
else
  echo "⚠️ $COMMIT_COUNT commits détectés (attendu: 6)"
fi

# 9. Tests unitaires passent
if pnpm test 2>/dev/null; then
  echo "✅ Tests unitaires OK"
else
  echo "⚠️ Tests unitaires à vérifier"
fi

# 10. Linter passe
if pnpm lint 2>/dev/null; then
  echo "✅ Linter OK"
else
  echo "⚠️ Linter à vérifier"
fi

echo ""
echo "=== Fin Validation ==="
```

- [ ] Exécuter le script de validation
- [ ] ✅ Tous les checks passent (ou justifier les warnings)

### Prochaines Étapes

- [ ] Créer une Pull Request
- [ ] Demander review (voir [guides/REVIEW.md](./guides/REVIEW.md))
- [ ] Merger après approbation
- [ ] Communiquer à l'équipe (ADR 002)
- [ ] Planifier Phase 1

---

## Troubleshooting

### Problème: Commit échoue avec "nothing to commit"

**Cause**: Les fichiers ne sont pas stagés correctement.

**Solution**:
```bash
git status  # Vérifier l'état
git add <fichiers>  # Re-stager les fichiers
git commit ...
```

### Problème: "fatal: pathspec 'tests/example.spec.ts' did not match any files"

**Cause**: Le fichier a déjà été commité ou n'existe pas.

**Solution**:
```bash
git status | grep example.spec  # Vérifier l'état
# Si déjà commité, passer au commit suivant
```

### Problème: yamllint échoue sur quality.yml

**Cause**: Syntaxe YAML invalide après modification.

**Solution**:
```bash
# Installer yamllint si absent
pip install yamllint

# Vérifier la syntaxe
yamllint .github/workflows/quality.yml

# Corriger les erreurs (souvent indentation)
```

### Problème: Tests unitaires cassés après Commit 4

**Cause**: Modification involontaire de playwright.config.ts.

**Solution**:
```bash
# Vérifier le diff
git diff HEAD~1 playwright.config.ts

# Rollback si nécessaire
git revert HEAD
# Recommencer Commit 4 plus prudemment
```

---

## Résumé des Commits

| # | Type | Description | Files | Status |
|---|------|-------------|-------|--------|
| 1 | 📝 docs | ADR 002 (architecture wrangler dev) | 1 nouveau | [ ] |
| 2 | 🗑️ remove | Nettoyage Git (example + compression) | 3 modifiés | [ ] |
| 3 | 🔧 config | .gitignore (patterns logs) | 1 modifié | [ ] |
| 4 | ♻️ refactor | playwright.config.ts (dotenv, mobiles) | 1 modifié | [ ] |
| 5 | 📝 docs | ADR 003 + CI workflow | 2 modifiés | [ ] |
| 6 | 📝 docs | Scripts + CLAUDE.md | 2 modifiés | [ ] |

**Durée totale**: ~2h20
**Critère de succès**: Tous les commits complétés, validation finale ✅

---

**Bon courage! 🚀**
