# Phase 1 - Code Review Guide

Complete guide for reviewing the Phase 1 - Configuration Locale implementation.

---

## 🎯 Review Objective

Validate that the implementation:

- ✅ Configures E2E tests to run against Cloudflare Workers runtime (workerd)
- ✅ Uses wrangler dev with IPv4 forcing (127.0.0.1:8788)
- ✅ Automatically seeds D1 database before tests
- ✅ Extends Playwright timeout for OpenNext cold start
- ✅ All existing E2E tests pass against wrangler
- ✅ Follows project standards and Gitmoji convention

---

## 📋 Review Approach

Phase 1 is split into **5 atomic commits**. You can:

**Option A: Commit-by-commit review** (recommended)

- Easier to digest (10-50 min per commit)
- Progressive validation
- Targeted feedback
- Total time: ~2h

**Option B: Global review at once**

- Faster (1.5-2h total)
- Immediate overview
- Requires more focus
- May miss details

**Estimated Total Review Time**: 1h 10min - 2h (depending on approach)

---

## 🔍 Commit-by-Commit Review

### Commit 1: Configure preview script for wrangler dev

**Type**: 🔧 config
**Files**: `package.json` (1 file)
**Size**: ~3 lines
**Review Duration**: 10 minutes

#### Review Checklist

##### Script Configuration

- [ ] **Script name**: Must be `preview` (not changed from existing)
- [ ] **Build step**: `opennextjs-cloudflare build &&` preserved at beginning
- [ ] **Command**: Uses `wrangler dev` (not `opennextjs-cloudflare preview`)
- [ ] **Port**: Explicitly set with `--port 8788`
- [ ] **IPv4**: Forced with `--ip 127.0.0.1` (critical for avoiding race conditions)
- [ ] **No extra flags**: Only necessary flags present

**Expected script**:
```json
"preview": "opennextjs-cloudflare build && wrangler dev --port 8788 --ip 127.0.0.1"
```

##### Verification

- [ ] **Manual test**: Ask developer to run `pnpm preview`
- [ ] **Server starts**: Within 60-90 seconds
- [ ] **IPv4 binding**: Logs show `127.0.0.1:8788` (NOT `localhost` or `::1`)
- [ ] **Application works**: Can access via `curl http://127.0.0.1:8788`

##### Code Quality

- [ ] **JSON syntax**: Valid (no syntax errors, proper commas)
- [ ] **Consistency**: Matches style of other scripts in package.json
- [ ] **No commented code**: Old script should be removed, not commented

#### Technical Validation

```bash
# As reviewer, test the changes
git checkout [commit-1-hash]
pnpm preview

# Check output for:
# ✅ "[wrangler:inf] Ready on http://127.0.0.1:8788"
# ❌ NOT "localhost" or "::1"

# Test accessibility
curl -I http://127.0.0.1:8788
# Expected: HTTP/1.1 200 OK

# Stop server (Ctrl+C)
```

#### Questions to Ask

1. **Why IPv4 forcing?**
   - Answer: Node.js 20+ can resolve `localhost` to IPv6 (::1) unpredictably, causing ECONNREFUSED

2. **Why port 8788 specifically?**
   - Answer: Wrangler dev default port, matches Playwright config

3. **Is the build step necessary?**
   - Answer: Yes, `opennextjs-cloudflare build` generates `.open-next/worker.js` that wrangler serves

#### Approval Criteria

- ✅ **APPROVED** if:
  - Script uses `wrangler dev --port 8788 --ip 127.0.0.1`
  - Build step is preserved
  - Manual test succeeds
  - IPv4 binding confirmed in logs

- 🔧 **CHANGES REQUESTED** if:
  - Missing `--ip 127.0.0.1` flag (critical!)
  - Missing `--port 8788` flag
  - Build step removed
  - JSON syntax errors

- ❌ **REJECTED** if:
  - Uses wrong port
  - Uses localhost instead of 127.0.0.1
  - Removes build step entirely

---

### Commit 2: Create D1 global setup for test database

**Type**: ✨ feat
**Files**: `tests/global-setup.ts` (1 new file)
**Size**: ~90 lines
**Review Duration**: 20 minutes

#### Review Checklist

##### File Structure

- [ ] **Location**: File created at `tests/global-setup.ts`
- [ ] **Imports**: Uses Node.js imports (execSync, fs, path)
- [ ] **TypeScript**: Proper TypeScript syntax
- [ ] **Export**: Exports async function as default

