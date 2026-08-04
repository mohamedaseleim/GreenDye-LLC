# Quick Start Guide - New Features (v1.2.0)

This guide provides quick examples for using the new features added in version 1.2.0.

---

## Table of Contents
1. [AI-Powered Recommendations](#ai-powered-recommendations)
2. [Gamification](#gamification)
3. [Corporate Portal](#corporate-portal)
4. [Advanced Search](#advanced-search)
5. [LMS Integration](#lms-integration)
6. [Mobile App](#mobile-app)

---

## AI-Powered Recommendations

### Get Personalized Recommendations

```bash
curl -X GET \
  'http://localhost:5000/api/recommendations?limit=10' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Get Trending Courses

```bash
curl -X GET \
  'http://localhost:5000/api/recommendations/trending?limit=5'
```

### Update User Preferences

```bash
curl -X PUT \
  'http://localhost:5000/api/recommendations/preferences' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "favoriteCategories": ["technology", "business"],
    "preferredLevel": "intermediate"
  }'
```

---

## Gamification

### View All Available Badges

```bash
curl -X GET \
  'http://localhost:5000/api/gamification/badges'
```

### Get Your Achievements

```bash
curl -X GET \
  'http://localhost:5000/api/gamification/achievements' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Check and Award New Badges

```bash
curl -X POST \
  'http://localhost:5000/api/gamification/check-badges' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### View Leaderboard

```bash
# All-time leaderboard
curl -X GET \
  'http://localhost:5000/api/gamification/leaderboard?period=all_time&limit=100'

# Weekly leaderboard
curl -X GET \
  'http://localhost:5000/api/gamification/leaderboard?period=weekly&limit=50'
```

### Get Your Stats

```bash
curl -X GET \
  'http://localhost:5000/api/gamification/stats' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Award Points (Automated)

```bash
curl -X POST \
  'http://localhost:5000/api/gamification/points' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "points": 50,
    "action": "completed_lesson"
  }'
```

---

## Corporate Portal

### Create an Organization

```bash
curl -X POST \
  'http://localhost:5000/api/corporate/organizations' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "TechCorp Solutions",
    "description": "Leading technology company",
    "industry": "technology",
    "size": "201-500",
    "contactInfo": {
      "email": "hr@techcorp.com",
      "phone": "+1234567890"
    }
  }'
```

### Add Member to Organization

```bash
curl -X POST \
  'http://localhost:5000/api/corporate/organizations/ORG_ID/members' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "userId": "USER_ID",
    "role": "member",
    "department": "Engineering"
  }'
```

### Create Team Enrollment

```bash
curl -X POST \
  'http://localhost:5000/api/corporate/team-enrollments' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "organizationId": "ORG_ID",
    "courseId": "COURSE_ID",
    "memberIds": ["USER_ID_1", "USER_ID_2", "USER_ID_3"],
    "deadline": "2025-12-31T23:59:59.000Z"
  }'
```

### Get Team Enrollment Stats

```bash
curl -X GET \
  'http://localhost:5000/api/corporate/team-enrollments/ENROLLMENT_ID/stats' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## Advanced Search

### Search Courses with Filters

```bash
curl -X GET \
  'http://localhost:5000/api/search?q=javascript&category=technology&level=intermediate&minPrice=0&maxPrice=100&sort=rating'
```

### Get Search Suggestions

```bash
curl -X GET \
  'http://localhost:5000/api/search/suggestions?q=java&limit=5'
```

### Get Popular Searches

```bash
curl -X GET \
  'http://localhost:5000/api/search/popular?limit=10'
```

### Get Available Filters

```bash
curl -X GET \
  'http://localhost:5000/api/search/filters'
```

### Get Your Search History

```bash
curl -X GET \
  'http://localhost:5000/api/search/history?limit=20' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## LMS Integration

### Create Integration (Admin)

```bash
curl -X POST \
  'http://localhost:5000/api/lms-integration' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Moodle Integration",
    "type": "moodle",
    "credentials": {
      "apiKey": "your_api_key",
      "baseUrl": "https://moodle.example.com",
      "token": "your_token"
    },
    "settings": {
      "syncInterval": 3600,
      "syncDirection": "bidirectional",
      "syncGrades": true
    }
  }'
```

### Test Connection

```bash
curl -X POST \
  'http://localhost:5000/api/lms-integration/INTEGRATION_ID/test' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Sync Data

```bash
curl -X POST \
  'http://localhost:5000/api/lms-integration/INTEGRATION_ID/sync' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "entityType": "course",
    "direction": "import"
  }'
```

### Upload SCORM Package

```bash
curl -X POST \
  'http://localhost:5000/api/lms-integration/scorm' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "courseId": "COURSE_ID",
    "version": "2004",
    "manifest": "<?xml version=\"1.0\"?>...",
    "packageUrl": "https://cdn.example.com/scorm/package.zip",
    "size": 25600000
  }'
```

---

## Mobile App

### Installation

```bash
# Clone repository
git clone https://github.com/mohamedaseleim/GreenDye.git
cd GreenDye/mobile-app

# Install dependencies
npm install

# iOS: Install pods
cd ios && pod install && cd ..

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Key Features

1. **Login/Register**: Full authentication flow
2. **Home**: View recommendations and stats
3. **Courses**: Browse and search courses
4. **My Learning**: Track progress
5. **Profile**: View achievements and badges

---

## Integration Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

// Get recommendations
async function getRecommendations(token) {
  const response = await axios.get(
    'http://localhost:5000/api/recommendations',
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
}

// Search courses
async function searchCourses(query, filters = {}) {
  const response = await axios.get(
    'http://localhost:5000/api/search',
    {
      params: { q: query, ...filters }
    }
  );
  return response.data;
}

// Get leaderboard
async function getLeaderboard(period = 'all_time') {
  const response = await axios.get(
    `http://localhost:5000/api/gamification/leaderboard?period=${period}`
  );
  return response.data;
}
```

### React/React Native

```javascript
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function RecommendationsComponent() {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const token = localStorage.getItem('token'); // or AsyncStorage
      const response = await axios.get(
        'http://localhost:5000/api/recommendations',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setRecommendations(response.data.data);
    };

    fetchRecommendations();
  }, []);

  return (
    <div>
      {recommendations.map(rec => (
        <div key={rec._id}>
          <h3>{rec.course.title.en}</h3>
          <p>Match: {rec.score}%</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Common Use Cases

### 1. Student Learning Path

```javascript
// 1. Get personalized recommendations
GET /api/recommendations

// 2. Search for specific topics
GET /api/search?q=react&level=beginner

// 3. Enroll in course
POST /api/enrollments/enroll

// 4. Track progress
PUT /api/enrollments/:id/progress

// 5. Earn points and badges
POST /api/gamification/check-badges

// 6. View leaderboard position
GET /api/gamification/leaderboard
```

### 2. Corporate Training Program

```javascript
// 1. Create organization
POST /api/corporate/organizations

// 2. Add team members
POST /api/corporate/organizations/:id/members

// 3. Bulk enroll in course
POST /api/corporate/team-enrollments

// 4. Monitor team progress
GET /api/corporate/team-enrollments/:id/stats
```

### 3. LMS Migration

```javascript
// 1. Set up integration
POST /api/lms-integration

// 2. Test connection
POST /api/lms-integration/:id/test

// 3. Import courses
POST /api/lms-integration/:id/sync

// 4. Monitor sync logs
GET /api/lms-integration/:id/logs
```

---

## Tips and Best Practices

### Recommendations
- Refresh recommendations weekly for best results
- Update user preferences after completing courses
- Track recommendation clicks for better accuracy

### Gamification
- Check for new badges after completing milestones
- Encourage daily activity to maintain learning streaks
- Use leaderboards to motivate learners

### Corporate Portal
- Set realistic deadlines for team enrollments
- Monitor team progress regularly
- Use department grouping for better organization

### Search
- Use filters to narrow down results
- Save popular searches for quick access
- Review search history to understand user behavior

### LMS Integration
- Test connections regularly
- Schedule syncs during off-peak hours
- Monitor sync logs for errors

---

## Troubleshooting

### Authorization Errors
```bash
# Make sure to include Bearer token
-H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### CORS Issues
```bash
# Backend should allow your frontend origin
# Check backend/server.js CORS configuration
```

### Mobile App Connection
```bash
# iOS: use localhost
# Android Emulator: use 10.0.2.2
# Physical Device: use computer's IP address
```

---

## Next Steps

1. Read full API documentation: [NEW_FEATURES_API.md](./NEW_FEATURES_API.md)
2. Set up mobile app: [MOBILE_APP_SETUP.md](./MOBILE_APP_SETUP.md)
3. Review implementation details: [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md)
4. Check changelog: [CHANGELOG.md](../CHANGELOG.md)

---

**Version:** 1.2.0  
**Last Updated:** 2025-10-11
