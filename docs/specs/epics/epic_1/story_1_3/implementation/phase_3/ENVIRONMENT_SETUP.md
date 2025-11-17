# Phase 3 - Environment Setup

This guide covers all environment setup needed for Phase 3 (E2E testing with Playwright, debug logging, and performance benchmarking).

---

## 📋 Prerequisites

### Previous Phases

- [ ] Phase 1 completed and validated (Language Detection Foundation)
- [ ] Phase 2 completed and validated (Cookie Persistence & i18n Context)
- [ ] Middleware (`src/middleware.ts`) working and tested with unit tests

### Tools Required

- [ ] Node.js 18+ installed
- [ ] pnpm 8+ installed
- [ ] Playwright installed (will be verified)
- [ ] Browser binaries installed for Playwright (Chromium, Firefox, WebKit)

### Services Required

- [ ] Next.js dev server running (`pnpm dev`)
- [ ] Cloudflare Workers runtime (optional, for performance testing: `wrangler dev`)

---

## 📦 Dependencies Installation

### Verify Playwright Installation

Playwright should already be installed from the project setup. Verify:

```bash
# Check Playwright version
pnpm playwright --version

# Expected: Version 1.40.0 or higher
```

### Install Playwright Browsers (if needed)

If Playwright browser binaries are not installed:

```bash
# Install Chromium, Firefox, WebKit
pnpm playwright install

# Or install only Chromium (faster for development)
pnpm playwright install chromium

# Verify installation
pnpm playwright install --dry-run
```

**Browsers installed**:
- `chromium` - For desktop testing (Chrome-like)
- `firefox` - For Firefox testing
- `webkit` - For Safari-like testing (macOS/iOS)

### Verify Installation

```bash
# List installed browsers
pnpm playwright install --dry-run

# Expected output: chromium, firefox, webkit installed
```

---

## 🔧 Environment Variables

### Required Variables for E2E Testing

No additional environment variables are required for Phase 3. The middleware uses configuration from `i18n/config.ts`.

### Optional Variables for Debug Logging

Create or update `.env.local` (development only):

```env
# Enable debug logging for i18n middleware
DEBUG=i18n:*

# Or enable all debug logs
# DEBUG=*

# Node environment (affects logging behavior)
NODE_ENV=development
```

### Variable Descriptions

| Variable     | Description                       | Example         | Required |
| ------------ | --------------------------------- | --------------- | -------- |
| `DEBUG`      | Debug logging pattern             | `i18n:*`        | No       |
| `NODE_ENV`   | Node environment                  | `development`   | Yes      |

---

## 🗄️ Playwright Configuration

### Verify Playwright Config

Ensure `playwright.config.ts` exists in project root:

```bash
# Check if Playwright config exists
ls playwright.config.ts

# If missing, create it:
pnpm playwright install --with-deps
```

### Recommended Playwright Configuration

Update `playwright.config.ts` with these settings for i18n testing:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports for AC10 testing
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'mobile-android',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Key Configuration**:
- `testDir: './tests'` - E2E tests in `/tests` directory
- `baseURL: 'http://localhost:3000'` - Next.js dev server
- `webServer` - Auto-starts dev server before tests
- Mobile projects: iPhone 13, Pixel 5 (for AC10)

---

## 🚀 Starting the Development Server

### Option A: Next.js Dev Server (Standard)

For standard E2E testing:

```bash
# Start Next.js dev server
pnpm dev

# Dev server runs on http://localhost:3000
```

**Verification**:
```bash
# Visit in browser
open http://localhost:3000

# Or use curl
curl http://localhost:3000
```

**Expected Output**: Homepage loads, no errors

---

### Option B: Cloudflare Workers (Performance Testing)

For performance testing on Cloudflare Workers runtime:

```bash
# Build for Cloudflare
pnpm build

# Start Cloudflare Workers dev server
wrangler dev .open-next/worker.js

# Or use the preview command
pnpm preview
```

**Verification**:
```bash
# Visit in browser
open http://localhost:8787

# Check middleware performance
curl -w "@curl-format.txt" http://localhost:8787/fr/
```

**Expected Output**: Middleware runs on Cloudflare Workers, performance < 50ms

---

## ✅ Connection Tests

### Test 1: Next.js Dev Server

```bash
# Start dev server
pnpm dev &

# Wait for server to start
sleep 5

# Test root path
curl -I http://localhost:3000/

# Expected: HTTP 307 redirect to /fr/ or /en/
```

**Expected Result**:
```
HTTP/1.1 307 Temporary Redirect
Location: /fr/
```

### Test 2: Language Detection

```bash
# Test French URL
curl -I http://localhost:3000/fr/

# Expected: HTTP 200 OK

# Test English URL
curl -I http://localhost:3000/en/

# Expected: HTTP 200 OK

# Test unsupported language
curl -I http://localhost:3000/de/

# Expected: HTTP 307 redirect to /fr/
```

