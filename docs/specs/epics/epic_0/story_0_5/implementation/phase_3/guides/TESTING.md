# Phase 3 - Testing Guide

Complete testing strategy for Phase 3.

---

## 🎯 Testing Strategy

Phase 3 uses a focused E2E testing approach to validate the complete ISR cache architecture:

1. **Configuration Validation**: Manual verification via `wrangler dev`
2. **Build Validation**: Ensure build succeeds with cache enabled
3. **E2E Tests**: Comprehensive tests for ISR caching and invalidation
4. **Performance Benchmarks**: Validate cache performance improvements

**Target E2E Test Count**: 5 tests
**Estimated Test Duration**: 3-5 minutes
**Coverage Goal**: Complete ISR architecture validation

---

## 🧪 Configuration Validation

### Purpose

Verify that all bindings are correctly configured before running E2E tests.

### Running Configuration Validation

```bash
# Generate TypeScript types
pnpm cf-typegen

# Start dev server
npx wrangler dev

# Check logs for all bindings
# Should see:
# - NEXT_INC_CACHE_R2_BUCKET (R2 Bucket)
# - NEXT_CACHE_DO_QUEUE (Durable Object)
# - NEXT_TAG_CACHE_DO_SHARDED (Durable Object)
# - WORKER_SELF_REFERENCE (Service)
```

### Expected Results

```
⎔ Starting local server...
✨ Compiled Worker successfully
⎔ Listening on http://localhost:8788
│ [wrangler:inf] Ready on http://localhost:8788
│ Bindings:
│ - NEXT_INC_CACHE_R2_BUCKET (R2 Bucket)
│ - NEXT_CACHE_DO_QUEUE (Durable Object)
│ - NEXT_TAG_CACHE_DO_SHARDED (Durable Object)
│ - WORKER_SELF_REFERENCE (Service)
```

**If any binding is missing**: Check `wrangler.jsonc` configuration and Phase 1/2 completion.

---

## 🏗️ Build Validation

### Purpose

Ensure the build succeeds with OpenNext R2 cache enabled.

### Running Build Validation

```bash
# Clean previous build
rm -rf .next .open-next

# Build with cache enabled
pnpm build

# Verify OpenNext build artifacts
ls -la .open-next/

# Check for cache-related files
find .open-next -name "*cache*"
```

### Expected Results

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
✓ OpenNext build completed

Build output:
.open-next/
├── server/
├── cache/          # Cache-related artifacts
├── assets/
└── ...
```

**If build fails**: Check `open-next.config.ts` configuration and import paths.

---

## 🎭 E2E Tests

### Purpose

Validate the complete ISR cache architecture with R2, Durable Objects, and Service Binding.

### Prerequisites

- [ ] Configuration validation passed
- [ ] Build validation passed
- [ ] Playwright installed
- [ ] Test environment ready

### Running E2E Tests

**Run all cache tests**:

```bash
pnpm test:e2e tests/e2e/cache-revalidation.spec.ts
```

**Run with UI (for debugging)**:

```bash
pnpm test:e2e:ui tests/e2e/cache-revalidation.spec.ts
```

**Run with verbose output**:

```bash
pnpm test:e2e tests/e2e/cache-revalidation.spec.ts --debug
```

**Run specific test**:

```bash
pnpm test:e2e tests/e2e/cache-revalidation.spec.ts -g "should cache ISR page"
```

### Expected Results

```
Running 5 tests using 1 worker

✓ [chromium] › cache-revalidation.spec.ts:X:X › ISR Cache with R2 › should cache ISR page on first request (30s)
✓ [chromium] › cache-revalidation.spec.ts:X:X › ISR Cache with R2 › should serve from cache on subsequent requests (5s)
✓ [chromium] › cache-revalidation.spec.ts:X:X › Cache Invalidation › revalidateTag() should invalidate cache (15s)
✓ [chromium] › cache-revalidation.spec.ts:X:X › Cache Invalidation › revalidatePath() should invalidate cache (15s)
✓ [chromium] › cache-revalidation.spec.ts:X:X › Performance Benchmarks › cache hit should be faster than cache miss (45s)

