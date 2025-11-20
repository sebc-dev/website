# Internationalization (i18n) - Message Files Reference

This document provides comprehensive guidance for using translation messages in the sebc.dev application.

## Overview

The application supports bilingual content with automatic message file loading:

- **French (fr)** - Default locale
- **English (en)** - Secondary locale

Translation messages are organized in `messages/fr.json` and `messages/en.json`, structured into 8 semantic namespaces with 73 translation keys total.

## Namespace Structure

### 1. Common Messages (`common`)

UI actions, status messages, and common terminology used throughout the application.

**Keys** (12 total):

- `appName` - Application name: "sebc.dev"
- `loading` - Loading indicator: "Loading..." / "Chargement..."
- `error` - Generic error message
- `close` - Close action button
- `success` - Success confirmation message
- `warning` - Warning status message
- `info` - Informational message
- `cancel` - Cancel action button
- `apply` - Apply action button
- `retry` - Retry action button
- `confirm` - Confirm action button
- `noData` - No data available message

**Example Usage:**

```typescript
import { useTranslations } from 'next-intl';

export function LoadingIndicator() {
  const t = useTranslations('common');
  return <div>{t('loading')}</div>;
}
```

### 2. Navigation (`nav`)

Navigation menu items and language selection controls.

**Keys** (9 total):

- `home` - Home link
- `articles` - Articles section
- `search` - Search functionality
- `about` - About page
- `projects` - Projects section
- `blog` - Blog section
- `documentation` - Documentation
- `contact` - Contact page
- `language` - Language selector

**Example Usage:**

```typescript
const tNav = useTranslations('nav');

const navItems = [
  { label: tNav('home'), href: '/' },
  { label: tNav('articles'), href: '/articles' },
  { label: tNav('about'), href: '/about' },
];
```

### 3. Footer (`footer`)

Footer links, copyright information, and site navigation.

**Keys** (5 total):

- `copyright` - Copyright notice: "© 2025 sebc.dev. All rights reserved."
- `privacy` - Privacy Policy link
- `terms` - Terms of Service link
- `contact` - Contact footer link
- `sitemap` - Sitemap link

**Example Usage:**

```typescript
const tFooter = useTranslations('footer');

export function Footer() {
  return (
    <footer>
      <p>{tFooter('copyright')}</p>
      <nav>
        <a href="/privacy">{tFooter('privacy')}</a>
        <a href="/terms">{tFooter('terms')}</a>
      </nav>
    </footer>
  );
}
```

### 4. Form Messages (`form`)

Form labels, validation messages, and submission feedback.

**Keys** (15 total):

- `submit` - Form submit button
- `cancel` - Cancel form submission
- `save` - Save form data
- `delete` - Delete confirmation
- `edit` - Edit action
- `required` - Required field message
- `invalidEmail` - Email validation error
- `emailTaken` - Email already registered error
- `passwordTooShort` - Password length validation error
- `confirmPassword` - Confirm password field label
- `forgotPassword` - Forgot password link
- `resetPassword` - Password reset action
- `loading` - Form submission loading state: "Submitting..."
- `error` - Form submission error
- `success` - Form submission success message

**Example Usage:**

```typescript
const tForm = useTranslations('form');

function ContactForm() {
  return (
    <form>
      <input placeholder={tForm('required')} />
      <button type="submit">{tForm('submit')}</button>
    </form>
  );
}
```

### 5. Article Metadata (`article`)

Article headers, reading information, and metadata labels.

**Keys** (9 total):

- `readingTime` - Estimated reading duration (parameterized): "{minutes} min read"
- `publishedOn` - Publication date (parameterized): "Published on {date}"
- `updatedOn` - Last update date (parameterized): "Updated on {date}"
- `category` - Article category label
- `tags` - Article tags label
- `complexity` - Difficulty level label
- `tableOfContents` - Table of contents heading
- `readingProgress` - Reading progress indicator
- `byAuthor` - Author attribution (parameterized): "By {author}"

**Parameterized Translations:**
These keys contain `{variable}` placeholders that are replaced at runtime.

```typescript
const tArticle = useTranslations('article');

// Example with reading time
const readingTime = tArticle('readingTime', { minutes: 5 });
// Output: "5 min read" (EN) / "5 min de lecture" (FR)

// Example with publication date
const published = tArticle('publishedOn', { date: 'November 16, 2025' });
// Output: "Published on November 16, 2025"

// Example with author name
const byline = tArticle('byAuthor', { author: 'Jane Doe' });
// Output: "By Jane Doe"
```

