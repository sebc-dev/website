# Phase 1 - Atomic Implementation Plan

**Objective**: Create message file structure and implement complete French translations for the bilingual UI foundation.

---

## 🎯 Overview

### Why an Atomic Approach?

The implementation is split into **4 independent commits** to:

✅ **Facilitate review** - Each commit focuses on a single responsibility
✅ **Enable rollback** - If a commit has issues, revert it without breaking everything
✅ **Progressive validation** - JSON files are valid at each step
✅ **Tests as you go** - Tests accompany the relevant code
✅ **Continuous documentation** - Each commit can be documented independently

### Global Strategy

```
[Commit 1] → [Commit 2] → [Commit 3] → [Commit 4]
Structure    French      French       Tests &
(empty)      Common      Advanced     Config
↓            ↓           ↓            ↓
Valid JSON   ~20 keys    ~30 keys     100% ready
```

---

## 📦 The 4 Atomic Commits

### Commit 1: Create Message File Structure

**Files**:

- `messages/fr.json` (new)
- `messages/en.json` (new)

**Size**: ~100 lines
**Duration**: 15-20 min (implementation) + 10-15 min (review)

**Content**:

- Create empty `messages/` directory structure
- Create `messages/fr.json` with top-level namespace structure (no values yet)
- Create `messages/en.json` with identical structure
- Use 2-space indentation for consistency
- Proper UTF-8 encoding for future accent characters

**Why it's atomic**:

- Single responsibility: Establish the namespace structure
- Both files are valid JSON (empty objects within namespaces)
- Can be validated independently (JSON syntax checking)
- Provides foundation for next commits

**Technical Validation**:

```bash
# Validate JSON syntax
node -e "JSON.parse(require('fs').readFileSync('messages/fr.json', 'utf8'))"
node -e "JSON.parse(require('fs').readFileSync('messages/en.json', 'utf8'))"
```

**Expected Result**: Two valid, empty-valued JSON files with namespace structure

**Review Criteria**:

- [ ] `messages/` directory created in project root
- [ ] Both files have identical namespace structure
- [ ] JSON is valid (no syntax errors)
- [ ] 2-space indentation used consistently
- [ ] UTF-8 encoding specified or implicit
- [ ] All namespaces present: common, nav, footer, form, article, complexity, search, error
- [ ] Alphabetically sorted within namespaces

---

### Commit 2: Add French Translations - Part 1 (Common, Nav, Footer)

**Files**:

- `messages/fr.json` (modify)

**Size**: ~200 lines
**Duration**: 30-40 min (implementation) + 15-20 min (review)

**Content**:

- French translations for `common` namespace (~10 keys)
  - appName: "sebc.dev"
  - loading, error, close, etc.
- French translations for `nav` namespace (~4 keys)
  - home, articles, search, about
- French translations for `footer` namespace (~3 keys)
  - copyright, privacy, terms
- Total: ~17 keys with native, professional French

**Why it's atomic**:

- Single responsibility: Core UI element translations (common use)
- No external dependencies
- Can be validated independently (valid JSON)
- Covers essential navigation elements
- Natural stopping point (other sections are independent)

**Technical Validation**:

```bash
# Validate JSON syntax
node -e "JSON.parse(require('fs').readFileSync('messages/fr.json', 'utf8'))" && echo "Valid JSON"

# Count keys (should be ~17)
node -e "const fr = JSON.parse(require('fs').readFileSync('messages/fr.json', 'utf8')); const count = Object.values(fr).reduce((sum, ns) => sum + Object.keys(ns).length, 0); console.log('Keys in fr.json:', count)"
```

**Expected Result**: French file with ~17 complete translations in common, nav, and footer namespaces

**Review Criteria**:

- [ ] All 17 translations present
- [ ] French text is natural and professional
- [ ] No hardcoded language references in keys
- [ ] Proper accent characters (é, è, ç, etc.) in French text
- [ ] Consistent terminology across translations
- [ ] JSON remains valid

---

### Commit 3: Add French Translations - Part 2 (Forms, Articles, Complexity, Search, Errors)

**Files**:

- `messages/fr.json` (modify)

**Size**: ~300 lines
**Duration**: 40-50 min (implementation) + 15-20 min (review)

**Content**:

- French translations for `form` namespace (~7 keys)
  - submit, cancel, save, delete, edit, required, invalidEmail
- French translations for `article` namespace (~8 keys)
  - readingTime, publishedOn, updatedOn, category, tags, complexity, tableOfContents, readingProgress
- French translations for `complexity` namespace (3 keys)
  - beginner, intermediate, advanced
- French translations for `search` namespace (~8 keys)
  - placeholder, noResults, filters, clearFilters, categories, complexityLevel, readingDuration, dateRange
- French translations for `error` namespace (~3 keys)
  - notFound, serverError, goHome
- Total: ~30 keys completing the full French translation set

**Why it's atomic**:

- Single responsibility: All remaining French translations
- No external dependencies
- Completes the French translation set
- Can be validated independently
- Natural grouping (forms + content + errors = complete feature set)

**Technical Validation**:

```bash
# Validate JSON syntax and count all keys
node -e "const fr = JSON.parse(require('fs').readFileSync('messages/fr.json', 'utf8')); const count = Object.values(fr).reduce((sum, ns) => sum + Object.keys(ns).length, 0); console.log('Total French keys:', count); console.log('Namespaces:', Object.keys(fr).sort())"
```

**Expected Result**: Complete French translation set with ~50 total keys across all namespaces

**Review Criteria**:

- [ ] All ~30 new translations present
- [ ] French text is natural, professional, and consistent
- [ ] Parameterized translations use correct syntax: `{variable}`
- [ ] All namespaces complete: common, nav, footer, form, article, complexity, search, error
- [ ] JSON remains valid
- [ ] Tone matches project identity ("learning in public" philosophy)

---

### Commit 4: Add Message Loading Tests and Config Validation

**Files**:

- `tests/messages.test.ts` (new)
- `i18n/config.ts` (modify - import messages if needed)

**Size**: ~250 lines
**Duration**: 35-45 min (implementation) + 15-20 min (review)

**Content**:

- Unit tests for message file validation:
  - Test JSON parsing (both fr.json and en.json load without errors)
  - Test UTF-8 encoding
  - Test namespace structure exists
  - Test all required namespaces present
  - Test no empty translation values in French
  - Test message counts
- Integration test for i18n config:
  - Verify config successfully loads messages
  - Test that `useTranslations()` hook works (basic smoke test)
- Test fixtures if needed for edge cases

**Why it's atomic**:

- Single responsibility: Validate message files and integration
- Ensures Phase 1 deliverables are correct
- Tests are independent and can run standalone
- No functional code changes (only tests + config)
- Validates the work of previous commits

**Technical Validation**:

```bash
# Run tests
pnpm test messages

# Check coverage
pnpm test:coverage -- tests/messages.test.ts
```

**Expected Result**: All tests pass, >80% coverage for message loading logic

**Review Criteria**:

- [ ] All tests pass
- [ ] Coverage >80% for message-related code
- [ ] Tests are meaningful (not just for coverage)
- [ ] Tests validate critical functionality
- [ ] No `any` types (use proper types for test data)
- [ ] Comments explain complex test logic
- [ ] Config changes are minimal and focused

---

## 🔄 Implementation Workflow

### Step-by-Step

1. **Read specification**: Understand Phase 1 requirements fully
2. **Setup environment**: Minimal setup needed (no new dependencies)
3. **Implement Commit 1**: Create message file structure
4. **Validate Commit 1**: Run JSON validation
5. **Review Commit 1**: Self-review against criteria
6. **Commit Commit 1**: Use provided commit message
7. **Repeat for commits 2-4**
8. **Final validation**: Complete VALIDATION_CHECKLIST.md

### Validation at Each Step

After each commit:

```bash
# JSON validation
node -e "JSON.parse(require('fs').readFileSync('messages/fr.json', 'utf8'))" && echo "Valid JSON"

# (After Commit 4 only)
# Lint check
pnpm lint

# Tests
pnpm test messages
```

All must pass before moving to next commit.

---

## 📊 Commit Metrics

| Commit            | Files | Lines    | Implementation | Review     | Total      |
| ----------------- | ----- | -------- | -------------- | ---------- | ---------- |
| 1. Structure      | 2     | ~100     | 15 min         | 12 min     | 27 min     |
| 2. French P1      | 1     | ~200     | 35 min         | 18 min     | 53 min     |
| 3. French P2      | 1     | ~300     | 45 min         | 18 min     | 63 min     |
| 4. Tests & Config | 2     | ~250     | 40 min         | 18 min     | 58 min     |
| **TOTAL**         | **4** | **~850** | **2-3h**       | **1-1.5h** | **3-4.5h** |

---

## ✅ Atomic Approach Benefits

### For Developers

- 🎯 **Clear focus**: One thing at a time
- 🧪 **Testable**: Each commit validated
- 📝 **Documented**: Clear commit messages

### For Reviewers

- ⚡ **Fast review**: 12-20 min per commit
- 🔍 **Focused**: Single responsibility to check
- ✅ **Quality**: Easier to spot issues

### For the Project

- 🔄 **Rollback-safe**: Revert without breaking
- 📚 **Historical**: Clear progression in git history
- 🏗️ **Maintainable**: Easy to understand later

---

## 📝 Best Practices

### Commit Messages

Format:

```
type(scope): short description (max 50 chars)

- Point 1: detail
- Point 2: detail
- Point 3: justification if needed

Part of Phase 1 - Commit X/4
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

### Review Checklist

Before committing:

- [ ] Code follows project style guide
- [ ] All tests pass (after Commit 4)
- [ ] JSON is valid (after all commits)
- [ ] No console.logs or debug code
- [ ] Documentation updated if needed

---

## ⚠️ Important Points

### Do's

- ✅ Follow the commit order
- ✅ Validate after each commit
- ✅ Write tests in Commit 4
- ✅ Use provided commit messages as template
- ✅ Ensure UTF-8 encoding for French characters

### Don'ts

- ❌ Skip commits or combine them
- ❌ Commit without running validations
- ❌ Add features not in the spec
- ❌ Mix English and French translations in same commit
- ❌ Leave test values as placeholder strings

---

## ❓ FAQ

**Q: What if I find a typo in a French translation?**
A: Fix it in the current commit (part 2 or 3). If already committed, create a separate fix commit or fixup commit.

**Q: Can I add more translations beyond the spec?**
A: No, stay within scope. Additional translations can be added in Phase 2 or later stories.

**Q: What encoding should I use?**
A: UTF-8 (default in most editors). Ensure accents (é, è, ç, etc.) are properly encoded.

**Q: Should I validate key counts exactly?**
A: Not exactly, but stay within scope (~50-80 total keys). The counts in commits 2-3 are estimates based on namespaces.

**Q: Can I reorder commits?**
A: Not recommended. This order ensures valid files at each step. Structure first, then translations, then tests.
