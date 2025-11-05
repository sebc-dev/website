---
created: 2025-11-01T08:45
updated: 2025-11-02T00:00
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
- Stack technique moderne : **SvelteKit 5 + Cloudflare Workers + D1 + R2**, avec panneau d'administration personnalisé.

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
- **Application SvelteKit 5** full-stack déployée sur Cloudflare Workers
  - Scaffolding via **C3** : `pnpm create cloudflare@latest --framework=svelte --platform=workers`
  - Panneau d'administration intégré (route `/admin`)
  - Configuration unifiée dans `wrangler.toml`
  - Plugin Vite Cloudflare pour développement unifié (HMR + bindings locaux)

### Stack Technique
- **Framework** : SvelteKit 5 avec Svelte 5 et Runes
- **Adaptateur** : `@sveltejs/adapter-cloudflare` (mode Workers)
- **UI** : TailwindCSS 4 (plugin Vite natif) + shadcn-svelte
- **Backend** : SvelteKit Form Actions + Drizzle ORM
- **Base de données** : Cloudflare D1 (SQLite Serverless)
- **Stockage média** : Cloudflare R2 (via Presigned URLs générées par endpoints `+server.ts`)
- **Runtime** : Cloudflare Workers (workerd)
- **CI/CD** : GitHub Actions (tests → build → migrations D1 → déploiement)
- **Cache** : Cloudflare KV + Durable Objects si nécessaire

### Fonctionnalités produit
- Blog **bilingue (FR/EN)** avec contenu **MDsveX** et blocs de contenu flexibles
- **Internationalisation** avec **Paraglide-JS** :
  - Hook `reroute` pour gestion des préfixes `/fr` et `/en`
  - Traductions compilées (tree-shakable)
  - Détection automatique de langue (URL, cookie)
- **Hub de recherche avancée** : filtres multi-critères (mots-clés, **9 catégories**, tags, **niveau de complexité**, **durée de lecture**, date)
  - État maintenu dans l'URL via URL Search Params
  - Mise à jour sans rechargement de page
  - Utilisation de load functions pour pré-chargement serveur
- **Indicateur de complexité** (Débutant / Intermédiaire / Avancé)
  > *Stockage des valeurs en anglais : `beginner|intermediate|advanced`; labels localisés en UI*
- **Identité visuelle** distincte pour les **9 catégories** (icônes, couleurs, badges)
- **Table des matières** auto-générée + **temps de lecture par section**
- **Indicateur de progression** de lecture (composant Svelte réactif)
- **Optimisation images** via Cloudflare Images (transformation runtime, format=auto pour AVIF/WebP)
- **Administration** via panneau personnalisé :
  - Création / édition / publication via **Form Actions** (`+page.server.ts`)
  - Validation avec **sveltekit-superforms** (Zod schemas générés par drizzle-zod)
  - Amélioration progressive via `use:enhance`
  - Composants UI shadcn-svelte
