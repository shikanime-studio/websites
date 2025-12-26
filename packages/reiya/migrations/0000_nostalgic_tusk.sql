CREATE TABLE `account` (
    `id` text PRIMARY KEY NOT NULL,
    `account_id` text NOT NULL,
    `provider_id` text NOT NULL,
    `user_id` text NOT NULL,
    `access_token` text,
    `refresh_token` text,
    `id_token` text,
    `access_token_expires_at` integer,
    `refresh_token_expires_at` integer,
    `scope` text,
    `password` text,
    `created_at` integer NOT NULL,
    `updated_at` integer NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `user` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE `categories` (
    `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `name` text NOT NULL,
    `icon` text NOT NULL
);
--> statement-breakpoint
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);
CREATE TABLE `characters` (
    `id` integer PRIMARY KEY NOT NULL,
    `name` text NOT NULL,
    `description` text NOT NULL,
    `image_url` text NOT NULL,
    `image_width` integer DEFAULT 0 NOT NULL,
    `image_height` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
    `id` integer PRIMARY KEY NOT NULL,
    `name` text NOT NULL,
    `description` text NOT NULL,
    `image_url` text NOT NULL,
    `image_width` integer DEFAULT 0 NOT NULL,
    `image_height` integer DEFAULT 0 NOT NULL,
    `starts_at` text NOT NULL,
    `ends_at` text NOT NULL,
    `location` text,
    `event_type` text,
    `website_url` text,
    `created_at` integer NOT NULL,
    `updated_at` integer NOT NULL
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
    `image_urls` text DEFAULT '[]' NOT NULL,
    `category` text,
    `price_range` text,
    `availability_status` text DEFAULT 'available',
    `maker_id` integer,
    `created_at` integer NOT NULL,
    `updated_at` integer NOT NULL,
    FOREIGN KEY (`maker_id`) REFERENCES `makers` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE `items_to_licenses` (
    `item_id` integer NOT NULL,
    `license_id` integer NOT NULL,
    PRIMARY KEY (`item_id`, `license_id`),
    FOREIGN KEY (`item_id`) REFERENCES `items` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (`license_id`) REFERENCES `licenses` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE `licenses` (
    `id` integer PRIMARY KEY NOT NULL,
    `name` text NOT NULL,
    `description` text NOT NULL,
    `image_url` text NOT NULL,
    `image_width` integer DEFAULT 0 NOT NULL,
    `image_height` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `makers` (
    `id` integer PRIMARY KEY NOT NULL,
    `name` text NOT NULL,
    `description` text,
    `avatar_image_url` text,
    `avatar_image_width` integer DEFAULT 0,
    `avatar_image_height` integer DEFAULT 0,
    `cover_image_url` text,
    `cover_image_width` integer DEFAULT 0,
    `cover_image_height` integer DEFAULT 0,
    `links` text DEFAULT '[]' NOT NULL,
    `created_at` integer NOT NULL,
    `updated_at` integer NOT NULL
);
--> statement-breakpoint
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
    FOREIGN KEY (`user_id`) REFERENCES `user` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
    `id` text PRIMARY KEY NOT NULL,
    `key` text,
    `count` integer,
    `last_request` integer
);
--> statement-breakpoint
CREATE TABLE `session` (
    `id` text PRIMARY KEY NOT NULL,
    `expires_at` integer NOT NULL,
    `token` text NOT NULL,
    `created_at` integer NOT NULL,
    `updated_at` integer NOT NULL,
    `ip_address` text,
    `user_agent` text,
    `user_id` text NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `user` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);
CREATE TABLE `user` (
    `id` text PRIMARY KEY NOT NULL,
    `name` text NOT NULL,
    `email` text NOT NULL,
    `email_verified` integer NOT NULL,
    `image` text,
    `created_at` integer NOT NULL,
    `updated_at` integer NOT NULL
);
--> statement-breakpoint
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);
CREATE TABLE `users_to_characters` (
    `user_id` text NOT NULL,
    `character_id` integer NOT NULL,
    `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (`user_id`, `character_id`),
    FOREIGN KEY (`user_id`) REFERENCES `user` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (`character_id`) REFERENCES `characters` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE `users_to_licenses` (
    `user_id` text NOT NULL,
    `license_id` integer NOT NULL,
    `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (`user_id`, `license_id`),
    FOREIGN KEY (`user_id`) REFERENCES `user` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (`license_id`) REFERENCES `licenses` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE `users_to_makers` (
    `user_id` text NOT NULL,
    `maker_id` integer NOT NULL,
    `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (`user_id`, `maker_id`),
    FOREIGN KEY (`user_id`) REFERENCES `user` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (`maker_id`) REFERENCES `makers` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE `verification` (
    `id` text PRIMARY KEY NOT NULL,
    `identifier` text NOT NULL,
    `value` text NOT NULL,
    `expires_at` integer NOT NULL,
    `created_at` integer NOT NULL,
    `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `votes` (
    `id` integer PRIMARY KEY NOT NULL,
    `user_id` text NOT NULL,
    `item_id` integer NOT NULL,
    `type` text NOT NULL,
    `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `user` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (`item_id`) REFERENCES `items` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION
);
