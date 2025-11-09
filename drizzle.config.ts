import type { Config } from 'drizzle-kit';

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        `Please copy .env.example to .env and fill in your values.\n` +
        `See docs/environment-setup.md for detailed configuration guide.`,
    );
  }
  return value;
}

export default {
  schema: './src/lib/server/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite', // D1 is SQLite-based
  driver: 'd1-http',
  dbCredentials: {
    accountId: getRequiredEnv('CLOUDFLARE_ACCOUNT_ID'),
    databaseId: getRequiredEnv('CLOUDFLARE_DATABASE_ID'),
    token: getRequiredEnv('CLOUDFLARE_API_TOKEN'),
  },
} satisfies Config;
