# **Analyse et Recommandations de Configuration ESLint et Prettier pour le Projet sebc.dev (Stack Next.js 15 & Cloudflare 2025\)**

## **I. Analyse Stratégique : La Décision d'Outillage Fondamentale pour 2025**

En 2025, la configuration de la qualité de code pour un projet JavaScript/TypeScript moderne impose une décision architecturale majeure : faut-il adopter l'outil unifié et ultra-performant Biome, ou s'en tenir à la stack éprouvée ESLint \+ Prettier?  
Pour un projet "laboratoire d'apprentissage" comme sebc.dev, qui met l'accent sur les "bonnes pratiques d'ingénierie", cette décision doit être guidée par la robustesse et la couverture de l'outillage, et non uniquement par la performance d'exécution.

### **Évaluation de Biome par rapport aux Exigences du Projet**

Biome s'est imposé comme un remplaçant viable, offrant des performances de linting et de formatage 15x à 25x plus rapides que la combinaison ESLint/Prettier, grâce à sa conception en Rust.1 Il promet une configuration simplifiée (parfois "zéro configuration") et inclut des outils de migration.4  
Cependant, une analyse des exigences _spécifiques_ de la stack technique de sebc.dev révèle trois points de blocage critiques qui rendent Biome inapproprié pour ce projet à l'heure actuelle :

1. **Support de MDX :** Le projet est un blog dont le contenu est entièrement géré en MDX. Une exigence non négociable est la capacité de linter les blocs de code TypeScript/React (TSX) _à l'intérieur_ des fichiers.mdx. En 2025, le support de MDX par Biome est, au mieux, expérimental et incomplet.6 La stack ESLint, via le plugin eslint-plugin-mdx, est la seule solution mature capable de parser et d'analyser ce contenu de manière fiable.9
2. **Linting Typé (Type-Aware) :** L'architecture du projet (Next.js 15, Drizzle, Zod, React Hook Form) repose sur une chaîne de validation TypeScript de bout en bout. Le linting "type-aware" (qui utilise les informations du compilateur TypeScript via parserOptions.project) est essentiel pour garantir la robustesse du code. C'est le principal reproche fait à Biome en 2025 : il ne dispose pas d'un système de linting typé équivalent à celui de typescript-eslint.3
3. **Écosystème de Plugins :** Biome n'a pas de système de plugins.3 La stack de sebc.dev nécessite des plugins spécifiques pour next-intl (internationalisation), Vitest (tests) et Drizzle (ORM), qui n'existent que dans l'écosystème ESLint. Des développeurs reviennent activement à ESLint en 2025 en raison de ce manque de flexibilité.7

### **Recommandation Architecturale**

Le projet sebc.dev se situe précisément à l'intersection des trois faiblesses actuelles de Biome (support MDX, linting typé et écosystème de plugins).  
**Recommandation :** Adopter la stack classique **ESLint \+ Prettier**. Pour adhérer à la philosophie de "laboratoire d'apprentissage" du projet, la configuration ESLint sera implémentée en utilisant le format moderne "Flat Config" (le fichier eslint.config.mjs), qui est la norme en 2025\.11

## **II. Configuration "Opinionated" de Prettier pour l'Auteur Solo**

Pour un auteur unique, la priorité de Prettier est de garantir une cohérence absolue et d'éliminer toute ambiguïté stylistique.13 La configuration suivante est recommandée pour le projet, à placer dans un fichier prettier.config.js à la racine.

### **Fichier prettier.config.js Recommandé**

Ce fichier inclut le plugin fondamental pour un projet utilisant TailwindCSS 4 et shadcn/ui.

JavaScript

/\*\* @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} \*/  
const config \= {  
 // Philosophie : Stricte et cohérente pour un auteur unique  
 printWidth: 80, // Standard historique pour la lisibilité  
 tabWidth: 2, // Standard de la communauté \[13\]  
 useTabs: false, // Standard de la communauté \[13\]  
 semi: true, // Le plus sûr, évite les ambiguïtés \[13, 15\]  
 singleQuote: true, // Cohérence en JS/TS  
 jsxSingleQuote: true, // Cohérence en JSX \[13, 16\]  
 trailingComma: 'all', // Facilite les diffs git, plus moderne que 'es5' \[13\]  
 bracketSpacing: true,

// Plugin critique pour la stack du projet  
 plugins: \['prettier-plugin-tailwindcss'\],  
};

