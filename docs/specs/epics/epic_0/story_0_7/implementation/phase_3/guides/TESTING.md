# Phase 3 - Testing Guide

Complete testing strategy for Phase 3: Multi-Environment Deployment.

---

## 🎯 Testing Strategy

Phase 3 involves infrastructure and workflow configuration rather than application code. Testing focuses on **deployment validation** and **workflow correctness**.

### Testing Layers

1. **Workflow Syntax Validation**: YAML linting (automated)
2. **Configuration Validation**: GitHub Environments, secrets (manual)
3. **Deployment Testing**: Actual deployments to staging and production (manual)
4. **Approval Gate Testing**: Verify production protection (manual)
5. **End-to-End Testing**: Full workflow from code push to deployment (manual)

**Target Success Rate**: 100% (deployments must be reliable)
**Estimated Test Count**: 8 manual tests + 2 automated validations

---

## ✅ 1. Workflow Syntax Validation (Automated)

### Purpose

Validate GitHub Actions workflow files have correct YAML syntax and follow best practices.

### Running Syntax Validation

```bash
# Install actionlint (if not already installed)
# Option 1: Using pnpm (if configured)
pnpm exec actionlint .github/workflows/deploy.yml
pnpm exec actionlint .github/workflows/deploy-staging.yml

# Option 2: Using Docker
docker run --rm -v $(pwd):/repo --workdir /repo rhysd/actionlint:latest -color .github/workflows/*.yml

# Option 3: Direct install (Linux)
bash <(curl https://raw.githubusercontent.com/rhysd/actionlint/main/scripts/download-actionlint.bash)
./actionlint .github/workflows/deploy.yml
./actionlint .github/workflows/deploy-staging.yml
```

### Expected Results

```
✅ No errors or warnings
```

If errors appear:

- Fix YAML syntax issues (indentation, missing fields, etc.)
- Fix shell script errors (missing quotes, incorrect commands)
- Fix deprecated Action versions
- Rerun validation until clean

### Common Issues

#### Issue: "property X is not allowed"

**Solution**: Check GitHub Actions schema, remove invalid properties

#### Issue: "shellcheck reported issue"

**Solution**: Fix shell script syntax (add quotes, check variables)

#### Issue: "action X is marked as deprecated"

**Solution**: Update action to latest version (e.g., `actions/checkout@v4`)

---

## 🔧 2. Configuration Validation (Manual)

### Purpose

Verify GitHub Environments and secrets are configured correctly before testing deployments.

### Test 2.1: Verify GitHub Environments Exist

**Steps**:

1. Navigate to: `https://github.com/[org]/[repo]/settings/environments`
2. Verify "staging" environment exists
3. Verify "production" environment exists

**Expected Results**:

- ✅ "staging" environment visible, no approval requirements
- ✅ "production" environment visible, "Required reviewers" badge shown

**If Failed**:

- Re-create environments following ENVIRONMENT_SETUP.md
- Verify repository permissions (need admin access)

---

### Test 2.2: Verify Staging Environment Secrets

**Steps**:

1. Navigate to: `https://github.com/[org]/[repo]/settings/environments`
2. Click "staging" environment
3. Check "Environment secrets" section

**Expected Results**:

- ✅ `CLOUDFLARE_API_TOKEN` secret present
- ✅ `CLOUDFLARE_ACCOUNT_ID` secret present
- ✅ `CLOUDFLARE_WORKER_NAME` secret present
- ✅ 3 total secrets configured

**If Failed**:

- Add missing secrets via UI
- Verify secret names match exactly (case-sensitive)
- Verify no typos in secret names

---

### Test 2.3: Verify Production Environment Secrets

**Steps**:

1. Navigate to: `https://github.com/[org]/[repo]/settings/environments`
2. Click "production" environment
3. Check "Environment secrets" section

**Expected Results**:

- ✅ `CLOUDFLARE_API_TOKEN` secret present (different from staging ideally)
- ✅ `CLOUDFLARE_ACCOUNT_ID` secret present
- ✅ `CLOUDFLARE_WORKER_NAME` secret present (different from staging)
- ✅ 3 total secrets configured

**If Failed**:

- Add missing secrets via UI
- Verify production secrets differ from staging (Worker name at minimum)
- Consider using separate API tokens for better security

---

### Test 2.4: Verify Production Approval Gate

**Steps**:

1. Navigate to production environment settings
2. Check "Environment protection rules"

**Expected Results**:

- ✅ "Required reviewers" enabled
- ✅ At least 1 reviewer configured
- ✅ Reviewer is appropriate person/team (tech lead, DevOps, etc.)

**If Failed**:

- Enable "Required reviewers" in production environment settings
- Add appropriate reviewers
- Consider setting wait timer (e.g., 5 minutes for safety)

---

## 🚀 3. Deployment Testing (Manual)

### Test 3.1: Staging Deployment (Automatic Trigger)

**Purpose**: Verify staging auto-deploys on push to dev/develop branch

**Prerequisites**:

- [ ] Configuration validation tests passed
- [ ] Phase 2 (basic deployment) working

**Steps**:

```bash
# Create test branch
git checkout -b test-staging-deploy

# Make trivial change
echo "# Test staging deployment" >> TEST_DEPLOY.md
git add TEST_DEPLOY.md
git commit -m "test: staging auto-deploy verification"

# Push to dev branch (triggers staging deployment)
git push origin test-staging-deploy:dev

# Monitor workflow
# Navigate to: https://github.com/[org]/[repo]/actions
# Find "Deploy to Staging" workflow run
```

**Expected Results**:

- ✅ Workflow triggers automatically within seconds
- ✅ Migration job runs successfully
- ✅ Deployment job runs successfully (uses `environment: staging`)
- ✅ No approval required (deploys immediately)
- ✅ Staging site accessible at staging URL
- ✅ Deployment summary shows staging environment

**If Failed**:

- Check workflow triggers configuration (should include `push: branches: [dev, develop]`)
- Verify staging secrets configured correctly
- Check Cloudflare API token permissions
- Review workflow logs for specific error
- See Troubleshooting section below

**Cleanup**:

```bash
# Delete test file
git checkout dev
git pull origin dev
git revert HEAD  # Revert test commit
git push origin dev

# Delete test branch
git branch -D test-staging-deploy
```

---

### Test 3.2: Staging Deployment (Manual Trigger)

**Purpose**: Verify manual staging deployment via workflow_dispatch

**Prerequisites**:

- [ ] Configuration validation tests passed

**Steps**:

1. Navigate to: `https://github.com/[org]/[repo]/actions`
2. Select "Deploy to Staging" workflow (if dedicated workflow exists)
   OR "Deploy to Cloudflare Workers" workflow (if using unified workflow)
3. Click "Run workflow" button
4. If prompted for environment, select "staging"
5. Click "Run workflow" to confirm

**Expected Results**:

- ✅ Workflow starts immediately
- ✅ Migration job runs
- ✅ Deployment job runs (uses `environment: staging`)
- ✅ No approval required
- ✅ Staging site updates successfully
- ✅ Workflow completes with green checkmark

**If Failed**:

- Verify secrets configured correctly in staging environment
- Check workflow has `workflow_dispatch` trigger
- Review workflow logs
- See Troubleshooting section

---

### Test 3.3: Production Deployment (Manual Trigger with Approval)

**Purpose**: Verify production deployment requires approval and deploys correctly after approval

**Prerequisites**:

- [ ] Configuration validation tests passed
- [ ] Production environment has required reviewers configured

**Steps**:

1. Navigate to: `https://github.com/[org]/[repo]/actions`
2. Select "Deploy to Cloudflare Workers" workflow (or production-specific workflow)
3. Click "Run workflow" button
4. Select "production" environment (if prompted)
5. Click "Run workflow" to confirm
6. **Observe**: Workflow should pause, waiting for approval
7. Navigate to workflow run page
8. **Observe**: "Review pending" notification should appear
9. Click "Review deployments" button
10. Select "production" environment
11. Add comment: "Test deployment - approving"
12. Click "Approve and deploy"

**Expected Results**:

- ✅ Workflow pauses after triggering, waiting for approval
- ✅ "Review pending" status visible in workflow run
- ✅ Notification sent to reviewers (if configured)
- ✅ After approval, workflow continues
- ✅ Migration job runs
- ✅ Deployment job runs (uses `environment: production`)
- ✅ Production site updates successfully
- ✅ Workflow completes with green checkmark

**If Failed**:

- **If no approval required**: Check production environment settings, verify "Required reviewers" enabled
- **If approval fails**: Verify reviewer has permission to approve
- **If deployment fails after approval**: Check production secrets, review logs
- See Troubleshooting section

**Security Note**: This test verifies the approval gate works correctly. Production should NEVER deploy without approval.

---

### Test 3.4: Production Deployment (Automatic on Main Push)

**Purpose**: Verify production auto-deploys (with approval) when code is pushed to main

**Prerequisites**:

- [ ] Test 3.3 passed (manual production deployment works)

**Steps**:

