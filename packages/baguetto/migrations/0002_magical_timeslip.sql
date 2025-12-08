CREATE TABLE `accounts` (
    `id` integer PRIMARY KEY NOT NULL,
    `user_id` integer NOT NULL,
    `provider` text NOT NULL,
    `subject` text NOT NULL,
    `access_token` text,
    `expires_at` integer,
    `refresh_token` text,
    `scope` text,
    FOREIGN KEY (`user_id`) REFERENCES `users` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE `user_to_accounts` (
    `user_id` integer NOT NULL,
    `account_id` integer NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (`account_id`) REFERENCES `accounts` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
ALTER TABLE `users` DROP COLUMN `google_id`;
