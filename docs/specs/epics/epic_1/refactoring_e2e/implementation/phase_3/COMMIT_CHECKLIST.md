# Phase 3 - Checklist per Commit

This document provides a detailed checklist for each atomic commit of Phase 3.

---

## 📋 Commit 1: Configure GitHub Secrets (Documentation)

**Files**:

- `docs/specs/epics/epic_1/refactoring_e2e/implementation/phase_3/ENVIRONMENT_SETUP.md`
- `docs/specs/epics/epic_1/refactoring_e2e/CI_SECRETS_SETUP.md` (new)

**Estimated Duration**: 30-45 minutes

### Implementation Tasks

#### Create CI_SECRETS_SETUP.md

- [ ] Create new file `docs/specs/epics/epic_1/refactoring_e2e/CI_SECRETS_SETUP.md`
- [ ] Add title and overview section
- [ ] Document how to generate Cloudflare API Token:
  - [ ] Navigate to Cloudflare Dashboard → My Profile → API Tokens
  - [ ] Click "Create Token"
  - [ ] Required permissions: `Workers Scripts:Edit`, `D1:Edit`, `Account Settings:Read`
  - [ ] Describe token scope and expiration settings
- [ ] Document how to find Cloudflare Account ID:
  - [ ] Navigate to Cloudflare Dashboard → Workers & Pages → Overview
  - [ ] Copy Account ID (hexadecimal string)
- [ ] Add step-by-step guide for adding secrets to GitHub:
  - [ ] Go to Repository Settings → Secrets and variables → Actions
  - [ ] Click "New repository secret"
  - [ ] Add `CLOUDFLARE_API_TOKEN` with the generated token value
  - [ ] Add `CLOUDFLARE_ACCOUNT_ID` with the account ID
- [ ] Add verification section:
  - [ ] How to verify secrets are configured (check Settings page)
  - [ ] How to verify secrets are masked in workflow logs
- [ ] Add troubleshooting section with common issues

#### Update ENVIRONMENT_SETUP.md

- [ ] Open `docs/specs/epics/epic_1/refactoring_e2e/implementation/phase_3/ENVIRONMENT_SETUP.md`
- [ ] Add reference to CI_SECRETS_SETUP.md
- [ ] Document prerequisites for secret configuration

### Manual Action (Requires Admin)

**IMPORTANT**: After documenting, an administrator must configure the actual secrets:

```bash
# This is done via GitHub UI, not command line:
# 1. Navigate to: https://github.com/[org]/[repo]/settings/secrets/actions
# 2. Click "New repository secret"
# 3. Name: CLOUDFLARE_API_TOKEN, Value: [token from Cloudflare Dashboard]
# 4. Click "Add secret"
# 5. Click "New repository secret"
# 6. Name: CLOUDFLARE_ACCOUNT_ID, Value: [account ID from Cloudflare Dashboard]
# 7. Click "Add secret"
```

- [ ] Verify secrets are added (names appear in list, values are hidden)
- [ ] Note secret creation date in documentation

### Validation

```bash
# Verify documentation files exist
ls -la docs/specs/epics/epic_1/refactoring_e2e/CI_SECRETS_SETUP.md
ls -la docs/specs/epics/epic_1/refactoring_e2e/implementation/phase_3/ENVIRONMENT_SETUP.md

# Check for placeholders or TODOs
grep -E '\[TODO\]|\[PLACEHOLDER\]' docs/specs/epics/epic_1/refactoring_e2e/CI_SECRETS_SETUP.md
# (should return nothing)
```

**Expected Result**: Complete documentation for secret setup, secrets configured in GitHub

### Review Checklist

#### Documentation Quality

- [ ] CI_SECRETS_SETUP.md is clear and actionable
- [ ] All steps numbered and easy to follow
- [ ] Screenshots or detailed descriptions provided
- [ ] Permissions for API token clearly listed
- [ ] Troubleshooting covers common errors
- [ ] Links to Cloudflare Dashboard work

