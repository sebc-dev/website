# Cloudflare Resources - R2 Bucket Management

**Document Version**: 1.0
**Last Updated**: 2025-11-12
**Epic**: Epic 0 - Infrastructure Setup
**Story**: Story 0.5 - Configure wrangler.toml with bindings
**Phase**: Phase 1 - R2 Bucket Configuration

## Table of Contents

1. [Overview](#overview)
2. [R2 Bucket Setup](#r2-bucket-setup)
3. [Pricing and Free Tier](#pricing-and-free-tier)
4. [Cost Optimization](#cost-optimization)
5. [Monitoring and Usage](#monitoring-and-usage)
6. [Troubleshooting](#troubleshooting)
7. [Security and Access Control](#security-and-access-control)

## Overview

This document provides operational guidance for managing Cloudflare R2 resources used by the sebc.dev website. It covers bucket creation, pricing, monitoring, and troubleshooting.

### Current Resources

| Resource Type | Name | Purpose | Created |
|--------------|------|---------|---------|
| R2 Bucket | `sebc-next-cache` | Next.js ISR cache storage | 2025-11-12 |

## R2 Bucket Setup

### Prerequisites

1. **Cloudflare Account**: Active account with R2 access
2. **Wrangler CLI**: Installed and authenticated
3. **Account Permissions**: R2 write access

### Step 1: Verify Wrangler Authentication

```bash
# Check authentication status
wrangler whoami

# Expected output:
# You are logged in with an OAuth Token
# Account: your-email@example.com
# Account ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Step 2: Create R2 Bucket

```bash
# Create bucket
wrangler r2 bucket create sebc-next-cache

# Expected output:
# Creating bucket 'sebc-next-cache'
# Created bucket 'sebc-next-cache'
```

### Step 3: Verify Bucket Creation

```bash
# List all buckets
wrangler r2 bucket list

# Expected output:
# name:           sebc-next-cache
# creation_date:  2025-11-12T05:08:49.471Z
```

### Step 4: Configure Bucket Binding

Add to `wrangler.jsonc`:

```jsonc
{
  "r2_buckets": [
    {
      "binding": "NEXT_INC_CACHE_R2_BUCKET",
      "bucket_name": "sebc-next-cache"
    }
  ]
}
```

### Step 5: Test Configuration

```bash
# Build the project
pnpm build

# Expected: Build succeeds with no R2 errors

# Deploy to Cloudflare (optional)
pnpm deploy
```

### Step 6: Verify in Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. Navigate to **R2** in the sidebar
4. Confirm `sebc-next-cache` appears in the bucket list

## Pricing and Free Tier

### Free Tier Limits (Per Month)

Cloudflare R2 includes generous free tier limits:

| Resource | Free Tier | Cost After Free Tier |
|----------|-----------|---------------------|
| Storage | 10 GB | $0.015 per GB-month |
| Class A Operations (writes, lists) | 1,000,000 | $4.50 per million |
| Class B Operations (reads) | 10,000,000 | $0.36 per million |
| Egress (to Internet) | Unlimited | $0.00 (always free) |

### Operation Classes

**Class A Operations** (more expensive):
- PUT (write objects)
- POST (multipart uploads)
- LIST (list bucket contents)
- COPY (copy objects)

**Class B Operations** (less expensive):
- GET (read objects)
- HEAD (get metadata)

### Pricing Examples

#### Example 1: Small Website (sebc.dev)

Assumptions:
- 10,000 page views/month
- 100 cached pages
- Average page size: 50 KB
- 90% cache hit rate
- Hourly revalidation

**Monthly costs**:
- Storage: 5 MB (100 pages × 50 KB) = **FREE** (within 10 GB)
- Class A (writes): 240 operations = **FREE** (within 1M)
- Class B (reads): 9,000 operations = **FREE** (within 10M)
- **Total**: $0.00/month

#### Example 2: Medium Website

Assumptions:
- 100,000 page views/month
- 500 cached pages
- Average page size: 100 KB
- 85% cache hit rate
- 30-minute revalidation

**Monthly costs**:
- Storage: 50 MB (500 pages × 100 KB) = **FREE** (within 10 GB)
- Class A (writes): 24,000 operations = **FREE** (within 1M)
- Class B (reads): 85,000 operations = **FREE** (within 10M)
- **Total**: $0.00/month

#### Example 3: Large Website (Exceeding Free Tier)

Assumptions:
- 1,000,000 page views/month
- 5,000 cached pages
- Average page size: 200 KB
- 90% cache hit rate
- 5-minute revalidation

**Monthly costs**:
- Storage: 1 GB (5,000 pages × 200 KB) = **FREE** (within 10 GB)
- Class A (writes): 1,440,000 operations (440K over limit)
  - Cost: 0.44M × $4.50/M = **$1.98**
- Class B (reads): 900,000 operations = **FREE** (within 10M)
- **Total**: $1.98/month

### Cost Comparison: R2 vs. Workers KV

| Feature | R2 | Workers KV |
|---------|----|-----------|
| Storage (free) | 10 GB | 1 GB |
| Writes (free) | 1M/month | 1,000/day (30K/month) |
| Reads (free) | 10M/month | 10M/month |
| Large file support | ✅ Yes (unlimited size) | ❌ No (25 MB limit) |
| Latency | ~20-30ms | ~10-20ms |
| Best for | Large objects, ISR cache | Small key-value pairs |

**For ISR cache**: R2 is more cost-effective due to higher write limits.

## Cost Optimization

### 1. Set Appropriate Revalidation Intervals

**Problem**: Frequent revalidation = more writes (Class A operations)

**Solution**: Use longer revalidation times for content that changes infrequently

```typescript
// ❌ Aggressive revalidation (expensive)
export const revalidate = 60; // Every minute = 1,440 writes/day

// ✅ Optimized revalidation (cost-effective)
export const revalidate = 3600; // Every hour = 24 writes/day
```

**Savings**: 59× reduction in Class A operations

### 2. Use On-Demand Revalidation

**Problem**: Time-based revalidation regenerates pages even when content hasn't changed

**Solution**: Use `revalidatePath()` to regenerate only when content is updated

```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const { path, secret } = await request.json();

  // Verify secret (prevent abuse)
  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: 'Invalid secret' }, { status: 401 });
  }

  // Revalidate specific path
  revalidatePath(path);
  return Response.json({ revalidated: true });
}
```

**Usage**: Call this API when content changes (e.g., from CMS webhook)

**Savings**: 90%+ reduction in unnecessary regenerations

### 3. Cache Fetch Responses

**Problem**: Redundant API calls increase compute costs

**Solution**: Use Next.js fetch cache with appropriate revalidation

```typescript
// ❌ No caching
const data = await fetch('https://api.example.com/data', { cache: 'no-store' });

// ✅ Cached fetch with revalidation
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 3600 } // Cache for 1 hour
});
```

**Savings**: Reduces API calls and Worker CPU time

### 4. Monitor and Analyze Usage

**Action**: Regularly check R2 usage to identify optimization opportunities

**Tools**:
- Cloudflare Dashboard (R2 Analytics)
- Wrangler CLI (`wrangler r2 bucket info sebc-next-cache`)

**Metrics to watch**:
- Storage growth rate
- Class A operation spikes
- Class B operation patterns

## Monitoring and Usage

### Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. Navigate to **R2** > **sebc-next-cache**
4. View metrics:
   - **Storage**: Total data stored
   - **Requests**: Class A and Class B operations
   - **Bandwidth**: Data transfer (always free for R2)

### Wrangler CLI

```bash
# Get bucket information
wrangler r2 bucket info sebc-next-cache

