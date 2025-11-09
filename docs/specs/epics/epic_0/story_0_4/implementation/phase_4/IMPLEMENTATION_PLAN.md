# Phase 4 - Atomic Implementation Plan

**Objective**: Set up drizzle-zod integration to auto-generate Zod schemas from Drizzle schemas and implement validation helpers for Server Actions

---

## 🎯 Overview

### Why an Atomic Approach?

The implementation is split into **5 independent commits** to:

✅ **Facilitate review** - Each commit focuses on a single responsibility (dependency install → schema generation → refinements → helpers → tests)
✅ **Enable rollback** - If validation helpers have issues, revert without losing schema generation
✅ **Progressive type-safety** - Types validate at each step (schemas compile before tests)
✅ **Tests as you go** - Tests validate the validation logic itself
✅ **Continuous documentation** - Each commit documents a clear step in the validation chain

### Global Strategy

```
[Commit 1] → [Commit 2] → [Commit 3] → [Commit 4] → [Commit 5]
    ↓           ↓           ↓           ↓           ↓
  Install    Generate    Refine     Helpers     Tests
  drizzle-   Base Zod    Schemas    & Utils    (>85%)
    zod      Schemas    (+custom)             coverage
```

**Validation Chain**: Drizzle Schema → drizzle-zod → Zod → Server Actions → Forms

---

## 📦 The 5 Atomic Commits

### Commit 1: Install drizzle-zod dependency
**Files**: `package.json`, `pnpm-lock.yaml`
**Size**: ~10 lines (package.json changes)
**Duration**: 15-20 min (implementation) + 10 min (review)

**Content**:
- Install `drizzle-zod` package via pnpm
- Verify installation in package.json dependencies
- Test import in Node REPL or TypeScript

**Why it's atomic**:
- Single responsibility: Add dependency
- No code changes yet (just installation)
- Can be validated independently (`pnpm install` succeeds)
- Blocks all subsequent commits (need drizzle-zod to generate schemas)

**Technical Validation**:
```bash
pnpm install
pnpm list drizzle-zod  # Should show version installed
node -e "require('drizzle-zod'); console.log('drizzle-zod loaded')"
```

**Expected Result**:
- `drizzle-zod` appears in `package.json` dependencies
- Installation completes without errors
- Package is importable

**Review Criteria**:
- [ ] `drizzle-zod` added to dependencies (not devDependencies)
- [ ] Version is latest compatible with Drizzle ORM
- [ ] `pnpm-lock.yaml` updated correctly
- [ ] No unrelated dependency changes

---

### Commit 2: Generate base Zod schemas from Drizzle
**Files**: `src/lib/server/db/validation.ts` (new)
**Size**: ~80-100 lines
**Duration**: 40-50 min (implementation) + 20 min (review)

**Content**:
- Create `src/lib/server/db/validation.ts` file
- Import all table schemas from `src/lib/server/db/schema.ts`
- Generate insert schemas using `createInsertSchema()` for all 5 tables:
  - `insertArticleSchema`
  - `insertArticleTranslationSchema`
  - `insertCategorySchema`
  - `insertTagSchema`
  - `insertArticleTagSchema`
- Generate select schemas using `createSelectSchema()` for all 5 tables:
  - `selectArticleSchema`
  - `selectArticleTranslationSchema`
  - `selectCategorySchema`
  - `selectTagSchema`
  - `selectArticleTagSchema`
- Export all schemas for use in Server Actions

**Why it's atomic**:
- Single responsibility: Auto-generate base schemas
- No custom logic yet (pure drizzle-zod generation)
- Can be validated independently (schemas compile)
- Foundation for next commits (refinements, helpers)

**Technical Validation**:
```bash
pnpm tsc --noEmit  # No TypeScript errors
node -e "const { insertArticleSchema } = require('./src/lib/server/db/validation.ts'); console.log(insertArticleSchema)"
```

**Expected Result**:
- All 10 schemas (5 insert + 5 select) exported
- TypeScript types inferred correctly
- No compilation errors

**Review Criteria**:
- [ ] All 5 tables have insert and select schemas
- [ ] Schemas use `createInsertSchema()` and `createSelectSchema()`
- [ ] Imports from `schema.ts` are correct
- [ ] All schemas exported (named exports)
- [ ] No manual Zod schemas yet (pure auto-generation)
- [ ] File structure is clean and organized

