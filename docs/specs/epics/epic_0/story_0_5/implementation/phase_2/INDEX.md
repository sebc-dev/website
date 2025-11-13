# Phase 2 - Durable Objects Bindings Configuration

**Status**: 🚧 NOT STARTED
**Phase of Story**: 0.5 (Configurer wrangler.toml avec bindings)
**Created**: 2025-11-12
**Target Completion**: TBD

---

## 📋 Quick Navigation

### Documentation Structure

```
phase_2/
├── INDEX.md (this file)
├── IMPLEMENTATION_PLAN.md (atomic strategy + 4 commits)
├── COMMIT_CHECKLIST.md (detailed checklist per commit)
├── ENVIRONMENT_SETUP.md (environment setup)
├── validation/
│   └── VALIDATION_CHECKLIST.md (final validation)
└── guides/
    ├── REVIEW.md (code review guide)
    └── TESTING.md (testing strategy)
```

**Related Documentation**:

- [Story 0.5 Specification](../../story_0.5.md)
- [PHASES_PLAN.md](../PHASES_PLAN.md) - Strategic overview
- [Phase 1: R2 Bucket Configuration](../phase_1/INDEX.md) - Previous phase

---

## 🎯 Phase Objective

Configure Durable Objects (DO) bindings for Incremental Static Regeneration (ISR) queue and tag cache. This phase establishes the infrastructure for managing ISR revalidation tasks and enabling granular cache invalidation via `revalidateTag()` and `revalidatePath()`.

After Phase 2, the application will have a complete ISR queue system and tag cache backend, enabling Next.js features like:

- Background revalidation of static pages
- Tag-based cache invalidation
- Distributed cache management across Cloudflare Edge network

### Scope

- ✅ Add `NEXT_CACHE_DO_QUEUE` Durable Objects binding for ISR queue
- ✅ Add `NEXT_TAG_CACHE_DO_SHARDED` Durable Objects binding for tag cache (sharded for scalability)
- ✅ Document Durable Objects architecture and sharding strategy
- ✅ Document DO vs D1 trade-offs for tag cache
- ✅ Validate DO bindings locally via `wrangler dev`

---

## 📚 Available Documents

| Document                                                                       | Description                   | For Who    | Duration  |
| ------------------------------------------------------------------------------ | ----------------------------- | ---------- | --------- |
| **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)**                         | Atomic strategy in 4 commits  | Developer  | 15 min    |
| **[COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md)**                               | Detailed checklist per commit | Developer  | Reference |
| **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)**                             | Environment variables & setup | DevOps/Dev | 10 min    |
| **[guides/REVIEW.md](./guides/REVIEW.md)**                                     | Code review guide             | Reviewer   | 20 min    |
| **[guides/TESTING.md](./guides/TESTING.md)**                                   | Manual validation strategy    | QA/Dev     | 20 min    |
| **[validation/VALIDATION_CHECKLIST.md](./validation/VALIDATION_CHECKLIST.md)** | Final validation checklist    | Tech Lead  | 30 min    |

---

## 🔄 Implementation Workflow

### Step 1: Initial Setup

```bash
# Read the Phase 2 implementation plan
cat docs/specs/epics/epic_0/story_0_5/implementation/phase_2/IMPLEMENTATION_PLAN.md

# Setup environment (if needed)
cat docs/specs/epics/epic_0/story_0_5/implementation/phase_2/ENVIRONMENT_SETUP.md
```

### Step 2: Atomic Implementation (4 commits)

```bash
# For each commit, follow the detailed checklist:
cat docs/specs/epics/epic_0/story_0_5/implementation/phase_2/COMMIT_CHECKLIST.md
```

**Commits in order**:

1. Commit 1: Add DO bindings to wrangler.jsonc
2. Commit 2: Document DO architecture and sharding strategy
3. Commit 3: Create DO vs D1 comparison guide
4. Commit 4: Validate bindings and add binding reference documentation

### Step 3: Validation

```bash
# Run type checking
pnpm tsc --noEmit

# Run linting
pnpm lint

# Build and verify
pnpm build

# Start development server and verify no binding errors
pnpm dev
```

### Step 4: Final Approval

Complete the VALIDATION_CHECKLIST.md and request final approval before moving to Phase 3.

---

## 🎯 Use Cases by Profile

### 🧑‍💻 Developer

**Goal**: Implement Phase 2 step-by-step

1. Read IMPLEMENTATION_PLAN.md (15 min)
2. Follow COMMIT_CHECKLIST.md for each of 4 commits
3. Validate after each commit
4. Use guides/TESTING.md for manual validation

