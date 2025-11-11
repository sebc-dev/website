# Phase 3 - Checklist per Commit

This document provides a detailed checklist for each atomic commit of Phase 3.

---

## 📋 Commit 1: Configure GitHub Environments

**Files**: GitHub UI configuration (documented in commit message)
**Estimated Duration**: 30-45 minutes

### Implementation Tasks

- [ ] Navigate to repository Settings → Environments
- [ ] Create "staging" environment:
  - [ ] Click "New environment"
  - [ ] Name: `staging`
  - [ ] Deployment branches: Allow all branches
  - [ ] Environment URL: (set if staging URL known, or update later)
  - [ ] No required reviewers
  - [ ] No wait timer
  - [ ] Save environment
- [ ] Create "production" environment:
  - [ ] Click "New environment"
  - [ ] Name: `production`
  - [ ] Deployment branches: Allow all branches (or restrict to main)
  - [ ] Environment URL: (set if production URL known, or update later)
  - [ ] Enable "Required reviewers"
  - [ ] Add at least 1 reviewer (yourself or team lead)
  - [ ] Optionally set wait timer (e.g., 5 minutes)
  - [ ] Save environment
- [ ] Document configuration in commit message

### Validation

```bash
# Validate via GitHub UI
# Navigate to: Settings → Environments
# Expected: "staging" and "production" environments visible
```

**Expected Result**: Two environments visible in repository settings, production has approval gate configured

### Review Checklist

#### Environment Configuration

- [ ] "staging" environment created successfully
- [ ] "production" environment created successfully
- [ ] Production environment has "Required reviewers" enabled (1+ reviewers)
- [ ] Environment URLs set (if known) or marked as TBD
- [ ] Deployment branch rules appropriate (all branches or specific branches)

#### Documentation

- [ ] Configuration process documented in commit message
- [ ] Reviewer requirements documented
- [ ] Environment purposes clear (staging = auto-deploy, production = approval)

### Commit Message

```bash
git add . # No files to add, but document configuration
git commit --allow-empty -m "ci(deploy): configure GitHub Environments for staging and production

- Created \"staging\" environment (no approval required)
- Created \"production\" environment (requires 1+ reviewer approval)
- Set environment URLs for easy access post-deployment
- Configured deployment branch rules

Configuration details:
- Staging: Auto-deploy from dev/develop branches
- Production: Manual approval required, main branch
- Reviewers: [list reviewer names/teams]

Part of Phase 3 - Commit 1/5"
```

**Note**: Use `--allow-empty` since this is infrastructure configuration, not code changes.

---

## 📋 Commit 2: Add Environment-Specific Secrets

**Files**: `.env.example` (updated), GitHub UI configuration
**Estimated Duration**: 30-45 minutes

### Implementation Tasks

- [ ] Generate Cloudflare API tokens (if not already done):
  - [ ] Navigate to Cloudflare dashboard → My Profile → API Tokens
  - [ ] Create staging token: "Workers Deploy + D1 Edit" permissions
  - [ ] Create production token: "Workers Deploy + D1 Edit" permissions (ideally separate)
  - [ ] Copy token values (will only be shown once)
- [ ] Configure staging environment secrets:
  - [ ] Navigate to Settings → Environments → staging → Environment secrets
  - [ ] Add `CLOUDFLARE_API_TOKEN`: [staging token value]
  - [ ] Add `CLOUDFLARE_ACCOUNT_ID`: [your Cloudflare account ID]
  - [ ] Add `CLOUDFLARE_WORKER_NAME`: [staging worker name, e.g., "sebc-dev-staging"]
- [ ] Configure production environment secrets:
  - [ ] Navigate to Settings → Environments → production → Environment secrets
  - [ ] Add `CLOUDFLARE_API_TOKEN`: [production token value]
  - [ ] Add `CLOUDFLARE_ACCOUNT_ID`: [your Cloudflare account ID]
  - [ ] Add `CLOUDFLARE_WORKER_NAME`: [production worker name, e.g., "sebc-dev-prod"]
- [ ] Update `.env.example` to document environment variables
- [ ] Verify no sensitive values committed to git

### Validation

```bash
# Validate via GitHub UI
# Navigate to: Settings → Environments → [staging/production] → Environment secrets
# Expected: 3 secrets in each environment (API_TOKEN, ACCOUNT_ID, WORKER_NAME)

# Verify .env.example updated
cat .env.example | grep CLOUDFLARE
# Expected: Lines documenting CLOUDFLARE_* variables
```

**Expected Result**: All required secrets configured in both environments, documented in `.env.example`

### Review Checklist

#### Staging Environment Secrets

