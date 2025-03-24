import { useState } from 'react';
import { Shelf } from '../../../../../../../../declarations/perpetua/perpetua.did';

export const useShelfMetadata = (
  shelf: Shelf,
  onUpdateMetadata?: (shelfId: string, title: string, description?: string) => Promise<boolean>
) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(shelf.title);
  const [description, setDescription] = useState(shelf.description?.[0] || "");

  const handleSaveMetadata = async () => {
    if (onUpdateMetadata) {
      const success = await onUpdateMetadata(
        shelf.shelf_id, 
        title, 
        description || undefined
      );
      if (success) {
        setIsEditing(false);
      }
    }
  };

  return {
    isEditing,
    setIsEditing,
    title,
    setTitle,
    description,
    setDescription,
    handleSaveMetadata
  };
}; 