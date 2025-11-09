# Configuration Branch Protection Rules

Guide complet pour configurer les règles de protection de branches sur GitHub.

## Vue d'ensemble

Les Branch Protection Rules garantissent que :
- ✅ Tout le code passe les tests avant merge
- ✅ Au moins un reviewer approuve chaque PR
- ✅ Les commits sont signés et à jour avec main
- ✅ Les actions GitHub réussissent

## Configuration Graphique (Recommandé)

### Accès à Settings

1. Allez sur https://github.com/YOUR_USER/website
2. Cliquez sur **Settings** (engrenage en haut à droite)
3. Dans le sidebar gauche, cliquez **Branches** (Règles)
4. Cliquez sur **Add rule**

### Pattern de Branche

```
Branch name pattern: main
```

### Règles Recommandées pour `main`

#### 1️⃣ Require a pull request before merging

- ✅ **Require pull request reviews before merging**
  - Nombre de pull requests requises : `1`
  - ✅ Require review from Code Owners
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require approval of the most recent reviewable push

#### 2️⃣ Require status checks to pass before merging

- ✅ **Require branches to be up to date before merging**
- ✅ Cochez les checks obligatoires :
  - ✅ **Code Quality (Lint, Format, Architecture, Tests)**
  - ✅ **E2E Tests (Playwright)**
  - ✅ **Build Next.js Application**

**OPTIONNEL** (recommandé de cocher) :
- ☐ **Mutation Testing** (cochez si vous voulez le require)

#### 3️⃣ Require signed commits

- ✅ **Require signed commits**
  - (Optionnel, plus sécurisé mais complexe à configurer)

#### 4️⃣ Require linear history

- ✅ **Require linear history**
  - Force les squash/rebase, évite les merge commits

#### 5️⃣ Require deployments to succeed before merging

- ☐ (À configurer plus tard avec deployments)

#### 6️⃣ Restrict who can push to matching branches

- ☐ (À configurer si vous voulez limiter les pushes directes)

#### 7️⃣ Include administrators

