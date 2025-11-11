# Phase 3 - Final Validation Checklist

Complete validation checklist before marking Phase 3 as complete.

---

## ✅ 1. Commits and Structure

- [ ] All 5 atomic commits completed
- [ ] Commits follow naming convention (`ci:`, `feat:`, `docs:`)
- [ ] Commit order is logical (infra → secrets → workflows → docs)
- [ ] Each commit is focused (single responsibility)
- [ ] Commit messages descriptive and include "Part of Phase 3 - Commit X/5"
- [ ] Git history is clean (no unnecessary merge commits)

**Validation**:

```bash
# Check commit history
git log --oneline -5 | grep "Phase 3"
# Expected: 5 commits with Phase 3 references
```

---

## ✅ 2. GitHub Environments Configuration

- [ ] "staging" environment exists in repository settings
- [ ] "production" environment exists in repository settings
- [ ] Staging environment has NO approval requirements
- [ ] Production environment has REQUIRED reviewers (at least 1)
- [ ] Appropriate reviewers configured for production
- [ ] Environment URLs set (or documented as TBD)
- [ ] Deployment branch rules configured appropriately

**Validation**:

Navigate to: `https://github.com/[org]/[repo]/settings/environments`

- [ ] Both environments visible
- [ ] Production shows "🔒" or "Required reviewers" badge
- [ ] Staging shows "🟢" or no protection badge

---

## ✅ 3. Environment Secrets Configuration

### Staging Environment Secrets

- [ ] `CLOUDFLARE_API_TOKEN` configured
- [ ] `CLOUDFLARE_ACCOUNT_ID` configured
- [ ] `CLOUDFLARE_WORKER_NAME` configured
- [ ] Total of 3 secrets in staging environment
- [ ] Secret values correct (verified by test deployment)

### Production Environment Secrets

- [ ] `CLOUDFLARE_API_TOKEN` configured (different from staging ideally)
- [ ] `CLOUDFLARE_ACCOUNT_ID` configured
- [ ] `CLOUDFLARE_WORKER_NAME` configured (different from staging)
- [ ] Total of 3 secrets in production environment
- [ ] Secret values correct (verified by test deployment)

**Validation**:

- [ ] Navigate to Settings → Environments → [staging/production] → Environment secrets
- [ ] Verify 3 secrets in each environment
- [ ] Test deployments succeeded (confirms secrets work)

---

## ✅ 4. Workflow Files - Syntax and Structure

### deploy.yml (Enhanced)

- [ ] Workflow file exists: `.github/workflows/deploy.yml`
- [ ] `workflow_dispatch` input added for environment selection
- [ ] Environment input is `type: choice` with "staging" and "production" options
- [ ] Job uses `environment:` field with dynamic value
- [ ] Default environment logic correct (production on main push)
- [ ] Workflow syntax valid (actionlint passes)

**Validation**:

```bash
# Validate syntax
pnpm exec actionlint .github/workflows/deploy.yml

# Check environment input
cat .github/workflows/deploy.yml | grep -A 10 "workflow_dispatch"
# Should show environment choice input

# Check environment usage
cat .github/workflows/deploy.yml | grep "environment:"
# Should show: environment: ${{ inputs.environment || 'production' }}
```

### deploy-staging.yml (New)

- [ ] Workflow file exists: `.github/workflows/deploy-staging.yml`
- [ ] Triggers on push to `dev` and/or `develop` branches
- [ ] Manual trigger enabled (`workflow_dispatch`)
- [ ] Uses `environment: staging`
- [ ] Includes migration job (or references from Phase 1)
- [ ] Includes deployment job with wrangler-action
- [ ] Concurrency group configured (cancel outdated staging deploys)
- [ ] Workflow syntax valid (actionlint passes)

**Validation**:

