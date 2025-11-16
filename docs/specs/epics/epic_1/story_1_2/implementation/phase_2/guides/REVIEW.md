# Phase 2 - Code Review Guide

Complete guide for reviewing the Phase 2 implementation.

---

## 🎯 Review Objective

Validate that the implementation:

- ✅ Completes English translations with 100% key parity
- ✅ Implements comprehensive parity validation tests
- ✅ Establishes type-safe translation patterns
- ✅ Provides excellent documentation and examples
- ✅ Follows project standards and conventions
- ✅ Is well tested and production-ready

---

## 📋 Review Approach

Phase 2 is split into **4 atomic commits**. You can:

**Option A: Commit-by-commit review** (recommended)

- Easier to digest (15-30 min per commit)
- Progressive validation
- Targeted feedback

**Option B: Global review at once**

- Faster (1.5-2h total)
- Immediate overview
- Requires more focus

**Estimated Total Time**: 1.5-2 hours

---

## 🔍 Commit-by-Commit Review

### Commit 1: Add English Translations (Common, Nav, Footer)

**Files**: `messages/en.json` (~180 lines)
**Duration**: 15-20 minutes

#### Review Checklist

##### File Structure

- [ ] File is valid JSON (no syntax errors)
- [ ] Uses 2-space indentation (consistent with project)
- [ ] Proper UTF-8 encoding for special characters
- [ ] Keys are sorted alphabetically within namespaces
- [ ] No trailing commas or missing commas

##### Translation Quality

- [ ] Translations are natural English (not literal translations of French)
- [ ] American English spelling conventions (color not colour, organize not organise)
- [ ] Professional but approachable tone (matches project philosophy)
- [ ] Terminology consistent with UI/UX specification
- [ ] No hardcoded language references in values
- [ ] Capitalization is appropriate and consistent

##### Structure Validation

- [ ] Three namespaces present: `common`, `nav`, `footer`
- [ ] Key names match French `messages/fr.json` exactly
- [ ] Same nesting depth as French file
- [ ] No extra keys not in French file
- [ ] Namespace order matches French file

##### Specific Namespace Reviews

**Common Namespace** (10 keys):

- [ ] `appName`: "sebc.dev" - Brand name correct
- [ ] `loading`: "Loading..." - Standard pattern
- [ ] `error`: "An error occurred" - User-friendly message
- [ ] All other keys are standard UI terms
- [ ] Terminology matches rest of UI

**Nav Namespace** (9 keys):

- [ ] All navigation items are clear and descriptive
- [ ] Consistent with app structure
- [ ] Proper capitalization for menu items
- [ ] No duplicates with other namespaces

**Footer Namespace** (5 keys):

- [ ] Legal terms are appropriate ("Privacy Policy", "Terms of Service")
- [ ] Copyright notice is correct ("© 2025 sebc.dev...")
- [ ] Professional tone suitable for footer

#### Technical Validation

```bash
# Review commands
jq empty messages/en.json  # Validate JSON
jq 'keys | sort' messages/en.json  # Check namespaces
jq '[.. | objects | keys[]] | unique | length' messages/en.json  # Count keys
```

**Expected Results**:

- JSON is valid (no error from `jq empty`)
- Three namespaces: common, footer, nav
- 25+ total keys

#### Questions to Ask

1. Are all translations consistent with the brand voice described in the Brief?
2. Do the navigation items match the actual app structure?
3. Are there any hardcoded values that should be in the French file too?

---

### Commit 2: Add English Translations (Form, Article, Search, Error)

**Files**: `messages/en.json` (continued, ~220 lines)
**Duration**: 20-25 minutes

#### Review Checklist

##### File Structure

- [ ] File is still valid JSON after additions
- [ ] Previous namespaces (common, nav, footer) unchanged
- [ ] New namespaces in alphabetical order (complexity, error, form, search, article)
- [ ] Consistent indentation throughout
- [ ] No syntax errors

##### Translation Quality - Form Namespace

