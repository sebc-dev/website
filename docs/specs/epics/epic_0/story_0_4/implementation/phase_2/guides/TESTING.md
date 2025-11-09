# Phase 2 - Testing Guide

Complete testing strategy for Phase 2: Core Database Schema (Articles & Translations).

---

## 🎯 Testing Strategy

Phase 2 uses a focused integration testing approach:

1. **Integration Tests**: Database schema validation, constraints, and relations
2. **No Unit Tests**: Schema definitions are tested via integration (actual DB operations)
3. **No E2E Tests**: Phase 2 is database layer only (E2E will come in later stories)

**Target Coverage**: >80%
**Estimated Test Count**: 15-20 tests across 5 test suites

---

## 🔗 Integration Tests

### Purpose

Test that the database schema works correctly with actual D1 database operations:

- Table creation via migrations
- Data insertion and querying
- Foreign key relations and CASCADE behavior
- Unique constraints enforcement
- ENUM validation

### Running Integration Tests

```bash
# Run all integration tests
pnpm test tests/integration/

# Run specific test file
pnpm test tests/integration/articles-schema.test.ts

# Watch mode (during development)
pnpm test:watch tests/integration/articles-schema.test.ts

# Coverage report
pnpm test:coverage tests/integration/articles-schema.test.ts
```

### Expected Results

```
✓ tests/integration/articles-schema.test.ts (15+ tests)
  ✓ Articles table
    ✓ should insert article with valid data
    ✓ should query article by id
    ✓ should set createdAt and updatedAt automatically
  ✓ Article translations table
    ✓ should insert 2 translations for same article
    ✓ should query translations by articleId
    ✓ should filter by language
  ✓ Unique constraints
    ✓ should prevent duplicate (articleId, language)
    ✓ should prevent duplicate slug
    ✓ should allow same language for different articles
  ✓ Foreign key cascade
    ✓ should delete translations when article is deleted
    ✓ should keep translations when article is updated
  ✓ ENUM validation
    ✓ should reject invalid complexity value
    ✓ should reject invalid status value
    ✓ should accept valid ENUM values

Test Files  1 passed (1)
     Tests  15 passed (15)
  Duration  2.34s

Coverage: 85% (schema validation logic)
```

**Coverage Goal**: >80% for schema-related code

### Test Files Structure

```
tests/
└── integration/
    └── articles-schema.test.ts   # Main schema validation tests
```

---

## 📊 Integration Test Details

### Test File: `tests/integration/articles-schema.test.ts`

**Purpose**: Validate articles and article_translations schema with real D1 database

**Setup**:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { drizzle } from 'drizzle-orm/d1';
import { articles, article_translations } from '@/lib/server/db/schema';

describe('Articles Schema Integration Tests', () => {
  let db: ReturnType<typeof drizzle>;

  beforeEach(async () => {
    // Reset database state
    await db.delete(article_translations);
    await db.delete(articles);
  });

  // Tests...
});
```

**Key Test Suites**:

#### Suite 1: Articles Table

- Insert article with all fields
- Query article by id
- Verify timestamps auto-populated
- Verify ENUM fields (complexity, status)

#### Suite 2: Translations Table

- Insert multiple translations (FR + EN) for same article
- Query translations by articleId
- Filter translations by language
- Verify all content fields populated

#### Suite 3: Unique Constraints

- Attempt duplicate (articleId, language) → should fail
- Attempt duplicate slug → should fail
- Verify valid data still works

#### Suite 4: Foreign Key Cascade

- Create article with translations
- Delete article
- Verify translations auto-deleted (CASCADE)

#### Suite 5: ENUM Validation

- Attempt invalid complexity ('expert') → should fail
- Attempt invalid status ('archived') → should fail
- Verify valid ENUM values work

---

## 🧹 Database Reset Strategy

### Before Each Test

The `beforeEach` hook resets the database to a clean state:

```typescript
beforeEach(async () => {
  // Delete in order (translations first due to FK)
  await db.delete(article_translations);
  await db.delete(articles);
});
```

**Why delete before, not after?**

- Leaves data for inspection if test fails
- Ensures clean state even if previous test crashed
- Simpler error debugging (final state visible)

### Alternative: Transaction Rollback

For faster tests (not implemented in Phase 2, but possible):

```typescript
beforeEach(async () => {
  await db.transaction(async (tx) => {
    // Run test in transaction
    // Auto-rollback after test
  });
});
```

---

## 🎭 No Mocking in Phase 2

**Why no mocks?**

- We're testing the actual database schema, not application logic
- Need real D1 to verify constraints, relations, and SQLite behavior
- Integration tests provide confidence that schema works as designed

**What we test with real D1**:

- Table creation via migrations
- INSERT/SELECT/UPDATE/DELETE operations
- Foreign key constraints and CASCADE
- Unique constraints
- ENUM validation (SQLite CHECK constraints)

---

## 📊 Coverage Report

### Generate Coverage

```bash
# Generate coverage report
pnpm test:coverage tests/integration/articles-schema.test.ts

