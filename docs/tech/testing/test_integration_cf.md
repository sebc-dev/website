

# **Rapport sur l'Ingénierie de Tests d'Intégration pour les Architectures Edge : Next.js, Drizzle ORM et Cloudflare D1**

## **1\. Introduction et Changement de Paradigme Architectural**

L'industrie du développement web traverse actuellement une mutation fondamentale, s'éloignant des architectures monolithiques traditionnelles hébergées sur des serveurs centralisés (tels que les VPS Linux classiques exécutant Nginx et Node.js) vers des architectures distribuées à la périphérie du réseau, connues sous le nom d'"Edge Computing". Dans ce contexte, la plateforme Cloudflare Workers s'est imposée comme un leader technologique, proposant un environnement d'exécution V8 isolat qui diffère substantiellement de l'environnement Node.js standard.  
L'introduction de D1, la base de données relationnelle native de Cloudflare basée sur SQLite, complète cette transition en offrant une persistance des données à l'Edge. Parallèlement, Next.js a évolué avec son "App Router" et ses "Server Actions", brouillant les frontières entre le client et le serveur, et permettant une invocation directe de fonctions backend depuis le frontend. L'utilisation de Drizzle ORM, célèbre pour sa légèreté et son typage fort via TypeScript, vient cimenter cette stack technologique moderne.  
Cependant, cette convergence de technologies de pointe a créé un vide significatif dans les méthodologies d'assurance qualité logicielle. Les stratégies de test conventionnelles, qui reposent souvent sur la conteneurisation de bases de données (comme Dockeriser une instance PostgreSQL) ou sur des mocks grossiers, s'avèrent inefficaces ou inexactes face à l'architecture propriétaire de Cloudflare. Le défi technique central adressé par ce rapport réside dans la reproduction fidèle de l'environnement d'exécution workerd (le runtime de Cloudflare) au sein d'un environnement de test Node.js (nécessaire pour Next.js), tout en garantissant la portabilité de ces tests vers des pipelines d'intégration continue (CI) tels que GitHub Actions.  
Ce document propose une analyse exhaustive et une stratégie d'implémentation pour établir des tests d'intégration "vrais" — c'est-à-dire interagissant avec une instance réelle de la base de données et non des simulations — en exploitant les avancées récentes des outils wrangler (notamment l'API getPlatformProxy) et le framework de test Vitest.  
---

## **2\. Analyse des Composants et de la Divergence des Runtimes**

Pour concevoir une stratégie de test robuste, il est impératif de comprendre la nature divergente des environnements d'exécution en jeu. La difficulté majeure rencontrée lors du test d'applications Next.js déployées sur Cloudflare réside dans l'incompatibilité fondamentale entre les API Node.js standard et les API Web Standards utilisées par les Workers.

### **2.1 Le Défi de l'Objet env et des Bindings**

Dans une application Cloudflare Worker typique, l'accès aux ressources externes (bases de données D1, magasins KV, files d'attente) se fait via des "bindings" injectés dans l'objet env au moment de l'exécution. Contrairement à une application Node.js traditionnelle où la connexion à la base de données pourrait être une chaîne de connexion importée via process.env.DATABASE\_URL, D1 est exposé comme un objet JavaScript complexe (un proxy vers le moteur de base de données sous-jacent) directement dans le code.1  
Le tableau ci-dessous illustre les différences critiques entre les environnements :

| Caractéristique | Environnement Local (Node.js Standard) | Environnement Production (Cloudflare Workers) | Environnement de Test (Cible) |
| :---- | :---- | :---- | :---- |
| **Runtime** | Node.js (V8 \+ libuv) | workerd (V8 Isulates) | Node.js (piloté par Vitest) avec émulation workerd |
| **Accès Base de Données** | Drivers TCP (pg, mysql2) | Binding D1 (WebSocket/RPC interne) | Proxy vers Binding D1 local |
| **Système de Fichiers** | Accès direct (fs) | Interdit / Read-only | Accès direct (pour le test runner) |
| **Gestion des Variables** | process.env | Objet env injecté | Objet env injecté via Proxy |

