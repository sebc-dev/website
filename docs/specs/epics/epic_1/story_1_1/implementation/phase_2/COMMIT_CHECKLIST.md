# Phase 2 - Checklist per Commit

This document provides a detailed checklist for each atomic commit of Phase 2.

---

## 📋 Commit 1: Create base i18n configuration structure

**Files**: `src/i18n/config.ts` (new)
**Estimated Duration**: 20-30 minutes

### Implementation Tasks

- [ ] Create `src/i18n/` directory
- [ ] Create `config.ts` file
- [ ] Add file header comment explaining purpose
- [ ] Import `getRequestConfig` from `'next-intl/server'`
- [ ] Add placeholder export (to be implemented in Commit 3)
- [ ] Ensure clean file structure and formatting

### Code to Implement

```typescript
// src/i18n/config.ts

/**
 * next-intl configuration for Next.js 15 App Router
 *
 * This file configures internationalization (i18n) for the application
 * using next-intl's Server Components integration pattern.
 *
 * @see https://next-intl-docs.vercel.app/docs/getting-started/app-router
 */

import { getRequestConfig } from 'next-intl/server';

// Configuration will be implemented in subsequent commits
```

### Validation

```bash
# Verify directory and file created
ls -la src/i18n/config.ts

# TypeScript compilation
pnpm tsc --noEmit

# Linter check
pnpm lint src/i18n/config.ts
```

**Expected Result**:

- ✅ File exists at `src/i18n/config.ts`
- ✅ TypeScript recognizes import from `next-intl/server`
- ✅ No compilation errors
- ✅ No linter errors or warnings

### Review Checklist

#### File Structure

- [ ] File created in correct location: `src/i18n/config.ts`
- [ ] Directory structure follows project conventions
- [ ] File has proper UTF-8 encoding

#### Imports

- [ ] `getRequestConfig` imported from `'next-intl/server'`
- [ ] Import statement uses correct syntax
- [ ] No unused imports

#### Documentation

- [ ] File header comment is clear and informative
- [ ] Comment explains purpose of configuration
- [ ] Link to next-intl documentation included

#### Code Quality

- [ ] Consistent formatting (matches project Prettier/Biome config)
- [ ] No commented code
- [ ] Clean and minimal (foundation only)

### Commit Message

```bash
git add src/i18n/config.ts
git commit -m "feat(i18n): create base configuration structure

- Create src/i18n/config.ts with next-intl imports
- Import getRequestConfig from next-intl/server
- Add file header documentation explaining purpose
- Establish foundation for locale configuration

Part of Phase 2 (Configuration) - Commit 1/5
Story 1.1 - Install and configure next-intl"
```

---

## 📋 Commit 2: Define locale types and constants

**Files**: `src/i18n/config.ts` (modified)
**Estimated Duration**: 30-40 minutes

### Implementation Tasks

- [ ] Define `Locale` type as union: `'fr' | 'en'`
- [ ] Define `locales` constant array with `as const` assertion
- [ ] Define `defaultLocale` constant (value: `'fr'`)
- [ ] Add JSDoc documentation for each export
- [ ] Export all locale-related types and constants
- [ ] Ensure type safety (no widening to `string`)

### Code to Implement

```typescript
// Add after imports in src/i18n/config.ts

/**
 * Supported locale codes
 *
 * The application supports French (fr) and English (en).
 */
export type Locale = 'fr' | 'en';

/**
 * Array of all supported locales
 *
 * Used for locale validation and routing configuration.
 */
export const locales = ['fr', 'en'] as const;

/**
 * Default locale for the application
 *
 * French (fr) is the primary language per PRD requirements.
 */
export const defaultLocale: Locale = 'fr';
```

### Validation

```bash
# TypeScript compilation (verify types are correct)
pnpm tsc --noEmit

# Linter check
pnpm lint src/i18n/config.ts

# Manual verification in IDE:
# - Hover over `Locale` type - should show 'fr' | 'en'
# - Hover over `defaultLocale` - should be typed as Locale, not string
# - Typing `const x: Locale = ''` should show autocomplete for 'fr' and 'en'
```

**Expected Result**:

- ✅ TypeScript recognizes `Locale` type
- ✅ `locales` is readonly array (due to `as const`)
- ✅ `defaultLocale` is typed as `Locale` (not widened to `string`)
- ✅ Intellisense/autocomplete works for locale values
- ✅ No compilation errors
- ✅ No linter warnings

