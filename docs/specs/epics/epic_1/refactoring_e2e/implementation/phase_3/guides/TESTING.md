# Phase 3 - Testing Guide

Complete testing strategy for Phase 3 (CI Integration).

---

## 🎯 Testing Strategy

Phase 3 focuses on **CI integration testing** - validating that E2E tests run successfully in GitHub Actions using the Cloudflare Workers runtime.

**Testing Layers**:

1. **Local Validation**: Verify all Phase 1-2 work before CI (prerequisite)
2. **CI Workflow Validation**: Test GitHub Actions workflow configuration
3. **CI Execution Testing**: Monitor actual CI runs
4. **Stability Testing**: Confirm tests pass consistently (no flakiness)

**Target Success Rate**: >95% CI runs pass
**Target Duration**: <15 minutes per CI job

---

## 🧪 Local Validation (Prerequisite)

Before testing Phase 3 in CI, ensure local setup works perfectly.

### Running Local E2E Tests

```bash
# Run all E2E tests locally
pnpm test:e2e

# Run specific test file
pnpm test:e2e tests/compression.spec.ts

# Run in UI mode (visual debugging)
pnpm test:e2e:ui

# Run in debug mode (with breakpoints)
pnpm test:e2e:debug
```

### Expected Results (Local)

```
Running 15 tests using 4 workers

✓ tests/compression.spec.ts:12:5 › should serve Brotli compressed responses (chromium)
✓ tests/compression.spec.ts:12:5 › should serve Brotli compressed responses (firefox)
✓ tests/compression.spec.ts:12:5 › should serve Brotli compressed responses (webkit)
✓ tests/middleware.spec.ts:8:5 › should redirect /fr to /fr/ (chromium)
✓ tests/middleware.spec.ts:8:5 › should redirect /fr to /fr/ (firefox)
✓ tests/middleware.spec.ts:8:5 › should redirect /fr to /fr/ (webkit)
... (more tests)

15 passed (2.3m)
```

**All tests must pass locally before proceeding to CI testing!**

---

## 🔗 CI Workflow Validation

### Validating YAML Syntax

```bash
# Validate workflow file syntax
yamllint .github/workflows/quality.yml

# Expected: No errors

# Alternative: Use GitHub Actions extension in VSCode
# Or commit to test branch and check GitHub UI for syntax errors
```

### Validating Secrets Configuration

**Manual Check** (requires admin access):

1. Navigate to: `https://github.com/[org]/[repo]/settings/secrets/actions`
2. Verify secrets exist:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. Verify values are masked (show as ••••••••)

**Cannot be tested locally** - secrets only work in CI environment.

---

## 🎭 CI Execution Testing

### Accessing GitHub Actions

1. Navigate to your GitHub repository
2. Click on the **"Actions"** tab
3. View list of workflow runs

### Triggering CI Workflow

**Option A: Push to test branch**

```bash
# Create test branch (Commit 3)
git checkout -b test/e2e-ci-integration

# Push to trigger workflow
git push origin test/e2e-ci-integration

# CI workflow triggers automatically
```

**Option B: Manual workflow trigger** (if enabled)

1. Go to Actions tab
2. Select "Quality" workflow
3. Click "Run workflow"
4. Select branch and run

### Monitoring CI Execution

#### Viewing Workflow Run

1. Click on the workflow run in the Actions tab
2. View overall status (queued → in progress → completed)
3. Click on **"e2e-tests"** job to view details

#### Watching Real-Time Logs

1. Open the "e2e-tests" job
2. Logs stream in real-time as job executes
3. Watch for critical indicators:
   - ✅ "Install dependencies" completes
   - ✅ "Build OpenNext Worker" succeeds
   - ✅ "Run E2E Tests" starts
   - ✅ Look for: `Ready on http://127.0.0.1:8788`
   - ✅ All test suites pass

#### Key Log Indicators

**Success Indicators**:
```
✓ [install] Installing dependencies...
✓ [build] Build completed in 23.4s
✓ [wrangler] Ready on http://127.0.0.1:8788
✓ [playwright] 15 passed (8.7m)
✓ [artifact] Uploading playwright-report...
```

**Failure Indicators**:
```
✗ Authentication error (check secrets)
✗ Build failed (check OpenNext build logs)
✗ Timeout waiting for server (increase timeout or investigate wrangler)
✗ Test failed (check Playwright report artifact)
```

---

## 📊 Downloading and Analyzing Playwright Reports

### When CI Tests Fail

If tests fail in CI, GitHub Actions automatically uploads a Playwright report artifact.

### Downloading the Artifact

**Method 1: GitHub UI**

1. Navigate to the failed workflow run
2. Scroll to the bottom of the page
3. Find **"Artifacts"** section
4. Click **"playwright-report"** to download

**Method 2: GitHub CLI**

```bash
# List recent runs
gh run list --workflow=quality.yml --limit 10

# Find the run ID of the failed run
# Then download artifact:
gh run download [run-id] -n playwright-report

# Artifact downloads to ./playwright-report/
```

### Viewing the Report

