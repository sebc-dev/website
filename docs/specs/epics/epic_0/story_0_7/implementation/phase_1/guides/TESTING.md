# Phase 1 - Testing Guide

Complete testing strategy for Phase 1 - D1 Migrations Automation.

---

## 🎯 Testing Strategy

Phase 1 focuses on infrastructure/DevOps work (GitHub Actions + Cloudflare D1 migrations), so testing emphasizes:

1. **Local Migration Testing**: Test migrations on local D1 database
2. **Workflow Integration Testing**: Test complete CI/CD workflow execution
3. **Error Scenario Testing**: Verify error handling and failure cases
4. **Validation Testing**: Ensure pre/post migration checks work

**Target**: 100% workflow execution success, 100% error handling coverage

**Estimated Test Count**: 8-12 manual test scenarios

---

## 🧪 Local Migration Testing

### Purpose

Validate that migrations work correctly before running in CI/CD.

### Prerequisites

- [ ] wrangler CLI installed (`npx wrangler --version`)
- [ ] Local D1 database initialized
- [ ] Migration files exist in `drizzle/migrations/`
- [ ] `wrangler.jsonc` configured correctly

### Running Local Migration Tests

#### Test 1: Fresh Database Migration

Test applying migrations to a fresh local database.

```bash
# 1. Clear local database (start fresh)
rm -rf .wrangler/state/v3/d1  # Clears local D1 database

# 2. Apply migrations to local database
npx wrangler d1 migrations apply DB --local

# Expected output:
# 🌀 Executing on local database DB (sebc-dev-db) from .wrangler/state/v3/d1:
# Migrations applied:
# 0000_*.sql
# 0001_*.sql
# 0002_*.sql
```

**Verification**:

```bash
# Verify tables exist
npx wrangler d1 execute DB --local --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"

# Expected: List of tables (articles, categories, etc.)

# Verify data integrity (if seeds applied)
npx wrangler d1 execute DB --local --command="SELECT COUNT(*) as count FROM categories;"
# Expected: { count: [number of categories] }
```

**Success Criteria**:

- [ ] All migrations applied without errors
- [ ] Tables exist in database
- [ ] Schema matches expected structure

---

#### Test 2: Idempotent Migration (No Changes)

Test that running migrations again doesn't cause errors.

```bash
# Apply migrations again (should be no-op)
npx wrangler d1 migrations apply DB --local

# Expected output:
# "No migrations to apply" or "All migrations already applied"
# Should NOT error
```

**Success Criteria**:

- [ ] Command succeeds (exit code 0)
- [ ] No errors logged
- [ ] Database state unchanged

---

#### Test 3: Migration Rollback Simulation