### 6. Complexity Levels (`complexity`)

Article difficulty and complexity level labels.

**Keys** (3 total):

- `beginner` - Beginner level
- `intermediate` - Intermediate level
- `advanced` - Advanced level

**Example Usage:**

```typescript
const tComplexity = useTranslations('complexity');

const complexityLevels = [
  { value: 'beginner', label: tComplexity('beginner') },
  { value: 'intermediate', label: tComplexity('intermediate') },
  { value: 'advanced', label: tComplexity('advanced') },
];
```

### 7. Search & Filters (`search`)

Search interface, filter controls, and result messages.

**Keys** (10 total):

- `placeholder` - Search input placeholder: "Search articles..."
- `noResults` - No search results found
- `filters` - Filters section heading
- `clearFilters` - Clear all filters action
- `categories` - Filter by category
- `complexityLevel` - Filter by difficulty
- `readingDuration` - Filter by reading time
- `dateRange` - Filter by date range
- `sort` - Sort options label
- `loading` - Search loading state: "Loading results..."

**Example Usage:**

```typescript
const tSearch = useTranslations('search');

function SearchBar() {
  return (
    <input
      type="search"
      placeholder={tSearch('placeholder')}
    />
  );
}

function SearchFilters() {
  return (
    <fieldset>
      <legend>{tSearch('filters')}</legend>
      <label>{tSearch('categories')}</label>
      <label>{tSearch('complexityLevel')}</label>
      <button>{tSearch('clearFilters')}</button>
    </fieldset>
  );
}
```

### 8. Error Messages (`error`)

HTTP error codes and general application error messages.

**Keys** (10 total):

- `notFound` - 404 Page Not Found
- `serverError` - 500 Internal Server Error
- `goHome` - Return to homepage link
- `unauthorized` - 401 Unauthorized
- `forbidden` - 403 Forbidden
- `badRequest` - 400 Bad Request
- `conflict` - 409 Resource Conflict
- `timeout` - Request Timeout
- `unavailable` - 503 Service Unavailable
- `unknown` - Unknown/generic error

**Example Usage:**

```typescript
const tError = useTranslations('error');

function ErrorPage({ statusCode }) {
  const errorMessage = {
    404: tError('notFound'),
    500: tError('serverError'),
    401: tError('unauthorized'),
  }[statusCode] || tError('unknown');

  return (
    <div>
      <h1>{statusCode}</h1>
      <p>{errorMessage}</p>
      <a href="/">{tError('goHome')}</a>
    </div>
  );
}
```

## Using Translations in Components

### Server Components (Default)

```typescript
import { useTranslations } from 'next-intl';

export function MyServerComponent() {
  const t = useTranslations('common');

  return <div>{t('appName')}</div>;
}
```

### Client Components

```typescript
'use client';

import { useTranslations } from 'next-intl';

export function MyClientComponent() {
  const t = useTranslations('form');

  return <button>{t('submit')}</button>;
}
```

### Multiple Namespaces in One Component

```typescript
import { useTranslations } from 'next-intl';

export function ArticleHeader() {
  const tArticle = useTranslations('article');
  const tCommon = useTranslations('common');

  return (
    <header>
      <h1>{tArticle('tableOfContents')}</h1>
      {/* Loading state */}
      <p>{tCommon('loading')}</p>
    </header>
  );
}
```

### Type-Safe Translation Access

The `useTranslations` hook is fully typed and provides IDE autocomplete:

```typescript
const t = useTranslations('article');

// ✅ Correct - IDE autocomplete available
t('readingTime');
t('publishedOn');

// ❌ Incorrect - TypeScript error
t('nonexistent');
```

### Parameterized Translations

For keys containing `{variable}` placeholders:

```typescript
const tArticle = useTranslations('article');

// Pass parameters as second argument
const timeEstimate = tArticle('readingTime', { minutes: 8 });
const publishDate = tArticle('publishedOn', {
  date: new Date('2025-11-16').toLocaleDateString(),
});
const author = tArticle('byAuthor', { author: 'Claude Dupont' });
```

## Adding New Translation Keys

