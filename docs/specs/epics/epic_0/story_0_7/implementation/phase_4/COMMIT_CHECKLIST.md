# Phase 4 - Checklist per Commit

This document provides a detailed checklist for each atomic commit of Phase 4.

---

## 📋 Commit 1: Create Deployment Runbook

**File**: `docs/deployment/RUNBOOK.md` (new)
**Estimated Duration**: 75-95 minutes

### Implementation Tasks

- [ ] Create `docs/deployment/` directory if it doesn't exist
- [ ] Create `docs/deployment/RUNBOOK.md` file
- [ ] Add document header and overview
- [ ] Document CI/CD pipeline overview (quality → migrations → deployment)
- [ ] Write initial setup procedures section:
  - [ ] Prerequisites checklist (Phases 1-3 completed)
  - [ ] First-time deployment verification steps
  - [ ] Environment validation
- [ ] Write routine deployment workflow section:
  - [ ] Normal push to main branch flow
  - [ ] Automatic workflow trigger
  - [ ] Expected GitHub Actions sequence
  - [ ] Timeline estimates
- [ ] Write manual deployment section:
  - [ ] When to use `workflow_dispatch`
  - [ ] How to trigger manual deployment
  - [ ] Parameters and options
- [ ] Write post-deployment verification section:
  - [ ] Health check steps
  - [ ] Site accessibility verification
  - [ ] Database connectivity check
  - [ ] Logs review
- [ ] Write rollback procedures section:
  - [ ] Worker version rollback (Cloudflare dashboard)
  - [ ] D1 Time Travel for database rollback
  - [ ] When to rollback vs. fix-forward
- [ ] Write monitoring and logs section:
  - [ ] GitHub Actions logs access
  - [ ] Cloudflare Workers logs
  - [ ] Cloudflare D1 metrics
  - [ ] Links to dashboards
- [ ] Add links to related documentation

### Validation

```bash
# Verify file created
cat docs/deployment/RUNBOOK.md

# Check formatting
cat docs/deployment/RUNBOOK.md | head -20

# Verify all sections present
grep -E "^##" docs/deployment/RUNBOOK.md
```

**Expected Result**: Complete runbook with all deployment scenarios documented

### Review Checklist

#### Content Completeness

- [ ] Pipeline overview is clear and accurate
- [ ] Initial setup procedures are step-by-step
- [ ] Routine deployment workflow matches actual .github/workflows/deploy.yml
- [ ] Manual deployment triggers explained
- [ ] Post-deployment verification is comprehensive
- [ ] Rollback procedures are safe and clear
- [ ] Monitoring guidance is actionable

#### Documentation Quality

- [ ] All commands are correct and tested
- [ ] Links to workflows and dashboards work
- [ ] Language is clear and concise
- [ ] Examples provided where helpful
- [ ] Formatting is consistent (headers, lists, code blocks)
- [ ] No broken internal links
- [ ] No placeholder text

### Commit Message

```bash
git add docs/deployment/RUNBOOK.md
git commit -m "📝 docs(deploy): add comprehensive deployment runbook

- Document complete CI/CD pipeline (quality → migrations → deployment)
- Add initial setup procedures and checklist
- Document routine deployment workflow (push to main)
- Add manual deployment trigger instructions
- Include post-deployment verification steps
- Document rollback procedures (Worker + D1 Time Travel)
- Add monitoring and logs access guidance

Part of Phase 4 - Commit 1/4
Story 0.7: CI/CD GitHub Actions"
```

---

## 📋 Commit 2: Create Secrets Setup Guide

**File**: `docs/deployment/secrets-setup.md` (new)
**Estimated Duration**: 55-75 minutes

### Implementation Tasks

- [ ] Create `docs/deployment/secrets-setup.md` file
- [ ] Add document header and overview
- [ ] Document required secrets:
  - [ ] `CLOUDFLARE_API_TOKEN` - purpose and scope
  - [ ] `CLOUDFLARE_ACCOUNT_ID` - where to find
  - [ ] `CLOUDFLARE_DATABASE_ID` - where to find
