## Description

<!-- Describe your changes -->

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement
- [ ] Test improvements

## Testing

- [ ] Unit tests pass locally (`pnpm test`)
- [ ] E2E tests pass locally (`pnpm test:e2e`)
- [ ] For PRs to `main`: E2E tests run in CI (comment `@e2e` to trigger)

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Gitmoji used in commit message

## E2E Tests (for PRs to main)

**Required before merge**: Comment `@e2e` on this PR to run E2E tests on a Cloudflare preview deployment.

The workflow will:
1. Deploy to a preview environment
2. Run Playwright tests
3. Report results and update status check
4. Cleanup the preview deployment

**Note**: This is required for merging to `main`. See [ADR-001](docs/decisions/001-e2e-tests-preview-deployments.md).
