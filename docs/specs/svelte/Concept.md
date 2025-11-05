---
created: 2025-11-01T07:59
updated: 2025-11-05T00:00
---

# Vision Globale du projet sebc.dev

Un blog technique bilingue (français/anglais) créé et maintenu par un **auteur unique**, centré sur l'intersection de trois piliers fondamentaux du développement moderne : l'IA comme outil d'amplification, les principes d'UX, et les bonnes pratiques d'ingénierie logicielle. Cette approche holistique vise à démontrer comment ces trois domaines se complètent pour créer des applications modernes de qualité.

**sebc.dev** est également un **laboratoire d'apprentissage public** où chaque article documente un apprentissage réel, transformant les découvertes personnelles en ressources partagées. Cette philosophie "learning in public" garantit l'authenticité du contenu tout en démontrant concrètement comment apprendre efficacement dans notre industrie en constante évolution.

# Contexte Personnel

Créé par un développeur professionnel qui utilise l'IA comme multiplicateur de productivité et pratique l'**apprentissage public**, ce blog illustre concrètement comment intégrer efficacement ces outils dans un workflow de développement, sans compromettre la qualité technique ou éditoriale.

L'auteur applique le principe que **"une bonne manière de mieux apprendre est d'enseigner"**, transformant chaque apprentissage personnel en contenu partagé. Cette approche renforce l'assimilation des connaissances tout en créant une ressource authentique pour la communauté technique.

# Architecture de Contenu

## Piliers Principaux

- **IA comme outil d'amplification** : workflows concrets, bonnes pratiques, retours d'expérience, apprentissages documentés
- **Principes fondamentaux d'UX** : design patterns, usabilité, expérience utilisateur, découvertes et applications pratiques
- **Bonnes pratiques d'ingénierie logicielle** : architecture, qualité de code, méthodologies, évolution des pratiques

## Personas Cibles

Le contenu s'adapte aux besoins distincts de trois personas principaux :

- **Développeurs mid-level en startup** : focus sur l'efficacité, time-to-value < 60 secondes, accès direct aux solutions
- **Juniors en apprentissage** : guidance progressive, parcours structurés, pattern discovery < 3 minutes
- **Indie hackers/freelances** : vue d'ensemble stratégique, parcours personnalisés, ROI immédiat

L'interface s'adapte dynamiquement via des points d'entrée et parcours personnalisés selon le contexte d'usage.

## Catégories de Contenu (9 types)

Chaque article appartient à l'une de ces 9 catégories avec identité visuelle distincte :

- **Actualités** : veille technologique, nouveautés, tendances émergentes
- **Analyse Approfondie** : décryptage technique détaillé, études comparatives
- **Parcours d'Apprentissage** : processus d'apprentissage complet documenté
- **Rétrospective** : bilans d'apprentissage, leçons retenues, recommandations
- **Tutoriel** : guides pratiques étape par étape
- **Étude de Cas** : applications concrètes, résolution de problèmes réels
- **Astuces Rapides** : tips pratiques, optimisations, raccourcis
- **Dans les Coulisses** : processus de création, méthodologie, outils
- **Test d'Outil** : évaluations détaillées d'outils et technologie

Chaque catégorie dispose d'une iconographie dédiée, palette chromatique spécifique et mise en forme distinctive.

## Niveaux de Complexité

Chaque article est classé par niveau avec indicateurs visuels :

- **Débutant** : concepts fondamentaux, prérequis minimaux
- **Intermédiaire** : pratiques avancées, connaissances préalables requises
- **Avancé** : architecture complexe, expertise technique poussée

## Articles Technologiques

Articles ciblés sur les technologies utilisées dans la pratique quotidienne, documentant les apprentissages réels :

- **Java/Spring** : backend enterprise, API REST, sécurité
- **JavaScript/TypeScript** : développement moderne, tooling, bonnes pratiques
- **React** : composants, state management, patterns avancés
- **Next.js** : SSR/SSG, App Router, Server Components
- **Tauri** : applications desktop cross-platform
- **Autres technologies** selon les besoins et explorations du moment

