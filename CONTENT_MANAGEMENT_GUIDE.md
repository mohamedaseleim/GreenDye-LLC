# Admin Dashboard Content Management System

## Overview

This feature implements a comprehensive admin dashboard tool that allows administrators to dynamically update content for the Home, About, and Contact pages through a user-friendly interface. The content is stored in MongoDB and served through REST APIs, enabling real-time updates without code deployments.

## Features

### 1. Backend API

#### Content Settings Model (`backend/models/ContentSettings.js`)
Stores all dynamic content with multi-language support (English, Arabic, French):

- **Home Page Content:**
  - Hero title and subtitle (multi-language)
  - Features list with customizable icons, titles, and descriptions

- **About Page Content:**
  - Mission statement (multi-language)
  - Vision statement (multi-language)
  - Features list with customizable icons, titles, and descriptions

- **Contact Page Content:**
  - Email address
  - Phone number
  - Physical address
  - Office hours (multi-language)
  - Social media links (Facebook, Twitter, LinkedIn, Instagram, YouTube)

#### API Endpoints

**Public Endpoint:**
- `GET /api/admin/content-settings/public` - Publicly accessible, returns all content settings

**Admin-Only Endpoints** (require authentication and admin role):
- `GET /api/admin/content-settings` - Get all content settings
- `PUT /api/admin/content-settings/home` - Update home page content
- `PUT /api/admin/content-settings/about` - Update about page content
- `PUT /api/admin/content-settings/contact` - Update contact page content

#### Controllers (`backend/controllers/contentSettingsController.js`)
Handles CRUD operations with:
- Singleton pattern (only one ContentSettings document)
- Automatic creation of default settings if none exist
- Validation and error handling
- Activity logging for audit trails

### 2. Frontend Admin Interface

#### Admin Content Settings Page (`frontend/src/pages/AdminContentSettings.js`)

A comprehensive admin interface featuring:

**Multi-Tab Layout:**
1. **Home Page Tab:**
   - Multi-language input fields for hero title and subtitle
   - Features management with add/remove capabilities
   - Icon picker with preview (Material-UI icons)
   - Title and description fields for each feature

2. **About Page Tab:**
   - Multi-language text areas for mission statement
   - Multi-language text areas for vision statement
   - Features management with add/remove capabilities
   - Icon picker with preview

3. **Contact Page Tab:**
   - Contact information fields (email, phone, address)
   - Multi-language office hours
   - Social media URL inputs for all major platforms
   - URL validation

**UI Features:**
- Material-UI design system
- Language tabs (EN/AR/FR) for multi-language content
- Icon picker with live preview
- Form validation
- Save/Refresh buttons
- Loading states
- Success/Error toast notifications
- Responsive design

### 3. Dynamic Page Content

The Home, About, and Contact pages have been updated to fetch and display content from the API:

#### Home Page (`frontend/src/pages/Home.js`)
- Fetches content on component mount
- Displays hero title/subtitle based on current language
- Renders features dynamically from API
- Falls back to default content if API fails
- Shows loading state during data fetch

#### About Page (`frontend/src/pages/About.js`)
- Fetches content on component mount
- Displays mission/vision based on current language
- Renders features dynamically with icons
- Falls back to default content if API fails
- Shows loading state during data fetch

#### Contact Page (`frontend/src/pages/Contact.js`)
- Fetches contact information from API
- Displays office hours based on current language
- Shows social media links if configured
- Falls back to default content if API fails
- Shows loading state during data fetch

### 4. Navigation Integration

The Content Settings page has been integrated into the admin dashboard:

- Added "Content Settings" tab to Admin Dashboard
- Added route in App.js: `/admin/content-settings`
- Protected with AdminRoute component (admin-only access)
- Accessible from the main admin navigation

## Installation & Setup

### 1. Initialize Content Settings

Run the initialization script to create default content settings:

```bash
cd backend
node scripts/initializeContentSettings.js
```

This script:
- Checks if content settings already exist
- Creates default settings with multi-language content
- Populates default features for all pages
- Sets up default contact information
- Configures default social media placeholders

### 2. Environment Variables

No additional environment variables are required. The feature uses the existing:
- `JWT_SECRET` - For authentication
- `MONGODB_URI` - For database connection
- `FRONTEND_URL` - For CORS configuration

## Usage Guide

### For Administrators:

1. **Access the Admin Panel:**
   - Log in as an admin user
   - Navigate to `/admin/dashboard`
   - Click on the "Content Settings" tab

2. **Update Home Page:**
   - Click on the "Home Page" tab
   - Select language tab (EN/AR/FR)
   - Update hero title and subtitle
   - Manage features (add/edit/remove)
   - Select icons from the dropdown
   - Click "Save Changes"

