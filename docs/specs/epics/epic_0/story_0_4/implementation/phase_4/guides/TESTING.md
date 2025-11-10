# Phase 4 - Testing Guide

Complete testing strategy for Phase 4.

---

## 🎯 Testing Strategy

Phase 4 focuses on **unit testing** for validation logic:

1. **Unit Tests**: Test validation schemas and helpers in isolation
2. **Integration Tests**: Not applicable (no database or external services)
3. **E2E Tests**: Not applicable (validation used by Server Actions in later phases)

**Target Coverage**: >85%
**Estimated Test Count**: 15+ test cases

---

## 🧪 Unit Tests

### Purpose

Test that validation schemas and helpers correctly:

- Accept valid data
- Reject invalid data
- Provide clear error messages
- Handle edge cases (empty strings, missing fields, etc.)

### Running Unit Tests

```bash
# Run all validation tests
pnpm test src/lib/server/db/validation.test.ts

# Run in watch mode (during development)
pnpm test:watch src/lib/server/db/validation.test.ts

# Run with coverage
pnpm test:coverage src/lib/server/db/validation.test.ts

# Run specific test
pnpm test src/lib/server/db/validation.test.ts -t "should validate valid article data"
```

### Expected Results

```
✓ Auto-generated Insert Schemas
  ✓ insertArticleSchema
    ✓ should validate valid article data
    ✓ should reject invalid status enum
  ✓ insertArticleTranslationSchema
    ✓ should validate valid translation data
    ✓ should reject invalid slug format (uppercase)
    ✓ should reject invalid slug format (spaces)
    ✓ should reject title that is too long
✓ Partial Update Schemas
  ✓ should allow partial article translation updates
  ✓ should still validate provided fields in partial updates
✓ Validation Helpers
  ✓ validateArticleInsert
    ✓ should return success for valid data
    ✓ should return errors for invalid data
  ✓ formatZodErrors
    ✓ should format errors into readable object
✓ Edge Cases
  ✓ should handle empty strings
  ✓ should handle missing required fields

Test Files  1 passed (1)
     Tests  15 passed (15)
  Duration  250ms
```

**Coverage Goal**: >85% for `src/lib/server/db/validation.ts`

### Test Files Structure

```
src/lib/server/db/
├── schema.ts                 # Drizzle schemas (from Phase 2-3)
├── validation.ts             # Zod schemas and helpers (Phase 4)
└── validation.test.ts        # Unit tests for validation.ts
```

### Adding New Unit Tests

1. Open `src/lib/server/db/validation.test.ts`
2. Add test within appropriate `describe` block
3. Follow the pattern:

```typescript
import { describe, it, expect } from 'vitest';
import { insertArticleSchema } from './validation';

describe('Auto-generated Insert Schemas', () => {
  describe('insertArticleSchema', () => {
    it('should validate valid article data', () => {
      // Arrange: Prepare valid data
      const validArticle = {
        categoryId: 'cat-1',
        complexity: 'intermediate',
        status: 'draft',
      };

      // Act: Validate data
      const result = insertArticleSchema.safeParse(validArticle);

      // Assert: Check result
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.categoryId).toBe('cat-1');
      }
    });

    it('should reject invalid status enum', () => {
      // Arrange: Prepare invalid data
      const invalidArticle = {
        categoryId: 'cat-1',
        complexity: 'intermediate',
        status: 'invalid_status',
      };

      // Act: Validate data
      const result = insertArticleSchema.safeParse(invalidArticle);

      // Assert: Check failure
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('status');
      }
    });
  });
});
```

---

## 📊 Coverage Report

### Generate Coverage

```bash
# Generate coverage report
pnpm test:coverage src/lib/server/db/validation.test.ts
```

### View Coverage

**Terminal Output**:

```
 % Coverage report from v8
------------------------------|---------|----------|---------|---------|
File                          | % Stmts | % Branch | % Funcs | % Lines |
------------------------------|---------|----------|---------|---------|
All files                     |   87.50 |    85.00 |   90.00 |   87.50 |
 validation.ts                |   87.50 |    85.00 |   90.00 |   87.50 |
------------------------------|---------|----------|---------|---------|
```

**HTML Report**:

```bash
# Generate HTML coverage report
pnpm test:coverage src/lib/server/db/validation.test.ts

# Open in browser
open coverage/index.html
```

### Coverage Goals

| Area        | Target   | Current |
| ----------- | -------- | ------- |
| Statements  | >85%     | -       |
| Branches    | >80%     | -       |
| Functions   | >85%     | -       |
| Lines       | >85%     | -       |
| **Overall** | **>85%** | -       |

---

## 🐛 Debugging Tests

### Common Issues

#### Issue: Tests fail with "Cannot find module"

**Solution**:

```bash
# Clear cache and reinstall
rm -rf node_modules/.cache
pnpm install

# Restart test
pnpm test src/lib/server/db/validation.test.ts
```

#### Issue: Slug validation test fails unexpectedly

**Solution**:

```bash
# Check regex in validation.ts
grep "slug.*regex" src/lib/server/db/validation.ts

# Should be: /^[a-z0-9-]+$/
# Not: /^[a-zA-Z0-9-]+$/ (uppercase not allowed)
```

#### Issue: Coverage is below 85%

**Solution**:

1. Run coverage report: `pnpm test:coverage`
2. Open HTML report to see uncovered lines
3. Add tests for uncovered code:
   - Error branches (invalid data paths)
   - Edge cases (empty strings, null, undefined)
   - All validation helpers

### Debug Commands

