# GreenDye Academy - Testing Guide

This document provides comprehensive information about testing the GreenDye Academy platform.

## Overview

The project includes:
- ✅ Backend unit tests (models)
- ✅ Backend integration tests (API endpoints)
- ✅ Frontend component tests setup
- ✅ Test utilities and helpers
- ✅ Coverage reporting
- ✅ Continuous testing workflows

## Test Coverage Status

### Backend Tests (✅ Complete)

**Models (3 test files)**
- ✅ User model validation and methods
- ✅ Course model validation and constraints
- ✅ Payment model validation and currencies

**Integration (3 test files)**
- ✅ Authentication endpoints (register, login, profile)
- ✅ Course CRUD operations
- ✅ Health check and API documentation endpoints

**Coverage:** 50% minimum threshold for all metrics

### Frontend Tests (✅ Setup Complete)

**Component Tests**
- ✅ App component rendering
- ✅ Test utilities with providers
- ✅ Mock contexts (Auth, Language)

---

## Running Tests

### Backend

```bash
cd backend

# Install dependencies (first time only)
npm install

# Run all tests with coverage
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run specific test file
npm test -- User.test.js

# Run tests without coverage (faster)
npx jest --coverage=false

# Run tests matching pattern
npm test -- --testPathPattern=integration
```

### Frontend

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- App.test.js
```

---

## Test Environment Setup

### Database Configuration

Tests use a separate test database to avoid affecting development data.

**Option 1: Local MongoDB (Recommended for Development)**

```bash
# Start MongoDB locally
mongod

# Tests automatically connect to:
# mongodb://localhost:27017/greendye-test
```

**Option 2: MongoDB Atlas (Recommended for CI/CD)**

```bash
# Set environment variable
export MONGODB_TEST_URI="mongodb+srv://username:password@cluster.mongodb.net/greendye-test"

# Or create backend/.env.test
echo 'MONGODB_TEST_URI=mongodb+srv://...' > backend/.env.test
```

**Option 3: In-Memory Database (Fastest, No Setup)**

```bash
cd backend
npm install --save-dev mongodb-memory-server

# Tests will automatically use in-memory database
# No MongoDB installation required!
```

### Environment Variables

Test environment uses these defaults:
```env
NODE_ENV=test
JWT_SECRET=test-jwt-secret-key-for-testing
JWT_EXPIRE=1h
MONGODB_URI=mongodb://localhost:27017/greendye-test
FRONTEND_URL=http://localhost:3000
```

---

## Test Structure

### Backend Tests

```
backend/__tests__/
├── models/                 # Model unit tests
│   ├── User.test.js       # User schema & methods
│   ├── Course.test.js     # Course validation
│   └── Payment.test.js    # Payment model
├── integration/           # API integration tests
│   ├── auth.test.js       # Authentication APIs
│   ├── courses.test.js    # Course CRUD APIs
│   └── health.test.js     # Health checks
├── utils/                 # Test utilities
│   └── testHelpers.js     # Auth helpers
├── setup.js              # Global setup
└── README.md             # Detailed test docs
```

### Frontend Tests

```
frontend/src/__tests__/
├── components/           # Component tests
├── pages/               # Page tests
├── utils/               # Test utilities
│   └── testUtils.js     # Custom render with providers
└── App.test.js          # Main app test
```

---

## Writing New Tests

### Model Test Example

```javascript
const Model = require('../../models/Model');

describe('Model Name', () => {
  describe('Schema Validation', () => {
    it('should create with valid data', async () => {
      const data = {
        field1: 'value1',
        field2: 'value2'
      };
      
      const doc = await Model.create(data);
      
      expect(doc).toBeDefined();
      expect(doc.field1).toBe(data.field1);
    });
    
    it('should fail without required field', async () => {
      const data = { field2: 'value2' };
      await expect(Model.create(data)).rejects.toThrow();
    });
  });
});
```

### Integration Test Example

```javascript
const request = require('supertest');
const { app } = require('../../server');
const { createAuthenticatedUser } = require('../utils/testHelpers');

describe('API Endpoint', () => {
  it('should require authentication', async () => {
    const response = await request(app)
      .get('/api/protected')
      .expect(401);
      
    expect(response.body.success).toBe(false);
  });
  
  it('should return data when authenticated', async () => {
    const { token } = await createAuthenticatedUser();
    
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
      
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });
});
```

### Component Test Example

```javascript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Component from '../Component';

