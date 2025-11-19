# Phase 2 - Checklist per Commit

This document provides a detailed checklist for each atomic debugging commit of Phase 2.

---

## 📋 Commit 1: Verify and Fix OpenNext Build Process

**Files**: `open-next.config.ts`, `next.config.ts`, `wrangler.jsonc`, build outputs
**Estimated Duration**: 30-45 minutes

### Investigation Tasks

- [ ] Clean previous build artifacts: `rm -rf .next .open-next`
- [ ] Run Next.js build: `pnpm run build`
- [ ] Examine build output for errors or warnings
- [ ] Run OpenNext build: `pnpm exec opennextjs-cloudflare build`
- [ ] Examine OpenNext build output for errors
- [ ] Check generated files exist

### Verification Tasks

- [ ] Verify `.open-next/worker.js` exists
- [ ] Check worker.js file size (should be >100KB)
- [ ] Verify `.open-next/assets/` directory exists
- [ ] Check assets include `_next/`, favicons, etc.
- [ ] Verify no build errors in console output
- [ ] Check OpenNext adapter version compatibility

### Potential Issues & Fixes

#### Issue: Module Resolution Errors

- [ ] Check `tsconfig.json` paths configuration
- [ ] Verify `next.config.ts` experimental settings
- [ ] Ensure all imports use correct aliases

#### Issue: OpenNext Build Fails

- [ ] Check OpenNext adapter version: `pnpm list @opennextjs/cloudflare`
- [ ] Verify compatibility with Next.js 15
- [ ] Review `open-next.config.ts` configuration
- [ ] Check for missing dependencies

#### Issue: Missing Assets

- [ ] Verify `public/` directory structure
- [ ] Check `next.config.ts` asset configuration
- [ ] Review OpenNext asset bundling settings

### Validation

```bash
# Clean build
rm -rf .next .open-next node_modules/.cache

# Full build pipeline
pnpm run build
pnpm exec opennextjs-cloudflare build

# Verify outputs
ls -lh .open-next/worker.js
ls -la .open-next/assets/
du -sh .open-next/

# Check exit codes
echo $?  # Should be 0
```

**Expected Result**:

- Build completes without errors
- `worker.js` is ~500KB-2MB (varies by app size)
- Assets directory contains all static files

### Review Checklist

#### Build Process

- [ ] Build command exits with code 0
- [ ] No errors in build logs
- [ ] No warnings that indicate problems
- [ ] Build time is reasonable (<5 minutes)

#### Generated Files

- [ ] `.open-next/worker.js` exists and is not empty
- [ ] Worker file size is reasonable
- [ ] `.open-next/assets/` contains expected files
- [ ] Static assets are correctly bundled

#### Configuration

- [ ] `open-next.config.ts` is properly configured
- [ ] `wrangler.jsonc` references correct paths
- [ ] No hardcoded paths or environment-specific values

#### Code Quality

- [ ] Any configuration changes are minimal
- [ ] Changes are well-commented
- [ ] No temporary debug code left in configs

### Documentation

- [ ] Document any build errors encountered
- [ ] Note solutions applied and why they worked
- [ ] Record build metrics (time, file sizes)
- [ ] Update troubleshooting guide if needed

### Commit Message

```bash
git add open-next.config.ts next.config.ts wrangler.jsonc
git commit -m "fix(e2e): verify and fix OpenNext worker build process

- Issue: OpenNext build may fail or produce invalid worker
- Root cause: [Document specific issue if found]
- Solution: [Document specific fix if applied]
- Validation: Build completes successfully, worker.js generated

Metrics:
- Build time: [X minutes]
- Worker size: [X KB/MB]
- Assets count: [X files]

Part of Phase 2 - Commit 1/5"
```

---

## 📋 Commit 2: Resolve Timeout Issues and Optimize Server Startup

**Files**: `playwright.config.ts`, `package.json`, startup logs
**Estimated Duration**: 45-60 minutes

