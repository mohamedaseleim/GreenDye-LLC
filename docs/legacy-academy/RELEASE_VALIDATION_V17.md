# GreenDye for Training and Consultancy V17 Release Validation

## Completed

- All static quality checks pass.
- Acceptance gates V9, V10, V11, V12, V13, V14, V16, and V17 pass through one aggregate command.
- Backend unit tests: 6 suites, 20 tests passed.
- Frontend tests: 5 suites, 19 tests passed.
- Frontend production build and bundle budget pass.
- Backend JavaScript syntax validation passes.
- Proposal updates retain optimistic concurrency, MongoDB transactions, and atomic audit writes.
- Payment terms are recalculated from the revised proposal total and behavioral tests prove exact minor-unit allocation.
- Money migration reads native MongoDB documents, retains lock/heartbeat/checkpoint safeguards, and its gates pass.
- ClamAV remains installed in the backend image and production validation remains fail-closed.
- The Green-hosted Academy forum model, routes, service, and active tests were removed from the application scope.
- Access-token access is centralized. Tokens use memory and session-scoped browser storage; persistent local-storage tokens are migrated once and deleted.
- Service Worker does not cache API responses.

## Connected-environment release gates

The following are operational validations, not source-code changes, and must be executed against staging infrastructure before public production traffic:

1. `docker compose config` and image build on the target Docker version.
2. MongoDB replica-set transaction and migration dry-run against a staging snapshot.
3. SMTP send, bounce, and retry verification.
4. ClamAV clean-file and EICAR rejection checks with fail-closed behavior.
5. Encrypted backup creation and isolated restore drill.
6. Dependency, image, SBOM, and secret scans in connected CI.
7. TLS, CSP, security-header, rate-limit, and authenticated download tests through the production reverse proxy.
8. Signed webhook, idempotency, and reconciliation acceptance for every payment provider before enabling it.

V17 is a production candidate until these infrastructure-specific gates pass.
