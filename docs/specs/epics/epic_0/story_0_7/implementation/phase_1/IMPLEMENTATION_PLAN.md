# Phase 1 - Atomic Implementation Plan

**Objective**: Automate Cloudflare D1 database migrations in the CI/CD pipeline with error handling and rollback procedures.

---

## 🎯 Overview

### Why an Atomic Approach?

The implementation is split into **5 independent commits** to:

✅ **Facilitate review** - Each commit focuses on a single responsibility (secrets, workflow, errors, validation, docs)
✅ **Enable rollback** - If a commit has issues, revert it without breaking everything
✅ **Progressive validation** - Each step can be tested independently
✅ **Clear progression** - Setup → Implementation → Testing → Documentation
✅ **Risk mitigation** - High-risk database work isolated and carefully tested

### Global Strategy

```
[Setup] → [Workflow] → [Execution] → [Validation] → [Documentation]
   ↓          ↓            ↓              ↓              ↓
Secrets    Structure   Migrations     Testing         Rollback
 Config    + Triggers  + Errors      + Verification   + Recovery
```

**Progression**:
1. **Foundation** (Commit 1): Secure secrets management
2. **Infrastructure** (Commit 2): Workflow file structure and triggers
3. **Core Logic** (Commit 3): Migration execution with error handling
4. **Validation** (Commit 4): Testing and verification procedures
5. **Operations** (Commit 5): Rollback and troubleshooting documentation

---

## 📦 The 5 Atomic Commits

### Commit 1: Configure GitHub Secrets and Environment

**Files**:
- `.github/workflows/README.md` or `docs/deployment/secrets-setup-guide.md` (new, documentation)
- GitHub repository settings (via UI - document in commit message)

**Size**: ~50-80 lines of documentation
**Duration**: 30-45 min (implementation) + 15-20 min (review)

**Content**:
- Document required GitHub secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`)
- Create Cloudflare API token with appropriate permissions (Workers:Edit, D1:Edit)
- Add secrets to GitHub repository via UI (Settings → Secrets and variables → Actions)
- Document secret rotation procedures
- Verify secrets are accessible (can test in later commits)

**Why it's atomic**:
- **Single responsibility**: Secrets configuration only
- **No code dependencies**: Pure infrastructure setup
- **Can be validated independently**: Check GitHub UI for secret existence
- **Safe to rollback**: Removing secrets doesn't break existing code

**Technical Validation**:
```bash
# Verify secrets exist in GitHub repository
# Manual check: GitHub → Settings → Secrets and variables → Actions
# Expected: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID present
```

**Expected Result**: Secrets configured and documented, ready for use in workflow

**Review Criteria**:
- [ ] Documentation clearly explains how to create Cloudflare API token
- [ ] Required permissions for API token are documented (Workers:Edit, D1:Edit)
- [ ] Both secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) are added
- [ ] Secrets are repository secrets (not environment-specific yet)
- [ ] Secret rotation procedure documented
- [ ] No token values exposed in documentation or commit history

---

### Commit 2: Create Migration Workflow Structure

**Files**:
- `.github/workflows/migrate.yml` (new) OR
- `.github/workflows/deploy.yml` (new, includes migration job)

**Size**: ~80-100 lines
**Duration**: 45-60 min (implementation) + 20-30 min (review)

**Content**:
- Create workflow file with basic structure
- Define workflow triggers:
  - `workflow_dispatch` (manual trigger)
  - `workflow_call` (called by other workflows - for Phase 2 integration)
  - Optional: `push` to main branch (for automatic migrations)
- Set up job structure with appropriate permissions
- Configure concurrency group (prevent parallel migrations)
- Add pnpm and Node.js setup steps
- Install dependencies
- No migration execution yet (that's Commit 3)

**Why it's atomic**:
- **Single responsibility**: Workflow structure and setup only
- **No migration logic**: Just the scaffolding
- **Can be validated independently**: Workflow file syntax can be checked
- **Safe to test**: No actual migration commands, so no risk to database

**Technical Validation**:
```bash
# Validate workflow syntax
npx action-validator .github/workflows/migrate.yml

