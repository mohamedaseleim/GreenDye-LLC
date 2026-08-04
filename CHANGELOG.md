# Changelog

All notable changes to the GreenDye Academy project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-10-11

### Added

#### React Native Mobile App
- **Native Mobile Application**
  - Complete React Native mobile app implementation
  - User authentication (Login/Register)
  - Home screen with personalized recommendations
  - Course browsing and search
  - My Learning dashboard with progress tracking
  - Profile screen with gamification stats
  - Native navigation with bottom tabs
  - Offline token storage with AsyncStorage
  - API integration layer with Axios
- **Mobile App Screens**
  - LoginScreen - User authentication
  - RegisterScreen - Account creation
  - HomeScreen - Dashboard with recommendations
  - CoursesScreen - Browse and search courses
  - MyLearningScreen - Track enrolled courses
  - ProfileScreen - User stats and achievements
- **Dependencies**: React Native 0.72, React Navigation 6, AsyncStorage, Vector Icons

#### AI-Powered Course Recommendations
- **Recommendation Engine**
  - Collaborative filtering algorithm
  - Multi-factor scoring system (category match, level match, popularity, instructor match)
  - Personalized course suggestions based on user history
  - Trending courses detection
  - Recommendation caching for performance
- **User Preferences**
  - Favorite categories tracking
  - Preferred learning level
  - Favorite instructors
  - Dismissed recommendations tracking
  - Interaction score calculation
- **Models**: Recommendation and UserPreference models
- **Controllers**: Complete recommendation controller with AI logic
- **Routes**: RESTful recommendation API endpoints

#### Gamification Features
- **Badge System**
  - Multi-language badge names and descriptions
  - Badge criteria (courses completed, points earned, streak days, etc.)
  - Rarity levels (common, rare, epic, legendary)
  - Points reward system
  - Automatic badge awarding based on achievements
- **Leaderboard System**
  - Global and periodic leaderboards (all-time, monthly, weekly)
  - Points tracking and ranking
  - Streak tracking (current and longest)
  - Level calculation based on points
  - Course completion tracking
- **User Achievements**
  - Personal achievement tracking
  - Progress monitoring for badges
  - Achievement history
- **Models**: Badge, UserAchievement, LeaderboardEntry models
- **Controllers**: Complete gamification controller
- **Routes**: Gamification API endpoints

#### Corporate Portal
- **Organization Management**
  - Create and manage organizations
  - Organization profiles with industry and size
  - Subscription plans (basic, professional, enterprise)
  - Member limits and status tracking
  - Custom branding settings
- **Team Management**
  - Add/remove members
  - Role assignment (admin, manager, member)
  - Department organization
  - Member status tracking
- **Team Enrollments**
  - Bulk course enrollment for teams
  - Team progress tracking
  - Deadline management
  - Purchase information tracking
  - Team statistics and reporting
- **Models**: Organization and TeamEnrollment models
- **Controllers**: Complete corporate controller
- **Routes**: Corporate portal API endpoints

#### Advanced Search
- **Search Functionality**
  - Multi-language text search
  - Advanced filtering (category, level, price range, rating, language)
  - Multiple sort options (relevance, price, rating, date, popularity)
  - Pagination support
  - Search suggestions/autocomplete
  - Popular searches tracking
- **Search History**
  - User search history tracking
  - Search analytics
  - Clear history functionality
- **Search Index**
  - Course indexing system
  - Keyword extraction
  - Metadata storage
  - Popularity tracking
- **Search Filters**
  - Dynamic filter generation
  - Available categories and levels
  - Price range calculation
  - Language options
- **Models**: SearchIndex and SearchHistory models
- **Controllers**: Complete search controller
- **Routes**: Advanced search API endpoints

#### External LMS Integration
- **LMS Connectors**
  - Support for Moodle, Canvas, Blackboard
  - SCORM 1.2 and 2004 support
  - xAPI (Tin Can) structure
  - Custom LMS integration
- **Integration Features**
  - Bidirectional sync (import/export)
  - Configurable sync intervals
  - Field mapping customization
  - Connection testing
  - Sync status tracking
- **Data Sync**
  - Course data sync
  - User data sync
  - Enrollment sync
  - Grade sync
  - Progress tracking sync
- **SCORM Package Management**
  - Upload SCORM packages
  - Manifest parsing
  - Resource management
  - Course association
- **Sync Logging**
  - Detailed sync logs
  - Error tracking
  - Performance metrics
  - Audit trail
- **Models**: ExternalLMS, DataSyncLog, SCORMPackage models
- **Controllers**: Complete LMS integration controller
- **Routes**: LMS integration API endpoints

