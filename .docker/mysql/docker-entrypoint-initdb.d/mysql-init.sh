if [[ -n "$WEBSHOT_MYSQL_DATABASE" ]]; then
	mysql_note "Creating database ${WEBSHOT_MYSQL_DATABASE}"
	docker_process_sql --database=mysql <<<"CREATE DATABASE IF NOT EXISTS \`$WEBSHOT_MYSQL_DATABASE\` ;"
fi

if [[ -n "$WEBSHOT_MYSQL_USER" && -n "$WEBSHOT_MYSQL_PASSWORD" ]]; then
	mysql_note "Creating user ${WEBSHOT_MYSQL_USER}"
	docker_process_sql --database=mysql <<< "CREATE USER '$WEBSHOT_MYSQL_USER'@'%' IDENTIFIED BY '$WEBSHOT_MYSQL_PASSWORD' ;"
fi

if [[ -n "$WEBSHOT_MYSQL_USER" && -n "$WEBSHOT_MYSQL_DATABASE" ]]; then
	mysql_note "Giving user ${WEBSHOT_MYSQL_USER} access to schema ${WEBSHOT_MYSQL_DATABASE}"
	docker_process_sql --database=mysql <<<"GRANT ALL ON \`${WEBSHOT_MYSQL_DATABASE//_/\\_}\`.* TO '$WEBSHOT_MYSQL_USER'@'%' ;"
fi

if [[ -f "/docker-entrypoint-initdb.d/01-webshot-database.sql.seed" && -n "$WEBSHOT_MYSQL_DATABASE" ]]; then
	mysql_note "running /docker-entrypoint-initdb.d/01-webshot-database.sql.seed"
	docker_process_sql --database=$WEBSHOT_MYSQL_DATABASE < /docker-entrypoint-initdb.d/01-webshot-database.sql.seed
fi

if [[ -f "/docker-entrypoint-initdb.d/02-webshot-patch.sql.seed" && -n "$WEBSHOT_MYSQL_DATABASE" ]]; then
	mysql_note "running /docker-entrypoint-initdb.d/02-webshot-patch.sql.seed"
	docker_process_sql --database=$WEBSHOT_MYSQL_DATABASE < /docker-entrypoint-initdb.d/02-webshot-patch.sql.seed
fi