---
created: 2025-11-02T00:00
updated: 2025-11-05T00:00
status: v1-adapted
stack: Next.js 15 + Cloudflare Workers
---

# UX/UI Specification — sebc.dev V1

## Adaptation pour Next.js 15 + Cloudflare Stack

---

## 1. Introduction

Ce document définit les objectifs UX, l'architecture de l'information, les parcours utilisateurs et les spécifications de conception visuelle pour **sebc.dev V1**.

**sebc.dev** est un blog technique bilingue (FR/EN) construit sur **Next.js 15 + React 19 Server Components + Cloudflare Workers** (via adaptateur OpenNext), explorant l'intersection de l'IA, l'UX et l'ingénierie logicielle. Cette spécification établit les fondations pour une expérience utilisateur centrée sur l'efficacité, la clarté et l'accessibilité, dès le départ.

---

## 2. Objectifs et Principes UX Généraux

### 2.1 Personas Cibles

- **Développeurs mid-level en startup**
  - Cherchent une efficacité maximale avec accès rapide aux solutions
  - Objectif : **time-to-value < 60 secondes**
  - Cas d'usage : résoudre un problème technique, trouver une approche UX/IA applicable immédiatement

- **Juniors en apprentissage**
  - Ont besoin de guidance progressive et parcours structurés
  - Objectif : **pattern discovery < 3 minutes**
  - Cas d'usage : apprendre des patterns, comprendre des concepts progressivement

- **Indie hackers/freelances**
  - Recherchent une vue d'ensemble stratégique et ROI clair
  - Priorité : réductions friction cognitive, accès direct aux best practices
  - Cas d'usage : benchmark d'outils, décisions architecturales

### 2.2 Objectifs d'Utilisabilité

- **Apprentissage Facile** : Nouveaux utilisateurs accomplissent les tâches principales en < 5 min
- **Efficacité d'Utilisation** : Utilisateurs expérimentés trouvent contenu pertinent en < 60s
- **Prévention des Erreurs** : Navigation claire, pas de dead-ends
- **Mémorabilité** : Interface cohérente, patterns visuels répétables
- **Accessibilité** : WCAG 2.1 AA natif (obligatoire en V1)

### 2.3 Principes de Conception

1. **Clarté avant tout** : Hiérarchie visuelle stricte, communication précise
2. **Divulgation Progressive** : Ne montrer que nécessaire, au moment opportun
3. **Cohérence des Patterns** : Composants shadcn/ui homogènes
4. **Feedback Immédiat** : Chaque action utilisateur → réponse système visible
5. **Accessibilité par Défaut** : Navigation clavier, lecteurs d'écran, WCAG AA

---

## 3. Architecture de l'Information (IA)

### 3.1 Structure Logique

L'objectif est de permettre découverte rapide en accord avec :

- **time-to-value < 60s** pour accès direct aux solutions
- **pattern discovery < 3min** pour apprenants progressifs

```
┌─────────────────────────────────────────┐
│              Accueil (Home)              │
│  - Hero section + articles en vedette  │
│  - Appels à l'action (Blog, Catégories) │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
    ┌───▼──┐  ┌───▼───┐  ┌───▼─────┐
    │ Blog │  │ Catégories │  │ Niveaux  │
    │(Hub) │  │ (Filtres)  │  │(Filtres) │
    └───┬──┘  └───┬───┘  └───┬─────┘
        │         │          │
        └────┬────┴────┬─────┘
             │         │
         ┌───▼─────────▼────┐
         │  HUB RECHERCHE  │
         │  (Point Central) │
         │  - Filtres multi │
         │  - Résultats     │
         │  - Pagination    │
         └───┬──────────────┘
             │
         ┌───▼────────┐
         │   Article  │
         │ (Lecture)  │
         └────────────┘
```

**Flux principal** :

1. Utilisateur arrive sur **Accueil** (`/fr/` ou `/en/`)
2. Clique sur **"Blog"** → **Hub de Recherche** (`/fr/articles`) OU
   - Clique sur **"Catégories"** → Redirect **Hub de Recherche** avec filtre `?category=X` OU
   - Clique sur **"Niveaux"** → Redirect **Hub de Recherche** (interface affiche filtres par niveau)
3. Sur **Hub de Recherche**, utilise **filtres combinés** (mots-clés, catégories, tags, complexité, durée, date)
4. Clique sur **article card** → **Page de lecture** avec TOC + barre de progression
5. Sur **page article**, clique badge catégorie/tag → Redirect **Hub de Recherche** avec filtre appliqué

### 3.2 Architecture Centralisée : Hub de Recherche comme Point Central

**Le Hub de Recherche est le point central unique** pour la découverte et navigation d'articles en V1.

Toutes les taxonomies (catégories, tags, niveaux) sont des **points d'entrée directs qui redirigent vers le Hub** avec filtres pré-appliqués :

**Points d'entrée vers le Hub** :

- **Navigation Catégories** → Clique catégorie → Redirect `/fr/articles?category=X`
- **Navigation Niveaux** → Clique niveau → Redirect `/fr/articles?complexity=beginner|intermediate|advanced`
- **Article** → Clique badge catégorie/tag → Redirect `/fr/articles?category=X` ou `/fr/articles?tags=Y`
- **Recherche textuelle** → Hub avec `q=...` en URL Search Params
- **Lien direct "Voir tous les articles"** → `/fr/articles` (Hub sans filtres)

