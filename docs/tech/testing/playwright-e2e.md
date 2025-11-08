# Tests E2E avec Playwright : Stratégie de Haute Fidélité

## Vue d'ensemble

Les tests E2E avec Playwright et seeding D1 constituent la meilleure pratique 2025 pour valider l'intégration d'une application Next.js déployée sur Cloudflare Workers.

## Importance Critique

Puisque le développement local (DevEx) est fragmenté avec des problèmes de HMR et d'accès aux bindings, la confiance du développeur doit être reportée sur une suite de tests E2E **de haute fidélité**.

## Configuration

### 1. Installation

```bash
npm install -D @playwright/test
npx playwright install
```

### 2. Configuration Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:8787", // wrangler dev
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:8787",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
});
```

### 3. Structure des Tests

```
tests/
├── e2e/
│   ├── article.spec.ts
│   ├── auth.spec.ts
│   └── search.spec.ts
├── fixtures/
│   ├── db-seeding.ts
│   └── auth-fixtures.ts
└── helpers/
    └── test-utils.ts
```

## Tests avec Seeding D1

### Seeding Database

```typescript
// tests/fixtures/db-seeding.ts
import { test as base } from "@playwright/test";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const test = base.extend({
  seedDatabase: async ({}, use) => {
    // Setup : seed la base de données locale
    await execAsync(
      'wrangler d1 execute DB --local --file=./tests/fixtures/seed.sql'
    );

    // Run tests
    await use();

    // Cleanup : réinitialiser la base
    await execAsync(
      'wrangler d1 execute DB --local --command="DELETE FROM articles; DELETE FROM comments;"'
    );
  },
});

export { expect } from "@playwright/test";
```

### Fichier de Seeding

```sql
-- tests/fixtures/seed.sql
INSERT INTO articles (id, title, slug, content, language, created_at, updated_at, published)
VALUES (
  '1',
  'Test Article',
  'test-article',
  'This is a test article',
  'en',
  datetime('now'),
  datetime('now'),
  true
);

INSERT INTO comments (id, article_id, author, content, created_at)
VALUES (
  '1',
  '1',
  'Test User',
  'Great article!',
  datetime('now')
);
```

## Exemples de Tests

### Test d'Article

```typescript
// tests/e2e/article.spec.ts
import { test, expect } from "../fixtures/db-seeding";

test.beforeEach(async ({ seedDatabase }) => {
  await seedDatabase;
});

test("should display published article", async ({ page }) => {
  await page.goto("/en/articles/test-article");

  // Vérifier le titre
  await expect(page.getByRole("heading", { name: "Test Article" })).toBeVisible();

  // Vérifier le contenu
  await expect(page.getByText("This is a test article")).toBeVisible();

  // Vérifier les commentaires
  const comments = await page.locator('[data-testid="comment"]').count();
  expect(comments).toBeGreaterThan(0);
});

test("should not display unpublished article", async ({ page }) => {
  await page.goto("/en/articles/unpublished-article");

  // Devrait rediriger ou afficher 404
  await expect(page).toHaveURL(/404|not-found/);
});
```

### Test d'Authentification

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test("should login with Cloudflare Access", async ({ page }) => {
  await page.goto("/admin");

  // Vérifier que la page est protégée
  // (Cloudflare Access redirige automatiquement)
  // Dans un environnement de test, mocker le JWT

  // Après authentification simulée
  await page.evaluate(() => {
    // Simuler le JWT de Cloudflare
    localStorage.setItem(
      "cf_jwt",
      "eyJhbGc..." // Token JWT valide pour tests
    );
  });

  await page.reload();

  // Vérifier l'accès au dashboard
  await expect(page.getByRole("heading", { name: /Admin Dashboard/i })).toBeVisible();
});
```

### Test de Recherche Multilingue

```typescript
// tests/e2e/search.spec.ts
import { test, expect } from "../fixtures/db-seeding";

test("should search articles in French", async ({ page }) => {
  await page.goto("/fr/search");

  // Effectuer une recherche
  await page.fill('input[placeholder="Rechercher"]', "test");
  await page.press('input[placeholder="Rechercher"]', "Enter");

  // Vérifier les résultats
  await expect(page.getByText("Test Article")).toBeVisible();
});

test("should search articles in English", async ({ page }) => {
  await page.goto("/en/search");

  // Effectuer une recherche
  await page.fill('input[placeholder="Search"]', "test");
  await page.press('input[placeholder="Search"]', "Enter");

  // Vérifier les résultats
  await expect(page.getByText("Test Article")).toBeVisible();
});
```

## Best Practices

### Isoler les Tests

```typescript
// ✅ Bon : Chaque test réinitialise les données
test.beforeEach(async ({ seedDatabase }) => {
  await seedDatabase;
});

test("test 1", async ({ page }) => {
  // Données fraîches
});

test("test 2", async ({ page }) => {
  // Données fraîches (indépendantes du test 1)
});

// ❌ Mauvais : Tests dépendants les uns des autres
test("create article", async ({ page }) => {
  // Crée des données
});

test("find article", async ({ page }) => {
  // Suppose que les données du test précédent existent
});
```

### Data Testid

```typescript
// Dans votre code composant
<article data-testid="article">
  <h1 data-testid="article-title">Title</h1>
  <div data-testid="article-content">Content</div>
</article>

// Dans vos tests
await expect(page.getByTestId("article-title")).toHaveText("Title");
```

## Exécution

### Développement

```bash
# Terminal 1 : Démarrer le serveur
npm run dev

# Terminal 2 : Exécuter les tests
npm run test:e2e

# Ou avec UI
npm run test:e2e -- --ui
```

### CI/CD

```bash
# Exécuter avec retries et reporters
npm run test:e2e -- --reporter=github
```

## Considérations de Performance

⚠️ **Attention** : Les tests E2E sont lents

| Type de Test | Durée | Utilité |
|-------------|--------|---------|
| **Unit** | <100ms | Logique métier |
| **Integration** | 100ms-1s | Couches isolées |
| **E2E** | 1s-10s par test | Workflows complets |

Équilibrez avec des tests unitaires pour les logiques critiques.

## Gestion des Fixtures

### Réutiliser des Données

```typescript
// tests/fixtures/articles.ts
export const testArticles = {
  published: {
    id: "1",
    title: "Published Article",
    slug: "published-article",
    content: "Test content",
    published: true,
  },
  unpublished: {
    id: "2",
    title: "Unpublished Article",
    slug: "unpublished-article",
    content: "Draft content",
    published: false,
  },
};
```

## Ressources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Cloudflare Workers Testing](https://developers.cloudflare.com/workers/testing/)
- [How to Test a Next.js App](https://nextjs.org/docs/app/building-your-application/testing)
