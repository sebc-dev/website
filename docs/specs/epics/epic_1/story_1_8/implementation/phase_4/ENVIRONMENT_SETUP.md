# Phase 4 - Environment Setup

**Phase**: 4 - Métadonnées SEO

---

## Prerequisites

### Previous Phases Required
- [x] Phase 1: Structure src/i18n/ complète
- [x] Phase 2: Layout [locale] avec Provider
- [x] Phase 3: Homepage internationalisée avec namespaces

### Dependencies Verification

```bash
# Verify next-intl is installed
pnpm list next-intl

# Verify TypeScript
pnpm tsc --version

# Verify project compiles
pnpm tsc
```

---

## Message Files Verification

### Required Keys in messages/fr.json

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

### Required Keys in messages/en.json

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

### Verification Commands

```bash
# Check FR namespace exists
cat messages/fr.json | grep -A5 '"metadata"'

# Check EN namespace exists
cat messages/en.json | grep -A5 '"metadata"'
```

---

## File Structure Check

```bash
# Verify locale layout exists
ls -la app/[locale]/layout.tsx

# Verify locale page exists
ls -la app/[locale]/page.tsx

# Check current layout content
head -50 app/[locale]/layout.tsx
```

---

## Development Server

```bash
# Start development server
pnpm dev

# Test URLs
# http://localhost:3000/fr
# http://localhost:3000/en
```

---

## Testing Metadata

### Browser DevTools Method

1. Open http://localhost:3000/fr
2. Right-click > View Page Source
3. Check `<head>` section for:
   - `<title>`
   - `<meta name="description">`
   - `<meta property="og:*">`
   - `<meta name="twitter:*">`

### Command Line Method

```bash
# Fetch FR page and extract title
curl -s http://localhost:3000/fr | grep -o '<title>.*</title>'

# Fetch EN page and extract title
curl -s http://localhost:3000/en | grep -o '<title>.*</title>'

# Check OG tags
curl -s http://localhost:3000/fr | grep 'og:locale'
```

---

## Root Layout Check

Ensure `app/layout.tsx` does NOT have conflicting metadata:

```typescript
// app/layout.tsx should NOT have:
// export const metadata = { ... }
//
// Metadata is handled by [locale]/layout.tsx
```

---

## TypeScript Configuration

Verify tsconfig.json has correct settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

---

## OG Image Placeholder

If `/public/og-image.png` doesn't exist:

```bash
# Check if OG image exists
ls -la public/og-image.png

# If not, create placeholder or update path in code
```

---

## Environment Ready Checklist

- [ ] `pnpm dev` runs without errors
- [ ] `/fr` and `/en` pages load
- [ ] Namespace `metadata` exists in both message files
- [ ] `app/[locale]/layout.tsx` exists
- [ ] Root layout has no conflicting metadata
- [ ] TypeScript compiles without errors

---

**Created**: 2025-11-20
**Last Updated**: 2025-11-20
