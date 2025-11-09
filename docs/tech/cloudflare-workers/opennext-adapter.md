# OpenNext Adapter pour Cloudflare Workers

## Vue d'ensemble

OpenNext 3 est l'adaptateur stratégique officiel recommandé par Cloudflare pour déployer des applications Next.js 15 sur Cloudflare Workers. Il remplace l'ancien adaptateur `@cloudflare/next-on-pages` qui est maintenant déprécié.

## Contexte Stratégique

### Transition de next-on-pages à OpenNext

Cloudflare a officiellement abandonné le maintien de son propre adaptateur `@cloudflare/next-on-pages` au profit de l'écosystème OpenNext communautaire. Cette décision reflète une stratégie d'architecture où :

- **Cloudflare** se concentre sur l'optimisation du runtime sous-jacent (workerd) et des services natifs (D1, R2, KV)
- **OpenNext** (communauté open-source) gère la couche d'adaptation complexe (le _shim_ qui traduit le build Next.js)

### Validation

- Avertissements de dépréciation clairs sur npm et GitHub pour `@cloudflare/next-on-pages`
- Blog officiel Cloudflare (avril 2025) : OpenNext est la "méthode préférée"
- Statut actuel : Recommandé pour la production en 2025

## Support des Fonctionnalités

OpenNext 3 supporte intégralement la stack Next.js 15 :

- ✅ App Router
- ✅ React Server Components (RSC)
- ✅ Server Actions
- ✅ Incremental Static Regeneration (ISR)
- ✅ Partial Prerendering (PPR) - expérimental

## Installation

```bash
npm install @opennextjs/cloudflare
# ou
pnpm add @opennextjs/cloudflare
```

## Configuration

Dans `wrangler.toml` :

```toml
[build]
command = "npm run build"
cwd = "."
watch_paths = ["src/**/*.{ts,tsx,js,jsx}"]
```

## Bindings Requis pour ISR et Caching

L'adaptateur OpenNext nécessite plusieurs bindings Cloudflare pour les fonctionnalités avancées :

| Binding                     | Service         | Fonction                       |
| --------------------------- | --------------- | ------------------------------ |
| `NEXT_INC_CACHE_R2_BUCKET`  | R2              | Cache incrémental (ISR/SSG)    |
| `NEXT_CACHE_DO_QUEUE`       | Durable Object  | File d'attente de revalidation |
| `NEXT_TAG_CACHE_DO_SHARDED` | Durable Object  | Cache de tags (revalidateTag)  |
| `WORKER_SELF_REFERENCE`     | Service Binding | Auto-référence du worker       |

## Points Critiques

### Compatibilité

La transition vers OpenNext signifie que votre projet dépend désormais de l'écosystème communautaire plutôt que du support direct de Cloudflare. Cependant, cet écosystème est activement maintenu et bien établi.

### Alignement avec la Stratégie Cloudflare

Ce choix s'aligne parfaitement avec la direction technologique de Cloudflare pour 2025, qui privilégie l'intégration avec les standards web plutôt que le maintien d'adaptateurs propriétaires.

## Ressources

- [OpenNext Documentation](https://opennext.js.org/)
- [Cloudflare Blog - Deploy Next.js with OpenNext](https://blog.cloudflare.com/deploying-nextjs-apps-to-cloudflare-workers-with-the-opennext-adapter/)
- [Cloudflare Docs - Next.js on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
