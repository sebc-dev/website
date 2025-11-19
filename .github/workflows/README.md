# GitHub Actions CI/CD Workflows

This document describes all GitHub Actions workflows configured in this project, their purposes, and responsibilities.

## Overview

The CI/CD pipeline is organized into **3 main workflows** with clear separation of concerns:

1. **Configuration Validation** (`validation.yml`) - Infrastructure & configuration checks
2. **Quality & Tests** (`quality.yml`) - Code quality, tests, and build verification
3. **Deployment** (`deploy.yml`) - Deployment to Cloudflare Workers

---

## Workflow: Configuration Validation

**File**: `.github/workflows/validation.yml`

**Purpose**: Validate project configuration consistency and infrastructure setup before code quality checks.

**Triggers**:

- Pull requests to `main`, `dev`, `develop`
- Pushes to `main`, `dev`, `develop`
- Manual trigger (`workflow_dispatch`)

**Jobs & Responsibilities**:

| Job                               | Purpose                                                                                          | Critical | Notes                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------ |
| **validate-env-vars**             | Verify environment variables consistency between `.env.example`, workflows, and code             | Yes      | Prevents missing or misconfigured secrets              |
| **validate-dependency-placement** | Ensure runtime imports don't use devDependencies                                                 | Yes      | Prevents runtime errors from missing prod dependencies |
| **validate-wrangler**             | Validate `wrangler.jsonc` configuration for nodejs_compat flag, bindings, and compatibility_date | Yes      | Critical for Cloudflare Workers deployment             |
| **validate-typescript**           | Run TypeScript compiler (`tsc --noEmit`) to catch type errors                                    | Yes      | Validates type safety before code quality checks       |
| **validation-summary**            | Aggregate all validation results for branch protection                                           | Yes      | Single status check for GitHub branch rules            |

**Exit Codes**:

- `0` = All validations passed
- `1` = Critical validation failed

**When to Check**: Before pushing code or opening PRs

---

## Workflow: Quality & Tests

**File**: `.github/workflows/quality.yml`

**Purpose**: Execute comprehensive code quality checks, tests, and build validation on every PR and push.

**Triggers**:

- Pull requests to `main`, `develop`
- Pushes to `main`, `develop`
- Weekly schedule (Monday 2 AM UTC) for mutation testing

**Jobs & Responsibilities**:

| Job                  | Purpose                                                                   | Critical | Timeout |
| -------------------- | ------------------------------------------------------------------------- | -------- | ------- |
| **detect-changes**   | Identify changed files to conditionally run mutation testing              | No       | -       |
| **standard-quality** | ESLint, Prettier, architecture validation, unit tests, coverage           | Yes      | 20 min  |
| **e2e-tests**        | Run Playwright E2E tests with browser                                     | Yes      | 30 min  |
| **mutation-testing** | Validate test quality via Stryker mutations (conditional)                 | No       | 60 min  |
| **build**            | Build Next.js app + generate OpenNext output + validate Cloudflare output | Yes      | 30 min  |
| **ci-success**       | Aggregate results for branch protection                                   | Yes      | -       |

**Build Job Steps** (in order):

1. Checkout code
2. Setup pnpm and Node.js
3. Install dependencies
4. `pnpm build` - Next.js build
5. `npx @opennextjs/cloudflare build` - Generate Worker output
6. `bash scripts/validate-cloudflare-output.sh` - Validate Worker bundle size & structure
7. `pnpm bundle:analyze` - Analyze bundle with @next/bundle-analyzer
8. Upload build artifacts

**Conditional Mutation Testing**:

- **Always runs** on scheduled jobs and pushes to `main`/`develop`
- **Runs on PR** only if critical files changed (e.g., `app/`, `src/lib/server/`)
- **Purpose**: Detect underutilized tests before code merges

**Exit Codes**:

- `0` = All quality checks passed
- `1` = Critical quality check failed

**When to Check**: Automatically on every PR and push

---

## Workflow: Deployment

**File**: `.github/workflows/deploy.yml`

**Purpose**: Deploy validated code to Cloudflare Workers with safety checks and health verification.

**Triggers**:

- Manual trigger (`workflow_dispatch`) with optional inputs
- Automatic trigger after `quality.yml` completes successfully (only on `main`/`develop`)

**Manual Trigger Options**:

- `skip_verification` (bool): Skip health check after deployment
- `dry_run` (bool): Run without actually deploying

