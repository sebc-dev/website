# Développement Local (DevEx) : Friction Réelle en 2025

## Vue d'ensemble

Contrairement aux affirmations optimistes, le développement local avec Next.js sur Cloudflare Workers reste **significativement fragmenté** en 2025. La friction n'est pas résolue.

## État Actuel (2025)

### Témoignages Utilisateurs

- **Février 2025** : "development nightmare" (cauchemar de développement)
- **Février 2025** : "Bindings with R2, D1, KV are an absolute nightmare for local development"
- **Novembre 2025** : "clearly chaos" lors du déploiement de Next.js 16

### Signal de Cloudflare

Un Product Manager de Cloudflare (février 2025) a demandé du feedback sur ces problèmes, affirmant : "nous travaillons activement à améliorer cela" - indiquant que les problèmes persistent.

## Problèmes Spécifiques Documentés

### 1. Défaillance du Hot Module Replacement (HMR)

**Description** : La commande `wrangler dev -- npx next dev` casse la boucle de "fast-refresh" de Next.js.

**Cause Racine** : Le proxy Wrangler ne parvient pas à relayer correctement la connexion WebSocket (ws://.../\_next/webpack-hmr) nécessaire au HMR.

**Symptômes** :

- Tentatives de reconnexion sans fin dans la console
- Modifications non appliquées sans rechargement complet
- Destruction de la productivité en développement

**Workaround** : Aucun workaround fiable. Vous devez accepter les rechargements complets.

### 2. Incompatibilité pnpm

**Description** : L'utilisation de `pnpm` avec `wrangler dev` provoque une erreur `500 Internal Server Error`.

**Cause Racine** : La structure node_modules basée sur liens symboliques de pnpm empêche Wrangler de trouver les manifestes de build de Next.js.

**Solution** : Ajouter à `.npmrc` :

```
shamefully-hoist=true
```

**Problème** : Cette solution annule les avantages fondamentaux de pnpm (efficacité du disque, structure propre).

### 3. Accès Difficile aux Bindings Locaux

**Description** : Connecter des outils comme Drizzle Studio à la base de données D1 locale simulée par Miniflare nécessite des manipulations manuelles.

**Processus** :

1. Trouver le fichier .sqlite caché dans `.wrangler/state/v3/d1/...`
2. Utiliser des scripts shell manuels pour y accéder
3. Aucune interface unifiée

## Architecture Sous-jacente

### L'Abstraction qui Fuit

La commande "unifiée" `wrangler dev -- npx next dev` est une **abstraction qui fuit**. Elle tente de :

- Simuler une plateforme cloud mondiale
- Servir de proxy pour un serveur de développement local complexe

Cette architecture "proxy-sur-proxy" est **fondamentalement fragile**.

## Stratégie Recommandée : Approche Bi-Modale

### Mode 1 : Développement UI

Pour le développement des composants et interfaces :

```bash
npx next dev
```

**Caractéristiques** :

- HMR fonctionne parfaitement
- Aucun proxy Wrangler
- Les données sont **mockées** ou connectées à une base **distante** (staging)

**Avantages** :

- Expérience de développement fluide
- Accès à tous les outils Next.js (DevTools, Fast Refresh)

### Mode 2 : Tests d'Intégration

Pour tester l'intégration avec les services Cloudflare :

```bash
npm run build  # Build de production
wrangler dev   # Sans npx next dev
```

**Caractéristiques** :

- Teste le build de production (opennextjs-cloudflare build)
- Utilise les bindings locaux Miniflare
- Mode sans HMR (similaire à la production)

**Avantages** :

- Fidélité réelle à l'environnement de production
- Utilisation des bindings locaux pour D1, R2, etc.

## Dépendance aux Tests E2E

Puisque le développement interactif (HMR) est cassé, la confiance du développeur doit être **reportée sur une suite de tests E2E de haute fidélité**.

Voir : [Tests E2E avec Playwright](../testing/playwright-e2e.md)

## Checklist pour un Développement Viable

- [ ] Accepter la friction et les deux modes de développement
- [ ] Mettre en place une suite E2E complète (Playwright)
- [ ] Documenter les bindings locaux et leur accès
- [ ] Établir des conventions pour le mode UI vs intégration
- [ ] Monitorer les performances en mode intégration
- [ ] Prévoir du temps pour les tests en staging avant production

## Points à Éviter

- ❌ Utiliser `wrangler dev -- npx next dev` comme source unique de vérité
- ❌ Supposer que le HMR fonctionnera
- ❌ Compter sur `pnpm` sans `shamefully-hoist`
- ❌ Développer uniquement en local sans tester en staging

## Ressources

- [GitHub Issue #691 - HMR WebSocket proxy](https://github.com/cloudflare/workers-sdk/issues/691)
- [GitHub Issue #10236 - pnpm incompatibility](https://github.com/cloudflare/workers-sdk/issues/10236)
