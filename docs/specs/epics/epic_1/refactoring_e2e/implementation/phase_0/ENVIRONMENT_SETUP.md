# Environment Setup - Phase 0

**Phase**: Phase 0 - Nettoyage et Préparation
**Durée estimée setup**: 15-20min
**Dernière mise à jour**: 2025-01-19

---

## Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Prérequis Système](#prérequis-système)
3. [Outils Requis](#outils-requis)
4. [Configuration Initiale](#configuration-initiale)
5. [Vérification de l'Environnement](#vérification-de-lenvironnement)
6. [Troubleshooting](#troubleshooting)

---

## Vue d'Ensemble

La Phase 0 est une phase de **nettoyage et documentation**, elle ne nécessite **pas** de configuration complexe ni de services externes (pas de Cloudflare, pas de D1, pas de wrangler).

### Ce qui est requis

✅ Git (commiter, stager, supprimer fichiers)
✅ Node.js + pnpm (linter, build, tests existants)
✅ Éditeur de texte (modifier fichiers)

### Ce qui n'est PAS requis

❌ Cloudflare account
❌ wrangler CLI configuré
❌ D1 database
❌ Secrets ou tokens
❌ Docker, containers
❌ Services externes

---

## Prérequis Système

### Système d'Exploitation

Testé et supporté sur:

- ✅ macOS 12+ (Monterey, Ventura, Sonoma)
- ✅ Linux (Ubuntu 20.04+, Debian 11+, Fedora 36+)
- ✅ Windows 10/11 avec WSL2 (Ubuntu 22.04 recommandé)

**Note Windows**: Utiliser WSL2 pour Git et ligne de commande.

### Spécifications Minimales

- **CPU**: 2 cores minimum
- **RAM**: 4 GB minimum (8 GB recommandé)
- **Disque**: 500 MB libre (pour node_modules si réinstallation)
- **Réseau**: Aucun (tout local)

---

## Outils Requis

### 1. Git

**Version minimale**: 2.30+

#### Vérification

```bash
git --version
# Attendu: git version 2.30.0 ou supérieur
```

#### Installation

**macOS**:

```bash
# Avec Homebrew
brew install git

# Ou télécharger depuis https://git-scm.com/
```

**Linux (Ubuntu/Debian)**:

```bash
sudo apt update
sudo apt install git
```

**Linux (Fedora)**:

```bash
sudo dnf install git
```

**Windows**:

- Installer WSL2: https://learn.microsoft.com/en-us/windows/wsl/install
- Puis installer Git dans WSL:
  ```bash
  sudo apt update && sudo apt install git
  ```

#### Configuration Git (si première utilisation)

```bash
# Configurer nom et email
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"

# Vérifier la config
git config --list | grep user
```

### 2. Node.js

**Version requise**: 20.x LTS

#### Vérification

```bash
node --version
# Attendu: v20.x.x (ex: v20.11.0)
```

#### Installation

**Recommandé: nvm (Node Version Manager)**:

```bash
# Installer nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Redémarrer le shell ou sourcer:
source ~/.bashrc  # ou ~/.zshrc sur macOS

# Installer Node.js 20
nvm install 20
nvm use 20

# Vérifier
node --version
```

**Alternative: Installation directe**:

- macOS: `brew install node@20`
- Ubuntu/Debian: https://github.com/nodesource/distributions
- Windows WSL: Utiliser nvm (recommandé)

### 3. pnpm

**Version requise**: 9.15+

#### Vérification

```bash
pnpm --version
# Attendu: 9.15.0 ou supérieur
```

#### Installation

```bash
# Avec npm (livré avec Node.js)
npm install -g pnpm@latest

# Ou avec corepack (recommandé)
corepack enable
corepack prepare pnpm@latest --activate

# Vérifier
pnpm --version
```

### 4. Éditeur de Texte

**Recommandations** (un seul suffit):

- **VS Code** (recommandé): https://code.visualstudio.com/
  - Extensions recommandées:
    - GitLens (historique Git)
    - Markdown All in One
    - Prettier (formatage)

- **Vim/Neovim**: Pré-installé sur Linux/macOS

- **Nano**: Pré-installé, simple pour débutants

#### Configuration Vim (optionnelle)

```bash
# Ajouter à ~/.vimrc pour meilleur édition Markdown
cat >> ~/.vimrc << 'EOF'
" Markdown
autocmd FileType markdown setlocal wrap linebreak nolist
syntax on
set number
EOF
```

### 5. Outils Optionnels (Recommandés)

#### yamllint (pour validation workflow CI)

```bash
# Installation
pip install yamllint
# ou
brew install yamllint  # macOS

# Vérification
yamllint --version
```

#### gh (GitHub CLI, pour créer PR plus tard)

```bash
# macOS
brew install gh

# Linux
# Voir: https://github.com/cli/cli/blob/trunk/docs/install_linux.md

# Authentification
gh auth login
```

---

## Configuration Initiale

### 1. Cloner le Repository (si pas déjà fait)

```bash
# Cloner
git clone <repository-url>
cd website

# Ou si déjà cloné, se positionner dans le repo
cd /home/negus/dev/website
```

### 2. Vérifier la Branche

```bash
# Voir la branche actuelle
git branch --show-current

# Devrait afficher: main, master, ou develop (selon convention du projet)
```

### 3. Mettre à Jour depuis Remote

```bash
# Récupérer les dernières modifications
git fetch origin

# Se positionner sur la branche main (ou master)
git checkout main  # ou master
git pull origin main
```

### 4. Installer les Dépendances

```bash
# Installer toutes les dépendances npm
pnpm install

# Attendre la fin de l'installation
# Durée: 1-3 minutes selon connexion
```

#### Vérification de l'Installation

```bash
# Vérifier que node_modules existe
ls -la node_modules | head

# Vérifier les bins
pnpm exec playwright --version
pnpm exec tsc --version
```

### 5. Vérifier que les Tests Existants Passent

```bash
# Linter
pnpm lint
# Attendu: ✅ Aucune erreur

# Tests unitaires
pnpm test
# Attendu: ✅ Tous les tests passent
```

**Si des tests échouent**: Ne pas démarrer Phase 0. Fixer les tests d'abord ou consulter l'équipe.

### 6. Créer la Branche de Travail

```bash
# Créer une nouvelle branche pour Phase 0
git checkout -b phase-0/cleanup-and-preparation

# Vérifier la branche
git branch --show-current
# Attendu: phase-0/cleanup-and-preparation
```

---

## Vérification de l'Environnement

### Checklist Complète

Exécuter ce script pour valider que tout est prêt:

```bash
#!/bin/bash
echo "=== Phase 0 Environment Check ==="
echo ""

# 1. Git
if command -v git >/dev/null 2>&1; then
  GIT_VERSION=$(git --version | awk '{print $3}')
  echo "✅ Git: $GIT_VERSION"
else
  echo "❌ Git: Not found"
  exit 1
fi

# 2. Node.js
if command -v node >/dev/null 2>&1; then
  NODE_VERSION=$(node --version)
  echo "✅ Node.js: $NODE_VERSION"
  if [[ $NODE_VERSION == v20* ]]; then
    echo "   ✅ Version 20.x (OK)"
  else
    echo "   ⚠️ Version non-20.x (attendu: v20.x)"
  fi
else
  echo "❌ Node.js: Not found"
  exit 1
fi

# 3. pnpm
if command -v pnpm >/dev/null 2>&1; then
  PNPM_VERSION=$(pnpm --version)
  echo "✅ pnpm: $PNPM_VERSION"
else
  echo "❌ pnpm: Not found"
  exit 1
fi

# 4. Repository Git
if git rev-parse --git-dir > /dev/null 2>&1; then
  BRANCH=$(git branch --show-current)
  echo "✅ Git repository: $BRANCH"
else
  echo "❌ Not in a Git repository"
  exit 1
fi

# 5. node_modules installé
if [ -d "node_modules" ]; then
  echo "✅ node_modules: Installed"
else
  echo "⚠️ node_modules: Not found (run 'pnpm install')"
fi

# 6. Fichiers clés du projet
FILES=("package.json" "playwright.config.ts" ".gitignore" "CLAUDE.md")
for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ]; then
    echo "✅ File: $FILE"
  else
    echo "❌ File missing: $FILE"
  fi
done

# 7. Scripts clés
if [ -f "scripts/dev-quiet.sh" ]; then
  echo "✅ Script: dev-quiet.sh"
else
  echo "⚠️ Script missing: dev-quiet.sh"
fi

# 8. Outils optionnels
if command -v yamllint >/dev/null 2>&1; then
  echo "✅ yamllint: $(yamllint --version)"
else
  echo "ℹ️ yamllint: Not found (optional)"
fi

if command -v gh >/dev/null 2>&1; then
  echo "✅ gh (GitHub CLI): $(gh --version | head -1)"
else
  echo "ℹ️ gh: Not found (optional)"
fi

echo ""
echo "=== Environment Check Complete ==="
echo ""
echo "Ready to start Phase 0 implementation!"
```

**Sauvegarder ce script** dans `scripts/check-phase-0-env.sh`:

```bash
# Créer le script
cat > scripts/check-phase-0-env.sh << 'EOF'
[coller le script ci-dessus]
EOF

# Rendre exécutable
chmod +x scripts/check-phase-0-env.sh

# Exécuter
./scripts/check-phase-0-env.sh
```

### Résultat Attendu

```
=== Phase 0 Environment Check ===

✅ Git: 2.39.0
✅ Node.js: v20.11.0
   ✅ Version 20.x (OK)
✅ pnpm: 9.15.0
✅ Git repository: phase-0/cleanup-and-preparation
✅ node_modules: Installed
✅ File: package.json
✅ File: playwright.config.ts
✅ File: .gitignore
✅ File: CLAUDE.md
✅ Script: dev-quiet.sh
ℹ️ yamllint: Not found (optional)
ℹ️ gh: Not found (optional)

=== Environment Check Complete ===

Ready to start Phase 0 implementation!
```

**Si tous les ✅ sont présents**: Environnement prêt! 🚀

---

## Configuration Spécifique Phase 0

### Pas de Configuration Additionnelle Requise

La Phase 0 étant une phase de nettoyage/documentation:

- ❌ Pas de variables d'environnement à configurer
- ❌ Pas de services à démarrer
- ❌ Pas de secrets à générer
- ❌ Pas de base de données à initialiser

### Configurations Nécessaires pour Phases Futures (Informations)

**Phase 1+** nécessitera:

- wrangler CLI configuré
- Cloudflare account
- Secrets CLOUDFLARE_API_TOKEN et CLOUDFLARE_ACCOUNT_ID

**Ne pas les configurer maintenant** - Phase 0 n'en a pas besoin.

---

## Troubleshooting

### Problème: "pnpm: command not found"

**Cause**: pnpm non installé ou non dans PATH.

**Solution**:

```bash
# Installer avec npm
npm install -g pnpm

# Vérifier
pnpm --version

# Si toujours introuvable, vérifier PATH
echo $PATH | grep npm
```

### Problème: "Node.js version is not 20.x"

**Cause**: Mauvaise version de Node.js.

**Solution**:

```bash
# Avec nvm
nvm install 20
nvm use 20

# Vérifier
node --version

# Persister pour toutes les sessions
nvm alias default 20
```

### Problème: "pnpm install" échoue avec erreur de permissions

**Cause**: Permissions node_modules ou cache corrompus.

**Solution**:

```bash
# Nettoyer le cache
pnpm store prune

# Supprimer node_modules
rm -rf node_modules

# Réinstaller
pnpm install
```

### Problème: "pnpm lint" ou "pnpm test" échouent

**Cause**: Problèmes existants dans le code (pas liés à Phase 0).

**Action**:

1. **Ne pas démarrer Phase 0**
2. Fixer les erreurs existantes d'abord
3. Ou consulter l'équipe si les erreurs sont normales (tests désactivés?)

**Workaround temporaire** (si erreurs acceptées):

```bash
# Commenter temporairement dans package.json
# "lint": "echo 'Lint skipped for Phase 0'"
# "test": "echo 'Tests skipped for Phase 0'"
```

### Problème: "git checkout -b" échoue (branche existe déjà)

**Cause**: Branche phase-0/cleanup-and-preparation déjà créée.

**Solution**:

```bash
# Supprimer la branche existante
git branch -D phase-0/cleanup-and-preparation

# Recréer depuis main
git checkout main
git checkout -b phase-0/cleanup-and-preparation
```

### Problème: Modifications non commités bloquent la création de branche

**Cause**: Fichiers modifiés dans working directory.

**Solution**:

```bash
# Option 1: Stash temporaire
git stash
git checkout -b phase-0/cleanup-and-preparation
git stash pop

# Option 2: Commiter les modifications (si valides)
git add .
git commit -m "WIP: modifications avant Phase 0"
git checkout -b phase-0/cleanup-and-preparation
```

### Problème: yamllint introuvable mais voulu

**Cause**: yamllint non installé (optionnel).

**Solution**:

```bash
# Python/pip requis
# Vérifier:
python3 --version
pip3 --version

# Installer yamllint
pip3 install --user yamllint

# Ou avec Homebrew (macOS)
brew install yamllint
```

---

## Variables d'Environnement

### Aucune Variable Requise pour Phase 0

Phase 0 ne nécessite **aucune** variable d'environnement.

### Variables pour Phases Futures (Référence)

**Ces variables NE SONT PAS nécessaires maintenant** mais seront requises en Phase 1+:

```bash
# Phase 1+ (Configuration Cloudflare)
export CLOUDFLARE_API_TOKEN="<token>"           # À générer sur Cloudflare Dashboard
export CLOUDFLARE_ACCOUNT_ID="<account-id>"    # Trouvable dans Workers & Pages

# Phase 1+ (Wrangler)
# Les variables seront automatiquement lues par wrangler depuis:
# - .env (local)
# - GitHub Secrets (CI)
```

**Action**: Ne rien faire maintenant. Voir [ENVIRONMENT_SETUP.md de Phase 1](../phase_1/ENVIRONMENT_SETUP.md) le moment venu.

---

## Permissions et Accès

### Permissions Requises

Pour Phase 0, vous avez besoin de:

✅ **Git**: Permissions read/write sur le repository (commiter, pusher)
✅ **Filesystem**: Permissions read/write dans le répertoire du projet
✅ **npm registry**: Accès public (pour pnpm install si dépendances manquantes)

### Permissions NON Requises

❌ Cloudflare account
❌ GitHub Secrets (lecture/écriture)
❌ Accès au repository de production
❌ Permissions admin GitHub

---

## Backup et Sécurité

### Créer un Backup Avant Phase 0

**Recommandé** (mais optionnel) pour rollback facile:

```bash
# Créer une branche de backup
git checkout main
git checkout -b backup/before-phase-0
git push origin backup/before-phase-0

# Revenir à la branche de travail
git checkout main
git checkout -b phase-0/cleanup-and-preparation
```

### Sauvegarder les Fichiers Clés

Si vous voulez un backup local supplémentaire:

```bash
# Créer un dossier de backup
mkdir -p ~/backups/website-phase-0

# Copier les fichiers clés
cp playwright.config.ts ~/backups/website-phase-0/
cp .gitignore ~/backups/website-phase-0/
cp CLAUDE.md ~/backups/website-phase-0/
cp scripts/dev-quiet.sh ~/backups/website-phase-0/
cp .github/workflows/quality.yml ~/backups/website-phase-0/

echo "Backup créé dans ~/backups/website-phase-0/"
```

---

## Prochaines Étapes

### Environnement Prêt?

Si tous les checks passent:

1. **Lire la documentation**:
   - [INDEX.md](./INDEX.md) - Vue d'ensemble
   - [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Plan détaillé
   - [COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md) - Checklist d'implémentation

2. **Démarrer l'implémentation**:
   - Suivre [COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md) étape par étape
   - Commencer par Commit 1 (ADR 002)

3. **En cas de blocage**:
   - Consulter [guides/REVIEW.md](./guides/REVIEW.md) section "Troubleshooting"
   - Demander aide au tech lead

---

## Changelog

| Date       | Version | Changement                         |
| ---------- | ------- | ---------------------------------- |
| 2025-01-19 | 1.0.0   | Création du guide de setup Phase 0 |

---

**Environnement prêt? Consultez [COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md) pour démarrer! 🚀**