##### D1 Safety (CRITICAL)

- [ ] **`--local` flag**: ALL wrangler commands use `--local` flag
- [ ] **No production targeting**: No commands without `--local`
- [ ] **Error handling**: Try-catch prevents silent failures
- [ ] **Throws on failure**: Function throws error if setup fails

**CRITICAL CHECK**: Search file for `wrangler` and verify EVERY occurrence has `--local`:
```bash
grep -n "wrangler" tests/global-setup.ts | grep -v "--local"
# Expected: No results (or only in comments)
```

##### Implementation Logic

- [ ] **Order**: Migrations → Categories seed → Articles seed
- [ ] **Commands correct**:
  - Migrations: `pnpm wrangler d1 migrations apply DB --local`
  - Categories: `pnpm wrangler d1 execute DB --local --file=./drizzle/seeds/categories.sql`
  - Articles: `pnpm wrangler d1 execute DB --local --file=./drizzle/seeds/sample-articles.sql`
- [ ] **execSync options**: `stdio: 'inherit'` and `encoding: 'utf-8'`
- [ ] **Paths**: File paths to seeds are correct (`./drizzle/seeds/...`)

##### Logging

- [ ] **Start message**: Clear start log with emoji
- [ ] **Step logging**: Each step (migrations, seeds) logged
- [ ] **Success message**: Clear success log at end
- [ ] **Error logging**: Errors logged to console.error
- [ ] **Informative**: Logs help debug if issues occur

##### Error Handling

