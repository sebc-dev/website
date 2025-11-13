# Phase 2 - Detailed Checklist per Commit

This document provides a detailed checklist for each atomic commit of Phase 2.

---

## 📋 Commit 1: Add Durable Objects Bindings to wrangler.jsonc

**Files**: wrangler.jsonc
**Estimated Duration**: 20-30 minutes (10-15 min implementation + 10-15 min validation/review)

### Implementation Tasks

- [ ] Open `wrangler.jsonc` in editor
- [ ] Locate the closing of `r2_buckets` section (from Phase 1)
- [ ] Add new `durable_objects` section after `r2_buckets` section with:
  ```jsonc
  "durable_objects": {
    "bindings": [
      {
        "name": "NEXT_CACHE_DO_QUEUE",
        "class_name": "DOQueueHandler",
        "script_name": "website",
        "environment": "production"
      },
      {
        "name": "NEXT_TAG_CACHE_DO_SHARDED",
        "class_name": "DOTagCacheShard",
        "script_name": "website",
        "environment": "production",
        "migrations": [
          {
            "tag": "v1",
            "new_classes": ["DOQueueHandler", "DOTagCacheShard"]
          }
        ]
      }
    ]
  }
  ```
- [ ] Verify JSON/JSONC syntax is valid
- [ ] Ensure proper indentation (2 spaces, consistent with rest of file)
- [ ] Save wrangler.jsonc

### Important Configuration Notes

#### NEXT_CACHE_DO_QUEUE (ISR Queue)

- **name**: Must be exactly `NEXT_CACHE_DO_QUEUE` (OpenNext expects this)
- **class_name**: Must be `DOQueueHandler` (provided by @opennextjs/cloudflare)
- **script_name**: Must match `name` field in wrangler.jsonc (should be `website`)
- **environment**: Set to `production` for clarity

#### NEXT_TAG_CACHE_DO_SHARDED (Tag Cache - Sharded)

- **name**: Must be exactly `NEXT_TAG_CACHE_DO_SHARDED`
- **class_name**: Must be `DOTagCacheShard`
- **script_name**: Must match `name` field in wrangler.jsonc (should be `website`)
- **shards**: Default 32 (can be increased for very high traffic, but 32 is standard)
- **environment**: Set to `production`

### Validation

```bash
# 1. Verify wrangler.jsonc syntax is valid
cat wrangler.jsonc | jq . > /dev/null 2>&1 && echo "✓ JSON syntax valid" || echo "✗ JSON syntax error"

# 2. Extract and verify DO bindings exist
cat wrangler.jsonc | jq '.durable_objects.bindings[] | .name'
# Expected output:
# "NEXT_CACHE_DO_QUEUE"
# "NEXT_TAG_CACHE_DO_SHARDED"

# 3. Start development server and watch for DO binding errors
pnpm dev
# Expected: No errors containing "Durable Object binding" or "not found"
# Expected in logs: Some indication that Durable Objects are configured
# Let it run for ~10 seconds, then stop with Ctrl+C
```

**Expected Result**:

- wrangler.jsonc is valid JSON/JSONC
- `jq` command successfully parses the file
- Both binding names are present: `NEXT_CACHE_DO_QUEUE`, `NEXT_TAG_CACHE_DO_SHARDED`
- `pnpm dev` starts without DO-related errors

### Review Checklist

#### Configuration Accuracy

- [ ] `NEXT_CACHE_DO_QUEUE` binding is present
- [ ] `NEXT_TAG_CACHE_DO_SHARDED` binding is present
- [ ] `class_name` for queue is exactly `DOQueueHandler`
- [ ] `class_name` for tag cache is exactly `DOTagCacheShard`
- [ ] `script_name` is `website` (matches wrangler.toml name)
- [ ] Binding names are exactly as specified (case-sensitive)
- [ ] No typos in any field names

#### File Quality

- [ ] JSON/JSONC syntax is valid (no trailing commas, proper brackets)
- [ ] Indentation is consistent (2 spaces)
- [ ] File ends with newline
- [ ] No comments left from editing
- [ ] Placement is logical (after r2_buckets section)

#### Documentation