```bash
# Validate syntax
pnpm exec actionlint .github/workflows/deploy-staging.yml

# Check triggers
cat .github/workflows/deploy-staging.yml | grep -A 5 "on:"
# Should show push to dev/develop and workflow_dispatch

# Check environment
cat .github/workflows/deploy-staging.yml | grep "environment:"
# Should show: environment: staging
```

---

## ✅ 5. Deployment Testing

### Staging Deployments

- [ ] Staging auto-deploys on push to dev branch (tested)
- [ ] Staging manual deployment works via workflow_dispatch (tested)
- [ ] Staging deployments do NOT require approval
- [ ] Staging site accessible after deployment
- [ ] Staging deployment logs clear and informative

### Production Deployments

- [ ] Production deployment requires approval (tested)
- [ ] Approval gate appears when production deploy triggered (tested)
- [ ] Deployment proceeds after approval is granted (tested)
- [ ] Production deploys on push to main (with approval) (tested)
- [ ] Production site accessible after deployment
- [ ] Production deployment logs clear and informative

**Validation**:

- [ ] Run Test 3.1 from guides/TESTING.md (staging auto-deploy)
- [ ] Run Test 3.2 from guides/TESTING.md (staging manual)
- [ ] Run Test 3.3 from guides/TESTING.md (production with approval)
- [ ] Run Test 3.4 from guides/TESTING.md (production on main push)
- [ ] All tests passed

---

## ✅ 6. Security Validation

### Secrets Management

- [ ] No actual secret values committed to git
- [ ] Secrets stored in Environment secrets (not Repository secrets)
- [ ] Separate API tokens used for staging and production (recommended)
- [ ] Tokens scoped to minimum permissions (Workers Deploy + D1 Edit)
- [ ] `.env` file in `.gitignore` (or equivalent)

### Approval Gates

- [ ] Production requires manual approval (cannot be bypassed)
- [ ] Appropriate reviewers configured (tech leads, DevOps, etc.)
- [ ] Approval process tested and works correctly
- [ ] Staging does NOT require approval (fast feedback)

### Token Permissions

- [ ] API tokens have only required permissions (no Admin or Global API Key)
- [ ] Tokens tested and work correctly
- [ ] Token rotation procedure documented

**Validation**:

```bash
# Verify no secrets in git history
git log -p | grep -i "cloudflare_api_token"
# Should NOT show actual token values

# Verify .gitignore includes .env
cat .gitignore | grep "\.env"
# Should show .env or .env.local
```

---

## ✅ 7. Documentation

### environments-guide.md

- [ ] File exists: `docs/deployment/environments-guide.md`
- [ ] Covers environment overview (staging vs production)
- [ ] Documents deployment procedures (automatic and manual)
- [ ] Documents environment-specific configuration
- [ ] Explains approval process for production
- [ ] Covers secret management and rotation
- [ ] Includes troubleshooting section
- [ ] Documents rollback procedures
- [ ] Well-structured with clear sections
- [ ] Examples and scenarios included
- [ ] External links work (GitHub Docs, Cloudflare Docs)

### README.md

- [ ] README.md updated with Deployment section
- [ ] Links to environments-guide.md
- [ ] Quick deployment commands for both environments
- [ ] Links to GitHub Actions workflows

### .env.example

- [ ] Updated with CLOUDFLARE variables
- [ ] Shows example values (not real secrets)
- [ ] Documents which variables are required
- [ ] Formatting consistent with existing file

**Validation**:

```bash
# Check environments-guide.md exists
ls -lh docs/deployment/environments-guide.md
# Should show file with ~150-200 lines

# Verify README.md updated
cat README.md | grep -i "deployment"
# Should show Deployment section

# Check .env.example
cat .env.example | grep CLOUDFLARE
# Should show CLOUDFLARE_* variables documented
```

---

## ✅ 8. Integration with Phase 2

- [ ] Works with existing deployment workflow from Phase 2
- [ ] No breaking changes to Phase 2 functionality
- [ ] Migration job from Phase 1 still works
- [ ] Environment enhancement is backward compatible
- [ ] Phase 2 deployment functionality preserved

