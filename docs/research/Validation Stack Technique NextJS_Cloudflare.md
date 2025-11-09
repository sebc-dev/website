# **Analyse et Validation de l'Architecture Technique : Projet sebc.dev**

DATE : 10 Novembre 2025  
POUR : Fondateur, sebc.dev  
DE : Architecte Technique en Chef, Partenaires en Architecture Cloud  
OBJET : Audit et Validation de la Stack Technique (Next.js 15 / Cloudflare)

## **Partie 1 : Synthèse d'Audit et Recommandations Principales**

Suite à une analyse approfondie du document conceptuel du projet sebc.dev, l'architecture technique proposée, basée sur le binôme Next.js 15 (App Router) et la plateforme Cloudflare (Workers, D1, R2), est jugée **exceptionnellement robuste, moderne et parfaitement alignée sur les meilleures pratiques de 2025\.**  
L'approche "full stack" hébergée sur l'infrastructure Edge de Cloudflare est non seulement viable, mais elle représente une solution exemplaire pour un projet de blog technique moderne, en particulier pour un auteur unique, grâce à l'écosystème intégré de Cloudflare.  
Cependant, l'audit a identifié un point de friction critique et une opportunité de_substitution stratégique :

1. **Point de Friction Identifié (Post-V1) :** L'utilisation de Resend pour la newsletter.1 La bibliothèque Resend, et plus particulièrement sa dépendance react-email, présente des problèmes de compatibilité connus avec les environnements d'exécution non-Node.js, tels que Cloudflare Workers. Ces problèmes découlent de l'utilisation d'API Node.js spécifiques (par exemple, MessageChannel ou node:crypto) qui ne sont pas entièrement polyfillées ou disponibles dans le runtime Workers.3 Cela introduirait une complexité de build et un risque d'erreur d'exécution élevés.
2. **Recommandation Stratégique (Impérative) :** Il est impératif de **pivoter de Resend vers le service natif Cloudflare Email Sending**. Annoncé en septembre 2025, ce service est conçu spécifiquement pour s'intégrer aux Cloudflare Workers.6
   - **Intégration Native :** Il s'utilise via un simple "binding" dans wrangler.toml (par exemple, env.SEND_EMAIL.send(...)), éliminant la gestion des clés API.7
   - **Configuration Automatisée :** Le service configure automatiquement les enregistrements DNS critiques (SPF, DKIM, DMARC), un avantage considérable pour la délivrabilité.9
   - **Compatibilité react-email :** La plateforme Cloudflare Email Service a été conçue pour supporter explicitement les frameworks de templating comme react-email.11

En dehors de ce pivot stratégique sur le service d'emailing, tous les autres composants de la stack sont validés. La maturité de Cloudflare D1 en 2025 12 et la résolution de la friction historique du développement local 14 rendent cette architecture hautement recommandée.  
Ce rapport détaille la validation de chaque composant de la stack proposée.

## **Partie 2 : Viabilité du Cœur de la Stack : Next.js 15 sur Cloudflare Workers**

La viabilité du déploiement d'une application Next.js 15 complète sur Cloudflare Workers est confirmée. Ce succès repose sur deux composants essentiels : l'adaptateur OpenNext et le flag de compatibilité nodejs_compat.

### **2.1. Le Rôle Clé de l'Adaptateur OpenNext**

Il est crucial de noter que l'ancien adaptateur @cloudflare/next-on-pages est obsolète et a été officiellement archivé et déprécié.15  
La méthode de déploiement privilégiée et recommandée par Cloudflare en 2025 est l'adaptateur communautaire OpenNext, via le paquet @opennextjs/cloudflare.16 Cet adaptateur est ce qui permet à une application Next.js, conçue pour un environnement Node.js, d'être correctement transformée pour s'exécuter sur le runtime Edge de Cloudflare (workerd).  
L'adaptateur OpenNext prend en charge la quasi-totalité des fonctionnalités de Next.js 15, ce qui valide l'ensemble de la roadmap V1 16 :

