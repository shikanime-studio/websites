CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`related_id` integer,
	`related_type` text,
	`is_read` integer DEFAULT false,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_items_to_licenses` (
	`item_id` integer NOT NULL,
	`license_id` integer NOT NULL,
	PRIMARY KEY(`item_id`, `license_id`),
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`license_id`) REFERENCES `licenses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_items_to_licenses`("item_id", "license_id") SELECT "item_id", "license_id" FROM `items_to_licenses`;--> statement-breakpoint
DROP TABLE `items_to_licenses`;--> statement-breakpoint
ALTER TABLE `__new_items_to_licenses` RENAME TO `items_to_licenses`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `events` ADD `location` text;--> statement-breakpoint
ALTER TABLE `events` ADD `event_type` text;--> statement-breakpoint
ALTER TABLE `events` ADD `website_url` text;--> statement-breakpoint
ALTER TABLE `events` ADD `created_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `updated_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `items` ADD `category` text;--> statement-breakpoint
ALTER TABLE `items` ADD `price_range` text;--> statement-breakpoint
ALTER TABLE `items` ADD `availability_status` text DEFAULT 'available';--> statement-breakpoint
ALTER TABLE `items` ADD `maker_id` integer REFERENCES makers(id);--> statement-breakpoint
ALTER TABLE `items` ADD `created_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `items` ADD `updated_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `makers` ADD `created_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `makers` ADD `updated_at` integer NOT NULL;