#!/bin/sh
set -eu
ROOT="${ROOT:-/home/green/greendye-app}"
WEBROOT="${WEBROOT:-/home/green/web/consulting.greendye.org/public_html}"
cd "$ROOT"
node deployment/scripts/preflight.js
cd backend
npm ci --omit=dev --ignore-scripts
node --check server.js
cd ../frontend
npm ci --ignore-scripts
CI=true GENERATE_SOURCEMAP=false NODE_OPTIONS=--max-old-space-size=4096 npm run build
rsync -a --delete build/ "$WEBROOT/"
chown -R green:green "$WEBROOT"
cd "$ROOT"
pm2 startOrReload ecosystem.config.cjs --env production --update-env
pm2 save
API_URL=https://api-consulting.greendye.org WEB_URL=https://consulting.greendye.org sh deployment/scripts/smoke-test.sh
