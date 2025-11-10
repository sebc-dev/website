# Phase 1 - Testing Guide

Complete testing strategy for Phase 1: Drizzle ORM Installation & D1 Configuration.

---

## 🎯 Testing Strategy

Phase 1 establishes database connectivity, so testing focuses on:

1. **Integration Tests**: Validate D1 connection works end-to-end
2. **Error Handling Tests**: Ensure proper error messages when configuration is wrong
3. **Manual Verification**: Confirm Wrangler and Drizzle tools work correctly

**No Unit Tests**: The connection utility is simple enough that integration tests provide sufficient coverage.

**Target Coverage**: 100% for `src/lib/server/db/index.ts`
**Test Count**: 4 integration tests (in Commit 5)

---

## 🧪 Integration Tests

### Purpose

Validate that:

- D1 database connection can be established
- Basic SQL queries execute successfully
- Error handling works when binding is missing
- Error messages are helpful for debugging

### Running Integration Tests

```bash
# Run all integration tests
pnpm test:integration

# Run specific test file
pnpm test:integration tests/integration/db-connection.test.ts

# Watch mode (during development)
pnpm test:integration --watch

# With coverage report
pnpm test:coverage

# Verbose output
pnpm test:integration --reporter=verbose
```

### Expected Results

```
✓ tests/integration/db-connection.test.ts (4)
  ✓ D1 Database Connection (4)
    ✓ should create database instance without errors
    ✓ should execute simple SELECT query
    ✓ should throw error when DB binding is missing
    ✓ should throw error with helpful message

Test Files  1 passed (1)
     Tests  4 passed (4)
  Start at  HH:MM:SS
  Duration  XXXms
```

**Coverage Goal**: 100% for `src/lib/server/db/index.ts`

### Test File Structure

```typescript
// tests/integration/db-connection.test.ts

import { describe, it, expect } from 'vitest';
import { getDb } from '@/lib/server/db';
import { sql } from 'drizzle-orm';

describe('D1 Database Connection', () => {
  // Test 1: Happy path - instance creation
  it('should create database instance without errors', () => {
    const mockEnv = { DB: {} as D1Database };
    expect(() => getDb(mockEnv)).not.toThrow();
  });

  // Test 2: Happy path - query execution
  it('should execute simple SELECT query', async () => {
    const mockEnv = { DB: global.DB };
    const db = getDb(mockEnv);

    const result = await db.run(sql`SELECT 1 as result`);

    expect(result).toBeDefined();
    expect(result.results).toHaveLength(1);
    expect(result.results[0].result).toBe(1);
  });

  // Test 3: Error path - missing binding
  it('should throw error when DB binding is missing', () => {
    const emptyEnv = {} as any;
    expect(() => getDb(emptyEnv)).toThrow('DB binding is not available');
  });

  // Test 4: Error path - helpful message
  it('should throw error with helpful message', () => {
    const emptyEnv = {} as any;
    expect(() => getDb(emptyEnv)).toThrow(/wrangler\.toml/);
    expect(() => getDb(emptyEnv)).toThrow(/Cloudflare Workers runtime/);
  });
});
```

---

## 🔧 Test Configuration

### Vitest Configuration

Update `vitest.config.ts` to support integration tests:

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'], // Optional: global test setup
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test Setup (Optional)

Create `tests/setup.ts` for global D1 mock:

```typescript
// tests/setup.ts
import { beforeAll } from 'vitest';

beforeAll(() => {
  // Mock D1 binding for tests
  // In actual implementation, Miniflare provides this
  global.DB = {
    prepare: (query: string) => ({
      bind: (...args: any[]) => ({
        all: async () => ({ results: [], success: true }),
        run: async () => ({ results: [], success: true }),
        first: async () => null,
      }),
    }),
    exec: async (query: string) => ({ results: [], success: true }),
  } as any as D1Database;
});
```

