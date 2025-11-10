# Story 0.7 - Mettre en place CI/CD GitHub Actions

**Epic**: Epic 0 - Socle technique (V1)
**Status**: 🚧 IN PROGRESS (70%)
**Created**: 2025-11-10
**PRD Reference**: PRD.md line 634

---

## 📖 Story Overview

### Description

Mettre en place un pipeline CI/CD complet avec GitHub Actions couvrant les tests (Vitest + Playwright), le build OpenNext, les migrations D1, et le déploiement automatisé sur Cloudflare Workers.

### Objectives

- Établir un pipeline CI/CD automatisé qui garantit la qualité du code et facilite les déploiements
- Intégrer tous les outils de qualité (lint, format, tests, mutation testing, architecture validation)
- Automatiser les tests E2E avec Playwright pour validation complète du comportement
- Automatiser les migrations de base de données D1 lors des déploiements
- Déployer automatiquement sur Cloudflare Workers après validation

---

## 🎯 Acceptance Criteria

### CA1 - Pipeline de tests complet

✅ **COMPLETED**

Le pipeline exécute automatiquement :

- Vérification du formatage (Prettier)
- Linting (ESLint)
- Validation de l'architecture (dependency-cruiser)
- Tests unitaires et d'intégration (Vitest)
- Tests E2E (Playwright)
- Mutation testing (Stryker.js - conditionnel)
- Build Next.js avec OpenNext

**Evidence**: `.github/workflows/quality.yml` avec 5 jobs (standard-quality, e2e-tests, mutation-testing, build, ci-success)

### CA2 - Tests E2E avec Playwright

✅ **COMPLETED**

- Job dédié pour exécuter les tests Playwright
- Installation automatique des navigateurs
- Upload des rapports Playwright en artifacts
- Timeout de 30 minutes pour tests longs

**Evidence**: Job `e2e-tests` dans quality.yml (lines 108-144)

### CA3 - Build OpenNext vérifié

✅ **COMPLETED**

- Build Next.js avec OpenNext adapter
- Analyse de bundle automatique
- Artifacts de build uploadés pour inspection
- Vérification que le build est déployable

**Evidence**: Job `build` dans quality.yml (lines 216-253)

### CA4 - Migrations D1 automatisées

❌ **NOT STARTED**

- Migrations D1 exécutées automatiquement lors du déploiement
- Commande : `wrangler d1 migrations apply DB --remote`
- Exécution avant le déploiement du Worker
- Gestion des erreurs de migration

**Status**: Missing from current workflow

### CA5 - Déploiement Cloudflare Workers

❌ **NOT STARTED**

- Déploiement automatique après tests réussis et build
- Utilisation de `wrangler deploy`
- Secrets Cloudflare configurés (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)
- Workflow de déploiement séparé pour environnements (staging, production)

**Status**: No deployment workflow exists yet

### CA6 - Mutation testing conditionnel

✅ **COMPLETED**

- Mutation testing exécuté hebdomadairement (lundi 2h)
- Mutation testing sur PR si fichiers critiques changés (`app/admin/`, `src/lib/server/`)
- Scope réduit sur PR, complet sur schedule
- Commentaire automatique sur PR si échec

**Evidence**: Job `mutation-testing` avec conditions if (lines 148-212)

### CA7 - Permissions minimales (sécurité)

✅ **COMPLETED**

- Principe du moindre privilège appliqué
- Permissions explicites par workflow
- `contents: read`, `pull-requests: write`, `actions: read`, `checks: write`

**Evidence**: Permissions block dans quality.yml (lines 12-16)

### CA8 - Optimisations CI

✅ **COMPLETED**

- Cache pnpm pour accélérer les installations
- Concurrency groups pour annuler workflows obsolètes
- Timeouts par job pour éviter blocages
- Conditional execution (mutation testing)

**Evidence**: Cache pnpm (lines 76, 123, 175, 234), concurrency (lines 18-20), timeouts

---

## 💡 User Value

### For Developers

- **Confidence**: Chaque changement est validé automatiquement avant merge
- **Feedback rapide**: Détection précoce des régressions et problèmes de qualité
- **Déploiements sûrs**: Migrations et déploiements automatisés réduisent les erreurs humaines
- **Documentation vivante**: Le pipeline sert de référence pour les standards de qualité

### For Project Maintainers

