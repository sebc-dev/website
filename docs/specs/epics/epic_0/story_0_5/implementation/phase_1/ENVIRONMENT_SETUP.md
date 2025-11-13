# Phase 1 - Environment Setup

This guide covers all environment setup needed for Phase 1: R2 Bucket Configuration.

---

## 📋 Prerequisites

### Previous Phases/Stories

- [x] Story 0.1: Next.js 15 initialized ✅
- [x] Story 0.2: OpenNext adapter configured ✅
- [x] Story 0.6: Compatibility flags set ✅
- [x] Project builds successfully (`pnpm build`)
- [x] `wrangler.jsonc` exists and is valid

### Tools Required

- [x] **Node.js** (v18.17.0 or higher)

  ```bash
  node --version
  # Expected: v18.17.0+
  ```

- [x] **pnpm** (v8.0.0 or higher)

  ```bash
  pnpm --version
  # Expected: v8.0.0+
  ```

- [x] **Wrangler CLI** (v3.0.0 or higher)

  ```bash
  wrangler --version
  # Expected: v3.0.0+
  ```

- [x] **jq** (for JSON validation - optional but recommended)
  ```bash
  jq --version
  # Expected: jq-1.6 or higher
  ```

### Cloudflare Account Requirements

- [x] **Cloudflare Account** with Workers access
- [x] **R2 enabled** on your account
- [x] **Authenticated with Wrangler CLI**

---

## 🔐 Cloudflare Account Setup

### Step 1: Verify Cloudflare Account Access

```bash
# Check if you're logged in
wrangler whoami
```

**Expected Output**:

```
 ⛅️ wrangler 3.x.x
-------------------
Getting User settings...
👋 You are logged in with an OAuth Token, associated with the email <your-email>@<domain>.
┌──────────────────────────┬──────────────────────────────────┐
│ Account Name             │ Account ID                       │
├──────────────────────────┼──────────────────────────────────┤
│ Your Account Name        │ abcdef1234567890abcdef1234567890 │
└──────────────────────────┴──────────────────────────────────┘
```

If not logged in:

```bash
# Login to Cloudflare
wrangler login
# This will open a browser for OAuth authentication
```

### Step 2: Verify R2 Access

```bash
# List existing R2 buckets (if any)
wrangler r2 bucket list
```

**Expected Output** (if R2 is enabled):

```
Listing buckets...
┌──────────────┬──────────────┬─────────────────┐
│ Name         │ Creation Date│ Bucket Location │
├──────────────┼──────────────┼─────────────────┤
│ (empty list or existing buckets)              │
└──────────────┴──────────────┴─────────────────┘
```

**If R2 is NOT enabled**:

```
Error: R2 is not enabled on this account.
Please enable R2 at https://dash.cloudflare.com/r2
```

**Action**: Enable R2 in Cloudflare Dashboard

1. Navigate to: https://dash.cloudflare.com/
2. Go to: Workers & Pages → R2
3. Click "Enable R2" if not already enabled
4. Accept pricing terms (free tier: 10 GB, 1M writes, 10M reads/month)

### Step 3: Verify Account Has No Existing `sebc-next-cache` Bucket

```bash
# Check for existing bucket with same name
wrangler r2 bucket list | grep sebc-next-cache
```

**Expected Output**: (empty - no output means no conflict)

If bucket exists:

- **Option A**: Delete existing bucket (if safe to do so)
  ```bash
  wrangler r2 bucket delete sebc-next-cache
  ```
- **Option B**: Use a different bucket name (update PHASES_PLAN.md and all commits)

---

## 📦 Dependencies Installation

**No new packages required for Phase 1**. This phase only configures infrastructure (R2 bucket) and updates wrangler.jsonc.

Verify existing dependencies:

```bash
# Verify OpenNext adapter is installed
pnpm list @opennextjs/cloudflare
# Expected: @opennextjs/cloudflare v1.3.0+ (from Story 0.2)

# Verify project builds
pnpm build
# Should complete without errors
```

---

## 🔧 Environment Variables

**No environment variables required for Phase 1**.

R2 bucket binding is configured in `wrangler.jsonc` and automatically available via `env.NEXT_INC_CACHE_R2_BUCKET` in the worker runtime.

### Verify Current Environment

```bash
# Check current wrangler.jsonc structure
cat wrangler.jsonc | jq .

# Verify D1 database binding already exists (from Story 0.4)
cat wrangler.jsonc | jq '.d1_databases'

# Expected: Array with DB binding
```