# View HTML report
pnpm test:coverage --reporter=html
# Open coverage/index.html in browser
```

### Coverage Goals

| Area                                        | Target | Current |
| ------------------------------------------- | ------ | ------- |
| Schema definitions (schema.ts)              | >80%   | -       |
| Integration tests (articles-schema.test.ts) | 100%   | -       |
| Overall Phase 2                             | >80%   | -       |

**Note**: Coverage for schema file measures how much of the schema is exercised by tests (e.g., all tables, all fields, all constraints).

---

## 🐛 Debugging Tests

### Common Issues

#### Issue 1: Tests fail with "table not found"

**Symptoms**:

- Error: `no such table: articles`
- Tests fail during query/insert

**Solutions**:

1. **Verify migration applied**:

   ```bash
   pnpm db:migrate:local
   wrangler d1 execute DB --local --command="SELECT name FROM sqlite_master WHERE type='table';"
   ```

2. **Check database connection in test**:

   ```typescript
   // Ensure using local D1 binding
   const db = drizzle(env.DB); // env.DB from Cloudflare binding
   ```

3. **Recreate local database**:
   ```bash
   rm -rf .wrangler/state/d1/
   pnpm db:migrate:local
   ```

---

#### Issue 2: Unique constraint tests pass when they should fail

**Symptoms**:

- Test expects error for duplicate slug, but insert succeeds
- Unique constraints not enforced

**Solutions**:

1. **Verify constraint in migration SQL**:

   ```bash
   cat drizzle/migrations/0001_*.sql | grep -i "UNIQUE"
   ```

2. **Check schema definition**:

   ```typescript
   // Should have unique constraint
   slug: text('slug').notNull().unique(),
   ```

3. **Reapply migration**:
   ```bash
   rm -rf .wrangler/state/d1/
   pnpm db:migrate:local
   ```

---

#### Issue 3: CASCADE delete doesn't work

**Symptoms**:

- Test deletes article but translations remain
- Foreign key constraint not enforcing CASCADE

**Solutions**:

1. **Verify FK in migration SQL**:

   ```bash
   cat drizzle/migrations/0001_*.sql | grep -i "ON DELETE CASCADE"
   ```

2. **Check schema definition**:

   ```typescript
   articleId: text('articleId')
     .notNull()
     .references(() => articles.id, { onDelete: 'cascade' }),
   ```

3. **Enable foreign keys in SQLite** (should be default in D1):
   ```bash
   wrangler d1 execute DB --local --command="PRAGMA foreign_keys = ON;"
   ```

---

#### Issue 4: Tests are flaky (pass/fail randomly)

**Symptoms**:

- Tests sometimes pass, sometimes fail
- Order-dependent failures

**Solutions**:

1. **Verify database reset in beforeEach**:

   ```typescript
   beforeEach(async () => {
     await db.delete(article_translations); // Must be first (FK)
     await db.delete(articles);
   });
   ```

2. **Check test isolation** (no shared state):
   - Each test creates its own test data
   - No tests depend on previous test data

3. **Add delays if needed** (rare):
   ```typescript
   await new Promise((resolve) => setTimeout(resolve, 100));
   ```

---

### Debug Commands

```bash
# Run single test in verbose mode
pnpm test tests/integration/articles-schema.test.ts --reporter=verbose

