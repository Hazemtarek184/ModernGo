# Testing Guide for Modern Go Backend

## Overview

This project uses **Jest** as the testing framework with **TypeScript** support. Tests are organized into unit tests and integration tests, with an in-memory MongoDB database for isolated testing.

## Quick Start

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure

```
src/
├── __tests__/
│   ├── integration/          # API endpoint integration tests
│   │   ├── store.integration.test.ts
│   │   └── storeProduct.integration.test.ts
│   └── utils/                # Test utilities
│       ├── testDb.ts         # Database setup/teardown
│       └── testHelpers.ts    # Helper functions & factories
├── store/
│   └── __tests__/
│       └── Store-Service.test.ts    # Unit tests for Store service
└── store-product/
    └── __tests__/
        └── StoreProduct-Service.test.ts  # Unit tests for StoreProduct service
```

## Test Types

### Unit Tests

Unit tests focus on testing individual services and functions in isolation. They use the in-memory MongoDB database to avoid external dependencies.

**Location**: `src/<feature>/__tests__/*.test.ts`

**Example**:
```typescript
import { describe, expect, test, beforeAll, afterAll, beforeEach } from '@jest/globals';
import * as StoreService from '../../store/Store-Service';
import { connect, closeDatabase, clearDatabase } from '../utils/testDb';

describe('Store Service Unit Tests', () => {
    beforeAll(async () => {
        await connect();
    });

    afterAll(async () => {
        await closeDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    test('should create a new store', async () => {
        const storeData = {
            name: 'Test Store',
            // ... other fields
        };
        const store = await StoreService.createNewStore(storeData);
        expect(store.name).toBe('Test Store');
    });
});
```

### Integration Tests

Integration tests verify that API endpoints work correctly end-to-end, including routing, middleware, and database interactions.

**Location**: `src/__tests__/integration/*.integration.test.ts`

**Example**:
```typescript
import request from 'supertest';
import express from 'express';

describe('Store API Integration Tests', () => {
    test('should create a new store', async () => {
        const response = await request(app)
            .post('/api/stores')
            .send(storeData);
        
        expect(response.status).toBe(201);
        expect(response.body.name).toBe('Test Store');
    });
});
```

## Test Utilities

### Database Utilities (`testDb.ts`)

- **`connect()`**: Connects to in-memory MongoDB
- **`closeDatabase()`**: Closes connection and stops MongoDB server
- **`clearDatabase()`**: Clears all collections
- **`seedTestData.createStore(overrides)`**: Creates a test store
- **`seedTestData.createProduct(overrides)`**: Creates a test product
- **`seedTestData.createStoreProduct(storeId, productId, overrides)`**: Creates a store-product relationship

### Helper Utilities (`testHelpers.ts`)

- **`factories.storeData(overrides)`**: Generates store test data
- **`factories.productData(overrides)`**: Generates product test data
- **`factories.storeProductData(storeId, productId, overrides)`**: Generates store-product test data
- **`createObjectId(id?)`**: Creates a valid MongoDB ObjectId
- **`isValidObjectId(id)`**: Validates if a string is a valid ObjectId

## Writing New Tests

### 1. Unit Test Template

```typescript
import { describe, expect, test, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { connect, closeDatabase, clearDatabase, seedTestData } from '../utils/testDb';
import { factories } from '../utils/testHelpers';

describe('Your Service Unit Tests', () => {
    beforeAll(async () => {
        await connect();
    });

    afterAll(async () => {
        await closeDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    test('should do something', async () => {
        // Arrange
        const testData = factories.storeData();
        
        // Act
        const result = await yourFunction(testData);
        
        // Assert
        expect(result).toBeDefined();
    });
});
```

### 2. Integration Test Template

```typescript
import { describe, expect, test, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express, { Express } from 'express';
import { connect, closeDatabase, clearDatabase } from '../utils/testDb';

describe('Your API Integration Tests', () => {
    let app: Express;

    beforeAll(async () => {
        await connect();
        
        app = express();
        app.use(express.json());
        app.use('/api/your-route', yourRouter);
    });

    afterAll(async () => {
        await closeDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    test('should handle POST request', async () => {
        const response = await request(app)
            .post('/api/your-route')
            .send({ data: 'test' });
        
        expect(response.status).toBe(201);
    });
});
```

## Best Practices

### 1. Test Isolation
- Each test should be independent and not rely on other tests
- Use `beforeEach` to clear the database before each test
- Avoid shared mutable state between tests

### 2. Descriptive Test Names
```typescript
// ✅ Good
test('should return 404 when store does not exist')

// ❌ Bad
test('test store')
```

### 3. Arrange-Act-Assert Pattern
```typescript
test('should create a store', async () => {
    // Arrange - Set up test data
    const storeData = factories.storeData();
    
    // Act - Execute the function
    const result = await createNewStore(storeData);
    
    // Assert - Verify the result
    expect(result.name).toBe(storeData.name);
});
```

### 4. Test Edge Cases
- Test both success and failure scenarios
- Test with invalid data
- Test boundary conditions
- Test error handling

### 5. Use Factories for Test Data
```typescript
// ✅ Good - Use factories
const store = await seedTestData.createStore({ name: 'Custom Name' });

// ❌ Avoid - Manual object creation
const store = await storeModel.create({ 
    name: 'Test', 
    address: '123', 
    phone: '+20...', 
    // ... lots of fields
});
```

## Coverage Reports

After running `npm run test:coverage`, open the coverage report:

```
coverage/
├── lcov-report/
│   └── index.html    # Open this in a browser
└── lcov.info
```

The report shows:
- **Statements**: Percentage of statements executed
- **Branches**: Percentage of conditional branches tested
- **Functions**: Percentage of functions called
- **Lines**: Percentage of lines executed

### Coverage Goals
- **Services**: Aim for 80%+ coverage
- **Controllers**: Aim for 70%+ coverage
- **Utilities**: Aim for 90%+ coverage

## Troubleshooting

### Tests Timeout
If tests are timing out, increase the timeout in `jest.config.js`:
```javascript
testTimeout: 60000  // Increase to 60 seconds
```

### MongoDB Memory Server Issues
If you encounter issues with the in-memory MongoDB server:
1. Try increasing the timeout
2. Check if MongoDB binaries are downloaded (happens on first run)
3. Clear Jest cache: `npx jest --clearCache`

### Port Already in Use
The in-memory MongoDB uses a random port, so this shouldn't happen. If it does, close any running MongoDB instances.

### Type Errors
Make sure all TypeScript types are properly imported:
```typescript
import type { Store } from '../types/Store-Interface';
```

## Running Specific Tests

```bash
# Run tests for a specific file
npm test -- Store-Service.test

# Run tests matching a pattern
npm test -- --testNamePattern="should create"

# Run only Store-related tests
npm test -- Store

# Run only integration tests
npm test -- integration
```

## Continuous Integration

In CI/CD pipelines, run tests with:
```bash
npm test -- --ci --coverage --maxWorkers=2
```

This ensures:
- Tests run in CI mode (non-interactive)
- Coverage is collected
- Limited workers for better CI performance

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/ladjs/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Happy Testing! 🧪**