**Time Estimate**: 2-3h implementation + 1-1.5h validation

### 👀 Code Reviewer

**Goal**: Review implementation efficiently

1. Read IMPLEMENTATION_PLAN.md to understand strategy
2. Use guides/REVIEW.md for commit-by-commit review
3. Verify against VALIDATION_CHECKLIST.md
4. Check Cloudflare Dashboard for DO bindings

**Time Estimate**: 1-1.5h total review

### 📊 Tech Lead / Project Manager

**Goal**: Track progress and quality

1. Check INDEX.md for status
2. Review IMPLEMENTATION_PLAN.md for metrics
3. Use VALIDATION_CHECKLIST.md for final approval

---

## 📊 Metrics

| Metric                    | Target                                   | Actual |
| ------------------------- | ---------------------------------------- | ------ |
| **Total Commits**         | 4                                        | -      |
| **Files Modified**        | 2-3 (wrangler.jsonc, docs)               | -      |
| **Documentation Created** | 3 doc files (~1500 lines)                | -      |
| **Implementation Time**   | 2-3h                                     | -      |
| **Review Time**           | 1-1.5h                                   | -      |
| **Type Safety**           | 100% (JSON validation)                   | -      |
| **Validation Success**    | ✅ `wrangler dev` runs without DO errors | -      |

---

## 📋 Phase Dependencies

### Depends On

- ✅ **Phase 1**: R2 bucket created and binding configured
- ✅ **Story 0.1**: Next.js initialized
- ✅ **Story 0.2**: OpenNext adapter configured
- ✅ **Story 0.6**: Compatibility flags set

### Blocks

- 🚧 **Phase 3**: Service Binding & OpenNext Activation (requires DO bindings to exist)
- 📋 **Story 0.7**: CI/CD (requires complete bindings configuration)

---

## 🔍 Key Concepts - Durable Objects

### What are Durable Objects?

Durable Objects are a Cloudflare compute primitive that provide:

- **Persistent state** across function invocations
- **Strong consistency** (ACID-like guarantees)
- **Coordinated execution** (only one instance runs at a time)

**Perfect for**:

- Counters and accumulators
- Queues (ISR revalidation)
- Caches (tag-based invalidation)
- Rate limiting
- Coordination

### Architecture Overview

```
┌─────────────────────────────────────────┐
│      Next.js Application                 │
│  (Pages with revalidate, ISR)            │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
   ┌────────┐   ┌──────────────────┐
   │ R2     │   │ Durable Objects   │
   │Cache   │   │                   │
   │(ISR)   │   │ - Queue (ISR)     │
   │        │   │ - Tags (Sharded)  │
   └────────┘   └──────────────────┘
        │             │
        └──────┬──────┘
               ▼
        [Cloudflare Edge]
```

### Two DO Bindings in This Phase

#### 1. NEXT_CACHE_DO_QUEUE (ISR Revalidation Queue)

- **Purpose**: Queue ISR pages for background revalidation
- **Class**: `DOQueueHandler` (provided by OpenNext)
- **Provides OpenNext with**:
  - Async queue for revalidation tasks
  - Prevents blocking ISR regeneration
  - Handles queue persistence and retry logic

**ISR Flow**:

```
1. User requests page with revalidate: 3600
2. Page served from R2 cache (if exists)
3. If stale: added to DO_QUEUE
4. Background job regenerates page
5. New version cached in R2
```

#### 2. NEXT_TAG_CACHE_DO_SHARDED (Tag-Based Cache Invalidation)

- **Purpose**: Track which cached pages belong to which tags
- **Class**: `DOTagCacheShard` (provided by OpenNext)
- **Provides OpenNext with**:
  - Tag → page mapping for cache invalidation
  - Sharded (multiple instances) for scalability
  - Used by `revalidateTag()` to bust cache

**Sharding Strategy**:

```
When revalidateTag('articles') is called:
1. Hash 'articles' to determine shard number
2. Query NEXT_TAG_CACHE_DO_SHARDED[shard]
3. Get list of pages with tag 'articles'
4. Invalidate each page in R2 cache
5. Result: Instant cache invalidation
```

---

## ⚠️ Important Notes

### DO vs D1 for Tag Cache