**Pages de taxonomie en V1** : Les pages `/fr/categories` et `/fr/levels` n'existent **pas comme pages de contenu indépendantes**. Les navigations "Catégories" et "Niveaux" redirigent directement vers le Hub avec UI pour visualiser les options de filtrage.

### 3.3 Plan du Site (V1)

```
Domaine (sebc.dev)
├─ /fr (français, par défaut)
│  ├─ / (Accueil)
│  ├─ /articles (Hub de Recherche - point central)
│  │  ├─ ?category=X (articles filtrés par catégorie)
│  │  ├─ ?complexity=X (articles filtrés par niveau)
│  │  ├─ ?tags=Y (articles filtrés par tags)
│  │  ├─ ?q=... (articles filtrés par mots-clés)
│  │  ├─ Combinaisons multiples (AND logique)
│  │  │
│  │  └─ /articles/[slug] (Page article unique)
│  │
│  └─ /admin (Panneau d'administration - protégé Cloudflare Access)
│     ├─ /admin/articles (CRUD articles)
│     ├─ /admin/articles/new (Création article)
│     ├─ /admin/articles/[id] (Édition article)
│     ├─ /admin/categories (Gestion catégories)
│     └─ /admin/tags (Gestion tags)
│
├─ /en (anglais)
│  ├─ / (Accueil)
│  ├─ /articles (Hub de Recherche - point central)
│  │  ├─ ?category=X
│  │  ├─ ?complexity=X
│  │  ├─ ?tags=Y
│  │  ├─ ?q=...
│  │  │
│  │  └─ /articles/[slug] (Page article unique)
│  │
│  └─ /admin (même protection)
│
├─ /api/articles (API Endpoint - recherche articles JSON)
├─ /sitemap.xml (généré dynamiquement D1 query)
├─ /robots.txt (statique)
└─ /health (monitoring Cloudflare Health Checks)

Post-V1 :
├─ /wiki (ressources dev)
├─ /newsletter (abonnement)
└─ /account (profil utilisateur)

Note : Les pages `/categories` et `/levels` n'existent pas en V1.
Navigation vers ces points redirige vers `/articles` avec filtres pré-appliqués.
```

### 3.4 Gestion du Contexte d'Utilisation

L'interface s'adapte dynamiquement au **contexte** :

- **Utilisateur accède par lien direct** : Affiche contenu immédiatement
- **Utilisateur arrive du Hub de Recherche** : Fil d'Ariane reflète les filtres appliqués
- **Utilisateur clique tag/catégorie** : Retour Hub avec filtre pré-appliqué
- **Utilisateur en lecture** : Table des matières + indicateur progression toujours accessible

---

## 4. Navigation et Fil d'Ariane

### 4.1 Navigation Principale (Header)

Minimaliste, toujours visible, adaptée mobile-first :

```
┌────────────────────────────────────────┐
│ [Logo] │ Articles │ Catégories │ Niveaux │ [🌐 FR/EN] │
└────────────────────────────────────────┘
```

- **Logo** : Lien vers `/[lang]/` (accueil)
- **Articles** : Lien vers `/[lang]/articles` (Hub de Recherche)
- **Catégories** : Menu déroulant → clique catégorie → Hub avec filtre `category=X`
- **Niveaux** : Menu déroulant → clique niveau → Hub avec filtre `complexity=X`
- **Sélecteur langue** : FR/EN avec persistance cookie (next-intl)

### 4.2 Fil d'Ariane (Breadcrumbs)

S'affiche sous la navigation, reflète le contexte de filtrage :

- Page accueil : _Rien_
- Hub de Recherche : `Accueil > Articles`
- Hub avec filtre : `Accueil > Articles (Catégorie: Tutoriel) > Résultats`
- Page article : `Accueil > Articles > [Titre Article]`
- Admin : `Accueil > Admin > [Section]`

### 4.3 Contexte Multilingue

Toutes les URLs sont préfixées `/fr` ou `/en` :

- Détection automatique via `Accept-Language` (cookie override)
- next-intl gère le routing via middleware et route groups `/[lang]/`
- Balises `hreflang` pour SEO
- Badge de langue si contenu partiellement traduit

---

## 5. Parcours Utilisateurs (User Flows)

### 5.1 Flux 1 : Recherche et Filtrage d'Articles

**Objectif** : Trouver rapidement articles pertinents via combinaison filtres
**Temps cible** : < 60 secondes

```mermaid
graph TD
    A["Utilisateur arrive sur<br/>Hub de Recherche"] --> B{"Applique filtres"}
    B -->|Mots-clés| C["Mise à jour<br/>dynamique résultats"]
    B -->|Catégorie| C
    B -->|Tag| C
    B -->|Niveau| C
    B -->|Durée| C
    B -->|Date| C
    C --> D{"Des résultats?"}
    D -->|Oui| E["Affiche liste<br/>cartes articles"]
    D -->|Non| F["Message<br/>Aucun résultat"]
    E --> G["Clique article"]
    F --> B
    G --> H["Page article"]

    style H fill:#14B8A6,color:#fff
```

**Critères de succès** :

- Filtres s'appliquent sans rechargement de page (URL Search Params gérés via `next/navigation`)
- Résultats mis à jour instantanément via Server Component réexécuté avec `searchParams`
- URL reste partageable (`/fr/articles?category=tutorial&level=beginner`)
- Empty state avec suggestions de critères moins restrictifs

