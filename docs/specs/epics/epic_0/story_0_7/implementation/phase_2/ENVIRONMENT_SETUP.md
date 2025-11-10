# Phase 2 - Environment Setup

This guide covers all environment setup needed for Phase 2: Deployment Workflow.

---

## 📋 Prerequisites

### Previous Phases

- [ ] Phase 1 completed and validated (Database Migrations)
- [ ] Existing quality workflow functional (`.github/workflows/quality.yml`)
- [ ] OpenNext build working (`pnpm build` succeeds)
- [ ] Wrangler configuration exists (`wrangler.jsonc`)

### Tools Required

- [ ] GitHub CLI (`gh`) version 2.0+ installed
- [ ] `actionlint` for workflow syntax validation (optional but recommended)
- [ ] Access to GitHub repository with admin permissions
- [ ] Cloudflare account with Workers access

### Services Required

- [ ] GitHub Actions enabled for repository
- [ ] Cloudflare Workers platform accessible
- [ ] Cloudflare D1 database created (from Story 0.4)

---

## 🔧 GitHub Secrets Configuration

### Required Secrets

You must configure these GitHub repository secrets before deploying:

| Secret Name                | Description                          | Where to Get It                             | Required |
| -------------------------- | ------------------------------------ | ------------------------------------------- | -------- |
| `CLOUDFLARE_API_TOKEN`     | API token for Wrangler deployments   | Cloudflare Dashboard → API Tokens           | Yes      |
| `CLOUDFLARE_ACCOUNT_ID`    | Cloudflare account identifier        | Cloudflare Dashboard → Workers → Overview   | Yes      |

### Step 1: Generate Cloudflare API Token

1. **Navigate to Cloudflare Dashboard**:
   - Go to: https://dash.cloudflare.com/
   - Log in to your account

2. **Create API Token**:
   - Click on your profile icon (top right)
   - Select "My Profile" → "API Tokens"
   - Click "Create Token"

3. **Configure Token Permissions**:
   - Template: Start with "Edit Cloudflare Workers" template
   - Permissions needed:
     - Account → Workers Scripts → Edit
     - Account → D1 → Edit (for migrations)
   - Account Resources: Select your specific account
   - Zone Resources: Not needed for Workers-only deployments

4. **Token Settings**:
   - Client IP Address Filtering: Optional (can restrict to GitHub Actions IPs)
   - TTL: Use default (indefinite) or set expiration
   - Click "Continue to summary"
   - Click "Create Token"

5. **Copy Token**:
   - **IMPORTANT**: Copy the token immediately - you won't see it again!
   - Format: `<token-string>`

### Step 2: Get Cloudflare Account ID

1. **Navigate to Cloudflare Dashboard**:
   - Go to: https://dash.cloudflare.com/

2. **Find Account ID**:
   - Select "Workers & Pages" from left sidebar
   - Or go to any Worker
   - Account ID is visible on the right side panel
   - Format: `<32-character-hex-string>`

### Step 3: Add Secrets to GitHub Repository

**Option A: Using GitHub Web UI**

1. Navigate to your repository on GitHub
2. Go to: Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add `CLOUDFLARE_API_TOKEN`:
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: `<your-api-token>`
   - Click "Add secret"
5. Add `CLOUDFLARE_ACCOUNT_ID`:
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: `<your-account-id>`
   - Click "Add secret"

**Option B: Using GitHub CLI**

```bash
# Set CLOUDFLARE_API_TOKEN
gh secret set CLOUDFLARE_API_TOKEN

# Paste your token when prompted, press Ctrl+D (Linux/Mac) or Ctrl+Z (Windows)

# Set CLOUDFLARE_ACCOUNT_ID
gh secret set CLOUDFLARE_ACCOUNT_ID

# Paste your account ID when prompted, press Ctrl+D (Linux/Mac) or Ctrl+Z (Windows)
```

### Verify Secrets Configuration

```bash
# List configured secrets
gh secret list

# Expected output:
# CLOUDFLARE_API_TOKEN    Updated YYYY-MM-DD
# CLOUDFLARE_ACCOUNT_ID   Updated YYYY-MM-DD
```

---

## 🛠️ Local Development Tools

### Install actionlint (Optional but Recommended)

**Purpose**: Validates GitHub Actions workflow syntax locally

**Installation**:

