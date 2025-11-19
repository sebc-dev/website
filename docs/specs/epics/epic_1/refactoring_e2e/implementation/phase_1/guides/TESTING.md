# Phase 1 - Testing Guide

Complete testing strategy for Phase 1 - Configuration Locale.

---

## 🎯 Testing Strategy

Phase 1 focuses on **configuration changes** rather than new features, so testing is primarily:

1. **Configuration Validation**: Verify configs are syntactically correct
2. **Integration Testing**: Verify wrangler dev + Playwright work together
3. **E2E Testing**: Verify existing E2E tests pass against wrangler runtime
4. **Stability Testing**: Verify tests are not flaky

**Target**: 100% of existing E2E tests pass consistently against wrangler dev

**Test Count**: 3 existing E2E test files (no new tests added in Phase 1)

---

## 🧪 Configuration Validation Tests

### Purpose

Verify that configuration files are valid and loadable.

### After Commit 1: package.json

```bash
# Validate JSON syntax
cat package.json | jq . > /dev/null
# Expected: No output (success)

# Or use Node.js
node -e "require('./package.json')"
# Expected: No errors

# Test the script exists and is valid
pnpm preview --help 2>&1 | head -5
# Expected: Shows wrangler help or starts server (Ctrl+C to stop)
```

**What to check**:

- [ ] package.json is valid JSON
- [ ] preview script can be invoked
- [ ] No syntax errors

### After Commit 2: global-setup.ts

```bash
# TypeScript compilation check
pnpm exec tsc --noEmit tests/global-setup.ts
# Expected: No errors

# Test the script runs
pnpm exec tsx tests/global-setup.ts

# Expected output:
# 🚀 [GlobalSetup] Démarrage de l'initialisation D1...
#    📋 Application des migrations D1...
# ✅ Applying migration ...
#    🌱 Seed des catégories...
#    📄 Seed des articles de test...
#    ✅ Base de données D1 initialisée avec succès
```

**What to check**:

- [ ] TypeScript compiles without errors
- [ ] Script runs without throwing
- [ ] Migrations applied successfully
- [ ] Seeds executed successfully
- [ ] D1 database has data after running

### After Commits 3 & 4: playwright.config.ts

```bash
# TypeScript compilation check
pnpm exec tsc --noEmit playwright.config.ts
# Expected: No errors

# Validate Playwright can load the config
pnpm exec playwright --version
# Expected: Shows version, no config errors

# List tests (validates config without running)
pnpm exec playwright test --list

# Expected output:
# tests/compression.spec.ts
# tests/middleware.spec.ts
# tests/i18n-edge-cases.spec.ts
```

**What to check**:

- [ ] TypeScript compiles without errors
- [ ] Playwright can load config
- [ ] globalSetup file is found (Commit 4)
- [ ] No syntax errors

---

## 🔗 Integration Testing

### Purpose

Test that wrangler dev + Playwright global setup work together.

### Prerequisites

- [ ] Commits 1-4 completed
- [ ] wrangler installed and authenticated
- [ ] D1 database configured in wrangler.jsonc

### Running Integration Tests

**Test 1: Wrangler Dev Starts**

```bash
# Start wrangler dev
pnpm preview

# Wait for startup (max 120 seconds)
# Look for this line in output:
# [wrangler:inf] Ready on http://127.0.0.1:8788

# Verify IPv4
# Should see "127.0.0.1:8788" in logs, NOT "localhost" or "::1"

# Test application responds
# In another terminal:
curl http://127.0.0.1:8788
# Expected: HTML response (Next.js homepage)

# Stop wrangler dev (Ctrl+C)
```

**Validation checklist**:

- [ ] Wrangler starts within 120 seconds
- [ ] Logs show `127.0.0.1:8788`
- [ ] Application responds to HTTP requests
- [ ] No binding errors (D1, R2, etc.)

**Test 2: Global Setup Works**

```bash
# Run global setup independently
pnpm exec tsx tests/global-setup.ts

# Expected: Completes successfully

# Verify database state
pnpm wrangler d1 execute DB --local --command "SELECT COUNT(*) as count FROM categories"
# Expected: count > 0

pnpm wrangler d1 execute DB --local --command "SELECT COUNT(*) as count FROM articles"
# Expected: count > 0

# Verify data quality
pnpm wrangler d1 execute DB --local --command "SELECT name FROM categories LIMIT 3"
# Expected: Returns 3 category names
```