```bash
# Extract artifact (if zipped)
unzip playwright-report.zip -d playwright-report

# Open HTML report
open playwright-report/index.html
# Or on Linux:
xdg-open playwright-report/index.html
# Or on Windows:
start playwright-report/index.html
```

### Analyzing Failures

The Playwright HTML report includes:

1. **Test Results Summary**
   - Total tests, passed, failed, skipped
   - Duration of test run

2. **Failed Test Details**
   - Click on failed test to view:
     - Error message and stack trace
     - Screenshots (if test failed visually)
     - Video recording (if configured)
     - Trace viewer (step-by-step execution)

3. **Trace Viewer** (most powerful debugging tool)
   - Click "Trace" link on failed test
   - Shows timeline of:
     - Actions performed
     - Network requests
     - Console logs
     - Screenshots at each step
     - DOM snapshots

### Common Failure Patterns

See "CI Testing and Debugging" section below.

---

## 🐛 CI Testing and Debugging

### Common CI Failure Patterns

#### Issue 1: Timeout During Build

**Symptoms**:
```
Error: The operation was canceled.
Step: Build OpenNext Worker
Duration: > 10 minutes
```

**Solutions**:

1. **Increase build step timeout** (if not set):
   ```yaml
   - name: Build OpenNext Worker
     timeout-minutes: 10  # Add this
     run: pnpm run build && pnpm exec opennextjs-cloudflare build
   ```

2. **Check build logs** for hanging processes:
   - Look for network timeouts
   - Check for missing dependencies
   - Verify npm/pnpm registry is accessible

3. **Optimize build**:
   - Add dependency caching
   - Use `pnpm install --frozen-lockfile` (already done)

**Verify Fix**:
Re-run workflow and check build completes in <5 minutes.

---

#### Issue 2: Wrangler Fails to Start

**Symptoms**:
```
Error: Authentication error
Error: Failed to start wrangler
Error: Timed out waiting for http://127.0.0.1:8788
```

**Solutions**:

1. **Check Secrets Configuration**:
   - Verify `CLOUDFLARE_API_TOKEN` exists in GitHub Secrets
   - Verify `CLOUDFLARE_ACCOUNT_ID` exists in GitHub Secrets
   - Check for typos in secret names (case-sensitive)
   - Ensure workflow references secrets correctly:
     ```yaml
     env:
       CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
       CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
     ```

2. **Verify wrangler.jsonc**:
   - Check `account_id` in wrangler.jsonc matches secret
   - Verify bindings are correct (D1, R2, etc.)

3. **Check API Token Permissions**:
   - Token must have: Account Settings: Read (minimum)
   - Recommended: Workers Scripts: Edit, D1: Edit

**Verify Fix**:
Check logs for `Ready on http://127.0.0.1:8788`.

---

#### Issue 3: Tests Fail in CI But Pass Locally

**Symptoms**:
```
✓ [local] All tests pass
✗ [CI] Tests fail with errors
```

**Solutions**:

1. **Download Playwright Report** (see section above)
2. **Analyze differences**:
   - Check for timing differences (CI may be slower)
   - Check for resource constraints (memory, CPU)
   - Look for environment-specific issues

3. **Common causes**:
   - **IPv6/IPv4 issues**: Ensure `--ip 127.0.0.1` in wrangler command
   - **Test data**: Verify D1 seeding works in CI (check globalSetup logs)
   - **Timing**: Add longer timeouts for CI environment
   - **Browsers**: Ensure `--with-deps` flag in Playwright install

4. **Compare logs**:
   - Local logs vs CI logs
   - Look for missing services or failed steps

**Verify Fix**:
Run tests in CI and confirm all pass.

---

#### Issue 4: Flaky Tests (Intermittent Failures)

**Symptoms**:
```
Run 1: ✓ All pass
Run 2: ✗ Some fail
Run 3: ✓ All pass
```

**Solutions**:

1. **Identify flaky tests**:
   - Run CI multiple times (3-5 times)
   - Note which tests fail intermittently

2. **Common causes**:
   - **Race conditions**: Tests depend on timing
   - **IPv6/IPv4 resolution**: Node.js 20+ localhost resolution issues
   - **Resource exhaustion**: CI runner out of memory/CPU
   - **Network issues**: External services timing out

3. **Fixes**:
   - **Use explicit waits** in tests (not arbitrary timeouts)
   - **Force IPv4**: Ensure `--ip 127.0.0.1` in wrangler command
   - **Reduce parallelism**: Set `workers: 1` in playwright.config.ts CI mode
   - **Add retries**: Use `retries: 2` in playwright.config.ts for CI

4. **Debug specific test**:
   ```bash
   # Run single test multiple times locally
   for i in {1..10}; do pnpm test:e2e tests/[flaky-test].spec.ts; done
   ```

**Verify Fix**:
Run CI 5 times consecutively - all should pass.

---

#### Issue 5: Secrets Visible in Logs

**Symptoms**:
```
[CI logs] CLOUDFLARE_API_TOKEN=abc123...
```

**⚠️ CRITICAL SECURITY ISSUE**

**Immediate Actions**:

1. **Revoke exposed secrets immediately**:
   - Go to Cloudflare Dashboard → API Tokens
   - Find and delete the exposed token
   - Create new token

2. **Update GitHub Secret**:
   - Delete old `CLOUDFLARE_API_TOKEN`
   - Add new token as `CLOUDFLARE_API_TOKEN`

3. **Fix code**:
   - Ensure secrets use `${{ secrets.SECRET_NAME }}` syntax
   - Never echo or log secrets in commands
   - Check for accidental `set -x` or debug output

**Verify Fix**:
Re-run workflow and confirm secrets appear as `***` in logs.

---

## 📊 CI Success Metrics

### Monitoring CI Performance

Track these metrics over time:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Success Rate** | >95% | (Passed runs / Total runs) × 100 |
| **Job Duration** | <15 min | Check "Total duration" in workflow run |
| **Build Time** | <5 min | Check "Build OpenNext Worker" step duration |
| **Test Time** | <10 min | Check "Run E2E Tests" step duration |
| **Flakiness** | 0 failures | Run 10 times, all should pass |

### Collecting Metrics

**GitHub CLI**:
```bash
# List last 20 runs with status and duration
gh run list --workflow=quality.yml --limit 20 --json status,conclusion,createdAt,updatedAt,displayTitle

# View specific run details
gh run view [run-id] --json jobs,conclusion,timing
```

**GitHub UI**:
1. Go to Actions tab
2. Select "Quality" workflow
3. Review runs over past week
4. Calculate success rate

---

## ✅ Testing Checklist

Before merging Phase 3:

### Local Testing

- [ ] `pnpm test:e2e` passes 100% locally
- [ ] Tests pass on Chromium, Firefox, WebKit
- [ ] No flakiness observed (run 3 times to confirm)
- [ ] Wrangler starts successfully on `127.0.0.1:8788`

### CI Workflow Testing

- [ ] YAML syntax validated (no errors)
- [ ] GitHub Secrets configured correctly
- [ ] Workflow file changes reviewed and approved

### CI Execution Testing

- [ ] Test branch pushed to GitHub
- [ ] Workflow triggers automatically
- [ ] All steps complete successfully:
  - [ ] Install dependencies
  - [ ] Build OpenNext Worker
  - [ ] Run E2E Tests
  - [ ] Upload Playwright Report
- [ ] All 3 test suites pass (compression, middleware, i18n)
- [ ] Job duration < 15 minutes

### Stability Testing

- [ ] Workflow run 3 consecutive times
- [ ] All 3 runs pass with same results
- [ ] No intermittent failures
- [ ] Metrics meet targets

### Artifact Testing

- [ ] Playwright report artifact uploaded
- [ ] Can download artifact successfully
- [ ] HTML report opens and is readable
- [ ] Trace viewer works (if failures occur)

---

## 🔄 Continuous Monitoring

After Phase 3 is merged:

### Monitor First 5-10 PRs

1. Watch each PR's E2E job
2. Note any failures (expected or unexpected)
3. Track duration trends
4. Address flakiness immediately

### Weekly Review

1. Check success rate over past week
2. Review average job duration
3. Identify any patterns in failures
4. Optimize if performance degrades

### Responding to Failures

**If CI fails on a PR**:

1. **Download Playwright report**
2. **Analyze failure**:
   - Is it a real bug (good - tests working)?
   - Is it environmental (fix CI)?
   - Is it flaky (needs investigation)?
3. **Take action**:
   - Real bug: Fix code
   - Environmental: Adjust CI config
   - Flaky: Debug and stabilize test

---

## 📝 Best Practices

### Running Tests

✅ **Do**:
- Always validate locally before pushing to CI
- Run full test suite before merging
- Monitor CI runs until they complete
- Download reports when tests fail

❌ **Don't**:
- Skip local testing and rely only on CI
- Merge PRs with failing E2E tests
- Ignore flaky tests ("it'll pass next time")
- Leave failed runs uninvestigated

### Debugging CI

✅ **Do**:
- Use Playwright reports for visual debugging
- Check trace viewer for detailed execution
- Compare local vs CI logs
- Ask for help if stuck

❌ **Don't**:
- Randomly change configs without understanding
- Increase timeouts excessively (masks real issues)
- Disable tests to "make CI green"
- Skip downloading reports

---

## ❓ FAQ

**Q: Tests pass locally but fail in CI - what should I do?**
A: Download the Playwright report artifact and compare with local run. Look for environment differences (timing, resources, network).

**Q: How do I debug a failing test in CI?**
A: Download artifact, open HTML report, click on failed test, view trace to see step-by-step execution.

**Q: CI is too slow - can I optimize it?**
A: Yes. Options: Add dependency caching, reduce test parallelism, optimize build step. But ensure tests remain reliable.

**Q: Should I merge if one CI run fails but re-run passes?**
A: No. Investigate the failure first. Flaky tests indicate underlying issues.

**Q: How do I add new E2E tests that run in CI?**
A: Create test files in `/tests`, ensure they pass locally, push to CI. No config changes needed.

---

**Phase 3 testing ensures CI reliability - monitor carefully! 📊**
