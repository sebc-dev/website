-- ============================================================================
-- Seed Script: 9 Canonical Categories for sebc.dev Blog
-- ============================================================================
--
-- This script populates the categories table with the 9 canonical categories
-- that form the content classification system for the sebc.dev blog.
--
-- These categories are:
-- 1. Actualités (News) - Current events and industry updates
-- 2. Analyse Approfondie (Deep Analysis) - In-depth technical analysis
-- 3. Parcours d'Apprentissage (Learning Path) - Structured learning sequences
-- 4. Rétrospective (Retrospective) - Project reviews and retrospectives
-- 5. Tutoriel (Tutorial) - Step-by-step guides and walkthroughs
-- 6. Étude de Cas (Case Study) - Real-world project case studies
-- 7. Astuces Rapides (Quick Tips) - Short, actionable tips and tricks
-- 8. Dans les Coulisses (Behind the Scenes) - Behind-the-scenes content
-- 9. Test d'Outil (Tool Test) - Tool and technology reviews
--
-- Uses INSERT OR IGNORE for idempotency (safe to re-run).
--

INSERT OR IGNORE INTO categories (id, key, name_fr, name_en, slug_fr, slug_en, icon, color) VALUES
  ('cat-1', 'news', 'Actualités', 'News', 'actualites', 'news', 'Newspaper', '#3B82F6'),
  ('cat-2', 'deep-analysis', 'Analyse Approfondie', 'Deep Analysis', 'analyse-approfondie', 'deep-analysis', 'Microscope', '#8B5CF6'),
  ('cat-3', 'learning-path', 'Parcours d''Apprentissage', 'Learning Path', 'parcours-apprentissage', 'learning-path', 'Route', '#10B981'),
  ('cat-4', 'retrospective', 'Rétrospective', 'Retrospective', 'retrospective', 'retrospective', 'Calendar', '#F97316'),
  ('cat-5', 'tutorial', 'Tutoriel', 'Tutorial', 'tutoriel', 'tutorial', 'BookOpen', '#14B8A6'),
  ('cat-6', 'case-study', 'Étude de Cas', 'Case Study', 'etude-de-cas', 'case-study', 'FileText', '#6366F1'),
  ('cat-7', 'quick-tips', 'Astuces Rapides', 'Quick Tips', 'astuces-rapides', 'quick-tips', 'Zap', '#EAB308'),
  ('cat-8', 'behind-scenes', 'Dans les Coulisses', 'Behind the Scenes', 'dans-les-coulisses', 'behind-scenes', 'Eye', '#EC4899'),
  ('cat-9', 'tool-test', 'Test d''Outil', 'Tool Test', 'test-outil', 'tool-test', 'Wrench', '#6B7280');
