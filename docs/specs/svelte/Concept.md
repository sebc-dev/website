---
created: 2025-11-01T07:59
updated: 2025-11-02T00:00
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
- **Svelte/SvelteKit** : réactivité, architecture moderne, performance
- **Tauri** : applications desktop cross-platform
- **Autres technologies** selon les besoins et explorations du moment

Ces articles documentent les apprentissages réels en format MDsveX avec un format transparent : contexte d'apprentissage, processus, découvertes, application pratique, et questions ouvertes. Support avancé de blocs de contenu flexibles et réutilisables.

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
- Blog bilingue (FR/EN) avec support **MDsveX** et blocs de contenu flexibles réutilisables
- **Internationalisation** avec **Paraglide-JS** :
  - Hook `reroute` pour gestion des préfixes `/fr` et `/en`
  - Traductions compilées (tree-shakable) dans `messages/fr.json` et `messages/en.json`
  - Détection automatique de langue (URL, cookie)

### Hub de Recherche Avancée
- Recherche textuelle + filtres taxonomiques dynamiques
- Filtres multi-critères : mots-clés, 9 catégories, tags, niveau de complexité, durée de lecture, date
- État maintenu dans l'URL via **URL Search Params**, mise à jour sans rechargement de page
- Utilisation de **load functions** pour pré-chargement des données côté serveur

### Système de Taxonomie
- 9 catégories avec identité visuelle distincte (icônes, couleurs, badges)
- Indicateurs de niveau de complexité (Débutant/Intermédiaire/Avancé)
- Tags et navigation dédiée
- Métadonnées de frontmatter YAML typées dans les fichiers `.svx`

### Expérience de Lecture Optimisée
- Table des matières auto-générée avec temps de lecture par section
- Indicateur de progression de lecture (composant Svelte réactif)
- Optimisation images via **Cloudflare Images** (transformation runtime, format=auto pour AVIF/WebP)
- Time-to-value < 60s, pattern discovery < 3min
- Core Web Vitals : optimisation LCP et CLS

### Administration & Gestion de Contenu
- **Panneau d'administration "from scratch"** construit avec :
  - **SvelteKit Form Actions** (`+page.server.ts` avec `export const actions`)
  - **sveltekit-superforms** pour validation (Zod schemas générés par drizzle-zod)
  - **shadcn-svelte** pour les composants UI
  - Amélioration progressive via `use:enhance`
- Upload de médias vers **R2** via **Presigned URLs** (endpoints `+server.ts`)
- Sécurisé par **Cloudflare Access** (validation JWT dans `hooks.server.ts`)