**Validation checklist**:

- [ ] Global setup runs without errors
- [ ] Migrations applied
- [ ] Categories seeded (count > 0)
- [ ] Articles seeded (count > 0)
- [ ] Data is valid (can query it)

**Test 3: Playwright + Wrangler Integration**

```bash
# Run Playwright dry-run (doesn't execute tests, just setup)
pnpm exec playwright test --dry-run

# Expected output includes:
# 🚀 [GlobalSetup] Démarrage de l'initialisation D1...
# ✅ Base de données D1 initialisée avec succès
# Starting webServer: pnpm preview
# [wrangler:inf] Ready on http://127.0.0.1:8788

# This validates:
# - Global setup is called by Playwright
# - Wrangler dev starts via webServer
# - Connection can be established
```

**Validation checklist**:

- [ ] Playwright calls global setup
- [ ] Global setup completes successfully
- [ ] Wrangler dev starts
- [ ] Playwright can connect to server

---

## 🎭 E2E Testing

### Purpose

Verify that existing E2E tests pass against the wrangler runtime.

### Test Files

Phase 1 validates **existing E2E tests** (no new tests added):

1. **tests/compression.spec.ts** - Brotli/Gzip compression tests
2. **tests/middleware.spec.ts** - i18n routing middleware tests
3. **tests/i18n-edge-cases.spec.ts** - i18n edge case tests

### Running E2E Tests

**Full Test Suite**

```bash
# Clean build (recommended before first run)
rm -rf .next .open-next node_modules/.cache
pnpm run build

# Run all E2E tests
pnpm test:e2e

# Expected output:
# 🚀 [GlobalSetup] Démarrage de l'initialisation D1...
# ✅ Base de données D1 initialisée avec succès
#
# Starting webServer: pnpm preview
# [wrangler:inf] Ready on http://127.0.0.1:8788
#
# Running X tests using Y workers
#
# tests/compression.spec.ts
#   ✓ should serve Brotli compressed responses (chromium)
#   ✓ should serve Brotli compressed responses (firefox)
#   ✓ should serve Brotli compressed responses (webkit)
#
# tests/middleware.spec.ts
#   ✓ should redirect /fr to /fr/ (chromium)
#   ...
#
# tests/i18n-edge-cases.spec.ts
#   ...
#
# X passed (Xm Xs)
#
# To open last HTML report run:
#   pnpm exec playwright show-report
```

**Individual Test Files**

```bash
# Run compression tests only
pnpm test:e2e tests/compression.spec.ts

# Run middleware tests only
pnpm test:e2e tests/middleware.spec.ts

# Run i18n edge case tests only
pnpm test:e2e tests/i18n-edge-cases.spec.ts
```

**Single Browser**

```bash
# Run on Chromium only
pnpm test:e2e --project=chromium

# Run on Firefox only
pnpm test:e2e --project=firefox

# Run on WebKit only
pnpm test:e2e --project=webkit
```

### Expected Results

**Compression Tests** (tests/compression.spec.ts):

- [ ] Brotli compression detected in response headers
- [ ] Gzip compression works as fallback
- [ ] Content-Encoding header is correct
- [ ] Response body is compressed

**Middleware Tests** (tests/middleware.spec.ts):

- [ ] i18n routing works (e.g., /fr redirects to /fr/)
- [ ] Locale detection from URL
- [ ] Default locale handling
- [ ] Language switching

**i18n Edge Cases** (tests/i18n-edge-cases.spec.ts):

- [ ] Handles missing translations gracefully
- [ ] Fallback to default locale
- [ ] URL patterns with complex paths
- [ ] Query parameters preserved

### Troubleshooting E2E Tests

**Issue: Tests timeout**

```bash
# Symptom: Tests hang and timeout
# Solution 1: Increase timeout in playwright.config.ts (from 120s to 180s)
# Solution 2: Check wrangler logs for errors
# Solution 3: Verify wrangler dev starts manually (pnpm preview)
```

**Issue: ECONNREFUSED errors**

