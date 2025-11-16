# Phase 2 - Code Review Guide

Complete guide for reviewing the Phase 2 implementation (Configuration File Creation and TypeScript Setup).

---

## 🎯 Review Objective

Validate that the implementation:

- ✅ Creates a complete next-intl configuration for Next.js 15 App Router
- ✅ Defines type-safe locale types and constants (fr, en)
- ✅ Implements `getRequestConfig()` correctly for Server Components
- ✅ Provides clean TypeScript exports and barrel exports
- ✅ Includes comprehensive documentation
- ✅ Follows project TypeScript and Next.js best practices
- ✅ Compiles without errors and passes linting
- ✅ Is ready for Story 1.2 (message files) and Story 1.3 (middleware)

---

## 📋 Review Approach

Phase 2 is split into **5 atomic commits**. You can:

**Option A: Commit-by-commit review** (recommended)
- Easier to digest (10-30 min per commit)
- Progressive validation
- Targeted feedback
- **Total time**: ~1.5-2h

**Option B: Global review at once**
- Faster overview
- See complete picture
- Requires more focus
- **Total time**: ~2-3h

**Recommendation**: Review commit-by-commit for better quality and easier feedback.

---

## 🔍 Commit-by-Commit Review

### Commit 1: Create base i18n configuration structure

**Files**: `src/i18n/config.ts` (new, ~20 lines)
**Duration**: 10-15 minutes

#### Review Checklist

##### File Structure
- [ ] File created at correct location: `src/i18n/config.ts`
- [ ] Directory `src/i18n/` created
- [ ] File has proper UTF-8 encoding
- [ ] Clean and minimal (foundation only)

##### Imports
- [ ] Imports `getRequestConfig` from `'next-intl/server'`
- [ ] Import statement syntax is correct
- [ ] No unused imports
- [ ] Import is from correct package (not `next-intl` without `/server`)

##### Documentation
- [ ] File header comment explains purpose
- [ ] Comment mentions next-intl and Next.js 15 App Router
- [ ] Link to next-intl documentation included
- [ ] Documentation is clear and helpful

##### Code Quality
- [ ] Follows project formatting (Prettier/Biome)
- [ ] No commented code
- [ ] Clean indentation and spacing
- [ ] Consistent with project conventions

#### Technical Validation

```bash
# Verify file exists
ls -la src/i18n/config.ts

# TypeScript compilation
pnpm tsc --noEmit

# Linter check
pnpm lint src/i18n/config.ts
```

**Expected Result**:
- ✅ TypeScript recognizes import from `next-intl/server`
- ✅ No compilation errors
- ✅ No linter warnings

#### Questions to Ask

1. Is the file in the correct location (`src/i18n/`)?
2. Is the import from the correct package (`next-intl/server`)?
3. Is the documentation clear about the purpose?

---

### Commit 2: Define locale types and constants

**Files**: `src/i18n/config.ts` (modified, +~25 lines)
**Duration**: 15-20 minutes

#### Review Checklist

##### Type Definitions
- [ ] `Locale` type defined as union: `'fr' | 'en'`
- [ ] Type uses string literals (not enum)
- [ ] Type is exported with `export type`
- [ ] Type name follows conventions (PascalCase)

##### Constants
- [ ] `locales` array contains `['fr', 'en']`
- [ ] `locales` uses `as const` assertion
- [ ] `locales` is exported
- [ ] `defaultLocale` is set to `'fr'`
- [ ] `defaultLocale` is typed explicitly as `Locale` (not widened to `string`)
- [ ] `defaultLocale` is exported

##### Documentation
- [ ] Each export has JSDoc comment
- [ ] JSDoc explains purpose and usage
- [ ] Comment mentions PRD requirement for French as default
- [ ] Documentation is comprehensive

##### Type Safety
- [ ] No type widening (hover over `defaultLocale` should show `Locale`, not `string`)
- [ ] Const assertion prevents array mutation
- [ ] Types are strict and precise

#### Technical Validation

```bash
# TypeScript compilation
pnpm tsc --noEmit

# Linter check
pnpm lint src/i18n/config.ts

# Manual: Check IntelliSense in IDE
# Type `const x: Locale = ''` and verify autocomplete shows 'fr' and 'en'
```