- [ ] Write Cloudflare API token creation section:
  - [ ] Navigate to Cloudflare dashboard
  - [ ] Create API token page
  - [ ] Required permissions (Workers:Edit, D1:Edit)
  - [ ] Token template recommendations
  - [ ] Copy token (warning: shown once)
- [ ] Write finding Account ID section:
  - [ ] Navigate to Workers dashboard
  - [ ] Locate Account ID in sidebar or URL
  - [ ] Copy Account ID
- [ ] Write finding Database ID section:
  - [ ] Navigate to D1 dashboard
  - [ ] Select database (DB)
  - [ ] Locate Database ID in details
  - [ ] Copy Database ID
- [ ] Write GitHub secrets configuration section:
  - [ ] Navigate to repository settings
  - [ ] Secrets and variables → Actions
  - [ ] Add repository secrets (all three)
  - [ ] Verify secrets are listed
- [ ] Write GitHub Environment setup section:
  - [ ] Create "production" environment
  - [ ] Add environment secrets (optional, vs. repository secrets)
  - [ ] Configure protection rules (optional for solo dev)
  - [ ] Set environment URL
- [ ] Write verification section:
  - [ ] Use `gh secret list` to verify
  - [ ] Check workflow runs don't have "secret not found" errors
- [ ] Write secret rotation section:
  - [ ] When to rotate (compromise, periodic, team changes)
  - [ ] How to generate new token
  - [ ] Update in GitHub
  - [ ] Verify workflows still work
- [ ] Add security best practices:
  - [ ] Principle of least privilege
  - [ ] Never commit secrets to git
  - [ ] Audit token usage periodically

### Validation

```bash
# Verify file created
cat docs/deployment/secrets-setup.md

# Verify secrets configured (without exposing values)
gh secret list

# Check environment exists
gh api repos/:owner/:repo/environments
```

**Expected Result**: Complete guide for setting up all required secrets from scratch

### Review Checklist

#### Content Completeness

- [ ] All three required secrets documented
- [ ] Cloudflare API token creation is step-by-step
- [ ] Required permissions clearly listed
- [ ] Account ID and Database ID location explained
- [ ] GitHub secrets configuration detailed
- [ ] Environment setup explained
- [ ] Verification steps provided
- [ ] Rotation procedures documented

#### Documentation Quality

- [ ] Steps are actionable and clear
- [ ] Links to Cloudflare dashboards included
- [ ] Security warnings where appropriate
- [ ] Formatting consistent
- [ ] No broken links
- [ ] No placeholder text

### Commit Message

```bash
git add docs/deployment/secrets-setup.md
git commit -m "📝 docs(deploy): add secrets setup guide for Cloudflare and GitHub

- Document all required secrets (API token, Account ID, Database ID)
- Add step-by-step Cloudflare API token creation
- Explain where to find Account ID and Database ID
- Document GitHub secrets configuration
- Add GitHub Environment setup for production
- Include verification steps
- Document secret rotation procedures
- Add security best practices

Part of Phase 4 - Commit 2/4
Story 0.7: CI/CD GitHub Actions"
```

---

## 📋 Commit 3: Create Troubleshooting Guide

**File**: `docs/deployment/troubleshooting.md` (new)
**Estimated Duration**: 55-75 minutes

### Implementation Tasks

- [ ] Create `docs/deployment/troubleshooting.md` file
- [ ] Add document header and overview
- [ ] Write Migration Failures section:
  - [ ] Issue: "No migrations to apply"
    - [ ] Diagnosis: Expected behavior when up-to-date
    - [ ] Resolution: No action needed, informational
  - [ ] Issue: Permission errors
    - [ ] Diagnosis: API token lacks D1 permissions
    - [ ] Resolution: Regenerate token with correct permissions
  - [ ] Issue: Schema conflicts
    - [ ] Diagnosis: Local and remote schema mismatch
    - [ ] Resolution: Generate new migration, test locally first
  - [ ] Issue: Migration failed mid-execution
    - [ ] Diagnosis: Check logs for specific error
    - [ ] Resolution: Use D1 Time Travel to rollback, fix migration, retry