# Or use GitHub's workflow syntax checker
# Push to branch and check Actions tab for syntax errors
```

**Expected Result**: Valid workflow file that can be triggered (but does nothing with DB yet)

**Review Criteria**:
- [ ] Workflow file uses proper YAML syntax
- [ ] Triggers are appropriate (`workflow_dispatch`, `workflow_call`)
- [ ] Concurrency group prevents parallel migrations
- [ ] Permissions follow principle of least privilege
- [ ] pnpm and Node.js setup included
- [ ] Dependencies installed with `--frozen-lockfile`
- [ ] Timeout configured (e.g., 10 minutes for migration job)
- [ ] No migration commands yet (skeleton only)

---

### Commit 3: Implement Migration Execution with Error Handling

**Files**:
- `.github/workflows/migrate.yml` (modify - add migration steps)

**Size**: ~100-150 lines (additions to workflow)
**Duration**: 60-90 min (implementation) + 30-45 min (review)

**Content**:
- Add migration execution step using `wrangler d1 migrations apply`
- Use secrets for Cloudflare authentication
- Add error handling:
  - Check if migrations exist before applying
  - Handle "no migrations to apply" case (not an error)
  - Fail workflow if migration fails
  - Capture and log migration output
- Add post-migration verification step
- Upload migration logs as artifacts
- Add failure notification (comment on PR if applicable)
- Ensure migrations run before deployment (job dependency for Phase 2)

**Why it's atomic**:
- **Single responsibility**: Migration execution logic only
- **Builds on Commit 2**: Uses existing workflow structure
- **Can be validated independently**: Test with actual migration
- **Critical logic isolated**: Error handling is the most important part

**Technical Validation**:
```bash
# Test migration locally first
wrangler d1 migrations apply DB --local

# Test with remote (if safe)
wrangler d1 migrations apply DB --remote --dry-run  # if supported

# Trigger workflow manually via GitHub UI
# Check Actions logs for proper execution
```

**Expected Result**: Migrations execute successfully, errors are caught and reported

**Review Criteria**:
- [ ] Migration command uses correct syntax: `npx wrangler d1 migrations apply DB --remote`
- [ ] Secrets are properly injected as environment variables
- [ ] Error handling covers multiple failure scenarios
- [ ] "No migrations to apply" doesn't cause workflow failure
- [ ] Migration output is captured and logged
- [ ] Logs uploaded as artifacts for debugging
- [ ] Workflow fails fast on migration error (blocks deployment)
- [ ] Appropriate error messages for different failure types
- [ ] No secrets logged in output

---

### Commit 4: Add Migration Validation and Testing

**Files**:
- `.github/workflows/migrate.yml` (modify - add validation steps)
- `scripts/validate-migration.sh` (new, optional validation script)
- `docs/deployment/migration-testing.md` (new, testing guide)

**Size**: ~70-100 lines
**Duration**: 45-60 min (implementation) + 20-30 min (review)

**Content**:
- Add pre-migration validation step:
  - Check migration files exist
  - Verify database connection
  - Optionally run migration in dry-run mode
- Add post-migration verification:
  - Query database to confirm schema changes
  - Run health check or smoke test
  - Verify application can connect to database
- Document testing procedures:
  - How to test migrations locally
  - How to test in CI without affecting production
  - How to validate migration success
- Add workflow status badge to README (optional)

**Why it's atomic**:
- **Single responsibility**: Validation and testing only
- **Builds on Commit 3**: Adds safety checks around migration
- **Can be validated independently**: Run validation scripts alone
- **Increases confidence**: Makes migration process more reliable

**Technical Validation**:
```bash
# Run validation script locally
./scripts/validate-migration.sh

# Test migration with local DB
wrangler d1 migrations apply DB --local

