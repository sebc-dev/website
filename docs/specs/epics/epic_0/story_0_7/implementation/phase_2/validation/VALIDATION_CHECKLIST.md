# Phase 2 - Final Validation Checklist

Complete validation checklist before marking Phase 2 as complete.

---

## ✅ 1. Commits and Structure

- [ ] All 5 atomic commits completed
- [ ] Commits follow Gitmoji convention (if applicable) or standard format
- [ ] Commit order is logical (structure → triggers → deploy → verify → log)
- [ ] Each commit is focused (single responsibility)
- [ ] No merge commits in phase branch
- [ ] Git history is clean and readable
- [ ] Commit messages include "Part of Phase 2 - Commit X/5"

**Validation**:
```bash
# View commit history
git log --oneline --no-merges | head -5

# Check commit messages
git log --format="%s" | head -5
```

---

## ✅ 2. Workflow Syntax and Structure

- [ ] YAML syntax is valid (no tabs, proper indentation)
- [ ] Workflow file location correct: `.github/workflows/deploy.yml`
- [ ] Workflow name is descriptive: "Deploy to Cloudflare Workers"
- [ ] All required fields present (name, on, jobs)
- [ ] Comments explain workflow purpose and structure
- [ ] No syntax errors reported by actionlint

**Validation**:
```bash
# Validate YAML syntax
pnpm exec actionlint .github/workflows/deploy.yml

# Check file exists
ls -la .github/workflows/deploy.yml

# View workflow structure
cat .github/workflows/deploy.yml | head -30
```

---

## ✅ 3. Workflow Configuration

### Permissions
- [ ] Minimal workflow permissions (`contents: read`)
- [ ] Job permissions are appropriate (no unnecessary write access)
- [ ] Follows least-privilege principle

### Concurrency
- [ ] Concurrency group configured: `deploy-${{ github.ref }}`
- [ ] `cancel-in-progress: true` set
- [ ] Prevents overlapping deployments

### Timeouts
- [ ] Workflow timeout set (15 minutes)
- [ ] Job timeout set (10 minutes)
- [ ] Timeouts are reasonable for deployment tasks

**Validation**:
```bash
# Check permissions and concurrency
cat .github/workflows/deploy.yml | grep -A 5 "permissions:\|concurrency:"

# Check timeouts
cat .github/workflows/deploy.yml | grep "timeout"
```

---

## ✅ 4. Trigger Configuration

- [ ] `workflow_dispatch` configured for manual deployments
- [ ] Input parameters documented (if any)
- [ ] `workflow_run` triggers after quality workflow succeeds
- [ ] `workflow_run` limited to appropriate branches (main, develop)
- [ ] Trigger conditions are correct and tested
- [ ] No redundant or conflicting triggers

**Validation**:
```bash
# Check triggers
cat .github/workflows/deploy.yml | grep -A 20 "on:"

# Test manual trigger
gh workflow run deploy.yml

# Verify workflow appears
gh workflow list | grep -i deploy
```

---

## ✅ 5. Build and Deployment

### Build Steps
- [ ] Checkout uses pinned version (`actions/checkout@v4`)
- [ ] pnpm setup configured correctly
- [ ] Node.js version matches project (20.x)
- [ ] pnpm cache configured
- [ ] Dependencies install uses `--frozen-lockfile`
- [ ] Build command correct: `pnpm build`
- [ ] Build output verified before deployment

### Deployment Step
- [ ] Uses official action: `cloudflare/wrangler-action@v3`
- [ ] Action version pinned (not `@latest`)
- [ ] `apiToken` uses secret: `${{ secrets.CLOUDFLARE_API_TOKEN }}`
- [ ] `accountId` uses secret: `${{ secrets.CLOUDFLARE_ACCOUNT_ID }}`
- [ ] Command is correct: `wrangler deploy`
- [ ] Working directory set appropriately (if needed)

**Validation**:
```bash
# Check build and deployment steps
cat .github/workflows/deploy.yml | grep -A 30 "deploy:"

# Verify secrets configured
gh secret list | grep CLOUDFLARE

# Test deployment
gh workflow run deploy.yml
gh run watch
```

---

## ✅ 6. Security

### Secrets Handling (CRITICAL)
- [ ] **NO hardcoded secrets or API tokens**
- [ ] **All secrets referenced via `${{ secrets.NAME }}`**
- [ ] **No secrets echoed to logs**
- [ ] Secrets not passed as CLI arguments where logged
- [ ] No sensitive data in comments

### Action Security
- [ ] All actions pinned to specific versions
- [ ] Actions from trusted sources (GitHub, Cloudflare official)
- [ ] No third-party actions without security review

### Deployment Security
- [ ] Deployment requires quality checks to pass (workflow_run dependency)
- [ ] Deployment limited to specific branches
- [ ] Minimal permissions for all jobs
- [ ] No write permissions unless justified

