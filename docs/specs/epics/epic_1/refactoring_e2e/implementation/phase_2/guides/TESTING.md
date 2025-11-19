# Phase 2 - Testing Guide

Complete testing and validation strategy for Phase 2 debugging and stabilization.

---

## 🎯 Testing Strategy

Phase 2 focuses on **debugging and validating** the E2E testing infrastructure. Unlike feature phases, this phase tests the testing system itself.

**Testing Layers**:

1. **Build Validation**: Ensure worker builds successfully
2. **Startup Validation**: Verify wrangler starts reliably
3. **E2E Test Validation**: Make existing tests pass
4. **D1 Validation**: Confirm database integration
5. **Cross-Browser Validation**: Ensure stability across browsers
6. **Flakiness Detection**: Eliminate intermittent failures

**Target Metrics**:

- Build success rate: 100%
- Startup success rate: 100%
- Test pass rate: 100%
- Flaky test count: 0
- Browser coverage: 3 engines

---

## 🏗️ Build Validation (Commit 1)

### Purpose

Verify that the OpenNext worker builds successfully and consistently.

### Running Build Validation

```bash
# Clean build (full validation)
rm -rf .next .open-next node_modules/.cache
pnpm run build
pnpm exec opennextjs-cloudflare build

# Quick build (development)
pnpm run build
pnpm exec opennextjs-cloudflare build

# Measure build time
time (pnpm run build && pnpm exec opennextjs-cloudflare build)
```

### Expected Results

**Success Indicators**:

```
✓ Compiled successfully
✓ Build completed in [X]s

Build output:
.open-next/
├── worker.js (>100KB)
└── assets/
    ├── _next/
    ├── favicon.ico
    └── [other static assets]
```

**Exit Code**: 0 (no errors)

### Validation Checklist

- [ ] Build completes without errors
- [ ] Build completes without critical warnings
- [ ] `.open-next/worker.js` exists
- [ ] Worker file size is reasonable (500KB-2MB)
- [ ] `.open-next/assets/` contains expected files
- [ ] Build is repeatable (same result each time)

### Troubleshooting Build Issues

**Issue: Module resolution errors**

```bash
# Check tsconfig paths
cat tsconfig.json | grep paths

# Verify Next.js config
cat next.config.ts

# Check OpenNext version
pnpm list @opennextjs/cloudflare
```

**Issue: Out of memory**

```bash
# Increase Node.js memory
NODE_OPTIONS=--max-old-space-size=4096 pnpm run build
```

---

## ⏱️ Startup Validation (Commit 2)

### Purpose

Verify that wrangler dev starts consistently within the timeout period.

### Running Startup Validation

```bash
# Basic startup test
pnpm preview
# Wait for "Ready on http://127.0.0.1:8788"
# Ctrl+C to stop

# Timed startup (3 runs for average)
for i in {1..3}; do
  echo "=== Run $i ==="
  time pnpm preview &
  WPID=$!
  sleep 30  # Wait for startup
  curl -I http://127.0.0.1:8788 || echo "Not ready yet"
  sleep 60  # Give more time if needed
  curl -I http://127.0.0.1:8788
  kill $WPID
  wait $WPID 2>/dev/null
  sleep 5
done

# Verbose logging
WRANGLER_LOG=debug pnpm preview
```

### Expected Results

**Success Indicators**:

```
⛅️ wrangler 3.x.x
-------------------
⎔ Starting local server...
[wrangler:inf] Ready on http://127.0.0.1:8788
```

**Metrics**:

- Startup time: <120 seconds
- Consistent across runs (variance <20s)
- Binds to IPv4 (127.0.0.1)
- Returns 200 OK on curl

### Validation Checklist

- [ ] Server starts successfully
- [ ] Startup time <120 seconds
- [ ] Logs show "Ready on http://127.0.0.1:8788"
- [ ] IPv4 binding confirmed (not ::1)
- [ ] Server responds to HTTP requests
- [ ] No hanging or freezing
- [ ] Repeatable (3/3 successful starts)

### Troubleshooting Startup Issues

**Issue: Timeout**

```bash
# Check what's slow
WRANGLER_LOG=debug pnpm preview 2>&1 | tee startup.log

# Look for bottlenecks in startup.log
```

**Issue: Port conflict**