#### Secret Configuration

- [ ] CLOUDFLARE_API_TOKEN secret exists in GitHub
- [ ] CLOUDFLARE_ACCOUNT_ID secret exists in GitHub
- [ ] Secrets show as masked (••••••••) in logs
- [ ] No secrets committed to code

#### Code Quality

- [ ] No markdown formatting errors
- [ ] All links verified
- [ ] No typos or unclear instructions
- [ ] Consistent formatting throughout

### Commit Message

```bash
git add docs/specs/epics/epic_1/refactoring_e2e/CI_SECRETS_SETUP.md
git add docs/specs/epics/epic_1/refactoring_e2e/implementation/phase_3/ENVIRONMENT_SETUP.md
git commit -m "docs(ci): document GitHub Secrets setup for Cloudflare

- Add step-by-step guide for creating API token
- Document required permissions (Workers:Edit, D1:Edit, Account:Read)
- Include troubleshooting section for common errors
- Update ENVIRONMENT_SETUP.md with secret references

Part of Phase 3 - Commit 1/4"
```

---

## 📋 Commit 2: Update CI Workflow Configuration

**Files**:

- `.github/workflows/quality.yml` (modified)

**Estimated Duration**: 45-60 minutes

### Implementation Tasks

#### Read Current Workflow

- [ ] Open `.github/workflows/quality.yml`
- [ ] Locate the `e2e-tests` job (currently disabled or commented)
- [ ] Note current configuration values for comparison

#### Modify e2e-tests Job

- [ ] Update `timeout-minutes` from `30` to `60`
- [ ] Add `env` section with Cloudflare secrets:
  ```yaml
  env:
    CI: true
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
  ```

#### Update Steps

- [ ] Verify "Install Playwright Browsers" step uses `--with-deps`:

  ```yaml
  - name: Install Playwright Browsers
    run: pnpm exec playwright install --with-deps
  ```

- [ ] Add new step before "Run E2E Tests":

  ```yaml
  - name: Build OpenNext Worker
    run: pnpm run build && pnpm exec opennextjs-cloudflare build
  ```

- [ ] Enable/update "Run E2E Tests" step:

  ```yaml
  - name: Run E2E Tests
    run: pnpm test:e2e
  ```

- [ ] Add artifact upload step:
  ```yaml
  - name: Upload Playwright Report
    if: always()
    uses: actions/upload-artifact@v4
    with:
      name: playwright-report
      path: playwright-report/
      retention-days: 30
  ```

#### Remove Disable Comments

- [ ] Remove or update any comments indicating E2E tests are disabled
- [ ] Add comment explaining new Cloudflare Workers runtime setup

### Validation

```bash
# Validate YAML syntax
yamllint .github/workflows/quality.yml

# Or use GitHub Actions YAML schema validator
# Or commit to a test branch and check for syntax errors
```

**Expected Result**: Valid YAML workflow with all Phase 3 changes

### Review Checklist

#### Configuration Changes

- [ ] Timeout increased to 60 minutes
- [ ] Environment variables reference correct secret names
- [ ] Secret syntax correct: `${{ secrets.SECRET_NAME }}`
- [ ] Build OpenNext Worker step added
- [ ] Playwright install includes `--with-deps`

#### Artifact Upload

- [ ] Upload step has `if: always()` (runs even on failure)
- [ ] Uses `actions/upload-artifact@v4` (latest major version)
- [ ] Artifact name is descriptive: `playwright-report`
- [ ] Path is correct: `playwright-report/`
- [ ] Retention set to 30 days

#### Code Quality

- [ ] YAML indentation is correct (2 spaces)
- [ ] No syntax errors
- [ ] Comments are clear and helpful
- [ ] Consistent style with rest of workflow

### Commit Message

