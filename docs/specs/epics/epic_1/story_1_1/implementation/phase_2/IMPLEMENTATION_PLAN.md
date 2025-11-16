# Phase 2 - Atomic Implementation Plan

**Objective**: Create next-intl configuration file with locale settings, TypeScript types, and request configuration for React Server Components

---

## 🎯 Overview

### Why an Atomic Approach?

The implementation is split into **5 independent commits** to:

✅ **Facilitate review** - Each commit focuses on a single responsibility (structure → types → config → TypeScript → validation)
✅ **Enable rollback** - If a commit has issues, revert it without breaking the entire configuration
✅ **Progressive type-safety** - TypeScript validates at each step, catching errors early
✅ **Logical progression** - Build from foundation (structure) to implementation (config) to validation
✅ **Clear git history** - Each commit tells a story of how the configuration was built

### Global Strategy

```
[Commit 1]  →  [Commit 2]  →  [Commit 3]  →  [Commit 4]  →  [Commit 5]
   ↓              ↓              ↓              ↓              ↓
Structure      Types          Config         TypeScript    Validation
Created        Defined        Implemented    Configured    Complete
100% TS        100% TS        100% TS        100% TS       100% TS
```

**Progressive Validation**: After each commit, TypeScript compilation passes and ESLint validation succeeds.

---

## 📦 The 5 Atomic Commits

### Commit 1: Create base i18n configuration structure

**Files**:

- `src/i18n/config.ts` (new, ~20 lines)

**Size**: ~20 lines
**Duration**: 20-30 min (implementation) + 10-15 min (review)

**Content**:

- Create `src/i18n/` directory
- Create `config.ts` file with basic imports
- Import `getRequestConfig` from `next-intl/server`
- Add file header documentation
- Export placeholder configuration (to be implemented in Commit 3)

**Why it's atomic**:

- **Single responsibility**: Establish file structure and basic imports
- **No external dependencies**: Only imports from next-intl (installed in Phase 1)
- **Independently testable**: File exists, TypeScript recognizes imports
- **Foundation for next commits**: Provides the file where configuration will be implemented

**Technical Validation**:

```bash
# Verify file created
ls -la src/i18n/config.ts

# TypeScript compilation
pnpm tsc --noEmit

# Linter check
pnpm lint src/i18n/config.ts
```

**Expected Result**:

- File `src/i18n/config.ts` exists
- TypeScript recognizes `getRequestConfig` import
- No compilation errors
- No linter errors

**Review Criteria**:

- [ ] File created in correct location: `src/i18n/config.ts`
- [ ] Imports from `next-intl/server` are correct
- [ ] File header documentation is clear
- [ ] TypeScript compilation passes
- [ ] ESLint passes with no warnings

---

### Commit 2: Define locale types and constants

**Files**:

- `src/i18n/config.ts` (modified, +25 lines, ~45 lines total)

**Size**: ~25 lines added
**Duration**: 30-40 min (implementation) + 15-20 min (review)

**Content**:

- Define `Locale` type: `'fr' | 'en'`
- Define `locales` constant array: `['fr', 'en'] as const`
- Define `defaultLocale` constant: `'fr'`
- Export locale types and constants
- Add JSDoc documentation for each export
- Type-safe locale definitions

**Why it's atomic**:

- **Single responsibility**: Define all locale-related types and constants
- **Type-safe foundation**: Provides types used by configuration and future code
- **Independently valuable**: Exports can be imported and used elsewhere
- **No external dependencies**: Pure TypeScript definitions

**Technical Validation**:

```bash
# TypeScript compilation (verify types are correct)
pnpm tsc --noEmit

# Try importing in a test file (manual verification)
# Should autocomplete 'fr' | 'en' for Locale type
```

**Expected Result**:

- TypeScript recognizes `Locale` type
- `locales` constant is readonly array
- `defaultLocale` is type-safe (typed as `'fr'`, not just `string`)
- Intellisense/autocomplete works for locale values

**Review Criteria**:

- [ ] `Locale` type correctly defined as union type `'fr' | 'en'`
- [ ] `locales` array uses `as const` for type safety
- [ ] `defaultLocale` is typed correctly (not widened to `string`)
- [ ] All exports have JSDoc documentation
- [ ] Follows TypeScript best practices (const assertions, readonly)
- [ ] TypeScript compilation passes
- [ ] No linter warnings

---

### Commit 3: Implement getRequestConfig for Server Components

**Files**:

- `src/i18n/config.ts` (modified, +30 lines, ~75 lines total)

**Size**: ~30 lines added
**Duration**: 45-60 min (implementation) + 20-30 min (review)

**Content**:

- Implement `getRequestConfig()` function
- Accept `locale` parameter (typed as `string` from next-intl)
- Validate locale against supported locales (type guard)
- Dynamically import message file: `import(`../../messages/${locale}.json`)`
- Return configuration object with `messages` property
- Add error handling for invalid locales
- Add comprehensive JSDoc documentation
- Export as default

**Why it's atomic**:

- **Single responsibility**: Implement the core configuration function
- **Complete feature**: getRequestConfig is fully functional (ready for messages)
- **Independently testable**: Can be imported and tested (messages don't exist yet, but import logic is correct)
- **Logical progression**: Builds on types from Commit 2

**Technical Validation**:

```bash
# TypeScript compilation
pnpm tsc --noEmit

# Linter check
pnpm lint src/i18n/config.ts

# Verify dynamic import syntax is correct
# (messages won't exist until Story 1.2, but TypeScript should accept the import)
```

**Expected Result**:

- `getRequestConfig` is properly typed
- Dynamic import syntax is correct
- Locale validation logic works
- TypeScript compilation passes (even though message files don't exist yet)
- Default export is present

**Review Criteria**:

- [ ] `getRequestConfig()` correctly typed with next-intl's expected signature
- [ ] Locale parameter is validated before use
- [ ] Dynamic import path is correct: `../../messages/${locale}.json`
- [ ] Error handling for invalid/unsupported locales
- [ ] Return type matches next-intl's expected configuration
- [ ] JSDoc documentation explains purpose and parameters
- [ ] Default export is correct
- [ ] TypeScript compilation passes
- [ ] ESLint passes

---

### Commit 4: Add TypeScript configuration and type exports

**Files**:

- `src/i18n/types.ts` (new, ~40 lines)
- `src/i18n/index.ts` (new, ~15 lines)

**Size**: ~55 lines total
**Duration**: 40-50 min (implementation) + 20-25 min (review)

**Content**:

- Create `types.ts` for i18n type definitions
- Define `IntlMessages` type (for translation message structure)
- Define utility types for translation keys (if needed)
- Create `index.ts` barrel export for clean imports
- Export locale constants, types, and config from barrel file
- Add comprehensive TypeScript documentation

**Why it's atomic**:

- **Single responsibility**: TypeScript infrastructure and export organization
- **Independently valuable**: Provides types for use across the application
- **Clean architecture**: Barrel exports make imports cleaner
- **No logic changes**: Pure type definitions and exports

**Technical Validation**:

```bash
# TypeScript compilation
pnpm tsc --noEmit

# Verify barrel exports work
# Can import from 'src/i18n' instead of 'src/i18n/config'

# Linter check
pnpm lint src/i18n/
```

**Expected Result**:

- All types properly exported
- Barrel export (`index.ts`) provides clean import paths
- TypeScript recognizes all type definitions
- No circular dependency issues

**Review Criteria**:

- [ ] `types.ts` contains appropriate type definitions
- [ ] `IntlMessages` type is correctly defined (can be generic/placeholder)
- [ ] `index.ts` exports all public APIs (`locales`, `defaultLocale`, `Locale`, config)
- [ ] No circular dependencies
- [ ] JSDoc documentation on all exports
- [ ] TypeScript compilation passes
- [ ] Follows project TypeScript conventions

---

### Commit 5: Validate configuration and add documentation

**Files**:

- `src/i18n/README.md` (new, ~80 lines)
- `CLAUDE.md` (modified, +15 lines)

**Size**: ~95 lines total
**Duration**: 45-60 min (implementation) + 15-20 min (review)

**Content**:

- Create `README.md` in `src/i18n/` documenting the configuration
- Document supported locales and default
- Explain configuration structure and usage
- Provide examples of how to import and use
- Document preparation for Story 1.2 (message files)
- Update `CLAUDE.md` with i18n configuration notes
- Add reference to i18n location and structure
- Document next steps (Story 1.2, Story 1.3)

**Why it's atomic**:

- **Single responsibility**: Documentation and validation
- **No code changes**: Only documentation updates
- **Valuable on its own**: Enables team to understand configuration
- **Closure**: Completes the phase with clear next steps

**Technical Validation**:

```bash
# Verify documentation is complete
cat src/i18n/README.md

# Verify CLAUDE.md update
grep -A 10 "i18n" CLAUDE.md

# Final TypeScript check
pnpm tsc --noEmit

# Final linter check
pnpm lint

# Test dev server startup
pnpm dev
# (Should start without errors - Ctrl+C to stop)
```

**Expected Result**:

- README.md is comprehensive and clear
- CLAUDE.md references i18n configuration
- All TypeScript validations pass
- Dev server starts successfully
- Documentation explains next steps

**Review Criteria**:

- [ ] README.md covers all configuration aspects
- [ ] Examples in README are correct and helpful
- [ ] CLAUDE.md updated with i18n setup reference
- [ ] Documentation mentions Story 1.2 (message files creation)
- [ ] Documentation mentions Story 1.3 (middleware)
- [ ] No broken links or references
- [ ] Markdown formatting is correct
- [ ] Final TypeScript compilation passes
- [ ] Dev server starts without errors

---

## 🔄 Implementation Workflow

### Step-by-Step

1. **Read specification**: Review PHASES_PLAN.md and this document
2. **Setup environment**: Verify Phase 1 completed (next-intl installed)
3. **Implement Commit 1**: Create base structure
4. **Validate Commit 1**: Run TypeScript and ESLint
5. **Commit Commit 1**: Use provided commit message format
6. **Implement Commit 2**: Define types and constants
7. **Validate Commit 2**: Run TypeScript and ESLint
8. **Commit Commit 2**: Use provided commit message format
9. **Implement Commit 3**: Implement getRequestConfig
10. **Validate Commit 3**: Run TypeScript and ESLint
11. **Commit Commit 3**: Use provided commit message format
12. **Implement Commit 4**: Add TypeScript infrastructure
13. **Validate Commit 4**: Run TypeScript and ESLint
14. **Commit Commit 4**: Use provided commit message format
15. **Implement Commit 5**: Documentation and validation
16. **Validate Commit 5**: Run all validations + dev server test
17. **Commit Commit 5**: Use provided commit message format
18. **Final validation**: Complete VALIDATION_CHECKLIST.md

### Validation at Each Step

After each commit:

```bash
# TypeScript type checking
pnpm tsc --noEmit

# ESLint validation
pnpm lint

# (After Commit 5) Test dev server
pnpm dev
# Should start without errors (Ctrl+C to stop)
```

All must pass before moving to next commit.

---

## 📊 Commit Metrics

| Commit              | Files | Lines    | Implementation | Review     | Total      |
| ------------------- | ----- | -------- | -------------- | ---------- | ---------- |
| 1. Base structure   | 1     | ~20      | 20-30 min      | 10-15 min  | 30-45 min  |
| 2. Locale types     | 1     | ~25      | 30-40 min      | 15-20 min  | 45-60 min  |
| 3. getRequestConfig | 1     | ~30      | 45-60 min      | 20-30 min  | 65-90 min  |
| 4. TypeScript setup | 2     | ~55      | 40-50 min      | 20-25 min  | 60-75 min  |
| 5. Documentation    | 2     | ~95      | 45-60 min      | 15-20 min  | 60-80 min  |
| **TOTAL**           | **5** | **~225** | **3-4h**       | **1.5-2h** | **4.5-6h** |

**Note**: Estimates include thinking time, researching next-intl patterns, and validation steps.

---

## ✅ Atomic Approach Benefits

### For Developers

- 🎯 **Clear focus**: One aspect at a time (structure → types → config → TypeScript → docs)
- 🧪 **Testable**: TypeScript validates at each commit
- 📝 **Documented**: Clear progression in git history
- 🔍 **Debuggable**: Easy to identify which commit introduced an issue

### For Reviewers

- ⚡ **Fast review**: 10-30 min per commit (total 1.5-2h vs 3-4h monolithic review)
- 🔍 **Focused**: Single aspect to check per commit
- ✅ **Quality**: Easier to spot issues in small, focused changes
- 💬 **Targeted feedback**: Can approve commits 1-3 while requesting changes on 4-5

### For the Project

- 🔄 **Rollback-safe**: Can revert individual commits without breaking everything
- 📚 **Historical**: Git history shows how configuration was built step-by-step
- 🏗️ **Maintainable**: Easy to understand later when adding locales or updating config
- 🎓 **Educational**: New team members can learn by reading commit history

---

## 📝 Best Practices

### Commit Messages

Format:

```
feat(i18n): short description (max 50 chars)

- Point 1: what was implemented
- Point 2: why it was implemented this way
- Point 3: any important context

Part of Phase 2 (Configuration) - Commit X/5
Story 1.1 - Install and configure next-intl
```

**Example for Commit 1**:

```
feat(i18n): create base configuration structure

- Create src/i18n/config.ts with next-intl imports
- Import getRequestConfig from next-intl/server
- Add file header documentation
- Establish foundation for locale configuration

Part of Phase 2 (Configuration) - Commit 1/5
Story 1.1 - Install and configure next-intl
```

### Review Checklist

Before committing:

- [ ] Code follows project style guide (ESLint passes)
- [ ] TypeScript compilation passes (`pnpm tsc --noEmit`)
- [ ] No `any` types (unless absolutely necessary and documented)
- [ ] JSDoc documentation added where appropriate
- [ ] File structure follows project conventions
- [ ] Imports are clean and organized

---

## ⚠️ Important Points

### Do's

- ✅ Follow the commit order (each builds on the previous)
- ✅ Validate TypeScript and ESLint after each commit
- ✅ Use provided commit message templates
- ✅ Add JSDoc documentation for exported types and functions
- ✅ Test dev server startup after Commit 5
- ✅ Reference next-intl documentation when implementing getRequestConfig

### Don'ts

- ❌ Skip commits or combine them (breaks atomic approach)
- ❌ Commit without running validations (TypeScript, ESLint)
- ❌ Use `any` types without strong justification
- ❌ Add features not in the spec (stay focused on configuration)
- ❌ Create message files yet (that's Story 1.2)
- ❌ Implement middleware (that's Phase 3 and Story 1.3)

---

## 🔗 Dependencies Between Commits

```
Commit 1 (Structure)
↓
Commit 2 (Types) - Uses file from Commit 1
↓
Commit 3 (Config) - Uses types from Commit 2
↓
Commit 4 (TypeScript) - Organizes exports from Commits 2-3
↓
Commit 5 (Documentation) - Documents everything from Commits 1-4
```

**Critical Path**: Must implement in order. Cannot skip or parallelize.

---

## ❓ FAQ

**Q: What if a commit is too big?**
A: The commits are already sized appropriately (20-55 lines each). If you find one is larger, you may be adding features not in the spec. Review the commit scope.

**Q: What if I need to fix a previous commit?**
A: If not yet pushed, amend or fixup the commit. If already pushed, create a small fix commit referencing the original.

**Q: Can I change the commit order?**
A: No. Each commit depends on the previous one. Changing order will break TypeScript compilation.

**Q: What if TypeScript compilation fails?**
A: Don't proceed to the next commit. Fix the issue first. Each commit must compile successfully.

**Q: Why are we importing messages that don't exist yet?**
A: The dynamic import syntax prepares the structure. TypeScript won't error on the import path itself (it's a string). Message files will be created in Story 1.2.

**Q: Do I need to test the configuration?**
A: Configuration is validated through TypeScript compilation and dev server startup (Commit 5). Unit tests aren't necessary for static configuration. Integration will be tested in Phase 3.

---

**Implementation Plan Ready**: Follow this plan commit-by-commit for successful Phase 2 completion! 🚀