```bash
# macOS
brew install actionlint

# Linux (download binary)
bash <(curl https://raw.githubusercontent.com/rhysd/actionlint/main/scripts/download-actionlint.bash)
sudo mv actionlint /usr/local/bin/

# Verify installation
actionlint -version
```

**Usage**:

```bash
# Validate all workflows
actionlint

# Validate specific workflow
actionlint .github/workflows/deploy.yml
```

---

## 🌐 Cloudflare Workers Setup

### Verify Wrangler Configuration

Your project should already have `wrangler.jsonc` configured from Story 0.2:

```bash
# View wrangler config
cat wrangler.jsonc
```

**Expected configuration**:

```jsonc
{
  "name": "sebc-dev",
  "compatibility_date": "2024-01-01",
  "workers_dev": true,
  "main": ".open-next/worker.js",
  "assets": {
    "directory": ".open-next/assets"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "sebc-dev-db",
      "database_id": "<your-d1-database-id>",
      "migrations_dir": "drizzle/migrations"
    }
  ]
}
```

### Test Local Deployment (Optional)

Before setting up CI/CD, test deployment manually:

```bash
# Build the project
pnpm build

# Deploy to Cloudflare (requires CLOUDFLARE_API_TOKEN set locally)
npx wrangler deploy

# Expected output:
# Total Upload: xx.xx KiB / gzip: xx.xx KiB
# Uploaded sebc-dev (x.xx sec)
# Published sebc-dev (x.xx sec)
#   https://sebc-dev.<your-subdomain>.workers.dev
```

**Set local environment variables for testing**:

```bash
# Set temporarily for current session
export CLOUDFLARE_API_TOKEN="<your-token>"
export CLOUDFLARE_ACCOUNT_ID="<your-account-id>"

# Or use .env (DO NOT COMMIT)
echo "CLOUDFLARE_API_TOKEN=<your-token>" >> .env.local
echo "CLOUDFLARE_ACCOUNT_ID=<your-account-id>" >> .env.local
```

---

## 🧪 Verification Tests

### Test 1: GitHub Secrets Access

**Purpose**: Verify GitHub Actions can access secrets

```bash
# Create test workflow (temporary)
cat > .github/workflows/test-secrets.yml << 'EOF'
name: Test Secrets
on: workflow_dispatch
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Check secrets exist
        run: |
          if [ -z "${{ secrets.CLOUDFLARE_API_TOKEN }}" ]; then
            echo "❌ CLOUDFLARE_API_TOKEN not configured"
            exit 1
          fi
          if [ -z "${{ secrets.CLOUDFLARE_ACCOUNT_ID }}" ]; then
            echo "❌ CLOUDFLARE_ACCOUNT_ID not configured"
            exit 1
          fi
          echo "✅ All secrets configured"
EOF

# Run test workflow
gh workflow run test-secrets.yml

# Check result
gh run watch

# Clean up test workflow
rm .github/workflows/test-secrets.yml
```

**Expected Result**: Workflow succeeds, outputs "✅ All secrets configured"

### Test 2: Wrangler Authentication

**Purpose**: Verify Wrangler can authenticate with Cloudflare

```bash
# Test wrangler auth (local)
npx wrangler whoami

# Expected output:
# You are logged in with an API Token, associated with the email '<your-email>'.
# Account ID: <your-account-id>
```

### Test 3: Build Verification

**Purpose**: Ensure OpenNext build produces deployable artifacts

```bash
# Run build
pnpm build

# Verify output directory exists
ls -la .open-next/

# Expected files:
# .open-next/
# ├── worker.js          (Worker entrypoint)
# ├── assets/            (Static assets)
# └── ...
```

**Expected Result**: Build succeeds, `.open-next/worker.js` exists

---

## 🚨 Troubleshooting

### Issue: "CLOUDFLARE_API_TOKEN secret not found"

**Symptoms**:
- Workflow fails with error: `Error: Required secret not found`
- Deployment step cannot authenticate

**Solutions**:

1. **Verify secret exists**:
   ```bash
   gh secret list | grep CLOUDFLARE_API_TOKEN
   ```

2. **Re-add secret**:
   ```bash
   gh secret set CLOUDFLARE_API_TOKEN
   # Paste token, Ctrl+D
   ```

3. **Check token validity**:
   ```bash
   # Test locally
   export CLOUDFLARE_API_TOKEN="<your-token>"
   npx wrangler whoami
   ```

