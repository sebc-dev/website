# E2E Workflow Security Model

**Date**: 2025-11-19
**Status**: Implemented
**Related**: [ADR-001](../decisions/001-e2e-tests-preview-deployments.md), [Implementation Guide](./e2e-preview-deployments-implementation.md)

## Overview

The E2E testing workflow uses a **two-workflow security pattern** to protect against "pwn request" vulnerabilities where untrusted code from pull requests could execute with elevated permissions.

## Security Threat Model

### The Vulnerability (CVE Pattern: Pwn Request)

Single-workflow approaches that trigger on `issue_comment` or `pull_request_target` and execute untrusted code are vulnerable to privilege escalation:

**Attack Vector**:

1. Attacker creates a malicious PR with compromised `package.json` install scripts
2. Attacker comments `@e2e` on their own PR
3. Workflow checks out attacker's code
4. `pnpm install` executes malicious scripts with workflow's elevated permissions
5. Attacker gains access to:
   - Repository write permissions
   - Secrets (API tokens, credentials)
   - Ability to modify PR status checks
   - Ability to post comments as the bot

**Real-World Impact**:

- Steal Cloudflare API tokens
- Modify deployment targets
- Exfiltrate sensitive data
- Compromise the repository

## Our Security Solution: Two-Workflow Pattern

We separate **untrusted code execution** from **privileged actions** using two independent workflows.

### Workflow 1: E2E Tests (Unprivileged)

**File**: `.github/workflows/e2e-test.yml`

**Security Properties**:

- Minimal permissions: `contents: read` ONLY
- NO write permissions to PRs, status checks, or comments
- Executes untrusted code from PR (checkout + install)
- Cannot access or leak secrets in dangerous ways
- Uploads results as artifacts (read-only operation)

**What it does**:

1. Checks out PR code (untrusted)
2. Runs `pnpm install` (executes install scripts)
3. Deploys to preview environment
4. Runs E2E tests
5. Saves results to artifacts
6. Cleans up deployment

**Attack Mitigation**:

- Even if malicious code executes, it has NO write permissions
- Cannot modify status checks or post comments
- Cannot steal secrets beyond what `deploy` step uses
- Isolated from privileged operations

### Workflow 2: E2E Report (Privileged)

**File**: `.github/workflows/e2e-report.yml`

**Security Properties**:

- Full write permissions (PRs, status checks, comments)
- Triggered by `workflow_run` completion
- NEVER checks out or executes PR code
- Only reads pre-validated artifacts
- Cannot be influenced by attacker's code

**What it does**:

1. Downloads test results from artifacts
2. Parses metadata (PR number, test status, etc.)
3. Creates/updates status checks
4. Posts comments with results

**Attack Mitigation**:

- No code execution from PR
- Only processes data from artifacts
- Artifacts created in isolated unprivileged environment
- Cannot be triggered directly by attacker

## Security Boundaries

```
┌─────────────────────────────────────────────────────────┐
│  Untrusted Zone (e2e-test.yml)                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ Attacker's Code                                │    │
│  │ - package.json scripts ✗                       │    │
│  │ - Source code ✗                                │    │
│  │ - Dependencies ✗                               │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  Permissions: READ ONLY                                 │
│  - Cannot write to PR ✓                                 │
│  - Cannot update status checks ✓                        │
│  - Cannot post comments ✓                               │
│                                                         │
│  Output: Artifacts (sandboxed data)                     │
└─────────────────────────────────────────────────────────┘
                         │
                         │ artifacts (one-way)
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Trusted Zone (e2e-report.yml)                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ Read-Only Data Processing                      │    │
│  │ - Parse metadata.json ✓                        │    │
│  │ - No code execution ✓                          │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  Permissions: WRITE                                     │
│  - Post comments ✓                                      │
│  - Update status checks ✓                               │
│  - Manage PR state ✓                                    │
│                                                         │
│  Input: Only pre-validated artifacts                    │
└─────────────────────────────────────────────────────────┘
```

## Why This Works

### Principle of Least Privilege

Each workflow has ONLY the permissions it needs:

- Unprivileged workflow: Execute code → needs READ only
- Privileged workflow: Report results → needs WRITE, never executes code