```bash
# Check if port in use
lsof -i :8788

# Kill conflicting process
kill -9 $(lsof -t -i:8788)
```

---

## 🧪 E2E Test Validation (Commit 3)

### Purpose

Ensure all existing E2E tests pass reliably on the Cloudflare Workers runtime (workerd).

### Running E2E Test Validation

```bash
# Run all tests
pnpm test:e2e

# Run individual test files
pnpm test:e2e tests/compression.spec.ts
pnpm test:e2e tests/middleware.spec.ts
pnpm test:e2e tests/i18n-edge-cases.spec.ts

# Run with UI (interactive debugging)
pnpm test:e2e:ui

# Run in debug mode
pnpm test:e2e:debug

# Run with headed browser (see what's happening)
pnpm test:e2e --headed

# Generate HTML report
pnpm test:e2e --reporter=html
pnpm exec playwright show-report
```

### Expected Results

**Success Output**:

```
Running 15 tests using 4 workers

  ✓ [chromium] › compression.spec.ts:12:5 › should serve Brotli compressed responses (2.3s)
  ✓ [chromium] › compression.spec.ts:24:5 › should serve Gzip compressed responses (1.8s)
  ...
  ✓ [webkit] › i18n-edge-cases.spec.ts:45:5 › should handle missing translations (1.5s)

  15 passed (45s)
```

**Metrics**:

- Pass rate: 100% (15/15 or X/X tests)
- Total time: <5 minutes
- No flaky tests
- No skipped tests

### Test Categories

#### 1. Compression Tests (`tests/compression.spec.ts`)

**What it tests**: HTTP compression (Brotli, Gzip) works on workerd

**Assertions**:

- `content-encoding: br` header present for Brotli
- `content-encoding: gzip` header present for Gzip
- Compressed response size < uncompressed size
- Content decompresses correctly

**Common issues**:

- Cloudflare automatic compression may interfere
- Need to check actual headers, not just assume compression

#### 2. Middleware Tests (`tests/middleware.spec.ts`)

**What it tests**: i18n routing and redirects work correctly

**Assertions**:

- `/fr` redirects to `/fr/`
- `/en` redirects to `/en/`
- Root `/` redirects to default locale `/fr/`
- Accept-Language header affects routing

**Common issues**:

- Redirect behavior may differ on workerd
- Need to verify response status codes (301, 302, 307)

#### 3. i18n Edge Cases (`tests/i18n-edge-cases.spec.ts`)

**What it tests**: Edge cases in internationalization

**Assertions**:

- Missing translation keys handled gracefully
- Special characters in URLs work
- Unicode support
- Fallback behavior correct

**Common issues**:

- Encoding differences between Node.js and workerd
- Edge runtime limitations

### Validation Checklist

- [ ] All compression tests pass
- [ ] All middleware tests pass
- [ ] All i18n tests pass
- [ ] No tests skipped or disabled
- [ ] Tests pass on first run (not after retries)
- [ ] Assertions are meaningful (not weakened)

### Debugging Failed Tests

**View detailed report**:

```bash
pnpm test:e2e --reporter=html
pnpm exec playwright show-report
```

The HTML report includes:

- Screenshots on failure
- Video recordings
- Trace files (step-by-step execution)
- Network logs
- Console logs

**Analyze specific failure**:

```bash
# Run single test in debug mode
pnpm test:e2e tests/compression.spec.ts --debug

# Run with verbose logging
DEBUG=pw:api pnpm test:e2e tests/compression.spec.ts
```

---

## 🗄️ D1 Database Validation (Commit 4)

### Purpose

Verify that the D1 database integration and seeding work correctly.

### Running D1 Validation

```bash
# Test global setup in isolation
pnpm exec tsx tests/global-setup.ts

# List migrations
pnpm wrangler d1 migrations list DB --local

# Query data directly
pnpm wrangler d1 execute DB --local --command "SELECT * FROM categories"
pnpm wrangler d1 execute DB --local --command "SELECT * FROM articles"

# Get row counts
pnpm wrangler d1 execute DB --local --command "SELECT COUNT(*) as count FROM categories"
pnpm wrangler d1 execute DB --local --command "SELECT COUNT(*) as count FROM articles"

# Inspect schema
pnpm wrangler d1 execute DB --local --command "SELECT sql FROM sqlite_master WHERE type='table'"
```

