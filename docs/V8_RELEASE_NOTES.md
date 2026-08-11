# V8 release notes

V8 scopes invoice status changes to projects, adds project-level finance and contract permissions, protects proposal updates with expected versions, persists proposal tax rates, validates payment idempotency request identity, limits payment metadata, adds transactional refunds, enables optional fail-closed ClamAV scanning, removes public error details, extends multilingual dashboards, and strengthens the release quality gate.

Production requirements: Node.js 20, MongoDB replica set, and `MALWARE_SCAN_ENABLED=true` with `clamdscan` available when accepting live uploads. Live payment gateways must complete provider-specific signed webhook certification before activation.