### Trust Boundary Isolation

- Untrusted code execution happens in a sandbox with no privileges
- Privileged actions happen in an environment that never touches untrusted code
- Data flows one-way through artifacts (no reverse channel)

### Defense in Depth

Multiple layers of protection:

1. Permission separation (read vs write)
2. Workflow isolation (separate execution contexts)
3. Artifact-based communication (no direct data flow)
4. No code execution in privileged workflow

## Comparison with Vulnerable Pattern

### ❌ Vulnerable (Single Workflow)

```yaml
on:
  issue_comment:
    types: [created]

permissions:
  pull-requests: write # ⚠️ Dangerous!
  statuses: write # ⚠️ Dangerous!

steps:
  - uses: actions/checkout@v4
    with:
      ref: ${{ steps.pr.outputs.ref }} # ⚠️ Untrusted code!

  - run: pnpm install # ⚠️ Executes attacker's scripts with write permissions!

  - uses: actions/github-script@v7 # ⚠️ Attacker can influence this!
    with:
      script: |
        github.rest.issues.createComment(...)
```

**Attack**: Malicious `postinstall` script in `package.json` runs with write permissions.

### ✅ Secure (Two Workflows)

```yaml
# Workflow 1: Unprivileged
permissions:
  contents: read  # ✓ Minimal permissions

steps:
  - uses: actions/checkout@v4
  - run: pnpm install  # ✓ Safe - no write permissions
  - run: pnpm test:e2e
  - uses: actions/upload-artifact@v4  # ✓ Read-only operation

# Workflow 2: Privileged (separate file, triggered by workflow_run)
permissions:
  pull-requests: write  # ✓ Safe - no code execution
  statuses: write

steps:
  - uses: actions/download-artifact@v4  # ✓ No code checkout
  - run: cat metadata.json | jq  # ✓ Only parse data
  - uses: actions/github-script@v7  # ✓ Safe - no attacker influence
```

**Protection**: Write permissions never coexist with untrusted code execution.

## Best Practices Implemented

1. **Never mix code execution with write permissions**
   - Unprivileged workflow: code execution, no writes
   - Privileged workflow: writes, no code execution

2. **Use `workflow_run` trigger for privileged workflows**
   - Cannot be directly triggered by attacker
   - Only runs after unprivileged workflow completes
   - Creates natural security boundary

3. **Communicate via artifacts, not environment**
   - Artifacts are immutable
   - Created in isolated context
   - Cannot be tampered with during transfer

4. **Validate all inputs in privileged workflow**
   - Parse JSON safely
   - Validate PR numbers, SHAs
   - Never execute external commands with untrusted input

## Additional Security Measures

### Secret Protection

- Secrets only exposed in unprivileged workflow for deployment
- Limited to `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
- Used only for Cloudflare deployment (isolated API)
- Cannot be exfiltrated through PR comments or status checks

### Cleanup Isolation

- Preview cleanup uses same limited API access
- Cleanup scoped to preview environment only
- Cannot affect production deployments

### Status Check Integrity

- Status checks created ONLY by privileged workflow
- Metadata validated before status update
- PR number and SHA verified against GitHub API

## References

### Official GitHub Security Guidance

- [Keeping your GitHub Actions and workflows secure Part 1: Preventing pwn requests](https://securitylab.github.com/research/github-actions-preventing-pwn-requests/)
- [Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Using workflow_run for secure workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#workflow_run)

### Security Best Practices

- [CodeQL Security Queries for GitHub Actions](https://github.com/github/codeql/tree/main/javascript/ql/src/Security/CWE-094)
- [Secure GitHub Actions Patterns](https://github.com/ossf/scorecard/blob/main/docs/checks.md#token-permissions)

### Related Documentation

- [ADR-001: Use Preview Deployments](../decisions/001-e2e-tests-preview-deployments.md)
- [E2E Implementation Guide](./e2e-preview-deployments-implementation.md)

## Audit Trail

- **2025-11-19**: Two-workflow security model implemented
- **2025-11-19**: CodeQL vulnerability identified and addressed
- **2025-11-19**: Security documentation created