- [ ] Form validation messages are clear and helpful
- [ ] `required`: "This field is required" - Standard message
- [ ] `invalidEmail`: "Invalid email address" - Clear error
- [ ] `passwordTooShort`: "Password must be at least 8 characters" - Specific requirement
- [ ] Error messages don't reveal security info
- [ ] Submit states clear: "Submit", "Submitting...", "Submitted"

##### Translation Quality - Article Namespace

- [ ] Reading time format: `{minutes} min read` - Standard format
- [ ] Date format labels: `{date}` - Will be formatted by component
- [ ] Metadata labels are descriptive (Category, Tags, etc.)
- [ ] Consistent with how articles are presented in UI
- [ ] byAuthor includes `{author}` placeholder

##### Translation Quality - Complexity Namespace

- [ ] Three levels: Beginner, Intermediate, Advanced
- [ ] Consistent with Phase 1 French translations
- [ ] Appropriate difficulty descriptors
- [ ] Professional tone

##### Translation Quality - Search Namespace

- [ ] Placeholder text is helpful: "Search articles..."
- [ ] Filter labels are clear (Categories, Complexity Level, etc.)
- [ ] Empty state message: "No articles found" - User-friendly
- [ ] All filter types covered
- [ ] Consistent with search UI design

##### Translation Quality - Error Namespace

- [ ] 404: "Page not found" - Standard error message
- [ ] 500: "Internal server error" - Professional message
- [ ] User-friendly action: "Go to homepage" or similar
- [ ] No technical jargon that confuses users
- [ ] Covers common HTTP error codes (401, 403, 400, 409, 408, 503)

##### Parity Validation

- [ ] All keys in `messages/fr.json` exist in new English additions
- [ ] No extra English keys that don't exist in French
- [ ] Namespace structure is identical to French file
- [ ] Same nesting depth throughout
- [ ] All `{variable}` placeholders exist in French version too

#### Technical Validation

```bash
# Validate JSON
jq empty messages/en.json

# Check all namespaces
jq 'keys | sort' messages/en.json

# Look for parameterized strings
jq '[.. | strings | select(contains("{"))]' messages/en.json

# Total key count
jq '[.. | objects | keys[]] | unique | length' messages/en.json  # Should be 55-60
```

**Expected Results**:

- Valid JSON with 5 total namespaces
- 55-60 total translation keys
- Parameterized translations use `{variable}` syntax

#### Questions to Ask

1. Do form validation messages match what the form component expects?
2. Are error messages appropriate for different HTTP status codes?
3. Are all parameterized translations using consistent variable naming?
4. Is the tone consistent across all error messages?

---

### Commit 3: Implement Parity Validation Tests

**Files**: `tests/messages.test.ts` (~250 lines)
**Duration**: 15-20 minutes

#### Review Checklist

##### Test Coverage

- [ ] Forward parity test: All French keys verified in English
- [ ] Reverse parity test: All English keys verified in French
- [ ] Structure validation: Same namespace structure in both files
- [ ] Parameterized validation: `{variable}` syntax consistent
- [ ] Edge cases: Empty strings, special characters handled
- [ ] Clear error messages for debugging parity issues

##### Test Quality

- [ ] Test names are descriptive (e.g., "All French keys exist in English")
- [ ] Each test has single responsibility
- [ ] Tests don't depend on execution order
- [ ] Helper functions are well-named and reusable
- [ ] No hardcoded file paths (use relative imports)
- [ ] Proper error messages for test failures

##### Helper Functions

- [ ] `getNestedKeys()` or similar: Extracts all key paths from nested objects
- [ ] Helper for comparing keys between files
- [ ] Error formatting helper: Shows which keys are missing
- [ ] Parameterized translation validator

##### Code Quality

- [ ] TypeScript types are correct (no `any` unless justified)
- [ ] Clear variable names
- [ ] Proper error handling
- [ ] No console.log statements in production code
- [ ] Comments explain complex test logic

##### Test Execution

```bash
# Run the tests
pnpm test tests/messages.test.ts

# Check coverage
pnpm test:coverage tests/messages.test.ts

# Expected: All tests pass, >80% coverage
```

**Expected Results**:

- All tests pass
- No parity errors
- Coverage > 80%

