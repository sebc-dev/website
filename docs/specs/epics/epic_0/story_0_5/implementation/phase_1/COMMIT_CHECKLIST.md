# Phase 1 - Checklist per Commit

This document provides a detailed checklist for each atomic commit of Phase 1.

---

## 📋 Commit 1: Create R2 Bucket via Wrangler

**Files**: None (Cloudflare infrastructure only)
**Estimated Duration**: 15-20 minutes

### Prerequisites

- [ ] Cloudflare account with R2 access
- [ ] Wrangler CLI installed and authenticated
- [ ] Verified account has R2 enabled (`wrangler r2 bucket list` works)

### Implementation Tasks

- [ ] Verify no existing bucket with name `sebc-next-cache`

  ```bash
  wrangler r2 bucket list | grep sebc-next-cache
  # Should return empty
  ```

- [ ] Create R2 bucket

  ```bash
  wrangler r2 bucket create sebc-next-cache
  ```

- [ ] Verify bucket creation succeeded

  ```bash
  wrangler r2 bucket list
  # Should show "sebc-next-cache" in output
  ```

- [ ] Verify bucket in Cloudflare Dashboard
  - Navigate to: Workers & Pages → R2 → Buckets
  - Confirm `sebc-next-cache` appears in list

- [ ] Document bucket details
  - Name: `sebc-next-cache`
  - Purpose: Next.js ISR cache storage
  - Region: Auto (Cloudflare global distribution)
  - Created: [current date]

### Validation

```bash
# Verify bucket exists
wrangler r2 bucket list | grep sebc-next-cache

# Check bucket info (optional)
# wrangler r2 bucket list --json | jq '.[] | select(.name=="sebc-next-cache")'
```

**Expected Result**: Bucket `sebc-next-cache` appears in list and Cloudflare Dashboard

### Review Checklist

#### Infrastructure

- [ ] Bucket created with exact name: `sebc-next-cache`
- [ ] Bucket visible in Wrangler CLI (`wrangler r2 bucket list`)
- [ ] Bucket visible in Cloudflare Dashboard
- [ ] No errors during creation
- [ ] Bucket is empty (no objects uploaded yet)

#### Documentation

- [ ] Commit message documents bucket name
- [ ] Commit message documents bucket purpose
- [ ] Commit message includes "Part of Epic 0 Story 0.5 Phase 1 - Commit 1/3"

### Commit Message

```bash
# No files to add (infrastructure only), but document the action
git commit --allow-empty -m "chore(infra): create R2 bucket for Next.js ISR cache

- Bucket name: sebc-next-cache
- Purpose: OpenNext incremental cache storage
- Region: Auto (Cloudflare global)
- Free tier: 10 GB storage, 1M writes, 10M reads/month

Validated:
- Bucket appears in \`wrangler r2 bucket list\`
- Bucket visible in Cloudflare Dashboard

Part of Epic 0 Story 0.5 Phase 1 - Commit 1/3"
```

**Note**: Use `--allow-empty` because no files are changed, but we want to document the infrastructure change in git history.

---

## 📋 Commit 2: Add R2 Binding to wrangler.jsonc

**Files**: `wrangler.jsonc` (modified)
**Estimated Duration**: 30-40 minutes

### Prerequisites

- [ ] Commit 1 completed (R2 bucket exists)
- [ ] `wrangler.jsonc` file exists in project root
- [ ] Current `wrangler.jsonc` is valid JSON

### Implementation Tasks

- [ ] Open `wrangler.jsonc` for editing

- [ ] Locate the appropriate position to add `r2_buckets` section
  - After `d1_databases` array
  - Before `observability` section or end of file
  - Follow existing structure and indentation

- [ ] Add `r2_buckets` configuration

  ```jsonc
  /**
   * R2 Buckets
   * For Next.js Incremental Static Regeneration (ISR) cache storage
   * OpenNext uses R2 to persist generated static pages across deployments
   * https://opennext.js.org/cloudflare/caching
   */
  "r2_buckets": [
    {
      "binding": "NEXT_INC_CACHE_R2_BUCKET",
      "bucket_name": "sebc-next-cache"
    }
  ],
  ```