**Code Example**:
```typescript
// src/lib/server/db/validation.ts
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import {
  articles,
  articleTranslations,
  categories,
  tags,
  articleTags
} from './schema'

// Insert Schemas (for creating new records)
export const insertArticleSchema = createInsertSchema(articles)
export const insertArticleTranslationSchema = createInsertSchema(articleTranslations)
export const insertCategorySchema = createInsertSchema(categories)
export const insertTagSchema = createInsertSchema(tags)
export const insertArticleTagSchema = createInsertSchema(articleTags)

// Select Schemas (for query results)
export const selectArticleSchema = createSelectSchema(articles)
export const selectArticleTranslationSchema = createSelectSchema(articleTranslations)
export const selectCategorySchema = createSelectSchema(categories)
export const selectTagSchema = createSelectSchema(tags)
export const selectArticleTagSchema = createSelectSchema(articleTags)
```

---

### Commit 3: Add custom refinements and type inference
**Files**: `src/lib/server/db/validation.ts` (modified)
**Size**: ~80-100 lines added (total ~180-200 lines)
**Duration**: 50-60 min (implementation) + 25 min (review)

**Content**:
- Extend `insertArticleTranslationSchema` with custom slug validation (lowercase, hyphens only)
- Add email format validation if needed (not in current schema, but pattern documented)
- Refine ENUMs to ensure only valid values accepted
- Create partial schemas for updates:
  - `updateArticleSchema` = `insertArticleSchema.partial()`
  - `updateArticleTranslationSchema` = `insertArticleTranslationSchema.partial()`
- Add type inference exports:
  - `type InsertArticle = z.infer<typeof insertArticleSchema>`
  - `type SelectArticle = z.infer<typeof selectArticleSchema>`
  - (Repeat for all tables)
- Document refinement patterns in comments

**Why it's atomic**:
- Single responsibility: Add business logic validation
- Builds on Commit 2 (base schemas must exist)
- Can be validated independently (refinements compile, types infer)
- Prepares for helpers in next commit

**Technical Validation**:
```bash
pnpm tsc --noEmit  # No TypeScript errors, types infer correctly
# Manual test: Try to parse invalid slug, should fail
node -e "
  const { insertArticleTranslationSchema } = require('./src/lib/server/db/validation.ts');
  const result = insertArticleTranslationSchema.safeParse({ slug: 'INVALID_SLUG' });
  console.log(result.success); // Should be false
"
```

**Expected Result**:
- Slug validation rejects uppercase and special characters
- ENUM validation rejects invalid values
- Partial schemas allow optional fields
- Type inference works (autocomplete in IDE)

**Review Criteria**:
- [ ] Slug regex is correct: `/^[a-z0-9-]+$/`
- [ ] ENUM refinements match Drizzle schema definitions
- [ ] Partial schemas use `.partial()` correctly
- [ ] Type exports are consistent naming (Insert*/Select*)
- [ ] Comments explain custom refinements
- [ ] No breaking changes to base schemas

**Code Example**:
```typescript
// Custom refinements
export const insertArticleTranslationSchema = createInsertSchema(articleTranslations).extend({
  slug: z.string()
    .min(1, 'Slug is required')
    .max(200, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title too long'),
  excerpt: z.string()
    .min(1, 'Excerpt is required')
    .max(500, 'Excerpt too long'),
})

// Partial schemas for updates
export const updateArticleSchema = insertArticleSchema.partial()
export const updateArticleTranslationSchema = insertArticleTranslationSchema.partial()

// Type inference
export type InsertArticle = z.infer<typeof insertArticleSchema>
export type SelectArticle = z.infer<typeof selectArticleSchema>
export type InsertArticleTranslation = z.infer<typeof insertArticleTranslationSchema>
export type SelectArticleTranslation = z.infer<typeof selectArticleTranslationSchema>
// ... (repeat for all tables)
```

---

### Commit 4: Create validation helper utilities
**Files**: `src/lib/server/db/validation.ts` (modified)
**Size**: ~60-80 lines added (total ~250-280 lines)
**Duration**: 50-60 min (implementation) + 25 min (review)

**Content**:
- Create generic validation helper: `validateData<T>(schema: ZodSchema<T>, data: unknown)`
  - Uses `.safeParse()` to validate data
  - Returns `{ success: true, data: T }` or `{ success: false, errors: ZodError }`
  - Provides clear error messages
- Create specific helpers for common operations:
  - `validateArticleInsert(data: unknown)` - validates article creation
  - `validateTranslationInsert(data: unknown)` - validates translation creation
  - `validateArticleUpdate(data: unknown)` - validates article updates
  - `validateTranslationUpdate(data: unknown)` - validates translation updates
- Add error formatting utility: `formatZodErrors(errors: ZodError)` - converts Zod errors to user-friendly messages
- Document usage patterns in JSDoc comments