**Jobs & Responsibilities**:

| Job                    | Purpose                                                        | Critical |
| ---------------------- | -------------------------------------------------------------- | -------- |
| **check-trigger**      | Validate workflow trigger and determine deployment eligibility | Yes      |
| **deploy**             | Build + apply D1 migrations + deploy to Cloudflare Workers     | Yes      |
| **verify-deployment**  | Health check with retry logic (3 attempts, 10s delay)          | Yes      |
| **deployment-logging** | Create artifacts, logs, and GitHub deployment records          | No       |

**Deploy Job Steps** (in order):

1. Checkout code
2. Setup pnpm and Node.js
3. Install dependencies
4. `pnpm build` - Build Next.js application
5. `npx @opennextjs/cloudflare build` - Generate OpenNext Worker output
6. **Apply D1 Migrations** - `wrangler d1 migrations apply DB --remote --skip-migrations-already-applied`
7. Deploy via `wrangler-action@v3`

**Important**: D1 migrations are applied **BEFORE** Worker deployment to ensure schema compatibility.

**Environment Protection**:

- Requires manual approval from `production` environment reviewers
- Secrets isolated per environment (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, etc.)

**Rollback Procedure** (if health check fails):

1. Visit Cloudflare Dashboard → Workers → [Worker Name]
2. Go to "Deploy History"
3. Find last successful deployment
4. Click "Rollback to this version"
5. Investigate error in Cloudflare Logs

**Exit Codes**:

- `0` = Deployment successful + health check passed
- `1` = Deployment or health check failed

**When to Deploy**: After `quality.yml` passes on `main`/`develop`, or manually via `workflow_dispatch`

---

## Local Quality System

**Pre-commit Hook** (via Husky): `.husky/pre-commit`

- Runs lightweight validation before commits
- Executes `.claude/quality-system/hooks/quality-check.sh`
- Skips slow checks (TypeScript, tests, package validation)
- Environment variables checked (critical)
- lint-staged on modified files (ESLint + Prettier on staged files only)

**Pre-push Hook** (via Husky): `.husky/pre-push`

- Runs unit tests only before push
- Fast feedback before CI pipeline

**Quality Check Script**: `.claude/quality-system/hooks/quality-check.sh`

- Comprehensive validation with context detection
- Conditional execution based on modified files
- Exit on critical failures, warn on non-critical

---

## Check Duplication & Overlap Matrix

| Check                                 | Pre-commit  | Pre-push | validation.yml |      quality.yml      | deploy.yml |
| ------------------------------------- | :---------: | :------: | :------------: | :-------------------: | :--------: |
| **Environment Variables**             |      ✓      |    ✗     |       ✓        |           ✗           |     ✗      |
| **TypeScript (tsc)**                  | ✗ (skipped) |    ✗     |       ✓        | ✓ (implicit in build) |     ✗      |
| **ESLint (staged)**                   | ✓ (staged)  |    ✗     |       ✗        |           ✗           |     ✗      |
| **ESLint (full)**                     |      ✗      |    ✗     |       ✗        |           ✓           |     ✗      |
| **Prettier (staged)**                 | ✓ (staged)  |    ✗     |       ✗        |           ✗           |     ✗      |
| **Prettier (full)**                   |      ✗      |    ✗     |       ✗        |           ✓           |     ✗      |
| **Architecture (dependency-cruiser)** |      ✓      |    ✗     |       ✗        |           ✓           |     ✗      |
| **Unit Tests (Vitest)**               | ✗ (skipped) |    ✓     |       ✗        |           ✓           |     ✗      |
| **E2E Tests (Playwright)**            |      ✗      |    ✗     |       ✗        |           ✓           |     ✗      |
| **Mutation Tests (Stryker)**          |      ✗      |    ✗     |       ✗        |    ✓ (conditional)    |     ✗      |
| **Build (Next.js)**                   |      ✗      |    ✗     |       ✗        |           ✓           |     ✓      |
| **OpenNext Validation**               |      ✗      |    ✗     |       ✗        |           ✓           |     ✓      |
| **Wrangler Config**                   |      ✗      |    ✗     |       ✓        |           ✗           |     ✗      |
| **D1 Migrations**                     |      ✗      |    ✗     |       ✗        |           ✗           |     ✓      |
| **Health Check**                      |      ✗      |    ✗     |       ✗        |           ✗           |     ✓      |

