import { jest } from '@jest/globals';

/**
 * Global Jest setup file
 * Runs before all tests
 */

// Set longer timeout for database operations
jest.setTimeout(30000);

// Suppress console logs during tests (optional - uncomment if needed)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };

// Add any global test utilities or mocks here
