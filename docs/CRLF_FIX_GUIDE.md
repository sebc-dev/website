# Guide de résolution des problèmes de fins de ligne et hooks Husky

## Problèmes résolus

### 1. Fins de ligne incorrectes (CRLF au lieu de LF)
Les scripts shell (`.sh`, hooks Git) avaient des fins de ligne Windows (CRLF) au lieu de Unix (LF), causant l'erreur :
```
$'\r': command not found
set: pipefail : invalid option name
```

### 2. Hook pre-push avec mauvais chemin vers husky.sh
Le hook `pre-push` utilisait un mauvais chemin pour sourcer `husky.sh` :
```
.husky/pre-push: 2: .: cannot open .husky/_/husky.sh
husky - pre-push script failed (code 2)
```

## Solutions mises en place

### 1. Fichiers corrigés avec fins de ligne LF
- ✅ `.claude/quality-system/hooks/quality-check.sh` → Recréé avec fins de ligne LF
- ✅ `.husky/pre-commit` → Recréé avec fins de ligne LF + shebang et source de husky
- ✅ `.husky/pre-push` → Recréé avec fins de ligne LF + chemin corrigé vers `h`

**Format correct pour les hooks Husky :**
```bash
#!/usr/bin/env sh
. "$(dirname "$0")/_/h"

# Votre code ici...
```

### 2. Configuration Git (`.gitattributes`)
Mis à jour pour forcer les fins de ligne LF pour tous les scripts shell :
```gitattributes
.husky/** eol=lf
scripts/** eol=lf
.claude/quality-system/hooks/** eol=lf
*.sh eol=lf
```

### 3. Configuration éditeur (`.editorconfig`)
Créé pour que tous les éditeurs utilisent automatiquement LF :
```editorconfig
[*]
end_of_line = lf
insert_final_newline = true
charset = utf-8
```

## Comment normaliser les fins de ligne dans Git

Si vous rencontrez encore des problèmes, exécutez ces commandes dans Git Bash ou WSL :

```bash
# Normaliser tous les fichiers selon .gitattributes
git add --renormalize .

# Vérifier les fins de ligne d'un fichier
file .claude/quality-system/hooks/quality-check.sh

# Convertir manuellement un fichier si nécessaire
dos2unix .claude/quality-system/hooks/quality-check.sh
# OU
sed -i 's/\r$//' .claude/quality-system/hooks/quality-check.sh
```

## Structure des hooks Husky

```
.husky/
├── _/              # Templates et infrastructure Husky
│   ├── h           # Script principal de Husky (point d'entrée)
│   ├── husky.sh    # Ancien format (Husky v4)
│   └── ...         # Autres templates
├── pre-commit      # Votre hook pre-commit (exécuté avant commit)
└── pre-push        # Votre hook pre-push (exécuté avant push)
```

**Important :**
- Les hooks dans `.husky/` (racine) sont vos hooks personnalisés
- Les fichiers dans `.husky/_/` sont des templates et l'infrastructure Husky
- Tous les hooks doivent sourcer `. "$(dirname "$0")/_/h"` au début

## Prévention future

1. **Utilisez WSL pour Git** : Travaillez toujours depuis WSL pour les scripts shell
2. **EditorConfig** : Assurez-vous que votre IDE supporte EditorConfig
3. **Configuration Git globale** : 
   ```bash
   git config --global core.autocrlf input
   ```
   Cela convertit automatiquement CRLF → LF lors du commit

## Test du push

Essayez maintenant de pousser vos modifications :
```bash
git push
```

Les hooks pre-commit et pre-push devraient maintenant fonctionner correctement ! ✨

## Résultats attendus

**Pre-commit :**
- ✅ Validation des variables d'environnement
- ✅ Lint-staged (ESLint + Prettier sur fichiers modifiés)
- ⊘ Tests (skip, exécutés au pre-push)

**Pre-push :**
- ✅ Tests unitaires (Vitest)
- ✅ Vérifie que tous les tests passent avant le push

