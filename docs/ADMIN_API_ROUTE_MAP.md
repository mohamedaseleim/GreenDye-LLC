# Administrative API route map

The frontend environment variable `REACT_APP_API_URL` must contain only the API origin, for example `https://api-consulting.example.com`, without `/api` or `/api/admin`. `adminService.js` appends `/api/admin`. Public trainer endpoints remain under `/api/trainers`; administrative trainer operations remain under `/api/admin/trainers`. Content settings are public at `/api/admin/content-settings/public` and protected for updates under the same mount.

Legacy course reviews, refunds, lessons, quizzes, assignments, and enrollments are not mounted in Green because they depend on the removed Course model and belong to the independent Moodle learning platform.
