# Phase 3 - Environment Setup

This guide covers all environment setup needed for Phase 3: Multi-Environment Deployment.

---

## 📋 Prerequisites

### Previous Phases

- [x] **Phase 1**: D1 Migrations Automation completed and validated
- [x] **Phase 2**: Basic Deployment Workflow completed and working

**Verification**:

```bash
# Verify Phase 2 deployment workflow exists
cat .github/workflows/deploy.yml

# Verify migrations work
# (Should have been tested in Phase 1)
```

### Tools Required

- [x] **GitHub Account** with admin access to repository
- [x] **Cloudflare Account** with Workers and D1 access
- [x] **Wrangler CLI** installed (`wrangler --version`)
- [x] **Git** configured locally

### Services Required

- [x] **Cloudflare Workers** - Two Workers needed (or use Workers Environments)
- [x] **Cloudflare D1 Database** - Existing database (from Phase 1)
- [x] **GitHub Repository** - With Actions enabled

---

## 🏗️ Cloudflare Infrastructure Setup

### Option A: Separate Workers (Recommended for Isolation)

**Create Staging Worker**:

1. Navigate to Cloudflare Dashboard → Workers & Pages
2. Create new Worker:
   - Name: `sebc-dev-staging` (or your naming convention)
   - Template: Empty worker (will be overwritten by deployment)
3. Note the Worker name for later

**Create Production Worker** (if not already exists):

1. Use existing production worker OR
2. Create new Worker:
   - Name: `sebc-dev-prod` (or your naming convention)
   - Template: Empty worker

**Verification**:

```bash
# List your Workers
npx wrangler deployments list --name=sebc-dev-staging
npx wrangler deployments list --name=sebc-dev-prod

# Expected: Workers exist (may be empty initially)
```

### Option B: Workers Environments (Alternative)

Use Cloudflare Workers Environments feature:

1. Keep single worker name (e.g., `sebc-dev`)
2. Use environment suffixes in wrangler.jsonc:
   - `[env.staging]` config
   - `[env.production]` config

**Note**: This guide assumes Option A (separate Workers) for simplicity.

---

## 🔑 Cloudflare API Tokens

### Generate Staging Token

1. Navigate to Cloudflare Dashboard → My Profile → API Tokens
2. Click "Create Token"
3. Use "Edit Cloudflare Workers" template OR create custom token:
   - Permissions:
     - Account / Workers Scripts / Edit
     - Account / Account Settings / Read
     - Account / D1 / Edit (if using migrations)
   - Account Resources: Include your account
   - Zone Resources: Not needed (Workers are account-level)
4. Continue to summary → Create Token
5. **COPY THE TOKEN** (shown only once)
6. Save as `STAGING_CLOUDFLARE_API_TOKEN` (for your reference)

### Generate Production Token

1. Repeat above steps
2. Save as `PRODUCTION_CLOUDFLARE_API_TOKEN`

**Security Best Practice**: Use separate tokens for staging and production. This allows token revocation without affecting both environments.

### Get Account ID

```bash
# Find your Cloudflare Account ID
npx wrangler whoami

# Or navigate to: Cloudflare Dashboard → Workers & Pages
# Account ID shown in sidebar or URL
```

**Save Account ID** for later use.

---

## 🔒 GitHub Repository Configuration

### Step 1: Create GitHub Environments

**Navigate to**: Repository → Settings → Environments

**Create Staging Environment**:

1. Click "New environment"
2. Name: `staging` (exact, lowercase)
3. Configure:
   - **Deployment branches**: Allow all branches (or specific: dev, develop)
   - **Environment protection rules**: None required
   - **Environment secrets**: (will add in next step)
   - **Reviewers**: None
   - **Wait timer**: 0 minutes
4. Click "Configure environment"

**Create Production Environment**:

1. Click "New environment"
2. Name: `production` (exact, lowercase)
3. Configure:
   - **Deployment branches**: Selected branches → `main` (or allow all)
   - **Environment protection rules**:
     - ✅ Enable "Required reviewers"
     - Add reviewers (yourself and/or team leads)
     - Minimum 1 reviewer required
   - **Environment secrets**: (will add in next step)
   - **Wait timer**: Optional (e.g., 5 minutes gives time to cancel if needed)
4. Click "Configure environment"

**Verification**:

Navigate to Settings → Environments. You should see:

- staging (🟢 no protection)
- production (🔒 requires approval)

---

### Step 2: Configure Environment Secrets

**Staging Environment Secrets**:

1. Navigate to: Settings → Environments → staging
2. Click "Add secret" for each:

