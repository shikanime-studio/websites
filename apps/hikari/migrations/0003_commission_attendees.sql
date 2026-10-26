CREATE TABLE `commission_attendees` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `commission_id` integer NOT NULL,
  `user_id` text NOT NULL,
  `created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`commission_id`) REFERENCES `commissions`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `commission_attendees_unique_idx` ON `commission_attendees` (`commission_id`,`user_id`);
