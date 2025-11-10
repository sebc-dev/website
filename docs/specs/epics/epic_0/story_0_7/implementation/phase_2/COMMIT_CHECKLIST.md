# Phase 2 - Checklist per Commit

This document provides a detailed checklist for each atomic commit of Phase 2.

---

## 📋 Commit 1: Create Deployment Workflow Structure

**Files**: `.github/workflows/deploy.yml` (new)
**Estimated Duration**: 30-45 minutes

### Implementation Tasks

- [x] Create `.github/workflows/deploy.yml` file
- [x] Add workflow name: "Deploy to Cloudflare Workers"
- [x] Set minimal permissions (`contents: read`)
- [x] Configure concurrency group to prevent overlapping deployments
- [x] Add workflow-level timeout (15 minutes)
- [x] Create placeholder job structure (deploy job)
- [x] Add comments explaining workflow purpose

### Validation

```bash
# Validate YAML syntax
pnpm exec actionlint .github/workflows/deploy.yml

# Check file exists
ls -la .github/workflows/deploy.yml

# View file structure
cat .github/workflows/deploy.yml
```

**Expected Result**: Valid YAML file with basic workflow structure, actionlint reports no errors

### Review Checklist

#### Workflow Configuration
- [ ] Workflow name is descriptive and clear
- [ ] Permissions follow least-privilege principle (`contents: read`)
- [ ] Concurrency group configured: `group: deploy-${{ github.ref }}`
- [ ] Concurrency cancel-in-progress is `true`
- [ ] Workflow timeout is reasonable (15 minutes)

#### File Structure
- [ ] File location correct: `.github/workflows/deploy.yml`
- [ ] YAML syntax is valid (no tabs, proper indentation)
- [ ] Comments explain purpose and structure
- [ ] Placeholder jobs structure is clear

#### Code Quality
- [ ] Clear naming conventions
- [ ] No hardcoded values that should be variables
- [ ] Comments are helpful and concise
- [ ] Follows GitHub Actions best practices

### Commit Message

```bash
git add .github/workflows/deploy.yml
git commit -m "feat(ci): create deployment workflow structure

- Add deploy.yml workflow file
- Configure minimal permissions (contents: read)
- Set concurrency group to prevent overlapping deployments
- Add placeholder job structure for deployment

Part of Phase 2 - Commit 1/5"
```

---

## 📋 Commit 2: Configure Workflow Triggers and Dependencies

**Files**: `.github/workflows/deploy.yml` (modify)
**Estimated Duration**: 40-60 minutes

### Implementation Tasks

- [ ] Add `workflow_dispatch` trigger for manual deployments
- [ ] Add input parameters to `workflow_dispatch` (optional: skip_verification, dry_run)
- [ ] Add `workflow_run` trigger to run after quality workflow succeeds
- [ ] Configure `workflow_run` to trigger only on main/develop branches
- [ ] Add `push` trigger for main branch (optional, can defer to workflow_run)
- [ ] Document trigger behavior in comments
- [ ] Add conditional logic based on trigger type

### Validation

```bash
# Validate YAML syntax
pnpm exec actionlint .github/workflows/deploy.yml

# Test manual trigger (GitHub CLI)
gh workflow run deploy.yml

# Check workflow appears in available workflows
gh workflow list | grep -i deploy

# View workflow runs
gh run list --workflow=deploy.yml --limit 5
```

**Expected Result**: Workflow can be triggered manually, appears in workflow list

### Review Checklist

#### Trigger Configuration
- [ ] `workflow_dispatch` configured with clear description
- [ ] Input parameters are optional and documented
- [ ] `workflow_run` triggers after quality workflow completes successfully
- [ ] `workflow_run` limited to appropriate branches (main, develop)
- [ ] Trigger types are clearly documented in comments

#### Conditional Logic
- [ ] Conditions use proper GitHub Actions syntax
- [ ] Branch filters are correct
- [ ] Workflow dependencies are explicit
- [ ] No redundant triggers

#### Code Quality
- [ ] Input parameters have descriptions
- [ ] Default values are sensible
- [ ] Comments explain trigger strategy
- [ ] Syntax is clean and readable

### Commit Message

```bash
git add .github/workflows/deploy.yml
git commit -m "feat(ci): configure deployment triggers and dependencies

- Add workflow_dispatch for manual deployments with optional inputs
- Add workflow_run trigger to deploy after quality workflow succeeds
- Limit automatic deployments to main/develop branches
- Document trigger behavior and dependencies

Part of Phase 2 - Commit 2/5"
```

---

## 📋 Commit 3: Add Cloudflare Deployment Job

