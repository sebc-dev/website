# Phase 2 - Environment Setup

This guide covers all environment setup and debugging tools needed for Phase 2.

---

## 📋 Prerequisites

### Previous Phases

- [ ] **Phase 0 completed**: Git clean, architectural decisions made
- [ ] **Phase 1 completed**: Configuration updated for Cloudflare Workers runtime
  - `playwright.config.ts` uses `http://127.0.0.1:8788`
  - `package.json` preview script forces IPv4
  - `tests/global-setup.ts` exists

### Tools Required

- [ ] **Node.js** 20.x+ installed
- [ ] **pnpm** 8.x+ installed
- [ ] **wrangler** 3.x+ installed
- [ ] **Playwright** browsers installed

### Verification Commands

```bash
# Check versions
node --version     # Should be v20.x or higher
pnpm --version     # Should be 8.x or higher
pnpm wrangler --version  # Should be 3.x

# Check Playwright browsers
pnpm exec playwright --version
```

---

## 📦 Dependencies

All dependencies should already be installed from previous phases. Verify:

```bash
# Verify installation
pnpm list @opennextjs/cloudflare
pnpm list @playwright/test
pnpm list wrangler

# Reinstall if needed
pnpm install --frozen-lockfile
```

**Key Packages**:
- `@opennextjs/cloudflare` - OpenNext adapter for Cloudflare
- `@playwright/test` - E2E testing framework
- `wrangler` - Cloudflare Workers CLI
- `next` - Next.js 15

---

## 🔧 Environment Variables

### Required for Phase 2

No new environment variables are required for Phase 2. The focus is on debugging with existing configuration.

### Existing Variables (from Phase 1)

Verify these exist if needed by your application:

```env
# Development
NODE_ENV=development

# Application-specific
# (Add your app's variables here)
```

---

## 🛠️ Debugging Tools Setup

### 1. Verbose Logging

Enable detailed wrangler logs:

```bash
# Set environment variable for debugging
export WRANGLER_LOG=debug

# Or run directly
WRANGLER_LOG=debug pnpm preview
```

### 2. Playwright Debug Mode

```bash
# Run tests in debug mode
pnpm test:e2e:debug

# Or with headed browser
pnpm test:e2e --headed

# Or with UI mode
pnpm test:e2e:ui
```

### 3. Port Monitoring

Monitor port 8788 for conflicts:

```bash
# Check if port is in use
lsof -i :8788

# Kill process using port (if needed)
kill -9 $(lsof -t -i:8788)

# Monitor connections
netstat -an | grep 8788
```

### 4. Process Management

```bash
# Find all node/wrangler processes
ps aux | grep -E "(node|wrangler)"

# Kill all wrangler processes (if needed)
pkill -f wrangler

# Kill all node processes related to project (careful!)
pkill -f "node.*preview"
```

---

## 🗄️ D1 Database Setup

### Local D1 Database

The local D1 database is managed by wrangler automatically.

**Location**: `.wrangler/state/v3/d1/`

### Reset D1 Database (if needed)

```bash
# Option 1: Delete local D1 state
rm -rf .wrangler/state/v3/d1/

# Option 2: Run global setup again
pnpm exec tsx tests/global-setup.ts
```

### Inspect D1 Database

```bash
# List tables
pnpm wrangler d1 execute DB --local --command "SELECT name FROM sqlite_master WHERE type='table'"

# Query categories
pnpm wrangler d1 execute DB --local --command "SELECT * FROM categories"

# Query articles
pnpm wrangler d1 execute DB --local --command "SELECT * FROM articles"

# Get row counts
pnpm wrangler d1 execute DB --local --command "SELECT COUNT(*) as count FROM categories"
pnpm wrangler d1 execute DB --local --command "SELECT COUNT(*) as count FROM articles"
```

### D1 Migrations

```bash
# List migrations
pnpm wrangler d1 migrations list DB --local

# Apply migrations (if needed)
pnpm wrangler d1 migrations apply DB --local

# Check migration status
pnpm wrangler d1 execute DB --local --command "SELECT * FROM d1_migrations"
```

---

## ✅ Setup Verification

Complete this checklist before starting Phase 2:

### Build Verification

```bash
# Clean previous builds
rm -rf .next .open-next node_modules/.cache

# Run full build
pnpm run build
pnpm exec opennextjs-cloudflare build

# Verify outputs
ls -lh .open-next/worker.js
ls -la .open-next/assets/
```

**Expected**:
- [ ] Build completes without errors
- [ ] `worker.js` exists (>100KB)
- [ ] `assets/` directory contains files

### Server Startup Verification

```bash
# Start preview server
pnpm preview

# In another terminal, test connectivity
curl -I http://127.0.0.1:8788

# Stop server (Ctrl+C)
```

