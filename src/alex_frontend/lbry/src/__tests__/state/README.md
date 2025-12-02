# Perpetua Shelf Reordering Tests

This directory contains tests for the shelf reordering functionality in the Perpetua application. These tests help identify and fix issues with the reordering functionality, particularly focusing on the cases where UI reordering operations appear successful but revert when data refreshes from the backend.

## Test Files

1. `perpetuaThunks.test.ts` - Tests the Redux thunks, particularly `reorderProfileShelf` and `loadShelves`
2. `perpetuaSlice.test.ts` - Tests the Redux slice reducers and actions
3. `ShelfReordering.test.tsx` - Integration tests for the complete flow from UI to Redux to API

## Running the Tests

```bash
# Install test dependencies first
npm install --save-dev redux-mock-store

# Run all tests
npm test

# Run specific test files
npm test perpetuaThunks.test.ts
npm test perpetuaSlice.test.ts 
npm test ShelfReordering.test.tsx
```

## Issues Identified

Through these tests, we've identified several critical issues with the shelf reordering functionality:

### 1. Empty Parameters in API Calls

The `reorderProfileShelf` thunk is accepting a parameter called `newShelfOrder` for optimistic updates, but still passing empty `shelfId` and `referenceShelfId` values to the backend API. This is causing API calls to fail with empty parameters.

```typescript
// In ShelfLists.tsx:
await dispatch(reorderProfileShelf({
  shelfId: "", // Empty shelfId - This is the problem
  referenceShelfId: null,
  before: true,
  principal: identity.getPrincipal(),
  newShelfOrder // The full order is provided but not used for the API call
}));
```

### 2. Order Overwritten on Data Refresh

When fresh data is loaded from the backend via `loadShelves`, it completely overwrites the custom ordering in Redux, reverting to the backend's default order. Our tests verify this behavior:

```typescript
// perpetuaSlice.ts, loadShelves.fulfilled reducer:
.addCase(loadShelves.fulfilled, (state, action) => {
  const { entities, ids } = normalizeShelves(action.payload);
  
  // This blindly replaces ids without preserving custom order
  state.ids.userShelves = ids;
});
```

### 3. Incomplete Cache Invalidation

The cache invalidation strategy is not properly handling shelf reordering. The cache is invalidated for individual shelves but not for the complete shelf order:

```typescript
// In reorderProfileShelf thunk:
// Invalidation happens for individual shelves, but not for the collection
cacheManager.invalidateForPrincipal(principal);
if (referenceShelfId) {
  cacheManager.invalidateForShelf(referenceShelfId);
}
```

### 4. No Explicit Error Recovery

When reordering operations fail, there's no proper mechanism to revert the optimistic updates and notify the user of the failure:

```typescript
// Current error handling in the thunk:
if ("Err" in result) {
  // This conditional doesn't check if we did an optimistic update
  return rejectWithValue(result.Err);
}
```

## Solution Recommendations

Based on our test findings, we recommend the following solutions:

### 1. Fix Empty Parameter Handling in `reorderProfileShelf`

