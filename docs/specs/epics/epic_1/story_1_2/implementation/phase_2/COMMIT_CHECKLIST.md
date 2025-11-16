# Phase 2 - Checklist per Commit

This document provides a detailed checklist for each atomic commit of Phase 2.

---

## 📋 Commit 1: Add English Translations (Common, Nav, Footer)

**Files**: `messages/en.json` (partial)
**Estimated Duration**: 45-65 minutes

### Implementation Tasks

- [ ] Create `messages/en.json` file in project root
- [ ] Add `common` namespace with these keys:
  - [ ] `appName`: "sebc.dev"
  - [ ] `loading`: "Loading..."
  - [ ] `error`: "An error occurred"
  - [ ] `close`: "Close"
  - [ ] `success`: "Success"
  - [ ] `warning`: "Warning"
  - [ ] `info`: "Information"
  - [ ] `cancel`: "Cancel"
  - [ ] `apply`: "Apply"
  - [ ] `retry`: "Retry"
- [ ] Add `nav` namespace with these keys:
  - [ ] `home`: "Home"
  - [ ] `articles`: "Articles"
  - [ ] `search`: "Search"
  - [ ] `about`: "About"
  - [ ] `projects`: "Projects"
  - [ ] `blog`: "Blog"
  - [ ] `documentation`: "Documentation"
  - [ ] `contact`: "Contact"
  - [ ] `language`: "Language"
- [ ] Add `footer` namespace with these keys:
  - [ ] `copyright`: "© 2025 sebc.dev. All rights reserved."
  - [ ] `privacy`: "Privacy Policy"
  - [ ] `terms`: "Terms of Service"
  - [ ] `contact`: "Contact"
  - [ ] `sitemap`: "Sitemap"

### Validation

```bash
# Check JSON syntax
jq empty messages/en.json

# List all namespaces
jq 'keys' messages/en.json

# Count keys
jq '[.. | objects | length] | add' messages/en.json
```

**Expected Result**: Valid JSON with 25+ keys organized in 3 namespaces

### Review Checklist

#### Structure & Format

- [ ] File is valid JSON (no syntax errors)
- [ ] Uses 2-space indentation (consistent with project style)
- [ ] Has proper UTF-8 encoding
- [ ] Keys are sorted alphabetically within each namespace
- [ ] No trailing commas or missing commas

#### Translation Quality

- [ ] All translations are natural English (not literal)
- [ ] American English spelling/conventions used (color, not colour)
- [ ] Terminology matches UI/UX specification
- [ ] Tone is professional but approachable
- [ ] No hardcoded language references in translation values
- [ ] All special characters properly escaped

#### Parity with French

- [ ] Keys match `messages/fr.json` structure exactly
- [ ] Same namespace names (common, nav, footer)
- [ ] Same key names within each namespace
- [ ] Same nesting depth

#### Code Quality

- [ ] No `any` types or type issues
- [ ] Clear and consistent formatting
- [ ] No commented code
- [ ] No debug statements

### Commit Message

```bash
git add messages/en.json
git commit -m "$(cat <<'EOF'
✨ feat(i18n): add English translations for common, nav, footer namespaces

- Added 25+ English translation keys in common, nav, footer namespaces
- Keys include UI actions (submit, cancel), navigation items (home, articles, about)
- Maintains structure parity with French translations from Phase 1
- Ready for Phase 2 English translations expansion

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

## 📋 Commit 2: Add English Translations (Form, Article, Search, Error)

**Files**: `messages/en.json` (continued)
**Estimated Duration**: 60-85 minutes

### Implementation Tasks

- [ ] Expand `messages/en.json` with `form` namespace:
  - [ ] `submit`: "Submit"
  - [ ] `cancel`: "Cancel"
  - [ ] `save`: "Save"
  - [ ] `delete`: "Delete"
  - [ ] `edit`: "Edit"
  - [ ] `required`: "This field is required"
  - [ ] `invalidEmail`: "Invalid email address"
  - [ ] `emailTaken`: "This email is already registered"
  - [ ] `passwordTooShort`: "Password must be at least 8 characters"
  - [ ] `confirmPassword`: "Confirm password"
  - [ ] `forgotPassword`: "Forgot password?"
  - [ ] `resetPassword`: "Reset password"
  - [ ] `loading`: "Submitting..."
  - [ ] `error`: "An error occurred while submitting the form"
  - [ ] `success`: "Form submitted successfully"
- [ ] Add `article` namespace:
  - [ ] `readingTime`: "{minutes} min read"
  - [ ] `publishedOn`: "Published on {date}"
  - [ ] `updatedOn`: "Updated on {date}"
  - [ ] `category`: "Category"
  - [ ] `tags`: "Tags"
  - [ ] `complexity`: "Complexity"
  - [ ] `tableOfContents`: "Table of Contents"
  - [ ] `readingProgress`: "Reading Progress"
  - [ ] `byAuthor`: "By {author}"
- [ ] Add `complexity` namespace:
  - [ ] `beginner`: "Beginner"
  - [ ] `intermediate`: "Intermediate"
  - [ ] `advanced`: "Advanced"
- [ ] Add `search` namespace:
  - [ ] `placeholder`: "Search articles..."
  - [ ] `noResults`: "No articles found"
  - [ ] `filters`: "Filters"
  - [ ] `clearFilters`: "Clear filters"
  - [ ] `categories`: "Categories"
  - [ ] `complexityLevel`: "Complexity Level"
  - [ ] `readingDuration`: "Reading Duration"
  - [ ] `dateRange`: "Date Range"
  - [ ] `sort`: "Sort by"
  - [ ] `loading`: "Loading results..."
- [ ] Add `error` namespace:
  - [ ] `notFound`: "Page not found"
  - [ ] `serverError`: "Internal server error"
  - [ ] `goHome`: "Go to homepage"
  - [ ] `unauthorized`: "Unauthorized"
  - [ ] `forbidden`: "Forbidden"
  - [ ] `badRequest`: "Bad request"
  - [ ] `conflict`: "Resource conflict"
  - [ ] `timeout`: "Request timeout"
  - [ ] `unavailable`: "Service unavailable"
  - [ ] `unknown`: "An unknown error occurred"

### Validation

```bash
# Check JSON syntax
jq empty messages/en.json