- App Router et React Server Components (RSC)
- Route Handlers (pour les API)
- Server Actions
- Rendu Côté Serveur (SSR) et Génération Statique (SSG)
- Régénération Statique Incrémentale (ISR)
- Rendu Partiel Préalable (PPR, expérimental)
- Optimisation des images (via l'intégration avec Cloudflare Images)

### **2.2. nodejs_compat : Le Prérequis Non Négociable**

Next.js reste un framework Node.js dans l'âme.19 Pour combler le fossé entre les API Node.js attendues par Next.js et le runtime Workers (basé sur les standards Web), l'activation du flag nodejs_compat dans le fichier wrangler.toml est obligatoire.16  
Ce flag active les polyfills nécessaires pour des modules Node.js critiques (comme http, fs, crypto, etc.).20  
**Configuration wrangler.toml requise :**

Ini, TOML

\# wrangler.toml  
name \= "sebc-dev"  
compatibility_date \= "2025-03-25" \# Une date récente est requise  
compatibility_flags \= \["nodejs_compat"\]

Une limitation mineure persiste : l'utilisation directe d'API Node.js _dans_ le Middleware Next.js (introduit dans la v15.2) n'est pas encore prise en charge par l'adaptateur.16 Cela n'impacte cependant aucune des fonctionnalités prévues dans le document de concept.

## **Partie 3 : Analyse des Services de Données et de Stockage (Cloudflare Native)**

La stratégie "data-on-the-edge" est validée. L'utilisation de D1, R2 et KV est la bonne approche pour ce type de projet.

### **3.1. Base de Données : Cloudflare D1 et Drizzle ORM**

**Maturité de D1 :** En 2025, Cloudflare D1 est une base de données SQL serverless mature et prête pour la production.12 Elle est basée sur SQLite, ce qui est amplement suffisant pour un blog à auteur unique. Les fonctionnalités clés incluent :

- **Réplication Globale en Lecture (Bêta) :** D1 supporte désormais la réplication en lecture, ce qui réduit la latence des requêtes en lecture pour une audience mondiale.13
- **Time Travel (PITR) :** D1 inclut une fonctionnalité de "Point-in-Time Recovery" (PITR) par défaut, permettant de restaurer la base de données à n'importe quelle minute des 30 derniers jours.24 Cela remplace l'ancien système de "snapshots".27

**Drizzle ORM :** Le choix de Drizzle ORM est excellent. Il est léger, "type-safe" et possède un driver natif pour D1 (drizzle-orm/d1).28 La chaîne de validation proposée (Drizzle Schema $\\rightarrow$ drizzle-zod $\\rightarrow$ Zod $\\rightarrow$ react-hook-form) est une "best practice" moderne qui garantit une source de vérité unique pour les types de données, de la base de données au formulaire client.  
**Limitations à Considérer :** En tant que base SQLite, D1 a des limites, telles qu'une taille maximale de 2 Mo par ligne et une durée de requête maximale de 30 secondes.30 Ces limites n'auront aucun impact sur le cas d'usage d'un blog.

### **3.2. Stockage Média : Cloudflare R2 et URLs Pré-signées**

La stratégie d'upload de médias est correcte. Tenter de téléverser des fichiers (par exemple, des images d'articles) _via_ une Server Action Next.js échouerait en raison des limites de taille du corps de requête du Worker.  
La solution proposée, les **URLs Pré-signées (Presigned URLs)**, est la méthode standard pour contourner cette limite.31 Le flux d'implémentation est le suivant :

1. Le client (panneau d'administration) fait un appel à un Route Handler Next.js (par exemple, POST /api/upload-url).
2. Ce Route Handler, s'exécutant côté serveur, utilise le SDK S3 (configuré pour l'endpoint R2) et les "bindings" R2 pour générer une URL de téléversement PUT sécurisée et à usage unique.32
3. Le client reçoit cette URL et l'utilise pour téléverser le fichier directement vers R2 à l'aide de fetch (avec la méthode PUT).32

Cette méthode est sécurisée, performante et évite que des données volumineuses ne transitent par le Worker.33

### **3.3. Stockage Clé-Valeur : Cloudflare KV**

L'utilisation de Cloudflare KV pour le cache distribué est validée. Il est important de comprendre que KV est _un_ des composants utilisés par l'adaptateur OpenNext pour recréer l'architecture de cache de Next.js (Data Cache, ISR).  
Comme détaillé dans la section 5.6, le cache de OpenNext utilise une combinaison de services Cloudflare (R2, D1, et Durable Objects) pour fonctionner.34 KV peut être utilisé comme backend pour le cache incrémental, bien que R2 soit souvent préféré pour sa forte consistance. La principale utilisation de KV dans l'architecture OpenNext est pour le cache de tags ou d'autres métadonnées de cache à accès rapide.

## **Partie 4 : Analyse de l'Architecture Applicative (Framework et Logique)**

Les choix de bibliothèques et de patterns au sein de l'écosystème React/Next.js sont modernes et bien justifiés.

### **4.1. Gestion des Formulaires (Server Actions, RHF, Zod)**

La combinaison de Next.js Server Actions avec react-hook-form (RHF) et Zod est une approche de pointe en 2025\.35

