# Observabilité : Logs Structurés JSON avec Cloudflare

## Vue d'ensemble

Les logs structurés JSON sont la meilleure pratique pour l'observabilité des systèmes distribués. Cloudflare indexe et analyse automatiquement les logs en JSON, permettant des requêtes et alertes puissantes.

## Configuration

### 1. Activer dans wrangler.toml

```toml
[observability]
enabled = true

[env.production]
[env.production.observability]
enabled = true
```

### 2. Logger avec Format Structuré

```typescript
// src/lib/logger.ts
interface LogEntry {
  level: "debug" | "info" | "warn" | "error";
  timestamp: string;
  context: string; // Contexte du log (fonction, module)
  data?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
  };
}

export function log(entry: LogEntry) {
  console.log(JSON.stringify(entry));
}

export const logger = {
  debug: (context: string, data?: any) => {
    log({ level: "debug", timestamp: new Date().toISOString(), context, data });
  },
  info: (context: string, data?: any) => {
    log({ level: "info", timestamp: new Date().toISOString(), context, data });
  },
  warn: (context: string, data?: any) => {
    log({ level: "warn", timestamp: new Date().toISOString(), context, data });
  },
  error: (context: string, error: Error, data?: any) => {
    log({
      level: "error",
      timestamp: new Date().toISOString(),
      context,
      data,
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
  },
};
```

## Utilisation dans l'Application

### Server Actions

```typescript
// src/app/actions.ts
"use server";

import { logger } from "@/lib/logger";
import { getDrizzle } from "@/db";

export async function createArticle(
  env: CloudflareEnv,
  formData: FormData
) {
  const context = "createArticle";

  try {
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;

    logger.info(context, {
      action: "creating_article",
      title,
      slug,
    });

    const db = getDrizzle(env.DB);
    const result = await db
      .insert(articles)
      .values({
        id: crypto.randomUUID(),
        title,
        slug,
        content: formData.get("content") as string,
        createdAt: new Date(),
        updatedAt: new Date(),
        published: false,
      })
      .returning();

    logger.info(context, {
      action: "article_created",
      articleId: result[0].id,
    });

    return { success: true, article: result[0] };
  } catch (error) {
    logger.error(context, error as Error, {
      action: "create_article_failed",
      formData: Object.fromEntries(formData),
    });

    throw new Error("Failed to create article");
  }
}
```

### Route Handlers

```typescript
// src/app/api/articles/route.ts
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  const context = "GET /api/articles";

  logger.info(context, {
    url: request.url,
    method: "GET",
  });

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");

    logger.debug(context, {
      pagination: { page, perPage: 10 },
    });

    // Récupérer les articles
    const articles = []; // ... fetch logic

    logger.info(context, {
      action: "articles_fetched",
      count: articles.length,
    });

    return Response.json(articles);
  } catch (error) {
    logger.error(context, error as Error);
    return Response.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
```

## Format de Log Recommandé

```typescript
// Structure cohérente
{
  "level": "info",
  "timestamp": "2025-11-07T10:30:45.123Z",
  "context": "createArticle",
  "data": {
    "action": "article_created",
    "articleId": "uuid-123",
    "duration_ms": 245,
    "environment": "production"
  }
}

// Pour les erreurs
{
  "level": "error",
  "timestamp": "2025-11-07T10:30:45.123Z",
  "context": "uploadFile",
  "data": {
    "action": "upload_failed",
    "fileName": "image.jpg",
    "fileSize": 5242880
  },
  "error": {
    "message": "File too large",
    "stack": "Error: File too large\\n  at validateFile..."
  }
}
```

## Requêtes dans Cloudflare Logs

Une fois les logs structurés activés, Cloudflare indexe automatiquement les champs JSON.

### Exemples de Requêtes

```
# Trouver tous les erreurs de création d'article
Status: error AND Outcome: success AND context: createArticle

# Articles créés aujourd'hui
Status: success AND data.action: article_created AND Timestamp >= -24h

# Performance des uploads
context: uploadFile AND data.duration_ms > 1000

# Erreurs de base de données
error.message: *Database* OR error.message: *constraint*
```

## Monitoring et Alertes

### Métriques Clés

```typescript
// Tracker les performances
logger.info("serverAction", {
  action: "get_articles",
  duration_ms: Date.now() - startTime,
  count: articles.length,
  cached: false,
});
```

### Créer des Alertes

Dans Cloudflare Dashboard → Alerts :

1. **Erreurs en Production** :
   ```
   Status: error AND Environment: production
   ```

2. **Performance Dégradée** :
   ```
   data.duration_ms > 5000 AND Timestamp >= -1h
   ```

3. **Taux d'Erreur Élevé** :
   ```
   Status: error | stats count
   ```

## Considérations de Performance

⚠️ **Logging a un coût** :
- Chaque log consomme une requête
- Les logs volumineux ralentissent l'application
- L'indexation prend du temps

### Optimisation

✅ Loggez les actions critiques (`info`)
✅ Utilisez `debug` uniquement en développement
✅ Limitez la taille des données loggées
✅ Utilisez des codes d'erreur courts plutôt que des messages longs

❌ Ne loggez pas chaque itération de boucle
❌ Ne loggez pas les données sensibles (emails, tokens)
❌ Ne loggez pas des objets sérialisés complexes

## Agrégation Multi-Tenant (Futur)

Pour une architecture multi-tenant (Post-V1) :

```typescript
logger.info("createArticle", {
  action: "article_created",
  tenantId: env.TENANT_ID, // Ajouter le tenant
  articleId: article.id,
});
```

Cela permet de :
- Filtrer les logs par tenant
- Alerter sur le trafic anormal d'un tenant
- Analyser les performances par tenant

## Ressources

- [Cloudflare Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)
- [Structured Logging Best Practices](https://www.kartar.net/2015/12/structured-logging/)
- [JSON Logging Standard](https://github.com/elastic/ecs-logging/blob/main/README.md)
- [Cloudflare Logpush Integration](https://developers.cloudflare.com/logs/logpush/)
