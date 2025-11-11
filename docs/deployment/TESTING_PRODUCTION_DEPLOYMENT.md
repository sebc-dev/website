# Testing Production Deployment Workflow

This guide explains how to test the production deployment workflow with GitHub Environment protection.

## Overview

The production deployment workflow now includes:

- **Manual approval required** before deployment proceeds
- **Environment-specific secrets** (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_WORKER_NAME)
- **GitHub Environment tracking** for audit trail
- **Health check verification** after deployment

## Prerequisites

Before testing, ensure:

1. ✅ GitHub Environment "production" is configured
2. ✅ Production environment has required reviewer (you)
3. ✅ Environment secrets are configured:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_WORKER_NAME`
4. ✅ Workflow file `.github/workflows/deploy.yml` includes `environment: production`

## Test Scenarios

### Test 1: Manual Deployment with Approval

This test verifies that manual deployments require approval.

#### Steps:

1. **Navigate to GitHub Actions**

   ```
   https://github.com/sebc-dev/website/actions/workflows/deploy.yml
   ```

2. **Click "Run workflow"**
   - Branch: `dev` (or `main`)
   - Leave default options
   - Click green "Run workflow" button

3. **Observe Workflow Behavior**
   - Workflow starts immediately
   - Job "check-trigger" completes (validates trigger type)
   - Job "deploy" starts but **PAUSES** waiting for approval

4. **Approval Screen**
   - You'll see: "⏸️ Waiting for approval" with a yellow icon
   - Click **"Review deployments"** button
   - A modal appears showing:
     - Environment: production
     - Commit SHA
     - Workflow details
   - Check the box for "production"
   - Add optional comment (e.g., "Testing deployment workflow")
   - Click **"Approve and deploy"**

5. **Verify Deployment Proceeds**
   - Job "deploy" resumes immediately after approval
   - Build and deployment steps execute
   - Job "verify-deployment" runs health check
   - Job "deployment-logging" creates artifacts and summary

6. **Expected Result**
   - ✅ Deployment completes successfully
   - ✅ Worker is accessible (health check passes)
   - ✅ Deployment summary visible in workflow UI
   - ✅ Environment URL updated in GitHub Environments page

#### Verification Commands:

```bash
# Check recent deployments
gh run list --workflow=deploy.yml --limit 5

# View specific run details
gh run view <run-id>

# Check environment deployments in GitHub UI
# Settings → Environments → production → Deployments
```

---

### Test 2: Automatic Deployment After Quality Checks

This test verifies automatic deployment when quality checks pass.

#### Steps:

1. **Push code to main or develop branch**

   ```bash
   git checkout main
   git merge dev
   git push origin main
   ```

2. **Monitor Quality Checks Workflow**
   - Navigate to Actions tab
   - Find "Quality Checks" workflow
   - Wait for it to complete

3. **Observe Deploy Workflow Trigger**
   - After quality checks pass, deploy workflow triggers automatically
   - Workflow waits for approval (same as Test 1)

4. **Approve and Verify**
   - Follow approval steps from Test 1
   - Verify deployment completes

#### Expected Result:

- ✅ Quality checks pass
- ✅ Deploy workflow triggers automatically
- ✅ Approval required (not bypassed)
- ✅ Deployment completes after approval

---

### Test 3: Rejection of Deployment

This test verifies that rejecting deployment prevents execution.

#### Steps:

1. **Trigger manual deployment** (see Test 1)

2. **When approval prompt appears:**
   - Click "Review deployments"
   - Check the box for "production"
   - Add comment: "Testing rejection workflow"
   - Click **"Reject"** instead of Approve

3. **Expected Result:**
   - ✅ Job "deploy" is cancelled
   - ✅ Workflow fails with "Deployment rejected" message
   - ✅ No deployment occurs
   - ✅ Worker remains at previous version

---

### Test 4: Multiple Reviewers (Optional)

If you have team members, test multi-reviewer approval.

#### Setup:

1. **Add additional reviewers**
   - Settings → Environments → production
   - Edit "Required reviewers"
   - Add 2+ team members
   - Save

2. **Trigger deployment**

3. **Expected Behavior:**
   - Any one of the configured reviewers can approve
   - First approval proceeds deployment
   - Other reviewers see "Already approved" status

---

## Troubleshooting

### Issue: Workflow doesn't pause for approval

**Symptoms:**

- Deployment proceeds immediately without approval prompt

**Possible Causes:**

1. Environment name mismatch (`environment: production` in workflow doesn't match GitHub Environment name)
2. No required reviewers configured in environment
3. Workflow triggered by a bot or automated process (GitHub Actions bots may bypass environment protection)

**Solution:**

```bash
# Verify environment name in workflow
cat .github/workflows/deploy.yml | grep "environment:"
# Should show: environment: production

