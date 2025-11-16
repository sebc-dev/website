# Phase 1 - Environment Setup

This guide covers all environment setup needed for Phase 1. Good news: Phase 1 requires minimal setup!

---

## 📋 Prerequisites

### Previous Phases

- [ ] Story 1.1 (i18n Configuration) completed and validated
  - next-intl library installed
  - `i18n/config.ts` configured
  - Locale types defined in `i18n/types.ts`

### Tools Required

- [ ] Node.js (v18+) - Should already be installed
- [ ] pnpm (v8+) - Should already be installed
- [ ] Git - For version control
- [ ] Text editor supporting UTF-8 - VS Code, WebStorm, etc.

### Services Required

- None! This phase only creates static JSON files.

---

## 📦 Dependencies Installation

### No New Package Dependencies

Phase 1 doesn't require any new npm packages. The next-intl library should already be installed from Story 1.1.

### Verify Existing Setup

Ensure Story 1.1 dependencies are in place:

```bash
# Verify next-intl is installed
npm list next-intl

# Should show something like:
# project@1.0.0 /home/negus/dev/website
# └── next-intl@4.5.3
```

If not installed:

```bash
# Install from Story 1.1 requirements
pnpm add next-intl@4.5.3
```

---

## 🔧 Configuration Files

### Existing Configuration

Verify these files from Story 1.1 exist:

- [ ] `i18n/config.ts` - Configuration file
- [ ] `i18n/types.ts` - Locale type definitions
- [ ] `messages/` directory will be created in this phase

### File Encoding Setup

Ensure your editor is configured for UTF-8:

#### VS Code

1. Bottom right corner: Click on encoding selector (usually shows "UTF-8")
2. Select "Save with Encoding"
3. Choose "UTF-8"
4. This applies to all new files going forward

#### Other Editors

- **WebStorm/IntelliJ**: Settings → Editor → File Encodings → Default encoding: UTF-8
- **Sublime Text**: View → Line Endings → Unix (uses UTF-8 by default)
- **Vim**: `:set fileencoding=utf-8`

---

## 🌍 UTF-8 Encoding Verification

### Why UTF-8 Matters

French translations require proper encoding for accents (é, è, ç, ô, etc.). UTF-8 handles these correctly.

### Test UTF-8 Setup

Create a test file to verify encoding:

```bash
# Create a test file with French characters
echo '{"test": "Bonjour, café"}' > /tmp/test.json

# Verify it's UTF-8
file /tmp/test.json
# Should show: UTF-8 Unicode text

# Parse it
node -e "console.log(JSON.parse(require('fs').readFileSync('/tmp/test.json', 'utf8')))"
# Should output: { test: 'Bonjour, café' }
```

---

## 📁 Directory Structure

### Current Structure

```
project-root/
├── i18n/
│   ├── config.ts          (from Story 1.1)
│   └── types.ts           (from Story 1.1)
└── messages/              (will be created in Phase 1)
    ├── fr.json            (Commit 1)
    └── en.json            (Commit 1)
```

### Phase 1 Creates

In Commit 1, you'll create:

```bash
mkdir -p messages
```

This creates the `/messages` directory in the project root.

---

## 🧪 Environment Verification Checklist

Before starting Phase 1 implementation:

### Step 1: Verify Node.js and pnpm

```bash
# Check Node.js version (should be v18+)
node --version

# Check pnpm version (should be v8+)
pnpm --version

# Should output versions like:
# v18.17.0 (or higher)
# 8.6.0 (or higher)
```

**Expected Result**: Both commands work and show appropriate versions

### Step 2: Verify Project Setup

```bash
# Navigate to project root
cd /home/negus/dev/website

# Verify i18n files exist
ls -la i18n/
# Should show: config.ts, types.ts

# Verify next-intl is installed
pnpm list next-intl
```

**Expected Result**: i18n files exist and next-intl is installed

### Step 3: Verify UTF-8 Editor Support

```bash
# Test creating a UTF-8 file in VS Code
# Create a new file with content: "Bonjour"
# Save as test.json
# Verify encoding shows "UTF-8" in bottom right

# Verify command line can read UTF-8
node -e "const fs = require('fs'); const content = fs.readFileSync('test.json', 'utf8'); console.log('Content:', content); fs.unlinkSync('test.json');"
```

**Expected Result**: UTF-8 file created, read correctly, accents preserved

### Step 4: Verify Git is Ready

```bash
# Check git status
git status

# Verify you're on the correct branch (should be "story_1_2")
git branch

# Should show:
# * story_1_2
#   main
```

**Expected Result**: Git is initialized and ready to commit

---

## 🧬 Git Branch Setup

### Current Branch

You should already be on the `story_1_2` branch:

```bash
git branch
# Output:
# * story_1_2
#   main
```

### If on Wrong Branch

```bash
# Switch to story_1_2
git checkout story_1_2

# Or create it if it doesn't exist
git checkout -b story_1_2 main
```

---

## ✅ Pre-Implementation Checklist

Complete this checklist before starting Commit 1:

- [ ] Node.js v18+ installed
- [ ] pnpm v8+ installed
- [ ] next-intl 4.5.3 installed
- [ ] `i18n/config.ts` exists
- [ ] `i18n/types.ts` exists
- [ ] Editor configured for UTF-8
- [ ] Git on `story_1_2` branch
- [ ] No uncommitted changes (git status is clean)
- [ ] Have read IMPLEMENTATION_PLAN.md

**Environment is ready! 🚀**

---

## 🚨 Troubleshooting

### Issue: UTF-8 Characters Not Displaying Correctly

**Symptoms**:

- Accents show as "?" or boxes in editor
- Terminal shows garbled characters
- JSON parsing fails with encoding error

**Solutions**:

1. **In VS Code**:
   - Click on "UTF-8" in bottom right
   - Reopen file with proper encoding
   - Check encoding is UTF-8

2. **In Terminal**:

   ```bash
   # Verify terminal uses UTF-8
   locale | grep UTF
   # Should show: en_US.UTF-8 or similar

   # If not set, add to shell config (~/.bashrc or ~/.zshrc):
   export LC_ALL=en_US.UTF-8
   export LANG=en_US.UTF-8
   ```

3. **Verify File Encoding**:
   ```bash
   # Check file encoding
   file -i messages/fr.json
   # Should show: text/plain; charset=utf-8
   ```

**Verify Fix**:

```bash
# Create test file with accents
echo '{"test": "Café français"}' > test.json
cat test.json
# Should display: {"test": "Café français"}
rm test.json
```

### Issue: next-intl Not Installed

**Symptoms**:

- `Cannot find module 'next-intl'` error
- Tests fail to run

**Solutions**:

```bash
# Install next-intl
pnpm add next-intl@4.5.3

# Verify installation
pnpm list next-intl
```

### Issue: Git Not Ready

**Symptoms**:

- Cannot commit changes
- Uncommitted changes preventing branch switch

**Solutions**:

```bash
# Check git status
git status

# If files are modified, either:
# 1. Commit them (if part of previous work)
# 2. Stash them (if unrelated)
git stash

# Then start on clean branch
git checkout story_1_2
```

---

## 📝 Setup Summary

**Phase 1 requires minimal setup**:

1. ✅ Verify Node.js, pnpm, next-intl installed
2. ✅ Ensure UTF-8 editor configuration
3. ✅ Be on the `story_1_2` git branch
4. ✅ Have clean git status

**You're ready to implement Phase 1! 🎉**
