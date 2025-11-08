-- Create taxonomy system tables
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`name_fr` text NOT NULL,
	`name_en` text NOT NULL,
	`slug_fr` text NOT NULL,
	`slug_en` text NOT NULL,
	`icon` text NOT NULL,
	`color` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_key_unique` ON `categories` (`key`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name_fr` text NOT NULL,
	`name_en` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
-- Cloudflare D1 compatibility: Save child table data before modifying parent table
CREATE TABLE `__tmp_article_translations` AS SELECT * FROM `article_translations`;--> statement-breakpoint
-- Drop child table to avoid CASCADE on parent modification
DROP TABLE `article_translations`;--> statement-breakpoint
-- Modify articles table to add category_id foreign key
CREATE TABLE `__new_articles` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text,
	`complexity` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` integer,
	`cover_image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_articles`("id", "category_id", "complexity", "status", "published_at", "cover_image", "created_at", "updated_at") SELECT "id", NULL, "complexity", "status", "published_at", "cover_image", "created_at", "updated_at" FROM `articles`;--> statement-breakpoint
DROP TABLE `articles`;--> statement-breakpoint
ALTER TABLE `__new_articles` RENAME TO `articles`;--> statement-breakpoint
-- Recreate article_translations table
CREATE TABLE `article_translations` (
	`id` text PRIMARY KEY NOT NULL,
	`article_id` text NOT NULL,
	`language` text NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text NOT NULL,
	`seo_title` text NOT NULL,
	`seo_description` text NOT NULL,
	`content_mdx` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
-- Restore article_translations data
INSERT INTO `article_translations` SELECT * FROM `__tmp_article_translations`;--> statement-breakpoint
DROP TABLE `__tmp_article_translations`;--> statement-breakpoint
-- Create article_tags junction table
CREATE TABLE `article_tags` (
	`article_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`article_id`, `tag_id`),
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
-- Create indexes
CREATE INDEX `article_translations_article_id_idx` ON `article_translations` (`article_id`);--> statement-breakpoint
CREATE INDEX `article_translations_language_idx` ON `article_translations` (`language`);--> statement-breakpoint
CREATE INDEX `article_translations_slug_idx` ON `article_translations` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `article_translations_unique_article_language` ON `article_translations` (`article_id`,`language`);--> statement-breakpoint
CREATE UNIQUE INDEX `article_translations_unique_slug` ON `article_translations` (`slug`);--> statement-breakpoint
CREATE INDEX `articles_category_id_idx` ON `articles` (`category_id`);--> statement-breakpoint
CREATE INDEX `articles_status_idx` ON `articles` (`status`);--> statement-breakpoint
CREATE INDEX `articles_published_at_idx` ON `articles` (`published_at`);