// Import jest-dom extensions
import '@testing-library/jest-dom';

// Mock global objects that might not be available in the test environment
global.fetch = jest.fn();

// Add TextEncoder and TextDecoder polyfills for @dfinity/agent
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
}); 