5 passed (2m)
```

---

## 📊 Test Breakdown

### Test 1: ISR Page Caching (Cache Miss)

**Purpose**: Verify that an ISR page with `revalidate` is cached on first request.

**What it tests**:

- Page with `revalidate: 60` is requested
- First request is a cache miss (slower)
- Cache entry is created in R2 bucket

**Expected behavior**:

- Response time: ~300-1000ms (cache miss)
- R2 bucket receives cache entry
- Next request will be a cache hit

**How to verify manually**:

```bash
# Start local server
pnpm preview

# Visit ISR page (create one with revalidate if needed)
# Example: http://localhost:8788/test-isr

# Check logs for cache miss
# Look for: "Cache MISS for /test-isr"

# Check R2 bucket (optional)
npx wrangler r2 object list sebc-next-cache
# Should see cached object
```

---

### Test 2: ISR Page Caching (Cache Hit)

**Purpose**: Verify that subsequent requests serve from cache.

**What it tests**:

- Second request to same ISR page
- Response is served from R2 cache (faster)
- Content is identical to first request

**Expected behavior**:

- Response time: ~50-200ms (cache hit, 50-80% faster)
- R2 bucket serves cached content
- No page regeneration

**How to verify manually**:

```bash
# Continue from Test 1

# Refresh the same page
# Check logs for cache hit
# Look for: "Cache HIT for /test-isr"

# Compare response times
# Cache hit should be significantly faster
```

---

### Test 3: revalidateTag() Invalidation

**Purpose**: Verify that `revalidateTag()` correctly invalidates cached pages with specific tags.

**What it tests**:

- Page with tags is cached
- `revalidateTag('tag-name')` is called via API route
- Cache is invalidated in Durable Objects tag cache
- Next request is a cache miss (page regenerates)

**Expected behavior**:

- Tagged page is cached initially
- API call to `/api/revalidate?tag=tag-name` succeeds
- Next request regenerates page (cache miss)
- New content reflects updates

**How to verify manually**:

```bash
# Create test page with tags (if not exists)
# Example: app/test-tags/page.tsx with export const tags = ['test-tag']

# Cache the page
curl http://localhost:8788/test-tags

# Update data and call revalidation
curl -X POST http://localhost:8788/api/revalidate?tag=test-tag

# Request page again, should regenerate
curl http://localhost:8788/test-tags
# Should see updated content
```

---

### Test 4: revalidatePath() Invalidation

**Purpose**: Verify that `revalidatePath()` correctly invalidates cache for specific paths.

**What it tests**:

- Specific path is cached
- `revalidatePath('/path')` is called via API route
- Cache is cleared for that path
- Next request regenerates page

**Expected behavior**:

- Path is cached initially
- API call to `/api/revalidate?path=/test-path` succeeds
- Next request is cache miss
- Updated content served

**How to verify manually**:

```bash
# Cache a specific path
curl http://localhost:8788/test-path

# Update data and call revalidation
curl -X POST http://localhost:8788/api/revalidate?path=/test-path

# Request path again, should regenerate
curl http://localhost:8788/test-path
# Should see updated content
```

---

### Test 5: Performance Benchmark (Cache Hit vs Miss)

**Purpose**: Quantify cache performance improvement.

**What it tests**:

- Measure cache miss time (average of 3 requests)
- Measure cache hit time (average of 10 requests)
- Assert cache hit is significantly faster (< 50-70% of miss)

**Expected behavior**:

- Cache miss: ~300-1000ms (varies by page complexity)
- Cache hit: ~50-200ms (50-80% faster)
- Consistent performance for cache hits

**How to verify manually**:

```bash
# Use curl with timing
time curl http://localhost:8788/test-isr > /dev/null 2>&1
# Cache miss: ~0.5-1s

