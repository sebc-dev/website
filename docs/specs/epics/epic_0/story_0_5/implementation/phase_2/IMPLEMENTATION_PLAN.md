# Phase 2 - Atomic Implementation Plan

**Objective**: Configure Durable Objects bindings for ISR queue and tag cache in wrangler.jsonc

---

## 🎯 Overview

### Why an Atomic Approach?

The implementation is split into **4 independent commits** to:

✅ **Facilitate review** - Each commit focuses on a single responsibility
✅ **Enable rollback** - If a commit has issues, revert it without breaking everything
✅ **Progressive validation** - Validate bindings configuration step-by-step
✅ **Documentation as you go** - Architecture explained alongside configuration
✅ **Clear progression** - Configuration → Architecture → Comparison → Validation

### Global Strategy

```
[Commit 1]      [Commit 2]        [Commit 3]         [Commit 4]
Add DO Configs  Document Arch.    DO vs D1 Guide    Validate & Ref.
    ↓               ↓                  ↓                  ↓
 Config OK   Architecture Clear   Design Choices      Ready for
             DOQ & Sharding       Documented          Phase 3
              Explained
```

---

## 📦 The 4 Atomic Commits

### Commit 1: Add Durable Objects Bindings to wrangler.jsonc

**Files**:

- `wrangler.jsonc` (modified - add durable_objects section)

**Size**: ~15 lines
**Duration**: 10-15 min (implementation) + 10-15 min (review)

**Content**:

- [ ] Add `durable_objects` section to wrangler.jsonc
- [ ] Configure `NEXT_CACHE_DO_QUEUE` binding for ISR queue
  - class_name: `DOQueueHandler`
  - script_name: `website`
  - Provides async queue for ISR revalidation
- [ ] Configure `NEXT_TAG_CACHE_DO_SHARDED` binding for tag cache
  - class_name: `DOTagCacheShard`
  - script_name: `website` with `shards: 32` (default sharding)
  - Provides tag-based cache invalidation at scale

**Why it's atomic**:

- Single responsibility: Configuration only
- Independent: No code dependencies (just JSON config)
- Testable: `wrangler dev` will error if binding names wrong
- Reviewable: Easy to compare against spec

**Technical Validation**:

```bash
# Syntax check
cat wrangler.jsonc | jq .  # or jsonc validator

# Start development server - watch for DO binding errors
pnpm dev
# Expected: No "Durable Object binding 'NEXT_CACHE_DO_QUEUE' not found" errors
# Expected: Logs show bindings loaded
```

**Expected Result**:

- wrangler.jsonc valid and formatted
- `wrangler dev` starts without DO binding errors
- Logs contain: "Durable Objects bindings loaded"

**Review Criteria**:

- [ ] `durable_objects` section added to wrangler.jsonc
- [ ] `NEXT_CACHE_DO_QUEUE` binding configured correctly
- [ ] `NEXT_TAG_CACHE_DO_SHARDED` binding configured correctly
- [ ] Binding names match OpenNext documentation exactly
- [ ] JSON/JSONC syntax is valid
- [ ] Consistent indentation with rest of file
- [ ] Comments added to explain each binding's purpose

**Commit Message**:

```
feat(bindings): Add Durable Objects bindings for ISR queue and tag cache

- Add NEXT_CACHE_DO_QUEUE binding (DOQueueHandler)
  Provides async queue for ISR revalidation tasks
- Add NEXT_TAG_CACHE_DO_SHARDED binding (DOTagCacheShard)
  Provides sharded tag cache for revalidateTag() support
  Default: 32 shards for scalability

These bindings enable OpenNext ISR architecture on Cloudflare Workers.
Prerequisite: Phase 1 (R2 bucket) must be complete.

Part of Phase 2 - Commit 1/4
```

---

### Commit 2: Document Durable Objects Architecture

**Files**:

- `docs/architecture/CACHE_ARCHITECTURE.md` (new - DO sections)
- `docs/architecture/CACHE_ARCHITECTURE.md` (if exists, update with DO details)

**Size**: ~600 lines
**Duration**: 20-30 min (implementation) + 15-20 min (review)

**Content**:

- [ ] Create/update CACHE_ARCHITECTURE.md with complete structure:
  - Part 1: Overview (architecture diagram)
  - Part 2: R2 Incremental Cache (from Phase 1)
  - Part 3: Durable Objects Queue (NEW - ISR revalidation mechanism)
  - Part 4: Durable Objects Tag Cache (NEW - sharding strategy)
  - Part 5: How they work together (ISR flow diagram)
- [ ] Include ASCII architecture diagrams:
  - Full cache architecture (R2 + DO Queue + DO Tags)
  - ISR request flow with DO Queue
  - Tag cache sharding strategy (32 shards)
- [ ] Document Durable Objects concepts:
  - What are DO (strong consistency, coordination)
  - Why DO for cache (performance vs D1)
  - Sharding explanation (hash('tag') → shard_id)
  - DO limitations and considerations
- [ ] Add troubleshooting section:
  - Common DO configuration errors
  - How to verify DO bindings in wrangler dev logs
  - Cost implications of DO usage

**Why it's atomic**:

- Single responsibility: Architecture documentation
- Independent: No code changes, purely informational
- Complementary: Explains what was added in Commit 1
- Reviewable: Diagrams and explanations clear for technical review

**Technical Validation**:

```bash
# Verify file created and readable
cat docs/architecture/CACHE_ARCHITECTURE.md

# Check markdown syntax
npx remark docs/architecture/CACHE_ARCHITECTURE.md

# Verify file size (should be ~500-700 lines)
wc -l docs/architecture/CACHE_ARCHITECTURE.md
```

**Expected Result**:

- Complete CACHE_ARCHITECTURE.md created (~600 lines)
- Architecture diagrams clear and accurate
- All binding names match wrangler.jsonc
- Markdown is valid and renders properly

**Review Criteria**:

- [ ] Architecture overview is clear and comprehensive
- [ ] ASCII diagrams are readable and informative
- [ ] ISR flow explanation matches OpenNext architecture
- [ ] DO Queue mechanism explained (why it's needed)
- [ ] DO Tag Cache sharding explained (why 32 shards)
- [ ] All binding names (`NEXT_CACHE_DO_QUEUE`, `NEXT_TAG_CACHE_DO_SHARDED`) match wrangler.jsonc
- [ ] Troubleshooting section covers common issues
- [ ] Diagrams use consistent formatting (ASCII art)
- [ ] No incomplete sections or TODOs left

**Commit Message**:

```
docs: Document Durable Objects architecture for ISR and tag cache

Adds comprehensive documentation to docs/architecture/CACHE_ARCHITECTURE.md:

Architecture Overview:
- Full cache stack (R2 + DO Queue + DO Tags) diagram
- How each component serves the ISR strategy

Durable Objects Queue (ISR Revalidation):
- Purpose: Async queue for background ISR revalidation
- Flow: Page request → R2 cache → DO queue if stale → Regenerate → R2 update
- Prevents blocking user requests during ISR

Durable Objects Tag Cache (Cache Invalidation):
- Purpose: Map tags to cached pages for instant invalidation
- Sharding strategy: 32 shards for high-concurrency scalability
- Flow: revalidateTag('articles') → Query shard → Invalidate pages

Troubleshooting:
- Common DO configuration errors and solutions
- How to verify DO bindings in logs

Part of Phase 2 - Commit 2/4
```

---

### Commit 3: Create DO vs D1 Comparison Guide

**Files**:

- `docs/architecture/DO_VS_D1_TAG_CACHE.md` (new - comparison and decision guide)

**Size**: ~400 lines
**Duration**: 20-25 min (implementation) + 15-20 min (review)

**Content**:

- [ ] Create DO_VS_D1_TAG_CACHE.md with:
  - Executive summary (when to use DO vs D1)
  - Detailed comparison table (performance, cost, scalability, etc.)
  - Decision flowchart (high traffic → DO, low traffic → D1)
  - Implementation guides for both options:
    - DO (production): wrangler.jsonc config + explanation
    - D1 (low-traffic): Alternative setup with D1 database
  - Migration guide (switch from D1 to DO if traffic grows)
  - Cost calculator (estimated costs per traffic level)
  - Performance benchmarks (DO vs D1 latency)

**Table of Contents**:

1. Executive Summary
2. Comparison: Durable Objects vs D1
3. Decision Matrix
4. Implementation: Durable Objects (chosen for Phase 2)
5. Alternative: D1 for Low-Traffic Sites
6. Migration Path (D1 → DO)
7. Cost Analysis
8. Performance Benchmarks
9. FAQ

**Why it's atomic**:

- Single responsibility: Design decision documentation
- Independent: Explains rationale without changing code
- Forward-looking: Documents alternatives for future decisions
- Reviewable: Clear comparison helps team understand trade-offs

**Technical Validation**:

```bash
# Verify file created
cat docs/architecture/DO_VS_D1_TAG_CACHE.md

# Check markdown syntax
npx remark docs/architecture/DO_VS_D1_TAG_CACHE.md

# Verify line count
wc -l docs/architecture/DO_VS_D1_TAG_CACHE.md
```

**Expected Result**:

- Complete DO_VS_D1_TAG_CACHE.md created (~400 lines)
- Comparison is objective and well-researched
- Decision logic is clear for future team members
- No errors or broken references

**Review Criteria**:

- [ ] Executive summary is concise and actionable
- [ ] Comparison table is accurate (performance, cost, scalability)
- [ ] Decision flowchart matches real-world traffic patterns
- [ ] DO implementation section matches wrangler.jsonc from Commit 1
- [ ] D1 alternative is complete and realistic
- [ ] Migration guide is practical and step-by-step
- [ ] Cost analysis includes free tier limits
- [ ] Performance benchmarks are realistic
- [ ] FAQ addresses common questions
- [ ] All references to binding names are correct
- [ ] No incomplete sections

**Commit Message**:

```
docs: Add DO vs D1 comparison guide for tag cache decision

Creates docs/architecture/DO_VS_D1_TAG_CACHE.md explaining:

Why Durable Objects for Production:
- Strong consistency (immediate invalidation)
- High performance (<1ms queries)
- Excellent scalability (32-shard sharding)
- Cost-effective for high traffic (1M free requests/month)

When D1 is Better:
- Low traffic (<10k requests/day)
- Cost-sensitive deployments
- Simpler operations (single DB)

Decision Matrix:
- Traffic level → Recommended choice
- Cost considerations → Budget impact
- Performance requirements → DO vs D1

Includes:
- Complete implementation guides for both options
- Migration path (D1 → DO if traffic grows)
- Cost calculator and performance benchmarks
- FAQ for common questions

This phase uses Durable Objects (production-recommended).
Alternative documented for future flexibility.

Part of Phase 2 - Commit 3/4
```

---

### Commit 4: Add Binding Reference Documentation

**Files**:

- `docs/deployment/BINDINGS_REFERENCE.md` (modified or new - add DO bindings section)

**Size**: ~300 lines (adding ~150 lines for DO bindings)
**Duration**: 15-20 min (implementation) + 10-15 min (review)

**Content**:

- [ ] Create/update BINDINGS_REFERENCE.md with complete binding registry
  - Part 1: Quick reference table (all bindings in project)
  - Part 2: R2 Bindings (from Phase 1)
  - Part 3: Durable Objects Bindings (NEW - complete documentation)
    - NEXT_CACHE_DO_QUEUE: ISR queue details
    - NEXT_TAG_CACHE_DO_SHARDED: Tag cache details
  - Part 4: How to use each binding in code (examples)
  - Part 5: Troubleshooting (binding errors, debugging)

**Detailed DO Sections**:

For `NEXT_CACHE_DO_QUEUE`:

- Binding name and type
- Purpose (ISR queue)
- Class name (DOQueueHandler from @opennextjs/cloudflare)
- How OpenNext uses it (async revalidation)
- Environment variable name in code
- Cloudflare Dashboard location

For `NEXT_TAG_CACHE_DO_SHARDED`:

- Binding name and type
- Purpose (tag cache)
- Class name (DOTagCacheShard from @opennextjs/cloudflare)
- How OpenNext uses it (revalidateTag support)
- Sharding details (32 shards by default)
- Environment variable name in code
- Cloudflare Dashboard location

**Why it's atomic**:

- Single responsibility: Create unified binding reference
- Complementary: Summarizes what was configured in Commits 1-3
- Practical: Developers reference this when using bindings
- Reviewable: Quick reference easy to verify against wrangler.jsonc

**Technical Validation**:

```bash
# Verify file created/updated
cat docs/deployment/BINDINGS_REFERENCE.md

# Check markdown syntax
npx remark docs/deployment/BINDINGS_REFERENCE.md

# Verify binding names match wrangler.jsonc
grep "NEXT_CACHE_DO_QUEUE\|NEXT_TAG_CACHE_DO_SHARDED" wrangler.jsonc
grep "NEXT_CACHE_DO_QUEUE\|NEXT_TAG_CACHE_DO_SHARDED" docs/deployment/BINDINGS_REFERENCE.md
```

**Expected Result**:

- Complete BINDINGS_REFERENCE.md updated or created (~300 lines)
- All binding names match wrangler.jsonc exactly
- Code examples are accurate and tested
- Reference is comprehensive and easy to navigate

**Review Criteria**:

- [ ] Quick reference table is complete and up-to-date
- [ ] DO bindings section is detailed and clear
- [ ] NEXT_CACHE_DO_QUEUE documentation is complete
- [ ] NEXT_TAG_CACHE_DO_SHARDED documentation is complete
- [ ] Binding names match wrangler.jsonc exactly
- [ ] Code examples are accurate
- [ ] Troubleshooting section addresses common issues
- [ ] References to related docs (CACHE_ARCHITECTURE.md, DO_VS_D1_TAG_CACHE.md) are correct
- [ ] Cloudflare Dashboard paths are accurate
- [ ] No broken links or references

**Commit Message**:

```
docs: Add Durable Objects bindings to central reference guide

Adds DO bindings documentation to docs/deployment/BINDINGS_REFERENCE.md:

NEXT_CACHE_DO_QUEUE (ISR Revalidation):
- Class: DOQueueHandler (from @opennextjs/cloudflare)
- Purpose: Async queue for ISR page revalidation
- Usage: Internal to OpenNext, not directly accessed
- Monitoring: Cloudflare Dashboard → Durable Objects

NEXT_TAG_CACHE_DO_SHARDED (Cache Invalidation):
- Class: DOTagCacheShard (from @opennextjs/cloudflare)
- Purpose: Tag → page mapping for revalidateTag() support
- Shards: 32 (for concurrency and performance)
- Usage: Internal to OpenNext via revalidateTag()
- Monitoring: Cloudflare Dashboard → Durable Objects

Complete Reference:
- Quick reference table of all project bindings
- Environment variable names
- Purpose and usage for each binding
- Code examples
- Troubleshooting common issues
- References to detailed architecture guides

Part of Phase 2 - Commit 4/4
```

---

## 🔄 Implementation Workflow

### Step-by-Step

1. **Read specification**: Understand DO architecture fully (read INDEX.md and PHASES_PLAN.md)
2. **Setup environment**: No special setup needed (configuration only)
3. **Implement Commit 1**: Modify wrangler.jsonc (10-15 min)
4. **Validate Commit 1**: Run `wrangler dev`, check for DO binding errors
5. **Review Commit 1**: Verify JSON syntax and binding names
6. **Commit Commit 1**: Use provided commit message
7. **Implement Commit 2**: Create CACHE_ARCHITECTURE.md (20-30 min)
8. **Validate Commit 2**: Check markdown syntax, verify diagrams
9. **Review Commit 2**: Architecture clarity and accuracy
10. **Commit Commit 2**: Use provided commit message
11. **Implement Commit 3**: Create DO_VS_D1_TAG_CACHE.md (20-25 min)
12. **Validate Commit 3**: Verify comparison accuracy and completeness
13. **Review Commit 3**: Decision logic and examples
14. **Commit Commit 3**: Use provided commit message
15. **Implement Commit 4**: Create/update BINDINGS_REFERENCE.md (15-20 min)
16. **Validate Commit 4**: Verify all binding names and examples
17. **Review Commit 4**: Quick reference accuracy
18. **Commit Commit 4**: Use provided commit message
19. **Final validation**: Complete VALIDATION_CHECKLIST.md

### Validation at Each Step

After each commit:

```bash
# Type/syntax check (if applicable)
# For JSON: cat wrangler.jsonc | jq .
# For Markdown: npx remark docs/...

# Lint (if linter configured for JSON/Markdown)
pnpm lint

# Start dev server to test bindings
pnpm dev
# Watch logs for "Durable Objects bindings loaded" or DO errors

# Verify file exists and is readable
cat [file_created]
```

All must validate before moving to next commit.

---

## 📊 Commit Metrics

| Commit                 | Type   | Files | Lines      | Impl.      | Review      | Total      |
| ---------------------- | ------ | ----- | ---------- | ---------- | ----------- | ---------- |
| 1. DO Bindings Config  | Config | 1     | ~15        | 10-15m     | 10-15m      | 20-30m     |
| 2. DO Architecture Doc | Docs   | 1     | ~600       | 20-30m     | 15-20m      | 35-50m     |
| 3. DO vs D1 Guide      | Docs   | 1     | ~400       | 20-25m     | 15-20m      | 35-45m     |
| 4. Bindings Reference  | Docs   | 1     | ~300       | 15-20m     | 10-15m      | 25-35m     |
| **TOTAL**              | -      | **4** | **~1,315** | **1-1.5h** | **0.75-1h** | **2-2.5h** |

---

## ✅ Atomic Approach Benefits

### For Developers

- 🎯 **Clear focus**: One type of change per commit
- 🧪 **Testable**: Each commit can validate independently
- 📝 **Documented**: Clear commit messages explain rationale
- 🔄 **Staged progression**: Configuration → Architecture → Decisions → Reference

### For Reviewers

- ⚡ **Fast review**: 10-20 min per commit
- 🔍 **Focused**: Each commit has single purpose
- ✅ **Quality**: Easy to spot configuration or documentation issues
- 📚 **Context**: Related commits build understanding together

### For the Project

- 🔄 **Rollback-safe**: Revert individual commits without breaking
- 📚 **Historical**: Clear progression in git history
- 🏗️ **Maintainable**: Easy to find and understand bindings later
- 🎓 **Educational**: Documentation explains design choices

---

## 📝 Best Practices

### Commit Messages

Format:

```
type(scope): short description (max 50 chars)

- Detailed point 1
- Detailed point 2
- Justification or rationale

Part of Phase 2 - Commit X/4
```

Types: `feat` (config), `docs` (documentation)

### Review Checklist

Before committing:

- [ ] Files created/modified as specified
- [ ] Binding names match specification exactly
- [ ] JSON/JSONC syntax valid
- [ ] Markdown syntax valid
- [ ] No typos or grammatical errors
- [ ] Diagrams are clear and accurate
- [ ] All commit message details are accurate

---

## ⚠️ Important Points

### Do's

- ✅ Follow the commit order (configuration must come first)
- ✅ Validate after each commit (especially binding errors)
- ✅ Use exact binding names from OpenNext docs
- ✅ Cross-reference wrangler.jsonc in all documentation
- ✅ Use provided commit messages as templates

### Don'ts

- ❌ Skip commits or combine them
- ❌ Commit without running `wrangler dev` validation
- ❌ Change binding names from specification
- ❌ Commit without verifying file syntax (JSON/Markdown)
- ❌ Add features not in the spec

---

## ❓ FAQ

**Q: What if wrangler dev shows "binding not found" errors?**
A: Check binding names in wrangler.jsonc match exactly: `NEXT_CACHE_DO_QUEUE` and `NEXT_TAG_CACHE_DO_SHARDED`

**Q: Can I combine commits 2-4 (documentation)?**
A: Not recommended. Separate commits allow easier review and targeted feedback on each aspect.

**Q: What if I find an issue in a previous commit?**
A: Fix in place if not pushed. If pushed, create a targeted fixup commit.

**Q: How do I test DO bindings without Phase 3 complete?**
A: Use `wrangler dev` and watch logs. DO bindings don't error until actively used (Phase 3).

**Q: Should I create the DO classes myself?**
A: No! Classes come from OpenNext (`@opennextjs/cloudflare`). wrangler.jsonc just declares them.
