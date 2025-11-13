# Phase 3 - Checklist per Commit

This document provides a detailed checklist for each atomic commit of Phase 3.

---

## 📋 Commit 1: Add WORKER_SELF_REFERENCE Service Binding

**Files**: `wrangler.jsonc` (modified)
**Estimated Duration**: 30-45 minutes

### Implementation Tasks

- [ ] Open `wrangler.jsonc`
- [ ] Add `services` section (if not already present)
- [ ] Add `WORKER_SELF_REFERENCE` binding with correct service name
- [ ] Verify service name matches `wrangler.jsonc` `name` field (`website`)
- [ ] Format JSON correctly (use Prettier or manual formatting)
- [ ] Save file

**Configuration Format**:

```jsonc
{
  "name": "website",
  // ... other config ...
  "services": [
    {
      "binding": "WORKER_SELF_REFERENCE",
      "service": "website",
    },
  ],
}
```

### Validation

```bash
# Generate TypeScript types
pnpm cf-typegen

# Start dev server
wrangler dev
# Look for: "WORKER_SELF_REFERENCE" in logs

# Verify no binding errors
# Should see: "Using vars defined in .dev.vars"
# Should NOT see: "Error: Service binding 'WORKER_SELF_REFERENCE' not found"
```

**Expected Result**:

- `wrangler dev` starts without service binding errors
- TypeScript types include `WORKER_SELF_REFERENCE`
- Logs confirm binding is available

### Review Checklist

#### Configuration

- [ ] `services` array exists in wrangler.jsonc
- [ ] `binding` field is exactly `"WORKER_SELF_REFERENCE"`
- [ ] `service` field matches `name` field (`"website"`)
- [ ] JSON syntax is valid (no trailing commas, quotes correct)

#### Validation

- [ ] `pnpm cf-typegen` succeeds
- [ ] `wrangler dev` starts without errors
- [ ] Service binding appears in logs

#### Code Quality

- [ ] JSON formatting is consistent
- [ ] No comments explaining obvious configuration (jsonc supports comments, but keep minimal)

### Commit Message

```bash
git add wrangler.jsonc
git commit -m "feat(wrangler): add WORKER_SELF_REFERENCE service binding

- Add services section to wrangler.jsonc
- Configure binding to self-reference worker
- Enables worker-to-worker communication for OpenNext
- Service name matches wrangler.jsonc name field (website)

Part of Phase 3 - Commit 1/4"
```

---

## 📋 Commit 2: Activate R2 Incremental Cache in OpenNext

**Files**: `open-next.config.ts` (modified)
**Estimated Duration**: 45-60 minutes

### Implementation Tasks

- [ ] Open `open-next.config.ts`
- [ ] Import `r2IncrementalCache` from `@opennextjs/cloudflare`
- [ ] Locate the cache configuration section
- [ ] Uncomment and configure `incrementalCache: r2IncrementalCache`
- [ ] Add inline comments explaining cache activation
- [ ] Save file

**Configuration Example**:

```typescript
import { r2IncrementalCache } from '@opennextjs/cloudflare';

export default {
  default: {
    override: {
      // Enable R2 incremental cache for ISR
      // Uses NEXT_INC_CACHE_R2_BUCKET binding from wrangler.jsonc
      incrementalCache: r2IncrementalCache,
      // ... other overrides ...
    },
  },
};
```

### Validation

```bash
# Build with R2 cache enabled
pnpm build
# Should succeed with no errors

# Check build output
ls -la .open-next/
# Should see cache-related files

# Test locally with wrangler
pnpm preview
# Should start without errors

# Optional: Check for cache-related logs
# Access a page with revalidate to see cache activity
```

**Expected Result**:

- Build completes successfully
- `.open-next/` directory contains cache artifacts
- Local preview works without errors
- ISR pages use R2 for caching (logs show cache operations)

### Review Checklist

#### Code

- [ ] `r2IncrementalCache` imported from `@opennextjs/cloudflare`
- [ ] `incrementalCache` configured correctly
- [ ] Inline comments explain cache purpose
- [ ] TypeScript types are correct (no errors)

#### Build

- [ ] `pnpm build` succeeds
- [ ] No build warnings related to cache
- [ ] `.open-next/` directory structure looks correct

