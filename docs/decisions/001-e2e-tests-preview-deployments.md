# ADR 001: Use Preview Deployments for E2E Tests in CI

**Status**: Archivé (2025-01-19) - Remplacé par ADR 002
**Date**: 2025-11-17
**Tracking**: [#35](https://github.com/sebc-dev/website/issues/35)

## Context

E2E tests are currently disabled in CI due to server initialization timeout when using the OpenNext Cloudflare adapter with `wrangler dev`. The server takes >60 seconds to initialize in GitHub Actions, causing tests to timeout.

### Current Situation

- ❌ E2E tests disabled in `.github/workflows/quality.yml`
- ✅ Tests work perfectly in local development (~5-10s startup)
- ✅ All other CI checks pass (unit tests, lint, build)
- ⚠️ Risk of regression without E2E tests in CI

### Problem Statement

How can we run E2E tests in CI without being blocked by slow `wrangler dev` initialization?

## Decision

We will use **Cloudflare preview deployments** for E2E testing instead of running a local development server in CI.

### Approach

1. Deploy application to Cloudflare Workers (preview environment)
2. Wait for deployment to be ready
3. Run Playwright tests against the preview URL
4. Clean up preview deployment after tests complete

## Rationale

### Why Preview Deployments?

**Eliminates Root Cause**

- No need to run `wrangler dev` in CI
- Tests run against actual Cloudflare Workers environment
- No startup timeout issues

**Better Testing Environment**

- Tests the real OpenNext + Cloudflare stack
- More representative of production
- Catches deployment-specific issues

**Aligns with Industry Best Practices**

- Vercel, Netlify, and other edge platforms use this pattern
- Preview environments are a standard CI/CD practice
- Well-documented and battle-tested approach

### Alternatives Considered

#### ❌ Option 1: Increase Timeout

**Pros**: Simple, quick fix
**Cons**: Doesn't solve root cause, wastes CI minutes, may still fail intermittently

#### ❌ Option 2: Optimize wrangler dev

**Pros**: Would fix the issue at the source
**Cons**: Complex, may not be solvable, maintenance burden, CI-specific problem

#### ✅ Option 3: Preview Deployments (Selected)

**Pros**: Permanent solution, better environment, industry standard
**Cons**: Initial setup time (~3-4h), uses Cloudflare deployment quota

## Implementation Plan

### Phase 1: Setup Preview Deployments (1-2h)

- Create `.github/workflows/e2e.yml` workflow
- Configure Wrangler deploy with `--env preview`
- Set up environment-specific configuration
- Test deployment process

### Phase 2: Configure E2E Tests (1h)

- Update Playwright config to use dynamic base URL
- Add wait-for-deployment script
- Configure test retries for network issues
- Update test scripts

### Phase 3: Integration & Cleanup (30min)

- Add cleanup step to remove preview deployments
- Update PR template to mention E2E tests
- Document new workflow in README
- Remove disabled E2E step from quality.yml

## Consequences

### Positive

- ✅ E2E tests will run reliably in CI
- ✅ Tests will be more representative of production
- ✅ No more timeout issues
- ✅ Each PR gets isolated test environment
- ✅ Follows industry best practices

### Negative

- ⚠️ Requires initial setup time (3-4 hours)
- ⚠️ Uses Cloudflare deployment quota (monitor usage)
- ⚠️ Slightly longer test execution time (includes deployment)
- ⚠️ Need to ensure cleanup to avoid orphaned deployments

### Neutral

- 🔄 Preview deployments add complexity but improve reliability
- 🔄 CI workflow split into quality.yml (fast checks) and e2e.yml (preview tests)

## Success Metrics

- E2E tests run successfully in CI on every PR
- Test execution time < 5 minutes (including deployment)
- Zero timeout failures
- Preview environments cleaned up automatically (no orphans)
- Documentation updated and team onboarded

## Timeline

- **Now**: Decision documented (ADR created)
- **2-3 days**: Story 1.3 completed and merged
- **After merge**: Implement preview deployment approach (half-day)
- **Target**: E2E tests re-enabled in CI within 1 week

## References

- GitHub Issue: [#35 - Optimize OpenNext/Cloudflare startup time in CI](https://github.com/sebc-dev/website/issues/35)
- Commit that disabled tests: [3115e53](https://github.com/sebc-dev/website/commit/3115e53)
- OpenNext Cloudflare: https://opennext.js.org/cloudflare
- Wrangler deployments: https://developers.cloudflare.com/workers/wrangler/commands/#deploy
- Similar patterns: Vercel Preview Deployments, Netlify Deploy Previews