export default config;

### **Justification des Plugins**

- **prettier-plugin-tailwindcss** : C'est le plugin le plus important de cette configuration. Le projet utilise TailwindCSS 4 et shadcn/ui, ce qui génère des listes de classes utilitaires longues et complexes. Ce plugin trie automatiquement et de manière canonique les classes Tailwind à chaque sauvegarde.17 Son inclusion est non négociable pour la maintenabilité du code.16

### **Séparation des Responsabilités (Tri des Imports)**

Il est tentant d'ajouter un plugin Prettier pour le tri des imports (comme prettier-plugin-import-sort). Cette approche est déconseillée. Le formatage (virgules, espaces) est la responsabilité de Prettier. L'ordre des imports, en revanche, est une question de logique de dépendance et de qualité de code.  
Cette responsabilité sera donc déléguée à ESLint (via eslint-plugin-simple-import-sort) pour une séparation claire des préoccupations.20 L'action eslint \--fix corrigera alors à la fois la logique du code et l'ordre des imports.

## **III. Architecture de la Configuration ESLint "Flat Config"**

La configuration ESLint sera définie dans un unique fichier eslint.config.mjs à la racine, utilisant le format "Flat Config".12 Cette approche, standard en 2025, est modulaire et remplace l'ancien fichier .eslintrc.json.  
L'architecture de ce fichier doit couvrir l'intégralité de la stack technique de sebc.dev : JavaScript, TypeScript (avec linting typé), React, Next.js 15, MDX, TailwindCSS, next-intl, Vitest et Prettier.

### **Partie 1 : Fondations (JS, TypeScript, React, Next.js)**

Le cœur de la configuration établit les règles de base pour le code de l'application.

- **JavaScript et React :** Nous utilisons les configurations recommandées de @eslint/js et eslint-plugin-react (via sa nouvelle API flat config).12
- **Linting Typé (Type-Aware) :** C'est l'exigence la plus critique pour la qualité. Nous utilisons tseslint.configs.recommendedTypeChecked.23 Cela active des règles puissantes qui utilisent le compilateur TypeScript.
- **parserOptions.project \= true :** C'est la meilleure pratique en 2025\.25 Plutôt que de pointer manuellement vers tsconfig.json, cette option permet à typescript-eslint de découvrir automatiquement les bons fichiers tsconfig.json pour chaque fichier linté, ce qui est crucial dans un projet moderne.
- **Intégration de Next.js :** En 2025, eslint-config-next n'est pas encore un plugin "flat config" natif. Pour l'intégrer, nous devons utiliser l'utilitaire FlatCompat fourni par @eslint/eslintrc. Cela permet de "wrapper" l'ancienne configuration extends: \["next/core-web-vitals"\] dans le nouveau format.22

### **Partie 2 : Gestion des Conflits (Prettier)**

Pour que Prettier et ESLint coexistent, eslint-config-prettier doit être inclus.27 Ce module désactive toutes les règles de style d'ESLint (de typescript-eslint, eslint-plugin-react, etc.) qui pourraient entrer en conflit avec Prettier.28 Il doit impérativement être placé en **dernière position** dans le tableau de configuration.

### **Partie 3 : Plugins Spécifiques à la Stack**