### 5.2 Flux 2 : Lecture d'un Article

**Objectif** : Lire confortablement avec navigation facile + progression visible
**Temps cible** : indicateur utile pour sessions > 5 min

```mermaid
graph TD
    A["Clique lien article"] --> B["Server Component charge<br/>article depuis D1"]
    B --> C["Affichage:<br/>- Contenu MDX rendu<br/>- Table des matières<br/>- Barre progression"]
    C --> D["Utilisateur<br/>fait défiler"]
    D --> E["Mise à jour<br/>barre progression (Client)"]
    E --> D
    F["Clique entrée TOC"] --> G["Défilement smooth scroll<br/>vers section (Client)"]
    C -.-> F
    G --> D

    style B fill:#fff4e6
    style C fill:#e6fffa
```

**Critères de succès** :

- TOC cliquable → défilement vers section (smooth scroll)
- Barre progression mise à jour au scroll
- Temps de lecture global + par section visibles
- Métadonnées article (catégorie, tags, date, auteur) toujours accessibles
- Lien vers articles connexes (même catégorie/tags) en bas

### 5.3 Flux 3 : Navigation par Taxonomie

**Objectif** : Découvrir contenu par catégorie/tag
**Temps cible** : < 3 minutes pour pattern discovery

```mermaid
graph TD
    A["Utilisateur dans<br/>article"] --> B["Clique tag/catégorie<br/>en badge"]
    B --> C["Redirection Hub<br/>avec filtre"]
    C --> D["Articles même<br/>catégorie/tag"]
    D --> E{"Intéressé?"}
    E -->|Oui| F["Clique article"]
    E -->|Non| G["Ajuste filtres"]
    G --> C
    F --> H["Page article"]

    style C fill:#fff4e6
    style H fill:#14B8A6,color:#fff
```

---

## 6. Structure Responsive

### 6.1 Points de Rupture (Breakpoints)

Utilisation TailwindCSS 4 standard :

| Breakpoint        | Min Width | Appareils                      |
| ----------------- | --------- | ------------------------------ |
| **Mobile (sm)**   | 0px       | Smartphones portrait/paysage   |
| **Tablette (md)** | 768px     | Tablettes portrait/paysage     |
| **Desktop (lg)**  | 1024px    | Ordinateurs portables, bureaux |
| **Wide (xl)**     | 1280px    | Grands moniteurs               |

### 6.2 Layout par Point de Rupture

#### Hub de Recherche

**Mobile (< 768px)**

```
┌─────────────────┐
│  [Filtr] [🔍]   │  ← Bouton "Filtrer" + Recherche
├─────────────────┤
│   [📦] Article  │  ← Cartes une colonne
│   [📦] Article  │
│   [📦] Article  │
└─────────────────┘
```

- Bouton "Filtrer" ouvre **Sheet** (panneau latéral mobile)
- Recherche par mots-clés en haut
- Cartes une seule colonne

**Tablette (768px - 1024px)**

```
┌──────┬──────────────┐
│      │  [Filtr] [🔍]│
│      ├──────────────┤
│      │ [📦] [📦]    │
│Filtres│ [📦] [📦]   │
│(side) │ [📦] [📦]   │
│sticky │              │
└──────┴──────────────┘
```

- Panneau filtres **sticky** à gauche
- Cartes deux colonnes
- Hauteur de viewport constante

**Desktop (≥ 1024px)**

```
┌──────┬──────────────────┐
│      │  [Filtr] [🔍]    │
│      ├──────────────────┤
│      │ [📦] [📦] [📦]  │
│Filtres│ [📦] [📦] [📦] │
│(side) │ [📦] [📦] [📦] │
│sticky │                 │
└──────┴──────────────────┘
```

- Panneau filtres **sticky** à gauche
- Cartes trois colonnes
- Marges latérales élargies (max-width container)

#### Page Article

**Mobile (< 768px)**

```
┌─────────────────┐
│  [🔖] TOC modal │  ← Bouton TOC ouvre modal
├─────────────────┤
│ ▮▮▮▮▯▯▯▯▯▯▯▯▯  │  ← Barre progression (sticky top)
├─────────────────┤
│                 │
│   Contenu MDsveX│
│   Une colonne   │
│                 │
└─────────────────┘
```

- TOC : bouton → modal (overlay)
- Barre progression sticky en haut
- Contenu une colonne (max-width 800px recommandé)

**Tablette (768px - 1024px)**

```
┌──────┬──────────────┐
│      │ ▮▮▮▯▯▯▯▯▯▯▯  │  ← Barre progression sticky
│      ├──────────────┤
│      │              │
│  TOC │   Contenu    │
│ sticky│   MDX       │
│(right)│              │
└──────┴──────────────┘
```

- TOC : bouton → modal (tablettes < 1024px)
- Barre progression sticky top
- Contenu centré avec marges

**Desktop (≥ 1024px)**

```
┌─────────────┬──────────────┬─────────────┐
│             │ ▮▮▮▯▯▯▯▯▯▯▯  │             │  ← Progression sticky
│   (Vide)    ├──────────────┤   TOC       │
│             │              │   sticky    │
│             │   Contenu    │  (right)    │
│             │   MDX        │             │
│             │              │             │
└─────────────┴──────────────┴─────────────┘
```

