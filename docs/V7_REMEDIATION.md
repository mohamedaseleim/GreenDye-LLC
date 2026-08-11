# V7 remediation

Resolved duplicate controller exports, removed mass-assignment spreads from consulting operations, added proposal repricing and payment-term validation on update, aligned payment gateway transaction identifiers, added compound provider transaction uniqueness, added request-change workflow constraints, added project permissions for meetings and change requests, unified backend roles, included project members in project listings, upgraded Multer to 2.x, removed the unused unsupported PayPal SDK, added the missing multilingual error key, and added an automated quality gate.

Run before every release:

```bash
node deployment/scripts/quality-gate.js
```

External production acceptance still requires connected-environment checks: dependency advisory scanning, SMTP delivery, MongoDB replica-set integration tests, malware scanning, backup restoration, and payment-provider sandbox certification when a live provider is enabled.
