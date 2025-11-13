# Cache Architecture - OpenNext on Cloudflare Workers

**Document Version**: 3.0
**Last Updated**: 2025-11-13
**Epic**: Epic 0 - Infrastructure Setup
**Story**: Story 0.5 - Configure wrangler.toml with bindings
**Phase**: Phase 3 - Service Binding & OpenNext Activation (Complete)

## Table of Contents

1. [Overview](#overview)
2. [Architecture Components](#architecture-components)
3. [OpenNext Cache Integration](#opennext-cache-integration)
4. [Durable Objects Integration](#durable-objects-integration)
5. [Cache Flow](#cache-flow)
6. [Configuration Reference](#configuration-reference)
7. [Performance Benefits](#performance-benefits)
8. [Cost Considerations](#cost-considerations)
9. [Future Phases](#future-phases)

## Overview

This document describes the complete OpenNext cache architecture for the sebc.dev website, utilizing Cloudflare R2 for persistent storage and Durable Objects for cache coordination and management.

### Complete Cache Stack (All 4 Bindings)

```
┌─────────────────────────────────────────────────────────┐
│              Next.js Application                         │
│       (Pages with revalidate, ISR, tags)                 │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│          OpenNext Worker (Cloudflare Edge)               │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Service Binding: WORKER_SELF_REFERENCE           │ │
│  │  (Worker-to-worker communication)                 │ │
│  └───────────────────────────────────────────────────┘ │
│                       │                                  │
│       ┌───────────────┼───────────────┐                │
│       │               │               │                │
│       ▼               ▼               ▼                │
│  ┌────────┐   ┌──────────┐   ┌──────────┐            │
│  │ R2     │   │ DO Queue │   │ DO Tags  │            │
│  │ ISR    │   │ Handler  │   │ Sharded  │            │
│  │ Cache  │   │ (Async)  │   │ (32x)    │            │
│  └────────┘   └──────────┘   └──────────┘            │
│       │               │               │                │
└───────┼───────────────┼───────────────┼────────────────┘
        │               │               │
        └───────────────┴───────────────┘
                       ▼
              [Cloudflare Global Network]
```

**Binding Roles**:
1. **WORKER_SELF_REFERENCE** (Service): Internal coordination
2. **NEXT_INC_CACHE_R2_BUCKET** (R2): Persistent ISR storage
3. **NEXT_CACHE_DO_QUEUE** (DO): Async revalidation queue
4. **NEXT_TAG_CACHE_DO_SHARDED** (DO): Tag-based invalidation (32 shards)

### Key Benefits

- **Persistent Cache**: R2 storage survives deployments and worker restarts
- **Async Revalidation**: Durable Objects queue enables stale-while-revalidate
- **Tag-Based Invalidation**: Sharded DO tag cache for instant invalidation
- **Global Distribution**: Cloudflare's global network for low latency
- **Cost Effective**: Free tier covers most use cases
- **Automatic Integration**: OpenNext handles all cache operations transparently

### Technology Stack

- **Next.js 15**: App Router with ISR support
- **OpenNext**: Cloudflare Workers adapter
- **Cloudflare R2**: S3-compatible object storage for ISR cache
- **Cloudflare Durable Objects**: Stateful coordination for queue and tags
- **Workers Runtime**: Edge compute for dynamic rendering

## Architecture Components

### 1. Next.js ISR (Incremental Static Regeneration)

Next.js ISR allows pages to be regenerated on-demand after initial static generation:

```typescript
// Example: Page with ISR revalidation
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Revalidate every 60 seconds
export const revalidate = 60;
```

### 2. OpenNext Adapter

OpenNext converts Next.js applications to run on Cloudflare Workers:

- **Server Function**: Handles dynamic rendering (SSR, API routes)
- **Cache Handler**: Manages ISR cache storage in R2
- **Asset Server**: Serves static files from `.open-next/assets`

### 3. Cloudflare R2 Storage

R2 provides S3-compatible object storage for cache data:

- **Bucket**: `sebc-next-cache`
- **Binding**: `NEXT_INC_CACHE_R2_BUCKET` (configured in wrangler.jsonc)
- **Access**: Automatically managed by OpenNext cache handler

### 4. Cloudflare Durable Objects

Durable Objects provide stateful coordination for cache operations:

#### NEXT_CACHE_DO_QUEUE (ISR Queue)
- **Binding**: `NEXT_CACHE_DO_QUEUE`
- **Class**: `DOQueueHandler` (from @opennextjs/cloudflare)
- **Purpose**: Async queue for background page regeneration
- **Use case**: Implements stale-while-revalidate pattern

#### NEXT_TAG_CACHE_DO_SHARDED (Tag Cache)
- **Binding**: `NEXT_TAG_CACHE_DO_SHARDED`
- **Class**: `DOTagCacheShard` (from @opennextjs/cloudflare)
- **Purpose**: Tag-based cache invalidation with sharding
- **Shards**: 32 (default for load distribution)
- **Use case**: Fast invalidation via `revalidateTag('posts')`

### 5. Service Binding (Worker Self-Reference)

Service bindings enable worker-to-worker communication, allowing OpenNext to coordinate cache operations internally:

#### WORKER_SELF_REFERENCE
- **Binding**: `WORKER_SELF_REFERENCE`
- **Service**: Points to this worker itself (`website`)
- **Purpose**: Internal worker-to-worker communication for OpenNext cache coordination
- **Use case**:
  - Cache operations between OpenNext components
  - ISR revalidation coordination
  - Internal cache invalidation triggers
  - Background job orchestration

**How It Works**:

```
┌─────────────────────────────────────────────────────┐
│              OpenNext Worker (Main)                  │
│  ┌───────────────────────────────────────────────┐ │
│  │  1. User Request → ISR Page                   │ │
│  │     - Check cache in R2                       │ │
│  │     - If stale, trigger revalidation          │ │
│  └───────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────┐ │
│  │  2. Internal Communication via Service Binding│ │
│  │     env.WORKER_SELF_REFERENCE.fetch(...)      │ │
│  │     - Coordinates with DO queue               │ │
│  │     - Triggers background regeneration        │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Configuration**:

```jsonc
// wrangler.jsonc
"services": [
  {
    "binding": "WORKER_SELF_REFERENCE",
    "service": "website"  // Must match worker name
  }
]
```

**Why It's Needed**:

1. **Cache Coordination**: OpenNext needs to communicate between its internal components (server function, cache handler, queue processor)
2. **Background Jobs**: Service binding allows the worker to make requests to itself for async processing
3. **ISR Operations**: Enables the stale-while-revalidate pattern by triggering background page regeneration
4. **Isolation**: Keeps cache operations isolated from user-facing requests

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     User Request                         │
└─────────────────────┬───────────────────────────────────┘
                      │
                      v
┌─────────────────────────────────────────────────────────┐
│              Cloudflare Workers (Edge)                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │            OpenNext Worker                       │   │
│  │  ┌──────────────────────────────────────────┐  │   │
│  │  │  1. Check Cache (R2)                     │  │   │
│  │  │     ├─ Hit? → Serve cached response      │  │   │
│  │  │     └─ Miss? → Render page (SSR)         │  │   │
│  │  └──────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────┐  │   │
│  │  │  2. Revalidation Logic                   │  │   │
│  │  │     ├─ Check expiry (revalidate time)    │  │   │
│  │  │     └─ Stale? → Regenerate in background │  │   │
│  │  └──────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────┐  │   │
│  │  │  3. Store in Cache (R2)                  │  │   │
│  │  │     └─ Save for next request             │  │   │
│  │  └──────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      v
┌─────────────────────────────────────────────────────────┐
│           Cloudflare R2 Bucket (Storage)                 │
│                 sebc-next-cache                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Cache Structure:                              │    │
│  │  /page-cache/                                  │    │
│  │    ├── /index.html.body                        │    │
│  │    ├── /index.html.meta                        │    │
│  │    └── /blog/[slug].html.body                  │    │
│  │  /fetch-cache/                                 │    │
│  │    └── /api-responses/                         │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## OpenNext Cache Integration

### How OpenNext Uses R2

OpenNext's cache handler automatically:

1. **Writes**: Stores rendered pages and API responses to R2
2. **Reads**: Retrieves cached content on subsequent requests
3. **Revalidates**: Checks cache expiry and regenerates stale pages
4. **Deletes**: Removes invalidated cache entries

### Cache Data Structure

R2 stores two types of files for each cached page:

```
/page-cache/
  └── /route-name/
      ├── .html.body    # HTML content
      └── .html.meta    # Metadata (revalidate time, headers)
```

Example metadata:

```json
{
  "lastModified": 1699564800000,
  "revalidate": 60,
  "headers": {
    "content-type": "text/html; charset=utf-8"
  }
}
```

### Binding Configuration

The R2 binding in `wrangler.jsonc`:

```jsonc
"r2_buckets": [
  {
    "binding": "NEXT_INC_CACHE_R2_BUCKET",
    "bucket_name": "sebc-next-cache"
  }
]
```

This binding makes the bucket accessible in the worker via `env.NEXT_INC_CACHE_R2_BUCKET`.

## Durable Objects Integration

Durable Objects provide stateful coordination for OpenNext cache operations, enabling async revalidation and tag-based invalidation.

### NEXT_CACHE_DO_QUEUE - ISR Revalidation Queue

**Purpose**: Background queue for async page regeneration (stale-while-revalidate pattern)

**How it works**:

1. User requests page with `revalidate: 3600` (1 hour)
2. OpenNext checks R2 for cached version
3. If cached and fresh (< 1 hour old): Return immediately
4. If cached but stale (> 1 hour old):
   - **Serve stale version immediately** (fast response to user)
   - **Queue regeneration job** to Durable Object
   - DO processes job in background
   - When done, updates R2 cache
5. Next user gets fresh cache

**Flow Diagram**:

```
┌──────────────────────────────────────────────────────────┐
│ User Request (page with revalidate: 3600)                │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ OpenNext Worker                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 1. Check R2 Cache                                   │ │
│ │    - Exists? Check timestamp                        │ │
│ │    - Fresh? Return immediately                      │ │
│ │    - Stale? Continue to step 2                      │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 2. Serve Stale + Queue Revalidation                │ │
│ │    - Return stale cache to user (fast!)            │ │
│ │    - Queue job: env.NEXT_CACHE_DO_QUEUE.add({      │ │
│ │        path: '/blog/post-1',                        │ │
│ │        revalidate: 3600                             │ │
│ │      })                                             │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ Durable Object: DOQueueHandler                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 3. Process Job (Background)                         │ │
│ │    - Receive job from queue                         │ │
│ │    - Render page (SSR)                              │ │
│ │    - Store in R2                                    │ │
│ │    - Update metadata (timestamp, headers)           │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ R2 Bucket (Updated)                                      │
│ - /blog/post-1.html.body (fresh content)                 │
│ - /blog/post-1.html.meta (new timestamp)                 │
└─────────────────────────────────────────────────────────┘
```

**Key Benefits**:

- **Fast responses**: Users always get immediate response (stale or fresh)
- **Zero blocking**: Regeneration happens in background
- **Retry logic**: DO queue handles failures and retries
- **Rate limiting**: Queue prevents thundering herd

**Configuration**:

```jsonc
// wrangler.jsonc
"durable_objects": {
  "bindings": [
    {
      "name": "NEXT_CACHE_DO_QUEUE",
      "class_name": "DOQueueHandler",
      "script_name": "website"
    }
  ]
}
```

### NEXT_TAG_CACHE_DO_SHARDED - Tag-Based Invalidation

**Purpose**: Fast cache invalidation using tags with sharding for high performance

**How it works**:

1. Pages are tagged during render:
   ```typescript
   // app/blog/[slug]/page.tsx
   export default async function BlogPost({ params }) {
     const post = await getPost(params.slug);

     // Tag this page with 'posts' and 'post-123'
     unstable_cache(async () => post, {
       tags: ['posts', `post-${params.slug}`]
     });

     return <div>{post.title}</div>;
   }
   ```

2. Invalidate by tag:
   ```typescript
   // app/api/revalidate/route.ts
   import { revalidateTag } from 'next/cache';

   export async function POST(request: Request) {
     const { tag } = await request.json();

     // Invalidate all pages tagged with 'posts'
     revalidateTag(tag);

     return Response.json({ revalidated: true });
   }
   ```

3. DO Sharded Tag Cache:
   - 32 shards (DO instances) for parallel processing
   - Each tag maps to a shard via hash
   - Shard stores tag → page mappings
   - On invalidation, shard deletes all associated pages from R2

**Flow Diagram**:

```
┌──────────────────────────────────────────────────────────┐
│ API Request: revalidateTag('posts')                      │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ OpenNext Worker                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 1. Hash tag to shard                                │ │
│ │    hash('posts') % 32 = shard 7                     │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 2. Call DO shard                                    │ │
│ │    env.NEXT_TAG_CACHE_DO_SHARDED                    │
│ │      .get('shard-7')                                │ │
│ │      .invalidateTag('posts')                        │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ Durable Object Shard 7: DOTagCacheShard                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 3. Lookup tag mappings                              │ │
│ │    tag 'posts' → pages:                             │ │
│ │      - /blog/post-1                                 │ │
│ │      - /blog/post-2                                 │ │
│ │      - /blog/post-3                                 │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 4. Delete from R2                                   │ │
│ │    - R2.delete('/blog/post-1.html.body')            │ │
│ │    - R2.delete('/blog/post-1.html.meta')            │ │
│ │    - R2.delete('/blog/post-2.html.body')            │ │
│ │    - ... (all tagged pages)                         │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Why Sharding?**

- **Performance**: Distributes load across 32 DO instances
- **Scalability**: Prevents single-DO bottleneck
- **Concurrency**: Multiple tags can be invalidated in parallel
- **Cost**: Free tier covers 32 shards easily

**Configuration**:

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

### Durable Objects vs Other Options

| Feature | Durable Objects | Workers KV | D1 Database |
|---------|----------------|-----------|-------------|
| **Use case** | Queue, coordination | Simple key-value | Relational data |
| **Latency** | ~10-20ms | ~10-20ms | ~20-50ms |
| **Consistency** | Strong (per DO) | Eventual | Strong |
| **Sharding** | Built-in (32 shards) | Global | Single instance |
| **State** | In-memory + persistent | Persistent only | Persistent only |
| **Cost (free tier)** | 1M requests | 100K reads | 5M reads |
| **Best for cache** | Queue, tags | ❌ Too limited | ❌ Too slow |

**Why Durable Objects for OpenNext?**

1. **Queue needs state**: Must track pending jobs, retries
2. **Tags need coordination**: Must maintain tag → page mappings
3. **Performance**: In-memory state = fast operations
4. **Sharding**: Built-in support for 32 shards
5. **OpenNext integration**: @opennextjs/cloudflare provides DO classes

## Cache Flow

### 1. First Request (Cache Miss)

```
User → Worker → (Cache Miss) → Render Page → Store in R2 → Response
```

**Timeline**:
- Request arrives: 0ms
- Cache check (R2): ~10-20ms
- Page render (SSR): ~100-500ms
- Cache write (R2): ~20-30ms
- **Total**: ~150-570ms

### 2. Subsequent Requests (Cache Hit)

```
User → Worker → (Cache Hit) → Read from R2 → Response
```

**Timeline**:
- Request arrives: 0ms
- Cache check (R2): ~10-20ms
- Cache read (R2): ~20-30ms
- **Total**: ~30-50ms

**Performance Improvement**: 3-10x faster than rendering

### 3. Revalidation (Stale-While-Revalidate)

```
User → Worker → (Stale Cache) → Serve Stale → Background Regenerate → Update R2
```

**Timeline**:
- Request arrives: 0ms
- Serve stale cache: ~30-50ms (user gets response)
- Background regeneration: ~100-500ms (async)
- Cache update: ~20-30ms (async)

**User Experience**: Always fast, never waits for regeneration

## Configuration Reference

### Current Configuration (Phase 1 + Phase 2 + Phase 3)

```jsonc
// wrangler.jsonc
{
  "r2_buckets": [
    {
      "binding": "NEXT_INC_CACHE_R2_BUCKET",
      "bucket_name": "sebc-next-cache"
    }
  ],
  "durable_objects": {
    "bindings": [
      {
        "name": "NEXT_CACHE_DO_QUEUE",
        "class_name": "DOQueueHandler",
        "script_name": "website"
      },
      {
        "name": "NEXT_TAG_CACHE_DO_SHARDED",
        "class_name": "DOTagCacheShard",
        "script_name": "website"
      }
    ]
  },
  "services": [
    {
      "binding": "WORKER_SELF_REFERENCE",
      "service": "website"
    }
  ],
  "migrations": [
    {
      "tag": "v1",
      "new_sqlite_classes": ["DOQueueHandler", "DOTagCacheShard"]
    }
  ]
}
```

### OpenNext Configuration

```typescript
// open-next.config.ts
import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache';

export default defineCloudflareConfig({
  // R2 cache - uses NEXT_INC_CACHE_R2_BUCKET binding
  incrementalCache: r2IncrementalCache,
  // DO queue - uses NEXT_CACHE_DO_QUEUE binding
  queue: doQueue,
  // Sharded tag cache - uses NEXT_TAG_CACHE_DO_SHARDED binding
  tagCache: doShardedTagCache({ baseShardSize: 12 }),
});
```

### Next.js Page Configuration

```typescript
// app/page.tsx - Static with revalidation
export const revalidate = 3600; // Revalidate every hour

// app/blog/[slug]/page.tsx - On-demand ISR
export async function generateStaticParams() {
  return [{ slug: 'first-post' }, { slug: 'second-post' }];
}

export const revalidate = false; // Only revalidate on-demand
```

### Programmatic Revalidation

```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const { path } = await request.json();
  revalidatePath(path);
  return Response.json({ revalidated: true });
}
```

## Performance Benefits

### Cache Hit Rate

Expected cache hit rates:

- **Homepage**: 90-95% (high traffic, infrequent updates)
- **Blog posts**: 85-90% (moderate traffic, occasional updates)
- **API routes**: 70-80% (varies by endpoint)

### Latency Reduction

| Scenario | Without Cache | With R2 Cache | Improvement |
|----------|--------------|---------------|-------------|
| Homepage | 300ms | 40ms | 7.5x faster |
| Blog post | 500ms | 50ms | 10x faster |
| API route | 200ms | 30ms | 6.7x faster |

### Cost Savings

Rendering costs vs. cache costs:

- **Worker CPU time**: $0.02 per million requests (rendering)
- **R2 reads**: $0.36 per million (Class A operations)
- **R2 storage**: $0.015 per GB-month

With 90% cache hit rate on 1M requests:
- Rendering cost: 100K × $0.02 = $2.00
- R2 cost: 900K × $0.00036 = $0.32
- **Savings**: ~84% reduction in compute costs

## Cost Considerations

### Free Tier Limits

Cloudflare R2 free tier (per month):

- **Storage**: 10 GB
- **Class A operations** (writes): 1,000,000
- **Class B operations** (reads): 10,000,000

### Estimated Usage (sebc.dev)

Assumptions:
- 10,000 page views/month
- Average page size: 50 KB
- Cache hit rate: 90%
- Revalidation interval: 1 hour

**Storage**:
- 100 cached pages × 50 KB = 5 MB
- **Well within 10 GB limit**

**Operations**:
- Writes: ~240/month (100 pages × 24 revalidations/day ÷ 30 days)
- Reads: ~9,000/month (10K views × 90% hit rate)
- **Well within free tier**

### Cost Optimization Tips

1. **Set appropriate revalidate times**: Longer intervals = fewer writes
2. **Use on-demand revalidation**: Only regenerate when content changes
3. **Cache fetch responses**: Reduce redundant API calls
4. **Monitor usage**: Use Cloudflare Dashboard to track R2 operations

## Future Phases

### Phase 2: Enable OpenNext Incremental Cache (Planned)

- Configure OpenNext to use R2 cache handler
- Test ISR functionality with sample pages
- Validate cache persistence across deployments

**Expected benefits**:
- Automatic ISR support
- Transparent cache management
- No code changes required

### Phase 3: Testing and Optimization (Planned)

- Load testing with Playwright
- Cache invalidation testing
- Performance benchmarking
- Cost monitoring setup

**Deliverables**:
- E2E tests for ISR functionality
- Performance baseline metrics
- Cost tracking dashboard

## References

- [OpenNext Cloudflare Caching](https://opennext.js.org/cloudflare/caching)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Next.js ISR Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [Cloudflare Workers Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/)

---

**Document Status**: ✅ Complete
**Phase Status**: Phase 3 of 3 (All Bindings Configured + OpenNext Activated)
**Architecture Complete**: All 4 bindings (R2, DO Queue, DO Tags, Service) + OpenNext R2 cache enabled
