# Story 0.1 - Initialiser le projet Next.js 15

**Epic**: Epic 0 - Socle technique (V1)
**Story ID**: 0.1
**Created**: 2025-11-06
**Status**: 📋 NOT STARTED

---

## 📖 Story Description

Initialiser un nouveau projet Next.js 15 avec TypeScript, TailwindCSS et App Router. Cette story constitue la fondation absolue du projet sebc.dev sur laquelle toutes les autres stories de l'Epic 0 (et des epics suivants) seront construites.

Le projet doit être créé avec la configuration optimale pour un déploiement ultérieur sur Cloudflare Workers via l'adaptateur OpenNext.

---

## 🎯 Story Objectives

### Objectif Principal

Créer un projet Next.js 15 fonctionnel et correctement configuré qui servira de base à tout le développement futur.

### Objectifs Secondaires

- Configurer TypeScript pour une sécurité de type maximale
- Configurer TailwindCSS comme système de design de base
- Utiliser l'App Router (architecture moderne de Next.js)
- Établir une structure de projet claire et maintenable
- Préparer le terrain pour l'intégration OpenNext (Story 0.2)

---

## ✅ Acceptance Criteria

D'après le PRD (Epic 0, Story 0.1) :

**Critère Principal** :

- **CA1** : Le projet compile et s'exécute avec Next.js 15 (App Router)

**Critères Additionnels** (déduits du contexte PRD) :

- **CA2** : TypeScript configuré et fonctionnel
- **CA3** : TailwindCSS installé et basique fonctionnel (configuration sera approfondie en Story 0.3)
- **CA4** : Structure de projet respectant les conventions Next.js App Router
- **CA5** : Le serveur de développement démarre sans erreur (`npm run dev`)
- **CA6** : Une page de test basique s'affiche correctement

---

## 🔧 Technical Requirements

### Framework & Versions

- **Next.js**: Version 15 (latest stable)
- **React**: Version 19 (requis par Next.js 15)
- **TypeScript**: Version 5.x
- **Node.js**: Version 18+ (prérequis Next.js 15)

### Configuration Requise

- **App Router** : Architecture obligatoire (pas de Pages Router)
- **TypeScript** : Mode strict activé
- **TailwindCSS** : Configuration de base (sera approfondie en Story 0.3)
- **ESLint** : Configuration Next.js par défaut

### Commande d'Initialisation

```bash
npx create-next-app@latest --typescript --tailwind --app
```

Options à sélectionner lors de l'initialisation interactive :

- ✅ TypeScript : Yes
- ✅ ESLint : Yes
- ✅ Tailwind CSS : Yes
- ✅ `src/` directory : Yes (meilleure organisation)
- ✅ App Router : Yes
- ✅ Import alias : Yes (default `@/*`)

### Structure de Projet Attendue

```
website/
├── src/
│   ├── app/                    # App Router (routes et layouts)
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Styles globaux
│   ├── components/            # Composants réutilisables (à créer)
│   └── lib/                   # Utilitaires et helpers (à créer)
├── public/                    # Assets statiques
├── .gitignore
├── next.config.js            # Configuration Next.js
├── package.json
├── tsconfig.json             # Configuration TypeScript
├── tailwind.config.ts        # Configuration Tailwind
└── postcss.config.js         # Configuration PostCSS (pour Tailwind)
```

---

## 📦 Dependencies

### Story Dependencies

- **Depends on**: Aucune (story fondation)
- **Blocks**: Toutes les autres stories de l'Epic 0 (0.2 à 0.10)

### External Dependencies

- **Node.js 18+** : Environnement d'exécution requis
- **npm/yarn/pnpm** : Gestionnaire de paquets
- **Git** : Contrôle de version

---

## 🎨 User Value

### Pour les Développeurs

- Base solide et moderne pour le développement
- Configuration TypeScript stricte pour réduire les bugs
- Structure claire et conventionnelle pour la maintenabilité
- Workflow de développement fluide avec HMR (Hot Module Replacement)

### Pour les Utilisateurs Finaux

- Bien qu'invisible directement, cette story garantit :
  - Performance optimale grâce à Next.js 15 (RSC, optimisations automatiques)
  - Expérience utilisateur fluide grâce aux Server Components
  - Base technique solide pour toutes les fonctionnalités futures

---

## ⚠️ Risks & Constraints

### Risques Identifiés

- **🟢 Faible** : Next.js 15 est stable et bien documenté
- **🟡 Moyen** : Compatibilité future avec OpenNext (sera adressée en Story 0.2)

### Contraintes

- Doit utiliser Next.js 15 (non négociable)
- Doit utiliser App Router (pas de Pages Router)
- Doit utiliser TypeScript en mode strict

---

## 📋 Definition of Done

Cette story est considérée terminée quand :

- [x] Projet Next.js 15 créé et initialisé
- [x] TypeScript configuré en mode strict
- [x] TailwindCSS installé et fonctionnel (configuration de base)
- [x] Structure de dossiers conforme aux conventions
- [x] `npm run dev` démarre sans erreur
- [x] Page d'accueil basique s'affiche correctement
- [x] `npm run build` compile sans erreur
- [x] Git initialisé et premier commit effectué
- [x] Documentation de setup ajoutée (README basique)

---

## 🔗 Related Documentation

### PRD References

- **Epic 0**: PRD lignes 586-598 (Epic 0 — Socle technique)
- **Story 0.1**: PRD ligne 588 (Initialiser le projet Next.js 15)
- **ENF1**: PRD lignes 266-273 (Frontend Next.js + React)
- **ENF2**: PRD lignes 274-285 (Architecture Next.js App Router)

### External References

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Next.js App Router Guide](https://nextjs.org/docs/app)
- [TypeScript with Next.js](https://nextjs.org/docs/app/building-your-application/configuring/typescript)

---

## 🚀 Next Steps

After completing this story:

1. **Story 0.2** : Configurer adaptateur OpenNext (dépend directement de 0.1)
2. **Story 0.3** : Approfondir configuration TailwindCSS + shadcn/ui
3. **Story 0.6** : Configurer compatibility flags (peut commencer en parallèle)

---

**Story Created**: 2025-11-06
**Last Updated**: 2025-11-06
**Created by**: Claude Code (story-phase-planner skill)