Test understanding rollback procedures (doesn't actually rollback in D1).

```bash
# 1. Note current database state
npx wrangler d1 execute DB --local --command="SELECT name FROM sqlite_master WHERE type='table';"

# 2. Apply a test migration
# (Create a test migration file manually)
echo "CREATE TABLE test_rollback (id INTEGER PRIMARY KEY);" > drizzle/migrations/9999_test_rollback.sql

# 3. Apply the test migration
npx wrangler d1 migrations apply DB --local

# 4. Verify test table exists
npx wrangler d1 execute DB --local --command="SELECT name FROM sqlite_master WHERE type='table' WHERE name='test_rollback';"

# 5. Simulate rollback (manually drop table since D1 doesn't support migration rollback)
npx wrangler d1 execute DB --local --command="DROP TABLE IF EXISTS test_rollback;"

# 6. Remove test migration file
rm drizzle/migrations/9999_test_rollback.sql

# 7. Verify cleanup
npx wrangler d1 execute DB --local --command="SELECT name FROM sqlite_master WHERE type='table' WHERE name='test_rollback';"
# Expected: Empty result
```

**Success Criteria**:

- [ ] Test migration applied successfully
- [ ] Manual rollback successful
- [ ] Cleanup complete

**Note**: D1 doesn't support automatic migration rollback. Use D1 Time Travel for production rollbacks.

---

#### Test 4: Invalid Migration Detection

Test that invalid SQL is caught (either by validation or by D1).

```bash
# 1. Create invalid migration
echo "CRETE TABLE typo (id INTEGER);" > drizzle/migrations/9998_invalid.sql
# Note: "CRETE" instead of "CREATE"

# 2. Try to apply migrations
npx wrangler d1 migrations apply DB --local

# Expected: Error message about SQL syntax
# "near \"CRETE\": syntax error" or similar

# 3. Cleanup
rm drizzle/migrations/9998_invalid.sql
```

**Success Criteria**:

- [ ] Invalid SQL detected
- [ ] Clear error message
- [ ] Migration doesn't partially apply

---

### Local Testing Checklist

Complete before pushing to CI:

- [ ] Fresh database migration works
- [ ] Idempotent migrations (no-op) work
- [ ] Invalid SQL causes appropriate errors
- [ ] Tables and schema match expectations
- [ ] Seeds apply correctly (if applicable)
- [ ] Local database can be reset and re-migrated

---

## 🔗 Workflow Integration Testing

### Purpose

Test the complete CI/CD migration workflow in GitHub Actions.

### Prerequisites

- [ ] GitHub secrets configured (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`)
- [ ] Workflow file committed (`.github/workflows/migrate.yml`)
- [ ] Commits 1-3 at minimum (migration execution implemented)

### Test Environment Options

**Option A: Development Database** (recommended ✅)

- Create separate D1 database for testing (`sebc-test-db` or similar)
- Update `wrangler.jsonc` temporarily with test database ID
- Commit to feature branch
- Trigger workflow
- Safely test without affecting production

**Option B: Production Database with Caution** (⚠️ higher risk)

- Use existing `sebc-dev-db`
- Only test on feature branch first
- Verify migrations are safe (no DROP TABLE, etc.)
- Monitor carefully

**Recommended**: Always use Option A (development database) for testing.

---

### Test 5: Manual Workflow Trigger (workflow_dispatch)

Test triggering the migration workflow manually.

```bash
# 1. Push workflow to feature branch
git checkout -b feat/phase1-test-migrations
git add .github/workflows/migrate.yml
git commit -m "test: migration workflow"
git push origin feat/phase1-test-migrations

# 2. Navigate to GitHub Actions
# GitHub → Actions → Database Migrations (or workflow name)

# 3. Click "Run workflow"
# Select branch: feat/phase1-test-migrations
# Click "Run workflow" button

# 4. Monitor execution in real-time
# Click on the workflow run to see logs
# Watch each step execute
```

**Expected Results**:

- [ ] Workflow starts and runs to completion
- [ ] All setup steps succeed (checkout, pnpm, node.js, install)
- [ ] Migration step executes
- [ ] Migrations apply successfully OR "No migrations to apply"
- [ ] Logs uploaded as artifacts
- [ ] Workflow status: Success (green checkmark)

**Failure Scenarios to Check**:

- If migration fails → Workflow should fail (red X)
- If secrets missing → Clear error message about authentication
- If database not found → Clear error message

---

### Test 6: Workflow Call Trigger (workflow_call)

Test that the migration workflow can be called by another workflow (for Phase 2 integration).

```bash
# 1. Create temporary test workflow that calls migrate.yml
cat > .github/workflows/test-workflow-call.yml << 'EOF'
name: Test Workflow Call

on:
  workflow_dispatch:

jobs:
  test-migration-call:
    runs-on: ubuntu-latest
    steps:
      - name: Call migration workflow
        uses: ./.github/workflows/migrate.yml@feat/phase1-test-migrations
        # OR if using workflow_call:
      - name: Trigger migration
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.actions.createWorkflowDispatch({
              owner: context.repo.owner,
              repo: context.repo.repo,
              workflow_id: 'migrate.yml',
              ref: 'feat/phase1-test-migrations'
            });
EOF

# 2. Commit and push
git add .github/workflows/test-workflow-call.yml
git commit -m "test: workflow call trigger"
git push

# 3. Trigger test workflow via GitHub UI
# 4. Verify migration workflow is called
```

**Expected Results**:

- [ ] Test workflow successfully calls migration workflow
- [ ] Migration workflow executes
- [ ] workflow_call trigger works as expected

**Note**: This test validates Phase 2 integration readiness.

---

### Test 7: Concurrent Migration Prevention

Test that concurrency group prevents parallel migrations.

```bash
# 1. Trigger migration workflow manually (do NOT wait for completion)
# GitHub → Actions → Database Migrations → Run workflow

# 2. Immediately trigger workflow again (before first completes)
# GitHub → Actions → Database Migrations → Run workflow (again)

# Expected behavior:
# - First workflow continues running
# - Second workflow is queued (waits for first to complete)
# OR
# - If `cancel-in-progress: true` → Second cancels first (BAD!)
# - If `cancel-in-progress: false` → Second queues (GOOD!)
```

**Expected Results**:

- [ ] Only one migration runs at a time
- [ ] Second workflow queues, doesn't cancel first
- [ ] No race conditions or database locks

**Critical**: Verify `cancel-in-progress: false` in workflow file.

---

### Test 8: Failed Migration Handling

Test that migration failures are caught and block workflow.

```bash
# 1. Create a migration that will fail
echo "DROP TABLE nonexistent_table;" > drizzle/migrations/9997_fail_test.sql

# 2. Commit and push to feature branch
git add drizzle/migrations/9997_fail_test.sql
git commit -m "test: migration failure handling"
git push

# 3. Trigger workflow
# GitHub → Actions → Run workflow

# Expected behavior:
# - Workflow starts
# - Migration step executes
# - Migration fails (table doesn't exist)
# - Workflow fails (red X)
# - Error logged in artifacts

# 4. Verify error handling
# - Check workflow logs for clear error message
# - Download migration logs artifact
# - Verify error is captured
# - Verify workflow status is "Failed"

# 5. Cleanup
git rm drizzle/migrations/9997_fail_test.sql
git commit -m "test: cleanup failed migration"
git push
```

**Expected Results**:

- [ ] Workflow detects migration failure
- [ ] Workflow fails (doesn't succeed despite error)
- [ ] Error message is clear and actionable
- [ ] Logs captured in artifacts

---

### Test 9: Secrets Validation

Test that missing or invalid secrets cause appropriate failures.

**Scenario A: Missing Secret**

```bash
# 1. Temporarily remove CLOUDFLARE_API_TOKEN from GitHub secrets
# GitHub → Settings → Secrets → Actions → CLOUDFLARE_API_TOKEN → Remove

# 2. Trigger workflow
# Expected: Workflow fails with "Unauthorized" or "Invalid token" error

# 3. Restore secret
# Re-add CLOUDFLARE_API_TOKEN with correct value
```

**Scenario B: Invalid Token**

```bash
# 1. Update CLOUDFLARE_API_TOKEN with invalid value
# GitHub → Settings → Secrets → Actions → CLOUDFLARE_API_TOKEN
# Set to: "invalid-token-for-testing"

# 2. Trigger workflow
# Expected: Workflow fails with authentication error

# 3. Restore valid token
```

**Expected Results**:

- [ ] Missing secret causes clear error
- [ ] Invalid secret causes authentication error
- [ ] Error messages help debug the issue

---

## ✅ Validation Testing (Commits 4+)

### Purpose

Test that migration validation catches issues before execution.

### Test 10: Pre-Migration Validation

Test validation script or validation steps.

```bash
# If validation script exists:
./scripts/validate-migration.sh

# Expected output: Success or validation errors

# Test with invalid migration (empty file)
touch drizzle/migrations/9996_empty.sql
./scripts/validate-migration.sh
# Expected: Validation error (file is empty)

# Cleanup
rm drizzle/migrations/9996_empty.sql
```

**Expected Results**:

- [ ] Valid migrations pass validation
- [ ] Invalid migrations caught by validation
- [ ] Validation errors are clear

---

### Test 11: Post-Migration Verification

Test that post-migration verification queries work.

```bash
# After successful migration, verify schema
npx wrangler d1 execute DB --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"

# Expected: List of expected tables

# Run health check (if implemented in workflow)
npx wrangler d1 execute DB --remote --command="SELECT COUNT(*) FROM articles;"

# Expected: Numeric result (no errors)
```

**Expected Results**:

- [ ] Schema verification queries succeed
- [ ] Expected tables exist
- [ ] Health checks pass

---

## 📊 Test Coverage Summary

### Manual Test Scenarios

| Test                            | Type  | Status | Notes                           |
| ------------------------------- | ----- | ------ | ------------------------------- |
| 1. Fresh database migration     | Local | ⏳     | Apply migrations to clean DB    |
| 2. Idempotent migrations        | Local | ⏳     | No-op when re-run               |
| 3. Rollback simulation          | Local | ⏳     | Manual rollback procedure       |
| 4. Invalid migration detection  | Local | ⏳     | SQL syntax errors caught        |
| 5. Manual workflow trigger      | CI    | ⏳     | workflow_dispatch works         |
| 6. Workflow call trigger        | CI    | ⏳     | workflow_call works             |
| 7. Concurrent prevention        | CI    | ⏳     | Concurrency group effective     |
| 8. Failed migration handling    | CI    | ⏳     | Errors caught and logged        |
| 9. Secrets validation           | CI    | ⏳     | Missing/invalid secrets fail    |
| 10. Pre-migration validation    | CI    | ⏳     | Validation catches issues       |
| 11. Post-migration verification | CI    | ⏳     | Schema verified after migration |

**Target**: All tests passing ✅

---

## 🐛 Debugging Tests

### Common Testing Issues

#### Issue: Local migrations fail with "Database not found"

**Solution**:

```bash
# Verify wrangler.jsonc configuration
cat wrangler.jsonc | grep -A 5 d1_databases

# Ensure binding name matches
npx wrangler d1 list
```

---

#### Issue: Workflow fails with "Unauthorized"

**Solution**:

```bash
# Check GitHub secrets exist
# GitHub → Settings → Secrets → Actions
# Verify: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID

# Test token locally
export CLOUDFLARE_API_TOKEN="your-token"
npx wrangler whoami
```

---

#### Issue: Migrations applied twice

**Solution**:

```bash
# Check migration status
npx wrangler d1 migrations list DB --local

# D1 tracks applied migrations automatically
# Should not re-apply migrations
```

---

#### Issue: Workflow succeeds but migrations not applied

**Solution**:

```bash
# Check workflow logs carefully
# Look for "No migrations to apply" message
# Verify migration files exist in repo
ls drizzle/migrations/

# Ensure migrations_dir in wrangler.jsonc is correct
cat wrangler.jsonc | grep migrations_dir
```

---

## 📝 Testing Checklist

Complete before marking Phase 1 as done:

### Local Testing

- [ ] Fresh database migration works
- [ ] Idempotent migrations (re-run) work
- [ ] Invalid SQL causes errors
- [ ] Rollback procedure understood

### CI/CD Testing

- [ ] Manual workflow trigger works
- [ ] Workflow call trigger works (for Phase 2)
- [ ] Concurrency prevents parallel migrations
- [ ] Failed migrations block workflow
- [ ] Missing secrets cause clear errors
- [ ] Logs captured in artifacts

### Validation Testing

- [ ] Pre-migration validation works
- [ ] Post-migration verification works
- [ ] Invalid migrations caught

### Documentation Testing

- [ ] Testing guide is accurate (this document)
- [ ] All commands work as documented
- [ ] Troubleshooting tips are helpful

---

## 🎯 Success Criteria

Phase 1 testing is complete when:

- [ ] All 11 test scenarios executed
- [ ] All tests pass (or failures understood and mitigated)
- [ ] Local migrations work reliably
- [ ] CI/CD workflow executes successfully
- [ ] Error handling validated
- [ ] Secrets and authentication work
- [ ] Validation catches invalid migrations
- [ ] Documentation tested and accurate

**Testing complete! Phase 1 is production-ready. 🎉**

---

## 📚 Reference Commands

### Quick Testing Commands

```bash
# Local migration test
npx wrangler d1 migrations apply DB --local

# Verify local database
npx wrangler d1 execute DB --local --command="SELECT name FROM sqlite_master WHERE type='table';"

# Test wrangler authentication
npx wrangler whoami

# List D1 databases
npx wrangler d1 list

# Check migration status
npx wrangler d1 migrations list DB --local

# Reset local database (start fresh)
rm -rf .wrangler/state/v3/d1

# Validate workflow YAML syntax
npx action-validator .github/workflows/migrate.yml
```

---

## 🔗 External Resources

- [Wrangler D1 Commands](https://developers.cloudflare.com/workers/wrangler/commands/#d1)
- [D1 Migrations Reference](https://developers.cloudflare.com/d1/reference/migrations/)
- [GitHub Actions Testing](https://docs.github.com/en/actions/writing-workflows/testing-workflows-locally)
- [D1 Time Travel (Rollback)](https://developers.cloudflare.com/d1/reference/time-travel/)

---

**Happy testing! Ensure every scenario passes before deploying. 🚀**