**Integration Tests**:

```bash
# Verify deploy.yml still works for production (default)
# Manually trigger deploy.yml without selecting environment
# Should deploy to production (with approval)
```

---

## ✅ 9. Cloudflare Infrastructure

### Workers

- [ ] Staging Worker exists (or Workers Environment configured)
- [ ] Production Worker exists (or Workers Environment configured)
- [ ] Workers accessible via Cloudflare dashboard
- [ ] Worker names match secrets configuration
- [ ] Deployments successful to both Workers

### Database (D1)

- [ ] Database accessible from staging Worker
- [ ] Database accessible from production Worker
- [ ] Migrations work in both environments
- [ ] Data isolation maintained (if separate DBs)

**Validation**:

```bash
# List Workers
npx wrangler deployments list --name=[staging-worker-name]
npx wrangler deployments list --name=[production-worker-name]

# Expected: Workers exist with recent deployments
```

---

## ✅ 10. End-to-End Workflow

- [ ] Complete development flow tested (feature → staging → production)
- [ ] Feature branch → dev merge triggers staging auto-deploy
- [ ] Staging deployment succeeds without approval
- [ ] Dev → main merge triggers production deploy
- [ ] Production deployment waits for approval
- [ ] Production deployment succeeds after approval
- [ ] No manual intervention except production approval

**Validation**:

- [ ] Run Test 4.1 from guides/TESTING.md (end-to-end flow)
- [ ] Test passed successfully

---

## ✅ 11. Code Review

- [ ] Self-review completed using guides/REVIEW.md
- [ ] Peer review requested (if required by team process)
- [ ] All review feedback addressed
- [ ] Review approved by tech lead or senior developer
- [ ] No outstanding comments or concerns

---

## ✅ 12. Final Validation

- [ ] All previous checklist items checked
- [ ] Phase 3 objectives met:
  - [ ] GitHub Environments configured
  - [ ] Environment-specific secrets set up
  - [ ] Manual approval gate for production
  - [ ] Staging deployment automated
  - [ ] Environment management documented
- [ ] All tests passed (from guides/TESTING.md)
- [ ] No known issues or blockers
- [ ] Documentation complete and accurate
- [ ] Ready for Phase 4 (Documentation & Final Validation)

---

## 📋 Validation Commands Summary

Run all these commands before final approval:

```bash
# 1. Validate workflow syntax
pnpm exec actionlint .github/workflows/deploy.yml
pnpm exec actionlint .github/workflows/deploy-staging.yml

# 2. Verify documentation
cat docs/deployment/environments-guide.md | wc -l  # Should be ~150-200 lines
cat README.md | grep -A 5 "Deployment"  # Should show deployment section

# 3. Check git history
git log --oneline -5 | grep "Phase 3"  # Should show 5 commits

# 4. Verify no secrets committed
git log -p | grep -i "cloudflare_api_token"  # Should NOT show actual tokens

# 5. Verify .env.example updated
cat .env.example | grep CLOUDFLARE  # Should show CLOUDFLARE variables
```

**All must pass with no errors.**

---

## 🧪 Manual Test Checklist

Before final approval, complete these manual tests:

- [ ] **Test 1**: Push to dev branch → staging auto-deploys (guides/TESTING.md Test 3.1)
- [ ] **Test 2**: Manual staging deploy via GitHub UI → succeeds (Test 3.2)
- [ ] **Test 3**: Manual production deploy → requires approval (Test 3.3)
- [ ] **Test 4**: Approve production deploy → succeeds (Test 3.3)
- [ ] **Test 5**: Push to main → production deploy waits for approval (Test 3.4)
- [ ] **Test 6**: Complete end-to-end workflow (Test 4.1)

**All tests must pass.**

---

## 📊 Success Metrics

