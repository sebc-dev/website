# 📑 Index du Système de Qualité

Vous cherchez quelque chose de spécifique ? Ce guide vous aide à naviguer rapidement vers la bonne documentation.

## 🚀 Pour Démarrer Rapidement

| Je veux...                                | Aller à...                                                                      |
| ----------------------------------------- | ------------------------------------------------------------------------------- |
| Comprendre comment ça marche en 2 minutes | [`QUALITY-SYSTEM-SUMMARY.md`](.claude/quality-system/docs/SUMMARY.md)           |
| Voir des schémas visuels des flux         | [`QUALITY-SYSTEM-VISUAL-GUIDE.md`](.claude/quality-system/docs/VISUAL-GUIDE.md) |
| Lire la doc complète et technique         | [`README-QUALITY-HOOKS.md`](.claude/quality-system/docs/README.md)              |
| Vérifier que tout est bien installé       | Exécuter `.claude/quality-system/scripts/test-installation.sh`                  |

## 📚 Documentation par Type

### Documentation Utilisateur

| Document                         | Contenu                                | Quand le lire              |
| -------------------------------- | -------------------------------------- | -------------------------- |
| `INSTALLATION-SUCCESS.txt`       | Message de confirmation d'installation | Juste après l'installation |
| `QUALITY-SYSTEM-SUMMARY.md`      | Résumé concis (5-10 min de lecture)    | Pour un aperçu rapide      |
| `QUALITY-SYSTEM-VISUAL-GUIDE.md` | Diagrammes et flux visuels             | Pour comprendre les flux   |

### Documentation Technique

| Document                  | Contenu                              | Quand le lire                   |
| ------------------------- | ------------------------------------ | ------------------------------- |
| `README-QUALITY-HOOKS.md` | Guide technique complet et référence | Pour l'implémentation détaillée |
| `settings.json`           | Configuration des hooks              | Pour personnaliser les matchers |

### Documentation des Composants

| Composant            | Documentation               | Localisation                                                                      |
| -------------------- | --------------------------- | --------------------------------------------------------------------------------- |
| Hook PostToolUse     | Commentaires dans le script | `.claude/quality-system/hooks/quality-check.sh`                                   |
| Skill quality-report | Instructions complètes      | `.claude/quality-system/skills/quality-report/SKILL.md`                           |
| Script de génération | Commentaires dans le script | `.claude/quality-system/skills/quality-report/scripts/generate-quality-report.sh` |

## 🔍 Recherche par Question

### "Comment ça fonctionne ?"

1. **Vue d'ensemble** → [`QUALITY-SYSTEM-SUMMARY.md#-ce-qui-a-été-installé`](.claude/quality-system/docs/SUMMARY.md)
2. **Flux détaillés** → [`QUALITY-SYSTEM-VISUAL-GUIDE.md#-flux-de-fonctionnement`](.claude/quality-system/docs/VISUAL-GUIDE.md)
3. **Architecture** → [`QUALITY-SYSTEM-VISUAL-GUIDE.md#-architecture-des-composants`](.claude/quality-system/docs/VISUAL-GUIDE.md)

### "Comment l'utiliser ?"

1. **Démarrage rapide** → [`QUALITY-SYSTEM-SUMMARY.md#-utilisation-rapide`](.claude/quality-system/docs/SUMMARY.md)
2. **Mode automatique** → [`README-QUALITY-HOOKS.md#utilisation-automatique-hook`](.claude/quality-system/docs/README.md)
3. **Mode manuel** → [`README-QUALITY-HOOKS.md#utilisation-manuelle-skill`](.claude/quality-system/docs/README.md)

### "Comment le personnaliser ?"

1. **Résumé** → [`QUALITY-SYSTEM-SUMMARY.md#%EF%B8%8F-configuration-actuelle`](.claude/quality-system/docs/SUMMARY.md)
2. **Guide complet** → [`README-QUALITY-HOOKS.md#-personnalisation`](.claude/quality-system/docs/README.md)
3. **Variables d'env** → [`README-QUALITY-HOOKS.md#variables-denvironnement`](.claude/quality-system/docs/README.md)

### "Quelque chose ne fonctionne pas"

1. **Validation** → Exécuter `.claude/quality-system/scripts/test-installation.sh`
2. **Dépannage** → [`README-QUALITY-HOOKS.md#-dépannage`](.claude/quality-system/docs/README.md)
3. **Logs** → Vérifier `/tmp/quality-check-*.log`

### "Je veux comprendre les concepts"

1. **Hooks Claude Code** → `docs/claude-code/Devenir expert des hooks Claude Code.md`
2. **Skills Claude Code** → `docs/claude-code/Maîtriser les Skills dans Claude Code.md`
3. **Philosophie** → [`README-QUALITY-HOOKS.md#-métriques-et-performance`](.claude/quality-system/docs/README.md)

## 📂 Structure des Fichiers

