# GreenDye for Training and Consultancy V24

V24 resolves the V23 privacy, migration-integrity, pagination, audit-retention, download, archive, and diagnostic findings. Public verification uses an explicit allowlist DTO and does not expose private metadata or detailed revocation reasons. The credential-reference migration synchronizes lifecycle flags, reports inconsistencies during dry run, detects indexes by key and options, and acquires its lock without a conflicting upsert.

Before production startup, run `npm run migrate:credential-references`, review missing, duplicate, statusBackfill, flagConflicts, and indexState, then run `npm run migrate:credential-references -- --apply`. Connected staging must run all replica-set integration tests, Docker builds and startup, ClamAV/EICAR, backup restoration, SMTP, scans, load tests, and payment reconciliation.
