# V17 remediation

V17 resolves the independent review findings by modernizing stale acceptance gates, adding a single aggregate acceptance command, adding behavioral payment-term recalculation tests, removing the residual Green-hosted course-forum model/routes/client, and centralizing access-token handling.

The browser token is now held in memory with session-scoped storage rather than persistent local storage. Existing local tokens are migrated once and deleted. A future server-compatible release may replace this with an HttpOnly rotating refresh-cookie flow, but that requires a coordinated backend authentication contract and CSRF controls.

Production acceptance still requires connected-environment verification of Docker Compose, MongoDB replica-set transactions, SMTP delivery, ClamAV fail-closed behavior, encrypted backup restoration, dependency/image/secret scanning, and any enabled payment provider's signed webhooks and reconciliation.
