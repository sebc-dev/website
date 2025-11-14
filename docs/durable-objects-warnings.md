# Durable Objects Warnings - Explication et Solution

## Contexte

Lors du développement local avec OpenNext et Cloudflare Workers, des warnings concernant les Durable Objects apparaissent dans les logs :

```
▲ [WARNING] You have defined bindings to the following internal Durable Objects:
  - {"name":"NEXT_CACHE_DO_QUEUE","class_name":"DOQueueHandler"}
  - {"name":"NEXT_TAG_CACHE_DO_SHARDED","class_name":"DOShardedTagCache"}
  - {"name":"NEXT_CACHE_DO_PURGE","class_name":"BucketCachePurge"}
  These will not work in local development, but they should work in production.
```

## Pourquoi ces warnings ?

Ces warnings sont **normaux et attendus** selon la documentation officielle d'OpenNext :

1. **Limitation de wrangler dev** : Les Durable Objects internes ne sont pas supportés en mode développement local
2. **Fonctionnement en production** : Ces DO fonctionnent parfaitement lorsque déployés sur Cloudflare
3. **Non-critique pour le dev** : Le cache ISR n'est pas essentiel pendant le développement local

Source : https://opennext.js.org/cloudflare/known-issues

## Configuration des Durable Objects

### wrangler.jsonc

Les trois Durable Objects configurés pour le cache Next.js :

```jsonc
"durable_objects": {
  "bindings": [
    {
      "name": "NEXT_CACHE_DO_QUEUE",
      "class_name": "DOQueueHandler"
    },
    {
      "name": "NEXT_TAG_CACHE_DO_SHARDED",
      "class_name": "DOShardedTagCache"
    },
    {
      "name": "NEXT_CACHE_DO_PURGE",
      "class_name": "BucketCachePurge"
    }
  ]
},
"migrations": [
  {
    "tag": "v1",
    "new_sqlite_classes": ["DOQueueHandler", "DOShardedTagCache"]
  },
  {
    "tag": "v2",
    "new_sqlite_classes": ["BucketCachePurge"]
  }
]
```

**Notes importantes** :
- Ne pas spécifier `script_name` pour les Durable Objects internes (définis dans le même worker)
- Les migrations sont **immuables** : toujours créer une nouvelle migration (v2, v3...) au lieu de modifier une existante
- `BucketCachePurge` a été ajouté dans la migration v2 pour respecter cette contrainte d'immutabilité

### open-next.config.ts

Configuration du cache avec Durable Objects :

```ts
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: doQueue,
  tagCache: doShardedTagCache({ baseShardSize: 12 }),
});
```

## Solution : Filtrage des warnings en développement

Pour éviter le bruit dans les logs pendant les tests E2E, nous utilisons un script wrapper qui filtre les warnings.

### Script de filtrage : `scripts/dev-quiet.sh`

Ce script lance le serveur de dev en filtrant les warnings Durable Objects :

```bash
#!/bin/bash
# Enable pipefail to propagate errors through the pipe
set -o pipefail

pnpm dev 2>&1 | grep -v \
  -e "You have defined bindings to the following internal Durable Objects:" \
  -e "workerd/server/server.c++:1952: warning: A DurableObjectNamespace" \
  # ... autres patterns
```

**Important** : Le script utilise `set -o pipefail` pour que les erreurs du serveur de dev se propagent correctement. Sans cette option, Playwright pourrait attendre indéfiniment si le serveur échoue au démarrage.

### Configuration Playwright

Le fichier `playwright.config.ts` utilise ce script pour les tests E2E :

```ts
webServer: {
  command: 'bash scripts/dev-quiet.sh',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
}
```

## Environnements

### Développement local

- ❌ Durable Objects : Non fonctionnels (warnings attendus)
- ✅ Tests : Passent sans problème
- ✅ Cache : Utilise le fallback en mémoire

### CI/CD

- ❌ Durable Objects : Non fonctionnels (warnings filtrés)
- ✅ Tests : Exécutés avec logs propres
- ✅ Build : Vérifié et validé

### Production (Cloudflare Workers)

- ✅ Durable Objects : Pleinement fonctionnels
- ✅ Cache ISR : Optimisé avec R2 + DO
- ✅ Performance : Revalidation rapide

## Diagnostic

Si vous voyez toujours des warnings après cette configuration :

1. **Vérifier les noms de classes** : Les classes exportées dans `.open-next/worker.js` doivent correspondre exactement aux `class_name` dans `wrangler.jsonc`

2. **Vérifier le build** : Assurez-vous que `.open-next/` est à jour avec `pnpm build`

3. **Vérifier le script** : Le script `scripts/dev-quiet.sh` doit être exécutable (`chmod +x`)

## Références

- [OpenNext - Known Issues](https://opennext.js.org/cloudflare/known-issues)
- [OpenNext - Caching](https://opennext.js.org/cloudflare/caching)
- [Cloudflare - Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Cloudflare - Local Development](https://developers.cloudflare.com/workers/development-testing/)