# Run multiple times
for i in {1..10}; do
  time curl http://localhost:8788/test-isr > /dev/null 2>&1
done
# Cache hits: ~0.05-0.2s (significantly faster)
```

---

### Test 6 (Optional): Concurrent Requests

**Purpose**: Verify that concurrent requests to an uncached ISR page share the same cache generation.

**What it tests**:

- 10 concurrent requests to uncached ISR page
- Only one page generation occurs
- All requests receive same cached content

**Expected behavior**:

- First request triggers page generation
- Other 9 requests wait and receive same result
- No duplicate cache generations (efficient)

**How to verify manually**:

```bash
# Clear cache (revalidate path)
curl -X POST http://localhost:8788/api/revalidate?path=/test-isr

# Make 10 concurrent requests
for i in {1..10}; do
  curl http://localhost:8788/test-isr &
done
wait

# Check logs
# Should see only 1 cache generation
```

---

## 🐛 Debugging Tests

### Common Issues

#### Issue: Tests timeout

**Symptoms**:

- Tests exceed default timeout (30s)
- Flaky failures due to slow responses

**Solutions**:

1. Increase timeout in `playwright.config.ts`:
   ```typescript
   export default defineConfig({
     timeout: 60000, // 60 seconds
   });
   ```
2. Increase timeout per test:
   ```typescript
   test('slow test', async ({ page }) => {
     test.setTimeout(90000); // 90 seconds
   });
   ```
3. Check if local server is slow (use `pnpm preview` instead of `wrangler dev`)

---

#### Issue: Tests are flaky

**Symptoms**:

- Tests pass sometimes, fail other times
- Race conditions or timing issues

**Solutions**:

1. Add retry logic:
   ```typescript
   test.describe.configure({ retries: 2 });
   ```
2. Add proper waits:
   ```typescript
   await page.waitForLoadState('networkidle');
   ```
3. Clear cache between tests:
   ```typescript
   test.beforeEach(async ({ request }) => {
     await request.post('/api/revalidate?path=/test-isr');
   });
   ```

---

#### Issue: Cache not working as expected

**Symptoms**:

- All requests are cache misses
- Revalidation doesn't work

**Solutions**:

1. Verify bindings:
   ```bash
   npx wrangler dev
   # Check logs for all bindings
   ```
2. Check OpenNext configuration:
   ```bash
   cat open-next.config.ts
   # Verify r2IncrementalCache is enabled
   ```
3. Check R2 bucket:
   ```bash
   npx wrangler r2 object list sebc-next-cache
   # Should see cached objects
   ```

---

#### Issue: Performance benchmark fails

**Symptoms**:

- Cache hit is not significantly faster than miss
- Assertion fails: cache hit >= 50% of cache miss

**Solutions**:

1. Adjust threshold (maybe 70% instead of 50%):
   ```typescript
   expect(cacheHitAvg).toBeLessThan(cacheMissAvg * 0.7);
   ```
2. Take more samples (reduce variance):
   ```typescript
   const cacheMissSamples = 5; // instead of 3
   const cacheHitSamples = 20; // instead of 10
   ```
3. Verify R2 is actually being used:
   ```bash
   # Check logs for R2 operations
   npx wrangler dev
   ```

---

### Debug Commands

```bash
# Run single test with debug output
pnpm test:e2e tests/e2e/cache-revalidation.spec.ts -g "cache hit" --debug

# Run with headed browser (see what's happening)
pnpm test:e2e tests/e2e/cache-revalidation.spec.ts --headed

# Run with UI (interactive debugging)
pnpm test:e2e:ui tests/e2e/cache-revalidation.spec.ts

