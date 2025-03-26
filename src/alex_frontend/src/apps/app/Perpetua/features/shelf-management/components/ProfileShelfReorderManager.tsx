import React from 'react';
import { Shelf } from "../../../../../../../../declarations/perpetua/perpetua.did";
import { useProfileShelfReordering } from '../hooks/usePublicShelfOperations';

interface ProfileShelfReorderManagerProps {
  isCurrentUser: boolean;
  children: (props: {
    isReorderMode: boolean;
    isLoading: boolean;
    enterReorderMode: () => void;
    cancelReorderMode: () => void;
    saveShelfOrder: () => Promise<void>;
    resetProfileOrder: () => Promise<void>;
    handleDragStart: (index: number) => void;
    handleDragOver: (e: React.DragEvent, index: number) => void;
    handleDragEnd: () => void;
    handleDrop: (e: React.DragEvent, index: number) => void;
    getDragItemStyle: (index: number) => React.CSSProperties;
  }) => React.ReactNode;
}

/**
 * Component for managing the reordering of shelves in a user's profile.
 * Encapsulates all drag-and-drop and reordering logic.
 */
export const ProfileShelfReorderManager: React.FC<ProfileShelfReorderManagerProps> = ({
  isCurrentUser,
  children
}) => {
  // Only allow reordering for the current user
  if (!isCurrentUser) {
    // Return empty handlers for non-owners
    return children({
      isReorderMode: false,
      isLoading: false,
      enterReorderMode: () => {},
      cancelReorderMode: () => {},
      saveShelfOrder: async () => {},
      resetProfileOrder: async () => {},
      handleDragStart: () => {},
      handleDragOver: () => {},
      handleDragEnd: () => {},
      handleDrop: () => {},
      getDragItemStyle: () => ({})
    });
  }

  // Use our custom hook for all reordering logic
  const {
    isReorderMode,
    isLoading,
    enterReorderMode,
    cancelReorderMode,
    saveShelfOrder,
    resetProfileOrder,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    getDragItemStyle
  } = useProfileShelfReordering();

  return children({
    isReorderMode,
    isLoading,
    enterReorderMode,
    cancelReorderMode,
    saveShelfOrder,
    resetProfileOrder,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    getDragItemStyle
  });
};

export default ProfileShelfReorderManager; 