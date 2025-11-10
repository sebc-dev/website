# GitHub Secrets Setup Guide for Cloudflare Deployment

**Last Updated**: 2025-11-10
**Part of**: Epic 0, Story 0.7, Phase 1 - D1 Migrations Automation
**Status**: Essential setup for CI/CD pipeline

---

## Overview

This guide explains how to create and configure Cloudflare API credentials for GitHub Actions to automate database migrations and deployments to Cloudflare Workers.

### Why This Matters

The CI/CD pipeline needs secure credentials to:

- Apply database migrations automatically
- Deploy code to Cloudflare Workers
- Verify infrastructure changes

This guide ensures credentials are:

- **Secure**: API tokens with minimal required permissions
- **Rotatable**: Clear procedures for token rotation and revocation
- **Auditable**: Traceable to specific GitHub Actions workflows
- **Compliant**: Following security best practices

---

## Prerequisites

Before starting this guide, you need:

- [x] **Cloudflare Account** - Free or paid (Workers must be enabled)
- [x] **GitHub Repository** - The repository where this codebase is deployed
- [x] **Admin access to Cloudflare Dashboard** - To create API tokens
- [x] **Repository Settings access on GitHub** - To add secrets

---

## Part 1: Create Cloudflare API Token

### Step 1: Access the API Tokens Page

1. Go to **Cloudflare Dashboard**: https://dash.cloudflare.com
2. Click **My Profile** (bottom left, next to your account name)
3. Click **API Tokens** in the left sidebar
4. Or use direct link: https://dash.cloudflare.com/profile/api-tokens

You should see:

- Existing API tokens (if any)
- Button "Create Token" (top right)
- Button "Create Custom Token"

### Step 2: Create a Custom Token

1. Click **"Create Token"** (or "Create Custom Token" if available)
2. Choose **"Create Custom Token"** template (not "Use template")
3. You'll see the custom token creation form

### Step 3: Configure Token Permissions

Fill in the custom token form as follows:

#### Token Name

```
GitHub Actions - D1 Migrations & Deployment
```

Purpose: This identifies the token for GitHub Actions automation.

#### Permissions

Add exactly these two permissions:

1. **First permission: Cloudflare D1**
   - Click "Add permission"
   - Category: **Account**
   - Permission: **Cloudflare D1** → **Edit**
   - This allows applying migrations to D1 databases

2. **Second permission: Workers Scripts**
   - Click "Add permission" again
   - Category: **Account**
   - Permission: **Workers Scripts** → **Edit**
   - This allows deploying to Cloudflare Workers

**Visual Guide**:

```
Permissions:
├─ Account
│  ├─ Cloudflare D1 → Edit ✓
│  └─ Workers Scripts → Edit ✓
```

#### Account Resources

1. Expand **"Account Resources"** section
2. Select **"Include"**
3. Click dropdown and select **"Specific account"**
4. Choose your Cloudflare account from the list
5. Click **"Continue"** or **"Review"**

**Why these permissions?**

- **Cloudflare D1 | Edit**: Allows reading and applying migrations
- **Workers Scripts | Edit**: Allows deploying updated Worker code
- **Specific account**: Restricts token to your account only

#### TTL (Time to Live) - Optional

1. Scroll to **"TTL"** section (optional)
2. Options:
   - Leave blank: Token never expires
   - Set to 1 year: Token expires in 1 year (recommended for security)
   - Set custom date: Choose your preferred expiration

**Recommendation**: Set TTL to 1 year for regular rotation.

#### IP Address Filtering - Leave Empty

The **"Client IP Address Filtering"** section should be left empty because:

- GitHub Actions runners have dynamic IPs
- We cannot whitelist specific GitHub IP ranges reliably
- The token permissions are restricted enough (not overly broad)

### Step 4: Review and Create

1. Click **"Continue to summary"** or similar button
2. Review the permissions:
   ```
   Token Name: GitHub Actions - D1 Migrations & Deployment
   Account: [Your Account Name]
   Permissions:
   - Account:Cloudflare D1:Edit
   - Account:Workers Scripts:Edit
   ```
3. Click **"Create Token"**

### Step 5: Copy the Token

⚠️ **CRITICAL**: The token is displayed only once!

