# Drizzle ORM : Setup et Intégration avec D1

## Vue d'ensemble

Drizzle ORM est un ORM TypeScript-first léger et type-safe pour interact avec D1. Il offre une excellente intégration avec Cloudflare et une expérience de développement optimale.

## Avantages pour sebc.dev

✅ **Type-safe** : IntelliSense complet en TypeScript
✅ **Léger** : Minimal bundle size (critique pour Workers)
✅ **D1 Native** : Intégration directe sans couche abstraite
✅ **Migrations** : Excellent système de versioning
✅ **Relations** : Support des relations (one-to-many, many-to-many)

## Installation

```bash
npm install drizzle-orm @cloudflare/workers-types
npm install -D drizzle-kit
```

## Configuration

### Schema Definition

Créez votre schéma de base de données :

```typescript
// src/db/schema.ts
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Articles table
export const articles = sqliteTable(
  'articles',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    content: text('content').notNull(),
    language: text('language').notNull().default('fr'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
    published: integer('published', { mode: 'boolean' }).default(false),
  },
  (table) => ({
    slugIndex: index('idx_articles_slug').on(table.slug),
    langIndex: index('idx_articles_language').on(table.language),
  }),
);

// Comments table (example of relations)
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  articleId: text('article_id')
    .notNull()
    .references(() => articles.id, { onDelete: 'cascade' }),
  author: text('author').notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// Relations
export const articlesRelations = relations(articles, ({ many }) => ({
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  article: one(articles, {
    fields: [comments.articleId],
    references: [articles.id],
  }),
}));
```

### Drizzle Config

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  strict: true,
  verbose: true,
});
```

### Database Instance

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function getDrizzle(db: D1Database) {
  return drizzle(db, { schema });
}
```

## Utilisation dans Server Actions

### Select (Lecture)

```typescript
// src/app/actions.ts
'use server';

import { eq, and, desc } from 'drizzle-orm';
import { articles } from '@/db/schema';
import { getDrizzle } from '@/db';

export async function getArticles(env: CloudflareEnv) {
  const db = getDrizzle(env.DB);

  const result = await db
    .select()
    .from(articles)
    .where(eq(articles.published, true))
    .orderBy(desc(articles.createdAt))
    .limit(10);

  return result;
}

export async function getArticleBySlug(env: CloudflareEnv, slug: string) {
  const db = getDrizzle(env.DB);

  const result = await db
    .select()
    .from(articles)
    .where(eq(articles.slug, slug))
    .limit(1);

  return result[0];
}
```

### Insert (Création)

```typescript
export async function createArticle(
  env: CloudflareEnv,
  data: {
    title: string;
    slug: string;
    content: string;
    language: string;
  },
) {
  const db = getDrizzle(env.DB);
  const now = new Date();

  const result = await db
    .insert(articles)
    .values({
      id: crypto.randomUUID(),
      title: data.title,
      slug: data.slug,
      content: data.content,
      language: data.language,
      createdAt: now,
      updatedAt: now,
      published: false,
    })
    .returning();

  return result[0];
}
```

### Update (Modification)

```typescript
export async function updateArticle(
  env: CloudflareEnv,
  id: string,
  data: Partial<typeof articles.$inferInsert>,
) {
  const db = getDrizzle(env.DB);

  const result = await db
    .update(articles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(articles.id, id))
    .returning();

  return result[0];
}
```

### Delete (Suppression)

```typescript
export async function deleteArticle(env: CloudflareEnv, id: string) {
  const db = getDrizzle(env.DB);

  await db.delete(articles).where(eq(articles.id, id));
}
```

## Validation avec Zod

Intégrez Drizzle avec Zod pour une validation complète :

```typescript
// src/lib/validation.ts
import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { articles } from '@/db/schema';

// Génère un schéma Zod du schéma Drizzle
export const insertArticleSchema = createInsertSchema(articles)
  .pick({
    title: true,
    slug: true,
    content: true,
    language: true,
  })
  .extend({
    title: z.string().min(5).max(255),
    slug: z
      .string()
      .min(3)
      .max(100)
      .regex(/^[a-z0-9-]+$/),
    content: z.string().min(50),
  });

export type InsertArticle = z.infer<typeof insertArticleSchema>;
```

## Relations et Queries Avancées

### Avec Relations

```typescript
export async function getArticleWithComments(env: CloudflareEnv, id: string) {
  const db = getDrizzle(env.DB);

  const result = await db.query.articles.findFirst({
    where: eq(articles.id, id),
    with: {
      comments: true,
    },
  });

  return result;
}
```

## Best Practices

✅ Définissez un schéma fort dans `schema.ts`
✅ Utilisez les relations pour les requêtes complexes
✅ Combinez avec Zod pour la validation
✅ Générez les migrations avec Drizzle Kit
✅ Utilisez les indexes pour les colonnes fréquemment filtrées

❌ N'écrivez pas du SQL brut quand Drizzle suffit
❌ N'oubliez pas les `returning()` pour récupérer les données insérées
❌ Ne créez pas des schemas sans indexes sur les colonnes clés
❌ Ne mélangez pas Drizzle et SQL brut dans le même projet

## Ressources

- [Drizzle Docs](https://orm.drizzle.team/)
- [Drizzle with D1](https://orm.drizzle.team/docs/get-started-sqlite)
- [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)
