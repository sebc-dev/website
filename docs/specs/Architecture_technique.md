# Document d'Architecture Full-Stack : sebc.dev

## Introduction

Ce document définit l'architecture technique complète (full-stack) du projet `sebc.dev`. Il sert de source unique de vérité pour guider le développement, en assurant la cohérence entre le frontend, le backend, la base de données et l'infrastructure.

Le projet est un blog technique bilingue (FR/EN) moderne, construit sur une stack Next.js 15 et Cloudflare, conçu pour une performance "edge-first" et une maintenabilité à long terme.

### Modèle de Démarrage

L'architecture Next.js 15 déployée sur Cloudflare Workers utilise **@opennextjs/cloudflare** (adaptateur OpenNext).

Configuration requise :

  * **Adaptateur OpenNext** : `@opennextjs/cloudflare` pour transformer l'application Next.js en Worker Cloudflare
  * Configuration de `wrangler.toml` avec bindings pour D1, R2, KV, Durable Objects :
    * **R2 (NEXT_INC_CACHE_R2_BUCKET)** : Cache incrémental (stockage données ISR/SSG)
    * **Durable Object (NEXT_CACHE_DO_QUEUE)** : File d'attente de revalidation ISR
    * **Durable Object (NEXT_TAG_CACHE_DO_SHARDED)** : Cache de tags (recommandé pour production) - Alternative : D1 (NEXT_TAG_CACHE_D1) pour faible trafic uniquement
    * **Service Binding (WORKER_SELF_REFERENCE)** : Auto-référence pour opérations cache internes
  * Flag `nodejs_compat` obligatoire dans wrangler.toml pour compatibilité Node.js (non négociable - source potentielle de dégradation performance)
  * Note: L'ancien adaptateur `@cloudflare/next-on-pages` est obsolète et archivé

## Architecture de Haut Niveau

### Résumé Technique

`sebc.dev` est une application Next.js 15 full-stack, monolithique et "serverless", déployée sur **Cloudflare Workers**.

L'architecture s'articule autour des principes suivants :

  * **Frontend (UI)** : Rendu par Next.js 15 avec React 19 Server Components et stylisé avec **TailwindCSS 4** et **shadcn/ui**.
  * **Backend (Logique)** : Géré par les **Next.js Server Actions** et **React Server Components** s'exécutant sur Cloudflare Workers (via adaptateur OpenNext).
  * **Base de Données** : **Cloudflare D1** (SQLite serverless), requêtée via l'ORM **Drizzle** avec type-safety.
  * **Stockage Média** : **Cloudflare R2** pour les images brutes, avec optimisation et transformation via **Cloudflare Images** (CDN).
  * **Internationalisation (i18n)** : Gérée par **next-intl** pour le routage bilingue (`/fr`, `/en`) avec middleware Next.js et support complet App Router et RSC (React Server Components).
  * **Authentification (Admin V1)** : Sécurisée par **Cloudflare Access** (Zero Trust) avec validation JWT dans middleware Next.js via bibliothèque `jose`.

### Plateforme et Infrastructure

La plateforme unique est **Cloudflare**. Cette approche "edge-first" élimine la gestion d'infrastructure traditionnelle (VPS, Docker, pare-feu).

  * **Plateforme** : Cloudflare Workers.
  * **Services Clés (V1)** :
      * **Cloudflare Workers** : Runtime pour l'application Next.js.
      * **Cloudflare D1** : Base de données primaire.
      * **Cloudflare R2** : Stockage des images brutes.
      * **Cloudflare Images** : Optimisation et transformation des images à la volée.
      * **Cloudflare Access** : Sécurisation Zero Trust de la route `/admin`.
      * **Cloudflare WAF** : Protection contre les menaces web (XSS, SQLi).
      * **Cloudflare Web Analytics** : Suivi analytique V1.

### Structure du Répertoire

Le projet adopte une structure **Next.js App Router standard**. Il s'agit d'une application unique Next.js co-localisant le frontend et le backend, avec le panneau d'administration intégré.

### Diagramme d'Architecture

Voici la visualisation du flux système complet pour `sebc.dev` :