### Expected Results

**Global Setup Output**:

```
🚀 [GlobalSetup] Démarrage de l'initialisation D1...
   📋 Application des migrations D1...
✅ Applying migration 0001_create_categories.sql
✅ Applying migration 0002_create_articles.sql
   🌱 Seed des catégories...
   📄 Seed des articles de test...
   ✅ Base de données D1 initialisée avec succès
```

**Data Verification**:

```sql
-- Categories count
SELECT COUNT(*) FROM categories;
-- Should return: N rows (e.g., 5-10)

-- Articles count
SELECT COUNT(*) FROM articles;
-- Should return: N rows (e.g., 10-20)
```

### Validation Checklist

- [ ] Global setup completes without errors
- [ ] All migrations applied successfully
- [ ] Categories table contains data
- [ ] Articles table contains data
- [ ] Data integrity is correct (no NULL required fields)
- [ ] Seeding is idempotent (can run multiple times)
- [ ] Tests can query D1 successfully

### Troubleshooting D1 Issues

**Issue: Global setup fails**

```bash
# Check wrangler version
pnpm wrangler --version  # Should be 3.x

# Verify D1 binding in wrangler.jsonc
cat wrangler.jsonc | grep -A 5 d1_databases

# Reset D1 and try again
rm -rf .wrangler/state/v3/d1/
pnpm exec tsx tests/global-setup.ts
```

**Issue: Seeding fails with SQL error**

```bash
# Validate SQL syntax manually
pnpm wrangler d1 execute DB --local --file=./drizzle/seeds/categories.sql

# Check for errors in SQL files
cat drizzle/seeds/categories.sql
```

---

## 🌐 Cross-Browser Validation (Commit 5)

### Purpose

Ensure tests pass stably on all supported browsers (Chromium, Firefox, WebKit).

### Running Cross-Browser Validation

```bash
# Run on specific browser
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox
pnpm test:e2e --project=webkit

# Run on all browsers
pnpm test:e2e

# Run multiple times to detect flakiness
for i in {1..3}; do
  echo "=== Run $i ==="
  pnpm test:e2e --reporter=line
done
```

### Expected Results

**Per Browser**:

```
[chromium] 15 passed (1.2m)
[firefox]  15 passed (1.4m)
[webkit]   15 passed (1.8m)
```

**Consistency Check**:
All 3 runs should have IDENTICAL results:

- Same pass/fail status for each test
- No intermittent failures
- Similar execution times (within 20% variance)

### Validation Checklist

- [ ] 100% pass rate on Chromium
- [ ] 100% pass rate on Firefox
- [ ] 100% pass rate on WebKit
- [ ] No flaky tests (3 runs identical)
- [ ] No browser-specific failures
- [ ] Reasonable execution time per browser

### Detecting Flaky Tests

**Flakiness indicators**:

- Test passes sometimes, fails sometimes
- Different results across runs
- Timeouts on some runs
- "Element not found" errors intermittently

**How to identify**:

```bash
# Run tests 5-10 times
for i in {1..10}; do
  pnpm test:e2e --reporter=line > run_$i.txt 2>&1
done

# Compare results
diff run_1.txt run_2.txt
diff run_2.txt run_3.txt
# Any differences indicate flakiness
```

**Common fixes**:

- Add explicit waits: `await page.waitForLoadState('networkidle')`
- Use Playwright auto-waiting
- Check for race conditions
- Ensure application state is stable

---

## 📊 Validation Metrics

Track these metrics throughout Phase 2:

### Build Metrics

| Run | Build Time | Worker Size | Assets Count | Status  |
| --- | ---------- | ----------- | ------------ | ------- |
| 1   | \_\_\_ sec | \_\_\_ KB   | \_\_\_       | [✅/❌] |
| 2   | \_\_\_ sec | \_\_\_ KB   | \_\_\_       | [✅/❌] |
| 3   | \_\_\_ sec | \_\_\_ KB   | \_\_\_       | [✅/❌] |

**Target**: 100% success rate, consistent times

### Startup Metrics