- [ ] Consider adding inline comments explaining each binding's purpose:
  ```jsonc
  // Durable Objects for ISR architecture
  "durable_objects": {
    "bindings": [
      {
        // Queue for ISR page revalidation tasks
        "name": "NEXT_CACHE_DO_QUEUE",
        ...
      },
      {
        // Tag cache (sharded) for cache invalidation
        "name": "NEXT_TAG_CACHE_DO_SHARDED",
        ...
      }
    ]
  }
  ```

### Commit Message

```bash
git add wrangler.jsonc

git commit -m "feat(bindings): Add Durable Objects bindings for ISR queue and tag cache

- Add NEXT_CACHE_DO_QUEUE binding (DOQueueHandler)
  Provides async queue for ISR revalidation tasks
- Add NEXT_TAG_CACHE_DO_SHARDED binding (DOTagCacheShard)
  Provides sharded tag cache for revalidateTag() support
  Default: 32 shards for scalability

These bindings enable OpenNext ISR architecture on Cloudflare Workers.
Prerequisite: Phase 1 (R2 bucket) must be complete.

Part of Phase 2 - Commit 1/4"
```

---

## 📋 Commit 2: Document Durable Objects Architecture

**Files**: docs/architecture/CACHE_ARCHITECTURE.md (new or updated)
**Estimated Duration**: 35-50 minutes (20-30 min implementation + 15-20 min review)

### Implementation Tasks

Create `docs/architecture/CACHE_ARCHITECTURE.md` with complete cache architecture documentation:

- [ ] Create file: `docs/architecture/CACHE_ARCHITECTURE.md`
- [ ] Add comprehensive sections:

#### Section 1: Overview (50 lines)

- [ ] Title: "Cache Architecture - OpenNext on Cloudflare Workers"
- [ ] Brief description of full cache stack
- [ ] ASCII diagram showing:
  ```
  ┌─────────────────────────────────────────────┐
  │      Next.js Application                     │
  │  (Pages with revalidate, ISR)                │
  └──────────────┬──────────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
         ▼               ▼
    ┌────────┐   ┌──────────────────┐
    │ R2     │   │ Durable Objects   │
    │ ISR    │   │                   │
    │ Cache  │   │ - Queue (ISR)     │
    │        │   │ - Tags (Sharded)  │
    └────────┘   └──────────────────┘
         │               │
         └───────┬───────┘
                 ▼
          [Cloudflare Edge]
  ```
- [ ] Table of contents for the document

#### Section 2: R2 Incremental Cache (100 lines)

- [ ] Binding name: `NEXT_INC_CACHE_R2_BUCKET` (from Phase 1)
- [ ] Purpose: Store ISR-generated pages persistently
- [ ] Storage pattern (bucket structure)
- [ ] Cache control headers
- [ ] When pages are cached (ISR flow)
- [ ] Cost and performance characteristics
- [ ] Diagram: ISR page storage in R2

#### Section 3: Durable Objects Queue (150 lines)

- [ ] Binding name: `NEXT_CACHE_DO_QUEUE`
- [ ] Class: `DOQueueHandler` (from @opennextjs/cloudflare)
- [ ] Purpose: Async queue for ISR page revalidation
- [ ] How it works:
  ```
  1. User requests page with revalidate: 3600
  2. R2 checks if cached version exists
  3. If exists and not stale: return cached
  4. If stale: return stale + queue revalidation job
  5. Queue runs regeneration in background
  6. When done, updates R2 cache
  ```
- [ ] Include flow diagram
- [ ] Error handling
- [ ] Retry logic (documented by OpenNext)
- [ ] Monitoring in Cloudflare Dashboard

#### Section 4: Durable Objects Tag Cache (150 lines)

- [ ] Binding name: `NEXT_TAG_CACHE_DO_SHARDED`
- [ ] Class: `DOTagCacheShard` (from @opennextjs/cloudflare)
- [ ] Purpose: Map tags to cached pages for instant invalidation
- [ ] Sharding strategy:
  ```
  When revalidateTag('articles') is called:
  1. Hash tag string: hash('articles') = X
  2. X % 32 = shard_number (0-31)
  3. Query NEXT_TAG_CACHE_DO_SHARDED[shard_number]
  4. Get all pages with 'articles' tag
  5. Invalidate each page in R2
  6. Result: Instant, distributed invalidation
  ```
- [ ] Why 32 shards (concurrency benefits)
- [ ] Tag cache data structure
- [ ] Monitoring in Cloudflare Dashboard
- [ ] Performance characteristics