```bash
# Symptom: Tests fail with "connect ECONNREFUSED"
# Solution 1: Verify IPv4 in package.json and playwright.config.ts
# Verify: grep "127.0.0.1" package.json playwright.config.ts
# Solution 2: Check if port 8788 is available
# Check: lsof -i :8788 (should be empty before tests)
```

**Issue: D1 errors in tests**

```bash
# Symptom: Tests fail with "table not found" or similar
# Solution 1: Verify global setup ran successfully
# Check logs for: "✅ Base de données D1 initialisée avec succès"
# Solution 2: Run global setup manually to verify
# Test: pnpm exec tsx tests/global-setup.ts
```

---

## 🔄 Stability Testing

### Purpose

Ensure tests are not flaky (intermittent failures).

### How to Test Stability

**Method 1: Multiple Sequential Runs**

```bash
# Run tests 3 times in a row
pnpm test:e2e && pnpm test:e2e && pnpm test:e2e

# Expected: All 3 runs should pass with identical results
# If any run fails or results differ = FLAKY
```

**Method 2: Loop Script**

```bash
# Run tests 5 times, tracking results
for i in {1..5}; do
  echo "=== Run $i ==="
  pnpm test:e2e
  if [ $? -ne 0 ]; then
    echo "FAILED on run $i"
    break
  fi
done

# Expected: All 5 runs pass
```

**Method 3: Parallel Runs (if workers > 1)**

```bash
# Run with multiple workers (stress test)
# Only if workers config allows
pnpm test:e2e --workers=2

# Expected: Tests still pass with parallelism
```

### Flakiness Indicators

**Symptoms of flaky tests**:

- ❌ Tests pass sometimes, fail other times
- ❌ Different results on repeated runs
- ❌ Timing-dependent failures
- ❌ IPv4/IPv6 race conditions
- ❌ Database state inconsistencies

**Common causes**:

1. **IPv4/IPv6 issues**: Using localhost instead of 127.0.0.1
2. **Timing issues**: Insufficient timeout
3. **Database state**: Global setup not cleaning DB properly
4. **Port conflicts**: Port 8788 already in use

### Fixing Flaky Tests

**Fix 1: IPv4 Forcing**

```bash
# Verify 127.0.0.1 everywhere
grep -r "localhost" package.json playwright.config.ts
# Expected: No matches (should use 127.0.0.1)
```

**Fix 2: Extend Timeout**

```typescript
// In playwright.config.ts
webServer: {
  timeout: 180 * 1000, // Increase from 120s to 180s
}
```

**Fix 3: Clean DB State**

```typescript
// In tests/global-setup.ts
// Uncomment D1 cache purge to ensure clean state
const d1StatePath = path.join(process.cwd(), '.wrangler/state/v3/d1');
if (fs.existsSync(d1StatePath)) {
  fs.rmSync(d1StatePath, { recursive: true, force: true });
}
```

---

## 📊 Test Metrics

### Coverage Goals

Phase 1 doesn't add new code, so coverage is about **existing tests passing**:

| Metric                     | Target | Validation                   |
| -------------------------- | ------ | ---------------------------- |
| **Existing tests passing** | 100%   | All 3 test files pass        |
| **Test stability**         | 100%   | 5 consecutive runs identical |
| **Runtime**                | <5 min | Total E2E execution time     |
| **Browsers tested**        | 3      | Chromium, Firefox, WebKit    |

### Performance Metrics

| Phase                | Expected Time |
| -------------------- | ------------- |
| **Global setup**     | < 10 seconds  |
| **Wrangler startup** | 60-90 seconds |
| **Tests execution**  | 2-3 minutes   |
| **Total**            | < 5 minutes   |

Track actual times:

```bash
# Time the full test run
time pnpm test:e2e

# Expected output at end:
# real    4m 32.123s
# user    ...
# sys     ...
```

---

## 🐛 Debugging Tests

### Enable Verbose Logging

```bash
# Playwright verbose mode
DEBUG=pw:api pnpm test:e2e

# Wrangler verbose mode
WRANGLER_LOG=debug pnpm preview

# Both combined (in separate terminals)
# Terminal 1:
WRANGLER_LOG=debug pnpm preview

# Terminal 2:
DEBUG=pw:api pnpm test:e2e
```

