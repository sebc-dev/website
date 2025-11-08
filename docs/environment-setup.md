# Configuration d'Environnement

Ce document décrit comment configurer les variables d'environnement et la configuration Cloudflare pour le projet sebc.dev.

## Vue d'Ensemble

Le projet utilise plusieurs fichiers de configuration pour gérer les environnements :

| Fichier | Usage | Versionné | Description |
|---------|-------|-----------|-------------|
| `.env` | Développement local | ❌ Non (`.gitignore`) | Variables pour le développement local |
| `.env.example` | Template | ✅ Oui | Template pour nouveaux développeurs |
| `wrangler.jsonc` | Configuration Cloudflare | ✅ Oui | Configuration pour déploiement (dev/staging/prod) |

## Fichiers d'Environnement

### `.env` - Variables Locales

Copier `.env.example` vers `.env` et remplir avec vos valeurs :

```bash
cp .env.example .env
```

**Variables requises** :

#### Base de données Cloudflare D1

- **`CLOUDFLARE_ACCOUNT_ID`** : ID de votre compte Cloudflare
  - Trouver : [Cloudflare Dashboard](https://dash.cloudflare.com/) (bas gauche)
  - Ou exécuter : `wrangler whoami`

- **`CLOUDFLARE_DATABASE_ID`** : ID de la base de données D1
  - Généré lors de : `wrangler d1 create sebc-dev-db`
  - Format UUID : `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
  - ⚠️ **IMPORTANT** : Doit correspondre au `database_id` dans `wrangler.jsonc`

- **`CLOUDFLARE_API_TOKEN`** : Token API avec permissions D1
  - Créer : [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
  - Permissions requises :
    - Account > Cloudflare D1 > Edit
    - Account > Workers Scripts > Edit

#### Local Development (optionnel)

- **`LOCAL_D1`** : Utiliser la simulation locale D1 (Miniflare)
  - Valeur : `true` (par défaut)

### `.env.local` - Overrides Locaux (NON supporté actuellement)

Pour l'instant, utilisez uniquement `.env`. Le fichier `.env.local` est ignoré par Git mais non utilisé par les scripts actuels.

**Standardisation future** : Migrer vers `.env.local` pour les overrides personnels.

## Configuration Cloudflare Workers

### `wrangler.jsonc` - Configuration Déploiement

Ce fichier contient la configuration pour Cloudflare Workers :

```jsonc
{
  "d1_databases": [{
    "binding": "DB",
    "database_name": "sebc-dev-db",
    "database_id": "6615b6d8-2522-46dc-9051-bc0813b42240",  // ID pour environnement dev
    "migrations_dir": "drizzle/migrations"
  }]
}
```

#### À propos du `database_id` hardcodé

**Pourquoi le `database_id` est-il hardcodé dans `wrangler.jsonc` ?**

1. **Wrangler ne supporte pas les variables d'environnement** dans `wrangler.jsonc`
2. **Ce n'est pas un secret sensible** - C'est un identifiant de ressource Cloudflare (UUID)
3. **Nécessaire pour le déploiement** - Wrangler doit connaître quelle base D1 utiliser

**Est-ce sécurisé ?**

✅ **OUI** - Le `database_id` n'est pas un secret :
- C'est un UUID de ressource Cloudflare
- Accessible uniquement avec des credentials valides (API token)
- Similaire à un ID de repository GitHub (public mais non exploitable)

❌ **À NE PAS committer** :
- `CLOUDFLARE_API_TOKEN` (secret dans `.env`)
- Credentials de base de données
- Clés privées

#### Gestion Multi-Environnements

Pour gérer plusieurs environnements (dev, staging, production), deux options :

**Option A : Branches Git** (recommandé pour petits projets)
```bash
# Branche dev (wrangler.jsonc avec database_id dev)
git checkout dev

# Branche production (wrangler.jsonc avec database_id production)
git checkout main
```

**Option B : Fichiers Wrangler séparés** (pour projets complexes)
```bash
# Créer des fichiers par environnement (gitignored)
wrangler.dev.jsonc
wrangler.staging.jsonc
wrangler.production.jsonc

# Déployer avec fichier spécifique
wrangler deploy --config wrangler.production.jsonc
```

## Scripts npm et Variables d'Environnement

### Scripts de Base de Données

Tous les scripts DB utilisent `dotenv -e .env` pour charger les variables :

```json
{
  "db:check": "dotenv -e .env -- node -e \"...validation...\"",
  "db:generate": "npm run db:check && dotenv -e .env -- drizzle-kit generate",
  "db:migrate:remote": "npm run db:check && dotenv -e .env -- wrangler d1 migrations apply DB --remote"
}
```

### Validation des Variables

Le script `db:check` valide que toutes les variables requises sont définies :

```bash
pnpm db:check
```

**Variables validées** :
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_DATABASE_ID`
- `CLOUDFLARE_API_TOKEN`

**Comportement** :
- ✅ Toutes définies → Succès
- ❌ Une manquante ou vide → Erreur avec nom de la variable

## Configuration Initiale

### Pour un Nouveau Développeur

1. **Cloner le repository**
   ```bash
   git clone https://github.com/sebc-dev/website.git
   cd website
   ```

2. **Installer les dépendances**
   ```bash
   pnpm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   # Éditer .env avec vos valeurs Cloudflare
   ```

4. **Vérifier la configuration**
   ```bash
   pnpm db:check
   ```

5. **Créer/utiliser la base de données D1**

   **Option A : Créer une nouvelle base D1 (recommandé pour dev local)**
   ```bash
   # Créer une nouvelle base D1
   wrangler d1 create sebc-dev-db-local

   # Copier le database_id généré dans :
   # - .env (CLOUDFLARE_DATABASE_ID)
   # - wrangler.jsonc (database_id) - pour votre branche de dev
   ```

   **Option B : Utiliser la base D1 partagée (dev team)**
   ```bash
   # Demander le database_id à l'équipe
   # Le renseigner uniquement dans .env
   # NE PAS modifier wrangler.jsonc sur main/dev
   ```

6. **Appliquer les migrations**
   ```bash
   pnpm db:migrate:local
   ```

7. **Tester**
   ```bash
   pnpm dev
   ```

## Dépannage

### Erreur : "Missing: CLOUDFLARE_*"

**Cause** : Variable d'environnement manquante ou vide

**Solution** :
```bash
# Vérifier le contenu de .env
cat .env

# S'assurer que toutes les variables sont remplies (pas de valeurs par défaut)
# Exemple INCORRECT :
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id_here  # ❌

# Exemple CORRECT :
CLOUDFLARE_ACCOUNT_ID=a1b2c3d4e5f67890  # ✅
```

### Erreur : "database_id mismatch"

**Cause** : `database_id` dans `wrangler.jsonc` différent de `CLOUDFLARE_DATABASE_ID` dans `.env`

**Solution** :
```bash
# Lire le database_id dans wrangler.jsonc
grep database_id wrangler.jsonc

# Mettre à jour .env pour correspondre (ou vice-versa)
```

### Scripts DB ne chargent pas les variables

**Cause** : `dotenv-cli` non installé ou version incorrecte

**Solution** :
```bash
# Réinstaller les dépendances
pnpm install

# Vérifier la version de dotenv-cli
pnpm list dotenv-cli
# Devrait afficher : dotenv-cli@10.0.0
```

### Migration échoue avec erreur FK

**Cause** : Foreign keys activées, ordre de création incorrect

**Solution** : Les migrations Drizzle gèrent cela automatiquement. Si problème :
```bash
# Supprimer la base locale et recréer
rm -rf .wrangler/state/v3/d1
pnpm db:migrate:local
```

## Bonnes Pratiques

### ✅ À FAIRE

- Utiliser `.env` pour toutes les variables locales
- Valider avec `pnpm db:check` avant exécution scripts DB
- Documenter nouvelles variables dans `.env.example`
- Créer une base D1 locale personnelle pour dev

### ❌ À NE PAS FAIRE

- Committer `.env` (déjà dans `.gitignore`)
- Committer tokens API ou secrets
- Partager votre `.env` (contient vos credentials)
- Modifier `wrangler.jsonc.database_id` sur branches partagées (main/dev)

## Références

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Drizzle ORM with D1](https://orm.drizzle.team/docs/get-started-sqlite#cloudflare-d1)
- [API Tokens Cloudflare](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)

---

**Dernière mise à jour** : 2025-11-08
**Mainteneur** : @sebc-dev
