import React, { useState, useEffect } from "react";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Textarea } from "@/lib/components/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/lib/components/dialog";
import { Settings, Users, Tag, PlusCircle, X, AlertCircle, InfoIcon, Edit2, Check, Save } from "lucide-react";
import { Shelf } from "../../../../../../../../declarations/perpetua/perpetua.did";
import { ShelfMetricsDisplay } from "./ShelfMetricsDisplay";
import { CollaboratorsList } from "../../shelf-collaboration/components/CollaboratorsList";
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { selectIsOwner } from '@/apps/app/Perpetua/state/perpetuaSlice';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/components/tabs";
import { Badge } from "@/lib/components/badge";
import { Alert, AlertDescription } from "@/lib/components/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/lib/components/tooltip";
import { perpetuaService } from "@/apps/app/Perpetua/state/services/perpetuaService";
import { toast } from "sonner";

// Constants based on backend rules
const MAX_TAGS = 3;
const MAX_TAG_LENGTH = 10;

// Tag validation rules from backend
interface TagValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

const validateTag = (tag: string): TagValidationResult => {
  // Normalize the tag first (backend uses lowercase and trim)
  const normalizedTag = tag.trim().toLowerCase();
  
  // Empty check
  if (!normalizedTag) {
    return { isValid: false, errorMessage: "Tag cannot be empty" };
  }
  
  // Max length check
  if (normalizedTag.length > MAX_TAG_LENGTH) {
    return { 
      isValid: false, 
      errorMessage: `Tag exceeds maximum length of ${MAX_TAG_LENGTH} characters` 
    };
  }
  
  // Whitespace check
  if (/\s/.test(normalizedTag)) {
    return { isValid: false, errorMessage: "Tags cannot contain whitespace" };
  }
  
  // Control characters check
  if (/[\p{C}]/u.test(normalizedTag)) {
    return { isValid: false, errorMessage: "Tags cannot contain control characters" };
  }
  
  // At least one alphanumeric character
  if (!/[a-zA-Z0-9]/.test(normalizedTag)) {
    return { 
      isValid: false, 
      errorMessage: "Tags must contain at least one alphanumeric character" 
    };
  }
  
  return { isValid: true };
};

interface ShelfSettingsDialogProps {
  shelf: Shelf;
  onRebalance?: (shelfId: string) => Promise<void>;
  onUpdateMetadata?: (shelfId: string, title: string, description?: string) => Promise<boolean>;
  className?: string;
}

