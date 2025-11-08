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
CREATE INDEX `article_translations_article_id_idx` ON `article_translations` (`article_id`);--> statement-breakpoint
CREATE INDEX `article_translations_language_idx` ON `article_translations` (`language`);--> statement-breakpoint
CREATE INDEX `article_translations_slug_idx` ON `article_translations` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `article_translations_unique_article_language` ON `article_translations` (`article_id`,`language`);--> statement-breakpoint
CREATE UNIQUE INDEX `article_translations_unique_slug` ON `article_translations` (`slug`);--> statement-breakpoint
CREATE TABLE `articles` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text,
	`complexity` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` integer,
	`cover_image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `articles_category_id_idx` ON `articles` (`category_id`);--> statement-breakpoint
CREATE INDEX `articles_status_idx` ON `articles` (`status`);--> statement-breakpoint
CREATE INDEX `articles_published_at_idx` ON `articles` (`published_at`);