Follow these steps to maintain translation parity:

### 1. Update Message Files

Edit both `messages/fr.json` and `messages/en.json`:

```json
{
  "namespace": {
    "newKey": "Value in language",
    "parameterizedKey": "Text with {variable} placeholder"
  }
}
```

### 2. Maintain Parity

- **Same structure** - Both files must have identical key paths
- **Same depth** - Nesting levels must match exactly
- **Same parameters** - Variable names must be identical
- **Semantically equivalent** - Translations should convey same meaning

### 3. Run Validation Tests

The parity tests ensure no keys are missing or mismatched:

```bash
# Run translation validation tests
pnpm test messages.test.ts

# Check specific namespace
pnpm test messages.test.ts -t "common"

# Run with coverage
pnpm test:coverage tests/messages.test.ts
```

### 4. Verify Examples

For parameterized translations, test with example values:

```typescript
const tArticle = useTranslations('article');

// Verify the output looks correct
console.log(tArticle('readingTime', { minutes: '10' }));
// Expected: "10 min read" (EN) / "10 min de lecture" (FR)
```

## Translation Guidelines

### Writing Natural Translations

- **Not literal** - Avoid word-for-word translations
- **Context-aware** - Consider the UI context where text appears
- **User-friendly** - Use language that users understand

Examples:

```json
// ❌ Literal translation (avoid)
"forgotPassword": "Did you forget password"

// ✅ Natural translation (use)
"forgotPassword": "Forgot password?"
```

### Terminology Consistency

Use consistent terminology across all translations. Create a terminology glossary:

| English           | French             |
| ----------------- | ------------------ |
| Article           | Article            |
| Complexity        | Complexité         |
| Reading Time      | Durée de lecture   |
| Table of Contents | Table des matières |

### Character Encoding

Both JSON files use UTF-8 encoding. All special characters are preserved:

```json
{
  "common": {
    "copyright": "© 2025 sebc.dev. All rights reserved.",
    "frenchCopyright": "© 2025 sebc.dev. Tous droits réservés."
  }
}
```

### Parameterized Translation Best Practices

```typescript
// ✅ Good - Clear, predictable variable names
{
  "readingTime": "{minutes} min read",
  "publishedOn": "Published on {date}",
  "byAuthor": "By {author}"
}

// ❌ Avoid - Ambiguous or inconsistent names
{
  "readingTime": "{t} min read",  // Too abbreviated
  "publishedOn": "Published on {d}",  // Inconsistent with 't'
  "byAuthor": "By {name}"  // Different from other author references
}
```

## Testing Translations

### Running Tests

```bash
# Run all translation tests
pnpm test messages.test.ts

# Run in watch mode
pnpm test:watch messages.test.ts

# Generate coverage report
pnpm test:coverage tests/messages.test.ts
```

### Test Coverage

The test suite validates:

1. **JSON Syntax** - Both files are valid JSON
2. **Forward Parity** - All French keys exist in English
3. **Reverse Parity** - All English keys exist in French
4. **Structure Consistency** - Identical nesting depth
5. **Parameterized Translations** - Valid variable syntax
6. **No Missing Keys** - Complete coverage of both files

### Debugging Parity Issues

If tests fail with missing keys:

```bash
# Get detailed error output
pnpm test messages.test.ts -- --reporter=verbose

# Check specific namespace
pnpm test messages.test.ts -t "Forward parity.*common"

# Validate JSON syntax
jq empty messages/fr.json && echo "✅ FR valid"
jq empty messages/en.json && echo "✅ EN valid"
```

## Development Testing Page

A visual translation testing page is available at:

```
http://localhost:3000/[locale]/messages-test
```

This page displays:

- All 8 namespaces side-by-side
- French and English translations in columns
- Parameterized examples with sample values
- Copy-to-clipboard for key names
- Total key count and namespace information

**Note:** This page is only for development/testing and is not included in production navigation.

## File Locations

```
project/
├── messages/
│   ├── fr.json          # French translations (73 keys, 8 namespaces)
│   └── en.json          # English translations (73 keys, 8 namespaces)
├── i18n/
│   ├── README.md        # This file
│   ├── config.ts        # next-intl configuration
│   ├── types.ts         # TypeScript type definitions
│   └── index.ts         # Barrel exports
└── tests/
    └── messages.test.ts # Parity validation tests
```