**Files**: `.github/workflows/deploy.yml` (modify)
**Estimated Duration**: 60-90 minutes

### Implementation Tasks

- [ ] Define `deploy` job with `runs-on: ubuntu-latest`
- [ ] Add job timeout (10 minutes)
- [ ] Add checkout step (`actions/checkout@v4`)
- [ ] Add pnpm setup (`pnpm/action-setup@v4`)
- [ ] Add Node.js setup (`actions/setup-node@v4`)
- [ ] Configure pnpm cache for faster installs
- [ ] Add dependencies installation step (`pnpm install --frozen-lockfile`)
- [ ] Add build step (`pnpm build`)
- [ ] Add Cloudflare deployment step using `cloudflare/wrangler-action@v3`
- [ ] Configure wrangler-action with API token and account ID from secrets
- [ ] Add deployment command: `wrangler deploy`
- [ ] Set working directory for wrangler if needed

### Validation

```bash
# Validate YAML syntax
pnpm exec actionlint .github/workflows/deploy.yml

# Ensure secrets are configured (check GitHub repo settings)
gh secret list | grep CLOUDFLARE

# Test deployment (requires secrets configured)
gh workflow run deploy.yml

# Monitor deployment progress
gh run watch

# Check deployment logs
gh run view --log
```

**Expected Result**: Application successfully builds and deploys to Cloudflare Workers, Worker is accessible

### Review Checklist

#### Job Configuration
- [ ] Job name is descriptive: "Deploy to Cloudflare Workers"
- [ ] Runs on `ubuntu-latest`
- [ ] Job timeout set to 10 minutes
- [ ] Job runs after migration job (if Phase 1 is complete)

#### Build Steps
- [ ] Checkout uses latest action version (`@v4`)
- [ ] pnpm setup configured correctly
- [ ] Node.js version matches project requirements (20.x from package.json)
- [ ] pnpm cache configured for performance
- [ ] Dependencies install uses `--frozen-lockfile`
- [ ] Build command is correct (`pnpm build`)

#### Deployment Step
- [ ] Uses official `cloudflare/wrangler-action@v3`
- [ ] `apiToken` references secret: `${{ secrets.CLOUDFLARE_API_TOKEN }}`
- [ ] `accountId` references secret: `${{ secrets.CLOUDFLARE_ACCOUNT_ID }}`
- [ ] Command is correct: `wrangler deploy`
- [ ] Working directory set if needed

#### Security
- [ ] No hardcoded secrets or API tokens
- [ ] Secrets properly referenced using `${{ secrets.NAME }}`
- [ ] No secrets exposed in logs
- [ ] Minimal permissions for job

### Commit Message

```bash
git add .github/workflows/deploy.yml
git commit -m "feat(ci): add Cloudflare Workers deployment job

- Configure deploy job with pnpm and Node.js setup
- Add build step for OpenNext
- Integrate cloudflare/wrangler-action@v3 for deployment
- Use GitHub secrets for Cloudflare API token and account ID
- Set job timeout to 10 minutes

Part of Phase 2 - Commit 3/5"
```

---

## 📋 Commit 4: Implement Deployment Verification and Health Check

**Files**: `.github/workflows/deploy.yml` (modify)
**Estimated Duration**: 45-70 minutes

### Implementation Tasks

- [ ] Add post-deployment verification step
- [ ] Configure health check URL (Worker URL from wrangler output)
- [ ] Implement HTTP health check using curl
- [ ] Add retry logic (3 attempts, 10 second delay between retries)
- [ ] Set success criteria (HTTP 200 response)
- [ ] Add failure handling (exit with error if health check fails)
- [ ] Output deployment success message
- [ ] Add step to report deployment status to GitHub
- [ ] Document rollback procedure in comments

### Validation

```bash
# Validate YAML syntax
pnpm exec actionlint .github/workflows/deploy.yml

# Test full deployment with verification
gh workflow run deploy.yml

# Monitor verification step
gh run watch --log | grep -A 10 "verification"

# Check workflow summary for deployment status
gh run view
```

**Expected Result**: Health check successfully validates deployed Worker is accessible and returns HTTP 200

### Review Checklist

#### Health Check Configuration
- [ ] Health check targets correct Worker URL
- [ ] URL is retrieved from wrangler deploy output or configured
- [ ] HTTP method is appropriate (GET for health check)
- [ ] Success criteria clear (HTTP 200)
- [ ] Timeout per request is reasonable (10 seconds)

#### Retry Logic
- [ ] Retry count is appropriate (3 attempts)
- [ ] Delay between retries allows for CDN propagation (10 seconds)
- [ ] Retry logic handles transient failures gracefully
- [ ] Final failure triggers workflow failure