- [ ] Verify JSON syntax is valid

  ```bash
  cat wrangler.jsonc | jq empty
  # Should output nothing (success) or show syntax errors
  ```

- [ ] Ensure no trailing commas (common JSONC mistake)

- [ ] Ensure consistent indentation (2 spaces, matching existing style)

- [ ] Verify binding name matches OpenNext convention
  - Must be: `NEXT_INC_CACHE_R2_BUCKET` (exact case)
  - This is the standard OpenNext binding name

- [ ] Verify bucket name matches Commit 1
  - Must be: `sebc-next-cache` (exact match)

### Validation

```bash
# Validate JSON syntax
cat wrangler.jsonc | jq empty
# No output = success

# Pretty-print to verify structure
cat wrangler.jsonc | jq .

# Test binding with wrangler dev
wrangler dev
# Should start without "R2 bucket not found" errors
# Look for: "✅ R2 Buckets: NEXT_INC_CACHE_R2_BUCKET" in output
```

**Expected Result**: `wrangler dev` starts successfully, R2 binding is accessible

### Review Checklist

#### Configuration

- [ ] `r2_buckets` array added to wrangler.jsonc
- [ ] Binding name is `NEXT_INC_CACHE_R2_BUCKET` (exact)
- [ ] Bucket name is `sebc-next-cache` (matches Commit 1)
- [ ] JSON syntax is valid (no errors from `jq`)
- [ ] No trailing commas
- [ ] Indentation matches existing file (2 spaces)

#### Comments

- [ ] Inline comment explains purpose ("ISR cache storage")
- [ ] Comment links to OpenNext caching docs
- [ ] Comment is clear and concise

#### Testing

- [ ] `wrangler dev` starts without errors
- [ ] No "R2 bucket not found" errors in logs
- [ ] Binding appears in startup logs

#### Code Quality

- [ ] Follows existing wrangler.jsonc style
- [ ] No unrelated changes
- [ ] Git diff shows only r2_buckets addition

### Commit Message

```bash
git add wrangler.jsonc
git commit -m "chore(config): add R2 bucket binding to wrangler.jsonc

- Binding: NEXT_INC_CACHE_R2_BUCKET
- Points to: sebc-next-cache bucket
- Enables: Next.js ISR via OpenNext adapter
- Reference: https://opennext.js.org/cloudflare/caching

Configuration:
- Added r2_buckets array with single bucket binding
- Follows OpenNext naming convention
- Includes inline documentation comments

Validated:
- JSON syntax valid (jq check passed)
- wrangler dev starts without R2 errors
- Binding accessible in worker runtime

Part of Epic 0 Story 0.5 Phase 1 - Commit 2/3"
```

---

## 📋 Commit 3: Document R2 Cache Architecture

**Files**:

- `docs/architecture/CACHE_ARCHITECTURE.md` (new)
- `docs/deployment/CLOUDFLARE_RESOURCES.md` (new)

**Estimated Duration**: 60-90 minutes

### Prerequisites

- [ ] Commit 1 completed (bucket exists)
- [ ] Commit 2 completed (binding configured)
- [ ] Understanding of OpenNext cache architecture
- [ ] Understanding of ISR (Incremental Static Regeneration)

### Implementation Tasks

#### Create docs/architecture/CACHE_ARCHITECTURE.md

- [ ] Create `docs/architecture/` directory if needed

  ```bash
  mkdir -p docs/architecture
  ```