```bash
git add .github/workflows/quality.yml
git commit -m "ci(e2e): reactivate E2E tests with Cloudflare Workers runtime

- Increase timeout to 60 minutes for cold start
- Add CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID env vars
- Add explicit OpenNext build step before tests
- Enable Playwright report upload on failure
- Use --with-deps for browser installation

Resolves timeouts from disabled E2E tests in CI

Part of Phase 3 - Commit 2/4"
```

---

## 📋 Commit 3: Test CI Integration (Test PR)

**Files**: None (testing only)

**Estimated Duration**: 1-2 hours (includes CI wait time)

### Implementation Tasks

#### Create Test Branch

- [ ] Ensure all changes from Commits 1-2 are committed
- [ ] Create test branch:
  ```bash
  git checkout -b test/e2e-ci-integration
  ```
- [ ] Verify git status is clean
- [ ] Review commit history:
  ```bash
  git log --oneline -10
  ```

#### Push and Monitor

- [ ] Push branch to GitHub:
  ```bash
  git push origin test/e2e-ci-integration
  ```
- [ ] Navigate to GitHub Actions tab
- [ ] Watch for workflow run to start
- [ ] Monitor "e2e-tests" job in real-time

#### Monitor Critical Steps

Watch for these in the logs:

- [ ] "Install dependencies" completes successfully
- [ ] "Install Playwright Browsers" with `--with-deps` completes
- [ ] "Build OpenNext Worker" succeeds (check for errors)
- [ ] "Run E2E Tests" starts
- [ ] Look for "Ready on http://127.0.0.1:8788" in server startup logs
- [ ] All 3 test suites run:
  - [ ] `tests/compression.spec.ts` passes
  - [ ] `tests/middleware.spec.ts` passes
  - [ ] `tests/i18n-edge-cases.spec.ts` passes
- [ ] "Upload Playwright Report" runs (even if tests pass)

#### Handle Failures (If Any)

If tests fail:

- [ ] Wait for "Upload Playwright Report" to complete
- [ ] Download artifact "playwright-report" from GitHub Actions
- [ ] Extract and open `playwright-report/index.html`
- [ ] Analyze failures:
  - [ ] Check screenshots for visual errors
  - [ ] Check traces for detailed execution
  - [ ] Check console logs for errors
- [ ] Document failure cause
- [ ] Apply fixes
- [ ] Push fixes to test branch
- [ ] Re-monitor CI

#### Verify Success Metrics

Once CI passes:

- [ ] Total job duration < 15 minutes (goal)
- [ ] No timeout errors
- [ ] All tests green (no failures or flakes)
- [ ] Build OpenNext step < 5 minutes
- [ ] Wrangler starts successfully
- [ ] Artifacts uploaded successfully

#### Confirm Stability

- [ ] Re-run workflow manually (GitHub UI: "Re-run jobs")
- [ ] Verify tests pass again (no flakiness)
- [ ] Optional: Run a third time to be certain

### Validation

```bash
# Verify CI status
# (done via GitHub UI - no command)

# Verify test branch is pushed
git ls-remote origin test/e2e-ci-integration
# (should show remote branch)
```

**Expected Result**: CI passes reliably with all tests green

### Review Checklist

#### CI Job Success

- [ ] Job status: ✅ Success (green checkmark)
- [ ] No timeout errors in any step
- [ ] All tests passed (0 failed)
- [ ] No skipped tests

#### Performance

- [ ] Total job duration < 15 minutes (target)
- [ ] Build OpenNext Worker < 5 minutes
- [ ] Test execution < 10 minutes
- [ ] No hanging processes

#### Logs Validation

- [ ] Wrangler logs show "Ready on http://127.0.0.1:8788"
- [ ] Playwright logs show all tests passing
- [ ] No error messages in logs
- [ ] Secrets are masked in logs (show as \*\*\*)

#### Artifact Verification

