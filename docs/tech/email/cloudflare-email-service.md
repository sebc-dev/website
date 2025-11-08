# Cloudflare Email Service : Envoyer des Emails depuis les Workers

## Vue d'ensemble

Cloudflare Email Service est le service email natif pour Cloudflare Workers. C'est une meilleure approche que Resend pour les applications déployées sur Workers.

## Avantages par rapport à Resend

| Aspect | Cloudflare Email | Resend |
|--------|------------------|--------|
| **Intégration** | Binding natif (env.SEND_EMAIL) | Clé API externe |
| **Bundling** | Aucun problème | Erreurs avec @react-email/render |
| **Latence** | Edge (très bas) | API externe |
| **Prix** | Inclus dans le plan | Paiement par email |
| **Dépendances** | Minimal | React, React Email |

## Configuration

### 1. Activer dans wrangler.toml

```toml
[[services]]
binding = "SEND_EMAIL"
service = "send-email"
```

### 2. Créer une Rule de Routage

Dans Cloudflare Dashboard :
1. Allez à **Email Routing**
2. Configurez une **Destination Address** (exemple : admin@yourdomain.com)
3. Cette adresse recevra les emails

### 3. Envoyer un Email

Dans un Server Action :

```typescript
// src/app/actions.ts
"use server";

import type { MailMessage } from "@cloudflare/workers-types";

interface CloudflareEnv {
  SEND_EMAIL: any; // Service de Cloudflare
}

export async function sendWelcomeEmail(
  env: CloudflareEnv,
  recipientEmail: string,
  recipientName: string
) {
  try {
    await env.SEND_EMAIL.send({
      personalizations: [
        {
          to: [{ email: recipientEmail }],
        },
      ],
      from: {
        email: "noreply@yourdomain.com",
        name: "Mon Blog",
      },
      subject: "Bienvenue!",
      content: [
        {
          type: "text/html",
          value: `
            <h1>Bienvenue ${recipientName}!</h1>
            <p>Merci de vous être inscrit.</p>
            <a href="https://yourdomain.com/verify">Vérifier votre email</a>
          `,
        },
      ],
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Email delivery failed");
  }
}
```

## Formats Supportés

### HTML + Plain Text

```typescript
await env.SEND_EMAIL.send({
  personalizations: [{ to: [{ email: "user@example.com" }] }],
  from: { email: "noreply@yourdomain.com" },
  subject: "Subject",
  content: [
    {
      type: "text/plain",
      value: "Plain text version",
    },
    {
      type: "text/html",
      value: "<h1>HTML version</h1>",
    },
  ],
});
```

### Avec Attachments (si supporté)

```typescript
await env.SEND_EMAIL.send({
  personalizations: [{ to: [{ email: "user@example.com" }] }],
  from: { email: "noreply@yourdomain.com" },
  subject: "Invoice",
  content: [
    {
      type: "text/html",
      value: "<p>Your invoice is attached</p>",
    },
  ],
  attachments: [
    {
      filename: "invoice.pdf",
      type: "application/pdf",
      content: Buffer.from(pdfData).toString("base64"),
    },
  ],
});
```

## Cas d'Usage

### Email de Bienvenue

```typescript
export async function sendWelcomeEmail(
  env: CloudflareEnv,
  email: string,
  verifyToken: string
) {
  const verifyUrl = `https://yourdomain.com/verify?token=${verifyToken}`;

  await env.SEND_EMAIL.send({
    personalizations: [{ to: [{ email }] }],
    from: { email: "noreply@yourdomain.com", name: "sebc.dev" },
    subject: "Vérifiez votre email",
    content: [
      {
        type: "text/html",
        value: `
          <h2>Bienvenue sur sebc.dev!</h2>
          <p>Cliquez sur le lien ci-dessous pour vérifier votre email:</p>
          <a href="${verifyUrl}" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">
            Vérifier mon email
          </a>
          <p style="color: #666; font-size: 12px;">
            Ce lien expire dans 24 heures.
          </p>
        `,
      },
    ],
  });
}
```

### Email de Notification

```typescript
export async function notifyNewComment(
  env: CloudflareEnv,
  articleAuthorEmail: string,
  articleTitle: string,
  commentAuthor: string
) {
  await env.SEND_EMAIL.send({
    personalizations: [{ to: [{ email: articleAuthorEmail }] }],
    from: { email: "noreply@yourdomain.com" },
    subject: `Nouveau commentaire sur "${articleTitle}"`,
    content: [
      {
        type: "text/html",
        value: `
          <p>${commentAuthor} a commenté votre article:</p>
          <h3>${articleTitle}</h3>
          <a href="https://yourdomain.com/articles/${articleTitle.toLowerCase().replace(/\\s/g, "-")}#comments">
            Voir le commentaire
          </a>
        `,
      },
    ],
  });
}
```

## Sécurité

### Email Spoofing Protection

- ✅ Configurez SPF, DKIM, et DMARC pour votre domaine
- ✅ Utilisez une adresse "noreply" pour les transactionnels
- ✅ Validez l'adresse email avant d'envoyer

### Rate Limiting

Implémentez un système de rate limiting pour éviter les abus :

```typescript
// Simple Redis-based rate limiting (pseudo-code)
export async function sendEmailWithRateLimit(
  env: CloudflareEnv,
  email: string,
  template: "welcome" | "reset" | "notification"
) {
  const key = `email:${template}:${email}`;
  const limit = 5; // 5 emails max par jour
  const ttl = 86400; // 24 heures

  // Vérifier le rate limit
  const count = await env.KV.get(key);
  if (count && parseInt(count) >= limit) {
    throw new Error("Too many emails sent. Please try again later.");
  }

  // Envoyer l'email
  await env.SEND_EMAIL.send({
    // ... configuration
  });

  // Incrémenter le counter
  await env.KV.put(key, (parseInt(count || "0") + 1).toString(), {
    expirationTtl: ttl,
  });
}
```

## Considérations

✅ Utilisez comme binding natif Cloudflare
✅ Intégrez avec D1 pour tracer les emails envoyés
✅ Implémentez le rate limiting
✅ Validez les adresses email avant d'envoyer

❌ N'utilisez pas Resend (complexité inutile)
❌ N'exposez pas les adresses email en logging
❌ N'envoyez pas d'emails sans rate limiting
❌ Ne supposez pas que l'email a été livré (ajouter confirmation)

## Alternatives Futures

Si les besoins changent :
- **SendGrid** : Alternative établie avec plus de fonctionnalités
- **Postmark** : Excellente API pour emails transactionnels
- **D1 Vectorize Email** : Fonction native si disponible

## Ressources

- [Cloudflare Email Service Docs](https://developers.cloudflare.com/workers/tutorials/send-emails-with-resend/)
- [Email Configuration Best Practices](https://developers.cloudflare.com/email-routing/setup/)
- [SPF, DKIM, DMARC Setup](https://developers.cloudflare.com/email-routing/authentication/)
