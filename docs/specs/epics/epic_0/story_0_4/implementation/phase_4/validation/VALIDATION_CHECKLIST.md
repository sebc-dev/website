# Phase 4 - Final Validation Checklist

Complete validation checklist before marking Phase 4 as complete.

---

## ✅ 1. Commits and Structure

- [ ] All 5 atomic commits completed
- [ ] Commits follow naming convention (feat(db): ...)
- [ ] Commit order is logical (install → generate → refine → helpers → tests)
- [ ] Each commit is focused (single responsibility)
- [ ] No merge commits in phase branch
- [ ] Git history is clean and readable

**Verification**:

```bash
git log --oneline --grep="Part of Phase 4"
# Should show 5 commits
```

---

## ✅ 2. Type Safety

- [ ] No TypeScript errors
- [ ] No `any` types (unless justified and documented)
- [ ] All schemas properly typed
- [ ] Type inference works (`InsertArticle`, `SelectArticle`, etc.)
- [ ] TypeScript strict mode compliance

**Validation**:

```bash
pnpm tsc --noEmit
# Should complete with no errors
```

**Expected Output**: `No errors found`

---

## ✅ 3. Code Quality

- [ ] Code follows project TypeScript style guide
- [ ] No code duplication
- [ ] Clear and consistent naming (insertArticleSchema, validateArticleInsert)
- [ ] Custom refinements documented in comments
- [ ] No commented-out code
- [ ] No debug statements (console.log, etc.)
- [ ] Error messages are user-friendly

**Validation**:

```bash
pnpm lint src/lib/server/db/validation.ts
# Should pass with no errors
```

---

## ✅ 4. Tests

- [ ] All unit tests pass
- [ ] Coverage >85%
- [ ] Tests are meaningful (not just for coverage)
- [ ] Edge cases tested (empty strings, missing fields)
- [ ] Error cases tested (invalid data)
- [ ] Validation helpers tested
- [ ] Error formatting tested
- [ ] No flaky tests
- [ ] No skipped tests (`it.skip`) without justification

**Validation**:

```bash
# Run tests
pnpm test src/lib/server/db/validation.test.ts

# Check coverage
pnpm test:coverage src/lib/server/db/validation.test.ts
```

**Expected Results**:

- All tests passing (15+)
- Coverage >85%

---

## ✅ 5. Dependency Installation

- [ ] `drizzle-zod` installed correctly
- [ ] Listed in `dependencies` (not devDependencies)
- [ ] Compatible version with `drizzle-orm`
- [ ] No peer dependency warnings

**Validation**:

```bash
pnpm list drizzle-zod
# Should show version number

pnpm install
# Should complete without warnings
```

---

## ✅ 6. Schema Generation

- [ ] All 5 insert schemas generated (`createInsertSchema`)
- [ ] All 5 select schemas generated (`createSelectSchema`)
- [ ] Schemas exported correctly (named exports)
- [ ] Auto-generation used (not manual Zod schemas)
- [ ] Schemas match Drizzle table definitions

**Tables Covered**:

- [ ] `insertArticleSchema` / `selectArticleSchema`
- [ ] `insertArticleTranslationSchema` / `selectArticleTranslationSchema`
- [ ] `insertCategorySchema` / `selectCategorySchema`
- [ ] `insertTagSchema` / `selectTagSchema`
- [ ] `insertArticleTagSchema` / `selectArticleTagSchema`

**Validation**:

```bash
grep "createInsertSchema" src/lib/server/db/validation.ts
# Should show 5 uses (one per table)

grep "createSelectSchema" src/lib/server/db/validation.ts
# Should show 5 uses (one per table)
```

---

## ✅ 7. Custom Refinements

- [ ] Slug validation implemented (lowercase, hyphens only)
- [ ] Slug regex correct: `/^[a-z0-9-]+$/`
- [ ] String length constraints (title 1-200, excerpt 1-500)
- [ ] SEO fields validated (seoTitle, seoDescription)
- [ ] Error messages are clear and user-friendly
- [ ] Refinements use `.extend()` on generated schemas

**Validation**:

