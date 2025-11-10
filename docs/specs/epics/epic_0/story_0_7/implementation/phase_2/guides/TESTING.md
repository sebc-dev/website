# Phase 2 - Testing Guide

Complete testing strategy for Phase 2: Deployment Workflow.

---

## 🎯 Testing Strategy

Phase 2 focuses on **workflow integration testing** rather than unit tests. The deployment workflow itself is the implementation artifact.

**Testing Layers**:

1. **Syntax Validation**: YAML syntax and GitHub Actions schema compliance
2. **Workflow Execution**: Manual and automatic trigger testing
3. **Deployment Verification**: Successful deployment to Cloudflare Workers
4. **Integration Testing**: End-to-end workflow from commit to deployed Worker
5. **Failure Scenario Testing**: Error handling and rollback procedures

**Target Success Rate**: ≥99% deployment success
**Target Verification**: 100% health check coverage

---

## 🧪 Syntax Validation

### Purpose

Validate GitHub Actions workflow syntax before committing or pushing.

### Running Syntax Validation

```bash
# Install actionlint (if not already installed)
# macOS
brew install actionlint

# Linux
bash <(curl https://raw.githubusercontent.com/rhysd/actionlint/main/scripts/download-actionlint.bash)
sudo mv actionlint /usr/local/bin/

# Validate all workflows
actionlint

# Validate specific workflow
actionlint .github/workflows/deploy.yml

# With color output
actionlint -color .github/workflows/deploy.yml
```

### Expected Results

```
✅ No errors found
```

**If errors found**:

```
.github/workflows/deploy.yml:15:5: "name" is required field [syntax-check]
   |
15 |     steps:
   |     ^~~~~~
```

### Common Syntax Issues

| Issue                    | Example                        | Fix                                    |
| ------------------------ | ------------------------------ | -------------------------------------- |
| Missing required field   | Job without `runs-on`          | Add `runs-on: ubuntu-latest`           |
| Invalid syntax           | `if: ${{ var }}`               | Use `if: var` (no need for `${{ }}`)   |
| Undefined secret         | `${{ secrets.MISSING }}`       | Add secret to GitHub repository        |
| Tabs instead of spaces   | Indentation uses tabs          | Replace tabs with spaces (2 or 4)      |
| Invalid action version   | `actions/checkout@vInvalid`    | Use valid version like `@v4`           |

### Validation Checklist

Before committing each change:

- [ ] `actionlint` passes with no errors
- [ ] YAML is properly indented (2 spaces, no tabs)
- [ ] All required fields present
- [ ] Secrets referenced correctly
- [ ] Action versions are valid

---

## 🔗 Workflow Execution Testing

### Purpose

Verify workflow triggers correctly and executes all jobs.

### Test 1: Manual Trigger (workflow_dispatch)

**Purpose**: Verify manual deployments work from any branch.

**Prerequisites**:
- [ ] GitHub secrets configured
- [ ] Branch with workflow changes pushed

**Steps**:

1. **Trigger workflow manually**:
   ```bash
   # Using GitHub CLI
   gh workflow run deploy.yml

   # With inputs (if configured)
   gh workflow run deploy.yml -f skip_verification=false -f dry_run=false
   ```

2. **Monitor execution**:
   ```bash
   # Watch workflow run
   gh run watch

   # View logs in real-time
   gh run view --log
   ```

3. **Check workflow status**:
   ```bash
   # List recent runs
   gh run list --workflow=deploy.yml --limit 5

   # View specific run
   gh run view <run-id>
   ```

**Expected Results**:

```
✅ Workflow triggered successfully
✅ All jobs complete without errors
✅ Deployment job succeeds
✅ Health check passes
✅ Artifacts uploaded
```

**Success Criteria**:
- Workflow status: ✅ Success
- Deployment job: ✅ Success
- Health check: HTTP 200
- Worker accessible at URL

---

### Test 2: Automatic Trigger (workflow_run)

**Purpose**: Verify deployment runs automatically after quality workflow succeeds.

