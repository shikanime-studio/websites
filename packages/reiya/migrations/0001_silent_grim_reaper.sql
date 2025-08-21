CREATE TABLE `users_to_characters` (
    `user_id` integer NOT NULL,
    `character_id` integer NOT NULL,
    `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (`user_id`, `character_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (`character_id`) REFERENCES `characters` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE `users_to_licenses` (
    `user_id` integer NOT NULL,
    `license_id` integer NOT NULL,
    `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (`user_id`, `license_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (`license_id`) REFERENCES `licenses` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE `users_to_makers` (
    `user_id` integer NOT NULL,
    `maker_id` integer NOT NULL,
    `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (`user_id`, `maker_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (`maker_id`) REFERENCES `makers` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE `characters` (
    `id` integer PRIMARY KEY NOT NULL,
    `name` text NOT NULL,
    `description` text NOT NULL,
    `image_url` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
    `id` integer PRIMARY KEY NOT NULL,
    `name` text NOT NULL,
    `description` text NOT NULL,
    `image_url` text NOT NULL,
    `starts_at` text NOT NULL,
    `ends_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events_to_makers` (
    `event_id` integer NOT NULL,
    `maker_id` integer NOT NULL,
    PRIMARY KEY (`event_id`, `maker_id`),
    FOREIGN KEY (`event_id`) REFERENCES `events` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (`maker_id`) REFERENCES `makers` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE `items` (
    `id` integer PRIMARY KEY NOT NULL,
    `name` text NOT NULL,
    `description` text,
    `image_urls` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `items_to_licenses` (
    `item_id` integer NOT NULL,
    `group_id` integer NOT NULL,
    PRIMARY KEY (`item_id`, `group_id`),
    FOREIGN KEY (`item_id`) REFERENCES `items` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (`group_id`) REFERENCES `licenses` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE `licenses` (
    `id` integer PRIMARY KEY NOT NULL,
    `name` text NOT NULL,
    `description` text NOT NULL,
    `image_url` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `makers` (
    `id` integer PRIMARY KEY NOT NULL,
    `name` text NOT NULL,
    `description` text,
    `avatar_image_url` text,
    `cover_image_url` text,
    `links` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `votes` (
    `id` integer PRIMARY KEY NOT NULL,
    `user_id` integer NOT NULL,
    `item_id` integer NOT NULL,
    `type` text NOT NULL,
    `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (`item_id`) REFERENCES `items` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
PRAGMA foreign_keys = OFF;--> statement-breakpoint
CREATE TABLE `__new_sessions` (
    `id` text PRIMARY KEY NOT NULL,
    `user_id` integer NOT NULL,
    `expires_at` text DEFAULT (DATETIME('now', '+30 days')) NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
--> statement-breakpoint
INSERT INTO `__new_sessions` ("id", "user_id", "expires_at") SELECT
    "id",
    "user_id",
    "expires_at"
FROM `sessions`;
DROP TABLE `sessions`;--> statement-breakpoint
ALTER TABLE `__new_sessions` RENAME TO `sessions`;--> statement-breakpoint
PRAGMA foreign_keys = ON;