- [ ] `CLOUDFLARE_API_TOKEN` configured
- [ ] `CLOUDFLARE_ACCOUNT_ID` configured
- [ ] `CLOUDFLARE_WORKER_NAME` configured
- [ ] Secret values correct (test by viewing secret names in UI)

#### Production Environment Secrets

- [ ] `CLOUDFLARE_API_TOKEN` configured (different from staging if possible)
- [ ] `CLOUDFLARE_ACCOUNT_ID` configured
- [ ] `CLOUDFLARE_WORKER_NAME` configured (different from staging)
- [ ] Secret values correct

#### Documentation

- [ ] `.env.example` updated with CLOUDFLARE variables
- [ ] `.env.example` shows example values (not real secrets)
- [ ] `.env.example` documents which secrets are required
- [ ] Commit message documents secret setup process

#### Security

- [ ] No actual secret values committed to git
- [ ] `.env` file in `.gitignore` (verify if not already)
- [ ] Tokens have minimum required permissions (Workers Deploy + D1)
- [ ] Separate tokens for staging and production (recommended)

### Commit Message

```bash
git add .env.example
git commit -m "ci(deploy): add environment-specific secrets for staging and production

- Configured staging environment secrets (CLOUDFLARE_API_TOKEN, ACCOUNT_ID, WORKER_NAME)
- Configured production environment secrets (separate tokens for security)
- Updated .env.example to document required environment variables
- Used scoped API tokens with minimal permissions (Workers Deploy + D1)

Environment-specific values:
- Staging Worker: sebc-dev-staging
- Production Worker: sebc-dev-prod
- Tokens use least-privilege permissions

Part of Phase 3 - Commit 2/5"
```

---

## 📋 Commit 3: Enhance deploy.yml with Environment Support

**Files**: `.github/workflows/deploy.yml`
**Estimated Duration**: 45-60 minutes

### Implementation Tasks

- [ ] Open `.github/workflows/deploy.yml` for editing
- [ ] Add `environment` input to `workflow_dispatch`:
  ```yaml
  on:
    workflow_dispatch:
      inputs:
        environment:
          description: 'Environment to deploy to'
          required: true
          type: choice
          options:
            - staging
            - production
    push:
      branches:
        - main # Auto-deploy to production on main
  ```
- [ ] Add `environment` field to deploy job:
  ```yaml
  jobs:
    deploy:
      environment: ${{ inputs.environment || 'production' }}
  ```
- [ ] Update secrets references to use environment secrets:
  ```yaml
  apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
  accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
  ```
- [ ] Add environment info to workflow outputs/summary
- [ ] Update workflow name to reflect multi-environment support
- [ ] Test workflow syntax validation

### Validation

```bash
# Validate workflow syntax
pnpm exec actionlint .github/workflows/deploy.yml

# Expected: No errors

# Manual test (in GitHub UI):
# 1. Go to Actions → Deploy to Cloudflare Workers
# 2. Click "Run workflow"
# 3. Verify "Environment to deploy to" dropdown appears
# 4. Select "staging" and run
# 5. Verify deployment uses staging secrets
```

**Expected Result**: Workflow syntax valid, environment selection works, deployment uses correct secrets

### Review Checklist

#### Workflow Configuration

- [ ] `environment` input added to `workflow_dispatch`
- [ ] Input is `required: true` and `type: choice`
- [ ] Options include "staging" and "production"
- [ ] `environment:` field set on deploy job
- [ ] Default environment logic correct (`inputs.environment || 'production'`)
- [ ] Workflow still triggers on push to main (auto-production deploy)

#### Secrets and Variables

- [ ] Secrets referenced correctly: `${{ secrets.CLOUDFLARE_API_TOKEN }}`
- [ ] Secrets will be resolved from environment context automatically
- [ ] No hardcoded values in workflow

#### User Experience

- [ ] Workflow name clear ("Deploy to Cloudflare Workers")
- [ ] Environment selection description helpful
- [ ] Deployment summary includes environment info (add if not present)
- [ ] Logs clearly indicate which environment is being deployed

#### Code Quality

- [ ] Workflow syntax valid (actionlint passes)
- [ ] YAML indentation correct
- [ ] No commented-out code
- [ ] Comments added where logic is complex

### Commit Message

```bash
git add .github/workflows/deploy.yml
git commit -m "feat(deploy): add environment support to deployment workflow

- Add environment input to workflow_dispatch (staging/production)
- Configure job to use GitHub Environment contexts
- Use environment-specific secrets automatically
- Default to production on main branch pushes
- Add environment info to deployment summary

Benefits:
- Manual deployments can target staging or production
- Automatic deployments to production from main branch
- Environment-specific secrets resolved automatically
- Approval gates enforced per environment config

Part of Phase 3 - Commit 3/5"
```

---

## 📋 Commit 4: Create Staging Deployment Workflow

