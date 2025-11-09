# Cloudflare R2 : Presigned URLs pour Upload Sécurisé

## Vue d'ensemble

Les presigned URLs permettent aux clients de télécharger des fichiers **directement** vers R2 sans passer par votre Worker. C'est le pattern de niveau expert pour les uploads de fichiers volumineux.

## Problème Résolu

### Limites des Workers

Un Worker Cloudflare a des limites strictes :

- **CPU Time** : ~50ms de calcul pur (limité)
- **Mémoire** : Peu disponible
- **Connexion** : Timeout sur les uploads longs

Essayer de recevoir un fichier volumineux via un Server Action échouerait :

```typescript
// ❌ Ceci échouera pour les gros fichiers
export async function uploadFile(formData: FormData) {
  const file = formData.get('file') as File;
  const buffer = await file.arrayBuffer(); // CPU time exceeded!
  // ...
}
```

### La Solution

Les presigned URLs déplacent la **charge de transfert** du calcul (Worker limité) vers le **stockage** (R2, conçu pour cela).

**Architecture** :

1. **Client** → (demande URL) → **Worker** (Server Action)
2. **Worker** → (génère presigned URL) → **Client**
3. **Client** → (upload directement) → **R2** (bypass Worker)

## Implémentation

### 1. Server Action : Générer une Presigned URL

```typescript
// src/app/actions.ts
'use server';

import { s3Client } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function getUploadUrl(filename: string, contentType: string) {
  const key = `uploads/${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: 'your-r2-bucket',
    Key: key,
    ContentType: contentType,
  });

  // Génère une URL valide pendant 1 heure
  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600,
  });

  return { signedUrl, key };
}
```

### 2. Configuration du S3 Client

```typescript
// lib/s3.ts
import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});
```

### 3. Client : Utiliser la Presigned URL

```typescript
// components/upload-form.tsx
"use client";

import { useState } from "react";
import { getUploadUrl } from "@/app/actions";

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload() {
    if (!file) return;

    setIsUploading(true);

    try {
      // 1. Demander une presigned URL au Server
      const { signedUrl } = await getUploadUrl(
        file.name,
        file.type
      );

      // 2. Upload directement vers R2
      const response = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (response.ok) {
        alert("Upload réussi!");
      } else {
        alert("Erreur lors de l'upload");
      }
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
      >
        {isUploading ? "Upload..." : "Upload"}
      </button>
    </div>
  );
}
```

## Configuration Cloudflare

### Variables d'Environnement

Dans `wrangler.toml` :

```toml
[env.production]
vars = { CLOUDFLARE_ACCOUNT_ID = "your-account-id" }

[env.production.secrets]
# À définir avec wrangler secret put
R2_ACCESS_KEY_ID = "..."
R2_SECRET_ACCESS_KEY = "..."
```

Définissez les secrets :

```bash
wrangler secret put R2_ACCESS_KEY_ID --env production
wrangler secret put R2_SECRET_ACCESS_KEY --env production
```

### Créer une Presigned URL (Cloudflare UI)

Si vous préférez utiliser l'API Cloudflare directement :

```typescript
// Alternative : API Cloudflare R2
import { R2 } from "@aws-sdk/client-s3";

const presignedUrl = await s3Client.getSignedUrl(
  bucket: "your-bucket",
  key: `uploads/${filename}`,
  expiresIn: 3600,
);
```

## Sécurité

### CORS Configuration

Configurez CORS sur votre bucket R2 pour permettre les uploads depuis votre domaine :

```bash
wrangler r2 bucket cors update your-bucket \
  --preflight-max-age 3600 \
  --allowed-methods GET,PUT,POST \
  --allowed-origins "https://yourdomain.com"
```

### Durée d'Expiration

Les presigned URLs expirent après un délai configuré. Utilisez :

- **Court terme** (15 min) : Plus sécurisé, meilleur si le client upload immédiatement
- **Moyen terme** (1 heure) : Balance sécurité/UX
- **Long terme** (24h) : Permet des uploads repris

### Permissions Granulaires

La presigned URL n'expose que :

- Un bucket R2 spécifique
- Une clé (chemin) spécifique
- Une opération (PUT pour upload)

Les credentials du Worker ne sont **jamais exposés** au client.

## Bonnes Pratiques

✅ Générez des URLs uniques avec `Date.now()` ou UUIDs
✅ Définissez des expirations courtes
✅ Validez `filename` et `contentType` côté serveur
✅ Loggez les uploads pour l'audit
✅ Utilisez HTTPS uniquement en production

❌ N'exposez pas les credentials R2 au client
❌ N'acceptez pas n'importe quel contentType
❌ N'oubliez pas de définir l'expiration
❌ Ne truquez pas la validation du nom de fichier

## Patterns Avancés

### Gestion des Uploads Multi-Fichiers

```typescript
export async function getMultipleUploadUrls(files: FileInfo[]) {
  return Promise.all(files.map((f) => getUploadUrl(f.name, f.type)));
}
```

### Résumé d'Upload (Checksum)

Pour vérifier l'intégrité, ajoutez un checksum :

```typescript
const command = new PutObjectCommand({
  Bucket: 'your-r2-bucket',
  Key: key,
  ContentType: contentType,
  Metadata: {
    checksum: await calculateSHA256(file),
  },
});
```

## Ressources

- [AWS SDK - S3 Request Presigner](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/putobjectcommand.html)
- [Cloudflare R2 Presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
- [How to Upload Files to Cloudflare R2 in a Next.js App](https://www.buildwithmatija.com/blog/how-to-upload-files-to-cloudflare-r2-nextjs)
