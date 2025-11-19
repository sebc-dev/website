# **Guide Exhaustif d'Architecture et d'Implémentation : Stratégies de Tests de Bout en Bout (E2E) pour Next.js sur l'Infrastructure Cloudflare (Édition 2025\)**

## **1\. Introduction : Le Changement de Paradigme vers l'Edge Computing et l'Assurance Qualité**

### **1.1 La Transition Architecturale : Du Monolithe au Edge Distribué**

L'année 2025 marque une étape définitive dans l'histoire du développement web, caractérisée par l'abandon progressif des architectures serveurs centralisées au profit de modèles distribués en périphérie de réseau, ou "Edge Computing". Pour les ingénieurs logiciels et les architectes déployant des applications basées sur le framework **Next.js**, cette transition ne représente pas une simple migration d'hébergement, mais une refonte fondamentale de la manière dont le code est exécuté, livré et, de manière critique, validé.  
Historiquement, les applications Next.js étaient conçues pour s'exécuter dans des environnements Node.js persistants, souvent conteneurisés via Docker ou orchestrés par Kubernetes. Dans ce modèle, l'environnement de test local (généralement un processus Node.js sur la machine du développeur) était isomorphique à l'environnement de production. Cependant, l'adoption massive de l'infrastructure **Cloudflare Workers** et **Cloudflare Pages** a rompu cette symétrie. L'application ne réside plus sur un serveur unique ; elle est atomisée et distribuée sur des milliers de points de présence (PoP) à travers le monde, s'exécutant sur le runtime **workerd**. Ce runtime, bien que basé sur V8 (le moteur JavaScript de Chrome), diffère substantiellement de Node.js. Il impose des contraintes strictes sur les I/O, la gestion de la mémoire, et l'accès aux ressources système, introduisant des classes d'erreurs inédites qui ne se manifestent que dans cet environnement spécifique.1  
Cette divergence entre l'environnement de développement (souvent Node.js pour la commodité) et l'environnement d'exécution (Edge) a créé un "fossé de la fidélité" (fidelity gap). Une stratégie de test de bout en bout (E2E) efficace en 2025 ne doit plus se contenter de vérifier la logique métier fonctionnelle ; elle doit impérativement valider l'intégrité de l'application au sein des contraintes du runtime Edge. C'est dans ce contexte que la mise en place d'une infrastructure de test rigoureuse devient une nécessité opérationnelle, et non plus une option de luxe.

### **1.2 L'Avènement d'OpenNext : Le Nouveau Standard de Déploiement**

L'élément le plus critique à assimiler pour tout projet Next.js sur Cloudflare en 2025 est l'évolution des adaptateurs de déploiement. Pendant plusieurs années, la communauté s'est appuyée sur @cloudflare/next-on-pages pour transpiler les applications Next.js vers le format compatible Workers. Cependant, cette solution présentait des limitations structurelles majeures, notamment l'incapacité de supporter pleinement les fonctionnalités dynamiques avancées de Next.js, telles que la régénération statique incrémentielle (ISR) ou les API Routes complexes nécessitant un environnement Node.js complet.  
Depuis le début de l'année 2025, un pivot stratégique a eu lieu. Cloudflare, en collaboration avec la communauté open-source, a officiellement désigné **OpenNext** (via le paquet @opennextjs/cloudflare) comme la voie recommandée et pérenne pour le déploiement.2 Contrairement à son prédécesseur, OpenNext ne se contente pas d'une traduction superficielle ; il orchestre une transformation profonde de l'application, séparant intelligemment le code serveur (transformé en Worker) des actifs statiques, tout en intégrant des couches de compatibilité sophistiquées pour émuler les API Node.js manquantes via unenv.2  
Ce changement de standard a des répercussions immédiates sur les tests E2E :  
Premièrement, les pipelines d'intégration continue (CI) doivent être purgés de toute référence à next-on-pages.  
Deuxièmement, et c'est le point crucial, les tests doivent s'exécuter contre un environnement local qui simule fidèlement l'architecture d'OpenNext. Tester contre le serveur de développement standard (next dev) est désormais considéré comme une anti-pratique, car cela masque les problèmes potentiels liés à la transformation du code par OpenNext et aux spécificités du runtime workerd.  
Troisièmement, la configuration de l'infrastructure de test repose désormais entièrement sur le fichier wrangler.toml (ou sa variante moderne wrangler.jsonc), qui devient la source de vérité absolue définissant les liaisons (bindings) vers les bases de données et les espaces de stockage.5

### **1.3 Objectifs Stratégiques de ce Rapport**

Ce rapport a pour vocation de servir de document de référence technique pour les équipes d'ingénierie souhaitant établir une "Quality Gate" (barrière de qualité) infranchissable pour leurs applications Next.js sur Cloudflare. Nous dépasserons la simple énumération de commandes pour analyser en profondeur les justifications architecturales de chaque choix.  
L'analyse couvrira :

