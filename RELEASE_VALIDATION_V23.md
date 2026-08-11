# GreenDye for Training and Consultancy V23

V23 resolves the V22 review findings with 128-bit public credential identifiers, a required migration that cleans references, backfills lifecycle states, creates and verifies the unique index, and records completion. Credential creation, update, regeneration, revocation, restoration, soft deletion, export, and download are audited. Creation and mutations use document validation and transactions where data changes occur.

Before production startup, run `npm run migrate:credential-references` and then `npm run migrate:credential-references -- --apply`. Production startup fails until both `money_minor_units_v1` and `credential_reference_unique_v1` are recorded as completed. Connected staging must still run the full replica-set integration suite, Docker builds/startup, EICAR, backup restore, SMTP, security scans, load tests, and payment reconciliation.