#### Questions to Ask

1. Are the error messages clear enough to debug parity issues?
2. Do the tests validate all types of parameterized translations?
3. Are there edge cases (special characters, Unicode) being tested?
4. Could the tests be made more maintainable with additional helpers?

---

### Commit 4: Create Test Page & Documentation

**Files**:

- `app/[locale]/(test)/messages-test/page.tsx` (~200 lines)
- `i18n/README.md` (~150 lines)
- `CLAUDE.md` (modified)

**Duration**: 20-30 minutes

#### Review Checklist - Test Page

##### Component Structure

- [ ] Component is properly exported
- [ ] Uses `useTranslations()` hook from next-intl
- [ ] Displays all 8 namespaces
- [ ] Shows both French and English translations
- [ ] Clear layout with namespace headings

##### Translation Display

- [ ] All namespaces are shown (common, nav, footer, form, article, complexity, search, error)
- [ ] All keys within each namespace are visible
- [ ] Values are displayed clearly and readable
- [ ] No truncation of long translation values

##### Parameterized Translations

- [ ] Example values shown for `{variable}` placeholders
- [ ] Examples are realistic (e.g., "5 min read", "November 16, 2025")
- [ ] Format matches what components will actually use
- [ ] Multiple examples for complex placeholders

##### Styling & UX

- [ ] Page is readable and well-organized
- [ ] Uses Tailwind CSS v4 classes appropriately
- [ ] Mobile-responsive layout
- [ ] Professional appearance suitable for development
- [ ] Clear indication this is a test/development page

##### Code Quality

- [ ] No TypeScript errors
- [ ] No console errors when component renders
- [ ] Proper use of React hooks
- [ ] Clean, readable JSX structure
- [ ] No hardcoded strings (uses translations)

#### Review Checklist - Documentation (i18n/README.md)

##### Content Completeness

- [ ] Overview section explains purpose and scope
- [ ] All 8 namespaces documented with descriptions
- [ ] Usage examples are clear and runnable
- [ ] Component import patterns shown
- [ ] Server component usage documented
- [ ] Parameterized translation examples included
- [ ] Guidelines for adding new translations

##### Code Examples

- [ ] `useTranslations()` hook example is correct
- [ ] Parameter substitution examples work as shown
- [ ] All examples match actual implementation
- [ ] Examples are copy-paste ready

##### Documentation Quality

- [ ] Clear table of contents or structure
- [ ] Links to next-intl documentation
- [ ] Links to message files
- [ ] Testing instructions are complete
- [ ] Formatting is consistent and professional
- [ ] No broken links

##### Completeness

- [ ] Key reference section exists
- [ ] Translation guidelines documented
- [ ] Adding new keys procedure explained
- [ ] Parity testing procedure documented
- [ ] Resources section complete

#### Review Checklist - CLAUDE.md Update

##### Content

- [ ] i18n section properly updated
- [ ] Message file structure documented (8 namespaces)
- [ ] Key count correct (55-60 keys after Phase 2)
- [ ] Import patterns shown
- [ ] Phase 2 completion noted
- [ ] Link to i18n/README.md added

##### Accuracy

- [ ] All links are correct and not broken
- [ ] Code examples are accurate
- [ ] File paths are correct
- [ ] Status information is current

#### Technical Validation

```bash
# Type checking
pnpm tsc

# Linting
pnpm lint

# Dev server (if available)
pnpm dev &
curl http://localhost:3000/fr/messages-test 2>/dev/null | grep -q "html" && echo "✅ Page renders"
kill %1
```

**Expected Results**:

- No TypeScript errors
- No linting issues
- Page renders without errors
- Documentation links work

#### Questions to Ask

1. Is the test page easily discoverable by developers?
2. Are the documentation examples comprehensive enough to teach new patterns?
3. Would a developer unfamiliar with next-intl understand how to use translations after reading the docs?
4. Is the test page appropriately hidden (not in production)?

---

## ✅ Global Validation

After reviewing all commits:

### Architecture & Design

