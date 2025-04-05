import { useState, useCallback } from 'react';
import { Shelf } from '../../../../../../../../declarations/perpetua/perpetua.did';
import { perpetuaService } from '@/apps/app/Perpetua/state/services/perpetuaService';

export const useShelfMetadata = (
  shelf: Shelf,
  onUpdateMetadata?: (shelfId: string, title: string, description?: string) => Promise<boolean>
) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(shelf.title);
  const [description, setDescription] = useState(shelf.description?.[0] || "");
  const [tags, setTags] = useState<string[]>(shelf.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [isProcessingTags, setIsProcessingTags] = useState(false);

  // Keep track of original tags for comparison
  const [originalTags] = useState<string[]>(shelf.tags || []);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveMetadata = async () => {
    if (onUpdateMetadata) {
      // Update basic metadata
      const success = await onUpdateMetadata(
        shelf.shelf_id, 
        title, 
        description || undefined
      );
      
      if (success) {
        // Handle tag updates
        setIsProcessingTags(true);
        
        try {
          // Find tags to add (present in new tags but not in original)
          const tagsToAdd = tags.filter(tag => !originalTags.includes(tag));
          
          // Find tags to remove (present in original but not in new tags)
          const tagsToRemove = originalTags.filter(tag => !tags.includes(tag));
          
          // Add new tags
          for (const tag of tagsToAdd) {
            await perpetuaService.addTagToShelf(shelf.shelf_id, tag);
          }
          
          // Remove deleted tags
          for (const tag of tagsToRemove) {
            await perpetuaService.removeTagFromShelf(shelf.shelf_id, tag);
          }
          
          setIsEditing(false);
        } catch (error) {
          console.error("Error updating tags:", error);
        } finally {
          setIsProcessingTags(false);
        }
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
    tags,
    setTags,
    tagInput,
    setTagInput,
    handleAddTag,
    handleRemoveTag,
    handleSaveMetadata,
    isProcessingTags
  };
}; 