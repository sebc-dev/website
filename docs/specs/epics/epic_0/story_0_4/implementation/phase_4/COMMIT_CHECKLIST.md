# Phase 4 - Checklist per Commit

This document provides a detailed checklist for each atomic commit of Phase 4.

---

## 📋 Commit 1: Install drizzle-zod dependency

**Files**: `package.json`, `pnpm-lock.yaml`
**Estimated Duration**: 15-20 minutes

### Implementation Tasks

- [ ] Run `pnpm add drizzle-zod` to install the package
- [ ] Verify `drizzle-zod` appears in `package.json` dependencies section
- [ ] Check `pnpm-lock.yaml` is updated
- [ ] Verify compatible version with current `drizzle-orm` version
- [ ] Test import: `node -e "require('drizzle-zod'); console.log('OK')"`

### Validation

```bash
# Installation succeeds
pnpm install

# Package is listed
pnpm list drizzle-zod

# Import works (Node.js test)
node -e "const { createInsertSchema } = require('drizzle-zod'); console.log('drizzle-zod loaded successfully')"
```

**Expected Result**:

- `drizzle-zod` listed in dependencies (not devDependencies)
- Version compatible with `drizzle-orm` (check package.json)
- Import succeeds without errors

### Review Checklist

#### Dependency Management

- [ ] `drizzle-zod` in `dependencies` (not `devDependencies`)
- [ ] Version is latest stable or compatible with project
- [ ] `pnpm-lock.yaml` updated correctly
- [ ] No unrelated dependency changes

#### Installation

- [ ] `pnpm install` completes without errors
- [ ] Package can be imported in Node.js
- [ ] No peer dependency warnings

### Commit Message

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat(db): install drizzle-zod for schema validation

- Add drizzle-zod dependency to package.json
- Required for auto-generating Zod schemas from Drizzle
- Enables single source of truth for validation

Part of Phase 4 - Commit 1/5"
```

---

## 📋 Commit 2: Generate base Zod schemas from Drizzle

**Files**: `src/lib/server/db/validation.ts` (new)
**Estimated Duration**: 40-50 minutes

### Implementation Tasks

- [ ] Create file `src/lib/server/db/validation.ts`
- [ ] Import `createInsertSchema` and `createSelectSchema` from `drizzle-zod`
- [ ] Import all table schemas from `src/lib/server/db/schema.ts`:
  - `articles`, `articleTranslations`, `categories`, `tags`, `articleTags`
- [ ] Generate insert schemas for all 5 tables:
  - [ ] `export const insertArticleSchema = createInsertSchema(articles)`
  - [ ] `export const insertArticleTranslationSchema = createInsertSchema(articleTranslations)`
  - [ ] `export const insertCategorySchema = createInsertSchema(categories)`
  - [ ] `export const insertTagSchema = createInsertSchema(tags)`
  - [ ] `export const insertArticleTagSchema = createInsertSchema(articleTags)`
- [ ] Generate select schemas for all 5 tables:
  - [ ] `export const selectArticleSchema = createSelectSchema(articles)`
  - [ ] `export const selectArticleTranslationSchema = createSelectSchema(articleTranslations)`
  - [ ] `export const selectCategorySchema = createSelectSchema(categories)`
  - [ ] `export const selectTagSchema = createSelectSchema(tags)`
  - [ ] `export const selectArticleTagSchema = createSelectSchema(articleTags)`
- [ ] Add file header comment explaining purpose
- [ ] Organize imports and exports clearly

### Validation

```bash
# Type-checking passes
pnpm tsc --noEmit

# Linting passes
pnpm lint src/lib/server/db/validation.ts

# Manual import test
node -e "const schemas = require('./src/lib/server/db/validation'); console.log(Object.keys(schemas))"
```

**Expected Result**:

- File compiles without TypeScript errors
- All 10 schemas exported (5 insert + 5 select)
- Schemas can be imported and used

### Review Checklist

#### Schema Generation

- [ ] All 5 tables have insert schemas
- [ ] All 5 tables have select schemas
- [ ] Schemas use `createInsertSchema()` and `createSelectSchema()`
- [ ] No manual Zod schemas (pure auto-generation)

#### Code Quality

- [ ] File has header comment explaining purpose
- [ ] Imports organized logically (external, then internal)
- [ ] Exports are named exports (not default)
- [ ] Consistent naming: `insert*Schema` and `select*Schema`

#### TypeScript

- [ ] No TypeScript errors (`pnpm tsc --noEmit`)
- [ ] No `any` types
- [ ] Type inference works for generated schemas

### Commit Message

```bash
git add src/lib/server/db/validation.ts
git commit -m "feat(db): generate base Zod schemas from Drizzle