- [ ] **Try-catch**: Wraps all D1 operations
- [ ] **Error logged**: Catch block logs error details
- [ ] **Throws**: Function throws error (doesn't return or exit(0))
- [ ] **Message**: Error message is descriptive

##### Optional Features

- [ ] **Cache purge**: Code exists but is commented out (optional feature)
- [ ] **Cache purge comment**: Explains when to enable it

#### Technical Validation

```bash
# As reviewer, test the global setup
git checkout [commit-2-hash]

# Test independently
pnpm exec tsx tests/global-setup.ts

# Expected output:
# 🚀 [GlobalSetup] Démarrage de l'initialisation D1...
#    📋 Application des migrations D1...
# ✅ Applying migration ...
#    🌱 Seed des catégories...
# Rows written: X
#    📄 Seed des articles de test...
# Rows written: X
#    ✅ Base de données D1 initialisée avec succès

# Verify database
pnpm wrangler d1 execute DB --local --command "SELECT COUNT(*) FROM categories"
# Expected: count > 0

pnpm wrangler d1 execute DB --local --command "SELECT COUNT(*) FROM articles"
# Expected: count > 0

# TypeScript check
pnpm exec tsc --noEmit tests/global-setup.ts
# Expected: No errors
```

#### Questions to Ask

1. **Why migrations before seeds?**
   - Answer: Tables must exist before inserting data

2. **Why categories before articles?**
   - Answer: Articles likely have foreign keys to categories

3. **Why throw error instead of logging and continuing?**
   - Answer: Tests shouldn't run with incomplete DB state (would cause false negatives)

4. **Why is cache purge commented?**
   - Answer: Optional optimization, not needed by default

#### Approval Criteria

- ✅ **APPROVED** if:
  - All wrangler commands use `--local`
  - Error handling is robust
  - Logging is clear
  - Manual test succeeds
  - TypeScript compiles

- 🔧 **CHANGES REQUESTED** if:
  - Missing `--local` on any wrangler command (**CRITICAL**)
  - Missing error handling
  - Incorrect seed file paths
  - No logging

- ❌ **REJECTED** if:
  - ANY wrangler command targets production (missing `--local`)
  - Function doesn't throw on error
  - Silently fails

---

### Commit 3: Update Playwright config URLs for wrangler

**Type**: 🔧 config
**Files**: `playwright.config.ts` (1 file modified)
**Size**: ~5 lines changed
**Review Duration**: 15 minutes

#### Review Checklist

##### URL Configuration

- [ ] **baseURL**: Changed to `'http://127.0.0.1:8788'`
- [ ] **webServer.url**: Changed to `'http://127.0.0.1:8788'`
- [ ] **webServer.command**: Changed to `'pnpm preview'`
- [ ] **URLs match**: baseURL and webServer.url are identical
- [ ] **Port matches**: 8788 matches wrangler dev port from Commit 1

##### IPv4 Verification

- [ ] **Uses 127.0.0.1**: NOT `localhost`, NOT `::1`
- [ ] **Both URLs**: baseURL AND webServer.url use 127.0.0.1
- [ ] **Comment**: Explains IPv4 forcing rationale

##### Documentation

- [ ] **Comments added/updated**: Explains IPv4 and workerd runtime
- [ ] **References guide**: Optionally mentions `/docs/guide_cloudflare_playwright.md`
- [ ] **Clear**: Comments are clear and concise

##### No Unintended Changes

- [ ] **timeout**: NOT changed yet (happens in Commit 4)
- [ ] **globalSetup**: NOT added yet (happens in Commit 4)
- [ ] **reuseExistingServer**: Unchanged
- [ ] **stdout/stderr**: Unchanged
- [ ] **projects**: Unchanged (browsers config)
- [ ] **other settings**: Unchanged

##### Code Quality

- [ ] **TypeScript syntax**: Valid
- [ ] **Quotes**: Consistent with file style
- [ ] **Formatting**: Matches project style

#### Technical Validation

```bash
# As reviewer, test the config
git checkout [commit-3-hash]

# Validate syntax
pnpm exec playwright --version
# Expected: No syntax errors

# List tests (validates config)
pnpm exec playwright test --list
# Expected: Lists tests without errors

# TypeScript check
pnpm exec tsc --noEmit playwright.config.ts
# Expected: No errors

# Verify URLs in config
grep "127.0.0.1:8788" playwright.config.ts
# Expected: Shows baseURL and webServer.url lines
```

#### Questions to Ask

1. **Why 127.0.0.1 instead of localhost?**
   - Answer: Node.js 20+ can resolve localhost to IPv6, causing race conditions

2. **Why pnpm preview instead of direct wrangler command?**
   - Answer: Reuses script from package.json, ensures build step runs

3. **Why wasn't timeout changed in this commit?**
   - Answer: Atomic commits - timeout is separate concern (Commit 4)

#### Approval Criteria

- ✅ **APPROVED** if:
  - Uses 127.0.0.1:8788 for both URLs
  - Command is `pnpm preview`
  - No unintended changes
  - Comments are clear

- 🔧 **CHANGES REQUESTED** if:
  - Uses `localhost` instead of `127.0.0.1`
  - Port mismatch (not 8788)
  - Missing comments
  - Unintended changes to other config

- ❌ **REJECTED** if:
  - Uses IPv6 (::1)
  - Wrong port
  - Breaks existing config

---

### Commit 4: Add global setup hook and extend timeout

**Type**: 🔧 config
**Files**: `playwright.config.ts` (1 file modified)
**Size**: ~4 lines changed
**Review Duration**: 15 minutes

#### Review Checklist

##### Global Setup Configuration

- [ ] **Property added**: `globalSetup: require.resolve('./tests/global-setup')`
- [ ] **Location**: At top level of config object (not inside `use` or `webServer`)
- [ ] **Path correct**: `'./tests/global-setup'` (relative path)
- [ ] **File exists**: `tests/global-setup.ts` exists (from Commit 2)

##### Timeout Configuration

- [ ] **Property added**: `timeout: 120 * 1000` inside `webServer` object
- [ ] **Value**: 120000 milliseconds (120 seconds)
- [ ] **Reasonable**: Not too low (<60s) or too high (>180s)
- [ ] **Comment**: Explains it's for OpenNext cold start + wrangler

##### CI Configuration Preserved

- [ ] **workers config**: `workers: process.env.CI ? 1 : undefined` still present
- [ ] **Comment**: Explains sequential execution in CI for stability
- [ ] **Logic correct**: Uses 1 worker in CI, undefined (default) locally

##### No Unintended Changes

- [ ] **baseURL**: Unchanged from Commit 3
- [ ] **webServer.url**: Unchanged from Commit 3
- [ ] **webServer.command**: Unchanged from Commit 3
- [ ] **Other config**: Unchanged

##### Code Quality

- [ ] **TypeScript syntax**: Valid
- [ ] **Comma placement**: Correct
- [ ] **Formatting**: Matches project style

#### Technical Validation

```bash
# As reviewer, test the config
git checkout [commit-4-hash]

# Verify globalSetup file is found
node -e "console.log(require.resolve('./tests/global-setup'))"
# Expected: Prints path to tests/global-setup.ts

# Validate Playwright config
pnpm exec playwright --version
# Expected: No errors

# TypeScript check
pnpm exec tsc --noEmit playwright.config.ts
# Expected: No errors

# Verify config changes
grep "globalSetup" playwright.config.ts
# Expected: Shows globalSetup line

grep "timeout.*120" playwright.config.ts
# Expected: Shows timeout in webServer section
```

#### Questions to Ask

1. **Why 120 seconds for timeout?**
   - Answer: OpenNext build + wrangler startup can take 60-90s on slow machines

2. **Why use require.resolve?**
   - Answer: Ensures Playwright can find the file regardless of working directory

3. **Why sequential workers in CI?**
   - Answer: GitHub Actions runners (2 vCPU) struggle with parallel browser tests + wrangler

#### Approval Criteria

- ✅ **APPROVED** if:
  - globalSetup correctly configured
  - Timeout is 120s (120000ms)
  - No unintended changes
  - Comments explain rationale

- 🔧 **CHANGES REQUESTED** if:
  - Incorrect globalSetup path
  - Timeout too low or too high
  - Missing comments

- ❌ **REJECTED** if:
  - globalSetup file doesn't exist
  - Timeout breaks tests
  - Removes CI workers config

---

### Commit 5: Validate E2E tests run against wrangler

**Type**: ✅ test
**Files**: None (validation only)
**Review Duration**: 10 minutes

**Note**: This commit is conceptual - no code changes. Validation happens during implementation and should be documented in PR description or commit message notes.

#### Review Checklist

##### Test Execution

- [ ] **All tests run**: Developer ran `pnpm test:e2e`
- [ ] **All tests pass**: 3 tests pass (compression, middleware, i18n-edge-cases)
- [ ] **No failures**: Zero test failures
- [ ] **No timeouts**: Tests complete within time limit

##### Global Setup Execution

- [ ] **Logs visible**: Global setup logs appear in output
- [ ] **Migrations applied**: Logs show migrations applied
- [ ] **Seeds executed**: Logs show categories and articles seeded
- [ ] **Success message**: Logs show "✅ Base de données D1 initialisée avec succès"

##### Wrangler Startup

- [ ] **Wrangler starts**: Logs show wrangler starting
- [ ] **IPv4 confirmed**: Logs show `127.0.0.1:8788` (NOT localhost)
- [ ] **Ready message**: Logs show `[wrangler:inf] Ready on http://127.0.0.1:8788`
- [ ] **No errors**: No binding errors or startup failures

##### Stability

- [ ] **Multiple runs**: Developer ran tests 2-3 times
- [ ] **Consistent results**: Same results each time
- [ ] **No flakiness**: No intermittent passes/failures
- [ ] **Reasonable timing**: Total time < 5 minutes

##### Documentation

- [ ] **PR description**: Includes validation summary
- [ ] **Metrics reported**: Timing, test counts documented
- [ ] **Issues noted**: Any issues found are documented

#### Technical Validation

```bash
# As reviewer, run tests yourself
git checkout [commit-5-hash] # Or final commit of PR

# Clean build
rm -rf .next .open-next node_modules/.cache
pnpm run build

# Run E2E tests
pnpm test:e2e

# Check output for critical markers:
# ✅ Global setup logs
# ✅ Wrangler starts on 127.0.0.1:8788
# ✅ All tests pass
# ✅ No errors

# Run again for stability check
pnpm test:e2e
# Expected: Same results
```

#### Questions to Ask

1. **Did any tests fail during implementation?**
   - If yes: Were they fixed? What was the root cause?

2. **How long did tests take to run?**
   - Expected: <5 minutes total

3. **Were there any timeout issues?**
   - If yes: Was timeout increased further?

4. **Any flaky tests observed?**
   - If yes: Were they debugged and resolved?

#### Approval Criteria

- ✅ **APPROVED** if:
  - All tests pass consistently
  - Global setup works correctly
  - Wrangler starts on 127.0.0.1:8788
  - No flakiness

- 🔧 **CHANGES REQUESTED** if:
  - Tests pass but are flaky
  - Timing is excessive (>10 min)
  - Minor issues need addressing

- ❌ **REJECTED** if:
  - Tests fail
  - Global setup doesn't work
  - Wrangler doesn't start
  - Major stability issues

---

## ✅ Global Validation

After reviewing all commits:

### Architecture & Design

- [ ] **Atomic commits**: Each commit is focused and independent
- [ ] **Logical order**: Commits build on each other correctly
- [ ] **No coupling**: Changes are appropriately separated
- [ ] **Follows spec**: Matches STORY_E2E_CLOUDFLARE_REFACTOR.md Phase 1

### Configuration Quality

- [ ] **IPv4 everywhere**: 127.0.0.1 used consistently
- [ ] **Port consistency**: 8788 used in both package.json and playwright.config.ts
- [ ] **D1 safety**: All wrangler commands use --local flag
- [ ] **Error handling**: Robust error handling in global-setup

### Testing

- [ ] **All E2E tests pass**: 100% pass rate
- [ ] **Stable**: No flaky tests
- [ ] **Fast enough**: < 5 minutes locally
- [ ] **Proper runtime**: Tests run against workerd, not Node.js

### Type Safety

- [ ] **TypeScript compiles**: No TypeScript errors
- [ ] **Type annotations**: global-setup.ts properly typed
- [ ] **No type shortcuts**: No unnecessary `any` types

### Code Quality

- [ ] **Consistent style**: Matches project code style
- [ ] **Clear naming**: Variables and functions well-named
- [ ] **Appropriate comments**: Explains why, not what
- [ ] **No dead code**: No commented code or unused imports

### Documentation

- [ ] **Commit messages**: Follow Gitmoji convention
- [ ] **Comments**: Code is well-commented where needed
- [ ] **PR description**: Clear summary of changes
- [ ] **Rationale**: Why decisions were made is documented

---

## 📝 Feedback Template

Use this template for feedback:

```markdown
## Review Feedback - Phase 1 Configuration Locale

**Reviewer**: [Your Name]
**Date**: [Date]
**Commits Reviewed**: All (1-5)

### ✅ Strengths

- [What was done well]
- Example: "Excellent use of IPv4 forcing - will prevent race conditions"
- Example: "Global setup error handling is robust"

### 🔧 Required Changes

**Commit 2 - Global Setup**
- **Issue**: Missing `--local` flag on line X
  - **Why**: Would target production database
  - **Suggestion**: Add `--local` to command

**Commit 3 - URLs**
- **Issue**: Comment could be more descriptive
  - **Why**: Future developers may not understand IPv4 rationale
  - **Suggestion**: Expand comment to explain Node.js 20+ localhost resolution

[Repeat for each required change]

### 💡 Suggestions (Optional)

- Consider adding retry logic to global-setup if transient failures occur
- Could extract D1 commands to constants for reusability

### 📊 Verdict

- [x] ✅ **APPROVED** - Ready to merge
- [ ] 🔧 **CHANGES REQUESTED** - Needs fixes above
- [ ] ❌ **REJECTED** - Major rework needed

### Next Steps

Approved - please merge to main and begin Phase 2 (Stabilization).

---

**Additional Notes**:
[Any other observations or context]
```

---

## 🎯 Review Actions

### If Approved ✅

1. Add approval comment on PR
2. Merge commits to main
3. Update phase status in INDEX.md to ✅ COMPLETED
4. Tag release: `git tag phase-1-complete`
5. Archive review notes

### If Changes Requested 🔧

1. Create detailed feedback using template
2. Add review comments inline on code
3. Discuss with developer if clarification needed
4. Re-review after fixes are pushed

### If Rejected ❌

1. Document all major issues
2. Schedule discussion with developer
3. Plan rework strategy
4. Identify root cause (spec misunderstanding? technical blocker?)

---

## ❓ FAQ

**Q: Should I approve if there are minor style issues?**
A: Yes, approve with optional suggestions. Don't block on minor style.

**Q: What if tests pass locally but I'm concerned about CI?**
A: Request validation that tests pass in CI (or Phase 3 will catch it).

**Q: How detailed should feedback be?**
A: Specific enough to be actionable - include file, line, and clear suggestion.

**Q: Can I suggest improvements beyond the spec?**
A: Yes, as optional suggestions. Don't require changes outside spec scope.

**Q: What if I disagree with an implementation choice?**
A: Discuss with developer. If it meets requirements and works, it may be valid alternative.

---

## 🔗 Related Documents

- [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md) - Understand the atomic commit strategy
- [COMMIT_CHECKLIST.md](../COMMIT_CHECKLIST.md) - Detailed implementation checklist
- [TESTING.md](./TESTING.md) - Testing strategy and validation
- [validation/VALIDATION_CHECKLIST.md](../validation/VALIDATION_CHECKLIST.md) - Final validation

---

**Happy reviewing! Your feedback ensures quality and helps the team learn. 🎉**
