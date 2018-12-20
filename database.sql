CREATE TABLE `options` (
	`name` varchar(100) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
	`value` text,
	`autoload` tinyint(1) NOT NULL,
	PRIMARY KEY (`name`),
	KEY `autoload` (`autoload`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `plans` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`title` varchar(255) NOT NULL,
	`hits` int(10) unsigned DEFAULT NULL,
	`requests` int(10) unsigned DEFAULT NULL,
	PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `services` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`plan` int(11) NOT NULL,
	`ip` varchar(15) DEFAULT NULL,
	`domain` varchar(100) CHARACTER SET latin1 COLLATE latin1_general_ci DEFAULT NULL,
	`hits` int(10) unsigned NOT NULL,
	`requests` int(10) unsigned NOT NULL,
	`create_at` int(10) unsigned NOT NULL,
	`expire_at` int(10) unsigned DEFAULT NULL,
	`reset_at` int(10) unsigned NOT NULL,
	`status` tinyint(4) NOT NULL,
	PRIMARY KEY (`id`),
	UNIQUE KEY `ip` (`ip`),
	UNIQUE KEY `domain` (`domain`),
	KEY `plan` (`plan`),
	CONSTRAINT `services_ibfk_1` FOREIGN KEY (`plan`) REFERENCES `plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE `shots` (
	`id` int(10) unsigned NOT NULL AUTO_INCREMENT,
	`create_at` int(10) unsigned NOT NULL,
	`capture_at` int(10) unsigned DEFAULT NULL,
	`url` varchar(535) NOT NULL,
	`format` tinyint(4) NOT NULL,
	`full_page` tinyint(1) NOT NULL,
	`viewport_width` smallint(5) unsigned NOT NULL,
	`viewport_height` smallint(5) unsigned NOT NULL,
	`image` varchar(100) CHARACTER SET latin1 COLLATE latin1_general_ci DEFAULT NULL,
	`status` tinyint(4) NOT NULL,
	PRIMARY KEY (`id`),
	KEY `url` (`url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


INSERT INTO `options` (`name`, `value`, `autoload`) VALUES
-- ('http_hostname', 'web-shot.ahy', 1),
-- ('http_port', '808', 1),
-- ('puppeteer_args', '["--no-sandbox", "--disable-setuid-sandbox"]', 1),
-- ('puppeteer_headless', 'false', 1),
-- ('process_group', 'web-shot', 1),
-- ('process_user', 'web-shot', 1),
('puppeteer_max_pages', '20', 1),
('puppeteer_new_page_timeout', '10', 1);