# Phase 3 - Testing Guide

Complete testing strategy for Phase 3: Taxonomy Schemas.

---

## 🎯 Testing Strategy

Phase 3 uses **integration testing** to validate taxonomy database operations with a real Cloudflare D1 instance.

**Testing Layers**:

1. **Integration Tests**: Database operations with local D1 (primary focus)
2. **Schema Validation**: Type-checking and migration generation (automated)
3. **Manual QA**: Seed script execution and data verification (one-time)

**Target Coverage**: >80% for taxonomy-related database operations
**Estimated Test Count**: 10-15 tests across 3 test suites

---

## 🧪 Integration Tests

### Purpose

Test that taxonomy tables (categories, tags, articleTags) work correctly with real D1 database operations including:

- Querying canonical categories
- CRUD operations on tags
- Many-to-Many relationships via articleTags junction
- Foreign key constraints and cascade deletes
- Unique constraints and composite primary keys

### Running Integration Tests

```bash
# Run all integration tests
pnpm test:integration

# Run specific test file
pnpm test tests/integration/taxonomy-schema.test.ts

# Watch mode (re-run on file changes)
pnpm test:watch tests/integration/taxonomy-schema.test.ts

# Coverage report
pnpm test:coverage tests/integration/taxonomy-schema.test.ts
```

### Expected Results

```
✓ tests/integration/taxonomy-schema.test.ts (12)
  ✓ Categories Operations (4)
    ✓ should retrieve all 9 canonical categories
    ✓ should query category by key
    ✓ should verify category structure
    ✓ should enforce unique constraint on key
  ✓ Tags Operations (4)
    ✓ should insert tag with bilingual names
    ✓ should query tag by ID
    ✓ should update tag name
    ✓ should delete tag
  ✓ ArticleTags Junction (4)
    ✓ should link article to tag
    ✓ should query tags for article
    ✓ should prevent duplicate article-tag pairs
    ✓ should cascade delete articleTags when article deleted

Test Files: 1 passed (1)
Tests: 12 passed (12)
Duration: 3.2s
```

**Coverage Goal**: >80% for taxonomy query functions

### Test Files Structure

```
tests/
├── integration/
│   ├── taxonomy-schema.test.ts   # Phase 3 taxonomy tests
│   ├── db-connection.test.ts     # Phase 1 connection test
│   └── articles-schema.test.ts   # Phase 2 articles tests
└── fixtures/
    └── test-data.sql              # Test fixtures (if needed)
```

### Test Setup - beforeEach Hook

Each test suite uses a `beforeEach` hook to seed the database with consistent test data:

```typescript
import { describe, it, beforeEach, expect } from 'vitest';
import { execSync } from 'child_process';
import { db } from '@/lib/server/db';
import { categories, tags, articleTags } from '@/lib/server/db/schema';

describe('Categories Operations', () => {
  beforeEach(() => {
    // Seed canonical categories before each test
    execSync(
      'wrangler d1 execute DB --local --file=./drizzle/seeds/categories.sql',
    );
  });

  it('should retrieve all 9 canonical categories', async () => {
    const allCategories = await db.select().from(categories);
    expect(allCategories).toHaveLength(9);
  });
});
```

---

## 🔗 Test Suites

### Suite 1: Categories Operations

**Purpose**: Verify canonical categories are seeded and queryable

**Tests**:

1. **Retrieve all 9 canonical categories**
   - Query: `SELECT * FROM categories`
   - Assert: Array has length 9
   - Validates: Seed script loaded all categories

2. **Query category by key**
   - Query: `SELECT * FROM categories WHERE key = 'news'`
   - Assert: Returns 1 category with correct nameFr/nameEn
   - Validates: Unique constraint and key-based queries

3. **Verify category structure**
   - Query: `SELECT * FROM categories LIMIT 1`
   - Assert: Object has all 8 fields (id, key, nameFr, nameEn, slugFr, slugEn, icon, color)
   - Validates: Schema matches specification

4. **Enforce unique constraint on key** (optional)
   - Action: Try inserting duplicate key
   - Assert: Insert fails or is ignored (INSERT OR IGNORE)
   - Validates: Unique constraint works

