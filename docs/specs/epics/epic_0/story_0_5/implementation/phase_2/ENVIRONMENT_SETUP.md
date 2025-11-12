# Phase 2 - Environment Setup

This guide covers all environment setup needed for Phase 2 (Durable Objects Bindings Configuration).

---

## 📋 Prerequisites

### Previous Phases

- [x] **Phase 1 Complete**: R2 bucket created and binding configured
  - Verify: Check `wrangler.jsonc` for `NEXT_INC_CACHE_R2_BUCKET` binding
  - Status: `pnpm dev` should not show R2 errors

### Stories Complete

- [x] **Story 0.1**: Next.js initialized
- [x] **Story 0.2**: OpenNext adapter configured
- [x] **Story 0.6**: Compatibility flags set
- [x] **Story 0.4**: Drizzle ORM + D1 configured (optional, but good to have)

### Tools and Access Required

- [x] **Wrangler CLI** v3.5+ installed locally
  ```bash
  wrangler --version
  # Should show v3.5.0 or higher
  ```
- [x] **Cloudflare Account** with:
  - Access to Workers & Pages
  - Access to Durable Objects (check account plan - available on Pro+)
  - Permissions to create/modify workers
- [x] **Git** installed (for version control)
- [x] **pnpm** installed (Node.js package manager)

### Verify Prerequisites

```bash
# 1. Check Wrangler version
wrangler --version
# Expected: v3.5.0 or higher

# 2. Verify Cloudflare account access
wrangler whoami
# Expected: Your Cloudflare account email

# 3. Check current wrangler.jsonc has Phase 1 config
cat wrangler.jsonc | grep -A 3 "r2_buckets"
# Expected: NEXT_INC_CACHE_R2_BUCKET binding configured

# 4. Verify Next.js and OpenNext installed
grep "@opennextjs/cloudflare" package.json
# Expected: Version listed

# 5. Verify Node.js version
node --version
# Expected: v18+ (required for Next.js 15)
```

---

## 📦 Dependencies

### No New Packages to Install

Phase 2 only requires **configuration changes**. No new npm packages needed.

**Why?**
- Durable Objects classes provided by `@opennextjs/cloudflare` (already installed)
- Configuration is pure JSON/JSONC in `wrangler.jsonc`
- Documentation uses Markdown (no special tools needed)

### Verify OpenNext Types Installed

```bash
# Check @opennextjs/cloudflare is installed
npm ls @opennextjs/cloudflare

# Expected output:
# @opennextjs/cloudflare@1.x.x
```

If not installed, it will show when you run `pnpm install`.

---

## 🔧 Environment Variables

### No New Environment Variables Needed

Phase 2 only modifies `wrangler.jsonc` bindings configuration. The bindings are declared in the configuration file, not environment variables.

**Note**: Environment variables would be needed in Phase 3 (when OpenNext config enables cache), but that's Phase 3's responsibility.

### Verify Existing Configuration

```bash
# Check current wrangler.jsonc has all Phase 1 bindings
cat wrangler.jsonc | jq '.r2_buckets, .durable_objects'

# Current state (Phase 1 complete):
# {
#   "r2_buckets": [
#     {
#       "binding": "NEXT_INC_CACHE_R2_BUCKET",
#       "bucket_name": "sebc-next-cache"
#     }
#   ]
# }
# null (DO bindings not yet added - that's what Phase 2 does!)
```

---

## 🗄️ Cloudflare Resources Status

### Phase 1 Status (already completed)

**R2 Bucket**: `sebc-next-cache`
- ✅ Created and accessible
- ✅ Binding configured in wrangler.jsonc

Verify:
```bash
# List R2 buckets
wrangler r2 bucket list

# Expected: sebc-next-cache listed
```

### Phase 2 Status (what we're configuring)

**Durable Objects**: Not yet created (will be auto-created when first deployed)
- Status: ❌ Not created (will be after Phase 2 committed)
- DO Classes:
  - `DOQueueHandler` (ISR queue) - provided by OpenNext
  - `DOTagCacheShard` (tag cache, sharded) - provided by OpenNext
- When created: After Phase 2 config deployed to production

**Note**: Local development via `wrangler dev` simulates DO bindings without creating real DO instances.

---

## 🧪 Connection Tests

### Test 1: Verify JSON/JSONC Syntax

Before starting Phase 2, ensure `wrangler.jsonc` is valid:

```bash
# Check JSONC syntax
cat wrangler.jsonc | jq . > /dev/null && echo "✓ JSONC valid" || echo "✗ JSONC invalid"
```

**Expected Result**: ✓ JSONC valid

### Test 2: Verify Wrangler Configuration

```bash
# List all current bindings
wrangler deploy --dry-run 2>&1 | grep -i "binding\|Durable"

# Or simpler: Show wrangler.jsonc structure
cat wrangler.jsonc | jq 'keys'

# Expected: Array of configuration sections (name, main, env, r2_buckets, etc.)
```

### Test 3: Start Development Server

```bash
# Start local development
pnpm dev

# Expected output:
# - No errors about missing bindings
# - Server running on http://localhost:3000
# - R2 bucket binding accessible (from Phase 1)

# After Phase 2 committed:
# - Should show DO bindings loaded (or no errors)

# Stop with Ctrl+C
```