**Validation**:
```bash
# Check for hardcoded secrets (should return nothing sensitive)
grep -i "token\|secret\|password" .github/workflows/deploy.yml | grep -v "secrets\."

# Verify action versions pinned
grep "uses:" .github/workflows/deploy.yml

# Check permissions
cat .github/workflows/deploy.yml | grep -A 5 "permissions:"
```

---

## ✅ 7. Deployment Verification

- [ ] Post-deployment health check implemented
- [ ] Health check targets correct Worker URL
- [ ] HTTP method appropriate (GET)
- [ ] Success criteria clear (HTTP 200)
- [ ] Retry logic implemented (3 attempts recommended)
- [ ] Retry delay allows for CDN propagation (10+ seconds)
- [ ] Failed health check triggers workflow failure
- [ ] Error messages are descriptive

**Validation**:
```bash
# Check health check step
cat .github/workflows/deploy.yml | grep -A 20 "health check\|verification"

# Test deployment with verification
gh workflow run deploy.yml
gh run watch --log | grep -A 10 "verification"
```

---

## ✅ 8. Logging and Observability

- [ ] Deployment summary generated
- [ ] Summary includes Worker URL
- [ ] Summary includes deployment timestamp
- [ ] Summary includes commit SHA
- [ ] Deployment logs uploaded as artifacts
- [ ] Artifact retention set appropriately (14 days recommended)
- [ ] Artifact name is descriptive
- [ ] No sensitive data in logs or artifacts
- [ ] Workflow summary is user-friendly

**Validation**:
```bash
# Check logging and artifact steps
cat .github/workflows/deploy.yml | grep -A 15 "summary\|artifact"

# Test deployment and check artifacts
gh workflow run deploy.yml
gh run watch

# View workflow summary
gh run view

# List artifacts
gh run view --log | grep -A 5 "Upload artifact"
```

---

## ✅ 9. Integration with Existing Workflows

- [ ] Works with quality workflow (`.github/workflows/quality.yml`)
- [ ] Depends on migration workflow (if Phase 1 complete)
- [ ] No conflicts with existing workflows
- [ ] Trigger dependencies are explicit
- [ ] Workflow runs at appropriate time (after quality passes)

**Validation**:
```bash
# Check workflow dependencies
cat .github/workflows/deploy.yml | grep -A 10 "workflow_run:"

# Test integration: push to main
git checkout main
git commit --allow-empty -m "test: workflow integration"
git push origin main

# Monitor workflows
gh run list --limit 5
```

---

## ✅ 10. Environment Configuration

- [ ] GitHub secrets configured:
  - [ ] `CLOUDFLARE_API_TOKEN`
  - [ ] `CLOUDFLARE_ACCOUNT_ID`
- [ ] Secrets have correct values
- [ ] Wrangler configuration exists (`wrangler.jsonc`)
- [ ] OpenNext build configured
- [ ] Build produces deployable artifacts

**Validation**:
```bash
# Verify secrets
gh secret list | grep CLOUDFLARE

# Check wrangler config
cat wrangler.jsonc

# Test build locally
pnpm build
ls -la .open-next/worker.js
```

---

## ✅ 11. Testing

### Manual Testing
- [ ] Manual trigger tested (`workflow_dispatch`)
- [ ] Automatic trigger tested (`workflow_run`)
- [ ] Branch filtering tested
- [ ] Health check validated
- [ ] End-to-end deployment tested

### Failure Scenarios
- [ ] Missing secrets failure tested (or reviewed)
- [ ] Build failure blocks deployment (tested or reviewed)
- [ ] Health check failure triggers workflow failure

### Test Results
- [ ] All syntax validation passes
- [ ] All integration tests pass
- [ ] Deployment succeeds consistently (≥99% success rate target)
- [ ] Worker accessible after deployment

**Validation**:
```bash
# Run complete test suite (see guides/TESTING.md)

# Syntax
actionlint .github/workflows/deploy.yml

# Manual trigger
gh workflow run deploy.yml
gh run watch

# Check Worker accessibility
WORKER_URL=$(gh run view --log | grep -o "https://[^ ]*workers.dev" | head -1)
curl -I "$WORKER_URL"
```

---

## ✅ 12. Documentation

- [ ] ENVIRONMENT_SETUP.md complete and accurate
- [ ] All secrets documented
- [ ] Setup instructions tested
- [ ] Troubleshooting guide comprehensive
- [ ] All commands in docs work
- [ ] Rollback procedures documented
- [ ] INDEX.md updated with phase status

**Validation**:
```bash
# Review documentation
ls -la docs/specs/epics/epic_0/story_0_7/implementation/phase_2/

# Files should exist:
# - INDEX.md
# - IMPLEMENTATION_PLAN.md
# - COMMIT_CHECKLIST.md
# - ENVIRONMENT_SETUP.md
# - guides/REVIEW.md
# - guides/TESTING.md
# - validation/VALIDATION_CHECKLIST.md (this file)

# Test commands from ENVIRONMENT_SETUP.md
# (Verify each command works as documented)
```