```mermaid
graph TD
    subgraph "Utilisateur (Navigateur)"
        U(Visiteur / Admin)
    end

    subgraph "Cloudflare Edge (WAF / Access)"
        CF[Proxy Cloudflare]
        WAF(WAF - Sécurité)
        Access(Access - Auth Admin)
    end

    subgraph "Cloudflare Workers (Next.js App)"
        Worker[Next.js Worker]
        Middleware(middleware.ts)
        ServerComponent(Server Component / Server Action)
        R2Api(Route Handler Presigned URL R2)
    end

    subgraph "Infrastructure Cloudflare"
        D1[(Cloudflare D1<br/><i>Base de données</i>)]
        R2[(Cloudflare R2<br/><i>Stockage Images Brutes</i>)]
        CFI(Cloudflare Images<br/><i>Optimisation / CDN</i>)
    end

    %% Flux Public (Lecture)
    U -- 1. Requête (ex: /fr/articles/slug) --> CF
    CF -- 2. WAF --> Worker
    Worker -- 3. [Server Component] --> D1
    D1 -- 4. Données (MDX) --> Worker
    Worker -- 5. Rendu HTML --> U

    %% Flux Admin (Login)
    U -- 1. Requête (ex: /admin) --> CF
    CF -- 2. WAF --> Access
    Access -- 3. Redirection Login (si non auth) --> U
    Access -- 4. Ajoute JWT (si auth) --> Worker
    Worker -- 5. [Middleware] valide JWT --> ServerComponent
    ServerComponent -- 6. Charge page admin --> U

    %% Flux Upload Image
    U -- A. Demande URL (Admin) --> Worker
    Worker -- B. [R2Api] --> R2
    R2 -- C. Génère Presigned URL --> Worker
    Worker -- D. Envoie URL au client --> U
    U -- E. PUT direct vers R2 (contourne Worker) --> R2

    %% Flux Affichage Image
    U -- F. Demande /cdn-cgi/image/.../img.jpg --> CFI
    CFI -- G. Récupère image (si cache miss) --> R2
    CFI -- H. Optimise et sert l'image --> U
```

### Patterns Architecturaux

  * **Full-stack Serverless** : L'application Next.js s'exécute en tant que Worker Cloudflare.
  * **Composants UI** : Approche basée sur React Server Components et shadcn/ui (composants "copy-paste").
  * **Server Components First** : React Server Components préparent les données côté serveur pour les vues.
  * **ORM (Drizzle)** : Utilisation de Drizzle pour abstraire les requêtes D1 de manière type-safe.
  * **Validation de Bout en Bout** : Chaîne de validation `Drizzle Schema` → `drizzle-zod` → `Zod` → `react-hook-form` pour les Server Actions.
  * **Authentification Zero Trust** : Cloudflare Access gère l'authentification admin ; Next.js ne fait que *valider* le JWT fourni.

-----

## Stack Technique (V1)

Voici la source de vérité unique pour les technologies et versions du projet.

| Catégorie | Technologie | Version | Rôle |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js | 15.0+ | Framework full-stack avec App Router |
| **Langage UI** | React | 19+ | Bibliothèque d'interface (Server/Client Components) |
| **Backend** | Next.js (Server) | 15.0+ | Server Actions, Server Components, Route Handlers |
| **Adaptateur** | @opennextjs/cloudflare | latest | Transformation Next.js vers Workers |
| **Runtime** | Cloudflare Workers | latest | Exécution Serverless |
| **Base de Données** | Cloudflare D1 | N/A | Stockage (Articles, Taxonomie) |
| **ORM** | Drizzle ORM | latest | Accès base de données type-safe |
| **Stockage Fichiers** | Cloudflare R2 | N/A | Stockage images brutes |
| **Optim. Images** | Cloudflare Images | N/A | Transformation et CDN |
| **Styling** | TailwindCSS | 4.0+ | Framework CSS Utility-first |
| **Composants UI** | shadcn/ui | latest | Bibliothèque de composants accessibles |
| **i18n** | next-intl | latest | Routage et traductions (typesafe, RSC compatible) |
| **Contenu** | @next/mdx ou next-mdx-remote | latest | Rendu Markdown + composants React |
| **Auth Admin (V1)** | Cloudflare Access + jose (JWT) | latest | Sécurisation Zero Trust avec validation middleware |
| **Validation** | Zod + react-hook-form | latest | Validation des formulaires et Server Actions |
| **Tests (Composant)** | Vitest + @testing-library/react | latest | Tests de composants React |
| **Tests (E2E)** | Playwright | latest | Tests End-to-End avec fixtures D1 seeding |
| **Déploiement** | GitHub Actions | v4 | CI/CD (tests → migrations D1 → build OpenNext → deploy) |