```bash
# Test slug validation manually
node -e "
  const { insertArticleTranslationSchema } = require('./src/lib/server/db/validation');

  // Should fail (uppercase)
  const r1 = insertArticleTranslationSchema.safeParse({ slug: 'Invalid-Slug' });
  console.log('Uppercase rejected:', !r1.success);

  // Should pass (lowercase)
  const validData = {
    articleId: 'test',
    language: 'fr',
    slug: 'valid-slug',
    title: 'Test Title',
    excerpt: 'Test excerpt',
    seoTitle: 'SEO Title',
    seoDescription: 'SEO Description',
    contentMdx: 'Content'
  };
  const r2 = insertArticleTranslationSchema.safeParse(validData);
  console.log('Lowercase accepted:', r2.success);
"
```

**Expected Output**:

```
Uppercase rejected: true
Lowercase accepted: true
```

---

## ✅ 8. Partial Schemas

- [ ] Update schemas use `.partial()` correctly
- [ ] `updateArticleSchema` allows optional fields
- [ ] `updateArticleTranslationSchema` allows optional fields
- [ ] Partial schemas still validate provided fields
- [ ] Naming convention followed (update\*Schema)

**Validation**:

```bash
# Test partial update
node -e "
  const { updateArticleTranslationSchema } = require('./src/lib/server/db/validation');

  // Only title (should pass)
  const r1 = updateArticleTranslationSchema.safeParse({ title: 'New Title' });
  console.log('Partial update works:', r1.success);

  // Invalid slug (should fail even in partial)
  const r2 = updateArticleTranslationSchema.safeParse({ slug: 'Invalid Slug' });
  console.log('Still validates provided fields:', !r2.success);
"
```

**Expected Output**:

```
Partial update works: true
Still validates provided fields: true
```

---

## ✅ 9. Type Inference

- [ ] Type exports for all schemas
- [ ] Naming convention: `Insert*` and `Select*` types
- [ ] Types use `z.infer<typeof schema>`
- [ ] TypeScript autocomplete works in IDE
- [ ] Type inference tested in validation.test.ts

**Type Exports**:

- [ ] `InsertArticle`, `SelectArticle`
- [ ] `InsertArticleTranslation`, `SelectArticleTranslation`
- [ ] `InsertCategory`, `SelectCategory`
- [ ] `InsertTag`, `SelectTag`
- [ ] `InsertArticleTag`, `SelectArticleTag`

**Validation**:

```bash
grep "export type Insert" src/lib/server/db/validation.ts
# Should show 5 types

grep "export type Select" src/lib/server/db/validation.ts
# Should show 5 types
```

---

## ✅ 10. Validation Helpers

- [ ] Generic `validateData<T>` helper implemented
- [ ] Uses `.safeParse()` (not `.parse()` which throws)
- [ ] Returns discriminated union (success/failure)
- [ ] Specific helpers implemented:
  - [ ] `validateArticleInsert`
  - [ ] `validateTranslationInsert`
  - [ ] `validateArticleUpdate`
  - [ ] `validateTranslationUpdate`
- [ ] Error formatting utility: `formatZodErrors`
- [ ] JSDoc comments explain usage
- [ ] Type-safe throughout (no `any`)

**Validation**:

```bash
# Test validation helper
node -e "
  const { validateArticleInsert } = require('./src/lib/server/db/validation');

  // Valid data
  const r1 = validateArticleInsert({
    categoryId: 'cat-1',
    complexity: 'beginner',
    status: 'draft'
  });
  console.log('Valid data passes:', r1.success);

  // Invalid data
  const r2 = validateArticleInsert({ status: 'invalid' });
  console.log('Invalid data fails:', !r2.success);
"
```

**Expected Output**:

```
Valid data passes: true
Invalid data fails: true
```

---

## ✅ 11. Documentation

- [ ] Validation chain documented (Drizzle → drizzle-zod → Zod)
- [ ] Custom refinements explained in comments
- [ ] JSDoc comments for all helpers
- [ ] Usage examples provided
- [ ] Complex logic documented
- [ ] Single source of truth principle documented

**Check**:

```bash
# File should have header comment explaining purpose
head -20 src/lib/server/db/validation.ts
```

---

## ✅ 12. Integration with Previous Phases

- [ ] Works with Drizzle schemas from Phase 2-3
- [ ] Imports from `schema.ts` correct
- [ ] No breaking changes to existing code
- [ ] Backward compatible with database schema
- [ ] Ready for Server Actions (Phase 5 will use these helpers)

**Validation**:

```bash
# Verify imports work
node -e "
  const schemas = require('./src/lib/server/db/validation');
  const tableSchemas = require('./src/lib/server/db/schema');
  console.log('Imports work');
"
```