# List objects in bucket
wrangler r2 object list sebc-next-cache

# Get object metadata
wrangler r2 object get sebc-next-cache/<object-key> --metadata-only
```

### Setting Up Alerts

**Coming in Future Phase**: Cloudflare email alerts for:
- Storage approaching 80% of free tier (8 GB)
- Class A operations approaching 80% of free tier (800K)
- Unexpected cost spikes

## Troubleshooting

### Issue 1: Bucket Already Exists Error

**Error**:
```
The bucket you tried to create already exists, and you own it. [code: 10004]
```

**Solution**: Bucket already exists, no action needed

**Verify**:
```bash
wrangler r2 bucket list
```

### Issue 2: Wrangler Not Authenticated

**Error**:
```
Error: Not logged in
```

**Solution**:
```bash
# Login with OAuth
wrangler login

# Or use API token
wrangler login --api-token <YOUR_API_TOKEN>
```

### Issue 3: R2 Permission Denied

**Error**:
```
Error: A request to the Cloudflare API failed. [code: 10000]
```

**Possible causes**:
1. Account doesn't have R2 enabled
2. API token lacks R2 permissions

**Solution**:
1. Enable R2 in Cloudflare Dashboard
2. Regenerate API token with R2 permissions

### Issue 4: Cache Not Working

**Symptoms**:
- Pages render slowly every time
- No cache hits in logs

**Debugging steps**:

1. **Check binding configuration**:
```bash
# Verify wrangler.jsonc has correct binding
cat wrangler.jsonc | grep -A 5 "r2_buckets"
```

2. **Check bucket exists**:
```bash
wrangler r2 bucket list
```

3. **Check OpenNext configuration** (Phase 2):
```bash
# Verify open-next.config.ts has cache enabled
cat open-next.config.ts
```

4. **Check R2 objects**:
```bash
# List cached objects
wrangler r2 object list sebc-next-cache
```

### Issue 5: Unexpected Costs

**Scenario**: R2 costs higher than expected

**Investigation**:

1. **Check usage metrics** in Cloudflare Dashboard
2. **Identify high-operation pages**:
   - Look for pages with frequent revalidation
   - Check for loops causing repeated writes
3. **Review revalidation strategy**:
   - Increase revalidate intervals
   - Switch to on-demand revalidation

## Security and Access Control

### Bucket Access

**Default**: Bucket is private, only accessible via Worker binding

**Worker binding** (`NEXT_INC_CACHE_R2_BUCKET`):
- Automatically configured via wrangler.jsonc
- No manual credentials needed
- Secure: Workers have scoped access only to bound bucket

### API Tokens

**Best practices**:
1. Use scoped tokens (R2 read/write only)
2. Rotate tokens regularly
3. Never commit tokens to git

### Public Access

**Current**: No public access configured (cache is internal)

**Future**: If needed, configure public buckets for:
- User-uploaded assets (with access controls)
- Public downloads (with signed URLs)

**Not recommended** for cache bucket (security risk)

## Next Steps

### Phase 2: Enable OpenNext Incremental Cache

- Configure OpenNext to use R2 cache handler
- Test ISR functionality with sample pages
- Validate cache persistence across deployments

### Phase 3: Testing and Optimization

- Set up monitoring and alerts
- Implement cache analytics
- Optimize cache strategy based on real usage data

## References

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [Wrangler R2 Commands](https://developers.cloudflare.com/workers/wrangler/commands/#r2)
- [OpenNext Cloudflare Guide](https://opennext.js.org/cloudflare)

---

**Document Status**: ✅ Complete
**Phase Status**: Phase 1 of 3 (R2 Configuration)
**Next Steps**: Proceed to Phase 2 - Enable OpenNext incremental cache