**Why it's atomic**:
- Single responsibility: Create reusable validation utilities
- Builds on Commit 3 (needs refined schemas)
- Can be validated independently (helpers compile and can be manually tested)
- Prepares for Server Actions usage (next phase)

**Technical Validation**:
```bash
pnpm tsc --noEmit  # No TypeScript errors
# Manual test: Validate data with helper
node -e "
  const { validateArticleInsert } = require('./src/lib/server/db/validation.ts');
  const result = validateArticleInsert({ categoryId: 'cat-1', status: 'draft' });
  console.log(result.success);
"
```

**Expected Result**:
- Generic helper validates any schema
- Specific helpers provide type-safe wrappers
- Error formatting produces readable messages
- Helpers are easy to use in Server Actions

**Review Criteria**:
- [ ] Generic helper is type-safe (uses generics)
- [ ] Specific helpers cover main use cases
- [ ] Error formatting is clear and actionable
- [ ] JSDoc comments explain usage
- [ ] No duplication between helpers
- [ ] Return types are discriminated unions (success/failure)

**Code Example**:
```typescript
// Generic validation helper
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return { success: false, errors: result.error }
}

// Specific helpers
export function validateArticleInsert(data: unknown) {
  return validateData(insertArticleSchema, data)
}

export function validateTranslationInsert(data: unknown) {
  return validateData(insertArticleTranslationSchema, data)
}

export function validateArticleUpdate(data: unknown) {
  return validateData(updateArticleSchema, data)
}

// Error formatting
export function formatZodErrors(errors: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {}

  errors.errors.forEach((error) => {
    const path = error.path.join('.')
    formatted[path] = error.message
  })

  return formatted
}
```

---

### Commit 5: Write unit tests for validation
**Files**: `src/lib/server/db/validation.test.ts` (new)
**Size**: ~200-250 lines
**Duration**: 60-70 min (implementation) + 30 min (review)

**Content**:
- Create `validation.test.ts` file
- Test auto-generated schemas (insert/select):
  - Valid data passes validation
  - Invalid data fails validation
  - Type inference works
- Test custom refinements:
  - Slug validation (valid: 'my-article', invalid: 'My_Article', 'my article')
  - ENUM validation (valid: 'draft'/'published', invalid: 'invalid')
  - String length constraints (title, excerpt)
- Test partial schemas:
  - Update schemas allow optional fields
  - Provided fields still validated
- Test validation helpers:
  - `validateArticleInsert()` with valid/invalid data
  - `validateTranslationInsert()` with valid/invalid data
  - `validateArticleUpdate()` with partial data
  - `formatZodErrors()` produces readable messages
- Test edge cases:
  - Empty strings
  - Missing required fields
  - Extra fields (should be allowed by Zod)
  - Null vs undefined
- Achieve >85% coverage

**Why it's atomic**:
- Single responsibility: Validate validation logic
- Tests all previous commits (schemas, refinements, helpers)
- Can be validated independently (tests run and pass)
- Final validation before phase completion

**Technical Validation**:
```bash
pnpm test src/lib/server/db/validation.test.ts
pnpm test:coverage src/lib/server/db/validation.test.ts  # Should show >85% coverage
```

**Expected Result**:
- 15+ test cases covering all scenarios
- All tests pass
- Coverage >85% for validation.ts
- Clear test descriptions

**Review Criteria**:
- [ ] Tests cover valid data (happy path)
- [ ] Tests cover invalid data (error cases)
- [ ] Tests check error messages are clear
- [ ] Tests use descriptive names (describe/it)
- [ ] Tests are isolated (no dependencies between tests)
- [ ] Edge cases covered (empty, null, extra fields)
- [ ] Coverage report shows >85%

