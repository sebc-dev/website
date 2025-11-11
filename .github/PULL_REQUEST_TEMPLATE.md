# Pull Request Description

## Summary

<!-- Provide a brief summary of the changes in this PR -->

## Related Issues

<!-- Link to related issues, epics, or stories -->

- Closes #
- Related to Epic:
- Story:

## Type of Change

<!-- Mark the relevant option with an "x" -->

- [ ] New feature (non-breaking change which adds functionality)
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Test coverage improvement
- [ ] Configuration change

## Testing

<!-- Describe the tests you ran and how to reproduce them -->

- [ ] Unit tests pass locally (`pnpm test`)
- [ ] E2E tests pass locally (`pnpm test:e2e`)
- [ ] Manual testing completed
- [ ] No new warnings in console

## Pre-merge Checklist

### Configuration & Dependencies

- [ ] Dependencies are in the correct section (`dependencies` vs `devDependencies`)
- [ ] Package versions are valid and exist on npm registry
- [ ] Environment variables are documented in `.env.example`
- [ ] GitHub Secrets/Environment variables are configured if needed
- [ ] No sensitive data (tokens, passwords, API keys) in code or commits

### Code Quality

- [ ] No unsafe type assertions (`as unknown as`) without justification
- [ ] Type guards are used for runtime validations
- [ ] Tests target the actual application (not example/placeholder tests)
- [ ] Code follows project conventions (Gitmoji commits, file structure)
- [ ] ESLint passes (`pnpm lint`)
- [ ] TypeScript compiles without errors (`pnpm tsc`)

### Database (if applicable)

- [ ] Migrations tested on Cloudflare D1 staging environment
- [ ] Columns `updated_at` have `$onUpdate` callbacks
- [ ] Foreign key constraints handled correctly
- [ ] No data loss risk in migrations

### Documentation

- [ ] Markdown/YAML formatting is correct
- [ ] Breaking changes are documented
- [ ] `CLAUDE.md` updated if dev workflow changes
- [ ] API changes documented
- [ ] Comments added for complex logic

### Deployment (if applicable)

- [ ] Build succeeds (`pnpm build`)
- [ ] Preview deployment tested
- [ ] No breaking changes for production environment
- [ ] Rollback plan considered for breaking changes

## Screenshots (if applicable)

<!-- Add screenshots for UI changes -->

## Additional Notes

<!-- Any additional information that reviewers should know -->

## Checklist for Reviewers

- [ ] Code changes align with PR description
- [ ] Tests adequately cover new functionality
- [ ] No security vulnerabilities introduced
- [ ] Performance impact considered
- [ ] Documentation is clear and accurate
