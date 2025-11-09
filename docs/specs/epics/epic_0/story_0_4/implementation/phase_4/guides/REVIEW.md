# Phase 4 - Code Review Guide

Complete guide for reviewing the Phase 4 implementation.

---

## 🎯 Review Objective

Validate that the implementation:

- ✅ Establishes single source of truth for validation (Drizzle → drizzle-zod → Zod)
- ✅ Auto-generates Zod schemas correctly for all 5 tables
- ✅ Adds appropriate custom refinements (slug format, string lengths)
- ✅ Provides reusable validation helpers for Server Actions
- ✅ Has comprehensive tests (>85% coverage)
- ✅ Follows project TypeScript standards
- ✅ Is well documented and maintainable

---

## 📋 Review Approach

Phase 4 is split into **5 atomic commits**. You can:

**Option A: Commit-by-commit review** (recommended)

- Easier to digest (10-30 min per commit)
- Progressive validation
- Targeted feedback

**Option B: Global review at once**

- Faster (1.5-2h total)
- Immediate overview
- Requires more focus

**Estimated Total Time**: 1.5-2 hours

---

## 🔍 Commit-by-Commit Review

### Commit 1: Install drizzle-zod dependency

**Files**: `package.json`, `pnpm-lock.yaml` (~10 lines)
**Duration**: 10 minutes

#### Review Checklist

##### Dependency Management

- [ ] `drizzle-zod` added to `dependencies` (not `devDependencies`)
- [ ] Version is latest stable compatible with `drizzle-orm`
- [ ] `pnpm-lock.yaml` updated correctly
- [ ] No unrelated dependency changes

##### Installation

- [ ] `pnpm install` completes without errors
- [ ] Package can be imported: `node -e "require('drizzle-zod')"`

#### Technical Validation

```bash
# Installation succeeds
pnpm install

# Package listed
pnpm list drizzle-zod

# No peer dependency warnings
pnpm list | grep WARN
```

**Expected Result**:

- Clean installation
- drizzle-zod version compatible with drizzle-orm

#### Questions to Ask

1. Is the version compatible with our current drizzle-orm version?
2. Are there any peer dependency warnings?
3. Was package.json modified correctly?

**Verdict**: ✅ Approve | 🔧 Request changes | ❌ Reject

---

### Commit 2: Generate base Zod schemas from Drizzle

**Files**: `src/lib/server/db/validation.ts` (new, ~90 lines)
**Duration**: 20 minutes

#### Review Checklist

##### Schema Generation

- [ ] All 5 tables have insert schemas (`createInsertSchema`)
- [ ] All 5 tables have select schemas (`createSelectSchema`)
- [ ] Schema names follow convention: `insert*Schema`, `select*Schema`
- [ ] No manual Zod schemas (pure auto-generation)

##### Code Structure

- [ ] File has header comment explaining purpose
- [ ] Imports organized: external packages first, then internal
- [ ] Exports are named exports (not default)
- [ ] Consistent formatting and style

##### TypeScript

- [ ] No TypeScript errors (`pnpm tsc --noEmit`)
- [ ] No `any` types
- [ ] Type inference works (schemas are typed)
- [ ] Imports from `schema.ts` are correct

#### Technical Validation

```bash
# Type-checking
pnpm tsc --noEmit

# Linting
pnpm lint src/lib/server/db/validation.ts

# Manual import test
node -e "const schemas = require('./src/lib/server/db/validation'); console.log(Object.keys(schemas))"
```

**Expected Result**:

- 10 schemas exported (5 insert + 5 select)
- TypeScript compiles without errors
- Clean code with no linting issues

#### Questions to Ask

1. Are all table schemas from `schema.ts` imported?
2. Do generated schemas match Drizzle table definitions?
3. Is the file well-organized and easy to understand?
4. Are naming conventions consistent?

**Code Quality Check**:

```typescript
// ✅ Good: Clear, auto-generated
export const insertArticleSchema = createInsertSchema(articles)

// ❌ Bad: Manual Zod schema (defeats purpose)
export const insertArticleSchema = z.object({ ... })
```

**Verdict**: ✅ Approve | 🔧 Request changes | ❌ Reject

---

### Commit 3: Add custom refinements and type inference

**Files**: `src/lib/server/db/validation.ts` (modified, ~90 lines added)
**Duration**: 25 minutes

#### Review Checklist

##### Custom Refinements

- [ ] Slug validation: regex `/^[a-z0-9-]+$/` (lowercase, hyphens only)
- [ ] Slug validation: clear error message
- [ ] String length constraints: title (1-200), excerpt (1-500)
- [ ] SEO fields validated (seoTitle, seoDescription)
- [ ] Refinements use `.extend()` on generated schemas
- [ ] No breaking changes to base schemas

##### Partial Schemas

- [ ] Update schemas use `.partial()` correctly
- [ ] Naming: `updateArticleSchema`, `updateArticleTranslationSchema`
- [ ] Partial schemas still validate provided fields

##### Type Inference

- [ ] Type exports for all schemas (Insert*, Select*)
- [ ] Types use `z.infer<typeof schema>`
- [ ] Naming convention consistent
- [ ] TypeScript autocomplete works

