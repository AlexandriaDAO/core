# Perpetua State Management

This directory contains the Redux state management code for the Perpetua app.

## Structure

The codebase has been refactored into a modular architecture for improved maintainability:

```
state/
├── thunks/                       # Thunks organized by functionality
│   ├── index.ts                  # Re-exports all thunks
│   ├── shelfThunks.ts            # Shelf operations (create, update metadata)
│   ├── itemThunks.ts             # Item operations (add, remove)
│   ├── queryThunks.ts            # Query operations (loadShelves, getShelfById)
│   ├── collaborationThunks.ts    # Editor operations (add/remove editors)
│   └── reorderThunks.ts          # Reordering operations
├── services/
│   └── perpetuaService.ts        # Centralized API service layer
├── cache/
│   └── ShelvesCache.ts           # Enhanced cache implementation with auto-cleanup
├── utils/
│   └── perpetuaUtils.ts          # Common utility functions
├── hooks/                        # React hooks for easier state consumption
│   ├── index.ts                  # Re-exports all hooks
│   ├── usePerpetuaSelectors.ts   # Selector hooks for state access
│   └── usePerpetuaActions.ts     # Action hooks for dispatching
├── perpetuaSlice.ts              # Redux slice
└── index.ts                      # Re-exports everything from the module
```

## Usage in Components

### Using the Hooks API (Recommended)

```tsx
import { usePerpetuaActions, useUserShelves, useShelfById } from '../state';

// In your component:
const PerpetuaComponent = () => {
  // Get state with selector hooks
  const shelves = useUserShelves();
  const selectedShelf = useShelfById('shelf-123');
  
  // Get all actions with action hooks
  const actions = usePerpetuaActions();
  
  const handleClick = () => {
    // Dispatch actions easily
    actions.loadShelves(principal);
    actions.selectShelf(shelveId);
  };
  
  return <div>...</div>;
};
```

### Using Direct Imports

```typescript
import { 
  loadShelves, 
  createShelf,
  addItem,
  getShelfById,
  // ...other imports
} from '../state';

// Then in your component with useDispatch
```

## Key Components

### 1. Service Layer

The `perpetuaService` provides a clean API abstraction for all backend interactions, handling:
- API calls to the Perpetua canister
- Consistent error handling and data conversion
- Type-safe result format

```typescript
import { perpetuaService } from '../state';

const result = await perpetuaService.getShelf(shelfId);
if ("Ok" in result && result.Ok) {
  // Handle success
} else {
  // Handle error
}
```

### 2. Caching Layer

The `ShelvesCache` provides an efficient caching mechanism for Perpetua data:
- Automatic cleanup of expired entries
- Type-safe data retrieval
- Smart invalidation with granular control (by principal, shelf ID, etc.)

### 3. React Hooks

Custom hooks make it easy to consume Perpetua state in React components:
- `useUserShelves()`, `useShelfById()`, etc. for accessing state
- `usePerpetuaActions()` for dispatching actions

## Advantages

1. **Separation of Concerns**: Each module has a clear, focused responsibility
2. **Improved Type Safety**: Consistent typing across the codebase
3. **Better Testability**: Smaller, focused modules are easier to test
4. **Performance Optimizations**: Efficient caching with automatic cleanup
5. **Developer Experience**: React hooks API provides an intuitive interface

## Migration from Legacy Code

If you were using imports from the old `perpetuaThunks.ts` file, you can now:

1. Use the hooks API (preferred approach)
2. Import from the main entry point: `import { loadShelves } from '../state'`
3. Import from specific modules: `import { loadShelves } from '../state/thunks/queryThunks'`

## Migration Guide

The refactoring maintains the same API but reorganizes code. To update imports in your components:

### Old way:

```typescript
import { 
  loadShelves, 
  createShelf,
  addItem,
  getShelfById,
  // ...other imports
} from '../state/perpetuaThunks';
```

### New way (Option 1 - import everything):

```typescript
import { 
  loadShelves, 
  createShelf,
  addItem,
  getShelfById,
  // ...other imports
} from '../state';
```

### New way (Option 2 - import specific categories):

```typescript
import { loadShelves, getShelfById } from '../state/thunks/queryThunks';
import { createShelf } from '../state/thunks/shelfThunks';
import { addItem } from '../state/thunks/itemThunks';
```

## Key Improvements

1. **Modular Organization**: Thunks are now organized by functionality
2. **Reduced File Size**: Each file is focused on a specific concern
3. **Better Error Handling**: Consistent approach to error handling
4. **Improved Caching**: Extracted cache logic to its own module
5. **Easier Maintenance**: Smaller, focused files are easier to update and test

## Cache Manager Access

If you need direct access to cache operations:

```typescript
import { cacheManager } from '../state';

// Examples
cacheManager.invalidateForShelf(shelfId);
cacheManager.get(principalId, 'userShelves');
``` 