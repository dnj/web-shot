-- AlterTable
ALTER TABLE `shots` ADD `status_tmp` ENUM('CAPTURING', 'AVAILABLE', 'ERROR') NOT NULL;
UPDATE `shots` SET `status_tmp` = CASE `status` 
WHEN 0 THEN 'CAPTURING'
WHEN 1 THEN 'AVAILABLE'
WHEN 2 THEN 'ERROR'
END;
ALTER TABLE `shots` DROP `status`;
ALTER TABLE `shots` CHANGE `status_tmp` `status` ENUM('CAPTURING', 'AVAILABLE', 'ERROR') NOT NULL;