#### Local Testing

- [ ] `pnpm preview` starts successfully
- [ ] No runtime errors when accessing pages
- [ ] ISR pages work (create test page with `revalidate` if needed)

#### Code Quality

- [ ] Import statement at top of file
- [ ] Configuration is readable
- [ ] Comments are clear and concise
- [ ] No debug code

### Commit Message

```bash
git add open-next.config.ts
git commit -m "feat(open-next): activate R2 incremental cache

- Import r2IncrementalCache from @opennextjs/cloudflare
- Enable incrementalCache in OpenNext configuration
- Enables ISR caching with R2 storage backend
- Uses NEXT_INC_CACHE_R2_BUCKET binding for cache operations

Part of Phase 3 - Commit 2/4"
```

---

## 📋 Commit 3: Complete Architecture Documentation

**Files**:

- `docs/architecture/CACHE_ARCHITECTURE.md` (modified)
- `docs/deployment/BINDINGS_REFERENCE.md` (new)

**Estimated Duration**: 90-120 minutes

### Implementation Tasks

#### CACHE_ARCHITECTURE.md Updates

- [ ] Open `docs/architecture/CACHE_ARCHITECTURE.md`
- [ ] Complete Service Binding section
  - [ ] Explain worker-to-worker communication
  - [ ] Document role in OpenNext architecture
  - [ ] Add configuration example
- [ ] Add complete architecture diagram
  - [ ] Show R2, DO Queue, DO Tag Cache, Service Binding
  - [ ] Illustrate data flow
- [ ] Complete ISR request lifecycle section
  - [ ] Cache hit path
  - [ ] Cache miss path
  - [ ] Revalidation flow
- [ ] Document cache invalidation strategies
  - [ ] `revalidateTag()` usage
  - [ ] `revalidatePath()` usage
  - [ ] Manual cache purge
- [ ] Add performance characteristics
  - [ ] Cache hit latency
  - [ ] Cache miss latency
  - [ ] Optimization tips
- [ ] Save file

#### BINDINGS_REFERENCE.md Creation

- [ ] Create `docs/deployment/BINDINGS_REFERENCE.md`
- [ ] Add document header and overview
- [ ] Document each binding:
  - [ ] `NEXT_INC_CACHE_R2_BUCKET` (R2)
    - [ ] Purpose and role
    - [ ] Configuration in wrangler.jsonc
    - [ ] Usage in OpenNext
    - [ ] Troubleshooting common issues
  - [ ] `NEXT_CACHE_DO_QUEUE` (Durable Objects)
    - [ ] Purpose and role
    - [ ] Configuration
    - [ ] Usage
    - [ ] Troubleshooting
  - [ ] `NEXT_TAG_CACHE_DO_SHARDED` (Durable Objects)
    - [ ] Purpose and role
    - [ ] Sharding strategy
    - [ ] Configuration
    - [ ] Usage
    - [ ] Troubleshooting
  - [ ] `WORKER_SELF_REFERENCE` (Service Binding)
    - [ ] Purpose and role
    - [ ] Configuration
    - [ ] Usage
    - [ ] Troubleshooting
- [ ] Add environment variable mapping section
- [ ] Add local development vs production differences
- [ ] Add common issues and solutions section
- [ ] Add links to official Cloudflare documentation
- [ ] Save file

### Validation

```bash
# Verify markdown syntax (if linter available)
pnpm lint

# Manual review: read both documents for completeness
cat docs/architecture/CACHE_ARCHITECTURE.md
cat docs/deployment/BINDINGS_REFERENCE.md

# Check for broken internal links (manual or with tool)
# Verify all code examples are accurate
# Ensure diagrams render correctly (if using Mermaid or similar)
```

**Expected Result**:

- CACHE_ARCHITECTURE.md has comprehensive coverage
- BINDINGS_REFERENCE.md serves as complete guide
- All internal links work
- No markdown syntax errors
- Diagrams are clear

### Review Checklist

#### CACHE_ARCHITECTURE.md

- [ ] Service Binding section complete
- [ ] Architecture diagram included and clear
- [ ] ISR request lifecycle documented
- [ ] Cache invalidation strategies explained
- [ ] Performance characteristics listed
- [ ] All sections have consistent formatting