-----

## 4\. Modèles de Données (Logique)

Conformément à la contrainte de ne pas inclure de code, voici la description en prose des entités de données. Le schéma Drizzle sera directement basé sur cette logique.

  * **`articles` (Article)** : Entité centrale contenant les métadonnées partagées par les deux langues.
      * Champs clés : ID, Catégorie (relation), Complexité (`beginner`, `intermediate`, `advanced`), Statut (`draft`, `published`), Date de publication, Image de couverture (lien R2).
  * **`article_translations` (Traduction d'Article)** : Table relationnelle (1-N avec `articles`) contenant le contenu spécifique à une langue.
      * Champs clés : ID, Article ID (relation), Langue (`fr`, `en`), Titre, Slug, Extrait (pour SEO), Contenu MDX.
      * *Note (EF23)* : Un article ne peut être publié que si les deux traductions (FR et EN) sont complètes et que le schéma Drizzle + Zod valide tous les champs requis.
  * **`categories` (Catégorie)** : Les 9 catégories canoniques prédéfinies.
      * Champs clés : ID (ex: `news`), Nom (FR/EN), Slug (FR/EN), Icône, Couleur (pour l'UI).
  * **`tags` (Tag)** : Taxonomie flexible gérée par l'admin.
      * Champs clés : ID, Nom (FR/EN).
  * **`articleTags` (Jointure)** : Table de jointure Many-to-Many entre `articles` et `tags`.

-----

## Spécification des APIs

L'application n'expose pas d'API de contenu publique (les données sont chargées via React Server Components). Cependant, elle utilise des Route Handlers (`route.ts`) pour des tâches spécifiques :

  * **`GET /api/health/route.ts`** : Endpoint public pour les Health Checks de Cloudflare. Vérifie la connectivité à D1 et retourne un JSON `{ status: 'ok' }`.
  * **`GET /api/articles/route.ts`** : Endpoint JSON pour le Hub de Recherche (utilisé si le filtrage côté client est privilégié, bien que V1 favorise Server Components pour SSR).
  * **`POST /api/images/route.ts` (Protégé Admin)** : Endpoint sécurisé qui génère et retourne une URL pré-signée Cloudflare R2, permettant au client d'uploader une image directement vers R2.
  * **`GET /sitemap.xml/route.ts`** : Endpoint public qui génère dynamiquement le sitemap XML en requêtant la table `articles` (status `published`) dans D1.

-----

## Composants Logiques

L'architecture est décomposée en services logiques hébergés sur la plateforme Cloudflare:

  * **Application Web (Worker Next.js)** : Le composant principal. Gère le routage, le rendu (SSR/SSG), l'exécution de la logique métier (Server Actions), la validation (Zod) et la coordination des autres services.
  * **Service d'Authentification (Cloudflare Access)** : Proxy externe gérant l'authentification Zero Trust pour la route `/admin`.
  * **Service de Validation (Next.js Middleware)** : Intercepte les requêtes admin, valide le JWT `Cf-Access-Jwt-Assertion` en utilisant `jose` dans `middleware.ts`.
  * **Service de Base de Données (Cloudflare D1)** : Stockage des données textuelles et métadonnées.
  * **Service de Stockage (Cloudflare R2)** : Stockage des objets binaires (images brutes).
  * **Service d'Images (Cloudflare Images)** : Service Edge pour la transformation et la mise en cache des images.

-----

## APIs Externes (V1)

Pour la V1, le projet est entièrement autonome sur l'infrastructure Cloudflare et ne dépend d'aucune API tierce critique pour son fonctionnement.

*Note : Cloudflare Email Service (pour les emails Post-V1) sera utilisé via binding natif Workers. Bien que Resend soit techniquement compatible avec le runtime Workers (documentation officielle Cloudflare d'octobre 2025), l'utilisation du service email natif de Cloudflare est préférable car il utilise un binding (`env.SEND_EMAIL.send`) au lieu d'une clé API, éliminant ainsi les problèmes de gestion de secrets et les erreurs de bundling potentielles liées aux imports dynamiques*.

-----

## Flux de Travail Principaux (Workflows)

Voici les flux de données et d'interaction clés, visualisés (les diagrammes ne sont pas du code).

### Flux de Lecture (Utilisateur Public)

Ce flux décrit comment un visiteur lit un article, en incluant l'i18n via next-intl.

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant CF as Cloudflare Edge
    participant NX as Next.js Worker (via OpenNext)
    participant Intl as next-intl Middleware
    participant D1 as Cloudflare D1

    U->>CF: GET /fr/articles/mon-article
    CF->>NX: Route vers Worker
    NX->>Intl: next-intl middleware détecte /fr
    Intl-->>NX: Context { locale: 'fr' }
    NX->>NX: Server Component async (params: { lang: 'fr', slug: 'mon-article' })
    NX->>D1: Drizzle query: SELECT * FROM article_translations WHERE slug='mon-article' AND lang='fr'
    D1-->>NX: Données article (contenu MDX, métadonnées)
    NX->>NX: Rendu MDX → HTML via @next/mdx ou next-mdx-remote
    NX-->>CF: HTML streamed (React Server Component)
    CF-->>U: Réponse avec HTML rendu + assets
```

### Flux d'Authentification (Admin)

Ce flux utilise le modèle Zero Trust de Cloudflare Access.

```mermaid
sequenceDiagram
    participant U as Admin
    participant CFA as Cloudflare Access
    participant NX as Next.js (Edge Worker)

    U->>CFA: GET /admin
    CFA->>U: Redirection vers Login (SSO)
    U->>CFA: S'authentifie (ex: Google)
    CFA-->>U: Définit un cookie d'session CF
    CFA->>NX: Transmet la requête GET /admin + Header JWT (Cf-Access-Jwt-Assertion)
    NX->>NX: middleware.ts: valide le JWT avec 'jose'
    NX->>NX: Stocke user dans headers/cookies
    NX->>NX: Server Component (lit user, autorise)
    NX-->>U: Renvoie la page Admin
```

### Flux d'Upload d'Image (Admin)

Ce flux utilise des URLs pré-signées pour contourner les limites du Worker.

```mermaid
sequenceDiagram
    participant U as Admin (Navigateur)
    participant NX as Next.js (Edge Worker)
    participant R2 as Cloudflare R2

    U->>NX: POST /api/images (demande upload)
    NX->>NX: middleware.ts (Valide Auth Admin)
    NX->>R2: Génère une URL pré-signée (PUT)
    R2-->>NX: URL pré-signée
    NX-->>U: { presignedUrl: '...' }
    U->>R2: PUT image.jpg (directement vers R2)
    R2-->>U: 200 OK
```

-----

## Architecture Frontend

L'architecture frontend est détaillée dans `Frontend_Specification.md`, mais les points clés sont résumés ici:

  * **Structure des Composants** : Les composants sont organisés par fonctionnalité (`features`), par disposition (`layout`) et par éléments réutilisables (`ui` - composants shadcn/ui copy-paste).
  * **Gestion d'État (State Management)** :
      * **État local/composant** : React hooks (`useState`, `useReducer`) pour Client Components.
      * **État global (Client)** : React Context pour état partagé côté client (Zustand optionnel si nécessaire).
      * **État Serveur** : React Server Components async récupèrent les données côté serveur directement depuis D1 via Drizzle, sans état client.
      * **État des Filtres (Hub)** : L'URL (`URLSearchParams`) est la source de vérité, gérée via `next/navigation` `useRouter()` et `useSearchParams()` côté client, lue côté serveur via `searchParams` prop.
  * **Routage** : Géré par Next.js 15 App Router (système de fichiers) avec middleware next-intl pour l'i18n et route groups `/[lang]/`.

-----

## Architecture Backend

L'architecture backend est entièrement "serverless", intégrée à Next.js et s'exécutant sur Cloudflare Workers.

  * **Architecture de Service** : Logique métier co-localisée avec les routes :
      * **Server Components** (async components) pour pré-chargement de données dans les pages.
      * **Server Actions** (fonctions async) pour mutations et traitement de formulaires.
      * **Route Handlers** (`route.ts`) pour API endpoints JSON ou tâches spécifiques (ex: upload).
  * **Couche d'Accès aux Données** : Centralisée via Drizzle ORM. Les requêtes sont écrites dans `src/lib/server/db/` et appelées depuis Server Components ou Server Actions.
  * **Authentification** : Gérée par Cloudflare Access. La logique applicative se limite à la *validation* du JWT dans `middleware.ts`.

-----

## Structure Unifiée du Projet

La structure des fichiers (décrite en prose, sans code) est définie dans `Frontend_Specification.md`. Les répertoires clés sont :

  * **`app/`** : Contient toutes les pages, layouts, et Route Handlers. C'est le cœur de l'application Next.js App Router.
  * **`src/components/`** : Contient tous les composants React, organisés par `layout`, `features`, et `ui` (shadcn/ui).
  * **`src/lib/`** : Code partagé entre serveur et client (utilitaires, helpers).
  * **`src/lib/server/`** : Code *exclusivement* serveur (ex: logique Drizzle, validation auth).
  * **`messages/`** (à la racine) : Fichiers `fr.json` et `en.json` pour next-intl.
  * **`tests/`** (à la racine) : Contient les tests unitaires (Vitest) et E2E (Playwright).

-----

## Flux de Développement

  * **Stratégie de Développement Bi-Modale** : En raison des limitations connues de l'intégration `wrangler dev` avec Next.js en 2025 (problèmes HMR, incompatibilité pnpm), deux modes de développement sont recommandés :
    1.  **Mode Développement UI** : `npx next dev` (sans wrangler) avec données mockées ou connexion à D1 distant (staging) pour le développement rapide avec HMR complet.
    2.  **Mode Tests d'Intégration** : Build de production (`pnpm build`) + `wrangler dev` pour tester contre les bindings locaux (Miniflare) avant déploiement.
  * **Source de Vérité (Infrastructure)** : Les secrets et bindings Cloudflare sont accessibles via configuration `wrangler.toml` (source unique de vérité pour l'infrastructure).
  * **Migrations DB** : Processus obligatoire en deux étapes :
    1.  `pnpm db:generate` (Drizzle Kit génère les fichiers SQL de migration).
    2.  `pnpm db:migrate:local` (Wrangler applique les migrations à D1 local via Miniflare).

-----

## Architecture de Déploiement

  * **Plateforme** : Cloudflare Workers (via adaptateur OpenNext `@opennextjs/cloudflare`).
  * **CI/CD** : Pipeline GitHub Actions avec secrets `CLOUDFLARE_API_TOKEN` et `CLOUDFLARE_ACCOUNT_ID`.
  * **Processus CI/CD (Obligatoire - Ordre Strict)** : Le pipeline doit exécuter les étapes suivantes dans l'ordre :
    1.  Installation des dépendances (`pnpm install`).
    2.  Lint & Type-check (`pnpm lint` ou `pnpm type-check`).
    3.  Tests (`pnpm test` - Vitest composants + Playwright E2E).
    4.  Build de l'application Next.js via OpenNext (`pnpm build` génère Worker bundle).
    5.  **Étape 1 Déploiement :** Migration de la base de données (`wrangler d1 migrations apply DB --remote`).
    6.  **Étape 2 Déploiement :** Déploiement du code Worker (`wrangler deploy`).

-----

## Sécurité et Performance

### Sécurité

  * **Authentification Admin** : Cloudflare Access (Zero Trust).
  * **Protection Réseau** : Cloudflare WAF (XSS, SQLi).
  * **CSRF** : Protection native de Next.js (vérification de l'origine) activée pour Server Actions.
  * **Validation des Entrées** : Validation Zod/react-hook-form côté serveur sur *toutes* les Server Actions.

### Performance

  * **Runtime** : Exécution à l'Edge (Cloudflare Workers) pour une latence minimale.
  * **Images** : Optimisation à la volée via Cloudflare Images avec loader personnalisé next/image.
  * **Cache (V1)** : Architecture OpenNext avec R2 (cache incrémental), Durable Objects (ISR et tag cache recommandé pour production), D1 (tag cache uniquement pour faible trafic), et KV.
  * **Code** : Bundles optimisés et code-splitting par route (natif à Next.js App Router).
  * **Objectifs V1** : LCP < 2.5s, INP < 100ms, CLS < 0.1.
  * **Limitation Critique D1** : Limite de stockage de 10 Go par base de données - incompatible avec les ambitions à long terme (stockage d'embeddings pour recherche sémantique, croissance audience). Stratégie de sharding ou migration vers solution vectorielle requise pour phase Post-V1.

-----

## Stratégie de Test

La stratégie de test est conçue pour une haute fidélité :

  * **Tests Unitaires** : `Vitest` pour la logique métier pure (ex: `src/lib/utils`).
  * **Tests de Composants** : **`Vitest + @testing-library/react`**. Les tests s'exécutent avec des utilitaires React Testing Library pour valider le comportement des composants.
  * **Tests E2E (End-to-End)** : **`Playwright`**. Les tests E2E utiliseront des *fixtures de base de données* pour ensemencer (seed) et réinitialiser (reset) la base D1 locale avant chaque test via `wrangler d1 execute DB --local --file=./seed.sql`, assurant l'isolation.

-----

## Monitoring et Observabilité (V1)

  * **Monitoring de Santé** : **Cloudflare Health Checks** configurés pour interroger l'endpoint `GET /health`.
  * **Métriques de Performance** : **Workers Metrics** et **Workers Logs** via le tableau de bord Cloudflare.
  * **Observabilité** : Logs structurés JSON activés via `[observability]` dans wrangler.toml avec `enabled = true` et `head_sampling_rate = 1.0`.
  * **Analytics (Utilisateur)** : **Cloudflare Web Analytics** (privacy-first).
  * **Sauvegardes** : **Cloudflare D1 Time Travel** (Point-in-Time Recovery sur 30 jours).

-----

## Risques et Questions Ouvertes

### Risques Identifiés

#### Risque de Productivité (DevEx - Développement Local)

**Niveau : Moyen**

Friction de l'expérience de développement local due aux limitations connues de `wrangler dev` avec Next.js en 2025 :
  * **Problème HMR** : Défaillance du Hot Module Replacement via proxy wrangler (échec WebSocket `/_next/webpack-hmr`), causant des tentatives de reconnexion infinies
  * **Incompatibilité pnpm** : Erreurs 500 avec pnpm dues à la structure de `node_modules` basée sur liens symboliques (workaround : `shamefully-hoist=true`)
  * **Complexité d'accès aux bindings** : Difficulté à localiser et accéder aux bases de données D1 locales (Miniflare) pour outils comme Drizzle Studio

**Mitigation** : Adoption de la stratégie bi-modale (voir Section "Flux de Développement") et forte dépendance sur suite de tests E2E (Playwright) pour compenser la fragilité du développement interactif.

#### Risque de Scalabilité (Limitation D1)

**Niveau : Critique à Long Terme**

La **limite de stockage de 10 Go par base de données D1** est incompatible avec les ambitions à long terme du projet :
  * **Impact IA** : Le stockage d'embeddings vectoriels pour recherche sémantique (pilier "IA comme outil d'amplification") peut rapidement saturer la limite de 10 Go
  * **Impact Croissance** : L'objectif de croissance audience (> 2000 abonnés, extension YouTube) implique une augmentation continue du volume de données

**Mitigation** :
  * **Phase V1** : Monitoring proactif de l'utilisation D1 via métriques Cloudflare
  * **Phase Post-V1** : Planification d'une stratégie de sharding manuel ou migration vers Cloudflare D1 Vectorize (pour embeddings) ou évaluation d'alternatives (Turso, Neon)

#### Risque de Performance (nodejs_compat)

**Niveau : Faible à Moyen**

Le flag `nodejs_compat` est la couche de compatibilité qui simule les API Node.js dans le runtime Workers (V8 isolates). C'est le **point de friction architectural le plus probable** pour :
  * Dégradations de performance (limites temps CPU Workers)
  * Bugs subtils liés à l'émulation d'API Node.js

**Mitigation** : Tests E2E exhaustifs en environnement Wrangler local et staging avant déploiement production.

### Questions Ouvertes

1. **Cache de Tags (OpenNext)** : Doit-on s'engager sur l'implémentation Durable Object (`NEXT_TAG_CACHE_DO_SHARDED`, recommandée pour trafic production) dès la V1, au détriment de la simplicité D1 (`NEXT_TAG_CACHE_D1`, réservé au faible trafic) ?

2. **Stratégie de Sauvegarde D1** : Au-delà de Time Travel (30 jours), faut-il mettre en place des exports réguliers vers R2 pour archivage long terme ?

3. **Monitoring Avancé** : L'observabilité V1 (Workers Logs JSON) est-elle suffisante, ou doit-on prévoir intégration avec service tiers (Sentry, Axiom) en Post-V1 ?