- Contenu centré, colonne unique (max-width 700px lecture optimale)
- TOC **sticky** à droite (visible en permanence)
- Barre progression sticky top

### 6.3 Adaptation Composants

**Boutons et zones interactives**

- Mobile : minimum 44x44px (norme tactile WCAG)
- Desktop : hover states visibles, focus ring clairs

**Images**

- Mobile : fullwidth
- Desktop : centrage + max-width 800px

**Tableau de matières**

- Mobile : modal/Sheet (ne pas encombrer viewport)
- Desktop : sidebar sticky (visible permanent)

---

## 7. Système de Design (Design System)

### 7.1 Palette de Couleurs

Basée sur **dark mode moderne**, avec accent vert canard :

| Type                 | Hex       | Utilisation                                      |
| -------------------- | --------- | ------------------------------------------------ |
| **Fond Primaire**    | `#1A1D23` | Arrière-plan principal (anthracite profond)      |
| **Fond Secondaire**  | `#2D3748` | Cartes, panneaux, sections                       |
| **Accent Principal** | `#14B8A6` | Liens, boutons, indicateurs actifs (vert canard) |
| **Texte Principal**  | `#F7FAFC` | Titres, corps (blanc cassé)                      |
| **Texte Secondaire** | `#A0AEC0` | Métadonnées, hints (gris moyen)                  |
| **Erreur**           | `#F56565` | Messages d'erreur, actions destructives (rouge)  |
| **Succès**           | `#48BB78` | Confirmations (vert)                             |

### 7.2 Typographie

| Élément   | Taille          | Graisse | Hauteur Ligne | Famille        |
| --------- | --------------- | ------- | ------------- | -------------- |
| **H1**    | 2.25rem (36px)  | 700     | 1.2           | Nunito Sans    |
| **H2**    | 1.875rem (30px) | 700     | 1.2           | Nunito Sans    |
| **H3**    | 1.5rem (24px)   | 600     | 1.3           | Nunito Sans    |
| **Corps** | 1rem (16px)     | 400     | 1.6           | Nunito Sans    |
| **Petit** | 0.875rem (14px) | 400     | 1.5           | Nunito Sans    |
| **Code**  | 0.875rem (14px) | 400     | 1.6           | JetBrains Mono |

**Polices**

- **Nunito Sans** : Corps + titres (lisibilité, formes arrondies amicales)
- **JetBrains Mono** : Code (monospace, familiarité développeurs)

### 7.3 Iconographie

- **Bibliothèque** : Lucide Icons (léger, cohérent, SVG natif)
- **Catégories** : Icône unique par catégorie (identification visuelle immédiate)
- **États** : icônes pour actif/inactif/loading

Exemple 9 catégories :

- Actualités → 📰 (news-icon)
- Analyse Approfondie → 🔬 (microscope-icon)
- Parcours d'Apprentissage → 🛤️ (journey-icon)
- Rétrospective → 📋 (clipboard-icon)
- Tutoriel → 🎓 (graduation-icon)
- Étude de Cas → 📊 (bar-chart-icon)
- Astuces Rapides → ⚡ (flash-icon)
- Dans les Coulisses → 🎬 (camera-icon)
- Test d'Outil → 🧪 (test-tube-icon)

### 7.4 Espacement et Grille

- **Grille** : 12 colonnes (TailwindCSS standard)
- **Espacement** : Multiples de 8px (8, 16, 24, 32, 48, 64, etc.)
- **Marges conteneur** :
  - Mobile : 16px (1rem)
  - Tablette : 24px (1.5rem)
  - Desktop : 32px (2rem)

### 7.5 Composants shadcn/ui

**Utilisation complète (composants React copy-paste)** :

- **Button** : Variantes `default`, `secondary`, `ghost`, `link`, `destructive`
- **Card** : Conteneurs articles, résultats
- **Badge** : Catégories, tags, niveaux de complexité
- **Input** : Recherche, filtres texte
- **Sheet** : Panneau filtres mobile (via Radix UI Dialog)
- **Dialog** : Confirmations, TOC mobile (via Radix UI Dialog)
- **Progress** : Barre progression lecture
- **Tooltip** : Infos supplémentaires hover (via Radix UI Tooltip)
- **Pagination** : Navigation résultats (24 par page)
- **Select** : Dropdowns catégories/niveaux (via Radix UI Select)

---

## 8. Componentes Clés Implémentés

### 8.1 Composant ArticleCard

Affichage homogène dans toutes les listes (Hub, catégories, articles connexes) :

```tsx
<ArticleCard
  title='Article Title'
  excerpt='Short excerpt...'
  category='Tutorial'
  tags={['tag1', 'tag2']}
  complexity='intermediate'
  readingTime={8}
  publishedAt={new Date()}
  slug='article-slug'
  lang='fr'
/>
```

**Affichage** :

```
┌──────────────────┐
│ [Icône] Tutoriel │ ← Catégorie + badge couleur
├──────────────────┤
│ Titre Article    │ ← H3 bold
│ ..description    │ ← Corps secondaire
├──────────────────┤
│ [tag] [tag]      │ ← Tags clickables
│ Intermédiaire    │ ← Badge niveau
│ 8 min • 2 jours  │ ← Métadonnées
└──────────────────┘
```

### 8.2 Composant TableOfContents

Auto-généré depuis headings MDX, cliquable, avec temps de lecture par section :