Ces articles documentent les apprentissages réels en format MDX avec un format transparent : contexte d'apprentissage, processus, découvertes, application pratique, et questions ouvertes. Support avancé de blocs de contenu flexibles et réutilisables.

# Méthodologie de Production

Le blog sert de démonstration vivante de l'utilisation efficace de l'IA dans la création de contenu technique ET dans l'apprentissage accéléré. Chaque article et ressource est développé avec l'assistance d'IA pour la rédaction, l'édition, la traduction, et l'exploration de nouveaux concepts, tout en maintenant un **contrôle qualité rigoureux exercé par l'auteur unique**.

Cette approche hybride permet de :

- Maintenir un rythme de publication soutenu
- Documenter authentiquement les processus d'apprentissage
- Offrir aux lecteurs un aperçu transparent des meilleures pratiques pour intégrer l'IA dans leur workflow de création ET d'apprentissage
- Démontrer concrètement comment l'IA peut accélérer l'acquisition de nouvelles compétences

La cohérence éditoriale et la qualité du contenu sont garanties par cette supervision unifiée, while l'authenticité est assurée par la documentation d'apprentissages réels.

# Objectifs Commerciaux

**Position actuelle :** Le blog n'a aucun objectif commercial dans sa conception initiale. L'approche est centrée sur le partage de connaissances et la documentation d'expériences techniques authentiques.

**Vision future :** Bien que des opportunités commerciales puissent émerger naturellement (partenariats, formations, conseil), elles ne constituent pas un objectif recherché activement. Le focus reste sur la qualité du contenu et la valeur apportée aux lecteurs.

**Extensions envisagées :** Une chaîne YouTube pourrait compléter le blog à long terme, mais cette expansion n'interviendra qu'après la consolidation complète du projet écrit (V1, post-V1, et phase ultérieure).

**Priorités :** La stratégie reste axée sur la création de contenu de qualité et la construction d'une audience engagée avant toute considération commerciale.

# Roadmap par Phases

## V1 - Fondations (Q1 2025)

### Contenu & Rendu
- Blog bilingue (FR/EN) avec support **MDX** et blocs de contenu flexibles réutilisables
- **Internationalisation** avec **next-intl** :
  - Middleware pour gestion des préfixes `/fr` et `/en`
  - Traductions dans `messages/fr.json` et `messages/en.json`
  - Détection automatique de langue (URL, cookie, Accept-Language header)
  - Support complet du Next.js App Router

### Hub de Recherche Avancée
- Recherche textuelle + filtres taxonomiques dynamiques
- Filtres multi-critères : mots-clés, 9 catégories, tags, niveau de complexité, durée de lecture, date
- État maintenu dans l'URL via **URL Search Params**, mise à jour sans rechargement de page
- Utilisation de **React Server Components** pour pré-chargement des données côté serveur

### Système de Taxonomie
- 9 catégories avec identité visuelle distincte (icônes, couleurs, badges)
- Indicateurs de niveau de complexité (Débutant/Intermédiaire/Avancé)
- Tags et navigation dédiée
- Métadonnées de frontmatter YAML typées dans les fichiers `.mdx`

### Expérience de Lecture Optimisée
- Table des matières auto-générée avec temps de lecture par section
- Indicateur de progression de lecture (composant React avec hooks)
- Optimisation images via **Cloudflare Images** (transformation runtime, format=auto pour AVIF/WebP)
- Time-to-value < 60s, pattern discovery < 3min
- Core Web Vitals : optimisation LCP et CLS
- Utilisation de **next/image** avec loader Cloudflare

### Administration & Gestion de Contenu
- **Panneau d'administration "from scratch"** construit avec :
  - **Next.js Server Actions** (fonctions async dans composants serveur)
  - **react-hook-form** + **Zod** pour validation
  - **shadcn/ui** pour les composants UI
  - Progressive enhancement via transitions React
