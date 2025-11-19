# CodeQL Security Alert Suppressions

This document explains intentional CodeQL security alert suppressions in this repository.

## E2E Test Workflow (e2e-test.yml)

### Alert: "Potential execution of untrusted code on a privileged workflow"

**Affected Lines**: 107, 124, 147, 154, 205

**Status**: ACCEPTED RISK - This is an intentional and safe implementation of GitHub's recommended two-workflow security pattern.

### Security Model

This workflow (`e2e-test.yml`) intentionally executes untrusted code from Pull Requests in an **isolated, unprivileged environment**:

1. **Limited Permissions**: `contents: read` only - cannot write to repository, PRs, or issues
2. **No Privileged Access**: Cannot access repository secrets except those explicitly passed for deployment
3. **Isolated Execution**: All write operations handled by separate privileged workflow (`e2e-report.yml`)
4. **Artifact-Based Communication**: Results passed via artifacts, not direct workflow outputs

### Why This Is Safe

#### Line 107: Setup Cloudflare credentials

- **Risk**: Exposes `CLOUDFLARE_API_TOKEN` to untrusted PR code
- **Mitigation**:
  - Token is scoped to preview deployments only
  - Cannot access production or other sensitive resources
  - Malicious code could only create/delete preview deployments
  - No write access to repository means token cannot be exfiltrated via commits/comments

#### Line 124: Wait for deployment URL

- **Risk**: Uses `DEPLOYMENT_URL` from PR-controlled script
- **Mitigation**:
  - Only used for health check with `curl -sf` (fails on invalid URLs)
  - Cannot execute arbitrary commands or access sensitive data
  - Worst case: deployment check fails and workflow exits

#### Line 147: Run E2E tests

- **Risk**: Executes Playwright tests from PR code
- **Mitigation**:
  - Tests run against isolated preview deployment
  - No write permissions to repository
  - Results uploaded as artifacts for privileged workflow to process
  - Test failures do not compromise security

#### Line 154: Upload test results

- **Risk**: Uses PR number from untrusted source
- **Mitigation**:
  - Already changed to use `github.event.issue.number` (trusted source)
  - GitHub Actions validates artifact names
  - Cannot overwrite other PRs' artifacts

#### Line 205: Cleanup preview deployment

- **Risk**: Uses `DEPLOYMENT_NAME` from PR-controlled script
- **Mitigation**:
  - `wrangler delete` command scoped to preview environment only
  - Cannot delete production deployments (requires different token/env)
  - Worst case: cleanup fails, orphaned preview deployment (cleaned up by retention policies)

### References

- [GitHub Security Lab: Preventing pwn requests](https://securitylab.github.com/research/github-actions-preventing-pwn-requests/)
- [docs/deployment/e2e-workflow-security.md](../docs/deployment/e2e-workflow-security.md)
- [ADR-001: E2E Tests on Preview Deployments](../docs/decisions/001-e2e-tests-preview-deployments.md)

### Review History

- **2025-11-19**: Initial documentation of accepted risks
- **Security Review**: Approved as part of two-workflow E2E testing implementation

---

## How to Review These Suppressions

When reviewing this file:

1. ✅ Verify workflow still has `permissions: contents: read` (no write access)
2. ✅ Confirm privileged operations remain in `e2e-report.yml` (separate workflow)
3. ✅ Check that secrets exposed are scoped to preview environments only
4. ✅ Validate artifact-based communication pattern is maintained
5. ✅ Ensure no new secrets or privileged operations added to `e2e-test.yml`

If any of the above conditions change, these suppressions should be reconsidered.