1. Une évaluation comparative rigoureuse des frameworks de test, justifiant la suprématie de Playwright en 2025\.
2. Une méthodologie détaillée pour configurer un environnement de développement local hybride, capable d'exécuter Next.js via OpenNext tout en simulant les services Cloudflare (D1, KV).
3. Les techniques avancées de gestion de l'état des données (Data Seeding) dans un environnement de base de données distribué et serverless comme D1.
4. L'architecture d'un pipeline CI/CD sur GitHub Actions, optimisé pour la performance et résilient face aux problèmes de "processus fantômes" qui affligent souvent les tests E2E.

---

## **2\. Analyse Comparative et Sélection du Framework de Test**

Dans l'écosystème technologique de 2025, le choix d'un framework de test E2E n'est pas une simple question de syntaxe, mais une décision d'infrastructure ayant des impacts directs sur les coûts de CI, la vitesse de feedback pour les développeurs et la fiabilité des déploiements. Deux acteurs dominent le marché : **Cypress** et **Playwright**. Cependant, pour une application hébergée sur le Edge Cloudflare, l'analyse technique révèle une divergence nette en faveur de l'un d'eux.

### **2.1 Architecture et Performance : La Supériorité du Modèle WebSocket**

Pour comprendre l'écart de performance, il est impératif d'examiner l'architecture sous-jacente des deux outils. Cypress fonctionne selon un modèle "in-process". Il injecte son propre code JavaScript directement dans le navigateur, s'exécutant dans la même boucle d'événements (Event Loop) que l'application testée. Bien que cela permette un accès aisé au DOM, cette architecture impose une surcharge significative et limite la capacité de l'outil à gérer des scénarios complexes impliquant plusieurs onglets ou des origines multiples, fréquents dans les flux d'authentification modernes (OAuth).  
À l'opposé, **Playwright** utilise une architecture "out-of-process". Il communique avec le navigateur via le protocole **Chrome DevTools Protocol (CDP)** sur une connexion WebSocket.1 Cette séparation permet au testeur de piloter le navigateur de l'extérieur, libérant ainsi les ressources du navigateur pour l'application elle-même.  
Les benchmarks de 2025 sont sans appel : Playwright exécute les suites de tests en mode "headless" environ **42 % plus rapidement** que Cypress.1 Dans un contexte d'intégration continue comme GitHub Actions, où la facturation est basée sur le temps de calcul (à la minute), cette différence de vitesse se traduit directement par une réduction substantielle des coûts opérationnels (OPEX). De plus, Playwright offre une parallélisation native (Sharding) qui permet de distribuer les tests sur plusieurs machines virtuelles sans surcoût de licence, là où Cypress incite souvent à l'utilisation de services dashboard payants pour obtenir des fonctionnalités similaires.1

### **2.2 La Nécessité Impérative du Moteur WebKit**

L'une des contraintes les plus fortes du développement web mobile est l'hégémonie de Safari sur iOS. Sur tous les iPhones et iPads, quel que soit le navigateur affiché à l'utilisateur (Chrome, Firefox pour iOS), le moteur de rendu sous-jacent est obligatoirement **WebKit**. Une application peut fonctionner parfaitement sur Chromium (le moteur de Chrome et Edge) mais présenter des bugs critiques de rendu ou de comportement JavaScript sur WebKit, en raison de différences dans la gestion des dates, des expressions régulières ou du positionnement CSS.  
Pour une application hébergée sur Cloudflare, dont la promesse est une disponibilité mondiale à faible latence, ignorer les utilisateurs iOS est inenvisageable. Ici, Playwright se distingue par son intégration de binaires natifs pour les trois moteurs majeurs : **Chromium**, **Firefox** et **WebKit**.6 Il ne s'agit pas d'émulations approximatives, mais de versions compilées des moteurs réels, patchées pour le testing. Cela garantit que les tests E2E capturent fidèlement les idiosyncrasies de Safari. Cypress, bien qu'ayant fait des progrès avec un support expérimental pour WebKit, reste historiquement moins fiable et plus lent sur ce moteur spécifique, nécessitant souvent des configurations complexes pour atteindre une parité fonctionnelle.1

### **2.3 Résilience et Mécanismes d'Attente Automatique ("Auto-Waiting")**

Les applications Next.js modernes, qui utilisent intensivement le rendu côté client (CSR), l'hydratation partielle et les "Server Actions", sont intrinsèquement asynchrones. Le DOM évolue constamment, et les éléments peuvent apparaître, disparaître ou changer d'état en quelques millisecondes. Ce dynamisme est la cause principale des tests "flaky" (intermittents), qui échouent aléatoirement sans changement de code, minant la confiance des développeurs dans la suite de tests.  
Playwright a résolu ce problème en intégrant un mécanisme d'**attente automatique (Auto-waiting)** au cœur de son API. Avant d'effectuer une action (comme un clic ou une saisie de texte), Playwright vérifie automatiquement une série de conditions d'actionnabilité : l'élément est-il visible? Est-il stable (ne bouge pas)? Est-il activé? Est-il recouvert par un autre élément?.6 En 2025, cette approche est devenue le standard de l'industrie, rendant obsolète l'utilisation de pauses explicites (sleep) ou de boucles de réessai manuelles qui polluent le code de test. Pour une application Cloudflare Workers, où la latence réseau peut varier légèrement selon le nœud Edge sollicité, cette robustesse est essentielle pour maintenir un pipeline CI vert et fiable.