**Example Test**:

```typescript
it('should retrieve all 9 canonical categories', async () => {
  const allCategories = await db.select().from(categories);

  expect(allCategories).toHaveLength(9);

  // Verify all expected keys exist
  const keys = allCategories.map((cat) => cat.key).sort();
  expect(keys).toEqual([
    'behind-scenes',
    'case-study',
    'deep-analysis',
    'learning-path',
    'news',
    'quick-tips',
    'retrospective',
    'tool-test',
    'tutorial',
  ]);
});
```

---

### Suite 2: Tags Operations

**Purpose**: Verify tags table CRUD operations

**Tests**:

1. **Insert tag with bilingual names**
   - Action: Insert tag with nameFr='TypeScript', nameEn='TypeScript'
   - Assert: Insert succeeds, returns ID
   - Validates: Tag creation works

2. **Query tag by ID**
   - Action: Insert tag, then query by ID
   - Assert: Returns correct tag
   - Validates: Primary key lookup

3. **Update tag name** (optional)
   - Action: Insert tag, update nameFr
   - Query: Retrieve updated tag
   - Assert: Name changed
   - Validates: UPDATE operations

4. **Delete tag** (optional)
   - Action: Insert tag, delete it
   - Query: Try to retrieve
   - Assert: Tag not found
   - Validates: DELETE operations

**Example Test**:

```typescript
it('should insert tag with bilingual names', async () => {
  const [newTag] = await db
    .insert(tags)
    .values({
      id: 'tag-typescript',
      nameFr: 'TypeScript',
      nameEn: 'TypeScript',
      createdAt: new Date(),
    })
    .returning();

  expect(newTag).toBeDefined();
  expect(newTag.nameFr).toBe('TypeScript');
  expect(newTag.nameEn).toBe('TypeScript');
});
```

---

### Suite 3: ArticleTags Junction Operations

**Purpose**: Verify Many-to-Many relationship and constraints

**Tests**:

1. **Link article to tag**
   - Prerequisite: Article and tag exist
   - Action: Insert into articleTags
   - Assert: Insert succeeds
   - Validates: Junction table insert works

2. **Query tags for article**
   - Prerequisite: Article linked to 2 tags
   - Query: Join articleTags and tags
   - Assert: Returns 2 tags
   - Validates: Relationship queries work

3. **Prevent duplicate article-tag pairs**
   - Action: Insert same articleId + tagId twice
   - Assert: Second insert fails or is ignored (composite PK)
   - Validates: Composite primary key constraint

4. **Cascade delete articleTags when article deleted**
   - Prerequisite: Article linked to tag
   - Action: Delete article
   - Query: Check articleTags for that articleId
   - Assert: No rows returned (cascade delete worked)
   - Validates: ON DELETE CASCADE for articles

5. **Cascade delete articleTags when tag deleted** (optional)
   - Prerequisite: Article linked to tag
   - Action: Delete tag
   - Query: Check articleTags for that tagId
   - Assert: No rows returned (cascade delete worked)
   - Validates: ON DELETE CASCADE for tags

**Example Test**:

```typescript
it('should cascade delete articleTags when article deleted', async () => {
  // Setup: Create article and tag
  const [article] = await db
    .insert(articles)
    .values({
      id: 'article-test-1',
      categoryId: 'cat-1',
      complexity: 'beginner',
      status: 'draft',
    })
    .returning();

  const [tag] = await db
    .insert(tags)
    .values({
      id: 'tag-test-1',
      nameFr: 'Test',
      nameEn: 'Test',
      createdAt: new Date(),
    })
    .returning();

  // Link article to tag
  await db.insert(articleTags).values({
    articleId: article.id,
    tagId: tag.id,
  });

  // Verify link exists
  const links = await db
    .select()
    .from(articleTags)
    .where(eq(articleTags.articleId, article.id));
  expect(links).toHaveLength(1);

  // Delete article
  await db.delete(articles).where(eq(articles.id, article.id));

  // Verify articleTags cascade deleted
  const linksAfterDelete = await db
    .select()
    .from(articleTags)
    .where(eq(articleTags.articleId, article.id));
  expect(linksAfterDelete).toHaveLength(0);
});
```