1. You'll see a green success message with the token
2. The token looks like: `cloudflare-api-token-xxxxx...` (very long string)
3. Click **"Copy"** button next to the token
4. Paste it into a secure location temporarily:
   - Password manager (1Password, Bitwarden, LastPass)
   - Secure note app
   - **NOT** in plain text files or Slack
5. Keep this token secure until you add it to GitHub

**Token Format Example** (partial):

```
cloudflare-api-token-v1.0_abc123def456ghi789...
```

---

## Part 2: Get Your Cloudflare Account ID

### Why You Need Account ID

The Account ID is needed in GitHub Actions workflows to identify which Cloudflare account to deploy to. Unlike the API token, the Account ID is NOT secret.

### Step 1: Find Your Account ID

Method A: From any page in Cloudflare Dashboard

1. Look at the **right sidebar**
2. Find **"Account ID"** (usually near "Account Name")
3. Copy the Account ID (32-character string, looks like: `abc1234def567ghi890jklmno123456`)

Method B: From the URL

1. Go to Cloudflare Dashboard
2. Navigate to any page (e.g., Workers, D1, Domains)
3. Look at the URL: `https://dash.cloudflare.com/{account-id}/...`
4. The part between slashes is your Account ID

Method C: From wrangler CLI

```bash
npx wrangler whoami
```

Output will include:

```
You are logged in with an API Token.
Account Name: Your Account Name
Account ID: abc1234def567ghi890jklmno123456
```

### Step 2: Verify Account ID Format

Your Account ID should be:

- 32 characters long
- Hexadecimal (letters A-F and numbers 0-9)
- Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

---

## Part 3: Add Secrets to GitHub Repository

### Step 1: Navigate to Repository Secrets

1. Go to your GitHub repository
2. Click **Settings** (top navigation bar)
3. Click **Secrets and variables** in the left sidebar
4. Click **Actions** (sub-menu)
5. You should see:
   - **Repository secrets** section (at top)
   - **Environment secrets** section (if you have environments set up)
   - **Button**: "New repository secret"

### Step 2: Add CLOUDFLARE_API_TOKEN Secret

1. Click **"New repository secret"** button
2. Fill in the form:
   - **Name**: `CLOUDFLARE_API_TOKEN` (exactly this, case-sensitive)
   - **Secret**: Paste the API token from Step 1 above
3. Click **"Add secret"** button

**Verification**: You should see `CLOUDFLARE_API_TOKEN` appear in the Repository secrets list (showing when it was updated)

### Step 3: Add CLOUDFLARE_ACCOUNT_ID Secret

1. Click **"New repository secret"** button again
2. Fill in the form:
   - **Name**: `CLOUDFLARE_ACCOUNT_ID` (exactly this, case-sensitive)
   - **Secret**: Paste your Account ID from Part 2 above
3. Click **"Add secret"** button

**Verification**: Both secrets should now appear:

```
Repository secrets:
├─ CLOUDFLARE_API_TOKEN (Updated now)
└─ CLOUDFLARE_ACCOUNT_ID (Updated now)
```

---

## Part 4: Verify Secrets Are Configured

### GitHub UI Verification (No Testing Required)

1. Go to Settings → Secrets and variables → Actions
2. Under "Repository secrets", you should see:
   - ✅ `CLOUDFLARE_API_TOKEN` (value is hidden)
   - ✅ `CLOUDFLARE_ACCOUNT_ID` (value is hidden)
3. Both should show "Updated X seconds ago" or similar

### Optional: Test Token Locally

**WARNING**: Only do this if you're confident with CLI tools. Skip if unsure.

```bash
# Set environment variables temporarily (using token from Part 1)
export CLOUDFLARE_API_TOKEN="cloudflare-api-token-v1.0_xxx..."
export CLOUDFLARE_ACCOUNT_ID="abc1234def567ghi890jklmno123456"

# Test if token is valid
npx wrangler whoami

# Expected output:
# You are logged in with an API Token.
# Account Name: [Your Account Name]
# Account ID: [Your Account ID]

# Test D1 access
npx wrangler d1 list

# Expected output:
# A list of your D1 databases (should include sebc-dev-db)

# Clear the environment variables after testing
unset CLOUDFLARE_API_TOKEN
unset CLOUDFLARE_ACCOUNT_ID
```

**Important**: Delete the environment variables from your shell after testing!

---

## Part 5: Secret Rotation and Maintenance

### When to Rotate Secrets

Rotate your Cloudflare API token in these situations:

1. **Security incident**: Token may have been exposed
2. **Employee departure**: Person who has the token is leaving
3. **Regular schedule**: Every 6-12 months (if TTL is set)
4. **Suspected compromise**: Token activity looks suspicious

### How to Rotate Secrets

1. **Step 1: Create new token in Cloudflare**
   - Follow Part 1 above to create a new token
   - Cloudflare allows multiple tokens simultaneously

2. **Step 2: Update GitHub secret**
   - Go to Settings → Secrets and variables → Actions
   - Click the CLOUDFLARE_API_TOKEN secret
   - Click "Update"
   - Paste the new token
   - Click "Update secret"

3. **Step 3: Revoke old token in Cloudflare**
   - Go to Cloudflare Dashboard → My Profile → API Tokens
   - Find the old token (labeled "GitHub Actions - D1 Migrations & Deployment")
   - Click the menu button (...) next to it
   - Click "Roll" or "Revoke"
   - Confirm the action
   - **IMPORTANT**: Do this AFTER GitHub is updated successfully

4. **Step 4: Verify**
   - Trigger a GitHub Actions workflow (if available)
   - Verify it succeeds with the new token
   - Confirm old token is revoked in Cloudflare dashboard

### How to Revoke/Invalidate Secrets

If you need to immediately revoke access (e.g., security incident):

1. **Revoke in Cloudflare immediately**:
   - Cloudflare Dashboard → My Profile → API Tokens
   - Find token → Click (...) → Click "Roll" or "Revoke"
   - Confirm immediately

2. **Remove from GitHub**:
   - Settings → Secrets and variables → Actions
   - Click CLOUDFLARE_API_TOKEN
   - Click "Delete"
   - Confirm

3. **Generate new token**:
   - Follow Part 1 to create new token
   - Follow Part 3 to add to GitHub

---

## Troubleshooting

### Problem: "Invalid API Token" Error in Workflows

**Symptoms**: GitHub Actions workflow fails with "Unauthorized" or "Invalid token"

**Causes**:

- Token not correctly copied
- Token expired or revoked
- Token doesn't have correct permissions
- Secret name misspelled in workflow

**Solutions**:

1. **Verify token exists locally**:

   ```bash
   export CLOUDFLARE_API_TOKEN="your-token-here"
   npx wrangler whoami
   ```

2. **Check GitHub secret name**:
   - Go to Settings → Secrets and variables → Actions
   - Verify exact name: `CLOUDFLARE_API_TOKEN` (case-sensitive)

3. **Verify token permissions**:
   - Cloudflare Dashboard → My Profile → API Tokens
   - Click the token
   - Scroll to "Permissions" section
   - Verify: D1:Edit and Workers Scripts:Edit

4. **Regenerate if needed**:
   - Create new token (Part 1)
   - Update GitHub secret (Part 3, Step 2)
   - Revoke old token (Part 5)

### Problem: "Account ID not found" Error

**Symptoms**: Workflow fails with "Account not found" or "Forbidden"

**Causes**:

- Account ID in GitHub secret is wrong
- Account ID doesn't match the token's account
- Account ID missing or empty

**Solutions**:

1. **Verify Account ID in GitHub**:
   - Settings → Secrets and variables → Actions
   - Click CLOUDFLARE_ACCOUNT_ID
   - Verify it's 32 characters and looks like: `abc1234def567...`

2. **Get correct Account ID**:

   ```bash
   npx wrangler whoami
   # Look for "Account ID" line
   ```

3. **Update GitHub secret**:
   - Settings → Secrets and variables → Actions
   - Click CLOUDFLARE_ACCOUNT_ID
   - Click "Update"
   - Paste correct Account ID
   - Click "Update secret"

### Problem: "Insufficient Permissions" Error

**Symptoms**: Token exists but doesn't have permission to perform action

**Causes**:

- Token doesn't have D1:Edit permission
- Token doesn't have Workers Scripts:Edit permission
- Token restricted to different account

**Solutions**:

1. **Check token permissions**:
   - Cloudflare Dashboard → My Profile → API Tokens
   - Click the token
   - Verify permissions section includes:
     - Account | Cloudflare D1 | Edit
     - Account | Workers Scripts | Edit

2. **If permissions are missing**:
   - Revoke old token (Part 5)
   - Create new token with correct permissions (Part 1)
   - Update GitHub secret (Part 3)