### **2.4 Conclusion sur la Sélection Technologique**

## La synthèse des données techniques et économiques désigne **Playwright** comme l'outil incontournable pour ce projet. Sa vitesse d'exécution supérieure, sa gestion native de WebKit indispensable pour le mobile, et son architecture robuste alignée sur les défis du web moderne en font le choix rationnel pour tout projet sérieux hébergé sur Cloudflare en 2025\.1 Les chapitres suivants de ce rapport présupposent donc l'utilisation de Playwright.

## **3\. Conception et Configuration de l'Environnement de Développement Local**

La pierre angulaire d'une stratégie de test efficace est la capacité à reproduire l'environnement de production sur la machine locale. Pour Next.js sur Cloudflare, cela signifie abandonner le confort du serveur Node.js standard pour embrasser les contraintes du runtime workerd.

### **3.1 La Migration vers l'Adaptateur @opennextjs/cloudflare**

Comme évoqué en introduction, l'écosystème a pivoté vers OpenNext. Si le projet utilise encore d'anciennes méthodes de déploiement, la migration est un prérequis aux tests. OpenNext fonctionne en analysant le build de Next.js et en le restructurant pour qu'il soit compatible avec les Workers.  
L'installation se fait via npm :

Bash

npm install \--save-dev @opennextjs/cloudflare wrangler@latest

Un fichier de configuration open-next.config.ts à la racine du projet permet de piloter le comportement de l'adaptateur. En 2025, ce fichier est le lieu privilégié pour configurer des fonctionnalités avancées comme le cache incrémentiel (ISR), qui peut utiliser le stockage KV ou R2 de Cloudflare pour persister les pages générées statiquement.9  
Exemple de configuration minimale pour open-next.config.ts :

TypeScript

import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({  
 // Activation du cache ISR via KV pour les performances  
 // incrementalCache:...  
});

### **3.2 Configuration de l'Infrastructure Virtuelle : wrangler.jsonc**

Le fichier wrangler.jsonc (format JSON avec commentaires, préféré au TOML en 2025 pour sa flexibilité) agit comme le plan d'architecte de votre Worker.5 Il définit non seulement le point d'entrée de l'application, mais aussi toutes les ressources externes (bases de données, buckets de stockage) auxquelles l'application a accès.  
Pour que les tests soient valides, ce fichier doit impérativement inclure le drapeau de compatibilité nodejs_compat. Sans ce drapeau, les polyfills (unenv) nécessaires pour simuler les modules Node.js (comme Buffer, process, ou events) dans le runtime Edge ne seront pas activés, entraînant un échec immédiat du démarrage du serveur.10  
La configuration des actifs statiques est également spécifique à OpenNext. Contrairement aux anciens builds Vercel, OpenNext place généralement le worker généré dans un dossier .open-next/worker.js et les assets dans .open-next/assets.12 Il est crucial de refléter ces chemins dans la configuration.  
**Tableau 1 : Configuration Critique de wrangler.jsonc pour OpenNext**

| Clé de Configuration | Valeur Recommandée   | Justification Technique                                           |
| :------------------- | :------------------- | :---------------------------------------------------------------- |
| main                 | .open-next/worker.js | Pointeur vers le code serveur transformé par OpenNext.            |
| compatibility_flags  | \["nodejs_compat"\]  | **Critique.** Active les polyfills Node.js dans workerd.          |
| compatibility_date   | 2024-09-23 (ou \+)   | Assure l'accès aux API modernes du runtime Workers.               |
| assets.directory     | .open-next/assets    | Indique à Wrangler où servir les fichiers CSS/JS/Images.          |
| assets.binding       | ASSETS               | Permet au Worker d'accéder aux fichiers statiques via un binding. |

Voici un exemple complet de configuration wrangler.jsonc prête pour les tests :

JSON

{  
 "$schema": "node_modules/wrangler/config-schema.json",  
 "name": "mon-projet-nextjs-e2e",  
 "main": ".open-next/worker.js",  
 "compatibility_date": "2024-09-23",  
 "compatibility_flags": \["nodejs_compat"\],  
 "assets": {  
 "directory": ".open-next/assets",  
 "binding": "ASSETS"  
 },  
 "d1_databases":,  
 "kv_namespaces":  
}

### **3.3 La Stratégie de Lancement du Serveur de Test**

Pour les tests E2E, nous devons valider l'artefact de production, et non le mode développement (next dev) qui supporte le remplacement de module à chaud (HMR) mais ne reflète pas les contraintes de mémoire ou de sécurité du Edge.  
La commande de prévisualisation doit donc enchaîner deux étapes distinctes :

