# V16 remediation

V16 hardens the release by centralizing authenticated API access, preventing service-worker caching of API and private data, validating supported currencies, extending professional routes to super administrators, pinning and locally binding the development database, requiring production secrets and public URLs, adding an executable CI quality workflow, clarifying the current documentation authority, and marking former Academy specifications as legacy.

Release acceptance requires clean dependency installation, frontend production build, unit and integration tests, Docker Compose configuration validation, MongoDB replica-set transaction tests, SMTP delivery, fail-closed malware scanning, and isolated backup restoration. Live payment providers remain disabled until signed-webhook sandbox and reconciliation acceptance succeeds.
