# GreenDye for Training and Consultancy V19 validation

V19 is the microscopically cleaned source release. Local release requirements are: zero backend and frontend lint errors, all aggregate acceptance gates V9 through V19, backend unit tests, frontend tests, production build and bundle budget, JavaScript syntax validation, import integrity, no temporary artifacts, no stale brands, and archive integrity.

Connected staging remains responsible for Docker Compose validation and image build, MongoDB replica-set integration tests, SMTP, ClamAV clean/EICAR/fail-closed tests, backup restoration, TLS/security headers, dependency/image/secret scans, load tests, and signed payment webhook reconciliation.
