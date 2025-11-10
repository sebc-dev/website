# 🎯 Système de Qualité du Code

> Système automatisé de vérification de la qualité du code pour sebc.dev
>
> **Version:** 2.0.0 | **Date:** 2025-11-10

## 📂 Structure du Système

Le système de qualité est intégré dans `.claude/` :

```
.claude/
├── quality-system/              # 🎯 Système de qualité
│   ├── README.md               # Ce fichier - Vue d'ensemble
│   ├── INTEGRATION_STATUS.md   # Statut d'intégration
│   ├── STACK_UPDATE.md         # Documentation des changements v2.0
│   │
│   ├── hooks/                  # 🎯 Scripts de hooks
│   │   └── quality-check.sh   # Hook PostToolUse (prêt à configurer)
│   │
│   └── reports/                # 📊 Rapports générés (gitignored)
│       ├── .gitignore
│       └── quality-*.{json,md}
│
└── skills/                      # 📦 Skills Claude
    └── quality-report/         # ✅ Skill intégré
        ├── SKILL.md            # Définition du skill
        ├── scripts/
        │   └── generate-quality-report.sh
        └── resources/
            └── report-template.md
```

## 🚀 Démarrage Rapide

### Utilisation Manuelle (Skill)

Demandez simplement à Claude :

```
"Génère-moi un rapport de qualité du code"
```

Les rapports sont générés dans `.claude/quality-system/reports/`

### Utilisation Automatique (Hook - Optionnel)

Pour activer les vérifications automatiques après chaque modification de fichier, consultez [INTEGRATION_STATUS.md](INTEGRATION_STATUS.md#configuration-requise-optionnelle).

## 📚 Documentation

| Fichier                                        | Description                                 |
| ---------------------------------------------- | ------------------------------------------- |
| [README.md](README.md)                         | Ce fichier - Vue d'ensemble                 |
| [INTEGRATION_STATUS.md](INTEGRATION_STATUS.md) | Statut d'intégration et configuration       |
| [STACK_UPDATE.md](STACK_UPDATE.md)             | Documentation complète des changements v2.0 |

## 🔧 Composants

### Skill Manuel

- **Nom:** `quality-report`
- **Localisation:** `.claude/skills/quality-report/`
- **Invocation:** Sur demande
- **Statut:** ✅ Intégré et configuré dans `settings.local.json`

### Hook Automatique (Optionnel)

- **Fichier:** `hooks/quality-check.sh`
- **Déclenchement:** Après Write/Edit de fichiers TS/JS
- **Configuration:** `.claude/settings.local.json`
- **Statut:** ✅ Prêt (non configuré par défaut)

## ✅ Vérifications Effectuées

### 🔍 Static Analysis

1. ✅ **TypeScript Type Check** (`tsc --noEmit`) - critique
2. ✅ **ESLint** (`pnpm lint`) - non-critique
3. ✅ **Prettier Format Check** (`pnpm format:check`) - non-critique

### 🏗️ Architecture

4. ✅ **Dependency Cruiser** (`pnpm arch:validate`) - validation d'architecture

### 🧪 Tests

5. ✅ **Vitest Unit Tests** (`pnpm test`) - non-critique
6. ✅ **Code Coverage** (`pnpm test:coverage`) - avec seuils

### 🎭 E2E (Optionnel)

7. ⏸️ **Playwright E2E Tests** (`pnpm test:e2e`) - désactivé par défaut (trop lourd)

## 🔄 Stack Technique

Le système utilise la stack réelle du projet :

- **Framework:** Next.js 15
- **Runtime:** Cloudflare Workers
- **Language:** TypeScript 5
- **Linter:** ESLint
- **Formatter:** Prettier
- **Tests:** Vitest + Playwright
- **Architecture:** Dependency Cruiser

Voir [STACK_UPDATE.md](STACK_UPDATE.md) pour plus de détails.

## 📊 Exemple de Rapport

Les rapports générés incluent :

- **Score global** avec badge (🟢 Excellent, 🟡 Bon, 🟠 À améliorer, 🔴 Critique)
- **Métriques détaillées** (passed, failed, warnings)
- **Détails par catégorie** (Static Analysis, Architecture, Tests)
- **Recommandations automatiques** basées sur les résultats
- **Commandes utiles** pour corriger les problèmes

## 🎯 Configuration

### Variables d'Environnement

Pour personnaliser le comportement du rapport :

```bash
# Format du rapport (json, markdown, both)
export QUALITY_REPORT_FORMAT="both"

# Niveau de détail
export QUALITY_REPORT_DETAILED="true"

# Inclure les tests E2E (lent)
export QUALITY_REPORT_E2E="false"
```

### Hook Automatique

Pour activer le hook, voir [INTEGRATION_STATUS.md](INTEGRATION_STATUS.md) pour la configuration complète.

## 📞 Support

- **Statut d'intégration:** [INTEGRATION_STATUS.md](INTEGRATION_STATUS.md)
- **Détails des changements:** [STACK_UPDATE.md](STACK_UPDATE.md)
- **Rapports générés:** `reports/`

---

**Version:** 2.0.0 | **Statut:** ✅ Complètement intégré et mis à jour