**Prerequisites**:
- [ ] Quality workflow (`.github/workflows/quality.yml`) exists
- [ ] Changes pushed to main or develop branch

**Steps**:

1. **Push changes to trigger quality workflow**:
   ```bash
   git checkout main
   git pull
   # Make a trivial change
   echo "# Test" >> README.md
   git add README.md
   git commit -m "test(ci): trigger workflow_run test"
   git push origin main
   ```

2. **Wait for quality workflow to complete**:
   ```bash
   gh run watch --workflow=quality.yml
   ```

3. **Verify deployment workflow triggered**:
   ```bash
   # Check deployment workflow runs
   gh run list --workflow=deploy.yml --limit 1

   # Should show a run triggered by workflow_run
   ```

4. **Monitor deployment execution**:
   ```bash
   gh run watch --workflow=deploy.yml
   ```

**Expected Results**:

```
✅ Quality workflow completes successfully
✅ Deployment workflow triggers automatically
✅ Deployment executes and succeeds
✅ Worker is updated with latest changes
```

**Success Criteria**:
- Quality workflow: ✅ Success
- Deployment workflow triggered within 1-2 minutes
- Deployment status: ✅ Success
- Deployed commit SHA matches pushed commit

---

### Test 3: Branch Filtering

**Purpose**: Verify deployment only runs for allowed branches.

**Prerequisites**:
- [ ] Workflow configured with branch filters

**Test 3a: Allowed Branch (main)**

```bash
git checkout main
# Make and push change
git commit --allow-empty -m "test: allowed branch deployment"
git push origin main

# Verify deployment triggers
gh run list --workflow=deploy.yml --limit 1
```

**Expected**: Deployment triggers and runs ✅

**Test 3b: Disallowed Branch (feature branch)**

```bash
git checkout -b test-branch-filter
git commit --allow-empty -m "test: disallowed branch deployment"
git push origin test-branch-filter

# Verify deployment does NOT trigger automatically
gh run list --workflow=deploy.yml --limit 1 | grep test-branch-filter
```

**Expected**: No automatic deployment ❌ (only manual dispatch allowed)

---

## 🎭 Deployment Verification Testing

### Purpose

Verify deployed Worker is functional and accessible.

### Test 4: Health Check Validation

**Purpose**: Verify post-deployment health check correctly validates Worker.

**Steps**:

1. **Trigger deployment**:
   ```bash
   gh workflow run deploy.yml
   gh run watch
   ```

2. **Extract Worker URL from logs**:
   ```bash
   gh run view --log | grep -i "published" | grep -o "https://[^ ]*"
   ```

3. **Manually verify health check**:
   ```bash
   WORKER_URL="<extracted-url>"

   # Test HTTP GET
   curl -I "$WORKER_URL"

   # Expected: HTTP/2 200
   ```

4. **Check workflow health check step**:
   ```bash
   gh run view --log | grep -A 10 "health check"
   ```

**Expected Results**:

```
✅ Worker URL returned by wrangler deploy
✅ Manual curl returns HTTP 200
✅ Workflow health check step succeeds
✅ Health check retries on transient failures (if any)
```

**Success Criteria**:
- HTTP status: 200 OK
- Response time: < 1000ms
- Content-Type header present
- No error messages in response

---

### Test 5: Retry Logic

**Purpose**: Verify health check retries transient failures.

**Approach**: Simulate transient failure (difficult without real failure).

**Alternative Test**: Review logs for retry behavior after deployment.

```bash
# Check health check logs for retry attempts
gh run view --log | grep -B 5 -A 5 "retry\|attempt"
```

**Expected Results**:

- Retry logic attempts up to 3 times
- Delay between retries (10 seconds)
- Success on eventual retry (or failure after max attempts)

---

## 🔥 Failure Scenario Testing

### Purpose

Verify workflow handles failures gracefully and provides useful error messages.

### Test 6: Missing Secrets

**Purpose**: Verify workflow fails with clear error if secrets missing.

**Steps** (⚠️ destructive test, use test repository):