- ✅ **Include administrators** (pour que les règles s'appliquent à tous)

#### 8️⃣ Restrict pushes that create matching refs

- ✅ (Recommandé pour éviter direct pushes à main)

### Paramètres Optionnels

- ✅ **Require code owner review** (si vous avez un CODEOWNERS file)
- ✅ **Require conversation resolution before merging**
- ✅ **Require status checks to be up to date**

---

## Règles pour `develop` (Moins Stricte)

```
Branch name pattern: develop
```

### Recommandations
- ✅ Require a pull request
  - 1 review (au lieu de 2)
- ✅ Require status checks
  - Code Quality
  - E2E Tests
  - Build (optionnel)
- ☐ Require linear history (plus flexible)
- ✅ Require conversation resolution

---

## Configuration via GitHub CLI (Avancé)

Si vous préférez la CLI :

```bash
# Installation de gh
brew install gh  # ou voir https://cli.github.com

# Login
gh auth login

# Créer la règle pour main
gh api repos/YOUR_USER/website/rules --input - <<'EOF'
{
  "type": "branch",
  "pattern": "main",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/main"],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "require_pull_request",
      "parameters": {
        "required_review_count": 1,
        "dismiss_stale_reviews_on_push": true
      }
    },
    {
      "type": "require_status_checks_to_pass",
      "parameters": {
        "required_status_checks": [
          {
            "context": "Code Quality (Lint, Format, Architecture, Tests)",
            "integration_id": null
          },
          {
            "context": "E2E Tests (Playwright)",
            "integration_id": null
          },
          {
            "context": "Build Next.js Application",
            "integration_id": null
          }
        ],
        "strict_required_status_checks_policy": true
      }
    },
    {
      "type": "require_linear_history"
    }
  ]
}
EOF
```

---

## Vérification

Après configuration, vérifiez :

1. **Allez sur main** : https://github.com/YOUR_USER/website/branches
2. **Cherchez main** dans la liste
3. **Cliquez le verrou** 🔒 à côté de `main`
4. **Vérifiez les règles affichées**

---

## Comportement Résultant

### Quand vous créez une PR vers `main`

```
Pull Request: "Fix: Add feature XYZ"
  │
  ├─ ⏳ GitHub Actions en cours...
  │  ├─ ✓ Code Quality (Lint, Format, Architecture, Tests)
  │  ├─ ✓ E2E Tests (Playwright)
  │  └─ ✓ Build Next.js Application
  │
  ├─ ⏳ Attendre les reviews...
  │  └─ ✓ Au moins 1 approval
  │
  ├─ ✓ Status checks réussis
  ├─ ✓ Branch up-to-date
  └─ ✅ Prêt pour merge!
```

### Merge Button

Le bouton **Merge pull request** sera :
- 🔴 **Désactivé (rouge)** si une des conditions n'est pas remplie
- 🟢 **Activé (vert)** si toutes les conditions sont remplies

---

## Troubleshooting

### "Check status not found"

**Problème** : GitHub ne trouve pas le status check.

**Solution** :
1. Attendez que la PR créé au moins un run GitHub Actions
2. Attendez que le run soit complété
3. Le status check devrait apparaître dans la liste

### "Merge button disabled, need reviews"

**Problème** : Aucune review.

**Solution** :
1. Demandez une review via le menu "Reviewers"
2. Attendez l'approval d'au moins 1 reviewer
3. Puis vous pouvez merger

### "Branch out of date"

**Problème** : Main a avancé depuis la création de la PR.

**Solution** :
1. Cliquez **Update branch** dans la PR
2. Attendez que les checks redémarrents
3. Puis merge

---

## Exemples de Workflows

### Feature Branch -> Develop -> Main

```
feature/user-auth
    │
    └─> Create PR to develop
        ├─ 1 review required
        ├─ Status checks pass
        └─ Merge to develop
            │
            └─> Create PR to main
                ├─ 1+ reviews
                ├─ Status checks pass
                ├─ Linear history
                └─ Merge to main (production)
```

### Hotfix Branch

```
hotfix/security-patch
    │
    └─> Create PR directly to main
        ├─ Urgent: 1 review only
        ├─ Status checks pass
        └─ Merge to main
            │
            └─> Backmerge to develop
```

---

## GitHub CodeOwners (Optionnel)

Pour automatiser les reviewers, créez `.github/CODEOWNERS` :

```
# Tous les fichiers
* @YOUR_USERNAME

# Fichiers spécifiques
/src/lib/server/ @YOUR_USERNAME
/app/admin/ @YOUR_USERNAME
/docs/ @YOUR_USERNAME
```

Puis cochez dans les règles :
- ✅ **Require review from Code Owners**

---

## Advanced: Required Dismissal Reason

Pour que les reviewers doivent justifier un dismiss :

1. Dans l'interface Branch Protection
2. Cochez : **Require a reason to dismiss pull request reviews**

---

## Vérification Finale

Checklist avant de considérer la config comme complète :

- [ ] Rule pattern: `main` configurée
- [ ] Rule pattern: `develop` configurée (optionnel)
- [ ] Require pull request: OUI
- [ ] Require status checks: OUI
  - [ ] Code Quality check sélectionné
  - [ ] E2E Tests check sélectionné
  - [ ] Build check sélectionné
- [ ] Require branches to be up to date: OUI
- [ ] Include administrators: OUI
- [ ] Test: Créez une PR test sans review
  - [ ] Le bouton Merge est désactivé ✓
- [ ] Test: Créez une PR sans status checks complètement
  - [ ] Le bouton Merge est désactivé ✓
- [ ] Test: Créez une PR avec tout OK
  - [ ] Le bouton Merge est activé ✓

---

## Support & Docs

- **GitHub Docs** : https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches
- **GitHub CLI** : `gh api docs`
- **REST API** : https://docs.github.com/en/rest/branches/branch-protection

---

## Notes

⚠️ **Important** :
- Ces règles s'appliquent à **TOUS** les utilisateurs (même admins)
- Pour déprotéger momentanément, un admin doit aller dans Settings et désactiver la règle
- Les règles sont appliquées au niveau du **repository**

💡 **Conseil** :
- Commencez par une config simple (PR + 1 review)
- Augmentez progressivement la stricture si nécessaire
- Écoutez votre équipe pour ajuster

---

## Prochaines Étapes

Une fois les branch protection rules configurées :

1. [ ] Testez avec une PR fictive
2. [ ] Invitez votre équipe à review
3. [ ] Documentez dans votre README
4. [ ] Configurez notifications Slack (optionnel)
