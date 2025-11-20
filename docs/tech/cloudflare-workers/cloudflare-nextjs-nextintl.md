

# **Rapport Technique : Architecture, Implémentation et Optimisation de l'Internationalisation sur Next.js 15 et Cloudflare Workers via OpenNext**

## **Résumé Exécutif**

Ce document constitue un rapport technique exhaustif détaillant la méthodologie, l'architecture et les meilleures pratiques pour le déploiement d'applications Next.js 15 internationalisées sur l'infrastructure Serverless de Cloudflare Workers. En date de novembre 2025, le paradigme de déploiement a évolué de manière significative avec la maturation de l'adaptateur **OpenNext**, qui s'impose désormais comme le standard industriel pour exécuter des charges de travail Next.js complexes à la périphérie (Edge).1  
L'objectif de cette analyse est de fournir une feuille de route technique complète pour implémenter une solution d'internationalisation (i18n) robuste utilisant la bibliothèque next-intl. Cette solution doit répondre aux exigences modernes de performance, de référencement naturel (SEO) via un routage segmenté (/fr, /en), et de maintenabilité grâce à une séparation stricte des préoccupations entre le serveur et le client. Nous aborderons en profondeur les défis spécifiques posés par l'environnement Cloudflare Workers, notamment la gestion des temps de démarrage à froid ("cold starts"), les limitations de taille de bundle, et la complexité inhérente au chaînage de middlewares dans un contexte Edge.  
Une attention particulière sera portée à la stratégie de test, un pilier souvent négligé mais critique pour la stabilité des applications multilingues. Nous détaillerons des protocoles de tests unitaires avancés pour les React Server Components (RSC) via Vitest, ainsi que des stratégies de tests de bout en bout (E2E) utilisant Playwright pour valider la cohérence du routage et de la détection de locale.  
---

## **1\. Fondations Architecturales : Next.js 15 à l'Ère du "Edge Computing"**

Pour comprendre les décisions d'implémentation qui suivront, il est impératif d'analyser l'évolution de l'écosystème Next.js et son interaction avec les environnements d'exécution non-Node.js comme Cloudflare Workers.

### **1.1. L'Évolution du Runtime : Du "Edge Strict" à la Compatibilité Node.js**

Historiquement, le déploiement d'applications Next.js sur Cloudflare Workers via l'adaptateur @cloudflare/next-on-pages imposait l'utilisation stricte du "Edge Runtime". Ce sous-ensemble limité des API Web standards offrait des performances exceptionnelles mais créait une friction considérable pour les développeurs, car de nombreuses bibliothèques populaires (notamment celles liées à l'authentification, à la base de données ou à l'internationalisation avancée) dépendaient d'API Node.js spécifiques (comme fs, crypto, ou AsyncLocalStorage) qui n'étaient pas disponibles ou incomplètes.1  
En novembre 2025, la recommandation architecturale a basculé vers l'utilisation de l'adaptateur **OpenNext** combiné au flag de compatibilité nodejs\_compat de Cloudflare. Cette configuration hybride permet d'exécuter le code Next.js dans un environnement qui simule les capacités de Node.js tout en bénéficiant de la distribution mondiale du réseau Cloudflare. Cela signifie que les développeurs ne sont plus contraints d'exporter export const runtime \= 'edge' dans chaque route, mais peuvent laisser OpenNext transformer le build pour qu'il soit compatible avec les Workers.1  
Cette transition a des implications directes pour l'internationalisation. Auparavant, l'utilisation de polyfills lourds pour l'API Intl était souvent nécessaire pour garantir un formatage correct des dates et des nombres sur tous les points de présence du réseau. Avec la compatibilité Node.js améliorée, next-intl peut s'appuyer sur les implémentations natives plus robustes disponibles dans le runtime Workers moderne, réduisant ainsi la complexité de configuration et la taille des bundles.6

### **1.2. Le Rôle Stratégique d'OpenNext**

OpenNext agit comme une couche de traduction sophistiquée entre le build artifact de Next.js et l'infrastructure serverless cible. Contrairement à l'approche précédente qui tentait de faire entrer Next.js "au chausse-pied" dans les Workers, OpenNext décompose l'application en primitives serverless optimisées.  
Le tableau suivant illustre les différences fondamentales entre les approches historiques et l'architecture OpenNext recommandée pour 2025 :

| Caractéristique | @cloudflare/next-on-pages (Obsolète/Legacy) | OpenNext (Recommandé 2025\) |
| :---- | :---- | :---- |
| **Compatibilité Runtime** | Edge Runtime Strict (Web APIs uniquement) | Support étendu de Node.js via nodejs\_compat |
| **Support ISR** | Limité ou inexistant | Support complet via KV/R2 et Queues |
| **Middleware** | Exécuté nativement, difficile à chaîner | Transformé et intégré dans la couche de routage |
| **Server Actions** | Support expérimental | Support stable et optimisé |
| **Cache** | Cache API basique | Stratégies configurables (Tagging, Purge, R2) |
| **Taille de Bundle** | Critique, risque de dépassement rapide | Optimisé via le splitting et l'externalisation |