- [ ] Playwright report artifact uploaded
- [ ] Artifact size reasonable (~5-50 MB)
- [ ] Can download and view report
- [ ] Report shows all tests passed

### Commit Message

This commit has no code changes, but document the test results:

```bash
# If test branch will be merged directly, add a commit with test results
git commit --allow-empty -m "test(ci): validate E2E tests in GitHub Actions

- Created test branch test/e2e-ci-integration
- Triggered CI workflow and monitored execution
- Verified all tests pass: compression, middleware, i18n
- Confirmed no timeout issues
- Total duration: [X] minutes
- Artifact uploaded successfully

CI Success Metrics:
- Job duration: [X]m [X]s
- Build step: [X]m [X]s
- Test execution: [X]m [X]s
- Tests passed: 15/15 (100%)
- Flakiness: 0 (stable across multiple runs)

Part of Phase 3 - Commit 3/4"

# Or if creating a PR, document results in PR description
```

---

## 📋 Commit 4: Finalize Documentation

**Files**:

- `docs/specs/epics/epic_1/refactoring_e2e/implementation/phase_3/guides/TESTING.md`
- `docs/specs/epics/epic_1/refactoring_e2e/STORY_E2E_CLOUDFLARE_REFACTOR.md`
- `CLAUDE.md`
- `README.md` (optional)

**Estimated Duration**: 30-45 minutes

### Implementation Tasks

#### Update TESTING.md

- [ ] Open `guides/TESTING.md`
- [ ] Add new section: "CI Testing and Debugging"
- [ ] Document how to access GitHub Actions:
  - [ ] Navigate to Actions tab
  - [ ] Find workflow run
  - [ ] Click on "e2e-tests" job
- [ ] Document how to download Playwright reports:
  - [ ] Scroll to bottom of workflow run
  - [ ] Click "Artifacts"
  - [ ] Download "playwright-report"
  - [ ] Extract and open index.html
- [ ] Add common CI failure patterns:
  - [ ] Timeout during build: increase timeout, check build logs
  - [ ] Wrangler fails to start: check secrets, verify wrangler.jsonc
  - [ ] Tests fail in CI but pass locally: environment differences, check uploaded report
  - [ ] Flaky tests: IPv6/IPv4 issues, resource constraints
- [ ] Add debugging commands for CI:

  ```bash
  # Download artifact and view report
  unzip playwright-report.zip
  open playwright-report/index.html

  # Check workflow logs
  # (GitHub CLI)
  gh run list
  gh run view [run-id] --log
  ```

#### Update Story Document

- [ ] Open `docs/specs/epics/epic_1/refactoring_e2e/STORY_E2E_CLOUDFLARE_REFACTOR.md`
- [ ] Find Phase 3 section
- [ ] Update status to "✅ COMPLETED"
- [ ] Add completion date
- [ ] Add notes on any deviations or lessons learned

#### Update CLAUDE.md

- [ ] Open `CLAUDE.md`
- [ ] Find Testing section
- [ ] Update to reflect active E2E tests in CI:

  ```markdown
  ### Testing

  - `pnpm test` - Run Vitest unit tests
  - `pnpm test:ui` - Run Vitest with UI
  - `pnpm test:coverage` - Generate test coverage report
  - `pnpm test:watch` - Run tests in watch mode
  - `pnpm test:e2e` - Run Playwright E2E tests (runs against Cloudflare Workers runtime)
  - `pnpm test:e2e:ui` - Run Playwright with UI
  - `pnpm test:e2e:debug` - Debug Playwright tests

  **E2E Tests in CI**: E2E tests run automatically on all PRs and commits to main.
  Tests execute against Cloudflare Workers runtime (wrangler dev) to validate
  production-like behavior. See `/docs/specs/epics/epic_1/refactoring_e2e/` for details.
  ```

#### Optional: Update README