---

## ✅ 13. Code Review

- [ ] Self-review completed (guides/REVIEW.md)
- [ ] Peer review completed (if required)
- [ ] All security concerns addressed
- [ ] All feedback addressed
- [ ] Approved by reviewer or tech lead

---

## ✅ 14. Final Deployment Validation

- [ ] Deployed Worker is accessible
- [ ] Worker URL returns HTTP 200
- [ ] Worker functionality works correctly
- [ ] Deployment duration is acceptable (< 10 min typically)
- [ ] No errors in deployment logs
- [ ] Health check passes consistently

**Validation**:
```bash
# Full deployment test
gh workflow run deploy.yml
gh run watch

# Get Worker URL
gh run view --log | grep -i "published\|url"

# Test Worker
WORKER_URL="<extracted-url>"
curl -I "$WORKER_URL"

# Expected: HTTP/2 200

# Test Worker functionality (if applicable)
curl "$WORKER_URL"
```

---

## 📋 Validation Commands Summary

Run all these commands before final approval:

```bash
# 1. Validate workflow syntax
pnpm exec actionlint .github/workflows/deploy.yml

# 2. Verify secrets configured
gh secret list | grep CLOUDFLARE

# 3. Check workflow file exists
ls -la .github/workflows/deploy.yml

# 4. Verify wrangler config
cat wrangler.jsonc

# 5. Test build locally
pnpm build
ls -la .open-next/worker.js

# 6. Test deployment
gh workflow run deploy.yml

# 7. Monitor deployment
gh run watch

# 8. View deployment logs
gh run view --log

# 9. Check Worker accessibility
WORKER_URL=$(gh run view --log | grep -o "https://[^ ]*workers.dev" | head -1)
echo "Worker URL: $WORKER_URL"
curl -I "$WORKER_URL"

# 10. Verify artifacts uploaded
gh run view | grep -i artifact
```

**All must pass with no errors.**

---

## 📊 Success Metrics

| Metric                   | Target   | Actual | Status |
| ------------------------ | -------- | ------ | ------ |
| Commits                  | 5        | -      | ⏳     |
| Workflow Syntax Valid    | ✅       | -      | ⏳     |
| Deployment Success Rate  | ≥99%     | -      | ⏳     |
| Health Check Coverage    | 100%     | -      | ⏳     |
| Deployment Duration      | <10 min  | -      | ⏳     |
| Security Issues          | 0        | -      | ⏳     |

---

## 🎯 Final Verdict

Select one:

- [ ] ✅ **APPROVED** - Phase 2 is complete and ready
  - All validation checks passed
  - Deployment workflow functional
  - Security verified
  - Documentation complete

- [ ] 🔧 **CHANGES REQUESTED** - Issues to fix:
  - [ ] Issue 1: [description]
  - [ ] Issue 2: [description]
  - [ ] Issue 3: [description]

- [ ] ❌ **REJECTED** - Major rework needed:
  - [ ] Major Issue 1: [description]
  - [ ] Major Issue 2: [description]

---

## 📝 Next Steps

### If Approved ✅

1. [ ] Update INDEX.md status to ✅ COMPLETED
2. [ ] Update story_0.7.md with Phase 2 completion
3. [ ] Update EPIC_TRACKING.md progress
4. [ ] Merge phase branch to main (if applicable)
5. [ ] Create git tag: `story-0.7-phase-2-complete` (optional)
6. [ ] Verify deployment works in production
7. [ ] Prepare for Phase 3: Environment Management & Staging

### If Changes Requested 🔧

1. [ ] Address all feedback items
2. [ ] Re-run affected validations
3. [ ] Update documentation if needed
4. [ ] Request re-review
5. [ ] Re-validate when fixes complete

### If Rejected ❌

1. [ ] Document all major issues
2. [ ] Schedule discussion with team
3. [ ] Plan rework strategy
4. [ ] Consider scope adjustments if needed

---

## 🔒 Security Sign-Off

**CRITICAL**: Security reviewer must sign off before approval.

**Security Checklist**:
- [ ] No hardcoded secrets in workflow
- [ ] All secrets properly referenced
- [ ] No sensitive data in logs or artifacts
- [ ] Action versions pinned
- [ ] Minimal permissions enforced
- [ ] Deployment limited to authorized branches

**Security Reviewer**: ________________
**Date**: ________________
**Sign-Off**: [ ] APPROVED / [ ] REJECTED

---

## 📝 Validation Notes

**Validator**: [Name]
**Date**: [YYYY-MM-DD]
**Environment**: [main/staging/feature-branch]

**Notes**:
[Any additional notes, observations, or context]

**Issues Found**:
[List any issues discovered during validation]

**Recommendations**:
[Any suggestions for Phase 3 or future improvements]

---

**Validation completed! Phase 2 is ready for approval once all checkboxes are checked. 🎉**

**Next Phase**: Phase 3 - Environment Management & Staging (adds staging/production environments and manual approval gates)
