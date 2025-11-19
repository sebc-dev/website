# Phase 1 - Checklist per Commit

This document provides a detailed checklist for each atomic commit of Phase 1 - Configuration Locale.

---

## 📋 Commit 1: Configure preview script for wrangler dev

**Type**: 🔧 config
**Files**: `package.json` (1 file modified)
**Estimated Duration**: 20 minutes (10 min implementation + 10 min review)

### Implementation Tasks

- [ ] Open `package.json` in editor
- [ ] Locate the `preview` script in the `scripts` section
- [ ] Change from `"preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview"`
- [ ] Change to `"preview": "opennextjs-cloudflare build && wrangler dev --port 8788 --ip 127.0.0.1"`
- [ ] Verify syntax (no trailing commas, proper quotes)
- [ ] Save file

### Validation

```bash
# Test the preview script
pnpm preview

# Expected output includes:
# Building .open-next...
# ✓ Build completed in XX.Xs
# ⛅️ wrangler X.XX.X
# [wrangler:inf] Ready on http://127.0.0.1:8788

# Verify port and IPv4
# Look for "127.0.0.1:8788" in output (NOT "localhost" or "::1")

# Test accessibility
curl http://127.0.0.1:8788
# Expected: HTML response (Next.js app homepage)

# Stop server (Ctrl+C)
```

**Expected Result**: Wrangler dev starts successfully on IPv4 127.0.0.1 port 8788

### Review Checklist

#### Script Configuration

- [ ] Script name is `preview` (not changed)
- [ ] Build command `opennextjs-cloudflare build` is preserved
- [ ] Uses `wrangler dev` (not `opennextjs-cloudflare preview`)
- [ ] Port explicitly set to `8788` with `--port 8788`
- [ ] IPv4 forced with `--ip 127.0.0.1`
- [ ] No extra flags that could cause issues

#### Verification

- [ ] Manual test: `pnpm preview` starts successfully
- [ ] Server listens on 127.0.0.1 (check logs)
- [ ] Port 8788 is used (check logs)
- [ ] Application is accessible via `curl http://127.0.0.1:8788`
- [ ] No errors in wrangler output

#### Code Quality

- [ ] JSON syntax is valid (no missing commas/quotes)
- [ ] Consistent with other scripts in package.json
- [ ] No commented code

### Commit Message

```bash
git add package.json
git commit -m "🔧 config(e2e): configure preview script for wrangler dev

- Update preview script to use wrangler dev instead of opennextjs-cloudflare preview
- Force IPv4 with --ip 127.0.0.1 to avoid Node.js 20+ localhost resolution issues
- Preserve port 8788 for consistency with Playwright config
- Keep opennextjs-cloudflare build step for worker generation

Part of Phase 1 - Commit 1/5"
```

---

## 📋 Commit 2: Create D1 global setup for test database

**Type**: ✨ feat
**Files**: `tests/global-setup.ts` (1 new file)
**Estimated Duration**: 50 minutes (30 min implementation + 20 min review)

### Implementation Tasks

- [ ] Create new file `tests/global-setup.ts`
- [ ] Add TypeScript imports (execSync, fs, path)
- [ ] Add JSDoc comment explaining purpose
- [ ] Implement `globalSetup` async function
- [ ] Add logging: "🚀 [GlobalSetup] Démarrage de l'initialisation D1..."
- [ ] (Optional) Add D1 cache purge logic (commented out)
- [ ] Add try-catch block for error handling
- [ ] Add migration step: `pnpm wrangler d1 migrations apply DB --local`
- [ ] Add categories seed: `pnpm wrangler d1 execute DB --local --file=./drizzle/seeds/categories.sql`
- [ ] Add articles seed: `pnpm wrangler d1 execute DB --local --file=./drizzle/seeds/sample-articles.sql`
- [ ] Add success logging: "✅ Base de données D1 initialisée avec succès"
- [ ] Add error handling that throws blocking error
- [ ] Export function as default
- [ ] Save file

### Validation