---

## 🗄️ Cloudflare R2 Service

### Purpose

R2 provides object storage for Next.js Incremental Static Regeneration (ISR) cache. It stores generated static pages persistently across deployments, enabling fast cache hits from Cloudflare's global network.

### R2 Capabilities

- **Object Storage**: Stores HTML, JSON, and other static assets
- **Global Distribution**: Served from Cloudflare's edge network (300+ locations)
- **S3-Compatible API**: Works with S3-compatible tools (if needed)
- **Eventually Consistent**: Writes are eventually consistent across regions
- **Low Latency**: Sub-50ms reads from edge locations

### R2 Pricing (as of 2025)

**Free Tier** (per month):

- 10 GB storage
- 1 million Class A operations (writes, lists)
- 10 million Class B operations (reads)

**Paid Tier** (per month):

- Storage: $0.015 per GB
- Class A operations: $4.50 per million (writes)
- Class B operations: $0.36 per million (reads)
- No egress fees (unlike S3)

**Example Cost** (typical blog with ISR):

- Storage: 1 GB cached pages = $0.015/month
- Writes: 50,000 page generations = $0.225/month
- Reads: 500,000 cache hits = $0.018/month
- **Total**: ~$0.26/month (well within budget)

### Service Setup Steps

**Step 1: Enable R2** (if not already done in previous section)

**Step 2: Verify R2 Dashboard Access**

1. Navigate to: https://dash.cloudflare.com/
2. Click: Workers & Pages → R2
3. Verify you see "Buckets" tab (not "Get Started")

**Step 3: Understand R2 Limits**

- Bucket name: 3-63 characters, lowercase, alphanumeric, hyphens
- Max object size: 5 TB
- Max upload part size: 5 GB
- Max parts per upload: 10,000

### Verification

```bash
# Verify R2 API access
wrangler r2 bucket list

# Check R2 usage (after bucket creation)
# Dashboard: https://dash.cloudflare.com/ → R2 → [bucket] → Metrics
```

**Expected Result**: R2 is enabled and accessible

---

## ✅ Connection Tests

### Test Cloudflare Authentication

```bash
# Verify authentication
wrangler whoami

# Expected: Shows account name and ID
```

### Test R2 Access

```bash
# List R2 buckets (should work without errors)
wrangler r2 bucket list

# Expected: Returns list (may be empty) without errors
```

### Test Wrangler Configuration

```bash
# Validate wrangler.jsonc syntax
cat wrangler.jsonc | jq empty

# Expected: No output (silent success)

# Verify Next.js build works
pnpm build

# Expected: Build completes successfully
```

---

## 🚨 Troubleshooting

### Issue: "wrangler: command not found"

**Symptoms**:

- `wrangler` command not recognized
- Error when running `wrangler whoami`

**Solutions**:

1. **Install Wrangler globally**:

   ```bash
   npm install -g wrangler
   # or
   pnpm add -g wrangler
   ```

2. **Verify installation**:

   ```bash
   wrangler --version
   ```

3. **Alternative: Use local Wrangler** (if in package.json):
   ```bash
   npx wrangler whoami
   # or
   pnpm wrangler whoami
   ```

**Verify Fix**:

```bash
wrangler whoami
# Should show your Cloudflare account
```

---

### Issue: "R2 is not enabled on this account"

**Symptoms**:

- `wrangler r2 bucket list` returns error
- Message: "R2 is not enabled"

**Solutions**:

1. **Enable R2 in Cloudflare Dashboard**:
   - Go to: https://dash.cloudflare.com/
   - Navigate to: Workers & Pages → R2
   - Click: "Enable R2"
   - Accept pricing terms

2. **Wait for activation** (usually instant, but can take a few minutes)

3. **Retry R2 command**:
   ```bash
   wrangler r2 bucket list
   ```

**Verify Fix**:

```bash
wrangler r2 bucket list
# Should return list (even if empty) without errors
```

---

### Issue: "You are not authenticated"

**Symptoms**:

- `wrangler whoami` shows "Not logged in"
- R2 commands fail with authentication error

**Solutions**:

1. **Login to Cloudflare**:

   ```bash
   wrangler login
   ```

   - Opens browser for OAuth
   - Authorize Wrangler to access your account

2. **Alternative: API Token** (for CI/CD):

   ```bash
   # Set API token environment variable
   export CLOUDFLARE_API_TOKEN=<your-token>

   # Then use wrangler
   wrangler whoami
   ```