**Expected Result**:
- ✅ TypeScript recognizes `Locale` type
- ✅ `locales` is readonly array
- ✅ `defaultLocale` typed as `Locale` (not `string`)
- ✅ No compilation errors

#### Questions to Ask

1. Are the locale values correct (`'fr'` and `'en'`)?
2. Is French (`'fr'`) set as the default per PRD?
3. Is `as const` used to make the array readonly?
4. Is `defaultLocale` properly typed (not widened)?

---

### Commit 3: Implement getRequestConfig for Server Components

**Files**: `src/i18n/config.ts` (modified, +~30 lines)
**Duration**: 20-30 minutes

#### Review Checklist

##### Function Implementation
- [ ] `getRequestConfig()` is called with async callback
- [ ] Callback parameter is destructured: `{ locale }`
- [ ] Function is exported as `default export`
- [ ] Async/await used correctly

##### Locale Validation
- [ ] Locale validated against `locales` array
- [ ] Invalid locales trigger warning (console.warn)
- [ ] Invalid locales fall back to `defaultLocale`
- [ ] Type assertion `locale as Locale` used for includes check
- [ ] Validation logic is correct and safe

##### Dynamic Import
- [ ] Import path is correct: `../../messages/${locale}.json`
- [ ] Import uses template literal syntax
- [ ] `.default` is accessed from import result
- [ ] Path resolves correctly from `src/i18n/config.ts` to `messages/`
- [ ] Dynamic import is async (with `await`)

##### Return Value
- [ ] Returns object with `messages` property
- [ ] Messages are assigned imported JSON
- [ ] Return type matches next-intl's expected configuration

##### Documentation
- [ ] JSDoc explains function purpose
- [ ] Documents that message files created in Story 1.2
- [ ] Includes link to next-intl documentation
- [ ] Parameter (`locale`) documented
- [ ] Return value documented

##### Error Handling
- [ ] Invalid locale handled gracefully
- [ ] Warning logged for debugging
- [ ] Fallback prevents crashes
- [ ] No thrown errors for invalid locales

#### Technical Validation

```bash
# TypeScript compilation
pnpm tsc --noEmit

# Linter check
pnpm lint src/i18n/config.ts

# Note: Message files don't exist yet (Story 1.2)
# TypeScript should still accept the dynamic import path
```

**Expected Result**:
- ✅ `getRequestConfig` properly typed
- ✅ Dynamic import syntax correct
- ✅ TypeScript compiles (even without message files)
- ✅ Default export present

#### Questions to Ask

1. Is the dynamic import path correct (`../../messages/${locale}.json`)?
2. Does locale validation prevent crashes for invalid locales?
3. Is the warning message helpful for debugging?
4. Is the fallback to `defaultLocale` appropriate?
5. Is the JSDoc clear about when message files will exist?

---

### Commit 4: Add TypeScript configuration and type exports

**Files**:
- `src/i18n/types.ts` (new, ~40 lines)
- `src/i18n/index.ts` (new, ~15 lines)

**Duration**: 20-25 minutes

#### Review Checklist

##### types.ts
- [ ] File created at `src/i18n/types.ts`
- [ ] `IntlMessages` type defined
- [ ] `IntlMessages` type is generic/placeholder (will be refined in Story 1.2)
- [ ] `LocaleParam` utility type defined (if applicable)
- [ ] All types exported
- [ ] JSDoc documentation on all exports
- [ ] Documentation mentions refinement in Story 1.2

##### index.ts (Barrel Export)
- [ ] File created at `src/i18n/index.ts`
- [ ] Default config exported as named export `i18nConfig`
- [ ] `Locale` type re-exported with `export type` keyword
- [ ] `locales` and `defaultLocale` constants re-exported
- [ ] Types from `types.ts` re-exported
- [ ] JSDoc documentation explaining barrel pattern
- [ ] All public APIs are exported

##### Export Organization
- [ ] Type-only exports use `export type` keyword
- [ ] Value exports use `export` keyword
- [ ] No circular dependencies
- [ ] Clean and organized structure

##### Code Quality
- [ ] No circular dependencies
- [ ] Follows project barrel export conventions
- [ ] Clear separation of types and values
- [ ] Consistent formatting

#### Technical Validation

```bash
# TypeScript compilation
pnpm tsc --noEmit

# Linter check
pnpm lint src/i18n/

# Manual: Test import in IDE
# Try: import { Locale, locales, defaultLocale } from '@/i18n'
# Should autocomplete and work correctly
```