# Verify database schema
wrangler d1 execute DB --local --command="SELECT name FROM sqlite_master WHERE type='table';"

# Test workflow end-to-end in CI
# Trigger manually and verify all validation steps pass
```

**Expected Result**: Migrations are validated before and after execution, reducing risk

**Review Criteria**:
- [ ] Pre-migration checks prevent invalid migrations from running
- [ ] Post-migration verification confirms success
- [ ] Validation doesn't block valid migrations
- [ ] Testing documentation is clear and actionable
- [ ] Validation scripts are reusable (can run locally)
- [ ] Error messages from validation are helpful
- [ ] Health checks are appropriate for database type (D1)

---

### Commit 5: Document Rollback Procedures and Troubleshooting

**Files**:
- `docs/deployment/migration-rollback.md` (new)
- `docs/deployment/migration-troubleshooting.md` (new)
- `README.md` (update - add migration section, optional)

**Size**: ~150-200 lines of documentation
**Duration**: 60-90 min (implementation) + 30-45 min (review)

**Content**:
- **Rollback documentation**:
  - How to use D1 Time Travel for point-in-time recovery
  - Manual rollback procedures via wrangler CLI
  - When to rollback vs. forward-fix
  - Database backup strategies
- **Troubleshooting guide**:
  - Common migration errors and solutions
  - "Migration already applied" errors
  - Permission/authentication issues
  - Network/connectivity problems
  - Database lock errors
- **Operational runbook**:
  - Pre-migration checklist
  - Post-migration verification
  - Incident response procedures
- Update README with migration workflow info (if appropriate)

**Why it's atomic**:
- **Single responsibility**: Documentation only
- **No code changes**: Pure knowledge capture
- **Can be validated independently**: Review documentation quality
- **Critical for production**: Rollback procedures save the day during incidents

**Technical Validation**:
```bash
# Test rollback procedure in local environment
# 1. Apply migration locally
wrangler d1 migrations apply DB --local

# 2. Verify D1 Time Travel is available
# (check Cloudflare dashboard or docs)

# 3. Document the process with screenshots/examples

# Review documentation for completeness
cat docs/deployment/migration-rollback.md
cat docs/deployment/migration-troubleshooting.md
```

**Expected Result**: Complete operational documentation for migration management

**Review Criteria**:
- [ ] Rollback procedures are step-by-step and actionable
- [ ] D1 Time Travel usage is clearly explained
- [ ] Troubleshooting covers common issues (at least 5-7 scenarios)
- [ ] Solutions are concrete (not just "debug it")
- [ ] Examples and commands are provided where helpful
- [ ] Contact/escalation procedures documented (if applicable)
- [ ] Documentation is discoverable (linked from README or main docs)
- [ ] No secrets or sensitive info in documentation

---

## 🔄 Implementation Workflow

### Step-by-Step

1. **Read phase specification**: PHASES_PLAN.md (Phase 1 section)
2. **Setup Cloudflare**: Create API token, get Account ID
3. **Implement Commit 1**: Configure secrets (30-45 min)
4. **Validate Commit 1**: Verify secrets exist in GitHub
5. **Commit Commit 1**: Use provided message template
6. **Implement Commit 2**: Create workflow structure (45-60 min)
7. **Validate Commit 2**: Check workflow syntax
8. **Commit Commit 2**: Use provided message template
9. **Implement Commit 3**: Add migration execution (60-90 min)
10. **Validate Commit 3**: Test migration in CI
11. **Commit Commit 3**: Use provided message template
12. **Implement Commit 4**: Add validation (45-60 min)
13. **Validate Commit 4**: Test validation scripts
14. **Commit Commit 4**: Use provided message template
15. **Implement Commit 5**: Write documentation (60-90 min)
16. **Validate Commit 5**: Review documentation quality
17. **Commit Commit 5**: Use provided message template
18. **Final validation**: Complete VALIDATION_CHECKLIST.md

### Validation at Each Step

After each commit:
```bash
# Verify workflow syntax (Commits 2-4)
npx action-validator .github/workflows/migrate.yml
# OR push to branch and check GitHub Actions tab