### Review Checklist

#### Type Definitions

- [ ] `Locale` type is union type: `'fr' | 'en'`
- [ ] `Locale` is exported for use in other files
- [ ] Type uses string literals (not string enum)

#### Constants

- [ ] `locales` array contains `['fr', 'en']`
- [ ] `locales` uses `as const` assertion for readonly
- [ ] `locales` is exported
- [ ] `defaultLocale` is set to `'fr'`
- [ ] `defaultLocale` is explicitly typed as `Locale`
- [ ] `defaultLocale` is exported

#### Documentation

- [ ] Each export has JSDoc comment
- [ ] JSDoc explains purpose and usage
- [ ] Reference to PRD requirement for French as default

#### Code Quality

- [ ] No type widening (e.g., `defaultLocale` not typed as `string`)
- [ ] Follows TypeScript best practices
- [ ] Const assertions used appropriately
- [ ] Clean formatting

### Commit Message

```bash
git add src/i18n/config.ts
git commit -m "feat(i18n): define locale types and constants

- Add Locale union type: 'fr' | 'en'
- Define locales array with const assertion for type safety
- Set defaultLocale to 'fr' per PRD requirements
- Export all locale types and constants for reuse
- Add comprehensive JSDoc documentation

Part of Phase 2 (Configuration) - Commit 2/5
Story 1.1 - Install and configure next-intl"
```

---

## 📋 Commit 3: Implement getRequestConfig for Server Components

**Files**: `src/i18n/config.ts` (modified)
**Estimated Duration**: 45-60 minutes

### Implementation Tasks

- [ ] Implement `getRequestConfig()` function
- [ ] Add locale parameter with proper typing
- [ ] Validate locale against supported locales
- [ ] Implement dynamic import for message files
- [ ] Add error handling for invalid locales
- [ ] Return configuration object with `messages` property
- [ ] Add comprehensive JSDoc documentation
- [ ] Export as default

### Code to Implement

```typescript
// Add at the end of src/i18n/config.ts

/**
 * next-intl request configuration for Server Components
 *
 * This function is called by next-intl for each request to load
 * the appropriate translations based on the current locale.
 *
 * Message files will be created in Story 1.2 (messages/fr.json, messages/en.json).
 * The dynamic import prepares the structure for those files.
 *
 * @param locale - The current locale (provided by next-intl middleware)
 * @returns Configuration object with messages for the locale
 *
 * @see https://next-intl-docs.vercel.app/docs/usage/configuration#i18n-request
 */
export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale is valid
  if (!locales.includes(locale as Locale)) {
    console.warn(
      `Invalid locale requested: ${locale}. Falling back to ${defaultLocale}.`,
    );
    locale = defaultLocale;
  }

  return {
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

### Validation

```bash
# TypeScript compilation
pnpm tsc --noEmit

# Linter check
pnpm lint src/i18n/config.ts

# Verify import syntax (messages won't exist yet - that's OK)
# TypeScript should accept the dynamic import path as a string template
```

**Expected Result**:

- ✅ `getRequestConfig` is properly typed
- ✅ Dynamic import syntax is correct (no TypeScript errors)
- ✅ Locale validation logic is present
- ✅ Default export works
- ✅ TypeScript compilation passes (even though message files don't exist yet)
- ✅ No linter errors

### Review Checklist

#### Function Implementation

- [ ] `getRequestConfig()` is called with async callback
- [ ] Callback parameter is destructured: `{ locale }`
- [ ] Function is exported as default

#### Locale Validation

- [ ] Locale is validated against `locales` array
- [ ] Invalid locales trigger warning and fallback
- [ ] Fallback uses `defaultLocale`
- [ ] Type assertion `locale as Locale` is used for includes check

#### Dynamic Import

- [ ] Import path is correct: `../../messages/${locale}.json`
- [ ] Import uses template literal syntax correctly
- [ ] `.default` is accessed from import result
- [ ] Path will resolve correctly relative to `src/i18n/config.ts`

#### Return Value

- [ ] Returns object with `messages` property
- [ ] Messages are assigned the imported JSON
- [ ] Return type matches next-intl's expected configuration

#### Documentation

- [ ] JSDoc explains function purpose
- [ ] Documents that message files are created in Story 1.2
- [ ] Includes link to next-intl documentation
- [ ] Parameter and return value documented

#### Error Handling

- [ ] Invalid locale is handled gracefully
- [ ] Warning is logged for debugging
- [ ] Fallback to default locale prevents crashes

#### Code Quality

- [ ] Clean and readable implementation
- [ ] No hardcoded values (uses constants)
- [ ] Follows async/await best practices

### Commit Message

```bash
git add src/i18n/config.ts
git commit -m "feat(i18n): implement getRequestConfig for Server Components