### Changed
- Updated API version to 1.2.0
- Enhanced server.js with new route integrations
- Updated mobile-app README with React Native documentation

### Documentation
- Created NEW_FEATURES_API.md with comprehensive API documentation
- Updated mobile-app README with installation and usage instructions
- Added React Native project structure documentation

---

## [1.1.0] - 2025-10-11

### Added

#### Payment System
- **Multiple Payment Gateways Integration**
  - Stripe integration for international payments
  - PayPal integration for international payments
  - Fawry integration for Egypt market
  - Paymob integration for Egypt and MENA region
- **Payment Features**
  - Multi-currency support (USD, EUR, EGP, SAR, NGN)
  - Secure checkout process
  - Payment verification and webhooks
  - Automatic invoice generation
  - Payment history tracking
  - Refund request system with policy-based calculations
  - Transaction logging and audit trail
- **Models**: Payment model with comprehensive fields
- **Controllers**: Complete payment controller with all operations
- **Routes**: RESTful payment API endpoints
- **Documentation**: Comprehensive payment integration guide

#### Analytics Dashboard
- **Event Tracking System**
  - Track user activities (course views, lesson completions, video playback)
  - Device and browser detection
  - Geographic tracking (IP-based)
  - Duration and score tracking
- **Platform Statistics** (Admin)
  - Total users, courses, enrollments, certificates
  - Revenue tracking and reporting
  - Active user metrics
  - User growth trends
  - Popular courses analytics
- **Course Analytics** (Trainer/Admin)
  - Enrollment statistics
  - Completion rates and trends
  - Student engagement metrics
  - Geographic demographics
  - Average progress tracking
- **User Learning Analytics**
  - Personal learning dashboard
  - Learning time tracking
  - Quiz performance metrics
  - Learning streak calculation
  - Recent activity history
- **Models**: Analytics model with event tracking
- **Controllers**: Complete analytics controller
- **Routes**: Analytics API endpoints

#### Forum & Discussion System
- **Forum Post Management**
  - Create, read, update, delete forum posts
  - Multiple post categories (general, question, discussion, announcement, help, feedback)
  - Post tagging system
  - View count tracking
  - Pin important posts
  - Close posts to prevent replies
- **Reply System**
  - Nested replies to forum posts
  - Reply editing capability
  - Reply timestamps
- **Interaction Features**
  - Like/unlike posts
  - Like/unlike replies
  - Mark questions as resolved
  - Course-specific forums
  - Lesson-specific discussions
- **Search & Filter**
  - Search posts by title and content
  - Filter by course
  - Filter by category
  - Pagination support
- **Models**: Forum model with replies schema
- **Controllers**: Complete forum controller
- **Routes**: Forum API endpoints

#### Notification System
- **Notification Types**
  - Course-related (enrollment, updates, new lessons)
  - Assessment-related (quiz results)
  - Achievement-related (certificates, course completion)
  - Payment-related (success, failed)
  - Forum-related (replies, mentions)
  - System announcements
  - Reminders and promotions
- **Delivery Channels**
  - In-app notifications
  - Email notifications (SMTP integration)
  - Push notifications (PWA ready)
- **Notification Features**
  - Multi-language support (en, ar, fr)
  - Priority levels (low, medium, high, urgent)
  - Read/unread status
  - Notification linking
  - Bulk operations (mark all as read, delete all read)
  - Automatic expiration (90 days TTL)
- **Email Templates**
  - HTML email templates
  - Multi-language email content
  - Professional email formatting
- **Models**: Notification model with multi-language
- **Controllers**: Complete notification controller
- **Routes**: Notification API endpoints

#### Documentation
- **API Reference** (`docs/API_REFERENCE.md`)
  - Complete API endpoint documentation
  - Request/response examples
  - Authentication details
  - Error codes and handling
  - Rate limiting information
  - Pagination details
  - Multi-language support
  - WebSocket events
- **Payment Integration Guide** (`docs/PAYMENT_INTEGRATION.md`)
  - Step-by-step integration for each gateway
  - Configuration instructions
  - Webhook setup
  - Testing guidelines
  - Security best practices
  - Currency conversion
  - Refund policy implementation
- **User Guide** (`docs/USER_GUIDE.md`)
  - Getting started guide
  - Course enrollment and payment
  - Learning dashboard usage
  - Forum participation
  - Notification management
  - Certificate handling
  - Mobile app installation
  - Multi-language switching
  - FAQ section

### Enhanced

