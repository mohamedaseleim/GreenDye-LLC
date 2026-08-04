# Green Global Consulting

A multilingual global platform for consulting services for individuals, organizations, companies, and factories. Green also manages trainers, professional accreditations, certificates, public verification, and QR codes.

## Clear platform boundary
Education and training are delivered by a completely separate Moodle site. Green does not manage courses, lessons, quizzes, enrollments, grades, or progress.

## Stack
Node.js, Express, MongoDB/Mongoose, React, Material UI, Docker and Nginx.

## Start
Copy `backend/.env.example` and `frontend/.env.example`, configure MongoDB, JWT, frontend URL, and the independent Moodle URL. Then install and run the backend and frontend packages.

## Key documentation
- `docs/CONSULTING_PLATFORM_ARCHITECTURE.md`
- `docs/MOODLE_SEPARATION.md`
- `MIGRATION_NOTES.md`

## Enterprise hardening packages

The platform now includes object-level project permissions, project membership, workflow guards, audit logging, change requests, project risks, meetings, NDAs, versioned private documents, payment ledger, server-side invoice calculations, automatic project progress/health, multi-role users, and accreditation-expiry automation. See `docs/SECURITY_AND_WORKFLOW_HARDENING.md`.
