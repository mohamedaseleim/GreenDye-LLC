# GreenDye Academy - Backend Tests

This directory contains all backend tests for the GreenDye Academy platform.

## Test Structure

```
__tests__/
├── models/              # Model unit tests
│   ├── User.test.js
│   ├── Course.test.js
│   └── Payment.test.js
├── integration/         # API integration tests
│   ├── auth.test.js
│   ├── courses.test.js
│   └── health.test.js
├── utils/              # Test utilities
│   └── testHelpers.js
└── setup.js            # Global test setup
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Specific Test File
```bash
npm test -- User.test.js
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests Without Coverage
```bash
npx jest --coverage=false
```

## Test Environment

Tests run in a separate test environment with:
- Test database: `mongodb://localhost:27017/greendye-test`
- Test JWT secret: `test-jwt-secret-key-for-testing`
- Node environment: `test`

### Setting Up Test Database

**Option 1: Local MongoDB**
```bash
# Start MongoDB locally
mongod

# Tests will automatically connect to local test database
npm test
```

**Option 2: MongoDB Atlas (Recommended for CI/CD)**
```bash
# Set environment variable
export MONGODB_TEST_URI="mongodb+srv://user:pass@cluster.mongodb.net/greendye-test"

# Run tests
npm test
```

**Option 3: In-Memory MongoDB (Fast, no setup required)**
```bash
# Install mongodb-memory-server
npm install --save-dev mongodb-memory-server

# Tests will use in-memory database automatically
```

## Test Coverage Goals

Current coverage thresholds (in jest.config.js):
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

## Writing New Tests

### Model Tests
Model tests verify schema validation and methods:

```javascript
const Model = require('../../models/Model');

describe('Model Name', () => {
  describe('Schema Validation', () => {
    it('should create with valid data', async () => {
      const data = { /* valid data */ };
      const doc = await Model.create(data);
      expect(doc).toBeDefined();
    });
  });
});
```

### Integration Tests
Integration tests verify API endpoints:

```javascript
const request = require('supertest');
const { app } = require('../../server');
const { createAuthenticatedUser } = require('../utils/testHelpers');

describe('API Endpoint', () => {
  it('should return data', async () => {
    const { token } = await createAuthenticatedUser();
    
    const response = await request(app)
      .get('/api/endpoint')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
      
    expect(response.body.success).toBe(true);
  });
});
```

## Test Utilities

### createTestUser(overrides)
Creates a test user with optional field overrides.

### createAuthenticatedUser(role)
Creates a user and returns both user object and JWT token.

### generateTestToken(userId, role)
Generates a JWT token for testing.

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Use afterEach to clean up test data
3. **Mocking**: Mock external services (payment gateways, email)
4. **Naming**: Use descriptive test names
5. **Assertions**: Test both success and failure cases

## Troubleshooting

### MongoDB Connection Issues
If tests fail with "Cannot connect to database":
- Ensure MongoDB is running
- Check MONGODB_TEST_URI environment variable
- Try using mongodb-memory-server for testing

### Port Already in Use
If you get "Port 5000 already in use":
- Tests create a new server instance
- Make sure no other servers are running on port 5000

### Timeout Errors
If tests timeout:
- Increase timeout in jest.config.js
- Check database connection speed
- Use `--forceExit` flag for cleanup issues

## CI/CD Integration

For GitHub Actions or other CI/CD:

```yaml
- name: Run Backend Tests
  run: |
    cd backend
    npm install
    npm test
  env:
    NODE_ENV: test
    MONGODB_TEST_URI: ${{ secrets.MONGODB_TEST_URI }}
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Testing Best Practices](https://www.mongodb.com/docs/manual/testing/)