Les données recueillies indiquent que la tentative de tester ce code sans une émulation précise conduit invariablement à des erreurs de type "binding undefined" ou à des comportements divergents où le test passe en local mais échoue en production.2

### **2.2 L'Évolution vers getPlatformProxy**

Historiquement, les développeurs utilisaient Miniflare directement pour simuler l'environnement Workers. Cependant, avec l'avènement de Wrangler v3 et v4, Cloudflare a introduit l'API getPlatformProxy. Cette API est un changement de paradigme majeur : elle permet d'instancier les bindings Cloudflare (comme D1) *à l'intérieur* d'un processus Node.js standard.4  
L'analyse des spécifications techniques révèle que getPlatformProxy lit la configuration wrangler.toml, lance un processus workerd léger en arrière-plan, et établit un pont (bridge) permettant au code JavaScript exécuté dans Node.js d'appeler les méthodes de D1 (prepare, bind, run) comme s'il s'exécutait sur l'Edge. C'est cette capacité qui rend possible le test des Server Actions Next.js (qui s'exécutent dans Node.js lors du développement et des tests) avec une véritable base de données D1.4  
---

## **3\. Architecture de la Solution de Test**

La stratégie recommandée repose sur une intégration étroite entre quatre piliers technologiques : Next.js (le framework applicatif), Drizzle ORM (la couche d'abstraction de données), Vitest (le lanceur de tests) et Wrangler (l'émulateur d'infrastructure).

### **3.1 Structure du Projet et Configuration des Outils**

Une organisation rigoureuse des fichiers est nécessaire pour séparer les préoccupations de production et de test. La structure de répertoire suivante est préconisée pour assurer la maintenabilité et la découverte automatique des tests par Vitest :  
/  
├──.github/  
│ └── workflows/  
│ └── ci.yml \# Définition du pipeline CI  
├── drizzle/  
│ └── migrations/ \# Fichiers SQL générés par Drizzle Kit  
├── src/  
│ ├── actions/ \# Server Actions Next.js (Logique métier)  
│ ├── db/  
│ │ ├── schema.ts \# Définition du schéma de base de données  
│ │ └── index.ts \# Instance du client Drizzle  
│ └── lib/ \# Utilitaires  
├── test/  
│ ├── setup.ts \# Configuration globale de l'environnement de test  
│ └── integration/ \# Dossier contenant les fichiers.test.ts  
├── drizzle.config.ts \# Configuration de Drizzle Kit  
├── vitest.config.mts \# Configuration de Vitest  
├── wrangler.toml \# Configuration de l'infrastructure Cloudflare  
└── package.json

### **3.2 Configuration de l'Infrastructure (Wrangler)**

Le fichier wrangler.toml agit comme la source de vérité pour l'infrastructure. Pour les tests d'intégration, il est crucial de définir explicitement les configurations pour D1 afin que getPlatformProxy puisse les découvrir.

Ini, TOML

\# wrangler.toml  
name \= "nextjs-drizzle-d1-app"  
compatibility\_date \= "2024-04-01"  
compatibility\_flags \= \["nodejs\_compat"\]

\[\[d1\_databases\]\]  
binding \= "DB"   
database\_name \= "prod-db"  
database\_id \= "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  
migrations\_dir \= "drizzle/migrations" 

L'attribut migrations\_dir est particulièrement important.7 Il indique à Wrangler où trouver les fichiers SQL générés par Drizzle Kit. Cette configuration permet l'utilisation de la commande wrangler d1 migrations apply pour synchroniser l'état de la base de données locale avec le schéma défini dans le code, une étape préalable indispensable à toute exécution de test.

### **3.3 Configuration du Moteur de Test (Vitest)**

Vitest est sélectionné pour sa compatibilité native avec ESM et TypeScript, ainsi que pour sa vitesse d'exécution supérieure à Jest. La configuration doit spécifier l'environnement node (puisque les tests Next.js s'exécutent côté serveur Node) et pointer vers le fichier de configuration globale.

TypeScript

// vitest.config.mts  
import { defineConfig } from 'vitest/config';  
import react from '@vitejs/plugin-react';  
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({  
  plugins: \[tsconfigPaths(), react()\],  
  test: {  
    environment: 'node',   
    setupFiles: \['./test/setup.ts'\],  
    include: \['test/\*\*/\*.test.ts'\],  
    globals: true,  
    testTimeout: 30000, // Les opérations DB peuvent nécessiter plus de temps  
    hookTimeout: 30000,  
  },  
});

Il est pertinent de noter que bien que le package @cloudflare/vitest-pool-workers existe pour tester des Workers purs, l'utilisation de l'environnement node standard combiné avec getPlatformProxy est préférable pour tester des Server Actions Next.js, car cela reflète plus fidèlement l'environnement d'exécution hybride de Next.js lors du développement local.9  
---

## **4\. Gestion Programmatique du Cycle de Vie de la Base de Données**

L'aspect le plus complexe des tests d'intégration avec D1 est la gestion du cycle de vie de la base de données : création, migration, et destruction (ou nettoyage). Contrairement à une base de données en mémoire volatile, D1 local persiste ses données sur le disque via SQLite.

### **4.1 Stratégie d'Application des Migrations**

Pour que les tests soient valides, la base de données de test doit refléter exactement le schéma de production. Deux approches principales émergent de la recherche pour appliquer les migrations : l'invocation de la CLI via execSync et l'utilisation de l'API interne applyD1Migrations.

#### **Approche 1 : Invocation CLI via execSync (Recommandée pour la robustesse)**

Cette méthode consiste à exécuter la commande wrangler standard depuis le code de configuration des tests. Elle présente l'avantage d'utiliser exactement le même mécanisme que celui utilisé par le développeur manuellement, garantissant une parité maximale.

TypeScript

// test/setup.ts (Extrait partiel)  
import { execSync } from 'child\_process';

//...  
try {  
  // Le flag \--local est impératif pour cibler la version locale de D1  
  execSync('npx wrangler d1 migrations apply DB \--local', {   
    stdio: 'inherit',  
    env: {...process.env, CI: 'true' } // Force le mode non-interactif  
  });  
} catch (error) {  
  console.error("Échec de l'application des migrations:", error);  
  process.exit(1);  
}  
//...

L'utilisation de la variable d'environnement CI: 'true' est une astuce critique identifiée dans les rapports de bugs 11 pour empêcher Wrangler de demander une confirmation interactive ("Are you sure?"), ce qui bloquerait indéfiniment les tests automatisés.

#### **Approche 2 : API applyD1Migrations**

Cloudflare expose également une fonction utilitaire applyD1Migrations via le paquet @cloudflare/vitest-pool-workers/config.13 Cette méthode est plus programmatique et évite de spawner un sous-processus.

TypeScript

import { applyD1Migrations } from 'cloudflare:test';  
// Cette approche nécessite une configuration spécifique du pool workers  
// et est souvent plus complexe à intégrer dans un environnement 'node' pur.

L'analyse comparative suggère que pour un environnement Next.js (Node.js), l'approche execSync est souvent plus fiable car elle ne dépend pas des mocks internes de cloudflare:test qui sont conçus pour le runtime workerd strict.15

### **4.2 Initialisation du Proxy et Injection de Dépendances**

Une fois la base de données migrée, le fichier test/setup.ts doit initialiser le proxy et, point crucial, "mocker" l'instance de base de données utilisée par l'application pour qu'elle pointe vers l'instance de test.

TypeScript

// test/setup.ts  
import { beforeAll, afterAll, vi } from 'vitest';  
import { getPlatformProxy } from 'wrangler';  
import { execSync } from 'child\_process';

let disposeProxy: () \=\> Promise\<void\>;

beforeAll(async () \=\> {  
  // 1\. Appliquer les migrations  
  execSync('npx wrangler d1 migrations apply DB \--local', {   
    stdio: 'inherit',   
    env: {...process.env, CI: 'true', NO\_D1\_WARNING: 'true' }   
  });

  // 2\. Démarrer le proxy Cloudflare  
  const proxy \= await getPlatformProxy();  
  const env \= proxy.env;  
  disposeProxy \= proxy.dispose;

  // 3\. Interception du module de base de données  
  // On remplace l'instance 'db' importée dans l'application par celle connectée au proxy  
  vi.mock('@/lib/db', async () \=\> {  
    const { drizzle } \= await import('drizzle-orm/d1');  
    // Le binding env.DB provient du proxy local  
    return {  
      db: drizzle(env.DB)  
    };  
  });  
});

afterAll(async () \=\> {  
  // Nettoyage propre  
  if (disposeProxy) await disposeProxy();  
});

Cette technique d'interception via vi.mock 16 est fondamentale. Elle permet au code de production (vos Server Actions) d'importer db depuis @/lib/db sans modification, tout en recevant l'instance connectée à la base de test lors de l'exécution des tests.  
---

## **5\. Implémentation des Tests d'Intégration des Server Actions**

Les "Server Actions" de Next.js sont, fonctionnellement, des fonctions asynchrones exportées avec la directive 'use server'. Dans le contexte d'un test unitaire ou d'intégration exécuté par Vitest, cette directive est ignorée, et la fonction s'exécute comme n'importe quelle fonction JavaScript standard.18 Cela simplifie grandement le test de la logique métier et de l'interaction avec la base de données.

### **5.1 Scénario de Test Type**

Considérons une Server Action simple permettant d'ajouter un utilisateur.  
**Code Applicatif (src/actions/users.ts) :**

TypeScript

'use server';  
import { db } from '@/lib/db';  
import { users } from '@/db/schema';

export async function createUser(data: { name: string; email: string }) {  
  try {  
    const result \= await db.insert(users).values(data).returning();  
    return { success: true, data: result };  
  } catch (e) {  
    return { success: false, error: 'Erreur insertion' };  
  }  
}

**Code de Test (test/integration/users.test.ts) :**

TypeScript

import { describe, it, expect, beforeEach } from 'vitest';  
import { createUser } from '@/actions/users';  
import { db } from '@/lib/db'; // Ceci est l'instance mockée  
import { users } from '@/db/schema';  
import { sql } from 'drizzle-orm';

describe('User Server Actions', () \=\> {  
  // Nettoyage entre les tests pour garantir l'isolation  
  beforeEach(async () \=\> {  
    await db.delete(users).run();   
    // Note:.run() est spécifique à SQLite/D1 dans certaines versions de Drizzle,   
    // sinon utiliser.execute() ou simplement await la promesse.  
  });

  it('devrait créer un utilisateur et le persister dans D1 local', async () \=\> {  
    const newUser \= { name: 'Jean Dupont', email: 'jean@example.com' };  
      
    // Appel direct de l'action  
    const response \= await createUser(newUser);  
      
    // 1\. Vérification du retour de l'action  
    expect(response.success).toBe(true);  
    expect(response.data).toBeDefined();  
    expect(response.data?.name).toBe(newUser.name);

    // 2\. Vérification de l'effet de bord (persistance en DB)  
    const results \= await db.select().from(users).all();  
    expect(results).toHaveLength(1);  
    expect(results.email).toBe(newUser.email);  
  });  
});

### **5.2 Isolation et Transactions**

Un problème récurrent dans les tests d'intégration de base de données est la pollution de l'état partagé. Si plusieurs tests s'exécutent en parallèle (le défaut de Vitest), ils peuvent écrire dans la même base SQLite et causer des échecs aléatoires ("flaky tests").  
Les données suggèrent deux stratégies pour mitiger ce risque 20 :

1. **Transactions Rollback :** Envelopper chaque test dans une transaction SQL et effectuer un rollback à la fin. Drizzle supporte db.transaction(). Cependant, le support des transactions imbriquées ou des rollbacks complets sur SQLite via D1 peut parfois présenter des limitations par rapport à PostgreSQL.  
   TypeScript  
   it('test isolé', async () \=\> {  
     await db.transaction(async (tx) \=\> {  
       // Effectuer les actions  
       //...  
       // Forcer le rollback  
       tx.rollback();  
     });  
   });

2. **Exécution Séquentielle :** Configurer Vitest pour désactiver le parallélisme pour les fichiers de test touchant la base de données. Cela augmente le temps d'exécution mais garantit la stabilité.  
   TypeScript  
   // vitest.config.mts  
   test: {  
     fileParallelism: false, // Désactive le parallélisme au niveau des fichiers  
   }

L'approche séquentielle, couplée à un nettoyage (DELETE FROM...) dans beforeEach, est souvent la plus robuste pour SQLite/D1 où la gestion des transactions concurrentes est moins sophistiquée que sur d'autres SGBD.  
---

## **6\. Automatisation CI/CD avec GitHub Actions**

L'objectif final est d'exécuter ces tests automatiquement à chaque "Pull Request" sur GitHub. La configuration CI doit reproduire l'environnement local sans nécessiter d'accès à la base de production.

### **6.1 Le Workflow GitHub Actions (.github/workflows/test.yml)**

Le workflow suivant intègre les meilleures pratiques identifiées : installation des dépendances, configuration de l'environnement Wrangler (sans login interactif), et exécution des tests.

YAML

name: Tests d'Intégration

on:  
  push:  
    branches: \[main\]  
  pull\_request:

jobs:  
  test:  
    runs-on: ubuntu-latest  
      
    \# Définition des variables d'environnement globales pour le job  
    env:  
      CI: true  
      WRANGLER\_LOG: none \# Réduit le bruit dans les logs \[12\]

    steps:  
      \- name: Checkout du code  
        uses: actions/checkout@v4

      \- name: Installation de Node.js  
        uses: actions/setup-node@v4  
        with:  
          node-version: '20'  
          cache: 'npm'

      \- name: Installation des dépendances  
        run: npm ci

      \# Étape critique : Génération des artefacts Drizzle  
      \- name: Génération des migrations Drizzle  
        run: npx drizzle-kit generate

      \# Setup de Wrangler :   
      \# Bien que nous utilisions \--local, Wrangler peut vérifier l'auth.  
      \# Utiliser un token factice ou un secret réel (limité) aide à passer cette étape.  
      \- name: Vérification de l'installation Wrangler  
        run: npx wrangler \--version  
        env:  
          \# Un token est parfois requis par certaines versions de wrangler même en local  
          CLOUDFLARE\_API\_TOKEN: ${{ secrets.CLOUDFLARE\_API\_TOKEN |

| 'dummy-token-for-local-test' }}

      \- name: Exécution des Tests (Vitest)  
        \# Cette commande va lancer vitest, qui exécutera setup.ts,  
        \# qui exécutera 'wrangler d1 migrations apply \--local'  
        run: npm test

### **6.2 Gestion de l'Authentification et Mode Non-Interactif**

L'analyse des problèmes courants sur GitHub Actions 11 révèle que l'erreur la plus fréquente est le blocage du pipeline car Wrangler attend une confirmation utilisateur ("Allow Wrangler to open a browser?").  
Pour contourner cela :

1. **Flag \--local :** Il est impératif. Il instruit Wrangler d'utiliser le moteur SQLite local (Miniflare) et non l'API Cloudflare distante.  
2. **Variable CI=true :** La plupart des outils CLI modernes, y compris Wrangler, détectent cette variable et désactivent les invites interactives, choisissant les réponses par défaut (souvent "Yes" ou échec explicite).  
3. **Token API :** Bien que théoriquement non nécessaire pour le mode local pur dans les versions récentes, fournir un CLOUDFLARE\_API\_TOKEN (même factice dans certains contextes, ou un token avec des droits minimaux en lecture seule) peut éviter des erreurs de validation de configuration au démarrage de Wrangler.23

### **6.3 Reporting et Couverture**

Pour enrichir le rapport de CI, l'intégration d'un outil de couverture de code est recommandée. Vitest supporte nativement la couverture v8.

Bash

\# Dans package.json  
"scripts": {  
  "test:ci": "vitest run \--coverage"  
}

L'ajout de l'action vitest-coverage-report dans le workflow permet d'afficher un résumé directement dans les Pull Requests, offrant une visibilité immédiate sur la santé du code.24  
---

## **7\. Synthèse et Recommandations**

La mise en place de tests d'intégration pour une stack Next.js \+ Drizzle \+ Cloudflare D1 nécessite une compréhension fine de l'écosystème "Edge". La solution ne réside pas dans le mocking traditionnel des appels base de données, mais dans l'émulation de la plateforme.  
**Les points clés à retenir :**

1. **L'API getPlatformProxy est incontournable :** Elle est le pont officiel permettant aux tests Node.js d'accéder aux ressources D1 locales.  
2. **Les migrations doivent être appliquées programmatiquement :** L'utilisation de execSync avec wrangler d1 migrations apply \--local dans le setup.ts de Vitest garantit que chaque exécution de test démarre avec un schéma à jour.  
3. **L'isolation est un défi :** En environnement local SQLite, privilégiez l'exécution séquentielle des tests ou le nettoyage systématique des tables (DELETE) plutôt que de compter sur des transactions complexes qui pourraient différer du comportement de production.  
4. **La CI doit être configurée pour la non-interactivité :** L'usage explicite des drapeaux \--local et des variables d'environnement CI=true est essentiel pour éviter les blocages dans GitHub Actions.

En adoptant cette architecture, les équipes de développement peuvent bénéficier de la vélocité de Next.js et de la performance de Cloudflare D1 sans sacrifier la rigueur de l'assurance qualité, assurant ainsi des déploiements en production fiables et prédictibles.

#### **Sources des citations**

1. Connect to databases · Cloudflare Workers docs, consulté le novembre 22, 2025, [https://developers.cloudflare.com/workers/databases/connecting-to-databases/](https://developers.cloudflare.com/workers/databases/connecting-to-databases/)  
2. How to access D1 database in test for cloudflare worker? \#3986 \- GitHub, consulté le novembre 22, 2025, [https://github.com/vitest-dev/vitest/discussions/3986](https://github.com/vitest-dev/vitest/discussions/3986)  
3. Expose schema generators from the cli package · Issue \#1272 · better-auth/better-auth, consulté le novembre 22, 2025, [https://github.com/better-auth/better-auth/issues/1272](https://github.com/better-auth/better-auth/issues/1272)  
4. API · Cloudflare Workers docs \- Wrangler, consulté le novembre 22, 2025, [https://developers.cloudflare.com/workers/wrangler/api/](https://developers.cloudflare.com/workers/wrangler/api/)  
5. Wrangler \- Noise, consulté le novembre 22, 2025, [https://noise.getoto.net/tag/wrangler/](https://noise.getoto.net/tag/wrangler/)  
6. Developer Week \- Noise, consulté le novembre 22, 2025, [https://noise.getoto.net/tag/developer-week/](https://noise.getoto.net/tag/developer-week/)  
7. Cloudflare D1 \- Drizzle ORM, consulté le novembre 22, 2025, [https://orm.drizzle.team/docs/connect-cloudflare-d1](https://orm.drizzle.team/docs/connect-cloudflare-d1)  
8. How do you run Drizzle migrations on D1? \#1388 \- GitHub, consulté le novembre 22, 2025, [https://github.com/drizzle-team/drizzle-orm/discussions/1388](https://github.com/drizzle-team/drizzle-orm/discussions/1388)  
9. Write your first test · Cloudflare Workers docs, consulté le novembre 22, 2025, [https://developers.cloudflare.com/workers/testing/vitest-integration/write-your-first-test/](https://developers.cloudflare.com/workers/testing/vitest-integration/write-your-first-test/)  
10. Testing: Vitest \- Next.js, consulté le novembre 22, 2025, [https://nextjs.org/docs/app/guides/testing/vitest](https://nextjs.org/docs/app/guides/testing/vitest)  
11. BUG: Confusing messaging about whether \`wrangler d1 migrations apply\` is running against local vs remote DB · Issue \#7657 · cloudflare/workers-sdk \- GitHub, consulté le novembre 22, 2025, [https://github.com/cloudflare/workers-sdk/issues/7657](https://github.com/cloudflare/workers-sdk/issues/7657)  
12. apply D1 migrations only fails in production · Issue \#5411 · cloudflare/workerd \- GitHub, consulté le novembre 22, 2025, [https://github.com/cloudflare/workerd/issues/5411](https://github.com/cloudflare/workerd/issues/5411)  
13. Test APIs \- Workers \- Cloudflare Docs, consulté le novembre 22, 2025, [https://developers.cloudflare.com/workers/testing/vitest-integration/test-apis/](https://developers.cloudflare.com/workers/testing/vitest-integration/test-apis/)  
14. Configuration \- Workers \- Cloudflare Docs, consulté le novembre 22, 2025, [https://developers.cloudflare.com/workers/testing/vitest-integration/configuration/](https://developers.cloudflare.com/workers/testing/vitest-integration/configuration/)  
15. Is it possible to access an existent local d1 db when using the vitest integration?, consulté le novembre 22, 2025, [https://community.cloudflare.com/t/is-it-possible-to-access-an-existent-local-d1-db-when-using-the-vitest-integration/704627](https://community.cloudflare.com/t/is-it-possible-to-access-an-existent-local-d1-db-when-using-the-vitest-integration/704627)  
16. API Testing with Vitest in Next.js: A Practical Guide to Mocking vs. Spying \- Medium, consulté le novembre 22, 2025, [https://medium.com/@sanduni.s/api-testing-with-vitest-in-next-js-a-practical-guide-to-mocking-vs-spying-5e5b37677533](https://medium.com/@sanduni.s/api-testing-with-vitest-in-next-js-a-practical-guide-to-mocking-vs-spying-5e5b37677533)  
17. \[TUTORIAL\]: Using in-memory Postgres when testing with vitest \#4205 \- GitHub, consulté le novembre 22, 2025, [https://github.com/drizzle-team/drizzle-orm/issues/4205](https://github.com/drizzle-team/drizzle-orm/issues/4205)  
18. Hitting a server action in NextJs using an API for scriping or load testing purposes, consulté le novembre 22, 2025, [https://stackoverflow.com/questions/78974977/hitting-a-server-action-in-nextjs-using-an-api-for-scriping-or-load-testing-purp](https://stackoverflow.com/questions/78974977/hitting-a-server-action-in-nextjs-using-an-api-for-scriping-or-load-testing-purp)  
19. Modern Full Stack Application Architecture Using Next.js 15+ \- SoftwareMill, consulté le novembre 22, 2025, [https://softwaremill.com/modern-full-stack-application-architecture-using-next-js-15/](https://softwaremill.com/modern-full-stack-application-architecture-using-next-js-15/)  
20. Unit testing server actions : r/nextjs \- Reddit, consulté le novembre 22, 2025, [https://www.reddit.com/r/nextjs/comments/1f83nv8/unit\_testing\_server\_actions/](https://www.reddit.com/r/nextjs/comments/1f83nv8/unit_testing_server_actions/)  
21. Rphlmr \- Drizzle Vitest Pg \- StackBlitz, consulté le novembre 22, 2025, [https://stackblitz.com/github/rphlmr/drizzle-vitest-pg](https://stackblitz.com/github/rphlmr/drizzle-vitest-pg)  
22. Is possible to run migrations in Pages build command? \- Cloudflare Developers, consulté le novembre 22, 2025, [https://www.answeroverflow.com/m/1153629940642750506](https://www.answeroverflow.com/m/1153629940642750506)  
23. D1 migrations in CI fail silently · Issue \#221 · cloudflare/wrangler-action \- GitHub, consulté le novembre 22, 2025, [https://github.com/cloudflare/wrangler-action/issues/221](https://github.com/cloudflare/wrangler-action/issues/221)  
24. Vitest Coverage Report · Actions · GitHub Marketplace, consulté le novembre 22, 2025, [https://github.com/marketplace/actions/vitest-coverage-report](https://github.com/marketplace/actions/vitest-coverage-report)  
25. Vitest Code Coverage with GitHub Actions: Report, Compare, and Block PRs on Low Coverage | by David Alvarado | Medium, consulté le novembre 22, 2025, [https://medium.com/@alvarado.david/vitest-code-coverage-with-github-actions-report-compare-and-block-prs-on-low-coverage-67fceaa79a47](https://medium.com/@alvarado.david/vitest-code-coverage-with-github-actions-report-compare-and-block-prs-on-low-coverage-67fceaa79a47)