##### Documentation

- [ ] Custom refinements documented in comments
- [ ] Complex validation logic explained
- [ ] JSDoc comments where helpful

#### Technical Validation

```bash
# Type-checking
pnpm tsc --noEmit

# Test slug validation
node -e "
  const { insertArticleTranslationSchema } = require('./src/lib/server/db/validation');

  // Should fail
  const r1 = insertArticleTranslationSchema.safeParse({ slug: 'Invalid_Slug' });
  console.log('Uppercase test (should be false):', r1.success);

  // Should pass
  const r2 = insertArticleTranslationSchema.safeParse({
    articleId: 'test',
    language: 'fr',
    slug: 'valid-slug',
    title: 'Test',
    excerpt: 'Test',
    seoTitle: 'Test',
    seoDescription: 'Test',
    contentMdx: 'Test'
  });
  console.log('Valid test (should be true):', r2.success);
"
```

**Expected Result**:

- Invalid slugs rejected (uppercase, spaces, special chars)
- String length constraints enforced
- Type exports provide IDE autocomplete

#### Questions to Ask

1. Are refinement rules appropriate for the business logic?
2. Are error messages clear and user-friendly?
3. Do partial schemas allow updates correctly?
4. Is type inference working in the IDE?

**Code Quality Check**:

```typescript
// ✅ Good: Clear validation with good error message
.extend({
  slug: z.string()
    .min(1, 'Slug is required')
    .max(200, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
})

// ❌ Bad: Vague error message
.extend({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid')
})
```

**Verdict**: ✅ Approve | 🔧 Request changes | ❌ Reject

---

### Commit 4: Create validation helper utilities

**Files**: `src/lib/server/db/validation.ts` (modified, ~70 lines added)
**Duration**: 25 minutes

#### Review Checklist

##### Generic Helper

- [ ] Uses TypeScript generics (`<T>`)
- [ ] Returns discriminated union (success/failure)
- [ ] Uses `.safeParse()` (not `.parse()` which throws)
- [ ] Type-safe return values

##### Specific Helpers

- [ ] Cover main use cases (article/translation insert/update)
- [ ] Call generic helper internally (no duplication)
- [ ] Clear function names
- [ ] Type-safe parameters and returns

##### Error Formatting

- [ ] Converts Zod errors to simple object
- [ ] Field paths are clear (e.g., "slug", "title")
- [ ] Error messages are user-friendly
- [ ] Handles nested errors correctly

##### Documentation

- [ ] JSDoc comments explain parameters and returns
- [ ] Usage examples provided
- [ ] Complex logic documented

#### Technical Validation

```bash
# Type-checking
pnpm tsc --noEmit

# Manual test
node -e "
  const { validateArticleInsert, formatZodErrors } = require('./src/lib/server/db/validation');

  // Valid
  const r1 = validateArticleInsert({
    categoryId: 'cat-1',
    complexity: 'beginner',
    status: 'draft'
  });
  console.log('Valid test:', r1.success);

  // Invalid
  const r2 = validateArticleInsert({ status: 'invalid' });
  console.log('Invalid test:', r2.success);
  if (!r2.success) {
    console.log('Errors:', formatZodErrors(r2.errors));
  }
"
```

**Expected Result**:

- Helpers return discriminated unions
- Error formatting produces readable messages
- Type safety maintained throughout

#### Questions to Ask

1. Are helpers reusable and easy to use?
2. Do error messages help users understand what's wrong?
3. Is the generic helper flexible enough for future schemas?
4. Are return types properly typed (no `any`)?

**Code Quality Check**:

```typescript
// ✅ Good: Type-safe discriminated union
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: z.ZodError };

// ❌ Bad: Untyped return
export function validateData(schema: any, data: any): any;
```

**Verdict**: ✅ Approve | 🔧 Request changes | ❌ Reject

---

### Commit 5: Write unit tests for validation

**Files**: `src/lib/server/db/validation.test.ts` (new, ~230 lines)
**Duration**: 30 minutes

#### Review Checklist

##### Test Coverage

- [ ] Valid data tests (happy path) for all schemas
- [ ] Invalid data tests (error cases) for all schemas
- [ ] Custom refinements tested (slug, length, enum)
- [ ] Partial schemas tested
- [ ] Validation helpers tested
- [ ] Error formatting tested
- [ ] Edge cases tested (empty, missing, extra fields)

##### Test Quality

- [ ] Descriptive test names ("should validate valid article data")
- [ ] Tests are isolated (no dependencies)
- [ ] Tests check both success and error cases
- [ ] Error messages verified
- [ ] Clear arrange-act-assert structure

##### Test Organization

- [ ] Tests grouped in `describe` blocks
- [ ] Consistent naming convention
- [ ] No skipped or commented-out tests
- [ ] No console.log statements (except for debugging)

##### Coverage

- [ ] Coverage report shows >85%
- [ ] All functions tested
- [ ] All branches tested (if/else)
- [ ] Edge cases covered

#### Technical Validation