```
.claude/
├── INDEX-QUALITY-SYSTEM.md                    ← VOUS ÊTES ICI
├── INSTALLATION-SUCCESS.txt                   (Message d'installation)
├── QUALITY-SYSTEM-SUMMARY.md                  (Résumé rapide)
├── QUALITY-SYSTEM-VISUAL-GUIDE.md            (Guide visuel)
├── README-QUALITY-HOOKS.md                    (Doc technique complète)
├── test-quality-system.sh                     (Script de validation)
│
├── settings.json                              (Configuration hooks)
│
├── hooks/
│   └── quality-check.sh                       (Hook PostToolUse)
│
├── skills/
│   └── quality-report/
│       ├── SKILL.md                           (Définition du skill)
│       ├── scripts/
│       │   └── generate-quality-report.sh     (Génération rapports)
│       └── resources/
│           └── report-template.md             (Template Markdown)
│
└── reports/                                   (Rapports générés)
    ├── .gitignore
    └── quality-{timestamp}.{json,md}
```

## 🎯 Parcours Recommandés

### Parcours "Débutant" (15 minutes)

1. Lire [`INSTALLATION-SUCCESS.txt`](.claude/quality-system/docs/INSTALLATION-SUCCESS.txt)
2. Parcourir [`QUALITY-SYSTEM-SUMMARY.md`](.claude/quality-system/docs/SUMMARY.md)
3. Exécuter `.claude/quality-system/scripts/test-installation.sh`
4. Tester en modifiant un fichier TypeScript

### Parcours "Utilisateur" (30 minutes)

1. Lire [`QUALITY-SYSTEM-SUMMARY.md`](.claude/quality-system/docs/SUMMARY.md)
2. Consulter [`QUALITY-SYSTEM-VISUAL-GUIDE.md`](.claude/quality-system/docs/VISUAL-GUIDE.md)
3. Lire les sections "Utilisation" de [`README-QUALITY-HOOKS.md`](.claude/quality-system/docs/README.md)
4. Tester les deux modes (automatique et manuel)

### Parcours "Expert" (1 heure)

1. Lire intégralement [`README-QUALITY-HOOKS.md`](.claude/quality-system/docs/README.md)
2. Étudier les scripts :
   - `.claude/quality-system/hooks/quality-check.sh`
   - `.claude/quality-system/skills/quality-report/scripts/generate-quality-report.sh`
3. Lire les guides de référence :
   - `docs/claude-code/Devenir expert des hooks Claude Code.md`
   - `docs/claude-code/Maîtriser les Skills dans Claude Code.md`
4. Personnaliser le système selon vos besoins

### Parcours "Développeur" (2 heures)

1. Tout le parcours "Expert"
2. Analyser le code source des scripts
3. Comprendre l'architecture des hooks et skills
4. Créer vos propres hooks/skills personnalisés
5. Contribuer des améliorations

## 🔗 Liens Externes Utiles

- [Claude Code - Hooks Reference](https://docs.claude.com/en/docs/claude-code/hooks)
- [Claude Code - Skills Guide](https://docs.claude.com/en/docs/claude-code/skills)
- [Anthropic - Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

## 📞 Support et Ressources

### Documentation Locale

| Ressource         | Localisation                                                |
| ----------------- | ----------------------------------------------------------- |
| Guide Hooks (FR)  | `docs/claude-code/Devenir expert des hooks Claude Code.md`  |
| Guide Skills (FR) | `docs/claude-code/Maîtriser les Skills dans Claude Code.md` |

### Scripts Utiles

| Script                | Commande                                                   | Utilité                |
| --------------------- | ---------------------------------------------------------- | ---------------------- |
| Test d'installation   | `.claude/quality-system/scripts/test-installation.sh`      | Valider l'installation |
| Test manuel du hook   | `.claude/quality-system/hooks/quality-check.sh`            | Tester le hook seul    |
| Génération de rapport | `.claude/quality-system/skills/quality-report/scripts/...` | Tester le skill seul   |

## 🎓 Glossaire Rapide

| Terme             | Définition                                                      |
| ----------------- | --------------------------------------------------------------- |
| **Hook**          | Script automatique exécuté en réponse à un événement            |
| **PostToolUse**   | Hook qui s'exécute après l'utilisation d'un outil (Write, Edit) |
| **Skill**         | Package de connaissances/expertise invocable par Claude         |
| **Matcher**       | Critères pour déterminer si un hook doit s'exécuter             |
| **Exit Code**     | Code de sortie d'un script (0=succès, 1=warning, 2=critique)    |
| **Quality Check** | Vérification de qualité du code (typecheck, lint, tests, etc.)  |

---

**Besoin d'aide ?** Commencez par le [`QUALITY-SYSTEM-SUMMARY.md`](.claude/quality-system/docs/SUMMARY.md) puis consultez les sections pertinentes du [`README-QUALITY-HOOKS.md`](.claude/quality-system/docs/README.md).

**Dernière mise à jour :** 2025-10-29