- Les **Server Actions** fournissent le "progressive enhancement" et la mutation des données côté serveur.35
- **Zod** gère la validation des schémas, à la fois sur le serveur (dans l'action) et sur le client.
- **React Hook Form** reste pertinent pour gérer les états de formulaires complexes (par exemple, dans le panneau d'administration) et pour fournir une validation côté client _avant_ l'envoi de l'action, s'intégrant parfaitement avec shadcn/ui.36

Le lien entre RHF et les Server Actions se fait élégamment via le hook useActionState (introduit dans React 19), qui permet de gérer l'état de la réponse (succès, erreur) de l'action serveur directement dans le composant client.38

### **4.2. Internationalisation (next-intl)**

Pour l'internationalisation (i18n) avec l'App Router de Next.js, next-intl est la solution de référence.39 Ce choix est validé. Il gère de manière robuste le routage basé sur les locales (par exemple, /fr/... et /en/...), la détection de la langue, et fournit des messages "type-safe" qui fonctionnent de manière transparente dans les Server Components et les Client Components.39

### **4.3. Optimisation des Images (Cloudflare Images et next/image)**

La stratégie consistant à utiliser le composant next/image avec un "loader" personnalisé pour Cloudflare Images est la méthode la plus performante. Elle permet de bénéficier des optimisations de next/image (par exemple, priority, sizes) tout en déchargeant la transformation réelle (redimensionnement, conversion AVIF/WebP) vers l'infrastructure mondiale de Cloudflare.  
L'implémentation requiert deux fichiers 41 :

1. **Loader personnalisé (./image-loader.ts) :**  
   TypeScript  
   // image-loader.ts  
   import type { ImageLoaderProps } from "next/image";

   const normalizeSrc \= (src: string) \=\> {  
    return src.startsWith("/")? src.slice(1) : src;  
   };

   export default function cloudflareLoader({ src, width, quality }: ImageLoaderProps) {  
    if (process.env.NODE_ENV \=== "development") {  
    // En développement, servir l'image originale  
    return src;  
    }  
    const params \= \[\`width=${width}\`\];  
     if (quality) {  
       params.push(\`quality=${quality}\`);  
    }  
    const paramsString \= params.join(",");  
    // Construit l'URL de transformation Cloudflare  
    return \`/cdn-cgi/image/${paramsString}/${normalizeSrc(src)}\`;  
   }

2. **Configuration Next.js (next.config.js) :**  
   JavaScript  
   // next.config.js  
   /\*\* @type {import('next').NextConfig} \*/  
   const nextConfig \= {  
    images: {  
    loader: "custom",  
    loaderFile: "./image-loader.ts",  
    },  
   };

   module.exports \= nextConfig;

## **Partie 5 : Sécurité, Déploiement et Opérations (Edge & CI/CD)**

### **5.1. Authentification (Admin V1 : Cloudflare Access)**

L'utilisation de Cloudflare Access pour sécuriser le panneau d'administration (/admin) est une excellente pratique "Zero Trust". Elle externalise l'authentification de l'administrateur au niveau du réseau, avant même que la requête n'atteigne l'application Next.js.  
Le flux est le suivant :

1. Cloudflare Access protège le chemin /admin et gère l'authentification (par exemple, via un fournisseur OIDC comme Google).
2. Une fois authentifiée, Cloudflare transmet la requête au Worker Next.js, en ajoutant un en-tête JWT : Cf-Access-Jwt-Assertion.43
3. Le middleware Next.js de l'application _doit_ ensuite valider ce JWT pour confirmer l'identité de l'utilisateur.

Voici un exemple d'implémentation de cette validation dans un middleware Next.js en utilisant la bibliothèque jose 43 :

TypeScript

// src/middleware.ts  
import { NextResponse } from 'next/server';  
import type { NextRequest } from 'next/server';  
import { createRemoteJWKSet, jwtVerify } from 'jose';

// L'audience (AUD tag) de votre application Access  
const AUD \= process.env.CLOUDFLARE_ACCESS_AUD;  
// Le domaine de votre équipe Cloudflare Access  
const TEAM_DOMAIN \= process.env.CLOUDFLARE_ACCESS_TEAM_DOMAIN;  
const JWKS_URL \= new URL(\`${TEAM_DOMAIN}/cdn-cgi/access/certs\`);

export async function middleware(request: NextRequest) {  
 if (request.nextUrl.pathname.startsWith('/admin')) {  
 const token \= request.headers.get('cf-access-jwt-assertion');

    if (\!token) {
      return new Response('Missing CF Access JWT', { status: 403 });
    }

    try {
      const JWKS \= createRemoteJWKSet(JWKS\_URL);
      await jwtVerify(token, JWKS, {
        issuer: TEAM\_DOMAIN,
        audience: AUD,
      });
      // Le token est valide, continuer vers le panneau d'admin
      return NextResponse.next();
    } catch (error) {
      return new Response('Invalid CF Access JWT', { status: 403 });
    }

}

return NextResponse.next();  
}

### **5.2. Authentification (Utilisateurs Post-V1 : Better Auth)**

Pour l'authentification des utilisateurs (commentaires, profils), le choix de Better Auth est stratégique et validé.47 Sa force réside dans son écosystème, en particulier l'adaptateur better-auth-cloudflare.49  
Cet adaptateur est conçu spécifiquement pour la stack Cloudflare :

- Il s'intègre nativement avec **Drizzle ORM** et **Cloudflare D1** pour stocker les utilisateurs, les sessions et les comptes.49
- Il peut utiliser **Cloudflare KV** pour le stockage secondaire, notamment pour la limitation de débit (rate limiting).49

Cette solution est plus légère et mieux intégrée à l'infrastructure D1/Drizzle que d'autres alternatives comme Lucia 52 ou des services tiers complets comme Clerk.53

### **5.3. Déploiement CI/CD (GitHub Actions et Wrangler)**

Le workflow de déploiement en deux étapes (d'abord la migration, puis le déploiement de l'application) est une pratique critique pour garantir l'intégrité des données et éviter les temps d'arrêt. L'implémentation via GitHub Actions et Wrangler est correcte.  
Un exemple de workflow deploy.yml ressemblerait à ceci 54 :

YAML

\#.github/workflows/deploy.yml  
name: Deploy to Cloudflare  
on:  
 push:  
 branches:  
 \- main

jobs:  
 deploy:  
 runs-on: ubuntu-latest  
 steps:  
 \- name: Checkout  
 uses: actions/checkout@v4

      \- name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      \- name: Install Dependencies
        run: npm install

      \- name: Run Tests
        run: npm test \# Exécute Vitest et Playwright

      \- name: Apply D1 Migrations
        run: npx wrangler d1 migrations apply DB \--remote
        env:
          CLOUDFLARE\_API\_TOKEN: ${{ secrets.CLOUDFLARE\_API\_TOKEN }}
          CLOUDFLARE\_ACCOUNT\_ID: ${{ secrets.CLOUDFLARE\_ACCOUNT\_ID }}

      \- name: Deploy Worker
        run: npx wrangler deploy
        env:
          CLOUDFLARE\_API\_TOKEN: ${{ secrets.CLOUDFLARE\_API\_TOKEN }}
          CLOUDFLARE\_ACCOUNT\_ID: ${{ secrets.CLOUDFLARE\_ACCOUNT\_ID }}

### **5.4. Tests E2E (Playwright) et Stratégie de Seeding**

L'utilisation de Playwright pour les tests E2E est validée.57 La principale difficulté des tests E2E est la gestion de l'état de la base de données.  
Pour les tests locaux ou en CI, la base de données D1 (locale) doit être réinitialisée et "seedée" (remplie de données de test) avant l'exécution de la suite Playwright. La méthode la plus simple consiste à utiliser Wrangler 59 :

1. Créer un fichier seed.sql contenant les instructions DROP TABLE..., CREATE TABLE... et INSERT INTO... nécessaires.
2. Dans le script de test (par exemple, dans package.json), exécutez la commande de seeding avant de lancer Playwright :

JSON

// package.json  
"scripts": {  
 "test:e2e": "npm run db:seed:local && playwright test",  
 "db:seed:local": "npx wrangler d1 execute DB \--local \--file=./prisma/seed.sql"  
}

Cette approche garantit un état de base de données propre et cohérent pour chaque exécution de test.60

### **5.5. Développement Local (Résolution de la Friction next dev vs wrangler dev)**

Historiquement, le développement local sur Cloudflare était difficile. next dev offrait le HMR (Hot Module Replacement) mais n'avait pas accès aux "bindings" (D1, R2). wrangler dev avait accès aux "bindings" (via Miniflare) mais ne supportait pas le HMR de Next.js.  
En 2025, ce problème est résolu. La commande de développement local recommandée combine les deux 14 :  
npx wrangler dev \-- npx next dev  
Ce processus fonctionne comme suit :

1. wrangler dev démarre en premier.
2. Il lit le wrangler.toml et initialise une version locale de tous les "bindings" (D1, R2, KV, etc.) en utilisant le simulateur Miniflare.
3. Il lance ensuite npx next dev en tant que sous-processus, en injectant ces "bindings" locaux en tant que variables d'environnement.
4. L'application Next.js démarre, bénéficie du HMR, et peut accéder à process.env.DB (pour D1) comme si elle était en production.

Cette avancée est fondamentale pour la productivité d'un développeur solo.

### **5.6. Observabilité et Cache Avancé (L'architecture OpenNext)**

Observabilité (Logs) :  
Pour activer les logs consultables dans le tableau de bord Cloudflare, le fichier wrangler.toml doit être mis à jour 62 :

Ini, TOML

\[observability\]  
enabled \= true  
head_sampling_rate \= 1.0 \# Log 100% des requêtes

La meilleure pratique pour le logging est d'utiliser des **logs JSON structurés**. Au lieu de console.log("Erreur de connexion"), il faut utiliser console.log({ level: "error", context: "user_login", error: "Invalid password" }). Cloudflare ingère ces objets JSON en tant que champs filtrables, ce qui rend le débogage infiniment plus puissant.62  
Architecture de Cache OpenNext :  
L'utilisation de "KV" et "Durable Objects" pour le cache est correcte, mais la réalité est plus complexe. OpenNext doit recréer l'ensemble du système de cache de Next.js (Data Cache, ISR, revalidateTag) en utilisant les primitives Cloudflare.34  
Cela nécessite une configuration d'infrastructure explicite dans wrangler.toml :

1. **Cache Incrémental (Pages SSG/ISR) :** Les pages générées sont stockées dans **Cloudflare R2**.
   - Binding requis : \[\[r2_buckets\]\] binding \= "NEXT_INC_CACHE_R2_BUCKET"
2. **File d'attente de Révalidation (ISR) :** Pour gérer le revalidate: 60 (secondes), OpenNext utilise un **Durable Object** (DOQueueHandler) pour dédupliquer et planifier les révalidations.
   - Binding requis : \[durable_objects\] bindings \=
3. **Cache de Tags (revalidateTag) :** Pour que revalidateTag('posts') fonctionne, OpenNext a besoin de mapper les tags aux chemins de cache. Il utilise **Cloudflare D1** pour cela.
   - Binding requis : \[\[d1_databases\]\] binding \= "NEXT_TAG_CACHE_D1"

Un binding de service (WORKER_SELF_REFERENCE) est également nécessaire pour que ces composants communiquent entre eux.34 L'absence de ces bindings dans wrangler.toml entraînera l'échec silencieux des fonctionnalités de cache avancées de Next.js.

## **Partie 6 : Examen Final et Validation des 11 Principes Architecturaux Clés**

Une vérification finale des 11 principes architecturaux énoncés dans le document confirme leur exactitude et leur pertinence.

1. **Configuration Wrangler (Source de vérité) :** **VALIDÉ.** C'est la pratique standard de l'IaC (Infrastructure as Code) pour Cloudflare.63
2. **nodejs_compat Flag :** **VALIDÉ.** Prérequis obligatoire pour Next.js sur Workers.16
3. **Environment Bindings :** **VALIDÉ.** Méthode standard et sécurisée pour accéder aux ressources (D1, R2, etc.).64
4. **Chaîne de Validation (Drizzle $\\rightarrow$ Zod $\\rightarrow$ RHF) :** **VALIDÉ.** "Best practice" 2025 pour une DApp "type-safe".35
5. **Stockage R2 (URLs Pré-signées) :** **VALIDÉ.** Contournement standard et sécurisé des limites de taille des Workers.31
6. **Authentification (Cloudflare Access) :** **VALIDÉ.** Pattern Zero Trust exemplaire. Le code d'implémentation de la validation du JWT est fourni dans ce rapport.43
7. **i18n (next-intl) :** **VALIDÉ.** Solution de référence pour l'App Router.39
8. **Tests (Haute-Fidélité) :** **VALIDÉ.** Combinaison correcte de Vitest/Testing-Library et Playwright.57 La stratégie de seeding/reset D1 est fournie dans ce rapport.59
9. **Déploiement (Deux Étapes) :** **VALIDÉ.** Workflow CI/CD critique pour l'intégrité des données (Migrer la DB $\\rightarrow$ Déployer l'App).54
10. **Server Components First :** **VALIDÉ.** Principe de base de l'App Router.
11. **Edge-First Architecture :** **VALIDÉ.** La conception est correcte. La friction de développement local, un obstacle historique, est désormais résolue.14

## **Partie 7 : Conclusion et Recommandations Finales**

Le document de concept sebc.dev est d'une qualité technique exceptionnelle. L'architecture proposée est non seulement viable, mais elle représente une implémentation de référence de la stack Next.js 15 sur l'écosystème Cloudflare en novembre 2025\.  
La pile technologique est cohérente, moderne, et tire pleinement parti des avantages d'une infrastructure "edge-native" sans compromettre l'expérience de développement.  
La seule action corrective majeure recommandée est la **substitution de Resend par le service Cloudflare Email Sending** pour les fonctionnalités de newsletter (Post-V1). Ce changement éliminera un point de friction technique prévisible lié à la compatibilité du runtime et alignera l'ensemble de la stack sur des solutions natives de Cloudflare.  
Ce rapport a fourni les validations, les clarifications et les extraits de code d'implémentation critiques (validation JWT, loader d'images, configuration du cache OpenNext) nécessaires pour compléter le document de concept. Le projet peut avancer avec un très haut niveau de confiance dans ses fondations techniques.

#### **Sources des citations**

1. Workers llms-full.txt \- Cloudflare Docs, consulté le novembre 5, 2025, [https://developers.cloudflare.com:2053/workers/llms-full.txt](https://developers.cloudflare.com:2053/workers/llms-full.txt)
2. Workers Changelog \- Cloudflare Docs, consulté le novembre 5, 2025, [https://developers.cloudflare.com/workers/platform/changelog/](https://developers.cloudflare.com/workers/platform/changelog/)
3. Nodemailer doesn't work on Cloudflare Workers because it uses Built-in node modules without node: prefix \#1621 \- GitHub, consulté le novembre 5, 2025, [https://github.com/nodemailer/nodemailer/issues/1621](https://github.com/nodemailer/nodemailer/issues/1621)
4. Error: A Node.js API is used (MessageChannel) which is not supported in the Edge Runtime. · Issue \#1630 · resend/react-email \- GitHub, consulté le novembre 5, 2025, [https://github.com/resend/react-email/issues/1630](https://github.com/resend/react-email/issues/1630)
5. \[cloudflare-workers\] Resend integration build error with @react-email/render \#4367 \- GitHub, consulté le novembre 5, 2025, [https://github.com/honojs/hono/issues/4367](https://github.com/honojs/hono/issues/4367)
6. 15 years of helping build a better Internet: a look back at Birthday Week 2025, consulté le novembre 5, 2025, [https://blog.cloudflare.com/birthday-week-2025-wrap-up/](https://blog.cloudflare.com/birthday-week-2025-wrap-up/)
7. Announcing Cloudflare Email Service's private beta, consulté le novembre 5, 2025, [https://blog.cloudflare.com/email-service/](https://blog.cloudflare.com/email-service/)
8. Cloudflare Email Service, consulté le novembre 5, 2025, [https://blog.cloudflare.com/tag/cloudflare-email-services/](https://blog.cloudflare.com/tag/cloudflare-email-services/)
9. Cloudflare Workers krijgen optie om geautomatiseerde e-mails te versturen \- Tweakers, consulté le novembre 5, 2025, [https://tweakers.net/nieuws/239642/cloudflare-workers-krijgen-optie-om-geautomatiseerde-e-mails-te-versturen.html](https://tweakers.net/nieuws/239642/cloudflare-workers-krijgen-optie-om-geautomatiseerde-e-mails-te-versturen.html)
10. Cloudflare adds Email Sending \- Spam Resource, consulté le novembre 5, 2025, [https://www.spamresource.com/2025/09/cloudflare-adds-email-sending.html](https://www.spamresource.com/2025/09/cloudflare-adds-email-sending.html)
11. Cloudflare Launches Cloudflare Email Service Private Beta \- MLQ.ai | Stocks, consulté le novembre 5, 2025, [https://mlq.ai/news/cloudflare-launches-cloudflare-email-service-private-beta/](https://mlq.ai/news/cloudflare-launches-cloudflare-email-service-private-beta/)
12. D1 \- The Cloudflare Blog, consulté le novembre 5, 2025, [https://blog.cloudflare.com/tag/d1/](https://blog.cloudflare.com/tag/d1/)
13. Sequential consistency without borders: how D1 implements global read replication, consulté le novembre 5, 2025, [https://blog.cloudflare.com/d1-read-replication-beta/](https://blog.cloudflare.com/d1-read-replication-beta/)
14. Full Stack | Noise, consulté le novembre 5, 2025, [https://noise.getoto.net/tag/full-stack/](https://noise.getoto.net/tag/full-stack/)
15. cloudflare/next-on-pages: CLI to build and develop Next.js apps for Cloudflare Pages, consulté le novembre 5, 2025, [https://github.com/cloudflare/next-on-pages](https://github.com/cloudflare/next-on-pages)
16. Next.js · Cloudflare Workers docs, consulté le novembre 5, 2025, [https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
17. Deploy your Next.js app to Cloudflare Workers with the Cloudflare adapter for OpenNext, consulté le novembre 5, 2025, [https://blog.cloudflare.com/deploying-nextjs-apps-to-cloudflare-workers-with-the-opennext-adapter/](https://blog.cloudflare.com/deploying-nextjs-apps-to-cloudflare-workers-with-the-opennext-adapter/)
18. Is deploying Next.js on Cloudflare Workers production-ready? : r/nextjs \- Reddit, consulté le novembre 5, 2025, [https://www.reddit.com/r/nextjs/comments/1llty98/is_deploying_nextjs_on_cloudflare_workers/](https://www.reddit.com/r/nextjs/comments/1llty98/is_deploying_nextjs_on_cloudflare_workers/)
19. Deploying Next.js App to Cloudflare Workers with OpenNext \- DEV Community, consulté le novembre 5, 2025, [https://dev.to/prajwolshrestha/deploying-nextjs-app-to-cloudflare-workers-with-opennext-hi0](https://dev.to/prajwolshrestha/deploying-nextjs-app-to-cloudflare-workers-with-opennext-hi0)
20. fs · Cloudflare Workers docs, consulté le novembre 5, 2025, [https://developers.cloudflare.com/workers/runtime-apis/nodejs/fs/](https://developers.cloudflare.com/workers/runtime-apis/nodejs/fs/)
21. Node.js compatibility \- Workers \- Cloudflare Docs, consulté le novembre 5, 2025, [https://developers.cloudflare.com/workers/runtime-apis/nodejs/](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)
22. http · Cloudflare Workers docs, consulté le novembre 5, 2025, [https://developers.cloudflare.com/workers/runtime-apis/nodejs/http/](https://developers.cloudflare.com/workers/runtime-apis/nodejs/http/)
23. Developer Week 2025 wrap-up \- The Cloudflare Blog, consulté le novembre 5, 2025, [https://blog.cloudflare.com/developer-week-2025-wrap-up/](https://blog.cloudflare.com/developer-week-2025-wrap-up/)
24. Overview · Cloudflare D1 docs, consulté le novembre 5, 2025, [https://developers.cloudflare.com/d1/](https://developers.cloudflare.com/d1/)
25. Time Travel and backups · Cloudflare D1 docs, consulté le novembre 5, 2025, [https://developers.cloudflare.com/d1/reference/time-travel/](https://developers.cloudflare.com/d1/reference/time-travel/)
26. D1: open beta is here \- The Cloudflare Blog, consulté le novembre 5, 2025, [https://blog.cloudflare.com/d1-open-beta-is-here/](https://blog.cloudflare.com/d1-open-beta-is-here/)
27. Backups (Legacy) \- D1 \- Cloudflare Docs, consulté le novembre 5, 2025, [https://developers.cloudflare.com/d1/reference/backups/](https://developers.cloudflare.com/d1/reference/backups/)
28. How to use Better Auth with Cloudflare D1? \- Answer Overflow, consulté le novembre 5, 2025, [https://www.answeroverflow.com/m/1416707955423711363](https://www.answeroverflow.com/m/1416707955423711363)
29. Cloudflare Workers, SvelteKit, Drizzle, and D1: Up and Running. \- Jilles Soeters, consulté le novembre 5, 2025, [https://jilles.me/cloudflare-workers-sveltekit-drizzle-and-d1-up-and-running/](https://jilles.me/cloudflare-workers-sveltekit-drizzle-and-d1-up-and-running/)
30. Limits \- D1 \- Cloudflare Docs, consulté le novembre 5, 2025, [https://developers.cloudflare.com/d1/platform/limits/](https://developers.cloudflare.com/d1/platform/limits/)
31. Presigned URLs · Cloudflare R2 docs, consulté le novembre 5, 2025, [https://developers.cloudflare.com/r2/api/s3/presigned-urls/](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
32. How to Upload Files to Cloudflare R2 in a Next.js App | Build with ..., consulté le novembre 5, 2025, [https://www.buildwithmatija.com/blog/how-to-upload-files-to-cloudflare-r2-nextjs](https://www.buildwithmatija.com/blog/how-to-upload-files-to-cloudflare-r2-nextjs)
33. The Ultimate Guide to File Uploads in Next.js (S3, Presigned URLs, Dropzone) \- YouTube, consulté le novembre 5, 2025, [https://www.youtube.com/watch?v=83bECYmPbI4](https://www.youtube.com/watch?v=83bECYmPbI4)
34. Caching \- OpenNext, consulté le novembre 5, 2025, [https://opennext.js.org/cloudflare/caching](https://opennext.js.org/cloudflare/caching)
35. How to create forms with Server Actions \- Next.js, consulté le novembre 5, 2025, [https://nextjs.org/docs/app/guides/forms](https://nextjs.org/docs/app/guides/forms)
36. Master Forms in Next.js: The Ultimate Guide with React Hook Form \+ Zod \+ Shadcn \[2025\], consulté le novembre 5, 2025, [https://www.youtube.com/watch?v=uuGQo1Hl7zM](https://www.youtube.com/watch?v=uuGQo1Hl7zM)
37. Is React-Hook-Form still relevant with React 19 and Server actions? : r/nextjs \- Reddit, consulté le novembre 5, 2025, [https://www.reddit.com/r/nextjs/comments/1hnc0uz/is_reacthookform_still_relevant_with_react_19_and/](https://www.reddit.com/r/nextjs/comments/1hnc0uz/is_reacthookform_still_relevant_with_react_19_and/)
38. How to use react-hook-form with useActionState Hook in Nextjs15 \- DEV Community, consulté le novembre 5, 2025, [https://dev.to/emmanuel_xs/how-to-use-react-hook-form-with-useactionstate-hook-in-nextjs15-1hja](https://dev.to/emmanuel_xs/how-to-use-react-hook-form-with-useactionstate-hook-in-nextjs15-1hja)
39. amannn/next-intl: Internationalization (i18n) for Next.js \- GitHub, consulté le novembre 5, 2025, [https://github.com/amannn/next-intl](https://github.com/amannn/next-intl)
40. Internationalization with Next.js 15? : r/nextjs \- Reddit, consulté le novembre 5, 2025, [https://www.reddit.com/r/nextjs/comments/1jv3t1y/internationalization_with_nextjs_15/](https://www.reddit.com/r/nextjs/comments/1jv3t1y/internationalization_with_nextjs_15/)
41. Image \- OpenNext, consulté le novembre 5, 2025, [https://opennext.js.org/cloudflare/howtos/image](https://opennext.js.org/cloudflare/howtos/image)
42. Integrate with frameworks · Cloudflare Images docs, consulté le novembre 5, 2025, [https://developers.cloudflare.com/images/transform-images/integrate-with-frameworks/](https://developers.cloudflare.com/images/transform-images/integrate-with-frameworks/)
43. Validate JWTs · Cloudflare One docs, consulté le novembre 5, 2025, [https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)
44. Using Google SSO and Cloudflare Tunnel to give access to web app : r/selfhosted \- Reddit, consulté le novembre 5, 2025, [https://www.reddit.com/r/selfhosted/comments/16x82wl/using_google_sso_and_cloudflare_tunnel_to_give/](https://www.reddit.com/r/selfhosted/comments/16x82wl/using_google_sso_and_cloudflare_tunnel_to_give/)
45. Cloudflare Images \- Noise, consulté le novembre 5, 2025, [https://noise.getoto.net/tag/cloudflare-images/](https://noise.getoto.net/tag/cloudflare-images/)
46. Building a full stack application with Cloudflare Pages, consulté le novembre 5, 2025, [https://blog.cloudflare.com/building-full-stack-with-pages/](https://blog.cloudflare.com/building-full-stack-with-pages/)
47. Better Auth, consulté le novembre 5, 2025, [https://www.better-auth.com/](https://www.better-auth.com/)
48. paulosuzart/awesome: My own awesome project list based on starred projects \- GitHub, consulté le novembre 5, 2025, [https://github.com/paulosuzart/awesome](https://github.com/paulosuzart/awesome)
49. zpg6/better-auth-cloudflare: Seamlessly integrate better ... \- GitHub, consulté le novembre 5, 2025, [https://github.com/zpg6/better-auth-cloudflare](https://github.com/zpg6/better-auth-cloudflare)
50. Request: Add Cloudflare D1 Adapter Driver · Issue \#147 · better-auth/better-auth \- GitHub, consulté le novembre 5, 2025, [https://github.com/better-auth/better-auth/issues/147](https://github.com/better-auth/better-auth/issues/147)
51. Sveltekit better auth using Cloudflare D1 and drizzle | by David \- Medium, consulté le novembre 5, 2025, [https://medium.com/@dasfacc/sveltekit-better-auth-using-cloudflare-d1-and-drizzle-91d9d9a6d0b4](https://medium.com/@dasfacc/sveltekit-better-auth-using-cloudflare-d1-and-drizzle-91d9d9a6d0b4)
52. fleeting-notes \- chiubaca.com, consulté le novembre 5, 2025, [https://chiubaca.com/fleeting-notes/](https://chiubaca.com/fleeting-notes/)
53. Lucia Auth vs. Clerk \- Rank Anything, consulté le novembre 5, 2025, [https://www.rankanything.online/compare/clerk-vs-lucia-auth/XOEhnru9aV-rdBcQ0xHnG](https://www.rankanything.online/compare/clerk-vs-lucia-auth/XOEhnru9aV-rdBcQ0xHnG)
54. cloudflare/chanfana-openapi-template-11 \- GitHub, consulté le novembre 5, 2025, [https://github.com/cloudflare/chanfana-openapi-template-11](https://github.com/cloudflare/chanfana-openapi-template-11)
55. Using Cloudflare Durable Objects with SQL Storage, D1, and Drizzle ORM, consulté le novembre 5, 2025, [https://flashblaze.xyz/posts/using-durable-objects-sql-storage-d1-and-drizzle](https://flashblaze.xyz/posts/using-durable-objects-sql-storage-d1-and-drizzle)
56. BUG: D1 migration doesn't work on Github Actions · Issue \#3598 · cloudflare/workers-sdk, consulté le novembre 5, 2025, [https://github.com/cloudflare/workers-sdk/issues/3598](https://github.com/cloudflare/workers-sdk/issues/3598)
57. Installation \- SonicJS \- SonicJS Documentation, consulté le novembre 5, 2025, [https://sonicjs.com/installation](https://sonicjs.com/installation)
58. SonicJS AI \- Comprehensive Features & Roadmap, consulté le novembre 5, 2025, [https://sonicjs.com/roadmap](https://sonicjs.com/roadmap)
59. Wrangler commands \- D1 \- Cloudflare Docs, consulté le novembre 5, 2025, [https://developers.cloudflare.com/d1/wrangler-commands/](https://developers.cloudflare.com/d1/wrangler-commands/)
60. D1 SQLite: Schema, migrations and seeds \- This Dot Labs, consulté le novembre 5, 2025, [https://www.thisdot.co/blog/d1-sqlite-schema-migrations-and-seeds](https://www.thisdot.co/blog/d1-sqlite-schema-migrations-and-seeds)
61. E2E Testing Basics with Playwright \- This Dot Labs, consulté le novembre 5, 2025, [https://www.thisdot.co/blog/e2e-testing-basics-with-playwright](https://www.thisdot.co/blog/e2e-testing-basics-with-playwright)
62. Workers Logs · Cloudflare Workers docs, consulté le novembre 5, 2025, [https://developers.cloudflare.com/workers/observability/logs/workers-logs/](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)
63. Configuration \- Wrangler · Cloudflare Workers docs, consulté le novembre 5, 2025, [https://developers.cloudflare.com/workers/wrangler/configuration/](https://developers.cloudflare.com/workers/wrangler/configuration/)
64. Setting up D1 Database with Drizzle in a Hono Cloudflare Worker App \- Firdausng, consulté le novembre 5, 2025, [https://www.firdausng.com/posts/setup-d1-cloudflare-worker-with-drizzle](https://www.firdausng.com/posts/setup-d1-cloudflare-worker-with-drizzle)
