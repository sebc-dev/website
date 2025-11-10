# Story 0.7 - Phases Implementation Plan

**Story**: Mettre en place CI/CD GitHub Actions
**Epic**: Epic 0 - Socle technique (V1)
**Created**: 2025-11-10
**Status**: 🚧 IN PROGRESS (70%)

---

## 📖 Story Overview

### Original Story Specification

**Location**: `docs/specs/epics/epic_0/story_0_7/story_0.7.md`

**Story Objective**

Établir un pipeline CI/CD complet avec GitHub Actions qui automatise la validation de la qualité du code, l'exécution des tests, le build OpenNext, les migrations de base de données D1, et le déploiement sur Cloudflare Workers. Ce pipeline garantit que chaque changement de code est validé automatiquement et que les déploiements sont sûrs, reproductibles, et sans intervention manuelle.

**Acceptance Criteria**:

- ✅ CA1: Pipeline de tests complet (lint, format, architecture, tests unitaires, E2E, mutation testing, build)
- ✅ CA2: Tests E2E avec Playwright automatisés
- ✅ CA3: Build OpenNext vérifié dans le pipeline
- ❌ CA4: Migrations D1 automatisées lors du déploiement
- ❌ CA5: Déploiement Cloudflare Workers automatisé après tests réussis
- ✅ CA6: Mutation testing conditionnel (hebdomadaire + PR sur fichiers critiques)
- ✅ CA7: Permissions minimales appliquées (sécurité)
- ✅ CA8: Optimisations CI (cache, concurrency, timeouts)

**Current Progress**: 70% complete

- ✅ Quality pipeline fully functional (`.github/workflows/quality.yml`)
- ✅ All test automation working (Vitest, Playwright, Stryker.js)
- ✅ Build verification with OpenNext
- ❌ Missing: Database migrations automation
- ❌ Missing: Deployment workflow

**User Value**

Pour les développeurs, ce pipeline offre une confiance totale dans les changements de code grâce à la validation automatique. Pour les mainteneurs, il garantit des déploiements sûrs et reproductibles sans intervention manuelle. Pour les utilisateurs finaux (indirectement), il assure la fiabilité et la disponibilité du service en détectant les bugs avant la production.

---

## 🎯 Phase Breakdown Strategy

### Why 4 Phases?

This story is decomposed into **4 atomic phases** based on:

✅ **Current completion state**: 70% of the work is already done (quality pipeline). The remaining 30% breaks down naturally into 4 distinct concerns.

✅ **Technical dependencies**: Migrations must work before deployment can succeed. Environment management extends deployment. Documentation is final.

✅ **Risk mitigation**: Isolating database migrations (Phase 1) reduces risk of data corruption. Separating deployment workflow (Phase 2) allows testing without affecting existing quality checks.

✅ **Incremental value**: Each phase delivers independently verifiable functionality that can be tested and validated separately.

✅ **Team capacity**: Phases sized for 1-2 days each, completing the story in ~5-6 days total.

✅ **Testing strategy**: Each phase has clear success criteria and can be validated independently before moving to the next.

### Atomic Phase Principles

Each phase follows these principles:

- **Independent**: Can be implemented and tested separately
- **Deliverable**: Produces tangible, working functionality
- **Sized appropriately**: 1-2 days of work per phase
- **Low coupling**: Minimal dependencies on other phases
- **High cohesion**: All work in phase serves single objective

### Implementation Approach

```
[Existing: Quality Pipeline 70%]
         ↓
[Phase 1: Migrations] → [Phase 2: Deployment] → [Phase 3: Environments] → [Phase 4: Docs]
         ↓                      ↓                        ↓                      ↓
     Database              Infrastructure           Configuration           Knowledge
```

**Strategy**:

1. **Build on existing foundation**: Quality pipeline (70%) provides solid base
2. **Database first**: Ensure migrations work before deployment (risk mitigation)
3. **Deploy next**: Establish basic deployment workflow
4. **Extend**: Add environment management (staging, production)
5. **Document**: Capture knowledge and procedures for team

---

## 📦 Phases Summary

### Phase 1: D1 Migrations Automation

**Objective**: Automate Cloudflare D1 database migrations in the CI/CD pipeline

**Scope**:

- Add migration job to workflow (runs before deployment)
- Configure Cloudflare secrets (API token, account ID)
- Test migration execution in CI environment
- Add error handling and rollback documentation
- Validate migrations against local and remote D1 databases