- [ ] Translation file structure is clean and maintainable
- [ ] Namespace organization is logical (related concepts grouped)
- [ ] Key naming is consistent across all namespaces
- [ ] Parity validation ensures future consistency

### Code Quality

- [ ] Consistent style across all namespaces
- [ ] Clear and descriptive key names
- [ ] Natural, professional English translations
- [ ] Tests are comprehensive and well-written
- [ ] Documentation is clear and complete

### Translation Quality

- [ ] All translations are professionally written
- [ ] Terminology is consistent across all namespaces
- [ ] No missing or broken parameterized translations
- [ ] 100% parity between French and English verified

### Testing

- [ ] Parity tests cover all key paths
- [ ] Edge cases are handled
- [ ] Tests are meaningful (not just for coverage)
- [ ] Coverage > 80% for message handling

### Documentation

- [ ] Test page is functional and helpful
- [ ] i18n/README.md is comprehensive
- [ ] CLAUDE.md is properly updated
- [ ] All internal links work
- [ ] Examples are accurate and runnable

---

## 📝 Feedback Template

Use this template for structured review feedback:

```markdown
## Review Feedback - Phase 2

**Reviewer**: [Name]
**Date**: [Date]
**Commits Reviewed**: [e.g., "All 4 commits" or "Commits 1-3"]

### ✅ Strengths

- [What was done well 1]
- [What was done well 2]
- [Highlight particularly good translations or tests]

### 🔧 Required Changes

1. **[Commit X / File]**: [Issue description]
   - **Why**: [Explanation of impact]
   - **Suggestion**: [How to fix it]

2. [Repeat for each required change - be specific with commit numbers]

### 💡 Suggestions (Optional)

- [Nice-to-have improvements]
- [Alternative approaches to consider]
- [Potential optimizations for future phases]

### 📊 Verdict

- [ ] ✅ **APPROVED** - Ready to merge
- [ ] 🔧 **CHANGES REQUESTED** - Needs fixes
- [ ] ❌ **REJECTED** - Major rework needed

### Summary

[1-2 sentence overall assessment]

### Next Steps

- If approved: Merge and prepare for Story 1.3
- If changes: Author addresses feedback and resubmits for review
- If rejected: Document issues and discuss rework strategy
```

---

## 🎯 Review Actions

### If Approved ✅

1. Confirm all 4 commits are merged
2. Verify tests pass in CI/CD
3. Check that Phase status updates to ✅ COMPLETED
4. Update EPIC_TRACKING.md with Phase 2 completion
5. Prepare for Story 1.3 (middleware)

### If Changes Requested 🔧

1. Provide detailed, actionable feedback with examples
2. Be specific about which commit(s) have issues
3. For translation issues: Show side-by-side comparison with French
4. For test issues: Explain what scenarios aren't covered
5. Author fixes issues and requests re-review

### If Rejected ❌

1. Document major issues clearly
2. Schedule discussion with author
3. Plan rework strategy
4. Consider if phase needs to be split differently

---

## ❓ FAQ for Reviewers

**Q: What if a translation doesn't sound natural?**
A: Suggest a native English alternative. Remember: translations should read naturally, not literally.

**Q: Should I verify every parameterized translation?**
A: Yes. Test a few examples manually to ensure variables will work as expected.

**Q: What if there's a parity error the tests missed?**
A: Ask the author to enhance the parity tests to catch this case going forward.

**Q: Can I approve with minor suggestions?**
A: Yes. Minor suggestions can be marked as approved with notes for future work.

**Q: Should the test page be hidden?**
A: Ideally yes. Check that it's not exposed in production nav or requires authentication.

**Q: How thorough should documentation review be?**
A: Check that examples are accurate and non-broken. Try running them if not obvious.

---

## 🔗 Reference Links

- [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md)
- [COMMIT_CHECKLIST.md](../COMMIT_CHECKLIST.md)
- [Story 1.2 Spec](../../story_1.2.md)
- [Project i18n Config](../../../../../i18n/config.ts)
- [Phase 1 Review Guide](../../phase_1/guides/REVIEW.md)

---

**Ready to review! Start with Commit 1. Happy reviewing! 🎉**