#### Environment Configuration
- Updated `.env.example` with new payment gateway variables
- Added SMTP configuration for notifications
- Organized environment variables by category
- Added helpful comments

#### README Documentation
- Updated roadmap with completed features
- Added new features to feature list
- Updated API endpoints section
- Added links to new documentation
- Enhanced multi-currency support information

#### Security
- Payment transaction logging
- Secure webhook verification
- Rate limiting on payment endpoints
- Input validation for all new endpoints
- XSS protection for user-generated content

### Technical Details

#### New Models
1. **Payment** - Complete payment tracking with gateway responses
2. **Analytics** - Event tracking with metadata
3. **Forum** - Posts with nested replies
4. **Notification** - Multi-language notifications with TTL

#### New Controllers
1. **paymentController** - Checkout, verify, refund, invoice operations
2. **analyticsController** - Event tracking, platform stats, course analytics
3. **forumController** - Post management, replies, likes, resolution
4. **notificationController** - Create, read, update, delete notifications

#### New Routes
1. **paymentRoutes** - RESTful payment endpoints
2. **analyticsRoutes** - Analytics and reporting endpoints
3. **forumRoutes** - Forum discussion endpoints
4. **notificationRoutes** - Notification management endpoints

#### Dependencies (No new dependencies added)
All features implemented using existing dependencies:
- Express.js for routing
- Mongoose for database
- Nodemailer for emails (already included)
- Built-in crypto for security

### Database Changes

#### New Collections
- `payments` - Payment records
- `analytics` - Event tracking data
- `forumposts` - Forum discussions
- `notifications` - User notifications

#### Indexes Added
- Payment: user, course, status, transactionId, createdAt
- Analytics: user, course, eventType, timestamp
- Forum: course, author, category, isPinned, lastActivityAt
- Notification: user, isRead, expiresAt (TTL)

### Security Enhancements
- Payment webhook signature verification
- User authorization checks for all operations
- Input validation and sanitization
- Rate limiting protection
- SQL injection prevention
- XSS protection

### Performance Improvements
- Database indexing for fast queries
- Pagination for large datasets
- Efficient aggregation pipelines
- Optimized query patterns

## [1.0.0] - 2025-01-01

### Initial Release

#### Core Features
- Multi-language support (Arabic, English, French)
- User authentication and authorization
- Course management system
- Certificate generation and verification
- Trainer verification system
- Learning Management System (LMS)
- Progressive Web App (PWA)
- Docker containerization
- Responsive design
- Real-time features with Socket.io

#### User Roles
- Student
- Trainer
- Admin

#### LMS Features
- Course creation and management
- Lesson management (Video, Text, Quiz, Assignment, Live)
- Progress tracking
- Quiz and assessment system
- Enrollment system

#### Technical Stack
- Backend: Node.js, Express.js, MongoDB
- Frontend: React.js, Material-UI
- Deployment: Docker, Nginx
- Control Panel: Hestia v1.9.4 compatible

---

## Upcoming Features

### Version 1.2.0 (Planned)
- [ ] React Native mobile app
- [ ] Corporate portal with team management
- [ ] Advanced search with Elasticsearch
- [ ] AI-powered course recommendations
- [ ] Gamification (badges, leaderboards)
- [ ] Video conferencing integration (Zoom/Teams)
- [ ] Assignment submission and grading
- [ ] Course prerequisites and learning paths

### Version 1.3.0 (Planned)
- [ ] Social learning features
- [ ] Live streaming capabilities
- [ ] Advanced analytics dashboard
- [ ] Multi-tenant support
- [ ] API marketplace
- [ ] Mobile offline learning
- [ ] Blockchain certificate verification

---

## Migration Guide

### From 1.0.0 to 1.1.0

#### Database Migration
No database migration required. New collections will be created automatically when features are used.

#### Environment Variables
Add new payment gateway variables to your `.env` file:

```bash
# Copy from .env.example
STRIPE_SECRET_KEY=
STRIPE_PUBLIC_KEY=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
FAWRY_MERCHANT_CODE=
FAWRY_SECURITY_KEY=
PAYMOB_API_KEY=
PAYMOB_INTEGRATION_ID=
```

#### Code Changes
No breaking changes. All existing APIs remain functional.

#### New Dependencies
No new npm packages required for core functionality.

---

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/mohamedaseleim/GreenDye/issues
- Email: support@greendye-academy.com
- Documentation: [docs/](docs/)

---

[1.1.0]: https://github.com/mohamedaseleim/GreenDye/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/mohamedaseleim/GreenDye/releases/tag/v1.0.0
