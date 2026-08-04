# GreenDye Academy - API Reference

Complete API documentation for GreenDye Academy platform.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

---

## Authentication Endpoints

### Register User

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### Login

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User

```http
GET /api/auth/me
```

**Headers:** Authorization required

---

## Payment Endpoints

### Create Checkout Session

```http
POST /api/payments/checkout
```

**Headers:** Authorization required

**Request Body:**
```json
{
  "courseId": "course_id",
  "paymentMethod": "stripe",
  "currency": "USD",
  "country": "US",
  "region": "California"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "payment_id",
    "checkoutUrl": "https://checkout.stripe.com/...",
    "sessionId": "session_id",
    "publicKey": "pk_test_..."
  }
}
```

**Payment Methods:**
- `stripe` - International (Credit/Debit cards)
- `paypal` - International
- `fawry` - Egypt
- `paymob` - Egypt & MENA

### Verify Payment

```http
POST /api/payments/verify
```

**Request Body:**
```json
{
  "paymentId": "payment_id",
  "transactionId": "transaction_id",
  "status": "success",
  "gatewayResponse": {}
}
```

### Get Payment History

```http
GET /api/payments
```

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "payment_id",
      "course": {
        "title": "Course Name",
        "thumbnail": "image_url"
      },
      "amount": 99.99,
      "currency": "USD",
      "status": "completed",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### Request Refund

```http
POST /api/payments/:id/refund
```

**Headers:** Authorization required

**Request Body:**
```json
{
  "reason": "Course not as expected"
}
```

### Get Invoice

```http
GET /api/payments/:id/invoice
```

**Headers:** Authorization required

---

## Admin Payment Management Endpoints

**Note:** All admin payment endpoints require admin role authorization.

### Get All Transactions

```http
GET /api/admin/payments
```

**Headers:** Authorization required (Admin only)

**Query Parameters:**
- `status` - Filter by payment status (completed, pending, failed, refunded)
- `paymentMethod` - Filter by payment method (stripe, paypal, fawry, paymob)
- `currency` - Filter by currency (USD, EUR, EGP, SAR, NGN)
- `startDate` - Filter transactions after this date (ISO 8601 format)
- `endDate` - Filter transactions before this date (ISO 8601 format)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)

**Response:**
```json
{
  "success": true,
  "count": 20,
  "total": 150,
  "page": 1,
  "pages": 8,
  "data": [
    {
      "_id": "payment_id",
      "user": {
        "name": "User Name",
        "email": "user@example.com"
      },
      "course": {
        "title": "Course Name"
      },
      "amount": 99.99,
      "currency": "USD",
      "paymentMethod": "stripe",
      "status": "completed",
      "transactionId": "txn_123456",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Payment Statistics

```http
GET /api/admin/payments/stats
```

**Headers:** Authorization required (Admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": {
      "total": 500,
      "completed": 450,
      "pending": 30,
      "failed": 15,
      "refunded": 5
    },
    "revenue": {
      "today": 1250.00,
      "thisMonth": 45000.00,
      "lastMonth": 38000.00
    },
    "refunds": {
      "pending": 3,
      "total": 12
    }
  }
}
```

### Get Revenue Analytics

```http
GET /api/admin/payments/analytics/revenue
```

**Headers:** Authorization required (Admin only)

**Query Parameters:**
- `startDate` - Start date for analytics period (ISO 8601 format)
- `endDate` - End date for analytics period (ISO 8601 format)
- `groupBy` - Time grouping: 'day', 'week', or 'month' (default: 'month')

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": {
      "totalRevenue": 125000.00,
      "totalTransactions": 450,
      "averageTransaction": 277.78
    },
    "revenueByCurrency": [
      {
        "_id": "USD",
        "totalRevenue": 95000.00,
        "totalTransactions": 300,
        "averageTransaction": 316.67
      }
    ],
    "revenueOverTime": [
      {
        "_id": { "year": 2025, "month": 1 },
        "revenue": 45000.00,
        "transactions": 150
      }
    ],
    "revenueByMethod": [
      {
        "_id": "stripe",
        "revenue": 75000.00,
        "transactions": 280
      }
    ],
    "topCourses": [
      {
        "courseId": "course_id",
        "title": "Course Name",
        "revenue": 15000.00,
        "enrollments": 150
      }
    ],
    "refunds": {
      "totalRefunded": 2500.00,
      "refundCount": 12
    }
  }
}
```

### Get Payment Gateway Configuration

```http
GET /api/admin/payments/gateway-config
```

**Headers:** Authorization required (Admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "stripe": {
      "enabled": true,
      "configured": true
    },
    "paypal": {
      "enabled": true,
      "configured": true
    },
    "fawry": {
      "enabled": false,
      "configured": false
    },
    "paymob": {
      "enabled": true,
      "configured": true
    }
  }
}
```

