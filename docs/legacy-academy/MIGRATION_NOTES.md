# Migration notes: LMS to consulting platform

This branch removes the internal LMS implementation and mobile learning client. Preserve a database and uploads backup before deployment.

Collections associated with courses, lessons, sections, quizzes, assignments, enrollments, progress, learning paths, recommendations, gamification, search indexes, and LMS integration are no longer used by the application. Archive them before deletion.

Trainer and certificate capabilities remain. Certificates no longer require an internal Course record. Moodle remains independent and is linked by URL only.