- Implement getRequestConfig with async locale loading
- Add locale validation with fallback to default
- Configure dynamic import for message files
- Prepare structure for Story 1.2 (message files)
- Add comprehensive JSDoc documentation
- Export as default for next-intl integration

Part of Phase 2 (Configuration) - Commit 3/5
Story 1.1 - Install and configure next-intl"
```

---

## 📋 Commit 4: Add TypeScript configuration and type exports

**Files**:

- `src/i18n/types.ts` (new)
- `src/i18n/index.ts` (new)

**Estimated Duration**: 40-50 minutes

### Implementation Tasks

- [ ] Create `types.ts` for i18n type definitions
- [ ] Define `IntlMessages` type (generic structure for messages)
- [ ] Add utility types if needed
- [ ] Create `index.ts` barrel export file
- [ ] Export all public APIs from barrel file
- [ ] Add JSDoc documentation to all exports
- [ ] Verify no circular dependencies

### Code to Implement

**File 1: `src/i18n/types.ts`**

```typescript
/**
 * TypeScript type definitions for i18n system
 *
 * This file contains type definitions for the internationalization
 * infrastructure. These types will be refined when message files
 * are created in Story 1.2.
 */

/**
 * Structure of translation messages
 *
 * This type will be refined in Story 1.2 when actual message
 * structure is defined. For now, it's a generic object type.
 */
export type IntlMessages = Record<string, any>;

/**
 * Locale parameter type for use in components and utilities
 */
export type LocaleParam = {
  locale: string;
};
```

**File 2: `src/i18n/index.ts`**

```typescript
/**
 * i18n module barrel exports
 *
 * This file provides a clean import interface for the i18n system.
 * Import from '@/i18n' instead of specific files.
 */

// Re-export configuration
export { default as i18nConfig } from './config';

// Re-export locale types and constants
export { type Locale, locales, defaultLocale } from './config';

// Re-export type definitions
export type { IntlMessages, LocaleParam } from './types';
```

### Validation

```bash
# TypeScript compilation
pnpm tsc --noEmit

# Verify barrel exports work by attempting import
# (Can test manually in IDE or create temporary test file)

# Linter check
pnpm lint src/i18n/

# Check for circular dependencies (should be none)
```

**Expected Result**:

- ✅ All types properly exported
- ✅ Barrel export provides clean import path
- ✅ TypeScript recognizes all type definitions
- ✅ No circular dependencies
- ✅ Can import from `@/i18n` or `src/i18n`
- ✅ No compilation errors

### Review Checklist

#### types.ts

- [ ] File created at `src/i18n/types.ts`
- [ ] `IntlMessages` type defined (generic/placeholder is OK)
- [ ] `LocaleParam` utility type defined
- [ ] All types exported
- [ ] JSDoc documentation on all exports
- [ ] Documentation notes refinement in Story 1.2

#### index.ts

- [ ] File created at `src/i18n/index.ts`
- [ ] Default config exported as named export `i18nConfig`
- [ ] `Locale` type re-exported with `type` keyword
- [ ] `locales` and `defaultLocale` constants re-exported
- [ ] Types from `types.ts` re-exported
- [ ] JSDoc documentation explaining barrel pattern

#### Code Quality

- [ ] No circular dependencies
- [ ] Clean export organization
- [ ] Follows project conventions for barrel exports
- [ ] Type-only exports use `type` keyword (e.g., `export type { ... }`)

#### Integration

- [ ] Can import from `@/i18n` in other files
- [ ] Imports provide proper TypeScript types
- [ ] No import errors in IDE

### Commit Message

```bash
git add src/i18n/types.ts src/i18n/index.ts
git commit -m "feat(i18n): add TypeScript configuration and barrel exports

- Create types.ts with IntlMessages and utility types
- Define type structure (to be refined in Story 1.2)
- Create index.ts barrel export for clean imports
- Re-export all public APIs (config, types, constants)
- Enable importing from '@/i18n' instead of specific files
- Add comprehensive documentation

