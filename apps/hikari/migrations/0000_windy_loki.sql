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
CREATE TABLE `commission_photos` (
    `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `commission_id` integer NOT NULL,
    `object_key` text NOT NULL,
    `content_type` text NOT NULL,
    `size` integer NOT NULL,
    `uploaded_by` text NOT NULL,
    `created_at` integer NOT NULL,
    FOREIGN KEY (`commission_id`) REFERENCES `commissions` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (`uploaded_by`) REFERENCES `user` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
--> statement-breakpoint
CREATE INDEX `commission_photos_commission_idx` ON `commission_photos` (
    `commission_id`
);
CREATE TABLE `commissions` (
    `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `title` text NOT NULL,
    `description` text DEFAULT '' NOT NULL,
    `status` text DEFAULT 'requested' NOT NULL,
    `photographer_id` text NOT NULL,
    `client_id` text NOT NULL,
    `character_name` text DEFAULT '' NOT NULL,
    `shooting_date` text,
    `location_name` text DEFAULT '' NOT NULL,
    `location_query` text DEFAULT '' NOT NULL,
    `delivery_ready_at` integer,
    `created_at` integer NOT NULL,
    `updated_at` integer NOT NULL,
    FOREIGN KEY (`photographer_id`) REFERENCES `user` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (`client_id`) REFERENCES `user` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
--> statement-breakpoint
CREATE INDEX `commissions_photographer_idx` ON `commissions` (
    `photographer_id`
);
--> statement-breakpoint
CREATE INDEX `commissions_client_idx` ON `commissions` (`client_id`);
CREATE TABLE `notifications` (
    `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `user_id` text NOT NULL,
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
--> statement-breakpoint
CREATE INDEX `notifications_user_idx` ON `notifications` (`user_id`);
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
CREATE TABLE `verification` (
    `id` text PRIMARY KEY NOT NULL,
    `identifier` text NOT NULL,
    `value` text NOT NULL,
    `expires_at` integer NOT NULL,
    `created_at` integer NOT NULL,
    `updated_at` integer NOT NULL
);
