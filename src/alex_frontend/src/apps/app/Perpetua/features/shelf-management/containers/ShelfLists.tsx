import React, { useCallback, useMemo } from 'react';
import { useIdentity } from '@/hooks/useIdentity';
import isEqual from 'lodash/isEqual';
import { ShelfPublic } from '@/../../declarations/perpetua/perpetua.did';
import { BaseShelfList } from '../../cards/components/BaseShelfList';
import { LibraryShelvesUIProps, ExploreShelvesUIProps, UserShelvesUIProps } from '../../../types/shelf.types';
import { useDispatch } from 'react-redux';
import { reorderProfileShelf } from '@/apps/app/Perpetua/state';
import { AppDispatch } from '@/store';

/**
 * Custom props comparison for React.memo to prevent unnecessary renders
 */
const areShelvesPropsEqual = (prevProps: UserShelvesUIProps, nextProps: UserShelvesUIProps): boolean => {
  // Basic props comparison
  if (prevProps.loading !== nextProps.loading || 
      prevProps.isCurrentUser !== nextProps.isCurrentUser) {
    return false;
  }
  
  // Compare shelf arrays by important properties
  if (prevProps.shelves.length !== nextProps.shelves.length) {
    return false;
  }
  
  return isEqual(
    prevProps.shelves.map(s => ({ id: s.shelf_id, title: s.title, owner: s.owner.toString() })),
    nextProps.shelves.map(s => ({ id: s.shelf_id, title: s.title, owner: s.owner.toString() }))
  );
};

interface UnifiedShelvesUIProps {
  allShelves: ShelfPublic[];
  personalShelves: ShelfPublic[];
  loading: boolean;
  onNewShelf: () => void;
  onViewShelf: (shelfId: string) => void;
  onViewOwner: (ownerId: string) => void;
  onLoadMore: () => Promise<void>;
  checkEditAccess: (shelfId: string) => boolean;
  isCreatingShelf?: boolean;
}

/**
 * UnifiedShelvesUI - Displays all shelves in a combined view
 */
export const UnifiedShelvesUI: React.FC<UnifiedShelvesUIProps> = React.memo(({
  allShelves,
  personalShelves,
  loading,
  onNewShelf,
  onViewShelf,
  onViewOwner,
  onLoadMore,
  checkEditAccess,
  isCreatingShelf
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
      isCreatingShelf={isCreatingShelf}
    />
  );
});
UnifiedShelvesUI.displayName = 'UnifiedShelvesUI';

/**
 * LibraryShelvesUI - Displays the current user's personal shelves
 */
export const LibraryShelvesUI: React.FC<LibraryShelvesUIProps> = React.memo(({
  shelves,
  loading,
  onNewShelf,
  onViewShelf
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { identity } = useIdentity();
  
  const handleSaveOrder = useCallback(async (newShelfOrder: string[]) => {
    if (!identity || newShelfOrder.length < 2) return;
    
    // Instead of sending an empty shelfId, use the first item in the new order
    // and the second item as reference, with before=true
    const shelfId = newShelfOrder[0];
    const referenceShelfId = newShelfOrder[1];
    
    // CRITICAL: Convert Principal to string to avoid serialization issues
    const principalStr = identity.getPrincipal().toString();
    
    try {
      // Pass the complete newShelfOrder for optimistic updates in Redux
      await dispatch(reorderProfileShelf({
        shelfId,
        referenceShelfId,
        before: true,
        principal: principalStr,
        newShelfOrder
      })).unwrap();
      
      console.log("Shelf reorder successful!");
    } catch (error) {
      console.error("Failed to reorder shelf:", error);
    }
  }, [dispatch, identity, shelves]);

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
}, (prevProps, nextProps) => {
  if (prevProps.loading !== nextProps.loading) return false;
  if (prevProps.shelves.length !== nextProps.shelves.length) return false;
  
  return isEqual(
    prevProps.shelves.map(s => ({ id: s.shelf_id, title: s.title })),
    nextProps.shelves.map(s => ({ id: s.shelf_id, title: s.title }))
  );
});
LibraryShelvesUI.displayName = 'LibraryShelvesUI';

/**
 * ExploreShelvesUI - Displays public shelves for exploration
 */
export const ExploreShelvesUI: React.FC<ExploreShelvesUIProps> = React.memo(({
  shelves,
  loading,
  onViewShelf,
  onLoadMore
}) => (
  <BaseShelfList
    shelves={shelves}
    title="Explore Public Shelves"
    emptyStateMessage="No public shelves found."
    loading={loading}
    onViewShelf={onViewShelf}
    onLoadMore={onLoadMore}
  />
));
ExploreShelvesUI.displayName = 'ExploreShelvesUI';

/**
 * UserShelvesUI - Displays shelves for a specific user
 */
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
  
  // Calculate owner information
  const { ownerName, ownerId, currentUserIsOwner } = useMemo(() => {
    if (shelves.length === 0) return { ownerName: "", ownerId: "", currentUserIsOwner: false };
    
    const owner = shelves[0].owner.toString();
    const isOwner = Boolean(isCurrentUser || 
      (identity && owner && identity.getPrincipal().toString() === owner));
    
    return { 
      ownerName: owner, 
      ownerId: owner, 
      currentUserIsOwner: isOwner 
    };
  }, [shelves, identity, isCurrentUser]);
  
  // Handler for saving reordered shelves
  const handleSaveOrder = useCallback(async (newShelfOrder: string[]) => {
    if (!identity || !currentUserIsOwner || newShelfOrder.length < 2) return;
    
    // Find the original positions of shelves to determine what moved
    const originalOrder = shelves.map(shelf => shelf.shelf_id);
    console.log('Original order:', originalOrder);
    console.log('New order:', newShelfOrder);
    
    // Instead of sending an empty shelfId, use the first item in the new order
    // and the second item as reference, with before=true
    const shelfId = newShelfOrder[0];
    const referenceShelfId = newShelfOrder[1];
    
    console.log(`Moving shelf ${shelfId} before ${referenceShelfId}`);
    
    // CRITICAL: Ensure principal is a string, not a Principal object
    const principalStr = typeof ownerName === 'string' ? 
      ownerName : identity.getPrincipal().toString();
    
    try {
      // Pass the complete newShelfOrder for optimistic updates in Redux
      await dispatch(reorderProfileShelf({
        shelfId,
        referenceShelfId,
        before: true,
        principal: principalStr,
        newShelfOrder
      })).unwrap();
      
      console.log("Shelf reorder successful!");
    } catch (error) {
      console.error("Failed to reorder shelf:", error);
    }
  }, [dispatch, identity, shelves, currentUserIsOwner, ownerName]);
  
  const title = useMemo(() => 
    ownerName ? `Shelves by ${ownerName.slice(0, 8)}...` : 'User Shelves',
    [ownerName]
  );

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
}, areShelvesPropsEqual);

UserShelvesUI.displayName = 'UserShelvesUI';