1. **Remove secret temporarily**:
   ```bash
   # Backup secret value first!
   gh secret list | grep CLOUDFLARE_API_TOKEN

   # Remove secret
   gh secret remove CLOUDFLARE_API_TOKEN
   ```

2. **Trigger workflow**:
   ```bash
   gh workflow run deploy.yml
   gh run watch
   ```

3. **Check error message**:
   ```bash
   gh run view --log | grep -i "error"
   ```

4. **Restore secret**:
   ```bash
   gh secret set CLOUDFLARE_API_TOKEN
   # Paste backed-up value
   ```

**Expected Results**:

```
❌ Workflow fails at deployment step
❌ Error message: "Required secret not found" or similar
✅ Error is clear and actionable
```

**Success Criteria**:
- Workflow fails (not hangs)
- Error message identifies missing secret
- No partial deployment

---

### Test 7: Build Failure

**Purpose**: Verify failed build blocks deployment.

**Steps**:

1. **Introduce build error** (test branch):
   ```bash
   git checkout -b test-build-failure

   # Break build (e.g., syntax error in TypeScript)
   echo "const broken syntax here" >> app/page.tsx
   git add app/page.tsx
   git commit -m "test: introduce build failure"
   git push origin test-build-failure
   ```

2. **Trigger workflow**:
   ```bash
   gh workflow run deploy.yml
   gh run watch
   ```

3. **Verify build fails**:
   ```bash
   gh run view --log | grep -i "build"
   ```

4. **Verify deployment blocked**:
   ```bash
   gh run view --log | grep -i "deploy"
   ```

5. **Clean up**:
   ```bash
   git checkout main
   git branch -D test-build-failure
   git push origin --delete test-build-failure
   ```

**Expected Results**:

```
❌ Build step fails with TypeScript error
❌ Deployment step does not execute
✅ Workflow fails before deployment
```

**Success Criteria**:
- Build failure detected
- Deployment does not run
- No broken code deployed

---

### Test 8: Health Check Failure

**Purpose**: Verify failed health check triggers workflow failure.

**Approach**: Difficult to simulate without breaking Worker.

**Alternative Test**: Review health check logic in workflow.

```bash
# Review health check step
cat .github/workflows/deploy.yml | grep -A 20 "health check"
```

**Manual Validation**:

- [ ] Health check uses correct Worker URL
- [ ] Success criteria is HTTP 200
- [ ] Failure exits with non-zero code
- [ ] Error message is descriptive

---

## 📊 Integration Testing

### Test 9: End-to-End Deployment

**Purpose**: Validate complete workflow from code change to deployed Worker.

**Steps**:

1. **Make code change**:
   ```bash
   git checkout main
   git pull

   # Make visible change (e.g., update homepage text)
   echo "export const TEST_DEPLOYMENT = true;" >> app/config.ts
   git add app/config.ts
   git commit -m "feat: test end-to-end deployment"
   git push origin main
   ```

2. **Monitor quality workflow**:
   ```bash
   gh run watch --workflow=quality.yml
   ```

3. **Verify deployment triggers**:
   ```bash
   gh run list --workflow=deploy.yml --limit 1
   ```

4. **Monitor deployment**:
   ```bash
   gh run watch --workflow=deploy.yml
   ```

5. **Verify Worker updated**:
   ```bash
   # Get Worker URL from logs
   WORKER_URL=$(gh run view --log --workflow=deploy.yml | grep -o "https://[^ ]*workers.dev" | head -1)

   # Verify change deployed (check for TEST_DEPLOYMENT or visible change)
   curl "$WORKER_URL" | grep "TEST_DEPLOYMENT"
   ```

**Expected Results**:

```
✅ Code pushed to main
✅ Quality workflow runs and passes
✅ Deployment workflow triggers automatically
✅ Build succeeds
✅ Deployment succeeds
✅ Health check passes
✅ Worker reflects latest changes
```

**Success Criteria**:
- Total time: < 15 minutes (quality + deployment)
- All workflows succeed
- Worker updated with latest commit
- No manual intervention required

---

## 🐛 Debugging Tests

### Common Issues