**Expected**:
- [ ] Server starts and shows "Ready on http://127.0.0.1:8788"
- [ ] curl returns 200 OK
- [ ] Server binds to IPv4 (not IPv6)

### D1 Verification

```bash
# Run global setup
pnpm exec tsx tests/global-setup.ts

# Query data
pnpm wrangler d1 execute DB --local --command "SELECT COUNT(*) FROM categories"
pnpm wrangler d1 execute DB --local --command "SELECT COUNT(*) FROM articles"
```

**Expected**:
- [ ] Global setup completes without errors
- [ ] Categories table has rows
- [ ] Articles table has rows

### Test Verification

```bash
# Run tests (may fail - that's OK for now)
pnpm test:e2e

# Check Playwright can start tests
# Even if tests fail, Playwright should initialize
```

**Expected**:
- [ ] Playwright starts
- [ ] webServer launches
- [ ] Tests attempt to run (failures OK at this stage)

---

## 🚨 Troubleshooting

### Issue: "Module not found" during build

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: "Port 8788 already in use"

**Solution**:
```bash
# Find and kill process
lsof -i :8788
kill -9 <PID>

# Or change port in package.json and playwright.config.ts
```

### Issue: "wrangler command not found"

**Solution**:
```bash
# Install wrangler globally (optional)
pnpm add -g wrangler

# Or always use via pnpm
pnpm exec wrangler --version
```

### Issue: Build is very slow (>5 minutes)

**Possible causes**:
- Large node_modules
- Slow disk (check if using network drive)
- Antivirus scanning

**Solutions**:
```bash
# Clear caches
rm -rf .next .open-next node_modules/.cache

# Check disk speed
time dd if=/dev/zero of=test.tmp bs=1M count=100
rm test.tmp
```

### Issue: Playwright browsers not installed

**Solution**:
```bash
# Install Playwright browsers
pnpm exec playwright install

# With system dependencies (Linux)
pnpm exec playwright install --with-deps
```

### Issue: D1 seeding fails with "table not found"

**Solution**:
```bash
# Reset D1 and reapply migrations
rm -rf .wrangler/state/v3/d1/
pnpm wrangler d1 migrations apply DB --local

# Then run seeding again
pnpm exec tsx tests/global-setup.ts
```

### Issue: Wrangler hangs at "Starting local server"

**Possible causes**:
- Port conflict
- IPv6 resolution issues
- Corrupted cache

**Solutions**:
```bash
# 1. Check port
lsof -i :8788

# 2. Verify IPv4 flag in package.json
grep "preview" package.json  # Should show --ip 127.0.0.1

# 3. Clear wrangler cache
rm -rf .wrangler/

# 4. Try verbose logging
WRANGLER_LOG=debug pnpm preview
```

---

## 📊 Baseline Metrics

Record these metrics at the start of Phase 2 for comparison:

### Build Metrics

- [ ] Next.js build time: _____ seconds
- [ ] OpenNext build time: _____ seconds
- [ ] Total build time: _____ seconds
- [ ] Worker size: _____ KB/MB
- [ ] Assets count: _____ files

### Startup Metrics

- [ ] Server startup time (Run 1): _____ seconds
- [ ] Server startup time (Run 2): _____ seconds
- [ ] Server startup time (Run 3): _____ seconds
- [ ] Average startup time: _____ seconds

### Test Metrics

- [ ] Tests attempted: _____
- [ ] Tests passed: _____
- [ ] Tests failed: _____
- [ ] Pass rate: _____%
- [ ] Execution time: _____ seconds

### D1 Metrics

- [ ] Categories seeded: _____ rows
- [ ] Articles seeded: _____ rows
- [ ] Seeding time: _____ seconds

---

## 🎯 Environment Ready Checklist

Before proceeding with commits:

- [ ] All prerequisites met
- [ ] Dependencies installed and verified
- [ ] Build completes successfully
- [ ] Server starts (even if tests fail)
- [ ] D1 database seeds successfully
- [ ] Debugging tools configured
- [ ] Baseline metrics recorded
- [ ] No blocking errors

**Environment is ready for Phase 2 debugging! 🚀**

---

## 📝 Notes

**Important reminders for Phase 2**:

1. **Always use `--local` flag** with D1 commands
2. **Clean build** between debugging sessions if needed
3. **Record all errors** encountered for documentation
4. **Take your time** - debugging requires patience
5. **Document solutions** for future reference

**Key files to monitor**:
- `.open-next/worker.js` - Worker bundle
- `.wrangler/state/v3/d1/` - Local D1 database
- `playwright-report/` - Test results

**Useful debug commands**:
```bash
# Monitor server logs
WRANGLER_LOG=debug pnpm preview 2>&1 | tee wrangler.log

# Monitor test execution
pnpm test:e2e --reporter=line

# Generate detailed test report
pnpm test:e2e --reporter=html
```