**Legend**:

- ✓ = Check performed
- ✗ = Not performed
- Staged = Only on staged files
- Implicit = Included in another check
- Conditional = Runs under specific conditions
- Skipped = Configured to skip in this context

---

## Optimization Notes

### Why Checks Are Split Across Contexts

1. **Pre-commit (fast feedback)**:
   - Environment variables (quick)
   - ESLint + Prettier on staged files only (quick)
   - Architecture validation on modified files (quick)
   - Skips TypeScript, tests, and package validation (slow)

2. **Pre-push (before network)**:
   - Unit tests (catches bugs before CI)
   - Skips slow checks (TypeScript, E2E)

3. **CI (comprehensive)**:
   - Configuration validation (all checks)
   - TypeScript compilation (full codebase)
   - ESLint + Prettier (full codebase)
   - All unit tests + E2E tests
   - Build verification

4. **Deployment (production safety)**:
   - D1 migrations applied before Worker deployment
   - Health check with retries
   - Rollback instructions

### Performance Improvements

- **Removed** TypeScript validation from pre-commit (~3-5 minutes saved per commit)
- **Removed** dead code for package validation (cleanup)
- **Conditional** mutation testing (runs only on relevant changes)
- **Staged files** in pre-commit (faster than full codebase)

---

## Troubleshooting

### Workflow Failures

1. **validation.yml fails**:
   - Check environment variables in `.env.example`
   - Verify Wrangler configuration (`wrangler.jsonc`)
   - Run locally: `bash scripts/validate-wrangler-config.sh`

2. **quality.yml fails**:
   - Run locally: `pnpm install && pnpm lint && pnpm test && pnpm build`
   - Check Cloudflare output: `bash scripts/validate-cloudflare-output.sh`
   - Verify Worker bundle size < 1MB

3. **deploy.yml fails**:
   - Check D1 migrations: `wrangler d1 migrations list DB --remote`
   - Verify Cloudflare credentials (API token, account ID)
   - Check health check: curl the Worker URL manually
   - Review deployment logs in Cloudflare Dashboard

### Running Checks Locally

```bash
# Full quality check (same as quality.yml)
pnpm lint && pnpm test:coverage && pnpm build

# Validation checks (same as validation.yml)
bash scripts/validate-wrangler-config.sh
bash scripts/validate-cloudflare-output.sh
node scripts/validate-env-vars.cjs

# Pre-commit simulation
bash .claude/quality-system/hooks/quality-check.sh
```

---

## Branch Protection Rules

Recommended GitHub branch protection rules for `main` and `develop`:

```yaml
Require status checks to pass before merging:
  - Configuration Validation / validation-summary
  - Quality & Tests / ci-success
```

This ensures all validation and quality checks pass before code merges.

---

## E2E Tests on Preview Deployments

**Files**:

- `.github/workflows/e2e-test.yml` (Unprivileged)
- `.github/workflows/e2e-report.yml` (Privileged)
- `.github/workflows/e2e-reminder.yml` (PR automation)

**Purpose**: Run E2E tests on Cloudflare preview deployments triggered by PR comments.

**Security Model**: Two-workflow pattern (see [E2E Workflow Security](../docs/deployment/e2e-workflow-security.md))

### How to Trigger

Comment `@e2e` on any PR to trigger E2E tests on a preview deployment.

### Workflow Responsibilities

| Workflow             | Permissions | Purpose                                                   |
| -------------------- | ----------- | --------------------------------------------------------- |
| **e2e-test.yml**     | Read-only   | Deploy preview, run tests, upload results as artifacts    |
| **e2e-report.yml**   | Write       | Post comments, create status checks (never executes code) |
| **e2e-reminder.yml** | Write       | Auto-comment on PRs to main requesting E2E tests          |

### CodeQL Security Alerts

This repository contains **documented and accepted** CodeQL security warnings in `e2e-test.yml`.

**See**: [`.github/CODEQL_SUPPRESSIONS.md`](../CODEQL_SUPPRESSIONS.md) for detailed explanation of why these warnings are safe.

**Summary**: The two-workflow pattern intentionally executes untrusted PR code in an isolated environment with minimal permissions. All privileged operations (comments, status checks) are handled by a separate workflow that never executes PR code.

---

**Last Updated**: 2025-11-19
**CI/CD Version**: 2.1 (E2E + Security Hardening)