**Files**: `.github/workflows/deploy-staging.yml` (new file)
**Estimated Duration**: 60-75 minutes

### Implementation Tasks

- [ ] Create `.github/workflows/deploy-staging.yml`
- [ ] Add workflow metadata and triggers:

  ```yaml
  name: Deploy to Staging

  on:
    push:
      branches:
        - dev
        - develop
    workflow_dispatch:
  ```

- [ ] Add permissions block (minimal required)
- [ ] Add concurrency group to cancel outdated staging deploys
- [ ] Copy migration job from Phase 1 (or reference if reusable)
- [ ] Create deploy job with `environment: staging`
- [ ] Add deployment verification step (health check or smoke test)
- [ ] Add deployment summary output
- [ ] Test workflow syntax

### Validation

```bash
# Validate workflow syntax
pnpm exec actionlint .github/workflows/deploy-staging.yml

# Expected: No errors

# Manual test (in GitHub UI):
# Option 1: Push to dev branch
git checkout -b test-staging-deploy
git push origin test-staging-deploy:dev
# Verify workflow triggers and deploys to staging

# Option 2: Manual trigger
# Go to Actions → Deploy to Staging → Run workflow
```

**Expected Result**: Workflow triggers on dev/develop push, deploys to staging automatically, no approval required

### Review Checklist

#### Workflow Structure

- [ ] Workflow name: "Deploy to Staging"
- [ ] Triggers on push to `dev` and `develop` branches
- [ ] Manual trigger enabled (`workflow_dispatch`)
- [ ] Permissions block present and minimal
- [ ] Concurrency group configured (cancel in-progress staging deploys)

#### Migration Job

- [ ] Migration job included (runs before deployment)
- [ ] Uses correct database binding (DB)
- [ ] Cloudflare secrets available
- [ ] Error handling for "no migrations to apply"

#### Deployment Job

- [ ] Uses `environment: staging`
- [ ] Depends on migration job (`needs: [migrate-database]`)
- [ ] Checkout action with correct ref
- [ ] Setup Node.js and pnpm
- [ ] Build step (if needed, or reuse artifact)
- [ ] Cloudflare wrangler-action@v3 configured:
  - [ ] `apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}`
  - [ ] `accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}`
  - [ ] `command: deploy`
- [ ] Deployment verification step (e.g., curl health endpoint)

#### User Experience

- [ ] Clear workflow name distinguishes from production deploy
- [ ] Deployment summary shows staging URL
- [ ] Logs clearly indicate staging deployment
- [ ] Failure notifications clear and actionable

#### Code Quality

- [ ] Workflow syntax valid (actionlint passes)
- [ ] No code duplication (consider reusable workflows if heavy duplication)
- [ ] YAML properly formatted
- [ ] Comments where needed

### Commit Message

```bash
git add .github/workflows/deploy-staging.yml
git commit -m "feat(ci): create automated staging deployment workflow

- Auto-deploy on push to dev/develop branches
- Manual trigger available via workflow_dispatch
- Runs database migrations before deployment
- Deploys to Cloudflare staging worker
- Includes deployment verification step
- Cancels outdated staging deploys (concurrency group)

Workflow behavior:
- Trigger: Push to dev/develop or manual
- Environment: staging (no approval required)
- Migrations: Automated via wrangler d1 migrations
- Deployment: Cloudflare Workers (staging instance)

Part of Phase 3 - Commit 4/5"
```

---

## 📋 Commit 5: Document Environment Management

**Files**: `docs/deployment/environments-guide.md` (new), `README.md` (updated)
**Estimated Duration**: 45-60 minutes

### Implementation Tasks

- [ ] Create `docs/deployment/environments-guide.md`
- [ ] Add guide structure:
  - [ ] Introduction and purpose
  - [ ] Environment overview (staging vs production)
  - [ ] When to use each environment
  - [ ] Deployment procedures (automatic and manual)
  - [ ] Environment-specific configuration
  - [ ] Approval process for production
  - [ ] Secret management and rotation
  - [ ] Troubleshooting common issues
  - [ ] Rollback procedures per environment
- [ ] Include deployment workflow diagram (ASCII or reference)
- [ ] Add examples and common scenarios
- [ ] Document GitHub Environments setup (for reproducibility)
- [ ] Update `README.md`:
  - [ ] Add "Deployment" section
  - [ ] Link to environments-guide.md
  - [ ] Add quick deployment commands

### Validation

```bash
# Validate documentation exists and is complete
cat docs/deployment/environments-guide.md | wc -l
# Expected: ~150-200 lines

# Verify README.md updated
cat README.md | grep -A 5 "Deployment"
# Expected: Section with link to environments-guide.md

# Check for broken links (if using markdown linter)
```