#### Section 5: How They Work Together (100 lines)

- [ ] Complete ISR flow diagram:
  ```
  User Request
       │
       ├─→ Check R2 Cache
       │      │
       ├─→ If cached: Return
       │      │
       ├─→ If stale: Queue DO_QUEUE + Return
       │      │
       ├─→ DO_QUEUE: Run regeneration
       │      │
       ├─→ Update R2 cache
       │      │
       └─→ Next request: Use new version
  ```
- [ ] revalidatePath() flow:
  - Calls revalidateTag() with path-based tags
  - Uses DO Tag Cache to find pages
  - Invalidates in R2
- [ ] revalidateTag() flow:
  - Direct tag cache query
  - Instant invalidation across all pages with tag
- [ ] Cost implications (R2 + DO usage)

#### Section 6: Troubleshooting (50 lines)

- [ ] DO binding configuration errors
- [ ] How to verify bindings are available
- [ ] Common issues and solutions:
  - "DO binding not found" → check wrangler.jsonc
  - "Timeout in DO queue" → check DO worker logs
  - "Tag cache not working" → verify DO migration ran
- [ ] Monitoring tips (Cloudflare Dashboard, logs)
- [ ] Performance troubleshooting

### Validation

```bash
# 1. Verify file created
test -f docs/architecture/CACHE_ARCHITECTURE.md && echo "✓ File exists" || echo "✗ File missing"

# 2. Check markdown syntax (if remark installed)
npx remark docs/architecture/CACHE_ARCHITECTURE.md --quiet && echo "✓ Markdown valid" || echo "✗ Markdown errors"

# 3. Verify line count (should be ~500-700 lines)
wc -l docs/architecture/CACHE_ARCHITECTURE.md

# 4. Check file is readable
cat docs/architecture/CACHE_ARCHITECTURE.md | head -20

# 5. Verify binding names are mentioned
grep -c "NEXT_CACHE_DO_QUEUE\|NEXT_TAG_CACHE_DO_SHARDED\|NEXT_INC_CACHE_R2_BUCKET" docs/architecture/CACHE_ARCHITECTURE.md
# Expected: At least 6+ matches
```

**Expected Result**:

- docs/architecture/CACHE_ARCHITECTURE.md exists
- Markdown syntax is valid
- File is 500-700 lines
- All binding names are present and correctly documented
- Diagrams are readable and informative

### Review Checklist

#### Content Accuracy

- [ ] All binding names match wrangler.jsonc exactly
- [ ] R2 binding (NEXT_INC_CACHE_R2_BUCKET) explained correctly
- [ ] DO Queue binding explained (DOQueueHandler purpose)
- [ ] DO Tag Cache binding explained (DOTagCacheShard purpose)
- [ ] Sharding strategy is accurate (hash-based, 32 shards)
- [ ] ISR flow diagrams are correct
- [ ] revalidateTag() behavior is accurate
- [ ] Cost implications are realistic

#### Documentation Quality

- [ ] ASCII diagrams are readable and clear
- [ ] Diagrams use consistent formatting
- [ ] Section headings are descriptive
- [ ] Content is logically organized
- [ ] Explanations are thorough but concise
- [ ] Code examples are accurate (if included)
- [ ] Troubleshooting section is practical

#### Completeness

- [ ] All 6 sections included
- [ ] No incomplete sections or TODOs
- [ ] No placeholder text remaining
- [ ] Table of contents is accurate
- [ ] References to other docs are correct

### Commit Message

```bash
git add docs/architecture/CACHE_ARCHITECTURE.md

git commit -m "docs: Document Durable Objects architecture for ISR and tag cache

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

Part of Phase 2 - Commit 2/4"
```

---

## 📋 Commit 3: Create DO vs D1 Comparison Guide

**Files**: docs/architecture/DO_VS_D1_TAG_CACHE.md (new)
**Estimated Duration**: 35-45 minutes (20-25 min implementation + 15-20 min review)

### Implementation Tasks

Create `docs/architecture/DO_VS_D1_TAG_CACHE.md` comparing Durable Objects and D1 for tag cache:

- [ ] Create file: `docs/architecture/DO_VS_D1_TAG_CACHE.md`
- [ ] Add comprehensive sections:

#### Section 1: Executive Summary (50 lines)

