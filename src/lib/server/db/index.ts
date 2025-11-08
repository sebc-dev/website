import { drizzle } from 'drizzle-orm/d1';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

/**
 * Get Drizzle database instance for Cloudflare D1.
 *
 * This function should only be called from server-side code:
 * - React Server Components
 * - Server Actions
 * - Route Handlers (route.ts)
 *
 * @param env - Cloudflare environment bindings (contains DB binding)
 * @returns Drizzle database instance configured for D1
 * @throws Error if DB binding is not available
 *
 * @example
 * ```typescript
 * // In a Server Component
 * import { getDb } from '@/lib/server/db';
 *
 * export default async function Page() {
 *   const db = getDb(process.env);
 *   const articles = await db.select().from(articlesTable);
 *   // ...
 * }
 * ```
 */
export function getDb(env: { DB: D1Database }): DrizzleD1Database {
	if (!env.DB) {
		throw new Error(
			'DB binding is not available. ' +
				'Ensure wrangler.jsonc is configured correctly and ' +
				'you are running in the Cloudflare Workers runtime.',
		);
	}

	return drizzle(env.DB);
}

/**
 * Type alias for Drizzle D1 database instance.
 * Use this type when passing the database instance around in your application.
 *
 * @example
 * ```typescript
 * import type { Db } from '@/lib/server/db';
 *
 * async function getArticles(db: Db) {
 *   return await db.select().from(articlesTable);
 * }
 * ```
 */
export type Db = DrizzleD1Database;
