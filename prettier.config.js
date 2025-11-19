/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  // Philosophie : Stricte et cohérente pour un auteur unique
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  jsxSingleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,

  // Markdown formatting options
  proseWrap: 'preserve', // Don't wrap markdown text
  embeddedLanguageFormatting: 'auto',

  // Plugin critique pour la stack du projet
  plugins: ['prettier-plugin-tailwindcss'],
};

export default config;