- Upload de médias vers **R2** via **Presigned URLs** (Route Handlers API)
- Sécurisé par **Cloudflare Access** (validation JWT dans middleware Next.js)

### Design & Interface
- Design UI dark mode (vert canard #14B8A6 sur anthracite #1A1D23)
- **TailwindCSS 4** avec configuration Next.js
- Composants **shadcn/ui** (copy-paste, contrôle total)
- Responsive design et accessibilité

### Architecture & Infrastructure
- **Architecture Full Stack Next.js** (App Router) déployée sur **Cloudflare Workers**
- **Adaptateur** : **@opennextjs/cloudflare** (adaptateur OpenNext communautaire)
- Base de données **D1** avec migrations **Drizzle ORM**
- Configuration dans `wrangler.toml` pour bindings (D1, R2, KV, Durable Objects)
- Variables d'environnement via `.dev.vars` (local) et `wrangler secret` (production)
- Compatibilité Node.js via `nodejs_compat` flag dans wrangler.toml (obligatoire)
- Développement local unifié : `wrangler dev -- npx next dev` (HMR + bindings)

### Qualité & Tests
- Tests composants avec **Vitest** + **@testing-library/react**
- Tests E2E avec **Playwright** et fixtures de base de données (seeding via `wrangler d1 execute DB --local --file=./seed.sql`)
- CI/CD avec **GitHub Actions** :
  1. Tests (composants + E2E)
  2. Migrations D1 (`wrangler d1 migrations apply DB --remote`)
  3. Build Next.js via OpenNext
  4. Déploiement (`wrangler deploy`)

### SEO & Performance
- Meta tags optimisés (Open Graph, Twitter Cards) via Next.js Metadata API
- Sitemap généré automatiquement
- Affichage public sans interactions utilisateur (V1)
- Support SSR/SSG selon les besoins (articles en SSG, recherche en SSR)

## Post-V1 - Fonctionnalités Communautaires

- Système de commentaires avec authentification utilisateurs
- Inscriptions et profils utilisateurs via **Better Auth** (avec adaptateur `better-auth-cloudflare` pour D1/Drizzle)
- **Newsletter via Cloudflare Email Service** (binding natif Workers) avec templates React personnalisés (react-email)
- Wiki "Dev Resources" avancé :
  - Versionning et historique des modifications
  - Index et glossaire
  - Liens croisés entre articles
- Analytics avancés (éventuellement Plausible)

# Stack Technique

## Framework & Runtime
- **Framework** : **Next.js 15** (App Router avec React Server Components)
- **Adaptateur** : **@opennextjs/cloudflare** (OpenNext adapter - remplace l'ancien @cloudflare/next-on-pages obsolète)
- **Runtime** : **Cloudflare Workers** (workerd)
- **Outil de Build** : **Next.js** + OpenNext pour transformation vers Workers
- **Prérequis** : Flag `nodejs_compat` obligatoire pour compatibilité Node.js APIs

## Base de Données & ORM
- **Base de Données** : **Cloudflare D1** (SQLite serverless, mature en production 2025)
- **ORM** : **Drizzle ORM** (avec drizzle-orm/d1)
- **Migrations** : **Drizzle Kit** + **Wrangler** (workflow en deux étapes)
- **Validation** : **Drizzle Schema → drizzle-zod → Zod → react-hook-form** (source de vérité unique)
- **Backups** : **D1 Time Travel** (Point-in-Time Recovery sur 30 jours)
- **Performance** : Réplication globale en lecture (beta) pour latence optimale

## Interface Utilisateur
- **UI** : **TailwindCSS 4** + **shadcn/ui** (composants copy-paste)
- **Rendu Contenu** : **MDX** (Markdown + composants React) via **next-mdx-remote** ou **@next/mdx**
- **Internationalisation** : **next-intl** (optimisé pour App Router, typesafe)

## CMS & Gestion de Contenu
- **CMS** : **Panneau d'administration personnalisé** (construit avec Next.js Server Actions et shadcn/ui)
- **Formulaires** : **react-hook-form** + **Zod** (avec progressive enhancement)
- **Stockage Média** : **Cloudflare R2** (via Presigned URLs générées par Route Handlers)

## Authentification & Sécurité
- **Authentification (Admin V1)** : **Cloudflare Access** (Zero Trust) avec validation JWT `Cf-Access-Jwt-Assertion` via middleware Next.js (bibliothèque `jose`)
- **Authentification (Utilisateurs Post-V1)** : **Better Auth** avec adaptateur `better-auth-cloudflare` (intégration native D1 + Drizzle + KV pour rate limiting)
- **Sécurité (Réseau)** : **Cloudflare WAF** (Web Application Firewall)

## Infrastructure Cloudflare
- **Configuration** : **wrangler.toml** (source de vérité pour bindings et infrastructure)
  - `compatibility_flags = ["nodejs_compat"]` (obligatoire)
  - `compatibility_date = "2025-03-25"` (date récente requise)
- **Secrets** : `.dev.vars` (local) + `wrangler secret` (production)
- **Cache OpenNext** : Architecture multi-composants
  - **R2** : Cache incrémental (pages SSG/ISR) via binding `NEXT_INC_CACHE_R2_BUCKET`
  - **Durable Objects** : File d'attente révalidation (ISR) via `DOQueueHandler`
  - **D1** : Cache de tags pour `revalidateTag()` via binding `NEXT_TAG_CACHE_D1`
  - **Binding requis** : `WORKER_SELF_REFERENCE` pour communication inter-composants
- **Images** : **Cloudflare Images** (transformation runtime via cdn-cgi/image avec loader personnalisé)
- **Développement local** : `wrangler dev -- npx next dev` (HMR + bindings via Miniflare)

## Monitoring & Analytics
- **Monitoring V1** : **Cloudflare Health Checks** + **Workers Metrics** & **Workers Logs**
- **Observabilité** : Logs structurés JSON activés via `[observability]` dans wrangler.toml
  - `enabled = true`
  - `head_sampling_rate = 1.0` (100% des requêtes loggées)
  - Best practice : Logs JSON structurés avec `console.log({ level, context, data })`
- **Analytics V1** : **Cloudflare Web Analytics** (privacy-first, sans cookies)
- **Backups** : **D1 Time Travel** (PITR sur 30 jours)

## Communication (Post-V1)
- **Newsletter** : **Cloudflare Email Service** (service natif Workers, annoncé septembre 2025)
  - Binding natif dans wrangler.toml : `env.SEND_EMAIL.send(...)`
  - Configuration DNS automatique (SPF, DKIM, DMARC)
  - Compatible react-email pour templating
- **Templates Email** : **Templates React personnalisés** (rendus en HTML avec react-email)

# Hébergement & Déploiement

- **Plateforme** : **Cloudflare Workers** (hébergement Full Stack Next.js)
- **Déploiement** : CI/CD avec **GitHub Actions** via `wrangler deploy`
- **Sécurité (Périmètre)** : **Cloudflare Access** (Zero Trust) sécurise la route `/admin` au niveau du réseau, avant que la requête n'atteigne l'application
- **Sécurité (Applicative)** : **Cloudflare WAF** protège contre les menaces web courantes (XSS, injection SQL, etc.)
- **Réseau** : Géré par l'infrastructure mondiale "Edge" de Cloudflare (déploiement sur 300+ datacenters)
- **Monitoring** : **Cloudflare Health Checks** configurés pour surveiller le endpoint `/health`, avec alertes via les **Cloudflare Alerts**
- **Analytics** : **Cloudflare Web Analytics** intégré pour le suivi des visiteurs et performances (privacy-first, sans cookies)

# Principes Architecturaux Clés

Basés sur les best practices Next.js/Cloudflare Workers validées en 2025, ces principes guident toutes les décisions techniques :

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