# Verify documentation formatting (Commits 1, 5)
# Check markdown renders correctly in GitHub

# Test migration locally (Commit 3 onwards)
wrangler d1 migrations apply DB --local

# Verify secrets (after Commit 1)
# Manual check in GitHub UI
```

All must pass before moving to next commit.

---

## 📊 Commit Metrics

| Commit | Files | Lines | Implementation | Review | Total |
|--------|-------|-------|----------------|--------|-------|
| 1. Secrets Setup | 1-2 | ~50-80 | 30-45 min | 15-20 min | ~45-65 min |
| 2. Workflow Structure | 1 | ~80-100 | 45-60 min | 20-30 min | ~65-90 min |
| 3. Migration Execution | 1 | ~100-150 | 60-90 min | 30-45 min | ~90-135 min |
| 4. Validation & Testing | 2-3 | ~70-100 | 45-60 min | 20-30 min | ~65-90 min |
| 5. Rollback Docs | 2-3 | ~150-200 | 60-90 min | 30-45 min | ~90-135 min |
| **TOTAL** | **7-10** | **~450-630** | **4-5.5h** | **2-2.5h** | **6-8h** |

**Note**: Times are estimates. Adjust based on experience with CI/CD and Cloudflare.

---

## ✅ Atomic Approach Benefits

### For Developers

- 🎯 **Clear focus**: One thing at a time (secrets → workflow → logic → validation → docs)
- 🧪 **Testable**: Each commit can be validated independently
- 📝 **Documented**: Clear commit messages explain the "why"
- 🔒 **Safe**: High-risk migration logic isolated in Commit 3

### For Reviewers

- ⚡ **Fast review**: 15-45 min per commit (total ~2-2.5h across 5 commits)
- 🔍 **Focused**: Single responsibility per commit makes review easier
- ✅ **Quality**: Easier to spot issues in small, focused changes
- 🛡️ **Security**: Secrets commit can be reviewed for security issues

### For the Project

- 🔄 **Rollback-safe**: Can revert individual commits if issues arise
- 📚 **Historical**: Clear progression in git history (setup → implementation → validation → docs)
- 🏗️ **Maintainable**: Easy to understand and modify later
- 🚨 **Risk-managed**: High-risk migration logic isolated and carefully tested

---

## 📝 Best Practices

### Commit Messages

Format (using Gitmoji convention):
```
🔧 type(scope): short description (max 50 chars)

- Point 1: detail
- Point 2: detail
- Point 3: justification if needed

Part of Epic 0, Story 0.7, Phase 1 - Commit X/5
```

**Gitmoji Types** (from `/docs/gitmoji.md`):
- `🔧` - Add or update configuration files (Commits 1, 2)
- `✨` - Introduce new features (Commit 3)
- `✅` - Add, update, or pass tests (Commit 4)
- `📝` - Add or update documentation (Commit 5)

### Examples:

**Commit 1**:
```
🔧 chore(ci): configure Cloudflare secrets for D1 migrations

- Add CLOUDFLARE_API_TOKEN to GitHub secrets
- Add CLOUDFLARE_ACCOUNT_ID to GitHub secrets
- Document token creation and rotation procedures

Part of Epic 0, Story 0.7, Phase 1 - Commit 1/5
```

**Commit 3**:
```
✨ feat(ci): implement automated D1 migration execution

- Add wrangler d1 migrations apply command to workflow
- Implement error handling for migration failures
- Capture and upload migration logs as artifacts
- Ensure migrations run before deployment

