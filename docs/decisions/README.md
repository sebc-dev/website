# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for significant technical decisions made in the project.

## What is an ADR?

An ADR documents an important architectural decision along with its context and consequences. It helps teams:
- Understand why decisions were made
- Track evolution of the architecture
- Onboard new team members
- Review past decisions

## Format

Each ADR follows this structure:
- **Status**: Proposed, Accepted, Deprecated, Superseded
- **Date**: When the decision was made
- **Context**: What led to this decision
- **Decision**: What was decided
- **Rationale**: Why this approach was chosen
- **Consequences**: Impact of the decision
- **Implementation Plan**: Steps to execute (if applicable)

## Active Decisions

### Infrastructure & CI/CD

- [ADR-001: Use Preview Deployments for E2E Tests in CI](./001-e2e-tests-preview-deployments.md) - **Accepted** (2025-11-17)
  - Addresses E2E test timeout issues in GitHub Actions
  - Uses Cloudflare preview deployments instead of local wrangler dev
  - Tracking: [#35](https://github.com/sebc-dev/website/issues/35)

## Creating a New ADR

1. Copy the template from an existing ADR
2. Number it sequentially (e.g., `002-your-decision.md`)
3. Fill in all sections
4. Update this README with a link to the new ADR
5. Commit with message: `📝 docs(adr): add ADR-XXX for <decision>`

## References

- [ADR GitHub Organization](https://adr.github.io/)
- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