**Dependencies**:

- ✅ Story 0.4 completed (Drizzle ORM + D1 migrations exist)
- ✅ Wrangler.jsonc configured with D1 binding
- ✅ Migration files exist in `drizzle/migrations/`

**Key Deliverables**:

- [ ] GitHub secrets configured (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`)
- [ ] Migration job added to workflow
- [ ] Migration execution tested and validated
- [ ] Error handling implemented
- [ ] Rollback procedures documented

**Files Affected** (~3 files):

- `.github/workflows/quality.yml` (add migration step) OR
- `.github/workflows/migrate.yml` (new dedicated workflow - recommended)
- `docs/deployment/migrations-guide.md` (new - documentation)
- `docs/deployment/rollback-procedures.md` (new - documentation)

**Estimated Complexity**: Medium

**Estimated Duration**: 1.5-2 days (~5-7 commits)

**Risk Level**: 🔴 High

**Risk Factors**:

- **Data corruption risk**: Failed migrations can leave database in inconsistent state
- **Secrets management**: API tokens must be properly secured
- **Race conditions**: Migrations run during active traffic (future concern)
- **Testing limitations**: Hard to fully simulate production migration scenarios

**Mitigation Strategies**:

- Test migrations locally first (`wrangler d1 execute --local`)
- Run migrations as separate job before deployment
- Document rollback procedures using D1 Time Travel
- Validate secrets before attempting migration
- Add pre-migration backup step (future enhancement)
- Use transaction-safe migrations when possible

**Success Criteria**:

- [ ] Migrations run automatically when triggered
- [ ] Migration success/failure is clearly reported in CI
- [ ] Failed migrations block deployment (job dependency)
- [ ] Rollback procedures are documented and tested
- [ ] Tests: Migration workflow executed successfully in CI

**Technical Notes**:

- Use `npx wrangler d1 migrations apply DB --remote` command
- Consider separate workflow file for migrations (cleaner separation of concerns)
- Migrations should run only on deployment events, not on every PR
- Need error handling for "no migrations to apply" case (not an error)
- D1 Time Travel provides point-in-time recovery (document in rollback guide)

---

### Phase 2: Deployment Workflow

**Objective**: Create automated deployment workflow to Cloudflare Workers

**Scope**:

- Create deployment workflow (`.github/workflows/deploy.yml`)
- Configure workflow triggers (manual dispatch, push to main)
- Integrate with migration job (run migrations first)
- Add deployment verification step
- Configure GitHub Actions environment

**Dependencies**:

- Phase 1 completed (migrations working)
- Story 0.2 completed (OpenNext adapter configured)
- Story 0.5 partial (basic wrangler.toml configured)

**Key Deliverables**:

- [ ] Deployment workflow created (`deploy.yml`)
- [ ] Workflow triggers configured (manual + automatic)
- [ ] Migration → Deployment dependency established
- [ ] Deployment verification step added
- [ ] Workflow tested with successful deployment

**Files Affected** (~2 files):

- `.github/workflows/deploy.yml` (new)
- `.github/workflows/quality.yml` (possibly adjust triggers)

**Estimated Complexity**: Medium

**Estimated Duration**: 1.5-2 days (~5-6 commits)

**Risk Level**: 🟡 Medium

**Risk Factors**:

- **Deployment failures**: Network issues, permission problems, invalid configuration
- **Zero-downtime concerns**: Brief downtime during Worker replacement
- **Build artifact mismatch**: Deployed code doesn't match tested code
- **Secrets exposure**: API tokens could be logged if not careful

**Mitigation Strategies**:

- Use official Cloudflare wrangler-action@v3
- Test deployment in staging first (Phase 3)
- Verify build artifact integrity before deployment
- Use GitHub Environment secrets (scoped)
- Add deployment verification step (health check)
- Keep previous version available for rollback

**Success Criteria**:

- [ ] Deployment workflow executes without errors
- [ ] Worker is successfully deployed to Cloudflare
- [ ] Deployment verification passes (site is accessible)
- [ ] Failed deployments are detected and reported
- [ ] Rollback is possible if deployment fails
- [ ] Tests: Successful deployment to production verified

**Technical Notes**:

- Use `cloudflare/wrangler-action@v3` for deployment
- Workflow should depend on quality pipeline passing
- Consider using `workflow_run` trigger to run after quality checks
- Add `environment: production` for approval gates (Phase 3)
- Include health check step after deployment
- Upload deployment logs as artifacts for debugging

---

### Phase 3: Environment Management & Staging

**Objective**: Extend deployment to support multiple environments (staging, production)

**Scope**:

- Create GitHub Environments (staging, production)
- Configure environment-specific secrets
- Add manual approval gate for production
- Create staging deployment workflow
- Document environment management procedures

**Dependencies**:

- Phase 2 completed (basic deployment working)

**Key Deliverables**:

- [ ] GitHub Environments configured (staging, production)
- [ ] Environment-specific secrets set up
- [ ] Staging deployment workflow created/configured
- [ ] Production deployment requires manual approval
- [ ] Environment management documented

**Files Affected** (~3 files):

- `.github/workflows/deploy.yml` (enhance with environment support)
- `.github/workflows/deploy-staging.yml` (possibly separate workflow)
- `docs/deployment/environments-guide.md` (new - documentation)

**Estimated Complexity**: Low-Medium

**Estimated Duration**: 1-1.5 days (~4-5 commits)

**Risk Level**: 🟢 Low

**Risk Factors**:

- **Configuration drift**: Staging and production configs diverge
- **Secrets management**: Environment-specific secrets can be misconfigured
- **Approval bottleneck**: Manual approval could slow deployments

**Mitigation Strategies**:

- Use infrastructure as code (wrangler.jsonc, .env.example)
- Document differences between environments clearly
- Use environment-specific wrangler.toml files if needed
- Automate staging deployments, manual approval for production only
- Test staging thoroughly before production deployment

**Success Criteria**:

- [ ] Staging environment deploys automatically on develop branch
- [ ] Production environment requires manual approval
- [ ] Environment-specific secrets work correctly
- [ ] Configuration differences are documented
- [ ] Tests: Successful deployment to both environments

**Technical Notes**:

- Use GitHub Environments feature for environment-specific configuration
- Consider branch-based deployment (develop → staging, main → production)
- Environment secrets override repository secrets
- Add environment URL to workflow for easy access
- Document when to use each environment

---

### Phase 4: Documentation & Final Validation

**Objective**: Complete deployment documentation and validate end-to-end workflow

**Scope**:

- Create comprehensive deployment runbook
- Document secret setup and configuration
- Add troubleshooting guide
- Validate complete CI/CD flow end-to-end
- Update Epic and Story tracking documents

**Dependencies**:

- Phases 1, 2, 3 completed (full workflow operational)

**Key Deliverables**:

- [ ] Deployment runbook created
- [ ] Secrets setup guide documented
- [ ] Troubleshooting guide written
- [ ] End-to-end validation completed
- [ ] EPIC_TRACKING.md updated (Story 0.7 completed)

**Files Affected** (~5 files):

- `docs/deployment/RUNBOOK.md` (new)
- `docs/deployment/secrets-setup.md` (new)
- `docs/deployment/troubleshooting.md` (new)
- `docs/specs/epics/epic_0/EPIC_TRACKING.md` (update)
- `README.md` (possibly add deployment section)

**Estimated Complexity**: Low

**Estimated Duration**: 1 day (~3-4 commits)

**Risk Level**: 🟢 Low

**Risk Factors**:

- **Documentation staleness**: Docs could become outdated quickly
- **Incomplete coverage**: Missing edge cases in troubleshooting

**Mitigation Strategies**:

- Include version numbers and dates in documentation
- Link to official Cloudflare docs for canonical information
- Test documented procedures before finalizing
- Add "last updated" dates to each guide
- Include examples and screenshots where helpful

**Success Criteria**:

- [ ] All deployment procedures are documented
- [ ] Secret setup can be followed by new team member
- [ ] Troubleshooting guide covers common issues
- [ ] End-to-end test passes (commit → tests → migrations → deployment)
- [ ] Story marked complete in EPIC_TRACKING.md
- [ ] Tests: Complete workflow validation (manual test)

**Technical Notes**:

- Runbook should cover: initial setup, routine deployments, rollbacks
- Secrets guide should include: token creation, permissions required, rotation
- Troubleshooting should cover: migration failures, deployment errors, rollback procedures
- Include links to Cloudflare dashboards for monitoring
- Document post-deployment verification steps

---

## 🔄 Implementation Order & Dependencies

### Dependency Graph

```
Phase 1 (Migrations)
    ↓ (migrations must work before deployment)
Phase 2 (Deployment)
    ↓ (need basic deployment before environments)
Phase 3 (Environments)
    ↓ (document after everything works)
Phase 4 (Documentation)
```

### Critical Path

**Must follow this order**:

1. Phase 1 (Migrations) → Phase 2 (Deployment) → Phase 3 (Environments) → Phase 4 (Documentation)

**Cannot be parallelized**: Each phase depends on the previous one completing successfully.

### Blocking Dependencies

**Phase 1 blocks**:

- Phase 2: Cannot deploy safely without migrations working

**Phase 2 blocks**:

- Phase 3: Need basic deployment before adding environment complexity

**Phase 3 blocks**:

- Phase 4: Documentation should cover complete workflow including environments

---

## 📊 Timeline & Resource Estimation

### Overall Estimates

| Metric                   | Estimate                   | Notes                              |
| ------------------------ | -------------------------- | ---------------------------------- |
| **Total Phases**         | 4                          | Atomic, sequential phases          |
| **Total Duration**       | 5-6.5 days                 | Sequential implementation required |
| **Parallel Duration**    | 5-6.5 days                 | No parallelization possible        |
| **Total Commits**        | ~17-22                     | Across all phases                  |
| **Total Files**          | ~4 new, ~3 modified        | Workflows + documentation          |
| **Test Coverage Target** | N/A (infrastructure work)  | Focus on integration validation    |

### Per-Phase Timeline

| Phase | Duration | Commits | Start After | Blocks     |
| ----- | -------- | ------- | ----------- | ---------- |
| 1     | 1.5-2d   | 5-7     | -           | Phase 2    |
| 2     | 1.5-2d   | 5-6     | Phase 1     | Phase 3    |
| 3     | 1-1.5d   | 4-5     | Phase 2     | Phase 4    |
| 4     | 1d       | 3-4     | Phase 3     | -          |

### Resource Requirements

**Team Composition**:

- 1 developer with DevOps experience: CI/CD, Cloudflare Workers, GitHub Actions
- 1 reviewer: Validate security (secrets), test procedures, approve documentation

**External Dependencies**:

- **Cloudflare Account**: Required for API token generation and deployment
- **Cloudflare API Token**: Workers Deploy permission + D1 permissions
- **Cloudflare Account ID**: For wrangler authentication
- **GitHub Actions**: Enabled for repository (typically already enabled)

---

## ⚠️ Risk Assessment

### High-Risk Phases

**Phase 1: D1 Migrations Automation** 🔴

- **Risk**: Failed migration leaves database in inconsistent state, potentially corrupting data
- **Impact**: Application downtime, data loss, complex recovery procedures required
- **Mitigation**:
  - Test migrations locally extensively before CI
  - Run migrations as separate job before deployment
  - Document rollback procedures using D1 Time Travel
  - Add migration validation step (dry-run if possible)
  - Consider blue-green deployment strategy for future
- **Contingency**:
  - Use Cloudflare D1 Time Travel for point-in-time recovery
  - Manual rollback of migrations via wrangler CLI
  - Keep previous Worker version deployed until migration verified

### Medium-Risk Phases

**Phase 2: Deployment Workflow** 🟡

- **Risk**: Deployment failures due to network issues, permission problems, or configuration errors
- **Impact**: Failed deployments, potential downtime, blocked releases
- **Mitigation**:
  - Test deployment in staging environment first (Phase 3)
  - Use official cloudflare/wrangler-action
  - Add deployment verification step
  - Implement health checks post-deployment
- **Contingency**:
  - Manual deployment via wrangler CLI
  - Rollback to previous Worker version
  - Re-run workflow after fixing issues

### Overall Story Risks

| Risk                       | Likelihood | Impact | Mitigation                                |
| -------------------------- | ---------- | ------ | ----------------------------------------- |
| Migration data corruption  | Low        | High   | Test extensively, document rollback       |
| Deployment failures        | Medium     | Medium | Staging env, health checks, manual deploy |
| Secrets exposure           | Low        | High   | Use GitHub Environment secrets, audit     |
| Configuration drift        | Medium     | Low    | Document differences, IaC approach        |
| Incomplete documentation   | Low        | Medium | Test procedures, peer review              |

---

## 🧪 Testing Strategy

### Test Coverage by Phase

| Phase | Integration Tests | Manual Tests | E2E Validation |
| ----- | ----------------- | ------------ | -------------- |
| 1     | Migration dry-run | CI execution | Database state |
| 2     | Deployment smoke  | CI execution | Site access    |
| 3     | Multi-env deploy  | Approval flow | Both envs      |
| 4     | N/A               | Runbook test | Full workflow  |

### Test Milestones

- **After Phase 1**: Migrations execute successfully in CI without errors
- **After Phase 2**: Application deploys and is accessible at Cloudflare URL
- **After Phase 3**: Staging and production environments both functional
- **After Phase 4**: Complete workflow validated from commit to production

### Quality Gates

Each phase must pass:

- [ ] Workflow syntax valid (YAML lint)
- [ ] Secrets configured correctly
- [ ] Job executes without errors
- [ ] Expected outcome verified (migration applied, site deployed, etc.)
- [ ] Code review approved
- [ ] Documentation complete

---

## 📝 Phase Documentation Strategy

### Documentation to Generate per Phase

**This story is infrastructure-focused**, so detailed technical documentation is more valuable than commit-by-commit checklists.

**Phase 1 (Migrations)**:

- Migration workflow implementation guide
- Rollback procedures document
- Local testing guide

**Phase 2 (Deployment)**:

- Deployment workflow overview
- Deployment verification guide
- Troubleshooting common issues

**Phase 3 (Environments)**:

- Environment management guide
- Staging vs production differences
- Approval workflow documentation

**Phase 4 (Consolidation)**:

- Complete deployment runbook
- Secrets setup guide
- End-to-end workflow documentation

**Estimated documentation**: ~200-300 lines per phase × 4 phases = **~800-1200 lines**

### Story-Level Documentation

**This document** (PHASES_PLAN.md):

- Strategic overview of CI/CD implementation
- Phase coordination and dependencies
- Risk assessment and mitigation
- Overall timeline and completion criteria

**Phase-level documentation** (in `docs/deployment/`):

- Tactical procedures and runbooks
- Configuration guides
- Troubleshooting and recovery

---

## 🚀 Next Steps

### Immediate Actions

1. **Review this plan** with the team
   - Validate phase breakdown makes sense
   - Adjust estimates if needed
   - Confirm Cloudflare account access and permissions

2. **Prepare Cloudflare secrets**
   ```bash
   # Generate API token at Cloudflare dashboard
   # Permissions needed: Workers Scripts:Edit, Account:D1:Edit

   # Add to GitHub repository secrets:
   # - CLOUDFLARE_API_TOKEN
   # - CLOUDFLARE_ACCOUNT_ID
   ```

3. **Begin Phase 1 implementation**
   - Start with migration workflow
   - Test locally first
   - Document as you go

### Implementation Workflow

For each phase:

1. **Plan**:
   - Review PHASES_PLAN.md for phase overview
   - Identify specific tasks and files to modify
   - Gather required information (secrets, config, etc.)

2. **Implement**:
   - Follow atomic commit strategy (small, focused commits)
   - Test each change incrementally
   - Validate after each commit

3. **Validate**:
   - Execute workflow in GitHub Actions
   - Verify expected outcome
   - Test failure scenarios (error handling)

4. **Document**:
   - Create guides for procedures
   - Document troubleshooting steps
   - Update this plan with actual metrics

5. **Move to next phase**:
   - Mark phase complete in tracking
   - Update EPIC_TRACKING.md progress
   - Begin next phase

### Progress Tracking

Update this document as phases complete:

- [ ] Phase 1: Migrations - Status: NOT STARTED, Actual duration: TBD, Notes: TBD
- [ ] Phase 2: Deployment - Status: NOT STARTED, Actual duration: TBD, Notes: TBD
- [ ] Phase 3: Environments - Status: NOT STARTED, Actual duration: TBD, Notes: TBD
- [ ] Phase 4: Documentation - Status: NOT STARTED, Actual duration: TBD, Notes: TBD

---

## 📊 Success Metrics

### Story Completion Criteria

This story is considered complete when:

- [ ] All 4 phases implemented and validated
- [ ] All acceptance criteria from original spec met:
  - [ ] CA4: Migrations D1 automatisées
  - [ ] CA5: Déploiement Cloudflare Workers automatisé
- [ ] Database migrations run automatically on deployment
- [ ] Application deploys successfully to Cloudflare Workers
- [ ] Staging and production environments configured
- [ ] Complete deployment documentation exists
- [ ] End-to-end workflow validated (commit → production)
- [ ] EPIC_TRACKING.md updated to 100% for Story 0.7

### Quality Metrics

| Metric                  | Target    | Actual | Notes                                    |
| ----------------------- | --------- | ------ | ---------------------------------------- |
| Migration Success Rate  | 100%      | -      | All migrations apply without errors      |
| Deployment Success Rate | ≥99%      | -      | Occasional failures acceptable (network) |
| Rollback Time           | <5 min    | -      | Time to revert failed deployment         |
| Documentation Complete  | 100%      | -      | All procedures documented                |
| Workflow Execution Time | <10 min   | -      | Migrations + deployment time             |

### Validation Checklist

Before marking story complete:

- [ ] Manual test: Commit code → PR → Merge → Deploy → Verify
- [ ] Test migration failure scenario and rollback
- [ ] Test deployment failure scenario and rollback
- [ ] Validate staging deployment works independently
- [ ] Validate production requires approval
- [ ] New team member can follow deployment documentation
- [ ] All workflows pass in GitHub Actions
- [ ] Cloudflare Workers dashboard shows successful deployment
- [ ] Site is accessible at production URL

---

## 📚 Reference Documents

### Story Specification

- Original spec: `docs/specs/epics/epic_0/story_0_7/story_0.7.md`

### Related Documentation

- Epic overview: `docs/specs/epics/epic_0/EPIC_TRACKING.md`
- Story 0.4 (Database): `docs/specs/epics/epic_0/story_0_4/` (migrations setup)
- Story 0.5 (Wrangler config): `docs/specs/epics/epic_0/story_0_5/` (bindings)

### Existing Infrastructure

- Quality workflow: `.github/workflows/quality.yml`
- Wrangler config: `wrangler.jsonc`
- Database migrations: `drizzle/migrations/`
- Package scripts: `package.json` (test, build, deploy commands)

### External References

- **GitHub Actions**: https://docs.github.com/en/actions
- **Wrangler Commands**: https://developers.cloudflare.com/workers/wrangler/commands/
- **Wrangler Action**: https://github.com/cloudflare/wrangler-action
- **D1 Migrations**: https://developers.cloudflare.com/d1/reference/migrations/
- **D1 Time Travel**: https://developers.cloudflare.com/d1/reference/time-travel/
- **GitHub Environments**: https://docs.github.com/en/actions/deployment/targeting-different-environments

### Generated Documentation (To Be Created)

- Phase 1: `docs/deployment/migrations-guide.md`
- Phase 1: `docs/deployment/rollback-procedures.md`
- Phase 2: `docs/deployment/deployment-workflow.md`
- Phase 3: `docs/deployment/environments-guide.md`
- Phase 4: `docs/deployment/RUNBOOK.md`
- Phase 4: `docs/deployment/secrets-setup.md`
- Phase 4: `docs/deployment/troubleshooting.md`

---

## 📈 Progress Log

### Phase Completion Updates

**Phase 1**: NOT STARTED
- Start Date: TBD
- Completion Date: TBD
- Actual Duration: TBD
- Commits: TBD
- Notes: TBD

**Phase 2**: NOT STARTED
- Start Date: TBD
- Completion Date: TBD
- Actual Duration: TBD
- Commits: TBD
- Notes: TBD

**Phase 3**: NOT STARTED
- Start Date: TBD
- Completion Date: TBD
- Actual Duration: TBD
- Commits: TBD
- Notes: TBD

**Phase 4**: NOT STARTED
- Start Date: TBD
- Completion Date: TBD
- Actual Duration: TBD
- Commits: TBD
- Notes: TBD

### Blockers & Issues

- None currently identified

### Key Decisions

- **Decision 1**: Use separate `migrate.yml` workflow vs. integrating into `quality.yml`
  - Rationale: TBD during implementation
  - Date: TBD

- **Decision 2**: Branch-based deployment (develop → staging, main → production) vs. manual environment selection
  - Rationale: TBD during implementation
  - Date: TBD

---

**Plan Created**: 2025-11-10
**Last Updated**: 2025-11-10
**Created by**: Claude Code (story-phase-planner skill)
**Story Status**: 🚧 IN PROGRESS (70% → Target: 100%)
**Estimated Completion**: 5-6.5 days from start of Phase 1
