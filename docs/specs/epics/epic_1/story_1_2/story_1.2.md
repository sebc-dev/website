# Story 1.2 - Create Message Files

**Epic**: Epic 1 - Internationalisation (i18n)
**Story ID**: 1.2
**Created**: 2025-11-16
**Status**: 📋 PLANNING

---

## 📖 Story Overview

### Original Story from PRD

**Epic Reference**: Epic 1 - Internationalisation (i18n)
**PRD Location**: `docs/specs/PRD.md` (Epic 1, Story 1.2, line 642)

### Story Description

Create translation message files (`messages/fr.json` and `messages/en.json`) that will be used by next-intl to provide bilingual UI translations throughout the application. These files will contain all user-facing text translations for the interface, excluding article content which is stored in the database.

### Story Objective

Establish the foundation for bilingual UI by creating structured message files that support French (default) and English translations for all interface elements, navigation, forms, error messages, and UI components.

### Acceptance Criteria

**From PRD**:

- **CA1**: Message files `messages/fr.json` and `messages/en.json` exist in the project root
- **CA2**: Files contain translations for all UI elements currently in the application
- **CA3**: Files follow next-intl's namespace and key structure conventions
- **CA4**: The configuration in `i18n/config.ts` successfully loads both message files

**Additional Technical Criteria**:

- **CA5**: Message files are properly formatted JSON with consistent structure
- **CA6**: Translation keys use semantic naming (e.g., `nav.home`, `form.submit`, `error.required`)
- **CA7**: All translation keys exist in both languages (no missing translations)
- **CA8**: TypeScript types are generated or configured for type-safe translation access

### User Value

Users can interact with the website interface in their preferred language (French or English), with all UI text, buttons, navigation, forms, and error messages displayed in a consistent, professionally translated format. This improves accessibility for international audiences and demonstrates the bilingual nature of the blog.

---

## 🎯 Business Context

### Why This Story Matters

Translation files are the **foundation of the bilingual UI**. Without them:

- The UI cannot be localized
- Users are forced to use a single language
- The project cannot meet its bilingual objectives
- Story 1.4 (URL structure), 1.5 (fallback), and 1.7 (language selector) cannot function

This story is a **critical dependency** for all subsequent i18n stories.

### Dependencies

**Depends On**:

- Story 1.1 (next-intl installation and configuration) - **COMPLETED**
  - next-intl library installed (`next-intl@4.5.3`)
  - Configuration in `i18n/config.ts` set up to load message files
  - Locale types and constants defined in `i18n/types.ts`

**Blocks**:

- Story 1.4 (Bilingual URL structure) - needs translations for route metadata
- Story 1.5 (Content fallback) - needs translations for language badges and UI
- Story 1.7 (Language selector) - needs translations for selector labels and tooltips

**External Dependencies**:

- None (self-contained, only requires file creation)

---

## 📋 Technical Requirements

### Message File Structure

The message files should follow a **hierarchical namespace structure**:

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

### Translation Scope for V1

Based on current project state (Epic 1 in progress), we need translations for:

1. **Common UI elements**: app name, loading states, generic actions
2. **Navigation**: header, footer, main menu
3. **Article metadata**: reading time, dates, categories, tags, complexity
4. **Search and filters**: search bar, filter labels, empty states
5. **Forms**: common form actions, validation messages
6. **Errors**: 404, 500, generic error messages

**Note**: Admin panel translations can be added later (Story 1.2 focuses on public-facing UI)

### TypeScript Integration

Since next-intl v3+, TypeScript types can be auto-generated. We should:

1. Configure next-intl to use type-safe translations
2. Export types from `i18n/types.ts` or use next-intl's built-in typing
3. Ensure IDE autocomplete works for translation keys

---

## 🧪 Testing Requirements

### Validation Checklist

