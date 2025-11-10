# Migrations D1 : Workflow Optimal avec Drizzle et Wrangler

## Vue d'ensemble

Le workflow optimal pour les migrations D1 combine l'écosystème Drizzle pour la génération de schémas et Wrangler pour l'exécution des migrations.

## Workflow en Deux Étapes (Meilleure Pratique)

### Étape 1 : Génération du SQL avec Drizzle

Utilisez `drizzle-kit generate` pour créer les fichiers de migration SQL :

```bash
drizzle-kit generate
```

**Ce que cela fait** :

1. Compare votre schéma Drizzle (`schema.ts`) avec un snapshot
2. Génère les fichiers SQL de migration dans `./drizzle/migrations/`
3. Met à jour le snapshot pour la prochaine comparaison

**Exemple généré** :

```sql
-- drizzle/migrations/0001_create_articles.sql
CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_articles_created_at ON articles(created_at);
```

### Étape 2 : Exécution avec Wrangler

Utilisez `wrangler d1 migrations apply` pour exécuter les migrations :

```bash
# Local
wrangler d1 migrations apply --local

# Production
wrangler d1 migrations apply --remote
```

**Ce que cela fait** :

1. Identifie les migrations non encore exécutées
2. Exécute les fichiers SQL contre la base D1
3. Enregistre l'état des migrations dans D1 (`_cf_KV` table interne)

## Configuration

### Drizzle

Dans `drizzle.config.ts` :

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    // Pour local dev, non requis
    // Wrangler gérera la base
  },
});
```

### Wrangler

Dans `wrangler.toml` :

```toml
[[d1_databases]]
binding = "DB"
database_name = "sebc_db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

[env.production]
  [[d1_databases]]
  binding = "DB"
  database_name = "sebc_db"
  database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

## Flux de Travail Complet

### 1. Modifier le Schéma Drizzle

```typescript
// src/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const articles = sqliteTable('articles', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  language: text('language').notNull(), // Nouveau champ
  createdAt: integer('created_at', { mode: 'timestamp' }),
});
```

### 2. Générer la Migration

```bash
npm run drizzle:generate
```

Cela crée un nouveau fichier dans `drizzle/migrations/` :

```sql
-- drizzle/migrations/0002_add_language.sql
ALTER TABLE articles ADD COLUMN language TEXT NOT NULL DEFAULT 'fr';
```

### 3. Appliquer Localement (Test)

```bash
wrangler d1 migrations apply --local
```

Testez votre application localement avec la nouvelle migration.

### 4. Appliquer en Production

```bash
wrangler d1 migrations apply
```

## Points Importants

### Génération vs Exécution

- **Drizzle généère** : Identifie les changements, crée le SQL
- **Wrangler exécute** : Applique le SQL à la base réelle

Ne mélangez pas les responsabilités.

### Versioning des Migrations

Chaque migration est un fichier numéroté :

- `0001_create_articles.sql`
- `0002_add_language.sql`
- `0003_create_comments.sql`

Wrangler en suit l'application automatiquement.

### Snapshot Drizzle

Drizzle maintient un snapshot du schéma. **Ne le supprimez pas** ou les migrations futures ne fonctionneront pas correctement.

```bash
drizzle/
├── migrations/
│   ├── 0001_create_articles.sql
│   ├── 0002_add_language.sql
│   └── meta/
│       ├── 0001_snapshot.json
│       └── 0002_snapshot.json
└── meta/
    └── _journal.json  # État global
```

## Bonnes Pratiques

✅ **Générez** les migrations avec Drizzle
✅ **Exécutez** avec Wrangler (D1 native migration system)
✅ **Testez localement** avant production
✅ **Versionnez** les fichiers de migration dans Git
✅ **Documentez** les changements de schéma majeurs

❌ **N'écrivez pas** du SQL manuel à côté de Drizzle
❌ **N'exécutez pas** les migrations avec des scripts custom
❌ **Ne supprimez pas** les snapshots Drizzle
❌ **Ne modifiez pas** les fichiers de migration après application

## Troubleshooting

### Migrations ne s'appliquent pas

Vérifiez que le `database_id` dans `wrangler.toml` est correct :

```bash
wrangler d1 list
```

### Snapshot désynchronisé

Si les migrations générées sont incorrectes :

```bash
# Supprimer le snapshot local et régénérer
rm -rf drizzle/meta
drizzle-kit generate
```

## Ressources

- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
- [Wrangler D1 Commands](https://developers.cloudflare.com/d1/wrangler-commands/)