```tsx
<TableOfContents
  headings={[
    { id: 'intro', text: 'Introduction', level: 2, readingTime: 2 },
    { id: 'concept', text: 'Le Concept', level: 2, readingTime: 5 },
    { id: 'impl', text: 'Implémentation', level: 2, readingTime: 12 },
  ]}
/>
```

**Affichage** :

```
Table des Matières
─────────────────
▸ Introduction (2 min)
▸ Le Concept (5 min)
  ▾ Implémentation (12 min)
    • Étape 1 (3 min)
    • Étape 2 (4 min)
```

### 8.3 Composant ReadingProgressBar

Barre de progression sticky top, mise à jour au scroll :

```tsx
<ReadingProgressBar progress={45} />
```

Affiche progression visuelle (0-100%) via largeur bar, couleur accent (#14B8A6). Utilise hooks React pour détecter le scroll.

### 8.4 Composant ComplexityBadge

Badge avec icône et label, traductions via next-intl :

```tsx
<ComplexityBadge level='intermediate' />
```

Variantes :

- Débutant → icône 📗 + label "Débutant" (vert)
- Intermédiaire → icône 📕 + label "Intermédiaire" (orange)
- Avancé → icône 📘 + label "Avancé" (rouge)

### 8.5 Composant SearchFilters

Filtres combinables pour Hub de Recherche :

```tsx
<SearchFilters
  categories={categories}
  tags={tags}
  levels={['beginner', 'intermediate', 'advanced']}
  onFilterChange={handleFilterChange}
/>
```

---

## 9. Animations & Micro-interactions

### 9.1 Principes de Mouvement

1. **Subtilité** : Animations rapides (200-300ms), discrètes
2. **Feedback** : Confirmation actions utilisateur (hover, focus, click)
3. **Performance** : Transform + opacity uniquement (pas de layout shift)
4. **Respect prefers-reduced-motion** : Animations désactivées si pref active

### 9.2 Animations Clés

| Interaction          | Durée     | Easing      | Exemple                                 |
| -------------------- | --------- | ----------- | --------------------------------------- |
| **Hover boutons**    | 200ms     | ease-out    | Legère translation y: -2px + color fade |
| **Focus outline**    | Immédiate | N/A         | Ring visible 2px (#14B8A6)              |
| **Page transition**  | 200ms     | ease-in-out | Fade in/out                             |
| **Loading skeleton** | Pulse     | linear      | Shimmer effect (background gradient)    |
| **Scroll smooth**    | 400ms     | ease-out    | Scroll vers TOC item                    |
| **Progress bar**     | Smooth    | linear      | Width change fluid                      |

### 9.3 États Visuels

**Boutons** : default → hover → focus → active → disabled
**Liens** : default → visited → hover → focus → active
**Cartes** : default → hover (shadow lift) → active
**Filtres** : default → selected (background highlight) → hover

---

## 10. Accessibilité (a11y) WCAG 2.1 AA

### 10.1 Exigences Visuelles

- **Contraste** : Minimum 4.5:1 texte/fond (normal), 3:1 (large)
- **Focus indicators** : Ring visible 2px minimum sur tous éléments interactifs
- **Redimensionnement** : Contenu lisible jusqu'à 200% zoom

### 10.2 Interaction

- **Clavier** : Navigation tabulation logique, touches spéciales gérées (Enter, Espace, Arrow)
- **Lecteur écran** : HTML sémantique (landmarks, headings, labels, ARIA)
- **Cibles tactiles** : Minimum 44x44px (avec espacement si < 44px)
- **prefers-reduced-motion** : Animations + transitions désactivées

### 10.3 Contenu

- **Texte alternatif** : Toutes images informatives ont alt descriptif
- **Structure headings** : Hiérarchie logique h1 → h2 → h3 (pas de sauts)
- **Étiquettes formulaire** : `<label>` liée via `for` ou wrapping
- **Messages d'erreur** : Clairs, associés champs, suggérant correction

### 10.4 Audit & Tests

- **Lighthouse** : Score accessibilité ≥ 90 (exécution CI/CD)
- **Tests manuels** : Navigation clavier + lecteur écran (nvda/jaws)
- **Validation WAVE** : Pas d'erreurs, warnings examinés

---

## 11. Performance & Core Web Vitals

### 11.1 Objectifs (V1)

- **LCP** (Largest Contentful Paint) : < 2.5s (mobile 4G)
- **INP** (Interaction to Next Paint) : < 100ms
- **CLS** (Cumulative Layout Shift) : < 0.1

### 11.2 Stratégies SvelteKit + Cloudflare

**Frontend**

- Pages servies depuis Edge Cloudflare (latence minimale)
- Bundle optimisé via Vite build (tree-shaking, code-splitting)
- Composants shadcn-svelte légers + Nunito Sans subset
- Lazy loading images par défaut

**Images (Cloudflare R2 + Transform)**

- Stockage R2, transformation à la volée via CDN-cgi
- WebP/AVIF auto (format negotiation)
- Lazy loading + width/height requis (pas de CLS)
- Max 500 Ko source avant transformation

**Cache (Cloudflare)**

- Pages articles : max-age=3600, s-maxage=86400
- API/données : max-age=300
- Admin : no-cache

**Database**

- Drizzle ORM queryoptimization (select columns strictly)
- D1 queries servies depuis Edge
- Indexes sur colonnes filtrage fréquent

---

## 12. Multilingue (i18n) avec next-intl

### 12.1 Architecture

- **Détection** : URL `/fr` ou `/en` (route groups) + Accept-Language fallback + cookie (persistance)
- **Fichiers messages** : `messages/fr.json`, `messages/en.json` (compilés, tree-shakable, typesafe via next-intl)
- **Middleware** : `src/middleware.ts` gère routing dynamique et initialisation locale next-intl
- **Contenu** : MDX stocké en D1 avec colonne `language` ('fr' | 'en'), requêté via Drizzle en Server Component

### 12.2 Fallback de Contenu

Si traduction manquante :

1. Affiche version disponible (ex: FR si EN manquante)
2. Badge "Affiché en FR" en haut page
3. Bouton "Voir en Anglais" (link vers EN si dispo)

### 12.3 SEO hreflang & Canonical

Gérés via Next.js Metadata API dans les composants serveur :

```html
<!-- Page FR -->
<link rel="alternate" hreflang="en" href="https://sebc.dev/en/articles/slug" />
<link rel="canonical" href="https://sebc.dev/fr/articles/slug" />

<!-- Page EN -->
<link rel="alternate" hreflang="fr" href="https://sebc.dev/fr/articles/slug" />
<link rel="canonical" href="https://sebc.dev/en/articles/slug" />
```

---

## 13. Gestion d'État et Filtres

### 13.1 URL Search Params

L'état du Hub de Recherche est **persisté dans l'URL** via `URLSearchParams` :

```
/fr/articles?q=svelte&category=tutorial&level=beginner&tags=ui&duration_min=5&duration_max=15&date_from=2025-01-01
```

**Paramètres** :

- `q` : Recherche textuelle (mots-clés)
- `category` : ID catégorie (filtrage mono ou multi)
- `level` : beginner|intermediate|advanced (mono)
- `tags` : IDs tags comma-separated (multi)
- `duration_min`, `duration_max` : minutes
- `date_from`, `date_to` : ISO dates
- `page` : Numéro page (défaut 1)
- `sort` : -date | date | title (défaut -date)

### 13.2 Mise à Jour sans Rechargement

**Flux Next.js** :

1. Utilisateur interagit avec filtre
2. URL mise à jour via `router.push(newUrl)` (client-side)
3. Server Component Next.js réexécuté (données pré-chargées serveur)
4. Composants mise à jour via React state

```typescript
// app/[lang]/articles/page.tsx
export default async function ArticlesPage({ searchParams }: {
  searchParams: { q?: string; category?: string }
}) {
  const q = searchParams.q ?? '';
  const category = searchParams.category;
  // ... fetch articles with filters
  return <ArticlesList articles={articles} filters={filters} />;
}
```

### 13.3 Facettes Dynamiques

Les options de filtrage (catégories, tags) sont **recalculées** selon résultats actuels :

- Affiche seulement catégories/tags ayant résultats
- Compte résultats par catégorie (badge "15")
- Désactive filtres sans résultats

---

## 14. Admin Panel (Création/Édition Articles)

### 14.1 Workflow

```
┌─────────────────────────────┐
│   Admin / Articles          │
├─────────────────────────────┤
│ [+ Nouvel Article]          │
├─────────────────────────────┤
│ ✏️ Article Title  │ 📅 2025-01-15 │
│ ✏️ Article Title  │ 📅 2025-01-10 │
│ ✏️ Article Title  │ 📅 2025-01-05 │
└─────────────────────────────┘
       ↓ Clique édition
┌─────────────────────────────┐
│   Édition Article           │
├─────────────────────────────┤
│ [FR] [EN]  ← Onglets       │
├─────────────────────────────┤
│ Title: [________________]   │
│ Slug: [________________]    │
│ Category: [Dropdown ↓]     │
│ Tags: [+ Tag selector]     │
│ Level: ◉ Beginner          │
│        ◉ Intermediate      │
│        ◉ Advanced          │
│ Excerpt: [______________]  │
│ Content (MDX):             │
│ [Rich Editor / Markdown]   │
│                            │
│ [Preview] [Save Draft]     │
│ [Publish]                  │
└─────────────────────────────┘
```

### 14.2 Validation Publication

Article **ne peut être publié que si** :

- ✅ Titre FR + EN
- ✅ Slug FR + EN
- ✅ Excerpt FR + EN
- ✅ Catégorie assignée
- ✅ Contenu MDX FR + EN
- ✅ Niveau complexité défini

Validation via `react-hook-form` + Zod schemas (générés par drizzle-zod) dans Server Actions.

### 14.3 Mode Prévisualisation

Bouton "Prévisualiser" ouvre `/fr/articles/[slug]?preview=true` :

- Affiche article en mode draft (avant publication)
- Protégé par **Better Auth** (authentification) + **Cloudflare Access** (niveau infrastructure)
- Badge "MODE PRÉVISUALISATION" visible en haut page
- Accessible seulement à l'auteur (vérification session Better Auth dans Server Component)
- URL non partageable (token de preview expirable via Better Auth)

---

## 15. SEO & Métadonnées

### 15.1 Meta Tags

Générés dynamiquement via Next.js Metadata API dans chaque page :

```typescript
// app/[lang]/articles/[slug]/page.tsx
export async function generateMetadata({ params }: {
  params: { slug: string; lang: string }
}): Promise<Metadata> {
  const article = await db.select().from(articles)...;

  return {
    title: article.seoTitle,
    description: article.seoDescription,
    openGraph: {
      title: article.seoTitle,
      description: article.seoDescription,
      images: [buildCloudflareImageUrl(article.heroImage, { width: 1200 })],
      url: `https://sebc.dev/${params.lang}/articles/${article.slug}`,
      type: 'article',
    },
    alternates: {
      canonical: `https://sebc.dev/${params.lang}/articles/${article.slug}`,
      languages: {
        'fr': `https://sebc.dev/fr/articles/${article.slug}`,
        'en': `https://sebc.dev/en/articles/${article.slug}`
      }
    }
  };
}
```

### 15.2 Sitemap Dynamique

Route Handler `route.ts` génère sitemap XML :

- Toutes pages publiées
- Priorités : articles récents (1.0), anciens (0.8)
- Fréquences : récents weekly, anciens monthly
- Cache 1 heure

### 15.3 Open Graph & Twitter Cards

Générés automatiquement par Next.js Metadata API (voir section 15.1). Next.js gère automatiquement la génération des balises Open Graph et Twitter Cards à partir de l'objet `Metadata` retourné par `generateMetadata`.

---

## 16. États Spéciaux et Gestion d'Erreurs

### 16.1 Empty States

**Aucun article** (Hub filtre vide) :

```
🔍 Aucun résultat

