# Optimisation des Images avec Cloudflare Images et next/image

## Vue d'ensemble

Cloudflare Images est un service de transformation et optimisation d'images. Intégré avec un custom loader pour next/image, il offre une meilleure alternative à l'optimisation par défaut de Vercel.

## Avantages

✅ **Pas de Bill Shock** : Pas de surprises de facturation comme avec Vercel
✅ **Global Delivery** : Images servies depuis le réseau edge Cloudflare
✅ **Transformations** : Redimensionnement, compression, format conversion
✅ **Intégration D1** : Stockage des URLs d'images dans D1
✅ **Coût Prévisible** : Facturation simple et prévisible

## Problème Résolu

### Bill Shock avec Vercel

Le composant `next/image` par défaut utilise le service d'optimisation de Vercel. Pour les blogs avec beaucoup d'images, cela peut entraîner une facturation très élevée.

```typescript
// ❌ Ceci entraîne de la facturation Vercel
<Image
  src={article.image}
  alt={article.title}
  width={1200}
  height={600}
/>
```

## Configuration

### 1. Créer un Custom Loader

```typescript
// src/lib/image-loader.ts
import type { ImageLoaderProps } from 'next/image';

export function cloudflareImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  // Format: https://yourcdn.com/image.jpg?width=800&quality=75
  const url = new URL(src, 'https://yourcdn.com');

  // Ajouter les paramètres de transformation
  url.searchParams.set('width', width.toString());
  url.searchParams.set('quality', (quality || 75).toString());
  // Format automatiquement détecté (webp si supporté)
  url.searchParams.set('format', 'auto');

  return url.toString();
}
```

### 2. Configurer next/image

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    // Domaines autorisés
    domains: [
      'yourcdn.com',
      'images.yourdomain.com',
      'cloudflare-cdn.example.com',
    ],
    // Formats optimisés
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
```

### 3. Configuration Cloudflare Images

```toml
# wrangler.toml
[env.production]
  vars = { CLOUDFLARE_IMAGES_BASE_URL = "https://images.yourdomain.com" }
```

## Utilisation dans les Pages

### Article avec Image

```typescript
// src/app/articles/[slug]/page.tsx
import Image from "next/image";
import { cloudflareImageLoader } from "@/lib/image-loader";

export default function ArticlePage({ article }) {
  return (
    <article>
      <header>
        <h1>{article.title}</h1>
        {article.image && (
          <Image
            src={article.image}
            alt={article.title}
            width={1200}
            height={600}
            loader={cloudflareImageLoader}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
          />
        )}
      </header>
      <div>{article.content}</div>
    </article>
  );
}
```

### Galerie d'Images

```typescript
// src/components/article-gallery.tsx
import Image from "next/image";
import { cloudflareImageLoader } from "@/lib/image-loader";

export function ArticleGallery({ images }: { images: string[] }) {
  return (
    <div className="gallery">
      {images.map((src, i) => (
        <div key={i} className="gallery-item">
          <Image
            src={src}
            alt={`Gallery image ${i + 1}`}
            width={600}
            height={400}
            loader={cloudflareImageLoader}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ))}
    </div>
  );
}
```

## Upload et Stockage

### Upload via R2 (Presigned URL)

Voir : [R2 Presigned URLs](../cloudflare-r2/presigned-urls.md)

### Servir depuis R2/Images

```typescript
// Après upload en R2, générer l'URL publique
const imageUrl = `https://images.yourdomain.com/uploads/${filename}`;

// Stocker dans D1
await db.insert(articles).values({
  // ...
  image: imageUrl,
});
```

## Transformations Avancées

### Redimensionnement Dynamique

```typescript
function getResponsiveImage(baseSrc: string, sizes: number[]) {
  return sizes.map((size) => ({
    src: `${baseSrc}?width=${size}&quality=75&format=auto`,
    size,
  }));
}

// Utilisation
const src = 'https://images.yourdomain.com/article-hero.jpg';
const responsive = getResponsiveImage(src, [640, 750, 828, 1080, 1200]);
```

### Conversion de Format

```typescript
// Cloudflare Images détecte automatiquement le navigateur
// et sert le format optimal (webp, avif, jpeg)
const optimizedUrl = `${imageUrl}?format=auto`;
```

## Performance

### Meilleure Pratique

✅ Utilisez `width` et `height` pour prévenir layout shift
✅ Définissez `sizes` pour responsive images
✅ Utilisez `priority` pour les images above-the-fold
✅ Utilisez `loading="lazy"` pour below-the-fold (par défaut)

### Comparaison de Performance

| Aspect      | Vercel     | Cloudflare       |
| ----------- | ---------- | ---------------- |
| **Latence** | ~200ms     | ~50ms (edge)     |
| **Coût**    | Variable   | Prédictible      |
| **Formats** | Limités    | webp, avif, jpeg |
| **Cache**   | Vercel CDN | Cloudflare Edge  |

## Considérations

✅ Stockez les URLs d'images dans D1
✅ Utilisez un CDN pour servir les images (R2 + Cloudflare Images)
✅ Optimisez les `sizes` pour responsive design
✅ Compressez les images avant upload

❌ N'utilisez pas le loader par défaut de Vercel
❌ N'uploadez pas d'images sans optimisation
❌ Ne servez pas les images du disque local (utiliser CDN)
❌ Ne supposez pas que toutes les URLs sont valides

## Ressources

- [Cloudflare Images Docs](https://developers.cloudflare.com/images/)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [OpenNext Image Optimization](https://opennext.js.org/cloudflare/howtos/image)
- [Responsive Image Patterns](https://web.dev/patterns/web-vitals-patterns/images/)