### Test 3: Cookie Persistence

```bash
# Set cookie and test
curl -I -H "Cookie: NEXT_LOCALE=en" http://localhost:3000/

# Expected: HTTP 307 redirect to /en/
```

### Test 4: Debug Logging

```bash
# Start dev server with debug logging
DEBUG=i18n:* pnpm dev

# Visit a page
curl http://localhost:3000/

# Expected: Console logs show language detection
# Example: "i18n:middleware Detected language: fr from default"
```

---

## 🚨 Troubleshooting

### Issue: Playwright browsers not installed

**Symptoms**:
- Error: "Executable doesn't exist at ..."
- Tests fail with "Browser not found"

**Solutions**:
1. Install browsers: `pnpm playwright install`
2. Install with dependencies: `pnpm playwright install --with-deps`
3. Install specific browser: `pnpm playwright install chromium`

**Verify Fix**:
```bash
pnpm playwright install --dry-run
```

---

### Issue: Dev server not starting

**Symptoms**:
- Error: "Port 3000 is already in use"
- Tests fail with "Connection refused"

**Solutions**:
1. Kill existing process: `lsof -ti:3000 | xargs kill -9`
2. Use different port: `PORT=3001 pnpm dev`
3. Restart terminal/IDE

**Verify Fix**:
```bash
curl http://localhost:3000
```

---

### Issue: E2E tests timeout

**Symptoms**:
- Tests fail with "Timeout 30000ms exceeded"
- Slow page loads

**Solutions**:
1. Increase timeout in `playwright.config.ts`: `timeout: 60000`
2. Use explicit waits: `await page.waitForURL('/fr/')`
3. Check network issues (VPN, firewall)

**Verify Fix**:
```bash
pnpm test:e2e --timeout=60000
```

---

### Issue: Middleware not running in tests

**Symptoms**:
- Tests fail: "Expected redirect, got 200"
- Language detection not working

**Solutions**:
1. Verify middleware exists: `ls src/middleware.ts`
2. Check Next.js config: `next.config.js` doesn't disable middleware
3. Restart dev server: `pnpm dev`

**Verify Fix**:
```bash
# Check middleware logs
DEBUG=i18n:* pnpm dev
curl http://localhost:3000/
```

---

### Issue: Debug logs not showing

**Symptoms**:
- No logs in console
- `DEBUG=i18n:*` has no effect

**Solutions**:
1. Verify environment variable: `echo $DEBUG`
2. Use correct format: `DEBUG=i18n:* pnpm dev` (not `pnpm dev DEBUG=i18n:*`)
3. Check logger implementation in `src/lib/i18n/logger.ts`

**Verify Fix**:
```bash
DEBUG=i18n:* pnpm dev
# Visit http://localhost:3000 and check console
```

---

### Issue: Performance tests fail (<50ms target)

**Symptoms**:
- Performance benchmark tests fail
- Middleware execution > 50ms

**Solutions**:
1. Test on Cloudflare Workers: `pnpm preview` (not `pnpm dev`)
2. Optimize detection logic (cache parsed headers)
3. Profile middleware: Add more timing logs

**Verify Fix**:
```bash
pnpm preview
# Measure performance in tests
pnpm test src/lib/i18n/performance.test.ts
```

---

## 📝 Setup Checklist

Complete this checklist before starting Phase 3 implementation:

- [ ] Phase 1 and Phase 2 completed
- [ ] Playwright installed and browsers available
- [ ] Next.js dev server starts successfully
- [ ] Middleware working (redirects to `/fr/` or `/en/`)
- [ ] Language detection working (URL, cookie, header)
- [ ] Debug logging optional (can enable with `DEBUG=i18n:*`)
- [ ] Cloudflare Workers runtime optional (for performance testing)
- [ ] No errors in logs
- [ ] All connection tests pass

**Environment is ready for Phase 3! 🚀**

---

## 📚 Additional Resources

### Playwright Documentation

- [Playwright Official Docs](https://playwright.dev/)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Playwright Fixtures](https://playwright.dev/docs/test-fixtures)
- [Best Practices](https://playwright.dev/docs/best-practices)

### Next.js Testing

- [Next.js Testing](https://nextjs.org/docs/testing)
- [Next.js E2E Testing](https://nextjs.org/docs/app/building-your-application/testing/playwright)

### Debugging

- [Playwright Debug Mode](https://playwright.dev/docs/debug)
- [Debug Logging with `debug` library](https://www.npmjs.com/package/debug)

### Performance

- [Cloudflare Workers Performance](https://developers.cloudflare.com/workers/platform/limits/)
- [Next.js Performance Monitoring](https://nextjs.org/docs/advanced-features/measuring-performance)