- **MDX (L'intégration la plus complexe) :**
  - **Problème :** Comment linter les blocs de code TSX _à l'intérieur_ des fichiers.mdx _avec_ le linting typé (Type-Aware)?
  - **Analyse :** Les développeurs qui tentent cela rencontrent une erreur courante : les règles de linting typé (ex: @typescript-eslint/consistent-type-exports) échouent, car le "fichier virtuel" généré par eslint-plugin-mdx (ex: index.mdx/4_3.ts) n'est pas trouvé par le compilateur TypeScript, car il n'est pas inclus dans le tsconfig.json.29
  - **Solution Architecturale (2 étapes) :**
    1. **ESLint (eslint.config.mjs) :** Inclure eslint-plugin-mdx et sa configuration flatConfigs.recommended.10
    2. **TypeScript (tsconfig.json) :** C'est l'étape cruciale. Modifier le tsconfig.json pour y ajouter "\*\*/\*.mdx" et "\*\*/\*.md" au tableau include. Cela force le compilateur TypeScript à "voir" ces fichiers. Ainsi, lorsque typescript-eslint demandera des informations de type pour le bloc de code virtuel, le TS Server sera capable de les lui fournir.29
- **Tri des Imports :** Conformément à la Section II, nous utilisons eslint-plugin-simple-import-sort. Ce plugin s'intègre à eslint \--fix.20
- **Qualité de Code (Unicorn) :** Pour un auteur solo visant les "bonnes pratiques", eslint-plugin-unicorn est un excellent choix. Il ajoute des centaines de règles "opinionated" qui améliorent la qualité et la maintenabilité du code.22
- **Internationalisation (i18n) :** Le projet utilise next-intl. Le plugin eslint-plugin-next-intl doit être ajouté pour renforcer les bonnes pratiques liées à la gestion des traductions et des clés.

### **Partie 4 : Isolation des Configurations de Test (Vitest)**

Les règles de linting pour les tests (ex: autoriser les describe globaux, utiliser les getBy de Testing Library) ne doivent jamais s'appliquer au code source de l'application.32  
Le format "Flat Config" permet de résoudre ce problème élégamment en créant un objet de configuration distinct qui ne s'applique qu'aux fichiers de test, en utilisant un glob de fichiers :

- **Cible (Glob) :** Nous ciblons les fichiers de test en utilisant le glob par défaut de Vitest : \['\*\*/\*.{test,spec}.?(c|m)\[jt\]s?(x)'\].34
- **Plugins :** À l'intérieur de cet objet, nous chargeons eslint-plugin-vitest 35 et eslint-plugin-testing-library.33 Pour ce dernier, nous utilisons la configuration spécifique à React : testingLibrary.configs\['flat/react'\].36

## **IV. Gestion du Runtime Critique : Cloudflare Workers**

L'un des aspects les plus complexes de ce projet est que le code Next.js s'exécute dans l'environnement Cloudflare Workers (workerd), et non dans Node.js. L'application accède aux services (D1, R2, KV) via des "bindings" (wrangler.toml) injectés dans l'objet env (ex: env.D1_DB, env.R2_BUCKET).37  
**Problème :** ESLint ne connaît pas ces variables globales et lèvera des erreurs no-undef (variable non définie) pour chaque accès à env.  
Il existe deux solutions :

1. Solution 1 (Recommandée \- Robuste et Typée) : wrangler types  
   Cloudflare fournit un générateur de types qui lit wrangler.toml et génère un fichier de définitions TypeScript.40
   - **Workflow :** L'auteur doit exécuter npx wrangler types.40
   - **Résultat :** Cela crée un fichier worker-configuration.d.ts contenant l'interface Env avec tous les bindings typés.40
   - **Connexion :** Puisque la configuration ESLint (Partie III) est _type-aware_ (recommendedTypeChecked), typescript-eslint lira ce fichier (via tsconfig.json). Il comprendra que env.D1_DB est une variable valide et typée, résolvant ainsi l'erreur no-undef à la source.
2. Solution 2 (Non recommandée \- Manuelle et Fragile) : Globales Manuelles  
   Il est possible de déclarer manuellement chaque binding comme une globale dans eslint.config.mjs (via languageOptions.globals).41 Cette approche est déconseillée car elle est redondante (les bindings sont déjà définis dans wrangler.toml) et doit être maintenue manuellement à chaque ajout ou suppression d'un service.43

La Solution 1 est supérieure et est celle retenue. Elle nécessite une configuration spécifique de tsconfig.json (voir Section V).

## **V. Artefacts de Configuration Finaux Recommandés**

Voici les fichiers de configuration "prêts pour la production" basés sur l'analyse complète.

### **Fichier 1 : prettier.config.js (Formatage)**

JavaScript

/\*\* @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} \*/  
const config \= {  
 printWidth: 80,  
 tabWidth: 2,  
 useTabs: false,  
 semi: true,  
 singleQuote: true,  
 jsxSingleQuote: true,  
 trailingComma: 'all',  
 bracketSpacing: true,

// Plugin essentiel pour Tailwind 4 \+ shadcn/ui  
 plugins: \['prettier-plugin-tailwindcss'\],  
};

