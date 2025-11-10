# Phase 1 - Environment Setup

This guide covers all environment setup needed for Phase 1 - D1 Migrations Automation.

---

## 📋 Prerequisites

### Previous Phases/Stories

- [x] **Story 0.1**: Next.js 15 initialized (COMPLETED)
- [x] **Story 0.2**: OpenNext adapter configured (COMPLETED)
- [x] **Story 0.4**: Drizzle ORM + D1 configured with migrations (COMPLETED)
- [x] **Story 0.5**: Wrangler.toml bindings configured (COMPLETED - D1 binding exists)

### Tools Required

- [x] **Node.js** (version 20+) - Check: `node --version`
- [x] **pnpm** (latest) - Check: `pnpm --version`
- [x] **Git** - Check: `git --version`
- [x] **wrangler** - Installed via project: `npx wrangler --version`

### Services Required

- [x] **Cloudflare Account** - Workers + D1 enabled
- [x] **GitHub Repository** - With Actions enabled
- [x] **Existing D1 Database** - `sebc-dev-db` (from Story 0.4)

### Access Requirements

- [x] **Cloudflare Dashboard Access** - To create API tokens
- [x] **GitHub Repository Admin** - To configure secrets
- [x] **Database Schema Knowledge** - Understand existing migrations

---

## 📦 Dependencies Installation

### Verify Existing Dependencies

All required packages are already installed from previous stories. Verify:

```bash
# Check wrangler is available
npx wrangler --version
# Expected: 4.45.4 or later

# Check drizzle-kit is available
npx drizzle-kit --version
# Expected: 0.31.6 or later

# Verify all dependencies are installed
pnpm install --frozen-lockfile
```

**No new packages required for Phase 1!** ✅

The migration automation uses:
- `wrangler` (already in devDependencies)
- `drizzle-orm` (already in dependencies)
- GitHub Actions runners (provided by GitHub)

---

## 🔧 Cloudflare Configuration

### Step 1: Verify D1 Database Exists

```bash
# List your D1 databases
npx wrangler d1 list

# Expected output should include:
# - sebc-dev-db (ID: 6615b6d8-2522-46dc-9051-bc0813b42240)
```

**If database doesn't exist**: You need to complete Story 0.4 first.

### Step 2: Get Cloudflare Account ID

1. **Log in to Cloudflare Dashboard**: https://dash.cloudflare.com
2. **Navigate to any site or Workers**
3. **Find Account ID**:
   - Look in the right sidebar under "Account ID"
   - Or in the URL: `https://dash.cloudflare.com/{account-id}/...`
   - Format: 32-character hexadecimal string
   - Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

**Copy and save this Account ID** - you'll need it for GitHub secrets.

### Step 3: Create Cloudflare API Token

1. **Navigate to API Tokens**:
   - Cloudflare Dashboard → My Profile → API Tokens
   - Or direct link: https://dash.cloudflare.com/profile/api-tokens

2. **Click "Create Token"**

3. **Use "Create Custom Token" template**

4. **Configure Token**:
   - **Token name**: `GitHub Actions - D1 Migrations & Deployment`
   - **Permissions**:
     - Account | **Cloudflare D1** | **Edit**
     - Account | **Workers Scripts** | **Edit**
   - **Account Resources**:
     - Include | **Specific account** | [Select your account]
   - **Client IP Address Filtering**: (Leave empty - GitHub Actions IPs are dynamic)
   - **TTL**: (Optional - Leave blank for no expiration, or set 1 year for security)

5. **Review and Create**:
   - Click "Continue to summary"
   - Review permissions carefully
   - Click "Create Token"

6. **Copy Token Immediately**:
   - ⚠️ **Critical**: The token is shown only once!
   - Copy the entire token string
   - Format: `cloudflare-api-token-xxxxx...`
   - Store in secure location temporarily (password manager)

**Security Note**: Never commit this token to Git or share it publicly.

---

## 🔐 GitHub Secrets Configuration

### Step 1: Navigate to Repository Secrets

1. Go to your GitHub repository
2. Click **Settings** (top navigation)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. You should see "Repository secrets" section

### Step 2: Add CLOUDFLARE_API_TOKEN

1. Click **"New repository secret"**
2. **Name**: `CLOUDFLARE_API_TOKEN` (exact name, case-sensitive)
3. **Secret**: Paste the API token from Cloudflare (Step 3 above)
4. Click **"Add secret"**

**Verification**: You should see `CLOUDFLARE_API_TOKEN` in the secrets list (value is hidden)

### Step 3: Add CLOUDFLARE_ACCOUNT_ID

1. Click **"New repository secret"** again
2. **Name**: `CLOUDFLARE_ACCOUNT_ID` (exact name, case-sensitive)
3. **Secret**: Paste your Account ID from Cloudflare (Step 2 above)
4. Click **"Add secret"**

**Verification**: You should see both secrets:
- `CLOUDFLARE_API_TOKEN` (Updated X seconds/minutes ago)
- `CLOUDFLARE_ACCOUNT_ID` (Updated X seconds/minutes ago)

