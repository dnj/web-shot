-- CreateTable

CREATE TABLE `shots` (
	`id` int(10) unsigned NOT NULL AUTO_INCREMENT,
	`create_at` int(10) unsigned NOT NULL,
	`capture_at` int(10) unsigned DEFAULT NULL,
	`url` varchar(535) NOT NULL,
	`format` tinyint(4) NOT NULL,
	`full_page` tinyint(1) NOT NULL DEFAULT 0,
	`viewport_width` smallint(5) unsigned NOT NULL,
	`viewport_height` smallint(5) unsigned NOT NULL,
	`image` varchar(100) CHARACTER SET latin1 COLLATE latin1_general_ci DEFAULT NULL,
	`status` tinyint(4) NOT NULL,
	PRIMARY KEY (`id`),
	KEY `url` (`url`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