1. **La Construction (Build) :** Transformer le code source Next.js en un artefact compatible Workers via opennextjs-cloudflare.
2. **L'Exécution (Run) :** Lancer cet artefact avec wrangler dev, qui instancie le runtime workerd localement.

Il est recommandé de définir un script preview explicite dans le package.json pour encapsuler cette complexité.13

JSON

{  
 "scripts": {  
 "build": "next build",  
 "build:worker": "opennextjs-cloudflare",  
 "preview": "npm run build:worker && wrangler dev \--port 8788 \--ip 127.0.0.1"  
 }  
}

L'ajout explicite de \--ip 127.0.0.1 est une mesure de précaution technique importante. Dans les versions récentes de Node.js (v18+ et surtout v20+), la résolution DNS de localhost peut basculer de manière imprévisible entre IPv4 (127.0.0.1) et IPv6 (::1). Si Wrangler écoute sur IPv6 mais que Playwright tente de se connecter sur IPv4, les tests échoueront avec une erreur de connexion refusée (ECONNREFUSED). Forcer l'IPv4 élimine cette classe d'erreurs intermittentes.15  
Il est également pertinent de noter la distinction entre wrangler dev et wrangler pages dev. Bien que next-on-pages utilisait historiquement la commande Pages, l'architecture OpenNext génère un Worker standard. Par conséquent, wrangler dev est la commande la plus appropriée et la plus stable pour l'émulation locale dans ce contexte spécifique, offrant une meilleure gestion des bindings et une parité plus stricte avec le déploiement final.17

---

## **4\. Orchestration et Automatisation avec Playwright**

Une fois l'infrastructure locale capable de simuler le cloud, il faut orchestrer le lancement de ce serveur et l'exécution des tests de manière fluide. Le fichier playwright.config.ts est le centre de commandement de cette opération.

### **4.1 Configuration du webServer : Le Cœur de l'Automatisation**

Playwright dispose d'une fonctionnalité native puissante appelée webServer. Elle permet de définir une commande shell que Playwright exécutera en arrière-plan avant de lancer les tests. Playwright attendra ensuite que le serveur réponde (via HTTP) avant de commencer.  
Cette configuration doit être ajustée avec précision pour gérer les temps de build de Next.js, qui peuvent être longs.

TypeScript

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({  
 testDir: './e2e',  
 fullyParallel: true, // Active le parallélisme pour la vitesse  
 forbidOnly:\!\!process.env.CI, // Sécurité: empêche de commiter des tests isolés (test.only)  
 retries: process.env.CI? 2 : 0, // Relance les tests échoués en CI pour gérer la flakiness réseau  
 workers: process.env.CI? 1 : undefined, // Voir section 6.3 sur l'usage CPU  
 reporter: 'html',

use: {  
 baseURL: 'http://127.0.0.1:8788', // Correspond à l'IP/Port forcés dans wrangler  
 trace: 'on-first-retry', // Capture une trace complète uniquement en cas d'échec  
 video: 'on-first-retry',  
 },

webServer: {  
 // La commande lance le build complet puis le serveur  
 command: 'npm run preview',

    // Playwright envoie des requêtes HEAD à cette URL pour vérifier la disponibilité
    url: 'http://127.0.0.1:8788',

    // Expérience Développeur (DX) : En local, si le serveur tourne déjà, on l'utilise.
    // En CI, on force toujours un nouveau processus pour garantir un état propre.
    reuseExistingServer:\!process.env.CI,

    // Timeout étendu à 2 minutes (120s).
    // Le "Cold Start" du build Next.js \+ OpenNext \+ Wrangler peut dépasser les 60s par défaut.
    timeout: 120 \* 1000,

    // Redirection des sorties standard pour faciliter le débogage des erreurs de build en CI
    stdout: 'pipe',
    stderr: 'pipe',

},

projects: },  
 },  
 {  
 name: 'firefox',  
 use: {...devices },  
 },  
 {  
 name: 'webkit', // Le test critique pour la compatibilité iOS/Safari  
 use: {...devices },  
 },  
 {  
 name: 'Mobile Safari', // Simulation d'un appareil réel  
 use: {...devices\['iPhone 12'\] },  
 },  
 \],  
});

### **4.2 Analyse du Problème de Blocage ("Hang") des Processus en CI**

