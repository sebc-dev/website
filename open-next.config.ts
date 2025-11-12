import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache';

export default defineCloudflareConfig({
  // R2 cache enabled - uses NEXT_INC_CACHE_R2_BUCKET binding from wrangler.jsonc
  // See https://opennext.js.org/cloudflare/caching for more details
  incrementalCache: r2IncrementalCache,
  // Durable Objects queue for time-based revalidations - uses NEXT_CACHE_DO_QUEUE binding
  queue: doQueue,
  // Sharded tag cache for on-demand revalidations - uses NEXT_TAG_CACHE_DO_SHARDED binding
  tagCache: doShardedTagCache({ baseShardSize: 12 }),
});
