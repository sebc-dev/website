# Phase 3 - Environment Setup

This guide covers all environment setup needed for Phase 3.

---

## 📋 Prerequisites

### Previous Phases

- [ ] **Phase 1 completed**: R2 bucket created and binding configured
- [ ] **Phase 2 completed**: Durable Objects bindings configured (queue + tag cache)
- [ ] R2 bucket `sebc-next-cache` (or configured name) exists in Cloudflare
- [ ] Durable Objects classes deployed (provided by OpenNext)
- [ ] `wrangler.jsonc` has R2 and DO bindings configured

### Tools Required

- [ ] **Node.js** (version 18.18.0+)
- [ ] **pnpm** (version 8+)
- [ ] **Wrangler CLI** (version 3+) - `npx wrangler --version`
- [ ] **Cloudflare account** with Workers, R2, and Durable Objects access

### Verification Commands

```bash
# Check Node.js version
node --version
# Should be v18.18.0 or higher

# Check pnpm version
pnpm --version
# Should be 8.x or higher

# Check Wrangler CLI
npx wrangler --version
# Should be 3.x or higher

# Verify Cloudflare login
npx wrangler whoami
# Should show your Cloudflare account email

# Verify R2 bucket exists (from Phase 1)
npx wrangler r2 bucket list
# Should include "sebc-next-cache" or your configured bucket name
```

---

## 📦 Dependencies Installation

### No New Packages Required

Phase 3 uses existing dependencies already installed in previous phases:

- `@opennextjs/cloudflare` - Already installed (Story 0.2)
- `next` - Already installed (Story 0.1)
- `@playwright/test` - Already installed for E2E tests

### Verify Existing Dependencies

```bash
# Check OpenNext version
pnpm list @opennextjs/cloudflare
# Should show version compatible with R2 cache (check package.json)

# Check Playwright version
pnpm list @playwright/test
# Should show latest stable version

# Reinstall if needed (unlikely)
pnpm install
```

---

## 🔧 Environment Variables

### Required Variables

Phase 3 does not require new environment variables. All bindings are configured in `wrangler.jsonc`.

### Verify Existing Configuration

Check that `wrangler.jsonc` has the following sections from Phase 1 & 2:

```jsonc
{
  "name": "website",
  // ... other config ...

  // From Phase 1: R2 Bucket
  "r2_buckets": [
    {
      "binding": "NEXT_INC_CACHE_R2_BUCKET",
      "bucket_name": "sebc-next-cache",
    },
  ],

  // From Phase 2: Durable Objects
  "durable_objects": {
    "bindings": [
      {
        "name": "NEXT_CACHE_DO_QUEUE",
        "class_name": "DOQueueHandler",
        "script_name": "website",
      },
      {
        "name": "NEXT_TAG_CACHE_DO_SHARDED",
        "class_name": "DOTagCacheShard",
        "script_name": "website",
      },
    ],
  },
}
```

If any bindings are missing, Phase 1 or 2 was not completed correctly.

---

## 🗄️ External Services Setup

### Cloudflare R2 Bucket

**Status**: Should already exist from Phase 1

**Verification**:

```bash
# List R2 buckets
npx wrangler r2 bucket list

# Check specific bucket
npx wrangler r2 bucket info sebc-next-cache
```

**Expected Output**:

```
Bucket: sebc-next-cache
Created: [date]
Location: auto
```

**If Missing**: Return to Phase 1 and create the bucket:

```bash
npx wrangler r2 bucket create sebc-next-cache
```

---

### Cloudflare Durable Objects

**Status**: Should already be configured from Phase 2

**Verification**:

```bash
# Start wrangler dev
npx wrangler dev

# Check logs for Durable Objects bindings
# Should see: "NEXT_CACHE_DO_QUEUE" and "NEXT_TAG_CACHE_DO_SHARDED"
```

**Expected Output**:

```
⎔ Starting local server...
⎔ Using vars defined in .dev.vars
✨ Compiled Worker successfully
⎔ Listening on http://localhost:8788
│ [wrangler:inf] Ready on http://localhost:8788
│ - NEXT_INC_CACHE_R2_BUCKET (R2 Bucket)
│ - NEXT_CACHE_DO_QUEUE (Durable Object)
│ - NEXT_TAG_CACHE_DO_SHARDED (Durable Object)
```

**If Missing**: Return to Phase 2 and configure Durable Objects bindings.

---

### Cloudflare Worker (Self-Reference)

**Status**: Will be configured in Commit 1 of Phase 3

**Worker Name**: Must match `wrangler.jsonc` `name` field

**Verification** (after Commit 1):

```bash
# Check wrangler.jsonc name field
cat wrangler.jsonc | grep '"name"'
# Should show: "name": "website"

# Verify service binding exists
cat wrangler.jsonc | grep -A 5 "services"
# Should show WORKER_SELF_REFERENCE binding
```

---

## 📊 Configuration Files Summary

### Files to Modify in Phase 3

| File                                      | Action                     | Commit   |
| ----------------------------------------- | -------------------------- | -------- |
| `wrangler.jsonc`                          | Add `services` section     | Commit 1 |
| `open-next.config.ts`                     | Activate R2 cache          | Commit 2 |
| `docs/architecture/CACHE_ARCHITECTURE.md` | Complete documentation     | Commit 3 |
| `docs/deployment/BINDINGS_REFERENCE.md`   | Create comprehensive guide | Commit 3 |
| `tests/e2e/cache-revalidation.spec.ts`    | Add E2E tests              | Commit 4 |