### Security Best Practices

- ✅ **Repository secrets** (not environment secrets - for Phase 1)
- ✅ Secrets are encrypted at rest by GitHub
- ✅ Secrets are never logged in Actions output
- ✅ Use environment secrets in Phase 3 for production

**Important**: Anyone with push access to the repository can use these secrets via workflows. Limit repository access appropriately.

---

## 📁 Project Configuration

### Verify wrangler.jsonc Configuration

Your `wrangler.jsonc` should already be configured from Story 0.4:

```jsonc
{
  "name": "website",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-03-01",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "sebc-dev-db",
      "database_id": "6615b6d8-2522-46dc-9051-bc0813b42240",
      "migrations_dir": "drizzle/migrations"
    }
  ]
}
```

**Verify**:
- [x] `binding` is "DB" (used in migration commands)
- [x] `database_id` matches your D1 database ID
- [x] `migrations_dir` points to "drizzle/migrations"

```bash
# Check configuration
cat wrangler.jsonc | grep -A 5 d1_databases
```

### Verify Migrations Directory Exists

```bash
# List migrations
ls -la drizzle/migrations/

# Expected output: Migration files from Story 0.4
# Example:
# 0000_init_schema.sql
# 0001_add_categories.sql
# 0002_add_articles.sql
# meta/ directory
```

If no migrations exist, you need to complete Story 0.4 first.

---

## ✅ Environment Validation

Run these commands to verify your environment is ready:

### Test 1: Verify wrangler Authentication (Local)

**Option A: Test with existing env file**

```bash
# If you have .env file from Story 0.4
pnpm db:check
# Expected: No errors (all required env vars present)
```

**Option B: Test with GitHub secrets locally**

```bash
# Set environment variables temporarily (from GitHub secrets)
export CLOUDFLARE_API_TOKEN="your-token-here"
export CLOUDFLARE_ACCOUNT_ID="your-account-id-here"

# Test wrangler authentication
npx wrangler whoami

# Expected output:
# You are logged in with an API Token.
# Account Name: [Your account name]
# Account ID: [Your account ID]
```

### Test 2: Verify D1 Database Access

```bash
# List D1 databases (should see sebc-dev-db)
npx wrangler d1 list

# Expected output includes:
# - sebc-dev-db (ID: 6615b6d8-2522-46dc-9051-bc0813b42240)

# Test database connection
npx wrangler d1 execute DB --local --command="SELECT 1;"

# Expected output:
# 🌀 Executing on local database DB (sebc-dev-db) from .wrangler/state/v3/d1:
# { 1: 1 }
```

### Test 3: Verify Migrations Can Be Applied Locally

```bash
# Apply migrations to local database
npx wrangler d1 migrations apply DB --local

# Expected output:
# Migrations applied successfully
# OR "No migrations to apply" (if already applied)

# Verify tables exist
npx wrangler d1 execute DB --local --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"

# Expected: List of tables (articles, categories, etc.)
```

### Test 4: Verify GitHub Actions Syntax Validator (Optional)

```bash
# Install action-validator (optional, for local YAML validation)
npm install -g action-validator

# Or use online validator:
# https://rhysd.github.io/actionlint/
```

---

## 🗄️ Database Schema Reference

### Current D1 Database: sebc-dev-db

**Database ID**: `6615b6d8-2522-46dc-9051-bc0813b42240`

**Binding Name**: `DB` (used in Worker code and migration commands)

**Existing Tables** (from Story 0.4):

1. **articles**
   - `id` (INTEGER PRIMARY KEY)
   - `slug` (TEXT UNIQUE)
   - `title` (TEXT)
   - `summary` (TEXT)
   - `content` (TEXT)
   - `category_id` (INTEGER, FK to categories)
   - `published_at` (TEXT, ISO date)
   - `updated_at` (TEXT, ISO date)
   - `reading_time_minutes` (INTEGER)
   - `view_count` (INTEGER)

2. **categories**
   - `id` (INTEGER PRIMARY KEY)
   - `name` (TEXT UNIQUE)
   - `slug` (TEXT UNIQUE)

**Existing Migrations** (from Story 0.4):

- `0000_*.sql` - Initial schema
- `0001_*.sql` - Categories table
- `0002_*.sql` - Articles table

**Migration Status**:

```bash
# Check local migration status
npx wrangler d1 migrations list DB --local

# Check remote migration status (requires auth)
npx wrangler d1 migrations apply DB --remote --dry-run  # if supported
```

---

## 🚨 Troubleshooting

### Issue: "wrangler: command not found"

**Symptoms**: `npx wrangler --version` fails

**Solution**:
```bash
# Install dependencies
pnpm install --frozen-lockfile

# Verify wrangler is in node_modules
ls node_modules/.bin/wrangler
```

---

### Issue: "Cannot find module 'wrangler'"

**Symptoms**: wrangler command fails with module error

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

### Issue: "Database 'DB' not found"

