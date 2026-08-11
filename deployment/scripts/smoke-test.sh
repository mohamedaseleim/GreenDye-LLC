#!/bin/sh
set -eu
API_URL="${API_URL:-https://api-consulting.greendye.org}"
WEB_URL="${WEB_URL:-https://consulting.greendye.org}"
curl -fsS --max-time 10 "$API_URL/api/health" >/dev/null
curl -fsS --max-time 10 "$API_URL/api/ready" >/dev/null
curl -fsS --max-time 10 "$WEB_URL/" >/dev/null
code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "$API_URL/api/admin/trainers/applications/pending")
[ "$code" = "401" ] || { echo "Expected 401 from protected endpoint, got $code" >&2; exit 1; }
echo "Production smoke tests passed"