- [ ] Write Deployment Failures section:
  - [ ] Issue: Network errors (502, 503, timeouts)
    - [ ] Diagnosis: Cloudflare API temporary issue
    - [ ] Resolution: Wait and retry workflow
  - [ ] Issue: Build failures (OpenNext)
    - [ ] Diagnosis: Check build logs in GitHub Actions
    - [ ] Resolution: Fix build errors locally first, push fix
  - [ ] Issue: Worker deployment errors
    - [ ] Diagnosis: wrangler errors in logs
    - [ ] Resolution: Check wrangler.jsonc config, bindings
  - [ ] Issue: Verification failures (health check)
    - [ ] Diagnosis: Worker deployed but not responding
    - [ ] Resolution: Check Worker logs, validate routes
- [ ] Write Workflow Issues section:
  - [ ] Issue: Quality checks failing
    - [ ] Diagnosis: Tests, lint, or typecheck failing
    - [ ] Resolution: Run locally, fix issues, push
  - [ ] Issue: Secrets not found
    - [ ] Diagnosis: GitHub secrets not configured
    - [ ] Resolution: Follow secrets-setup.md guide
  - [ ] Issue: Concurrency conflicts
    - [ ] Diagnosis: Multiple deployments running simultaneously
    - [ ] Resolution: Wait for current deployment to finish
- [ ] Write Post-Deployment Issues section:
  - [ ] Issue: Site not accessible
    - [ ] Diagnosis: DNS propagation, Worker routing
    - [ ] Resolution: Wait for DNS, check routes.json
  - [ ] Issue: Database connection errors
    - [ ] Diagnosis: D1 binding not configured
    - [ ] Resolution: Check wrangler.jsonc bindings, verify migration ran
  - [ ] Issue: 500 errors in production
    - [ ] Diagnosis: Application errors
    - [ ] Resolution: Check Worker logs, tail errors, fix and redeploy
- [ ] Write Debugging Commands section:
  - [ ] List workflow runs: `gh run list --limit 10`
  - [ ] View workflow logs: `gh run view [run-id] --log-failed`
  - [ ] Check secrets: `gh secret list`
  - [ ] View Worker logs: `wrangler tail`
  - [ ] Check D1 database: `wrangler d1 execute DB --remote --command "SELECT * FROM ..."`
- [ ] Add links to external resources:
  - [ ] Cloudflare Workers troubleshooting docs
  - [ ] Cloudflare D1 docs
  - [ ] GitHub Actions troubleshooting
  - [ ] wrangler CLI docs

### Validation

```bash
# Verify file created
cat docs/deployment/troubleshooting.md

# Test debugging commands work
gh run list --limit 5
gh secret list
```

**Expected Result**: Comprehensive troubleshooting guide covering all common deployment issues

### Review Checklist

#### Content Completeness

- [ ] Migration issues covered (4+ scenarios)
- [ ] Deployment issues covered (4+ scenarios)
- [ ] Workflow issues covered (3+ scenarios)
- [ ] Post-deployment issues covered (3+ scenarios)
- [ ] Each issue has diagnosis steps
- [ ] Each issue has resolution steps
- [ ] Debugging commands provided
- [ ] External resource links included

#### Documentation Quality

- [ ] Issues are organized by category
- [ ] Diagnosis → Resolution flow is clear
- [ ] Commands are tested and correct
- [ ] Language is concise and actionable
- [ ] Formatting consistent
- [ ] No broken links
- [ ] No placeholder text

### Commit Message

```bash
git add docs/deployment/troubleshooting.md
git commit -m "📝 docs(deploy): add troubleshooting guide for common deployment issues

- Document migration failures (permissions, schema conflicts, rollback)
- Add deployment failures (network, build, Worker, verification)
- Cover workflow issues (quality checks, secrets, concurrency)
- Document post-deployment issues (accessibility, database, errors)
- Include diagnosis and resolution steps for each issue
- Add debugging commands (gh, wrangler)
- Link to Cloudflare and GitHub documentation

Part of Phase 4 - Commit 3/4
Story 0.7: CI/CD GitHub Actions"
```

