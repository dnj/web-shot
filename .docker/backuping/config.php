<?php
namespace packages\base;
$options = array(
	'packages.base.translator.defaultlang' => 'fa_IR',

	'packages.backuping.config' => array(
		'sources' => array(
			array(
				'id' => 'webshot-storage',
				'type' => function (array $options) {
					return new \packages\backuping\backupables\Directory($options);
				},
				'options' => array(
					'directory' => function(array $options) {
						return new \packages\base\IO\Directory\Local('/webshot/storage');
					},
					'exclude' => array(),
				),
			),
			array(
				'id' => 'webshot-mysql',
				'type' => function (array $options) {
					return new \packages\backuping\backupables\MySQL();
				},
				'options' => array(
					'host' => getenv('BACKUPING_DB_HOST'),
					'username' => getenv('BACKUPING_DB_USERNAME'),
					'password' => getenv('BACKUPING_DB_PASSWORD'),
					'seprate' => true,
					'exclude' => array(
						'some_foo_database_name',
						'some_bar_database_name' => array(
							'some_baz_table_name',
						),
					),
				),
			),
		),
		'destinations' => array(
			array(
				'id' => 'webshot-backup-ftp-storage',
				'directory' => function(array $options) {
					$ftp = new \packages\base\IO\Directory\Ftp($options['path'] ?: '');
					$driver = new \packages\base\IO\drivers\Ftp(array(
						'port' => $options['port'],
						'hostname' => $options['host'],
						'passive' => $options['passive'],
						'username' => $options['username'],
						'password' => $options['password'],
					));
					$ftp->setDriver($driver);
					return $ftp;
				},
				'lifetime' => getenv('BACKUPING_FTP_LIFETIME_IN_DAY'), // days that backup will be keeped
				'options' => array(
					'host' => getenv('BACKUPING_FTP_HOST'),
					'port' => intval(getenv('WEBSHOT_BACKUPING_FTP_PORT') ?: 21),
					'username' => getenv('BACKUPING_FTP_USERNAME'),
					'password' => getenv('BACKUPING_FTP_PASSWORD'),
					'path' => getenv('BACKUPING_FTP_PATH'),
					'passive' => in_array(getenv('BACKUPING_FTP_PASSIVE'), [1, "1", true, "true", "yes"]),
				),
			),
		),
		'report' => null,
	),
);

$backupingReportEnabled = getenv('BACKUPING_REPORT_ENABLED');
if (in_array($backupingReportEnabled, [1, "1", true, "true", "yes"])) {
	$options['packages.backuping.config']['report'] = array(
		'subject' => getenv('BACKUPING_REPORT_SUBJECT'),
		'sender' => array(
			'name' => getenv('BACKUPING_REPORT_SENDER_NAME'),
			'mail' => getenv('BACKUPING_REPORT_SENDER_EMAIL'),
		),
		'receivers' => array(
			array(
				'name' => getenv('BACKUPING_REPORT_RECEIVER_1_NAME'),
				'mail' => getenv('BACKUPING_REPORT_RECEIVER_1_EMAIL'),
			),
		),
	);
}
