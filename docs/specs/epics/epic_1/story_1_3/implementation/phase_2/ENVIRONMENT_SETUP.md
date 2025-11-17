# Phase 2 - Environment Setup

This guide covers all environment setup needed for Phase 2.

---

## 📋 Prerequisites

### Previous Phases

- [ ] Phase 1 (Language Detection Foundation) completed and validated
- [ ] Phase 1 tests passing: `pnpm test`
- [ ] Phase 1 middleware functioning (URL/cookie/header detection working)

### Tools Required

- [ ] Node.js v18+ (check: `node --version`)
- [ ] pnpm v8+ (check: `pnpm --version`)
- [ ] TypeScript 5+ (installed in project)
- [ ] Vitest (configured in project for unit tests)
- [ ] Git (for commits)

### Project Setup

- [ ] Next.js 15 project initialized
- [ ] next-intl library installed (Story 1.1)
- [ ] Middleware path configured (`src/middleware.ts`)
- [ ] tsconfig.json includes middleware path
- [ ] .env.local configured (see below)

---

## 📦 Dependencies Already Installed

The following were installed in Phase 1 or Story 1.1:

- `next-intl` - Internationalization library
- `next` - Next.js framework
- `typescript` - Type checking
- `vitest` - Unit testing framework
- `@testing-library/react` - Component testing utilities

### Verify Installation

```bash
# Check next-intl is installed
pnpm list next-intl

# Expected output: next-intl@4.5.3 (or similar)
```

---

## 🔧 Environment Variables

### Required Variables

Create or update `.env.local`:

```env
# i18n Configuration
NEXT_PUBLIC_DEFAULT_LOCALE=fr
NEXT_PUBLIC_SUPPORTED_LOCALES=fr,en
```

### Variable Descriptions

| Variable                        | Description                         | Example | Required |
| ------------------------------- | ----------------------------------- | ------- | -------- |
| `NEXT_PUBLIC_DEFAULT_LOCALE`    | Default language when none detected | `fr`    | Yes      |
| `NEXT_PUBLIC_SUPPORTED_LOCALES` | Comma-separated list of locales     | `fr,en` | Yes      |

### Verify Configuration

```bash
# Check .env.local exists and has required variables
cat .env.local | grep -E "NEXT_PUBLIC_DEFAULT_LOCALE|NEXT_PUBLIC_SUPPORTED_LOCALES"

# Expected output:
# NEXT_PUBLIC_DEFAULT_LOCALE=fr
# NEXT_PUBLIC_SUPPORTED_LOCALES=fr,en
```

---

## 🗄️ No External Services Required

Phase 2 uses only in-memory operations:

- ✅ Cookie parsing (HTTP headers)
- ✅ next-intl context (in-process)
- ✅ Type validation (compile-time)

**No database, API, or external services needed.**

---

## 📊 Cookie Configuration Reference

### Standard Cookie Flags for Phase 2

**Secure Flag Values**:

```typescript
// Development (localhost)
const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: false, // HTTP only in dev
  maxAge: 31536000, // 1 year
};

// Production (HTTPS)
const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: true, // HTTPS required in prod
  maxAge: 31536000, // 1 year
};
```

### Cookie Name

- **Name**: `NEXT_LOCALE`
- **Value**: Language code (e.g., 'fr', 'en')
- **TTL**: 31536000 seconds (1 year)
- **Flags**: HttpOnly, SameSite=Lax, Secure (prod only)

---

## 🚀 Quick Setup Checklist

Before starting implementation:

- [ ] Node.js v18+ installed
- [ ] pnpm v8+ installed
- [ ] Phase 1 complete and validated
- [ ] next-intl installed: `pnpm list next-intl`
- [ ] `.env.local` has required variables
- [ ] TypeScript configured: `pnpm tsc --version`
- [ ] Vitest configured: `pnpm test --help` shows Vitest options
- [ ] Git configured: `git config user.email` and `git config user.name`

### Verify Development Environment

```bash
# Check Node.js version
node --version
# Expected: v18.x or higher

# Check pnpm version
pnpm --version
# Expected: v8.x or higher

# Check project dependencies
pnpm list next-intl
# Expected: next-intl@4.5.3 (or higher)

# Test development server starts
pnpm dev &
# Expected: Server ready on http://localhost:3000
# (Press Ctrl+C to stop)

# Test TypeScript compilation
pnpm tsc --noEmit
# Expected: No errors

# Test unit tests work
pnpm test -- --run --passWithNoTests
# Expected: All tests pass (or "no tests")
```