#### Error Handling
- [ ] Failed health check triggers workflow failure
- [ ] Error messages are descriptive
- [ ] Deployment status reported correctly
- [ ] Rollback instructions documented in comments

#### Code Quality
- [ ] Bash scripts are clean and readable
- [ ] Error messages don't leak sensitive info
- [ ] Step names are descriptive
- [ ] Comments explain verification logic

### Commit Message

```bash
git add .github/workflows/deploy.yml
git commit -m "feat(ci): implement post-deployment verification

- Add HTTP health check to verify Worker is accessible
- Configure retry logic (3 attempts, 10s delay)
- Set success criteria as HTTP 200 response
- Add failure handling and rollback documentation
- Report deployment status to GitHub

Part of Phase 2 - Commit 4/5"
```

---

## 📋 Commit 5: Add Deployment Logging and Artifact Upload

**Files**: `.github/workflows/deploy.yml` (modify)
**Estimated Duration**: 35-50 minutes

### Implementation Tasks

- [ ] Add step to generate deployment summary
- [ ] Output deployed Worker URL
- [ ] Output deployment timestamp
- [ ] Output commit SHA deployed
- [ ] Capture deployment duration metric
- [ ] Add step to upload deployment logs as artifacts
- [ ] Configure artifact retention (14 days)
- [ ] Add GitHub deployment environment tracking
- [ ] Create workflow job summary with deployment info
- [ ] Add link to deployed Worker in workflow output

### Validation

```bash
# Validate YAML syntax
pnpm exec actionlint .github/workflows/deploy.yml

# Test full deployment with logging
gh workflow run deploy.yml

# Check deployment summary in workflow output
gh run view

# List artifacts uploaded
gh run view --log | grep -A 5 "Upload artifact"

# Download deployment logs artifact
gh run download <run-id>
```

**Expected Result**: Deployment logs captured, artifacts uploaded, workflow summary shows deployment info

### Review Checklist

#### Deployment Summary
- [ ] Summary includes Worker URL
- [ ] Summary includes deployment timestamp
- [ ] Summary includes commit SHA
- [ ] Summary includes deployment duration
- [ ] Summary format is user-friendly

#### Artifact Upload
- [ ] Deployment logs uploaded as artifact
- [ ] Artifact name is descriptive (e.g., `deployment-logs-<timestamp>`)
- [ ] Retention period set appropriately (14 days)
- [ ] Logs don't include sensitive information
- [ ] Artifact size is reasonable

#### GitHub Deployment Tracking
- [ ] Deployment environment configured (if applicable)
- [ ] Environment URL set to Worker URL
- [ ] Deployment status tracked correctly

#### Code Quality
- [ ] Workflow summary uses GitHub Actions syntax (`$GITHUB_STEP_SUMMARY`)
- [ ] Markdown formatting is correct
- [ ] No sensitive data in logs or summary
- [ ] Step names are descriptive

### Commit Message

```bash
git add .github/workflows/deploy.yml
git commit -m "feat(ci): add deployment logging and artifacts

- Generate deployment summary with URL, timestamp, commit SHA
- Upload deployment logs as workflow artifacts (14 day retention)
- Track deployment in GitHub environments
- Add deployment metrics (duration, bundle size)
- Create user-friendly workflow summary

Part of Phase 2 - Commit 5/5"
```

---

## ✅ Final Phase Validation

After all 5 commits:

### Complete Phase Checklist

- [ ] All 5 commits completed
- [ ] Workflow YAML syntax valid
- [ ] GitHub secrets configured (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)
- [ ] Manual deployment tested successfully
- [ ] Automatic deployment (workflow_run) tested
- [ ] Health check validates deployed Worker
- [ ] Deployment logs captured
- [ ] Workflow summary shows deployment info
- [ ] VALIDATION_CHECKLIST.md completed

### Final Validation Commands

```bash
# Validate workflow syntax
pnpm exec actionlint .github/workflows/deploy.yml

# Test manual deployment
gh workflow run deploy.yml

# Monitor deployment
gh run watch

# Check deployment logs
gh run view --log

# Verify Worker is accessible
curl -I <worker-url>

# Check artifacts uploaded
gh run view | grep -i artifact
```

### Integration Testing

- [ ] Deploy from feature branch works (manual dispatch)
- [ ] Deploy after quality workflow succeeds (workflow_run)
- [ ] Health check detects failed deployments
- [ ] Rollback procedures documented and tested
- [ ] Deployment metrics are accurate

---

**Phase 2 is complete when all checkboxes are checked! 🎉**

**Next Steps**: Phase 3 will add environment management (staging/production) and manual approval gates.