export const ShelfSettingsDialog: React.FC<ShelfSettingsDialogProps> = ({ 
  shelf,
  onRebalance,
  onUpdateMetadata,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const isOwner = useAppSelector(selectIsOwner(shelf.shelf_id));
  const [tagLimitReached, setTagLimitReached] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);
  
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

  // Function to add a tag
  const handleAddTag = async () => {
    const trimmedTag = tagInput.trim();
    
    if (!trimmedTag || isAddingTag || removingTagId) {
      return;
    }
    
    // Check if at tag limit
    if (tags.length >= MAX_TAGS) {
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
    
    // Validate the tag
    const validation = validateTag(trimmedTag);
    if (!validation.isValid) {
      setTagError(validation.errorMessage || "Invalid tag");
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
        setTagLimitReached(tags.length + 1 >= MAX_TAGS);
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={`flex items-center gap-1 px-3 py-1 text-sm ${className}`}>
          <Settings size={16} />
          <span>Settings</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader className="mb-4">
          <DialogTitle>Shelf Settings</DialogTitle>
          <DialogDescription>
            Configure settings and manage collaborators for this shelf
          </DialogDescription>
        </DialogHeader>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="general">
              <span className="flex items-center gap-2">
                <Settings size={16} />
                General
              </span>
            </TabsTrigger>
            <TabsTrigger value="collaborators">
              <span className="flex items-center gap-2">
                <Users size={16} />
                Collaborators
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-5 focus-visible:outline-none">
            <div className="bg-card rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Shelf Information</h3>
                
                {(isOwner || onUpdateMetadata) && (
                  <div className="space-x-2">
                    {isDirty && (
                      <>
                        <Button 
                          variant="outline" 
                          scale="sm"
                          onClick={handleCancelChanges}
                          disabled={isSavingMetadata}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="primary" 
                          scale="sm"
                          onClick={handleSaveChanges}
                          disabled={isSavingMetadata || !isDirty}
                          className="flex items-center gap-1"
                        >
                          <Save size={14} />
                          {isSavingMetadata ? "Saving..." : "Save Changes"}
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {/* Title Field */}
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-muted-foreground">Title</h4>
                    {(isOwner || onUpdateMetadata) && (
                      <Button 
                        variant="ghost" 
                        scale="sm" 
                        className="h-6 px-2"
                        onClick={() => toggleFieldEdit(editingField === "title" ? null : "title")}
                      >
                        {editingField === "title" ? <Check size={14} /> : <Edit2 size={14} />}
                      </Button>
                    )}
                  </div>
                  
                  {editingField === "title" ? (
                    <Input 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      className="w-full mt-1"
                      autoFocus
                    />
                  ) : (
                    <p className="text-base mt-1">{title}</p>
                  )}
                </div>
                
                {/* Description Field */}
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                    {(isOwner || onUpdateMetadata) && (
                      <Button 
                        variant="ghost" 
                        scale="sm" 
                        className="h-6 px-2"
                        onClick={() => toggleFieldEdit(editingField === "description" ? null : "description")}
                      >
                        {editingField === "description" ? <Check size={14} /> : <Edit2 size={14} />}
                      </Button>
                    )}
                  </div>
                  
                  {editingField === "description" ? (
                    <Textarea 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      className="w-full mt-1 resize-none"
                      rows={3}
                      autoFocus
                    />
                  ) : (
                    <p className="text-base mt-1">{description || "None"}</p>
                  )}
                </div>
                
                {/* Tags Field */}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Tags</h4>
                      <Badge variant="outline" className={`text-xs font-normal ${tags.length >= MAX_TAGS ? "bg-orange-100 border-orange-300 text-orange-700" : "bg-primary/5"}`}>
                        {tags.length}/{MAX_TAGS}
                      </Badge>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-help">
                              <InfoIcon size={14} className="text-muted-foreground hover:text-primary" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[260px]">
                            <p>Tags must:</p>
                            <ul className="list-disc pl-4 text-xs mt-1">
                              <li>Be {MAX_TAG_LENGTH} characters or less</li>
                              <li>Not contain spaces or special characters</li>
                              <li>Have at least one letter or number</li>
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  
                  {(isOwner || onUpdateMetadata) && (
                    <>
                      {(tagLimitReached || tagError) && (
                        <Alert variant={tagLimitReached ? "default" : "destructive"} className="py-2 mb-2 mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {tagLimitReached ? `Maximum ${MAX_TAGS} tags allowed` : tagError}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2">
                        <div className="relative flex-1">
                          <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={handleTagKeyPress}
                            placeholder={tags.length >= MAX_TAGS ? "Tag limit reached" : "Add a tag"}
                            className={`pr-16 ${tags.length >= MAX_TAGS ? "opacity-50" : ""}`}
                            disabled={tags.length >= MAX_TAGS || isAddingTag || !!removingTagId}
                            maxLength={MAX_TAG_LENGTH + 5}
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={handleAddTag}
                            className="absolute right-0 top-0 h-full px-3 flex items-center gap-1 text-xs font-medium hover:bg-primary/10 hover:text-primary disabled:opacity-50"
                            disabled={!tagInput.trim() || tags.length >= MAX_TAGS || isAddingTag || !!removingTagId}
                          >
                            {isAddingTag ? (
                              <>
                                <span className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full" role="status" aria-label="loading"></span>
                                Adding...
                              </>
                            ) : (
                              <>
                                <PlusCircle size={14} />
                                Add
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 mt-3 p-2 bg-background min-h-[40px] rounded-md border">
                        {tags.length === 0 ? (
                          <p className="w-full text-center text-sm text-muted-foreground py-1">
                            No tags added yet
                          </p>
                        ) : (
                          tags.map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary"
                              className={`bg-primary/10 text-primary pl-2 pr-1 py-1 flex items-center gap-1 ${removingTagId === tag ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                              {tag}
                              {removingTagId === tag ? (
                                <span className="ml-1 animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full" role="status" aria-label="removing tag"></span>
                              ) : (
                                <button 
                                  onClick={() => handleRemoveTag(tag)}
                                  className="ml-1 rounded-full hover:bg-primary/20 p-0.5 disabled:opacity-50"
                                  aria-label={`Remove tag ${tag}`}
                                  disabled={isAddingTag || !!removingTagId}
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </Badge>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Shelf Metrics</h3>
                <ShelfMetricsDisplay 
                  shelfId={shelf.shelf_id} 
                  isExpanded={isOpen && activeTab === "general"}
                  onRebalance={onRebalance}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="collaborators" className="focus-visible:outline-none">
            <div className="bg-card rounded-lg p-4">
              <CollaboratorsList shelfId={shelf.shelf_id} />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}; 