- [ ] Clear answer: "Use Durable Objects for production, D1 for low-traffic sites"
- [ ] Decision flowchart:
  ```
  Estimated traffic > 10k req/day?
         ↓ YES                  ↓ NO
    Use DO          Use D1 (cost-effective)
  (scalable)
  ```
- [ ] Quick comparison table (next section)

#### Section 2: Comparison Table (100 lines)

- [ ] Create detailed comparison across dimensions:
      | Aspect | Durable Objects | D1 (SQLite) |
      |--------|-----------------|------------|
      | Consistency | Strong, immediate | Strong, immediate |
      | Performance | <1ms | 1-10ms |
      | Scalability | Sharded (excellent) | Limited |
      | Cost | $0.15/M requests + compute | Per-query |
      | Free Tier | 1M requests/month | Included |
      | Query Latency | <1ms typical | 5-10ms typical |
      | Concurrent Queries | 10,000+ shards | Single DB |
      | Setup Complexity | Medium | Low |
      | Recommended For | High traffic | Low traffic |

#### Section 3: When to Use Each (100 lines)

- [ ] Durable Objects (recommended for this project):
  - High traffic (>10k requests/day)
  - Production deployments
  - Unlimited scalability needed
  - Low-latency requirements critical
  - Can afford compute costs
- [ ] D1 Alternative:
  - Low traffic (<10k requests/day)
  - Development/staging environments
  - Cost-sensitive deployments
  - Simpler operations preferred
  - Learning/experimentation

#### Section 4: Implementation - Durable Objects (100 lines)

- [ ] Configuration section (what Phase 2 implements):
  ```jsonc
  "durable_objects": {
    "bindings": [
      {
        "name": "NEXT_TAG_CACHE_DO_SHARDED",
        "class_name": "DOTagCacheShard",
        "script_name": "website"
      }
    ]
  }
  ```
- [ ] How to use in code:
  - OpenNext automatically uses the binding
  - revalidateTag() queries DO shards
  - No manual code needed
- [ ] Monitoring:
  - Cloudflare Dashboard → Durable Objects
  - CPU time, request count, error rates
- [ ] Cost estimation:
  - 1M requests free per month
  - ~$0.15 per million requests beyond free tier
  - Low compute cost for tag cache queries

#### Section 5: Alternative - D1 Tag Cache (100 lines)

- [ ] Configuration (if choosing D1 instead):
  ```jsonc
  "d1_databases": [
    {
      "binding": "NEXT_TAG_CACHE_D1",
      "database_name": "next-tag-cache",
      "database_id": "..."
    }
  ]
  ```
- [ ] D1 Setup:
  - Create D1 database: `wrangler d1 create next-tag-cache`
  - Get database ID from output
  - Add to wrangler.jsonc
- [ ] How to use:
  - OpenNext configuration tells it to use D1
  - Query tags table directly
- [ ] Cost:
  - Pay per query (typically $0.002-0.004 per query)
  - For low traffic: often cheaper than DO
  - No free tier, but typically $1-2/month for low traffic
- [ ] Limitations:
  - Single database (not sharded)
  - Higher latency (5-10ms vs <1ms)
  - Query limits during peak traffic
  - Not recommended for production

#### Section 6: Migration Path (75 lines)

- [ ] "Grow from D1 to DO" strategy:
  - Start with D1 (low setup cost)
  - Monitor traffic growth
  - If >10k req/day: Migrate to DO
- [ ] Migration steps:
  1. Create DO shards
  2. Start writing to both D1 and DO
  3. Verify DO working
  4. Switch OpenNext config to use DO
  5. Monitor for 24h
  6. Decommission D1 if desired
- [ ] Rollback:
  - Keep D1 active during migration
  - Can instantly revert to D1 config
  - No data loss

#### Section 7: Cost Analysis (75 lines)

- [ ] Cost calculator examples:
  - Low traffic (1k req/day): D1 ~$0.50/month ✓
  - Medium traffic (10k req/day): D1 ~$5/month vs DO ~$1.50/month
  - High traffic (100k req/day): D1 impractical vs DO ~$15/month ✓
- [ ] Free tier summary:
  - DO: 1M free requests/month
  - D1: Included in plan, pay per query
- [ ] Charts or examples:

  ```
  Monthly Cost vs Traffic:

  Cost │   D1    DO
       │
  $50  │  D1↗
  $20  │  /
  $5   │ /─╲
  $1   │/    ╲DO
       └─────────────
          Traffic
  ```