- [ ] Both `messages/fr.json` and `messages/en.json` files exist
- [ ] Files are valid JSON (no syntax errors)
- [ ] All keys in `fr.json` exist in `en.json` (parity check)
- [ ] All keys in `en.json` exist in `fr.json` (reverse parity check)
- [ ] Translation strings contain no hardcoded language-specific text (e.g., no "Article" in keys)
- [ ] Parameterized translations use correct next-intl syntax (`{variable}`)
- [ ] Files are UTF-8 encoded
- [ ] Configuration in `i18n/config.ts` successfully imports both files

### Manual Testing

1. Create a test page that displays translations from all namespaces
2. Verify French translations render correctly
3. Verify English translations render correctly
4. Verify parameterized translations (e.g., `readingTime`) work with variables
5. Verify no missing translation warnings in console

### Automated Testing

- Unit test to load and parse both JSON files
- Unit test to verify key parity between languages
- Unit test to verify all required namespaces exist

---

## 📚 Reference Documents

### PRD Requirements

- **Epic 1**: Lines 639-647 (Internationalisation)
- **EF19**: Lines 202-211 (Internationalisation UI)
- **Story 1.2**: Line 642

### Related Documentation

- **next-intl documentation**: https://next-intl.dev/docs/usage/messages
- **i18n configuration**: `i18n/config.ts`
- **Locale types**: `i18n/types.ts`
- **Story 1.1 spec**: `docs/specs/epics/epic_1/story_1_1/story_1.1.md`

### Design References

- **Brief**: `docs/specs/Brief.md` - Project context and target users
- **UX/UI Spec**: `docs/specs/UX_UI_Spec.md` - Design guidelines for UI text

---

## 🚀 Implementation Notes

### Initial Scope

**V1 Message Keys** (estimated ~50-80 translation keys total):

- Common: ~10 keys
- Navigation: ~10 keys
- Footer: ~5 keys
- Forms: ~15 keys
- Article metadata: ~15 keys
- Search/filters: ~15 keys
- Errors: ~10 keys
- Complexity levels: 3 keys

**Deferred to Later Stories**:

- Admin panel translations (can be added incrementally)
- Newsletter translations (Post-V1)
- Comment system translations (Post-V1)
- Wiki translations (Post-V1)

### Translation Quality Standards

- **French (default)**: Native, natural, professional tone
- **English**: Clear, concise, American English
- **Consistency**: Use same terminology across all translations
- **Tone**: Professional but approachable (matches blog's "learning in public" philosophy)

### File Management

- Store in `/messages` directory (project root)
- Use consistent formatting (2-space indentation)
- Keep alphabetically sorted within namespaces (for maintainability)
- Add comments in JSON if needed (though JSON doesn't support comments natively, consider a `.js` export if needed)

---

## 📊 Success Metrics

### Story Completion Criteria

This story is considered complete when:

- [ ] `messages/fr.json` file created with all required namespaces
- [ ] `messages/en.json` file created with all required namespaces
- [ ] Both files contain complete, accurate translations
- [ ] Key parity verified (no missing translations)
- [ ] Configuration in `i18n/config.ts` successfully loads messages
- [ ] Test page or component successfully displays translations from both files
- [ ] No console errors or warnings related to missing translations
- [ ] Documentation updated (CLAUDE.md, i18n/README.md)

### Quality Metrics

| Metric                     | Target | Notes                                      |
| -------------------------- | ------ | ------------------------------------------ |
| Translation key count      | 50-80  | Covers V1 public UI                        |
| Key parity                 | 100%   | All keys exist in both languages           |
| JSON validity              | 100%   | No syntax errors                           |
| Type safety                | 100%   | TypeScript autocomplete for keys           |
| Missing translation errors | 0      | No runtime warnings about missing keys     |
| File encoding              | UTF-8  | Proper character encoding for accents, etc |

---

**Story Created**: 2025-11-16
**Created by**: Claude Code (story-phase-planner skill)
**Epic**: Epic 1 - Internationalisation (i18n)
**Status**: 📋 PLANNING
