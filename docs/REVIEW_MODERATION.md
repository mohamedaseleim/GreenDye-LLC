# Review/Rating Moderation Feature Documentation

## Overview

The Review/Rating Moderation feature provides administrators with comprehensive tools to manage, moderate, and respond to course reviews submitted by students. This feature ensures that only appropriate, genuine reviews are displayed to potential students while maintaining a safe and trustworthy learning environment.

## Features

### 1. Review Management Dashboard

Access the review moderation interface through:
- **Admin Dashboard** → **Content Moderation** → **Course Reviews** tab

The dashboard displays:
- All course reviews with filtering options
- Review status indicators (pending, approved, rejected, flagged)
- User and course information
- Star ratings
- Review text content
- Date submitted

### 2. Review Status Types

Reviews can have one of four statuses:

#### Pending
- Default status for newly submitted reviews
- Reviews awaiting moderation
- Not visible to public users
- Displayed with a warning/yellow chip in the admin interface

#### Approved
- Reviews that have been verified and approved by administrators
- Visible to all users on course pages
- Contribute to course rating calculations
- Displayed with a success/green chip

#### Rejected
- Reviews deemed inappropriate or violating guidelines
- Not visible to public users
- Do not contribute to course ratings
- Require a rejection reason
- Displayed with an error/red chip

#### Flagged
- Reviews marked as potentially inappropriate
- Temporarily hidden from public view
- Awaiting further review or action
- Can be flagged with specific reasons (spam, inappropriate, offensive, fake, other)
- Displayed with an error/red chip

### 3. Moderation Actions

Administrators can perform the following actions on reviews:

#### Approve Review
- Makes the review visible to all users
- Includes the review in course rating calculations
- Records moderation action in history
- **Endpoint**: `PUT /api/admin/reviews/:id/approve`

#### Reject Review
- Hides the review from public view
- Excludes the review from rating calculations
- Requires a reason for rejection
- Records the rejection in moderation history
- **Endpoint**: `PUT /api/admin/reviews/:id/reject`

#### Flag Review
- Marks review as potentially inappropriate
- Hides from public view immediately
- Requires selection of flag reason:
  - Spam
  - Inappropriate Content
  - Offensive Language
  - Fake Review
  - Other
- Optional detailed description
- **Endpoint**: `PUT /api/admin/reviews/:id/flag`

#### Remove Review
- Permanently deletes the review
- Recalculates course ratings
- Optional reason for removal
- Cannot be undone
- **Endpoint**: `DELETE /api/admin/reviews/:id`

#### Respond to Review
- Add an official admin response to any review
- Response is displayed alongside the review
- Can update existing responses
- Helps address concerns or thank users
- **Endpoint**: `PUT /api/admin/reviews/:id/respond`

### 4. Filtering and Search

The review dashboard supports filtering by:
- **Status**: pending, approved, rejected, flagged
- **Course**: Filter reviews for specific courses
- **User**: Filter reviews by specific users
- **Date Range**: View reviews from specific time periods

### 5. Review Statistics

Access comprehensive review analytics:
- Total number of reviews
- Reviews by status (breakdown)
- Average rating of approved reviews
- Number of flagged reviews
- Number of pending reviews requiring attention
- Count of reviews with admin responses

**Endpoint**: `GET /api/admin/reviews/analytics/stats`

## API Reference

### Get All Reviews
```http
GET /api/admin/reviews
```