- [ ] Open `README.md` (if it exists)
- [ ] Add CI status badge (if desired):
  ```markdown
  ![CI Status](https://github.com/[org]/[repo]/actions/workflows/quality.yml/badge.svg)
  ```

### Validation

```bash
# Verify all documentation files updated
git status

# Check for broken links in updated docs
grep -r "](../" docs/specs/epics/epic_1/refactoring_e2e/implementation/phase_3/guides/TESTING.md
# (manually verify each link)

# Ensure no TODOs or placeholders remain
grep -rE '\[TODO\]|\[PLACEHOLDER\]' docs/specs/epics/epic_1/refactoring_e2e/implementation/phase_3/
# (should return nothing)
```

**Expected Result**: Complete, accurate documentation for CI testing

### Review Checklist

#### TESTING.md Updates

- [ ] CI debugging section added
- [ ] Clear instructions for downloading reports
- [ ] Common failure patterns documented
- [ ] Solutions provided for each failure pattern
- [ ] Commands are accurate and tested

#### Story Document Updates

- [ ] Phase 3 marked as completed
- [ ] Completion date added
- [ ] Any deviations documented
- [ ] Lessons learned captured

#### CLAUDE.md Updates

- [ ] E2E testing section updated
- [ ] CI information added
- [ ] Reference to story document included
- [ ] Accurate command examples

#### Code Quality

- [ ] No broken links
- [ ] No placeholders or TODOs
- [ ] Consistent formatting
- [ ] All commands verified to work

### Commit Message

```bash
git add docs/specs/epics/epic_1/refactoring_e2e/implementation/phase_3/guides/TESTING.md
git add docs/specs/epics/epic_1/refactoring_e2e/STORY_E2E_CLOUDFLARE_REFACTOR.md
git add CLAUDE.md
# Optional:
# git add README.md

git commit -m "docs(e2e): finalize Phase 3 documentation

- Add CI debugging procedures to TESTING.md
- Document how to download and analyze Playwright reports
- Update story document status to Phase 3 complete
- Update CLAUDE.md with active E2E CI reference
- Document common CI failure patterns and solutions

Completes Phase 3: E2E tests now active and stable in CI

Part of Phase 3 - Commit 4/4"
```

---

## ✅ Final Phase Validation

After all 4 commits:

### Complete Phase Checklist

- [ ] All 4 commits completed
- [ ] GitHub Secrets configured (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)
- [ ] CI workflow updated in `.github/workflows/quality.yml`
- [ ] CI job passes successfully
- [ ] Tests run on every PR automatically
- [ ] Playwright reports upload on failure
- [ ] Documentation complete and accurate
- [ ] No broken links or placeholders

### Final Validation Commands

```bash
# Verify git history
git log --oneline -5
# Should show 4 commits from Phase 3

# Verify CI workflow syntax
yamllint .github/workflows/quality.yml
# Should pass with no errors

# Verify documentation completeness
ls -la docs/specs/epics/epic_1/refactoring_e2e/implementation/phase_3/
# Should show all 7 files

# Optional: Trigger CI manually to confirm
gh workflow run quality.yml
```

### Success Criteria

- [ ] ✅ CI job "e2e-tests" exists and is enabled
- [ ] ✅ Job runs on every push and PR
- [ ] ✅ All 3 test suites pass (compression, middleware, i18n)
- [ ] ✅ Job duration < 15 minutes
- [ ] ✅ No timeout issues
- [ ] ✅ Artifacts upload successfully
- [ ] ✅ Documentation provides clear debugging guidance

**Phase 3 is complete when all checkboxes are checked! 🎉**

---

## 🚀 Next Steps After Phase 3

1. **Monitor CI Stability**: Watch for any failures over next few PRs
2. **Phase 4** (if planned): Documentation and training for team
3. **Continuous Improvement**: Optimize CI performance if needed
4. **Expand Coverage**: Add more E2E test suites as features grow

**Congratulations on completing Phase 3! E2E tests are now protecting production! 🎊**