# List all namespaces
jq 'keys | sort' messages/en.json

# Count total keys
jq '[.. | objects | keys[]] | unique | length' messages/en.json

# Verify parameterized keys use correct syntax
jq '[.. | strings | select(contains("{"))] | unique' messages/en.json
```

**Expected Result**: Valid JSON with all 5 namespaces, 55-60 total keys

### Review Checklist

#### Structure & Format

- [ ] File is valid JSON (no syntax errors)
- [ ] Previous namespaces (common, nav, footer) are unchanged
- [ ] New namespaces are in alphabetical order
- [ ] 2-space indentation maintained throughout
- [ ] No trailing commas or missing commas

#### Translation Quality

- [ ] Form validation messages are clear and helpful
- [ ] Article metadata uses consistent terminology
- [ ] Search/filter labels are concise and descriptive
- [ ] Error messages are user-friendly (no technical jargon)
- [ ] All `{variable}` placeholders are consistent with French
- [ ] Special characters properly encoded

#### Parity with French

- [ ] All keys exist in `messages/fr.json`
- [ ] Namespace structure identical to French file
- [ ] Same nesting depth for all keys
- [ ] No extra keys in English that don't exist in French

#### Completeness

- [ ] All required namespaces present (form, article, complexity, search, error)
- [ ] All form field labels and validation messages included
- [ ] All article metadata keys present
- [ ] All search and filter labels included
- [ ] All common error messages covered

#### Code Quality

- [ ] No syntax errors
- [ ] Clear formatting and consistent style
- [ ] No commented code or debug statements

### Commit Message

```bash
git add messages/en.json
git commit -m "$(cat <<'EOF'
✨ feat(i18n): add English translations for form, article, search, error namespaces

- Added 30+ English translation keys completing en.json coverage
- Includes form validation messages, article metadata, search filters, error messages
- Brings total English keys to 55-60, matching French translation coverage
- Enables full bilingual UI functionality

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

## 📋 Commit 3: Implement Parity Validation Tests

**Files**: `tests/messages.test.ts` (new or expanded)
**Estimated Duration**: 60-80 minutes

### Implementation Tasks

- [ ] Create or expand `tests/messages.test.ts` test file
- [ ] Import message files (use dynamic require or import)
- [ ] Create `describe` block for "Message Files Validation"
- [ ] Implement test: "French file is valid JSON"
  - [ ] Parse `messages/fr.json`
  - [ ] Assert it's an object with keys
- [ ] Implement test: "English file is valid JSON"
  - [ ] Parse `messages/en.json`
  - [ ] Assert it's an object with keys
- [ ] Implement test: "All French keys exist in English (forward parity)"
  - [ ] Get all keys recursively from French file
  - [ ] For each key path, verify it exists in English file
  - [ ] Provide detailed error messages if missing
- [ ] Implement test: "All English keys exist in French (reverse parity)"
  - [ ] Get all keys recursively from English file
  - [ ] For each key path, verify it exists in French file
  - [ ] Provide detailed error messages if missing
