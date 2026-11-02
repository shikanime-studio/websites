ALTER TABLE `commissions` ADD `timezone` text DEFAULT 'Europe/Paris' NOT NULL;
--> statement-breakpoint
ALTER TABLE `commissions` ADD `share_token` text;
--> statement-breakpoint
ALTER TABLE `commissions` ADD `invitees` text DEFAULT '[]' NOT NULL;
--> statement-breakpoint
UPDATE `commissions` SET `share_token` = lower(hex(randomblob(16))) WHERE `share_token` IS NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX `commissions_share_token_idx` ON `commissions` (`share_token`);