### Export Transactions

```http
GET /api/admin/payments/export
```

**Headers:** Authorization required (Admin only)

**Query Parameters:**
- `format` - Export format: 'json' or 'csv' (default: 'json')
- `startDate` - Filter start date (ISO 8601 format)
- `endDate` - Filter end date (ISO 8601 format)

**Response:** 
- JSON: Array of transaction objects
- CSV: File download with CSV content

### Get Refund Requests

```http
GET /api/refunds
```

**Headers:** Authorization required (Admin only)

**Query Parameters:**
- `status` - Filter by status: 'pending', 'approved', or 'rejected'

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "refund_request_id",
      "payment": {
        "_id": "payment_id",
        "amount": 99.99,
        "currency": "USD"
      },
      "user": {
        "name": "User Name",
        "email": "user@example.com"
      },
      "reason": "Course not as expected",
      "status": "pending",
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

### Approve Refund Request

```http
PUT /api/refunds/:id/approve
```

**Headers:** Authorization required (Admin only)

**Response:**
```json
{
  "success": true,
  "message": "Refund approved and processed",
  "data": {
    "_id": "refund_request_id",
    "status": "approved",
    "refundAmount": 99.99,
    "processedAt": "2025-01-15T12:00:00.000Z",
    "processedBy": "admin_user_id"
  }
}
```

### Reject Refund Request

```http
PUT /api/refunds/:id/reject
```

**Headers:** Authorization required (Admin only)

**Request Body:**
```json
{
  "responseMessage": "Refund window expired"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Refund rejected",
  "data": {
    "_id": "refund_request_id",
    "status": "rejected",
    "responseMessage": "Refund window expired",
    "processedAt": "2025-01-15T12:00:00.000Z",
    "processedBy": "admin_user_id"
  }
}
```

---

## Analytics Endpoints

### Track Event

```http
POST /api/analytics/track
```

**Headers:** Authorization required

**Request Body:**
```json
{
  "eventType": "video_play",
  "courseId": "course_id",
  "lessonId": "lesson_id",
  "duration": 120,
  "metadata": {
    "videoPosition": 45
  }
}
```

**Event Types:**
- `course_view` - User viewed course
- `course_enroll` - User enrolled in course
- `lesson_start` - Started a lesson
- `lesson_complete` - Completed a lesson
- `quiz_attempt` - Started quiz
- `quiz_complete` - Completed quiz
- `video_play` - Played video
- `video_pause` - Paused video
- `video_complete` - Completed video
- `certificate_earn` - Earned certificate
- `course_complete` - Completed course

### Get Platform Statistics (Admin Only)

```http
GET /api/analytics/platform?startDate=2025-01-01&endDate=2025-12-31
```