```bash
# Test global setup script independently
pnpm exec tsx tests/global-setup.ts

# Expected output:
# 🚀 [GlobalSetup] Démarrage de l'initialisation D1...
#    📋 Application des migrations D1...
# ✅ Applying migration XXXX_create_categories.sql
# ✅ Applying migration XXXX_create_articles.sql
#    🌱 Seed des catégories...
# Rows written: X
#    📄 Seed des articles de test...
# Rows written: X
#    ✅ Base de données D1 initialisée avec succès

# Verify database has data
pnpm wrangler d1 execute DB --local --command "SELECT COUNT(*) as count FROM categories"
# Expected: Returns count > 0

pnpm wrangler d1 execute DB --local --command "SELECT COUNT(*) as count FROM articles"
# Expected: Returns count > 0

# Check that seed data is correct
pnpm wrangler d1 execute DB --local --command "SELECT name FROM categories LIMIT 3"
# Expected: Returns category names

# TypeScript compilation
pnpm exec tsc --noEmit tests/global-setup.ts
# Expected: No errors
```

**Expected Result**: D1 database successfully seeded with categories and articles

### Review Checklist

#### D1 Safety

- [ ] **CRITICAL**: All wrangler commands use `--local` flag
- [ ] No commands target production database
- [ ] Error handling prevents tests from running with bad DB state

#### Implementation Logic

- [ ] Imports are correct (execSync from 'child_process', fs, path)
- [ ] Function is async and exported as default
- [ ] Migrations applied before seeding
- [ ] Categories seeded before articles (foreign key dependency)
- [ ] Uses `pnpm wrangler` (not `wrangler` directly)
- [ ] File paths to seeds are correct (./drizzle/seeds/...)

#### Logging

- [ ] Clear start message with emoji
- [ ] Each step has informative logging
- [ ] Success message at the end
- [ ] Error logging in catch block

#### Error Handling

