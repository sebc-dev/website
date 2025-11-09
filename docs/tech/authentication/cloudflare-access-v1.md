# Authentification V1 : Cloudflare Access pour Admin

## Vue d'ensemble

La V1 utilise Cloudflare Access comme mécanisme d'authentification pour sécuriser les routes d'administration. C'est une approche \"Zero Trust\" robuste et sans base de données utilisateur.

## Avantages

✅ **Zero Trust** : Pas d'accès public aux routes sensibles
✅ **Sans BD** : Pas de table utilisateurs pour V1
✅ **Cloudflare Native** : Intégration directe avec l'infrastructure
✅ **Sécurisé** : JWT signé par Cloudflare
✅ **Simple** : Configuration directe sans SDK complexe

## Configuration

### 1. Créer une Application Access

Dans Cloudflare Dashboard :

1. Allez à **Zero Trust** → **Access** → **Applications**
2. Créez une nouvelle application
3. Configurez le domaine : `https://yourdomain.com/admin`
4. Ajoutez une politique avec votre email ou groupe

### 2. Middleware Validation

Créez un middleware pour valider le JWT Cloudflare :

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

export async function middleware(request: NextRequest) {
  // Extraire le JWT du header Cf-Authorization
  const token = request.headers.get('Cf-Access-Jwt-Assertion');

  // Routes protégées
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      // Valider le JWT (Cloudflare le signe avec OIDC)
      const secret = process.env.CLOUDFLARE_ACCESS_KEY;
      if (!secret) {
        throw new Error('Access key not configured');
      }

      const verified = await jose.jwtVerify(
        token,
        new TextEncoder().encode(secret),
      );

      // Token valide, continuer
      return NextResponse.next();
    } catch (error) {
      console.error('Token validation failed:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

### 3. Récupérer la Clé d'Accès

La clé de vérification JWT est disponible dans Cloudflare Dashboard :

1. **Zero Trust** → **Access** → **Applications** → Votre app
2. Copiez la **Application Audience (AUD)**
3. Configurez dans `wrangler.toml` :

```toml
vars = { CLOUDFLARE_ACCESS_AUD = "xxxxx.cloudflareaccess.com" }

[secrets]
CLOUDFLARE_ACCESS_KEY = "your-secret-key"
```

## Utilisation dans Server Actions

### Accéder à l'Identité de l'Utilisateur

```typescript
// src/app/admin/actions.ts
'use server';

import { headers } from 'next/headers';
import * as jose from 'jose';

export async function getAdminIdentity() {
  const headersList = await headers();
  const token = headersList.get('Cf-Access-Jwt-Assertion');

  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const secret = process.env.CLOUDFLARE_ACCESS_KEY;
    const verified = await jose.jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );

    const payload = verified.payload as any;

    return {
      email: payload.email,
      name: payload.name,
      groups: payload.groups || [],
      isAdmin: true,
    };
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

## Routes Protégées

### Admin Layout

```typescript
// src/app/admin/layout.tsx
import { getAdminIdentity } from "@/app/admin/actions";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const user = await getAdminIdentity();
    return (
      <div className="admin-layout">
        <nav>
          <span>Connecté en tant que : {user.email}</span>
          <a href="/api/auth/logout">Logout</a>
        </nav>
        {children}
      </div>
    );
  } catch (error) {
    redirect("/");
  }
}
```

## Sécurité

### Validation Stricte

✅ Validez **toujours** le JWT côté serveur
✅ Vérifiez l'**audience (AUD)** du token
✅ Utilisez HTTPS en production (Cloudflare le force)
✅ Loggez les tentatives d'accès échouées

### Points d'Attaque

❌ Ne faites pas confiance au header seul sans validation
❌ N'acceptez pas les tokens expirés
❌ Ne stockez pas de secrets dans le code client

## Transition vers V2 (Better Auth)

Pour la Post-V1 avec authentification utilisateur :

1. Maintenir Cloudflare Access pour les routes `/admin`
2. Ajouter une couche Better Auth pour les utilisateurs ordinaires
3. Deux systèmes coexistent temporairement

Voir : [Better Auth Post-V1](./better-auth-post-v1.md)

## Ressources

- [Cloudflare Access Docs](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-apps/)
- [Zero Trust Architecture](https://www.cloudflare.com/en-gb/learning/security/what-is-zero-trust/)
- [JWT Verification](https://tools.ietf.org/html/rfc7519)