# Check GitHub UI
# Settings → Environments → production → Required reviewers should list at least 1 reviewer
```

---

### Issue: Secrets not available during deployment

**Symptoms:**

- Deployment fails with "CLOUDFLARE_API_TOKEN is not set"
- Error: "Missing required secret"

**Possible Causes:**

1. Secrets configured in repository instead of environment
2. Environment name mismatch
3. Secrets not added to production environment

**Solution:**

```bash
# Verify secrets location
# Settings → Environments → production → Environment secrets
# NOT Settings → Secrets and variables → Actions (repository secrets)

# Re-add secrets if needed (see Phase 3, Commit 2 documentation)
```

---

### Issue: Health check fails after deployment

**Symptoms:**

- Deployment succeeds but verify-deployment job fails
- HTTP 404 or 500 error from worker URL

**Possible Causes:**

1. Worker build failed (syntax error, missing dependencies)
2. Worker URL not configured or incorrect
3. Cloudflare propagation delay

**Solution:**

```bash
# Check Cloudflare Workers Dashboard
# https://dash.cloudflare.com/ → Workers → [Worker Name] → Logs

# Verify CLOUDFLARE_WORKER_NAME is correctly configured
# Settings → Environments → production → CLOUDFLARE_WORKER_NAME

# If propagation delay, re-run health check manually:
# (URL is constructed from worker name: https://<worker-name>.chauveau-sebastien.workers.dev)
curl -I https://your-worker-name.chauveau-sebastien.workers.dev
```

---

## Success Criteria

A successful test includes:

- ✅ **Manual approval required** - Workflow pauses at deploy job
- ✅ **Secrets accessible** - Environment secrets inject correctly
- ✅ **Deployment succeeds** - Cloudflare worker deploys without errors
- ✅ **Health check passes** - Worker responds with HTTP 200
- ✅ **Audit trail** - GitHub Environments page shows deployment history
- ✅ **Rejection works** - Rejecting deployment prevents execution

---

## Next Steps

After successful testing:

1. **Document any issues** encountered and resolutions
2. **Update team documentation** with approval workflow
3. **Configure notifications** for deployment approvals (GitHub → Settings → Notifications)
4. **Consider staging environment** if needed (requires Phase 3 adjustments)

---

## Production Deployment Best Practices

### Before Approving Deployment:

1. **Review the commit** being deployed
   - Check commit message and changes
   - Verify tests pass in CI/CD

2. **Check timing**
   - Avoid deployments during high-traffic periods
   - Coordinate with team if major changes

3. **Monitor after deployment**
   - Watch Cloudflare Dashboard for errors
   - Check health check results
   - Verify functionality manually

### Rollback Procedure:

If deployment causes issues:

1. **Immediate rollback via Cloudflare**
   - Go to Cloudflare Dashboard → Workers → [Worker Name]
   - Click "Deployments" tab
   - Find last successful deployment
   - Click "Rollback to this version"

2. **Fix and re-deploy**
   - Investigate error logs
   - Fix issues locally
   - Re-run deployment workflow

---

## References

- **GitHub Environments Documentation**: https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment
- **Cloudflare Workers Dashboard**: https://dash.cloudflare.com/
- **Project Deployment Workflow**: `.github/workflows/deploy.yml`
- **Environment Setup Guide**: `docs/specs/epics/epic_0/story_0_7/implementation/phase_3/ENVIRONMENT_SETUP.md`

---

**Document Created**: 2025-11-11
**Phase**: Epic 0, Story 0.7, Phase 3
**Author**: Claude Code Assistant