```typescript
export const reorderProfileShelf = createAsyncThunk(
  'perpetua/reorderProfileShelf',
  async ({ 
    shelfId, 
    referenceShelfId, 
    before,
    principal,
    newShelfOrder // New parameter for optimistic updates
  }: { 
    shelfId: string, 
    referenceShelfId: string | null, 
    before: boolean,
    principal: Principal | string,
    newShelfOrder?: string[] // Optional array for full reordering
  }, { dispatch, getState, rejectWithValue }) => {
    try {
      // Apply optimistic update if we have a newShelfOrder
      if (newShelfOrder) {
        dispatch(updateShelfOrder(newShelfOrder));
      }
      
      const perpetuaActor = await getActorPerpetua();
      const principalForApi = typeof principal === 'string'
        ? Principal.fromText(principal)
        : principal;
      
      // If newShelfOrder is provided but shelfId is empty, use the first item in newShelfOrder
      // This converts a full reordering into a single item reordering API call
      const effectiveShelfId = (!shelfId && newShelfOrder && newShelfOrder.length > 0) 
        ? newShelfOrder[0] 
        : shelfId;
      
      // If we have an effective shelfId, make the API call
      if (effectiveShelfId) {
        // Execute the reordering
        const result = await perpetuaActor.reorder_profile_shelf(
          effectiveShelfId,
          referenceShelfId ? [referenceShelfId] : [],
          before
        );
        
        if ("Ok" in result) {
          // Invalidate all relevant caches
          cacheManager.invalidateForPrincipal(principal);
          cacheManager.invalidateForShelf(effectiveShelfId);
          if (referenceShelfId) {
            cacheManager.invalidateForShelf(referenceShelfId);
          }
          
          // Force a reload of the shelves to get the correct order
          await dispatch(loadShelves(principalForApi));
          
          return { success: true };
        } else {
          // If API call failed and we did an optimistic update, reload to restore
          if (newShelfOrder) {
            await dispatch(loadShelves(principalForApi));
          }
          return rejectWithValue(result.Err);
        }
      } else {
        return rejectWithValue("Invalid shelf ID");
      }
    } catch (error) {
      // Always revert optimistic updates on error
      if (newShelfOrder && principal) {
        const principalForApi = typeof principal === 'string'
          ? Principal.fromText(principal)
          : principal;
        await dispatch(loadShelves(principalForApi));
      }
      
      let errorMessage = "Failed to reorder shelf";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);
```

### 2. Preserve Custom Order in `loadShelves.fulfilled` reducer

```typescript
.addCase(loadShelves.fulfilled, (state, action) => {
  const { entities, ids } = normalizeShelves(action.payload);
  
  // Update entities by merging new shelves
  state.entities.shelves = {
    ...state.entities.shelves,
    ...entities
  };
  
  // Check if we're loading the same set of shelves
  const sameShelvesSet = 
    ids.length === state.ids.userShelves.length && 
    ids.every(id => state.ids.userShelves.includes(id));
  
  // Only update order if we're loading a different set of shelves
  if (!sameShelvesSet) {
    state.ids.userShelves = ids;
  }
});
```

### 3. Improve Cache Management

Add specialized cache entries for shelf orders:

```typescript
// In ShelvesCache
// Add a special key format for user shelf order
private generateUserShelfOrderKey(principal: Principal | string): string {
  const normalizedId = this.normalizePrincipal(principal);
  return `userShelfOrder:${normalizedId}`;
}

// Invalidate user shelf order specifically
public invalidateUserShelfOrder(principal: Principal | string): void {
  const key = this.generateUserShelfOrderKey(principal);
  this.cache.delete(key);
}

// In reorderProfileShelf thunk:
// Explicitly invalidate user shelf order
cacheManager.invalidateUserShelfOrder(principal);
```

### 4. Enhanced Error Handling

```typescript
// In reorderProfileShelf thunk:
try {
  // Apply optimistic update
  if (newShelfOrder) {
    dispatch(updateShelfOrder(newShelfOrder));
  }
  
  // Make API call
  // ...
  
  if ("Err" in result) {
    // Always revert optimistic update on error
    if (newShelfOrder) {
      await dispatch(loadShelves(principalForApi));
    }
    
    // Add a more descriptive user-facing error
    dispatch(setError(`Failed to reorder shelf: ${result.Err}`));
    
    return rejectWithValue(result.Err);
  }
} catch (error) {
  // Always revert optimistic update on error
  if (newShelfOrder) {
    await dispatch(loadShelves(principalForApi));
  }
  
  // Add user-facing error
  dispatch(setError("An unexpected error occurred while reordering shelves."));
  
  return rejectWithValue("Failed to reorder shelf");
}
```

## Additional Recommendations

1. **Add Client-Side Shelf Order State**: Consider maintaining a separate client-side order state that can be preserved between API calls.

2. **Batch API Endpoint**: Implement a backend API endpoint that accepts a complete shelf order, rather than individual reordering operations.

3. **Error UI Feedback**: Add UI components to show when reordering fails and provide retry options.

## Testing Status

These tests demonstrate the issues with the current implementation and provide a framework for validating the fixes. Some tests are intentionally designed to fail with the current implementation to highlight where changes are needed.

After implementing the recommended fixes, run the tests again to verify that the fixes resolved the issues. 