3. **Check authentication**:
   ```bash
   wrangler whoami
   # Should show account details
   ```

**Verify Fix**:

```bash
wrangler whoami
# Should display account name and ID
```

---

### Issue: Bucket name "sebc-next-cache" already exists

**Symptoms**:

- `wrangler r2 bucket create sebc-next-cache` fails
- Error: "Bucket already exists"

**Solutions**:

**Option A: Delete existing bucket** (if safe):

```bash
# List bucket contents (make sure it's safe to delete)
wrangler r2 object list sebc-next-cache

# Delete bucket (WARNING: irreversible)
wrangler r2 bucket delete sebc-next-cache
```

**Option B: Use different bucket name**:

1. Choose new name (e.g., `sebc-next-cache-v2`)
2. Update Commit 1 command
3. Update Commit 2 binding configuration
4. Document change in commit messages

**Option C: Reuse existing bucket**:

1. Verify bucket is appropriate for this project
2. Skip Commit 1 (bucket already exists)
3. Proceed to Commit 2 (binding configuration)
4. Document in Commit 2 message that bucket pre-existed

**Verify Fix**:

```bash
wrangler r2 bucket list | grep sebc-next-cache
# Should show the bucket (new or existing)
```

---

### Issue: "jq: command not found"

**Symptoms**:

- `cat wrangler.jsonc | jq empty` fails
- Error: "jq: command not found"

**Solutions**:

**Option A: Install jq**:

On macOS:

```bash
brew install jq
```

On Ubuntu/Debian:

```bash
sudo apt-get install jq
```

On Windows (WSL):

```bash
sudo apt-get install jq
```

**Option B: Skip jq validation** (not recommended):

- Manually validate JSON syntax in editor
- Use online JSON validator

**Verify Fix**:

```bash
jq --version
# Should show jq version
```

---

## 📝 Setup Checklist

Complete this checklist before starting implementation:

### Prerequisites

- [ ] Node.js v18.17.0+ installed
- [ ] pnpm v8.0.0+ installed
- [ ] Wrangler CLI v3.0.0+ installed
- [ ] jq installed (optional but recommended)

### Cloudflare Account

- [ ] Cloudflare account created
- [ ] Logged in to Wrangler (`wrangler whoami` works)
- [ ] R2 enabled on account
- [ ] `wrangler r2 bucket list` works (no authentication errors)

### Project State

- [ ] Story 0.1 completed (Next.js initialized)
- [ ] Story 0.2 completed (OpenNext configured)
- [ ] Story 0.6 completed (compatibility flags set)
- [ ] `wrangler.jsonc` exists and is valid JSON
- [ ] `pnpm build` succeeds

### Bucket Name

- [ ] Verified no existing bucket named `sebc-next-cache`
- [ ] Or: Decided on alternative name if conflict exists
- [ ] Or: Confirmed reusing existing bucket is appropriate

### Ready to Implement

- [ ] All validation commands passed
- [ ] No blocking issues in troubleshooting section
- [ ] Documentation reviewed and understood

**Environment is ready! 🚀**

---

## 📚 Additional Resources

### Cloudflare Documentation

- R2 Overview: https://developers.cloudflare.com/r2/
- R2 Get Started: https://developers.cloudflare.com/r2/get-started/
- R2 Pricing: https://developers.cloudflare.com/r2/platform/pricing/
- Wrangler R2 Commands: https://developers.cloudflare.com/workers/wrangler/commands/#r2

### OpenNext Documentation

- Cloudflare Caching: https://opennext.js.org/cloudflare/caching
- R2 Incremental Cache: https://opennext.js.org/cloudflare/caching#r2-incremental-cache

### Next.js Documentation

- ISR (Incremental Static Regeneration): https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration
- Revalidation: https://nextjs.org/docs/app/building-your-application/data-fetching/revalidating

---

## 🎯 Next Steps

After completing this environment setup:

1. **Proceed to Commit 1**: Create R2 bucket

   ```bash
   # Follow COMMIT_CHECKLIST.md Section: Commit 1
   wrangler r2 bucket create sebc-next-cache
   ```

2. **Then Commit 2**: Add binding to wrangler.jsonc

   ```bash
   # Follow COMMIT_CHECKLIST.md Section: Commit 2
   # Edit wrangler.jsonc
   ```

3. **Finally Commit 3**: Document architecture
   ```bash
   # Follow COMMIT_CHECKLIST.md Section: Commit 3
   # Create documentation files
   ```

**Environment setup complete. Ready for implementation! 🚀**
