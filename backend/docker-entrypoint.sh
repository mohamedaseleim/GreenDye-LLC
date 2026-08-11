#!/bin/sh
set -eu
if [ -n "${MONGO_APP_USERNAME:-}" ] && [ -n "${MONGO_APP_PASSWORD:-}" ]; then
  export MONGODB_URI="$(node -e "const u=encodeURIComponent(process.env.MONGO_APP_USERNAME),p=encodeURIComponent(process.env.MONGO_APP_PASSWORD),h=process.env.MONGO_HOST||'mongodb',d=process.env.MONGO_DB||'green_consulting';process.stdout.write('mongodb://'+u+':'+p+'@'+h+':27017/'+d+'?authSource='+d+'&replicaSet=rs0')")"
fi
command -v mongodump >/dev/null && command -v mongorestore >/dev/null || { echo 'MongoDB database tools unavailable' >&2; exit 1; }
if ! freshclam; then
  newest=$(find /var/lib/clamav -type f \( -name '*.cvd' -o -name '*.cld' \) 2>/dev/null | xargs -r stat -c '%Y' | sort -nr | head -1)
  now=$(date +%s)
  [ -n "$newest" ] && [ $((now-newest)) -le 172800 ] || { echo 'ClamAV signatures unavailable or older than 48 hours' >&2; exit 1; }
  echo 'ClamAV update unavailable; using recent cached signatures' >&2
fi
exec su-exec green "$@"