#### Issue: Workflow doesn't trigger

**Debug**:

```bash
# Check workflow exists
gh workflow list | grep -i deploy

# Check workflow syntax
actionlint .github/workflows/deploy.yml

# Check workflow is enabled
gh workflow view deploy.yml
```

#### Issue: Deployment fails with authentication error

**Debug**:

```bash
# Verify secrets configured
gh secret list | grep CLOUDFLARE

# Test wrangler auth locally
export CLOUDFLARE_API_TOKEN="<token>"
npx wrangler whoami
```

#### Issue: Health check fails but Worker is accessible

**Debug**:

```bash
# Check Worker URL in workflow logs
gh run view --log | grep -i "url\|published"

# Manually test Worker
curl -I "<worker-url>"

# Check CDN propagation delay
sleep 15 && curl -I "<worker-url>"
```

---

## ✅ Testing Checklist

Before marking Phase 2 complete:

### Syntax Validation
- [ ] `actionlint` passes with no errors
- [ ] YAML syntax is valid
- [ ] All required fields present

### Workflow Execution
- [ ] Manual trigger works (`workflow_dispatch`)
- [ ] Automatic trigger works (`workflow_run`)
- [ ] Branch filtering works correctly
- [ ] Concurrency group prevents overlapping deployments

### Deployment
- [ ] Build succeeds
- [ ] Deployment to Cloudflare succeeds
- [ ] Worker is accessible after deployment
- [ ] Health check passes
- [ ] Deployment logs captured

### Error Handling
- [ ] Missing secrets cause clear failure
- [ ] Build failures block deployment
- [ ] Health check failures trigger workflow failure
- [ ] Error messages are actionable

### Integration
- [ ] End-to-end workflow completes successfully
- [ ] Deployed commit matches pushed commit
- [ ] Worker reflects latest changes
- [ ] Total deployment time is acceptable (< 15 min)

---

## 📝 Test Reporting

### Test Execution Log Template

```markdown
## Phase 2 Testing Report

**Tester**: [Name]
**Date**: [YYYY-MM-DD]
**Branch**: [main/feature-branch]

### Test Results

| Test                        | Status | Duration | Notes                    |
| --------------------------- | ------ | -------- | ------------------------ |
| Syntax Validation           | ✅     | 1 min    | No errors                |
| Manual Trigger              | ✅     | 8 min    | Deployed successfully    |
| Automatic Trigger           | ✅     | 12 min   | Triggered after quality  |
| Branch Filtering            | ✅     | 5 min    | Only main deploys        |
| Health Check                | ✅     | 30 sec   | HTTP 200                 |
| Missing Secrets Failure     | ✅     | 2 min    | Clear error message      |
| Build Failure Blocks Deploy | ✅     | 4 min    | No deployment executed   |
| End-to-End Deployment       | ✅     | 14 min   | All steps successful     |

### Summary

- **Total Tests**: 8
- **Passed**: 8
- **Failed**: 0
- **Success Rate**: 100%

### Issues Found

[List any issues or unexpected behavior]

### Recommendations

[Any suggestions for improvements]
```

---

## ❓ FAQ

**Q: How do I test without deploying to production?**
A: Phase 2 uses basic deployment (no environment separation). Phase 3 adds staging/production. For now, use manual dispatch from feature branch for testing.

**Q: Can I test locally?**
A: Yes! Use `npx wrangler deploy` locally with your API token. See ENVIRONMENT_SETUP.md.

**Q: What if tests fail?**
A: Identify the failing step, review logs (`gh run view --log`), fix the issue, and re-test.

**Q: How often should I run these tests?**
A: After each commit during implementation, and once more before marking phase complete.

---

## 🔗 Testing Resources

- [GitHub CLI Workflow Commands](https://cli.github.com/manual/gh_workflow)
- [actionlint Documentation](https://github.com/rhysd/actionlint)
- [Cloudflare Workers Testing](https://developers.cloudflare.com/workers/testing/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/commands/)

---

**Thorough testing ensures deployment reliability. Test each commit incrementally!**