Part of Epic 0, Story 0.7, Phase 1 - Commit 3/5
```

### Review Checklist

Before committing:

- [ ] Code/config follows project style
- [ ] Workflow syntax is valid (for workflow commits)
- [ ] Secrets are not exposed in code or logs
- [ ] Documentation is clear and accurate
- [ ] Commit message follows template
- [ ] Changes validated locally or in CI

---

## ⚠️ Important Points

### Do's

- ✅ Follow the commit order (dependencies exist: secrets → workflow → execution → validation → docs)
- ✅ Validate after each commit (test locally or trigger workflow)
- ✅ Test migrations on local DB before remote
- ✅ Use provided commit message templates
- ✅ Document as you go (especially for Commits 1 and 5)
- ✅ Review security (especially Commit 1 - secrets)

### Don'ts

- ❌ Skip commits or combine them (each serves a purpose)
- ❌ Commit without validating (especially Commit 3 - high risk)
- ❌ Expose secrets in code, logs, or commit messages
- ❌ Run migrations on production database during development
- ❌ Skip documentation (Commit 5) - critical for incidents
- ❌ Ignore validation failures (Commit 4 prevents data issues)

---

## 🚨 High-Risk Commit: Commit 3

⚠️ **Commit 3 (Migration Execution) is HIGH RISK** ⚠️

**Why**: This commit actually runs migrations against the database. A bug here could corrupt data.

**Extra precautions**:
1. ✅ Test migration locally extensively before Commit 3
2. ✅ Test workflow on a feature branch first (not main)
3. ✅ Use a development database for initial testing
4. ✅ Review error handling carefully (this is your safety net)
5. ✅ Have rollback plan ready (Commit 5 docs)
6. ✅ Get peer review before merging Commit 3

**Validation steps for Commit 3**:
```bash
# 1. Test locally
wrangler d1 migrations apply DB --local

# 2. Verify migration applied
wrangler d1 execute DB --local --command="SELECT name FROM sqlite_master WHERE type='table';"

# 3. Test workflow on feature branch
git checkout -b feat/phase1-migrations
git push origin feat/phase1-migrations
# Manually trigger workflow via GitHub UI

# 4. Check logs for errors
# GitHub → Actions → Workflow run → Check logs

# 5. Only merge to main after validation passes
```

---

## ❓ FAQ

**Q: Can I combine Commits 2 and 3 (workflow structure + execution)?**
A: Not recommended. Commit 2 creates a safe skeleton you can test without risk. Commit 3 adds the high-risk migration logic. Keeping them separate allows you to validate the workflow setup before adding dangerous commands.

**Q: What if I need to fix a previous commit?**
A: If not pushed yet, use `git commit --amend` or interactive rebase. If already pushed, create a fix in the current commit or add a new fixup commit.

**Q: Can I skip Commit 5 (documentation) if I'm in a hurry?**
A: No. Rollback documentation is critical for production incidents. When a migration fails at 2am, you'll be grateful for Commit 5.

**Q: What if I don't have existing migrations to test?**
A: You should have migrations from Story 0.4. If not, create a test migration for validation purposes, but don't skip testing.

**Q: Should migrations run on every commit to main?**
A: Not necessarily. Typically migrations should run only when there are schema changes. Use `workflow_dispatch` (manual trigger) initially, then automate based on your deployment strategy.

**Q: How do I test Commit 3 without affecting production?**
A: Use a separate development database (different `database_id` in wrangler.jsonc), or use local D1 database for testing (`--local` flag).

---

## 🎯 Success Criteria

Phase 1 is complete when:

- [ ] All 5 commits implemented and validated
- [ ] GitHub secrets configured securely
- [ ] Migration workflow runs successfully in CI
- [ ] Migrations execute without errors
- [ ] Validation catches invalid migrations
- [ ] Rollback procedures documented and understood
- [ ] Team can manually trigger migrations via GitHub UI
- [ ] Migration logs are captured for debugging
- [ ] VALIDATION_CHECKLIST.md completed

**Ready to implement! Start with COMMIT_CHECKLIST.md for detailed steps. 🚀**