Un problème technique subtil mais critique, documenté abondamment dans les issues GitHub en 2025, est le "Wrangler Hang".15 Dans un environnement CI/CD, il arrive que le job ne se termine jamais, atteignant son timeout global (souvent 60 minutes), car le processus wrangler dev refuse de s'arrêter proprement après la fin des tests.  
Techniquement, cela se produit lorsque Playwright envoie un signal SIGTERM au processus enfant. wrangler dev, qui lance lui-même des sous-processus (notamment miniflare et le runtime workerd), peut échouer à propager ce signal correctement si des connexions WebSocket sont actives ou si des opérations de base de données sont en attente. Le processus reste alors en état "zombie", bloquant la fermeture du conteneur CI.  
L'utilisation explicite de l'adresse IP 127.0.0.1 au lieu de localhost dans la configuration webServer (comme mentionné précédemment) est une première ligne de défense efficace. De plus, s'assurer que le script npm run preview n'est pas encapsulé dans d'autres wrappers shell inutiles aide Playwright à identifier le bon PID (Process ID) à tuer. Dans les cas extrêmes, l'utilisation de paquets tiers comme start-server-and-test peut offrir une gestion plus robuste des signaux, mais la configuration native de Playwright est généralement suffisante si l'ambiguïté IPv6 est résolue.16

---

## **5\. Gestion Avancée des Données : Le Défi de Cloudflare D1**