#### BINDINGS_REFERENCE.md

- [ ] All 4 bindings documented
- [ ] Each binding has: purpose, configuration, usage, troubleshooting
- [ ] Environment variable mapping clear
- [ ] Local vs production differences explained
- [ ] Links to Cloudflare docs included

#### Overall

- [ ] Markdown formatting consistent
- [ ] All internal links work
- [ ] Code examples are accurate
- [ ] No typos or unclear explanations
- [ ] Diagrams render correctly

#### Code Quality

- [ ] Clear section hierarchy
- [ ] Consistent tone and style
- [ ] Technical accuracy verified
- [ ] Examples are copy-pasteable

### Commit Message

```bash
git add docs/architecture/CACHE_ARCHITECTURE.md docs/deployment/BINDINGS_REFERENCE.md
git commit -m "docs: complete cache architecture and bindings reference

- Complete CACHE_ARCHITECTURE.md with all bindings coverage
- Add service binding section and architecture diagram
- Document ISR lifecycle and cache invalidation strategies
- Create comprehensive BINDINGS_REFERENCE.md guide
- Document all 4 bindings: R2, DO Queue, DO Tag Cache, Service Binding
- Include troubleshooting and local vs production differences

Part of Phase 3 - Commit 3/4"
```

---

## 📋 Commit 4: Add E2E Cache Validation Tests

**Files**: `tests/e2e/cache-revalidation.spec.ts` (new)
**Estimated Duration**: 120-150 minutes

### Implementation Tasks

- [ ] Create `tests/e2e/cache-revalidation.spec.ts`
- [ ] Add test setup and configuration
  - [ ] Import Playwright test utilities
  - [ ] Configure test timeouts (if needed)
  - [ ] Add retry logic for flaky scenarios
- [ ] Implement Test 1: ISR Page Caching
  - [ ] Create or use existing page with `revalidate`
  - [ ] Measure first request (cache miss)
  - [ ] Measure second request (cache hit)
  - [ ] Assert cache hit is faster
  - [ ] Verify cached response is identical
- [ ] Implement Test 2: revalidateTag() Invalidation
  - [ ] Create page with tags
  - [ ] Cache the page
  - [ ] Call revalidateTag() via API route
  - [ ] Verify next request is cache miss
  - [ ] Verify content updates after revalidation
- [ ] Implement Test 3: revalidatePath() Invalidation
  - [ ] Cache specific path
  - [ ] Call revalidatePath() via API route
  - [ ] Verify cache is invalidated
  - [ ] Verify fresh content served
- [ ] Implement Test 4: Performance Benchmark
  - [ ] Measure cache miss time (average of 3)
  - [ ] Measure cache hit time (average of 10)
  - [ ] Assert cache hit < 50% of cache miss time
  - [ ] Log performance metrics
- [ ] Implement Test 5: Concurrent Requests
  - [ ] Make 10 concurrent requests to ISR page
  - [ ] Verify all requests return same content
  - [ ] Verify cache is generated only once (check logs or timing)
- [ ] Add inline comments explaining test strategy
- [ ] Add proper setup/teardown if needed
- [ ] Save file

**Test Structure Example**:

```typescript
import { test, expect } from '@playwright/test';

test.describe('ISR Cache with R2', () => {
  test('should cache ISR page on first request', async ({ page }) => {
    // Implementation
  });

  test('should serve from cache on subsequent requests', async ({ page }) => {
    // Implementation
  });
});

test.describe('Cache Invalidation', () => {
  test('revalidateTag() should invalidate cache', async ({ page, request }) => {
    // Implementation
  });

  test('revalidatePath() should invalidate cache', async ({
    page,
    request,
  }) => {
    // Implementation
  });
});

test.describe('Performance Benchmarks', () => {
  test('cache hit should be faster than cache miss', async ({ page }) => {
    // Implementation
  });

  test('concurrent requests should use same cache', async ({
    page,
    context,
  }) => {
    // Implementation
  });
});
```

### Validation

