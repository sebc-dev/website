# Story 0.5 - Configurer wrangler.toml avec bindings

**Epic**: Epic 0 - Socle technique (V1)
**Story ID**: 0.5
**Created**: 2025-11-12
**Status**: 🚧 IN PROGRESS (50%) - Phase 1 implementation underway

---

## 📖 Story Description

Configurer complètement le fichier `wrangler.jsonc` avec tous les bindings requis pour le fonctionnement optimal de l'application Next.js sur Cloudflare Workers. Cette configuration est essentielle pour activer l'architecture cache OpenNext complète et permettre l'interaction avec les ressources Cloudflare (D1, R2, KV, Durable Objects).

## 🎯 Story Objectives

- Configurer les bindings R2 pour le cache incrémental ISR (Incremental Static Regeneration)
- Configurer les bindings Durable Objects pour la queue de révalidation et le cache de tags
- Configurer les bindings KV comme alternative au cache de tags D1 pour faible trafic
- Configurer le binding WORKER_SELF_REFERENCE pour la communication inter-composants OpenNext
- Documenter la configuration des bindings et leur rôle dans l'architecture OpenNext
- Valider la configuration complète localement et en production

## 📋 Acceptance Criteria (from PRD)

### EF Requirements Covered

Cette story supporte principalement **ENF3 (Cache OpenNext)** et **ENF5 (Runtime Cloudflare Workers)** du PRD.

**ENF3 - Cache OpenNext** :
- CA1 : Configuration des bindings OpenNext requis dans wrangler.toml (R2, Durable Objects, D1/KV pour tags)
- CA2 : Headers de cache HTTP configurés pour pages statiques et API
- CA3 : Support ISR (Incremental Static Regeneration) via R2 et queue Durable Objects
- CA4 : Support `revalidateTag()` et `revalidatePath()` via cache de tags (Durable Objects recommandé pour production)

**ENF5 - Runtime Cloudflare Workers** :
- CA3 : Variables d'environnement et bindings gérés via `wrangler.toml` et accessibles dans le code

### Story-Specific Acceptance Criteria

**CA1 : R2 Bucket pour cache incrémental** ✅ Must Have
- Binding `NEXT_INC_CACHE_R2_BUCKET` configuré dans wrangler.jsonc
- Bucket R2 créé via `wrangler r2 bucket create`
- Documentation du rôle du cache incrémental ISR

**CA2 : Durable Objects pour queue de révalidation** ✅ Must Have
- Binding `NEXT_CACHE_DO_QUEUE` configuré
- Classe `DOQueueHandler` référencée (implémentation fournie par OpenNext)
- Documentation du mécanisme de queue pour ISR

**CA3 : Durable Objects pour cache de tags** ✅ Must Have (production) / Nice to Have (D1 alternative)
- Binding `NEXT_TAG_CACHE_DO_SHARDED` configuré pour production (sharded, performant)
- Alternative D1 documentée : `NEXT_TAG_CACHE_D1` pour faible trafic
- Documentation du choix entre DO et D1 selon le trafic

**CA4 : Service binding pour self-reference** ✅ Must Have
- Binding `WORKER_SELF_REFERENCE` configuré
- Référence correcte au service Worker (`website`)
- Documentation de l'usage pour communication inter-composants

**CA5 : Configuration OpenNext activée** ✅ Must Have
- `open-next.config.ts` mis à jour avec activation cache R2
- Import de `r2IncrementalCache` décommenté
- Configuration cohérente entre wrangler.jsonc et open-next.config.ts

**CA6 : Validation locale** ✅ Must Have
- Tests de build OpenNext réussis avec bindings configurés
- Validation via `wrangler dev` sans erreurs de bindings manquants
- Logs confirmant l'utilisation du cache R2

**CA7 : Documentation complète** ✅ Must Have
- Guide de configuration des bindings
- Diagramme de l'architecture cache OpenNext
- Procédure de création des ressources Cloudflare (R2, DO)
- Comparaison DO vs D1 pour cache de tags

## 🔍 Current State Analysis

### What's Already Done (20%)

✅ **D1 Database Binding** (Story 0.4)
- Binding `DB` configuré dans wrangler.jsonc
- Database `sebc-dev-db` créé et opérationnel
- Migrations Drizzle configurées et fonctionnelles

✅ **Compatibility Flags** (Story 0.6)
- `nodejs_compat` activé (requis pour Next.js)
- `global_fetch_strictly_public` activé
- `compatibility_date: "2025-03-01"` configuré

✅ **Assets Binding**
- Binding `ASSETS` configuré pour `.open-next/assets`
- Assets statiques servis correctement

✅ **Observability**
- Logs structurés activés (`observability.enabled: true`)

### What's Missing (80%)

❌ **R2 Bucket Binding**
- Binding `NEXT_INC_CACHE_R2_BUCKET` non configuré
- Bucket R2 non créé
- Cache incrémental ISR non opérationnel

❌ **Durable Objects Bindings**
- Binding `NEXT_CACHE_DO_QUEUE` non configuré
- Binding `NEXT_TAG_CACHE_DO_SHARDED` non configuré
- Durable Objects non déclarés (migrations)

❌ **Service Binding**
- Binding `WORKER_SELF_REFERENCE` non configuré
- Communication inter-composants OpenNext non disponible

❌ **OpenNext Configuration**
- `open-next.config.ts` avec cache R2 commenté
- Architecture cache OpenNext non activée

## 🏗️ Technical Context