# Generate trace for debugging
pnpm test:e2e tests/e2e/cache-revalidation.spec.ts --trace on
# View trace: npx playwright show-trace trace.zip
```

---

## 🤖 CI/CD Automation

### GitHub Actions

Tests run automatically on:

- [ ] Pull requests to main
- [ ] Push to main branch
- [ ] Manual trigger (workflow_dispatch)

### CI Configuration

Tests are configured in `.github/workflows/test.yml`:

```yaml
- name: Run E2E tests
  run: pnpm test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

### Required Checks

All PRs must:

- [ ] Pass all E2E tests
- [ ] No flaky failures (tests must pass consistently)
- [ ] Build succeeds
- [ ] Configuration validation passes

---

## ✅ Testing Checklist

Before merging Phase 3:

### Configuration

- [ ] `pnpm cf-typegen` succeeds
- [ ] `npx wrangler dev` starts without errors
- [ ] All 4 bindings visible in logs

### Build

- [ ] `pnpm build` succeeds
- [ ] `.open-next/` directory contains cache files
- [ ] No build warnings

### E2E Tests

- [ ] Test 1 passes (ISR page caching - miss)
- [ ] Test 2 passes (ISR page caching - hit)
- [ ] Test 3 passes (revalidateTag invalidation)
- [ ] Test 4 passes (revalidatePath invalidation)
- [ ] Test 5 passes (performance benchmark)
- [ ] All tests pass consistently (run 3 times)

### Manual Validation

- [ ] Manually test ISR page caching
- [ ] Manually test revalidation
- [ ] Verify R2 bucket has cached objects
- [ ] Check logs for cache operations

### CI/CD

- [ ] Tests pass in CI
- [ ] No flaky failures
- [ ] Playwright report available

---

## 📝 Best Practices

### Writing Tests

✅ **Do**:

- Test complete user flows (cache lifecycle)
- Use realistic scenarios (ISR pages, revalidation)
- Measure performance (cache hit vs miss)
- Add inline comments explaining test logic
- Clean up after tests (revalidate cache)

❌ **Don't**:

- Test implementation details (OpenNext internals)
- Over-mock (test real R2/DO bindings)
- Write flaky tests (add retries if needed)
- Ignore failing tests (fix or document as known issue)

### Test Naming

Use descriptive test names:

```typescript
// Good
test('should cache ISR page with revalidate: 60 on first request', ...)
test('revalidateTag() should invalidate cache for tagged pages', ...)

// Bad
test('test 1', ...)
test('cache works', ...)
```

### Test Organization

Organize tests by feature:

```typescript
test.describe('ISR Cache with R2', () => {
  test('cache miss scenario', ...);
  test('cache hit scenario', ...);
});

test.describe('Cache Invalidation', () => {
  test('revalidateTag()', ...);
  test('revalidatePath()', ...);
});

test.describe('Performance Benchmarks', () => {
  test('cache performance', ...);
});
```

---

## ❓ FAQ

**Q: How long should E2E tests take?**
A: ~3-5 minutes for all 5 tests. If slower, optimize or increase timeouts.

**Q: Should I test in production?**
A: First validate locally, then staging, then production. E2E tests are for local/staging.

**Q: What if I can't reproduce a test failure locally?**
A: Check CI logs, environment differences, timing issues. Add debug logs.

**Q: Can I skip flaky tests?**
A: No. Fix flaky tests with retries, proper waits, or increased timeouts. Flaky tests are not acceptable.

**Q: Should I test every possible scenario?**
A: Focus on critical paths (ISR caching, revalidation). Cover edge cases if time permits.

**Q: How do I test cache in CI?**
A: Use `wrangler dev` or mock Cloudflare services. Ensure bindings are available in CI.

---

## 🔗 References

- [Playwright Documentation](https://playwright.dev/)
- [Next.js ISR Testing](https://nextjs.org/docs/app/building-your-application/testing)
- [OpenNext Testing Guide](https://opennext.js.org/cloudflare/testing)
- [Cloudflare Workers Testing](https://developers.cloudflare.com/workers/testing/)

---

**Happy testing! 🧪**
