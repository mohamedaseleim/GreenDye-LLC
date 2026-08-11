# Learning Management System (LMS)

## A. Synchronous Learning (Live Sessions)
**Status:** ⚙️ Not yet implemented

**Next Steps:**
- Integrate with Zoom SDK, Jitsi, GitHub Classrooms or Agora.io for live classes.
- Store session metadata (date, duration, participants, recording link).
- Allow calendar invites and reminders.

## B. Asynchronous Learning (Recorded Courses)
**Status:** ✅ Partially Implemented

**Missing / Needed:**
- Proper course structure (sections, lessons, attachments).
- Resume playback progress tracking.
- Optional video streaming service (Mux / Cloudflare Stream).

## C. Self-Paced Learning Paths
**Status:** ⚙️ Conceptual only

**Needed:**
- Define learning paths as collections of courses or modules.
- Include dependencies (course prerequisites).
- Progress = weighted average of contained courses.

**Model Example:**
```
LearningPath → Courses[] → Lessons[]
```