---

## 📋 Commit 4: Update Tracking Documents

**Files**: `docs/specs/epics/epic_0/EPIC_TRACKING.md` (update), `README.md` (update)
**Estimated Duration**: 40-60 minutes

### Implementation Tasks

- [ ] Update `docs/specs/epics/epic_0/EPIC_TRACKING.md`:
  - [ ] Find Story 0.7 row in tracking table
  - [ ] Update Progress to "100%"
  - [ ] Update Status to "✅ COMPLETED"
  - [ ] Add completion date
  - [ ] Update Notes with Phase 4 completion
  - [ ] Add link to deployment documentation directory
  - [ ] Update overall Epic progress if Story 0.7 was last incomplete story
- [ ] Update `README.md`:
  - [ ] Add "Deployment" section (or update existing)
  - [ ] Document that CI/CD is fully automated
  - [ ] Link to deployment runbook (`docs/deployment/RUNBOOK.md`)
  - [ ] Link to troubleshooting guide (`docs/deployment/troubleshooting.md`)
  - [ ] Update project status badges if applicable
  - [ ] Mention GitHub Actions workflows

### Validation

```bash
# Verify EPIC_TRACKING.md updated
cat docs/specs/epics/epic_0/EPIC_TRACKING.md | grep -A 2 "Story 0.7"

# Verify Story 0.7 is at 100%
cat docs/specs/epics/epic_0/EPIC_TRACKING.md | grep "Story 0.7.*100%"

# Verify README.md has Deployment section
cat README.md | grep -i deployment

# Check links work
cat README.md | grep "docs/deployment"
```

**Expected Result**: Tracking documents reflect Story 0.7 completion and link to deployment documentation

### Review Checklist

#### EPIC_TRACKING.md Updates

- [ ] Story 0.7 Progress shows "100%"
- [ ] Story 0.7 Status is "✅ COMPLETED"
- [ ] Completion date added (today's date)
- [ ] Notes mention Phase 4 completion
- [ ] Link to deployment docs added
- [ ] Epic overall progress updated if applicable

#### README.md Updates

- [ ] "Deployment" section exists
- [ ] CI/CD automation status documented
- [ ] Link to RUNBOOK.md is correct
- [ ] Link to troubleshooting.md is correct
- [ ] Formatting is consistent with rest of README
- [ ] No broken links

### Commit Message

```bash
git add docs/specs/epics/epic_0/EPIC_TRACKING.md README.md
git commit -m "📝 docs(tracking): mark Story 0.7 as complete and update README

- Update EPIC_TRACKING.md: Story 0.7 to 100% and ✅ COMPLETED
- Add completion date and Phase 4 completion notes
- Link to deployment documentation from EPIC_TRACKING.md
- Add Deployment section to README.md
- Document automated CI/CD pipeline status
- Link to runbook and troubleshooting guides from README

Part of Phase 4 - Commit 4/4
Story 0.7: CI/CD GitHub Actions - COMPLETED ✅"
```

---

## ✅ Final Phase Validation

After all 4 commits:

### Complete Phase Checklist

- [ ] All 4 commits completed
- [ ] All 3 deployment guides created (runbook, secrets, troubleshooting)
- [ ] EPIC_TRACKING.md shows Story 0.7 complete
- [ ] README.md links to deployment documentation
- [ ] All documentation files have correct formatting
- [ ] All links in documentation work
- [ ] All commands in documentation are tested

### Final Validation Commands

```bash
# Verify all files exist
ls -la docs/deployment/

# Should show: RUNBOOK.md, secrets-setup.md, troubleshooting.md

# Verify tracking updated
cat docs/specs/epics/epic_0/EPIC_TRACKING.md | grep "Story 0.7"

# Verify README updated
cat README.md | grep -A 3 "Deployment"

# Check git log shows all 4 commits
git log --oneline --grep "Phase 4"
```

**Phase 4 is complete when all checkboxes are checked! 🎉**

**Story 0.7 is complete! CI/CD pipeline is fully documented and operational! 🚀**