### Investigation Tasks

- [ ] Start wrangler with verbose logging: `WRANGLER_LOG=debug pnpm preview`
- [ ] Time server startup (run 3 times): `time pnpm preview`
- [ ] Analyze startup sequence in logs
- [ ] Identify bottlenecks (build, asset loading, worker initialization)
- [ ] Check for IPv4/IPv6 issues
- [ ] Monitor port binding

### Verification Tasks

- [ ] Verify `--ip 127.0.0.1` flag in preview script
- [ ] Check `--port 8788` is specified
- [ ] Confirm server binds to correct address
- [ ] Measure average startup time over 3 runs
- [ ] Verify Playwright detects server readiness

### Timing Benchmarks

Record startup times:

- [ ] Run 1: **\_** seconds
- [ ] Run 2: **\_** seconds
- [ ] Run 3: **\_** seconds
- [ ] Average: **\_** seconds
- [ ] Target: <120 seconds

### Potential Issues & Fixes

#### Issue: Startup >120 seconds

- [ ] Check if OpenNext build happens during startup (should be pre-built)
- [ ] Verify wrangler dev uses cached build
- [ ] Consider increasing `webServer.timeout` in playwright.config.ts
- [ ] Check for slow asset loading

#### Issue: IPv6 Resolution Problems

- [ ] Verify `--ip 127.0.0.1` flag is present
- [ ] Check wrangler logs show correct IP
- [ ] Test connectivity: `curl http://127.0.0.1:8788`

#### Issue: Port Already in Use

- [ ] Check for zombie processes: `lsof -i :8788`
- [ ] Kill conflicting processes
- [ ] Ensure previous test runs cleaned up properly

### Configuration Adjustments

If timeout adjustment needed:

- [ ] Update `playwright.config.ts`:
  ```typescript
  webServer: {
    timeout: 120 * 1000, // or higher if justified
  }
  ```
- [ ] Document why timeout was increased
- [ ] Note average startup time in comments

### Validation

```bash
# Test 1: Verify IPv4 binding
pnpm preview | grep "127.0.0.1:8788"
# Should see: "Ready on http://127.0.0.1:8788"

# Test 2: Time startup (repeat 3 times)
time pnpm preview
# Record each time, calculate average

# Test 3: Test connectivity
curl -I http://127.0.0.1:8788
# Should return 200 OK

# Test 4: Playwright server detection
pnpm test:e2e --grep "should" | head -20
# Should start webServer and connect successfully
```

**Expected Result**:

- Server starts consistently in <120 seconds
- Binds to 127.0.0.1:8788 every time
- Playwright detects server readiness

### Review Checklist

#### Startup Performance

- [ ] Average startup time <120 seconds
- [ ] Startup time is consistent (variance <20s)
- [ ] Logs show clear startup progression
- [ ] No hanging or freezing during startup

#### Network Configuration

- [ ] Server binds to IPv4 (127.0.0.1)
- [ ] Port 8788 is correctly configured
- [ ] No IPv6 resolution attempts
- [ ] Playwright can connect reliably

#### Configuration Quality

- [ ] Timeout values are justified
- [ ] No arbitrary or excessive timeouts
- [ ] Preview script is correctly formatted
- [ ] Changes are documented

### Documentation

- [ ] Record baseline startup metrics
- [ ] Document any timeout adjustments
- [ ] Note any startup optimization applied
- [ ] Create troubleshooting notes

### Commit Message

```bash
git add playwright.config.ts package.json
git commit -m "fix(e2e): resolve timeout issues and optimize server startup

- Issue: Wrangler dev startup may exceed Playwright timeout
- Root cause: [Document specific cause]
- Solution: [Document specific fix]
- Validation: Consistent startup in <120s, IPv4 binding confirmed

Metrics:
- Average startup: [X seconds]
- Timeout configured: [X seconds]
- IPv4 binding: Verified

Part of Phase 2 - Commit 2/5"
```

---

