# 🎯 Système de Vérification Automatique de la Qualité du Code

Ce document décrit le système de hooks et skills mis en place pour automatiser les vérifications de qualité du code dans le projet sebc.dev.

## 📋 Vue d'Ensemble

Le système se compose de deux mécanismes complémentaires :

1. **Hook PostToolUse automatique** : S'exécute automatiquement après chaque modification de fichier TypeScript/JavaScript
2. **Skill quality-report** : Permet de générer des rapports de qualité détaillés sur demande

## 🔧 Composants du Système

### 1. Hook PostToolUse (`.claude/quality-system/hooks/quality-check.sh`)

#### Déclenchement Automatique

Le hook s'exécute automatiquement après chaque utilisation des outils `Write` ou `Edit` sur des fichiers TypeScript/JavaScript dans `apps/web/`.

#### Configuration

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": {
          "tool_name": "Write|Edit",
          "file_paths": ["apps/web/**/*.{ts,tsx,js,jsx}"]
        },
        "command": "$CLAUDE_PROJECT_DIR/.claude/quality-system/hooks/quality-check.sh"
      }
    ]
  }
}
```

#### Vérifications Effectuées

1. **TypeScript Type Check** (critique)
   - Commande : `pnpm --filter web typecheck`
   - Bloque si des erreurs de type sont détectées

2. **Biome Linting** (non-critique)
   - Commande : `pnpm --filter web lint`
   - Rapporte les problèmes de linting

3. **Biome Formatting** (non-critique)
   - Commande : `pnpm --filter web format`
   - Formate automatiquement le code

4. **Tests Unitaires** (non-critique)
   - Commande : `pnpm --filter web test --run`
   - Exécute les tests pertinents

5. **Couverture de Code** (non-critique)
   - Commande : `pnpm --filter web test:coverage --run`
   - Génère un rapport de couverture

#### Optimisations Intelligentes

Le hook détecte automatiquement les fichiers modifiés et adapte ses vérifications :

- **Fichiers TS/JS modifiés** → Toutes les vérifications
- **Fichiers de test modifiés** → Tests + couverture prioritaires
- **Autres fichiers** → Vérifications sautées pour la performance

#### Rapport de Sortie

```
ℹ Running TypeScript Type Check...
✓ TypeScript Type Check passed
ℹ Running Biome Linting...
⚠ Biome Linting failed (non-critical)
...

═══════════════════════════════════════════════════════
  📊 Quality Check Report
═══════════════════════════════════════════════════════

Total checks: 5
Passed: 4
Failed: 1
Skipped: 0

Details:
  ✓ TypeScript Type Check
  ⚠ Biome Linting (non-critical)
  ✓ Biome Format Check
  ✓ Unit Tests
  ✓ Code Coverage
```

### 2. Skill quality-report (`.claude/quality-system/skills/quality-report/`)

#### Invocation Manuelle

Le skill peut être invoqué à tout moment en posant une question à Claude :

```
"Peux-tu me générer un rapport de qualité du code ?"
"Vérifie la qualité globale du projet"
"Fais un audit de qualité"
```

#### Structure du Skill

```
.claude/quality-system/skills/quality-report/
├── SKILL.md                                    # Définition et instructions
├── scripts/
│   └── generate-quality-report.sh             # Script de génération
└── resources/
    └── report-template.md                     # Template de rapport
```

#### Fonctionnalités Avancées

1. **Rapports persistants** : Les rapports sont sauvegardés dans `.claude/quality-system/reports/`
2. **Formats multiples** : JSON (pour le parsing) et Markdown (pour la lecture)
3. **Score global** : Calcul automatique d'un score de qualité sur 100
4. **Recommandations** : Suggestions d'actions correctives

#### Variables d'Environnement

```bash
QUALITY_REPORT_FORMAT=both        # json, markdown, ou both
QUALITY_REPORT_DETAILED=true      # Inclure les logs détaillés
```

#### Exemple de Rapport Généré

**Fichier Markdown** (`.claude/quality-system/reports/quality-20251029_143000.md`) :

```markdown
# 📊 Rapport de Qualité du Code

**Date :** 2025-10-29 14:30:00
**Projet :** sebc.dev

## Résumé Exécutif

✅ **Score global :** 85/100

- ✅ Passed: 4
- ❌ Failed: 0
- ⚠️ Warnings: 1
- 📊 Total: 5

## Détails des Vérifications

### ✅ TypeScript Type Check
- **Status:** passed
- **Durée:** 2.3s
- **Détails:** All checks passed

### ⚠️ Biome Linting
- **Status:** warning
- **Durée:** 1.1s
- **Détails:** Non-critical issues detected