3. **Update About Page:**
   - Click on the "About Page" tab
   - Select language tab (EN/AR/FR)
   - Update mission and vision statements
   - Manage features (add/edit/remove)
   - Click "Save Changes"

4. **Update Contact Page:**
   - Click on the "Contact Page" tab
   - Update contact information
   - Update office hours for each language
   - Add/update social media URLs
   - Click "Save Changes"

### For Developers:

#### Adding New Icons:

Edit `frontend/src/pages/AdminContentSettings.js`:

```javascript
const availableIcons = [
  'School',
  'Verified',
  'Language',
  // Add new icon names here
  'NewIconName',
];
```

#### Extending the Model:

Edit `backend/models/ContentSettings.js` to add new fields:

```javascript
contentSettingsSchema = new mongoose.Schema({
  // Existing fields...
  newPage: {
    newField: {
      en: { type: String, default: 'Default value' },
      ar: { type: String, default: 'القيمة الافتراضية' },
      fr: { type: String, default: 'Valeur par défaut' },
    },
  },
});
```

#### Creating New Endpoints:

Add controller method in `backend/controllers/contentSettingsController.js`:

```javascript
exports.updateNewContent = async (req, res) => {
  try {
    // Implementation
  } catch (error) {
    // Error handling
  }
};
```

Add route in `backend/routes/contentSettingsRoutes.js`:

```javascript
router.put('/new', updateNewContent);
```

## API Examples

### Get Content Settings (Public)

```bash
curl -X GET http://localhost:5000/api/admin/content-settings/public
```

Response:
```json
{
  "success": true,
  "data": {
    "homePage": {
      "heroTitle": {
        "en": "Welcome to GreenDye Academy",
        "ar": "مرحبًا بك في أكاديمية GreenDye",
        "fr": "Bienvenue à l'Académie GreenDye"
      },
      "features": [...]
    },
    "aboutPage": {...},
    "contactPage": {...},
    "socialMedia": {...}
  }
}
```

### Update Home Page Content (Admin Only)

```bash
curl -X PUT http://localhost:5000/api/admin/content-settings/home \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "heroTitle": {
      "en": "New Title",
      "ar": "عنوان جديد",
      "fr": "Nouveau titre"
    },
    "heroSubtitle": {
      "en": "New Subtitle",
      "ar": "عنوان فرعي جديد",
      "fr": "Nouveau sous-titre"
    },
    "features": [
      {
        "icon": "School",
        "title": "Feature Title",
        "description": "Feature description"
      }
    ]
  }'
```

## Testing

### Backend Tests

Run the content settings test suite:

```bash
cd backend
npm test -- contentSettings.test.js
```

Tests cover:
- Public endpoint access
- Authentication requirements
- Authorization checks
- CRUD operations for all content types
- Multi-language support
- Default content creation

### Manual Testing Checklist

- [ ] Can access admin content settings page as admin
- [ ] Cannot access as non-admin user
- [ ] Can update home page content in all languages
- [ ] Can add/remove features on home page
- [ ] Can update about page content in all languages
- [ ] Can update contact page information
- [ ] Can add social media links
- [ ] Changes reflect immediately on public pages
- [ ] Language switching works correctly
- [ ] Icons display correctly
- [ ] Form validation works
- [ ] Success/error notifications appear
- [ ] Loading states display correctly

## Security Considerations

1. **Authentication:** All admin endpoints require valid JWT token
2. **Authorization:** Only users with 'admin' role can access settings
3. **Input Validation:** All inputs are validated before saving
4. **XSS Prevention:** User input is sanitized (express-mongo-sanitize, xss-clean)
5. **Rate Limiting:** API endpoints are rate-limited
6. **Audit Logging:** All changes are logged with user ID and timestamp

## Troubleshooting

### Common Issues:

1. **"Not authorized" error:**
   - Ensure you're logged in as an admin user
   - Check if JWT token is valid
   - Verify user role is 'admin'

2. **Content not updating:**
   - Check browser console for errors
   - Verify API endpoint is accessible
   - Check network tab for failed requests
   - Ensure MongoDB is running

3. **Icons not displaying:**
   - Verify icon name is correct (case-sensitive)
   - Check that icon is imported in Material-UI
   - Add icon to availableIcons array if new

4. **Language content not showing:**
   - Ensure language code matches (en/ar/fr)
   - Check if content exists for selected language
   - Verify i18n is configured correctly

## Future Enhancements

Potential improvements:
- Rich text editor for mission/vision statements
- Image upload for page backgrounds
- Preview mode before saving
- Version history and rollback
- Bulk import/export of content
- Content scheduling (publish at specific time)
- A/B testing support
- Analytics integration
- SEO metadata management

## License

This feature is part of the GreenDye Academy platform and follows the same license as the main project.