| Metric                  | Target                             | Actual | Status |
| ----------------------- | ---------------------------------- | ------ | ------ |
| Commits                 | 5                                  | -      | ⏳     |
| Environments            | 2 (staging, production)            | -      | ⏳     |
| Secrets per Environment | 3                                  | -      | ⏳     |
| Workflow Files          | 2 (deploy.yml, deploy-staging.yml) | -      | ⏳     |
| Actionlint Status       | ✅ Pass                            | -      | ⏳     |
| Staging Auto-Deploy     | ✅ Works                           | -      | ⏳     |
| Production Approval     | ✅ Required                        | -      | ⏳     |
| Documentation Lines     | ~200                               | -      | ⏳     |

---

## 🎯 Final Verdict

Select one:

- [ ] ✅ **APPROVED** - Phase 3 is complete and ready
  - All checklist items completed
  - All tests passed
  - Documentation comprehensive
  - Production-ready multi-environment deployment

- [ ] 🔧 **CHANGES REQUESTED** - Issues to fix:
  - [ ] Issue 1: [Description]
  - [ ] Issue 2: [Description]
  - [ ] Issue 3: [Description]

- [ ] ❌ **REJECTED** - Major rework needed:
  - [ ] Major Issue 1: [Description]
  - [ ] Major Issue 2: [Description]

---

## 📝 Next Steps

### If Approved ✅

1. [ ] Update INDEX.md status to ✅ COMPLETED
2. [ ] Update EPIC_TRACKING.md:
   - [ ] Mark Phase 3 complete
   - [ ] Update Story 0.7 progress (Phase 3 of 4 done = ~80%)
3. [ ] Create git tag (optional): `story-0.7-phase-3-complete`
4. [ ] Archive/document any lessons learned
5. [ ] Prepare for Phase 4 (Documentation & Final Validation)
6. [ ] Notify team of multi-environment deployment availability

### If Changes Requested 🔧

1. [ ] Address all feedback items
2. [ ] Re-run affected tests
3. [ ] Update documentation if needed
4. [ ] Re-run validation checklist
5. [ ] Request re-review

### If Rejected ❌

1. [ ] Document major issues in detail
2. [ ] Plan rework approach
3. [ ] Schedule discussion with tech lead
4. [ ] Address fundamental issues
5. [ ] Re-validate from scratch

---

## 📋 Validation Sign-Off

**Validated by**: [Name]
**Date**: [Date]
**Verdict**: [Approved / Changes Requested / Rejected]

### Notes

[Additional notes, observations, or recommendations]

### Test Results Summary

| Test Category       | Result | Notes |
| ------------------- | ------ | ----- |
| Workflow Syntax     | ⏳     | -     |
| GitHub Environments | ⏳     | -     |
| Environment Secrets | ⏳     | -     |
| Staging Deployment  | ⏳     | -     |
| Production Approval | ⏳     | -     |
| End-to-End Flow     | ⏳     | -     |
| Documentation       | ⏳     | -     |
| Security            | ⏳     | -     |

### Issues Found

[List any issues encountered during validation]

### Recommendations for Future Phases

[Any suggestions for improvement or considerations for Phase 4]

---

## 🔗 Related Documents

- [INDEX.md](../INDEX.md) - Phase 3 overview
- [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md) - Atomic commit strategy
- [COMMIT_CHECKLIST.md](../COMMIT_CHECKLIST.md) - Per-commit checklist
- [ENVIRONMENT_SETUP.md](../ENVIRONMENT_SETUP.md) - Setup guide
- [guides/REVIEW.md](../guides/REVIEW.md) - Review guide
- [guides/TESTING.md](../guides/TESTING.md) - Testing guide
- [PHASES_PLAN.md](../../PHASES_PLAN.md) - Overall story phases
- [EPIC_TRACKING.md](../../../../../EPIC_TRACKING.md) - Epic progress

---

**Validation Checklist Created**: 2025-11-11
**Phase Objectives**: Multi-environment deployment with staging auto-deploy and production approval gates
**Critical Success Factors**: Production approval gate working, staging auto-deploy functioning, comprehensive documentation