Nous n'avons pas trouvé d'article correspondant à votre recherche.

Suggestions :
• Élargissez vos critères de complexité
• Essayez d'autres tags
• Consultez toutes les catégories
```

### 16.2 Loading States

**Recherche en cours** :

- Skeleton loaders pour cartes articles
- Spinner léger sur boutons

### 16.3 Erreurs

**Article non trouvé (404)** :

```
Page non trouvée (404)

Cet article n'existe pas ou a été supprimé.

[Retour au blog] [Retour accueil]
```

**Erreur serveur (500)** :

```
Une erreur s'est produite

Nous travaillons à résoudre ce problème.
Réessayez dans quelques instants.

[Retour accueil]
```

---

## 17. Guides de Contenu Visuel

### 17.1 Cards Catégories

Chaque catégorie a une **couleur et icône dédiée** :

```
┌──────────────────────────┐
│ 📰 Actualités            │  ← Icône + Nom
│ Veille techno et trends  │  ← Description
│ 24 articles →            │  ← Count + Link
└──────────────────────────┘
```

Palette :

- Actualités → Bleu
- Analyse → Indigo
- Parcours → Vert
- Rétrospective → Amber
- Tutoriel → Cyan
- Étude de Cas → Orange
- Astuces → Rose
- Coulisses → Violet
- Test d'Outil → Émeraude

### 17.2 Badges Niveaux

**Débutant** : Vert clair (#48BB78) + 📗
**Intermédiaire** : Orange (#ED8936) + 📕
**Avancé** : Rouge (#F56565) + 📘

---

## 18. Stratégie de Testing (Hybrid Testing Strategy)

### 18.1 Modèle de Testing Imposé par l'Architecture RSC

L'architecture **React Server Components (RSC) + Next.js 15** impose un **modèle de testing hybride obligatoire**. Les Server Components async ne peuvent PAS être unit-testés de manière fiable dans un environnement JSDOM moqué. Le Validation Checklist (Section 9.2) confirme que "**Async Server Components _cannot be unit-tested_ in the traditional sense.**"

### 18.2 Stratégie Détaillée

#### **Pour les Client Components et Fonctions Utilitaires (Vitest + React Testing Library)**

**Scope** : Unit tests pour :

- Composants marqués `'use client'` (filtres, boutons, modales)
- Fonctions utilitaires (formatage dates, validation formulaires)
- Hooks React custom ('use client')
- Server Actions simples (sans dépendances réseau)

**Outils** :

- **Vitest** : Test runner (faster than Jest, ESM native)
- **React Testing Library** : Rendu composants + assertions user-centric
- **@testing-library/user-event** : Simulations interactions utilisateur

**Exemple** :

```typescript
// __tests__/components/SearchFilters.test.tsx
import { render, screen } from '@testing-library/react';
import { SearchFilters } from '@/components/SearchFilters';