#### Section 8: Performance Benchmarks (50 lines)

- [ ] Real-world latency:
  - DO Query: 0.5-2ms (usually <1ms)
  - D1 Query: 5-15ms (varies with query complexity)
  - DO Advantage: 10-20x faster
- [ ] Throughput:
  - DO: 10,000+ concurrent shards
  - D1: ~100 concurrent queries
  - DO Advantage: 100x better concurrency
- [ ] When does D1 performance matter?
  - Not really for tag cache (cached and rarely queried)
  - More relevant if tag cache has high query volume
  - This project: Both are fine for low traffic

#### Section 9: FAQ (75 lines)

- [ ] Q: Can we switch between DO and D1 later?
      A: Yes! Migration path documented. Easy to start with D1, move to DO.
- [ ] Q: Will DO costs explode?
      A: Free tier is 1M requests/month. Costs very low for reasonable traffic.
- [ ] Q: Why not use KV instead?
      A: KV is eventually consistent. DO/D1 have strong consistency needed for cache.
- [ ] Q: Can multiple pages share tags?
      A: Yes! That's the whole point. One tag can invalidate many pages.
- [ ] Q: What if we don't use revalidateTag()?
      A: Then tag cache isn't used. Still need D1 alternative for revalidatePath().
- [ ] Q: How many shards for DO?
      A: Default 32 is good for most sites. Can increase if massive traffic.

### Validation

```bash
# 1. Verify file created
test -f docs/architecture/DO_VS_D1_TAG_CACHE.md && echo "✓ File exists" || echo "✗ File missing"

# 2. Check markdown syntax
npx remark docs/architecture/DO_VS_D1_TAG_CACHE.md --quiet && echo "✓ Markdown valid" || echo "✗ Markdown errors"

# 3. Verify line count (~350-450 lines)
wc -l docs/architecture/DO_VS_D1_TAG_CACHE.md

# 4. Verify all sections present
grep -E "^## " docs/architecture/DO_VS_D1_TAG_CACHE.md | wc -l
# Expected: 8-9 section headers
```

**Expected Result**:

- docs/architecture/DO_VS_D1_TAG_CACHE.md exists
- Markdown syntax is valid
- File is 350-450 lines
- All 9 sections are present
- Comparison table is accurate and complete
- Decision logic is clear

### Review Checklist

#### Content Accuracy

- [ ] Comparison table is accurate and complete
- [ ] Performance numbers are realistic
- [ ] Cost analysis includes realistic estimates
- [ ] Free tier limits are correct (DO: 1M requests/month)
- [ ] Migration path is practical and safe
- [ ] DO configuration matches Phase 2 implementation
- [ ] D1 alternative is complete and correct
- [ ] FAQ addresses real concerns

#### Decision Logic

- [ ] Recommendation is clear (DO for production, D1 for low traffic)
- [ ] Decision flowchart is helpful
- [ ] Threshold (10k requests/day) is justified
- [ ] Migration path is documented
- [ ] Tradeoffs are explained fairly

#### Completeness

- [ ] All 9 sections included
- [ ] No incomplete sections or TODOs
- [ ] Examples are concrete and realistic
- [ ] Cost examples are detailed
- [ ] FAQ covers common questions
- [ ] No placeholder text remaining

### Commit Message

```bash
git add docs/architecture/DO_VS_D1_TAG_CACHE.md

git commit -m "docs: Add DO vs D1 comparison guide for tag cache decision

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

Part of Phase 2 - Commit 3/4"
```

---

## 📋 Commit 4: Add Binding Reference Documentation

**Files**: docs/deployment/BINDINGS_REFERENCE.md (new or modified)
**Estimated Duration**: 25-35 minutes (15-20 min implementation + 10-15 min review)

### Implementation Tasks

Create or update `docs/deployment/BINDINGS_REFERENCE.md` with complete binding reference:

- [ ] Create/update file: `docs/deployment/BINDINGS_REFERENCE.md`
- [ ] Add comprehensive sections:

#### Section 1: Quick Reference Table (50 lines)