- [ ] Try-catch wraps all D1 operations
- [ ] Errors are logged to console.error
- [ ] Function throws error (doesn't silently fail)
- [ ] Error message is descriptive

#### Code Quality

- [ ] JSDoc comment explains purpose and references guide
- [ ] execSync uses stdio: 'inherit' for output visibility
- [ ] encoding: 'utf-8' is set
- [ ] No hardcoded values (DB name uses 'DB' from wrangler.jsonc)
- [ ] Optional cache purge is commented with explanation

### Commit Message

```bash
git add tests/global-setup.ts
git commit -m "✨ feat(e2e): create D1 global setup for test database

- Apply D1 migrations before each test run
- Seed categories and sample articles automatically
- Add comprehensive logging with emojis for visibility
- Implement robust error handling that blocks tests on failure
- Use --local flag for all wrangler commands to protect production
- Optional D1 cache purge (commented, can be enabled if needed)

Part of Phase 1 - Commit 2/5"
```

---

## 📋 Commit 3: Update Playwright config URLs for wrangler

**Type**: 🔧 config
**Files**: `playwright.config.ts` (1 file modified)
**Estimated Duration**: 30 minutes (15 min implementation + 15 min review)

### Implementation Tasks

- [ ] Open `playwright.config.ts` in editor
- [ ] Locate `baseURL` in `use` section
- [ ] Change from `'http://localhost:3000'` to `'http://127.0.0.1:8788'`
- [ ] Locate `webServer.url` in `webServer` section
- [ ] Change from `'http://localhost:3000'` to `'http://127.0.0.1:8788'`
- [ ] Locate `webServer.command`
- [ ] Change from current command to `'pnpm preview'`
- [ ] Update comments above `webServer` section to explain IPv4 forcing and workerd runtime
- [ ] Save file

### Validation

```bash
# Validate Playwright config syntax
pnpm exec playwright --version
# Expected: No syntax errors, prints version

# List tests (validates config without running)
pnpm exec playwright test --list
# Expected: Lists all test files without errors

# Check config is parseable
node -e "const config = require('./playwright.config.ts'); console.log('Config valid');"
# Expected: "Config valid" (or use ts-node if available)

# TypeScript compilation
pnpm exec tsc --noEmit playwright.config.ts
# Expected: No errors
```

**Expected Result**: Playwright configuration uses correct URLs for wrangler without syntax errors

### Review Checklist

#### URL Configuration

- [ ] `baseURL` is `'http://127.0.0.1:8788'` (IPv4, not localhost)
- [ ] `webServer.url` is `'http://127.0.0.1:8788'` (matches baseURL)
- [ ] `webServer.command` is `'pnpm preview'`
- [ ] Port 8788 matches wrangler dev port
- [ ] Protocol is `http` (not https)

#### IPv4 Verification

- [ ] Uses `127.0.0.1` (IPv4) not `localhost` (can resolve to IPv6)
- [ ] Uses `127.0.0.1` not `::1` (IPv6)
- [ ] Both baseURL and webServer.url use same address

#### Documentation

- [ ] Comments explain why IPv4 is forced
- [ ] Comments mention Node.js 20+ localhost resolution issues
- [ ] Comments reference workerd runtime

#### No Unintended Changes

- [ ] `reuseExistingServer` unchanged
- [ ] `stdout` and `stderr` unchanged
- [ ] `timeout` not changed yet (Commit 4)
- [ ] `globalSetup` not added yet (Commit 4)
- [ ] Other config sections unchanged

#### Code Quality

- [ ] TypeScript syntax is valid
- [ ] No syntax errors
- [ ] Quotes are consistent with file style

### Commit Message

```bash
git add playwright.config.ts
git commit -m "🔧 config(e2e): update Playwright URLs for wrangler runtime

- Change baseURL from localhost:3000 to 127.0.0.1:8788
- Update webServer.url to match (127.0.0.1:8788)
- Configure webServer.command to use pnpm preview
- Force IPv4 (127.0.0.1) to avoid Node.js 20+ localhost resolution race conditions
- Update comments to explain workerd runtime and IPv4 forcing

Part of Phase 1 - Commit 3/5"
```

---

## 📋 Commit 4: Add global setup hook and extend timeout

**Type**: 🔧 config
**Files**: `playwright.config.ts` (1 file modified)
**Estimated Duration**: 30 minutes (15 min implementation + 15 min review)

### Implementation Tasks

- [ ] Open `playwright.config.ts` in editor
- [ ] Locate the top-level config object (after imports)
- [ ] Add `globalSetup: require.resolve('./tests/global-setup'),` near the top
- [ ] Locate `webServer.timeout` in `webServer` section
- [ ] Add or update `timeout: 120 * 1000,` (120 seconds)
- [ ] Add comment explaining timeout is for OpenNext cold start + wrangler
- [ ] Verify `workers: process.env.CI ? 1 : undefined` is still present for CI stability
- [ ] Save file

### Validation

```bash
# Verify globalSetup file is found
node -e "console.log(require.resolve('./tests/global-setup'))"
# Expected: Prints absolute path ending in tests/global-setup.ts

# Validate Playwright config
pnpm exec playwright --version
# Expected: No errors

# Check config structure
pnpm exec playwright test --list
# Expected: Lists tests without errors

# TypeScript compilation
pnpm exec tsc --noEmit playwright.config.ts
# Expected: No errors

# Verify globalSetup is called (dry run)
# Note: Full test requires Commit 5, but we can check syntax
pnpm exec playwright test --dry-run 2>&1 | head -20
# Expected: No errors about missing globalSetup file
```

**Expected Result**: Playwright configuration includes global setup and extended timeout

### Review Checklist

#### Global Setup Configuration

- [ ] `globalSetup` property added to top-level config
- [ ] Uses `require.resolve('./tests/global-setup')`
- [ ] File path is relative and correct
- [ ] globalSetup file exists (from Commit 2)

#### Timeout Configuration

- [ ] `timeout` property added to `webServer` section
- [ ] Value is `120 * 1000` (120 seconds in milliseconds)
- [ ] Not set too low (<60s) or too high (>180s)
- [ ] Comment explains it's for OpenNext build + wrangler startup

#### CI Configuration Preserved

- [ ] `workers: process.env.CI ? 1 : undefined` is still present
- [ ] CI environment variable check is correct
- [ ] Comment explains sequential execution in CI for stability

#### No Unintended Changes

- [ ] `baseURL` unchanged from Commit 3
- [ ] `webServer.url` unchanged from Commit 3
- [ ] `webServer.command` unchanged from Commit 3
- [ ] Other config sections unchanged

#### Code Quality

- [ ] TypeScript syntax is valid
- [ ] No syntax errors
- [ ] Comma placement is correct
- [ ] Config structure is clean and readable

### Commit Message

```bash
git add playwright.config.ts
git commit -m "🔧 config(e2e): add global setup hook and extend timeout

- Add globalSetup to run D1 database initialization before tests
- Extend webServer timeout to 120s for OpenNext cold start + wrangler dev
- Preserve CI workers configuration (sequential for stability)
- Add comments explaining timeout rationale and CI optimization

Part of Phase 1 - Commit 4/5"
```

---

## 📋 Commit 5: Validate E2E tests run against wrangler

**Type**: ✅ test
**Files**: None (validation only, no code changes)
**Estimated Duration**: 30 minutes (20 min validation + 10 min review)

### Implementation Tasks

- [ ] Ensure all previous commits are completed
- [ ] Clean build artifacts: `rm -rf .next .open-next node_modules/.cache`
- [ ] Rebuild: `pnpm run build`
- [ ] Run full E2E test suite
- [ ] Verify output logs show expected behavior
- [ ] Check that all tests pass
- [ ] Run tests multiple times to check for flakiness
- [ ] Inspect Playwright HTML report
- [ ] Document any issues found

### Validation

```bash
# Clean build artifacts (optional but recommended)
rm -rf .next .open-next node_modules/.cache

# Rebuild application
pnpm run build
# Expected: Next.js build succeeds

# Build worker
pnpm exec opennextjs-cloudflare build
# Expected: .open-next/worker.js generated

# Run full E2E test suite
pnpm test:e2e

# Expected output should include:
# 🚀 [GlobalSetup] Démarrage de l'initialisation D1...
# ✅ Base de données D1 initialisée avec succès
#
# Starting webServer: pnpm preview
# Building .open-next...
# ✓ Build completed in XX.Xs
# ⛅️ wrangler X.XX.X
# [wrangler:inf] Ready on http://127.0.0.1:8788
#
# Running X tests using Y workers
#
# ✓ tests/compression.spec.ts:XX:X › should serve Brotli compressed responses
# ✓ tests/middleware.spec.ts:XX:X › should redirect /fr to /fr/
# ✓ tests/i18n-edge-cases.spec.ts:XX:X › ...
#
# X passed (Xm XXs)

# Run again to check for flakiness
pnpm test:e2e
# Expected: Same results (no intermittent failures)

# Run individual test files
pnpm test:e2e tests/compression.spec.ts
pnpm test:e2e tests/middleware.spec.ts
pnpm test:e2e tests/i18n-edge-cases.spec.ts
# Expected: Each passes individually

# Check Playwright HTML report
pnpm exec playwright show-report
# Expected: Opens browser with all tests passed
```

**Expected Result**: All E2E tests pass consistently against wrangler dev runtime

### Review Checklist

#### Global Setup Execution

- [ ] Logs show "🚀 [GlobalSetup] Démarrage de l'initialisation D1..."
- [ ] Migrations applied successfully
- [ ] Categories seeded
- [ ] Articles seeded
- [ ] Success message displayed

#### Wrangler Startup

- [ ] Wrangler version displayed (e.g., "⛅️ wrangler 3.95.0")
- [ ] Build completes successfully
- [ ] Server starts on `http://127.0.0.1:8788`
- [ ] Log shows `[wrangler:inf] Ready on http://127.0.0.1:8788`
- [ ] No "ECONNREFUSED" errors
- [ ] No IPv6 related errors

#### Test Execution

- [ ] All 3 test files execute
- [ ] `tests/compression.spec.ts` passes (Brotli/Gzip tests)
- [ ] `tests/middleware.spec.ts` passes (i18n routing tests)
- [ ] `tests/i18n-edge-cases.spec.ts` passes (edge case tests)
- [ ] No test failures
- [ ] No test timeouts
- [ ] Total execution time < 5 minutes

#### Stability

- [ ] Running tests 2-3 times yields consistent results
- [ ] No flaky tests (intermittent passes/failures)
- [ ] No timing-related errors
- [ ] Server shuts down cleanly after tests

#### Playwright Report

- [ ] HTML report generated in `playwright-report/`
- [ ] All tests shown as passed (green)
- [ ] Screenshots/videos captured on failure (if any)
- [ ] Trace available for debugging (if configured)

#### Logs Quality

- [ ] No unexpected errors in stdout/stderr
- [ ] Wrangler warnings are expected (Durable Objects, etc.)
- [ ] D1 operations logged clearly
- [ ] Test output is readable

### Post-Validation Actions

- [ ] Document any issues encountered in notes
- [ ] If tests fail, do NOT commit - debug and fix
- [ ] If tests pass but are slow, note timing for Phase 2 optimization
- [ ] If flaky tests found, document and address before committing
- [ ] Update VALIDATION_CHECKLIST.md with actual metrics

### Commit Message

**Note**: This commit is conceptual - there are no file changes to commit. Instead, document validation success in PR description or notes.

```bash
# No git add needed (no files changed)

# Document validation in notes or PR description:
# ✅ Phase 1 Validation Complete
# - All 5 commits implemented successfully
# - E2E tests pass against wrangler dev runtime
# - D1 global setup works correctly
# - IPv4 configuration prevents race conditions
# - Tests are stable (no flakiness detected)
#
# Metrics:
# - Total execution time: X min XX sec
# - Global setup time: X sec
# - Wrangler startup time: XX sec
# - All 3 test files passed
# - Coverage: (report if available)
```

---

## ✅ Final Phase Validation

After all commits:

### Complete Phase Checklist

- [ ] All 5 commits completed
- [ ] `package.json` preview script uses wrangler dev
- [ ] `tests/global-setup.ts` created and functional
- [ ] `playwright.config.ts` uses 127.0.0.1:8788
- [ ] Global setup hook configured
- [ ] Timeout set to 120s
- [ ] All E2E tests pass
- [ ] TypeScript compiles without errors
- [ ] Linter passes
- [ ] Build succeeds
- [ ] Documentation updated (this checklist ✅)

### Final Validation Commands

```bash
# Verify package.json
grep "wrangler dev" package.json
# Expected: Shows preview script with wrangler dev

# Verify global-setup exists
test -f tests/global-setup.ts && echo "✅ Global setup exists"

# Verify playwright config
grep "127.0.0.1:8788" playwright.config.ts
grep "globalSetup" playwright.config.ts
# Expected: Both searches return matches

# Run all tests
pnpm test:e2e
# Expected: All pass

# Type-checking
pnpm exec tsc --noEmit
# Expected: No errors

# Linting
pnpm lint
# Expected: No errors

# Build
pnpm run build
# Expected: Succeeds
```

**Phase 1 is complete when all checkboxes are checked! 🎉**

---

## 📝 Notes

### Common Issues and Solutions

**Issue**: Wrangler dev timeout

- **Solution**: Increase timeout in Commit 4 to 180s if 120s is insufficient

**Issue**: D1 "table already exists" error

- **Solution**: Uncomment cache purge in global-setup.ts

**Issue**: IPv4/IPv6 race conditions

- **Solution**: Verify `--ip 127.0.0.1` in package.json and 127.0.0.1 in playwright.config.ts

**Issue**: Tests fail with ECONNREFUSED

- **Solution**: Check that preview script uses correct port (8788) and playwright config matches

**Issue**: Global setup not running

- **Solution**: Verify `require.resolve('./tests/global-setup')` path is correct

### Time Tracking

Track actual time spent on each commit:

| Commit    | Estimated    | Actual | Notes |
| --------- | ------------ | ------ | ----- |
| 1         | 20 min       | -      |       |
| 2         | 50 min       | -      |       |
| 3         | 30 min       | -      |       |
| 4         | 30 min       | -      |       |
| 5         | 30 min       | -      |       |
| **Total** | **2h 40min** | **-**  |       |

---

**Ready to start? Begin with Commit 1! Each commit builds on the previous one.**
