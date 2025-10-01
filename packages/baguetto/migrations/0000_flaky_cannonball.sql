CREATE TABLE `users` (
    `id` integer PRIMARY KEY NOT NULL,
    `google_id` text,
    `email` text NOT NULL,
    `name` text NOT NULL,
    `picture_url` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
    `id` text PRIMARY KEY NOT NULL,
    `user_id` integer NOT NULL,
    `expires_at` integer DEFAULT (datetime('now', '+30 days')) NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users` (
        `id`
    ) ON UPDATE NO ACTION ON DELETE NO ACTION
);