- **Qualité garantie**: Standards de code appliqués systématiquement
- **Traçabilité**: Historique complet des builds et tests
- **Déploiements prévisibles**: Processus reproductible et documenté
- **Moins de charge mentale**: Automation réduit le risque d'oubli d'étapes critiques

### For End Users (Indirect)

- **Fiabilité**: Bugs détectés avant production
- **Performance**: Build analysis prévient la dégradation
- **Disponibilité**: Déploiements automatisés réduisent le downtime

---

## 🔧 Technical Requirements

### Technologies

- **CI Platform**: GitHub Actions
- **Test Runners**: Vitest (unit/integration), Playwright (E2E), Stryker.js (mutation)
- **Build Tool**: OpenNext adapter for Cloudflare Workers
- **Deployment**: Wrangler CLI (Cloudflare)
- **Database Migrations**: Drizzle migrations via Wrangler D1 commands

### Infrastructure

- **Cloudflare Workers**: Target deployment platform
- **Cloudflare D1**: SQLite database requiring migrations
- **GitHub Secrets**: Required for deployment (API tokens, account ID)
- **Artifacts**: Test reports, coverage, build outputs

### Integration Points

1. **Existing Quality Workflow** (`quality.yml`):
   - Lint, format, tests, E2E, mutation testing, build
   - Triggers: PR, push to main/develop, weekly schedule

2. **Database Migration System**:
   - Migrations directory: `drizzle/migrations/`
   - Current migrations: 3 files (0000, 0001, 0002)
   - Seeds: categories, sample articles

3. **Wrangler Configuration**:
   - Config file: `wrangler.jsonc`
   - D1 binding: `DB` → `sebc-dev-db`
   - Database ID: `6615b6d8-2522-46dc-9051-bc0813b42240`
   - Migrations dir configured: `drizzle/migrations`

4. **OpenNext Build**:
   - Adapter: `@opennextjs/cloudflare`
   - Output: `.open-next/` directory
   - Worker entrypoint: `.open-next/worker.js`
   - Static assets: `.open-next/assets`

---

## 📦 Dependencies

### Depends On (Prerequisites)

- ✅ **Story 0.1**: Next.js 15 initialized (COMPLETED)
- ✅ **Story 0.2**: OpenNext adapter configured (COMPLETED)
- ✅ **Story 0.4**: Drizzle ORM + D1 configured with migrations (COMPLETED)
- 🚧 **Story 0.5**: Wrangler.toml bindings configured (20% - D1 only, need R2/KV/DO)
- ✅ **Story 0.10**: Tests & linting configured (COMPLETED)

### Blocks (What This Enables)

- **Story 0.8**: Cloudflare Access configuration (deployment needed to test)
- **Story 0.9**: Cloudflare WAF configuration (deployment needed to test)
- **Future Epics**: All subsequent features requiring deployments

### External Dependencies

- **GitHub Repository**: Configured with Actions enabled
- **Cloudflare Account**: For Workers deployment and D1 database
- **Cloudflare API Token**: Required secret for wrangler commands
- **Cloudflare Account ID**: Required for deployment

---

## 🎨 Technical Approach

### Current State (70% Complete)

**✅ What's Working**:

1. **Quality Pipeline** (`quality.yml`):
   - 5 jobs: detect-changes, standard-quality, e2e-tests, mutation-testing, build
   - Complete quality checks: format, lint, architecture, tests
   - E2E testing with Playwright (30min timeout)
   - Conditional mutation testing (weekly + critical files on PR)
   - Next.js build with OpenNext
   - Bundle analysis
   - Artifacts upload (coverage, E2E reports, mutation reports, build output)

2. **Optimizations**:
   - pnpm cache for faster installs
   - Concurrency groups to cancel obsolete runs
   - Minimal permissions (security)
   - Timeouts per job

**❌ What's Missing**:

1. **Database Migrations Step**:
   - Command: `wrangler d1 migrations apply DB --remote`
   - Needs: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID secrets
   - Must run before deployment
   - Error handling required

2. **Deployment Workflow**:
   - New workflow file: `.github/workflows/deploy.yml`
   - Triggers: Manual (workflow_dispatch), push to main after quality passes
   - Jobs: migrate-database, deploy-worker
   - Environment support: staging, production
   - Wrangler commands: migrations + deploy

### Proposed Implementation

#### Phase 1: Database Migrations Integration

Add migration step to deployment flow:

```yaml
migrate-database:
  name: Apply D1 Migrations
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v2
    - uses: actions/setup-node@v4
    - run: pnpm install --frozen-lockfile
    - name: Apply migrations
      run: npx wrangler d1 migrations apply DB --remote
      env:
        CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

#### Phase 2: Deployment Workflow

Create separate deployment workflow:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Workers

on:
  workflow_dispatch: # Manual trigger
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        type: choice
        options:
          - staging
          - production
  push:
    branches:
      - main # Auto-deploy production on main

jobs:
  deploy:
    needs: [migrate-database]
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment || 'production' }}
    steps:
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy
```

#### Phase 3: Environment Management

- GitHub Environments: staging, production
- Environment-specific secrets
- Manual approval gates for production
- Rollback procedures documented

#### Phase 4: Deployment Documentation

- Setup guide for secrets
- Deployment runbook
- Rollback procedures
- Monitoring and verification steps

---

## 🚨 Risks & Mitigation

### Risk 1: Migration Failures in Production 🔴 HIGH

**Description**: Database migration fails during deployment, leaving app in inconsistent state.

**Impact**: Application downtime, data corruption risk.

**Mitigation**:

- Test migrations locally first (`wrangler d1 execute --local`)
- Run migrations before deploying new code (separate job)
- Implement migration rollback procedures
- Use Cloudflare D1 Time Travel for recovery
- Add pre-migration database backup step

**Contingency**:

- Keep previous Worker version deployed
- Point-in-time recovery via D1 Time Travel
- Manual rollback of migrations if needed

### Risk 2: Secrets Configuration 🟡 MEDIUM

**Description**: Missing or incorrect Cloudflare secrets prevent deployment.

**Impact**: Deployment failures, CI pipeline blocked.

**Mitigation**:

- Document secret requirements clearly
- Validate secrets in test job before deployment
- Use separate secrets for staging/production
- Rotation procedures documented

**Contingency**:

- Manual deployment via local wrangler CLI
- Regenerate API tokens if compromised

### Risk 3: Build Artifact Size 🟡 MEDIUM

**Description**: Build artifacts are large, slowing down uploads/downloads.

**Impact**: Longer CI times, storage costs.

**Mitigation**:

- Analyze bundle regularly (`pnpm bundle:analyze`)
- Set artifact retention policies (5-14 days)
- Upload only necessary artifacts
- Use compression for large files

### Risk 4: Deployment Permissions 🟢 LOW

**Description**: GitHub Actions doesn't have proper Cloudflare permissions.

**Impact**: Deployment failures.

**Mitigation**:

- Use scoped API tokens (Workers Deploy permission only)
- Test deployment in staging first
- Document permission requirements
- Use minimal permissions principle

---

## 📊 Success Metrics

### Quality Metrics

- ✅ All quality checks pass on every PR
- ✅ Test coverage ≥ 70% (currently met)
- ✅ Mutation score ≥ 80% (Stryker.js configured)
- ✅ No ESLint errors
- ✅ No architecture violations

### Performance Metrics

- Pipeline execution time < 20 minutes (standard path)
- E2E tests complete in < 30 minutes
- Mutation testing < 45 minutes (when triggered)
- Build time < 5 minutes

### Deployment Metrics (To Achieve)

- Migration success rate: 100%
- Deployment success rate: ≥ 99%
- Rollback time: < 5 minutes
- Zero-downtime deployments

---

## 🔗 References

### Existing Files

- **Quality Workflow**: `.github/workflows/quality.yml` (273 lines)
- **Wrangler Config**: `wrangler.jsonc` (70 lines)
- **Migrations**: `drizzle/migrations/` (3 migration files)
- **Package Scripts**: `package.json` (quality:check, test commands)

### Documentation

- **PRD**: `docs/specs/PRD.md` (lines 625-638 for Epic 0)
- **Epic Tracking**: `docs/specs/epics/epic_0/EPIC_TRACKING.md`
- **Story 0.4 (Database)**: `docs/specs/epics/epic_0/story_0_4/`

### External References

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Wrangler D1 Commands**: https://developers.cloudflare.com/workers/wrangler/commands/#d1
- **Cloudflare Workers Deploy**: https://developers.cloudflare.com/workers/wrangler/commands/#deploy
- **OpenNext Cloudflare**: https://opennext.js.org/cloudflare

---

**Story Created**: 2025-11-10
**Created by**: Claude Code (story-phase-planner skill)
**Current Progress**: 70% (Quality pipeline complete, missing migrations + deployment)