---

## ✅ Setup Checklist

Complete this checklist before starting Phase 2 implementation:

- [ ] **Prerequisites Met**
  - [ ] Phase 1 (R2) completed
  - [ ] Wrangler CLI v3.5+ installed
  - [ ] Cloudflare account access verified
  - [ ] Git initialized

- [ ] **Tools Verified**
  - [ ] `wrangler --version` shows v3.5+
  - [ ] `wrangler whoami` shows account email
  - [ ] `node --version` shows v18+
  - [ ] `pnpm --version` shows installed

- [ ] **Current Configuration Valid**
  - [ ] `wrangler.jsonc` has valid JSONC syntax
  - [ ] `NEXT_INC_CACHE_R2_BUCKET` binding exists (Phase 1)
  - [ ] `pnpm dev` runs without errors

- [ ] **Resources Ready**
  - [ ] R2 bucket `sebc-next-cache` exists and is accessible
  - [ ] Cloudflare account shows R2 bucket in dashboard
  - [ ] @opennextjs/cloudflare is installed

- [ ] **Documentation Reviewed**
  - [ ] Read PHASES_PLAN.md for context
  - [ ] Understand DO architecture overview
  - [ ] Know what's being configured (4 commits)

**All prerequisites met? Ready to start Phase 2! 🚀**

---

## 📝 Troubleshooting

### Issue: Wrangler CLI version too old

**Symptoms**:
- `wrangler --version` shows v3.0 or older
- Commands not recognized

**Solutions**:
1. Update Wrangler:
   ```bash
   npm install -g wrangler@latest
   ```
2. Or use local version:
   ```bash
   npx wrangler@3.5+ [command]
   ```

**Verify Fix**:
```bash
wrangler --version
# Should show v3.5.0+
```

---

### Issue: Cloudflare account access not working

**Symptoms**:
- `wrangler whoami` shows "Not authenticated"
- Login commands fail

**Solutions**:
1. Re-authenticate:
   ```bash
   wrangler login
   # Follow browser login flow
   ```
2. Or use API token:
   ```bash
   wrangler login --api-token [your-api-token]
   ```

**Verify Fix**:
```bash
wrangler whoami
# Should show your Cloudflare account email
```

---

### Issue: Durable Objects not available on account

**Symptoms**:
- Cloudflare Dashboard shows "Durable Objects (Coming Soon)"
- Error when trying to configure DO

**Solutions**:
1. Check account plan:
   - Durable Objects available on: Workers Pro, Cloudflare Pro, Business, Enterprise
   - Not available on: Free plan (Workers Bundled)
2. If on free plan:
   - Upgrade to Cloudflare Pro plan OR
   - Use D1 alternative for tag cache (documented in Phase 2)
3. Contact Cloudflare Support if issue persists

---

### Issue: JSONC syntax error in wrangler.jsonc

**Symptoms**:
- `jq .` command fails on wrangler.jsonc
- Wrangler errors during deploy

**Solutions**:
1. Validate JSONC syntax:
   ```bash
   cat wrangler.jsonc | jq .
   # Will show JSON parsing error if syntax wrong
   ```
2. Common issues:
   - Trailing commas in JSON arrays
   - Unquoted property names
   - Missing colons between key and value
   - Improper nesting of brackets
3. Use a JSONC validator:
   ```bash
   npm install -g jsonc-parser
   jsonc-parser wrangler.jsonc
   ```

**Verify Fix**:
```bash
cat wrangler.jsonc | jq . > /dev/null && echo "✓ Valid"
```

---

### Issue: R2 Bucket not found

**Symptoms**:
- `wrangler r2 bucket list` doesn't show `sebc-next-cache`
- Wrangler errors about missing R2 bucket

**Solutions**:
1. Check bucket exists:
   ```bash
   wrangler r2 bucket list
   ```
2. If missing, create it (should be done in Phase 1):
   ```bash
   wrangler r2 bucket create sebc-next-cache
   ```
3. Verify bucket binding in wrangler.jsonc:
   ```bash
   cat wrangler.jsonc | jq '.r2_buckets'
   ```

**Verify Fix**:
```bash
wrangler r2 bucket list | grep sebc-next-cache
# Should show the bucket
```

---

### Issue: pnpm dev fails to start

**Symptoms**:
- `pnpm dev` shows errors
- Server doesn't start
- Binding errors in console

**Solutions**:
1. Check Node.js version:
   ```bash
   node --version
   # Must be v18 or higher
   ```
2. Clear cache and reinstall:
   ```bash
   rm -rf node_modules .pnpm-store
   pnpm install
   ```
3. Verify wrangler.jsonc syntax:
   ```bash
   cat wrangler.jsonc | jq .
   # Should not show errors
   ```

**Verify Fix**:
```bash
pnpm dev
# Should start without errors
```

---

## 🚀 Ready to Proceed

When all prerequisites are verified and setup checklist is complete:

1. Proceed to **IMPLEMENTATION_PLAN.md**
2. Follow **COMMIT_CHECKLIST.md** for each of 4 commits
3. Use **guides/TESTING.md** for manual validation

**Phase 2 environment is ready!**
