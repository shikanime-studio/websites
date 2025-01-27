CREATE TABLE `accounts` (
	`id` integer PRIMARY KEY NOT NULL,
	`google_id` text,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`picture_url` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` integer NOT NULL,
	`expires_at` integer DEFAULT (datetime('now', '+30 days')) NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