- **Publication en lecture seule** (pas d'interactions utilisateur en V1)

### Sécurité & opérations
- **Authentification Admin V1** : Cloudflare Access (Zero Trust) pour sécuriser `/admin`
  - Validation JWT (`Cf-Access-Jwt-Assertion`) dans `hooks.server.ts` avec `jose`
- **Authentification Utilisateurs Post-V1** : Better Auth (compatible D1 et Drizzle)
- **Sécurité Réseau** : Cloudflare WAF (Web Application Firewall) contre menaces web
- **Réseau** : Infrastructure Edge mondiale de Cloudflare (pas de gestion VPS/Docker/iptables)
- **Configuration** : `wrangler.toml` comme source de vérité (avec `compatibility_flags = ["nodejs_compat"]`)
- **Secrets** : `.dev.vars` (local) + `wrangler secret` (production) - exclusivement via `event.platform.env`
- **Monitoring V1** : Cloudflare Health Checks sur endpoint `/health` + Workers Metrics & Log Explorer
- **Analytics V1** : Cloudflare Web Analytics (privacy-first, sans cookies)
- **Backups** : Cloudflare D1 Time Travel (Point-in-Time Recovery)

### Qualité
- **Tests composants** : Vitest Browser Mode (exécution dans Chromium réel, pas JSDOM)
- **Tests E2E** : Playwright avec fixtures de base de données (seeding/reset automatique)
- **Couverture** : ≥ 70 %
- **Pipeline CI/CD** :
  1. Tests (composants + E2E)
  2. Build
  3. Migrations D1 (`wrangler d1 migrations apply DB --remote`)
  4. Déploiement (`wrangler deploy`)
- **SEO** : Meta tags optimisés (Open Graph, Twitter Cards), sitemap généré automatiquement

> **Périmètre volontairement ambitieux** : une priorisation stricte sera appliquée. Certaines fonctionnalités secondaires pourront glisser en **post-V1** si nécessaire.

## Future Vision (Post-V1 & Beyond)

- **Post-V1** : commentaires, inscriptions (Better Auth), newsletter (Resend + templates Svelte), wiki "Dev Resources" avancé (versionning, historique, index, glossaire, liens croisés), amélioration analytics (éventuellement Plausible pour fonctionnalités avancées)

## Clarifications Techniques

### Structure du Projet
- **Application SvelteKit** standard avec structure routes
- Panneau d'administration intégré dans `/admin` (pas de CMS externe)
- Composants réutilisables organisés dans `src/lib/components`
- Utilitaires et helpers dans `src/lib/server` (code serveur uniquement)

### Patterns SvelteKit Spécifiques
- **Form Actions** pour mutations (`+page.server.ts` avec `export const actions`)
- **Load Functions** pour pré-chargement de données (`+page.server.ts` avec `export const load`)
- **Endpoints API** via `+server.ts` pour Presigned URLs R2
- **Hooks serveur** (`hooks.server.ts`) pour authentification et connexion DB
- **Hook reroute** (`hooks.ts`) pour internationalisation avec Paraglide

### Migration des Données
- Scripts de migration Drizzle pour génération SQL (`drizzle-kit generate`)
- Application via Wrangler (`wrangler d1 migrations apply DB --local|--remote`)
- Workflow en deux étapes obligatoire (Drizzle Kit → Wrangler)
- Export/Import SQL natif Cloudflare pour backup/restore
- Time Travel D1 pour récupération point-in-time

### Hébergement Serverless
- Pas de gestion d'infrastructure (VPS, Docker, firewall)
- Déploiement automatisé via GitHub Actions vers Cloudflare
- Scalabilité automatique via infrastructure Edge
- Configuration centralisée dans `wrangler.toml`

### Métriques Unifiées
- **UX** : Time-to-value < 60s, Pattern discovery < 3min
- **Core Web Vitals** : LCP < 2.5s, INP < 100ms, CLS < 0.1
- **Performance Edge** : Distribution globale, latence minimale via Edge network

## Principes Architecturaux Clés

Ces principes, tirés du plan de recherche SvelteKit/Cloudflare, guident toutes les décisions techniques :

1. **Scaffolding C3 Obligatoire** : Configuration initiale via `pnpm create cloudflare@latest --framework=svelte --platform=workers`
2. **Plugin Vite Unifié** : Développement local avec HMR + bindings Cloudflare simultanés
3. **platform.env comme Source de Vérité** : Pas de modules `$env` côté serveur, uniquement `event.platform.env`
4. **Chaîne de Validation Intégrée** : Drizzle Schema → drizzle-zod → Zod → sveltekit-superforms
5. **Stockage R2 via URLs Pré-signées** : Upload direct navigateur → R2, contourne le Worker
6. **Authentification via Cloudflare Access** : Validation JWT dans `hooks.server.ts`
7. **i18n avec Paraglide-JS** : Solution moderne, compilée, tree-shakable
8. **Tests Haute-Fidélité** : Vitest Browser Mode + Playwright avec fixtures DB
9. **Déploiement en Deux Étapes** : Migrations DB → Déploiement code

## Risks & Open Questions

**Risks**

- Dépendance à un seul auteur = risque de ralentissement.
- Audience bilingue = dilution possible si préférence de langue mal adressée.
- Stack SvelteKit + Cloudflare Workers relativement nouvelle (moins de ressources communautaires que Next.js).
- Paraglide-JS est moderne mais moins mature que certaines alternatives (bien que typesafe-i18n ne soit plus maintenu).

**Open Questions**

- Quelle stratégie de traduction (IA + relecture ou écriture native FR/EN) ?
- Quelles priorités pour les évolutions post-V1 (communauté vs analytics) ?
- Migration progressive du contenu vers la nouvelle architecture ?
- Utilisation de Cloudflare Durable Objects pour fonctionnalités stateful futures ?
- Stratégie de cache optimale entre KV et Cache API pour performance maximale ?