FROM zenika/alpine-chrome:89-with-node-14

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD 1
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser

EXPOSE 80
USER root
RUN addgroup webshot && \
	adduser -G webshot -s /bin/sh -D webshot && \
	mkdir -m 0755 -p  /home/webshot/dist/storage  /home/webshot/dist/HttpServer/public/assets /run/webshot && \
	chown -R webshot:webshot /home/webshot/ /run/webshot/


WORKDIR /home/webshot
COPY --chown=webshot . /home/webshot
USER webshot
RUN npm install --production=false && \
	npm run build:ts && \
	npm run build:webpack && \
	npm prune --production && \
	npm cache clean --force

VOLUME [ "/home/webshot/dist/storage/" ]
CMD [ "node", "/home/webshot/dist/Run.js" ]