- [ ] Table of all project bindings:
      | Binding Name | Type | Purpose | Env Variable |
      |--------------|------|---------|--------------|
      | `ASSETS` | R2 (static) | OpenNext static assets | Internal |
      | `DB` | D1 Database | Application database | Internal |
      | `NEXT_INC_CACHE_R2_BUCKET` | R2 Bucket | ISR page cache | Internal (OpenNext) |
      | `NEXT_CACHE_DO_QUEUE` | Durable Objects | ISR queue | Internal (OpenNext) |
      | `NEXT_TAG_CACHE_DO_SHARDED` | Durable Objects | Tag cache | Internal (OpenNext) |

#### Section 2: R2 Bindings (50 lines)

- [ ] ASSETS binding (static assets)
- [ ] NEXT_INC_CACHE_R2_BUCKET binding (ISR cache)
  - Purpose (from Phase 1)
  - How OpenNext uses it
  - Monitoring location

#### Section 3: Durable Objects Bindings (NEW - 150 lines)

##### NEXT_CACHE_DO_QUEUE (100 lines)

- [ ] Binding name: `NEXT_CACHE_DO_QUEUE`
- [ ] Type: Durable Objects
- [ ] Class: `DOQueueHandler` (from @opennextjs/cloudflare)
- [ ] Purpose:
  - Async queue for ISR page revalidation
  - Manages background regeneration tasks
  - Prevents blocking user requests
- [ ] How OpenNext uses it:
  - When page is stale, task added to queue
  - Queue processes regeneration
  - Updated page cached in R2
- [ ] Usage in code:
  - Not directly accessed by application code
  - Managed internally by OpenNext
  - Configuration in open-next.config.ts
- [ ] Monitoring:
  - Cloudflare Dashboard: Durable Objects
  - Track: Request count, CPU time, errors
  - Location: https://dash.cloudflare.com → Workers & Pages → Durable Objects
- [ ] Cost implications:
  - $0.15 per million requests (beyond 1M free/month)
  - Compute cost (typically 0.5ms per request)
- [ ] Troubleshooting:
  - Check binding name is exactly `NEXT_CACHE_DO_QUEUE`
  - Verify class name is `DOQueueHandler`
  - Watch for timeout errors in logs

##### NEXT_TAG_CACHE_DO_SHARDED (NEW - 50 lines)

- [ ] Binding name: `NEXT_TAG_CACHE_DO_SHARDED`
- [ ] Type: Durable Objects (sharded)
- [ ] Class: `DOTagCacheShard` (from @opennextjs/cloudflare)
- [ ] Purpose:
  - Track which tags are associated with cached pages
  - Enable instant cache invalidation via revalidateTag()
  - Distributed across 32 shards for scalability
- [ ] How OpenNext uses it:
  - When revalidateTag('articles') called
  - Finds all pages tagged with 'articles'
  - Invalidates in R2 cache
  - Instant, distributed invalidation
- [ ] Usage in code:
  - Not directly accessed
  - Used automatically by revalidateTag()
- [ ] Sharding:
  - Default: 32 shards (hash-based distribution)
  - Can increase if traffic demands
  - Better concurrency with more shards
- [ ] Monitoring:
  - Same location as NEXT_CACHE_DO_QUEUE
  - Track: Query count, latency, errors
- [ ] Cost implications:
  - Part of same $0.15/million requests model
  - Very low per-query cost
- [ ] Troubleshooting:
  - Check binding name is exactly `NEXT_TAG_CACHE_DO_SHARDED`
  - Verify class name is `DOTagCacheShard`
  - revalidateTag() should be instant if working

#### Section 4: D1 Database Binding (50 lines)

- [ ] DB binding (application database)
- [ ] Purpose and usage
- [ ] From previous stories (0.4)

#### Section 5: How to Use Each Binding (75 lines)

- [ ] In code examples (for developers):

  ```typescript
  // Most bindings are used internally by OpenNext
  // ASSETS, NEXT_INC_CACHE_R2_BUCKET, NEXT_CACHE_DO_QUEUE, NEXT_TAG_CACHE_DO_SHARDED
  // are automatically used by OpenNext configuration

  // DB is the one you might access directly
  import { getDatabase } from '@/lib/db';
  const db = getDatabase();
  ```

- [ ] Binding availability:
  - Available in `Omit<CloudflareEnv, 'KV'>`
  - All configured in wrangler.jsonc
- [ ] Type definitions:
  - See `src/env.d.ts` for TypeScript types
  - Bindings are typed based on wrangler.jsonc

