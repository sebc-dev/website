# Phase 1 - Atomic Implementation Plan

**Objective**: Configure local E2E testing to run against Cloudflare Workers runtime (workerd) via wrangler dev instead of Node.js

---

## 🎯 Overview

### Why an Atomic Approach?

The implementation is split into **5 independent commits** to:

✅ **Facilitate review** - Each commit focuses on a single responsibility
✅ **Enable rollback** - If a commit has issues, revert it without breaking everything
✅ **Progressive type-safety** - TypeScript validates at each step
✅ **Tests as you go** - Tests accompany the relevant code
✅ **Continuous documentation** - Each commit can be documented independently

### Global Strategy

```
[Config Preview] → [D1 Seeding] → [URLs Update] → [Setup Hook] → [Validation]
       ↓               ↓              ↓              ↓              ↓
   pnpm preview    globalSetup    baseURL         timeout        tests pass
   → 127.0.0.1     → D1 ready     → 8788          → 120s         → ✅
```

---

## 📦 The 5 Atomic Commits

### Commit 1: Configure preview script with wrangler dev

**Type**: 🔧 config
**Files**: `package.json` (1 file modified)
**Size**: ~3 lines
**Duration**: 10 min (implementation) + 10 min (review)

**Content**:

- Modify `preview` script in `package.json`
- Change from `opennextjs-cloudflare preview` to `wrangler dev --port 8788 --ip 127.0.0.1`
- Force IPv4 binding to avoid Node.js 20+ localhost resolution issues

**Why it's atomic**:

- Single responsibility: Configure the preview command
- No external dependencies (wrangler already installed)
- Can be validated independently by running `pnpm preview`

**Technical Validation**:

```bash
# Test the new preview script
pnpm preview

# Expected: wrangler starts on 127.0.0.1:8788
# Look for: "[wrangler:inf] Ready on http://127.0.0.1:8788"
```

**Expected Result**: Wrangler dev server starts successfully on IPv4 address 127.0.0.1 port 8788

**Review Criteria**:

- [ ] Script uses `wrangler dev` (not opennextjs-cloudflare preview)
- [ ] Port is explicitly set to 8788
- [ ] IPv4 is forced with `--ip 127.0.0.1`
- [ ] Build step (`opennextjs-cloudflare build`) is preserved before wrangler
- [ ] Command works when run manually

---

### Commit 2: Create D1 global setup for test database seeding

**Type**: ✨ feat
**Files**: `tests/global-setup.ts` (1 new file)
**Size**: ~90 lines
**Duration**: 30 min (implementation) + 20 min (review)

**Content**:

- Create new file `tests/global-setup.ts`
- Implement D1 database initialization logic
- Apply migrations using `wrangler d1 migrations apply DB --local`
- Seed categories using `wrangler d1 execute DB --local --file=./drizzle/seeds/categories.sql`
- Seed articles using `wrangler d1 execute DB --local --file=./drizzle/seeds/sample-articles.sql`
- Add comprehensive error handling and logging
- Optional: Add D1 cache purge logic (commented out by default)

**Why it's atomic**:

- Single responsibility: Database initialization for tests
- Depends on: existing drizzle migrations and seed files (already present)
- Can be validated independently by running the script with tsx
- No impact on Playwright config yet (connected in Commit 4)

**Technical Validation**:

```bash
# Test global setup script independently
pnpm exec tsx tests/global-setup.ts

# Expected output:
# 🚀 [GlobalSetup] Démarrage de l'initialisation D1...
#    📋 Application des migrations D1...
#    🌱 Seed des catégories...
#    📄 Seed des articles de test...
#    ✅ Base de données D1 initialisée avec succès

# Verify D1 database has data
pnpm wrangler d1 execute DB --local --command "SELECT COUNT(*) FROM categories"
# Expected: Returns count > 0

pnpm wrangler d1 execute DB --local --command "SELECT COUNT(*) FROM articles"
# Expected: Returns count > 0
```

**Expected Result**: D1 local database is initialized with migrations applied and test data seeded

**Review Criteria**:

- [ ] Uses `--local` flag for all wrangler commands (critical for safety)
- [ ] Applies migrations before seeding
- [ ] Seeds categories before articles (respects foreign key constraints)
- [ ] Error handling throws blocking errors (doesn't silently fail)
- [ ] Logging is clear and informative
- [ ] Uses execSync with proper encoding
- [ ] Optional cache purge is commented (not enabled by default)
- [ ] Exports default async function for Playwright

---

### Commit 3: Update Playwright config URLs for wrangler

**Type**: 🔧 config
**Files**: `playwright.config.ts` (1 file modified)
**Size**: ~5 lines
**Duration**: 15 min (implementation) + 15 min (review)

**Content**:

- Change `baseURL` from `http://localhost:3000` to `http://127.0.0.1:8788`
- Change `webServer.url` from `http://localhost:3000` to `http://127.0.0.1:8788`
- Change `webServer.command` from current command to `pnpm preview`
- Update comments to explain IPv4 forcing and wrangler runtime

**Why it's atomic**:

- Single responsibility: URL configuration update
- Depends on: Commit 1 (preview script) to be functional
- Can be validated independently (Playwright will fail to start but config is valid)
- Isolated change that can be reviewed quickly

**Technical Validation**:

```bash
# Validate Playwright config syntax
pnpm exec playwright --version
# Expected: No syntax errors

# Try to start Playwright (will wait for server)
# Cancel after confirming it attempts connection to 127.0.0.1:8788
pnpm exec playwright test --list
# Expected: Shows test list without errors
```

**Expected Result**: Playwright configuration uses correct IPv4 URLs for wrangler

**Review Criteria**:

- [ ] `baseURL` uses `http://127.0.0.1:8788`
- [ ] `webServer.url` uses `http://127.0.0.1:8788`
- [ ] `webServer.command` uses `pnpm preview`
- [ ] IPv4 address (127.0.0.1) used instead of localhost
- [ ] Port 8788 matches wrangler dev port
- [ ] Comments explain IPv4 forcing and workerd runtime
- [ ] No other configuration changed

---

### Commit 4: Add global setup and extend timeout in Playwright config

**Type**: 🔧 config
**Files**: `playwright.config.ts` (1 file modified)
**Size**: ~4 lines
**Duration**: 15 min (implementation) + 15 min (review)

**Content**:

- Add `globalSetup: require.resolve('./tests/global-setup')` to config
- Change `webServer.timeout` from default (30s) to `120 * 1000` (120s)
- Update comments to explain timeout is for OpenNext cold start
- Keep `workers: process.env.CI ? 1 : undefined` for CI stability

**Why it's atomic**:

- Single responsibility: Setup hooks and timeouts
- Depends on: Commit 2 (global-setup.ts must exist)
- Can be validated independently
- Completes the Playwright configuration for wrangler

**Technical Validation**:

```bash
# Validate that globalSetup file is found
node -e "console.log(require.resolve('./tests/global-setup'))"
# Expected: Prints absolute path to global-setup.ts

# Test Playwright config
pnpm exec playwright --version
# Expected: No errors
```

**Expected Result**: Playwright will run global setup before tests and allow sufficient time for wrangler to start

**Review Criteria**:

- [ ] `globalSetup` uses `require.resolve('./tests/global-setup')`
- [ ] `webServer.timeout` is set to `120 * 1000` (120 seconds)
- [ ] Timeout rationale is documented in comments
- [ ] Workers configuration preserved for CI (workers: 1)
- [ ] No other configuration changed
- [ ] File path to global-setup is correct

---

### Commit 5: Validate E2E tests run against wrangler

**Type**: ✅ test
**Files**: None (validation only)
**Size**: 0 lines (test execution)
**Duration**: 20 min (validation) + 10 min (review)

**Content**:

- Run complete E2E test suite
- Verify wrangler dev starts successfully
- Verify D1 global setup executes
- Confirm all 3 existing tests pass (compression, middleware, i18n-edge-cases)
- Verify logs show wrangler running on 127.0.0.1:8788
- Confirm no flaky tests (run multiple times)

**Why it's atomic**:

- Single responsibility: End-to-end validation
- Depends on: All previous commits (complete configuration)
- Proves that the entire phase works together
- No code changes, only validation

**Technical Validation**:

```bash
# Run E2E tests locally
pnpm test:e2e

# Expected output should include:
# 🚀 [GlobalSetup] Démarrage de l'initialisation D1...
# ✅ Base de données D1 initialisée avec succès
# Starting webServer: pnpm preview
# [wrangler:inf] Ready on http://127.0.0.1:8788
# Running X tests using Y workers
# All tests passed

# Run again to check for flaky tests
pnpm test:e2e

# Expected: Same results (no intermittent failures)

# Run specific test file to verify
pnpm test:e2e tests/compression.spec.ts
pnpm test:e2e tests/middleware.spec.ts
pnpm test:e2e tests/i18n-edge-cases.spec.ts
# Expected: Each passes individually
```

**Expected Result**: All E2E tests pass consistently against wrangler dev runtime

**Review Criteria**:

- [ ] Global setup logs appear in output
- [ ] Wrangler starts on 127.0.0.1:8788
- [ ] All 3 tests pass (compression, middleware, i18n-edge-cases)
- [ ] No timeout errors
- [ ] No IPv4/IPv6 race conditions
- [ ] Tests complete in < 5 minutes
- [ ] Running tests multiple times yields same results
- [ ] Playwright HTML report generated successfully

---

## 🔄 Implementation Workflow

### Step-by-Step

1. **Read specification**: Review STORY_E2E_CLOUDFLARE_REFACTOR.md Phase 1 section
2. **Setup environment**: Verify wrangler installed (see ENVIRONMENT_SETUP.md)
3. **Implement Commit 1**: Modify package.json preview script
4. **Validate Commit 1**: Test `pnpm preview` manually
5. **Review Commit 1**: Self-review against criteria
6. **Commit Commit 1**: Use provided commit message
7. **Repeat for commits 2-5**
8. **Final validation**: Complete VALIDATION_CHECKLIST.md

### Validation at Each Step

After each commit:

```bash
# Syntax check (if code changes)
pnpm exec tsc --noEmit

# Linting
pnpm lint

# Format check (if applicable)
pnpm biome check .

# Test (if applicable)
# Tests only run after Commit 5
```

All must pass before moving to next commit.

---

## 📊 Commit Metrics

| Commit                        | Files | Lines    | Implementation | Review       | Total        |
| ----------------------------- | ----- | -------- | -------------- | ------------ | ------------ |
| 1. Configure preview script   | 1     | ~3       | 10 min         | 10 min       | 20 min       |
| 2. Create D1 global setup     | 1     | ~90      | 30 min         | 20 min       | 50 min       |
| 3. Update Playwright URLs     | 1     | ~5       | 15 min         | 15 min       | 30 min       |
| 4. Add global setup + timeout | 1     | ~4       | 15 min         | 15 min       | 30 min       |
| 5. Validate E2E tests         | 0     | 0        | 20 min         | 10 min       | 30 min       |
| **TOTAL**                     | **4** | **~102** | **1h 30min**   | **1h 10min** | **2h 40min** |

---

## ✅ Atomic Approach Benefits

### For Developers

- 🎯 **Clear focus**: One thing at a time (config, then setup, then tests)
- 🧪 **Testable**: Each commit can be validated independently
- 📝 **Documented**: Clear commit messages explain each step

### For Reviewers

- ⚡ **Fast review**: 10-20 min per commit (except Commit 2: 50min)
- 🔍 **Focused**: Single responsibility to check
- ✅ **Quality**: Easier to spot configuration errors or missing flags

### For the Project

- 🔄 **Rollback-safe**: Can revert individual commits if issues found
- 📚 **Historical**: Git history shows clear progression of E2E refactoring
- 🏗️ **Maintainable**: Future developers can understand the migration step-by-step

---

## 📝 Best Practices

### Commit Messages

Format:

```
type(scope): short description (max 50 chars)

- Point 1: detail
- Point 2: detail
- Point 3: justification if needed

Part of Phase 1 - Commit X/5
```

**Examples for this phase**:

```
🔧 config(e2e): configure preview script for wrangler dev

- Update preview script to use wrangler dev instead of opennextjs-cloudflare preview
- Force IPv4 with --ip 127.0.0.1 to avoid Node.js 20+ localhost resolution issues
- Preserve port 8788 for consistency with Playwright config

Part of Phase 1 - Commit 1/5
```

```
✨ feat(e2e): create D1 global setup for test database

- Apply D1 migrations before each test run
- Seed categories and sample articles automatically
- Add comprehensive logging and error handling
- Use --local flag to protect production database

Part of Phase 1 - Commit 2/5
```

### Review Checklist

Before committing:

- [ ] Code follows Gitmoji convention (see /docs/gitmoji.md)
- [ ] All validation commands pass
- [ ] TypeScript compiles (if applicable)
- [ ] No console.logs or debug code (except intentional logging)
- [ ] Documentation updated if needed
- [ ] Commit message follows format

---

## ⚠️ Important Points

### Do's

- ✅ Follow the commit order (dependencies: 1→2→3→4→5)
- ✅ Validate after each commit using provided commands
- ✅ Test wrangler manually after Commit 1
- ✅ Test global-setup independently after Commit 2
- ✅ Use provided commit messages as template

### Don'ts

- ❌ Skip commits or combine them (breaks atomic approach)
- ❌ Commit without running validations
- ❌ Change files from previous commits (unless fixing a bug)
- ❌ Add features not in the spec (scope creep)
- ❌ Forget the `--local` flag in wrangler commands (would target production!)

---

## ❓ FAQ

**Q: What if wrangler dev takes longer than 120s to start?**
A: Increase timeout to 180s in Commit 4. Document why in commit message.

**Q: What if D1 seeding fails with "table already exists"?**
A: The global setup should handle this. If issues persist, uncomment the D1 cache purge section in global-setup.ts.

**Q: Can I test E2E before Commit 5?**
A: Technically yes after Commit 4, but Commit 5 is dedicated validation to confirm everything works.

**Q: What if tests are flaky?**
A: Check IPv4 forcing in package.json and playwright.config.ts. Ensure 127.0.0.1 (not localhost) is used everywhere.

**Q: Can I change the commit order?**
A: No. Dependencies require this order: preview script → global setup → URLs → hooks → validation.

---

## 🔗 Related Documents

- **[COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md)** - Detailed checklist for each commit
- **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** - Wrangler and D1 setup guide
- **[guides/REVIEW.md](./guides/REVIEW.md)** - Code review guide
- **[guides/TESTING.md](./guides/TESTING.md)** - Testing strategy
- **[validation/VALIDATION_CHECKLIST.md](./validation/VALIDATION_CHECKLIST.md)** - Final validation

---

**Ready to implement? Start with Commit 1 using [COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md)!**