| Secret Name              | Value                          | Notes                               |
| ------------------------ | ------------------------------ | ----------------------------------- |
| `CLOUDFLARE_API_TOKEN`   | [Your staging token from Step] | From "Generate Staging Token" above |
| `CLOUDFLARE_ACCOUNT_ID`  | [Your Cloudflare account ID]   | Same for staging and production     |
| `CLOUDFLARE_WORKER_NAME` | `sebc-dev-staging`             | Your staging worker name            |

**Production Environment Secrets**:

1. Navigate to: Settings → Environments → production
2. Click "Add secret" for each:

| Secret Name              | Value                             | Notes                                  |
| ------------------------ | --------------------------------- | -------------------------------------- |
| `CLOUDFLARE_API_TOKEN`   | [Your production token from Step] | From "Generate Production Token" above |
| `CLOUDFLARE_ACCOUNT_ID`  | [Your Cloudflare account ID]      | Same as staging                        |
| `CLOUDFLARE_WORKER_NAME` | `sebc-dev-prod`                   | Your production worker name            |

**Verification**:

```bash
# Cannot verify secrets via CLI, but check via GitHub UI:
# Settings → Environments → [staging/production] → Environment secrets
# Should see 3 secrets in each environment
```

---

## 📝 Local Configuration

### Update .env.example

Add environment variable documentation:

```bash
# Edit .env.example
cat >> .env.example << 'EOF'

# ============================================
# Cloudflare Deployment Configuration
# ============================================

# Cloudflare API Token (Workers Deploy + D1 permissions)
# Generate at: https://dash.cloudflare.com/profile/api-tokens
CLOUDFLARE_API_TOKEN=your_token_here

# Cloudflare Account ID
# Find at: https://dash.cloudflare.com → Workers & Pages (in sidebar)
CLOUDFLARE_ACCOUNT_ID=your_account_id_here

# Worker name (environment-specific)
# Staging: sebc-dev-staging
# Production: sebc-dev-prod
CLOUDFLARE_WORKER_NAME=your_worker_name_here

EOF
```

**Note**: These are for local reference only. GitHub Actions uses environment secrets.

---

## 🧪 Verification Tests

### Test 1: Verify GitHub Environments

```bash
# Via GitHub UI:
# Navigate to: Settings → Environments
# ✅ staging exists (no approval required)
# ✅ production exists (requires approval)
```

### Test 2: Verify Environment Secrets

```bash
# Via GitHub UI:
# Navigate to: Settings → Environments → staging → Environment secrets
# ✅ 3 secrets present: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_WORKER_NAME

# Navigate to: Settings → Environments → production → Environment secrets
# ✅ 3 secrets present: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_WORKER_NAME
```

### Test 3: Verify Cloudflare Workers

```bash
# Test staging worker exists
npx wrangler deployments list --name=sebc-dev-staging

# Test production worker exists
npx wrangler deployments list --name=sebc-dev-prod

# Expected: Workers listed (may be empty or have previous deployments)
```

### Test 4: Verify API Token Permissions

```bash
# Test staging token (use staging token temporarily)
export CLOUDFLARE_API_TOKEN="your_staging_token"
npx wrangler whoami

# Expected: Shows your account, confirms token valid

# Test deployment dry-run (won't actually deploy)
npx wrangler deploy --dry-run

# Expected: No permission errors
```

**Remove token from environment after testing**:

```bash
unset CLOUDFLARE_API_TOKEN
```

---

## 🚨 Troubleshooting

### Issue: Cannot Create GitHub Environments

**Symptoms**:

- "Environments" option not visible in Settings
- Cannot access Environments configuration

**Solutions**:

1. **Verify repository permissions**: You need admin access
2. **Check GitHub plan**: Environments require GitHub Free (public repos) or GitHub Team/Enterprise (private repos)
3. **Enable Actions**: Settings → Actions → General → "Allow all actions"

**Verify Fix**:

Navigate to Settings → Environments should be visible in sidebar

---

### Issue: Environment Secrets Not Working

**Symptoms**:

- Workflow fails with "secret not found"
- Deployment fails with authentication errors

**Solutions**:

1. **Verify secret names**: Must be exact (case-sensitive)
   - ✅ `CLOUDFLARE_API_TOKEN`
   - ❌ `CLOUDFLARE_TOKEN` or `cloudflare_api_token`
2. **Verify environment name in workflow**: Must match exactly
   - Workflow: `environment: staging`
   - GitHub: Environment named "staging" (lowercase)
3. **Check secret scope**: Secrets must be in Environment secrets, not Repository secrets

**Verify Fix**:

```bash
# Check workflow file
cat .github/workflows/deploy.yml | grep "environment:"
# Should show: environment: ${{ inputs.environment || 'production' }}

# Verify secret names in GitHub UI match workflow expectations
```

---

### Issue: Cloudflare API Token Invalid

**Symptoms**:

- Deployment fails with "Authentication error"
- Wrangler commands fail with 401/403 errors

**Solutions**:

1. **Verify token permissions**:
   - Go to Cloudflare → My Profile → API Tokens
   - Check token has "Workers Scripts:Edit" permission
   - Check token has "D1:Edit" permission (if using migrations)
2. **Token expired**: Generate new token
3. **Token copied incorrectly**: Regenerate and re-copy carefully

**Verify Fix**:

```bash
# Test token locally
export CLOUDFLARE_API_TOKEN="paste_token_here"
npx wrangler whoami
# Should show account info without errors

unset CLOUDFLARE_API_TOKEN
```

---

### Issue: Worker Name Mismatch

**Symptoms**:

- Deployment creates new worker with unexpected name
- Cannot find deployed worker

**Solutions**:

1. **Check `CLOUDFLARE_WORKER_NAME` secret**: Should match desired worker name
2. **Check wrangler.jsonc**: `name` field should match (or be overridden by env var)
3. **Verify workflow uses secret**: Should pass worker name to wrangler

**Verify Fix**:

```bash
# Check wrangler.jsonc
cat wrangler.jsonc | grep '"name"'
# Should show: "name": "sebc-dev" (or your base name)

# Workflow should override with: ${{ secrets.CLOUDFLARE_WORKER_NAME }}
```

---

### Issue: Production Approval Not Required

**Symptoms**:

- Production deploys immediately without approval
- No approval gate shown

**Solutions**:

1. **Verify production environment protection rules**:
   - Navigate to: Settings → Environments → production
   - Check "Required reviewers" is enabled
   - Check at least 1 reviewer is added
2. **Verify workflow uses production environment**:
   - Check workflow file: `environment: production`
3. **Re-save environment settings**: Sometimes GitHub needs a re-save

**Verify Fix**:

Trigger production deployment manually and verify approval gate appears before deployment starts.

---

## 📝 Setup Checklist

Complete this checklist before starting implementation:

### Cloudflare Setup

- [ ] Staging Worker created (or Workers Environment configured)
- [ ] Production Worker created (or using existing)
- [ ] Staging API token generated with correct permissions
- [ ] Production API token generated with correct permissions
- [ ] Cloudflare Account ID noted
- [ ] Workers accessible via Cloudflare dashboard

### GitHub Setup

- [ ] "staging" environment created
- [ ] "production" environment created
- [ ] Production environment has required reviewers configured
- [ ] Staging environment has no approval requirements
- [ ] Staging environment secrets configured (3 secrets)
- [ ] Production environment secrets configured (3 secrets)
- [ ] Secret values verified correct (no typos)

### Local Setup

- [ ] `.env.example` updated with CLOUDFLARE variables
- [ ] API tokens stored securely (password manager, not in code)
- [ ] Wrangler CLI working (`wrangler --version`)
- [ ] Git working directory clean

### Verification

- [ ] GitHub Environments visible in Settings
- [ ] Environment secrets present in both environments
- [ ] Cloudflare Workers exist and accessible
- [ ] API tokens valid (tested with `wrangler whoami`)
- [ ] No permission errors

**Environment is ready for Phase 3 implementation! 🚀**

---

## 📚 Reference Documentation

### GitHub Environments

- **Official Docs**: https://docs.github.com/en/actions/deployment/targeting-different-environments
- **Environment Secrets**: https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment#environment-secrets
- **Deployment Protection Rules**: https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment#deployment-protection-rules

### Cloudflare

- **Workers Environments**: https://developers.cloudflare.com/workers/configuration/environments/
- **API Tokens**: https://developers.cloudflare.com/fundamentals/api/get-started/create-token/
- **Wrangler Commands**: https://developers.cloudflare.com/workers/wrangler/commands/

### Project-Specific

- **Phase 1 Docs**: [../phase_1/](../phase_1/) - Migration setup
- **Phase 2 Docs**: [../phase_2/](../phase_2/) - Basic deployment
- **Story 0.7**: [../../story_0.7.md](../../story_0.7.md) - CI/CD story overview

---

**Setup Guide Created**: 2025-11-11
**Estimated Setup Time**: 30-45 minutes (first time), 15-20 minutes (subsequent)
**Required Access**: GitHub admin, Cloudflare account with Workers/D1 permissions
