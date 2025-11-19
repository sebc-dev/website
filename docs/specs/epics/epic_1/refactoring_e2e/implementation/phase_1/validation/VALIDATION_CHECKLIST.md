# Phase 1 - Final Validation Checklist

Complete validation checklist before marking Phase 1 - Configuration Locale as complete.

---

## ✅ 1. Commits and Structure

- [ ] All 5 atomic commits completed
- [ ] Commit 1: Configure preview script (package.json modified)
- [ ] Commit 2: Create D1 global setup (tests/global-setup.ts created)
- [ ] Commit 3: Update Playwright URLs (playwright.config.ts modified)
- [ ] Commit 4: Add global setup + timeout (playwright.config.ts modified)
- [ ] Commit 5: Validation complete (tests pass)
- [ ] Commits follow Gitmoji naming convention (🔧, ✨, ✅)
- [ ] Commit order is logical (1→2→3→4→5)
- [ ] Each commit is focused (single responsibility)
- [ ] No merge commits in phase branch
- [ ] Git history is clean and readable

**Validation**:
```bash
# Check commit history
git log --oneline --graph | head -10

# Expected: 5 commits with Gitmoji and clear messages
# 🔧 config(e2e): add global setup hook and extend timeout
# 🔧 config(e2e): update Playwright URLs for wrangler runtime
# ✨ feat(e2e): create D1 global setup for test database
# 🔧 config(e2e): configure preview script for wrangler dev
```

---

## ✅ 2. Configuration Files

### package.json

- [ ] `preview` script exists
- [ ] Script uses `opennextjs-cloudflare build` before wrangler
- [ ] Script uses `wrangler dev --port 8788 --ip 127.0.0.1`
- [ ] Port is 8788 (matches Playwright config)
- [ ] IPv4 forced with `--ip 127.0.0.1`
- [ ] JSON syntax is valid

**Validation**:
```bash
# Check preview script
grep -A 1 '"preview"' package.json

# Expected output:
# "preview": "opennextjs-cloudflare build && wrangler dev --port 8788 --ip 127.0.0.1"

# Validate JSON
cat package.json | jq . > /dev/null
# Expected: No output (success)
```

### tests/global-setup.ts