**Expected Result**:
- ✅ All types properly exported
- ✅ Barrel export works (can import from `@/i18n`)
- ✅ No circular dependencies
- ✅ TypeScript compilation passes

#### Questions to Ask

1. Are all necessary exports included in `index.ts`?
2. Is the barrel export pattern correct?
3. Is `export type` used for type-only exports?
4. Can you import from `@/i18n` instead of specific files?

---

### Commit 5: Validate configuration and add documentation

**Files**:
- `src/i18n/README.md` (new, ~80 lines)
- `CLAUDE.md` (modified, +~15 lines)

**Duration**: 15-20 minutes

#### Review Checklist

##### src/i18n/README.md
- [ ] File created and properly formatted (Markdown)
- [ ] Documents directory structure clearly
- [ ] Lists supported locales (fr, en)
- [ ] Explains default locale (fr) per PRD
- [ ] Provides usage examples for Server Components
- [ ] Provides usage examples for Client Components
- [ ] Documents message files location (Story 1.2)
- [ ] Explains next steps (Story 1.2, 1.3, 1.4)
- [ ] Includes links to next-intl documentation
- [ ] Includes links to Next.js i18n guide
- [ ] Clear and helpful for developers
- [ ] Code examples are correct and runnable

##### CLAUDE.md Update
- [ ] i18n section added or updated
- [ ] Lists next-intl version (4.5.3 or current)
- [ ] Documents configuration file locations
- [ ] Lists supported locales
- [ ] Explains import pattern (`@/i18n`)
- [ ] References `src/i18n/README.md` for details
- [ ] Current status/phase documented

##### Final Validation
- [ ] TypeScript compilation passes
- [ ] Linter passes
- [ ] Dev server starts without errors
- [ ] No console warnings/errors related to i18n
- [ ] Configuration ready for Story 1.2

##### Documentation Quality
- [ ] Markdown formatting correct
- [ ] Code blocks have language tags
- [ ] Links work and are not broken
- [ ] No typos or grammar issues
- [ ] Examples are accurate and helpful

#### Technical Validation

```bash
# Verify documentation created
cat src/i18n/README.md

# Verify CLAUDE.md updated
grep -A 10 "Internationalization" CLAUDE.md

# Final TypeScript check
pnpm tsc --noEmit

# Final linter check
pnpm lint

# TEST DEV SERVER (critical)
pnpm dev
# Should start without errors - check console for i18n issues
# Ctrl+C to stop
```

**Expected Result**:
- ✅ README is comprehensive and clear
- ✅ CLAUDE.md references i18n config
- ✅ All validations pass
- ✅ Dev server starts successfully
- ✅ No i18n-related errors

#### Questions to Ask

1. Is the README comprehensive enough for a new developer?
2. Are the usage examples correct and helpful?
3. Does CLAUDE.md have clear reference to i18n setup?
4. Does the dev server start without errors?
5. Are next steps clearly documented?

---

## ✅ Global Validation

After reviewing all commits:

### Architecture & Design

- [ ] Follows next-intl App Router pattern (2025)
- [ ] Configuration is correct for Next.js 15 Server Components
- [ ] Proper separation of concerns (config, types, barrel exports)
- [ ] No code duplication
- [ ] Reusable and maintainable structure
- [ ] Ready for middleware integration (Story 1.3)

### Code Quality

- [ ] Consistent style throughout all files
- [ ] Clear and descriptive naming
- [ ] Appropriate JSDoc comments
- [ ] No commented code or debug statements
- [ ] Follows project conventions

### Type Safety

- [ ] No `any` types (except in `IntlMessages` placeholder - acceptable)
- [ ] Proper type inference
- [ ] All types and interfaces documented
- [ ] No type widening (e.g., `defaultLocale` is `Locale`, not `string`)
- [ ] Type-only exports use `export type`

### Documentation

- [ ] README is comprehensive
- [ ] CLAUDE.md updated with references
- [ ] All exports have JSDoc
- [ ] Examples are correct
- [ ] Next steps clearly documented

### Integration

- [ ] Configuration compatible with Next.js 15 App Router
- [ ] Compatible with React Server Components
- [ ] Compatible with Cloudflare Workers (via OpenNext)
- [ ] Barrel exports work correctly
- [ ] Imports from `@/i18n` work

