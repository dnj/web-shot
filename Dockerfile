FROM node:12-slim

RUN apt-get update \
    && apt-get install -yq --no-install-recommends \
        bash certbot udev nano cron \
        gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
        libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 \
        libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
        libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
        fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
        ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils \
	&& apt-get clean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/* && rm -fr /var/cache/apt/archives/ \
	&& rm -fr /usr/share/doc/ && rm -fr /usr/share/man/ && rm -fr /usr/share/locale/ \
	&& groupadd --gid 1001 webshot \
	&& useradd --uid 1001 --gid webshot --shell /bin/sh --create-home webshot \
	&& mkdir -m 0755 -p \
		/home/webshot/dist/storage \
		/home/webshot/dist/HttpServer/public/assets \
		/run/webshot \
		/etc/letsencrypt \
		/var/log/letsencrypt \
		/var/lib/letsencrypt \
	&& chown -R webshot:webshot /home/webshot/ \
    && chown -R webshot:webshot /run/webshot/ \
    && chown -R webshot:webshot /etc/letsencrypt/ \
    && chown -R webshot:webshot /var/log/letsencrypt/ \
	&& chown -R webshot:webshot /var/lib/letsencrypt

COPY --chown=webshot . /home/webshot
COPY --chown=webshot ./.docker/webshot/ /

WORKDIR /home/webshot

USER webshot

ENV NODE_ENV=production
RUN npm install --production=false \
    && npm run build:ts \
    && npm run build:webpack \
	&& npm prune --production \
	&& npm cache clean --force

EXPOSE 80 443

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD [ "run" ]
