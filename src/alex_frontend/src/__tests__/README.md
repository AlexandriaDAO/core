# UI/UX Testing with Jest

This directory contains UI/UX tests for the Alexandria frontend components using Jest and React Testing Library.

## Running Tests

You can run the tests using the following npm scripts:

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

The tests are organized as follows:

- `__tests__/components/`: Tests for UI components
- `__tests__/setup.ts`: Global test setup and mocks

## Writing Tests

### Basic Component Test

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import YourComponent from '../../components/YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Testing User Interactions

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import YourComponent from '../../components/YourComponent';

describe('YourComponent', () => {
  it('handles user interaction', async () => {
    const handleClick = jest.fn();
    render(<YourComponent onClick={handleClick} />);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Mocking Dependencies

If your component has dependencies that need to be mocked, you can use Jest's mocking capabilities:

```tsx
jest.mock('@/lib/utils', () => ({
  someFunction: jest.fn().mockReturnValue('mocked value'),
}));
```

## Common Testing Patterns

1. **Rendering Tests**: Verify that components render correctly
2. **User Interaction Tests**: Test click handlers, form submissions, etc.
3. **State Change Tests**: Verify that component state changes correctly
4. **Conditional Rendering Tests**: Test that components render differently based on props

## Useful Testing Library Queries

- `getByText`: Find an element by its text content
- `getByRole`: Find an element by its ARIA role
- `getByTestId`: Find an element by its `data-testid` attribute
- `queryByText`: Like `getByText`, but returns null instead of throwing an error
- `findByText`: Async version of `getByText` that waits for the element to appear 