- [ ] Implement test: "Message structure is consistent"
  - [ ] Verify both files have same namespace structure
  - [ ] Verify nesting depth matches
  - [ ] Check no undefined or null values
- [ ] Implement test: "Parameterized translations are valid"
  - [ ] Find all strings with `{variable}` syntax
  - [ ] Verify consistent variable names between languages
  - [ ] Test example substitutions work
- [ ] Create helper function `getNestedKeys()` for deep key extraction
- [ ] Create helper function `getKeyPath()` for error messages

### Validation

```bash
# Run tests
pnpm test messages.test.ts

# Run with verbose output
pnpm test messages.test.ts -- --reporter=verbose

# Run with coverage
pnpm test:coverage tests/messages.test.ts
```

**Expected Result**: All tests pass with no parity issues, >80% coverage for message handling

### Review Checklist

#### Test Coverage

- [ ] Forward parity test covers all French keys
- [ ] Reverse parity test covers all English keys
- [ ] Structure consistency verified
- [ ] Parameterized translations tested
- [ ] Edge cases covered (empty strings, special chars)
- [ ] Error messages are helpful for debugging

#### Test Quality

- [ ] Test names are descriptive
- [ ] Each test has a single responsibility
- [ ] Tests are independent (no ordering dependency)
- [ ] No hardcoded file paths (use relative imports)
- [ ] Helper functions are well-named and documented

#### Code Quality

- [ ] TypeScript types are correct
- [ ] No `any` types (unless justified)
- [ ] Clear variable names
- [ ] Proper error handling in test helpers
- [ ] No console.log statements in production code

#### Coverage

- [ ] All message namespaces tested
- [ ] All key paths validated
- [ ] Parameterized variables verified
- [ ] Coverage > 80% for message module

### Commit Message

```bash
git add tests/messages.test.ts
git commit -m "$(cat <<'EOF'
✅ test(i18n): implement parity validation tests for French-English translation keys

- Added forward parity test: all French keys exist in English
- Added reverse parity test: all English keys exist in French
- Validates key structure consistency and parameterized translations
- Ensures 100% translation coverage before deployment
- Helper functions for deep key extraction and error reporting

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

## 📋 Commit 4: Create Test Page & Documentation

**Files**:

- `app/[locale]/(test)/messages-test/page.tsx` (new)
- `i18n/README.md` (new)
- `CLAUDE.md` (modified)

**Estimated Duration**: 70-100 minutes

### Implementation Tasks

#### Part A: Test Page Component

- [ ] Create directory: `app/[locale]/(test)/messages-test/`
- [ ] Create `app/[locale]/(test)/messages-test/page.tsx` (~200 lines)
- [ ] Import `useTranslations` hook from next-intl
- [ ] Create component to display all namespaces
- [ ] For each namespace:
  - [ ] Display namespace name as heading
  - [ ] Display all keys with their translations
  - [ ] Show both French and English side-by-side
- [ ] For parameterized translations:
  - [ ] Show example with sample values
  - [ ] Example: `readingTime` shows "5 min read"
  - [ ] Example: `publishedOn` shows "Published on November 16, 2025"
  - [ ] Example: `byAuthor` shows "By John Doe"
- [ ] Add visual styling (using Tailwind CSS v4)
- [ ] Add language switcher context if available
- [ ] Add note that this is a development/testing page
- [ ] Optional: Add copy-to-clipboard for key names

#### Part B: i18n/README.md Documentation

- [ ] Create `i18n/README.md` file (~150 lines)
- [ ] Add "Overview" section
  - [ ] Explain purpose of message files
  - [ ] List supported languages (French, English)
  - [ ] Explain namespace structure
- [ ] Add "Namespace Structure" section
  - [ ] List all 8 namespaces with descriptions
  - [ ] Show example key usage
- [ ] Add "Using Translations in Components" section
  - [ ] Show `useTranslations()` hook usage
  - [ ] Show server component usage
  - [ ] Show parameterized translation examples
  - [ ] Show type-safe access patterns
- [ ] Add "Adding New Translation Keys" section
  - [ ] How to add keys to both message files
  - [ ] Importance of maintaining parity
  - [ ] How to verify parity with tests
- [ ] Add "Translation Guidelines" section
  - [ ] Writing natural translations (not literal)
  - [ ] Terminology consistency
  - [ ] Character encoding and special characters
  - [ ] Parameterized translation best practices
- [ ] Add "Key Reference" section
  - [ ] List all translation keys by namespace
  - [ ] Include example values
- [ ] Add "Testing" section
  - [ ] How to run validation tests
  - [ ] Interpreting test results
  - [ ] Debugging parity issues
- [ ] Add "Resources" section
  - [ ] Link to next-intl docs
  - [ ] Link to project config files
  - [ ] Link to message files

#### Part C: Update CLAUDE.md

- [ ] Open `CLAUDE.md`
- [ ] Find "Internationalization (i18n)" section
- [ ] Add/update "Message Files" subsection
  - [ ] Document the 8 namespaces briefly
  - [ ] Note total key count (55-60)
  - [ ] Show import pattern for translations
  - [ ] Note: Phase 1 completed (French), Phase 2 completed (English)
- [ ] Add link to `i18n/README.md`
- [ ] Update any references to message file status
- [ ] Verify all links work

### Validation

```bash
# Check TypeScript compiles
pnpm tsc

