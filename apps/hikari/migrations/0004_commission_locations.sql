CREATE TABLE `commission_locations` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `commission_id` integer NOT NULL,
  `user_id` text NOT NULL,
  `lat` real NOT NULL,
  `lng` real NOT NULL,
  `accuracy` real,
  `created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`commission_id`) REFERENCES `commissions` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `commission_locations_user_idx`
  ON `commission_locations` (`commission_id`, `user_id`);
