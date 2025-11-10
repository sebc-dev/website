# Phase 2 - Atomic Implementation Plan

**Objective**: Create automated deployment workflow to Cloudflare Workers with quality gate integration and deployment verification

---

## 🎯 Overview

### Why an Atomic Approach?

The implementation is split into **5 independent commits** to:

✅ **Facilitate review** - Each commit focuses on a single responsibility (workflow structure, triggers, deployment, verification, logging)
✅ **Enable rollback** - If a deployment step has issues, revert it without breaking the entire workflow
✅ **Progressive validation** - Workflow syntax validates at each step
✅ **Security focus** - Secrets handling can be reviewed in isolation
✅ **Continuous testing** - Each commit can be tested via manual dispatch

### Global Strategy

```
[Commit 1]    →    [Commit 2]    →    [Commit 3]    →    [Commit 4]    →    [Commit 5]
Structure          Triggers           Deployment         Verification       Logging
↓                  ↓                  ↓                  ↓                  ↓
YAML syntax ✓      Trigger logic ✓    Wrangler deploy ✓  Health check ✓     Artifacts ✓
```

### Integration with Existing Pipeline

```
[Quality Workflow]  →  [Migration Workflow]  →  [Deploy Workflow (Phase 2)]
                                                          ↓
                                                  [Cloudflare Workers]
```

---

## 📦 The 5 Atomic Commits

### Commit 1: Create Deployment Workflow Structure

**Files**:

- `.github/workflows/deploy.yml` (new)

**Size**: ~40 lines

**Duration**: 30-45 min (implementation) + 20-30 min (review)

**Content**:

- Basic workflow file structure
- Workflow name and description
- Minimal permissions (contents: read)
- Concurrency group for deployment
- Placeholder jobs structure

**Why it's atomic**:

- Single responsibility: Establish workflow file
- No external dependencies yet
- Can be validated for YAML syntax independently
- Sets foundation for all subsequent commits

**Technical Validation**:

```bash
# Validate YAML syntax
pnpm exec actionlint .github/workflows/deploy.yml

# Verify file structure
cat .github/workflows/deploy.yml
```

**Expected Result**: Valid YAML file with basic workflow structure, no syntax errors

**Review Criteria**:

- [ ] YAML syntax is valid
- [ ] Workflow name is descriptive
- [ ] Permissions follow least-privilege principle
- [ ] Concurrency group prevents overlapping deployments
- [ ] File structure matches GitHub Actions best practices

---

### Commit 2: Configure Workflow Triggers and Dependencies

**Files**:

- `.github/workflows/deploy.yml` (modify)

**Size**: ~30 lines added/modified

**Duration**: 40-60 min (implementation) + 25-35 min (review)

**Content**:

- `workflow_dispatch` trigger for manual deployments
- `workflow_run` trigger to run after quality workflow succeeds
- Input parameters for manual trigger (optional flags)
- Conditional logic based on trigger type
- Dependencies on migration workflow completion

**Why it's atomic**:

- Single responsibility: Define when deployment runs
- Isolated trigger configuration
- Can be tested manually without actual deployment
- No Cloudflare interaction yet

**Technical Validation**:

```bash
# Validate workflow syntax
pnpm exec actionlint .github/workflows/deploy.yml

# Test manual trigger (dry-run, no actual deployment yet)
gh workflow run deploy.yml
```

**Expected Result**: Workflow can be triggered manually, syntax validates correctly

**Review Criteria**:

- [ ] `workflow_dispatch` configured for manual deployments
- [ ] `workflow_run` configured to trigger after quality workflow
- [ ] Conditional logic correctly handles different trigger types
- [ ] Dependencies on migration workflow are explicit
- [ ] Input parameters are well-documented

---

### Commit 3: Add Cloudflare Deployment Job

**Files**:

- `.github/workflows/deploy.yml` (modify)

**Size**: ~50 lines added

**Duration**: 60-90 min (implementation) + 35-45 min (review)

**Content**:

- `deploy` job definition
- Checkout code step
- Setup pnpm and Node.js
- Build step for OpenNext
- Cloudflare Workers deployment using `cloudflare/wrangler-action@v3`
- Secrets configuration (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)
- Deployment timeout (10 minutes)

**Why it's atomic**:

- Single responsibility: Deploy to Cloudflare
- Self-contained deployment logic
- Can be tested in isolation (manual trigger)
- Core functionality of the phase

**Technical Validation**:

```bash
# Validate workflow syntax
pnpm exec actionlint .github/workflows/deploy.yml

# Test deployment (requires secrets configured)
gh workflow run deploy.yml

# Check deployment status
gh run list --workflow=deploy.yml --limit 1
```

**Expected Result**: Application successfully deploys to Cloudflare Workers

**Review Criteria**:

- [ ] Uses official `cloudflare/wrangler-action@v3`
- [ ] Secrets are properly referenced (not hardcoded)
- [ ] Build step completes successfully before deployment
- [ ] Deployment timeout is reasonable (10 min)
- [ ] Job has appropriate permissions
- [ ] Error handling for deployment failures

---

### Commit 4: Implement Deployment Verification and Health Check

**Files**:

- `.github/workflows/deploy.yml` (modify)

**Size**: ~35 lines added

**Duration**: 45-70 min (implementation) + 30-40 min (review)

**Content**:

- Post-deployment verification step
- HTTP health check to deployed Worker URL
- Retry logic for health check (3 attempts, 10s delay)
- Deployment success/failure reporting
- Rollback instructions in case of failure

**Why it's atomic**:

- Single responsibility: Verify deployment success
- Independent verification logic
- Can be tested after deployment
- Improves deployment reliability

**Technical Validation**:

```bash
# Validate workflow syntax
pnpm exec actionlint .github/workflows/deploy.yml

# Test full deployment with verification
gh workflow run deploy.yml

# Check verification step output
gh run view --log
```

**Expected Result**: Health check successfully validates deployed Worker is accessible

**Review Criteria**:

- [ ] Health check targets correct Worker URL
- [ ] Retry logic handles transient failures (CDN propagation)
- [ ] Success criteria are clearly defined (HTTP 200)
- [ ] Failure conditions trigger appropriate actions
- [ ] Verification timeout is reasonable
- [ ] Output clearly indicates success or failure

---

### Commit 5: Add Deployment Logging and Artifact Upload

**Files**:

- `.github/workflows/deploy.yml` (modify)

**Size**: ~30 lines added

**Duration**: 35-50 min (implementation) + 20-30 min (review)

**Content**:

- Deployment summary output (URL, timestamp, commit SHA)
- Upload deployment logs as artifacts
- Deployment metrics collection (duration, size)
- GitHub deployment environment tracking
- Link to deployed Worker in workflow summary

**Why it's atomic**:

- Single responsibility: Observability and logging
- Non-critical enhancement
- Can be added without affecting core deployment
- Improves debugging and tracking

**Technical Validation**:

```bash
# Validate workflow syntax
pnpm exec actionlint .github/workflows/deploy.yml

# Test full deployment with logging
gh workflow run deploy.yml

# Check artifacts uploaded
gh run view --log | grep -A 5 "Upload artifact"

# View deployment summary
gh run view
```

**Expected Result**: Deployment logs and metrics are captured, artifacts are uploaded

**Review Criteria**:

- [ ] Deployment summary includes all key information
- [ ] Artifacts retention is set appropriately (14 days)
- [ ] Logs don't expose sensitive information
- [ ] Metrics are accurate (deployment duration, bundle size)
- [ ] GitHub deployment environment is updated
- [ ] Workflow summary is user-friendly

---

## 🔄 Implementation Workflow

### Step-by-Step

1. **Read specification**: Review PHASES_PLAN.md and story_0.7.md
2. **Setup environment**: Configure GitHub secrets (ENVIRONMENT_SETUP.md)
3. **Implement Commit 1**: Create workflow structure
4. **Validate Commit 1**: Check YAML syntax
5. **Commit Commit 1**: Use provided commit message template
6. **Implement Commit 2**: Configure triggers
7. **Validate Commit 2**: Test manual trigger
8. **Commit Commit 2**: Commit trigger configuration
9. **Implement Commit 3**: Add deployment job
10. **Validate Commit 3**: Test deployment to Cloudflare
11. **Commit Commit 3**: Commit deployment logic
12. **Implement Commit 4**: Add verification
13. **Validate Commit 4**: Test health check
14. **Commit Commit 4**: Commit verification step
15. **Implement Commit 5**: Add logging
16. **Validate Commit 5**: Verify artifacts
17. **Commit Commit 5**: Commit logging enhancement
18. **Final validation**: Complete VALIDATION_CHECKLIST.md

### Validation at Each Step

After each commit:

```bash
# Validate YAML syntax
pnpm exec actionlint .github/workflows/deploy.yml

# (Optional) Test workflow manually
gh workflow run deploy.yml

# Check workflow run status
gh run list --workflow=deploy.yml --limit 1

# View logs
gh run view --log
```

All must pass before moving to next commit.

---

## 📊 Commit Metrics

| Commit                     | Files | Lines    | Implementation | Review    | Total      |
| -------------------------- | ----- | -------- | -------------- | --------- | ---------- |
| 1. Workflow Structure      | 1     | ~40      | 30-45 min      | 20-30 min | 50-75 min  |
| 2. Triggers & Dependencies | 1     | ~30      | 40-60 min      | 25-35 min | 65-95 min  |
| 3. Cloudflare Deployment   | 1     | ~50      | 60-90 min      | 35-45 min | 95-135 min |
| 4. Deployment Verification | 1     | ~35      | 45-70 min      | 30-40 min | 75-110 min |
| 5. Logging & Artifacts     | 1     | ~30      | 35-50 min      | 20-30 min | 55-80 min  |
| **TOTAL**                  | **1** | **~185** | **3.5-5h**     | **2-3h**  | **5.5-8h** |