# Check linting
pnpm lint

# Verify page renders (if dev server running)
curl http://localhost:3000/fr/messages-test 2>/dev/null | grep -q "html" && echo "✅ Page renders"

# Verify files exist
test -f app/'[locale]'/'(test)'/messages-test/page.tsx && echo "✅ Page created"
test -f i18n/README.md && echo "✅ Docs created"
```

**Expected Result**: All files created, types check, linter passes, page renders

### Review Checklist

#### Test Page

- [ ] Component imports are correct
- [ ] All namespaces are displayed
- [ ] All keys are shown with translations
- [ ] Parameterized translations show example values
- [ ] Both French and English render correctly
- [ ] Page is styled appropriately (readable, professional)
- [ ] No TypeScript errors
- [ ] No console errors when rendering
- [ ] Page is hidden or appropriately scoped (not in production nav)

#### Documentation (i18n/README.md)

- [ ] File covers all required sections
- [ ] Examples are accurate and runnable
- [ ] Links are not broken
- [ ] Formatting is clear and consistent
- [ ] All 8 namespaces documented
- [ ] Usage patterns are clear
- [ ] Testing instructions are complete
- [ ] No broken code examples

#### CLAUDE.md Updates

- [ ] i18n section properly updated
- [ ] Message file structure documented
- [ ] Key count correct (55-60)
- [ ] Import patterns shown
- [ ] Phase 2 completion noted
- [ ] Links are correct
- [ ] No broken references

#### Code Quality

- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Consistent formatting
- [ ] No commented code
- [ ] Clear variable and function names
- [ ] Proper error handling

### Commit Message

```bash
git add app/'[locale]'/'(test)'/messages-test/page.tsx i18n/README.md CLAUDE.md
git commit -m "$(cat <<'EOF'
📚 docs(i18n): create test page and comprehensive translation documentation

- Created /messages-test page for manual translation validation
- Page displays all 8 namespaces with French/English side-by-side
- Shows example values for parameterized translations
- Added i18n/README.md with complete usage documentation
- Updated CLAUDE.md with message file information and import patterns
- Enables developers and reviewers to verify all translations

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

## ✅ Final Phase Validation

After all commits:

### Complete Phase Checklist

- [ ] All 4 commits completed
- [ ] All tests pass (`pnpm test`)
- [ ] TypeScript checks pass (`pnpm tsc`)
- [ ] Linter passes (`pnpm lint`)
- [ ] Dev server starts without errors
- [ ] Test page renders correctly (`localhost:3000/[locale]/messages-test`)
- [ ] All documentation is complete
- [ ] 100% key parity between French and English verified
- [ ] No console warnings about missing translations

### Final Validation Commands

```bash
# Run all tests
pnpm test

# Run linter
pnpm lint

# Type check
pnpm tsc

# Build (if applicable)
pnpm build

# Visual verification
pnpm dev  # Start server and visit /fr/messages-test and /en/messages-test
```

**Phase 2 is complete when all checkboxes are checked! 🎉**

---

## 📝 Tips for Implementation

### For Commit 1 & 2 (Translations)

1. Use the French `messages/fr.json` from Phase 1 as a reference
2. Keep the exact same key names and structure
3. Write natural English (not literal translations)
4. Use terminology from the UI/UX specification
5. Test with a JSON validator: `jq empty messages/en.json`

### For Commit 3 (Tests)

1. Use helper functions to avoid code duplication
2. Make error messages very descriptive (will help with debugging)
3. Test both directions of parity (FR→EN and EN→FR)
4. Include parameterized translation validation
5. Run tests frequently during development

### For Commit 4 (Docs & Page)

1. Keep the test page simple and focused on validation
2. Make documentation examples copy-paste ready
3. Link to next-intl docs for advanced usage
4. Keep i18n/README.md updated as you discover new patterns
5. Verify all links work before committing

---

**Phase 2 implementation ready! Start with Commit 1. 🚀**