- [ ] Create `CACHE_ARCHITECTURE.md` with the following sections:

  **1. Overview Section** (~30 lines)
  - [ ] Explain OpenNext cache architecture on Cloudflare
  - [ ] List cache layers: R2 (Phase 1), DO (Phase 2), Service bindings (Phase 3)
  - [ ] Explain progressive cache activation across phases

  **2. R2 Incremental Cache Section** (~50 lines)
  - [ ] Purpose: Persistent storage for ISR-generated pages
  - [ ] How it works: Next.js revalidate → page generation → R2 storage → cache hits
  - [ ] Configuration details: binding name, bucket name, location in wrangler.jsonc
  - [ ] Code example: Next.js page with `revalidate`
  - [ ] Performance benefits: global distribution, low latency

  **3. Cache Flow Diagram** (~20 lines)
  - [ ] Create ASCII/Mermaid diagram showing:
    - User request → Worker → R2 check → Cache hit/miss
    - Cache miss → Page generation → Store in R2 → Return to user
    - Cache hit → Return from R2 → Fast response

  **4. Configuration Reference** (~20 lines)
  - [ ] List all R2-related configuration
  - [ ] wrangler.jsonc snippet
  - [ ] Environment variables (if any)
  - [ ] OpenNext config (to be activated in Phase 3)

  **5. Future Phases Preview** (~20 lines)
  - [ ] Phase 2: Durable Objects for queue and tags
  - [ ] Phase 3: Service bindings and full activation
  - [ ] Complete architecture diagram (teaser)

  **6. References** (~10 lines)
  - [ ] Link to OpenNext caching docs
  - [ ] Link to Cloudflare R2 docs
  - [ ] Link to Next.js ISR docs

#### Create docs/deployment/CLOUDFLARE_RESOURCES.md

- [ ] Create `docs/deployment/` directory if needed

  ```bash
  mkdir -p docs/deployment
  ```

- [ ] Create `CLOUDFLARE_RESOURCES.md` with the following sections:

  **1. Overview Section** (~15 lines)
  - [ ] List all Cloudflare resources used in project
  - [ ] Phase 1 scope: R2 bucket only
  - [ ] Future phases: Durable Objects, KV (optional)

  **2. R2 Buckets Section** (~50 lines)
  - [ ] Creating R2 bucket (step-by-step)
  - [ ] Bucket naming conventions
  - [ ] Region/location considerations (auto for global distribution)
  - [ ] Verifying bucket creation

  **3. R2 Pricing Section** (~30 lines)
  - [ ] Free tier limits (10 GB storage, 1M writes, 10M reads/month)
  - [ ] Paid tier costs ($0.015/GB/month, $0.36/M writes, $4.50/M reads)
  - [ ] Cost comparison vs S3/competitors
  - [ ] Example cost calculations for typical blog traffic

  **4. Monitoring & Cost Optimization** (~25 lines)
  - [ ] How to monitor R2 usage in Cloudflare Dashboard
  - [ ] Setting up cost alerts
  - [ ] Optimization tips: TTL tuning, cache headers, pruning old pages
  - [ ] Analytics: cache hit rate, storage trends

  **5. Troubleshooting Section** (~25 lines)
  - [ ] Common Issue 1: "R2 bucket not found"
    - Symptoms, causes, solutions
  - [ ] Common Issue 2: "Permission denied"
    - Symptoms, causes, solutions
  - [ ] Common Issue 3: "wrangler dev fails with R2 error"
    - Symptoms, causes, solutions
  - [ ] Where to get help (Cloudflare community, docs)

### Validation

```bash
# Verify files created
ls -l docs/architecture/CACHE_ARCHITECTURE.md
ls -l docs/deployment/CLOUDFLARE_RESOURCES.md

# Check file sizes (should be substantial)
wc -l docs/architecture/CACHE_ARCHITECTURE.md
# Expected: ~150 lines
wc -l docs/deployment/CLOUDFLARE_RESOURCES.md
# Expected: ~145 lines

# Verify no broken links (manual review)
# Check all internal references work
# Check all external links are accessible

# Verify markdown syntax (optional, if markdownlint installed)
# markdownlint docs/architecture/CACHE_ARCHITECTURE.md
# markdownlint docs/deployment/CLOUDFLARE_RESOURCES.md
```

**Expected Result**: Two comprehensive documentation files created

### Review Checklist

#### CACHE_ARCHITECTURE.md

- [ ] Overview explains OpenNext cache architecture
- [ ] R2's role in ISR is clearly described
- [ ] Cache flow diagram is accurate and helpful
- [ ] Configuration examples are correct
- [ ] Code examples work (Next.js revalidate syntax is correct)
- [ ] Future phases are previewed
- [ ] All links work (internal and external)
- [ ] Markdown formatting is consistent

#### CLOUDFLARE_RESOURCES.md

- [ ] R2 bucket creation guide is step-by-step
- [ ] Pricing information is accurate (verified against Cloudflare docs)
- [ ] Free tier limits are correct
- [ ] Cost examples are realistic
- [ ] Monitoring section explains how to track usage
- [ ] Cost optimization tips are actionable
- [ ] Troubleshooting covers common issues
- [ ] Solutions are clear and testable

