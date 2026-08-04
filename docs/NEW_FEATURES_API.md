# New Features API Documentation - Version 1.2.0

## Table of Contents
1. [Gamification API](#gamification-api)
2. [Recommendations API](#recommendations-api)
3. [Corporate Portal API](#corporate-portal-api)
4. [Advanced Search API](#advanced-search-api)
5. [LMS Integration API](#lms-integration-api)

---

## Gamification API

### Get All Badges
```http
GET /api/gamification/badges
```
**Access:** Public

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "badge_id",
      "name": {
        "en": "Course Master",
        "ar": "سيد الدورات",
        "fr": "Maître des cours"
      },
      "description": {
        "en": "Complete 10 courses"
      },
      "icon": "/uploads/badges/course-master.png",
      "criteria": {
        "type": "courses_completed",
        "threshold": 10
      },
      "points": 100,
      "rarity": "rare"
    }
  ]
}
```

### Get User Achievements
```http
GET /api/gamification/achievements
```
**Access:** Private (User must be authenticated)

### Check and Award Badges
```http
POST /api/gamification/check-badges
```
**Access:** Private

### Get Leaderboard
```http
GET /api/gamification/leaderboard?period=all_time&limit=100
```
**Access:** Public

**Query Parameters:**
- `period`: all_time, monthly, weekly (default: all_time)
- `limit`: Number of entries to return (default: 100)

**Response:**
```json
{
  "success": true,
  "period": "all_time",
  "count": 100,
  "data": [
    {
      "_id": "entry_id",
      "user": {
        "name": "John Doe",
        "avatar": "/uploads/avatars/user.jpg"
      },
      "points": 5000,
      "rank": 1,
      "level": 50,
      "coursesCompleted": 25,
      "streak": {
        "current": 30,
        "longest": 45
      }
    }
  ]
}
```

### Get User Stats
```http
GET /api/gamification/stats
```
**Access:** Private

---

## Recommendations API

### Get Personalized Recommendations
```http
GET /api/recommendations?limit=10&refresh=false
```
**Access:** Private

**Query Parameters:**
- `limit`: Number of recommendations (default: 10)
- `refresh`: Force regenerate recommendations (default: false)

**Response:**
```json
{
  "success": true,
  "cached": false,
  "count": 10,
  "data": [
    {
      "_id": "rec_id",
      "user": "user_id",
      "course": {
        "_id": "course_id",
        "title": {
          "en": "Advanced JavaScript"
        },
        "price": 49.99
      },
      "score": 85,
      "reasons": [
        {
          "type": "category_match",
          "weight": 0.3,
          "description": {
            "en": "Matches your interest in technology"
          }
        }
      ]
    }
  ]
}
```

### Get Trending Courses
```http
GET /api/recommendations/trending?limit=10
```
**Access:** Public

### Update User Preferences
```http
PUT /api/recommendations/preferences
```
**Access:** Private

**Body:**
```json
{
  "favoriteCategories": ["technology", "business"],
  "preferredLevel": "intermediate",
  "favoriteInstructors": ["instructor_id_1", "instructor_id_2"]
}
```

### Dismiss Recommendation
```http
PUT /api/recommendations/:id/dismiss
```
**Access:** Private

---

## Corporate Portal API

### Create Organization
```http
POST /api/corporate/organizations
```
**Access:** Private

**Body:**
```json
{
  "name": "TechCorp Solutions",
  "description": "Leading technology company",
  "industry": "technology",
  "size": "201-500",
  "contactInfo": {
    "email": "hr@techcorp.com",
    "phone": "+1234567890"
  }
}
```

### Get Organization
```http
GET /api/corporate/organizations/:id
```
**Access:** Private (Members and Admins)

### Add Member to Organization
```http
POST /api/corporate/organizations/:id/members
```
**Access:** Private (Organization Admin)

**Body:**
```json
{
  "userId": "user_id",
  "role": "member",
  "department": "Engineering"
}
```

### Create Team Enrollment
```http
POST /api/corporate/team-enrollments
```
**Access:** Private (Organization Admin/Manager)

**Body:**
```json
{
  "organizationId": "org_id",
  "courseId": "course_id",
  "memberIds": ["user_id_1", "user_id_2", "user_id_3"],
  "deadline": "2025-12-31T23:59:59.000Z"
}
```

### Get Team Enrollment Stats
```http
GET /api/corporate/team-enrollments/:id/stats
```
**Access:** Private

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMembers": 50,
    "enrolled": 10,
    "inProgress": 25,
    "completed": 12,
    "dropped": 3,
    "averageProgress": 65.5
  }
}
```

---

## Advanced Search API

### Search Courses
```http
GET /api/search?q=javascript&category=technology&level=intermediate&minPrice=0&maxPrice=100
```
**Access:** Public

**Query Parameters:**
- `q`: Search query
- `category`: Filter by category
- `level`: Filter by level (beginner, intermediate, advanced)
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `language`: Filter by language (can be array)
- `rating`: Minimum rating
- `sort`: Sort order (relevance, price_asc, price_desc, rating, newest, popular)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

### Get Search Suggestions
```http
GET /api/search/suggestions?q=java&limit=5
```
**Access:** Public

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "title": {"en": "JavaScript Fundamentals"},
      "slug": "javascript-fundamentals",
      "type": "course"
    }
  ]
}
```

### Get Popular Searches
```http
GET /api/search/popular?limit=10
```
**Access:** Public

### Get Search Filters
```http
GET /api/search/filters
```
**Access:** Public

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": ["technology", "business", "health"],
    "levels": ["beginner", "intermediate", "advanced"],
    "languages": ["en", "ar", "fr"],
    "priceRange": {
      "minPrice": 0,
      "maxPrice": 299
    }
  }
}
```

