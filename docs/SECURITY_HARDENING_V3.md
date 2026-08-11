# Security and completeness hardening v3

This release implements real password-reset email delivery, email verification tokens, generic password-reset responses, stronger passwords, hardened cookies, project-scoped task and deliverable updates, workflow-controlled project transitions, invoice ownership derived from the project, protected private document downloads, file-signature validation, confidential-document permissions, download auditing, removal of static invoice exposure, super-admin-only restore/import controls, production restore gating, atomic proposal sending, corrected certificate route ordering, and removal of incomplete chat/refund/provider surfaces.

Payment gateway secrets remain server-environment-only. Provider refunds and live payment processing must not be presented as enabled until a specific gateway is configured, its webhook signatures are verified, and provider sandbox acceptance tests pass.