describe('SearchFilters', () => {
  it('applies filter on category selection', async () => {
    render(<SearchFilters onFilterChange={vi.fn()} />);
    // ... test client-side filter logic
  });
});
```

#### **Pour les Pages Data-Driven et Flows Utilisateur (Playwright E2E Obligatoire)**

**Scope** : E2E tests obligatoires pour :

- **Pages avec RSC async** : Hub de Recherche, page article (MDX rendering server-side)
- **Auth flows** : Login → Redirection → Protected routes → Logout
- **Admin flows** : Créer/éditer/publier articles
- **Server Actions** : Formulaires soumis via Server Actions

**Raison** : Les Server Components async executent le data-fetching côté serveur et rendent le HTML initial. Le **seul** moyen de tester ce cycle complet est de lancer l'application en environnement production-like et tester le HTML/DOM final.

**Outils** :

- **Playwright** : E2E automation + assertions sur HTML rendu
- **npm run build && npm run start** : Environnement production-like

**Exemple** :

```typescript
// e2e/articles-hub.spec.ts
import { test, expect } from '@playwright/test';

test('search articles with filters', async ({ page }) => {
  await page.goto('/fr/articles');
  await page.click('text=Filtrer');
  await page.selectOption('[name=category]', 'tutorial');

  // Attend mise à jour Server Component (re-fetch + re-render)
  await expect(page.locator('[data-testid=article-card]')).toHaveCount(5);
});