---

## 🐛 Troubleshooting

### Issue: next-intl not installed

**Symptoms**:

- `pnpm list next-intl` returns empty or error
- Import error: `Cannot find module 'next-intl'`

**Solutions**:

1. Install next-intl (Story 1.1 task):

   ```bash
   pnpm add next-intl
   ```

2. Verify installation:
   ```bash
   pnpm list next-intl
   ```

**Verify Fix**:

```bash
node -e "console.log(require.resolve('next-intl'))"
```

Expected: Path to next-intl module

---

### Issue: TypeScript compilation errors in middleware

**Symptoms**:

- Error: `Cannot find type 'NextRequest'` or `NextResponse`
- `pnpm tsc` fails

**Solutions**:

1. Ensure `next` is installed:

   ```bash
   pnpm list next
   ```

2. Update `tsconfig.json` middleware path:

   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"]
       }
     },
     "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]
   }
   ```

3. Clear Next.js cache:
   ```bash
   rm -rf .next/
   pnpm dev
   ```

**Verify Fix**:

```bash
pnpm tsc --noEmit
```

Expected: Zero errors

---

### Issue: Vitest not configured

**Symptoms**:

- `pnpm test` returns error
- Cannot find `vitest.config.ts`

**Solutions**:

1. Check Vitest configuration:

   ```bash
   ls -la vitest.config.ts
   ```

2. If missing, ensure it's in package.json scripts:

   ```json
   {
     "scripts": {
       "test": "vitest"
     }
   }
   ```

3. Run test setup:
   ```bash
   pnpm test -- --run --passWithNoTests
   ```

**Verify Fix**:

```bash
pnpm test -- --help
```

Expected: Shows Vitest options

---

### Issue: Cookie tests fail with Cloudflare references

**Symptoms**:

- Error: `ReferenceError: Cloudflare is not defined`
- In test environment, Cloudflare Workers APIs not available

**Solutions**:

1. Ensure cookie tests mock Cloudflare APIs:

   ```typescript
   // Don't import Cloudflare-specific code in unit tests
   // Use NextRequest/NextResponse from 'next/server' instead
   ```

2. Use conditional imports:

   ```typescript
   // In middleware.ts (runs on Cloudflare)
   import { getCloudflareContext } from '@opennextjs/cloudflare';

   // In tests (mock or omit)
   // Don't import Cloudflare APIs in unit tests
   ```

3. Mock fetch/crypto if needed:
   ```typescript
   // Tests mock what Cloudflare provides
   global.crypto = {
     /* mock crypto */
   };
   ```

**Verify Fix**:

```bash
pnpm test src/lib/i18n/cookie.test.ts
```

Expected: Tests pass without Cloudflare references

---

### Issue: .env.local not loaded in tests

**Symptoms**:

- Environment variables undefined in tests
- `process.env.NEXT_PUBLIC_DEFAULT_LOCALE` is undefined

**Solutions**:

1. Create `.env.test.local` with test variables:

   ```env
   NEXT_PUBLIC_DEFAULT_LOCALE=fr
   NEXT_PUBLIC_SUPPORTED_LOCALES=fr,en
   ```

2. Or set in `vitest.config.ts`:

   ```typescript
   export default defineConfig({
     test: {
       env: {
         NEXT_PUBLIC_DEFAULT_LOCALE: 'fr',
         NEXT_PUBLIC_SUPPORTED_LOCALES: 'fr,en',
       },
     },
   });
   ```

3. Or set in test file:
   ```typescript
   beforeAll(() => {
     process.env.NEXT_PUBLIC_DEFAULT_LOCALE = 'fr';
   });
   ```

**Verify Fix**:

```bash
pnpm test -- --run --passWithNoTests
```

Expected: Tests run without environment variable errors

---

## ✅ Setup Complete Checklist

Complete this checklist before starting implementation:

- [ ] Node.js v18+ installed
- [ ] pnpm v8+ installed
- [ ] Phase 1 complete and validated
- [ ] next-intl installed and verified
- [ ] `.env.local` configured with required variables
- [ ] TypeScript compiles: `pnpm tsc --noEmit` (zero errors)
- [ ] Unit tests work: `pnpm test -- --run --passWithNoTests`
- [ ] Development server starts: `pnpm dev`
- [ ] Git configured: `git config user.email` and `git config user.name`
- [ ] Understand cookie flags and TTL values
- [ ] No external services needed (all local)

**Environment is ready for Phase 2 implementation! 🚀**