**Note**: In practice, Wrangler's Miniflare provides the D1 binding automatically during tests. The above is a fallback mock.

---

## 📊 Coverage Report

### Generate Coverage

```bash
# Generate HTML coverage report
pnpm test:coverage

# View coverage report
open coverage/index.html
# Or for WSL: explorer.exe coverage/index.html
```

### Coverage Goals

| File                         | Target Coverage | Critical Paths      |
| ---------------------------- | --------------- | ------------------- |
| `src/lib/server/db/index.ts` | 100%            | All (only 20 lines) |

### Coverage Metrics

```
File                          | % Stmts | % Branch | % Funcs | % Lines
------------------------------|---------|----------|---------|--------
src/lib/server/db/index.ts    |  100.00 |   100.00 |  100.00 |  100.00
```

**Uncovered Lines**: None (all code paths tested)

---

## 🔍 Manual Verification Tests

### Test 1: Wrangler D1 Access

**Purpose**: Verify D1 database is accessible via Wrangler CLI

**Steps**:

```bash
# List all D1 databases
wrangler d1 list

# Expected: sebc-dev-db appears in list

# Execute query against local D1
wrangler d1 execute DB --local --command "SELECT 1 as test"

# Expected output:
# {"results":[{"test":1}],"success":true}

# Execute query against remote D1 (optional, after deployment)
wrangler d1 execute DB --remote --command "SELECT 1 as test"
```

**Success Criteria**:

- [ ] Database appears in `wrangler d1 list`
- [ ] Local query returns `{"results":[{"test":1}],"success":true}`
- [ ] No errors or warnings

---

### Test 2: Drizzle Configuration

**Purpose**: Verify Drizzle Kit is configured correctly

**Steps**:

```bash
# Test Drizzle Studio help
pnpm db:studio --help

# Expected: Shows Drizzle Studio help without errors

# Test migration generation help
pnpm db:generate --help

# Expected: Shows migration generation help

# Verify drizzle.config.ts compiles
pnpm type-check

# Expected: No TypeScript errors
```

**Success Criteria**:

- [ ] `pnpm db:studio --help` shows help text
- [ ] `pnpm db:generate --help` shows help text
- [ ] TypeScript compilation succeeds
- [ ] No configuration errors

---

### Test 3: TypeScript Compilation

**Purpose**: Ensure all TypeScript code compiles without errors

**Steps**:

```bash
# Full type check
pnpm type-check

# Expected: No errors

# Check specific file
pnpm tsc --noEmit src/lib/server/db/index.ts

# Expected: No errors
```

**Success Criteria**:

- [ ] No type errors in console
- [ ] D1Database type is recognized
- [ ] DrizzleD1Database type imports correctly
- [ ] All imports resolve

---

### Test 4: NPM Scripts

**Purpose**: Verify all added npm scripts work

**Steps**:

```bash
# Test each script in help mode
pnpm db:generate --help
pnpm db:migrate:local --help
pnpm db:migrate:remote --help
pnpm db:studio --help
pnpm db:push --help

# All should show help text without errors
```

**Success Criteria**:

- [ ] All scripts execute without errors
- [ ] Help text is displayed for each
- [ ] Commands use correct flags (`--local`, `--remote`)

---

## 🐛 Debugging Tests

### Common Issues

#### Issue: Tests fail with "Cannot find module '@/lib/server/db'"

**Cause**: Path alias not configured

**Solution**:

```bash
# Check tsconfig.json
cat tsconfig.json | grep -A5 "paths"

# Should have:
# "@/*": ["./src/*"]

# Check vitest.config.ts has alias configured
cat vitest.config.ts | grep -A3 "alias"
```

---

#### Issue: Tests fail with "DB binding is not available"

**Cause**: Miniflare not providing D1 binding in test environment

**Solution**:

```bash
# Check if wrangler.toml is accessible
cat wrangler.toml | grep -A3 "d1_databases"

# Ensure binding name matches test expectations
# Update test to use correct binding name (DB)

# Or add global mock in tests/setup.ts
```

---

#### Issue: "SELECT 1" query fails with SQL error

**Cause**: D1 binding not initialized properly

**Solution**:

```bash
# Verify local D1 database exists
ls -la .wrangler/state/d1/

# Recreate if missing
wrangler d1 execute DB --local --command "SELECT 1"

# Check if Miniflare is running correctly
wrangler dev --dry-run
```

---

#### Issue: Tests pass locally but fail in CI

**Cause**: CI environment doesn't have D1 binding or Miniflare

**Solution**:

- Update CI workflow to install Wrangler
- Add step to initialize local D1 before tests
- Or use mocked D1 binding in tests

```yaml
# .github/workflows/test.yml (example)
- name: Setup Wrangler
  run: npm install -g wrangler

- name: Initialize D1
  run: wrangler d1 execute DB --local --command "SELECT 1" || true

- name: Run Tests
  run: pnpm test:integration
```

---

## 🤖 CI/CD Integration

### GitHub Actions

Tests run automatically on:

- [ ] Pull requests to main
- [ ] Push to main branch
- [ ] Manual workflow dispatch

### CI Test Command

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Type check
        run: pnpm type-check

      - name: Lint
        run: pnpm lint

      - name: Run integration tests
        run: pnpm test:integration

      - name: Generate coverage
        run: pnpm test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### Required Checks

All PRs must:

- [ ] Pass all integration tests
- [ ] Meet coverage threshold (>80%)
- [ ] Pass TypeScript type checking
- [ ] Pass linter

---

## ✅ Testing Checklist

Before marking Phase 1 complete:

### Integration Tests

- [ ] All 4 tests pass locally
- [ ] Coverage for `db/index.ts` is 100%
- [ ] Tests run successfully in CI
- [ ] No flaky tests (consistent pass)

### Manual Verification

- [ ] `wrangler d1 list` shows sebc-dev-db
- [ ] `wrangler d1 execute DB --local --command "SELECT 1"` works
- [ ] `pnpm db:studio --help` shows help
- [ ] `pnpm type-check` passes
- [ ] All npm scripts work

### Code Quality

- [ ] No console errors when running tests
- [ ] No TypeScript errors
- [ ] Linter passes
- [ ] Tests are well-named and clear

---

## 📝 Best Practices

### Writing Tests

✅ **Do**:

- Test behavior, not implementation
- Use descriptive test names (what is being tested)
- Test both happy and error paths
- Verify error messages are helpful

❌ **Don't**:

- Test Drizzle internals (trust the library)
- Over-mock (use real D1 binding when possible)
- Write flaky tests
- Ignore failing tests

### Test Naming

```typescript
// Good
it('should execute simple SELECT query');
it('should throw error when DB binding is missing');

// Bad
it('works');
it('test1');
```

### Assertions

```typescript
// Good - specific
expect(result.results[0].result).toBe(1);

// Bad - too generic
expect(result).toBeTruthy();
```

---

## ❓ FAQ

**Q: Why integration tests instead of unit tests?**
A: The connection utility is simple (20 lines). Integration tests provide more value by testing the actual D1 connection.

**Q: Do tests need a real D1 database?**
A: No. Miniflare (part of Wrangler) simulates D1 locally. Tests use this simulation.

**Q: Should I test Drizzle ORM functionality?**
A: No. Trust that Drizzle works. Test our code (getDb function) only.

**Q: What if tests are slow?**
A: Phase 1 tests should be fast (<1s). If slow, check if connecting to remote D1 instead of local.

**Q: Can I skip tests during development?**
A: Not recommended. Tests catch issues early. Use `--watch` mode for fast feedback.

**Q: How do I debug a failing test?**
A: Add `console.log` in test, run with `--reporter=verbose`, or use debugger (`node --inspect`).
