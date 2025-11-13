# Phase 2 - Testing and Validation Guide

Complete testing and validation strategy for Phase 2 (Durable Objects Bindings Configuration).

---

## 🎯 Testing Strategy

Phase 2 is primarily a **configuration and documentation phase**. It doesn't include code changes that require unit tests. Instead, we use:

1. **Configuration Validation**: Verify JSON/JSONC syntax and binding names
2. **Functional Tests**: Verify bindings are accessible and not causing errors
3. **Documentation Tests**: Verify documentation is complete and accurate
4. **Integration Tests**: Ensure Phase 2 doesn't break existing Phase 1 functionality

**Testing Target**: No specific coverage metrics (configuration phase)
**Testing Focus**: Correctness of binding names and configuration

---

## 🧪 Configuration Validation

### Test 1: wrangler.jsonc Syntax

Verify the configuration file is valid JSONC:

```bash
# Run JSON validation
cat wrangler.jsonc | jq . > /dev/null && echo "✓ JSONC syntax valid" || echo "✗ Syntax error"
```

**Expected Result**: ✓ JSONC syntax valid

**What it checks**:

- No trailing commas
- All quotes properly paired
- Proper nesting of brackets
- Valid JSON/JSONC structure

**Why it matters**: Syntax errors will prevent deployment

---

### Test 2: Binding Names Verification

Verify binding names match specification exactly:

```bash
# Extract binding names
echo "=== Binding Names ==="
cat wrangler.jsonc | jq '.durable_objects.bindings[] | .name' -r

# Expected output:
# NEXT_CACHE_DO_QUEUE
# NEXT_TAG_CACHE_DO_SHARDED
```

**Verification Checklist**:

- [ ] First binding is exactly `NEXT_CACHE_DO_QUEUE`
- [ ] Second binding is exactly `NEXT_TAG_CACHE_DO_SHARDED`
- [ ] No typos or variations
- [ ] Case-sensitive match

**Why it matters**: OpenNext looks for specific binding names. Typos cause runtime errors.

---

### Test 3: Class Names Verification

Verify class names are correct:

```bash
# Extract class names
echo "=== Class Names ==="
cat wrangler.jsonc | jq '.durable_objects.bindings[] | .class_name' -r

# Expected output:
# DOQueueHandler
# DOTagCacheShard
```

**Verification Checklist**:

- [ ] First class is exactly `DOQueueHandler`
- [ ] Second class is exactly `DOTagCacheShard`
- [ ] Case-sensitive match
- [ ] No additional prefixes or suffixes

**Why it matters**: Class names must match OpenNext implementation.

---

### Test 4: Script Name Verification

Verify script_name matches worker name:

```bash
# Get worker name from top of file
echo "=== Worker Name ==="
cat wrangler.jsonc | jq '.name' -r
# Expected: website

# Get script names from DO bindings
echo "=== Script Names ==="
cat wrangler.jsonc | jq '.durable_objects.bindings[] | .script_name' -r
# Expected: website (for both)
```

**Verification Checklist**:

- [ ] Worker `name` is `website`
- [ ] Both DO bindings have `script_name: "website"`
- [ ] They match exactly (case-sensitive)

**Why it matters**: Bindings must reference the correct worker. Mismatch causes binding errors.

---

### Test 5: Configuration Structure

Verify the complete DO configuration structure:

```bash
# Show full durable_objects configuration
cat wrangler.jsonc | jq '.durable_objects'

# Expected output (example):
# {
#   "bindings": [
#     {
#       "name": "NEXT_CACHE_DO_QUEUE",
#       "class_name": "DOQueueHandler",
#       "script_name": "website"
#     },
#     {
#       "name": "NEXT_TAG_CACHE_DO_SHARDED",
#       "class_name": "DOTagCacheShard",
#       "script_name": "website"
#     }
#   ]
# }
```

**Verification Checklist**:

- [ ] `durable_objects` is an object
- [ ] Contains `bindings` array
- [ ] Two items in bindings array
- [ ] Each binding is properly formatted
- [ ] No extraneous fields

