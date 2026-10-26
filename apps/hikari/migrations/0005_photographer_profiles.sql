CREATE TABLE `photographer_profiles` (
  `user_id` text PRIMARY KEY NOT NULL,
  `slug` text NOT NULL,
  `headline` text DEFAULT '' NOT NULL,
  `bio` text DEFAULT '' NOT NULL,
  `location` text DEFAULT '' NOT NULL,
  `instagram` text DEFAULT '' NOT NULL,
  `links` text DEFAULT '[]' NOT NULL,
  `accept_requests` integer DEFAULT true NOT NULL,
  `updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `photographer_profiles_slug_idx` ON `photographer_profiles` (`slug`);