- Create validation.ts with createInsertSchema/createSelectSchema
- Generate insert schemas for 5 tables (articles, translations, categories, tags, articleTags)
- Generate select schemas for 5 tables
- Auto-generated schemas provide baseline validation

Part of Phase 4 - Commit 2/5"
```

---

## 📋 Commit 3: Add custom refinements and type inference

**Files**: `src/lib/server/db/validation.ts` (modified)
**Estimated Duration**: 50-60 minutes

### Implementation Tasks

- [ ] Extend `insertArticleTranslationSchema` with custom slug validation:
  - [ ] Regex: `/^[a-z0-9-]+$/` (lowercase alphanumeric with hyphens)
  - [ ] Error message: "Slug must be lowercase alphanumeric with hyphens"
  - [ ] Min length: 1 (required)
  - [ ] Max length: 200
- [ ] Add title validation to `insertArticleTranslationSchema`:
  - [ ] Min length: 1 (required)
  - [ ] Max length: 200
- [ ] Add excerpt validation to `insertArticleTranslationSchema`:
  - [ ] Min length: 1 (required)
  - [ ] Max length: 500
- [ ] Add seoTitle and seoDescription validation (similar constraints)
- [ ] Create partial schemas for updates:
  - [ ] `export const updateArticleSchema = insertArticleSchema.partial()`
  - [ ] `export const updateArticleTranslationSchema = insertArticleTranslationSchema.partial()`
- [ ] Add type inference exports for all schemas:
  - [ ] `export type InsertArticle = z.infer<typeof insertArticleSchema>`
  - [ ] `export type SelectArticle = z.infer<typeof selectArticleSchema>`
  - [ ] `export type InsertArticleTranslation = z.infer<typeof insertArticleTranslationSchema>`
  - [ ] `export type SelectArticleTranslation = z.infer<typeof selectArticleTranslationSchema>`
  - [ ] Repeat for categories, tags, articleTags
- [ ] Add JSDoc comments explaining custom refinements

### Validation

```bash
# Type-checking passes
pnpm tsc --noEmit

# Test slug validation (manual)
node -e "
  const { insertArticleTranslationSchema } = require('./src/lib/server/db/validation');

  // Should fail (uppercase)
  const result1 = insertArticleTranslationSchema.safeParse({ slug: 'Invalid-Slug' });
  console.log('Uppercase test (should be false):', result1.success);

  // Should pass (lowercase)
  const result2 = insertArticleTranslationSchema.safeParse({
    articleId: 'test',
    language: 'fr',
    slug: 'valid-slug',
    title: 'Test',
    excerpt: 'Test',
    seoTitle: 'Test',
    seoDescription: 'Test',
    contentMdx: 'Test'
  });
  console.log('Lowercase test (should be true):', result2.success);
"
```

**Expected Result**:

- Slug validation rejects uppercase and special characters
- String length constraints enforced
- Partial schemas allow optional fields
- Type exports provide autocomplete in IDE

### Review Checklist

#### Custom Refinements

- [ ] Slug regex is correct: `/^[a-z0-9-]+$/`
- [ ] All string fields have min/max length constraints
- [ ] Error messages are clear and user-friendly
- [ ] Refinements use `.extend()` on generated schemas

#### Partial Schemas

- [ ] Update schemas use `.partial()` correctly
- [ ] Partial schemas still validate provided fields
- [ ] Naming convention: `update*Schema`

#### Type Inference

- [ ] All schemas have type exports
- [ ] Naming convention: `Insert*` and `Select*` types
- [ ] Types use `z.infer<typeof schema>`
- [ ] TypeScript autocomplete works in IDE

#### Documentation

- [ ] JSDoc comments explain custom refinements
- [ ] Complex validation logic documented
- [ ] Usage examples in comments (optional)

### Commit Message

```bash
git add src/lib/server/db/validation.ts
git commit -m "feat(db): add custom refinements and type inference

