# Phase 4 - Commit Checklist

**Phase**: 4 - Métadonnées SEO
**Total Commits**: 3

---

## Commit 4.1: Implémenter generateMetadata

### Pre-commit Checks
- [ ] Branch à jour avec main/develop
- [ ] Phases 1-3 complètes et validées
- [ ] Namespace `metadata` présent dans messages FR/EN

### Implementation Checklist
- [ ] Import `getTranslations` from `next-intl/server`
- [ ] Import type `Metadata` from `next`
- [ ] Définir type `Props` avec `params: Promise<{ locale: string }>`
- [ ] Créer fonction `generateMetadata` async
- [ ] Await params pour extraire locale
- [ ] Appeler `getTranslations` avec namespace `metadata`
- [ ] Retourner `title` depuis traductions
- [ ] Retourner `description` depuis traductions
- [ ] Ajouter `keywords` localisés

### Testing Checklist
- [ ] `pnpm tsc` passe sans erreur
- [ ] `pnpm lint` passe
- [ ] `pnpm dev` démarre sans erreur
- [ ] View source `/fr` montre title FR
- [ ] View source `/en` montre title EN
- [ ] `<meta name="description">` correct

### Commit Message
```
🔍 seo(i18n): add generateMetadata with localized title and description

- Add generateMetadata function to [locale] layout
- Use getTranslations for dynamic metadata
- Implement localized keywords for FR/EN

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Commit 4.2: Open Graph localisé

### Pre-commit Checks
- [ ] Commit 4.1 complété et validé
- [ ] generateMetadata fonctionne avec title/description

### Implementation Checklist
- [ ] Ajouter objet `openGraph` au return
- [ ] `title: t('ogTitle')`
- [ ] `description: t('ogDescription')`
- [ ] `locale: 'fr_FR'` ou `'en_US'`
- [ ] `alternateLocales` avec l'autre locale
- [ ] `type: 'website'`
- [ ] `siteName: 'sebc.dev'`
- [ ] `url` dynamique avec locale
- [ ] `images` array avec og-image.png
- [ ] `alt` localisé pour l'image

### Testing Checklist
- [ ] `pnpm tsc` passe
- [ ] `pnpm lint` passe
- [ ] View source `/fr` : `og:locale` = `fr_FR`
- [ ] View source `/en` : `og:locale` = `en_US`
- [ ] `og:title` traduit correctement
- [ ] `og:description` traduit correctement
- [ ] `og:site_name` = sebc.dev
- [ ] `og:type` = website
- [ ] `og:image` présent

### Commit Message
```
🔍 seo(i18n): add localized Open Graph metadata

- Add openGraph object with full configuration
- Implement locale-specific og:locale (fr_FR/en_US)
- Add alternateLocales for SEO
- Configure og:image with localized alt text

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Commit 4.3: Twitter card et robots

### Pre-commit Checks
- [ ] Commit 4.2 complété et validé
- [ ] Open Graph fonctionne dans les deux locales

### Implementation Checklist
- [ ] Ajouter objet `twitter`
- [ ] `card: 'summary_large_image'`
- [ ] `title: t('ogTitle')`
- [ ] `description: t('ogDescription')`
- [ ] `images: ['/og-image.png']`
- [ ] Ajouter objet `robots`
- [ ] `index: true`
- [ ] `follow: true`
- [ ] Ajouter `googleBot` configuration
- [ ] `max-video-preview: -1`
- [ ] `max-image-preview: 'large'`
- [ ] `max-snippet: -1`

### Testing Checklist
- [ ] `pnpm tsc` passe
- [ ] `pnpm lint` passe
- [ ] View source : `twitter:card` = `summary_large_image`
- [ ] `twitter:title` traduit
- [ ] `twitter:description` traduit
- [ ] `twitter:image` présent
- [ ] `robots` meta présent
- [ ] Pas de conflit avec root layout

### Commit Message
```
🔍 seo(i18n): add Twitter card and robots configuration

- Add twitter card with summary_large_image
- Configure localized twitter title and description
- Add robots configuration with googleBot settings
- Complete Phase 4 SEO metadata implementation

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Post-Phase Validation

### Functional Checks
- [ ] `/fr` métadonnées complètes en français
- [ ] `/en` métadonnées complètes en anglais
- [ ] Pas de duplicate ou conflit avec root

### SEO Validation
- [ ] Title unique et descriptif
- [ ] Description < 160 caractères
- [ ] OG tags complets
- [ ] Twitter card valide
- [ ] Robots index/follow

### Technical Checks
- [ ] `pnpm tsc` passe
- [ ] `pnpm lint` passe
- [ ] `pnpm test` passe (tests existants)
- [ ] `pnpm build` réussit

### Manual Testing
- [ ] DevTools > Elements > head vérifié
- [ ] Facebook Sharing Debugger (optionnel)
- [ ] Twitter Card Validator (optionnel)

---

## Rollback Plan

Si problème détecté:

1. `git revert HEAD` pour le dernier commit
2. Vérifier les traductions dans messages/*.json
3. S'assurer que root layout n'a pas de métadonnées conflictuelles
4. Vérifier le type Props avec Promise

---

**Created**: 2025-11-20
**Last Updated**: 2025-11-20