### OpenNext Cache Architecture

L'architecture cache OpenNext pour Cloudflare Workers repose sur plusieurs composants :

1. **R2 Incremental Cache** : Stockage persistant des pages ISR générées
   - Utilisé par `revalidate` dans `generateStaticParams` ou `fetch`
   - Permet le cache distribué global des pages statiques

2. **Durable Objects Queue** : Queue de révalidation pour ISR
   - Gère les tâches de révalidation en arrière-plan
   - Assure la cohérence du cache lors des mises à jour

3. **Durable Objects Tag Cache** (ou D1) : Cache des tags pour `revalidateTag()`
   - Permet l'invalidation granulaire du cache par tags
   - DO recommandé pour production (sharded, performant)
   - D1 acceptable pour faible trafic (<10k req/jour)

4. **Worker Self-Reference** : Communication entre composants OpenNext
   - Permet aux workers de communiquer entre eux
   - Requis pour architecture multi-worker OpenNext

### Bindings Required

```jsonc
{
  // R2 pour cache incrémental
  "r2_buckets": [
    {
      "binding": "NEXT_INC_CACHE_R2_BUCKET",
      "bucket_name": "next-cache"
    }
  ],

  // Durable Objects pour queue ISR
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

  // Service binding pour self-reference
  "services": [
    {
      "binding": "WORKER_SELF_REFERENCE",
      "service": "website"
    }
  ]
}
```

### Alternative: D1 Tag Cache (Low Traffic)

Pour les sites à faible trafic, D1 peut remplacer Durable Objects pour le cache de tags :

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "sebc-dev-db",
      "database_id": "..."
    },
    {
      "binding": "NEXT_TAG_CACHE_D1",
      "database_name": "next-tag-cache",
      "database_id": "..."
    }
  ]
}
```

**Recommandation** : Utiliser Durable Objects (sharded) pour production, D1 uniquement si budget limité ou trafic très faible.

## 📦 Dependencies

### Depends On (Completed)
- Story 0.1 : Projet Next.js initialisé ✅
- Story 0.2 : Adaptateur OpenNext configuré ✅
- Story 0.4 : Drizzle ORM + D1 configuré ✅ (binding D1 existant)
- Story 0.6 : Compatibility flags configurés ✅

### Blocks
- Story 0.7 : CI/CD (deployment workflow nécessite bindings complets)
- EPIC 5 : Cache & Performance (dépend entièrement de cette configuration)

### External Dependencies
- Cloudflare Account avec accès à R2, Durable Objects, Workers
- Wrangler CLI v3+ installé
- Droits de création de ressources Cloudflare (R2 buckets, DO)

## 📊 Story Metrics

### Estimated Complexity
**Medium** - Configuration technique avec validation multi-environnements

### Estimated Duration
**2-3 days** (incluant tests et documentation)

### Risk Level
🟡 **Medium**

**Risks** :
- Configuration incorrecte des bindings peut empêcher le déploiement
- Durable Objects nécessitent des migrations spécifiques (non Drizzle)
- Coût potentiel des Durable Objects (à monitorer)
- Différences de comportement local vs production (wrangler dev vs deploy)

**Mitigation** :
- Tests locaux avec `wrangler dev` avant déploiement
- Documentation exhaustive des bindings et leur rôle
- Stratégie de rollback documentée
- Monitoring des coûts Cloudflare activé

## 🧪 Testing Strategy

### Unit Tests
Non applicable (configuration pure)

### Integration Tests
- ✅ Build OpenNext réussi avec bindings configurés
- ✅ `wrangler dev` démarre sans erreurs de bindings
- ✅ Logs confirmant l'utilisation du cache R2
- ✅ Test de `revalidatePath()` et `revalidateTag()` (via E2E)

### E2E Tests
- ✅ Page avec `revalidate` se met en cache R2
- ✅ Invalidation de cache via `revalidateTag()` fonctionne
- ✅ ISR génère des pages à la demande et les met en cache
- ✅ Performance du cache mesurable (cache hit vs cache miss)

### Manual Validation
- ✅ Création manuelle des ressources Cloudflare (R2, DO)
- ✅ Vérification dashboard Cloudflare (buckets, DO actifs)
- ✅ Test de déploiement complet avec bindings

## 📚 Related Documentation

### PRD References
- PRD lines 286-297 : ENF3 - Cache OpenNext
- PRD lines 310-319 : ENF5 - Runtime Cloudflare Workers
- PRD lines 978-989 : Décision cache stratégie (V1)
- PRD lines 1015-1022 : Hypothèses techniques (Cache)

### Architecture Documents
- Brief.md lines 99-100 : Cache architecture description
- PRD lines 172-192 : Principes architecturaux clés (cache OpenNext)

### Implementation References
- OpenNext Cloudflare Docs : https://opennext.js.org/cloudflare/caching
- Cloudflare R2 Docs : https://developers.cloudflare.com/r2/
- Cloudflare Durable Objects Docs : https://developers.cloudflare.com/durable-objects/

## 🔗 Next Steps

After this story is complete:
1. Story 0.7 (CI/CD) can finalize deployment workflow with complete bindings
2. EPIC 5 (Cache & Performance) can implement cache strategies using bindings
3. Production deployment becomes possible with full OpenNext cache support

---

**Story Created**: 2025-11-12
**Last Updated**: 2025-11-12
**Created by**: Claude Code (story-phase-planner skill)
**Current Progress**: 20% (D1 binding only, missing R2/DO/Service bindings)