## 📋 Commit 3: Validate and Fix Existing E2E Tests on workerd

**Files**: `tests/*.spec.ts`, `tests/fixtures/*.ts`
**Estimated Duration**: 60-90 minutes

### Investigation Tasks

- [ ] Run compression tests: `pnpm test:e2e tests/compression.spec.ts`
- [ ] Run middleware tests: `pnpm test:e2e tests/middleware.spec.ts`
- [ ] Run i18n tests: `pnpm test:e2e tests/i18n-edge-cases.spec.ts`
- [ ] Analyze each test failure in detail
- [ ] Check Playwright HTML report: `pnpm exec playwright show-report`
- [ ] Review screenshots and traces for failed tests

### Test-by-Test Validation

#### Compression Tests

- [ ] Test: Brotli compression
  - [ ] Check `content-encoding: br` header
  - [ ] Verify compressed response size
  - [ ] Validate decompression
- [ ] Test: Gzip compression
  - [ ] Check `content-encoding: gzip` header
  - [ ] Verify compressed response size
- [ ] Test: Compression threshold
  - [ ] Small responses not compressed
  - [ ] Large responses compressed

#### Middleware Tests

- [ ] Test: i18n redirects
  - [ ] `/fr` → `/fr/` redirect
  - [ ] `/en` → `/en/` redirect
  - [ ] Root `/` → `/fr/` (default locale)
- [ ] Test: Locale detection
  - [ ] Accept-Language header respected
  - [ ] Default locale fallback works

#### i18n Edge Cases

- [ ] Test: Missing translation keys
  - [ ] Graceful fallback behavior
  - [ ] No crashes on missing keys
- [ ] Test: Special characters in URLs
  - [ ] Encoded characters handled
  - [ ] Unicode support

### Potential Issues & Fixes

#### Issue: Compression Headers Different on workerd

**Symptoms**: Expected `br` but got `gzip` or no compression

**Solutions**:

- [ ] Check Cloudflare automatic compression settings
- [ ] Verify request headers include `accept-encoding`
- [ ] Adjust test assertions to match workerd behavior
- [ ] Document differences from Node.js

#### Issue: Redirect Behavior Different

**Symptoms**: Redirect status code or location header differs

**Solutions**:

- [ ] Verify middleware configuration
- [ ] Check Next.js 15 redirect behavior
- [ ] Adjust assertions if workerd behavior is correct
- [ ] Document redirect differences

#### Issue: Timing Issues

**Symptoms**: Intermittent failures, race conditions

**Solutions**:

- [ ] Add explicit waits: `await page.waitForLoadState('networkidle')`
- [ ] Use Playwright auto-waiting features
- [ ] Check for async operations completing

### Fix Strategy

For each failing test:

1. **Understand expected behavior** (what should happen)
2. **Observe actual behavior** (what is happening)
3. **Identify cause** (why it's different)
4. **Determine fix type**:
   - Test adjustment (assertion was wrong)
   - Code fix (app behavior needs change)
   - Timing fix (race condition)
5. **Apply minimal fix**
6. **Validate fix** (run test 3 times)

### Validation

```bash
# Test each file individually
pnpm test:e2e tests/compression.spec.ts
pnpm test:e2e tests/middleware.spec.ts
pnpm test:e2e tests/i18n-edge-cases.spec.ts

# Run all tests together
pnpm test:e2e

# Run tests 3 times to check stability
for i in {1..3}; do
  echo "Run $i"
  pnpm test:e2e
done

# All runs should pass identically
```

**Expected Result**:

- All tests pass on first run
- All tests pass consistently (3/3 runs)
- No flaky or intermittent failures

### Review Checklist

#### Test Fixes

- [ ] All compression tests pass
- [ ] All middleware tests pass
- [ ] All i18n edge case tests pass
- [ ] No tests skipped or disabled
- [ ] No assertions weakened without justification

#### Code Quality

- [ ] Fixes are minimal and targeted
- [ ] No workarounds or hacks
- [ ] Test readability maintained
- [ ] Assertions remain meaningful

#### Documentation

- [ ] workerd-specific behaviors documented
- [ ] Any differences from Node.js explained
- [ ] Fix rationale is clear

#### Stability

- [ ] Tests pass consistently (3/3 runs)
- [ ] No timing dependencies
- [ ] No flaky assertions

### Commit Message

```bash
git add tests/
git commit -m "fix(e2e): validate and fix existing tests on workerd runtime

- Issue: Tests may fail on Cloudflare Workers runtime (workerd)
- Root cause: [List specific issues found]
- Solution: [List specific fixes applied]
- Validation: All tests pass consistently (3/3 runs)

Test Results:
- compression.spec.ts: ✓ [X/X tests pass]
- middleware.spec.ts: ✓ [X/X tests pass]
- i18n-edge-cases.spec.ts: ✓ [X/X tests pass]

Part of Phase 2 - Commit 3/5"
```

---

## 📋 Commit 4: Debug and Validate D1 Database Integration

**Files**: `tests/global-setup.ts`, `drizzle/seeds/*.sql`, `wrangler.jsonc`
**Estimated Duration**: 45-60 minutes

### Investigation Tasks

- [ ] Run global setup in isolation: `pnpm exec tsx tests/global-setup.ts`
- [ ] Check for errors in setup output
- [ ] Verify D1 binding in wrangler.jsonc
- [ ] Test migrations: `pnpm wrangler d1 migrations list DB --local`
- [ ] Inspect SQL seed files for syntax errors
- [ ] Query D1 directly to verify seeding

### D1 Configuration Verification

- [ ] Check `wrangler.jsonc` has D1 binding:
  ```json
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "...",
      "database_id": "..."
    }
  ]
  ```
- [ ] Verify binding name matches code
- [ ] Check database name is correct

### Migration Validation

- [ ] List migrations: `pnpm wrangler d1 migrations list DB --local`
- [ ] Check all migrations show as applied
- [ ] Verify table schema:
  ```bash
  pnpm wrangler d1 execute DB --local --command "SELECT sql FROM sqlite_master WHERE type='table'"
  ```
- [ ] Confirm tables exist (categories, articles, etc.)

### Seeding Validation

- [ ] Check categories seeded:
  ```bash
  pnpm wrangler d1 execute DB --local --command "SELECT COUNT(*) FROM categories"
  ```
- [ ] Check articles seeded:
  ```bash
  pnpm wrangler d1 execute DB --local --command "SELECT COUNT(*) FROM articles"
  ```
- [ ] Verify data integrity (no NULL required fields)

### Potential Issues & Fixes

#### Issue: Global Setup Fails with D1_ERROR

**Solutions**:

- [ ] Verify `--local` flag is present (critical!)
- [ ] Check wrangler version: `pnpm wrangler --version` (should be 3.x)
- [ ] Ensure D1 database is created locally
- [ ] Check file paths in global-setup.ts are correct

#### Issue: Migrations Don't Apply

**Solutions**:

- [ ] Check migration files exist in `drizzle/migrations/`
- [ ] Verify SQL syntax in migration files
- [ ] Try applying manually: `pnpm wrangler d1 migrations apply DB --local`
- [ ] Check for locking issues (close other wrangler processes)

#### Issue: Seeding Fails with SQL Syntax Error

**Solutions**:

- [ ] Validate SQL syntax in seed files
- [ ] Check for missing semicolons
- [ ] Verify string quoting (SQLite uses single quotes)
- [ ] Test SQL manually in D1

#### Issue: No Data After Seeding

**Solutions**:

- [ ] Check if SQL file paths are correct
- [ ] Verify seed files are not empty
- [ ] Check for foreign key constraints (seed in correct order)
- [ ] Query database to confirm

### Global Setup Improvements

- [ ] Add detailed logging for each step
- [ ] Improve error messages
- [ ] Add validation after each command
- [ ] Make seeding idempotent (handle duplicates)

### Validation

```bash
# Test global setup
pnpm exec tsx tests/global-setup.ts
# Should complete without errors

# Verify migrations
pnpm wrangler d1 migrations list DB --local
# Should show all migrations as applied

# Verify seeded data
pnpm wrangler d1 execute DB --local --command "SELECT * FROM categories"
pnpm wrangler d1 execute DB --local --command "SELECT * FROM articles"
# Should show seeded rows

# Run tests that use database
pnpm test:e2e
# Should pass if tests depend on D1
```

**Expected Result**:

- Global setup completes successfully
- Categories and articles tables populated
- Tests can query D1 without errors

### Review Checklist

#### D1 Configuration

- [ ] D1 binding correctly configured
- [ ] Database name and ID are correct
- [ ] Binding name matches code references

#### Migration & Seeding

- [ ] All migrations applied successfully
- [ ] All seed files execute without errors
- [ ] Data is correctly seeded
- [ ] Seeding is idempotent

#### Global Setup Script

- [ ] Clear logging for each step
- [ ] Proper error handling
- [ ] Fails fast if issues occur
- [ ] Can be run multiple times safely

#### Code Quality

- [ ] No hardcoded values
- [ ] Environment-agnostic paths
- [ ] Clear error messages
- [ ] Well-commented

### Documentation

- [ ] Document D1 setup process
- [ ] Note any D1-specific gotchas
- [ ] Record seeding metrics (row counts)
- [ ] Update troubleshooting guide

### Commit Message

```bash
git add tests/global-setup.ts drizzle/seeds/ wrangler.jsonc
git commit -m "fix(e2e): debug and validate D1 database integration

- Issue: D1 seeding may fail or produce inconsistent state
- Root cause: [Document specific issues]
- Solution: [Document specific fixes]
- Validation: Global setup completes, data seeded correctly

Metrics:
- Categories seeded: [X rows]
- Articles seeded: [X rows]
- Migrations applied: [X migrations]

Part of Phase 2 - Commit 4/5"
```

---

## 📋 Commit 5: Verify Stability Across All Browsers

**Files**: `playwright.config.ts`, test output logs
**Estimated Duration**: 30-45 minutes

### Browser Testing Matrix

Run full test suite on each browser:

#### Chromium Tests

- [ ] Run: `pnpm test:e2e --project=chromium`
- [ ] Record results: \_\_\_/X tests passed
- [ ] Note any failures
- [ ] Check execution time: **\_** seconds

#### Firefox Tests

- [ ] Run: `pnpm test:e2e --project=firefox`
- [ ] Record results: \_\_\_/X tests passed
- [ ] Note any failures
- [ ] Check execution time: **\_** seconds

#### WebKit Tests

- [ ] Run: `pnpm test:e2e --project=webkit`
- [ ] Record results: \_\_\_/X tests passed
- [ ] Note any failures
- [ ] Check execution time: **\_** seconds

### Flakiness Detection

Run tests 3 times to check for flaky tests:

- [ ] Run 1: `pnpm test:e2e` → Result: **\_**
- [ ] Run 2: `pnpm test:e2e` → Result: **\_**
- [ ] Run 3: `pnpm test:e2e` → Result: **\_**

**Flakiness Check**: All 3 runs should have identical results

### Potential Issues & Fixes

#### Issue: Tests Pass on Chromium but Fail on Firefox/WebKit

**Solutions**:

- [ ] Check for browser-specific API usage
- [ ] Verify CSS compatibility
- [ ] Adjust wait strategies for slower browsers
- [ ] Use Playwright's cross-browser selectors

#### Issue: Flaky Tests (Pass Sometimes, Fail Sometimes)

**Solutions**:

- [ ] Identify flaky test: review 3 runs results
- [ ] Add explicit waits: `await page.waitForLoadState('networkidle')`
- [ ] Use Playwright's auto-wait features
- [ ] Check for race conditions in application code
- [ ] Increase timeout for specific assertions

#### Issue: WebKit Takes Much Longer

**Solutions**:

- [ ] This is normal (WebKit is typically slower)
- [ ] Consider increasing timeouts for WebKit project
- [ ] Optimize expensive operations in application

### Configuration Adjustments

If browser-specific adjustments needed:

```typescript
// playwright.config.ts
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    use: {
      ...devices['Desktop Safari'],
      // Adjust if needed
      // timeout: 60000,
    },
  },
],
```

### Validation

```bash
# Full cross-browser test suite
pnpm test:e2e

# Individual browsers
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox
pnpm test:e2e --project=webkit

# Flakiness detection (3 runs)
for i in {1..3}; do
  echo "=== Run $i ==="
  pnpm test:e2e --reporter=line
done

# Compare results - should be identical
```

**Expected Result**:

- All tests pass on all 3 browsers
- 3 consecutive runs have identical results (0 flaky tests)
- Total execution time <5 minutes locally

### Review Checklist

#### Browser Coverage

- [ ] 100% pass rate on Chromium
- [ ] 100% pass rate on Firefox
- [ ] 100% pass rate on WebKit
- [ ] All 3 browsers run in test suite

#### Stability

- [ ] 0 flaky tests (3/3 identical runs)
- [ ] No intermittent failures
- [ ] Consistent execution times
- [ ] No browser-specific workarounds (unless justified)

#### Performance

- [ ] Total execution time <5 min locally
- [ ] No excessively slow tests
- [ ] Reasonable execution time per browser

#### Code Quality

- [ ] No browser-specific hacks
- [ ] Cross-browser compatible code
- [ ] Clean test output (no warnings)
- [ ] Proper error handling

### Documentation

- [ ] Record execution metrics per browser
- [ ] Document any browser differences
- [ ] Note any stability improvements made
- [ ] Update test documentation

### Commit Message

```bash
git add playwright.config.ts
git commit -m "fix(e2e): verify stability across all browsers and eliminate flaky tests

- Issue: Tests may be unstable or flaky across browsers
- Root cause: [Document if specific issues found]
- Solution: [Document any fixes applied]
- Validation: 100% pass rate on 3 browsers, 0 flaky tests (3/3 runs)

Test Results:
- Chromium: ✓ [X/X tests] ([X]s)
- Firefox: ✓ [X/X tests] ([X]s)
- WebKit: ✓ [X/X tests] ([X]s)
- Flakiness: 0 (3/3 identical runs)

Part of Phase 2 - Commit 5/5"
```

---

## ✅ Final Phase Validation

After all 5 commits:

### Complete Phase Checklist

- [ ] All 5 commits completed
- [ ] OpenNext build works reliably
- [ ] Wrangler starts within timeout
- [ ] All existing tests pass
- [ ] D1 database seeds correctly
- [ ] Tests stable across all browsers
- [ ] No flaky tests
- [ ] Documentation updated

### Final Validation Commands

```bash
# Clean build
rm -rf .next .open-next node_modules/.cache

# Full build
pnpm run build
pnpm exec opennextjs-cloudflare build

# Run tests 3 times
pnpm test:e2e
pnpm test:e2e
pnpm test:e2e

# Type-checking
pnpm exec tsc --noEmit

# Linting
pnpm lint

# All must pass with exit code 0
```

### Success Criteria

- [ ] ✅ Build completes without errors
- [ ] ✅ Server starts in <120s consistently
- [ ] ✅ All tests pass (100% success rate)
- [ ] ✅ D1 database functional
- [ ] ✅ 0 flaky tests (verified with 3 runs)
- [ ] ✅ All 3 browsers supported
- [ ] ✅ Ready for Phase 3 (CI integration)

**Phase 2 is complete when all checkboxes are checked! 🎉**

**Next Step**: Proceed to Phase 3 - CI Integration