```bash
# Merge a change to main branch (or push directly if allowed)
git checkout main
git pull origin main

# Make trivial change
echo "# Test production deployment" >> TEST_PROD_DEPLOY.md
git add TEST_PROD_DEPLOY.md
git commit -m "test: production auto-deploy verification"
git push origin main

# Navigate to: https://github.com/[org]/[repo]/actions
# Find triggered "Deploy to Cloudflare Workers" workflow
```

**Expected Results**:

- ✅ Workflow triggers automatically on push to main
- ✅ Workflow pauses, waiting for approval (same as Test 3.3)
- ✅ Reviewer approves deployment
- ✅ Deployment proceeds to production after approval
- ✅ Production site updates successfully

**If Failed**:

- Check workflow triggers include `push: branches: [main]`
- Verify default environment is production
- See Test 3.3 troubleshooting

**Cleanup**:

```bash
git revert HEAD  # Revert test commit
git push origin main
```

---

## 🔄 4. End-to-End Workflow Testing

### Test 4.1: Complete Development Flow

**Purpose**: Validate full workflow from feature branch → staging → production

**Scenario**: Simulate real development workflow

**Steps**:

```bash
# 1. Create feature branch
git checkout -b feature/test-e2e-workflow

# 2. Make change
echo "export const TEST_FEATURE = 'e2e-test';" > src/test-feature.ts
git add src/test-feature.ts
git commit -m "feat: add test feature for e2e workflow validation"

# 3. Push feature branch
git push origin feature/test-e2e-workflow

# 4. Create PR to dev branch
# (Via GitHub UI or gh CLI)
gh pr create --base dev --title "Test E2E Workflow" --body "Testing complete deployment flow"

# 5. Merge PR to dev
# (Via GitHub UI or gh CLI)
gh pr merge --squash

# 6. Observe: Staging auto-deploys
# Navigate to Actions, verify staging deployment triggered

# 7. Verify staging deployment
# Visit staging URL, verify change deployed

# 8. Create PR from dev to main
gh pr create --base main --head dev --title "Deploy to Production" --body "Deploying tested changes"

# 9. Merge PR to main
gh pr merge --squash

# 10. Observe: Production deployment triggered, waits for approval
# Navigate to Actions, verify deployment waiting

# 11. Approve production deployment
# Review deployments → Approve

# 12. Verify production deployment
# Visit production URL, verify change deployed
```

**Expected Results**:

- ✅ Feature branch → dev merge triggers staging deployment (automatic)
- ✅ Staging deployment succeeds without approval
- ✅ Changes visible on staging site
- ✅ Dev → main merge triggers production deployment
- ✅ Production deployment waits for approval
- ✅ After approval, production deployment succeeds
- ✅ Changes visible on production site
- ✅ No manual intervention needed except production approval

**If Failed**:

- Review individual test results (3.1 - 3.4)
- Check PR merge settings (branch protection rules)
- Verify workflow triggers correctly configured
- See Troubleshooting section

**Cleanup**:

```bash
# Revert changes
git checkout main
git pull origin main
git revert HEAD  # Revert merge commit
git push origin main

git checkout dev
git pull origin dev
git revert HEAD  # Revert feature commit
git push origin dev

# Delete feature branch
git branch -D feature/test-e2e-workflow
git push origin --delete feature/test-e2e-workflow
```

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: "Environment not found" error in workflow

**Symptoms**:

- Workflow fails with "environment 'staging' not found"

**Solutions**:

1. Verify environment name in GitHub UI matches workflow exactly (case-sensitive)
   - UI: "staging" (lowercase)
   - Workflow: `environment: staging`
2. Re-create environment if needed
3. Wait a few minutes for GitHub to propagate changes

**Verify Fix**:

Re-run workflow, should use environment correctly.

---

#### Issue: Secrets not available in workflow

**Symptoms**:

- Workflow fails with "secret CLOUDFLARE_API_TOKEN not found"
- Deployment fails with authentication errors

**Solutions**:

1. Verify secrets configured in **Environment secrets** (not Repository secrets)
   - Navigate to: Settings → Environments → [staging/production] → Environment secrets
2. Verify secret names match exactly (case-sensitive):
   - ✅ `CLOUDFLARE_API_TOKEN`
   - ❌ `CLOUDFLARE_TOKEN` or `cloudflare_api_token`
3. Verify workflow job uses `environment:` field (required for environment secrets)

**Verify Fix**:

```bash
# Check workflow file
cat .github/workflows/deploy-staging.yml | grep "environment:"
# Should show: environment: staging

# Re-run workflow after fixing secrets
```

---

#### Issue: Approval gate doesn't appear

**Symptoms**:

- Production deployment proceeds without approval

**Solutions**:

1. Verify production environment has "Required reviewers" enabled:
   - Navigate to: Settings → Environments → production
   - Check "Environment protection rules" section
   - Enable "Required reviewers", add reviewers
2. Verify workflow uses `environment: production`
3. Re-save environment settings (sometimes GitHub needs re-save)

**Verify Fix**:

Trigger production deployment manually, verify approval gate appears before deployment starts.

---

#### Issue: Deployment fails with Cloudflare authentication error

**Symptoms**:

- Workflow fails at wrangler deploy step
- Error: "Authentication error" or "Invalid API token"

**Solutions**:

1. Verify API token in secret is correct (regenerate if unsure)
2. Verify token has required permissions:
   - Workers Scripts: Edit
   - D1: Edit (if using migrations)
   - Account Settings: Read
3. Test token locally:

```bash
export CLOUDFLARE_API_TOKEN="paste_token_here"
npx wrangler whoami
# Should show account info without errors
unset CLOUDFLARE_API_TOKEN
```

4. Update secret in GitHub Environment secrets
5. Re-run workflow

---

#### Issue: Staging doesn't auto-deploy on dev branch push

**Symptoms**:

- Push to dev branch doesn't trigger staging deployment

**Solutions**:

1. Verify workflow triggers include dev branch:

```yaml
on:
  push:
    branches:
      - dev
      - develop
```

2. Verify workflow file is on dev branch (not just main):

```bash
git checkout dev
git pull origin dev
cat .github/workflows/deploy-staging.yml | head -10
# Should show workflow with dev branch trigger
```

3. Push workflow file to dev if missing:

```bash
git checkout main
git checkout .github/workflows/deploy-staging.yml
git checkout dev
git add .github/workflows/deploy-staging.yml
git commit -m "ci: add staging deployment workflow to dev branch"
git push origin dev
```

---

## ✅ Testing Checklist

Before marking Phase 3 complete:

### Automated Tests

- [ ] Workflow syntax validation passes (actionlint)
- [ ] All workflow files valid YAML
- [ ] No shellcheck errors

### Configuration Tests

- [ ] GitHub Environments configured (staging, production)
- [ ] Environment secrets present (3 per environment)
- [ ] Production approval gate enabled

### Deployment Tests

- [ ] Staging auto-deploys on dev branch push (Test 3.1)
- [ ] Staging manual deployment works (Test 3.2)
- [ ] Production requires approval (Test 3.3)
- [ ] Production deploys after approval (Test 3.3)
- [ ] Production auto-triggers on main push (Test 3.4)

### End-to-End Tests

- [ ] Complete development flow tested (Test 4.1)
- [ ] Feature → Staging → Production flow works
- [ ] No manual intervention except production approval

### Validation

- [ ] Staging site accessible and up-to-date
- [ ] Production site accessible and up-to-date
- [ ] Deployment logs clear and informative
- [ ] Rollback tested (or procedure validated)

---

## 📊 Success Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Workflow Syntax | Valid | - | ⏳ |
| Staging Auto-Deploy | 100% success | - | ⏳ |
| Production Approval | 100% required | - | ⏳ |
| Deployment Success | ≥99% | - | ⏳ |
| Approval Response Time | <30 min | - | ⏳ |

---

## 📝 Test Report Template

After completing all tests, document results:

```markdown
## Phase 3 Testing Report

**Tester**: [Name]
**Date**: [Date]
**Environment**: [Repository URL]

### Test Results

| Test | Status | Notes |
|------|--------|-------|
| Workflow Syntax (2 files) | ✅ Pass | No errors |
| GitHub Environments Config | ✅ Pass | Both environments configured |
| Staging Auto-Deploy | ✅ Pass | Deployed in 3m 45s |
| Staging Manual Deploy | ✅ Pass | Workflow_dispatch works |
| Production Approval Gate | ✅ Pass | Required approval before deploy |
| Production Deploy | ✅ Pass | Deployed after approval |
| End-to-End Flow | ✅ Pass | Full workflow validated |

### Issues Found

[List any issues encountered and resolutions]

### Recommendations

[Any suggestions for improvements]

### Verdict

- [x] ✅ All tests passed - Phase 3 ready for production use
- [ ] 🔧 Tests passed with minor issues - Address before production
- [ ] ❌ Tests failed - Rework required

**Next Steps**: [e.g., Move to Phase 4, Address issues, etc.]
```

---

**Testing Guide Created**: 2025-11-11
**Estimated Testing Time**: 1-2 hours (includes setup, execution, validation)
**Test Count**: 8 manual tests + 2 automated validations
**Critical Tests**: Production approval gate (Test 3.3), End-to-end flow (Test 4.1)
