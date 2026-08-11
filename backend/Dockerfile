FROM node:20.18.3-alpine3.21
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache tini curl clamav su-exec mongodb-tools && freshclam && addgroup -S green && adduser -S green -G green
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY --chown=green:green . .
RUN chmod 755 /app/docker-entrypoint.sh
RUN mkdir -p private_uploads public_uploads backups exports && chown -R green:green /app
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD curl -fsS http://127.0.0.1:5000/api/ready || exit 1
ENTRYPOINT ["/sbin/tini","--","/app/docker-entrypoint.sh"]
CMD ["node","server.js"]