### Get Search History
```http
GET /api/search/history?limit=20
```
**Access:** Private

### Clear Search History
```http
DELETE /api/search/history
```
**Access:** Private

---

## LMS Integration API

### Create Integration
```http
POST /api/lms-integration
```
**Access:** Private (Admin only)

**Body:**
```json
{
  "name": "Moodle Integration",
  "type": "moodle",
  "organization": "org_id",
  "credentials": {
    "apiKey": "api_key",
    "baseUrl": "https://moodle.example.com",
    "token": "access_token"
  },
  "settings": {
    "syncInterval": 3600,
    "syncDirection": "bidirectional",
    "syncGrades": true,
    "syncProgress": true
  }
}
```

### Get All Integrations
```http
GET /api/lms-integration?organization=org_id&type=moodle&status=active
```
**Access:** Private (Admin only)

### Test Integration Connection
```http
POST /api/lms-integration/:id/test
```
**Access:** Private (Admin only)

**Response:**
```json
{
  "success": true,
  "message": "Connection test successful",
  "timestamp": "2025-10-11T10:30:00.000Z",
  "details": {
    "type": "moodle",
    "baseUrl": "https://moodle.example.com",
    "authenticated": true
  }
}
```

### Sync Data
```http
POST /api/lms-integration/:id/sync
```
**Access:** Private (Admin only)

**Body:**
```json
{
  "entityType": "course",
  "direction": "import"
}
```

**Entity Types:**
- `course`
- `user`
- `enrollment`
- `grade`
- `progress`

**Directions:**
- `import` - Import from external LMS
- `export` - Export to external LMS
- `bidirectional` - Two-way sync

### Get Sync Logs
```http
GET /api/lms-integration/:id/logs?limit=20&status=success&entityType=course
```
**Access:** Private (Admin only)

### Upload SCORM Package
```http
POST /api/lms-integration/scorm
```
**Access:** Private (Trainer/Admin)

**Body:**
```json
{
  "courseId": "course_id",
  "version": "2004",
  "manifest": "<?xml version='1.0'?>...",
  "packageUrl": "https://cdn.example.com/scorm/package.zip",
  "size": 25600000,
  "resources": [
    {
      "identifier": "resource_1",
      "type": "webcontent",
      "href": "index.html"
    }
  ]
}
```

### Get SCORM Package
```http
GET /api/lms-integration/scorm/:courseId
```
**Access:** Private

### Export Course Data
```http
GET /api/lms-integration/export/course/:id
```
**Access:** Private (Admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "course_id",
    "title": {"en": "Course Title"},
    "description": {"en": "Course description"},
    "category": "technology",
    "level": "intermediate",
    "instructor": {...},
    "lessons": [...],
    "exportedAt": "2025-10-11T10:30:00.000Z"
  }
}
```

---

## Error Responses

All endpoints follow the same error response format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication

Most endpoints require authentication using JWT Bearer token:

```http
Authorization: Bearer your_jwt_token_here
```

To get a token, use the login endpoint:
```http
POST /api/auth/login
```

For detailed authentication documentation, see [API.md](API.md).
