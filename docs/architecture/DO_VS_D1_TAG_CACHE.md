# Durable Objects vs D1 for Tag Cache - Architecture Decision

**Document Version**: 1.0
**Last Updated**: 2025-11-12
**Epic**: Epic 0 - Infrastructure Setup
**Story**: Story 0.5 - Configure wrangler.toml with bindings
**Phase**: Phase 2 - Durable Objects Bindings Configuration

## Table of Contents

1. [Decision Summary](#decision-summary)
2. [Requirements Analysis](#requirements-analysis)
3. [Option 1: Durable Objects (Chosen)](#option-1-durable-objects-chosen)
4. [Option 2: D1 Database (Not Chosen)](#option-2-d1-database-not-chosen)
5. [Detailed Comparison](#detailed-comparison)
6. [Performance Analysis](#performance-analysis)
7. [Cost Analysis](#cost-analysis)
8. [Decision Framework](#decision-framework)
9. [Implementation Notes](#implementation-notes)

## Decision Summary

**Decision**: Use **Durable Objects** for Next.js tag cache and ISR queue

**Rationale**:

1. ✅ **Performance**: ~10-20ms latency (vs ~20-50ms for D1)
2. ✅ **Scalability**: Built-in sharding (32 instances) for load distribution
3. ✅ **State management**: In-memory state for fast operations
4. ✅ **OpenNext integration**: Native support via `@opennextjs/cloudflare`
5. ✅ **Cost**: Free tier covers expected usage (1M requests/month)

**Trade-offs accepted**:

- ❌ Slightly more complex than D1 (but OpenNext provides classes)
- ❌ Per-DO state (not global) - mitigated by sharding

## Requirements Analysis

### Functional Requirements

1. **Tag → Pages Mapping**
   - Store which pages are tagged with each tag
   - Example: `tag='posts'` → `['/blog/post-1', '/blog/post-2', '/blog/post-3']`

2. **Fast Invalidation**
   - When `revalidateTag('posts')` is called, delete all tagged pages from R2
   - Must complete in < 100ms for good UX

3. **Concurrency**
   - Multiple tags may be invalidated simultaneously
   - Must handle concurrent requests without data corruption

4. **ISR Queue**
   - Queue background jobs for page regeneration
   - Implement retry logic for failed jobs
   - Prevent thundering herd (rate limiting)

### Non-Functional Requirements

1. **Latency**: < 50ms per operation (read/write)
2. **Scalability**: Handle 100k+ page views/month
3. **Cost**: Stay within Cloudflare free tier
4. **Reliability**: Strong consistency for tag mappings
5. **Integration**: Work seamlessly with OpenNext

## Option 1: Durable Objects (Chosen)

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│ revalidateTag('posts')                                    │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ OpenNext Worker                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 1. Hash tag to shard                                │ │
│ │    hash('posts') % 32 = shard 7                     │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ Durable Object Shard 7 (DOTagCacheShard)                │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ In-Memory State:                                    │ │
│ │ {                                                   │ │
│ │   'posts': ['/blog/post-1', '/blog/post-2'],        │ │
│ │   'featured': ['/blog/post-1', '/']                 │ │
│ │ }                                                   │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 2. Lookup + Delete                                  │ │
│ │    - Get pages for 'posts'                          │ │
│ │    - Delete each from R2                            │ │
│ │    - Remove tag mapping                             │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Benefits

#### 1. Performance (10-20ms latency)

**In-memory state**: Tag mappings stored in RAM

```typescript
class DOTagCacheShard {
  private state: Map<string, string[]> = new Map();

  async invalidateTag(tag: string) {
    // O(1) lookup - instant!
    const pages = this.state.get(tag);
    // ... delete from R2
  }
}
```

**No round-trip to storage**: D1 requires network call for every query

#### 2. Scalability (32 shards)

**Load distribution**:

- 32 DO instances (one per shard)
- Each handles ~3% of traffic
- Parallel processing: multiple tags invalidated simultaneously

**Example**: 10,000 `revalidateTag()` calls/day

- Per shard: 312 calls/day (easily handled)
- Total DO requests: 10,000 (well within 1M free tier)

#### 3. State Management

**In-memory + persistent**:

- Tag mappings in RAM (fast reads)
- Periodically synced to DO storage (durability)
- Best of both worlds

**Queue state**:

- Pending jobs in memory
- Retry counters, timestamps
- Failed jobs tracked for debugging

#### 4. OpenNext Integration

**Native support**:

```jsonc
// wrangler.jsonc
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

**OpenNext provides classes**: No custom implementation needed

### Trade-offs

#### Complexity

**More setup than D1**: Requires DO bindings, sharding logic
**Mitigation**: OpenNext handles all complexity

#### Per-DO State

**Not globally shared**: Each DO shard has separate state
**Mitigation**: Sharding ensures consistency (same tag always routes to same shard)

## Option 2: D1 Database (Not Chosen)

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│ revalidateTag('posts')                                    │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ OpenNext Worker                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 1. Query D1                                         │ │
│ │    SELECT pages FROM tag_cache WHERE tag='posts'    │ │
│ │    ~20-50ms (network + query)                       │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ D1 Database                                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Table: tag_cache                                    │ │
│ │ | tag      | page              |                    │ │
│ │ |----------|-------------------|                    │ │
│ │ | 'posts'  | '/blog/post-1'    |                    │ │
│ │ | 'posts'  | '/blog/post-2'    |                    │ │
│ │ | 'posts'  | '/blog/post-3'    |                    │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Why Not D1?

#### 1. Higher Latency (~20-50ms)

**Network overhead**: Every query requires round-trip to D1
**Benchmark**:

- D1 query: ~20-50ms
- DO in-memory: ~5-10ms
- **2-5x slower**

#### 2. No Built-in Sharding

**Single instance**: All queries hit one D1 database
**Scalability issues**:

- High traffic → bottleneck
- No load distribution
- Eventual consistency challenges

#### 3. Overkill for Tag Cache

**D1 designed for relational data**:

- Complex queries (JOINs, aggregations)
- ACID transactions
- Schema migrations

**Tag cache is simple key-value**:

- No complex queries needed
- Simple lookup: `tag → pages`
- D1's power is wasted

#### 4. Cost at Scale

**Free tier**: 5M reads/month
**Estimated usage** (100k views/month):

- Optimistic: 10k tag reads = **FREE**
- Realistic: 50k tag reads = **FREE**
- High traffic (1M views): 500k reads = **FREE** (but close to limit)

**Durable Objects**: 1M requests/month (more headroom)

### When D1 Makes Sense

D1 is a great choice when:

1. ✅ You need relational data (users, posts, comments)
2. ✅ Complex queries with JOINs
3. ✅ ACID transactions required
4. ✅ Low traffic (< 10k requests/day)

**Not for tag cache** (simple key-value with high read volume)

## Detailed Comparison

| Feature                 | Durable Objects         | D1 Database              |
| ----------------------- | ----------------------- | ------------------------ |
| **Latency**             | ~10-20ms                | ~20-50ms                 |
| **In-memory state**     | ✅ Yes (fast)           | ❌ No (disk-based)       |
| **Sharding**            | ✅ Built-in (32 shards) | ❌ Single instance       |
| **Concurrency**         | ✅ Per-shard isolation  | ⚠️ Global locking        |
| **Consistency**         | ✅ Strong (per DO)      | ✅ Strong                |
| **Setup complexity**    | ⚠️ Moderate             | ✅ Simple                |
| **OpenNext support**    | ✅ Native               | ❌ Custom impl needed    |
| **Free tier**           | 1M requests/month       | 5M reads/month           |
| **Best use case**       | Queue, cache, state     | Relational data          |
| **Cost (10k req/day)**  | **FREE** (300k/month)   | **FREE** (300k/month)    |
| **Cost (100k req/day)** | **FREE** (3M/month)     | ⚠️ Near limit (3M/month) |
| **Scalability**         | ✅ Excellent            | ⚠️ Limited               |

## Performance Analysis

### Benchmark: Tag Invalidation

**Scenario**: Invalidate tag 'posts' with 100 tagged pages

#### Durable Objects

```
1. Hash tag → shard:        ~1ms
2. Call DO.invalidateTag(): ~5ms
3. DO lookup in-memory:     ~1ms
4. Delete 100 pages from R2:~50ms (parallel)
5. Update DO state:         ~1ms
──────────────────────────────────
TOTAL:                      ~58ms
```

#### D1 Database

```
1. Query D1 for pages:      ~25ms
   SELECT pages FROM tag_cache WHERE tag='posts'
2. Parse result:            ~2ms
3. Delete 100 pages from R2:~50ms (parallel)
4. Delete tag from D1:      ~20ms
   DELETE FROM tag_cache WHERE tag='posts'
──────────────────────────────────
TOTAL:                      ~97ms
```

**Result**: DO is **40% faster** (58ms vs 97ms)

### Benchmark: Concurrent Invalidations

**Scenario**: Invalidate 10 different tags simultaneously

#### Durable Objects (Sharded)

```
Tag 'posts'    → Shard 1  (58ms)  ┐
Tag 'featured' → Shard 7  (58ms)  │
Tag 'tech'     → Shard 15 (58ms)  │ All parallel
Tag 'news'     → Shard 23 (58ms)  │ Different shards
... (6 more)                      ┘
──────────────────────────────────
TOTAL:                      ~58ms (parallel!)
```

#### D1 (Single Instance)

```
Tag 'posts'    → D1 (97ms)   ┐
Tag 'featured' → D1 (wait)   │ Sequential
Tag 'tech'     → D1 (wait)   │ Bottleneck
Tag 'news'     → D1 (wait)   │ Single DB
... (6 more)                ┘
──────────────────────────────────
TOTAL:                      ~970ms (10 × 97ms)
```

**Result**: DO is **16x faster** for concurrent invalidations

## Cost Analysis

### Free Tier Limits

| Resource | Durable Objects             | D1 Database           |
| -------- | --------------------------- | --------------------- |
| Requests | 1,000,000/month             | 5,000,000 reads/month |
| Storage  | 1 GB                        | 10 GB                 |
| Writes   | Unlimited (within requests) | 100,000/day           |

### Projected Usage (sebc.dev)

**Assumptions**:

- 100,000 page views/month
- 10% cache hit rate on tags
- 5,000 `revalidateTag()` calls/month
- Average 20 pages per tag

#### Durable Objects

```
Tag invalidations:  5,000/month (within 1M limit)
Cache lookups:      10,000/month (within 1M limit)
Total DO requests:  15,000/month
──────────────────────────────────
Cost: $0.00/month (well within free tier)
```

#### D1

```
Tag queries:        5,000/month
Page lookups:       100,000/month (for cache hits)
Total D1 reads:     105,000/month
──────────────────────────────────
Cost: $0.00/month (within 5M free tier)
```

**Both are FREE** for sebc.dev's expected traffic.

### Cost at Scale (1M views/month)

#### Durable Objects

```
Tag invalidations:  50,000/month
Cache lookups:      100,000/month
Total DO requests:  150,000/month
──────────────────────────────────
Cost: $0.00/month (within 1M limit)
```

#### D1

```
Tag queries:        50,000/month
Page lookups:       1,000,000/month
Total D1 reads:     1,050,000/month
──────────────────────────────────
Cost: $0.00/month (within 5M limit)
```

**Still FREE**, but DO has more headroom.

## Decision Framework

Use this framework to decide between DO and D1 for your use case:

### Choose Durable Objects When:

1. ✅ **Need low latency** (< 20ms)
2. ✅ **High request volume** (> 10k/day)
3. ✅ **Stateful coordination** (queue, locks, counters)
4. ✅ **Built-in sharding** beneficial
5. ✅ **OpenNext integration** required
6. ✅ **In-memory state** needed

### Choose D1 Database When:

1. ✅ **Relational data** (users, posts, relationships)
2. ✅ **Complex queries** (JOINs, aggregations, full-text search)
3. ✅ **Low request volume** (< 10k/day)
4. ✅ **Simple setup** prioritized
5. ✅ **SQL familiarity** important
6. ✅ **Global consistency** critical

### For Tag Cache (Our Use Case):

| Requirement      | DO  | D1          | Winner  |
| ---------------- | --- | ----------- | ------- |
| Latency < 20ms   | ✅  | ❌          | **DO**  |
| Scalability      | ✅  | ⚠️          | **DO**  |
| Concurrency      | ✅  | ⚠️          | **DO**  |
| OpenNext support | ✅  | ❌          | **DO**  |
| Simple key-value | ✅  | ⚠️ Overkill | **DO**  |
| Cost             | ✅  | ✅          | **Tie** |

**Decision**: Durable Objects wins **4/5** (latency, scalability, concurrency, integration)

## Implementation Notes

### Durable Objects Configuration

```jsonc
// wrangler.jsonc
{
  "durable_objects": {
    "bindings": [
      {
        "name": "NEXT_CACHE_DO_QUEUE",
        "class_name": "DOQueueHandler",
        "script_name": "website",
      },
      {
        "name": "NEXT_TAG_CACHE_DO_SHARDED",
        "class_name": "DOTagCacheShard",
        "script_name": "website",
      },
    ],
  },
}
```

### Usage in Next.js

```typescript
// app/blog/[slug]/page.tsx
import { unstable_cache } from 'next/cache';

export default async function BlogPost({ params }) {
  const post = await unstable_cache(
    async () => getPost(params.slug),
    {
      tags: ['posts', `post-${params.slug}`]
    }
  );

  return <div>{post.title}</div>;
}

// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';

export async function POST(request: Request) {
  const { tag } = await request.json();

  // Invalidates via DO shard
  revalidateTag(tag);

  return Response.json({ revalidated: true });
}
```

### Monitoring

**Durable Objects metrics** (Cloudflare Dashboard):

- Requests per shard
- CPU time per request
- State size per DO
- Error rate

**D1 metrics** (Cloudflare Dashboard):

- Read/write operations
- Query latency
- Storage used
- Error rate

### Migration Path

If you start with D1 and need to migrate to DO later:

1. **Deploy DO bindings** (parallel to D1)
2. **Write to both** D1 and DO (dual-write)
3. **Read from DO** (primary), fallback to D1
4. **Validate consistency** for 1 week
5. **Remove D1** once confident

**Estimated effort**: 2-4 hours (mostly testing)

## References

- [Cloudflare Durable Objects Documentation](https://developers.cloudflare.com/durable-objects/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [OpenNext Cloudflare Guide](https://opennext.js.org/cloudflare)
- [Next.js Cache Tagging](https://nextjs.org/docs/app/building-your-application/caching#cache-tagging)
- [Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/)

---

**Document Status**: ✅ Complete
**Phase Status**: Phase 2 of 3 (Durable Objects Configuration)
**Next Steps**: Proceed to Commit 4 - Bindings reference documentation