export default config;

### **Fichier 2 : eslint.config.mjs (Linting)**

Ce fichier est le cœur de la configuration. L'installation des packages (npm install \-D package-name) est requise pour chaque import.

JavaScript

// @ts-check

import { defineConfig } from 'eslint/config';  
import { FlatCompat } from '@eslint/eslintrc';  
import globals from 'globals';

// Import des plugins  
import eslint from '@eslint/js';  
import tseslint from 'typescript-eslint';  
import pluginReact from 'eslint-plugin-react';  
import eslintPluginUnicorn from 'eslint-plugin-unicorn';  
import tailwind from 'eslint-plugin-tailwindcss';  
import mdxPlugin from 'eslint-plugin-mdx';  
import simpleImportSort from 'eslint-plugin-simple-import-sort';  
import pluginIntl from 'eslint-plugin-next-intl';  
import vitest from '@vitest/eslint-plugin';  
import testingLibrary from 'eslint-plugin-testing-library';  
import eslintConfigPrettier from 'eslint-config-prettier';

// Initialisation de FlatCompat pour les anciens plugins (Next.js)  
const compat \= new FlatCompat({  
 baseDirectory: import.meta.dirname,  
 resolvePluginsRelativeTo: import.meta.dirname,  
});

export default defineConfig(\[  
 // 1\. Configuration Globale  
 {  
 ignores: \[  
 '.next/\*\*',  
 '.open-next/\*\*',  
 'out/\*\*',  
 'build/\*\*',  
 'node_modules/\*\*',  
 'public/\*\*',  
 '\*.config.js', // Ex: next.config.js, prettier.config.js  
 '\*.config.mjs', // Ex: postcss.config.mjs  
 'wrangler.toml',  
 \],  
 },  
 {  
 files: \['\*\*/\*.{js,mjs,cjs,ts,jsx,tsx,mdx}'\],  
 languageOptions: {  
 globals: {  
 ...globals.browser,  
 ...globals.node,  
 },  
 parser: tseslint.parser,  
 parserOptions: {  
 // La nouvelle meilleure pratique pour le linting typé  
 project: true,  
 tsconfigRootDir: import.meta.dirname,  
 },  
 },  
 settings: {  
 react: { version: 'detect' },  
 },  
 },

// 2\. Plugins de Base (JS, TS Type-Checked, React)  
 eslint.configs.recommended,  
 ...tseslint.configs.recommendedTypeChecked,  
 pluginReact.configs.flat.recommended,

// 3\. Plugins "Opinionated" (Qualité de code)  
 eslintPluginUnicorn.configs\['flat/recommended'\],  
 ...tailwind.configs\['flat/recommended'\],

// 4\. Intégration de Next.js (via FlatCompat)  
 ...compat.config({  
 extends: \['next/core-web-vitals'\],  
 }),

// 5\. Plugin i18n  
 pluginIntl.configs.recommended,

// 6\. Tri des Imports (doit être son propre objet)  
 {  
 plugins: { 'simple-import-sort': simpleImportSort },  
 rules: {  
 'simple-import-sort/imports': 'error',  
 'simple-import-sort/exports': 'error',  
 },  
 },

// 7\. Configuration MDX  
 ...mdxPlugin.flatConfigs.recommended,  
 // Appliquer les règles TS/React aux blocs de code dans MDX  
 {  
 files: \['\*\*/\*.mdx/\*.{js,ts,jsx,tsx}'\],  
 languageOptions: {  
 parserOptions: {  
 // Nécessaire pour que les règles typées fonctionnent dans MDX  
 project: true,  
 },  
 },  
 rules: {  
 // Désactiver les règles qui n'ont pas de sens dans un bloc de code  
 'react/jsx-no-undef': 'off',  
 '@typescript-eslint/no-unused-vars': 'warn',  
 },  
 },

// 8\. Configuration des Tests (Isolée) \[33, 34, 35\]  
 {  
 files: \['\*\*/\*.{test,spec}.?(c|m)\[jt\]s?(x)'\],  
 ...vitest.configs.recommended,  
 ...testingLibrary.configs\['flat/react'\],  
 rules: {  
 // Règles spécifiques aux tests  
 },  
 },

// 9\. Désactivation des conflits de style (DOIT ÊTRE LE DERNIER)  
 eslintConfigPrettier,  
\]);