```bash
# Run single test in verbose mode
pnpm test src/lib/server/db/validation.test.ts -t "should validate valid article data" --reporter=verbose

# Run with console output visible
pnpm test src/lib/server/db/validation.test.ts --reporter=verbose

# Debug with Node inspector (if needed)
node --inspect-brk node_modules/vitest/vitest.mjs src/lib/server/db/validation.test.ts
```

---

## 🧩 Test Categories

### 1. Auto-Generated Schema Tests

**Purpose**: Verify drizzle-zod generates schemas correctly

**Examples**:

- Valid data passes validation
- Required fields are enforced
- ENUM values validated
- Foreign key fields accepted

**Coverage**: Basic schema structure

---

### 2. Custom Refinement Tests

**Purpose**: Verify custom validation rules work

**Examples**:

- Slug format validation (lowercase, hyphens only)
- String length constraints (title max 200, excerpt max 500)
- SEO field validation
- ENUM refinements

**Coverage**: Custom business logic

---

### 3. Partial Schema Tests

**Purpose**: Verify update schemas allow optional fields

**Examples**:

- Partial updates with only changed fields
- Partial updates still validate provided fields
- No required fields in update schemas

**Coverage**: Update operations

---

### 4. Validation Helper Tests

**Purpose**: Verify helper functions work correctly

**Examples**:

- `validateArticleInsert` with valid/invalid data
- `validateTranslationInsert` with valid/invalid data
- `validateArticleUpdate` with partial data
- `formatZodErrors` produces readable messages

**Coverage**: Helper functions

---

### 5. Edge Case Tests

**Purpose**: Verify handling of unusual inputs

**Examples**:

- Empty strings (should fail if required)
- Missing required fields (should fail)
- Extra fields (should pass - Zod allows by default)
- Null vs undefined (should handle correctly)
- Very long strings (should fail if over max)

**Coverage**: Boundary conditions

---

## 🎯 Test Quality Checklist

### Before Committing Tests

- [ ] All tests have clear, descriptive names
- [ ] Tests are organized in logical `describe` blocks
- [ ] Each test has clear arrange-act-assert structure
- [ ] Both success and failure cases tested
- [ ] Edge cases covered
- [ ] Error messages verified
- [ ] No skipped tests (`it.skip`) without explanation
- [ ] No focused tests (`it.only`) left in code
- [ ] No console.log statements (unless for debugging, remove after)
- [ ] Coverage >85%

---

## 📝 Best Practices

### Writing Tests

✅ **Do**:

- Test behavior, not implementation
- Use descriptive test names ("should reject invalid slug format (uppercase)")
- One assertion per test when possible
- Test edge cases and error paths
- Verify error messages are clear

❌ **Don't**:

- Test library internals (Zod, drizzle-zod)
- Write flaky tests (tests that fail randomly)
- Ignore failing tests
- Skip edge case testing
- Use vague test names ("test 1", "works")

### Test Naming

**Pattern**: `should [expected behavior] when [condition]`

Examples:

- `should validate valid article data`
- `should reject invalid slug format (uppercase)`
- `should allow partial updates with optional fields`
- `should format Zod errors into readable object`

### Test Organization

```typescript
describe('Feature or Component', () => {
  describe('Sub-feature or Method', () => {
    it('should do X when Y', () => {
      // Test code
    });

    it('should do Z when W', () => {
      // Test code
    });
  });
});
```

---

## ✅ Testing Checklist

Before marking Phase 4 complete:

### Unit Tests

- [ ] All auto-generated schemas tested (insert/select)
- [ ] All custom refinements tested (slug, lengths, ENUMs)
- [ ] All partial schemas tested
- [ ] All validation helpers tested
- [ ] Error formatting tested
- [ ] Edge cases tested

### Test Quality

- [ ] All tests pass
- [ ] Descriptive test names
- [ ] Clear arrange-act-assert structure
- [ ] No skipped or focused tests
- [ ] No console.log statements

### Coverage

- [ ] Coverage >85% overall
- [ ] All functions covered
- [ ] All branches covered (if/else)
- [ ] Edge cases covered

### Running Tests

- [ ] Tests run successfully: `pnpm test src/lib/server/db/validation.test.ts`
- [ ] Coverage passes: `pnpm test:coverage`
- [ ] No warnings or errors in output

---

## 📊 Test Metrics

| Metric        | Target | Actual |
| ------------- | ------ | ------ |
| Test Count    | 15+    | -      |
| Coverage      | >85%   | -      |
| Test Duration | <500ms | -      |
| Passing Tests | 100%   | -      |

---

## ❓ FAQ

**Q: How much should I test?**
A: Aim for >85% coverage, focus on:

- Happy paths (valid data)
- Error paths (invalid data)
- Edge cases (empty, missing, extra fields)
- Custom business logic (slug validation, etc.)

**Q: Should I test drizzle-zod internals?**
A: No. Trust that drizzle-zod works. Test your custom refinements and helpers.

**Q: Tests are slow, what to do?**
A: Run specific tests during dev (`-t "test name"`). Run full suite before commit.

**Q: Can I skip tests?**
A: No. Tests ensure validation works correctly and prevent regressions.

**Q: What if a test fails?**
A: Fix the validation logic or update the test if expectations were wrong. Don't commit failing tests.

**Q: How do I test error messages?**
A: Use `.safeParse()` and check `result.error.errors[0].message`:

```typescript
const result = schema.safeParse(invalidData);
expect(result.success).toBe(false);
if (!result.success) {
  expect(result.error.errors[0].message).toContain('Slug must be lowercase');
}
```

---

**Testing complete? Mark tests as passing in VALIDATION_CHECKLIST.md! ✅**