```bash
# Run tests
pnpm test src/lib/server/db/validation.test.ts

# Check coverage
pnpm test:coverage src/lib/server/db/validation.test.ts

# All tests should pass
# Coverage should be >85%
```

**Expected Result**:

- 15+ test cases
- All tests pass
- Coverage >85%
- Clear test output

#### Questions to Ask

1. Do tests cover all important scenarios?
2. Are edge cases tested (empty strings, missing fields)?
3. Are error cases tested with clear expectations?
4. Is test coverage adequate (>85%)?

**Test Quality Check**:

```typescript
// ✅ Good: Clear, descriptive test
it('should reject invalid slug format (uppercase)', () => {
  const invalidTranslation = { slug: 'Invalid-Slug', ... }
  const result = insertArticleTranslationSchema.safeParse(invalidTranslation)
  expect(result.success).toBe(false)
})

// ❌ Bad: Vague test name
it('works', () => {
  const result = schema.safeParse(data)
  expect(result.success).toBe(true)
})
```

**Verdict**: ✅ Approve | 🔧 Request changes | ❌ Reject

---

## ✅ Global Validation

After reviewing all commits:

### Architecture & Design

- [ ] Single source of truth maintained (Drizzle → drizzle-zod → Zod)
- [ ] Validation chain is clear and documented
- [ ] Auto-generation used where possible
- [ ] Custom refinements only where needed
- [ ] Reusable helpers for Server Actions

### Code Quality

- [ ] Consistent TypeScript style
- [ ] Clear naming conventions
- [ ] Appropriate comments and JSDoc
- [ ] No dead code or commented-out code
- [ ] No debug statements

### Testing

- [ ] All features tested
- [ ] Edge cases covered
- [ ] Coverage >85%
- [ ] Tests are meaningful and clear

### Type Safety

- [ ] No `any` types (unless absolutely necessary and documented)
- [ ] Proper type inference throughout
- [ ] Types exported for reuse
- [ ] TypeScript strict mode compliance

### Performance

- [ ] No obvious bottlenecks
- [ ] Validation is efficient (auto-generated schemas are optimized)
- [ ] Error formatting is fast

### Security

- [ ] No sensitive data exposed in validation errors
- [ ] Input validation comprehensive
- [ ] Error messages don't leak implementation details

### Documentation

- [ ] Validation chain documented
- [ ] Usage patterns clear
- [ ] Complex refinements explained
- [ ] JSDoc comments for public APIs

---

## 📝 Feedback Template

Use this template for feedback:

```markdown
## Review Feedback - Phase 4

**Reviewer**: [Name]
**Date**: [Date]
**Commits Reviewed**: All (1-5)

### ✅ Strengths

- Single source of truth established correctly (Drizzle → drizzle-zod)
- Clear validation helpers for Server Actions
- Comprehensive test coverage (>85%)
- [Other positive points]

### 🔧 Required Changes

1. **validation.ts:45**: Slug regex should reject underscores
   - **Why**: Underscores not allowed in slugs per project standards
   - **Suggestion**: Update regex to `/^[a-z0-9-]+$/`

2. **validation.test.ts:120**: Missing edge case for very long strings
   - **Why**: Need to test max length constraints
   - **Suggestion**: Add test for title with 201 characters

[Repeat for each required change]

### 💡 Suggestions (Optional)

- Consider adding helper for bulk validation (array of items)
- Could extract error formatting to separate utility file
- [Other nice-to-have improvements]

### 📊 Verdict

- [ ] ✅ **APPROVED** - Ready to merge
- [ ] 🔧 **CHANGES REQUESTED** - Needs fixes listed above
- [ ] ❌ **REJECTED** - Major rework needed

### Next Steps

[What should happen next - fix issues, re-review, merge, etc.]
```

---

## 🎯 Review Actions

### If Approved ✅

1. Merge the commits to main branch
2. Update phase status to COMPLETED in INDEX.md
3. Update EPIC_TRACKING.md progress
4. Archive review notes
5. Proceed to Phase 5

### If Changes Requested 🔧

1. Create detailed feedback (use template above)
2. Discuss with developer
3. Developer makes fixes
4. Re-review after fixes

### If Rejected ❌

1. Document major issues clearly
2. Schedule discussion with developer
3. Plan rework strategy
4. Consider splitting into smaller changes

---

## ❓ FAQ

**Q: What if I disagree with a validation rule?**
A: Discuss with the developer and check against project requirements. If it meets specs, it's probably fine.

**Q: Should I review tests in detail?**
A: Yes! Tests are as important as the code. Check coverage, edge cases, and clarity.

**Q: How detailed should feedback be?**
A: Specific enough to be actionable. Include file, line number, issue, and suggested fix.

**Q: Can I approve with minor comments?**
A: Yes, mark as approved and note that comments are optional improvements.

**Q: What if coverage is <85%?**
A: Request changes. Coverage target is 85% for this phase.

**Q: Should auto-generated schemas be reviewed?**
A: Quick check yes, but focus on custom refinements and helpers. Auto-generated code from drizzle-zod is generally reliable.

---

**Review complete? Update VALIDATION_CHECKLIST.md and mark phase as validated! ✅**
