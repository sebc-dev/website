# Phase 3 - Implementation Plan

**Story**: 1.8 - Correction Architecture next-intl
**Phase**: Internationalisation de la page d'accueil
**Total Commits**: 5
**Estimated Duration**: ~2 heures

---

## Commit Strategy

Cette phase utilise 5 commits atomiques qui progressent logiquement:

```
Messages FR → Messages EN → Page Component → Metadata → Cleanup
```

Chaque commit est:
- Indépendamment reviewable
- Type-safe à chaque étape
- Testable unitairement
- Réversible si nécessaire

---

## Commit 3.1: Add home namespace to messages/fr.json

### Objective
Ajouter le namespace `home` avec les 10 clés de traduction française pour la page d'accueil.

### Files Changed
- `messages/fr.json`

### Implementation Details

```json
{
  "home": {
    "badge": "En développement",
    "title": "sebc.dev",
    "subtitle": "Un laboratoire d'apprentissage public",
    "description": "À l'intersection de l'{ai}, de l'{ux} et de l'{engineering}",
    "ai": "IA",
    "ux": "UX",
    "engineering": "ingénierie logicielle",
    "launchLabel": "Lancement prévu",
    "launchDate": "Fin Novembre 2025",
    "tagline": "Blog technique • Articles • Guides"
  }
}
```

### Notes
- Utiliser l'interpolation `{ai}`, `{ux}`, `{engineering}` pour permettre le styling individuel des termes
- Conserver la structure alphabétique existante du fichier
- `title` reste "sebc.dev" (nom de marque, ne se traduit pas)

