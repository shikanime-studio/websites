CREATE TABLE `transfer` (
	`id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