---

## ✅ Atomic Approach Benefits

### For Developers

- 🎯 **Clear focus**: Build workflow incrementally (structure → triggers → deploy → verify → log)
- 🧪 **Testable**: Each commit can be validated via actionlint and manual trigger
- 📝 **Documented**: Each commit has clear purpose and scope

### For Reviewers

- ⚡ **Fast review**: 20-45 min per commit (max 135 min for deployment commit)
- 🔍 **Focused**: Single responsibility to check per commit
- ✅ **Quality**: Easier to spot security issues (secrets handling in Commit 3)

### For the Project

- 🔄 **Rollback-safe**: Revert problematic commits without breaking entire deployment
- 📚 **Historical**: Git history shows clear progression from basic workflow to full deployment
- 🏗️ **Maintainable**: Future changes can target specific commits (e.g., update wrangler version in Commit 3)

---

## 📝 Best Practices

### Commit Messages

Format:

```
feat(ci): <short description> (max 50 chars)

- Point 1: detailed change
- Point 2: rationale or context
- Point 3: technical note if needed

Part of Phase 2 - Commit X/5
```

Types: `feat` (new deployment workflow), `fix`, `refactor`, `chore`

Examples:

- `feat(ci): create deployment workflow structure`
- `feat(ci): configure deployment triggers and dependencies`
- `feat(ci): add Cloudflare Workers deployment job`
- `feat(ci): implement post-deployment verification`
- `feat(ci): add deployment logging and artifacts`

### Review Checklist

Before committing:

- [ ] Workflow syntax is valid (actionlint passes)
- [ ] No hardcoded secrets or sensitive data
- [ ] Follows GitHub Actions best practices
- [ ] Permissions are minimal
- [ ] Comments explain complex logic
- [ ] Tested via manual trigger (if applicable)

---

## ⚠️ Important Points

### Do's

- ✅ Follow the commit order strictly (dependencies matter)
- ✅ Validate YAML syntax after each commit
- ✅ Test workflow via manual dispatch after Commits 2, 3, 4, 5
- ✅ Use provided commit message templates
- ✅ Configure GitHub secrets before Commit 3
- ✅ Review security implications (secrets handling)

### Don'ts

- ❌ Skip commits or combine them (each has distinct purpose)
- ❌ Commit without validating YAML syntax
- ❌ Hardcode secrets or API tokens
- ❌ Add features not in the spec
- ❌ Deploy to production without Phase 3 (environment management)

---

## 🔒 Security Considerations

### Secrets Handling

- **CLOUDFLARE_API_TOKEN**: Never logged, only used in wrangler-action
- **CLOUDFLARE_ACCOUNT_ID**: Less sensitive, but still use secrets
- Secrets are scoped to workflow, not exposed in logs
- Use `${{ secrets.NAME }}` syntax, never echo/print secrets

### Permissions

- Minimal workflow permissions (contents: read)
- Deployment job inherits permissions
- No write permissions unless needed for GitHub deployments

### Deployment Safety

- Migrations run before deployment (dependency)
- Health check validates deployment success
- Rollback procedures documented
- No automatic deployment to production (manual trigger in Phase 2)

---

## ❓ FAQ

**Q: What if a commit is too big?**
A: Commit 3 (deployment) is the largest (~50 lines). If needed, split into "setup wrangler-action" and "configure deployment" sub-commits.

**Q: Can I test deployments without pushing?**
A: Yes! Use `workflow_dispatch` (manual trigger) to test from feature branch after Commit 2.

**Q: What if deployment fails?**
A: Commit 4 includes health check verification. Failed deployments are detected and reported. See ENVIRONMENT_SETUP.md for troubleshooting.

**Q: Do I need to wait for quality workflow?**
A: For automatic deployments (workflow_run), yes. For manual deployments (workflow_dispatch), no - but best practice is to ensure quality checks pass first.

**Q: What about staging vs production?**
A: Phase 2 establishes basic deployment. Environment management (staging/production) is added in Phase 3.

**Q: How do I rollback a failed deployment?**
A: Cloudflare Workers supports versioning. Rollback instructions are in ENVIRONMENT_SETUP.md. Phase 3 will add automated rollback support.

---

## 🔗 Related Documentation

- [Story 0.7 Specification](../../story_0.7.md)
- [PHASES_PLAN.md](../PHASES_PLAN.md)
- [Phase 1 - Migrations](../phase_1/)
- [COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md)
- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)

---

**Ready to implement! Start with Commit 1 and validate after each step. 🚀**