Part of Phase 2 (Configuration) - Commit 4/5
Story 1.1 - Install and configure next-intl"
```

---

## 📋 Commit 5: Validate configuration and add documentation

**Files**:

- `src/i18n/README.md` (new)
- `CLAUDE.md` (modified)

**Estimated Duration**: 45-60 minutes

### Implementation Tasks

- [ ] Create `README.md` in `src/i18n/` directory
- [ ] Document configuration structure and purpose
- [ ] Explain supported locales and default
- [ ] Provide usage examples
- [ ] Document next steps (Story 1.2, Story 1.3)
- [ ] Update `CLAUDE.md` with i18n setup notes
- [ ] Add reference to i18n configuration location
- [ ] Test dev server startup to ensure no errors

### Code to Implement

**File 1: `src/i18n/README.md`**

```markdown
# i18n Configuration

This directory contains the internationalization (i18n) configuration for the application using **next-intl** with Next.js 15 App Router.

## 📁 Structure

\`\`\`
src/i18n/
├── config.ts # next-intl request configuration
├── types.ts # TypeScript type definitions
├── index.ts # Barrel exports
└── README.md # This file
\`\`\`

## 🌍 Supported Locales

- **French (fr)** - Default locale
- **English (en)**

The default locale is French (`fr`) as specified in the PRD requirements.

## 🔧 Configuration

### Locale Types and Constants

\`\`\`typescript
import { type Locale, locales, defaultLocale } from '@/i18n';

// Locale type: 'fr' | 'en'
const currentLocale: Locale = 'fr';

// All supported locales
console.log(locales); // ['fr', 'en']

// Default locale
console.log(defaultLocale); // 'fr'
\`\`\`

### Request Configuration

The `config.ts` file exports a `getRequestConfig` function that next-intl uses to load translations for each request:

\`\`\`typescript
// This is handled automatically by next-intl
// You don't need to call this directly
\`\`\`

## 📝 Message Files

Message files will be created in **Story 1.2** at:

\`\`\`
messages/
├── fr.json # French translations
└── en.json # English translations
\`\`\`

The configuration is already set up to dynamically import these files based on the current locale.

## 🚀 Usage

### In Server Components

\`\`\`typescript
import { useTranslations } from 'next-intl';

export default function MyPage() {
const t = useTranslations();

return <h1>{t('welcome')}</h1>;
}
\`\`\`

### In Client Components

\`\`\`typescript
'use client';

import { useTranslations } from 'next-intl';

export default function MyClientComponent() {
const t = useTranslations();

return <p>{t('description')}</p>;
}
\`\`\`

## 📋 Next Steps

1. **Story 1.2**: Create message files (`messages/fr.json`, `messages/en.json`)
2. **Story 1.3**: Implement middleware for locale detection and routing
3. **Story 1.4**: Configure bilingual URL structure (`/fr/*`, `/en/*`)

## 🔗 Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js 15 i18n Guide](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [Project PRD](../../../docs/specs/PRD.md) - Epic 1: Internationalisation

---

**Configuration Status**: ✅ Complete (Phase 2)
**Ready for**: Story 1.2 (Message Files), Story 1.3 (Middleware)
```

**File 2: Update `CLAUDE.md`**

Add this section after the "### Internationalization" section (or create it if it doesn't exist):

```markdown
### Internationalization (i18n)

- **Library**: next-intl v4.5.3 (supports Next.js 15 + edge runtime)
- **Configuration**: `src/i18n/` directory
  - `config.ts` - Request configuration for Server Components
  - `types.ts` - TypeScript type definitions
  - `index.ts` - Barrel exports for clean imports
- **Supported Locales**: French (fr) - default, English (en)
- **Message Files**: `messages/fr.json`, `messages/en.json` (Story 1.2)
- **Import Pattern**: Use `import { ... } from '@/i18n'` for clean imports
- **Documentation**: See `src/i18n/README.md` for usage and examples

**Current Status**: Phase 2 complete (configuration), Story 1.2 (message files) in progress
```

### Validation

```bash
# Verify documentation files created
ls -la src/i18n/README.md
cat src/i18n/README.md

# Verify CLAUDE.md updated
grep -A 10 "Internationalization" CLAUDE.md

# Final TypeScript check
pnpm tsc --noEmit

# Final linter check
pnpm lint

# TEST DEV SERVER STARTUP (critical validation)
pnpm dev
# Server should start without errors
# Look for no i18n-related errors in console
# Press Ctrl+C to stop after verifying
```

**Expected Result**:

- ✅ README.md is comprehensive and clear
- ✅ CLAUDE.md references i18n configuration
- ✅ All TypeScript validations pass
- ✅ Dev server starts successfully without errors
- ✅ No warnings or errors in console related to i18n
- ✅ Documentation explains usage and next steps

### Review Checklist

#### src/i18n/README.md

- [ ] File created and properly formatted (Markdown)
- [ ] Documents directory structure
- [ ] Lists supported locales (fr, en)
- [ ] Explains default locale (fr)
- [ ] Provides usage examples (Server and Client Components)
- [ ] Documents next steps (Story 1.2, 1.3, 1.4)
- [ ] Includes links to next-intl documentation
- [ ] Mentions message files location and structure
- [ ] Clear and helpful for developers

#### CLAUDE.md Update

- [ ] i18n section added or updated
- [ ] Lists next-intl version (4.5.3)
- [ ] Documents configuration file locations
- [ ] Lists supported locales
- [ ] Explains import pattern
- [ ] References README for details
- [ ] Current status updated

#### Final Validation

- [ ] TypeScript compilation passes (`pnpm tsc --noEmit`)
- [ ] Linter passes (`pnpm lint`)
- [ ] Dev server starts without errors (`pnpm dev`)
- [ ] No console warnings or errors related to i18n
- [ ] Configuration is ready for Story 1.2

#### Code Quality

- [ ] Markdown formatting is correct
- [ ] Code examples are accurate
- [ ] Links work correctly
- [ ] No broken references

### Commit Message

```bash
git add src/i18n/README.md CLAUDE.md
git commit -m "docs(i18n): add configuration documentation

- Create comprehensive README.md in src/i18n/
- Document configuration structure and usage
- Provide examples for Server and Client Components
- Explain supported locales and defaults
- Document next steps (Story 1.2, 1.3)
- Update CLAUDE.md with i18n setup reference
- Validate dev server startup (successful)

Part of Phase 2 (Configuration) - Commit 5/5
Story 1.1 - Install and configure next-intl"
```

---

## ✅ Final Phase Validation

After all 5 commits:

### Complete Phase Checklist

- [ ] All 5 commits completed in order
- [ ] All files created/modified as specified
- [ ] TypeScript compilation passes
- [ ] ESLint passes
- [ ] Dev server starts without errors
- [ ] Configuration is ready for Story 1.2 (message files)
- [ ] Documentation is complete and helpful
- [ ] VALIDATION_CHECKLIST.md completed

### Final Validation Commands

```bash
# TypeScript type checking
pnpm tsc --noEmit

# Linter
pnpm lint

# Dev server test
pnpm dev
# Should start without errors - Ctrl+C to stop

# Verify all files created
ls -la src/i18n/
# Should show: config.ts, types.ts, index.ts, README.md

# Check git history
git log --oneline -5
# Should show 5 commits for Phase 2
```

**Expected Results**:

- ✅ All validations pass
- ✅ 4 files created in `src/i18n/` (config.ts, types.ts, index.ts, README.md)
- ✅ CLAUDE.md updated
- ✅ Dev server runs without errors
- ✅ TypeScript recognizes all types and imports
- ✅ Ready for Story 1.2 (message files)

### Phase Completion Criteria

- [ ] All acceptance criteria from PHASES_PLAN.md met
- [ ] Configuration file created with supported locales
- [ ] TypeScript types defined and exported
- [ ] `getRequestConfig()` implemented
- [ ] Documentation complete
- [ ] No runtime errors
- [ ] Ready for next phase (Phase 3: Integration Validation)
- [ ] Ready for Story 1.2 (Create message files)

**Phase 2 is complete when all checkboxes are checked! 🎉**

---

## 📊 Summary

| Metric            | Target    | Status         |
| ----------------- | --------- | -------------- |
| Commits           | 5         | ⏳ In Progress |
| Files Created     | 4         | ⏳ In Progress |
| TypeScript Errors | 0         | ⏳ Pending     |
| Linter Errors     | 0         | ⏳ Pending     |
| Dev Server        | Starts OK | ⏳ Pending     |
| Documentation     | Complete  | ⏳ Pending     |

**Once all commits are done and validations pass, proceed to VALIDATION_CHECKLIST.md for final sign-off!**