- [ ] File exists at `tests/global-setup.ts`
- [ ] Exports async function as default
- [ ] Uses `execSync` from 'child_process'
- [ ] **CRITICAL**: All wrangler commands use `--local` flag
- [ ] Applies migrations: `wrangler d1 migrations apply DB --local`
- [ ] Seeds categories: `wrangler d1 execute DB --local --file=./drizzle/seeds/categories.sql`
- [ ] Seeds articles: `wrangler d1 execute DB --local --file=./drizzle/seeds/sample-articles.sql`
- [ ] Has try-catch error handling
- [ ] Throws error on failure (doesn't silently fail)
- [ ] Has informative logging with emojis
- [ ] TypeScript compiles without errors

**Validation**:
```bash
# CRITICAL: Verify ALL wrangler commands use --local
grep -n "wrangler" tests/global-setup.ts | grep -v "--local"
# Expected: No results (or only in comments)

# TypeScript check
pnpm exec tsc --noEmit tests/global-setup.ts
# Expected: No errors

# Test execution
pnpm exec tsx tests/global-setup.ts
# Expected: Succeeds with migration and seed logs
```

### playwright.config.ts

- [ ] `baseURL` is `'http://127.0.0.1:8788'`
- [ ] `webServer.url` is `'http://127.0.0.1:8788'`
- [ ] `webServer.command` is `'pnpm preview'`
- [ ] `webServer.timeout` is `120 * 1000` (120 seconds)
- [ ] `globalSetup` is `require.resolve('./tests/global-setup')`
- [ ] `workers` config preserved: `process.env.CI ? 1 : undefined`
- [ ] Uses 127.0.0.1 (IPv4) not localhost
- [ ] Port 8788 matches package.json preview script
- [ ] Comments explain IPv4 forcing and timeout
- [ ] TypeScript compiles without errors

**Validation**:
```bash
# Check URLs use IPv4
grep "127.0.0.1:8788" playwright.config.ts
# Expected: 2 matches (baseURL and webServer.url)

# Check globalSetup
grep "globalSetup" playwright.config.ts
# Expected: globalSetup: require.resolve('./tests/global-setup')

# Check timeout
grep "timeout.*120" playwright.config.ts
# Expected: timeout: 120 * 1000

# TypeScript check
pnpm exec tsc --noEmit playwright.config.ts
# Expected: No errors
```

---

## ✅ 3. Wrangler and D1

### Wrangler Configuration

- [ ] `wrangler.jsonc` exists and is valid
- [ ] D1 database binding configured (binding: "DB")
- [ ] `nodejs_compat` flag enabled
- [ ] Wrangler authenticated (`pnpm wrangler whoami` succeeds)

**Validation**:
```bash
# Check wrangler.jsonc exists
test -f wrangler.jsonc && echo "✅ wrangler.jsonc exists"

# Check D1 binding
grep -A 3 'database_id' wrangler.jsonc
# Expected: Shows DB binding configuration

# Check authentication
pnpm wrangler whoami
# Expected: Shows your account info
```

### D1 Database

- [ ] D1 database exists (`pnpm wrangler d1 list`)
- [ ] Migration files exist in `drizzle/migrations/`
- [ ] Seed files exist in `drizzle/seeds/categories.sql`
- [ ] Seed files exist in `drizzle/seeds/sample-articles.sql`
- [ ] Migrations can be applied locally
- [ ] Seeds can be executed locally
- [ ] Database has data after seeding

**Validation**:
```bash
# List D1 databases
pnpm wrangler d1 list
# Expected: Shows website-db

# Check migrations exist
ls drizzle/migrations/*.sql
# Expected: Lists migration files

# Check seeds exist
test -f drizzle/seeds/categories.sql && echo "✅ categories.sql exists"
test -f drizzle/seeds/sample-articles.sql && echo "✅ sample-articles.sql exists"

# Apply migrations
pnpm wrangler d1 migrations apply DB --local
# Expected: ✅ Migrations applied successfully

# Verify data
pnpm wrangler d1 execute DB --local --command "SELECT COUNT(*) FROM categories"
# Expected: count > 0
```

---

## ✅ 4. Local Development

### Wrangler Dev Startup

- [ ] `pnpm preview` starts successfully
- [ ] Starts within 120 seconds (timeout limit)
- [ ] Logs show `[wrangler:inf] Ready on http://127.0.0.1:8788`
- [ ] Uses IPv4: `127.0.0.1:8788` (NOT localhost or ::1)
- [ ] No binding errors (D1, R2, etc.)
- [ ] Application is accessible via HTTP

**Validation**:
```bash
# Start wrangler dev
pnpm preview

# Expected output includes:
# Building .open-next...
# ✓ Build completed in XX.Xs
# ⛅️ wrangler 3.95.0
# [wrangler:inf] Ready on http://127.0.0.1:8788

# In another terminal, test accessibility
curl -I http://127.0.0.1:8788
# Expected: HTTP/1.1 200 OK

# Stop server (Ctrl+C)
```

### Global Setup Execution

- [ ] Global setup runs before Playwright tests
- [ ] Logs appear in test output
- [ ] Migrations applied successfully
- [ ] Categories seeded
- [ ] Articles seeded
- [ ] Success message displayed
- [ ] No errors in global setup logs

**Validation**:
```bash
# Run Playwright dry-run (triggers global setup)
pnpm exec playwright test --dry-run 2>&1 | head -50

# Expected output includes:
# 🚀 [GlobalSetup] Démarrage de l'initialisation D1...
#    📋 Application des migrations D1...
# ✅ Applying migration ...
#    🌱 Seed des catégories...
#    📄 Seed des articles de test...
#    ✅ Base de données D1 initialisée avec succès
```

---

## ✅ 5. E2E Tests

### Test Execution

- [ ] All 3 test files execute
- [ ] `tests/compression.spec.ts` passes (Brotli/Gzip tests)
- [ ] `tests/middleware.spec.ts` passes (i18n routing tests)
- [ ] `tests/i18n-edge-cases.spec.ts` passes (edge case tests)
- [ ] No test failures
- [ ] No test timeouts
- [ ] Total execution time < 5 minutes locally

**Validation**:
```bash
# Run full E2E test suite
pnpm test:e2e

# Expected output:
# 🚀 [GlobalSetup] ...
# ✅ Base de données D1 initialisée avec succès
# Starting webServer: pnpm preview
# [wrangler:inf] Ready on http://127.0.0.1:8788
# Running X tests using Y workers
# X passed (Xm Xs)

# Check each test file individually
pnpm test:e2e tests/compression.spec.ts
pnpm test:e2e tests/middleware.spec.ts
pnpm test:e2e tests/i18n-edge-cases.spec.ts
# Expected: Each passes
```

### Test Stability

- [ ] Tests pass consistently (run 3-5 times)
- [ ] No flaky tests (intermittent failures)
- [ ] Results are identical across runs
- [ ] No IPv4/IPv6 race conditions
- [ ] No timing-related errors

**Validation**:
```bash
# Run tests 3 times consecutively
pnpm test:e2e && pnpm test:e2e && pnpm test:e2e

# Expected: All 3 runs pass with identical results

# Or use a loop
for i in {1..5}; do
  echo "=== Run $i ==="
  pnpm test:e2e || exit 1
done
# Expected: All 5 runs pass
```

### Browser Coverage

- [ ] Tests pass on Chromium
- [ ] Tests pass on Firefox
- [ ] Tests pass on WebKit
- [ ] All browsers use wrangler runtime (not Node.js)

**Validation**:
```bash
# Test each browser individually
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox
pnpm test:e2e --project=webkit
# Expected: All pass
```

---

## ✅ 6. TypeScript and Build

### TypeScript Compilation

- [ ] No TypeScript errors in global-setup.ts
- [ ] No TypeScript errors in playwright.config.ts
- [ ] No TypeScript errors in project (`pnpm exec tsc --noEmit`)

**Validation**:
```bash
# Check global-setup
pnpm exec tsc --noEmit tests/global-setup.ts
# Expected: No errors

# Check playwright.config
pnpm exec tsc --noEmit playwright.config.ts
# Expected: No errors

# Check entire project
pnpm exec tsc --noEmit
# Expected: No errors (or only pre-existing errors)
```

### Build Process

- [ ] Next.js build succeeds (`pnpm run build`)
- [ ] OpenNext worker build succeeds (`pnpm exec opennextjs-cloudflare build`)
- [ ] `.open-next/worker.js` generated
- [ ] `.open-next/assets/` directory exists with static files
- [ ] No build warnings (or only expected warnings)

**Validation**:
```bash
# Clean build
rm -rf .next .open-next node_modules/.cache

# Build Next.js
pnpm run build
# Expected: ✓ Compiled successfully

# Build OpenNext worker
pnpm exec opennextjs-cloudflare build
# Expected: ✓ Build completed

# Verify outputs
test -f .open-next/worker.js && echo "✅ worker.js generated"
test -d .open-next/assets && echo "✅ assets directory exists"
```

---

## ✅ 7. Linting and Code Quality

### Code Style

- [ ] Code follows project style guide
- [ ] No linting errors (`pnpm lint`)
- [ ] Gitmoji convention followed in commits
- [ ] No commented-out code
- [ ] No debug statements (except intentional logging)

**Validation**:
```bash
# Run linter
pnpm lint
# Expected: No errors (or only pre-existing errors)

# Check for Gitmoji in commits
git log --oneline -5 | grep -E "🔧|✨|✅"
# Expected: Shows commits with emojis

# Check for commented code
grep -r "// TODO\|// FIXME" tests/global-setup.ts playwright.config.ts
# Expected: None (or documented TODOs)
```

### Documentation

- [ ] IMPLEMENTATION_PLAN.md complete
- [ ] COMMIT_CHECKLIST.md complete
- [ ] ENVIRONMENT_SETUP.md complete
- [ ] guides/REVIEW.md complete
- [ ] guides/TESTING.md complete
- [ ] validation/VALIDATION_CHECKLIST.md (this file) complete
- [ ] All internal links work
- [ ] All commands in docs are correct

**Validation**:
```bash
# Check all docs exist
test -f docs/specs/epics/epic_1/refactoring_e2e/implementation/phase_1/IMPLEMENTATION_PLAN.md && echo "✅ IMPLEMENTATION_PLAN.md"
test -f docs/specs/epics/epic_1/refactoring_e2e/implementation/phase_1/COMMIT_CHECKLIST.md && echo "✅ COMMIT_CHECKLIST.md"
test -f docs/specs/epics/epic_1/refactoring_e2e/implementation/phase_1/ENVIRONMENT_SETUP.md && echo "✅ ENVIRONMENT_SETUP.md"
test -f docs/specs/epics/epic_1/refactoring_e2e/implementation/phase_1/guides/REVIEW.md && echo "✅ REVIEW.md"
test -f docs/specs/epics/epic_1/refactoring_e2e/implementation/phase_1/guides/TESTING.md && echo "✅ TESTING.md"
test -f docs/specs/epics/epic_1/refactoring_e2e/implementation/phase_1/validation/VALIDATION_CHECKLIST.md && echo "✅ VALIDATION_CHECKLIST.md"
```

---

## ✅ 8. Integration with Phase 0

### Prerequisites Met

- [ ] Phase 0 completed and merged
- [ ] ADR 002 created (wrangler dev local approach)
- [ ] Git status was clean before Phase 1
- [ ] No conflicts with Phase 0 changes

**Validation**:
```bash
# Check ADR 002 exists
test -f docs/decisions/002-e2e-local-wrangler-dev.md && echo "✅ ADR 002 exists"

# Check git status
git status
# Expected: Only Phase 1 changes (or clean if already committed)
```

### No Breaking Changes

- [ ] Existing functionality still works
- [ ] Other npm scripts unchanged (dev, build, start, etc.)
- [ ] No regressions in non-E2E tests
- [ ] Project builds successfully

**Validation**:
```bash
# Test other scripts
pnpm dev --help
# Expected: No errors

# Run unit tests (if any)
pnpm test
# Expected: All pass (or same as before Phase 1)
```

---

## ✅ 9. Security and Performance

### Security

- [ ] **CRITICAL**: No production database targeted (all wrangler use --local)
- [ ] No sensitive data exposed in code
- [ ] Environment variables used correctly
- [ ] No credentials committed to git
- [ ] Error messages don't leak sensitive info

**Validation**:
```bash
# CRITICAL CHECK: All wrangler commands use --local
grep -r "wrangler d1" tests/ | grep -v "--local" | grep -v ".md"
# Expected: No results

# Check for credentials in code
grep -r "API_KEY\|SECRET\|PASSWORD" tests/global-setup.ts
# Expected: No matches

# Check git history for secrets
git log -p | grep -i "password\|secret\|token" | head -20
# Expected: None (or only documentation references)
```

### Performance

- [ ] Wrangler startup time < 90 seconds
- [ ] Global setup time < 10 seconds
- [ ] E2E tests complete < 5 minutes
- [ ] No obvious bottlenecks
- [ ] Timeout (120s) is appropriate

**Validation**:
```bash
# Time global setup
time pnpm exec tsx tests/global-setup.ts
# Expected: real < 10s

# Time full E2E
time pnpm test:e2e
# Expected: real < 5m 0s (300 seconds)
```

---

## ✅ 10. Final Validation

### All Previous Sections

- [ ] ✅ Section 1: Commits and Structure
- [ ] ✅ Section 2: Configuration Files
- [ ] ✅ Section 3: Wrangler and D1
- [ ] ✅ Section 4: Local Development
- [ ] ✅ Section 5: E2E Tests
- [ ] ✅ Section 6: TypeScript and Build
- [ ] ✅ Section 7: Linting and Code Quality
- [ ] ✅ Section 8: Integration with Phase 0
- [ ] ✅ Section 9: Security and Performance

### Phase Objectives Met

- [ ] E2E tests run against Cloudflare Workers runtime (workerd)
- [ ] wrangler dev used instead of Node.js (`next dev`/`start`)
- [ ] IPv4 forced (127.0.0.1) to avoid race conditions
- [ ] D1 database seeded automatically before tests
- [ ] Timeout extended to 120s for OpenNext cold start
- [ ] All existing E2E tests pass consistently

### Acceptance Criteria

From STORY_E2E_CLOUDFLARE_REFACTOR.md Phase 1:

- [ ] **AC1**: playwright.config.ts uses `baseURL: 'http://127.0.0.1:8788'` ✅
- [ ] **AC2**: webServer.command is `pnpm preview` ✅
- [ ] **AC3**: preview script forces IPv4 with `wrangler dev --port 8788 --ip 127.0.0.1` ✅
- [ ] **AC4**: tests/global-setup.ts exists and seeds D1 correctly ✅
- [ ] **AC5**: playwright.config.ts references globalSetup ✅
- [ ] **AC6**: (CI integration - Phase 3, not applicable yet) ⏸️
- [ ] **AC7**: All 3 existing tests pass ✅
- [ ] **AC8**: `pnpm test:e2e` passes locally ✅
- [ ] **AC9**: (CI tests pass - Phase 3, not applicable yet) ⏸️
- [ ] **AC10**: Logs show `127.0.0.1:8788` ✅

**Note**: AC6 and AC9 are for Phase 3 (CI Integration).

### Ready for Next Phase

- [ ] Phase 1 complete and validated
- [ ] All checkboxes in this checklist checked
- [ ] Ready to start Phase 2 (Stabilisation et Debug)
- [ ] Documentation complete for Phase 1

---

## 📋 Validation Commands Summary

Run all these commands before final approval:

```bash
# ===== CONFIG VALIDATION =====

# Validate package.json
cat package.json | jq . > /dev/null
grep -A 1 '"preview"' package.json

# Validate global-setup.ts
pnpm exec tsc --noEmit tests/global-setup.ts
grep -n "wrangler" tests/global-setup.ts | grep -v "--local"
pnpm exec tsx tests/global-setup.ts

# Validate playwright.config.ts
pnpm exec tsc --noEmit playwright.config.ts
grep "127.0.0.1:8788" playwright.config.ts
grep "globalSetup" playwright.config.ts

# ===== WRANGLER & D1 VALIDATION =====

# Check wrangler authentication
pnpm wrangler whoami

# Apply migrations and verify
pnpm wrangler d1 migrations apply DB --local
pnpm wrangler d1 execute DB --local --command "SELECT COUNT(*) FROM categories"

# ===== LOCAL DEVELOPMENT VALIDATION =====

# Start wrangler dev (in separate terminal)
pnpm preview
# Verify: Shows "Ready on http://127.0.0.1:8788"

# Test accessibility (in another terminal)
curl -I http://127.0.0.1:8788

# ===== E2E TESTS VALIDATION =====

# Run full test suite
pnpm test:e2e

# Run stability test (3 consecutive runs)
pnpm test:e2e && pnpm test:e2e && pnpm test:e2e

# Test each browser
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox
pnpm test:e2e --project=webkit

# ===== BUILD VALIDATION =====

# Clean and rebuild
rm -rf .next .open-next node_modules/.cache
pnpm run build
pnpm exec opennextjs-cloudflare build

# Verify outputs
test -f .open-next/worker.js && echo "✅ worker.js"
test -d .open-next/assets && echo "✅ assets"

# ===== CODE QUALITY VALIDATION =====

# TypeScript check
pnpm exec tsc --noEmit

# Linting
pnpm lint

# ===== SECURITY VALIDATION =====

# CRITICAL: Verify all wrangler use --local
grep -r "wrangler d1" tests/ | grep -v "--local" | grep -v ".md"
# Expected: No results
```

**All commands must pass with no errors.**

---

## 📊 Success Metrics

| Metric                     | Target       | Actual | Status |
| -------------------------- | ------------ | ------ | ------ |
| **Commits**                | 5            | -      | ⏳     |
| **TypeScript Errors**      | 0            | -      | ⏳     |
| **E2E Tests Pass Rate**    | 100%         | -      | ⏳     |
| **Test Stability**         | 5/5 runs     | -      | ⏳     |
| **Wrangler Startup Time**  | < 90s        | -      | ⏳     |
| **Global Setup Time**      | < 10s        | -      | ⏳     |
| **Total E2E Time**         | < 5min       | -      | ⏳     |
| **Build Status**           | ✅ Success   | -      | ⏳     |
| **Lint Status**            | ✅ No errors | -      | ⏳     |
| **Browsers Tested**        | 3            | -      | ⏳     |
| **D1 Commands with --local** | 100%         | -      | ⏳     |

---

## 🎯 Final Verdict

Select one:

- [ ] ✅ **APPROVED** - Phase 1 is complete and ready
  - All checkboxes checked
  - All validation commands pass
  - All acceptance criteria met
  - Ready for merge and Phase 2

- [ ] 🔧 **CHANGES REQUESTED** - Issues to fix:
  - [ ] Issue 1: _[describe]_
  - [ ] Issue 2: _[describe]_
  - [ ] Re-run validation after fixes

- [ ] ❌ **REJECTED** - Major rework needed:
  - [ ] Major issue 1: _[describe]_
  - [ ] Major issue 2: _[describe]_
  - [ ] Requires significant changes

---

## 📝 Next Steps

### If Approved ✅

1. [ ] Update INDEX.md status to ✅ COMPLETED
2. [ ] Update started/completed dates in INDEX.md
3. [ ] Merge phase branch to main
4. [ ] Create git tag: `git tag phase-1-complete`
5. [ ] Update STORY_E2E_CLOUDFLARE_REFACTOR.md status
6. [ ] Prepare for Phase 2 (Stabilisation et Debug)
7. [ ] Archive this validation checklist

### If Changes Requested 🔧

1. [ ] Address all feedback items
2. [ ] Re-run all validation commands
3. [ ] Update this checklist with new results
4. [ ] Request re-review
5. [ ] Repeat until approved

### If Rejected ❌

1. [ ] Document all issues in detail
2. [ ] Plan rework approach
3. [ ] Schedule review with tech lead
4. [ ] Identify root cause (spec misunderstanding, technical blocker, etc.)
5. [ ] Create action plan for rework

---

## 📄 Sign-Off

**Validation completed by**: _[Name]_
**Date**: _[YYYY-MM-DD]_
**Verdict**: _[APPROVED / CHANGES REQUESTED / REJECTED]_

**Notes**:
_[Any additional observations, concerns, or recommendations]_

---

**This validation ensures Phase 1 is production-ready! 🚀**

**IMPORTANT**: Do not skip any validation step. Phase 2-4 depend on Phase 1 being rock-solid.
