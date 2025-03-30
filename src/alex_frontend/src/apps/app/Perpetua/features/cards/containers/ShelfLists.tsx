import React, { useCallback, useMemo } from 'react';
import { useIdentity } from '@/hooks/useIdentity';
import isEqual from 'lodash/isEqual';
import { Shelf } from '@/../../declarations/perpetua/perpetua.did';
import { BaseShelfList } from '../components/BaseShelfList';
import { LibraryShelvesUIProps, ExploreShelvesUIProps, UserShelvesUIProps } from '../types/types';
import { useDispatch } from 'react-redux';
import { reorderProfileShelf } from '@/apps/app/Perpetua/state/perpetuaThunks';
import { AppDispatch } from '@/store';

// Custom props comparison for React.memo to prevent unnecessary renders
const areShelvesPropsEqual = (prevProps: UserShelvesUIProps, nextProps: UserShelvesUIProps): boolean => {
  // Basic props comparison
  if (prevProps.loading !== nextProps.loading || 
      prevProps.isCurrentUser !== nextProps.isCurrentUser) {
    return false;
  }
  
  // Function equality - consider them equal since we can't reliably compare functions
  // We assume parent components are memoizing their callbacks properly
  
  // Deep comparison of shelves - only care about IDs and basic metadata
  if (prevProps.shelves.length !== nextProps.shelves.length) {
    return false;
  }
  
  return isEqual(
    prevProps.shelves.map(s => ({ 
      id: s.shelf_id, 
      title: s.title,
      owner: s.owner.toString() 
    })),
    nextProps.shelves.map(s => ({ 
      id: s.shelf_id, 
      title: s.title,
      owner: s.owner.toString()
    }))
  );
};

// Unified shelves view - simple version without search/filtering
interface UnifiedShelvesUIProps {
  allShelves: Shelf[]; // Combined shelves
  personalShelves: Shelf[]; // Personal shelves for determining ownership
  loading: boolean;
  onNewShelf: () => void;
  onViewShelf: (shelfId: string) => void;
  onViewOwner: (ownerId: string) => void;
  onLoadMore: () => Promise<void>;
  checkEditAccess: (shelfId: string) => boolean;
}

// Unified Shelves UI Component that shows all shelves
export const UnifiedShelvesUI: React.FC<UnifiedShelvesUIProps> = React.memo(({
  allShelves,
  personalShelves,
  loading,
  onNewShelf,
  onViewShelf,
  onViewOwner,
  onLoadMore,
  checkEditAccess
}) => {
  const shelfIds = useMemo(() => 
    personalShelves.map(shelf => shelf.shelf_id), 
    [personalShelves]
  );

  return (
    <BaseShelfList
      shelves={allShelves}
      title="Shelves"
      emptyStateMessage="No shelves found."
      loading={loading}
      isCurrentUserProfile={false}
      onViewShelf={onViewShelf}
      onViewOwner={onViewOwner}
      onNewShelf={onNewShelf}
      onLoadMore={onLoadMore}
      checkEditAccess={checkEditAccess}
    />
  );
});
UnifiedShelvesUI.displayName = 'UnifiedShelvesUI';

// Library Shelves UI Component
export const LibraryShelvesUI: React.FC<LibraryShelvesUIProps> = React.memo(({
  shelves,
  loading,
  onNewShelf,
  onViewShelf
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { identity } = useIdentity();
  
  const handleSaveOrder = useCallback(async (newShelfOrder: string[]) => {
    if (!identity) return;
    
    // Since we can't easily determine reference shelf ID and before flag from
    // just the new order array, we'll let the thunk handle the ordering with
    // the complete new order array for optimistic updates
    await dispatch(reorderProfileShelf({
      shelfId: "", // These will be ignored when newShelfOrder is provided
      referenceShelfId: null,
      before: true,
      principal: identity.getPrincipal(),
      newShelfOrder
    }));
  }, [dispatch, identity]);

  return (
    <BaseShelfList
      shelves={shelves}
      title="My Shelves"
      emptyStateMessage="You don't have any shelves yet."
      loading={loading}
      isCurrentUserProfile={true}
      allowReordering={true}
      onViewShelf={onViewShelf}
      onNewShelf={onNewShelf}
      onSaveOrder={handleSaveOrder}
    />
  );
});
LibraryShelvesUI.displayName = 'LibraryShelvesUI';

// Explore Shelves UI Component
export const ExploreShelvesUI: React.FC<ExploreShelvesUIProps> = React.memo(({
  shelves,
  loading,
  onViewShelf,
  onLoadMore
}) => {
  return (
    <BaseShelfList
      shelves={shelves}
      title="Explore Public Shelves"
      emptyStateMessage="No public shelves found."
      loading={loading}
      onViewShelf={onViewShelf}
      onLoadMore={onLoadMore}
    />
  );
});
ExploreShelvesUI.displayName = 'ExploreShelvesUI';

// User Shelves UI Component with custom equality function
export const UserShelvesUI: React.FC<UserShelvesUIProps> = React.memo(({
  shelves,
  loading,
  onViewShelf,
  onViewOwner,
  onBack,
  isCurrentUser = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { identity } = useIdentity();
  
  // Calculate owner information once and memoize it
  const { ownerName, ownerId, currentUserIsOwner } = useMemo(() => {
    let owner = "";
    let id = "";
    
    if (shelves.length > 0) {
      owner = shelves[0].owner.toString();
      id = owner;
    }

    // Check if the current user is the owner of this profile (ensure boolean result)
    const isOwner = Boolean(isCurrentUser || (identity && owner && identity.getPrincipal().toString() === owner));
    
    return { ownerName: owner, ownerId: id, currentUserIsOwner: isOwner };
  }, [shelves, identity, isCurrentUser]);
  
  // Handler for saving reordered shelves
  const handleSaveOrder = useCallback(async (newShelfOrder: string[]) => {
    if (!identity || !currentUserIsOwner) return;
    
    // Use the thunk with optimistic updates
    await dispatch(reorderProfileShelf({
      shelfId: "", // These will be ignored when newShelfOrder is provided
      referenceShelfId: null,
      before: true,
      principal: ownerName || identity.getPrincipal(),
      newShelfOrder
    }));
  }, [dispatch, identity, currentUserIsOwner, ownerName]);
  
  // Memoize the title to avoid unnecessary re-renders
  const title = useMemo(() => {
    return ownerName 
      ? `Shelves by ${ownerName.slice(0, 8)}...`
      : 'User Shelves';
  }, [ownerName]);

  return (
    <BaseShelfList
      shelves={shelves}
      title={title}
      emptyStateMessage="This user has no public shelves."
      showBackButton={true}
      backLabel="All Shelves"
      loading={loading}
      isCurrentUserProfile={isCurrentUser}
      allowReordering={currentUserIsOwner}
      onViewShelf={onViewShelf}
      onBack={onBack}
      onSaveOrder={handleSaveOrder}
    />
  );
}, areShelvesPropsEqual);  // Apply custom equality function to prevent unnecessary re-renders

UserShelvesUI.displayName = 'UserShelvesUI'; 