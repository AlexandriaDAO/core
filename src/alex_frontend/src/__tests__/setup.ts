// This file will be automatically imported by Jest before each test
import '@testing-library/jest-dom';

// Set up any global mocks or configurations needed for tests
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Add a dummy test to prevent Jest warning
describe('Setup', () => {
  it('should have proper test environment', () => {
    expect(true).toBe(true);
  });
}); 