#### Section 6: Monitoring and Troubleshooting (75 lines)

- [ ] Cloudflare Dashboard:
  - Workers & Pages → Your Worker (website)
  - Analytics: Requests, errors, CPU time
  - Durable Objects section: Instances, requests, costs
- [ ] Local Development (wrangler dev):
  - Watch console output for binding errors
  - DO bindings will show errors if misconfigured
  - R2 will show errors if bucket not created
- [ ] Common Issues:
  - "Binding not found" → Check wrangler.jsonc
  - "Class not found" → Ensure OpenNext types correct
  - "Timeout" → DO instance not responding (rare)
  - "Rate limited" → Too many requests (unlikely for tag cache)
- [ ] Debugging:
  - Add console.log in worker code (if custom)
  - Check Cloudflare real-time logs
  - Monitor CPU time (sign of performance issues)

#### Section 7: References (30 lines)

- [ ] Related documentation:
  - [CACHE_ARCHITECTURE.md](../architecture/CACHE_ARCHITECTURE.md)
  - [DO_VS_D1_TAG_CACHE.md](../architecture/DO_VS_D1_TAG_CACHE.md)
  - [Story 0.5 - wrangler.toml Configuration](../../story_0.5.md)
- [ ] External docs:
  - Cloudflare Durable Objects: https://developers.cloudflare.com/durable-objects/
  - OpenNext Configuration: https://opennext.js.org/cloudflare/
  - Wrangler Configuration: https://developers.cloudflare.com/workers/wrangler/configuration/

### Validation

```bash
# 1. Verify file created/updated
test -f docs/deployment/BINDINGS_REFERENCE.md && echo "✓ File exists" || echo "✗ File missing"

# 2. Check markdown syntax
npx remark docs/deployment/BINDINGS_REFERENCE.md --quiet && echo "✓ Markdown valid" || echo "✗ Markdown errors"

# 3. Verify all binding names are mentioned
grep -c "NEXT_CACHE_DO_QUEUE\|NEXT_TAG_CACHE_DO_SHARDED" docs/deployment/BINDINGS_REFERENCE.md
# Expected: At least 4 mentions each

# 4. Check file size (~250-350 lines)
wc -l docs/deployment/BINDINGS_REFERENCE.md
```

**Expected Result**:

- docs/deployment/BINDINGS_REFERENCE.md created/updated
- Markdown syntax is valid
- File is 250-350 lines
- All binding names mentioned correctly
- Monitoring and troubleshooting sections are practical

### Review Checklist

#### Content Accuracy

- [ ] Quick reference table includes all bindings
- [ ] DO Queue binding documented completely
- [ ] DO Tag Cache binding documented completely
- [ ] Binding names match wrangler.jsonc exactly
- [ ] Class names are accurate (DOQueueHandler, DOTagCacheShard)
- [ ] Purpose explanations are clear
- [ ] Monitoring locations are correct
- [ ] Cost information is accurate

#### Completeness

- [ ] All 7 sections present
- [ ] No incomplete sections or TODOs
- [ ] Code examples are present and accurate
- [ ] References to related docs are correct
- [ ] Troubleshooting covers common issues
- [ ] External documentation links are correct

#### Usability

- [ ] Quick reference table is easy to scan
- [ ] Information is organized logically
- [ ] Section headings are descriptive
- [ ] Examples are clear and practical
- [ ] Navigation between related docs is good

### Commit Message

```bash
git add docs/deployment/BINDINGS_REFERENCE.md

git commit -m "docs: Add Durable Objects bindings to central reference guide

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
- Environment variable names and purposes
- How to use each binding in code
- Monitoring and troubleshooting guides
- References to detailed architecture guides

Part of Phase 2 - Commit 4/4"
```

---

## ✅ Final Phase Validation

After all 4 commits are complete, complete the VALIDATION_CHECKLIST.md and ensure:

- [ ] All 4 commits completed in order
- [ ] All files created/modified as specified
- [ ] All validation commands passed for each commit
- [ ] `wrangler dev` runs without DO binding errors
- [ ] Build succeeds: `pnpm build`
- [ ] All documentation is clear and accurate
- [ ] Cross-references between docs work
- [ ] Ready to proceed to Phase 3

**Phase 2 is complete when all checkboxes are checked!**
