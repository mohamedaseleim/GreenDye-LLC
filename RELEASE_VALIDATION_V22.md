# GreenDye for Training and Consultancy V22

V22 resolves credential ownership, self-issuance, required-field, reference-uniqueness, CSV/API alignment, atomic bulk-audit, and verification-model findings. Public verification is explicitly identifier-only and rate limited; verification tokens and QR payloads are not exposed by the public API.

Before creating the unique credential-reference index against historical production data, run `npm run migrate:credential-references` as a dry preflight and then `npm run migrate:credential-references -- --apply` during the approved maintenance procedure. Connected staging must still run the replica-set integration suite, Docker builds/startup, EICAR, backup restore, SMTP, scans, load tests, and payment reconciliation.
