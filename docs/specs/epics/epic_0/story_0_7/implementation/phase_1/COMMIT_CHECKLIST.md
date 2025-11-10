# Phase 1 - Checklist per Commit

This document provides a detailed checklist for each of the 5 atomic commits in Phase 1 - D1 Migrations Automation.

---

## 📋 Commit 1: Configure GitHub Secrets and Environment

**Files**:

- `docs/deployment/secrets-setup-guide.md` (new, ~50-80 lines)
- GitHub repository settings (via UI)

**Estimated Duration**: 30-45 minutes

### Implementation Tasks

#### Create Cloudflare API Token

- [ ] Log in to Cloudflare Dashboard (https://dash.cloudflare.com)
- [ ] Navigate to: My Profile → API Tokens
- [ ] Click "Create Token"
- [ ] Use "Create Custom Token" template
- [ ] Set token name: `GitHub Actions - D1 Migrations & Deployment`
- [ ] Set permissions:
  - [ ] Account | Cloudflare D1 | Edit
  - [ ] Account | Workers Scripts | Edit
- [ ] Set Account Resources: Include → Specific account → [Your account]
- [ ] Set TTL: Optional (leave blank for no expiration, or set 1 year)
- [ ] Click "Continue to summary"
- [ ] Review permissions carefully
- [ ] Click "Create Token"
- [ ] **Copy token immediately** (cannot be viewed again)

#### Get Cloudflare Account ID

- [ ] In Cloudflare Dashboard, navigate to any site/worker
- [ ] Find Account ID in right sidebar or URL
- [ ] Copy Account ID (format: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

#### Add Secrets to GitHub Repository

- [ ] Navigate to GitHub repository
- [ ] Go to: Settings → Secrets and variables → Actions
- [ ] Click "New repository secret"
- [ ] Add `CLOUDFLARE_API_TOKEN`:
  - [ ] Name: `CLOUDFLARE_API_TOKEN`
  - [ ] Secret: [paste token from Cloudflare]
  - [ ] Click "Add secret"
- [ ] Click "New repository secret" again
- [ ] Add `CLOUDFLARE_ACCOUNT_ID`:
  - [ ] Name: `CLOUDFLARE_ACCOUNT_ID`
  - [ ] Secret: [paste account ID]
  - [ ] Click "Add secret"

#### Document the Setup

- [ ] Create file: `docs/deployment/secrets-setup-guide.md`
- [ ] Document: How to create Cloudflare API token
- [ ] Document: Required permissions (Workers Scripts:Edit, D1:Edit)
- [ ] Document: How to get Account ID
- [ ] Document: How to add secrets to GitHub
- [ ] Document: Secret rotation procedures:
  - [ ] When to rotate (security incident, regular schedule)
  - [ ] How to generate new token
  - [ ] How to update GitHub secret
- [ ] Add warning: Never commit tokens to code
- [ ] Add troubleshooting section for common issues

### Validation

#### Manual Checks

- [ ] Verify `CLOUDFLARE_API_TOKEN` exists in GitHub Secrets
- [ ] Verify `CLOUDFLARE_ACCOUNT_ID` exists in GitHub Secrets
- [ ] Verify documentation file renders correctly in GitHub
- [ ] Verify no token values in documentation or commit history

#### Test Token Locally (Optional)

```bash
# Set environment variables temporarily
export CLOUDFLARE_API_TOKEN="your-token-here"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"

# Test token validity
npx wrangler whoami

# Test D1 access
npx wrangler d1 list
```

**Expected Result**: Token is valid, D1 databases are listed

### Review Checklist

#### Documentation Quality

- [ ] Cloudflare API token creation steps are clear and complete
- [ ] Screenshots or links to Cloudflare UI included (if helpful)
- [ ] Required permissions are explicitly listed
- [ ] Step-by-step instructions for GitHub secret configuration
- [ ] Secret rotation procedures are documented
- [ ] Troubleshooting section covers common issues:
  - [ ] "Invalid token" errors
  - [ ] "Insufficient permissions" errors
  - [ ] Where to find Account ID

#### Security

- [ ] No actual token values in documentation
- [ ] No actual account IDs in documentation (use placeholder)
- [ ] Warning about not committing secrets to code
- [ ] Guidance on token TTL and rotation
- [ ] Documentation stored in appropriate location

#### Code Quality

- [ ] Markdown formatting is correct
- [ ] Links work and point to correct resources
- [ ] No placeholder text left (like `[TODO]` or `XXX`)

### Commit Message

```bash
git add docs/deployment/secrets-setup-guide.md
git commit -m "🔧 chore(ci): configure Cloudflare secrets for D1 migrations

- Add CLOUDFLARE_API_TOKEN to GitHub repository secrets
- Add CLOUDFLARE_ACCOUNT_ID to GitHub repository secrets
- Document Cloudflare API token creation process
- Document required permissions (Workers Scripts:Edit, D1:Edit)
- Document secret rotation procedures
- Add troubleshooting guide for authentication issues

Part of Epic 0, Story 0.7, Phase 1 - Commit 1/5"
```

---

## 📋 Commit 2: Create Migration Workflow Structure

**Files**:

- `.github/workflows/migrate.yml` (new, ~80-100 lines)

**Estimated Duration**: 45-60 minutes

### Implementation Tasks

#### Create Workflow File

- [ ] Create directory: `.github/workflows/` (if doesn't exist)
- [ ] Create file: `.github/workflows/migrate.yml`
- [ ] Add workflow name: `Database Migrations (D1)`
- [ ] Add workflow description comment

#### Configure Workflow Triggers

- [ ] Add `workflow_dispatch` trigger (manual execution):
  - [ ] No inputs needed initially
  - [ ] Can add environment selection in Phase 3
- [ ] Add `workflow_call` trigger (for Phase 2 deployment integration):
  - [ ] Allows other workflows to call this one
  - [ ] Will be used by deployment workflow

#### Set Permissions

- [ ] Set minimal permissions:
  - [ ] `contents: read` (checkout code)
  - [ ] `actions: read` (if needed for artifact access)
  - [ ] `pull-requests: write` (for commenting on failures - optional)

#### Configure Concurrency

- [ ] Add concurrency group:
  - [ ] `group: migrations-${{ github.ref }}`
  - [ ] `cancel-in-progress: false` (don't cancel running migrations)
- [ ] Purpose: Prevent parallel migrations from running simultaneously

#### Define Migration Job

- [ ] Job name: `migrate-database`
- [ ] Runs on: `ubuntu-latest`
- [ ] Timeout: `timeout-minutes: 10` (migrations should be fast)

#### Add Setup Steps

- [ ] Checkout code: `actions/checkout@v4`
- [ ] Setup pnpm: `pnpm/action-setup@v2` with `version: latest`
- [ ] Setup Node.js: `actions/setup-node@v4` with:
  - [ ] `node-version: 20`
  - [ ] `cache: 'pnpm'`
- [ ] Install dependencies: `pnpm install --frozen-lockfile`

#### Add Placeholder for Migration (Commit 3 will implement)

- [ ] Add step: "Apply D1 Migrations"
- [ ] Add comment: `# Migration execution will be implemented in Commit 3`
- [ ] Add placeholder command: `echo "Migration step placeholder"`

### Validation

```bash
# Validate YAML syntax locally
npx action-validator .github/workflows/migrate.yml

# OR use yamllint
yamllint .github/workflows/migrate.yml

# OR push to feature branch and check GitHub Actions tab
git checkout -b feat/phase1-migration-workflow
git add .github/workflows/migrate.yml
git commit -m "feat: add migration workflow structure"
git push origin feat/phase1-migration-workflow
# Check GitHub → Actions tab for syntax errors
```

**Expected Result**: Workflow file has valid syntax, no errors in Actions tab

### Review Checklist

#### Workflow Structure

- [ ] YAML syntax is correct (no indentation errors)
- [ ] Workflow name is clear: "Database Migrations (D1)" or similar
- [ ] Triggers are appropriate:
  - [ ] `workflow_dispatch` present (manual trigger)
  - [ ] `workflow_call` present (for deployment workflow)
- [ ] Concurrency group prevents parallel migrations
- [ ] `cancel-in-progress: false` (critical: don't cancel running migrations)

#### Security & Permissions

- [ ] Permissions follow least privilege principle
- [ ] No unnecessary permissions granted
- [ ] Secrets will be accessed securely (not yet implemented)

#### Setup Steps

- [ ] Checkout, pnpm, Node.js setup steps are correct
- [ ] Node version matches project (20)
- [ ] pnpm caching enabled (`cache: 'pnpm'`)
- [ ] Dependencies installed with `--frozen-lockfile`

#### Code Quality

- [ ] Comments explain non-obvious choices
- [ ] Placeholder for migration execution is clear
- [ ] Timeout is reasonable (10 minutes)
- [ ] Job name follows naming conventions

### Commit Message

```bash
git add .github/workflows/migrate.yml
git commit -m "🔧 chore(ci): create D1 migration workflow structure

- Add workflow file with manual and callable triggers
- Configure concurrency to prevent parallel migrations
- Set up pnpm, Node.js, and dependency installation
- Define migration job skeleton (execution in next commit)
- Set minimal security permissions (contents:read)
- Configure 10-minute timeout for migration job

Part of Epic 0, Story 0.7, Phase 1 - Commit 2/5"
```

---

## 📋 Commit 3: Implement Migration Execution with Error Handling

**Files**:

- `.github/workflows/migrate.yml` (modify, add ~100-150 lines)

**Estimated Duration**: 60-90 minutes

⚠️ **HIGH RISK COMMIT** - Test thoroughly before production use!

### Implementation Tasks

#### Replace Placeholder with Migration Command

- [ ] Remove placeholder step from Commit 2
- [ ] Add step: "Apply D1 Migrations"
- [ ] Set working directory if needed
- [ ] Add environment variables:
  - [ ] `CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}`
  - [ ] `CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}`
- [ ] Add migration command: `npx wrangler d1 migrations apply DB --remote`

#### Add Pre-Migration Checks

- [ ] Add step: "Check for pending migrations"
- [ ] List pending migrations: `npx wrangler d1 migrations list DB --remote` (if supported)
- [ ] Or check migration files exist: `ls drizzle/migrations/`
- [ ] Skip migration if no files exist (don't fail workflow)

#### Implement Error Handling

- [ ] Add step: "Verify migration success"
- [ ] Capture migration output
- [ ] Check for error patterns:
  - [ ] "error" in output (case-insensitive)
  - [ ] "failed" in output
  - [ ] Non-zero exit code
- [ ] Handle "no migrations to apply" case:
  - [ ] Don't treat as error
  - [ ] Log as info: "No pending migrations"
- [ ] Fail workflow if migration truly failed

#### Add Logging and Artifacts

- [ ] Add step: "Capture migration logs"
- [ ] Save migration output to file: `migration-log-${{ github.run_id }}.txt`
- [ ] Add step: "Upload migration logs"
- [ ] Use `actions/upload-artifact@v4`:
  - [ ] Name: `migration-logs`
  - [ ] Path: `migration-log-*.txt`
  - [ ] Retention: 30 days
- [ ] Ensure logs uploaded even if migration fails (`if: always()`)

#### Add Failure Notification (Optional)

- [ ] Add step: "Notify on failure" with `if: failure()`
- [ ] Use `actions/github-script@v7` to comment on PR (if applicable)
- [ ] Or send notification to Slack/email (if configured)
- [ ] Message should include:
  - [ ] Migration failed
  - [ ] Link to workflow run
  - [ ] Link to migration logs artifact

### Validation

⚠️ **Test extensively before using on production database!**

```bash
# 1. Test migration locally first
wrangler d1 migrations apply DB --local

# 2. Verify migration applied correctly
wrangler d1 execute DB --local --command="SELECT name FROM sqlite_master WHERE type='table';"

# 3. Test workflow on feature branch with development database
# Option A: Use separate development database (recommended)
# - Create separate D1 database for testing
# - Update wrangler.jsonc temporarily with dev database_id
# - Commit to feature branch

# Option B: Test with --dry-run if supported
# - Modify workflow temporarily to use --dry-run flag

# 4. Push to feature branch and manually trigger workflow
git checkout -b feat/phase1-migration-execution
git add .github/workflows/migrate.yml
git commit -m "feat: implement migration execution"
git push origin feat/phase1-migration-execution

# 5. Go to GitHub → Actions → Database Migrations → Run workflow
# Select branch: feat/phase1-migration-execution
# Click "Run workflow"

# 6. Monitor execution closely
# Check logs in real-time
# Verify migration applied successfully
# Check migration logs artifact

# 7. Test error handling
# Temporarily break a migration (add invalid SQL)
# Trigger workflow again
# Verify workflow fails appropriately
# Verify error is caught and logged
```

**Expected Result**:

- Migration executes successfully
- Logs captured and uploaded
- Errors caught and reported
- "No migrations" case handled gracefully

### Review Checklist

#### Migration Execution

- [ ] Command is correct: `npx wrangler d1 migrations apply DB --remote`
- [ ] Secrets injected as environment variables (not in command)
- [ ] Working directory is correct (project root)
- [ ] Migration runs against correct database (DB binding)

#### Error Handling

- [ ] Pre-migration checks prevent unnecessary execution
- [ ] "No migrations to apply" doesn't cause failure
- [ ] Actual migration errors cause workflow failure
- [ ] Error messages are helpful and actionable
- [ ] Exit codes handled correctly

#### Security

- [ ] Secrets never logged in output
- [ ] `set +x` used if secrets in environment (bash debugging disabled)
- [ ] No token values in workflow file
- [ ] Migration logs don't contain sensitive data

#### Logging & Artifacts

- [ ] Migration output captured completely
- [ ] Logs uploaded even on failure (`if: always()`)
- [ ] Log file names are unique (include `${{ github.run_id }}`)
- [ ] Retention period reasonable (30 days)
- [ ] Logs are accessible and readable

#### Code Quality

- [ ] Error handling logic is clear
- [ ] Comments explain non-obvious choices
- [ ] No hardcoded values (use secrets for credentials)
- [ ] Script is idempotent (can be run multiple times safely)

### Commit Message

```bash
git add .github/workflows/migrate.yml
git commit -m "✨ feat(ci): implement automated D1 migration execution

- Execute D1 migrations via wrangler command
- Use GitHub secrets for Cloudflare authentication
- Add pre-migration checks for pending migrations
- Implement error handling for migration failures
- Handle \"no migrations to apply\" case gracefully
- Capture and upload migration logs as artifacts
- Add failure notification for debugging
- Ensure migrations block deployment on failure

Part of Epic 0, Story 0.7, Phase 1 - Commit 3/5"
```

---

## 📋 Commit 4: Add Migration Validation and Testing

**Files**:

- `.github/workflows/migrate.yml` (modify, add ~70-100 lines)
- `scripts/validate-migration.sh` (new, optional, ~50-80 lines)
- `docs/deployment/migration-testing.md` (new, ~80-120 lines)

**Estimated Duration**: 45-60 minutes

### Implementation Tasks

#### Add Pre-Migration Validation

- [ ] Add step: "Validate migration files" before migration execution
- [ ] Create validation script or inline validation:
  - [ ] Check `drizzle/migrations/` directory exists
  - [ ] Check migration files follow naming convention (0000\_\*.sql, etc.)
  - [ ] Verify files are not empty
  - [ ] Check for SQL syntax errors (basic validation)
- [ ] Fail fast if validation fails (don't attempt migration)

#### Add Post-Migration Verification

- [ ] Add step: "Verify database schema" after migration
- [ ] Query database to confirm schema changes:
  ```bash
  npx wrangler d1 execute DB --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
  ```
- [ ] Compare with expected schema (if possible)
- [ ] Add simple health check:
  - [ ] Query a table that should exist
  - [ ] Verify basic data integrity
- [ ] Log verification results

#### Create Validation Script (Optional)

- [ ] Create file: `scripts/validate-migration.sh`
- [ ] Make executable: `chmod +x scripts/validate-migration.sh`
- [ ] Script should:
  - [ ] Check migration files exist
  - [ ] Validate SQL syntax (basic)
  - [ ] List pending migrations
  - [ ] Exit with appropriate code (0 = success, 1 = failure)
- [ ] Call from workflow: `./scripts/validate-migration.sh`

#### Document Testing Procedures

- [ ] Create file: `docs/deployment/migration-testing.md`
- [ ] Document: How to test migrations locally

  ```bash
  # Test locally
  wrangler d1 migrations apply DB --local

  # Verify
  wrangler d1 execute DB --local --command="SELECT * FROM [table];"
  ```

- [ ] Document: How to test in CI without affecting production
  - [ ] Use feature branches
  - [ ] Use development database
  - [ ] Use `--dry-run` flag (if available)
- [ ] Document: How to validate migration success
  - [ ] Check migration status
  - [ ] Query database schema
  - [ ] Run health checks
- [ ] Document: Common testing scenarios
  - [ ] Fresh database (no migrations applied)
  - [ ] Database with existing migrations
  - [ ] No pending migrations case
  - [ ] Failed migration case

#### Add Workflow Status Badge (Optional)

- [ ] Add badge to README.md:
  ```markdown
  ![Database Migrations](https://github.com/[user]/[repo]/actions/workflows/migrate.yml/badge.svg)
  ```

### Validation

```bash
# 1. Test validation script locally
./scripts/validate-migration.sh
# Expected: Exit 0 if migrations valid, Exit 1 if issues

# 2. Test with invalid migration
# Create a test migration with SQL syntax error
echo "CRETE TABLE invalid;" > drizzle/migrations/test_invalid.sql
./scripts/validate-migration.sh
# Expected: Exit 1, error reported
# Clean up: rm drizzle/migrations/test_invalid.sql

# 3. Test pre-migration validation in workflow
# Push to feature branch and trigger workflow
# Verify validation step executes before migration

# 4. Test post-migration verification
# Trigger workflow on branch with valid migrations
# Check logs for schema verification output
# Verify health checks pass

# 5. Test documentation
# Follow steps in migration-testing.md
# Verify all commands work
# Verify documentation is clear
```

**Expected Result**:

- Validation catches invalid migrations
- Post-migration verification confirms success
- Documentation is complete and usable

### Review Checklist

#### Pre-Migration Validation

- [ ] Validation checks are comprehensive:
  - [ ] Migration files exist
  - [ ] File naming follows convention
  - [ ] Files not empty
  - [ ] Basic SQL syntax validation (if possible)
- [ ] Validation runs before migration (fail fast)
- [ ] Validation errors are clear and actionable
- [ ] Validation doesn't block valid migrations

#### Post-Migration Verification

- [ ] Verification queries don't modify data (SELECT only)
- [ ] Verification checks expected schema elements
- [ ] Health checks are appropriate for D1 database
- [ ] Verification logs are useful for debugging
- [ ] Verification failure causes workflow failure

#### Validation Script (if created)

- [ ] Script is executable (`chmod +x`)
- [ ] Script has clear exit codes (0=success, 1=failure)
- [ ] Script output is useful for debugging
- [ ] Script can run locally and in CI
- [ ] Script doesn't require production database access

#### Testing Documentation

- [ ] Local testing procedures are complete
- [ ] CI testing procedures explained
- [ ] Commands are copy-pasteable
- [ ] Examples included for common scenarios
- [ ] Troubleshooting tips provided
- [ ] Links to relevant resources (Wrangler docs, etc.)

#### Code Quality

- [ ] Validation logic is clear and maintainable
- [ ] No hardcoded database names (use DB binding)
- [ ] Comments explain validation rules
- [ ] Error messages are helpful

### Commit Message

```bash
git add .github/workflows/migrate.yml scripts/validate-migration.sh docs/deployment/migration-testing.md README.md
git commit -m "✅ test(ci): add migration validation and testing procedures

- Add pre-migration validation checks (file existence, naming, syntax)
- Add post-migration verification (schema queries, health checks)
- Create validation script for reusable checks
- Document local and CI testing procedures
- Document common testing scenarios and troubleshooting
- Add workflow status badge to README (optional)
- Ensure validation blocks invalid migrations

Part of Epic 0, Story 0.7, Phase 1 - Commit 4/5"
```

---

## 📋 Commit 5: Document Rollback Procedures and Troubleshooting

**Files**:

- `docs/deployment/migration-rollback.md` (new, ~100-150 lines)
- `docs/deployment/migration-troubleshooting.md` (new, ~100-150 lines)
- `README.md` (update, add migration section, optional)

**Estimated Duration**: 60-90 minutes

### Implementation Tasks

#### Create Rollback Documentation

- [ ] Create file: `docs/deployment/migration-rollback.md`
- [ ] Document: D1 Time Travel overview
  - [ ] What it is (point-in-time recovery for D1)
  - [ ] When to use it (migration failures, data corruption)
  - [ ] Limitations (time window, data loss considerations)
- [ ] Document: Rollback procedures
  - [ ] Step 1: Identify last known good state
  - [ ] Step 2: Access D1 Time Travel in Cloudflare Dashboard
  - [ ] Step 3: Select restore point (timestamp before migration)
  - [ ] Step 4: Confirm restoration
  - [ ] Step 5: Verify database state
  - [ ] Step 6: Re-deploy previous application version if needed
- [ ] Document: Manual rollback via wrangler CLI (if supported)
- [ ] Document: When to rollback vs. forward-fix
  - [ ] Rollback: Data corruption, breaking schema changes
  - [ ] Forward-fix: Minor issues, non-breaking changes
- [ ] Document: Post-rollback steps
  - [ ] Verify application functionality
  - [ ] Investigate root cause
  - [ ] Fix migration
  - [ ] Test thoroughly before re-applying

#### Create Troubleshooting Guide

- [ ] Create file: `docs/deployment/migration-troubleshooting.md`
- [ ] Document common issues and solutions:

  **Issue 1: "Migration already applied" error**
  - [ ] Symptoms: Migration fails with "already applied" message
  - [ ] Cause: Migration was applied previously
  - [ ] Solution: Check migration status, remove duplicate migrations
  - [ ] Prevention: Use proper migration naming and tracking

  **Issue 2: Permission/Authentication errors**
  - [ ] Symptoms: "Unauthorized", "Invalid token", "Forbidden"
  - [ ] Cause: Invalid or expired API token, insufficient permissions
  - [ ] Solution: Verify GitHub secrets, regenerate token if needed
  - [ ] Checklist: Token permissions (Workers:Edit, D1:Edit)

  **Issue 3: Database not found**
  - [ ] Symptoms: "Database DB not found", "Unknown binding"
  - [ ] Cause: Wrong database ID or binding name
  - [ ] Solution: Verify `wrangler.jsonc` configuration
  - [ ] Check: `database_id`, `binding`, `database_name`

  **Issue 4: SQL syntax errors**
  - [ ] Symptoms: "Syntax error near...", migration fails
  - [ ] Cause: Invalid SQL in migration file
  - [ ] Solution: Test migration locally, fix SQL syntax
  - [ ] Tool: Use SQLite syntax validator

  **Issue 5: Network/Connectivity issues**
  - [ ] Symptoms: Timeout, connection refused, DNS errors
  - [ ] Cause: Cloudflare API temporarily unavailable
  - [ ] Solution: Retry workflow, check Cloudflare status page
  - [ ] Escalation: If persistent, contact Cloudflare support

  **Issue 6: Database lock errors**
  - [ ] Symptoms: "Database is locked", concurrent access error
  - [ ] Cause: Multiple migrations running simultaneously
  - [ ] Solution: Ensure concurrency group in workflow
  - [ ] Check: Only one migration workflow running at a time

  **Issue 7: Workflow triggered but migration not applied**
  - [ ] Symptoms: Workflow succeeds but schema unchanged
  - [ ] Cause: "No migrations to apply" or wrong database
  - [ ] Solution: Check logs, verify migration files exist
  - [ ] Debug: Run migration manually to confirm

- [ ] Add troubleshooting flowchart (text-based or diagram)
- [ ] Add contact/escalation procedures
  - [ ] Who to contact for migration issues
  - [ ] When to escalate to senior dev/DevOps
  - [ ] How to report incidents

#### Create Operational Runbook

- [ ] Add section in rollback.md: "Pre-Migration Checklist"
  - [ ] Review migration files for correctness
  - [ ] Test migration locally
  - [ ] Verify GitHub secrets are configured
  - [ ] Check no other migrations are running
  - [ ] Backup database (or rely on D1 Time Travel)
  - [ ] Notify team of upcoming migration (for production)

- [ ] Add section: "Post-Migration Verification"
  - [ ] Check workflow logs for success
  - [ ] Query database to confirm schema changes
  - [ ] Run application health checks
  - [ ] Verify no errors in application logs
  - [ ] Monitor application for 15-30 minutes
  - [ ] Document migration in change log

- [ ] Add section: "Incident Response Procedures"
  - [ ] Detect: How to know a migration failed
  - [ ] Assess: Evaluate severity and impact
  - [ ] Contain: Stop deployments, prevent further damage
  - [ ] Recover: Rollback or forward-fix
  - [ ] Review: Post-incident analysis
  - [ ] Prevent: Update migration and validation

#### Update README (Optional)

- [ ] Add section to README.md: "Database Migrations"
- [ ] Brief overview of migration workflow
- [ ] Link to detailed documentation
- [ ] Quick commands for developers:

  ```bash
  # Test migrations locally
  pnpm db:migrate:local

  # Apply migrations remotely (via CI)
  # Trigger "Database Migrations" workflow in GitHub Actions
  ```

### Validation

```bash
# 1. Review documentation for completeness
cat docs/deployment/migration-rollback.md
# Check: All steps are clear, examples provided

cat docs/deployment/migration-troubleshooting.md
# Check: Common issues covered, solutions actionable

# 2. Test rollback procedure (if safe)
# Note: Only test on development database!
# Step 1: Apply a test migration locally
wrangler d1 migrations apply DB --local

# Step 2: Document how to use D1 Time Travel
# (Cannot fully test without Cloudflare Dashboard access)
# Review Cloudflare docs: https://developers.cloudflare.com/d1/reference/time-travel/

# 3. Validate documentation formatting
# Check markdown renders correctly in GitHub
# Verify links work (internal and external)

# 4. Have peer review documentation
# Ask teammate to follow rollback procedure
# Ask for feedback on clarity and completeness
```

**Expected Result**:

- Complete rollback documentation
- Comprehensive troubleshooting guide
- Clear operational procedures

### Review Checklist

#### Rollback Documentation

- [ ] D1 Time Travel explained clearly
- [ ] Step-by-step rollback procedure
- [ ] Screenshots or links to Cloudflare UI (if helpful)
- [ ] Decision criteria: when to rollback vs. forward-fix
- [ ] Post-rollback verification steps
- [ ] Manual rollback procedures (if applicable)
- [ ] Examples of rollback scenarios

#### Troubleshooting Guide

- [ ] At least 5-7 common issues covered
- [ ] Each issue has:
  - [ ] Clear symptoms
  - [ ] Root cause explanation
  - [ ] Step-by-step solution
  - [ ] Prevention tips
- [ ] Solutions are actionable (not just "debug it")
- [ ] Commands and examples provided
- [ ] Escalation procedures documented
- [ ] Links to external resources (Cloudflare docs, support)

#### Operational Runbook

- [ ] Pre-migration checklist is comprehensive
- [ ] Post-migration verification is thorough
- [ ] Incident response procedures are clear
- [ ] Procedures can be followed under pressure (2am incident)
- [ ] Contact information included (if applicable)

#### Documentation Quality

- [ ] Markdown formatting is correct
- [ ] Internal links work (to other docs)
- [ ] External links work (Cloudflare docs, GitHub)
- [ ] No placeholder text left
- [ ] Consistent tone and style
- [ ] Readable by junior developers

#### README Update (if done)

- [ ] Migration section is concise
- [ ] Links to detailed docs
- [ ] Quick commands work
- [ ] Doesn't duplicate detailed docs

### Commit Message

```bash
git add docs/deployment/migration-rollback.md docs/deployment/migration-troubleshooting.md README.md
git commit -m "📝 docs(ci): document rollback procedures and troubleshooting

- Document D1 Time Travel rollback procedures
- Add step-by-step recovery guide for failed migrations
- Document when to rollback vs. forward-fix
- Create comprehensive troubleshooting guide (7 common issues)
- Add pre-migration and post-migration checklists
- Document incident response procedures
- Add migration section to README with quick commands
- Provide escalation and contact procedures

Part of Epic 0, Story 0.7, Phase 1 - Commit 5/5"
```

---

## ✅ Final Phase Validation

After all 5 commits are complete, verify the entire phase:

### Complete Phase Checklist

- [ ] All 5 commits completed and pushed
- [ ] GitHub secrets configured and tested
- [ ] Migration workflow runs successfully in CI
- [ ] Migrations execute without errors
- [ ] Validation catches invalid migrations
- [ ] Post-migration verification passes
- [ ] Rollback procedures documented and reviewed
- [ ] Troubleshooting guide covers common issues
- [ ] Testing procedures documented and validated

### Final Validation Commands

```bash
# 1. Test complete workflow end-to-end
# Trigger workflow via GitHub UI
# Monitor execution in real-time
# Verify all steps pass

# 2. Test with actual migration (if safe)
# Create a test migration
wrangler d1 execute DB --local --command="CREATE TABLE test_phase1 (id INTEGER PRIMARY KEY);"
# Add migration file manually or via drizzle-kit
# Commit and trigger workflow
# Verify table created in database

# 3. Test validation
# Create invalid migration (SQL error)
# Trigger workflow
# Verify validation catches error
# Clean up invalid migration

# 4. Review all documentation
# Ensure no broken links
# Ensure no placeholder text
# Verify commands work

# 5. Complete VALIDATION_CHECKLIST.md
cat docs/specs/epics/epic_0/story_0_7/implementation/phase_1/validation/VALIDATION_CHECKLIST.md
# Go through each item systematically
```

### Success Criteria

Phase 1 is complete when:

- [ ] ✅ All 5 commits pushed to repository
- [ ] ✅ GitHub secrets configured securely
- [ ] ✅ Migration workflow executes successfully
- [ ] ✅ Migrations apply correctly to database
- [ ] ✅ Validation prevents invalid migrations
- [ ] ✅ Verification confirms migration success
- [ ] ✅ Rollback documentation complete
- [ ] ✅ Troubleshooting guide comprehensive
- [ ] ✅ Testing procedures validated
- [ ] ✅ All documentation reviewed by peer
- [ ] ✅ VALIDATION_CHECKLIST.md completed

**Phase 1 is complete! Ready for Phase 2 - Deployment Workflow 🎉**

---

## 📝 Notes

### Time Management

If running over estimated time:

- Focus on core functionality first (Commits 1-3)
- Documentation (Commits 4-5) can be refined later if needed
- Ensure Commit 3 (execution) is thoroughly tested - it's the highest risk

### Common Pitfalls

- **Exposing secrets**: Triple-check no tokens in code or logs
- **Skipping validation**: Don't skip Commit 4 - validation saves time later
- **Incomplete docs**: Future-you will thank you for complete Commit 5
- **Testing shortcuts**: Test Commit 3 extensively before production

### Getting Help

If stuck:

- Review IMPLEMENTATION_PLAN.md for context
- Check external links (Wrangler docs, GitHub Actions docs)
- Ask for peer review early
- Test in isolated environment first

**Good luck with the implementation! 🚀**
