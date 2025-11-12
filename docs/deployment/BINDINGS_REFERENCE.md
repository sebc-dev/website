# Cloudflare Bindings Reference - Complete Guide

**Document Version**: 1.0
**Last Updated**: 2025-11-12
**Epic**: Epic 0 - Infrastructure Setup
**Story**: Story 0.5 - Configure wrangler.toml with bindings
**Phase**: Phase 2 - Durable Objects Bindings Configuration

## Table of Contents

1. [Overview](#overview)
2. [Complete Bindings Configuration](#complete-bindings-configuration)
3. [D1 Database Binding](#d1-database-binding)
4. [R2 Bucket Binding](#r2-bucket-binding)
5. [Durable Objects Bindings](#durable-objects-bindings)
6. [Accessing Bindings in Code](#accessing-bindings-in-code)
7. [Environment-Specific Configuration](#environment-specific-configuration)
8. [Monitoring and Troubleshooting](#monitoring-and-troubleshooting)
9. [Best Practices](#best-practices)

## Overview

Bindings allow your Cloudflare Worker to interact with resources on the Cloudflare platform. This document provides a complete reference for all bindings configured for the sebc.dev website.

### Configured Bindings (Phase 1 + Phase 2)

| Binding Name | Type | Purpose | Phase |
|-------------|------|---------|-------|
| `DB` | D1 Database | Drizzle ORM database access | Pre-existing |
| `NEXT_INC_CACHE_R2_BUCKET` | R2 Bucket | Next.js ISR cache storage | Phase 1 |
| `NEXT_CACHE_DO_QUEUE` | Durable Object | ISR revalidation queue | Phase 2 |
| `NEXT_TAG_CACHE_DO_SHARDED` | Durable Object | Tag-based cache invalidation | Phase 2 |

## Complete Bindings Configuration

### Current wrangler.jsonc

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "website",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-03-01",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],

  "assets": {
    "binding": "ASSETS",
    "directory": ".open-next/assets"
  },

  "observability": {
    "enabled": true
  },

  /**
   * D1 Database Binding
   */
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "sebc-dev-db",
      "database_id": "6615b6d8-2522-46dc-9051-bc0813b42240",
      "migrations_dir": "drizzle/migrations"
    }
  ],

  /**
   * R2 Buckets
   */
  "r2_buckets": [
    {
      "binding": "NEXT_INC_CACHE_R2_BUCKET",
      "bucket_name": "sebc-next-cache"
    }
  ],

  /**
   * Durable Objects
   */
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
  }
}
```

## D1 Database Binding

### Configuration

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "sebc-dev-db",
    "database_id": "6615b6d8-2522-46dc-9051-bc0813b42240",
    "migrations_dir": "drizzle/migrations"
  }
]
```

### Fields Explained

- **binding**: Name used to access the database in code (`env.DB`)
- **database_name**: Human-readable name for the database
- **database_id**: Unique identifier (UUID) assigned by Cloudflare
- **migrations_dir**: Directory containing Drizzle migration files

### Usage

```typescript
// app/api/posts/route.ts
import { getCloudflareContext } from '@opennext/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@/lib/db/schema';

export async function GET() {
  const { env } = await getCloudflareContext();
  const db = drizzle(env.DB, { schema });

  const posts = await db.select().from(schema.posts);
  return Response.json(posts);
}
```

### Monitoring

- **Cloudflare Dashboard**: R2 & Storage > D1
- **Metrics**: Read/write operations, query latency, storage used
- **Logs**: Enable via `observability.enabled: true`

### Free Tier

- **Reads**: 5,000,000 per month
- **Writes**: 100,000 per day
- **Storage**: 10 GB

## R2 Bucket Binding

### Configuration

```jsonc
"r2_buckets": [
  {
    "binding": "NEXT_INC_CACHE_R2_BUCKET",
    "bucket_name": "sebc-next-cache"
  }
]
```

### Fields Explained

- **binding**: Name used to access the bucket in code (`env.NEXT_INC_CACHE_R2_BUCKET`)
- **bucket_name**: Name of the R2 bucket (must exist in Cloudflare account)

### Usage (via OpenNext)

**Automatic**: OpenNext uses this binding automatically for ISR cache

```typescript
// No manual code needed - OpenNext handles it
// Pages with revalidate automatically use R2
export const revalidate = 3600; // Cached in R2 for 1 hour
```

**Manual R2 Access** (if needed):

```typescript
import { getCloudflareContext } from '@opennext/cloudflare';

export async function GET() {
  const { env } = await getCloudflareContext();
  const bucket = env.NEXT_INC_CACHE_R2_BUCKET;

  // List objects
  const list = await bucket.list();

  // Get object
  const object = await bucket.get('page-cache/index.html.body');
  const content = await object?.text();

  return Response.json({ list, content });
}
```

### Monitoring

- **Cloudflare Dashboard**: R2 & Storage > R2
- **Metrics**: Storage used, Class A/B operations, bandwidth
- **Cost tracking**: Operations vs. free tier limits

### Free Tier

- **Storage**: 10 GB
- **Class A operations** (writes): 1,000,000 per month
- **Class B operations** (reads): 10,000,000 per month
- **Egress**: Unlimited (free)

## Durable Objects Bindings

### Configuration

```jsonc
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
}
```

### Fields Explained

- **name**: Binding name used in code (`env.NEXT_CACHE_DO_QUEUE`)
- **class_name**: Durable Object class (provided by @opennextjs/cloudflare)
- **script_name**: Worker script name (must match `name` in wrangler.jsonc)

### NEXT_CACHE_DO_QUEUE

**Purpose**: ISR revalidation queue for background page regeneration

**Usage (via OpenNext)**: Automatic

```typescript
// No manual code needed - OpenNext handles it
// Pages with revalidate automatically queue regeneration when stale
export const revalidate = 3600;
```

**Manual Queue Access** (advanced):

```typescript
import { getCloudflareContext } from '@opennext/cloudflare';

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  const queue = env.NEXT_CACHE_DO_QUEUE;

  // Get DO instance (queue has single instance)
  const id = queue.idFromName('global-queue');
  const stub = queue.get(id);

  // Add job to queue
  await stub.addJob({
    path: '/blog/post-1',
    revalidate: 3600,
  });

  return Response.json({ queued: true });
}
```

**Key Features**:
- Async background processing
- Retry logic for failed jobs
- Rate limiting (prevents thundering herd)
- Persistent state (survives worker restarts)

### NEXT_TAG_CACHE_DO_SHARDED

**Purpose**: Tag-based cache invalidation with 32 shards

**Usage (via OpenNext)**: Automatic

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

  // Invalidates via DO shard (automatic)
  revalidateTag(tag);

  return Response.json({ revalidated: true });
}
```

**Manual Shard Access** (advanced):

```typescript
import { getCloudflareContext } from '@opennext/cloudflare';

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  const { tag } = await request.json();

  // Hash tag to shard (0-31)
  const hash = Array.from(tag).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const shardId = hash % 32;

  // Get DO shard instance
  const id = env.NEXT_TAG_CACHE_DO_SHARDED.idFromName(`shard-${shardId}`);
  const stub = env.NEXT_TAG_CACHE_DO_SHARDED.get(id);

  // Invalidate tag
  await stub.invalidateTag(tag);

  return Response.json({ shard: shardId, invalidated: true });
}
```

**Key Features**:
- 32 shards for load distribution
- In-memory state (fast lookups)
- Parallel tag invalidation
- Tag → pages mapping

### Monitoring

- **Cloudflare Dashboard**: Workers & Pages > Durable Objects
- **Metrics**: Requests per DO, CPU time, state size, error rate
- **Logs**: Enable via `observability.enabled: true`

### Free Tier

- **Requests**: 1,000,000 per month
- **Duration**: 400,000 GB-s per month
- **Storage**: 1 GB

## Accessing Bindings in Code

### In Next.js API Routes

```typescript
// app/api/example/route.ts
import { getCloudflareContext } from '@opennext/cloudflare';

export async function GET() {
  // Get Cloudflare context
  const { env } = await getCloudflareContext();

  // Access bindings
  const db = env.DB;                          // D1
  const r2 = env.NEXT_INC_CACHE_R2_BUCKET;     // R2
  const queue = env.NEXT_CACHE_DO_QUEUE;       // DO Queue
  const tagCache = env.NEXT_TAG_CACHE_DO_SHARDED; // DO Tag Cache

  return Response.json({ available: true });
}
```

### In Server Components

```typescript
// app/page.tsx (Server Component)
import { getCloudflareContext } from '@opennext/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@/lib/db/schema';

export default async function HomePage() {
  const { env } = await getCloudflareContext();
  const db = drizzle(env.DB, { schema });

  const posts = await db.select().from(schema.posts).limit(5);

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

### In Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Get Cloudflare context
  const { env } = await getCloudflareContext();

  // Access bindings (e.g., for rate limiting with DO)
  const rateLimiter = env.RATE_LIMITER_DO;

  return NextResponse.next();
}
```

## Environment-Specific Configuration

### Development vs Production

For environment-specific bindings, use separate wrangler files:

```bash
# Development
wrangler.dev.jsonc
{
  "d1_databases": [{
    "database_id": "dev-database-id"
  }]
}

# Production
wrangler.jsonc
{
  "d1_databases": [{
    "database_id": "prod-database-id"
  }]
}
```

**Deploy with specific config**:
```bash
# Development
wrangler deploy --config wrangler.dev.jsonc

# Production
wrangler deploy --config wrangler.jsonc
```

### Environment Variables vs Bindings

| Feature | Bindings | Environment Variables |
|---------|---------|----------------------|
| **Use case** | Cloudflare resources | Configuration values |
| **Example** | D1, R2, DO | API keys, feature flags |
| **Access** | `env.BINDING_NAME` | `env.VAR_NAME` |
| **Security** | Built-in (scoped) | Use secrets for sensitive |

**Bindings**: `env.DB`, `env.NEXT_INC_CACHE_R2_BUCKET`
**Variables**: `env.API_KEY`, `env.FEATURE_FLAG`

## Monitoring and Troubleshooting

### Cloudflare Dashboard

1. Navigate to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. Go to **Workers & Pages** > **Your Worker**
4. View metrics:
   - **Requests**: Total requests per binding
   - **CPU Time**: Worker execution time
   - **Errors**: Failed requests

### Logs

Enable observability in `wrangler.jsonc`:

```jsonc
{
  "observability": {
    "enabled": true
  }
}
```

**View logs**:
```bash
# Real-time logs
wrangler tail

# Filter by binding
wrangler tail --search "DB"
wrangler tail --search "R2"
```

### Common Issues

#### Issue 1: Binding Not Found

**Error**: `ReferenceError: DB is not defined`

**Cause**: Binding not configured in wrangler.jsonc

**Solution**:
1. Check `wrangler.jsonc` has the binding
2. Redeploy: `pnpm deploy`
3. Restart dev server: `pnpm dev`

#### Issue 2: D1 Database ID Mismatch

**Error**: `D1_ERROR: Database not found`

**Cause**: `database_id` in wrangler.jsonc doesn't match actual database

**Solution**:
```bash
# List databases
wrangler d1 list

# Get database ID
wrangler d1 info sebc-dev-db

# Update wrangler.jsonc with correct ID
```

#### Issue 3: R2 Bucket Doesn't Exist

**Error**: `R2Error: Bucket not found`

**Cause**: Bucket name in wrangler.jsonc doesn't match actual bucket

**Solution**:
```bash
# List buckets
wrangler r2 bucket list

# Create bucket if missing
wrangler r2 bucket create sebc-next-cache
```

#### Issue 4: Durable Object Class Not Exported

**Warning**: `Durable Object class "DOQueueHandler" not found`

**Cause**: DO classes not yet implemented (expected in Phase 3)

**Solution**: This is normal for Phase 2. Classes will be provided by OpenNext in Phase 3.

## Best Practices

### 1. Use Type-Safe Bindings

```typescript
// env.d.ts
interface CloudflareEnv {
  DB: D1Database;
  NEXT_INC_CACHE_R2_BUCKET: R2Bucket;
  NEXT_CACHE_DO_QUEUE: DurableObjectNamespace;
  NEXT_TAG_CACHE_DO_SHARDED: DurableObjectNamespace;
}

// Usage
const { env } = await getCloudflareContext<CloudflareEnv>();
// env.DB is typed as D1Database
```

### 2. Error Handling

```typescript
import { getCloudflareContext } from '@opennext/cloudflare';

export async function GET() {
  try {
    const { env } = await getCloudflareContext();
    const posts = await env.DB.prepare('SELECT * FROM posts').all();
    return Response.json(posts);
  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
```

### 3. Avoid Hardcoding Resource IDs

**❌ Bad**:
```typescript
const bucket = env.R2.get('sebc-next-cache');
```

**✅ Good**:
```typescript
const bucket = env.NEXT_INC_CACHE_R2_BUCKET;
```

### 4. Monitor Free Tier Usage

Set up alerts for:
- D1: 80% of 5M reads/month = 4M reads
- R2: 80% of 1M writes/month = 800K writes
- DO: 80% of 1M requests/month = 800K requests

### 5. Test Bindings Locally

```bash
# Start dev server with bindings
pnpm dev

# Test API route
curl http://localhost:3000/api/test
```

## References

- [Cloudflare Bindings Documentation](https://developers.cloudflare.com/workers/runtime-apis/bindings/)
- [D1 Bindings](https://developers.cloudflare.com/d1/get-started/#6-bind-your-worker-to-your-d1-database)
- [R2 Bindings](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)
- [Durable Objects Bindings](https://developers.cloudflare.com/durable-objects/get-started/#6-create-a-durable-object-binding)
- [OpenNext Cloudflare Context](https://opennext.js.org/cloudflare/get-cloudflare-context)
- [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)

---

**Document Status**: ✅ Complete
**Phase Status**: Phase 2 of 3 (Durable Objects Configuration)
**Next Steps**: Proceed to Phase 3 - Enable OpenNext incremental cache