**Verify Fix**:
```bash
gh workflow run deploy.yml
gh run watch
```

---

### Issue: "Account ID mismatch"

**Symptoms**:
- Deployment fails with: `Account ID mismatch`
- Wrangler cannot find resources

**Solutions**:

1. **Verify account ID**:
   - Go to Cloudflare Dashboard → Workers
   - Copy Account ID from sidebar
   - Compare with `CLOUDFLARE_ACCOUNT_ID` secret

2. **Update secret if needed**:
   ```bash
   gh secret set CLOUDFLARE_ACCOUNT_ID
   # Paste correct account ID, Ctrl+D
   ```

**Verify Fix**:
```bash
npx wrangler whoami
# Verify account ID matches
```

---

### Issue: "Worker deployment fails with 'not found'"

**Symptoms**:
- Deployment fails: `Worker not found`
- First deployment attempts fail

**Solutions**:

1. **Check wrangler.jsonc name**:
   ```bash
   cat wrangler.jsonc | grep '"name"'
   # Should match your Worker name
   ```

2. **Create Worker manually (first time)**:
   ```bash
   npx wrangler deploy
   # This creates the Worker if it doesn't exist
   ```

3. **Check Cloudflare dashboard**:
   - Navigate to Workers & Pages
   - Verify Worker exists with correct name

**Verify Fix**:
```bash
npx wrangler deployments list
```

---

### Issue: "API Token permissions insufficient"

**Symptoms**:
- Deployment fails: `Insufficient permissions`
- 403 Forbidden errors

**Solutions**:

1. **Regenerate token with correct permissions**:
   - Cloudflare Dashboard → API Tokens
   - Edit or create new token
   - Required permissions:
     - Workers Scripts: Edit
     - D1: Edit (for migrations)

2. **Update GitHub secret**:
   ```bash
   gh secret set CLOUDFLARE_API_TOKEN
   # Paste new token, Ctrl+D
   ```

**Verify Fix**:
```bash
npx wrangler whoami
# Should show all required permissions
```

---

### Issue: "Build artifacts not found"

**Symptoms**:
- Deployment fails: `.open-next/worker.js not found`
- Wrangler cannot find entrypoint

**Solutions**:

1. **Verify build completes**:
   ```bash
   pnpm build
   ls .open-next/worker.js
   ```

2. **Check workflow build step**:
   - Ensure `pnpm build` runs before deployment
   - Verify build artifacts are not excluded from workflow

3. **Check .gitignore**:
   ```bash
   cat .gitignore | grep ".open-next"
   # Should be ignored for git, but built in CI
   ```

**Verify Fix**:
```bash
gh workflow run deploy.yml
gh run watch --log | grep "build"
```

---

## 📝 Setup Checklist

Complete this checklist before starting Phase 2 implementation:

### GitHub Configuration
- [ ] GitHub Actions enabled for repository
- [ ] Admin access to repository settings
- [ ] GitHub CLI authenticated (`gh auth status`)

### Cloudflare Configuration
- [ ] Cloudflare account accessible
- [ ] API token generated with correct permissions
- [ ] Account ID obtained from dashboard
- [ ] D1 database exists (from Story 0.4)

### Secrets Configuration
- [ ] `CLOUDFLARE_API_TOKEN` secret added to GitHub
- [ ] `CLOUDFLARE_ACCOUNT_ID` secret added to GitHub
- [ ] Secrets verified with `gh secret list`

### Local Tools
- [ ] `gh` CLI installed and authenticated
- [ ] `actionlint` installed (optional)
- [ ] `wrangler` accessible via `npx wrangler`

### Project Configuration
- [ ] `wrangler.jsonc` exists and configured
- [ ] OpenNext build succeeds (`pnpm build`)
- [ ] `.open-next/worker.js` generated

### Verification Tests
- [ ] GitHub secrets accessible in workflows
- [ ] Wrangler authentication works
- [ ] Build produces deployable artifacts
- [ ] Test deployment succeeds (optional)

---

**Environment is ready! 🚀**

Proceed to implementing Commit 1 of Phase 2.

---

## 🔗 External Resources

- [Cloudflare API Token Docs](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [cloudflare/wrangler-action](https://github.com/cloudflare/wrangler-action)
- [actionlint Documentation](https://github.com/rhysd/actionlint)