**Headers:** Authorization required (Admin role)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 1000,
      "totalCourses": 50,
      "totalEnrollments": 5000,
      "totalCertificates": 2000,
      "totalRevenue": 50000,
      "activeUsers": 500,
      "newUsers": 100
    },
    "popularCourses": [...],
    "userGrowth": [...]
  }
}
```

### Get Course Analytics (Trainer/Admin)

```http
GET /api/analytics/course/:courseId
```

**Headers:** Authorization required (Trainer/Admin)

**Response:**
```json
{
  "success": true,
  "data": {
    "enrollments": {
      "total": 500,
      "active": 400,
      "completed": 100,
      "averageProgress": 65.5
    },
    "engagement": [...],
    "completionTrend": [...],
    "demographics": [...]
  }
}
```

### Get User Analytics

```http
GET /api/analytics/user
```

**Headers:** Authorization required

---

## Forum Endpoints

### Get Forum Posts

```http
GET /api/forums?courseId=course_id&category=question&search=term&page=1&limit=20
```

**Query Parameters:**
- `courseId` (optional) - Filter by course
- `category` (optional) - Filter by category (general, question, discussion, announcement, help, feedback)
- `search` (optional) - Search term
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

### Get Single Forum Post

```http
GET /api/forums/:id
```

### Create Forum Post

```http
POST /api/forums
```

**Headers:** Authorization required

**Request Body:**
```json
{
  "title": "How to use this feature?",
  "content": "I need help with...",
  "courseId": "course_id",
  "lessonId": "lesson_id",
  "category": "question",
  "tags": ["help", "beginner"]
}
```

### Update Forum Post

```http
PUT /api/forums/:id
```

**Headers:** Authorization required

**Request Body:**
```json
{
  "title": "Updated title",
  "content": "Updated content",
  "category": "discussion"
}
```

### Delete Forum Post

```http
DELETE /api/forums/:id
```

**Headers:** Authorization required

### Add Reply

```http
POST /api/forums/:id/replies
```

**Headers:** Authorization required

**Request Body:**
```json
{
  "content": "This is my reply to the post"
}
```

### Like/Unlike Post

```http
POST /api/forums/:id/like
```

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "data": {
    "likes": 15,
    "isLiked": true
  }
}
```

### Mark Post as Resolved

```http
POST /api/forums/:id/resolve
```

**Headers:** Authorization required (Author/Trainer/Admin)

---

## Notification Endpoints

### Get Notifications

```http
GET /api/notifications?page=1&limit=20&unreadOnly=false
```

**Headers:** Authorization required

**Query Parameters:**
- `page` (optional) - Page number
- `limit` (optional) - Items per page
- `unreadOnly` (optional) - Show only unread (true/false)