## Performance Considerations

### Message File Loading

- **Lazy loading** - Messages are loaded per-request based on locale
- **Minimal overhead** - Small JSON files (< 5KB each)
- **Edge-ready** - Compatible with Cloudflare Workers and edge runtimes
- **No runtime parsing** - JSON loaded at build time for type safety

### Optimization Tips

1. **Server-side rendering** - Use `useTranslations` in Server Components
2. **Avoid client-side fetching** - Messages are pre-loaded per request
3. **Memoize namespaces** - Store namespace selectors in variables
4. **Batch updates** - Group translations for related UI sections

## Migration Notes

### From Phase 1 to Phase 2

Phase 2 adds complete English translations alongside French:

- French (Phase 1) ✅ Complete - 73 keys in 8 namespaces
- English (Phase 2) ✅ Complete - 73 keys in 8 namespaces
- Parity Testing ✅ Complete - Automated validation

All previous French translations remain unchanged.

## Resources

### Documentation

- [next-intl Documentation](https://next-intl.dev/) - Complete API reference
- [Next.js Internationalization Guide](https://nextjs.org/docs/app/building-your-application/routing/internationalization) - i18n best practices
- [Project Brief](../docs/specs/Brief.md) - sebc.dev project overview
- [Architecture Documentation](../docs/specs/Architecture_technique.md) - Technical specification

### Related Configuration Files

- `i18n/config.ts` - next-intl configuration and locale setup
- `i18n/types.ts` - TypeScript type definitions for locales
- `i18n/index.ts` - Barrel exports for clean imports

### Test Files

- `tests/messages.test.ts` - Parity validation test suite
- Run with: `pnpm test messages.test.ts`

## Middleware Integration

The application uses Next.js 15 middleware with next-intl for automatic language detection and routing.

### How Middleware Works

The middleware (`middleware.ts`) intercepts all incoming requests and:

1. **Detects the user's preferred language** from:
   - URL path prefix (`/fr/*`, `/en/*`) - Highest priority
   - `NEXT_LOCALE` cookie - Second priority
   - `Accept-Language` header - Third priority
   - Default to French - Fallback

2. **Handles routing** by:
   - Redirecting root path `/` to `/{locale}/` (e.g., `/fr/`)
   - Redirecting unsupported languages to default (e.g., `/de/` → `/fr/`)
   - Preserving query parameters during redirects

3. **Initializes i18n context** so components can access translations via:
   - `useTranslations('namespace')` in Client Components
   - `getTranslations('namespace')` in Server Components

4. **Persists language choice** via `NEXT_LOCALE` cookie with:
   - 1-year expiration
   - Secure flags (HttpOnly, SameSite, Secure in production)
   - Automatic updates on language change

### Performance

- Middleware execution: **< 50ms** (typically 5-10ms)
- Edge runtime compatible (Cloudflare Workers)
- Debug logging available with `DEBUG=i18n:*`
- Performance monitoring built-in

### Comprehensive Documentation

For detailed information about:

- Language detection flow and priority
- Configuration options
- Cookie management and security
- Troubleshooting common issues
- API reference and migration guides

See: **[docs/i18n/MIDDLEWARE.md](../docs/i18n/MIDDLEWARE.md)**

### Example: Language Switching

To switch languages programmatically:

```typescript
import { useRouter, usePathname } from 'next/navigation';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (locale: 'fr' | 'en') => {
    // Replace current locale in path with new locale
    const newPath = pathname.replace(/^\/(fr|en)/, `/${locale}`);
    router.push(newPath);
    // Middleware will update NEXT_LOCALE cookie automatically
  };

  return (
    <div>
      <button onClick={() => switchLanguage('fr')}>Français</button>
      <button onClick={() => switchLanguage('en')}>English</button>
    </div>
  );
}
```

## Status

- **Phase 1** ✅ Completed - French translations (73 keys, 8 namespaces)
- **Phase 2** ✅ Completed - English translations + Documentation
- **Phase 3** ✅ Completed - Middleware integration + E2E tests
- **Next Steps** - Story 1.4 (Bilingual URL structure refinements)

---

**Last Updated:** November 17, 2025
**Maintainers:** Claude Code, sebc.dev Team
**Version:** Phase 3 Complete (73 keys, 8 namespaces, 2 languages, Middleware integrated)