**Query Parameters:**
- `page` (number): Page number for pagination
- `limit` (number): Results per page (default: 20)
- `status` (string): Filter by status (pending, approved, rejected, flagged)
- `courseId` (string): Filter by specific course
- `userId` (string): Filter by specific user
- `sortBy` (string): Sort field (default: createdAt)
- `order` (string): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "count": 20,
  "totalCount": 150,
  "totalPages": 8,
  "currentPage": 1,
  "data": [
    {
      "_id": "review_id",
      "user": {
        "name": "Student Name",
        "email": "student@example.com",
        "avatar": "avatar_url"
      },
      "course": {
        "title": { "en": "Course Title" },
        "thumbnail": "thumbnail_url"
      },
      "rating": 4,
      "reviewText": "Great course!",
      "status": "pending",
      "isVisible": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Get Review Details
```http
GET /api/admin/reviews/:id
```

**Response:** Includes full review details with moderation history and flags.

### Approve Review
```http
PUT /api/admin/reviews/:id/approve
```

**Request Body:**
```json
{
  "reason": "Approved - meets content guidelines" // optional
}
```

### Reject Review
```http
PUT /api/admin/reviews/:id/reject
```

**Request Body:**
```json
{
  "reason": "Contains inappropriate language" // required
}
```

### Flag Review
```http
PUT /api/admin/reviews/:id/flag
```

**Request Body:**
```json
{
  "reason": "spam", // required: spam, inappropriate, offensive, fake, other
  "description": "This review appears to be automated spam" // optional
}
```

### Remove Review
```http
DELETE /api/admin/reviews/:id
```

**Request Body:**
```json
{
  "reason": "Violates terms of service" // optional
}
```

### Respond to Review
```http
PUT /api/admin/reviews/:id/respond
```

**Request Body:**
```json
{
  "response": "Thank you for your feedback! We're glad you enjoyed the course."
}
```

### Get Review Statistics
```http
GET /api/admin/reviews/analytics/stats
```

**Query Parameters:**
- `courseId` (string, optional): Get stats for specific course

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReviews": 500,
    "reviewsByStatus": [
      { "_id": "approved", "count": 450 },
      { "_id": "pending", "count": 30 },
      { "_id": "rejected", "count": 15 },
      { "_id": "flagged", "count": 5 }
    ],
    "avgRating": 4.2,
    "flaggedCount": 5,
    "pendingCount": 30,
    "responsesCount": 125
  }
}
```

## User Workflow

### For Students (Review Submission)

1. Student completes a course or makes significant progress
2. Student submits a review with rating and text
3. Review is automatically set to "pending" status
4. Student receives confirmation that review is under moderation
5. Once approved, review appears on course page

### For Administrators (Review Moderation)

1. Navigate to Admin Dashboard → Content Moderation → Course Reviews
2. View pending reviews (default filter)
3. Read review content and check user enrollment status
4. Take appropriate action:
   - **Approve** if review meets guidelines
   - **Reject** if review violates policies (with reason)
   - **Flag** if review needs further investigation
   - **Respond** to address concerns or thank the reviewer
5. Review automatically updates course rating when approved/rejected

## Database Schema

### Review Model

```javascript
{
  enrollment: ObjectId,      // Reference to enrollment
  user: ObjectId,           // Reference to user
  course: ObjectId,         // Reference to course
  rating: Number,           // 0-5 stars
  reviewText: String,       // Review content
  status: String,           // pending, approved, rejected, flagged
  flags: [{
    reason: String,         // spam, inappropriate, offensive, fake, other
    description: String,
    flaggedBy: ObjectId,
    flaggedAt: Date
  }],
  moderationHistory: [{
    action: String,         // approved, rejected, flagged, unflagged
    reason: String,
    moderatedBy: ObjectId,
    moderatedAt: Date
  }],
  adminResponse: {
    text: String,
    respondedBy: ObjectId,
    respondedAt: Date
  },
  isVisible: Boolean,       // Public visibility
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

1. **Authentication Required**: All endpoints require admin authentication
2. **Authorization**: Only users with admin role can access
3. **Input Sanitization**: All inputs are sanitized to prevent NoSQL injection
4. **Audit Trail**: All moderation actions are logged with timestamps and admin IDs
5. **XSS Protection**: Review text is properly escaped before display

## Best Practices

### For Administrators

1. **Review Regularly**: Check pending reviews daily to maintain user engagement
2. **Be Consistent**: Apply moderation guidelines uniformly
3. **Provide Reasons**: Always include clear reasons when rejecting reviews
4. **Respond Thoughtfully**: Use admin responses to build community trust
5. **Monitor Flags**: Pay special attention to flagged reviews
6. **Track Patterns**: Use analytics to identify problematic users or courses

### Moderation Guidelines

- **Approve** reviews that are:
  - Honest and constructive
  - Relevant to the course content
  - Free from inappropriate language
  - Based on actual course experience

- **Reject** reviews that contain:
  - Spam or promotional content
  - Offensive or abusive language
  - Personal attacks
  - Irrelevant information
  - False or misleading claims

- **Flag** reviews that:
  - Appear suspicious but need investigation
  - May violate guidelines but require second opinion
  - Come from accounts with suspicious activity patterns

## Integration with Existing Systems

### Course Rating Calculation

When a review is approved or rejected, the system automatically:
1. Recalculates the course's average rating
2. Updates the course's review count
3. Only includes approved reviews in calculations
4. Excludes pending, rejected, and flagged reviews

### Enrollment System

Reviews are linked to enrollments to ensure:
- Only enrolled students can review courses
- One review per enrollment
- Review updates are tracked in enrollment records

## Troubleshooting

### Reviews Not Appearing After Approval

1. Check if `isVisible` field is set to `true`
2. Verify course rating has been recalculated
3. Clear browser cache on frontend
4. Check network requests for errors

### Rating Calculation Issues

1. Verify only approved reviews are included
2. Check for database connection issues
3. Review logs for recalculation errors
4. Manually trigger recalculation if needed

### Permission Errors

1. Verify user has admin role
2. Check JWT token is valid and not expired
3. Review middleware authentication logs
4. Ensure proper headers are sent with requests

## Future Enhancements

Potential improvements for future versions:

1. **Automated Moderation**: ML-based content filtering
2. **User Reporting**: Allow users to report inappropriate reviews
3. **Bulk Actions**: Approve/reject multiple reviews at once
4. **Email Notifications**: Notify users when reviews are moderated
5. **Review Templates**: Pre-written responses for common scenarios
6. **Advanced Analytics**: Sentiment analysis, review quality metrics
7. **Review Guidelines**: Display guidelines to users before submission
8. **Appeal System**: Allow users to appeal rejected reviews

## Support

For issues or questions:
- Check backend logs: `backend/logs/`
- Review API responses for error messages
- Consult main API documentation: `docs/API_REFERENCE.md`
- Contact development team for technical support
