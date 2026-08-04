# GreenDye Academy API Documentation

Base URL: `http://localhost:5000/api` (Development)

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication (`/api/auth`)

#### Register
- **POST** `/api/auth/register`
- Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "language": "en"
}
```

#### Login
- **POST** `/api/auth/login`
- Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
- **GET** `/api/auth/me`
- Headers: `Authorization: Bearer <token>`

### Courses (`/api/courses`)

#### Get All Courses
- **GET** `/api/courses?page=1&limit=10&category=technology`

#### Get Single Course
- **GET** `/api/courses/:id`

#### Create Course (Trainer/Admin)
- **POST** `/api/courses`
- Headers: `Authorization: Bearer <token>`
- Body:
```json
{
  "title": {
    "en": "Introduction to Web Development",
    "ar": "مقدمة في تطوير الويب",
    "fr": "Introduction au développement Web"
  },
  "description": {
    "en": "Learn web development basics",
    "ar": "تعلم أساسيات تطوير الويب",
    "fr": "Apprenez les bases du développement Web"
  },
  "category": "technology",
  "level": "beginner",
  "duration": 40,
  "price": 99
}
```

### Certificates (`/api/certificates`)

#### Get My Certificates
- **GET** `/api/certificates`
- Headers: `Authorization: Bearer <token>`

#### Generate Certificate (Admin/Trainer)
- **POST** `/api/certificates/generate`
- Headers: `Authorization: Bearer <token>`
- Body:
```json
{
  "userId": "user_id",
  "courseId": "course_id",
  "grade": "A",
  "score": 95
}
```

### Verification (`/api/verify`)

#### Verify Certificate
- **GET** `/api/verify/certificate/:certificateId`
- Public endpoint

#### Verify Trainer
- **GET** `/api/verify/trainer/:trainerId`
- Public endpoint

### Trainers (`/api/trainers`)

#### Get All Trainers
- **GET** `/api/trainers?page=1&limit=10`

#### Create Trainer Profile
- **POST** `/api/trainers`
- Headers: `Authorization: Bearer <token>`
- Body:
```json
{
  "title": {
    "en": "Senior Developer",
    "ar": "مطور أول",
    "fr": "Développeur Senior"
  },
  "expertise": ["Web Development", "Mobile Development"],
  "experience": 10
}
```

### Enrollments (`/api/enrollments`)

#### Enroll in Course
- **POST** `/api/enrollments/enroll`
- Headers: `Authorization: Bearer <token>`
- Body:
```json
{
  "courseId": "course_id"
}
```

#### Get My Courses
- **GET** `/api/enrollments/my-courses`
- Headers: `Authorization: Bearer <token>`

#### Update Progress
- **PUT** `/api/enrollments/:id/progress`
- Headers: `Authorization: Bearer <token>`
- Body:
```json
{
  "progress": 75
}
```

### Quizzes (`/api/quizzes`)

#### Get Course Quizzes
- **GET** `/api/quizzes?courseId=xxx`
- Headers: `Authorization: Bearer <token>`

#### Submit Quiz
- **POST** `/api/quizzes/:id/submit`
- Headers: `Authorization: Bearer <token>`
- Body:
```json
{
  "courseId": "course_id",
  "answers": ["answer1", "answer2", "answer3"]
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Rate Limiting

API requests are limited to 100 requests per 15 minutes per IP address.

## Pagination

List endpoints support pagination:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

Response includes:
```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "page": 1,
  "pages": 10,
  "data": [ ... ]
}
```

## Advanced Analytics (Admin Only)

### User Growth Trends
- **GET** `/api/analytics/user-growth?period=monthly&startDate=2023-01-01&endDate=2023-12-31`
- Headers: `Authorization: Bearer <token>` (Admin only)
- Query Parameters:
  - `period` - Time period: `hourly`, `daily`, `weekly`, `monthly` (default: `monthly`)
  - `startDate` - Start date (ISO format, optional)
  - `endDate` - End date (ISO format, optional)
- Response:
```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "growth": [
      {
        "_id": { "year": 2023, "month": 1 },
        "count": 50,
        "cumulative": 150,
        "students": 45,
        "trainers": 3,
        "admins": 2
      }
    ]
  }
}
```

### Revenue Trends
- **GET** `/api/analytics/revenue-trends?period=monthly&startDate=2023-01-01&endDate=2023-12-31`
- Headers: `Authorization: Bearer <token>` (Admin only)
- Query Parameters:
  - `period` - Time period: `daily`, `weekly`, `monthly` (default: `monthly`)
  - `startDate` - Start date (ISO format, optional)
  - `endDate` - End date (ISO format, optional)
- Response:
```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "trends": [
      {
        "_id": { "year": 2023, "month": 1 },
        "revenue": 5000.00,
        "transactions": 50,
        "avgTransactionValue": 100.00,
        "cumulativeRevenue": 5000.00,
        "uniqueUsers": 45
      }
    ]
  }
}
```

### Course Popularity Metrics
- **GET** `/api/analytics/course-popularity?limit=20&startDate=2023-01-01&endDate=2023-12-31`
- Headers: `Authorization: Bearer <token>` (Admin only)
- Query Parameters:
  - `limit` - Maximum number of courses to return (default: 20)
  - `startDate` - Start date (ISO format, optional)
  - `endDate` - End date (ISO format, optional)
- Response:
```json
{
  "success": true,
  "data": {
    "courseMetrics": [
      {
        "courseId": "course_id",
        "title": "Course Title",
        "totalEnrollments": 100,
        "completedEnrollments": 80,
        "activeEnrollments": 20,
        "avgProgress": 75.5,
        "completionRate": 80.0
      }
    ],
    "enrollmentTrends": [
      {
        "courseId": "course_id",
        "courseTitle": "Course Title",
        "year": 2023,
        "month": 1,
        "enrollments": 50
      }
    ]
  }
}
```

### Geographic Distribution
- **GET** `/api/analytics/geographic-distribution`
- Headers: `Authorization: Bearer <token>` (Admin only)
- Response:
```json
{
  "success": true,
  "data": {
    "userDistribution": [
      {
        "_id": "USA",
        "totalUsers": 500,
        "students": 450,
        "trainers": 45,
        "activeUsers": 475
      }
    ],
    "revenueDistribution": [
      {
        "_id": "USA",
        "totalRevenue": 50000.00,
        "transactions": 500,
        "avgTransactionValue": 100.00
      }
    ],
    "enrollmentDistribution": [
      {
        "_id": "USA",
        "totalEnrollments": 1000,
        "completedEnrollments": 800
      }
    ]
  }
}
```

### Peak Usage Times
- **GET** `/api/analytics/peak-usage-times?startDate=2023-01-01&endDate=2023-12-31`
- Headers: `Authorization: Bearer <token>` (Admin only)
- Query Parameters:
  - `startDate` - Start date (ISO format, optional)
  - `endDate` - End date (ISO format, optional)
- Response:
```json
{
  "success": true,
  "data": {
    "hourlyActivity": [
      {
        "hour": 14,
        "totalEvents": 5000,
        "uniqueUsers": 450
      }
    ],
    "dailyActivity": [
      {
        "dayOfWeek": 2,
        "dayName": "Monday",
        "totalEvents": 10000,
        "uniqueUsers": 1000
      }
    ],
    "eventTypeActivity": [
      {
        "_id": { "eventType": "lesson_complete", "hour": 14 },
        "count": 500
      }
    ]
  }
}
```

### Conversion Funnel
- **GET** `/api/analytics/conversion-funnel?startDate=2023-01-01&endDate=2023-12-31`
- Headers: `Authorization: Bearer <token>` (Admin only)
- Query Parameters:
  - `startDate` - Start date (ISO format, optional)
  - `endDate` - End date (ISO format, optional)
- Response:
```json
{
  "success": true,
  "data": {
    "funnel": [
      {
        "stage": "Visitors",
        "count": 10000,
        "percentage": 100,
        "dropOff": 0
      },
      {
        "stage": "Signups",
        "count": 5000,
        "percentage": 50.00,
        "dropOff": 50.00
      },
      {
        "stage": "Course Viewers",
        "count": 4000,
        "percentage": 80.00,
        "dropOff": 20.00
      },
      {
        "stage": "Enrollments",
        "count": 2000,
        "percentage": 50.00,
        "dropOff": 50.00
      },
      {
        "stage": "Active Learners",
        "count": 1500,
        "percentage": 75.00,
        "dropOff": 25.00
      },
      {
        "stage": "Course Completers",
        "count": 1000,
        "percentage": 66.67,
        "dropOff": 33.33
      },
      {
        "stage": "Certificate Earners",
        "count": 900,
        "percentage": 90.00,
        "dropOff": 10.00
      }
    ],
    "overallConversionRate": 9.00
  }
}
```