describe('Component', () => {
  it('renders with props', () => {
    render(<Component title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
  
  it('handles user interaction', () => {
    const handleClick = jest.fn();
    render(<Component onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

---

## Test Utilities

### Backend Helpers

**createTestUser(overrides)**
```javascript
const user = await createTestUser({
  role: 'trainer',
  email: 'custom@example.com'
});
```

**createAuthenticatedUser(role)**
```javascript
const { user, token } = await createAuthenticatedUser('admin');
// Use token in Authorization header
```

**generateTestToken(userId, role)**
```javascript
const token = generateTestToken(user._id, 'student');
```

### Frontend Helpers

**Custom Render with Providers**
```javascript
import { render } from './__tests__/utils/testUtils';

const { getByText } = render(<Component />, {
  authValue: { user: mockUser },
  languageValue: { language: 'ar' }
});
```

---

## Coverage Reports

### Viewing Coverage

After running `npm test`, coverage reports are generated in:
- `backend/coverage/` - Backend coverage
- `frontend/coverage/` - Frontend coverage

Open `coverage/lcov-report/index.html` in a browser to view detailed coverage.

### Coverage Thresholds

**Backend** (jest.config.js):
```javascript
coverageThreshold: {
  global: {
    branches: 50,
    functions: 50,
    lines: 50,
    statements: 50
  }
}
```

Tests will fail if coverage drops below thresholds.

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd backend && npm install
      
      - name: Run tests
        run: cd backend && npm test
        env:
          NODE_ENV: test
          MONGODB_TEST_URI: ${{ secrets.MONGODB_TEST_URI }}
  
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd frontend && npm install
      
      - name: Run tests
        run: cd frontend && npm test -- --watchAll=false
```

---

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Don't rely on test execution order
- Clean up data after each test (using `afterEach`)

### 2. Descriptive Names
```javascript
// Good ✅
it('should return 401 when token is invalid')

// Bad ❌
it('test auth')
```

### 3. Test Both Success and Failure
```javascript
describe('User Registration', () => {
  it('should register with valid data', async () => { /* ... */ });
  it('should fail with invalid email', async () => { /* ... */ });
  it('should fail with duplicate email', async () => { /* ... */ });
});
```

### 4. Mock External Services
```javascript
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: '123' })
  }))
}));
```

### 5. Use Factories for Test Data
```javascript
const createCourseData = (overrides = {}) => ({
  title: { en: 'Test Course' },
  description: { en: 'Description' },
  instructor: testUser._id,
  category: 'programming',
  ...overrides
});
```

---

## Troubleshooting

### MongoDB Connection Errors

**Problem:** Tests fail with "Cannot connect to database"

**Solutions:**
1. Ensure MongoDB is running: `mongod`
2. Check connection string in environment variables
3. Use mongodb-memory-server: `npm install --save-dev mongodb-memory-server`
4. Verify network connectivity for Atlas

### Port Already in Use

**Problem:** "Port 5000 is already in use"

**Solutions:**
1. Stop any running backend servers
2. Kill processes using the port: `lsof -ti:5000 | xargs kill`
3. Tests create their own server instance automatically

### Test Timeout

**Problem:** Tests timeout after 5 seconds

**Solutions:**
1. Increase timeout in jest.config.js:
   ```javascript
   testTimeout: 30000 // 30 seconds
   ```
2. Add `--forceExit` flag: `npm test -- --forceExit`
3. Check for hanging promises or connections

### Module Not Found

**Problem:** Cannot find module 'supertest' or other dependencies

**Solutions:**
1. Install dependencies: `npm install`
2. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
3. Check package.json for correct dependencies

---

## Additional Testing Tools (Future)

Consider adding these tools for enhanced testing:

### End-to-End Testing
- **Cypress**: Browser-based E2E testing
- **Playwright**: Modern E2E automation
- **Puppeteer**: Headless Chrome testing

### Load Testing
- **Artillery**: Modern load testing toolkit
- **k6**: Developer-centric load testing
- **Apache JMeter**: Comprehensive load testing

### API Testing
- **Postman/Newman**: API testing automation
- **Insomnia**: REST client with testing

### Code Quality
- **ESLint**: Code linting
- **SonarQube**: Code quality analysis
- **Codecov**: Coverage reporting

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [React Testing Library](https://testing-library.com/react)
- [MongoDB Testing Best Practices](https://www.mongodb.com/docs/manual/testing/)
- [Backend Tests README](backend/__tests__/README.md)

---

## Summary

✅ **What's Tested:**
- User authentication and authorization
- Course CRUD operations
- Payment model validation
- API health checks
- Model schema validation

✅ **Test Infrastructure:**
- Jest test runner
- Supertest for API testing
- React Testing Library for components
- Test helpers and utilities
- Coverage reporting

📝 **Next Steps:**
- Add more integration tests for remaining APIs
- Add E2E tests with Cypress
- Set up CI/CD pipeline
- Configure automated coverage reporting
- Add load testing for production readiness