**Expected Result**: Comprehensive, clear documentation that any team member can follow

### Review Checklist

#### environments-guide.md Content

- [ ] Introduction explains purpose of multi-environment setup
- [ ] Environment overview clearly distinguishes staging vs production
- [ ] Deployment procedures documented:
  - [ ] Automatic staging deploys (push to dev/develop)
  - [ ] Manual staging deploys (workflow_dispatch)
  - [ ] Production deploys (manual with approval)
- [ ] Environment-specific configuration documented:
  - [ ] Worker names (staging vs production)
  - [ ] Database bindings (if different)
  - [ ] Environment variables
- [ ] Approval process explained:
  - [ ] Who can approve production deploys
  - [ ] How to approve in GitHub UI
  - [ ] What to check before approving
- [ ] Secret management covered:
  - [ ] How to add/update environment secrets
  - [ ] Token permissions required
  - [ ] Rotation procedures
- [ ] Troubleshooting section includes:
  - [ ] Common deployment failures
  - [ ] Environment-specific issues
  - [ ] How to debug in each environment
- [ ] Rollback procedures documented:
  - [ ] How to rollback in staging
  - [ ] How to rollback in production
  - [ ] Using Cloudflare Workers rollback features

#### README.md Updates

- [ ] "Deployment" section added
- [ ] Link to environments-guide.md
- [ ] Quick deployment commands for both environments
- [ ] Link to GitHub Actions workflows

#### Documentation Quality

- [ ] Clear structure with headers and sections
- [ ] Examples provided where helpful
- [ ] External links included (GitHub Docs, Cloudflare Docs)
- [ ] Formatted consistently (Markdown best practices)
- [ ] Diagrams or ASCII art included (optional but helpful)
- [ ] No typos or grammatical errors

### Commit Message

```bash
git add docs/deployment/environments-guide.md README.md
git commit -m "docs(deploy): comprehensive environment management guide

- Created environments-guide.md covering all aspects:
  - Environment overview (staging vs production)
  - Deployment procedures (automatic and manual)
  - Environment-specific configuration
  - Approval process and requirements
  - Secret management and rotation
  - Troubleshooting and debugging
  - Rollback procedures
- Updated README.md with Deployment section
- Included examples and common scenarios
- Documented GitHub Environments setup process

Guide covers:
- When to use each environment
- How to trigger deployments
- Environment differences and configuration
- Production approval workflow
- Secret management best practices

Part of Phase 3 - Commit 5/5"
```

---

## ✅ Final Phase Validation

After all 5 commits:

### Complete Phase Checklist

- [ ] All 5 commits completed and pushed
- [ ] GitHub Environments configured (staging, production)
- [ ] Environment-specific secrets set up
- [ ] Deploy.yml enhanced with environment support
- [ ] Staging deployment workflow created and tested
- [ ] Documentation complete and comprehensive
- [ ] All workflows pass syntax validation (actionlint)
- [ ] Manual test: Staging deployment successful
- [ ] Manual test: Production deployment with approval successful
- [ ] VALIDATION_CHECKLIST.md completed

### Final Validation Commands

```bash
# Validate all workflow files
pnpm exec actionlint .github/workflows/deploy.yml
pnpm exec actionlint .github/workflows/deploy-staging.yml

# Verify documentation complete
cat docs/deployment/environments-guide.md
cat README.md | grep -A 5 "Deployment"

# Check git history
git log --oneline -5
# Expected: 5 commits for Phase 3
```

### Manual Tests Required

- [ ] **Test 1**: Push to dev branch → staging auto-deploys
- [ ] **Test 2**: Manual staging deploy via GitHub UI → succeeds
- [ ] **Test 3**: Manual production deploy via GitHub UI → requires approval
- [ ] **Test 4**: Approve production deploy → succeeds
- [ ] **Test 5**: Verify environment URLs accessible (staging and production)

**Phase 3 is complete when all checkboxes are checked! 🎉**

---

## 📝 Notes

### Environment-Specific Notes

- If using Cloudflare Workers Environments (instead of separate Workers), adjust `CLOUDFLARE_WORKER_NAME` to use environment syntax
- If database differs between environments, update bindings in wrangler.jsonc
- Consider using different Cloudflare accounts for staging/production for maximum isolation

### Common Issues

**Issue**: Environment secrets not available in workflow
**Solution**: Verify environment name in workflow matches exactly ("staging" not "Staging")

**Issue**: Production approval not required
**Solution**: Check environment protection rules in Settings → Environments → production

**Issue**: Staging deployment fails on dev branch push
**Solution**: Verify workflow triggers include `dev` and `develop` branches

---

**Checklist Created**: 2025-11-11
**Total Commits**: 5
**Estimated Time**: 5-6.5 hours (implementation + review)