#### Code Quality

- [ ] No spelling/grammar errors
- [ ] Technical accuracy verified
- [ ] Examples tested (if applicable)
- [ ] Links checked (no 404s)
- [ ] Formatting consistent (headings, lists, code blocks)

### Commit Message

```bash
git add docs/architecture/CACHE_ARCHITECTURE.md docs/deployment/CLOUDFLARE_RESOURCES.md
git commit -m "docs(architecture): document R2 cache and Cloudflare resources

Created docs/architecture/CACHE_ARCHITECTURE.md:
- OpenNext cache architecture overview
- R2's role in Next.js ISR (Incremental Static Regeneration)
- Cache flow diagram showing request → R2 → response
- Configuration reference for NEXT_INC_CACHE_R2_BUCKET
- Preview of Phase 2 (Durable Objects) and Phase 3 (full activation)

Created docs/deployment/CLOUDFLARE_RESOURCES.md:
- Step-by-step R2 bucket creation guide
- R2 pricing breakdown (free tier + paid tier)
- Cost optimization tips (TTL tuning, cache headers, pruning)
- Monitoring usage via Cloudflare Dashboard
- Troubleshooting common R2 issues

Documentation:
- 295 total lines of comprehensive docs
- Diagrams and code examples included
- All links verified (internal and external)
- Accurate pricing as of $(date +%Y-%m)

Part of Epic 0 Story 0.5 Phase 1 - Commit 3/3"
```

---

## ✅ Final Phase 1 Validation

After all 3 commits:

### Complete Phase Checklist

- [ ] All 3 commits completed and pushed
- [ ] R2 bucket `sebc-next-cache` exists in Cloudflare
- [ ] `wrangler.jsonc` has `NEXT_INC_CACHE_R2_BUCKET` binding
- [ ] `wrangler dev` starts without R2 errors
- [ ] Documentation files created and comprehensive
- [ ] All validation commands passed
- [ ] VALIDATION_CHECKLIST.md completed

### Final Validation Commands

```bash
# Verify bucket exists
wrangler r2 bucket list | grep sebc-next-cache

# Verify binding configured
cat wrangler.jsonc | jq '.r2_buckets[] | select(.binding=="NEXT_INC_CACHE_R2_BUCKET")'

# Verify wrangler dev works
wrangler dev
# Look for: "✅ R2 Buckets: NEXT_INC_CACHE_R2_BUCKET"

# Verify documentation exists
ls docs/architecture/CACHE_ARCHITECTURE.md docs/deployment/CLOUDFLARE_RESOURCES.md
```

### Update EPIC_TRACKING.md

- [ ] Update Story 0.5 progress: "1/3 phases complete"
- [ ] Note Phase 1 completion date
- [ ] Update weighted progress percentage

**Phase 1 is complete when all checkboxes are checked! 🎉**

---

## 📝 Notes

**Time Tracking**:

- Commit 1: ~25 minutes (15 implementation + 10 review)
- Commit 2: ~50 minutes (30 implementation + 20 review)
- Commit 3: ~105 minutes (75 implementation + 30 review)
- **Total**: ~3 hours (2h implementation + 1h review)

**Common Mistakes to Avoid**:

- ❌ Skipping bucket creation (Commit 1) and going straight to binding
- ❌ Typo in bucket name (must match exactly between Commit 1 and 2)
- ❌ Typo in binding name (must be `NEXT_INC_CACHE_R2_BUCKET`)
- ❌ Invalid JSON in wrangler.jsonc (trailing commas)
- ❌ Insufficient documentation (Phase 1 establishes patterns for Phase 2-3)

**Tips for Success**:

- ✅ Validate after each commit (don't wait until the end)
- ✅ Use exact names from spec (avoid variations)
- ✅ Test `wrangler dev` after Commit 2 (catches issues early)
- ✅ Take time with documentation (Commit 3) - it's referenced in future phases
- ✅ Keep commit messages descriptive (future you will thank you)

---

**Ready to implement! Follow this checklist commit-by-commit. Let's build Phase 1! 🚀**