### Validation
- [ ] JSON valide (pas d'erreur de syntaxe)
- [ ] 10 clés présentes dans namespace `home`
- [ ] Interpolation avec `{variable}` correcte

### Estimated Time: 20 min

---

## Commit 3.2: Add home namespace to messages/en.json

### Objective
Ajouter le namespace `home` avec les 10 clés de traduction anglaise correspondantes.

### Files Changed
- `messages/en.json`

### Implementation Details

```json
{
  "home": {
    "badge": "In development",
    "title": "sebc.dev",
    "subtitle": "A public learning lab",
    "description": "At the intersection of {ai}, {ux}, and {engineering}",
    "ai": "AI",
    "ux": "UX",
    "engineering": "software engineering",
    "launchLabel": "Expected launch",
    "launchDate": "Late November 2025",
    "tagline": "Tech blog • Articles • Guides"
  }
}
```

### Notes
- Structure identique à FR
- Traductions professionnelles et naturelles
- Même format d'interpolation

### Validation
- [ ] JSON valide
- [ ] 10 clés identiques à FR
- [ ] Traductions cohérentes avec le ton du site
- [ ] `pnpm test messages.test.ts` passe

### Estimated Time: 20 min

---

## Commit 3.3: Create internationalized homepage

### Objective
Créer `app/[locale]/page.tsx` en migrant le contenu de `app/page.tsx` avec `useTranslations`.

### Files Changed
- `app/[locale]/page.tsx` (create)

### Implementation Details

```typescript
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <main className="...existing classes...">
      {/* Badge */}
      <span className="...">{t('badge')}</span>

      {/* Title */}
      <h1 className="...">{t('title')}</h1>

      {/* Subtitle */}
      <p className="...">{t('subtitle')}</p>

      {/* Description with rich text */}
      <p className="...">
        {t.rich('description', {
          ai: (chunks) => <span className="font-semibold">{chunks}</span>,
          ux: (chunks) => <span className="font-semibold">{chunks}</span>,
          engineering: (chunks) => <span className="font-semibold">{chunks}</span>,
        })}
      </p>

      {/* Launch info */}
      <div>
        <span>{t('launchLabel')}</span>
        <span>{t('launchDate')}</span>
      </div>

      {/* Tagline */}
      <p>{t('tagline')}</p>
    </main>
  );
}
```

### Key Points
- Copier TOUTES les classes Tailwind existantes
- Conserver TOUTES les animations (animate-fade-in, etc.)
- Utiliser `t.rich()` pour le texte avec interpolation stylée
- Ne pas modifier la structure visuelle

### Validation
- [ ] Page compile sans erreur TypeScript
- [ ] `/fr` affiche tous les textes
- [ ] `/en` affiche tous les textes
- [ ] Animations fonctionnent
- [ ] Layout identique visuellement

### Estimated Time: 45 min

---

## Commit 3.4: Add metadata namespace

### Objective
Ajouter le namespace `metadata` pour les métadonnées SEO dans les deux fichiers de messages.

### Files Changed
- `messages/fr.json`
- `messages/en.json`

### Implementation Details

**messages/fr.json**:
```json
{
  "metadata": {
    "title": "sebc.dev - Laboratoire d'apprentissage public",
    "description": "À l'intersection de l'IA, de l'UX et de l'ingénierie logicielle. Blog technique, articles et guides sur le développement moderne.",
    "ogTitle": "sebc.dev - Laboratoire d'apprentissage public",
    "ogDescription": "À l'intersection de l'IA, de l'UX et de l'ingénierie logicielle."
  }
}
```

**messages/en.json**:
```json
{
  "metadata": {
    "title": "sebc.dev - Public Learning Lab",
    "description": "At the intersection of AI, UX, and software engineering. Tech blog, articles, and guides on modern development.",
    "ogTitle": "sebc.dev - Public Learning Lab",
    "ogDescription": "At the intersection of AI, UX, and software engineering."
  }
}
```

### Notes
- Ces métadonnées seront utilisées dans Phase 4 pour `generateMetadata()`
- Préparer maintenant pour éviter les allers-retours
- 4 clés par locale (title, description, ogTitle, ogDescription)

### Validation
- [ ] JSON valide dans les deux fichiers
- [ ] 4 clés `metadata` identiques FR/EN
- [ ] Traductions SEO-friendly
- [ ] Tests de parité passent

### Estimated Time: 25 min

---

## Commit 3.5: Remove old homepage

### Objective
Supprimer l'ancien `app/page.tsx` maintenant que `app/[locale]/page.tsx` le remplace.

### Files Changed
- `app/page.tsx` (delete)

### Pre-deletion Checks
1. Vérifier que `app/[locale]/page.tsx` fonctionne pour `/fr` et `/en`
2. Vérifier qu'aucun import ne référence `app/page.tsx`
3. Confirmer que le middleware redirige `/` correctement

### Validation
- [ ] `/fr` fonctionne (homepage FR)
- [ ] `/en` fonctionne (homepage EN)
- [ ] `/` redirige vers `/fr` ou `/en`
- [ ] Pas de 404 sur la homepage
- [ ] `pnpm build` réussit
- [ ] `pnpm test` passe

### Estimated Time: 15 min

---

## Post-Phase Validation

Après tous les commits de cette phase:

```bash
# Type check
pnpm tsc

# Lint
pnpm lint

# Tests unitaires
pnpm test

# Tests parité messages
pnpm test messages.test.ts

# Build production
pnpm build

# Preview local (optionnel)
pnpm preview
```

### Manual Checks
- [ ] `/fr` - Tous textes en français, visuellement correct
- [ ] `/en` - Tous textes en anglais, visuellement correct
- [ ] Animations fluides dans les deux langues
- [ ] Pas de régression visuelle

---

## Rollback Strategy

Si problème critique:

1. **Commit 3.5 échoue**: Ne pas supprimer `app/page.tsx`, investiguer la redirection
2. **Commit 3.3 échoue**: Garder `app/page.tsx` fonctionnel, debug le nouveau
3. **Commits 3.1-3.2 échouent**: Revert les changements JSON, vérifier la syntaxe

Chaque commit peut être reverté individuellement sans affecter les précédents.

---

**Implementation Plan Created**: 2025-11-20
