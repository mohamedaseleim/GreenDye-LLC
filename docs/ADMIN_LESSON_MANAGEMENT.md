# Admin Lesson/Content Management Enhancement

## Overview
This implementation adds comprehensive lesson and content management capabilities to the GreenDye Academy admin dashboard, including video upload, quiz builder, assignment management, and interactive content tools.

## Features Implemented

### 1. Enhanced AdminLessons Component
The AdminLessons page has been completely redesigned with the following capabilities:

#### Main Features:
- **Tabbed Interface**: Separate tabs for Lessons and Quizzes
- **Drag-and-Drop Reordering**: Visual reordering of lessons with drag-and-drop
- **Inline Actions**: Quick access to edit and delete operations
- **Real-time Feedback**: Success/error notifications via snackbar

#### Lesson Management:
- Create, edit, and delete lessons
- Support for multiple lesson types:
  - Video lessons with upload capability
  - Text/Article lessons with rich text editing
  - Document lessons (PDF, DOC, PPT)
  - Quiz lessons
  - Assignment lessons
  - Live session lessons

#### Quiz Management:
- Create, edit, and delete quizzes
- Link quizzes to specific lessons or standalone
- View quiz statistics (questions count, passing score, etc.)

### 2. LessonEditor Component
A comprehensive dialog-based editor for creating and editing lessons.

#### Features:
- **Tabbed Interface**:
  - Basic Info: Title, description, type, order
  - Content: Type-specific content fields
  - Settings: Duration, free preview, published status

- **Video Content**:
  - File upload with progress indicator
  - URL input support
  - Thumbnail URL
  - Duration tracking (seconds)

- **Text Content**:
  - Rich text area for lesson content
  - Multilingual support (English default)

- **Document Content**:
  - File upload for PDF, DOC, DOCX, PPT, PPTX
  - Document metadata (name, type, URL)

- **Publishing Controls**:
  - Free preview toggle
  - Published/Draft status toggle
  - Estimated duration

### 3. QuizBuilder Component
A sophisticated quiz creation and management interface.

#### Features:
- **Quiz Settings**:
  - Title and description
  - Passing score percentage
  - Time limit (minutes)
  - Attempts allowed (-1 for unlimited)
  - Shuffle questions/options
  - Show results timing
  - Required/Published status

- **Question Types Supported**:
  1. **Multiple Choice**: Multiple options with one correct answer
  2. **True/False**: Binary choice questions
  3. **Short Answer**: Text input with exact match validation
  4. **Essay**: Requires manual grading

- **Question Management**:
  - Add/remove questions dynamically
  - Configure points per question
  - Set difficulty level (easy, medium, hard)
  - Add explanations for incorrect answers
  - Manage multiple options per question

### 4. Backend API Integration

#### Lesson APIs:
- `GET /api/lessons?courseId={id}` - List lessons
- `GET /api/lessons/:id` - Get lesson details
- `POST /api/lessons` - Create lesson
- `PUT /api/lessons/:id` - Update lesson
- `DELETE /api/lessons/:id` - Delete lesson
- `PUT /api/lessons/reorder` - Reorder lessons

#### Quiz APIs:
- `GET /api/quizzes?courseId={id}&lessonId={id}` - List quizzes
- `GET /api/quizzes/:id` - Get quiz details
- `POST /api/quizzes` - Create quiz
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz
- `GET /api/quizzes/:id/analytics` - Get quiz analytics

#### Media Upload API:
- `POST /api/admin/cms/media/upload` - Upload files (videos, documents)

## Usage Guide

### Creating a Lesson

1. Navigate to the Admin Lessons page
2. Click "Add Lesson" button
3. Fill in basic information:
   - Title (required)
   - Description
   - Lesson type
   - Order number
4. Switch to "Content" tab
5. Based on type selected:
   - **Video**: Upload video or enter URL, add thumbnail
   - **Text**: Write content in text area
   - **Document**: Upload document file
6. Switch to "Settings" tab
7. Set duration, free preview, and published status
8. Click "Create" to save

### Creating a Quiz

1. Navigate to Admin Lessons page
2. Switch to "Quizzes" tab
3. Click "Add Quiz" button
4. Fill in quiz information:
   - Title and description
   - Passing score, time limit, attempts
   - Toggle shuffle options
5. Click "Add Question" to create questions
6. For each question:
   - Enter question text
   - Select question type
   - Set difficulty and points
   - Add options (for multiple choice)
   - Mark correct answer
   - Add explanation (optional)
7. Click "Create Quiz" to save

### Reordering Lessons

1. Navigate to Lessons tab
2. Drag lessons using the drag handle icon
3. Drop in desired position
4. Click "Save Order" to persist changes

## Technical Implementation

### Frontend Stack:
- React 18.2
- Material-UI 5.14
- react-beautiful-dnd for drag-and-drop
- Axios for API calls

### Backend Stack:
- Node.js/Express
- MongoDB with Mongoose
- Multer for file uploads
- JWT authentication

### File Structure:
```
frontend/src/
├── pages/
│   └── AdminLessons.js          # Main admin lessons page
├── components/
│   ├── LessonEditor.js          # Lesson creation/editing dialog
│   └── QuizBuilder.js           # Quiz creation/editing dialog
├── services/
│   └── adminService.js          # API service methods
└── __tests__/
    ├── LessonEditor.test.js     # Component tests
    └── QuizBuilder.test.js      # Component tests

backend/
├── controllers/
│   ├── lessonController.js      # Lesson CRUD operations
│   ├── quizController.js        # Quiz management
│   └── adminMediaController.js  # File upload handling
├── models/
│   ├── Lesson.js                # Lesson schema
│   └── Quiz.js                  # Quiz schema
├── routes/
│   ├── lessonRoutes.js          # Lesson API routes
│   └── quizRoutes.js            # Quiz API routes
└── __tests__/
    └── integration/
        └── adminLessons.test.js # Integration tests
```

## Security Considerations

1. **Authentication**: All endpoints require JWT authentication
2. **Authorization**: Only trainers and admins can create/edit lessons
3. **File Upload**: 
   - File type validation (images, videos, documents only)
   - File size limit: 50MB
   - Sanitized file names
4. **Input Validation**: All inputs validated on backend
5. **XSS Protection**: User content properly escaped

## Testing

### Backend Tests:
- Integration tests for lesson CRUD operations
- Integration tests for quiz management
- Test coverage for file uploads
- Authorization and authentication tests

### Frontend Tests:
- Component rendering tests
- User interaction tests
- Form validation tests
- Mock API integration

Run tests:
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## Future Enhancements

1. **Rich Text Editor**: Replace plain text area with WYSIWYG editor
2. **Assignment Grading**: Build assignment submission and grading interface
3. **Video Processing**: Server-side video transcoding and thumbnails
4. **Bulk Operations**: Import/export lessons and quizzes
5. **Analytics Dashboard**: Lesson engagement and quiz performance metrics
6. **Version Control**: Track lesson/quiz revisions
7. **Templates**: Reusable lesson and quiz templates
8. **Collaboration**: Multi-trainer editing with conflict resolution

## Support

For issues or questions:
- Check existing tests for usage examples
- Review API documentation in backend controllers
- Contact the development team

## Version History

- **v1.0** (2025-11-05): Initial implementation
  - Basic lesson CRUD operations
  - Quiz builder with multiple question types
  - Video and document upload
  - Drag-and-drop reordering