**Code Example**:
```typescript
// src/lib/server/db/validation.test.ts
import { describe, it, expect } from 'vitest'
import {
  insertArticleSchema,
  insertArticleTranslationSchema,
  updateArticleTranslationSchema,
  validateArticleInsert,
  validateTranslationInsert,
  formatZodErrors,
} from './validation'

describe('Auto-generated Insert Schemas', () => {
  describe('insertArticleSchema', () => {
    it('should validate valid article data', () => {
      const validArticle = {
        categoryId: 'cat-1',
        complexity: 'intermediate',
        status: 'draft',
      }

      const result = insertArticleSchema.safeParse(validArticle)
      expect(result.success).toBe(true)
    })

    it('should reject invalid status enum', () => {
      const invalidArticle = {
        categoryId: 'cat-1',
        complexity: 'intermediate',
        status: 'invalid_status',
      }

      const result = insertArticleSchema.safeParse(invalidArticle)
      expect(result.success).toBe(false)
    })
  })

  describe('insertArticleTranslationSchema', () => {
    it('should validate valid translation data', () => {
      const validTranslation = {
        articleId: 'article-1',
        language: 'fr',
        title: 'Mon Article',
        slug: 'mon-article',
        excerpt: 'Description de mon article',
        seoTitle: 'Mon Article SEO',
        seoDescription: 'Description SEO',
        contentMdx: '# Content',
      }

      const result = insertArticleTranslationSchema.safeParse(validTranslation)
      expect(result.success).toBe(true)
    })

    it('should reject invalid slug format (uppercase)', () => {
      const invalidTranslation = {
        articleId: 'article-1',
        language: 'fr',
        title: 'Mon Article',
        slug: 'Mon-Article',  // Invalid: uppercase
        excerpt: 'Description',
        seoTitle: 'SEO Title',
        seoDescription: 'SEO Description',
        contentMdx: '# Content',
      }

      const result = insertArticleTranslationSchema.safeParse(invalidTranslation)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('slug')
      }
    })

    it('should reject invalid slug format (spaces)', () => {
      const invalidTranslation = {
        articleId: 'article-1',
        language: 'fr',
        title: 'Mon Article',
        slug: 'mon article',  // Invalid: spaces
        excerpt: 'Description',
        seoTitle: 'SEO Title',
        seoDescription: 'SEO Description',
        contentMdx: '# Content',
      }

      const result = insertArticleTranslationSchema.safeParse(invalidTranslation)
      expect(result.success).toBe(false)
    })

    it('should reject title that is too long', () => {
      const invalidTranslation = {
        articleId: 'article-1',
        language: 'fr',
        title: 'a'.repeat(201),  // Over 200 chars
        slug: 'valid-slug',
        excerpt: 'Description',
        seoTitle: 'SEO Title',
        seoDescription: 'SEO Description',
        contentMdx: '# Content',
      }

      const result = insertArticleTranslationSchema.safeParse(invalidTranslation)
      expect(result.success).toBe(false)
    })
  })
})

describe('Partial Update Schemas', () => {
  it('should allow partial article translation updates', () => {
    const partialUpdate = {
      title: 'Updated Title',  // Only title, other fields optional
    }

    const result = updateArticleTranslationSchema.safeParse(partialUpdate)
    expect(result.success).toBe(true)
  })

  it('should still validate provided fields in partial updates', () => {
    const partialUpdate = {
      slug: 'Invalid Slug',  // Still invalid even in partial update
    }

    const result = updateArticleTranslationSchema.safeParse(partialUpdate)
    expect(result.success).toBe(false)
  })
})

describe('Validation Helpers', () => {
  describe('validateArticleInsert', () => {
    it('should return success for valid data', () => {
      const validArticle = {
        categoryId: 'cat-1',
        complexity: 'beginner',
        status: 'draft',
      }

      const result = validateArticleInsert(validArticle)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.categoryId).toBe('cat-1')
      }
    })

    it('should return errors for invalid data', () => {
      const invalidArticle = {
        complexity: 'invalid',
      }

      const result = validateArticleInsert(invalidArticle)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toBeDefined()
      }
    })
  })

  describe('formatZodErrors', () => {
    it('should format errors into readable object', () => {
      const invalidData = {
        slug: 'Invalid Slug',
      }

      const parseResult = insertArticleTranslationSchema.safeParse(invalidData)
      if (!parseResult.success) {
        const formatted = formatZodErrors(parseResult.error)
        expect(formatted.slug).toBeDefined()
        expect(typeof formatted.slug).toBe('string')
      }
    })
  })
})

describe('Edge Cases', () => {
  it('should handle empty strings', () => {
    const emptyData = {
      articleId: '',
      language: 'fr',
      title: '',
      slug: '',
      excerpt: '',
      seoTitle: '',
      seoDescription: '',
      contentMdx: '',
    }

    const result = insertArticleTranslationSchema.safeParse(emptyData)
    expect(result.success).toBe(false)
  })

  it('should handle missing required fields', () => {
    const missingFields = {
      language: 'fr',
    }

    const result = insertArticleTranslationSchema.safeParse(missingFields)
    expect(result.success).toBe(false)
  })
})
```

---

## 🔄 Implementation Workflow

### Step-by-Step

1. **Read specification**: Review Phase 4 section in PHASES_PLAN.md
2. **Setup environment**: Follow ENVIRONMENT_SETUP.md (install drizzle-zod)
3. **Implement Commit 1**: Install dependency
4. **Validate Commit 1**: `pnpm install` succeeds, package importable
5. **Review Commit 1**: Self-review against criteria
6. **Commit Commit 1**: Use provided commit message template
7. **Repeat for commits 2-5**: Generate schemas → refinements → helpers → tests
8. **Final validation**: Complete VALIDATION_CHECKLIST.md