### **Fichier 3 : tsconfig.json (Extrait des modifications requises)**

Pour que le linting typé (dans ESLint) et la gestion des bindings (dans Cloudflare) fonctionnent, les ajouts suivants au tsconfig.json sont nécessaires.

JSON

{  
 "compilerOptions": {  
 //... autres options

    "types":
      "./worker-configuration.d.ts",
      // 3\. Requis pour le flag "nodejs\_compat" de Cloudflare
      "node"
    \]

},  
 "include":  
 "\*\*/\*.mdx",  
 "\*\*/\*.md"  
 \],  
 "exclude": \["node_modules"\]  
}

## **VI. Intégration de l'Expérience Développeur (DX) et CI/CD**

Les fichiers de configuration ne sont efficaces que s'ils sont intégrés de manière transparente dans le workflow de développement et la pipeline de CI/CD.

### **Scripts package.json Recommandés**

Ces scripts permettent de valider et de corriger le code manuellement ou dans la CI.

JSON

{  
 "scripts": {  
 "dev": "wrangler dev \-- npx next dev",  
 "build": "next build",  
 "start": "next start",

    // \--- Scripts de Qualité de Code \---

    // Exécute le linter pour trouver les problèmes
    "lint": "eslint.",

    // Corrige automatiquement les problèmes de linting ET trie les imports
    "lint:fix": "eslint. \--fix",

    // Vérifie le formatage (pour la CI) \[15\]
    "format:check": "prettier \--check.",

    // Formate activement tous les fichiers (syntaxe \+ classes Tailwind) \[44, 45\]
    "format": "prettier \--write.",

    // Commande unifiée pour la CI (ex: pre-commit hook)
    "quality:check": "npm run format:check && npm run lint"

}  
}

### **Configuration VSCode : Le Workflow "Perfect Save"**

Pour l'auteur unique, le "formatage à la sauvegarde" est essentiel. Cependant, il y a un risque de conflit entre Prettier (formatage) et ESLint (linting).46 La configuration suivante, à placer dans .vscode/settings.json, orchestre les deux outils pour un "nettoyage parfait" à chaque sauvegarde.

JSON

{  
 // 1\. Désigne Prettier comme le formateur par défaut pour tous les fichiers  
 // pertinents.\[15, 47\]  
 "editor.defaultFormatter": "esbenp.prettier-vscode",

// 2\. Active le formatage (par Prettier) à chaque sauvegarde.  
 "editor.formatOnSave": true,

// 3\. Active les "Code Actions" (ESLint) à la sauvegarde.\[47, 49\]  
 "editor.codeActionsOnSave": {  
 // Cela exécute "eslint \--fix" à la sauvegarde.  
 "source.fixAll.eslint": "explicit"  
 }  
}

**Déroulement de la sauvegarde avec cette configuration :**

1. **Étape 1 (Formatage \- Prettier) :** L'utilisateur appuie sur "Sauvegarder". editor.formatOnSave se déclenche. VSCode exécute Prettier.48
2. Prettier lit prettier.config.js, charge prettier-plugin-tailwindcss 50, et formate toute la syntaxe (virgules, espaces) ET trie toutes les classes Tailwind.
3. **Étape 2 (Correction \- ESLint) :** editor.codeActionsOnSave se déclenche. VSCode exécute eslint \--fix.49
4. ESLint lit eslint.config.mjs. Grâce à eslint-config-prettier, il ignore les règles de style. Il corrige toutes les règles logiques auto-fixables (ex: unicorn, react) ET, de manière cruciale, il trie tous les imports (via eslint-plugin-simple-import-sort).20

Le résultat est un fichier parfaitement formaté et linté, sans aucun conflit entre les outils.

#### **Sources des citations**