Le "State Management" (gestion de l'état) est souvent le parent pauvre des tutoriels de test, alors qu'il est la cause principale de l'instabilité des suites E2E. Pour une application utilisant **Cloudflare D1** (la base de données SQL serverless basée sur SQLite), nous devons garantir que chaque exécution de test démarre avec une base de données dans un état connu et prévisible.

### **5.1 Persistance et Volatilité en Développement Local**

Lorsque vous lancez wrangler dev localement, D1 ne communique pas avec le cloud. Il crée des fichiers .sqlite locaux pour simuler la base de données. Ces fichiers sont stockés dans le répertoire caché .wrangler/state/v3/d1 à la racine du projet.1  
Le comportement par défaut est la persistance : si vous créez un utilisateur lors d'un test aujourd'hui, il sera toujours là demain si vous relancez le serveur. Pour des tests automatisés, c'est un problème. Un test qui s'attend à créer un utilisateur avec l'email test@example.com échouera la deuxième fois car la contrainte d'unicité (UNIQUE CONSTRAINT) sera violée.

### **5.2 Stratégie de "Seeding" Déterministe**

La solution consiste à "seeder" (alimenter) la base de données au démarrage de la session de test. Cela implique généralement deux étapes :

1. **Nettoyage (Teardown) :** Supprimer les données existantes ou réinitialiser le schéma.
2. **Alimentation (Seed) :** Insérer les données de référence nécessaires aux tests.

Cloudflare fournit la commande wrangler d1 execute pour exécuter du SQL. **L'option la plus critique ici est le drapeau \--local**. Omettre ce drapeau est une erreur fatale qui pourrait conduire votre pipeline de test à effacer ou corrompre votre base de données de production réelle sur le cloud.11  
La syntaxe correcte et sécurisée pour 2025 est :

Bash

npx wrangler d1 execute \<NOM_DU_BINDING\> \--local \--file=./tests/seed.sql

Où \<NOM_DU_BINDING\> correspond à la valeur définie sous \[\[d1_databases\]\] dans votre wrangler.jsonc (par exemple, "DB").

### **5.3 Implémentation via le globalSetup de Playwright**

Pour automatiser ce processus, nous allons utiliser le hook globalSetup de Playwright. Ce script s'exécute une seule fois, au tout début de la suite de tests, avant même que le premier navigateur ne soit lancé. C'est l'endroit idéal pour préparer l'infrastructure.  
Créez un fichier tests/global-setup.ts :

TypeScript

import { execSync } from 'child_process';  
import fs from 'fs';  
import path from 'path';

async function globalSetup() {  
 console.log('🚀 Démarrage du Global Setup : Initialisation de D1...');

// Optionnel : Reset violent en supprimant les fichiers physiques  
 // Cela garantit un état vierge absolu, mais dépend de l'emplacement des fichiers Wrangler  
 /\*  
 const d1StatePath \= path.join(process.cwd(), '.wrangler/state/v3/d1');  
 if (fs.existsSync(d1StatePath)) {  
 console.log(' \-\> Purge du cache local Wrangler D1...');  
 fs.rmSync(d1StatePath, { recursive: true, force: true });  
 }  
 \*/

try {  
 // 1\. Application du schéma (Migrations)  
 // Cela crée les tables si elles n'existent pas (ou après une purge)  
 console.log(' \-\> Application du schéma SQL (Migrations)...');  
 // Note: 'DB' doit correspondre exactement au nom du binding dans wrangler.jsonc  
 execSync('npx wrangler d1 execute DB \--local \--file=./migrations/schema.sql', { stdio: 'inherit' });

    // 2\. Injection des données de test (Seed)
    console.log('   \-\> Injection des données de test (Seed)...');
    execSync('npx wrangler d1 execute DB \--local \--file=./tests/fixtures/seed\_data.sql', { stdio: 'inherit' });

    console.log('✅ Base de données D1 initialisée avec succès.');

} catch (error) {  
 console.error('❌ Erreur critique lors de l\\'initialisation de la base de données D1.');  
 // En cas d'échec du setup, on doit arrêter les tests immédiatement pour éviter les faux négatifs  
 throw error;  
 }  
}

export default globalSetup;

Enregistrez ensuite ce fichier dans playwright.config.ts :

TypeScript

export default defineConfig({  
 globalSetup: require.resolve('./tests/global-setup'),  
 //... reste de la config  
});

## Cette approche offre une garantie forte : peu importe l'état précédent de la machine développeur ou du runner CI, les tests démarreront toujours avec une base de données synchronisée avec le code.1

## **6\. Architecture du Pipeline d'Intégration Continue (CI/CD)**

L'automatisation locale n'est que la première étape. L'objectif final est un pipeline CI robuste sur GitHub Actions qui valide chaque Pull Request.

### **6.1 Gestion Sécurisée des Secrets**

Bien que les tests s'exécutent en mode "local" (--local), Wrangler nécessite souvent une authentification pour valider la configuration du projet, télécharger des assets distants ou vérifier les droits du compte. Il est donc indispensable d'injecter les identifiants Cloudflare dans l'environnement CI.  
Les variables CLOUDFLARE_API_TOKEN et CLOUDFLARE_ACCOUNT_ID doivent être définies dans les "Repository Secrets" de GitHub. Elles ne doivent jamais apparaître en clair dans le code ou les fichiers de configuration commités.25

### **6.2 Optimisation des Ressources et Contraintes Matérielles**

Les runners GitHub Actions standard (l'offre gratuite ou standard incluse) disposent de ressources limitées, généralement 2 vCPU et 7 Go de RAM. Lancer une application Next.js (gourmande en mémoire lors du build), le runtime workerd, et plusieurs instances de navigateurs Playwright en parallèle peut rapidement saturer ces ressources.  
La saturation CPU se manifeste par des tests lents, des timeouts aléatoires et des échecs d'hydratation dans le navigateur. Pour mitiger cela, une stratégie conservatrice est recommandée pour la configuration CI : limiter le nombre de "workers" Playwright (le nombre de tests exécutés en parallèle).  
Dans playwright.config.ts, nous utilisons cette logique conditionnelle :

TypeScript

workers: process.env.CI? 1 : undefined,

Cela force l'exécution séquentielle des fichiers de test en CI (1 par 1), ce qui est plus lent mais infiniment plus stable. En local, Playwright utilisera tous les cœurs disponibles pour une vitesse maximale.1

### **6.3 Configuration Complète du Workflow GitHub Actions**

Voici le fichier .github/workflows/e2e.yml recommandé pour 2025, intégrant le cache et la gestion des dépendances système.

YAML

name: Tests E2E (Playwright)

on:  
 push:  
 branches: \[ main \]  
 pull_request:  
 branches: \[ main \]

jobs:  
 test:  
 timeout-minutes: 60  
 runs-on: ubuntu-latest

    env:
      \# Force le mode non-interactif
      CI: true
      \# Injection sécurisée des secrets pour Wrangler
      CLOUDFLARE\_API\_TOKEN: ${{ secrets.CLOUDFLARE\_API\_TOKEN }}
      CLOUDFLARE\_ACCOUNT\_ID: ${{ secrets.CLOUDFLARE\_ACCOUNT\_ID }}

    steps:
    \- name: Récupération du code source
      uses: actions/checkout@v4

    \- name: Installation de Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20' \# Version LTS recommandée pour 2025, alignée avec Cloudflare
        cache: 'npm'

    \- name: Installation des dépendances du projet
      run: npm ci

    \- name: Installation des navigateurs Playwright
      \# \--with-deps installe les dépendances système Linux (GTK, GStreamer, etc.)
      \# Indispensable pour WebKit et Firefox en mode headless sur Linux
      run: npx playwright install \--with-deps

    \- name: Construction de l'application (OpenNext)
      \# Cette étape génère le dossier.open-next/ nécessaire au démarrage de Wrangler
      run: npm run build:worker

    \- name: Exécution des Tests E2E
      \# Playwright détecte automatiquement la config webServer et lance 'npm run preview'
      run: npx playwright test

    \- name: Sauvegarde des rapports de test
      \# Cette étape s'exécute toujours, même si les tests échouent, pour permettre le débogage
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30

---

## **7\. Stratégies Avancées et Bonnes Pratiques**

Au-delà de l'infrastructure, la qualité des tests eux-mêmes est primordiale. Tester une application Edge impose des considérations spécifiques.

### **7.1 Simulation des Headers de Géolocalisation**

L'une des fonctionnalités phares de Cloudflare Workers est la capacité d'adapter le contenu en fonction de la localisation de l'utilisateur (ex: afficher des prix en Euros pour la France). Cette information est exposée via l'objet request.cf. En local, cet objet est souvent vide.  
Playwright permet de simuler ce comportement en injectant des headers HTTP personnalisés. Wrangler, en mode dev, est conçu pour respecter certains headers de débogage ou peut être configuré pour simuler une localisation.

TypeScript

// Exemple de test Playwright  
test('Affiche le contenu français pour un visiteur FR', async ({ page }) \=\> {  
 // Injection du header que le Worker interprétera  
 await page.setExtraHTTPHeaders({  
 'cf-ipcountry': 'FR'  
 });  
 await page.goto('/');  
 await expect(page.locator('h1')).toContainText('Bonjour');  
});

### **7.2 Gestion de l'Authentification et des Cookies**

Si votre application utilise des cookies sécurisés (HttpOnly) pour l'authentification, il est inefficace de se reconnecter via l'interface utilisateur à chaque test. Utilisez la méthode page.context().addCookies() pour injecter un cookie de session valide directement dans le contexte du navigateur.  
Cependant, une subtilité technique existe avec le sessionStorage. Contrairement au localStorage qui persiste, le sessionStorage est vidé à la fermeture de l'onglet. Si votre logique d'authentification s'y appuie, vous devez utiliser page.addInitScript pour réinjecter les données au moment précis où la page est créée, avant que le code de l'application ne s'exécute.26

### **7.3 Mocking Réseau pour la Résilience**

Les tests E2E complets sont parfaits pour le "Happy Path", mais comment tester que votre application gère correctement une panne de l'API Stripe ou une erreur 500 de votre CMS headless? Playwright excelle dans le "Network Mocking" via page.route().

TypeScript

// Simuler une erreur 500 sur une API tierce  
await page.route('\*\*/api/payment', route \=\> {  
 route.fulfill({  
 status: 500,  
 body: JSON.stringify({ error: 'Service Unavailable' }),  
 });  
});  
// Vérifier que l'UI affiche un message d'erreur convivial à l'utilisateur  
await expect(page.getByText('Le paiement a échoué, veuillez réessayer')).toBeVisible();

## Cela permet de valider la robustesse de votre code Error Boundary dans Next.js, un aspect souvent négligé mais critique pour l'expérience utilisateur.

## **8\. Conclusion**

L'implémentation de tests E2E pour Next.js sur Cloudflare en 2025 exige une approche holistique. Il ne s'agit plus seulement de tester des composants React, mais de valider une architecture distribuée complexe.  
En abandonnant les pratiques obsolètes (next-on-pages), en adoptant les standards modernes (**OpenNext**, **Playwright**), et en maîtrisant l'émulation locale du runtime Edge (**Wrangler**, **D1 Seeding**), les équipes de développement peuvent atteindre un niveau de confiance élevé. L'investissement initial dans cette infrastructure de test rigoureuse est rapidement amorti par la réduction drastique des régressions en production et l'accélération des cycles de déploiement.

### **Synthèse des Recommandations Clés**

1. **Standardiser sur OpenNext :** Migrer immédiatement tout projet utilisant encore l'adaptateur legacy.
2. **Adopter Playwright :** Pour sa vitesse, son support WebKit natif et son architecture WebSocket.
3. **Configurer wrangler.jsonc avec nodejs_compat :** C'est la clé de voûte de la compatibilité du runtime.
4. **Automatiser le Seeding D1 :** Utiliser wrangler d1 execute \--local dans le globalSetup pour des données de test déterministes.
5. **Isoler l'environnement CI :** Forcer l'IPv4 (127.0.0.1) et limiter le parallélisme pour éviter les "flaky tests" liés aux ressources.

Ce guide fournit le socle technique nécessaire pour construire des applications Edge résilientes et évolutives, prêtes pour les défis du web de demain.

#### **Sources des citations**

1. Tests E2E Next.js Cloudflare Workers
2. Deploy your Next.js app to Cloudflare Workers with the Cloudflare adapter for OpenNext, consulté le novembre 19, 2025, [https://blog.cloudflare.com/deploying-nextjs-apps-to-cloudflare-workers-with-the-opennext-adapter/](https://blog.cloudflare.com/deploying-nextjs-apps-to-cloudflare-workers-with-the-opennext-adapter/)
3. cloudflare/next-on-pages: CLI to build and develop Next.js apps for Cloudflare Pages \- GitHub, consulté le novembre 19, 2025, [https://github.com/cloudflare/next-on-pages](https://github.com/cloudflare/next-on-pages)
4. opennextjs/opennextjs-cloudflare: Open Next.js adapter for Cloudflare \- GitHub, consulté le novembre 19, 2025, [https://github.com/opennextjs/opennextjs-cloudflare](https://github.com/opennextjs/opennextjs-cloudflare)
5. Configuration \- Wrangler · Cloudflare Workers docs, consulté le novembre 19, 2025, [https://developers.cloudflare.com/workers/wrangler/configuration/](https://developers.cloudflare.com/workers/wrangler/configuration/)
6. Next.js with Playwright: Writing End-to-End Test Cases | by Narayanan Sundaram | Medium, consulté le novembre 19, 2025, [https://medium.com/@narayanansundar02/next-js-with-playwright-writing-end-to-end-test-cases-bd08c65a2e12](https://medium.com/@narayanansundar02/next-js-with-playwright-writing-end-to-end-test-cases-bd08c65a2e12)
7. Integrating Playwright with Next.js — The Complete Guide \- DEV Community, consulté le novembre 19, 2025, [https://dev.to/mehakb7/integrating-playwright-with-nextjs-the-complete-guide-34io](https://dev.to/mehakb7/integrating-playwright-with-nextjs-the-complete-guide-34io)
8. Best Practices \- Playwright, consulté le novembre 19, 2025, [https://playwright.dev/docs/best-practices](https://playwright.dev/docs/best-practices)
9. Get Started \- OpenNext, consulté le novembre 19, 2025, [https://opennext.js.org/cloudflare/get-started](https://opennext.js.org/cloudflare/get-started)
10. Playwright \- Browser Rendering \- Cloudflare Docs, consulté le novembre 19, 2025, [https://developers.cloudflare.com/browser-rendering/playwright/](https://developers.cloudflare.com/browser-rendering/playwright/)
11. BUG: Exporting local d1 sql to remote fails only when a previous attempt to apply a migration failed. · Issue \#6348 · cloudflare/workers-sdk \- GitHub, consulté le novembre 19, 2025, [https://github.com/cloudflare/workers-sdk/issues/6348](https://github.com/cloudflare/workers-sdk/issues/6348)
12. Migrate from 0.2 to 0.3 \- OpenNext, consulté le novembre 19, 2025, [https://opennext.js.org/cloudflare/former-releases/migrate-from-0.2-to-0.3](https://opennext.js.org/cloudflare/former-releases/migrate-from-0.2-to-0.3)
13. Dev Deploy \- OpenNext, consulté le novembre 19, 2025, [https://opennext.js.org/cloudflare/howtos/dev-deploy](https://opennext.js.org/cloudflare/howtos/dev-deploy)
14. Get Started \- OpenNext, consulté le novembre 19, 2025, [https://opennext.js.org/cloudflare/former-releases/0.2/get-started](https://opennext.js.org/cloudflare/former-releases/0.2/get-started)
15. BUG: \`wrangler pages dev\` hangs when run in docker · Issue \#6280 · cloudflare/workers-sdk \- GitHub, consulté le novembre 19, 2025, [https://github.com/cloudflare/workers-sdk/issues/6280](https://github.com/cloudflare/workers-sdk/issues/6280)
16. "No tests" after uncommenting the webserver section in playwright.config.ts \- Reddit, consulté le novembre 19, 2025, [https://www.reddit.com/r/Playwright/comments/1dfrafm/no_tests_after_uncommenting_the_webserver_section/](https://www.reddit.com/r/Playwright/comments/1dfrafm/no_tests_after_uncommenting_the_webserver_section/)
17. Get Started \- OpenNext, consulté le novembre 19, 2025, [https://opennext.js.org/cloudflare/former-releases/0.5/get-started](https://opennext.js.org/cloudflare/former-releases/0.5/get-started)
18. Next.js \- Workers \- Cloudflare Docs, consulté le novembre 19, 2025, [https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
19. BUG: Wrangler hangs on exit after the Workers runtime fails to start · Issue \#4878 \- GitHub, consulté le novembre 19, 2025, [https://github.com/cloudflare/workers-sdk/issues/4878](https://github.com/cloudflare/workers-sdk/issues/4878)
20. BUG: Wrangler hangs when recording profile in Chrome inspector · Issue \#4409 · cloudflare/workers-sdk \- GitHub, consulté le novembre 19, 2025, [https://github.com/cloudflare/workers-sdk/issues/4409](https://github.com/cloudflare/workers-sdk/issues/4409)
21. Getting started · Cloudflare D1 docs, consulté le novembre 19, 2025, [https://developers.cloudflare.com/d1/get-started/](https://developers.cloudflare.com/d1/get-started/)
22. Local development \- D1 \- Cloudflare Docs, consulté le novembre 19, 2025, [https://developers.cloudflare.com/d1/best-practices/local-development/](https://developers.cloudflare.com/d1/best-practices/local-development/)
23. Unexpected D1 Database Deletion Behaviour in Wrangler CLI · Issue \#8995 · cloudflare/workers-sdk \- GitHub, consulté le novembre 19, 2025, [https://github.com/cloudflare/workers-sdk/issues/8995](https://github.com/cloudflare/workers-sdk/issues/8995)
24. \`wrangler dev\` crashes and/or hangs while attempting to perform local network development with \`--ip\` on macOS with Firewall enabled · Issue \#9789 · cloudflare/workers-sdk \- GitHub, consulté le novembre 19, 2025, [https://github.com/cloudflare/workers-sdk/issues/9789](https://github.com/cloudflare/workers-sdk/issues/9789)
25. GitHub Actions \- Workers \- Cloudflare Docs, consulté le novembre 19, 2025, [https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)
26. How to Bypass Cloudflare with Playwright in 2025 \- ZenRows, consulté le novembre 19, 2025, [https://www.zenrows.com/blog/playwright-cloudflare-bypass](https://www.zenrows.com/blog/playwright-cloudflare-bypass)
