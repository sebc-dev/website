// @ts-check

import { FlatCompat } from '@eslint/eslintrc';
import globals from 'globals';

// Import des plugins
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import vitest from '@vitest/eslint-plugin';
import testingLibrary from 'eslint-plugin-testing-library';
import eslintPluginTSDoc from 'eslint-plugin-tsdoc';
import eslintConfigPrettier from 'eslint-config-prettier';

// Initialisation de FlatCompat pour les anciens plugins (Next.js)
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  resolvePluginsRelativeTo: import.meta.dirname,
});

export default [
  // 1. Configuration Globale
  {
    ignores: [
      '.next/**',
      '.open-next/**',
      '.wrangler/**',
      '.stryker-tmp/**',
      'coverage/**',
      'out/**',
      'build/**',
      'node_modules/**',
      'public/**',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/*.config.ts',
      '.dependency-cruiser.cjs',
      'stryker.config.json',
      'wrangler.toml',
      'wrangler.jsonc',
      '.claude/**',
      'docs/**',
      'drizzle/**',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx,mdx}'],
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

  // 2. Plugins de Base (JS, TS Type-Checked, React)
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  pluginReact.configs.flat.recommended,

  // 3. Intégration de Next.js (via FlatCompat)
  ...compat.config({
    extends: ['next/core-web-vitals'],
  }),

  // 4. TSDoc validation
  {
    plugins: { tsdoc: eslintPluginTSDoc },
    rules: {
      'tsdoc/syntax': 'warn',
    },
  },

  // 5. Tri des Imports
  {
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },

  // 6. Configuration des Tests (Isolée)
  {
    files: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    ...vitest.configs.recommended,
    ...testingLibrary.configs['flat/react'],
  },

  // 7. Désactivation des conflits de style (DOIT ÊTRE LE DERNIER)
  eslintConfigPrettier,
];
