# Pending trainer applications fix

The existing administrative trainer controller and router are now mounted at `/api/admin/trainers`. The pending applications endpoint is `/api/admin/trainers/applications/pending`, protected for `admin` and `super_admin`. The response supports pagination and returns `data`, `count`, `total`, `page`, and `pages`. The frontend administrative route no longer permits trainers to enter administrator pages.