# Run with debugger (Node.js inspector)
node --inspect-brk node_modules/.bin/vitest tests/integration/articles-schema.test.ts

# Check database state manually
wrangler d1 execute DB --local --command="SELECT * FROM articles;"
wrangler d1 execute DB --local --command="SELECT * FROM article_translations;"
```

---

## 🤖 CI/CD Automation

### GitHub Actions (or other CI)

Tests run automatically on:

- [ ] Pull requests to main branch
- [ ] Push to main branch
- [ ] Scheduled runs (optional)

### CI Test Command

```yaml
# .github/workflows/test.yml
name: Run Tests

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run migrations
        run: pnpm db:migrate:local

      - name: Run tests
        run: pnpm test

      - name: Check coverage
        run: pnpm test:coverage --coverage.thresholds.lines=80
```

### Required Checks

All PRs must:

- [ ] Pass all integration tests (15+ tests)
- [ ] Meet coverage threshold (>80%)
- [ ] Pass TypeScript type-checking
- [ ] Pass ESLint

---

## ✅ Testing Checklist

Before merging Phase 2:

- [ ] All integration tests pass locally
- [ ] All integration tests pass in CI
- [ ] Coverage >80%
- [ ] No skipped tests (unless justified and documented)
- [ ] No console errors/warnings during test run
- [ ] Database reset works (tests can run multiple times)
- [ ] Tests are stable (run multiple times, all pass)

---

## 📝 Best Practices

### Writing Tests

✅ **Do**:

- Test actual database behavior (not mocks)
- Use descriptive test names (`should prevent duplicate slug for different articles`)
- Test both positive cases (valid data works) and negative cases (invalid data fails)
- Reset database before each test
- Keep tests focused (one assertion per test when possible)

❌ **Don't**:

- Mock the database (defeats purpose of integration tests)
- Share state between tests
- Leave commented-out tests without explanation
- Write tests just for coverage (make them meaningful)
- Ignore failing tests

### Test Naming

```typescript
// Good
it('should prevent duplicate translation for same article and language', async () => {
  // Test...
});

// Bad
it('test unique constraint', async () => {
  // Test...
});
```

### Assertions

```typescript
// Good - specific assertions
expect(article.id).toBe('test-article-1');
expect(article.complexity).toBe('intermediate');
expect(article.status).toBe('published');

// Bad - vague assertions
expect(article).toBeTruthy();
expect(result.length).toBeGreaterThan(0);
```

---

## ❓ FAQ

**Q: How much should I test?**
A: Aim for >80% coverage, focus on schema constraints and relations. Test all ENUM values, unique constraints, and FK cascades.

**Q: Should I test Drizzle ORM internals?**
A: No. Test your schema definition and constraints, not Drizzle's query building.

**Q: Tests are slow, what to do?**
A: Integration tests with real DB are inherently slower. Consider running only affected tests during development, full suite before commit.

**Q: Can I skip tests?**
A: No. Tests ensure schema works as designed and prevent regressions when schema evolves.

**Q: How do I test migrations?**
A: The integration tests implicitly test migrations (they run against migrated schema). Explicit migration tests may come in Phase 5.

**Q: What if a test fails only in CI?**
A: Check for environment differences (D1 version, Node version). Ensure CI runs migrations before tests.

---

## 🔗 Related Documentation

- [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md) - Commit 6 details
- [COMMIT_CHECKLIST.md](../COMMIT_CHECKLIST.md) - Test implementation checklist
- [Vitest Documentation](https://vitest.dev/)
- [Drizzle ORM Testing](https://orm.drizzle.team/docs/testing)