| Run | Startup Time | IPv4 Bind | Responds | Status  |
| --- | ------------ | --------- | -------- | ------- |
| 1   | \_\_\_ sec   | [Yes/No]  | [Yes/No] | [✅/❌] |
| 2   | \_\_\_ sec   | [Yes/No]  | [Yes/No] | [✅/❌] |
| 3   | \_\_\_ sec   | [Yes/No]  | [Yes/No] | [✅/❌] |

**Target**: <120s, 100% IPv4, 100% responds

### Test Metrics

| Run | Tests  | Passed | Failed | Flaky  | Time   |
| --- | ------ | ------ | ------ | ------ | ------ |
| 1   | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_ |
| 2   | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_ |
| 3   | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_ |

**Target**: 100% pass, 0 flaky, <5 min

### Browser Metrics

| Browser  | Tests  | Passed | Failed | Time   | Status  |
| -------- | ------ | ------ | ------ | ------ | ------- |
| Chromium | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_ | [✅/❌] |
| Firefox  | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_ | [✅/❌] |
| WebKit   | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_ | [✅/❌] |

**Target**: 100% pass on all browsers

---

## ✅ Phase 2 Validation Checklist

Before marking Phase 2 complete:

### Build Validation

- [ ] Clean build succeeds 3/3 times
- [ ] Build time <5 minutes
- [ ] Worker.js generated correctly
- [ ] Assets bundled correctly

### Startup Validation

- [ ] Server starts 3/3 times
- [ ] Startup time <120 seconds
- [ ] IPv4 binding confirmed
- [ ] Server responds to requests

### Test Validation

- [ ] All tests pass 3/3 times
- [ ] 100% pass rate
- [ ] 0 flaky tests
- [ ] Tests complete in <5 minutes

### D1 Validation

- [ ] Global setup succeeds
- [ ] Migrations applied
- [ ] Data seeded correctly
- [ ] Tests can query D1

### Browser Validation

- [ ] Chromium: 100% pass
- [ ] Firefox: 100% pass
- [ ] WebKit: 100% pass
- [ ] No browser-specific issues

### Overall Stability

- [ ] Can run full suite 5 times with identical results
- [ ] No intermittent failures
- [ ] No timing issues
- [ ] Ready for CI (Phase 3)

---

## 🚨 Final Validation

Run this complete validation before marking Phase 2 complete:

```bash
#!/bin/bash
echo "=== Phase 2 Final Validation ==="

# 1. Clean build
echo "1. Testing clean build..."
rm -rf .next .open-next node_modules/.cache
pnpm run build && pnpm exec opennextjs-cloudflare build
if [ $? -ne 0 ]; then echo "❌ Build failed"; exit 1; fi
echo "✅ Build passed"

# 2. D1 validation
echo "2. Testing D1 setup..."
pnpm exec tsx tests/global-setup.ts
if [ $? -ne 0 ]; then echo "❌ D1 setup failed"; exit 1; fi
echo "✅ D1 setup passed"

# 3. E2E tests (3 runs)
echo "3. Testing E2E stability..."
for i in {1..3}; do
  echo "   Run $i/3..."
  pnpm test:e2e --reporter=line > test_run_$i.log 2>&1
  if [ $? -ne 0 ]; then echo "❌ Tests failed on run $i"; exit 1; fi
done

# Check for consistency
diff test_run_1.log test_run_2.log > /dev/null
if [ $? -ne 0 ]; then echo "❌ Flaky tests detected (run 1 vs 2)"; exit 1; fi
diff test_run_2.log test_run_3.log > /dev/null
if [ $? -ne 0 ]; then echo "❌ Flaky tests detected (run 2 vs 3)"; exit 1; fi
echo "✅ Tests stable (3/3 identical)"

# 4. Type-checking
echo "4. Testing type-checking..."
pnpm exec tsc --noEmit
if [ $? -ne 0 ]; then echo "❌ Type errors"; exit 1; fi
echo "✅ Type-checking passed"

# 5. Linting
echo "5. Testing linting..."
pnpm lint
if [ $? -ne 0 ]; then echo "❌ Lint errors"; exit 1; fi
echo "✅ Linting passed"

echo ""
echo "🎉 Phase 2 validation complete - all checks passed!"
echo "✅ Ready to proceed to Phase 3"
```

---

**Phase 2 testing validates the testing infrastructure itself. Be thorough! 🔍**