L'adoption d'OpenNext est particulièrement pertinente pour les applications multilingues, car elle permet de gérer efficacement le cache ISR (Incremental Static Regeneration). Dans un site i18n, le nombre de pages statiques est multiplié par le nombre de langues supportées. OpenNext permet de stocker ces pages générées dans Cloudflare R2 (stockage objet) ou KV (Key-Value store), et de les servir instantanément à l'utilisateur, tout en gérant leur régénération en arrière-plan sans impacter la latence perçue.2  
---

## **2\. Configuration de l'Infrastructure Cloudflare et OpenNext**

La mise en place de l'infrastructure ne se limite pas à l'installation de paquets ; elle nécessite une orchestration précise des services Cloudflare pour supporter les exigences de stockage et de mise en cache d'une application internationale.

### **2.1. Initialisation du Projet et Dépendances**

Pour démarrer un projet en 2025, l'utilisation du CLI create-cloudflare (C3) est la méthode privilégiée, car elle configure automatiquement les bindings nécessaires pour OpenNext.

Bash

npm create cloudflare@latest \-- my-i18n-app \--framework=next \--experimental-opennext

Cette commande génère un squelette d'application Next.js pré-configuré. Cependant, pour une application i18n avancée, nous devons ajuster la configuration open-next.config.ts pour optimiser le cache. La gestion du cache est vitale : sans elle, chaque requête vers une page /fr ou /en déclencherait un rendu serveur (SSR) coûteux en temps CPU et en latence.

### **2.2. Configuration Avancée du Cache (open-next.config.ts)**

