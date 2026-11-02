CREATE TABLE `series` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `series_name_idx` ON `series` (`name`);
--> statement-breakpoint
CREATE TABLE `characters` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `series_id` integer,
  `created_at` integer NOT NULL,
  FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `characters_name_series_idx`
  ON `characters` (`name`, `series_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `characters_name_noseries_idx`
  ON `characters` (`name`) WHERE `series_id` IS NULL;
--> statement-breakpoint
CREATE INDEX `characters_series_idx` ON `characters` (`series_id`);
--> statement-breakpoint
CREATE TABLE `commission_characters` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `commission_id` integer NOT NULL,
  `character_id` integer NOT NULL,
  `position` integer DEFAULT 0 NOT NULL,
  FOREIGN KEY (`commission_id`) REFERENCES `commissions`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `commission_characters_unique_idx`
  ON `commission_characters` (`commission_id`, `character_id`);
--> statement-breakpoint
CREATE TABLE `commission_cast` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `commission_id` integer NOT NULL,
  `role` text NOT NULL,
  `user_id` text,
  `display_name` text DEFAULT '' NOT NULL,
  `created_at` integer NOT NULL,
  FOREIGN KEY (`commission_id`) REFERENCES `commissions`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `commission_cast_user_idx`
  ON `commission_cast` (`commission_id`, `role`, `user_id`);
--> statement-breakpoint
CREATE INDEX `commission_cast_commission_idx`
  ON `commission_cast` (`commission_id`);
--> statement-breakpoint
CREATE TABLE `commission_invites` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `commission_id` integer NOT NULL,
  `token` text NOT NULL,
  `role` text NOT NULL,
  `label` text DEFAULT '' NOT NULL,
  `expires_at` integer,
  `revoked_at` integer,
  `created_by` text NOT NULL,
  `created_at` integer NOT NULL,
  FOREIGN KEY (`commission_id`) REFERENCES `commissions`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `commission_invites_token_idx`
  ON `commission_invites` (`token`);
--> statement-breakpoint
CREATE INDEX `commission_invites_commission_idx`
  ON `commission_invites` (`commission_id`);

--> statement-breakpoint
INSERT INTO `commission_cast` (`commission_id`, `role`, `user_id`, `display_name`, `created_at`)
SELECT
  `c`.`id`,
  'photographer' AS `role`,
  `c`.`photographer_id`,
  '' AS `display_name`,
  `c`.`created_at`
FROM `commissions` AS `c`
WHERE NOT EXISTS (
  SELECT 1
  FROM `commission_cast` AS `x`
  WHERE `x`.`commission_id` = `c`.`id`
    AND `x`.`user_id` = `c`.`photographer_id`
);
--> statement-breakpoint
INSERT INTO `commission_cast` (`commission_id`, `role`, `user_id`, `display_name`, `created_at`)
SELECT
  `c`.`id`,
  'cosplayer' AS `role`,
  `c`.`client_id`,
  '' AS `display_name`,
  `c`.`created_at`
FROM `commissions` AS `c`
WHERE `c`.`client_id` <> `c`.`photographer_id`
  AND NOT EXISTS (
    SELECT 1
    FROM `commission_cast` AS `x`
    WHERE `x`.`commission_id` = `c`.`id`
      AND `x`.`user_id` = `c`.`client_id`
  );
--> statement-breakpoint
INSERT INTO `commission_cast` (`commission_id`, `role`, `user_id`, `display_name`, `created_at`)
SELECT
  `a`.`commission_id`,
  'cosplayer' AS `role`,
  `a`.`user_id`,
  '' AS `display_name`,
  `c`.`created_at`
FROM `commission_attendees` AS `a`
INNER JOIN `commissions` AS `c` ON `a`.`commission_id` = `c`.`id`
WHERE NOT EXISTS (
  SELECT 1
  FROM `commission_cast` AS `x`
  WHERE `x`.`commission_id` = `a`.`commission_id`
    AND `x`.`user_id` = `a`.`user_id`
);