### Problem: "Can't find secret in workflow"

**Symptoms**: Workflow references `${{ secrets.CLOUDFLARE_API_TOKEN }}` but it's empty

**Causes**:

- Secret name misspelled in workflow (case-sensitive)
- Secret not pushed to main branch
- Secret deleted accidentally

**Solutions**:

1. **Verify secret exists**:
   - Settings → Secrets and variables → Actions
   - Look for both `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`

2. **Check secret name in workflow**:

   ```yaml
   # Correct (exact matching):
   env:
     CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
     CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}

   # Wrong (typos):
   env:
     CLOUDFLARE_API_TOKEN: ${{ secrets.cloudflare_api_token }}  # lowercase!
     CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOK }}    # truncated!
   ```

3. **Recreate secret if needed**:
   - Follow Part 3 to add both secrets again

---

## Security Best Practices

### Do's

✅ **DO**:

- Store secrets in GitHub repository secrets (GitHub encrypts them)
- Use environment secrets in Phase 3 for environment-specific tokens
- Rotate tokens regularly (every 6-12 months)
- Use minimal required permissions (D1:Edit, Workers Scripts:Edit)
- Revoke old tokens immediately after rotation
- Document when tokens were rotated (for audit trail)

### Don'ts

❌ **DON'T**:

- Commit tokens to Git repository (even with git-secrets configured)
- Share tokens via email, Slack, or unencrypted channels
- Use tokens locally in shell history (it's cached in `~/.bash_history`)
- Log token values in workflow outputs
- Set overly broad permissions (all account resources)
- Leave expired tokens in GitHub (clean them up)
- Reuse tokens across multiple CI/CD systems

### Token Lifecycle

```
Create → Store in GitHub → Use in workflows → Monitor → Rotate → Revoke → Delete
  ↓            ↓                 ↓              ↓        ↓        ↓       ↓
 30min        1 min           Every deploy    Weekly   6-12mo  Anytime  After revoke
```

---

## Testing Checklist

Complete this checklist to verify secrets are properly configured:

- [ ] Cloudflare API token created with correct permissions
  - [ ] Cloudflare D1 | Edit
  - [ ] Workers Scripts | Edit
  - [ ] Scoped to specific account
  - [ ] TTL set (optional, recommended 1 year)

- [ ] Token copied from Cloudflare and stored securely

- [ ] Cloudflare Account ID obtained and verified (32 chars)

- [ ] GitHub secrets configured:
  - [ ] CLOUDFLARE_API_TOKEN added to repository secrets
  - [ ] CLOUDFLARE_ACCOUNT_ID added to repository secrets
  - [ ] Both visible in Settings → Secrets and variables → Actions

- [ ] Local testing (optional):
  - [ ] `npx wrangler whoami` shows correct account
  - [ ] `npx wrangler d1 list` shows D1 databases
  - [ ] No errors or permission issues

- [ ] Documentation updated:
  - [ ] This file in docs/deployment/secrets-setup-guide.md
  - [ ] Accessible to team members
  - [ ] No token values or real account IDs in documentation

---

## Next Steps

After completing this setup guide:

1. **Commit 2**: Create migration workflow file (`.github/workflows/migrate.yml`)
2. **Commit 3**: Implement migration execution with error handling
3. **Commit 4**: Add migration validation and testing
4. **Commit 5**: Document rollback procedures and troubleshooting

The secrets configured in this commit will be used by the migration workflow in Commit 2 and 3.

---

## Reference Documentation

### Cloudflare Resources

- [Cloudflare API Documentation](https://developers.cloudflare.com/api/)
- [Create API Token Guide](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [Wrangler CI/CD Guide](https://developers.cloudflare.com/workers/wrangler/ci-cd/)
- [D1 Migrations Guide](https://developers.cloudflare.com/d1/reference/migrations/)

### GitHub Resources

- [GitHub Actions Secrets Documentation](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions)
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/security-for-github-actions)

### Related Documentation

- [Story 0.7 - CI/CD Specification](../epics/epic_0/story_0_7/story_0.7.md)
- [Phase 1 - D1 Migrations Automation](../epics/epic_0/story_0_7/implementation/phase_1/)
- [Deployment Overview](./README.md) (to be created)

---

**Document Created**: 2025-11-10
**Part of**: Epic 0, Story 0.7, Phase 1 - Commit 1/5
**Status**: Complete ✅