| Aspect          | Durable Objects                  | D1 (SQLite)                |
| --------------- | -------------------------------- | -------------------------- |
| **Consistency** | Strong (immediate)               | Strong (immediate)         |
| **Performance** | Very fast (<1ms)                 | Fast (1-10ms)              |
| **Scalability** | Sharded (excellent)              | Limited (single DB)        |
| **Cost**        | $0.15/million requests + compute | Pay per query              |
| **Free Tier**   | 1M requests/month                | Included in plan           |
| **Best For**    | High traffic (10k+ req/day)      | Low traffic (<10k req/day) |
| **Recommended** | ✅ Production                    | ✅ Development/testing     |

**This phase uses Durable Objects (production-recommended)**. D1 alternative documented in Phase 2 guide.

### Durable Objects Classes

Both classes are **provided by OpenNext** (`@opennextjs/cloudflare`), not custom implementations:

```ts
import { DOQueueHandler } from '@opennextjs/cloudflare/durable-objects';
import { DOTagCacheShard } from '@opennextjs/cloudflare/durable-objects';
```

The wrangler.jsonc simply declares which classes to use.

---

## 🚨 Risk Assessment

### Phase Risks

| Risk                        | Likelihood | Impact | Mitigation                                                   |
| --------------------------- | ---------- | ------ | ------------------------------------------------------------ |
| DO class names incorrect    | Low        | High   | Use exact names from OpenNext docs, validate in wrangler dev |
| DO binding typos in config  | Medium     | High   | Follow commit checklist carefully, compare with docs         |
| Missing DO migrations/setup | Low        | Medium | Verify with wrangler dev (errors will appear in logs)        |
| DO costs spike              | Low        | Medium | Document pricing, set budget alerts in Cloudflare Dashboard  |

### Mitigation Strategies

✅ Follow COMMIT_CHECKLIST.md exactly
✅ Validate each commit with `wrangler dev`
✅ Cross-reference OpenNext documentation
✅ Check Cloudflare Dashboard after Phase 3 completes (verify DO instances created)

---

## 📝 Success Criteria

Phase 2 is complete when:

- [ ] `NEXT_CACHE_DO_QUEUE` binding added to wrangler.jsonc
- [ ] `NEXT_TAG_CACHE_DO_SHARDED` binding added to wrangler.jsonc
- [ ] `wrangler dev` starts without DO binding errors
- [ ] Logs show DO bindings available: `env.NEXT_CACHE_DO_QUEUE`, `env.NEXT_TAG_CACHE_DO_SHARDED`
- [ ] Architecture documentation complete (DO architecture diagram, sharding explanation)
- [ ] DO vs D1 comparison guide created
- [ ] All validation checks pass
- [ ] Ready for Phase 3 (Service Binding & OpenNext Activation)

---

## 🔗 Reference Documents

### Story & Phase Context

- **Story 0.5**: [story_0.5.md](../../story_0.5.md) - Complete story specification
- **Phases Plan**: [PHASES_PLAN.md](../PHASES_PLAN.md) - Strategic overview of all 3 phases
- **Phase 1**: [phase_1/INDEX.md](../phase_1/INDEX.md) - R2 Bucket Configuration (prerequisite)

### Project Specifications

- **Architecture**: [Architecture_technique.md](../../../../Architecture_technique.md) - Technical architecture
- **Brief**: [Brief.md](../../../../Brief.md) - Project goals and constraints
- **PRD**: [PRD.md](../../../../PRD.md) - Full product requirements

### External Resources

- **OpenNext Caching**: https://opennext.js.org/cloudflare/caching
- **Cloudflare Durable Objects**: https://developers.cloudflare.com/durable-objects/
- **Durable Objects Pricing**: https://developers.cloudflare.com/durable-objects/platform/pricing/
- **Wrangler Configuration**: https://developers.cloudflare.com/workers/wrangler/configuration/

---

## 🎓 Phase Overview Diagram

```
PHASE 2: Durable Objects Bindings
┌────────────────────────────────────────────────────────┐
│ Goal: Configure DO bindings for ISR queue & tag cache  │
└────────────────────────────────────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
     Commit 1        Commit 2       Commit 3        Commit 4
         │              │              │              │
         ▼              ▼              ▼              ▼
    Add DO         Document DO    DO vs D1      Validate &
    Bindings      Architecture    Comparison     Reference
    (config)      (diagrams)       Guide         Documentation
         │              │              │              │
         └──────────────┼──────────────┴──────────────┘
                        │
                        ▼
              ✅ Phase 2 Complete
              wrangler.jsonc with DO
              Architecture documented
              Ready for Phase 3
```

---

**Phase Created**: 2025-11-12
**Last Updated**: 2025-11-12
**Status**: 🚧 NOT STARTED
**Next Phase**: [Phase 3 - Service Binding & OpenNext Activation](../phase_3/INDEX.md)