- Extend insertArticleTranslationSchema with slug validation (lowercase, hyphens only)
- Add string length constraints (title, excerpt, SEO fields)
- Create partial schemas for updates (updateArticleSchema, updateArticleTranslationSchema)
- Export TypeScript types for all schemas (InsertArticle, SelectArticle, etc.)
- Add JSDoc comments documenting refinements

Part of Phase 4 - Commit 3/5"
```

---

## 📋 Commit 4: Create validation helper utilities

**Files**: `src/lib/server/db/validation.ts` (modified)
**Estimated Duration**: 50-60 minutes

### Implementation Tasks

- [ ] Create generic validation helper:
  ```typescript
  export function validateData<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
  ): { success: true; data: T } | { success: false; errors: z.ZodError };
  ```
- [ ] Implement helper logic using `.safeParse()`
- [ ] Create specific validation helpers:
  - [ ] `export function validateArticleInsert(data: unknown)`
  - [ ] `export function validateTranslationInsert(data: unknown)`
  - [ ] `export function validateArticleUpdate(data: unknown)`
  - [ ] `export function validateTranslationUpdate(data: unknown)`
- [ ] Create error formatting utility:
  ```typescript
  export function formatZodErrors(errors: z.ZodError): Record<string, string>;
  ```
- [ ] Implement error formatting (flatten Zod errors to field → message map)
- [ ] Add JSDoc comments explaining usage patterns
- [ ] Add usage examples in comments

### Validation

```bash
# Type-checking passes
pnpm tsc --noEmit

# Manual test of validation helpers
node -e "
  const { validateArticleInsert, formatZodErrors } = require('./src/lib/server/db/validation');

  // Valid data
  const result1 = validateArticleInsert({
    categoryId: 'cat-1',
    complexity: 'beginner',
    status: 'draft'
  });
  console.log('Valid test (should be true):', result1.success);

  // Invalid data
  const result2 = validateArticleInsert({ status: 'invalid' });
  console.log('Invalid test (should be false):', result2.success);
  if (!result2.success) {
    console.log('Formatted errors:', formatZodErrors(result2.errors));
  }
"
```

**Expected Result**:

- Generic helper validates any schema
- Specific helpers provide type-safe wrappers
- Error formatting produces readable messages
- Return types are discriminated unions

### Review Checklist

#### Generic Helper

- [ ] Uses TypeScript generics (`<T>`)
- [ ] Returns discriminated union (success/failure)
- [ ] Uses `.safeParse()` (not `.parse()` which throws)
- [ ] Type-safe return values

#### Specific Helpers

- [ ] Cover main use cases (insert/update for articles and translations)
- [ ] Call generic helper internally
- [ ] Provide clear function names
- [ ] No code duplication

#### Error Formatting

- [ ] Converts Zod errors to simple object
- [ ] Field paths are clear (e.g., "slug", "title")
- [ ] Error messages are user-friendly
- [ ] Handles nested errors correctly

#### Documentation

- [ ] JSDoc comments explain parameters and return types
- [ ] Usage examples provided
- [ ] Complex logic documented

### Commit Message

```bash
git add src/lib/server/db/validation.ts
git commit -m "feat(db): create validation helper utilities

- Add generic validateData helper with type-safe return
- Create specific helpers: validateArticleInsert, validateTranslationInsert, etc.
- Implement formatZodErrors for user-friendly error messages
- Add JSDoc comments with usage examples
- Helpers ready for Server Actions integration