### No Changes Required

- `.env.local` - No new environment variables
- `package.json` - No new dependencies
- `next.config.js` - Already configured in previous stories

---

## ✅ Connection Tests

### Test R2 Bucket Access

```bash
# Start wrangler dev
npx wrangler dev

# In browser, visit http://localhost:8788
# Should work without R2 binding errors

# Check logs for R2 binding
# Should see: "NEXT_INC_CACHE_R2_BUCKET (R2 Bucket)"
```

**Expected Result**: No errors related to R2 bucket binding

---

### Test Durable Objects Access

```bash
# Already running wrangler dev from previous test

# Check logs for DO bindings
# Should see:
# - "NEXT_CACHE_DO_QUEUE (Durable Object)"
# - "NEXT_TAG_CACHE_DO_SHARDED (Durable Object)"
```

**Expected Result**: No errors related to Durable Objects bindings

---

### Test Build

```bash
# Build the project
pnpm build

# Should succeed with no errors
# Check output for OpenNext build
```

**Expected Output**:

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
✓ OpenNext build completed
```

**Expected Result**: Build completes successfully, `.open-next/` directory created

---

## 🚨 Troubleshooting

### Issue: R2 bucket binding not found

**Symptoms**:

- Error: `R2 bucket 'NEXT_INC_CACHE_R2_BUCKET' not found`
- `wrangler dev` fails to start

**Solutions**:

1. Verify bucket exists: `npx wrangler r2 bucket list`
2. Check `wrangler.jsonc` has correct `r2_buckets` section
3. Verify `bucket_name` matches actual bucket name in Cloudflare
4. Run `pnpm cf-typegen` to regenerate types

**Verify Fix**:

```bash
npx wrangler dev
# Should start without R2 errors
```

---

### Issue: Durable Objects bindings not found

**Symptoms**:

- Error: `Durable Object binding 'NEXT_CACHE_DO_QUEUE' not found`
- Error: `Class 'DOQueueHandler' not found`

**Solutions**:

1. Verify `wrangler.jsonc` has correct `durable_objects` section
2. Check `class_name` matches OpenNext-provided classes
3. Verify `script_name` matches `wrangler.jsonc` `name` field
4. Ensure OpenNext version supports Durable Objects

**Verify Fix**:

```bash
npx wrangler dev
# Should start without DO errors
```

---

### Issue: Build fails after enabling R2 cache (Commit 2)

**Symptoms**:

- Error: `Cannot find module '@opennextjs/cloudflare'`
- Error: `r2IncrementalCache is not exported`

**Solutions**:

1. Verify OpenNext version: `pnpm list @opennextjs/cloudflare`
2. Check import path is correct: `import { r2IncrementalCache } from '@opennextjs/cloudflare'`
3. Reinstall dependencies: `pnpm install`
4. Clear build cache: `rm -rf .next .open-next` and rebuild

**Verify Fix**:

```bash
pnpm build
# Should complete successfully
```

---

### Issue: E2E tests fail (Commit 4)

**Symptoms**:

- Tests timeout
- Cache not working as expected
- Flaky test results

**Solutions**:

1. Increase test timeouts in `playwright.config.ts`
2. Add retry logic: `test.describe.configure({ retries: 2 })`
3. Verify bindings are working: `npx wrangler dev` and check logs
4. Clear browser cache between tests
5. Ensure proper setup/teardown in tests

**Verify Fix**:

```bash
pnpm test:e2e tests/e2e/cache-revalidation.spec.ts
# All tests should pass
```

---

### Issue: Service binding not working (Commit 1)

**Symptoms**:

- Error: `Service 'website' not found`
- `wrangler dev` fails after adding service binding

**Solutions**:

1. Verify `service` field matches `wrangler.jsonc` `name` field exactly
2. Check JSON syntax (no typos, correct quotes)
3. Run `pnpm cf-typegen` to regenerate types
4. Restart `wrangler dev`

**Verify Fix**:

```bash
npx wrangler dev
# Should start without service binding errors
```

---

## 📝 Setup Checklist

Complete this checklist before starting implementation:

### Prerequisites

- [ ] Node.js 18.18.0+ installed
- [ ] pnpm 8+ installed
- [ ] Wrangler CLI 3+ installed
- [ ] Cloudflare account logged in (`wrangler whoami`)

### Previous Phases

- [ ] Phase 1 complete (R2 bucket exists and binding configured)
- [ ] Phase 2 complete (Durable Objects bindings configured)
- [ ] `wrangler dev` starts successfully with existing bindings

### Build and Tests

- [ ] `pnpm build` succeeds
- [ ] `pnpm test` passes (if any unit tests exist)
- [ ] Playwright installed and configured

### Verification

- [ ] R2 bucket accessible: `wrangler r2 bucket list`
- [ ] Durable Objects bindings visible in `wrangler dev` logs
- [ ] No errors in build or dev server

**Environment is ready! 🚀**

---

## 🎯 What's Next?

After completing this setup:

1. **Read IMPLEMENTATION_PLAN.md** - Understand the 4 atomic commits
2. **Follow COMMIT_CHECKLIST.md** - Implement each commit step-by-step
3. **Validate after each commit** - Run verification commands
4. **Complete Phase 3** - All bindings configured, cache activated, tests passing

**You're ready to start Commit 1: Add WORKER_SELF_REFERENCE Service Binding!**