test('auth flow: login → protected route → logout', async ({ page }) => {
  // Test complet : middleware, session, RSC avec auth context
  await page.goto('/fr/admin/articles');
  // Expect redirect to login (middleware intercept)
  expect(page.url()).toContain('/sign-in');

  // Login flow
  // ... assertions
});
```

### 18.3 Configuration Recommandée

**package.json** :

```json
{
  "devDependencies": {
    "vitest": "^latest",
    "@testing-library/react": "^14",
    "@testing-library/user-event": "^14",
    "@playwright/test": "^latest"
  },
  "scripts": {
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

**vitest.config.ts** : Configuration pour unit tests (JSDOM)
**playwright.config.ts** : Configuration pour E2E (production build + start)

### 18.4 Critères de Couverture (V1)

- **Unit Tests** : 60%+ couverture Client Components + utilitaires
- **E2E Tests** : 100% coverage des flows critiques (auth, Hub recherche, article page, admin CRUD)
- **Performance** : Lighthouse CI ≥ 90 (accessibility, best practices)

---

## 19. Considérations Techniques Next.js 15

### 19.1 Patterns Utilisés (Next.js 15 App Router)

1. **Server Actions** (fonctions async dans Server Components) : Création/édition articles via formulaires avec validation Zod
2. **Server Components** (async components dans `app/` directory) : Pré-chargement données D1, SEO, rendu @next/mdx
3. **Middleware** (`src/middleware.ts`) : Authentification Better Auth + Cloudflare Access (admin protégé), validation JWT via `jose`
4. **Better Auth Integration** : Authentification utilisateurs, gestion sessions via Drizzle + D1, support MFA/WebAuthn
5. **next-intl Middleware** : I18n avec route groups `/[lang]/` et contexte locale (chaining auth → i18n)
6. **Route Handlers** (`app/api/*/route.ts`) : Presigned URLs R2, sitemap dynamique, health checks
7. **Client Components** ('use client') avec hooks React : Interactivité client (filtres, scroll, TOC, useActionState pour formes)
8. **React Query / SWR** (optionnel) : Côté client pour refresh données sans rechargement page

### 19.2 Optimisations

- **Streaming & Progressive Enhancement** : HTML streamed via React Server Components
- **Adaptateur OpenNext** : `@opennextjs/cloudflare` transforme Next.js en Worker bundle
- **Bindings Cloudflare** : Accès à D1, R2, KV via `wrangler.toml` (source unique vérité)
- **Cache OpenNext** : Architecture complète avec R2 (ISR), Durable Objects (queue), D1 (tags), KV

---

## 19. Rollout Plan (V1)

### Phase 1 : Socle Technique (EPIC 0)

- Initialisation Next.js 15, TailwindCSS 4, Drizzle, D1, wrangler.toml
- Configuration OpenNext adapter
- CI/CD GitHub Actions
- Cloudflare Access `/admin`

### Phase 2 : Articles & Taxonomie (EPIC 1, 2)

- Schéma D1, Server Actions, Admin panel
- Rendu MDX, TOC, progression
- Catégories, tags, complexité

### Phase 3 : Hub Recherche (EPIC 3, 4)

- Page recherche avancée, filtres combinés
- next-intl i18n
- URL Search Params

### Phase 4 : SEO & Performance (EPIC 5, 8)

- Sitemap, robots.txt, Open Graph
- Core Web Vitals
- Cloudflare Images optimization

### Phase 5 : Sécurité & Monitoring (EPIC 6, 7)

- Validations Zod, CSP, WAF
- Health checks, Web Analytics
- Tests hybrid: **Vitest + React Testing Library** pour Client Components et fonctions utilitaires; **Playwright E2E obligatoire** pour toutes les pages avec RSC async (data-driven pages, auth flows, Server Actions)

---

## 20. Post-V1 Extensions

- **Commentaires** : Authentification Better Auth avec adaptateur `better-auth-cloudflare` (D1 + Drizzle + KV) + système commentaires
- **Newsletter** : Cloudflare Email Service (binding natif Workers) + templates react-email
- **Wiki** : Section distincte avec versionning + historique (possible Cloudflare Durable Objects)
- **Analytics avancés** : Plausible ou intégration Segment (privacy-first)
- **Cache avancé Optimisé** : Architecture OpenNext complète configurée (R2 pour ISR, Durable Objects pour queue, D1 pour tag cache, KV pour fast access)

---

## Conclusion

Cette spécification UX/UI adapte les objectifs fondamentaux du blog (efficacité, clarté, apprentissage) à la stack moderne **Next.js 15 + React 19 Server Components + Cloudflare Workers**.

L'architecture préserve l'expérience utilisateur tout en bénéficiant de :

- **Latence minimale** via Edge network Cloudflare (300+ datacenters)
- **Serverless scalabilité** sans gestion infrastructure ou ops
- **DX optimisée** avec Next.js 15 App Router + React 19 Server Components + shadcn/ui
- **Accessibilité native** WCAG 2.1 AA dès V1
- **Performance optimale** avec OpenNext caching strategy et Cloudflare Images

Le projet reste **ambitieux mais réaliste** avec une V1 livrée fin novembre/décembre et extensions progressives post-V1.
