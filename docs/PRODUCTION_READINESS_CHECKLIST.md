# Production readiness checklist

- Configure encrypted object storage and malware scanning for private documents.
- Configure secrets outside source control and rotate JWT/payment credentials.
- Run `npm run expire-accreditations` daily using the hosting scheduler.
- Configure database backups, point-in-time recovery, monitoring and alerting.
- Obtain tax, privacy, contract and electronic-signature legal review for target countries.
- Connect payment gateways only with verified webhook signatures and idempotency headers.
- Run integration tests against an isolated MongoDB test database.
- Configure HTTPS, CSP, HSTS, secure cookies and restricted CORS origins.
- Confirm Moodle remains isolated with no shared database or administrative token in the browser.
