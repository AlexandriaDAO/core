// Re-export everything from the state module

// Export all thunks
export * from './thunks';

// Export hooks for component usage
export * from './hooks';

// Export the cache manager
export { cacheManager } from './cache/ShelvesCache';

// Export service layer
export { perpetuaService } from './services/perpetuaService';

// Export utils
export * from './utils/perpetuaUtils';

// Export slice, reducer, actions and selectors
export {
  default as perpetuaReducer,
  // Actions
  setSelectedShelf,
  setUserPrincipal,
  setContentPermission,
  setShelfEditors,
  setEditorsLoading,
  clearPermissions,
  clearError,
  updateSingleShelf,
  updateShelfOrder,
  // Selectors
  selectUserShelves,
  selectPublicShelves,
  selectShelfById,
  selectSelectedShelf,
  selectLastTimestamp,
  selectLoading,
  selectPublicLoading,
  selectError,
  selectUserPrincipal,
  selectPermissions,
  selectShelfEditors,
  selectEditorsLoading,
  selectIsOwner,
  selectHasEditAccess,
} from './perpetuaSlice';

// Export types from perpetuaSlice
export type { PerpetuaState, NormalizedShelf, ContentPermissions } from './perpetuaSlice'; 