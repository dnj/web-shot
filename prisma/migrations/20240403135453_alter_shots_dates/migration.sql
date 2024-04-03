-- AlterTable
ALTER TABLE `shots` ADD `create_at_tmp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(), ADD `capture_at_tmp` TIMESTAMP NULL;
UPDATE `shots` SET `create_at_tmp` = FROM_UNIXTIME(`create_at`), `capture_at_tmp` = FROM_UNIXTIME(`capture_at`);
ALTER TABLE `shots` DROP `create_at`, DROP `capture_at`;
ALTER TABLE `shots` CHANGE `create_at_tmp` `create_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(), CHANGE `capture_at_tmp` `capture_at` TIMESTAMP NULL;