1. Biome vs ESLint: The Ultimate 2025 Showdown for JavaScript Developers — Speed, Features, and Migration Guide | by Harry Es Pant \- Medium, consulté le novembre 8, 2025, [https://medium.com/@harryespant/biome-vs-eslint-the-ultimate-2025-showdown-for-javascript-developers-speed-features-and-3e5130be4a3c](https://medium.com/@harryespant/biome-vs-eslint-the-ultimate-2025-showdown-for-javascript-developers-speed-features-and-3e5130be4a3c)
2. Migrating A JavaScript Project from Prettier and ESLint to BiomeJS | AppSignal Blog, consulté le novembre 8, 2025, [https://blog.appsignal.com/2025/05/07/migrating-a-javascript-project-from-prettier-and-eslint-to-biomejs.html](https://blog.appsignal.com/2025/05/07/migrating-a-javascript-project-from-prettier-and-eslint-to-biomejs.html)
3. Whats your take on Biome, have you replaced ESLint and Prettier? : r/nextjs \- Reddit, consulté le novembre 8, 2025, [https://www.reddit.com/r/nextjs/comments/1cnsvhf/whats_your_take_on_biome_have_you_replaced_eslint/](https://www.reddit.com/r/nextjs/comments/1cnsvhf/whats_your_take_on_biome_have_you_replaced_eslint/)
4. I Will Never Use Prettier or ESLint Again \- YouTube, consulté le novembre 8, 2025, [https://www.youtube.com/watch?v=x5kwmIaPty8](https://www.youtube.com/watch?v=x5kwmIaPty8)
5. Migrate from ESLint and Prettier \- Biome, consulté le novembre 8, 2025, [https://biomejs.dev/guides/migrate-eslint-prettier/](https://biomejs.dev/guides/migrate-eslint-prettier/)
6. Markdown Support · biomejs biome · Discussion \#3816 \- GitHub, consulté le novembre 8, 2025, [https://github.com/biomejs/biome/discussions/3816](https://github.com/biomejs/biome/discussions/3816)
7. Switched from Biomejs to ESLint – What's Your Take on Biomejs in 2025? \- Reddit, consulté le novembre 8, 2025, [https://www.reddit.com/r/webdev/comments/1in18wd/switched_from_biomejs_to_eslint_whats_your_take/](https://www.reddit.com/r/webdev/comments/1in18wd/switched_from_biomejs_to_eslint_whats_your_take/)
8. markdown support · Issue \#3718 · biomejs/biome \- GitHub, consulté le novembre 8, 2025, [https://github.com/biomejs/biome/issues/3718](https://github.com/biomejs/biome/issues/3718)
9. eslint-plugin-mdx \- NPM, consulté le novembre 8, 2025, [https://www.npmjs.com/package/eslint-plugin-mdx?activeTab=readme](https://www.npmjs.com/package/eslint-plugin-mdx?activeTab=readme)
10. mdx-js/eslint-mdx: ESLint Parser/Plugin for MDX \- GitHub, consulté le novembre 8, 2025, [https://github.com/mdx-js/eslint-mdx](https://github.com/mdx-js/eslint-mdx)
11. Getting Started with ESLint \- ESLint \- Pluggable JavaScript Linter, consulté le novembre 8, 2025, [https://eslint.org/docs/latest/use/getting-started](https://eslint.org/docs/latest/use/getting-started)
12. Getting Started \- typescript-eslint, consulté le novembre 8, 2025, [https://typescript-eslint.io/getting-started/](https://typescript-eslint.io/getting-started/)
13. My full Prettier (.prettierrc) config file \- Fraser Boag, consulté le novembre 8, 2025, [https://www.boag.online/notepad/post/full-prettier-prettierrc-config](https://www.boag.online/notepad/post/full-prettier-prettierrc-config)
14. Prettier and the Beauty of Opinionated Code Formatters \- DEV Community, consulté le novembre 8, 2025, [https://dev.to/g_abud/prettier-and-the-beauty-of-opinionated-code-formatters-pfg](https://dev.to/g_abud/prettier-and-the-beauty-of-opinionated-code-formatters-pfg)
15. Setup Next.js 13 project with Eslint \+ Prettier \- GitHub Gist, consulté le novembre 8, 2025, [https://gist.github.com/nivethan-me/2375bf451d4c30148916b59c7e0c51c0](https://gist.github.com/nivethan-me/2375bf451d4c30148916b59c7e0c51c0)
16. A Prettier plugin for Tailwind CSS that automatically sorts classes based on our recommended class order. \- GitHub, consulté le novembre 8, 2025, [https://github.com/tailwindlabs/prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)
17. How to Set Up Next.js 15 for Production in 2025 \- ReactSquad, consulté le novembre 8, 2025, [https://www.reactsquad.io/blog/how-to-set-up-next-js-15-for-production](https://www.reactsquad.io/blog/how-to-set-up-next-js-15-for-production)
18. Can't get prettier-plugin-tailwindcss to work on Nextjs App \- Stack Overflow, consulté le novembre 8, 2025, [https://stackoverflow.com/questions/76654359/cant-get-prettier-plugin-tailwindcss-to-work-on-nextjs-app](https://stackoverflow.com/questions/76654359/cant-get-prettier-plugin-tailwindcss-to-work-on-nextjs-app)
19. lydell/eslint-plugin-simple-import-sort \- GitHub, consulté le novembre 8, 2025, [https://github.com/lydell/eslint-plugin-simple-import-sort](https://github.com/lydell/eslint-plugin-simple-import-sort)
20. Configuration Files \- ESLint \- Pluggable JavaScript Linter, consulté le novembre 8, 2025, [https://eslint.org/docs/latest/use/configure/configuration-files](https://eslint.org/docs/latest/use/configure/configuration-files)
21. historio/historio/eslint.config.mjs at main · jordanahaines/historio ..., consulté le novembre 8, 2025, [https://github.com/jordanahaines/historio/blob/main/historio/eslint.config.mjs](https://github.com/jordanahaines/historio/blob/main/historio/eslint.config.mjs)
22. "parserOptions.project" has been set for @typescript-eslint/parser \- Stack Overflow, consulté le novembre 8, 2025, [https://stackoverflow.com/questions/58510287/parseroptions-project-has-been-set-for-typescript-eslint-parser](https://stackoverflow.com/questions/58510287/parseroptions-project-has-been-set-for-typescript-eslint-parser)
23. Linting with Type Information \- typescript-eslint, consulté le novembre 8, 2025, [https://typescript-eslint.io/getting-started/typed-linting/](https://typescript-eslint.io/getting-started/typed-linting/)
24. Relative TSConfig Projects with \`parserOptions.project \= true\` \- typescript-eslint, consulté le novembre 8, 2025, [https://typescript-eslint.io/blog/parser-options-project-true/](https://typescript-eslint.io/blog/parser-options-project-true/)
25. Just use this Next.js Eslint Configuration \- DEV Community, consulté le novembre 8, 2025, [https://dev.to/jordanahaines/just-use-this-nextjs-eslint-configuration-540](https://dev.to/jordanahaines/just-use-this-nextjs-eslint-configuration-540)
26. prettier/eslint-config-prettier: Turns off all rules that are unnecessary or might conflict with Prettier. \- GitHub, consulté le novembre 8, 2025, [https://github.com/prettier/eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)
27. Integrating with Linters \- Prettier, consulté le novembre 8, 2025, [https://prettier.io/docs/integrating-with-linters](https://prettier.io/docs/integrating-with-linters)
28. Compatibility with \`typescript-eslint\` rules that require ... \- GitHub, consulté le novembre 8, 2025, [https://github.com/orgs/mdx-js/discussions/2454](https://github.com/orgs/mdx-js/discussions/2454)
29. eslint-plugin-unicorn \- npm search, consulté le novembre 8, 2025, [https://www.npmjs.com/search?q=eslint-plugin-unicorn](https://www.npmjs.com/search?q=eslint-plugin-unicorn)
30. What eslint rules you recommend? : r/reactjs \- Reddit, consulté le novembre 8, 2025, [https://www.reddit.com/r/reactjs/comments/1iue9w1/what_eslint_rules_you_recommend/](https://www.reddit.com/r/reactjs/comments/1iue9w1/what_eslint_rules_you_recommend/)
31. eslint-plugin-testing-library \- NPM, consulté le novembre 8, 2025, [https://www.npmjs.com/package/eslint-plugin-testing-library](https://www.npmjs.com/package/eslint-plugin-testing-library)
32. ESLint plugin to follow best practices and anticipate common mistakes when writing tests with Testing Library \- GitHub, consulté le novembre 8, 2025, [https://github.com/testing-library/eslint-plugin-testing-library](https://github.com/testing-library/eslint-plugin-testing-library)
33. Configuring Vitest, consulté le novembre 8, 2025, [https://v2.vitest.dev/config/](https://v2.vitest.dev/config/)
34. eslint plugin for vitest \- GitHub, consulté le novembre 8, 2025, [https://github.com/vitest-dev/eslint-plugin-vitest](https://github.com/vitest-dev/eslint-plugin-vitest)
35. eslint-plugin-testing-library is not catching lint errors \- Stack Overflow, consulté le novembre 8, 2025, [https://stackoverflow.com/questions/61825296/eslint-plugin-testing-library-is-not-catching-lint-errors](https://stackoverflow.com/questions/61825296/eslint-plugin-testing-library-is-not-catching-lint-errors)
36. Bindings (env) \- Workers \- Cloudflare Docs, consulté le novembre 8, 2025, [https://developers.cloudflare.com/workers/runtime-apis/bindings/](https://developers.cloudflare.com/workers/runtime-apis/bindings/)
37. Bindings · Cloudflare Pages docs, consulté le novembre 8, 2025, [https://developers.cloudflare.com/pages/functions/bindings/](https://developers.cloudflare.com/pages/functions/bindings/)
38. Development & testing · Cloudflare Workers docs, consulté le novembre 8, 2025, [https://developers.cloudflare.com/workers/development-testing/](https://developers.cloudflare.com/workers/development-testing/)
39. Write Cloudflare Workers in TypeScript · Cloudflare Workers docs, consulté le novembre 8, 2025, [https://developers.cloudflare.com/workers/languages/typescript/](https://developers.cloudflare.com/workers/languages/typescript/)
40. Configure Language Options \- ESLint \- Pluggable JavaScript Linter, consulté le novembre 8, 2025, [https://eslint.org/docs/latest/use/configure/language-options](https://eslint.org/docs/latest/use/configure/language-options)
41. Hazmi35/eslint-config: An ESLint shareable config that I used in my projects \- GitHub, consulté le novembre 8, 2025, [https://github.com/Hazmi35/eslint-config](https://github.com/Hazmi35/eslint-config)
42. How to provide usage_model at wrangler.toml for cloudflare \- Stack Overflow, consulté le novembre 8, 2025, [https://stackoverflow.com/questions/75718825/how-to-provide-usage-model-at-wrangler-toml-for-cloudflare](https://stackoverflow.com/questions/75718825/how-to-provide-usage-model-at-wrangler-toml-for-cloudflare)
43. VS Code format on save fights with prettier format (while linting) \#244 \- GitHub, consulté le novembre 8, 2025, [https://github.com/tailwindlabs/prettier-plugin-tailwindcss/issues/244](https://github.com/tailwindlabs/prettier-plugin-tailwindcss/issues/244)
44. Format Code with Prettier in Visual Studio Code: Setup Guide \- DigitalOcean, consulté le novembre 8, 2025, [https://www.digitalocean.com/community/tutorials/how-to-format-code-with-prettier-in-visual-studio-code](https://www.digitalocean.com/community/tutorials/how-to-format-code-with-prettier-in-visual-studio-code)
45. Automatic import sorting with ESLint \- DEV Community, consulté le novembre 8, 2025, [https://dev.to/receter/automatic-import-sorting-in-vscode-275m](https://dev.to/receter/automatic-import-sorting-in-vscode-275m)
46. prettier-tailwind-plugin isn't working as expected when I hit save in VSCode \- Stack Overflow, consulté le novembre 8, 2025, [https://stackoverflow.com/questions/75628944/prettier-tailwind-plugin-isnt-working-as-expected-when-i-hit-save-in-vscode](https://stackoverflow.com/questions/75628944/prettier-tailwind-plugin-isnt-working-as-expected-when-i-hit-save-in-vscode)