Le fichier open-next.config.ts est le centre de contrôle du déploiement. Pour une application i18n, nous recommandons une stratégie de cache hybride utilisant Cloudflare R2 pour le stockage persistant des pages et KV pour les métadonnées de tagging, ce qui permet une invalidation fine du cache (par exemple, invalider uniquement les pages françaises lors d'une mise à jour du contenu français).

TypeScript

// open-next.config.ts  
import { defineCloudflareConfig } from "@opennextjs/cloudflare";  
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";  
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";  
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";  
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

/\*  
 \* Configuration Optimale pour i18n (Novembre 2025\)  
 \*   
 \* 1\. incrementalCache: Utilise R2 pour stocker les pages HTML/JSON générées.  
 \*    L'enveloppe \`withRegionalCache\` est cruciale pour la performance : elle  
 \*    permet de cacher les assets R2 dans le cache local du Tier 1 de Cloudflare,  
 \*    réduisant la latence inter-régionale.  
 \*   
 \* 2\. tagCache: Utilise D1 (SQL sur Edge) pour gérer les tags de cache Next.js.  
 \*    Cela permet d'invalider des groupes de pages (ex: toutes les pages "blog" en "fr")  
 \*    de manière atomique et cohérente globalement.  
 \*   
 \* 3\. queue: Utilise les Durable Objects (doQueue) pour gérer la file d'attente  
 \*    de régénération ISR, garantissant que nous ne régénérons pas la même page  
 \*    plusieurs fois simultanément (deduplication).  
 \*/

export default defineCloudflareConfig({  
  incrementalCache: withRegionalCache(r2IncrementalCache, {  
    mode: "long-lived",  
    bypassTagCacheOnCacheHit: true,  
  }),  
  tagCache: d1NextTagCache,  
  queue: doQueue,  
});

Cette configuration 7 est supérieure à l'utilisation simple de KV car R2 est moins cher pour le stockage de gros volumes de HTML généré, et D1 offre une meilleure cohérence pour les opérations de purge de cache basées sur les tags (revalidateTag), une fonctionnalité essentielle pour les CMS headless multilingues.

### **2.3. Configuration de wrangler.toml**

Le fichier wrangler.toml doit déclarer les ressources utilisées par OpenNext. Il est impératif de configurer le flag nodejs\_compat et une date de compatibilité récente pour bénéficier des dernières optimisations du runtime.

Ini, TOML

name \= "my-i18n-app"  
main \= ".open-next/worker.js"  
compatibility\_date \= "2025-11-01"  
compatibility\_flags \= \["nodejs\_compat"\]

\# Bindings pour le cache OpenNext  
\[\[kv\_namespaces\]\]  
binding \= "NEXT\_CACHE\_WORKERS\_KV"  
id \= "\<KV\_ID\>"

\[\[r2\_buckets\]\]  
binding \= "NEXT\_CACHE\_R2"  
bucket\_name \= "my-app-cache"

\[\[d1\_databases\]\]  
binding \= "NEXT\_CACHE\_D1"  
database\_name \= "next-cache"  
database\_id \= "\<D1\_ID\>"

L'activation explicite de nodejs\_compat est non négociable pour assurer le bon fonctionnement de next-intl et d'autres dépendances Node.js dans le pipeline de rendu.1  
---

## **3\. Architecture d'Internationalisation avec next-intl**

L'architecture de next-intl en version 3.x et ultérieure (standard en 2025\) repose sur une philosophie "Server-First", qui s'aligne parfaitement avec le modèle des React Server Components (RSC) de Next.js 15\. L'objectif est de charger les traductions sur le serveur, de rendre le HTML complet, et de n'envoyer au client que le strict minimum de JavaScript nécessaire à l'interactivité.

### **3.1. Structure des Fichiers et Organisation du Projet**

L'organisation des fichiers doit refléter la séparation entre la configuration globale, la logique de routage, et les données de traduction. Nous recommandons la structure suivante pour une maintenabilité maximale :

/  
├── messages/               \# Fichiers de traduction JSON  
│   ├── en.json  
│   └── fr.json  
├── src/  
│   ├── app/  
│   │   ├── \[locale\]/       \# Segment dynamique pour la langue  
│   │   │   ├── layout.tsx  \# Layout racine localisé  
│   │   │   ├── page.tsx    \# Page d'accueil  
│   │   │   └── not-found.tsx  
│   │   └── api/            \# Routes API (Route Handlers)  
│   ├── i18n/  
│   │   ├── request.ts      \# Configuration par requête (Server-only)  
│   │   └── routing.ts      \# Définition centrale des routes et locales  
│   ├── middleware.ts       \# Orchestration des redirections et réécritures  
└── next.config.ts

Cette structure place les fichiers de traduction (messages/\*.json) à la racine pour faciliter leur gestion par des outils externes (SaaS de traduction, scripts de synchronisation) sans polluer le dossier src.

### **3.2. Définition Centralisée du Routage (src/i18n/routing.ts)**

Il est crucial de centraliser la définition des locales, du chemin par défaut et des stratégies de préfixe dans un seul fichier. Cela évite la duplication de code ("magic strings") entre le middleware, les composants de navigation et la configuration du serveur.

TypeScript

// src/i18n/routing.ts  
import { defineRouting } from 'next-intl/routing';  
import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const routing \= defineRouting({  
  // Liste exhaustive des locales supportées  
  locales: \['en', 'fr'\],  
    
  // Locale par défaut utilisée si aucune autre n'est détectée  
  defaultLocale: 'fr',  
    
  // Stratégie de préfixe URL : 'always' est recommandé pour le SEO.  
  // Cela force l'URL /fr même pour la langue par défaut, évitant  
  // la duplication de contenu entre / et /fr.  
  localePrefix: 'always',  
    
  // Désactiver la détection automatique si vous préférez une logique   
  // explicite ou personnalisée dans le middleware.  
  // localeDetection: false,   
});

// Exportation des utilitaires de navigation typés  
// Ces composants remplaceront les Link et useRouter natifs de Next.js  
export const { Link, redirect, usePathname, useRouter } \=  
  createSharedPathnamesNavigation(routing);

L'utilisation de createSharedPathnamesNavigation permet de générer des composants \<Link\> qui gèrent automatiquement le préfixe de locale actuel, simplifiant considérablement le code des composants UI.9

### **3.3. Configuration de la Requête (src/i18n/request.ts)**

Le fichier request.ts (anciennement i18n.ts) est exécuté côté serveur pour chaque requête nécessitant des traductions. C'est le point névralgique pour le chargement des données. Sur Cloudflare Workers, la performance de ce fichier est critique.

TypeScript

// src/i18n/request.ts  
import { getRequestConfig } from 'next-intl/server';  
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) \=\> {  
  // Dans Next.js 15, requestLocale est une Promesse qui doit être attendue.  
  // C'est un changement majeur par rapport aux versions précédentes.  
  let locale \= await requestLocale;

  // Validation de sécurité : Si la locale n'est pas valide (ou undefined),  
  // on se replie sur la locale par défaut.  
  if (\!locale ||\!routing.locales.includes(locale as any)) {  
    locale \= routing.defaultLocale;  
  }

  return {  
    locale,  
    // Chargement dynamique des messages.  
    // L'utilisation de \`import()\` permet à Webpack de créer des chunks séparés  
    // pour chaque langue. Ainsi, un utilisateur visitant la version FR ne téléchargera  
    // jamais le JSON EN, optimisant la mémoire du Worker et la bande passante.  
    messages: (await import(\`../../messages/${locale}.json\`)).default,  
      
    // Configuration optionnelle des fuseaux horaires  
    timeZone: 'Europe/Paris',  
      
    // Gestion des erreurs de clés manquantes  
    onError(error) {  
      console.error('Erreur i18n:', error);  
    },  
    getMessageFallback({ namespace, key, error }) {  
      const path \= \[namespace, key\].filter((part) \=\> part\!= null).join('.');  
      return \`${path} (missing)\`;  
    }  
  };  
});

Optimisation Critique pour Cloudflare Workers :  
Il est impératif d'utiliser l'importation dynamique import(...) plutôt que de charger tous les fichiers JSON au début du fichier. Cloudflare Workers impose une limite stricte sur la taille du script (généralement 1MB compressé pour le plan gratuit, plus pour le payant). Si vous importez statiquement tous les JSON de toutes les langues, ils seront inclus dans le bundle principal du Worker, risquant de faire dépasser cette limite et de ralentir le démarrage à froid (cold start). L'import dynamique permet à OpenNext de diviser le code et de ne charger que ce qui est nécessaire.11  
---

## **4\. Stratégie Middleware : Le Défi du Chaînage et de la Réécriture**

Le middleware est souvent la source de complexité la plus importante lors du déploiement sur Cloudflare, en particulier lorsqu'il faut combiner l'internationalisation avec d'autres responsabilités comme l'authentification (NextAuth, Clerk, Kinde) ou la sécurité.

### **4.1. Le Problème du "Middleware Hell"**

Next.js n'autorise l'exportation que d'un seul middleware par application via export default function middleware(...). Cependant, next-intl fournit son propre middleware pour gérer la détection de locale et les réécritures d'URL (/ \-\> /fr). Si vous utilisez également un middleware d'authentification, vous devez les "chaîner".  
Le problème réside dans le fait que le middleware de next-intl retourne une NextResponse qui peut être une redirection (307) ou une réécriture (200). Si un middleware d'authentification s'exécute *après* et tente de modifier cette réponse, ou si l'ordre est inversé, cela peut conduire à des boucles de redirection infinies ou à la perte des informations de locale.3 De plus, certains en-têtes internes comme x-middleware-next peuvent causer des comportements imprévus sur le runtime Cloudflare s'ils ne sont pas nettoyés.3

### **4.2. Solution : Le Pattern "Chain of Responsibility" Manuel**

Plutôt que de s'appuyer sur des bibliothèques de composition de middlewares qui ajoutent de la surcharge, la méthode recommandée pour 2025 est une implémentation manuelle et séquentielle qui garde un contrôle total sur le flux de la requête.  
Voici une implémentation robuste intégrant next-intl et une logique d'authentification simulée :

TypeScript

// src/middleware.ts  
import { NextRequest, NextResponse } from 'next/server';  
import createMiddleware from 'next-intl/middleware';  
import { routing } from './i18n/routing';

// 1\. Initialisation du middleware next-intl avec la configuration centralisée  
const intlMiddleware \= createMiddleware(routing);

export default async function middleware(request: NextRequest) {  
  const { pathname } \= request.nextUrl;

  // \--- PHASE 0 : EXCLUSIONS \---  
  // Il est vital d'exclure les fichiers statiques et les API internes dès le début.  
  // Cela économise des cycles CPU (et donc de l'argent) sur Cloudflare.  
  if (  
    pathname.startsWith('/\_next') ||  
    pathname.startsWith('/api') ||  
    pathname.includes('.') // Images, fonts, favicon.ico, etc.  
  ) {  
    return NextResponse.next();  
  }

  // \--- PHASE 1 : LOGIQUE D'AUTHENTIFICATION \---  
  // Supposons que nous voulons protéger toutes les routes sous /dashboard  
  // Note : Cette logique s'exécute AVANT la détection de locale  
  const isProtectedRoute \= pathname.includes('/dashboard');  
    
  // Vérification simple de cookie (à adapter selon votre Auth Provider)  
  const isAuthenticated \= request.cookies.has('auth\_token');

  if (isProtectedRoute &&\!isAuthenticated) {  
    // Redirection vers la page de login.  
    // Subtilité : Il faut préserver la locale si elle est déjà dans l'URL.  
    // Si l'utilisateur est sur /en/dashboard, on redirige vers /en/login.  
    // Sinon, on utilise la locale par défaut.  
    const localeSegment \= pathname.split('/');  
    const locale \= routing.locales.includes(localeSegment as any)   
     ? localeSegment   
      : routing.defaultLocale;  
        
    const loginUrl \= new URL(\`/${locale}/login\`, request.url);  
    // Ajout d'un paramètre 'callbackUrl' pour rediriger après login  
    loginUrl.searchParams.set('callbackUrl', pathname);  
      
    return NextResponse.redirect(loginUrl);  
  }

  // \--- PHASE 2 : INTERNATIONALISATION \---  
  // Si l'authentification passe (ou n'est pas requise), on laisse next-intl  
  // gérer la négociation de langue et les réécritures d'URL.  
  const response \= intlMiddleware(request);

  // \--- PHASE 3 : MANIPULATION POST-I18N \---  
  // C'est ici que nous pouvons enrichir la réponse générée par next-intl.  
  // Par exemple, ajouter des en-têtes de sécurité ou nettoyer des headers internes.  
    
  // Sécurité : En-têtes CSP ou HSTS  
  response.headers.set('X-Content-Type-Options', 'nosniff');  
  response.headers.set('X-Frame-Options', 'DENY');  
    
  // Nettoyage spécifique Cloudflare (optionnel, selon les cas rencontrés)  
  // Certains adaptateurs n'aiment pas l'en-tête x-middleware-next  
  response.headers.delete('x-middleware-next');

  return response;  
}

// Configuration du Matcher pour optimiser les invocations du Worker  
export const config \= {  
  // Le matcher doit être aussi précis que possible pour éviter d'invoquer  
  // le middleware inutilement sur des assets statiques.  
  matcher: \['/((?\!api|\_next|\_vercel|.\*\\\\..\*).\*)'\]  
};

Analyse de la Stratégie :  
Cette approche séquentielle garantit que les redirections de sécurité sont prioritaires. Si un utilisateur non authentifié tente d'accéder à /fr/dashboard, il est redirigé vers /fr/login avant que next-intl ne traite la requête. Si l'utilisateur est authentifié, intlMiddleware prend le relais pour s'assurer que l'utilisateur est sur la bonne locale (ex: redirection de / vers /fr). Enfin, nous avons une opportunité de modifier la réponse finale avant qu'elle ne quitte le Edge, ce qui est impossible avec une composition de fonctions opaque.3  
---

## **5\. Gestion des Données et Traductions : Performance et Scalabilité**

La gestion des fichiers JSON de traduction peut devenir un goulot d'étranglement de performance à mesure que l'application grandit.

### **5.1. Chargement des Messages : Local vs Distant**

L'approche standard consiste à stocker les fichiers JSON dans le dépôt Git (/messages). Cependant, pour des applications de très grande envergure, inclure des mégaoctets de JSON dans le bundle du Worker n'est pas viable.  
**Approche Recommandée (Standard) :** Fichiers locaux avec "Code Splitting". Comme vu dans la section 3.3, l'import dynamique suffit pour la majorité des applications. Webpack génère des fichiers séparés que le runtime charge à la demande.  
Approche Avancée (Haute Performance / CMS) : Chargement depuis un KV Store ou une API.  
Si vous utilisez un CMS Headless pour gérer les traductions, il est préférable de charger les messages dynamiquement pour éviter de reconstruire l'application à chaque correction orthographique.

TypeScript

// Exemple conceptuel de chargement depuis une API externe dans request.ts  
export default getRequestConfig(async ({ requestLocale }) \=\> {  
  const locale \= await requestLocale;  
    
  // Récupération depuis une URL (ex: API CMS ou CDN)  
  // Le 'fetch' de Next.js permet de mettre en cache cette réponse  
  // avec un revalidate tag pour la mise à jour ISR.  
  const messagesResponse \= await fetch(\`https://api.mycms.com/translations/${locale}\`, {  
    next: { tags: \['translations'\], revalidate: 3600 }  
  });  
    
  const messages \= await messagesResponse.json();

  return { locale, messages };  
});

Cette méthode découple le déploiement du code de la mise à jour du contenu, un atout majeur pour les équipes marketing internationales.15

### **5.2. Optimisation de la Taille des JSON**

Pour éviter des fichiers JSON monolithiques, next-intl supporte les espaces de noms (namespaces). Cependant, il est souvent plus performant de garder un seul fichier par langue mais de s'assurer que les clés inutilisées sont purgées. Des outils comme i18n-ally ou des scripts CI personnalisés doivent être utilisés pour valider que le JSON ne contient pas de clés mortes avant le déploiement.  
---

## **6\. Développement des Composants : Server vs Client**

La distinction entre Server Components (RSC) et Client Components est fondamentale pour la performance sur Cloudflare. Les RSC s'exécutent sur le Worker, génèrent du HTML, et envoient zéro JavaScript de traduction au client.

### **6.1. Server Components (Par défaut)**

C'est le mode par défaut et le plus performant.

TypeScript

// src/app/\[locale\]/page.tsx  
import { useTranslations } from 'next-intl';  
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {  
  // getTranslations est asynchrone et recommandé pour les composants async  
  const t \= await getTranslations('HomePage');

  return (  
    \<main className="p-4"\>  
      \<h1 className="text-2xl font-bold"\>{t('title')}\</h1\>  
      \<p className="mt-2"\>{t('description')}\</p\>  
    \</main\>  
  );  
}

**Note Importante :** Même dans un composant serveur, useTranslations peut être utilisé si le composant n'est pas async. C'est souvent préférable pour faciliter les tests unitaires (voir section 9).16

### **6.2. Client Components et le Provider**

Pour les composants interactifs (boutons, formulaires), les traductions doivent être hydratées côté client.

TypeScript

// src/app/\[locale\]/layout.tsx  
import { NextIntlClientProvider } from 'next-intl';  
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({  
  children,  
  params: { locale }  
}: {  
  children: React.ReactNode;  
  params: { locale: string };  
}) {  
  // Récupération des messages sur le serveur  
  const messages \= await getMessages();

  return (  
    \<html lang={locale}\>  
      \<body\>  
        {/\*   
           Le provider transmet les messages au client.  
           Attention : Tous les messages chargés ici seront sérialisés dans le HTML (\_\_NEXT\_DATA\_\_).  
           Pour optimiser, on peut utiliser \`pick\` pour ne passer que les namespaces nécessaires.  
        \*/}  
        \<NextIntlClientProvider messages={messages}\>  
          {children}  
        \</NextIntlClientProvider\>  
      \</body\>  
    \</html\>  
  );  
}

**Optimisation :** Pour éviter de gonfler le HTML avec toutes les traductions, vous pouvez filtrer les messages passés au NextIntlClientProvider en utilisant l'utilitaire pick de lodash ou une fonction native, ne passant que les clés requises par les composants clients globaux (navbar, footer).17  
---

## **7\. Assurance Qualité : Stratégies de Tests Avancées**

L'intégration de next-intl rend les tests unitaires complexes car les composants dépendent d'un contexte serveur qui n'existe pas dans Jest ou Vitest par défaut.

### **7.1. Tests Unitaires avec Vitest : Le Défi de l'Asynchrone**

Vitest est l'outil de choix pour tester des applications Vite/Next.js modernes. Le défi majeur concerne les **Async Server Components**. En 2025, React et les outils de test ne supportent toujours pas nativement le rendu complet des composants asynchrones (async function MyComponent()) via render() de @testing-library/react.  
Stratégie de Mocking (vitest.setup.ts) :  
Nous devons mocker les modules serveur de next-intl pour qu'ils fonctionnent dans l'environnement JSDOM de Vitest.

TypeScript

// vitest.setup.ts  
import { vi } from 'vitest';  
import '@testing-library/jest-dom';

// Mock de next-intl/server pour simuler le comportement serveur  
vi.mock('next-intl/server', () \=\> {  
  return {  
    // Simulation de getTranslations qui retourne une fonction simple  
    getTranslations: vi.fn().mockImplementation(async () \=\> {  
      return (key: string) \=\> \`\[Mocked: ${key}\]\`;  
    }),  
    // Simulation de getMessages  
    getMessages: vi.fn().mockResolvedValue({}),  
  };  
});

// Mock de next-intl (partie client/partagée)  
vi.mock('next-intl', async () \=\> {  
  const actual \= await vi.importActual('next-intl');  
  return {  
   ...actual,  
    useTranslations: () \=\> (key: string) \=\> \`\[Mocked: ${key}\]\`,  
  };  
});

// Mock de la navigation pour éviter les erreurs de routage  
vi.mock('@/i18n/routing', () \=\> ({  
  Link: ({ children, href }: any) \=\> \<a href={href}\>{children}\</a\>,  
  useRouter: vi.fn(),  
  usePathname: vi.fn().mockReturnValue('/fr'),  
}));

Test d'un Composant Asynchrone :  
Puisqu'on ne peut pas utiliser render(\<AsyncComponent /\>), la technique recommandée est d'appeler le composant comme une fonction JavaScript standard et d'inspecter le résultat, ou de refactoriser le code pour séparer la logique de données (async) de la vue (synchrone).

TypeScript

// src/components/Greeting.test.tsx  
import { expect, test, vi } from 'vitest';  
import Greeting from './Greeting'; // Composant async

test('Greeting component fetches translations correctly', async () \=\> {  
  // Appel direct de la fonction composant  
  // Note: Cela retourne un noeud React, pas du DOM rendu  
  const result \= await Greeting();  
    
  // Cette approche est limitée. La méthode recommandée est le pattern "Container/View".  
  // Testez le composant View (synchrone) avec @testing-library, et testez  
  // la logique de données séparément.  
});

**Le Pattern Container/View pour la Testabilité :**

1. GreetingContainer.tsx (Async) : Récupère les traductions via await getTranslations et les passe en props.  
2. GreetingView.tsx (Synchrone) : Reçoit les textes en props et affiche l'UI.  
3. Testez GreetingView.tsx avec render(), ce qui est trivial et supporté à 100%.

### **7.2. Tests de Bout-en-Bout (E2E) avec Playwright**

Les tests E2E sont indispensables pour valider que le middleware Cloudflare redirige correctement les utilisateurs selon leur langue.  
**Configuration playwright.config.ts :**

TypeScript

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({  
  use: {  
    baseURL: 'http://localhost:3000',  
  },  
  projects:,   
        locale: 'fr-FR',  
        timezoneId: 'Europe/Paris'   
      },  
    },  
    {  
      name: 'chrome-en',  
      use: {   
       ...devices,   
        locale: 'en-US',  
        timezoneId: 'America/New\_York'  
      },  
    },  
  \],  
});

**Scénario de Test (e2e/i18n.spec.ts) :**

TypeScript

import { test, expect } from '@playwright/test';

test.describe('Internationalization Routing', () \=\> {  
  test('should redirect root to preferred locale', async ({ page }) \=\> {  
    // Le projet 'chrome-fr' a la locale 'fr-FR' configurée  
    await page.goto('/');  
    // Vérifie que le middleware a redirigé vers /fr  
    await expect(page).toHaveURL(/.\*\\/fr/);  
  });

  test('should switch language', async ({ page }) \=\> {  
    await page.goto('/fr');  
    // Simulation du clic sur le switcher de langue  
    await page.getByRole('link', { name: 'English' }).click();  
    await expect(page).toHaveURL(/.\*\\/en/);  
    // Vérification du contenu traduit  
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome');  
  });  
});

Cette configuration multi-projet permet de valider automatiquement que la détection de locale fonctionne pour différents profils d'utilisateurs sans avoir à changer manuellement les configurations du navigateur dans chaque test.18  
---

## **8\. Stratégie de Caching et ISR Multilingue**

Sur Cloudflare, la gestion du cache est différente d'un serveur Node.js classique (comme Vercel). La configuration OpenNext définie en section 2.2 permet l'utilisation de l'ISR (Incremental Static Regeneration).

### **8.1. Fonctionnement de l'ISR sur le Edge**

Lorsqu'une page /fr/blog/mon-article est demandée :

1. OpenNext vérifie le cache R2 via le Cache API.  
2. Si la page existe et est valide (selon revalidate), elle est servie immédiatement (Cache Hit).  
3. Si elle est expirée (Stale), elle est servie (stale-while-revalidate), et une tâche est envoyée à la queue (Durable Object) pour régénérer la page en arrière-plan.  
4. Le Worker exécute le rendu Next.js, met à jour R2, et purge le cache CDN global via les tags.

### **8.2. Invalidation par Tag**

Pour les sites multilingues, l'invalidation granulaire est clé. Si vous corrigez une coquille sur la version anglaise, vous ne voulez pas invalider le cache de la version française.

TypeScript

// Dans un composant ou un fetch de données  
const messages \= await fetch('...', {   
  next: { tags: \[\`messages-${locale}\`\] }   
});

Lors d'une mise à jour, vous pouvez appeler revalidateTag('messages-en') pour ne rafraîchir que les pages anglaises. Avec la configuration tagCache: d1NextTagCache, cette opération est transactionnelle et propagée globalement via l'infrastructure D1 de Cloudflare.7  
---

## **9\. Performance et Optimisation des Bundles**

### **9.1. Analyse des Cold Starts**

Les "Cold Starts" (démarrages à froid) sont l'ennemi du Serverless. Sur Cloudflare, un worker doit démarrer en quelques millisecondes. Charger une bibliothèque massive de traduction peut tuer cette performance.  
**Mesures d'Atténuation :**

1. **Split des Locales :** Comme mentionné, ne jamais faire import messages from './messages/index'. Toujours utiliser import().  
2. **Middleware Léger :** Le middleware s'exécute avant tout cache. Il doit être minimaliste. Évitez d'y importer des bibliothèques lourdes comme zod ou des parsers complexes si possible.  
3. **Polyfills Sélectifs :** Cloudflare Workers moderne supporte la majorité des API Intl. N'ajoutez des polyfills que si vous visez des locales très spécifiques non supportées par le runtime V8 standard.

---

## **Conclusion et Perspectives**

L'implémentation de l'internationalisation sur Next.js 15 avec Cloudflare Workers a atteint un point d'inflexion en novembre 2025\. L'abandon des contraintes strictes du Edge Runtime au profit de l'approche hybride d'OpenNext (nodejs\_compat) a levé les barrières techniques majeures qui entravaient auparavant les développeurs.  
La solution présentée dans ce rapport offre un équilibre optimal entre :

* **Expérience Utilisateur :** Navigation rapide, contenu localisé persistant, URL sémantiques.  
* **Expérience Développeur :** Utilisation des standards Next.js (App Router, RSC), tests robustes via Vitest/Playwright.  
* **Performance Infrastructure :** Utilisation intelligente du cache R2/KV et du réseau global Cloudflare.

En suivant rigoureusement l'architecture de séparation des couches (Middleware pour le routage, Request Config pour les données, RSC pour le rendu), les équipes peuvent déployer des applications globales scalables sans sacrifier la maintenabilité ni la performance.

### **Tableau Récapitulatif des Composants Clés**

| Composant | Responsabilité | Technologie / API | Point Critique |
| :---- | :---- | :---- | :---- |
| **Infrastructure** | Hébergement Serverless | Cloudflare Workers \+ OpenNext | Configurer open-next.config.ts pour le cache R2/KV/D1. |
| **Routage** | Détection de langue & Redirection | middleware.ts | Pattern de chaînage manuel pour l'Auth; matcher précis. |
| **Configuration** | Chargement des locales | src/i18n/request.ts | Utiliser await import() pour le code-splitting des JSON. |
| **Rendu** | Affichage des textes | useTranslations / getTranslations | Privilégier les Server Components pour réduire le JS client. |
| **Tests Unitaires** | Validation Logique UI | Vitest | Pattern Container/View pour contourner les limites des tests async. |
| **Tests E2E** | Validation Routage | Playwright | Configuration multi-projets avec locales navigateur distinctes. |

#### **Sources des citations**

1. Next.js · Cloudflare Workers docs, consulté le novembre 20, 2025, [https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)  
2. Deploy your Next.js app to Cloudflare Workers with the Cloudflare adapter for OpenNext, consulté le novembre 20, 2025, [https://blog.cloudflare.com/deploying-nextjs-apps-to-cloudflare-workers-with-the-opennext-adapter/](https://blog.cloudflare.com/deploying-nextjs-apps-to-cloudflare-workers-with-the-opennext-adapter/)  
3. Kinde \+ next-intl with OpenNext on Cloudflare — not that easy (atm) | by Marek Urbanowicz, consulté le novembre 20, 2025, [https://marekurbanowicz.medium.com/kinde-next-intl-with-opennext-on-cloudflare-not-that-easy-atm-e837d7af0efa](https://marekurbanowicz.medium.com/kinde-next-intl-with-opennext-on-cloudflare-not-that-easy-atm-e837d7af0efa)  
4. Cloudflare \- OpenNext, consulté le novembre 20, 2025, [https://opennext.js.org/cloudflare](https://opennext.js.org/cloudflare)  
5. Compatibility flags \- Workers \- Cloudflare Docs, consulté le novembre 20, 2025, [https://developers.cloudflare.com/workers/configuration/compatibility-flags/](https://developers.cloudflare.com/workers/configuration/compatibility-flags/)  
6. Runtime requirements – Internationalization (i18n) for Next.js \- next-intl, consulté le novembre 20, 2025, [https://next-intl.dev/docs/environments/runtime-requirements](https://next-intl.dev/docs/environments/runtime-requirements)  
7. Caching \- OpenNext, consulté le novembre 20, 2025, [https://opennext.js.org/cloudflare/caching](https://opennext.js.org/cloudflare/caching)  
8. @cloudflare/next-on-pages \- npm, consulté le novembre 20, 2025, [https://www.npmjs.com/package/@cloudflare/next-on-pages](https://www.npmjs.com/package/@cloudflare/next-on-pages)  
9. Setup locale-based routing – Internationalization (i18n) for Next.js, consulté le novembre 20, 2025, [https://next-intl.dev/docs/routing/setup](https://next-intl.dev/docs/routing/setup)  
10. Proxy / middleware – Internationalization (i18n) for Next.js, consulté le novembre 20, 2025, [https://next-intl.dev/docs/routing/middleware](https://next-intl.dev/docs/routing/middleware)  
11. Next.js App Router internationalization (i18n) \- next-intl, consulté le novembre 20, 2025, [https://next-intl.dev/docs/getting-started/app-router](https://next-intl.dev/docs/getting-started/app-router)  
12. Next.JS big Middleware size when using next-intl (possible messages leak into middleware bundle) \#814 \- GitHub, consulté le novembre 20, 2025, [https://github.com/amannn/next-intl/issues/814](https://github.com/amannn/next-intl/issues/814)  
13. How to use multiple middlewares in Next.js using the middleware.ts file? \- Stack Overflow, consulté le novembre 20, 2025, [https://stackoverflow.com/questions/76603369/how-to-use-multiple-middlewares-in-next-js-using-the-middleware-ts-file](https://stackoverflow.com/questions/76603369/how-to-use-multiple-middlewares-in-next-js-using-the-middleware-ts-file)  
14. Authjs V5 middleware chaining · nextauthjs next-auth · Discussion \#8961 \- GitHub, consulté le novembre 20, 2025, [https://github.com/nextauthjs/next-auth/discussions/8961](https://github.com/nextauthjs/next-auth/discussions/8961)  
15. next-intl consuming messages from a custom CMS, ¿how revalidate after editing content? : r/nextjs \- Reddit, consulté le novembre 20, 2025, [https://www.reddit.com/r/nextjs/comments/1f2h5kp/nextintl\_consuming\_messages\_from\_a\_custom\_cms\_how/](https://www.reddit.com/r/nextjs/comments/1f2h5kp/nextintl_consuming_messages_from_a_custom_cms_how/)  
16. Internationalization of Server & Client Components \- next-intl, consulté le novembre 20, 2025, [https://next-intl.dev/docs/environments/server-client-components](https://next-intl.dev/docs/environments/server-client-components)  
17. Request configuration – Internationalization (i18n) for Next.js, consulté le novembre 20, 2025, [https://next-intl.dev/docs/usage/configuration](https://next-intl.dev/docs/usage/configuration)  
18. Rewriting for Locales using Next.js and next-intl \- Stack Overflow, consulté le novembre 20, 2025, [https://stackoverflow.com/questions/77230499/rewriting-for-locales-using-next-js-and-next-intl](https://stackoverflow.com/questions/77230499/rewriting-for-locales-using-next-js-and-next-intl)  
19. Configuration (use) \- Playwright, consulté le novembre 20, 2025, [https://playwright.dev/docs/test-use-options](https://playwright.dev/docs/test-use-options)  
20. \[BUG\] locale does not always set correct browser Intl locale for firefox · Issue \#27802 · microsoft/playwright \- GitHub, consulté le novembre 20, 2025, [https://github.com/microsoft/playwright/issues/27802](https://github.com/microsoft/playwright/issues/27802)  
21. Caching \- OpenNext, consulté le novembre 20, 2025, [https://opennext.js.org/aws/inner\_workings/caching](https://opennext.js.org/aws/inner_workings/caching)