```bash
# Run E2E tests
pnpm test:e2e tests/e2e/cache-revalidation.spec.ts

# Run with UI for debugging
pnpm test:e2e:ui tests/e2e/cache-revalidation.spec.ts

# Run with verbose output
pnpm test:e2e tests/e2e/cache-revalidation.spec.ts --debug

# Verify all 5 tests pass
# Should see: "5 passed"
```

**Expected Result**:

- All 5 E2E tests pass consistently
- ISR caching validated
- Revalidation functions work
- Performance benchmark shows cache improvement
- Tests are not flaky

### Review Checklist

#### Test Structure

- [ ] File follows Playwright conventions
- [ ] All 5 test cases implemented
- [ ] Clear test descriptions
- [ ] Proper test organization (describe blocks)

#### Test 1: ISR Caching

- [ ] Page with `revalidate` exists or is created
- [ ] Cache miss measured
- [ ] Cache hit measured
- [ ] Assertion compares times
- [ ] Response content validated

#### Test 2: revalidateTag()

- [ ] Page with tags set up
- [ ] Tag invalidation triggered
- [ ] Cache invalidation verified
- [ ] Content update verified

#### Test 3: revalidatePath()

- [ ] Path cached
- [ ] Path invalidation triggered
- [ ] Cache cleared verified

#### Test 4: Performance Benchmark

- [ ] Multiple samples taken (cache miss: 3, cache hit: 10)
- [ ] Average calculated
- [ ] Realistic threshold (cache hit < 50% miss)
- [ ] Performance logged

#### Test 5: Concurrent Requests

- [ ] 10+ concurrent requests made
- [ ] Same content returned
- [ ] Only one cache generation (verified)

#### Overall

- [ ] Inline comments explain strategy
- [ ] Proper setup/teardown
- [ ] No hardcoded values (use config or generate)
- [ ] Tests are not flaky (retry logic if needed)

#### Code Quality

- [ ] Clear variable names
- [ ] Helpful assertions with error messages
- [ ] No console.logs (use Playwright reporters)
- [ ] Proper async/await usage

### Commit Message

```bash
git add tests/e2e/cache-revalidation.spec.ts
git commit -m "test(e2e): add cache validation tests

- Add ISR page caching test (cache miss vs hit)
- Add revalidateTag() invalidation test
- Add revalidatePath() invalidation test
- Add cache performance benchmark test
- Add concurrent requests cache test
- Validates complete R2 + DO + Service Binding architecture
- All tests pass consistently with retry logic

Part of Phase 3 - Commit 4/4"
```

---

## ✅ Final Phase Validation

After all commits:

### Complete Phase Checklist

- [ ] All 4 commits completed
- [ ] Service binding configured
- [ ] OpenNext cache activated
- [ ] Architecture documentation complete
- [ ] E2E tests pass
- [ ] Build succeeds
- [ ] Local preview works
- [ ] VALIDATION_CHECKLIST.md completed

### Final Validation Commands

```bash
# Generate types
pnpm cf-typegen

# Build
pnpm build

# Run E2E tests
pnpm test:e2e tests/e2e/cache-revalidation.spec.ts

# Test locally
pnpm preview

# Verify all bindings
wrangler dev
# Check logs for: NEXT_INC_CACHE_R2_BUCKET, NEXT_CACHE_DO_QUEUE, NEXT_TAG_CACHE_DO_SHARDED, WORKER_SELF_REFERENCE
```

**Phase 3 is complete when all checkboxes are checked! 🎉**

---

## 🎯 Post-Completion Actions

- [ ] Update INDEX.md status to ✅ COMPLETED
- [ ] Update EPIC_TRACKING.md with phase completion
- [ ] Create git tag: `epic-0-story-0.5-phase-3-complete`
- [ ] Notify team of completion
- [ ] Prepare for deployment or next story

---

## ❓ FAQ

**Q: What if wrangler dev fails?**
A: Check binding configuration syntax, ensure Phase 1 & 2 resources exist.

**Q: What if E2E tests fail?**
A: Check logs for errors, verify bindings are working, increase timeouts, add retry logic.

**Q: Can I test in staging before production?**
A: Yes, deploy to staging first, run E2E tests there, then promote to production.

**Q: What if performance benchmark fails?**
A: Adjust threshold (maybe cache hit < 70% instead of 50%), verify R2 is actually used for caching.
