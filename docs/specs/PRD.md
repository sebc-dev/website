---
created: 2025-11-01T09:15
updated: 2025-11-06T00:00
status: validated
validation_source: Architecture Next.js 15 + Cloudflare Workers (OpenNext)
---
# Product Requirements Document (PRD) — sebc.dev

## Introduction

### Objectifs

- **Créer un blog technique bilingue** (français/anglais) centré sur l'intersection de l'IA, de l'UX et de l'ingénierie logicielle.
- **Servir de "laboratoire d'apprentissage public"** où chaque article documente un processus d'apprentissage authentique.
- **Démontrer concrètement comment l'IA peut être un outil d'amplification** pour la productivité et l'apprentissage dans le développement.
- **Transformer les apprentissages personnels en ressources de haute qualité** pour la communauté technique, basées sur le principe "enseigner pour mieux apprendre".
- **Servir efficacement trois personas cibles distincts avec métriques précises** : Développeurs mid-level en startup (focus efficacité), juniors en apprentissage (guidance progressive), indie hackers/freelances (vue d'ensemble stratégique)
- **Maximiser l'efficacité temporelle** : Time-to-value < 60 secondes, pattern discovery < 3 minutes.
- **Faciliter l'apprentissage transversal** entre UX, IA et Dev.

### Contexte

Projet initié par un développeur unique, utilisant l'IA comme multiplicateur de productivité.
Le blog vise à partager des retours d'expérience authentiques sur l'intégration de l'IA, de l'UX et des bonnes pratiques d'ingénierie dans un workflow moderne.
Pas d'objectif commercial immédiat. **Timeline** : V1 prévue pour fin novembre/début décembre avec scope riche incluant Hub de Recherche Avancée et taxonomie complète.

---

## Exigences Fonctionnelles

### EF1 — Publication et rendu des articles MDX

**Description** : Les articles publiés en format MDX doivent être visibles publiquement sur le site avec support de blocs de contenu flexibles et réutilisables.
**Critères d'acceptation** :

- CA1 : L'administrateur peut publier un article MDX via le panneau d'administration et l'article s'affiche correctement côté utilisateur.
- CA2 : Les blocs personnalisés (code, citations, images, etc.) se rendent avec le style prévu via composants React personnalisés.
- CA3 : L'URL publique est stable et partageable (`/fr/articles/[slug]` et `/en/articles/[slug]`).
- CA4 : Le contenu MDX est stocké en base de données (Cloudflare D1) dans la table `article_translations.content_mdx`.

### EF2 — Table des matières automatique

**Description** : Chaque page d'article doit afficher une table des matières générée automatiquement.
**Critères d'acceptation** :

- CA1 : Tous les titres de niveau 2+ sont listés dans la TOC.
- CA2 : Chaque entrée est cliquable et fait défiler la page jusqu'à la section correspondante.
- CA3 : La TOC se met à jour si le contenu est modifié.
- CA4 : Implémentation via composant React client (Client Component avec hooks) analysant le contenu HTML rendu.

### EF3 — Indicateur de progression de lecture

**Description** : Chaque page d'article doit afficher un indicateur visuel de progression.
**Critères d'acceptation** :

- CA1 : La barre/indicateur progresse en fonction du scroll de l'utilisateur.
- CA2 : L'indicateur est accessible et lisible sur desktop et mobile.
- CA3 : Implémentation via composant React client (Client Component avec hooks useState/useEffect) pour réactivité.

### EF4 — Catégories et tags administrables

**Description** : L'administrateur doit pouvoir assigner des catégories et tags à chaque article.
**Critères d'acceptation** :

- CA1 : Le panneau d'administration permet d'ajouter/modifier/supprimer des tags via Next.js Server Actions.
- CA2 : Les 9 catégories canoniques sont modifiables mais non supprimables.
- CA3 : Chaque article peut être associé à plusieurs tags et une catégorie minimum.

### EF5 — Redirection par catégorie ou tag

**Description** : Cliquer sur une catégorie ou un tag affiche la page de recherche filtrée.
**Critères d'acceptation** :

- CA1 : Depuis un article, cliquer sur une catégorie affiche tous les articles de cette catégorie.
- CA2 : Depuis un article, cliquer sur un tag affiche tous les articles liés.
- CA3 : Filtres reflétés dans l'URL via URL Search Params.

### EF6 — Cartes d'articles

**Description** : Les cartes d'articles affichent les métadonnées principales.
**Critères d'acceptation** :

- CA1 : Chaque carte affiche date de publication, catégorie, tags et temps de lecture.
- CA2 : Le visuel est homogène dans toutes les listes (home, recherche, etc.).
- CA3 : Composant React réutilisable `<ArticleCard>`.

### EF7 — Calcul du temps de lecture

**Description** : Le système calcule et affiche automatiquement le temps de lecture estimé.
**Critères d'acceptation** :

- CA1 : Le temps de lecture global s'affiche en haut de l'article.
- CA2 : Le temps de lecture par section apparaît dans la TOC.
- CA3 : La méthode de calcul (mots/minute) est documentée.
- CA4 : Calcul côté serveur dans React Server Component.

### EF8 — Page de recherche avancée

**Description** : Une page de recherche avancée permet de filtrer les articles.
**Critères d'acceptation** :

- CA1 : Les filtres disponibles incluent mots-clés, catégories, tags, complexité et date.
- CA2 : Les résultats apparaissent dynamiquement sans rechargement via React Server Components + URL Search Params.
- CA3 : L'état des filtres est reflété dans l'URL.
- CA4 : Les 9 catégories canoniques sont initialisées via un script de seed SQL.

### EF9 — Catégories prédéfinies

**Description** : Le système supporte 9 catégories fixes.
**Critères d'acceptation** :

- CA1 : Les catégories disponibles sont celles listées dans le PRD (Actualités, Analyse Approfondie, Parcours d'Apprentissage, Rétrospective, Tutoriel, Étude de Cas, Astuces Rapides, Dans les Coulisses, Test d'Outil).
- CA2 : Les catégories sont modifiables (nom, icône, couleur) mais non supprimables via l'admin.
- CA3 : Le seed SQL initial crée les 9 catégories avec leurs métadonnées (key, icône, couleur).

### EF10 — Traitement visuel distinct par catégorie

**Description** : Chaque catégorie a un rendu graphique propre.
**Critères d'acceptation** :

- CA1 : Chaque catégorie possède une icône dédiée.
- CA2 : Chaque catégorie a une couleur ou un badge unique.
- CA3 : La cohérence est respectée dans toutes les vues.

### EF11 — Indicateur de complexité

**Description** : Chaque article affiche un niveau de complexité (Débutant/Intermédiaire/Avancé).
**Critères d'acceptation** :

- CA1 : L'indicateur est visible sur la carte et la page d'article.
- CA2 : L'assignation se fait dans le panneau d'administration.

> **Note (stockage)** : la valeur persistée est en anglais (`beginner|intermediate|advanced`) ; les labels FR/EN sont gérés en UI via Paraglide.

### EF12 — Hub de recherche avancée (point central)

**Description** : Le hub centralise recherche textuelle et navigation taxonomique.
**Critères d'acceptation** :

- CA1 : L'utilisateur peut rechercher par mots-clés ou naviguer via catégories/tags.
- CA2 : Tous les filtres sont combinables (ET logique).
- CA3 : Accessibilité clavier complète.

### EF13 — Filtres dynamiques et URL persistente

**Description** : Les filtres se mettent à jour sans rechargement et sont persistés dans l'URL.
**Critères d'acceptation** :

- CA1 : Modification d'un filtre → mise à jour instantanée des résultats via React Server Components avec searchParams.
- CA2 : Rafraîchir la page conserve les filtres (lecture URL Search Params).
- CA3 : L'URL est partageable et reproduit la recherche.

### EF14 — Combinaison de filtres multiples

**Description** : Le hub permet de combiner plusieurs critères de recherche.
**Critères d'acceptation** :

- CA1 : Filtres disponibles : mots-clés, catégories, tags, complexité, durée, date.
- CA2 : Les résultats sont paginés (24 cartes/page) et triés par date desc.
- CA3 : _Empty state_ clair avec suggestions.
- CA4 : Les filtres **durée de lecture** (min/max) et **date** (from/to) sont disponibles en V1.

### EF15 — Comptes utilisateurs (Post-V1)

**Description** : Les utilisateurs peuvent créer un compte personnel.
**Critères d'acceptation** :

- CA1 : Formulaire d'inscription avec email/mot de passe.
- CA2 : Connexion sécurisée via Better Auth.
- CA3 : Disponible uniquement en phase Post-V1.

### EF16 — Commentaires (Post-V1)

**Description** : Les utilisateurs connectés peuvent commenter les articles.
**Critères d'acceptation** :

- CA1 : Formulaire de commentaire disponible sous chaque article.
- CA2 : Les commentaires sont persistés en base D1 et affichés publiquement.
- CA3 : Disponible uniquement en phase Post-V1.

### EF17 — Newsletter (Post-V1)

**Description** : Les visiteurs peuvent s'abonner à une newsletter.
**Critères d'acceptation** :

- CA1 : Formulaire d'abonnement accessible depuis le site.
- CA2 : L'administrateur peut envoyer un email groupé aux abonnés via Cloudflare Email Service.
- CA3 : Templates email rendus avec react-email.
- CA4 : Disponible uniquement en phase Post-V1.

### EF18 — Wiki (Post-V1)

**Description** : L'administrateur peut gérer une section "Wiki" séparée des articles de blog.
**Critères d'acceptation** :

- CA1 : Les pages Wiki ont une taxonomie distincte.
- CA2 : Les pages Wiki ne se mélangent pas avec les articles.
- CA3 : Support du versionning, historique, index, glossaire et liens croisés.
- CA4 : Disponible uniquement en phase Post-V1.

### EF19 — Internationalisation UI

**Description** : L'utilisateur peut basculer l'interface entre le français et l'anglais à tout moment. La préférence est persistée (navigateur → cookie → URL).
**Critères d'acceptation** :

- CA1 : Un sélecteur de langue est disponible sur toutes les pages.
- CA2 : La langue par défaut est détectée via la configuration du navigateur.
- CA3 : Le choix de l'utilisateur est mémorisé en cookie et appliqué à l'URL.
- CA4 : Implémentation via next-intl avec middleware Next.js et route groups `/[lang]/`.

### EF20 — Structure d'URL bilingue

**Description** : Tous les contenus sont servis sous une arborescence claire `/fr/...` et `/en/...`.
**Critères d'acceptation** :

- CA1 : Chaque article possède deux URL distinctes, une par langue.
- CA2 : Les redirections 301 sont en place en cas d'erreur de langue ou de suppression.
- CA3 : Les URL sans préfixe redirigent vers la langue par défaut (FR).
- CA4 : Middleware Next.js (`middleware.ts`) gère le routing i18n avec next-intl.

### EF21 — Fallback de contenu

**Description** : Lorsqu'une traduction est manquante, l'article est affiché dans la langue source avec un badge de langue.
**Critères d'acceptation** :

- CA1 : Si une traduction n'existe pas, la version disponible est servie.
- CA2 : Un badge "FR" ou "EN" s'affiche pour indiquer la langue actuelle.
- CA3 : Un bouton permet de basculer vers la langue opposée (si disponible).

### EF22 — SEO hreflang

**Description** : Chaque page bilingue publie des balises `hreflang` cohérentes et des liens canoniques par langue.
**Critères d'acceptation** :

- CA1 : Les balises `hreflang` FR et EN pointent vers les bonnes URL.
- CA2 : La balise `canonical` correspond toujours à l'URL de la langue affichée.
- CA3 : La validation via un outil SEO externe confirme l'absence d'erreurs hreflang.
- CA4 : Implémentation via Next.js Metadata API (fonction `generateMetadata`) dans les React Server Components.

### EF23 — Admin multilingue

**Description** : Le panneau d'administration permet de gérer les traductions FR/EN.
**Critères d'acceptation** :

- CA1 : Les articles utilisent une table de traductions séparée (`article_translations`) avec relation 1-N.
- CA2 : L'interface admin affiche deux onglets (FR/EN) pour éditer les traductions.
- CA3 : La publication est bloquée si FR **et** EN n'ont pas : `title`, `excerpt`, `seo_title`, `seo_description`, `slug`.
- CA4 : L'administrateur peut visualiser l'état de complétion des traductions (badge "FR complet", "EN manquant", etc.).

### EF24 — Mode prévisualisation

**Description** : L'administrateur peut prévisualiser un article en mode brouillon avant publication.
**Critères d'acceptation** :

- CA1 : Bouton "Prévisualiser" dans le panneau admin ouvre `/fr/articles/[slug]?preview=true`.
- CA2 : Le React Server Component vérifie `searchParams.preview` et valide l'authentification via middleware.
- CA3 : Si `preview=true` et utilisateur authentifié → affiche le brouillon.
- CA4 : Badge "MODE PRÉVISUALISATION" visible en haut de page.
- CA5 : Sécurisé par Cloudflare Access (déjà actif pour `/admin`).

---

## Exigences Non Fonctionnelles

### ENF1 — Frontend (Next.js + React)

**Description** : Le frontend doit être développé avec Next.js 15 et React 19.
**Critères d'acceptation** :

- CA1 : Le projet compile et s'exécute avec Next.js 15 (App Router).
- CA2 : Le projet utilise React 19 avec Server Components et Client Components.
- CA3 : Les versions sont vérifiées dans `package.json` et documentées.

### ENF2 — Architecture Next.js App Router

**Description** : Application Next.js 15 standard avec App Router et panneau d'administration intégré.

**Critères d'acceptation** :
- CA1 : Le projet suit la structure Next.js App Router avec routes organisées logiquement dans `app/`.
- CA2 : Panneau d'administration accessible via `/admin` (routes protégées).
- CA3 : Composants globaux dans `src/components/`.
- CA4 : Code serveur uniquement dans `src/lib/server/`.
- CA5 : Server Actions co-localisées avec leurs routes ou dans fichiers dédiés `actions.ts`.
- CA6 : La documentation décrit cette organisation modulaire.

### ENF3 — Cache OpenNext

**Description** : Le cache utilise l'architecture OpenNext multi-composants pour Next.js sur Cloudflare Workers.
**Critères** :
- CA1 : Configuration des bindings OpenNext requis dans wrangler.toml (R2, Durable Objects, D1/KV pour tags).
- CA2 : Headers de cache HTTP configurés pour pages statiques et API.
- CA3 : Support ISR (Incremental Static Regeneration) via R2 et queue Durable Objects.
- CA4 : Support `revalidateTag()` et `revalidatePath()` via cache de tags (Durable Objects recommandé pour production).

> **Note** : Architecture OpenNext complète avec R2 (cache incrémental), Durable Objects (ISR queue + tag cache), et bindings requis (NEXT_INC_CACHE_R2_BUCKET, NEXT_CACHE_DO_QUEUE, NEXT_TAG_CACHE_DO_SHARDED, WORKER_SELF_REFERENCE).

### ENF4 — Design system

**Description** : L'UI doit être implémentée avec TailwindCSS 4 et shadcn/ui.
**Critères d'acceptation** :

- CA1 : Palette respectée (vert canard #14B8A6, fond anthracite #1A1D23).
- CA2 : Typographie Nunito Sans + JetBrains Mono appliquée globalement.
- CA3 : Les composants sont dérivés de shadcn/ui (composants React copy-paste) et documentés.
- CA4 : TailwindCSS 4 configuré avec Next.js.

### ENF5 — Runtime Cloudflare Workers

**Description** : L'application est déployée sur Cloudflare Workers via adaptateur OpenNext.
**Critères d'acceptation** :

- CA1 : Build Next.js compatible avec Cloudflare Workers via `@opennextjs/cloudflare`.
- CA2 : Adaptateur `@opennextjs/cloudflare` configuré pour transformation Next.js vers Workers.
- CA3 : Variables d'environnement et bindings gérés via `wrangler.toml` et accessibles dans le code.
- CA4 : `wrangler.toml` configuré avec `compatibility_flags = ["nodejs_compat"]` et `compatibility_date` récente (2025+).

### ENF6 — Déploiement Cloudflare

**Description** : L'application est déployée via GitHub Actions sur Cloudflare Workers.
**Critères d'acceptation** :

- CA1 : Déploiement automatisé via GitHub Actions.
- CA2 : Pipeline CI/CD avec tests (Vitest + Playwright), build Next.js via OpenNext, migrations D1, déploiement via `wrangler deploy`.
- CA3 : Rollback possible via historique de déploiements Cloudflare.

### ENF7 — Bonnes pratiques d'ingénierie

**Description** : Le code doit suivre des standards de qualité et maintenabilité.
**Critères d'acceptation** :

- CA1 : ESLint et Prettier configurés.
- CA2 : Tests avec couverture ≥ 70 %.
- CA3 : Revue de code obligatoire pour merger.

### ENF8 — Intégrations futures (Post-V1)

**Description** : Prévoir intégration de Cloudflare Email Service (newsletter) et amélioration analytics.
**Critères d'acceptation** :

- CA1 : Le code est préparé pour ajouter Cloudflare Email Service (binding natif Workers) et éventuellement Plausible.
- CA2 : La doc précise comment les intégrer en Post-V1.
- CA3 : Utilisation de react-email pour templates email rendus en HTML.

### ENF9 — Core Web Vitals

**Description** : Le site doit respecter les seuils Core Web Vitals.
**Critères d'acceptation** :

- CA1 : LCP < 2,5s sur mobile 4G.
- CA2 : INP < 100 ms.
- CA3 : CLS < 0,1 sur toutes les pages.

### ENF10 — Optimisation images

**Description** : Servir images en WebP/AVIF avec lazy loading via Cloudflare R2 et Cloudflare Images.
**Critères d'acceptation** :

- CA1 : Les images sont stockées dans Cloudflare R2.
- CA2 : Upload via Presigned URLs générées par Route Handlers Next.js (`route.ts`).
- CA3 : Conversion automatique en WebP/AVIF via Cloudflare Images Transform.
- CA4 : Utilisation de `next/image` avec loader personnalisé pour Cloudflare Images (`/cdn-cgi/image/...`).
- CA5 : Fonction utilitaire `buildCloudflareImageUrl()` pour transformation.
- CA6 : Cloudflare Images Transformations activé dans le dashboard Cloudflare.
- CA7 : Lazy loading natif de `next/image` activé par défaut.
- CA8 : Attributs `width` et `height` requis pour éviter CLS.
- CA9 : Taille < 500 Ko pour toutes les images source avant transformation.

### ENF11 — Accessibilité WCAG

**Description** : Respecter WCAG 2.1 niveau AA.
**Critères d'acceptation** :

- CA1 : Contraste texte/fond ≥ 4,5:1.
- CA2 : Navigation clavier complète.
- CA3 : Audit Lighthouse ≥ 90 en Accessibilité.

### ENF12 — Zones interactives

**Description** : Les zones interactives doivent être ≥ 44x44 px.
**Critères d'acceptation** :

- CA1 : Boutons ≥ 44 px.
- CA2 : Liens cliquables respectent la norme mobile.

### ENF13 — Réduction animations

**Description** : Respect du `prefers-reduced-motion`.
**Critères d'acceptation** :

- CA1 : Animations désactivées si préférence active.
- CA2 : Tests manuels valident le comportement.

### ENF14 — Métriques de suivi (V1)

**Description** : Suivi via Cloudflare Web Analytics (V1).
**Critères d'acceptation** :

- CA1 : Cloudflare Web Analytics intégré et actif.
- CA2 : Métriques de base disponibles (pages vues, visiteurs uniques, etc.).
- CA3 : Les données sont anonymisées et conformes RGPD.

### ENF15 — Maintenabilité du code

**Description** : Le code doit être facilement extensible.
**Critères d'acceptation** :

- CA1 : Documentation de code en anglais.
- CA2 : Couverture de tests ≥ 70 %.
- CA3 : Complexité cyclomatique < 10 par fonction.

### ENF16 — Objectifs de croissance

**Description** : Le site doit viser 500+ lecteurs réguliers en V1.
**Critères d'acceptation** :

- CA1 : KPI de visiteurs uniques suivis via Cloudflare Analytics.
- CA2 : Rapport mensuel automatisé.

### ENF17 — Objectifs long terme

**Description** : Viser 10 000+ lecteurs réguliers en 2026.
**Critères d'acceptation** :

- CA1 : KPI long terme définis.
- CA2 : Suivi via Cloudflare Analytics (ou Plausible en Post-V1).

### ENF18 — Temps de consultation cible

**Description** : Viser ≥ 3 minutes en moyenne par page.
**Critères d'acceptation** :

- CA1 : Analytics calcule durée de session moyenne.
- CA2 : Rapport trimestriel produit.

### ENF19 — SEO avancé

**Description** : Mise en place d'un plugin SEO avancé.
**Critères d'acceptation** :

- CA1 : Sitemap.xml et robots.txt générés automatiquement.
- CA2 : Balises meta title/description uniques par page.
- CA3 : Open Graph et Twitter Cards valides.

### ENF20 — Tests automatisés

**Description** : Mise en place de tests (unitaires, composants, E2E).
**Critères d'acceptation** :

- CA1 : Tests unitaires sur logique métier avec Vitest.
- CA2 : Tests de composants React (Client Components) avec Vitest + @testing-library/react.
- CA3 : Tests E2E avec Playwright et fixtures de base de données (seeding via `wrangler d1 execute DB --local --file=./seed.sql`).
- CA4 : Tests E2E couvrent les Server Components async et Server Actions (obligatoire car non testables en unit tests).
- CA5 : Pipeline CI échoue si tests rouges.

### ENF21 — Monitoring (V1, Cloudflare)

**Description**
Mettre en place un monitoring via **Cloudflare** :
- **Health Checks** sur `/health` toutes les **5 minutes** ; **alerte après 2 échecs** consécutifs.
- **Workers Metrics** pour surveiller les performances et erreurs.
- **Log Explorer** pour centraliser les logs.
- L'endpoint **canonique** est `GET /health` (public), JSON minimal `{ status: 'ok', service: 'sebc.dev', buildId: '...', database: 'connected' }`.

**Critères d'acceptation**
- **CA1** : L'URL `https://<domaine>/health` retourne `200` avec JSON `{status:'ok', service:'sebc.dev', buildId:'...', database:'connected'}`.
- **CA2** : Un Health Check Cloudflare est configuré (intervalle 5 min, politique « 2 fails ») et actif.
- **CA3** : L'endpoint vérifie la connexion à D1 et retourne une erreur si inaccessible.
- **CA4** : Workers Metrics activé pour le suivi des performances.
- **CA5** : Alertes Cloudflare configurées pour notifier en cas de panne.

### ENF22 — Sécurité applicative

**Description** : Application durcie (CSP, validation entrée, anti-XSS).
**Critères d'acceptation** :

- CA1 : CSP configurée strictement.
- CA2 : Tests d'injection échouent.
- CA3 : Validation des entrées utilisateur côté serveur (Server Actions avec Zod + react-hook-form).
- CA4 : Audit sécurité trimestriel.

### ENF23 — Sécurité infrastructure

**Description** : Infrastructure sécurisée via Cloudflare.

**Critères d'acceptation** :

- **CA1 : Cloudflare Access** — Route `/admin` protégée par Cloudflare Access (Zero Trust).
- **CA2 : Validation JWT** — Validation du token `Cf-Access-Jwt-Assertion` dans middleware Next.js (`middleware.ts`) avec `jose`.
- **CA3 : Cloudflare WAF** — Protection contre les menaces web courantes (XSS, SQL injection, etc.).
- **CA4 : Secrets** — Variables sensibles via `.dev.vars` (local) et `wrangler secret` (prod), accessibles via bindings.
- **CA5 : HTTPS** — Certificat SSL/TLS automatique via Cloudflare.

### ENF24 — Sauvegardes

**Description** : Sauvegarde D1 via Time Travel.

**Critères d'acceptation** :

- **CA1** : Cloudflare D1 Time Travel activé (Point-in-Time Recovery).
- **CA2** : Documentation de restauration depuis Time Travel.
- **CA3** : Test de restauration trimestriel.

### ENF25 — Performances

**V1 (Cloudflare Workers + D1 + R2)**
- Distribution globale via Edge network
- Latence optimisée par la proximité géographique
- Cache via Cloudflare Cache API
- **≥ 20 req/s**, **p95 < 800 ms** (bénéfice de l'Edge)
- Erreurs **< 1%**

**Post-V1 (optimisations) – cible**
- **≥ 100 req/s**, **p95 < 500 ms**
- Optimisations cache avancées si nécessaire (R2 Incremental + D1 Tags)

### ENF26 — Disponibilité

**Description** : Disponibilité cible 99,9 % (SLA Cloudflare).
**Critères d'acceptation** :

- CA1 : Suivi uptime via Cloudflare Health Checks.
- CA2 : Rapport mensuel de disponibilité.
- CA3 : Bénéfice de l'infrastructure mondiale Cloudflare (haute disponibilité native).

### ENF27 — Plan de reprise

**Description** : Procédures de PRA et tests de restauration réguliers.
**Critères d'acceptation** :

- CA1 : Documentation PRA validée (restauration D1 Time Travel).
- CA2 : Tests de restauration trimestriels réussis.
- CA3 : Procédure de rollback déploiement documentée.

---

## UI Design Objectifs et Inspirations

### Objectifs de Design UI

- **Clarté et Lisibilité Avant Tout** : Hiérarchie typographique stricte avec des contrastes élevés (≥4.5:1) et des espaces généreux entre les éléments pour permettre une lecture confortable même lors de sessions prolongées d'apprentissage technique
- **Minimalisme et Focus** : Interface épurée éliminant toute distraction visuelle non essentielle, avec une densité d'information optimisée pour maintenir l'attention sur le contenu technique et faciliter la concentration des développeurs
- **Professionnalisme et Crédibilité** : Esthétique moderne et cohérente renforçant l'autorité technique de l'auteur, avec des choix visuels délibérés qui inspirent confiance dans la qualité et la fiabilité du contenu partagé
- **Performance** : Design "performance-first" avec des composants légers, des animations optimisées et un budget de performance strict pour garantir des temps de chargement compatibles avec les contraintes de productivité des développeurs
- **Accessibilité (a11y)** : Conformité WCAG 2.1 AA native avec navigation clavier complète, support des lecteurs d'écran et respect des préférences utilisateur (reduced-motion, dark/light mode) pour assurer l'inclusivité technique
- **Time-to-Value Ultra-Rapide** : Architecture d'information optimisée pour l'efficacité avec prévisualisation du contenu, indicateurs de progression clairs et accès direct aux sections pertinentes, permettant aux utilisateurs d'extraire la valeur recherchée en moins de 60 secondes sans friction cognitive
- **Pattern Discovery Efficace** : Système de navigation intuitive et de filtrage avancé permettant la découverte rapide de patterns et solutions techniques pertinents en moins de 3 minutes, avec des raccourcis visuels et une taxonomie claire pour optimiser l'exploration du contenu
- **Adaptation Multi-Personas** : Interface modulaire s'adaptant dynamiquement aux besoins distincts des développeurs mid-level (focus efficacité), juniors (guidance progressive) et indie hackers (vue d'ensemble), avec des points d'entrée et parcours personnalisés selon le contexte d'usage
- **Hiérarchie Visuelle par Complexité** : Système de badges, couleurs et indicateurs visuels permettant l'identification immédiate du niveau technique requis (Débutant/Intermédiaire/Avancé), avec des codes couleur cohérents et une progression visuelle intuitive pour guider le choix de contenu
- **Distinction des 9 Catégories** : Identité visuelle unique pour chaque type de contenu (Actualités, Analyse, Parcours, etc.) avec iconographie dédiée, palette chromatique spécifique et mise en forme distinctive, facilitant la reconnaissance instantanée du format et de l'intention du contenu

### Direction Esthétique et Visuelle

- **Vision Générale** : Le design s'orientera vers une esthétique "dark mode" moderne et sophistiquée. L'interface sera basée sur une palette de **gris anthracite profonds** (#1A1D23) et rehaussée par une couleur d'accent principale **vert canard lumineux** (#14B8A6) pour les éléments interactifs.
- **Typographie** : La hiérarchie visuelle sera stricte, utilisant une police **sans-serif moderne** (type Inter) pour une lisibilité maximale et une police **monospace** (type JetBrains Mono) pour le code.
- **Mise en Page** : La structure reposera sur une grille à 12 colonnes et un système d'espacement cohérent (base 8px) pour assurer une composition aérée et structurée.
- **Composants et Effets** : Les éléments d'interface (cartes, boutons) adopteront un style moderne avec des coins arrondis. Des effets visuels subtils comme les **dégradés** et des **lueurs douces** seront utilisés pour créer une expérience immersive et de haute qualité.
- **Accessibilité** : L'accessibilité sera un principe central, avec une attention particulière portée aux contrastes de couleurs (minimum WCAG AA) et aux états de focus clairs et visibles.

### Inspirations

- https://supabase.com/
- https://auth0.com/blog/
- https://ovo-redsun.webflow.io/
- https://verve-template.webflow.io/

---

## Hypothèses techniques

- **Repository** : Application Next.js 15 standard avec App Router (routes dans `app/` + lib).
- **Migration données** : Drizzle migrations (`drizzle-kit generate` + `wrangler d1 migrations apply`).
- **Tests** : Unitaires Vitest, composants Vitest + @testing-library/react, E2E Playwright avec fixtures DB (seeding via `wrangler d1 execute`).
- **Format de contenu** : MDX stocké en base de données D1 (`article_translations.content_mdx`) avec support de blocs flexibles via composants React.
- **TailwindCSS** : Version 4 configuré avec Next.js.
- **Timeline** : V1 fin novembre/début décembre.
- **Frontend** : Next.js 15 + React 19 (Server/Client Components) + TailwindCSS 4 + shadcn/ui.
- **Backend** : Server Actions + React Server Components + Drizzle ORM + Cloudflare D1.
- **Stockage média** : Cloudflare R2 via Presigned URLs (Route Handlers `route.ts`).
- **Cache** : Architecture OpenNext avec R2 (cache incrémental), Durable Objects (ISR queue + tag cache), bindings requis configurés dans wrangler.toml.
- **Runtime** : Cloudflare Workers via adaptateur `@opennextjs/cloudflare` (OpenNext).
- **Infra** : Déploiement automatisé sur Cloudflare via GitHub Actions (tests → migrations D1 → build OpenNext → deploy).
- **Internationalisation** : next-intl avec middleware Next.js + route groups `/[lang]/` + table `article_translations`.

---

## 🧱 EPIC 0 — Socle technique (V1)

- **0.1** Initialiser le projet Next.js 15 : `npx create-next-app@latest --typescript --tailwind --app`
- **0.2** Configurer adaptateur OpenNext : `@opennextjs/cloudflare`
- **0.3** Configurer TailwindCSS 4 + shadcn/ui
- **0.4** Configurer Drizzle ORM + Cloudflare D1 (schéma initial + migrations)
- **0.5** Configurer `wrangler.toml` avec bindings (D1, R2, KV, Durable Objects pour OpenNext)
- **0.6** Configurer `compatibility_flags = ["nodejs_compat"]` et `compatibility_date` récente
- **0.7** Mettre en place CI/CD GitHub Actions (tests Vitest + Playwright, build OpenNext, migrations D1, déploiement)
- **0.8** Configurer Cloudflare Access pour routes `/admin/*` (Zero Trust)
- **0.9** Configurer Cloudflare WAF et sécurité de base
- **0.10** Base tests & linting (Vitest, ESLint, Prettier)

## 🧩 EPIC 1 — Gestion & rendu des articles (MDX + multilingue)

- **1.1** Créer schéma D1 (articles avec status `draft|published`, article_translations avec `content_mdx`, categories, tags) avec Drizzle
- **1.2** Créer script de seed SQL pour les 9 catégories canoniques
- **1.3** Implémenter routes admin : `app/admin/layout.tsx` (sidebar, navigation)
- **1.4** Implémenter panneau admin : création/édition articles (deux onglets FR/EN) avec Server Actions + react-hook-form + Zod
- **1.5** Implémenter mode prévisualisation : `?preview=true` avec vérification authentification dans Server Component
- **1.6** Implémenter validation publication (blocage si traductions FR+EN incomplètes)
- **1.7** Publier un article MDX (FR/EN), URL stable `/fr/articles/[slug]` et `/en/articles/[slug]`
- **1.8** Rendu MDX riche (code, images, citations) avec composants React personnalisés via `@next/mdx` ou `next-mdx-remote`
- **1.9** Calcul auto du temps de lecture global & par section (côté serveur dans React Server Component)
- **1.10** Table des matières automatique cliquable (composant React Client Component avec hooks)
- **1.11** Indicateur de progression de lecture (composant React Client Component avec useState/useEffect, a11y, responsive)
- **1.12** Upload images vers Cloudflare R2 via Presigned URLs (Route Handler `route.ts`)

## 🧩 EPIC 2 — Taxonomie & navigation (catégories, tags, complexité)

- **2.1** Interface admin : gestion des 9 catégories (modification icône/couleur via Server Actions, non supprimables)
- **2.2** Interface admin : gestion des tags (CRUD complet via Server Actions)
- **2.3** Indicateur de complexité (badges débutant/intermédiaire/avancé, traductions via next-intl)
- **2.4** Navigation par catégorie/tag (liens → liste filtrée via URL Search Params)
- **2.5** Pages catégories et tags avec cartes d'articles (composant React `<ArticleCard>`)

## 🧩 EPIC 3 — Hub de recherche avancée

- **3.1** Page de recherche (mots-clés + filtres combinés, React Server Components + URL Search Params)
- **3.2** Filtres : catégories, tags, complexité, durée de lecture (min/max), date (from/to)
- **3.3** Résultats paginés (24/page, empty state, tri par date desc)
- **3.4** Facettes dynamiques (catégories/tags recalculés selon résultats)

## 🌐 EPIC 4 — Internationalisation (i18n)

- **4.1** Installer et configurer next-intl : `npm install next-intl`
- **4.2** Créer fichiers de messages : `messages/fr.json` et `messages/en.json`
- **4.3** Créer middleware Next.js dans `src/middleware.ts` avec next-intl
- **4.4** Structure bilingue des URLs avec route groups (`app/[lang]/`, détection navigateur + cookie)
- **4.5** Fallback de contenu (badge de langue, bascule FR/EN si disponible)
- **4.6** SEO `hreflang` + `canonical` via Next.js Metadata API dans Server Components
- **4.7** Sélecteur de langue dans header (persistance cookie via next-intl)

## ⚡ EPIC 5 — Cache & Performance

- **5.1** Configuration bindings OpenNext dans wrangler.toml (R2, Durable Objects, KV)
- **5.2** Configuration headers Cache-Control pour pages et API
- **5.3** Endpoint Route Handler `/api/health/route.ts` (monitoring Cloudflare Health Checks)
- **5.4** Optimisation Core Web Vitals (LCP, INP, CLS)
- **5.5** Tests de performance et ajustements

> **Note** : Architecture OpenNext complète avec support ISR et revalidateTag/Path dès V1.

## 🛡️ EPIC 6 — Sécurité & Monitoring

- **6.1** Cloudflare Access configuré pour `/admin/*` (Zero Trust)
- **6.2** Validation JWT `Cf-Access-Jwt-Assertion` dans middleware Next.js (`middleware.ts`) avec `jose`
- **6.3** Cloudflare WAF activé (protection XSS, SQL injection, etc.)
- **6.4** CSP stricte configurée
- **6.5** Validation entrées utilisateur côté serveur (Server Actions avec Zod + react-hook-form)
- **6.6** Cloudflare Health Checks sur `/api/health` (5 min, alerte après 2 échecs)
- **6.7** Cloudflare Web Analytics intégré

## ✅ EPIC 7 — Tests & Qualité

- **7.1** Tests unitaires (Vitest, couverture ≥ 70 %)
- **7.2** Tests composants Client Components (Vitest + @testing-library/react)
- **7.3** Tests E2E (Playwright avec fixtures DB : seeding via `wrangler d1 execute DB --local --file=./seed.sql`)
- **7.4** Tests E2E Server Components async et Server Actions (obligatoire)
- **7.5** Tests d'intégration avec D1 local (Wrangler)
- **7.6** Tests SEO (hreflang, canonical, sitemap)

## 📊 EPIC 8 — SEO & Analytics

- **8.1** Créer Route Handler `app/sitemap.xml/route.ts` pour génération dynamique du sitemap (query D1 pour articles publiés)
- **8.2** Créer `robots.txt` statique dans `public/`
- **8.3** Implémenter métadonnées SEO via Next.js Metadata API (fonction `generateMetadata` dans Server Components)
- **8.4** Implémenter balises `hreflang` via Metadata API (alternates.languages)
- **8.5** Cloudflare Web Analytics : suivi pages vues, visiteurs uniques
- **8.6** Core Web Vitals : optimisations LCP, INP, CLS

## 🤝 EPIC 9 — (Post-V1) Communauté & extensions

- **9.1** Authentification utilisateurs (Better Auth avec `better-auth-cloudflare` pour D1 + Drizzle + KV)
- **9.2** Système de commentaires
- **9.3** Newsletter (Cloudflare Email Service binding natif + templates react-email)
- **9.4** Wiki "Dev Resources" (taxonomie dédiée, versionning, historique, liens croisés)
- **9.5** Amélioration analytics (éventuellement migration vers Plausible)
- **9.6** Optimisations cache avancées si nécessaire

---

## Décisions Techniques Validées

### ✅ Stockage du contenu — VALIDÉ

**Décision** : MDX stocké en base de données D1

**Architecture validée** :
1. **Table `article_translations`** avec colonnes :
   - `content_mdx` (TEXT) : contenu Markdown avec composants React
   - `title`, `excerpt`, `seo_title`, `seo_description`, `slug`
   - `language` (VARCHAR) : 'fr' ou 'en'
2. **Rendu** : `@next/mdx` ou `next-mdx-remote` dans React Server Components pour transformation en HTML + composants React
3. **Composants personnalisés** : Blocs code, citations, images via composants React réutilisables

**Avantages validés** :
- ✅ Édition via panneau admin web
- ✅ Multilingue simplifié (table relations)
- ✅ Métadonnées structurées pour requêtes
- ✅ Pas de rebuild nécessaire pour modification contenu

### ✅ Mode prévisualisation — VALIDÉ

**Décision** : Query param `?preview=true` avec vérification authentification

**Implémentation** :
```typescript
// app/[lang]/articles/[slug]/page.tsx (React Server Component)
export default async function ArticlePage({
  params,
  searchParams
}: {
  params: { slug: string; lang: string };
  searchParams: { preview?: string };
}) {
  const isPreview = searchParams.preview === 'true';

  // Vérification authentification via middleware (headers)
  if (isPreview && !(await isAuthenticated())) {
    redirect('/admin/sign-in');
  }

  const article = await db
    .select()
    .from(articles)
    .where(
      and(
        eq(articles.slug, params.slug),
        isPreview ? undefined : eq(articles.status, 'published')
      )
    )
    .get();

  return <ArticleView article={article} isPreview={isPreview} />;
}
```

**Workflow validé** :
1. Admin édite article en mode `draft`
2. Bouton "Prévisualiser" → `/fr/articles/[slug]?preview=true`
3. Vérification authentification via middleware Next.js (Cloudflare Access JWT)
4. Badge "MODE PRÉVISUALISATION" affiché
5. Publication → `status = 'published'`

### ✅ Optimisations images (ENF10) — VALIDÉ

**Décision** : `next/image` avec loader personnalisé + Cloudflare Images Transform

**Architecture validée** :
1. **Stockage** : Images originales dans Cloudflare R2
2. **Upload** : Presigned URLs générées par Route Handlers Next.js (`route.ts`)
3. **Optimisation** : Cloudflare Images Transform (service Edge natif)
   - Conversion automatique WebP/AVIF à la volée
   - Redimensionnement selon device
   - Cache global sur tous les PoPs Edge
4. **Intégration Next.js** : `next/image` avec loader personnalisé

**Configuration Next.js :**
```typescript
// next.config.js
module.exports = {
  images: {
    loader: 'custom',
    loaderFile: './src/lib/cloudflare-image-loader.ts',
  },
};

// src/lib/cloudflare-image-loader.ts
export default function cloudflareLoader({ src, width, quality }: {
  src: string;
  width: number;
  quality?: number;
}) {
  const params = [
    `width=${width}`,
    `format=auto`,
    `quality=${quality || 85}`,
  ].join(',');

  return `/cdn-cgi/image/${params}/${src.replace(/^\//, '')}`;
}
```

**Utilisation :**
```tsx
// Composants React
import Image from 'next/image';

<Image
  src="/articles/post-123/hero.jpg"
  alt="Article hero"
  width={800}
  height={600}
  loading="lazy"
/>
```

**Fonction utilitaire (pour non-Image usages) :**
```typescript
// src/lib/utils/images.ts
export function buildCloudflareImageUrl(
  src: string,
  options: { width?: number; format?: 'auto' | 'webp' | 'avif'; quality?: number } = {}
): string {
  const { width, format = 'auto', quality = 85 } = options;

  const params = [
    width && `width=${width}`,
    format && `format=${format}`,
    quality && `quality=${quality}`,
  ].filter(Boolean).join(',');

  return `/cdn-cgi/image/${params}/${src.replace(/^\//, '')}`;
}
```

**Workflow complet** :
1. Upload → Route Handler génère Presigned URL R2
2. Client → PUT direct vers R2 (image originale)
3. Affichage → `next/image` utilise loader personnalisé
4. Loader → Génère URL `/cdn-cgi/image/width=800,format=auto/...`
5. Cloudflare → Transforme à la volée + mise en cache Edge

**Avantages validés** :
- ✅ Performance optimale (transformation et cache à l'Edge)
- ✅ next/image natif (lazy loading, responsive, CLS prevention)
- ✅ Coût prévisible (tarification par "transformations uniques")
- ✅ Scalabilité automatique

**Stratégie de nommage R2** :
- Structure : `/articles/{article-id}/{uuid}-{original-name}.{ext}`
- Génération UUID v4 pour éviter collisions
- Conservation nom original pour debuggage et SEO
- Exemple : `/articles/post-123/a1b2c3d4-hero-image.jpg`

### ✅ SEO et sitemap (EPIC 8.1) — VALIDÉ

**Décision** : Génération dynamique via Route Handler Next.js

**Implémentation validée** :
```typescript
// app/sitemap.xml/route.ts
import { db } from '@/lib/server/db';
import { articles } from '@/lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const publishedArticles = await db
    .select()
    .from(articles)
    .where(eq(articles.status, 'published'));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://sebc.dev/fr</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://sebc.dev/en</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  ${publishedArticles.map(article => `
  <url>
    <loc>https://sebc.dev/fr/articles/${article.slug}</loc>
    <lastmod>${article.updatedAt}</lastmod>
    <changefreq>${isRecent(article.updatedAt) ? 'weekly' : 'monthly'}</changefreq>
    <priority>${isRecent(article.updatedAt) ? '1.0' : '0.8'}</priority>
  </url>
  <url>
    <loc>https://sebc.dev/en/articles/${article.slug}</loc>
    <lastmod>${article.updatedAt}</lastmod>
    <changefreq>${isRecent(article.updatedAt) ? 'weekly' : 'monthly'}</changefreq>
    <priority>${isRecent(article.updatedAt) ? '1.0' : '0.8'}</priority>
  </url>
  `).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}

function isRecent(date: string): boolean {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return new Date(date) > thirtyDaysAgo;
}
```

**Priorités et fréquences** :
- Articles récents (< 30 jours) : priority `1.0`, changefreq `weekly`
- Articles anciens (> 30 jours) : priority `0.8`, changefreq `monthly`
- Pages statiques (home) : priority `1.0`, changefreq `weekly`

### ✅ Cache stratégie (V1) — VALIDÉ

**Décision** : Architecture OpenNext avec bindings multiples (R2, Durable Objects, KV)

**Implémentation** :
- **Cache incrémental (ISR)** : R2 via binding `NEXT_INC_CACHE_R2_BUCKET`
- **Queue révalidation** : Durable Object via `NEXT_CACHE_DO_QUEUE`
- **Cache de tags** : Durable Object (`NEXT_TAG_CACHE_DO_SHARDED` recommandé production) ou D1 (`NEXT_TAG_CACHE_D1` pour faible trafic)
- **Self-reference** : Binding `WORKER_SELF_REFERENCE` pour communication inter-composants
- Pages articles : Support `revalidateTag()` et `revalidatePath()`
- Admin : `Cache-Control: no-store, no-cache, must-revalidate`

**Configuration wrangler.toml** :
```toml
[[r2_buckets]]
binding = "NEXT_INC_CACHE_R2_BUCKET"
bucket_name = "next-cache"

[[durable_objects.bindings]]
name = "NEXT_CACHE_DO_QUEUE"
class_name = "DOQueueHandler"

[[durable_objects.bindings]]
name = "NEXT_TAG_CACHE_DO_SHARDED"
class_name = "DOTagCacheShard"

[[services]]
binding = "WORKER_SELF_REFERENCE"
service = "sebc-dev"
```

---

## Détails Techniques d'Implémentation

> **Note** : Les exemples de code détaillés et les guides d'implémentation seront documentés lors de la phase de développement (EPIC 0 et suivants). Cette section liste les éléments techniques clés à implémenter.

### Fichiers de configuration requis

1. **`wrangler.toml`** : Configuration Cloudflare avec bindings D1, R2, KV, Durable Objects et `nodejs_compat`
2. **`src/middleware.ts`** : Middleware Next.js pour i18n (next-intl) et validation JWT Cloudflare Access
3. **`next.config.js`** : Configuration Next.js avec loader personnalisé pour images
4. **`messages/fr.json` et `messages/en.json`** : Traductions next-intl
5. **`src/lib/utils/images.ts`** : Fonction `buildCloudflareImageUrl()`
6. **`src/lib/cloudflare-image-loader.ts`** : Loader personnalisé pour next/image
7. **`app/sitemap.xml/route.ts`** : Génération dynamique du sitemap via Route Handler

### Patterns techniques clés

1. **Validation Server Actions** : `react-hook-form` + Zod + drizzle-zod
2. **SEO hreflang** : Next.js Metadata API (fonction `generateMetadata`) avec `alternates.languages`
3. **Mode prévisualisation** : Query param `?preview=true` + vérification authentification dans Server Component
4. **Presigned URLs** : Route Handlers (`route.ts`) pour génération URLs R2 sécurisées
5. **Composant Image** : `next/image` avec loader personnalisé Cloudflare
6. **Middleware i18n** : next-intl dans `middleware.ts` avec route groups `/[lang]/`
7. **Connexion DB** : Drizzle instancié dans Server Components et Server Actions

### Principes architecturaux Next.js/Cloudflare

Basés sur les best practices validées 2025, ces principes guident toutes les décisions :

1. **Adaptateur OpenNext** : `@opennextjs/cloudflare` (l'ancien `@cloudflare/next-on-pages` est obsolète)
2. **Configuration Wrangler** : `wrangler.toml` comme source de vérité pour tous les bindings (D1, R2, KV, Durable Objects)
3. **nodejs_compat Flag** : `compatibility_flags = ["nodejs_compat"]` (prérequis non négociable)
4. **Chaîne de Validation Intégrée** : Drizzle Schema → drizzle-zod → Zod → react-hook-form
5. **Stockage R2 via URLs Pré-signées** : Upload direct navigateur → R2
6. **Authentification via Cloudflare Access** : Validation JWT dans middleware Next.js (`middleware.ts`) avec `jose`
7. **i18n avec next-intl** : Solution de référence pour App Router, typesafe, avec support RSC
8. **Tests Haute-Fidélité** : Vitest + Testing Library pour composants, Playwright avec seeding D1
9. **Déploiement en Deux Étapes** : Migrations DB (`wrangler d1 migrations apply --remote`) → Déploiement Worker (`wrangler deploy`)
10. **Server Components First** : Privilégier React Server Components pour data fetching, Client Components uniquement pour interactivité
11. **Cache OpenNext** : Architecture complète avec R2 (ISR), Durable Objects (queue + tags), bindings requis