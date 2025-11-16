# Story 1.2 - Create Message Files: Implementation Phases Plan

**Epic**: Epic 1 - Internationalisation (i18n)
**Story**: 1.2 - Create Message Files
**Created**: 2025-11-16
**Status**: 📋 PLANNING

---

## 📖 Phase Overview

Story 1.2 focuses on creating translation message files (`messages/fr.json` and `messages/en.json`) that serve as the foundation for the bilingual UI. This involves breaking the work into logical, independently implementable phases.

---

## 🎯 Phase Architecture

Based on the story requirements, implementation is divided into **2 phases**:

### Phase 1: Message File Structure & French Translations
**Objective**: Create the message file structure and implement complete French translations

**Scope**:
- Design and implement hierarchical namespace structure for messages
- Create `messages/fr.json` with all required translation keys
- Ensure proper JSON formatting and UTF-8 encoding
- Create utility or integration for loading messages in configuration
- Write unit tests for message file validation

**Files to Create/Modify**:
- `messages/fr.json` (new) - French translations (~50-80 keys)
- `messages/en.json` (new) - English translations (initial structure)
- `i18n/config.ts` (modify) - Update to load message files
- `tests/messages.test.ts` (new) - Message validation tests

**Dependencies**:
- Story 1.1 completion (next-intl configuration)
- No external package dependencies
- Project structure established

**Tests Required**:
- JSON validation (parsing, UTF-8 encoding)
- Key structure validation
- Namespace completeness
- Basic type safety if using TypeScript

**Validation Criteria**:
- ✅ `messages/fr.json` exists with all required namespaces
- ✅ Valid JSON with no syntax errors
- ✅ French translations are complete and natural
- ✅ Configuration loads messages without errors
- ✅ Tests pass (>80% coverage for message handling)

---

### Phase 2: English Translations & Parity Validation
**Objective**: Complete English translations and ensure parity between languages

**Scope**:
- Create `messages/en.json` with complete English translations
- Implement parity validation (all keys exist in both languages)
- Create type-safe translation access (TypeScript support)
- Create comprehensive test page for manual validation
- Document translation keys and update project docs

**Files to Create/Modify**:
- `messages/en.json` (complete) - English translations
- `tests/messages.test.ts` (expand) - Parity validation tests
- `tests/messages.page.tsx` (new) - Test page for manual verification
- `i18n/README.md` (new) - Translation documentation
- `CLAUDE.md` (modify) - Update project context with message file info

**Dependencies**:
- Phase 1 completion (French translations in place)
- Message structure established

**Tests Required**:
- Parity validation (all keys in fr.json exist in en.json)
- Reverse parity (all keys in en.json exist in fr.json)
- Parameterized translation validation
- Type generation validation (if applicable)

**Validation Criteria**:
- ✅ `messages/en.json` exists with all required keys
- ✅ 100% key parity between languages
- ✅ All parameterized translations work correctly
- ✅ TypeScript types available for translation access
- ✅ Manual test page displays both languages correctly
- ✅ No console warnings about missing translations
- ✅ Documentation updated

---

## 📊 Phase Dependencies

```
Phase 1: Message File Structure & French Translations
    ↓ (depends on completion)
Phase 2: English Translations & Parity Validation
```

**External Dependencies**:
- Story 1.1 (i18n configuration) - COMPLETED ✅

---

## 🧪 Overall Testing Strategy

### Unit Tests
- Message file JSON validation
- Key structure validation
- Namespace completeness
- Type safety for translation keys

### Manual Testing
- Test page displaying all translation keys and values
- Language switching validation
- Parameterized translation testing (e.g., `{minutes} min read`)
- Visual inspection of translation quality

### Integration Testing
- Configuration loading messages correctly
- No missing translation warnings
- Type-safe access from components

---

## 📝 Message Namespaces (V1 Scope)

The message files will be organized into the following namespaces:

```json
{
  "common": {
    "appName": "sebc.dev",
    "loading": "Loading...",
    "error": "An error occurred",
    "close": "Close"
  },
  "nav": {
    "home": "Home",
    "articles": "Articles",
    "search": "Search",
    "about": "About"
  },
  "footer": {
    "copyright": "© 2025 sebc.dev. All rights reserved.",
    "privacy": "Privacy Policy",
    "terms": "Terms of Service"
  },
  "form": {
    "submit": "Submit",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "required": "This field is required",
    "invalidEmail": "Invalid email address"
  },
  "article": {
    "readingTime": "{minutes} min read",
    "publishedOn": "Published on {date}",
    "updatedOn": "Updated on {date}",
    "category": "Category",
    "tags": "Tags",
    "complexity": "Complexity",
    "tableOfContents": "Table of Contents",
    "readingProgress": "Reading Progress"
  },
  "complexity": {
    "beginner": "Beginner",
    "intermediate": "Intermediate",
    "advanced": "Advanced"
  },
  "search": {
    "placeholder": "Search articles...",
    "noResults": "No articles found",
    "filters": "Filters",
    "clearFilters": "Clear filters",
    "categories": "Categories",
    "complexityLevel": "Complexity Level",
    "readingDuration": "Reading Duration",
    "dateRange": "Date Range"
  },
  "error": {
    "notFound": "Page not found",
    "serverError": "Internal server error",
    "goHome": "Go to homepage"
  }
}
```

**Estimated Total Keys**: 50-80 keys per language
**Deferred to Later Stories**:
- Admin panel translations
- Newsletter translations
- Comment system translations

---

## 🚀 Success Criteria for Story Completion

All phases complete when:

- [ ] `messages/fr.json` created with all required namespaces
- [ ] `messages/en.json` created with all required namespaces
- [ ] Both files contain complete, accurate translations
- [ ] Key parity verified (100% match between languages)
- [ ] Configuration loads messages without errors
- [ ] Unit tests pass with >80% coverage
- [ ] Manual test page displays all translations correctly
- [ ] No console warnings or errors
- [ ] Documentation updated (i18n/README.md, CLAUDE.md)
- [ ] TypeScript types available for translation access

---

## 📚 Related Documentation

- **Story Specification**: `docs/specs/epics/epic_1/story_1_2/story_1.2.md`
- **Story 1.1 Spec**: `docs/specs/epics/epic_1/story_1_1/story_1.1.md` (completed)
- **Project Configuration**: `i18n/config.ts`
- **Locale Types**: `i18n/types.ts`
- **next-intl Documentation**: https://next-intl.dev/docs/usage/messages

---

**Plan Created**: 2025-11-16
**Status**: 📋 READY FOR PHASE DOCUMENTATION
