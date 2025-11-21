# Phase 5: Tests & Documentation - Review Guide

**Story**: 1.8 - Correction Architecture next-intl et Internationalisation des Pages
**Phase**: 5 of 5

---

## Review Approach

This phase focuses on validation and documentation, so review emphasizes:

- Test completeness and quality
- Documentation accuracy
- Coverage metrics

---

## Commit-by-Commit Review

### Commit 5.1: Unit Tests for i18n Core

#### Review Focus

- [ ] Test file organization follows project patterns
- [ ] Tests cover all exports from routing.ts
- [ ] Tests verify configuration values
- [ ] Tests are independent and isolated
- [ ] No implementation details leaked in tests

#### Key Checkpoints

```typescript
// routing.test.ts
✓ Tests for routing.locales configuration
✓ Tests for routing.defaultLocale
✓ Tests for routing.localePrefix
✓ Tests for navigation exports (Link, redirect, usePathname, useRouter)

// request.test.ts
✓ Tests for message loading
✓ Tests for namespace existence
✓ Tests for all required namespaces
```

#### Questions to Ask

- Are edge cases covered?
- Would the tests catch regressions?
- Are test descriptions clear?

---

### Commit 5.2: E2E Tests for Localized Pages

#### Review Focus

- [ ] Tests cover both locales completely
- [ ] Selectors are robust (not brittle)
- [ ] Assertions are meaningful
- [ ] Tests are not flaky
- [ ] Metadata tests are accurate

#### Key Checkpoints

```typescript
// French tests
✓ <html lang="fr"> verified
✓ All French text content verified
✓ French metadata verified

// English tests
✓ <html lang="en"> verified
✓ All English text content verified
✓ English metadata verified

// Redirection tests
✓ / → /fr redirection verified
```

#### Questions to Ask

- Will tests fail if content changes?
- Are timeouts appropriate?
- Are selectors maintainable?

---

### Commit 5.3: Message Parity Tests Update

#### Review Focus

- [ ] All new namespaces covered
- [ ] All keys tested
- [ ] Error messages are helpful
- [ ] Tests follow existing patterns

#### Key Checkpoints

```typescript
// home namespace
✓ All 10 keys tested
✓ FR and EN parity verified

// metadata namespace
✓ All 4 keys tested
✓ FR and EN parity verified
```

#### Questions to Ask

- Are all required keys listed?
- Would missing keys be caught?

---

### Commit 5.4: Documentation Update

#### Review Focus

- [ ] Information is accurate
- [ ] Examples work correctly
- [ ] No outdated references
- [ ] Formatting is consistent
- [ ] Links are valid

#### Key Checkpoints

```markdown
// CLAUDE.md
✓ src/i18n/ path correct
✓ Namespace count updated
✓ Key count updated
✓ Import patterns correct
✓ Examples accurate

// src/i18n/README.md
✓ Architecture explained
✓ File structure documented
✓ Usage examples provided
✓ Best practices included
```

#### Questions to Ask

- Would a new developer understand this?
- Are examples copy-paste ready?
- Is anything missing?

---

### Commit 5.5: Final Validation

#### Review Focus

- [ ] All validations passed
- [ ] No errors or warnings
- [ ] Build successful
- [ ] Preview works

#### Key Checkpoints

```bash
✓ pnpm tsc --noEmit (0 errors)
✓ pnpm lint (0 errors)
✓ pnpm test (all pass)
✓ pnpm test:e2e (all pass)
✓ pnpm build (success)
✓ pnpm preview (works)
```

---

## Code Quality Checklist

### General

- [ ] No console.log statements left in tests
- [ ] No commented-out code
- [ ] Consistent naming conventions
- [ ] Appropriate file organization

### Tests

- [ ] Tests are deterministic
- [ ] Tests are isolated
- [ ] Tests have clear descriptions
- [ ] Tests cover happy and error paths

### Documentation

- [ ] Grammar and spelling correct
- [ ] Technical accuracy verified
- [ ] Examples tested
- [ ] Dates updated

---

## Review Priorities

| Priority | Area                   | Reason                         |
| -------- | ---------------------- | ------------------------------ |
| High     | Test coverage          | Ensures implementation quality |
| High     | Documentation accuracy | Helps future development       |
| Medium   | Test performance       | E2E tests should be fast       |
| Low      | Test style             | As long as tests pass          |

---

## Common Review Issues

### Tests

1. **Flaky tests**: Tests that pass/fail intermittently
   - Solution: Add proper waits, increase timeouts

2. **Brittle selectors**: Tests that break on minor changes
   - Solution: Use data-testid or semantic selectors

3. **Missing edge cases**: Tests only cover happy path
   - Solution: Add error scenario tests

### Documentation

1. **Outdated examples**: Code examples don't work
   - Solution: Test all examples before committing

2. **Missing information**: Important details omitted
   - Solution: Cover all use cases

3. **Inconsistent formatting**: Mixed styles
   - Solution: Follow project conventions

---

## Approval Criteria

### Must Pass

- [ ] All tests pass
- [ ] Build succeeds
- [ ] Documentation is accurate
- [ ] Coverage meets targets

### Should Pass

- [ ] Tests are well-organized
- [ ] Documentation is comprehensive
- [ ] No flaky tests

### Nice to Have

- [ ] Tests have good descriptions
- [ ] Documentation includes diagrams
- [ ] All edge cases covered

---

## Post-Review Actions

After approval:

1. Merge to branch
2. Update EPIC_TRACKING.md
3. Mark story as complete
4. Close related issues

---

**Created**: 2025-11-20
**Last Updated**: 2025-11-20