### Validation at Each Step

After each commit:
```bash
# Type-checking
pnpm tsc --noEmit

# Linting
pnpm lint

# Tests (after Commit 5)
pnpm test src/lib/server/db/validation.test.ts

# Coverage (after Commit 5)
pnpm test:coverage
```

All must pass before moving to next commit.

---

## 📊 Commit Metrics

| Commit | Files | Lines | Implementation | Review | Total |
|--------|-------|-------|----------------|--------|-------|
| 1. Install drizzle-zod | 2 | ~10 | 15 min | 10 min | 25 min |
| 2. Generate base Zod schemas | 1 | ~90 | 45 min | 20 min | 65 min |
| 3. Add refinements & types | 1 | ~90 | 55 min | 25 min | 80 min |
| 4. Create validation helpers | 1 | ~70 | 55 min | 25 min | 80 min |
| 5. Write unit tests | 1 | ~230 | 65 min | 30 min | 95 min |
| **TOTAL** | **6** | **~490** | **3h 55m** | **1h 50m** | **5h 45m** |

**Note**: Times are estimates. Actual duration may vary based on experience with Drizzle, Zod, and testing.

---

## ✅ Atomic Approach Benefits

### For Developers
- 🎯 **Clear focus**: One validation layer at a time
- 🧪 **Testable**: Each commit validated independently
- 📝 **Documented**: Clear commit messages show progression

### For Reviewers
- ⚡ **Fast review**: 10-30 min per commit
- 🔍 **Focused**: Single responsibility to check
- ✅ **Quality**: Easier to spot validation bugs

### For the Project
- 🔄 **Rollback-safe**: Revert helpers without losing schemas
- 📚 **Historical**: Clear validation chain in git history
- 🏗️ **Maintainable**: Easy to add new schemas later

---

## 📝 Best Practices

### Commit Messages

Format:
```
feat(db): short description (max 50 chars)

- Point 1: detail about change
- Point 2: technical decision
- Point 3: validation approach

Part of Phase 4 - Commit X/5
```

Examples:
```
feat(db): install drizzle-zod for schema validation

- Add drizzle-zod dependency to package.json
- Required for auto-generating Zod schemas from Drizzle
- Enables single source of truth for validation

Part of Phase 4 - Commit 1/5
```

```
feat(db): generate base Zod schemas from Drizzle

- Create validation.ts with createInsertSchema/createSelectSchema
- Generate schemas for all 5 tables (articles, translations, categories, tags, articleTags)
- Export insert and select schemas for Server Actions

Part of Phase 4 - Commit 2/5
```

### Review Checklist

Before committing:
- [ ] Code follows project TypeScript style guide
- [ ] All tests pass (after Commit 5)
- [ ] Types are correct (no `any` types)
- [ ] No console.logs or debug code
- [ ] Validation error messages are clear
- [ ] JSDoc comments added for helpers

---

## ⚠️ Important Points

### Do's
- ✅ Follow the commit order (schemas before refinements before helpers before tests)
- ✅ Validate after each commit (`pnpm tsc --noEmit`)
- ✅ Write descriptive error messages in refinements
- ✅ Use provided commit message templates
- ✅ Test both valid and invalid data

### Don'ts
- ❌ Skip commits or combine them (breaks atomic approach)
- ❌ Commit without type-checking
- ❌ Use manual Zod schemas when drizzle-zod can generate them
- ❌ Write tests before validation helpers exist
- ❌ Use generic error messages ("Invalid input")

---

## ❓ FAQ

**Q: What if a commit is too big?**
A: Split it into smaller commits. For example, split Commit 3 into "Add slug refinements" + "Add ENUM refinements" + "Add type inference".

**Q: What if I need to fix a previous commit?**
A: Fix in place if not pushed (`git commit --amend`). If pushed, create a fixup commit and document it.

**Q: Can I change the commit order?**
A: No. Dependencies require this order: install → generate → refine → helpers → tests.

**Q: What if tests fail?**
A: Don't commit until they pass. Fix the validation logic or update tests if expectations were wrong.

**Q: What if drizzle-zod doesn't support something?**
A: Fall back to manual Zod schema for that specific case. Document why in comments.

**Q: How do I handle schema changes?**
A: Regenerate Zod schemas after Drizzle schema changes. Auto-generation keeps them in sync.

---

**Ready to implement? Start with Commit 1: Install drizzle-zod! 🚀**
