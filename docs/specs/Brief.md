---
created: 2025-11-01T08:45
updated: 2025-11-05T00:00
---

# Project Brief: sebc.dev

## Executive Summary

sebc.dev est un blog technique bilingue (français/anglais) tenu par un auteur unique. Il explore trois piliers fondamentaux : l'IA comme outil d'amplification, les principes d'UX, et les bonnes pratiques d'ingénierie logicielle. Chaque article illustre un apprentissage réel dans une logique _learning in public_, garantissant authenticité et valeur pour la communauté technique.

## Problem Statement

- Les développeurs mid-level en startup manquent de ressources optimisant leur efficacité (time-to-value < 60s)
- Les juniors en apprentissage ont besoin de guidance progressive avec découverte rapide de patterns (< 3min)
- Les indie hackers/freelances recherchent une vue d'ensemble actionnable sans friction cognitive
- Intégrer l'IA dans les workflows reste complexe et mal documenté
- L'abondance de contenus rend difficile l'identification rapide de pratiques modernes efficaces

## Proposed Solution

- Un blog bilingue centré sur l'expérience d'un développeur documentant ses apprentissages.
- Articles organisés par piliers (IA, UX, ingénierie logicielle).
- Documentation transparente des parcours d'apprentissage, échecs, réussites et rétrospectives.
- Stack technique moderne : **Next.js 15 + Cloudflare Workers + D1 + R2**, avec panneau d'administration personnalisé.

## Target Users

- **Développeurs mid-level en startup** : besoin d'efficacité maximale, solutions rapides, focus sur la productivité
- **Juniors en apprentissage** : guidance progressive, pédagogie claire, parcours structurés
- **Indie hackers/freelances** : vue d'ensemble stratégique, ROI clair, adaptation rapide
- **Communauté technique francophone et anglophone** intéressée par l'IA, l'UX et les bonnes pratiques
- Curieux du _learning in public_ et de l'usage pragmatique de l'IA

## Goals & Success Metrics

- **Court terme (V1)** : lancement du blog bilingue avec Hub de Recherche Avancée, publication régulière, atteindre 500+ lecteurs réguliers
- **Moyen terme (Post-V1)** : interactions communautaires (commentaires, newsletter), amélioration analytics, construire une audience > 2 000 abonnés
- **Long terme** : extension YouTube, opportunités organiques (partenariats, formations, consulting).

## MVP Scope (V1) — Architecture & Workflow

### Architecture Projet

- **Application Next.js 15** full-stack déployée sur Cloudflare Workers
  - Framework App Router avec React Server Components
  - Panneau d'administration intégré (route `/admin`)
  - Configuration unifiée dans `wrangler.toml`
  - Développement local unifié : `wrangler dev -- npx next dev` (HMR + bindings)

### Stack Technique