### Design & Interface
- Design UI dark mode (vert canard #14B8A6 sur anthracite #1A1D23)
- **TailwindCSS 4** avec plugin Vite natif
- Composants **shadcn-svelte** (copy-paste, contrôle total)
- Responsive design et accessibilité

### Architecture & Infrastructure
- **Architecture Full Stack SvelteKit 5** déployée sur **Cloudflare Workers**
- Scaffolding via **C3** : `pnpm create cloudflare@latest --framework=svelte --platform=workers`
- Plugin Vite Cloudflare pour développement unifié (HMR + bindings locaux)
- Base de données **D1** avec migrations Drizzle → Wrangler
- Configuration centralisée dans `wrangler.toml` (avec `compatibility_flags = ["nodejs_compat"]`)

### Qualité & Tests
- Tests composants avec **Vitest Browser Mode** (exécution dans Chromium réel)
- Tests E2E avec **Playwright** et fixtures de base de données (seeding/reset)
- CI/CD avec **GitHub Actions** :
  1. Tests (composants + E2E)
  2. Build
  3. Migrations D1 (`wrangler d1 migrations apply DB --remote`)
  4. Déploiement (`wrangler deploy`)

### SEO & Performance
- Meta tags optimisés (Open Graph, Twitter Cards)
- Sitemap généré automatiquement
- Affichage public sans interactions utilisateur (V1)

## Post-V1 - Fonctionnalités Communautaires

- Système de commentaires avec authentification utilisateurs
- Inscriptions et profils utilisateurs via **Better Auth** + D1
- **Newsletter (via Resend)** avec templates Svelte personnalisés
- Wiki "Dev Resources" avancé :
  - Versionning et historique des modifications
  - Index et glossaire
  - Liens croisés entre articles
- Analytics avancés (éventuellement Plausible)

# Stack Technique

## Framework & Runtime
- **Framework** : **SvelteKit 5** (avec Svelte 5 et Runes)
- **Adaptateur** : **@sveltejs/adapter-cloudflare** (mode Workers)
- **Runtime** : **Cloudflare Workers** (workerd)
- **Outil de Build** : **Vite** avec **@cloudflare/vite-plugin** (développement unifié avec HMR + bindings)

## Base de Données & ORM
- **Base de Données** : **Cloudflare D1** (SQLite serverless)
- **ORM** : **Drizzle ORM** (avec drizzle-orm/d1)
- **Migrations** : **Drizzle Kit** + **Wrangler** (workflow en deux étapes)
- **Validation** : **Drizzle Schema → drizzle-zod → Zod → sveltekit-superforms** (source de vérité unique)

## Interface Utilisateur
- **UI** : **TailwindCSS 4** (plugin Vite natif) + **shadcn-svelte** (composants copy-paste)
- **Rendu Contenu** : **MDsveX** (Markdown + composants Svelte)
- **Internationalisation** : **Paraglide-JS** (compiler-based, tree-shakable)

## CMS & Gestion de Contenu
- **CMS** : **Panneau d'administration personnalisé** (construit avec SvelteKit Form Actions et `shadcn-svelte`)
- **Formulaires** : **sveltekit-superforms** (avec amélioration progressive via `use:enhance`)
- **Stockage Média** : **Cloudflare R2** (via Presigned URLs générées par +server.ts endpoints)

## Authentification & Sécurité
- **Authentification (Admin V1)** : **Cloudflare Access** (Zero Trust) avec validation JWT (Cf-Access-Jwt-Assertion) via `jose` dans `hooks.server.ts`
- **Authentification (Utilisateurs Post-V1)** : **Better Auth** (compatible D1 et Drizzle)
- **Sécurité (Réseau)** : **Cloudflare WAF** (Web Application Firewall)

## Infrastructure Cloudflare
- **Configuration** : **wrangler.toml** (source de vérité pour bindings et infrastructure)
- **Secrets** : `.dev.vars` (local) + `wrangler secret` (production) - **exclusivement via `event.platform.env`**
- **Cache** : **Cloudflare KV** (cache distribué) + **Cloudflare Durable Objects** (état stateful si nécessaire)
- **Images** : **Cloudflare Images** (transformation runtime via cdn-cgi/image)

## Monitoring & Analytics
- **Monitoring V1** : **Cloudflare Health Checks** + **Workers Metrics** & **Log Explorer**
- **Analytics V1** : **Cloudflare Web Analytics** (privacy-first, sans cookies)
- **Backups** : **Cloudflare D1 Time Travel** (Point-in-Time Recovery)

## Communication (Post-V1)
- **Newsletter** : **Resend** (API email transactionnel)
- **Templates Email** : **Templates Svelte personnalisés** (rendus en HTML)

# Hébergement & Déploiement

- **Plateforme** : **Cloudflare Workers** (hébergement Full Stack SvelteKit)
- **Déploiement** : CI/CD avec **GitHub Actions** vers la plateforme Cloudflare
- **Sécurité (Périmètre)** : **Cloudflare Access** (Zero Trust) sécurise la route `/admin` au niveau du réseau, avant que la requête n'atteigne l'application
- **Sécurité (Applicative)** : **Cloudflare WAF** protège contre les menaces web courantes (XSS, injection SQL, etc.)
- **Réseau** : Géré par l'infrastructure mondiale "Edge" de Cloudflare, remplaçant la gestion manuelle de VPS, Docker et `iptables-nft`
- **Monitoring** : **Cloudflare Health Checks** configurés pour surveiller le endpoint `/health` de l'application SvelteKit, avec alertes via les **Cloudflare Alerts**
- **Analytics** : **Cloudflare Web Analytics** intégré pour le suivi des visiteurs et performances (privacy-first, sans cookies)

# Principes Architecturaux Clés

Basés sur le plan de recherche SvelteKit/Cloudflare, ces principes guident toutes les décisions techniques :

1. **Scaffolding C3 Obligatoire** : Utiliser `pnpm create cloudflare@latest --framework=svelte --platform=workers` pour configuration initiale correcte
2. **Plugin Vite Unifié** : Le plugin Vite Cloudflare (configuré par C3) fusionne développement local (HMR) et runtime Workers (bindings)
3. **platform.env comme Source de Vérité** : Abandonner les modules `$env` côté serveur, utiliser exclusivement `event.platform.env`
4. **Chaîne de Validation Intégrée** : Drizzle Schema → drizzle-zod → Zod → sveltekit-superforms pour type-safety de bout en bout
5. **Stockage R2 via URLs Pré-signées** : Téléversements contournent le Worker pour éviter les limites de taille
6. **Authentification via Cloudflare Access** : Validation JWT `Cf-Access-Jwt-Assertion` dans `hooks.server.ts` avec `jose`
7. **i18n avec Paraglide-JS** : Solution moderne, compilée, tree-shakable (typesafe-i18n n'est plus maintenu)
8. **Tests Haute-Fidélité** : Vitest Browser Mode (vs JSDOM) + Playwright avec fixtures DB
9. **Déploiement en Deux Étapes** : Migrations DB d'abord (`wrangler d1 migrations apply --remote`), puis déploiement code
