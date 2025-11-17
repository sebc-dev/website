# Next.js Middleware with next-intl

Complete guide for the i18n middleware implementation in this Next.js 15 + Cloudflare Workers project.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Usage](#usage)
- [Language Detection](#language-detection)
- [Cookie Management](#cookie-management)
- [Performance](#performance)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [API Reference](#api-reference)
- [Migration Guide](#migration-guide)

---

## Overview

This project uses **next-intl v4.5.3** integrated with Next.js 15 middleware to provide automatic language detection, routing, and cookie persistence for a bilingual (French/English) website deployed on Cloudflare Workers.

### Key Features

- ✅ Automatic language detection from URL, cookies, and browser headers
- ✅ Locale-prefixed routing (`/fr/*`, `/en/*`)
- ✅ Cookie-based language persistence
- ✅ Edge runtime compatible (Cloudflare Workers)
- ✅ Performance optimized (< 50ms execution)
- ✅ Production-safe debug logging
- ✅ TypeScript support with type-safe locales

### Supported Locales

- **French (`fr`)** - Default language
- **English (`en`)** - Secondary language

---

## Architecture

### Middleware Flow

```
Incoming Request
       ↓
[Matcher Check] ─── Excluded? ──→ Pass Through
       ↓ (Included)
[Detect Locale]
   ├─ URL prefix (/fr/, /en/)      [Priority 1]
   ├─ NEXT_LOCALE cookie           [Priority 2]
   ├─ Accept-Language header       [Priority 3]
   └─ Default (French)             [Priority 4]
       ↓
[Root Path?] ─── Yes ──→ Redirect to /{locale}/
       ↓ (No)
[next-intl Middleware]
   ├─ Initialize i18n context
   ├─ Make locale available to components
   └─ Handle routing
       ↓
[Set NEXT_LOCALE Cookie]
       ↓
[Return Response]
```

### File Structure

```
middleware.ts                    # Main middleware file
i18n/
  ├── config.ts                  # Locale configuration
  ├── types.ts                   # TypeScript types
  └── README.md                  # i18n usage guide
lib/i18n/
  ├── cookie.ts                  # Cookie validation utilities
  ├── redirect.ts                # Redirect logic
  ├── logger.ts                  # Debug logging
  └── performance.ts             # Performance monitoring
messages/
  ├── fr.json                    # French translations
  └── en.json                    # English translations
app/[locale]/                    # Locale-prefixed routes
```

---

## Configuration

### i18n Configuration (`i18n/config.ts`)

```typescript
import { getRequestConfig } from 'next-intl/server';

// Supported locales
export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'fr';

// Routing configuration for next-intl middleware
export const routingConfig = {
  localePrefix: 'always' as const, // Always use /fr/ or /en/ prefix
};

// Request configuration
export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}.json`)).default,
}));
```

### Middleware Configuration (`middleware.ts`)

The middleware uses a matcher pattern to determine which routes should be processed:

```typescript
export const config = {
  matcher: [
    // Match all pathnames except those starting with:
    // - api, _next, _vercel
    // - Files with extensions (images, fonts, etc.)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
```

### Excluded Routes

The middleware automatically **skips** these routes for performance:

- `/_next/*` - Next.js internals
- `/api/*` - API routes
- `/public/*` - Static files
- Files with extensions: `.png`, `.jpg`, `.svg`, `.css`, `.js`, `.json`, etc.

---

## Usage

### In Server Components

```typescript
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('common');

  return (
    <div>
      <h1>{t('appName')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### In Client Components

```typescript
'use client';

import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('nav');

  return (
    <nav>
      <a href="/fr/">{t('home')}</a>
      <a href="/fr/articles">{t('articles')}</a>
    </nav>
  );
}
```

### Getting Current Locale

```typescript
import { getLocale } from 'next-intl/server';

export default async function Page() {
  const locale = await getLocale();

  return <div>Current language: {locale}</div>;
}
```

---

## Language Detection

### Detection Priority

The middleware detects the user's language in this order (highest to lowest):

#### 1. URL Path Prefix (Highest Priority)

If the URL contains `/fr/` or `/en/` prefix, that language is used.

```
/fr/articles     → French
/en/search       → English
/de/articles     → Redirect to /fr/articles (unsupported)
```

#### 2. NEXT_LOCALE Cookie

If no URL prefix, check the `NEXT_LOCALE` cookie.

```http
Cookie: NEXT_LOCALE=en
Request: /articles
Result: Redirect to /en/articles
```

#### 3. Accept-Language Header

If no cookie, parse the browser's `Accept-Language` header.

```http
Accept-Language: fr-FR,fr;q=0.9,en;q=0.8
Result: Redirect to /fr/
```

```http
Accept-Language: en-US,en;q=0.9
Result: Redirect to /en/
```

#### 4. Default Language (Lowest Priority)

If no detection source available, use French (default).

```
Request: / (no cookie, no header)
Result: Redirect to /fr/
```

### Language Validation

Only `fr` and `en` are supported. Any other language code results in a redirect to the default language:

```
/it/articles  → 307 Redirect to /fr/articles
/de/search    → 307 Redirect to /fr/search
```

Query parameters and paths are preserved during redirects.

---

## Cookie Management

### Cookie: NEXT_LOCALE

The middleware sets and reads a cookie named `NEXT_LOCALE` to persist language preference.

#### Cookie Properties

| Property   | Value              | Purpose                                    |
|------------|--------------------|--------------------------------------------|
| Name       | `NEXT_LOCALE`      | next-intl convention                       |
| Value      | `fr` or `en`       | Selected language code                     |
| Max-Age    | `31536000` (1 yr)  | Long-term persistence                      |
| SameSite   | `Lax`              | Allow cross-site navigation                |
| HttpOnly   | `true`             | Prevent JavaScript access (security)       |
| Secure     | `true` (prod only) | HTTPS-only in production                   |
| Path       | `/`                | Available site-wide                        |

#### Example Set-Cookie Header

```http
Set-Cookie: NEXT_LOCALE=fr; Max-Age=31536000; Path=/; HttpOnly; SameSite=Lax; Secure
```

#### Cookie Optimization

The middleware only sets the cookie when:
- It doesn't exist yet, OR
- The detected language differs from the cookie value

This avoids redundant `Set-Cookie` headers on every request.

---

## Performance

### Performance Targets

| Operation             | Target  | Actual (avg) |
|-----------------------|---------|--------------|
| Middleware execution  | < 50ms  | ~5-10ms      |
| Locale detection      | < 10ms  | ~1-2ms       |
| Cookie parsing        | < 5ms   | < 1ms        |

### Performance Monitoring

Debug logging includes execution time for all operations:

```bash
DEBUG=i18n:* pnpm dev
```

Sample log output:

```
[2025-11-17T20:30:15.123Z] [DEBUG] [i18n] Middleware invoked {"pathname":"/","method":"GET"}
[2025-11-17T20:30:15.124Z] [DEBUG] [i18n] Locale detected from cookie {"locale":"fr","source":"cookie","duration":1.2}
[2025-11-17T20:30:15.128Z] [INFO] [i18n] Root path redirect {"locale":"fr","from":"/","to":"/fr/","duration":5.3}
```

### Performance Warnings

If middleware execution exceeds 50ms, a warning is logged:

```
[WARN] [i18n] Slow middleware execution detected {"duration":75.5,"target":50,"pathname":"/en/articles"}
```

### Optimization Tips

1. **Matcher Configuration**: Exclude static files to avoid unnecessary middleware runs
2. **Early Returns**: Root path redirection happens before next-intl processing
3. **Conditional Logging**: Debug logs only in development (no production overhead)
4. **Cookie Optimization**: Only set cookie when necessary

---

## Security

### Best Practices

#### 1. Input Validation

All locale values are validated against a whitelist:

```typescript
export function validateLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
```

Invalid locales are rejected, preventing injection attacks.

#### 2. Cookie Security Flags

Cookies use security flags to prevent common attacks:

- **HttpOnly**: Prevents XSS attacks (JavaScript can't read cookie)
- **SameSite=Lax**: Prevents CSRF attacks
- **Secure** (production): Requires HTTPS

#### 3. No PII in Logs

Debug logs never include:
- IP addresses
- User IDs
- Email addresses
- Personal information

Only safe metadata is logged:

```typescript
logger.debug('Locale detected', {
  locale: 'fr',           // ✅ Safe
  source: 'cookie',       // ✅ Safe
  pathname: '/articles',  // ✅ Safe
  duration: 5.2,          // ✅ Safe
  // ❌ Never: ip, userId, email, etc.
});
```

#### 4. Redirect Validation

All redirects preserve the original path but validate the locale:

```typescript
// Safe redirect
/de/articles?query=test
→ 307 Redirect to /fr/articles?query=test

// Locale is validated, path and query preserved
```

#### 5. Edge Runtime Security

Running on Cloudflare Workers provides additional security:

- Isolated execution environment
- No Node.js APIs (prevents certain attacks)
- Global CDN with DDoS protection

---

## Troubleshooting

### Common Issues

#### Issue 1: Language Not Detected

**Symptoms**: Website always defaults to French, even with English cookie/header

**Causes**:
- Cookie name mismatch
- Cookie not readable (wrong domain/path)
- Middleware not running on route

**Solutions**:

1. Check cookie in browser DevTools:
   ```
   Application > Cookies > localhost
   Name: NEXT_LOCALE
   Value: en
   ```

2. Verify middleware runs on route:
   ```bash
   DEBUG=i18n:* pnpm dev
   # Visit route and check logs
   ```

3. Check matcher config includes route:
   ```typescript
   // middleware.ts
   export const config = {
     matcher: ['/((?!api|_next|_vercel|.*\\..*).*)',
   };
   ```

#### Issue 2: Infinite Redirects

**Symptoms**: Browser shows "Too many redirects" error

**Causes**:
- Middleware redirecting on every request
- Missing locale prefix in redirect URL
- Incorrect localePrefix configuration

**Solutions**:

1. Check `localePrefix` setting:
   ```typescript
   // i18n/config.ts
   export const routingConfig = {
     localePrefix: 'always', // ✅ Correct
   };
   ```

2. Verify root path redirect logic:
   ```typescript
   // Should only redirect if pathname === '/'
   if (pathname === '/') {
     return NextResponse.redirect(new URL(`/${locale}/`, request.url));
   }
   ```

3. Check for redirect loops in logs:
   ```bash
   DEBUG=i18n:* pnpm dev
   # Look for repeated redirects
   ```

#### Issue 3: Cookie Not Persisting

**Symptoms**: Language resets to default on page reload

**Causes**:
- Cookie flags preventing save (e.g., Secure flag in dev without HTTPS)
- Browser blocking cookies
- Incorrect Max-Age/Expires

**Solutions**:

1. Check cookie flags in development:
   ```typescript
   // middleware.ts
   const LOCALE_COOKIE_OPTIONS = {
     secure: process.env.NODE_ENV === 'production', // ✅ false in dev
     httpOnly: true,
     sameSite: 'lax' as const,
     maxAge: 31536000,
     path: '/',
   };
   ```

2. Verify browser allows cookies:
   - Settings > Privacy > Cookies: Allow all

3. Check cookie expiration:
   ```javascript
   // Browser console
   document.cookie.split(';').find(c => c.includes('NEXT_LOCALE'))
   ```

#### Issue 4: Translations Not Loading

**Symptoms**: Keys like `common.appName` displayed instead of translated text

**Causes**:
- Message files missing or malformed
- Incorrect namespace or key
- Locale not initialized

**Solutions**:

1. Verify message files exist:
   ```bash
   ls messages/
   # Should show: fr.json, en.json
   ```

2. Check message file structure:
   ```json
   {
     "common": {
       "appName": "My App"
     }
   }
   ```

3. Use correct namespace in component:
   ```typescript
   const t = useTranslations('common'); // ✅ Match namespace
   t('appName'); // ✅ Match key
   ```

4. Check locale initialization:
   ```bash
   DEBUG=i18n:* pnpm dev
   # Look for: "Locale detected from..."
   ```

### Debug Mode

Enable debug logging to see detailed middleware execution:

```bash
# Enable all i18n debug logs
DEBUG=i18n:* pnpm dev

# Enable specific logs
DEBUG=i18n:middleware pnpm dev
DEBUG=i18n:cookie pnpm dev
```

Log output includes:
- Language detection source
- Redirect operations
- Cookie operations
- Performance timing

---

## API Reference

### Functions

#### `detectLocaleFromURL(pathname: string): Locale | undefined`

Detects locale from URL path prefix.

**Parameters**:
- `pathname` - URL pathname (e.g., `/fr/articles`)

**Returns**:
- `Locale` if valid prefix found
- `undefined` if no prefix or invalid locale

**Example**:
```typescript
detectLocaleFromURL('/fr/articles'); // 'fr'
detectLocaleFromURL('/en/search');   // 'en'
detectLocaleFromURL('/articles');    // undefined
```

#### `parseAcceptLanguage(headerValue: string): string[]`

Parses `Accept-Language` header with quality values.

**Parameters**:
- `headerValue` - Accept-Language header value

**Returns**:
- Array of language codes in priority order

**Example**:
```typescript
parseAcceptLanguage('fr,en;q=0.9');
// Returns: ['fr', 'en']

parseAcceptLanguage('en;q=0.8,fr;q=0.9');
// Returns: ['fr', 'en'] (sorted by quality)
```

#### `getLocaleFromCookie(cookieValue?: string): Locale | undefined`

Validates and returns locale from cookie value.

**Parameters**:
- `cookieValue` - NEXT_LOCALE cookie value

**Returns**:
- `Locale` if valid
- `undefined` if invalid or missing

**Example**:
```typescript
getLocaleFromCookie('fr');      // 'fr'
getLocaleFromCookie('de');      // undefined (not supported)
getLocaleFromCookie(undefined); // undefined
```

#### `getLocaleFromHeader(headerValue: string): Locale | undefined`

Detects locale from Accept-Language header.

**Parameters**:
- `headerValue` - Accept-Language header value

**Returns**:
- `Locale` if supported language found
- `undefined` if no supported language

**Example**:
```typescript
getLocaleFromHeader('fr,en;q=0.9'); // 'fr'
getLocaleFromHeader('de,it;q=0.9'); // undefined (no supported lang)
```

### Types

#### `Locale`

Type-safe locale identifier.

```typescript
type Locale = 'fr' | 'en';
```

#### `PerformanceTimer`

Performance timer structure.

```typescript
interface PerformanceTimer {
  name: string;
  startTime: number;
}
```

#### `LogLevel`

Log level enum.

```typescript
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}
```

### Configuration Objects

#### `routingConfig`

next-intl routing configuration.

```typescript
const routingConfig = {
  localePrefix: 'always' as const,
};
```

#### `LOCALE_COOKIE_OPTIONS`

Cookie configuration for NEXT_LOCALE.

```typescript
const LOCALE_COOKIE_OPTIONS = {
  maxAge: 31536000,      // 1 year
  sameSite: 'lax' as const,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};
```

#### `PERFORMANCE_TARGETS`

Performance target thresholds (in milliseconds).

```typescript
const PERFORMANCE_TARGETS = {
  MIDDLEWARE_EXECUTION: 50,
  LOCALE_DETECTION: 10,
  COOKIE_PARSING: 5,
} as const;
```

---

## Migration Guide

### From react-i18next

If you're migrating from react-i18next:

#### Before (react-i18next)

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t('common:appName')}</h1>
      <button onClick={() => i18n.changeLanguage('en')}>
        English
      </button>
    </div>
  );
}
```

#### After (next-intl)

```typescript
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

function MyComponent() {
  const t = useTranslations('common');
  const pathname = usePathname();
  const router = useRouter();

  const changeLanguage = (locale: string) => {
    router.push(pathname.replace(/^\/(fr|en)/, `/${locale}`));
  };

  return (
    <div>
      <h1>{t('appName')}</h1>
      <button onClick={() => changeLanguage('en')}>
        English
      </button>
    </div>
  );
}
```

#### Key Differences

| react-i18next              | next-intl                        |
|----------------------------|----------------------------------|
| `useTranslation()`         | `useTranslations(namespace)`     |
| `t('common:key')`          | `t('key')` (namespace in hook)   |
| `i18n.changeLanguage()`    | Navigate to `/{locale}/path`     |
| Client-side detection      | Middleware-based detection       |
| localStorage persistence   | Cookie persistence               |

### From next-i18next

#### Before (next-i18next)

```typescript
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default function Page() {
  const { t } = useTranslation('common');
  return <h1>{t('appName')}</h1>;
}
```

#### After (next-intl)

```typescript
import { useTranslations } from 'next-intl';

// No getStaticProps needed in App Router
export default function Page() {
  const t = useTranslations('common');
  return <h1>{t('appName')}</h1>;
}
```

#### Migration Steps

1. **Remove next-i18next**:
   ```bash
   pnpm remove next-i18next
   ```

2. **Install next-intl**:
   ```bash
   pnpm add next-intl@4.5.3
   ```

3. **Create middleware** (see Configuration section)

4. **Update route structure** to `app/[locale]/`

5. **Convert message files** from namespaced structure

6. **Update component imports**:
   - `next-i18next` → `next-intl`
   - `useTranslation` → `useTranslations`

7. **Remove `getStaticProps`/`getServerSideProps`** (not needed in App Router)

---

## Additional Resources

- **next-intl Documentation**: https://next-intl.dev/
- **Next.js Middleware**: https://nextjs.org/docs/app/building-your-application/routing/middleware
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **Project i18n Guide**: `/i18n/README.md`
- **Message Files**: `/messages/fr.json`, `/messages/en.json`

---

**Last Updated**: 2025-11-17
**next-intl Version**: 4.5.3
**Next.js Version**: 15.0.3
