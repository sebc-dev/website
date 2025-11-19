# Configuration de la Protection de Branche

**Issue**: [#35 - Optimize OpenNext/Cloudflare startup time in CI](https://github.com/sebc-dev/website/issues/35)
**ADR**: [001 - Use Preview Deployments for E2E Tests in CI](../decisions/001-e2e-tests-preview-deployments.md)

## Vue d'ensemble

Ce guide explique comment configurer la protection de branche `main` pour rendre le status check `e2e/preview-deployment` obligatoire avant le merge.

## Prérequis

- Accès administrateur au repository GitHub
- Les workflows E2E doivent être déjà déployés (`.github/workflows/e2e.yml` et `.github/workflows/e2e-reminder.yml`)
- Avoir testé le workflow au moins une fois pour que le status check apparaisse dans GitHub

## Méthode 1 : Via GitHub UI

### Étapes

1. **Aller dans Settings → Branches**
   - Naviguer vers le repository sur GitHub
   - Cliquer sur "Settings" (onglet en haut)
   - Dans le menu de gauche, cliquer sur "Branches"

2. **Modifier la règle pour `main`**
   - Si une règle existe déjà : cliquer sur "Edit" à côté de la règle `main`
   - Sinon : cliquer sur "Add branch protection rule"
     - Branch name pattern : `main`

3. **Activer "Require status checks to pass before merging"**
   - Cocher la case "Require status checks to pass before merging"
   - Si vous voulez forcer les branches à jour : cocher "Require branches to be up to date before merging"

4. **Rechercher et sélectionner le status check**
   - Dans le champ de recherche sous "Status checks that are required"
   - Taper : `e2e/preview-deployment`
   - Cliquer sur le status check quand il apparaît pour le sélectionner

   **Note** : Le status check n'apparaîtra dans la liste que s'il a déjà été exécuté au moins une fois. Si vous ne le voyez pas :
   - Créer une PR de test
   - Commenter `@e2e` pour lancer le workflow
   - Retourner dans les settings une fois le workflow terminé

5. **Sauvegarder les changements**
   - Défiler en bas de la page
   - Cliquer sur "Save changes"

### Options Recommandées Supplémentaires

Pour une protection maximale, considérer aussi :

- ✅ **Require a pull request before merging** : Force les PRs même pour les admins
- ✅ **Require approvals** : Au moins 1 review requise
- ✅ **Dismiss stale pull request approvals when new commits are pushed** : Force une nouvelle review après push
- ✅ **Include administrators** : Applique les règles aux admins aussi

## Méthode 2 : Via GitHub CLI

Si vous préférez la ligne de commande ou voulez automatiser la configuration :

### Installation GitHub CLI

```bash
# macOS
brew install gh

# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Windows
winget install --id GitHub.cli
```

### Authentification

```bash
gh auth login
```

### Commande pour ajouter le status check requis

```bash
gh api repos/:owner/:repo/branches/main/protection/required_status_checks \
  -X PATCH \
  -H "Accept: application/vnd.github+json" \
  -f "contexts[]=e2e/preview-deployment" \
  -F strict=true
```

**Explication des paramètres** :
- `contexts[]=e2e/preview-deployment` : Ajoute le check comme requis
- `strict=true` : Force les branches à être à jour avant merge

### Commande complète avec protection de branche

Si vous voulez configurer toute la protection d'un coup :

```bash
gh api repos/:owner/:repo/branches/main/protection \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  -f "required_status_checks[strict]=true" \
  -f "required_status_checks[contexts][]=e2e/preview-deployment" \
  -f "enforce_admins=true" \
  -f "required_pull_request_reviews[dismiss_stale_reviews]=true" \
  -f "required_pull_request_reviews[require_code_owner_reviews]=false" \
  -f "required_pull_request_reviews[required_approving_review_count]=1"
```

## Vérification

### Test manuel

1. **Créer une PR de test vers `main`**
   ```bash
   git checkout -b test-branch-protection
   echo "test" > test.txt
   git add test.txt
   git commit -m "🧪 test: verify branch protection"
   git push origin test-branch-protection
   gh pr create --base main --title "Test: Branch Protection" --body "Testing E2E status check requirement"
   ```

2. **Vérifier que le merge est bloqué**
   - Le bouton "Merge pull request" devrait être désactivé
   - Un message devrait indiquer : "Required status check `e2e/preview-deployment` is pending"
   - Un commentaire automatique devrait expliquer comment lancer les tests

3. **Commenter `@e2e` sur la PR**
   ```bash
   gh pr comment --body "@e2e"
   ```

4. **Vérifier que le workflow se lance**
   - Une réaction 🚀 devrait apparaître sur le commentaire
   - Le workflow `E2E Tests (Preview Deployment)` devrait apparaître dans l'onglet "Actions"

5. **Vérifier que le merge se débloque après succès**
   - Une fois les tests passés, le status check devient vert
   - Le bouton "Merge pull request" devient actif

6. **Nettoyer**
   ```bash
   gh pr close --delete-branch
   ```

### Vérification via API

Pour vérifier la configuration actuelle :

```bash
gh api repos/:owner/:repo/branches/main/protection | jq '.required_status_checks'
```

Devrait retourner quelque chose comme :

```json
{
  "strict": true,
  "contexts": [
    "e2e/preview-deployment"
  ],
  "checks": []
}
```

## Dépannage

### Problème : Le status check n'apparaît pas dans la liste

**Cause** : Le status check n'a jamais été créé.

**Solution** :
1. Créer une PR de test
2. Commenter `@e2e` pour déclencher le workflow
3. Attendre que le workflow se termine
4. Retourner dans Settings → Branches
5. Le status check devrait maintenant apparaître

### Problème : Le merge est bloqué mais les tests ont réussi

**Cause** : Le SHA du commit a changé après le test (nouveau push).

**Solution** :
1. Commenter à nouveau `@e2e` pour relancer les tests sur le nouveau commit
2. Ou : Désactiver "Require branches to be up to date before merging" si vous acceptez des branches non à jour

### Problème : Impossible de modifier la protection (Permission denied)

**Cause** : Vous n'avez pas les droits admin sur le repository.

**Solution** :
1. Demander les droits admin
2. Ou : Demander à un admin de configurer la protection pour vous

### Problème : Le workflow ne se déclenche pas quand je commente `@e2e`

**Cause** : Permissions insuffisantes du GITHUB_TOKEN ou problème dans le workflow.

**Solution** :
1. Vérifier que le workflow `e2e.yml` existe et est valide
2. Vérifier les permissions dans le workflow :
   ```yaml
   permissions:
     contents: read
     pull-requests: write
     statuses: write
   ```
3. Vérifier les logs du workflow dans Actions

## Désactivation Temporaire

Si vous devez temporairement désactiver la protection (par exemple pour un hotfix urgent) :

### Via GitHub UI

1. Settings → Branches
2. Cliquer sur "Edit" sur la règle `main`
3. Décocher "Require status checks to pass before merging"
4. Sauvegarder

### Via GitHub CLI

```bash
gh api repos/:owner/:repo/branches/main/protection/required_status_checks \
  -X DELETE
```

**Note** : Pensez à réactiver la protection après !

## Résumé

Une fois configurée, la protection de branche fonctionne ainsi :

1. ✅ **PR ouverte vers `main`** → Workflow `e2e-reminder` crée un status "pending"
2. ✅ **Commentaire `@e2e`** → Workflow `e2e` se lance
3. ✅ **Tests passent** → Status check devient "success"
4. ✅ **Merge autorisé** → Le bouton de merge est activé
5. ❌ **Tests échouent** → Status check "failure", merge bloqué

## Références

- **GitHub Docs** : [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- **GitHub Docs** : [Managing a branch protection rule](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule)
- **GitHub CLI Docs** : [gh api](https://cli.github.com/manual/gh_api)
- **ADR-001** : [Use Preview Deployments for E2E Tests in CI](../decisions/001-e2e-tests-preview-deployments.md)
- **Issue #35** : [Optimize OpenNext/Cloudflare startup time in CI](https://github.com/sebc-dev/website/issues/35)