---

## 📊 Coverage Report

### Generate Coverage

```bash
# Generate coverage report
pnpm test:coverage tests/integration/taxonomy-schema.test.ts

# Or for all integration tests
pnpm test:coverage tests/integration/
```

### View Coverage

```bash
# Terminal report (basic)
pnpm test:coverage

# HTML report (detailed)
pnpm test:coverage --reporter=html

# Open HTML report (macOS)
open coverage/index.html

# Open HTML report (Linux)
xdg-open coverage/index.html
```

### Coverage Goals

| Area                     | Target | Notes                          |
| ------------------------ | ------ | ------------------------------ |
| **Categories queries**   | >80%   | Should cover SELECT operations |
| **Tags CRUD**            | >80%   | Insert, update, delete, select |
| **ArticleTags junction** | >90%   | Critical for relationships     |
| **Overall taxonomy**     | >80%   | Across all taxonomy operations |

**Note**: Integration tests focus on database operations, not application logic. 80%+ coverage is excellent for DB tests.

---

## 🐛 Debugging Tests

### Common Issues

#### Issue: Tests fail with "Database not found"

**Symptoms**:

- Error: `Error: Database with ID 'DB' not found`
- Tests can't connect to D1

**Solutions**:

1. Verify `wrangler.toml` has D1 binding:
   ```bash
   cat wrangler.toml | grep -A 3 "d1_databases"
   ```
2. Ensure local D1 database exists:
   ```bash
   wrangler d1 list
   ```
3. If missing, create database:
   ```bash
   wrangler d1 create sebc-dev-db
   ```
4. Update binding in `wrangler.toml`

**Verify Fix**:

```bash
wrangler d1 execute DB --local --command "SELECT 1;"
```

---

#### Issue: Tests fail with "Table not found"

**Symptoms**:

- Error: `no such table: categories`
- Tests can't find taxonomy tables

**Solutions**:

1. Verify migration applied:
   ```bash
   wrangler d1 execute DB --local --command "SELECT name FROM sqlite_master WHERE type='table';"
   ```
2. If tables missing, apply migration:
   ```bash
   pnpm db:migrate:local
   ```
3. Verify categories seeded (if testing categories):
   ```bash
   pnpm db:seed
   ```

**Verify Fix**:

```bash
wrangler d1 execute DB --local --command "SELECT COUNT(*) FROM categories;"
# Should return 9
```

---

#### Issue: Tests are flaky (pass sometimes, fail others)

**Symptoms**:

- Tests pass on first run, fail on second
- Inconsistent results
- Error: "UNIQUE constraint failed"

**Solutions**:

1. Ensure `beforeEach` hook resets database state:
   ```typescript
   beforeEach(async () => {
     // Delete existing data
     await db.delete(articleTags);
     await db.delete(tags);
     // Re-seed categories
     execSync(
       'wrangler d1 execute DB --local --file=./drizzle/seeds/categories.sql',
     );
   });
   ```
2. Use unique IDs per test (if not resetting):
   ```typescript
   const testId = `test-${Date.now()}`;
   ```
3. Avoid parallel test execution (use `--no-threads` flag):
   ```bash
   pnpm vitest --no-threads
   ```

---

#### Issue: Tests are slow (>30 seconds)

**Symptoms**:

- Integration tests take a long time
- Database operations are slow

**Solutions**:

1. **Expected behavior**: D1 local can be slower than traditional databases
2. Minimize test data (only seed what's needed)
3. Use fewer database operations per test
4. Run integration tests only in CI (not on every save)
5. Consider mocking for unit tests (but keep integration tests with real D1)

**Acceptable Performance**:

- Integration test suite: <10 seconds for 10-15 tests
- If >30 seconds, consider optimizing or splitting tests

---

### Debug Commands

```bash
# Run single test with verbose output
pnpm vitest tests/integration/taxonomy-schema.test.ts --reporter=verbose

# Run test with debugging enabled (Node.js debugger)
node --inspect-brk ./node_modules/.bin/vitest tests/integration/taxonomy-schema.test.ts

# Run test and log SQL queries (if Drizzle debug enabled)
DEBUG=drizzle:* pnpm test tests/integration/taxonomy-schema.test.ts
```

---

## 🤖 CI/CD Automation

### GitHub Actions (or other CI)

Integration tests should run automatically on:

- [ ] Pull requests to main branch
- [ ] Push to main branch
- [ ] Scheduled nightly builds (optional)

### CI Configuration Example

```yaml
# .github/workflows/test.yml
name: Integration Tests

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
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install

      - name: Run type-check
        run: pnpm tsc --noEmit

      - name: Run linter
        run: pnpm lint

      - name: Apply migrations
        run: pnpm db:migrate:local

      - name: Seed database
        run: pnpm db:seed

      - name: Run integration tests
        run: pnpm test:integration

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### Required Checks

All PRs must pass:

- [ ] Type-check (`pnpm tsc --noEmit`)
- [ ] Linter (`pnpm lint`)
- [ ] Integration tests (`pnpm test:integration`)
- [ ] Coverage threshold (>80%)

---

## ✅ Testing Checklist

Before merging Phase 3:

- [ ] All integration tests pass locally
- [ ] All integration tests pass in CI
- [ ] Coverage >80% for taxonomy operations
- [ ] No skipped tests (unless justified in comments)
- [ ] No console errors or warnings during test execution
- [ ] Tests are isolated (each starts with clean state)
- [ ] Tests use descriptive names
- [ ] Seed script executes successfully in tests

---

## 📝 Best Practices

### Writing Tests

✅ **Do**:

- Test behavior (categories queryable, tags insertable, cascade deletes work)
- Use descriptive test names ("should prevent duplicate article-tag pairs")
- One assertion focus per test (easier to debug failures)
- Test edge cases (duplicates, cascade deletes, constraints)
- Clean up test data or reset state in `beforeEach`

❌ **Don't**:

- Test Drizzle ORM internals (trust the library)
- Over-mock (use real D1 for integration tests)
- Write flaky tests (ensure consistent state)
- Ignore failing tests (fix or remove)
- Test UI rendering here (this is database testing)

### Test Naming Convention

```typescript
// Good: Describes behavior
it('should retrieve all 9 canonical categories', ...)
it('should prevent duplicate article-tag pairs', ...)
it('should cascade delete articleTags when article deleted', ...)

// Bad: Describes implementation
it('SELECT * FROM categories returns 9 rows', ...)
it('articleTags has composite PK', ...)
```

### Test Organization

```typescript
describe('Categories Operations', () => {
  describe('Querying', () => {
    it('should retrieve all 9 canonical categories', ...)
    it('should query category by key', ...)
  });

  describe('Validation', () => {
    it('should verify category structure', ...)
    it('should enforce unique constraint on key', ...)
  });
});
```

---

## ❓ FAQ

**Q: Why integration tests instead of unit tests?**
A: Taxonomy tests verify database operations, which require a real D1 instance. Unit tests would mock the database, defeating the purpose.

**Q: How do I test seed data?**
A: Run `pnpm db:seed`, then query the database to verify 9 categories exist with correct data.

**Q: Why is test coverage not 100%?**
A: 100% is often unrealistic and unnecessary. Focus on testing critical paths and edge cases. 80%+ is excellent for database operations.

**Q: Can I skip integration tests during development?**
A: You can, but run them before committing. Use `pnpm test:watch` to run tests on file changes.

**Q: Tests are slow. Can I use SQLite in-memory?**
A: Not recommended. D1 has quirks (SQLite-based but with differences). Test against real D1 to catch issues early.

---

## 🔗 Testing Resources

- [Vitest Documentation](https://vitest.dev/)
- [Drizzle ORM Testing Guide](https://orm.drizzle.team/docs/tests)
- [Cloudflare D1 Testing](https://developers.cloudflare.com/d1/platform/testing/)
- [Testing Best Practices](https://kentcdodds.com/blog/write-tests)

### Project-Specific Docs

- [PHASES_PLAN.md](../PHASES_PLAN.md) - Phase 3 testing requirements
- [Story Spec](../../story_0.4.md) - AC7: Testing & Documentation
- [Architecture Doc](/docs/specs/Architecture_technique.md) - Testing strategy