Part of Phase 4 - Commit 4/5"
```

---

## 📋 Commit 5: Write unit tests for validation

**Files**: `src/lib/server/db/validation.test.ts` (new)
**Estimated Duration**: 60-70 minutes

### Implementation Tasks

- [ ] Create file `src/lib/server/db/validation.test.ts`
- [ ] Import Vitest utilities: `describe`, `it`, `expect`
- [ ] Import all schemas and helpers from `validation.ts`
- [ ] Write tests for auto-generated insert schemas:
  - [ ] Test `insertArticleSchema` with valid data (should pass)
  - [ ] Test `insertArticleSchema` with invalid enum (should fail)
  - [ ] Test `insertArticleTranslationSchema` with valid data (should pass)
  - [ ] Test `insertArticleTranslationSchema` with invalid slug formats (should fail)
- [ ] Write tests for custom refinements:
  - [ ] Slug validation: valid 'my-article' (pass), invalid 'My_Article' (fail), invalid 'my article' (fail)
  - [ ] ENUM validation: valid 'draft'/'published' (pass), invalid 'invalid' (fail)
  - [ ] String length: title too long (fail), excerpt too long (fail)
- [ ] Write tests for partial schemas:
  - [ ] Partial update with only title (should pass)
  - [ ] Partial update with invalid slug (should still fail)
- [ ] Write tests for validation helpers:
  - [ ] `validateArticleInsert` with valid data (success: true)
  - [ ] `validateArticleInsert` with invalid data (success: false, has errors)
  - [ ] `validateTranslationInsert` with edge cases
  - [ ] `formatZodErrors` produces readable messages
- [ ] Write edge case tests:
  - [ ] Empty strings (should fail if required)
  - [ ] Missing required fields (should fail)
  - [ ] Extra fields (should pass - Zod allows by default)
  - [ ] Null vs undefined handling
- [ ] Organize tests with clear `describe` blocks
- [ ] Use descriptive test names ("should ...")
- [ ] Aim for >85% coverage

### Validation

```bash
# Run tests
pnpm test src/lib/server/db/validation.test.ts

# Check coverage
pnpm test:coverage src/lib/server/db/validation.test.ts

# All tests should pass
# Coverage should be >85%
```

**Expected Result**:

- 15+ test cases covering all scenarios
- All tests pass
- Coverage >85% for validation.ts
- Clear, descriptive test names

### Review Checklist

#### Test Coverage

- [ ] Valid data tests (happy path) for all schemas
- [ ] Invalid data tests (error cases) for all schemas
- [ ] Custom refinements tested (slug, length, enum)
- [ ] Partial schemas tested
- [ ] Validation helpers tested
- [ ] Error formatting tested
- [ ] Edge cases tested (empty, missing, extra fields)

#### Test Quality

- [ ] Tests use descriptive names ("should validate valid article data")
- [ ] Tests are isolated (no dependencies between tests)
- [ ] Tests check both success and error cases
- [ ] Error messages verified in tests
- [ ] Each test has clear arrange-act-assert structure

#### Test Organization

- [ ] Tests grouped in `describe` blocks by feature
- [ ] Consistent naming convention
- [ ] No skipped or commented-out tests
- [ ] No console.log statements

#### Coverage

- [ ] Coverage report shows >85%
- [ ] All functions tested
- [ ] All branches tested (if/else)
- [ ] Edge cases covered

### Commit Message

```bash
git add src/lib/server/db/validation.test.ts
git commit -m "test(db): add comprehensive validation tests

- Test auto-generated schemas (insert/select)
- Test custom refinements (slug format, string lengths, ENUMs)
- Test partial schemas for updates
- Test validation helpers (validateArticleInsert, etc.)
- Test error formatting utility
- Cover edge cases (empty strings, missing fields)
- Achieve >85% test coverage

Part of Phase 4 - Commit 5/5"
```

---

## ✅ Final Phase Validation

After all 5 commits:

### Complete Phase Checklist

- [ ] All 5 commits completed
- [ ] All tests pass (`pnpm test src/lib/server/db/validation.test.ts`)
- [ ] Type-checking passes (`pnpm tsc --noEmit`)
- [ ] Linter passes (`pnpm lint`)
- [ ] Coverage >85% (`pnpm test:coverage`)
- [ ] Documentation updated (validation chain documented)
- [ ] VALIDATION_CHECKLIST.md completed

### Final Validation Commands

```bash
# Install dependencies (if fresh)
pnpm install

# Type-checking
pnpm tsc --noEmit

# Linting
pnpm lint

# Tests
pnpm test src/lib/server/db/validation.test.ts

# Coverage
pnpm test:coverage src/lib/server/db/validation.test.ts
```

**All commands must pass with no errors before marking Phase 4 complete!**

---

## 📊 Progress Tracking

Mark commits as you complete them:

- [ ] Commit 1: Install drizzle-zod ✅
- [ ] Commit 2: Generate base Zod schemas ✅
- [ ] Commit 3: Add custom refinements and type inference ✅
- [ ] Commit 4: Create validation helper utilities ✅
- [ ] Commit 5: Write unit tests for validation ✅

**Phase 4 is complete when all checkboxes are checked! 🎉**