...
```

**Fichier JSON** (`.claude/quality-system/reports/quality-20251029_143000.json`) :

```json
{
  "timestamp": "2025-10-29T14:30:00+01:00",
  "project": "sebc.dev",
  "checks": [
    {
      "name": "TypeScript Type Check",
      "status": "passed",
      "duration": "2.3s",
      "details": "All checks passed",
      "output": "..."
    }
  ],
  "summary": {
    "total": 5,
    "passed": 4,
    "failed": 0,
    "warnings": 1,
    "score": 85
  }
}
```

## 🚀 Utilisation

### Utilisation Automatique (Hook)

Aucune action nécessaire ! Le hook s'exécute automatiquement après chaque modification de fichier.

**Exemple de workflow :**

1. Claude modifie `apps/web/src/components/Button.tsx`
2. Le hook `PostToolUse` se déclenche automatiquement
3. Les vérifications de qualité s'exécutent
4. Un rapport est affiché dans le terminal
5. Si des erreurs critiques sont détectées, Claude en est informé

### Utilisation Manuelle (Skill)

**Demander un rapport complet :**

```
User: "Génère-moi un rapport de qualité du code"
Claude: [Exécute le skill quality-report]
        [Affiche un rapport structuré avec score et recommandations]
```

**Demander une vérification ciblée :**

```
User: "J'ai modifié le Login, est-ce que c'est OK ?"
Claude: [Identifie les fichiers modifiés]
        [Exécute les vérifications pertinentes]
        [Rapporte le statut]
```

## 🎨 Personnalisation

### Modifier les Vérifications

Pour ajouter ou retirer des vérifications, éditer `.claude/quality-system/hooks/quality-check.sh` :

```bash
# Ajouter une nouvelle vérification
run_check "Ma Nouvelle Vérification" "ma-commande" false
```

### Changer les Matchers du Hook

Pour modifier les fichiers ciblés, éditer `.claude/settings.json` :

```json
{
  "matcher": {
    "tool_name": "Write|Edit",
    "file_paths": ["**/*.{ts,tsx}"]  // Tous les fichiers TS
  }
}
```

### Personnaliser le Rapport

Éditer `.claude/quality-system/skills/quality-report/resources/report-template.md` pour changer le format du rapport.

## 📊 Métriques et Performance

### Impact sur la Performance

- **Hook automatique** : ~5-10s par modification (selon la taille du projet)
- **Skill manuel** : ~10-15s pour un rapport complet

### Optimisations Implémentées

1. **Détection intelligente** : Seules les vérifications pertinentes sont exécutées
2. **Exécution en parallèle** : Les vérifications indépendantes s'exécutent en parallèle (via pnpm)
3. **Cache** : Les outils (TypeScript, Biome) utilisent leur propre système de cache

## 🔒 Sécurité et Fiabilité

### Codes de Sortie

- **Exit 0** : Toutes les vérifications ont réussi
- **Exit 1** : Certaines vérifications ont échoué (non-bloquant)
- **Exit 2** : Erreur critique (bloquerait l'action si utilisé en PreToolUse)

### Principe du "Gardien" (Gatekeeper)

Le système actuel est **non-bloquant** :
- Les erreurs sont rapportées mais n'empêchent pas le travail de continuer
- Claude reçoit un feedback et peut corriger si nécessaire

Pour un mode **bloquant** (PreToolUse), modifier la configuration :

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": {"tool_name": "Write|Edit"},
        "command": ".claude/quality-system/hooks/quality-check.sh"
      }
    ]
  }
}
```

⚠️ **Attention** : En mode bloquant, le code de sortie 2 empêchera l'écriture du fichier.

## 📚 Références

Ce système est basé sur les meilleures pratiques décrites dans :

- **Guide Expert des Hooks** (`docs/claude-code/Devenir expert des hooks Claude Code.md`)
- **Maîtriser les Skills** (`docs/claude-code/Maîtriser les Skills dans Claude Code.md`)

### Concepts Clés Appliqués

1. **Modèle du Gardien** : Validation et feedback intelligent
2. **PostToolUse pour l'automatisation** : Exécution après modification
3. **Skills pour la réutilisabilité** : Encapsulation de l'expertise
4. **Contrôle déterministe** : Règles non-négociables pour la qualité

## 🛠️ Dépannage

### Le hook ne s'exécute pas

1. Vérifier que le fichier est exécutable : `chmod +x .claude/quality-system/hooks/quality-check.sh`
2. Vérifier la configuration dans `.claude/settings.json`
3. Utiliser `/hooks` dans Claude Code pour voir les hooks actifs

### Les vérifications échouent

1. S'assurer que les dépendances sont installées : `pnpm install`
2. Vérifier que les scripts package.json sont corrects
3. Consulter les logs détaillés dans `/tmp/quality-check-*.log`

### Le skill ne répond pas

1. Vérifier que le répertoire `.claude/quality-system/skills/quality-report/` existe
2. S'assurer que `SKILL.md` contient bien le frontmatter YAML
3. Relancer Claude Code pour recharger les skills

## 🎯 Roadmap

### Améliorations Futures

- [ ] Intégration avec Git pour ne vérifier que les fichiers modifiés depuis le dernier commit
- [ ] Webhook pour envoyer les rapports sur Slack/Discord
- [ ] Dashboard web pour visualiser l'évolution de la qualité
- [ ] Détection automatique des régressions de couverture
- [ ] Intégration CI/CD pour bloquer les PR avec score < 80

---

**Dernière mise à jour :** 2025-10-29
**Auteur :** Système automatisé de qualité Claude Code
