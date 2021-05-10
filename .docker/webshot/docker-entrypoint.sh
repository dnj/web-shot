#!/bin/bash

printf "$(whoami)\n"

# turn on job control
set -m

if [ "$1" = 'run' ]; then

	echo "check the env 'WEBSHOT_CERTBOT_RUN' is exists?";
	if [[ ! -z "$WEBSHOT_CERTBOT_RUN" ]]; then
		echo "is exists! so we should issue SSL";

		echo "start the webshot process and put it in the background";
		node /home/webshot/dist/Run.js &

		echo "run certbot to issue SSL";
		/docker-entrypoint.d/certbot.sh run
		echo "certbot runned, bring webshot process back";

		fg %1
	else
		echo "is not exists, so run webshot normally in foreground";
		node /home/webshot/dist/Run.js;
	fi

else
    exec "$@"
fi