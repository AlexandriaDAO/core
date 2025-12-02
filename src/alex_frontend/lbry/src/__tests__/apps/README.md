# Search Results Tests

This directory contains tests for verifying that the Permasearch and Alexandrian apps are returning all expected results on search operations.

## Test Files

- `searchResults.test.tsx`: Tests for search functionality in both apps, focusing on state changes rather than UI components

## Test Coverage

These tests verify:

1. **Basic Search Functionality**
   - Correct number of results returned
   - Correct content types in results
   - Pagination working correctly

2. **State Management**
   - Redux state is properly updated after search operations
   - Pagination updates state correctly
   - Different collection types (NFT/SBT) are handled correctly
   - Principal selection works properly

## Running the Tests

To run these tests:

```bash
# Run all tests
npm test

# Run only search results tests
npm test -- -t "Search Results"
```

## Mocking Strategy

These tests use Jest mocks to simulate the behavior of:

1. Arweave API client
2. NFT data fetching
3. Content service
4. ICRC7 canister calls (using `{ virtual: true }`)

The mocks are designed to provide deterministic and predictable results that can be verified in the tests.

## Testing Approach

The tests follow the approach used in the libraryState tests:

1. **Focus on State Testing**: Test the Redux state changes directly rather than through UI components
2. **Use Virtual Mocks**: Use `{ virtual: true }` for the ICRC7 canister mocks
3. **Test Thunks Directly**: Test the search thunks directly instead of through components
4. **Mock External Dependencies**: Don't use actual backend functions in unit tests

This approach makes the tests more reliable, faster, and easier to debug.

## Adding New Tests

When adding new tests, consider:

1. What edge cases are not covered?
2. Are there specific search parameters that need testing?
3. Are there performance concerns with large result sets?
4. Are there race conditions in pagination?

Follow the existing patterns for mocking and assertions when adding new tests. 