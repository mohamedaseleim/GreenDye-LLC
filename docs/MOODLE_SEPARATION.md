# Moodle separation policy

Green is a global consulting and professional-accreditation platform. Moodle is a separate learning platform.

## Green owns
Consulting services and requests, clients, organizations, factories, companies, consultants, trainers, professional accreditations, certificates, QR verification, and consulting operations.

## Moodle owns
Courses, lessons, quizzes, assignments, enrollments, grades, learning progress, course forums, SCORM/xAPI, and learning analytics.

There is no shared database, enrollment synchronization, grade synchronization, or course API in Green. The first release exposes only a public link configured by `REACT_APP_MOODLE_URL` and `MOODLE_BASE_URL`.