**Symptoms**: Migration or query commands fail with "Database not found"

**Causes**:
- Wrong binding name
- `wrangler.jsonc` not found
- Database ID incorrect

**Solution**:
```bash
# Verify wrangler.jsonc exists
cat wrangler.jsonc

# Verify binding name is "DB"
cat wrangler.jsonc | grep binding

# Verify database_id matches your D1 database
npx wrangler d1 list
# Compare database ID in output with wrangler.jsonc
```

---

### Issue: "Invalid API token" or "Unauthorized"

**Symptoms**: Remote wrangler commands fail with auth errors

**Causes**:
- Token expired or revoked
- Wrong token copied
- Insufficient permissions

**Solution**:

1. **Verify token locally**:
   ```bash
   export CLOUDFLARE_API_TOKEN="your-token"
   npx wrangler whoami
   ```

2. **Check token permissions** in Cloudflare Dashboard:
   - Go to API Tokens
   - Find your token
   - Verify permissions: D1:Edit, Workers Scripts:Edit

3. **Regenerate token** if needed:
   - Revoke old token
   - Create new token (follow Step 3 above)
   - Update GitHub secrets

---

### Issue: "Account ID not found"

**Symptoms**: Commands fail with "Account not found" or "Forbidden"

**Causes**:
- Wrong Account ID
- Account ID not provided

**Solution**:
```bash
# Get Account ID from wrangler
npx wrangler whoami
# Look for "Account ID" in output

# Verify Account ID in wrangler.jsonc if needed
# (Not required for migrations, but helpful for reference)
```

---

### Issue: GitHub Secrets Not Working

**Symptoms**: Workflow uses secrets but fails with auth errors

**Causes**:
- Secret name typo (case-sensitive)
- Secret not set
- Workflow not referencing secrets correctly

**Solution**:

1. **Verify secret names** in GitHub:
   - Go to Settings → Secrets and variables → Actions
   - Verify: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
   - Check spelling (case-sensitive)

2. **Test secrets in workflow** (temporary debug step):
   ```yaml
   # Add to workflow for debugging (REMOVE AFTER TESTING!)
   - name: Debug - Check secrets exist
     run: |
       if [ -z "${{ secrets.CLOUDFLARE_API_TOKEN }}" ]; then
         echo "❌ CLOUDFLARE_API_TOKEN is not set"
       else
         echo "✅ CLOUDFLARE_API_TOKEN is set"
       fi
   ```

   **⚠️ NEVER log the actual secret value!**

---

## 📝 Setup Checklist

Complete this checklist before starting Phase 1 implementation:

### Cloudflare Setup

- [ ] Cloudflare Account accessible
- [ ] D1 Database `sebc-dev-db` exists
- [ ] Database ID verified: `6615b6d8-2522-46dc-9051-bc0813b42240`
- [ ] Account ID obtained and saved
- [ ] API Token created with correct permissions (D1:Edit, Workers Scripts:Edit)
- [ ] API Token copied and stored securely

### GitHub Setup

- [ ] GitHub repository with Actions enabled
- [ ] Repository Settings accessible (admin permissions)
- [ ] `CLOUDFLARE_API_TOKEN` secret added
- [ ] `CLOUDFLARE_ACCOUNT_ID` secret added
- [ ] Both secrets visible in repository secrets list

### Local Development

- [ ] Node.js 20+ installed
- [ ] pnpm installed
- [ ] Dependencies installed (`pnpm install`)
- [ ] wrangler accessible (`npx wrangler --version`)
- [ ] wrangler authenticated (test with `npx wrangler whoami`)
- [ ] Local D1 database works (`wrangler d1 execute DB --local`)
- [ ] Migrations directory exists (`drizzle/migrations/`)

### Project Configuration

- [ ] `wrangler.jsonc` configured correctly
- [ ] D1 binding is "DB"
- [ ] `database_id` matches your database
- [ ] `migrations_dir` points to `drizzle/migrations`
- [ ] Existing migrations verified (`ls drizzle/migrations/`)

### Validation

- [ ] wrangler authentication tested locally
- [ ] D1 database access verified
- [ ] Local migrations tested (`wrangler d1 migrations apply DB --local`)
- [ ] All environment validation tests passed

**Environment is ready! Start implementing Commit 1. 🚀**

---

## 🔗 External Resources

### Cloudflare Documentation

- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [D1 Database Guide](https://developers.cloudflare.com/d1/)
- [D1 Migrations](https://developers.cloudflare.com/d1/reference/migrations/)
- [API Tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)

### GitHub Documentation

- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions)
- [GitHub Actions Workflows](https://docs.github.com/en/actions/writing-workflows)

### Project Documentation

- [Story 0.4 - Drizzle ORM + D1](../../story_0_4/)
- [Story 0.5 - Wrangler Config](../../story_0_5/)
- [PHASES_PLAN.md](../PHASES_PLAN.md)

---

**Environment setup complete! Proceed to IMPLEMENTATION_PLAN.md to start coding. ✅**
