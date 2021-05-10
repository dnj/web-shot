FROM node:12

RUN apt-get update \
    && apt-get install -yq \
        bash certbot udev nano \
        gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
        libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 \
        libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
        libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
        fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
        ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget \
    && apt-get clean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

RUN groupadd --gid 1001 webshot \
	&& useradd --uid 1001 --gid webshot --shell /bin/sh --create-home webshot

RUN echo 'kernel.unprivileged_userns_clone=1' > /etc/sysctl.d/userns.conf

COPY ./src /home/webshot/src
COPY ./package*.json /home/webshot/
COPY ./ts*.json /home/webshot/
COPY ./webpack.config.js /home/webshot

COPY ./.docker/webshot/docker-entrypoint.sh /docker-entrypoint.sh
COPY ./.docker/webshot/docker-entrypoint.d/ /docker-entrypoint.d/

WORKDIR /home/webshot

RUN npm install
RUN npm run build:ts
RUN npm run build:webpack

RUN mkdir -p \
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

EXPOSE 80 443

USER webshot
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD [ "run" ]