---

## ✅ 13. Linting and Formatting

- [ ] Linter passes with no errors
- [ ] Linter passes with no warnings
- [ ] Code is formatted consistently
- [ ] No eslint-disable comments (unless justified)

**Validation**:

```bash
pnpm lint src/lib/server/db/validation.ts
pnpm lint src/lib/server/db/validation.test.ts
```

**Expected Output**: No errors, no warnings

---

## 📋 Validation Commands Summary

Run all these commands before final approval:

```bash
# 1. Install dependencies
pnpm install

# 2. Type-checking
pnpm tsc --noEmit

# 3. Linting
pnpm lint src/lib/server/db/validation.ts
pnpm lint src/lib/server/db/validation.test.ts

# 4. Tests
pnpm test src/lib/server/db/validation.test.ts

# 5. Coverage
pnpm test:coverage src/lib/server/db/validation.test.ts
```

**All must pass with no errors.**

---

## 📊 Success Metrics

| Metric        | Target | Actual | Status |
| ------------- | ------ | ------ | ------ |
| Commits       | 5      | -      | ⏳     |
| Type Coverage | 100%   | -      | ⏳     |
| Test Coverage | >85%   | -      | ⏳     |
| Tests Passing | 100%   | -      | ⏳     |
| Lint Status   | ✅     | -      | ⏳     |
| Files Created | 2      | -      | ⏳     |
| Lines of Code | ~490   | -      | ⏳     |

**All metrics must meet or exceed targets.**

---

## 🎯 Phase Objectives Validation

Verify all phase objectives achieved:

- [ ] drizzle-zod installed and configured
- [ ] Zod insert schemas generated for all 5 tables
- [ ] Zod select schemas generated for all 5 tables
- [ ] Custom refinements added (slug, string lengths)
- [ ] Partial schemas created for updates
- [ ] Type inference working (Insert*, Select* types)
- [ ] Validation helpers created and tested
- [ ] Error formatting utility implemented
- [ ] Unit tests written with >85% coverage
- [ ] Validation chain pattern documented

---

## 🎯 Acceptance Criteria (from Story 0.4)

Check Phase 4 contribution to Story 0.4 AC4:

**AC4: Type-Safe Validation Chain**

- [ ] drizzle-zod installed and configured ✅
- [ ] Zod schemas auto-generated from Drizzle schemas ✅
- [ ] Validation helpers created for Server Actions ✅
- [ ] Type inference working (TypeScript autocomplete) ✅
- [ ] Insert/update schemas validated with Zod ✅

**Phase 4 completes AC4!**

---

## 🎯 Final Verdict

Select one:

- [ ] ✅ **APPROVED** - Phase 4 is complete and ready
- [ ] 🔧 **CHANGES REQUESTED** - Issues to fix:
  - [List issues]
- [ ] ❌ **REJECTED** - Major rework needed:
  - [List major issues]

---

## 📝 Next Steps

### If Approved ✅

1. [ ] Update INDEX.md status to ✅ COMPLETED
2. [ ] Update actual metrics in INDEX.md
3. [ ] Merge phase branch to story branch
4. [ ] Update EPIC_TRACKING.md (Story 0.4: Phase 4 complete)
5. [ ] Create git tag: `story-0.4-phase-4-complete`
6. [ ] Prepare for Phase 5 (Database Access Layer & Integration Testing)

### If Changes Requested 🔧

1. [ ] Address all feedback items in checklist
2. [ ] Re-run validation commands
3. [ ] Request re-review

### If Rejected ❌

1. [ ] Document issues clearly
2. [ ] Plan rework strategy
3. [ ] Schedule review after rework

---

## 🔗 Related Validation

Before proceeding to Phase 5, ensure:

- [ ] Phase 1 complete (Drizzle configured)
- [ ] Phase 2 complete (Core schema)
- [ ] Phase 3 complete (Taxonomy schema)
- [ ] **Phase 4 complete (Validation chain)** ← You are here
- [ ] Phase 5 next (Database Access Layer & Testing)

**Validation chain is ready for Server Actions in Phase 5!**

---

**Validation completed by**: [Name]
**Date**: [Date]
**Notes**: [Additional notes or observations]

---

**Phase 4 is complete when all checkboxes are checked! 🎉**

**Next**: [Phase 5 - Database Access Layer & Integration Testing](../phase_5/INDEX.md)
