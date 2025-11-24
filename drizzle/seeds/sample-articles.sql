-- Sample article seed data for testing and development
-- This file contains 1 sample article with 2 translations (FR + EN)
-- Uses INSERT OR REPLACE to be idempotent (safe to run multiple times)

-- Insert sample article
INSERT OR REPLACE INTO articles (id, category_id, complexity, status, published_at, cover_image, created_at, updated_at)
VALUES (
  'test-article-1',
  NULL,
  'intermediate',
  'published',
  1699000000,
  '/images/test-cover.jpg',
  1699000000,
  1699000000
);

-- Insert French translation
INSERT OR REPLACE INTO article_translations (id, article_id, language, title, slug, excerpt, seo_title, seo_description, content_mdx, created_at, updated_at)
VALUES (
  'test-translation-fr-1',
  'test-article-1',
  'fr',
  'Article de test en français',
  'article-test-fr',
  'Ceci est un extrait de test',
  'Article Test | sebc.dev',
  'Description SEO de test',
  '# Article de test en français

Ceci est un article de test avec du contenu en Markdown.

## Section 1

Voici du contenu de test en français. Cet article est utilisé pour tester la structure de base de la base de données et les relations entre tables.

## Section 2

Vous pouvez ajouter n''importe quel contenu Markdown ici.',
  1699000000,
  1699000000
);

-- Insert English translation
INSERT OR REPLACE INTO article_translations (id, article_id, language, title, slug, excerpt, seo_title, seo_description, content_mdx, created_at, updated_at)
VALUES (
  'test-translation-en-1',
  'test-article-1',
  'en',
  'Test article in English',
  'test-article-en',
  'This is a test excerpt',
  'Test Article | sebc.dev',
  'Test SEO description',
  '# Test article in English

This is a test article with content in Markdown.

## Section 1

This is test content in English. This article is used to test the basic structure of the database and relationships between tables.

## Section 2

You can add any Markdown content here.',
  1699000000,
  1699000000
);