### Use Playwright UI Mode

```bash
# Run tests in interactive UI
pnpm test:e2e:ui

# Features:
# - Watch tests run in real-time
# - Inspect DOM
# - See network requests
# - Step through test actions
```

### Use Playwright Debug Mode

```bash
# Run specific test in debug mode
pnpm test:e2e:debug tests/compression.spec.ts

# Features:
# - Breakpoints
# - Step through code
# - Inspect state
# - Browser pauses at each action
```

### View Test Reports

```bash
# Generate and open HTML report
pnpm exec playwright show-report

# Features:
# - See all test results
# - Screenshots on failure
# - Videos of test execution
# - Network traces
# - Console logs
```

### Common Debugging Commands

```bash
# Check wrangler dev logs
pnpm preview 2>&1 | tee wrangler.log

# Check D1 database state
pnpm wrangler d1 execute DB --local --command "SELECT * FROM categories"
pnpm wrangler d1 execute DB --local --command "SELECT * FROM articles LIMIT 5"

# Check if port is in use
lsof -i :8788

# Kill stuck wrangler processes
pkill -f wrangler

# Clear all caches
rm -rf .next .open-next .wrangler/state node_modules/.cache

# Full rebuild
pnpm run build && pnpm exec opennextjs-cloudflare build
```

---

## ✅ Testing Checklist

Before merging Phase 1:

### Configuration Validation

- [ ] package.json is valid JSON
- [ ] preview script exists and works
- [ ] global-setup.ts compiles (TypeScript)
- [ ] playwright.config.ts compiles (TypeScript)

### Integration Tests

- [ ] wrangler dev starts successfully
- [ ] Wrangler uses IPv4 (127.0.0.1:8788)
- [ ] Global setup runs and seeds DB
- [ ] Playwright can connect to wrangler

### E2E Tests

- [ ] All 3 test files pass
- [ ] Compression tests pass (Brotli/Gzip)
- [ ] Middleware tests pass (i18n routing)
- [ ] i18n edge case tests pass
- [ ] Tests run on Chromium, Firefox, WebKit

### Stability

- [ ] Tests pass 5 times consecutively
- [ ] No flaky tests detected
- [ ] Total runtime < 5 minutes
- [ ] No IPv4/IPv6 race conditions

### Metrics

- [ ] Global setup time < 10 seconds
- [ ] Wrangler startup time < 90 seconds
- [ ] Total E2E time < 5 minutes
- [ ] 100% of existing tests pass

---

## 🎓 Best Practices

### Running Tests

✅ **Do**:

- Clean build before first test run
- Run full suite before committing
- Check for flakiness (run multiple times)
- Review Playwright HTML report

❌ **Don't**:

- Skip global setup validation
- Ignore timeout warnings
- Commit without running tests
- Ignore flaky test results

### Debugging

✅ **Do**:

- Use Playwright UI for visual debugging
- Check wrangler logs for binding errors
- Verify D1 database state
- Use verbose logging when stuck

❌ **Don't**:

- Debug without understanding the issue
- Change timeouts without investigating root cause
- Ignore error messages
- Skip reproduction steps

---

## ❓ FAQ

**Q: How long should tests take?**
A: < 5 minutes total locally. In CI (Phase 3), may be slower (~8-10 min).

**Q: What if a test fails?**
A: Debug using Playwright UI or debug mode. Check logs for errors. Verify wrangler and D1 work.

**Q: Should I test on all browsers?**
A: Yes, but Chromium is enough for quick validation. Run all browsers before merge.

**Q: How do I know if tests are flaky?**
A: Run 3-5 times. If results differ, it's flaky. Investigate IPv4, timing, or DB state.

**Q: Can I skip E2E tests during development?**
A: For quick iterations, yes. But run full suite before committing.

---

## 🔗 Related Documents

- [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md) - Atomic commit strategy
- [COMMIT_CHECKLIST.md](../COMMIT_CHECKLIST.md) - Per-commit validation
- [REVIEW.md](./REVIEW.md) - Code review guide
- [validation/VALIDATION_CHECKLIST.md](../validation/VALIDATION_CHECKLIST.md) - Final validation

---

**Testing is critical! Don't skip it. Phase 1 success depends on stable E2E tests. 🎯**