- **Framework** : Next.js 15 (App Router avec React Server Components)
- **Adaptateur** : `@opennextjs/cloudflare` (OpenNext adapter - l'ancien @cloudflare/next-on-pages est obsolète)
- **UI** : TailwindCSS 4 + shadcn/ui (composants copy-paste)
- **Backend** : Next.js Server Actions + Drizzle ORM
- **Base de données** : Cloudflare D1 (SQLite Serverless, mature en production 2025)
- **Stockage média** : Cloudflare R2 (via Presigned URLs générées par Route Handlers)
- **Runtime** : Cloudflare Workers (workerd)
- **CI/CD** : GitHub Actions (tests → migrations D1 → build OpenNext → déploiement)
- **Cache** : Architecture OpenNext multi-composants (R2 + Durable Objects + D1 + KV)

### Fonctionnalités produit

- Blog **bilingue (FR/EN)** avec contenu **MDX** et blocs de contenu flexibles
- **Internationalisation** avec **next-intl** :
  - Middleware pour gestion des préfixes `/fr` et `/en`
  - Traductions typesafe dans `messages/fr.json` et `messages/en.json`
  - Détection automatique de langue (URL, cookie, Accept-Language header)
  - Support complet App Router et React Server Components
- **Hub de recherche avancée** : filtres multi-critères (mots-clés, **9 catégories**, tags, **niveau de complexité**, **durée de lecture**, date)
  - État maintenu dans l'URL via URL Search Params
  - Mise à jour sans rechargement de page
  - Utilisation de React Server Components pour pré-chargement serveur
- **Indicateur de complexité** (Débutant / Intermédiaire / Avancé)
  > _Stockage des valeurs en anglais : `beginner|intermediate|advanced`; labels localisés en UI_
- **Identité visuelle** distincte pour les **9 catégories** (icônes, couleurs, badges)
- **Table des matières** auto-générée + **temps de lecture par section**
- **Indicateur de progression** de lecture (composant React avec hooks)
- **Optimisation images** via Cloudflare Images (transformation runtime, format=auto pour AVIF/WebP)
  - Loader personnalisé pour `next/image` intégré à Cloudflare Images
- **Administration** via panneau personnalisé :
  - Création / édition / publication via **Server Actions** (fonctions async dans composants serveur)
  - Validation avec **react-hook-form** + **Zod** (schemas générés par drizzle-zod)
  - Progressive enhancement via transitions React
  - Composants UI shadcn/ui
- **Publication en lecture seule** (pas d'interactions utilisateur en V1)

### Sécurité & opérations

- **Authentification Admin V1** : Cloudflare Access (Zero Trust) pour sécuriser `/admin`
  - Validation JWT (`Cf-Access-Jwt-Assertion`) dans middleware Next.js avec `jose`
- **Authentification Utilisateurs Post-V1** : Better Auth avec adaptateur `better-auth-cloudflare` (intégration native D1 + Drizzle + KV)
- **Sécurité Réseau** : Cloudflare WAF (Web Application Firewall) contre menaces web
- **Réseau** : Infrastructure Edge mondiale de Cloudflare (déploiement sur 300+ datacenters)
- **Configuration** : `wrangler.toml` comme source de vérité
  - `compatibility_flags = ["nodejs_compat"]` (obligatoire pour Next.js)
  - `compatibility_date = "2025-03-25"` (date récente requise)
  - Bindings pour D1, R2, Durable Objects, KV
- **Secrets** : `.dev.vars` (local) + `wrangler secret` (production)
- **Monitoring V1** : Cloudflare Health Checks sur endpoint `/health` + Workers Metrics & Workers Logs
- **Observabilité** : Logs structurés JSON activés via `[observability]` dans wrangler.toml
  - `enabled = true`
  - `head_sampling_rate = 1.0` (100% des requêtes)
  - Best practice : `console.log({ level, context, data })`
- **Analytics V1** : Cloudflare Web Analytics (privacy-first, sans cookies)
- **Backups** : D1 Time Travel (Point-in-Time Recovery sur 30 jours)

### Qualité

- **Tests composants** : Vitest + @testing-library/react
- **Tests E2E** : Playwright avec fixtures de base de données (seeding via `wrangler d1 execute DB --local --file=./seed.sql`)
- **Tests mutation** : Stryker.js pour validation qualité tests générés par IA (mutation score > 80%)
- **Couverture** : ≥ 70 %
- **Outils qualité** :
  - ESLint (Flat Config) avec support MDX et linting typé
  - Prettier avec plugin Tailwind CSS
  - dependency-cruiser (validation architecture client/serveur)
  - @next/bundle-analyzer (détection erreurs bundling)
- **Pipeline CI/CD** :
  1. Tests (composants + E2E) + Lint + Validation architecture
  2. Mutation testing (hebdomadaire OU si PR critique)
  3. Migrations D1 (`wrangler d1 migrations apply DB --remote`)
  4. Build Next.js via OpenNext
  5. Déploiement (`wrangler deploy`)
- **SEO** : Meta tags optimisés (Open Graph, Twitter Cards) via Next.js Metadata API, sitemap généré automatiquement

> **Périmètre volontairement ambitieux** : une priorisation stricte sera appliquée. Certaines fonctionnalités secondaires pourront glisser en **post-V1** si nécessaire.

## Future Vision (Post-V1 & Beyond)

- **Post-V1** : commentaires, inscriptions (Better Auth avec `better-auth-cloudflare`), newsletter (Cloudflare Email Service + templates react-email), wiki "Dev Resources" avancé (versionning, historique, index, glossaire, liens croisés), amélioration analytics (éventuellement Plausible pour fonctionnalités avancées)

## Clarifications Techniques

### Structure du Projet

- **Application Next.js** standard avec App Router
- Panneau d'administration intégré dans `/admin` (pas de CMS externe)
- Composants réutilisables organisés dans `src/components`
- Utilitaires et helpers dans `src/lib` (code serveur et client)

### Patterns Next.js Spécifiques

- **Server Actions** pour mutations (fonctions async dans composants serveur)
- **Server Components** pour pré-chargement de données (async components)
- **Route Handlers** (`route.ts`) pour API endpoints (Presigned URLs R2)
- **Middleware** (`middleware.ts`) pour authentification et internationalisation
- **Metadata API** pour SEO (meta tags, Open Graph, Twitter Cards)

### Migration des Données

- Scripts de migration Drizzle pour génération SQL (`drizzle-kit generate`)
- Application via Wrangler (`wrangler d1 migrations apply DB --local|--remote`)
- Workflow en deux étapes obligatoire (Drizzle Kit → Wrangler)
- Export/Import SQL natif Cloudflare pour backup/restore
- Time Travel D1 pour récupération point-in-time (30 jours)

### Hébergement Serverless

- Pas de gestion d'infrastructure (VPS, Docker, firewall)
- Déploiement automatisé via GitHub Actions vers Cloudflare Workers
- Scalabilité automatique via infrastructure Edge
- Configuration centralisée dans `wrangler.toml`

### Métriques Unifiées

- **UX** : Time-to-value < 60s, Pattern discovery < 3min
- **Core Web Vitals** : LCP < 2.5s, INP < 100ms, CLS < 0.1
- **Performance Edge** : Distribution globale, latence minimale via Edge network

## Principes Architecturaux Clés

Ces principes, validés par la recherche technique Next.js/Cloudflare Workers 2025, guident toutes les décisions techniques :

1. **Adaptateur OpenNext** : Utiliser `@opennextjs/cloudflare` (l'ancien `@cloudflare/next-on-pages` est obsolète et archivé)
2. **Configuration Wrangler** : Utiliser `wrangler.toml` comme source de vérité pour tous les bindings (D1, R2, KV, Durable Objects)
3. **nodejs_compat Flag** : Activer `compatibility_flags = ["nodejs_compat"]` (prérequis non négociable pour Next.js)
4. **Développement Local Unifié** : Utiliser `wrangler dev -- npx next dev` pour HMR + bindings (friction historique résolue en 2025)
5. **Cache OpenNext Complet** : Configurer tous les bindings requis pour ISR/revalidateTag (R2, Durable Objects, D1, WORKER_SELF_REFERENCE)
6. **Chaîne de Validation Intégrée** : Drizzle Schema → drizzle-zod → Zod → react-hook-form pour type-safety de bout en bout
7. **Stockage R2 via URLs Pré-signées** : Téléversements directs depuis le client pour éviter les limites de taille des Workers
8. **Authentification via Cloudflare Access** : Validation JWT `Cf-Access-Jwt-Assertion` dans middleware Next.js (bibliothèque `jose`)
9. **Better Auth avec Adaptateur Cloudflare** : Utiliser `better-auth-cloudflare` pour intégration native D1/Drizzle/KV
10. **Email Service Natif** : Utiliser Cloudflare Email Service (binding natif) au lieu de Resend (incompatibilités runtime Workers)
11. **i18n avec next-intl** : Solution de référence pour App Router, typesafe, avec support RSC
12. **Tests Haute-Fidélité** : Vitest + Testing Library pour composants, Playwright avec seeding D1 (`wrangler d1 execute --local --file=seed.sql`)
13. **Déploiement en Deux Étapes** : Migrations DB d'abord (`wrangler d1 migrations apply --remote`), puis déploiement Worker
14. **Logs Structurés JSON** : Activer `[observability]` dans wrangler.toml et utiliser `console.log({ level, context, data })`
15. **Server Components First** : Privilégier React Server Components pour data fetching, utiliser Client Components uniquement pour interactivité
16. **Edge-First Architecture** : Concevoir pour le runtime Workers (pas de filesystem, APIs asynchrones, limites CPU)

## Risks & Open Questions

**Risks**

- Dépendance à un seul auteur = risque de ralentissement.
- Audience bilingue = dilution possible si préférence de langue mal adressée.
- Stack Next.js + Cloudflare Workers via OpenNext relativement récente (bien que mature en 2025).
- Cloudflare Email Service en private beta (nécessite inscription).

**Open Questions**

- Quelle stratégie de traduction (IA + relecture ou écriture native FR/EN) ?
- Quelles priorités pour les évolutions post-V1 (communauté vs analytics) ?
- Migration progressive du contenu vers la nouvelle architecture ?
- Utilisation de Cloudflare Durable Objects pour fonctionnalités stateful futures ?
- Stratégie de cache optimale avec l'architecture OpenNext (R2 + DO + D1) ?
- Configuration spécifique des bindings OpenNext pour performance maximale ?
