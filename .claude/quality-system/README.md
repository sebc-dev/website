# 🎯 Système de Qualité du Code

> Système automatisé de vérification de la qualité du code pour sebc.dev
>
> **Version:** 1.0.0 | **Date:** 2025-10-29

## 📂 Structure du Dossier

```
quality-system/
├── README.md                    # Ce fichier - Vue d'ensemble
│
├── docs/                        # 📚 Documentation complète
│   ├── INDEX.md                # Navigation rapide
│   ├── SUMMARY.md              # Résumé (5-10 min)
│   ├── VISUAL-GUIDE.md         # Diagrammes et flux
│   ├── README.md               # Guide technique complet
│   └── INSTALLATION-SUCCESS.txt # Message d'installation
│
├── hooks/                       # 🎯 Scripts de hooks
│   └── quality-check.sh        # Hook PostToolUse automatique
│
├── skills/                      # 📦 Skills Claude
│   └── quality-report/         # Skill de génération de rapports
│       ├── SKILL.md            # Définition du skill
│       ├── scripts/
│       │   └── generate-quality-report.sh
│       └── resources/
│           └── report-template.md
│
├── reports/                     # 📊 Rapports générés (gitignored)
│   ├── .gitignore
│   └── quality-{timestamp}.{json,md}
│
└── scripts/                     # 🔧 Scripts utilitaires
    └── test-installation.sh    # Validation de l'installation
```

## 🚀 Démarrage Rapide

### 1. Vérifier l'Installation

```bash
.claude/quality-system/scripts/test-installation.sh
```

### 2. Utilisation Automatique (Hook)

**Aucune action nécessaire !** Le hook s'exécute automatiquement après chaque modification de fichier TypeScript/JavaScript.

### 3. Utilisation Manuelle (Skill)

Demandez à Claude :

```
"Génère-moi un rapport de qualité du code"
```

## 📚 Documentation

| Fichier                                        | Description         | Public       |
| ---------------------------------------------- | ------------------- | ------------ |
| [`docs/INDEX.md`](docs/INDEX.md)               | Navigation et index | Tous         |
| [`docs/SUMMARY.md`](docs/SUMMARY.md)           | Résumé rapide       | Utilisateurs |
| [`docs/VISUAL-GUIDE.md`](docs/VISUAL-GUIDE.md) | Diagrammes visuels  | Tous         |
| [`docs/README.md`](docs/README.md)             | Guide complet       | Experts      |

## 🔧 Composants

### Hook Automatique

- **Fichier:** `hooks/quality-check.sh`
- **Déclenchement:** Après Write/Edit de fichiers TS/JS
- **Configuration:** `../.claude/settings.json`

### Skill Manuel

- **Nom:** `quality-report`
- **Localisation:** `skills/quality-report/`
- **Invocation:** Sur demande

## ✅ Vérifications Effectuées

1. ✅ **TypeScript Type Check** (critique)
2. ✅ **Biome Linting** (non-critique)
3. ✅ **Biome Formatting** (automatique)
4. ✅ **Tests Unitaires** (Vitest)
5. ✅ **Couverture de Code** (avec seuils)

## 🎓 Parcours Recommandés

### Débutant (15 min)

1. Lire [`docs/INSTALLATION-SUCCESS.txt`](docs/INSTALLATION-SUCCESS.txt)
2. Parcourir [`docs/SUMMARY.md`](docs/SUMMARY.md)
3. Tester en modifiant un fichier

### Utilisateur (30 min)

1. Lire [`docs/SUMMARY.md`](docs/SUMMARY.md)
2. Consulter [`docs/VISUAL-GUIDE.md`](docs/VISUAL-GUIDE.md)
3. Tester les deux modes (auto et manuel)

### Expert (1h)

1. Lire [`docs/README.md`](docs/README.md)
2. Étudier les scripts dans `hooks/` et `skills/`
3. Personnaliser selon vos besoins

## 🔗 Liens Rapides

- **Configuration des hooks:** `../.claude/settings.json`
- **Rapports générés:** `reports/`
- **Script de test:** `scripts/test-installation.sh`

## 📞 Support

Pour toute question, consultez d'abord [`docs/INDEX.md`](docs/INDEX.md) qui vous guidera vers la bonne documentation.

---

**Installation validée:** ✅ 12/12 tests passés
