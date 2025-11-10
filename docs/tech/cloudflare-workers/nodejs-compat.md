# Flag nodejs_compat : Prérequis Non Négociable

## Vue d'ensemble

Le flag `nodejs_compat` est un prérequis **critique et non négociable** pour exécuter Next.js sur Cloudflare Workers. Son absence entraîne des défaillances d'exécution immédiates.

## Importance Critique

### Statut du Flag

- **Non activé par défaut** : contrairement à d'autres flags, il ne sera jamais activé par défaut
- **Configuration manuelle requise** : doit être défini explicitement dans `wrangler.toml`
- **Fondamentale** : sans ce flag, aucune dépendance n'accédant à des APIs Node.js ne fonctionnera

## Configuration Requise

Dans `wrangler.toml` :

```toml
compatibility_flags = ["nodejs_compat"]
```

## Architecture Sous-jacente

### La Tension Architecturale

Next.js s'attend à un environnement d'exécution Node.js complet avec accès à :

- `process` global
- Module `fs` (file system)
- `async_hooks`
- Autres APIs Node.js spécifiques

**Cloudflare Workers (workerd)** n'est **pas** Node.js. C'est un runtime basé sur :

- Isolats V8 (V8 isolates)
- Standards web (Web APIs)
- Conçu pour la vitesse et la performance

### Le Pont : nodejs_compat

Le flag `nodejs_compat` active une couche de compatibilité qui :

1. **Simule les APIs Node.js** via des polyfills et code natif C++
2. **Mappe les imports Node.js** vers les implémentations disponibles
3. **Fournit les globals Node.js** (`process`, `Buffer`, etc.)

## Conséquences de son Absence

Sans ce flag, vous obtiendrez des erreurs immédiates :

```
Error: Could not access built-in Node.js modules
```

Cela se produit dès qu'une dépendance (même transitive) tente d'utiliser une API Node.js.

## Points de Risque

### Performance et Stabilité

Ce flag est un point de friction architecturale. Les problèmes suivants se produisent **généralement à ce niveau** :

- **Dégradation des performances** inexplicables
- **Dépassements de limites CPU** lors du traitement
- **Bugs subtils** liés à la compatibilité des APIs

### Monitoring Recommandé

Lors de la migration vers Workers, vérifiez :

- Temps d'exécution des Server Actions
- Comportement des dépendances utilisant `fs`, `path`, etc.
- Limites CPU atteintes inopinément

## Considérations de Déploiement

### Versions de Cloudflare

Assurez-vous que votre version de Wrangler supporte `nodejs_compat`. Utilisez :

```bash
wrangler --version
```

### Testing

L'activation de ce flag peut exposer des bugs dans les dépendances :

1. Testez localement avec `wrangler dev` et le flag activé
2. Surveillez les warnings de compatibilité
3. Identifiez les dépendances problématiques avant le déploiement

## Ressources

- [Cloudflare Docs - Compatibility Flags](https://developers.cloudflare.com/workers/configuration/compatibility-flags/)
- [A year of improving Node.js compatibility in Cloudflare Workers](https://blog.cloudflare.com/nodejs-workers-2025/)
