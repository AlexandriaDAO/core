import React, { useState, useEffect } from "react";
import { ShelfInformationSection } from "./ShelfInformationSection";
import { TagsSection } from "./TagsSection";
import { perpetuaService } from "@/apps/app/Perpetua/state/services/perpetuaService";
import { toast } from "sonner";
import { Shelf } from "@/../../declarations/perpetua/perpetua.did";

interface GeneralSettingsTabProps {
  shelf: Shelf;
  isOwner: boolean;
  onUpdateMetadata?: (
    shelfId: string, 
    title: string, 
    description?: string
  ) => Promise<boolean>;
}

export const GeneralSettingsTab: React.FC<GeneralSettingsTabProps> = ({ 
  shelf, 
  isOwner, 
  onUpdateMetadata,
}) => {
  // Editor states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [title, setTitle] = useState(shelf.title);
  const [description, setDescription] = useState(shelf.description?.[0] || "");
  const [tags, setTags] = useState<string[]>(shelf.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [isSavingMetadata, setIsSavingMetadata] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [removingTagId, setRemovingTagId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [tagLimitReached, setTagLimitReached] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);

  // Keep track of original values for comparison
  const [originalTitle] = useState(shelf.title);
  const [originalDescription] = useState(shelf.description?.[0] || "");

  // Update state when shelf changes
  useEffect(() => {
    setTitle(shelf.title);
    setDescription(shelf.description?.[0] || "");
    setTags(shelf.tags || []);
    setEditingField(null);
    setIsDirty(false);
  }, [shelf]);

  // Clear tag error when input changes
  useEffect(() => {
    if (tagError) {
      setTagError(null);
    }
  }, [tagInput]);

  // Check if metadata (title, description) has been modified
  useEffect(() => {
    const hasChanges = 
      title !== originalTitle || 
      description !== originalDescription;
    
    setIsDirty(hasChanges);
  }, [title, description, originalTitle, originalDescription]);

  // Function to toggle editing mode for a field
  const toggleFieldEdit = (fieldName: string | null) => {
    setEditingField(fieldName);
  };

  // Cancel metadata changes
  const handleCancelChanges = () => {
    setTitle(originalTitle);
    setDescription(originalDescription);
    setEditingField(null);
    setIsDirty(false);
  };

  // Save metadata changes (Title and Description only)
  const handleSaveChanges = async () => {
    if (!onUpdateMetadata || !isDirty) return;
    
    setIsSavingMetadata(true);
    
    try {
      // Update basic metadata (no tags)
      const success = await onUpdateMetadata(
        shelf.shelf_id, 
        title, 
        description || undefined
      );
      
      if (success) {
        setEditingField(null);
        setIsDirty(false);
        toast.success("Shelf details updated successfully.");
      } else {
        toast.error("Failed to update shelf details.");
      }
    } catch (error) {
      console.error("Error updating shelf metadata:", error);
      toast.error("An error occurred while saving changes.");
    } finally {
      setIsSavingMetadata(false);
    }
  };

  // Function to add a tag
  const handleAddTag = async () => {
    const trimmedTag = tagInput.trim();
    
    if (!trimmedTag || isAddingTag || removingTagId) {
      return;
    }
    
    // Check if at tag limit
    if (tags.length >= 3) { // MAX_TAGS from utils
      setTagLimitReached(true);
      setTimeout(() => setTagLimitReached(false), 3000);
      return;
    }
    
    // Check for duplicates (after normalization)
    const normalizedInput = trimmedTag.toLowerCase();
    const normalizedTags = tags.map(t => t.trim().toLowerCase());
    
    if (normalizedTags.includes(normalizedInput)) {
      setTagError("This tag already exists");
      setTimeout(() => setTagError(null), 3000);
      return;
    }
    
    // Call the service to add the tag
    setIsAddingTag(true);
    setTagError(null);
    
    try {
      const result = await perpetuaService.addTagToShelf(shelf.shelf_id, trimmedTag);
      
      if ('Ok' in result && result.Ok) {
        // Update local state on success
        setTags([...tags, trimmedTag]);
        setTagInput("");
        setTagLimitReached(tags.length + 1 >= 3); // MAX_TAGS
        toast.success(`Tag "${trimmedTag}" added.`);
      } else {
        const errorMsg = 'Err' in result ? result.Err : "Failed to add tag";
        setTagError(errorMsg);
        toast.error(`Error adding tag: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Error adding tag:", error);
      const errorMsg = "An unexpected error occurred while adding the tag.";
      setTagError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsAddingTag(false);
    }
  };

  // Handle removing a tag
  const handleRemoveTag = async (tagToRemove: string) => {
    if (isAddingTag || removingTagId) {
      return;
    }
    
    setRemovingTagId(tagToRemove);
    setTagError(null);
    
    try {
      const result = await perpetuaService.removeTagFromShelf(shelf.shelf_id, tagToRemove);
      
      if ('Ok' in result && result.Ok) {
        // Update local state on success
        setTags(tags.filter(tag => tag !== tagToRemove));
        setTagLimitReached(false);
        toast.success(`Tag "${tagToRemove}" removed.`);
      } else {
        const errorMsg = 'Err' in result ? result.Err : "Failed to remove tag";
        setTagError(errorMsg);
        toast.error(`Error removing tag: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Error removing tag:", error);
      const errorMsg = "An unexpected error occurred while removing the tag.";
      setTagError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setRemovingTagId(null);
    }
  };

  // Handle key press for tag input
  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-5 focus-visible:outline-none">
      <ShelfInformationSection
        shelf={shelf}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        isOwner={isOwner}
        editingField={editingField}
        toggleFieldEdit={toggleFieldEdit}
        isDirty={isDirty}
        isSavingMetadata={isSavingMetadata}
        handleSaveChanges={handleSaveChanges}
        handleCancelChanges={handleCancelChanges}
        onUpdateMetadata={onUpdateMetadata}
      />

      <div className="bg-card rounded-lg p-4">
        <TagsSection
          isOwner={isOwner}
          tags={tags}
          setTags={setTags}
          tagInput={tagInput}
          setTagInput={setTagInput}
          tagError={tagError}
          tagLimitReached={tagLimitReached}
          isAddingTag={isAddingTag}
          removingTagId={removingTagId}
          handleAddTag={handleAddTag}
          handleRemoveTag={handleRemoveTag}
          handleTagKeyPress={handleTagKeyPress}
          onUpdateMetadata={onUpdateMetadata}
        />
      </div>
    </div>
  );
}; 