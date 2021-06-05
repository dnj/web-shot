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
					'host' => getenv('BACKUP_DB_HOST'),
					'username' => getenv('BACKUP_DB_USERNAME'),
					'password' => getenv('BACKUP_DB_PASSWORD'),
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
					$ftp = new \packages\base\IO\Directory\Ftp($options['path'] ?: null);
					$ftp->hostname = $options['host'];
					$ftp->username = $options['username'];
					$ftp->password = $options['password'];
					return $ftp;
				},
				'lifetime' => getenv('FTP_BACKUP_LIFETIME_IN_DAY'), // days that backup will be keeped
				'options' => array(
					'host' => getenv('FTP_BACKUP_HOST'),
					'username' => getenv('FTP_BACKUP_USERNAME'),
					'password' => getenv('FTP_BACKUP_PASSWORD'),
					'path' => getenv('WEBSHOT_BACKUPING_FTP_PATH'),
				),
			),
		),
		'report' => null,
	),
);

$backupingReportEnabled = getenv('WEBSHOT_BACKUPING_REPORT_ENABLED');
if ($backupingReportEnabled) {
	$options['packages.backuping.config']['report'] = array(
		'subject' => getenv('REPORT_SUBJECT'),
		'sender' => array(
			'name' => getenv('REPORT_SENDER_NAME'),
			'mail' => getenv('REPORT_SENDER_EMAIL'),
		),
		'receivers' => array(
			array(
				'name' => getenv('REPORT_RECEIVER_1_NAME'),
				'mail' => getenv('REPORT_RECEIVER_1_EMAIL'),
			),
			array(
				'name' => getenv('REPORT_RECEIVER_2_NAME'),
				'mail' => getenv('REPORT_RECEIVER_2_EMAIL'),
			),
		),
	);
}