**Response:**
```json
{
  "success": true,
  "count": 20,
  "total": 50,
  "unreadCount": 10,
  "totalPages": 3,
  "currentPage": 1,
  "data": [
    {
      "_id": "notification_id",
      "type": "course_completed",
      "title": {
        "en": "Congratulations!",
        "ar": "تهانينا!"
      },
      "message": {
        "en": "You completed the course",
        "ar": "لقد أكملت الدورة"
      },
      "link": "/courses/course_id",
      "isRead": false,
      "priority": "high",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### Mark Notification as Read

```http
PUT /api/notifications/:id/read
```

**Headers:** Authorization required

### Mark All as Read

```http
PUT /api/notifications/read-all
```

**Headers:** Authorization required

### Delete Notification

```http
DELETE /api/notifications/:id
```

**Headers:** Authorization required

### Delete All Read Notifications

```http
DELETE /api/notifications/read
```

**Headers:** Authorization required

### Create Notification (Admin Only)

```http
POST /api/notifications
```

**Headers:** Authorization required (Admin role)

**Request Body:**
```json
{
  "userId": "user_id",
  "type": "announcement",
  "title": {
    "en": "New Feature Released",
    "ar": "ميزة جديدة",
    "fr": "Nouvelle fonctionnalité"
  },
  "message": {
    "en": "Check out our new feature",
    "ar": "اطلع على ميزتنا الجديدة",
    "fr": "Découvrez notre nouvelle fonctionnalité"
  },
  "link": "/features/new",
  "priority": "high",
  "sendEmail": true,
  "sendPush": true
}
```

---

## Course Endpoints

### Get All Courses

```http
GET /api/courses?page=1&limit=10&category=programming&level=beginner
```

### Get Course by ID

```http
GET /api/courses/:id
```

### Create Course (Trainer/Admin)

```http
POST /api/courses
```

**Headers:** Authorization required

### Update Course (Trainer/Admin)

```http
PUT /api/courses/:id
```

**Headers:** Authorization required

### Delete Course (Admin)

```http
DELETE /api/courses/:id
```

**Headers:** Authorization required (Admin)

---

## Certificate Endpoints

### Get User Certificates

```http
GET /api/certificates
```

**Headers:** Authorization required

### Verify Certificate (Public)

```http
GET /api/verify/certificate/:certificateId
```

**Description:** Validates a certificate using its Certificate ID or by scanning the QR code (which contains the Certificate ID).

**Response (Valid Certificate):**
```json
{
  "success": true,
  "verified": true,
  "message": "Certificate is valid",
  "data": {
    "certificateId": "CERT-ABC123",
    "traineeName": "John Doe",
    "courseTitle": "Web Development",
    "certificateLevel": "A+",
    "status": "Valid",
    "duration": 40,
    "tutorName": "Jane Smith",
    "issuedBy": "GreenDye Academy",
    "verificationDate": "2025-10-11T12:34:56.789Z",
    "completionDate": "2025-01-01T00:00:00.000Z",
    "issueDate": "2025-01-01T00:00:00.000Z",
    "score": 95,
    "qrCode": "data:image/png;base64,..."
  }
}
```

**Response (Invalid/Revoked Certificate):**
```json
{
  "success": true,
  "verified": false,
  "message": "Certificate has been revoked. Reason: Academic misconduct",
  "data": {
    "certificateId": "CERT-ABC123",
    "traineeName": "John Doe",
    "courseTitle": "Web Development",
    "certificateLevel": "A+",
    "status": "Revoked",
    "duration": 40,
    "tutorName": "Jane Smith",
    "issuedBy": "GreenDye Academy",
    "verificationDate": "2025-10-11T12:34:56.789Z",
    "isRevoked": true,
    "revokedDate": "2025-10-10T00:00:00.000Z"
  }
}
```

**Response (Certificate Not Found):**
```json
{
  "success": false,
  "verified": false,
  "message": "Certificate not found"
}
```

---

## Trainer Endpoints

### Get All Trainers

```http
GET /api/trainers
```

### Get Trainer by ID

```http
GET /api/trainers/:id
```

### Verify Trainer (Public)

```http
GET /api/verify/trainer/:trainerId
```

---

## Enrollment Endpoints

### Enroll in Course

```http
POST /api/enrollments
```

**Headers:** Authorization required

**Request Body:**
```json
{
  "courseId": "course_id"
}
```

### Get User Enrollments

```http
GET /api/enrollments
```

**Headers:** Authorization required

### Update Progress

```http
PUT /api/enrollments/:id/progress
```

**Headers:** Authorization required

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per window per IP

Exceeded rate limit response:
```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

## Pagination

Paginated endpoints return:

```json
{
  "success": true,
  "count": 20,
  "total": 100,
  "totalPages": 5,
  "currentPage": 1,
  "data": [...]
}
```

## Multi-language Support

The API supports multiple languages. Set your preferred language:

**In Request Headers:**
```
Accept-Language: ar
```

**Supported Languages:**
- `en` - English (default)
- `ar` - Arabic
- `fr` - French

Content with multi-language support returns:
```json
{
  "title": {
    "en": "English Title",
    "ar": "العنوان بالعربية",
    "fr": "Titre en français"
  }
}
```

## WebSocket Events (Real-time)

Connect to: `ws://localhost:5000`

### Events

**Client → Server:**
- `join_course` - Join course room
- `leave_course` - Leave course room
- `message` - Send chat message

**Server → Client:**
- `notification` - New notification
- `message` - New chat message
- `course_update` - Course updated
- `user_online` - User came online

## Postman Collection

A Postman collection for easy API testing is coming soon. In the meantime, you can use the examples provided in this documentation with any HTTP client.

## SDK & Libraries

Coming soon:
- JavaScript SDK
- Python SDK
- Mobile SDK (React Native)

## Support

For API support:
- Documentation: https://docs.greendye-academy.com
- Email: api@greendye-academy.com
- Community Forum: https://forum.greendye-academy.com
