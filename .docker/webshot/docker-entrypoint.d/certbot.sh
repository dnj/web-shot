#!/bin/bash

echo "Start certbot bash";

webshotIsReady=0
wait_for_webshot() {
	i=1
	while true; do
			if [[ "$i" -gt 300 ]]; then
				break;
			fi
			i=$((i+1))
			echo "certbot: ($i) check webshot PID file ( $1 ) is exists?";
			if [ -f $1 ]; then
					webshotPID=$(cat "$1");
					echo "is exists, file content: $webshotPID , check process running with this PID?";
					if [ -n "$webshotPID" -a -e /proc/$webshotPID ]; then
							echo "webshot is running with PID: $webshotPID ";
							webshotIsReady=1
							break;
					fi
			fi
			sleep 1
	done
}

wait_for_webshot "/run/webshot/webshot.pid";

if [ "$1" = 'run' ]; then
	if [ "$webshotIsReady" = "1" ]
	then
	    echo "RUN CERTBOT";
		mkdir -p /home/webshot/dist/HttpServer/public/assets;
		certbot certonly --non-interactive -v --agree-tos --email "$WEBSHOT_CERTBOT_EMAIL" --webroot --webroot-path /home/webshot/dist/HttpServer/public/assets -d "$WEBSHOT_HOSTNAME"
		echo >> /home/webshot/.env
		echo "WEBSHOT_SSL_CERT_PATH=/etc/letsencrypt/live/$WEBSHOT_HOSTNAME/fullchain.pem" >> /home/webshot/.env
		echo "WEBSHOT_SSL_KEY_PATH=/etc/letsencrypt/live/$WEBSHOT_HOSTNAME/privkey.pem" >> /home/webshot/.env
		echo "0 3 * * * /docker-entrypoint.d/certbot.sh renew 2>&1" > /etc/cron.d/certbot-daily-cron;
		crontab /etc/cron.d/certbot-daily-cron;
		echo "Reload webshot";
		node /home/webshot/dist/Run.js reload
	else
		echo "It seems webshot is not ready, so we can not issue SSL for it";
	fi

else
    if [ "$1" = 'renew' ]; then
        if [ "$webshotIsReady" = "1" ]
		then
			echo "RENEW CERTBOT";
			certbot renew
			node /home/webshot/dist/Run.js reload
		else
			echo "It seems webshot is not ready, so we can not renew SSL of it";
		fi
    else
        exec "$@"
    fi
fi
