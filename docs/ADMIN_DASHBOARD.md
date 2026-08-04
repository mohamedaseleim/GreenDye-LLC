# Admin Dashboard Documentation

## Overview

The Admin Dashboard provides comprehensive management capabilities for GreenDye Academy administrators. It includes certificate management, content management system (CMS), media library, content moderation, and announcements.

## Features

### 1. Certificate Management

Administrators can manage all certificates issued by the platform:

#### Features:
- **View All Certificates**: List all certificates with pagination
- **Search & Filter**: Search by name or certificate ID, filter by validity and revocation status
- **Create Certificate**: Manually create certificates for users
- **Update Certificate**: Modify certificate details
- **Bulk Upload**: Upload multiple certificates via CSV
- **Revoke/Restore**: Revoke invalid certificates or restore revoked ones
- **Regenerate**: Generate new verification tokens and QR codes
- **Export**: Export certificate data to CSV
- **History**: View audit trail for each certificate

#### API Endpoints:

```
GET    /api/admin/certificates           - Get all certificates with filters
POST   /api/admin/certificates           - Create new certificate
PUT    /api/admin/certificates/:id       - Update certificate
DELETE /api/admin/certificates/:id       - Delete certificate
POST   /api/admin/certificates/bulk      - Bulk upload certificates
GET    /api/admin/certificates/export    - Export certificates
POST   /api/admin/certificates/:id/regenerate - Regenerate certificate
PUT    /api/admin/certificates/:id/revoke    - Revoke certificate
PUT    /api/admin/certificates/:id/restore   - Restore certificate
GET    /api/admin/certificates/:id/history   - Get certificate history
```

#### Bulk Upload Format:

CSV format with columns:
```
userEmail,courseId,grade,score,issueDate
john@example.com,60a1b2c3d4e5f6g7h8i9j0k,A,95,2024-01-15
```

### 2. Content Management System (CMS)

Manage all website pages and content:

#### Features:
- **Page Management**: Create, edit, delete, and publish pages
- **Multilingual Support**: Content in English, Arabic, and French
- **Templates**: Multiple page templates (default, hero, about, contact, FAQ, terms, privacy)
- **Status Management**: Draft, published, archived states
- **SEO Features**: Meta descriptions, keywords, canonical URLs

#### API Endpoints:

```
GET    /api/admin/cms/pages              - Get all pages
POST   /api/admin/cms/pages              - Create new page
GET    /api/admin/cms/pages/:id          - Get single page
PUT    /api/admin/cms/pages/:id          - Update page
DELETE /api/admin/cms/pages/:id          - Delete page
PUT    /api/admin/cms/pages/:id/publish  - Publish page
```

#### Page Structure:

```javascript
{
  slug: "about-us",
  title: {
    en: "About Us",
    ar: "معلومات عنا",
    fr: "À propos de nous"
  },
  content: {
    en: "Content in English",
    ar: "المحتوى بالعربية",
    fr: "Contenu en français"
  },
  template: "about",
  status: "published"
}
```

### 3. Media Management

Upload and organize media files:

#### Features:
- **Drag & Drop Upload**: Easy file upload interface
- **File Types**: Images, videos, documents (PDF, DOC, XLS)
- **Metadata**: Title, description, alt text, tags
- **Categories**: Organize by course, page, certificate, avatar, or general
- **Search**: Find media by name or tags

#### API Endpoints:

```
GET    /api/admin/cms/media              - Get all media
POST   /api/admin/cms/media/upload       - Upload media files
GET    /api/admin/cms/media/:id          - Get single media
PUT    /api/admin/cms/media/:id          - Update media metadata
DELETE /api/admin/cms/media/:id          - Delete media
```

#### Supported File Types:
- **Images**: JPEG, JPG, PNG, GIF, WebP, SVG
- **Videos**: MP4, WebM, OGG, AVI, MOV
- **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV

#### File Size Limit: 50MB

### 4. Announcement Management

Create and schedule announcements:

#### Features:
- **Announcement Types**: Info, warning, success, error, maintenance
- **Priority Levels**: Low, medium, high, urgent
- **Target Audience**: All users, students, trainers, or admins
- **Scheduling**: Set start and end dates
- **Status Management**: Draft, active, scheduled, expired
- **Multilingual**: Support for multiple languages

#### API Endpoints:

```
GET    /api/admin/cms/announcements      - Get all announcements
POST   /api/admin/cms/announcements      - Create announcement
PUT    /api/admin/cms/announcements/:id  - Update announcement
DELETE /api/admin/cms/announcements/:id  - Delete announcement
```

### 5. Content Moderation

Moderate user-generated content including forum posts and course reviews:

#### Features:
- **Forum Moderation**: Approve or reject forum posts
- **Review Moderation**: Approve, reject, flag, or remove course reviews
- **Admin Responses**: Respond to reviews as an administrator
- **Flag Inappropriate Content**: Mark reviews with specific violation types (spam, inappropriate, offensive, fake)
- **Moderation Reasons**: Add notes when rejecting content
- **Pending Queue**: View all content awaiting moderation
- **Review Statistics**: Track review counts by status and average ratings
- **Audit Trail**: Track all moderation actions with timestamps

#### API Endpoints:

**Forum Moderation:**
```
GET    /api/admin/cms/moderation/forums     - Get pending forum posts
PUT    /api/admin/cms/moderation/forums/:id - Approve/reject post
```

