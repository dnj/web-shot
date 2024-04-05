FROM zenika/alpine-chrome:123-with-node AS builder
ENV PUPPETEER_SKIP_DOWNLOAD true

WORKDIR /app
COPY --chown=chrome ./package.json ./package-lock.json /app
RUN npm install

COPY --chown=chrome . /app
RUN npm run build 


FROM zenika/alpine-chrome:123-with-node

ENV NODE_ENV=production
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser
ENV NITRO_PORT=80

EXPOSE 80
USER root
RUN addgroup web-shot && \
	adduser -G web-shot -s /bin/sh -D web-shot && \
	mkdir /app/ && \
	chown web-shot:web-shot /app/ && \
	npm install -g prisma


WORKDIR /app
COPY --chown=web-shot --from=builder /app/.output /app
COPY --chown=web-shot --from=builder /app/prisma /app/prisma
USER web-shot

CMD [ "node", "/app/server/index.mjs" ]