### Testing

- [ ] TypeScript compilation passes
- [ ] ESLint passes
- [ ] Dev server starts successfully
- [ ] No console errors or warnings

---

## 📝 Feedback Template

Use this template for feedback:

```markdown
## Review Feedback - Phase 2

**Reviewer**: [Name]
**Date**: [Date]
**Commits Reviewed**: All 5 commits

### ✅ Strengths

- Clear and well-structured configuration
- Type-safe locale definitions
- Comprehensive documentation
- [Other positive observations]

### 🔧 Required Changes

#### Commit X: [Title]
1. **[File/Area]**: [Issue description]
   - **Why**: [Explanation of the issue]
   - **Suggestion**: [How to fix]
   - **Example**: [Code example if helpful]

2. [Repeat for each issue]

### 💡 Suggestions (Optional)

- [Nice-to-have improvements]
- [Alternative approaches to consider]
- [Future enhancements]

### 📊 Validation Results

- TypeScript: [Pass/Fail with details]
- ESLint: [Pass/Fail with details]
- Dev Server: [Pass/Fail with details]

### 📋 Verdict

- [ ] ✅ **APPROVED** - Ready to merge and proceed to Phase 3
- [ ] 🔧 **CHANGES REQUESTED** - Needs fixes (see above)
- [ ] ❌ **REJECTED** - Major rework needed (see above)

### Next Steps

[What should happen next - e.g., "Fix issues in Commits 2 and 3, then re-review"]
```

---

## 🎯 Review Actions

### If Approved ✅

1. Merge commits to main/story branch
2. Update Phase 2 status to **COMPLETED** in INDEX.md
3. Update EPIC_TRACKING.md: Story 1.1 progress (2/3 phases done)
4. Prepare for Phase 3 (Integration Validation)
5. Archive review notes for documentation

### If Changes Requested 🔧

1. Create detailed feedback using template above
2. Discuss issues with developer
3. Prioritize required changes vs optional improvements
4. Re-review after fixes
5. Verify fixes with validation commands

### If Rejected ❌

1. Document all major issues clearly
2. Schedule discussion with developer and team
3. Plan rework strategy
4. Consider if phase should be split or redesigned
5. Provide clear guidance on corrections

---

## 🎓 Common Issues to Watch For

### Configuration Errors
- ❌ Importing from `next-intl` instead of `next-intl/server`
- ❌ Missing `as const` on locales array (loses type safety)
- ❌ Type widening on `defaultLocale` (should be `Locale`, not `string`)
- ❌ Incorrect dynamic import path

### TypeScript Issues
- ❌ Using `any` without justification
- ❌ Missing type exports in barrel file
- ❌ Circular dependencies between files
- ❌ Type-value exports not properly separated

### Documentation Issues
- ❌ Missing or incomplete JSDoc
- ❌ Examples that won't work
- ❌ Broken links or references
- ❌ Unclear next steps

### Integration Issues
- ❌ Configuration incompatible with Next.js 15 patterns
- ❌ Missing exports in barrel file
- ❌ Dev server fails to start

---

## 📊 Review Metrics

Track these during review:

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| TypeScript Errors | 0 | - | ⏳ |
| ESLint Warnings | 0 | - | ⏳ |
| Files Created | 5 | - | ⏳ |
| Lines of Code | ~225 | - | ⏳ |
| Documentation | Complete | - | ⏳ |
| Dev Server | Starts OK | - | ⏳ |

---

## ❓ FAQ

**Q: What if I disagree with a design choice?**
A: If it meets requirements and works correctly, consider it acceptable. Suggest alternatives as optional improvements.

**Q: Should I test the configuration manually?**
A: Yes, verify dev server starts and there are no console errors. Manual testing is part of validation.

**Q: How strict should I be on documentation?**
A: Documentation is critical for this phase. Ensure README and JSDoc are comprehensive and helpful.

**Q: Can I approve with minor comments?**
A: Yes! Mark as approved and note that comments are optional improvements for future consideration.

**Q: What if message files are missing?**
A: That's expected! Message files are created in Story 1.2. The configuration prepares the import structure.

**Q: Should types.ts be more detailed?**
A: No. `IntlMessages` is intentionally generic. It will be refined when message structure is defined in Story 1.2.

---

**Review Guide Complete** - Use this systematically for high-quality review! 🎯
