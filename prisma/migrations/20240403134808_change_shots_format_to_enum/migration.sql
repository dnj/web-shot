-- AlterTable
ALTER TABLE `shots` ADD `format_tmp` ENUM('JPEG', 'PNG') NOT NULL;
UPDATE `shots` SET `format_tmp` = CASE `format` 
WHEN 0 THEN 'JPEG'
WHEN 1 THEN 'PNG'
END;
ALTER TABLE `shots` DROP `format`;
ALTER TABLE `shots` CHANGE `format_tmp` `format` ENUM('JPEG', 'PNG') NOT NULL;

