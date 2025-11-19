# Phase 3 - Environment Setup

This guide covers all environment setup needed for Phase 3 (CI Integration).

---

## 📋 Prerequisites

### Previous Phases

- [ ] **Phase 0 completed**: Cleanup and preparation done
- [ ] **Phase 1 completed**: Local configuration (playwright.config.ts, package.json, global-setup.ts)
- [ ] **Phase 2 completed**: Tests pass locally on all browsers (Chromium, Firefox, WebKit)

### Validation Commands

```bash
# Verify Phase 1-2 local setup works
pnpm test:e2e

# Expected: All tests pass with 0 failures
# If fails: Complete Phase 2 first before proceeding to Phase 3
```

### Tools Required

- [ ] **Git** installed and configured
- [ ] **pnpm** (version 8+) installed
- [ ] **Node.js** 20+ installed
- [ ] **GitHub account** with repository access
- [ ] **GitHub repository admin access** (for configuring secrets)

### Services Required

- [ ] **Cloudflare account** with Workers enabled
- [ ] **Cloudflare Dashboard** access (to generate API token)
- [ ] **GitHub repository** with Actions enabled

---

## 📦 Dependencies Installation

### No New Packages Required

Phase 3 uses existing dependencies from Phases 1-2:

- `@playwright/test` (already installed)
- `wrangler` (already installed)
- `@opennextjs/cloudflare` (already installed)

### Verify Existing Installation

```bash
# Verify all dependencies are installed
pnpm list @playwright/test wrangler @opennextjs/cloudflare

# Expected output should show versions:
# @playwright/test 1.x.x
# wrangler 3.x.x
# @opennextjs/cloudflare 0.x.x
```

---

## 🔧 Environment Variables (CI Only)

### GitHub Secrets Configuration

Phase 3 introduces two **repository-level secrets** in GitHub Actions. These are NOT stored in `.env` files but configured via GitHub UI.

**CRITICAL**: Never commit these values to code. Always use GitHub Secrets.

### Required Secrets

Create these secrets in GitHub repository settings:

| Secret Name             | Description                             | Where to Find                                     | Required |
| ----------------------- | --------------------------------------- | ------------------------------------------------- | -------- |
| `CLOUDFLARE_API_TOKEN`  | API token for Cloudflare authentication | Cloudflare Dashboard → My Profile → API Tokens    | Yes      |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier           | Cloudflare Dashboard → Workers & Pages → Overview | Yes      |

---

## 🔐 Cloudflare API Token Setup

### Step-by-Step Guide

#### 1. Navigate to Cloudflare Dashboard

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click on your profile icon (top right)
3. Select "My Profile"
4. Click on "API Tokens" tab

#### 2. Create Custom API Token

1. Click "Create Token"
2. Click "Get started" next to "Create Custom Token"
3. Configure token:
   - **Token name**: `GitHub Actions E2E Tests` (or similar descriptive name)
   - **Permissions**:
     - Account: `Account Settings: Read`
     - Zone: (Not required for Workers)
     - User: (Not required)
   - **Account Resources**:
     - Include: `Specific account` → Select your account
   - **Zone Resources**: `All zones` (or skip if not applicable)
   - **Client IP Address Filtering**: (Leave empty for GitHub Actions)
   - **TTL**: `Start Date: Today`, `End Date: Never expires` (or set expiration as per your security policy)
4. Click "Continue to summary"
5. Review permissions (should show Account Settings: Read minimum)
6. Click "Create Token"

#### 3. Required Permissions

**Minimum required permissions**:

- ✅ `Account Settings: Read`

**Recommended permissions** (for full wrangler dev functionality):

- ✅ `Workers Scripts: Edit`
- ✅ `D1: Edit`
- ✅ `Account Settings: Read`

**Why these permissions**:

- `Workers Scripts: Edit` - Allows wrangler to interact with Workers runtime
- `D1: Edit` - Allows wrangler to manage D1 database locally
- `Account Settings: Read` - Required for authentication

#### 4. Copy and Save Token

- [ ] Copy the generated token (it starts with a long random string)
- [ ] **IMPORTANT**: Save it immediately - you won't be able to see it again
- [ ] Do NOT commit this token to code

---

## 🆔 Cloudflare Account ID Setup

### Step-by-Step Guide

#### 1. Navigate to Workers Dashboard

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click on "Workers & Pages" in the left sidebar
3. Click "Overview" (or any Workers page)

#### 2. Find Account ID

Look for **Account ID** on the right side of the page:

- Usually displayed in the sidebar
- Format: Long hexadecimal string (e.g., `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

#### 3. Copy Account ID

- [ ] Copy the Account ID value
- [ ] Verify it's a hexadecimal string (letters a-f, numbers 0-9)

---

## ⚙️ GitHub Secrets Configuration

### Step-by-Step Guide

#### 1. Navigate to Repository Settings

1. Go to your GitHub repository
2. Click "Settings" tab (requires admin access)
3. In left sidebar, click "Secrets and variables" → "Actions"

#### 2. Add CLOUDFLARE_API_TOKEN Secret

1. Click "New repository secret"
2. **Name**: `CLOUDFLARE_API_TOKEN` (exact spelling, all caps)
3. **Secret**: Paste the API token from Cloudflare Dashboard
4. Click "Add secret"

#### 3. Add CLOUDFLARE_ACCOUNT_ID Secret

1. Click "New repository secret"
2. **Name**: `CLOUDFLARE_ACCOUNT_ID` (exact spelling, all caps)
3. **Secret**: Paste the Account ID from Cloudflare Dashboard
4. Click "Add secret"

#### 4. Verify Secrets

- [ ] Navigate back to "Secrets and variables" → "Actions"
- [ ] Verify both secrets appear in the list:
  - `CLOUDFLARE_API_TOKEN` (value hidden as ••••••••)
  - `CLOUDFLARE_ACCOUNT_ID` (value hidden as ••••••••)
- [ ] Note the "Updated" timestamp

---

## ✅ Connection Tests

### Test Cloudflare API Token (Local)

```bash
# Test API token validity (run locally)
export CLOUDFLARE_API_TOKEN="your-token-here"
pnpm wrangler whoami

# Expected output:
# You are logged in with an API Token, associated with the email '[your-email]'.
# Account Name: [Your Account]
# Account ID: [your-account-id]
```

**If this fails**:

- Token is invalid or expired
- Insufficient permissions
- Network connectivity issues

### Test Cloudflare Account ID (Local)

```bash
# Test account ID is valid
export CLOUDFLARE_ACCOUNT_ID="your-account-id-here"
export CLOUDFLARE_API_TOKEN="your-token-here"
pnpm wrangler dev --port 8788 --ip 127.0.0.1

# Expected output:
# ⛅️ wrangler 3.x.x
# Your worker has access to the following bindings:
# - D1 Databases: [ ... ]
# Ready on http://127.0.0.1:8788
```

**If this fails**:

- Account ID is incorrect
- Token doesn't have access to this account
- Missing bindings in wrangler.jsonc

### Test GitHub Secrets (CI)

Secrets cannot be tested locally. They will be validated when you push code and trigger GitHub Actions.

**How to verify secrets work in CI**:

1. Push a commit to trigger the workflow
2. Go to Actions tab and view the workflow run
3. Check logs for these indicators:
   - Secrets are masked (show as `***` in logs)
   - Wrangler authenticates successfully
   - No authentication errors

---

## 🚨 Troubleshooting

### Issue: "Authentication error" in CI

**Symptoms**:

- CI job fails with "Authentication error"
- Wrangler cannot access Cloudflare API

**Solutions**:

1. Verify secret names are **exactly**: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
2. Check token has required permissions (Account Settings: Read minimum)
3. Verify token hasn't expired (check Cloudflare Dashboard)
4. Regenerate token if necessary and update GitHub Secret

**Verify Fix**:

```bash
# Re-run the GitHub Actions workflow
# Check logs for successful authentication
```

---

### Issue: "Account ID mismatch"

**Symptoms**:

- CI job fails with account-related errors
- Wrangler reports wrong account

**Solutions**:

1. Verify Account ID in GitHub Secrets matches Cloudflare Dashboard
2. Copy-paste Account ID again carefully (no extra spaces)
3. Ensure token is associated with correct Cloudflare account

**Verify Fix**:

```bash
# Check wrangler.jsonc has correct account_id
cat wrangler.jsonc | grep account_id

# Re-run workflow
```

---

### Issue: Secrets not masked in logs

**Symptoms**:

- Secrets appear as plain text in workflow logs
- Security risk

**Solutions**:

1. Delete exposed secrets immediately
2. Rotate/regenerate API token in Cloudflare Dashboard
3. Update GitHub Secret with new token
4. Verify secret names match EXACTLY what's in workflow YAML

**Verify Fix**:

```bash
# Check workflow file uses correct syntax
grep -A 5 "env:" .github/workflows/quality.yml

# Expected:
# env:
#   CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
#   CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

---

### Issue: "wrangler whoami" fails locally

**Symptoms**:

- `wrangler whoami` command fails
- Cannot verify token

**Solutions**:

1. Ensure token is exported correctly:
   ```bash
   echo $CLOUDFLARE_API_TOKEN
   # Should print your token
   ```
2. Verify token format (long alphanumeric string)
3. Check network connectivity to Cloudflare API
4. Try regenerating token in Cloudflare Dashboard

---

## 📝 Setup Checklist

Complete this checklist before starting Phase 3 implementation:

### Cloudflare Setup

- [ ] Cloudflare account accessible
- [ ] API token created with required permissions
- [ ] Token copied and saved securely
- [ ] Account ID copied from Workers dashboard
- [ ] Local test with `wrangler whoami` successful

### GitHub Setup

- [ ] Repository admin access confirmed
- [ ] Navigated to Settings → Secrets and variables → Actions
- [ ] `CLOUDFLARE_API_TOKEN` secret added
- [ ] `CLOUDFLARE_ACCOUNT_ID` secret added
- [ ] Both secrets visible in list (values masked)

### Validation

- [ ] Local wrangler commands work with token
- [ ] `pnpm preview` starts successfully
- [ ] `pnpm test:e2e` passes locally (Phase 2 validation)
- [ ] Ready to proceed with Commit 1 of Phase 3

**Environment is ready for Phase 3! 🚀**

---

## 📚 Additional Resources

### Official Documentation

- [Cloudflare API Tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [Wrangler Authentication](https://developers.cloudflare.com/workers/wrangler/commands/#auth)

### Project Documentation

- [Story Document](../../STORY_E2E_CLOUDFLARE_REFACTOR.md) - Full specification
- [Phase 3 Implementation Plan](./IMPLEMENTATION_PLAN.md) - Atomic commits guide
- [CI Secrets Setup Guide](../../CI_SECRETS_SETUP.md) - Detailed guide (created in Commit 1)

---

**Last Updated**: 2025-01-19
**Version**: 1.0.0