**Why it matters**: Wrong structure will cause wrangler errors.

---

## 🔧 Functional Testing

### Test 1: wrangler dev Startup

Verify that development server starts without DO binding errors:

```bash
# Start development server
pnpm dev

# Let it run for ~10 seconds, watch for errors
# Expected: No errors containing:
# - "Durable Object binding 'NEXT_CACHE_DO_QUEUE' not found"
# - "Durable Object binding 'NEXT_TAG_CACHE_DO_SHARDED' not found"
# - "Class 'DOQueueHandler' not found"
# - "Class 'DOTagCacheShard' not found"

# Expected to see:
# - Server running on http://localhost:3000
# - Bindings loaded successfully (or no errors)

# Stop with Ctrl+C
```

**Verification Checklist**:

- [ ] Server starts without errors
- [ ] No binding-related error messages
- [ ] No class name errors
- [ ] R2 binding from Phase 1 still works

**Why it matters**: DO binding errors in dev indicate configuration problems before deployment.

---

### Test 2: Build Validation

Verify build succeeds with DO bindings:

```bash
# Build the project
pnpm build

# Expected: Build succeeds without errors
# Build output should show:
# - Successfully compiled Next.js
# - OpenNext build completed
# - No errors about missing bindings
```

**Verification Checklist**:

- [ ] Build completes without errors
- [ ] No warnings about bindings
- [ ] Output files created (.open-next directory)

**Why it matters**: Build errors prevent deployment.

---

### Test 3: Lint and Format

Verify JSON syntax passes linter:

```bash
# If ESLint configured for JSON
pnpm lint

# Expected: No errors in wrangler.jsonc
# Expected: All files pass linting
```

**Verification Checklist**:

- [ ] ESLint passes
- [ ] No JSON syntax errors
- [ ] Formatting is consistent

**Why it matters**: Consistent style makes maintenance easier.

---

## 📚 Documentation Testing

### Test 1: Markdown Syntax

Verify all documentation files have valid Markdown:

```bash
# Test CACHE_ARCHITECTURE.md
npx remark docs/architecture/CACHE_ARCHITECTURE.md --quiet && echo "✓ Valid" || echo "✗ Errors"

# Test DO_VS_D1_TAG_CACHE.md
npx remark docs/architecture/DO_VS_D1_TAG_CACHE.md --quiet && echo "✓ Valid" || echo "✗ Errors"

# Test BINDINGS_REFERENCE.md
npx remark docs/deployment/BINDINGS_REFERENCE.md --quiet && echo "✓ Valid" || echo "✗ Errors"
```

**Expected Result**: All three should show "✓ Valid"

**Why it matters**: Markdown syntax errors prevent proper rendering.

---

### Test 2: Binding Name Consistency

Verify binding names are consistent across all documentation:

```bash
# Extract binding names from docs
echo "=== From wrangler.jsonc ==="
cat wrangler.jsonc | jq '.durable_objects.bindings[] | .name' -r

echo "=== From CACHE_ARCHITECTURE.md ==="
grep -o "NEXT_CACHE_DO_QUEUE\|NEXT_TAG_CACHE_DO_SHARDED" docs/architecture/CACHE_ARCHITECTURE.md | sort | uniq

echo "=== From DO_VS_D1_TAG_CACHE.md ==="
grep -o "NEXT_CACHE_DO_QUEUE\|NEXT_TAG_CACHE_DO_SHARDED" docs/architecture/DO_VS_D1_TAG_CACHE.md | sort | uniq

echo "=== From BINDINGS_REFERENCE.md ==="
grep -o "NEXT_CACHE_DO_QUEUE\|NEXT_TAG_CACHE_DO_SHARDED" docs/deployment/BINDINGS_REFERENCE.md | sort | uniq
```

**Verification Checklist**:

- [ ] All binding names match across all files
- [ ] No typos or variations
- [ ] All four files have correct binding names

**Why it matters**: Inconsistent documentation causes confusion and copy-paste errors.

---

### Test 3: File Existence

Verify all required documentation files exist:

```bash
# Check all required files
test -f docs/architecture/CACHE_ARCHITECTURE.md && echo "✓ CACHE_ARCHITECTURE.md exists"
test -f docs/architecture/DO_VS_D1_TAG_CACHE.md && echo "✓ DO_VS_D1_TAG_CACHE.md exists"
test -f docs/deployment/BINDINGS_REFERENCE.md && echo "✓ BINDINGS_REFERENCE.md exists"

# Expected: All three ✓ lines
```

**Verification Checklist**:

- [ ] CACHE_ARCHITECTURE.md exists
- [ ] DO_VS_D1_TAG_CACHE.md exists
- [ ] BINDINGS_REFERENCE.md exists

**Why it matters**: Missing files indicate incomplete implementation.

---

### Test 4: Link Validation

Verify internal links in documentation work:

```bash
# Extract links from docs
echo "=== Links in BINDINGS_REFERENCE.md ==="
grep -o "\[.*\](\.\..*\.md)" docs/deployment/BINDINGS_REFERENCE.md

echo "=== Verify files exist ==="
# For each link found, verify the target file exists
# Example: [CACHE_ARCHITECTURE](../architecture/CACHE_ARCHITECTURE.md)
# Should verify: docs/architecture/CACHE_ARCHITECTURE.md exists
```

**Verification Checklist**:

- [ ] All referenced files exist
- [ ] Relative paths are correct
- [ ] No broken links

**Why it matters**: Broken links frustrate readers and reduce documentation usefulness.

---

## 📊 Integration Testing

### Test 1: Phase 1 Compatibility

Verify Phase 2 doesn't break Phase 1 (R2 bucket) functionality:

```bash
# Check R2 bucket still configured
cat wrangler.jsonc | jq '.r2_buckets'

# Expected: NEXT_INC_CACHE_R2_BUCKET binding still present
# [
#   {
#     "binding": "NEXT_INC_CACHE_R2_BUCKET",
#     "bucket_name": "sebc-next-cache"
#   }
# ]
```

**Verification Checklist**:

- [ ] R2 binding still exists
- [ ] Binding name unchanged
- [ ] Bucket name unchanged
- [ ] `pnpm dev` shows no R2 errors

**Why it matters**: Phase 2 should be additive (add DO) not destructive (break R2).

---

### Test 2: D1 Database Compatibility

Verify Phase 2 doesn't break D1 database functionality:

```bash
# Check D1 binding still configured
cat wrangler.jsonc | jq '.d1_databases'

# Expected: DB binding still present (if Phase 0.4 complete)
```

**Verification Checklist**:

- [ ] D1 binding still exists (if configured)
- [ ] Binding name unchanged
- [ ] `pnpm dev` shows no D1 errors

**Why it matters**: Phase 2 should not affect other bindings.

---

## ✅ Validation Checklist

### Configuration Validation

- [ ] wrangler.jsonc syntax is valid (Test 1)
- [ ] DO binding names are correct (Test 2)
- [ ] DO class names are correct (Test 3)
- [ ] Script names match worker name (Test 4)
- [ ] Configuration structure is correct (Test 5)

### Functional Validation

- [ ] `pnpm dev` starts without DO errors (Test 1)
- [ ] `pnpm build` succeeds (Test 2)
- [ ] `pnpm lint` passes (Test 3)

### Documentation Validation

- [ ] All Markdown files are syntactically valid (Test 1)
- [ ] Binding names are consistent across docs (Test 2)
- [ ] All required files exist (Test 3)
- [ ] Internal links work (Test 4)

### Integration Validation

- [ ] Phase 1 (R2) still works (Test 1)
- [ ] Phase 0.4 (D1) still works if configured (Test 2)

---

## 🚀 Test Automation

Optional: Create a test script that runs all validation tests:

```bash
#!/bin/bash
# tests/phase2-validation.sh

echo "=== Phase 2 Validation Tests ==="

# 1. Configuration validation
echo "1. Configuration validation..."
cat wrangler.jsonc | jq . > /dev/null && echo "✓ JSONC syntax valid" || echo "✗ Syntax error"

# 2. Binding names
echo "2. Binding names..."
names=$(cat wrangler.jsonc | jq '.durable_objects.bindings[] | .name' -r)
[[ "$names" == *"NEXT_CACHE_DO_QUEUE"* ]] && echo "✓ Queue binding found" || echo "✗ Queue binding missing"
[[ "$names" == *"NEXT_TAG_CACHE_DO_SHARDED"* ]] && echo "✓ Tag cache binding found" || echo "✗ Tag cache binding missing"

# 3. Class names
echo "3. Class names..."
classes=$(cat wrangler.jsonc | jq '.durable_objects.bindings[] | .class_name' -r)
[[ "$classes" == *"DOQueueHandler"* ]] && echo "✓ Queue handler class found" || echo "✗ Queue handler class missing"
[[ "$classes" == *"DOTagCacheShard"* ]] && echo "✓ Tag cache class found" || echo "✗ Tag cache class missing"

# 4. File existence
echo "4. Documentation files..."
test -f docs/architecture/CACHE_ARCHITECTURE.md && echo "✓ CACHE_ARCHITECTURE.md exists" || echo "✗ Missing"
test -f docs/architecture/DO_VS_D1_TAG_CACHE.md && echo "✓ DO_VS_D1_TAG_CACHE.md exists" || echo "✗ Missing"
test -f docs/deployment/BINDINGS_REFERENCE.md && echo "✓ BINDINGS_REFERENCE.md exists" || echo "✗ Missing"

echo ""
echo "=== Phase 2 Validation Complete ==="
```

Run with:

```bash
bash tests/phase2-validation.sh
```

---

## 🔍 Common Test Failures

### Failure: "JSONC syntax error"

**Cause**: Trailing comma, missing quote, or bracket mismatch
**Solution**: Use `jq .` to identify the error, fix the syntax
**Test Command**: `cat wrangler.jsonc | jq .`

---

### Failure: "Binding not found"

**Cause**: Typo in binding name (e.g., `NEXT_DO_QUEUE` instead of `NEXT_CACHE_DO_QUEUE`)
**Solution**: Compare wrangler.jsonc against specification exactly
**Test Command**: `cat wrangler.jsonc | jq '.durable_objects.bindings[] | .name'`

---

### Failure: "Class not found"

**Cause**: Typo in class name (e.g., `DOQueueHandler` vs `DurableObjectQueue`)
**Solution**: Use exact class names from OpenNext documentation
**Test Command**: `cat wrangler.jsonc | jq '.durable_objects.bindings[] | .class_name'`

---

### Failure: "Script name mismatch"

**Cause**: `script_name` doesn't match the worker name
**Solution**: Verify worker name at top of wrangler.jsonc and update script_name to match
**Test Command**: `cat wrangler.jsonc | jq '.name, .durable_objects.bindings[] | .script_name'`

---

### Failure: "Markdown syntax error"

**Cause**: Invalid Markdown (unclosed code block, improper heading, etc.)
**Solution**: Use remark or Markdown linter to identify issues
**Test Command**: `npx remark [file].md`

---

## 📝 Best Practices

### Configuration Testing

✅ **Do**:

- Validate JSON syntax with `jq`
- Compare binding names character-by-character
- Test with actual `wrangler dev` command
- Verify R2 and D1 bindings still work

❌ **Don't**:

- Assume binding names are correct (verify against spec)
- Skip syntax validation
- Test only in production (test locally first)

### Documentation Testing

✅ **Do**:

- Verify all Markdown files are syntactically valid
- Check binding names are consistent across all docs
- Verify links between documents work
- Read documentation critically (does it make sense?)

❌ **Don't**:

- Skip Markdown validation
- Assume documentation is correct (review carefully)
- Leave broken links
- Include placeholder text

---

## ✨ Phase 2 Testing is Complete When

- [x] All configuration validation tests pass
- [x] All functional validation tests pass
- [x] All documentation validation tests pass
- [x] All integration tests pass
- [x] Ready for Phase 3

**Phase 2 is ready to merge!**
