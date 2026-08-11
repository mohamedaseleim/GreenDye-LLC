# Production deployment v5

## Required secrets and files

1. Copy `backend/.env.production.example` to `backend/.env.production` and replace every placeholder.
2. Copy `.env.production.example` to `.env.production` and replace the Mongo root password.
3. Create `frontend/.env.production` with the public API and Moodle URLs.
4. Generate the Mongo replica-set key:

```bash
mkdir -p deployment/secrets
openssl rand -base64 756 > deployment/secrets/mongo-keyfile
chmod 400 deployment/secrets/mongo-keyfile
```

5. Generate the JWT secret:

```bash
openssl rand -hex 64
```

## Mandatory production gate

```bash
node deployment/scripts/preflight.js
```

Deployment is intentionally blocked when secrets are placeholders, HTTPS is missing, MongoDB lacks `replicaSet`, SMTP is missing, or production restore is enabled.

## Docker deployment

```bash
docker compose --env-file .env.production -f docker-compose.production.yml build --pull
docker compose --env-file .env.production -f docker-compose.production.yml up -d
docker compose --env-file .env.production -f docker-compose.production.yml ps
```

Terminate TLS at a managed reverse proxy or load balancer. Only expose the frontend and API proxy, never MongoDB.

## VPS and PM2 deployment

```bash
sh deployment/scripts/deploy-vps.sh
```

## Acceptance gate

The release is accepted only if these pass:

```bash
API_URL=https://api-consulting.greendye.org WEB_URL=https://consulting.greendye.org sh deployment/scripts/smoke-test.sh
cd backend && npm run test:unit && npm run test:integration
```

Test SMTP delivery, verify restore on an isolated host, install malware scanning for uploaded files, and configure external encrypted backups. Live payment gateways remain disabled until a provider-specific signed-webhook workflow passes sandbox and financial reconciliation tests.