**Review Moderation:**
```
GET    /api/admin/reviews                    - Get all reviews with filters
GET    /api/admin/reviews/:id                - Get review details
PUT    /api/admin/reviews/:id/approve        - Approve review
PUT    /api/admin/reviews/:id/reject         - Reject review (requires reason)
PUT    /api/admin/reviews/:id/flag           - Flag review as inappropriate
DELETE /api/admin/reviews/:id                - Remove review permanently
PUT    /api/admin/reviews/:id/respond        - Add admin response to review
GET    /api/admin/reviews/analytics/stats    - Get review statistics
```

For detailed review moderation documentation, see [REVIEW_MODERATION.md](./REVIEW_MODERATION.md).

### 6. Course Management

Manage all courses (uses existing course API with admin authorization):

```
GET    /api/admin/courses                - Get all courses
POST   /api/admin/courses                - Create course
GET    /api/admin/courses/:id            - Get single course
PUT    /api/admin/courses/:id            - Update course
DELETE /api/admin/courses/:id            - Delete course
```

## Security Features

### Role-Based Access Control (RBAC)
- All admin routes require authentication
- Only users with `admin` role can access admin dashboard
- Implemented using middleware: `protect` and `authorize('admin')`

### Input Sanitization
- All user inputs are sanitized using `mongo-sanitize`
- Regex patterns are escaped to prevent regex injection
- ObjectIds are validated before database queries

### Audit Logging
- All admin actions are logged in AuditTrail collection
- Tracks: user, action, resource type/id, details, IP address, timestamp
- Provides complete history of all changes

## Frontend UI

### Navigation
Access admin dashboard from header menu (visible only to admin users):
```
Admin Dashboard → Overview, Certificates, Pages, Media, Announcements, Courses, Moderation
```

### Pages
1. **AdminDashboard** - Overview with statistics
2. **AdminCertificates** - Certificate management interface
3. **AdminPages** - Page editor with multilingual support
4. **AdminMedia** - Media library with drag-and-drop upload
5. **AdminAnnouncements** - Announcement creator and manager
6. **AdminModeration** - Content moderation interface

### UI Components
- Material-UI for consistent design
- Responsive layout for mobile and desktop
- Search and filter capabilities
- Pagination for large datasets
- Confirmation dialogs for destructive actions
- Toast notifications for success/error messages

## Usage Examples

### Creating a Certificate Programmatically

```javascript
const response = await fetch('/api/admin/certificates', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: '60a1b2c3d4e5f6g7h8i9j0k',
    courseId: '60a1b2c3d4e5f6g7h8i9j0l',
    grade: 'A+',
    score: 95,
    issueDate: '2024-01-15'
  })
});
```

### Bulk Uploading Certificates

```javascript
const csvData = `userEmail,courseId,grade,score,issueDate
john@example.com,60a1b2c3d4e5f6g7h8i9j0k,A,95,2024-01-15
jane@example.com,60a1b2c3d4e5f6g7h8i9j0k,B+,88,2024-01-16`;

const lines = csvData.trim().split('\n');
const certificates = lines.slice(1).map(line => {
  const [userEmail, courseId, grade, score, issueDate] = line.split(',');
  return { userEmail, courseId, grade, score: parseFloat(score), issueDate };
});

await fetch('/api/admin/certificates/bulk', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ certificates })
});
```

### Uploading Media Files

```javascript
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);
formData.append('category', 'course');

await fetch('/api/admin/cms/media/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  },
  body: formData
});
```

## Database Models

### Page Model
```javascript
{
  slug: String,
  title: Map<String, String>,
  content: Map<String, String>,
  metaDescription: Map<String, String>,
  status: 'draft' | 'published' | 'archived',
  template: String,
  author: ObjectId,
  sections: Array,
  createdAt: Date,
  updatedAt: Date
}
```

### Media Model
```javascript
{
  filename: String,
  originalName: String,
  mimeType: String,
  size: Number,
  path: String,
  url: String,
  type: 'image' | 'video' | 'document' | 'other',
  category: String,
  uploadedBy: ObjectId,
  tags: [String],
  createdAt: Date
}
```

### Announcement Model
```javascript
{
  title: Map<String, String>,
  content: Map<String, String>,
  type: 'info' | 'warning' | 'success' | 'error' | 'maintenance',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  targetAudience: [String],
  status: 'draft' | 'active' | 'scheduled' | 'expired',
  startDate: Date,
  endDate: Date,
  author: ObjectId,
  createdAt: Date
}
```

## Best Practices

1. **Always sanitize user inputs** before database queries
2. **Use pagination** for large datasets
3. **Log all admin actions** to audit trail
4. **Validate file types and sizes** before upload
5. **Use confirmation dialogs** for destructive actions
6. **Provide clear error messages** to users
7. **Test with different roles** to ensure RBAC works correctly
8. **Regular backups** of database and media files

## Troubleshooting

### Common Issues

1. **403 Forbidden**: User doesn't have admin role
2. **401 Unauthorized**: Token expired or missing
3. **File upload fails**: Check file size limit (50MB)
4. **Search returns no results**: Check if regex is properly escaped

## Future Enhancements

- Advanced WYSIWYG editor with rich formatting
- Image editing capabilities
- Versioning for pages and content
- Scheduled content publishing
- Advanced analytics dashboard
- Role-based permissions with granular control
- Bulk operations for pages and media
- Import/export functionality for all content

## Support

For issues or questions, please refer to:
- Main documentation: `/docs/README.md`
- API documentation: `/docs/API.md`
- Security guidelines: `/SECURITY.md`
