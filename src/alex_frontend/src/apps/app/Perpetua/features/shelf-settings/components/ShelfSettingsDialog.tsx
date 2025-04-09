import React, { useState, useEffect } from "react";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Textarea } from "@/lib/components/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/lib/components/dialog";
import { Settings, Users, Tag, PlusCircle, X, AlertCircle, InfoIcon } from "lucide-react";
import { Shelf } from "../../../../../../../../declarations/perpetua/perpetua.did";
import { useShelfMetadata } from "../hooks";
import { ShelfMetricsDisplay } from "./ShelfMetricsDisplay";
import { CollaboratorsList } from "../../shelf-collaboration/components/CollaboratorsList";
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { selectIsOwner } from '@/apps/app/Perpetua/state/perpetuaSlice';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/components/tabs";
import { Badge } from "@/lib/components/badge";
import { Alert, AlertDescription } from "@/lib/components/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/lib/components/tooltip";

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
  onUpdateMetadata?: (shelfId: string, title: string, description?: string, tags?: string[]) => Promise<boolean>;
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
  
  const {
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
    handleRemoveTag,
    handleSaveMetadata,
    isProcessingTags
  } = useShelfMetadata(shelf, onUpdateMetadata);

  // Clear tag error when input changes
  useEffect(() => {
    if (tagError) {
      setTagError(null);
    }
  }, [tagInput]);

  // Override handleAddTag to implement the tag limit and validation
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    
    if (!trimmedTag) {
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
      return;
    }
    
    // Add the valid tag
    setTags([...tags, trimmedTag]);
    setTagInput("");
    setTagLimitReached(tags.length + 1 >= MAX_TAGS);
  };

  // Handle key press for tag input
  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag();
    }
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
            {!isEditing ? (
              <div className="bg-card rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Shelf Information</h3>
                  {(isOwner || onUpdateMetadata) && (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Title</h4>
                    <p className="text-base mt-1">{shelf.title}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                    <p className="text-base mt-1">{shelf.description?.[0] || "None"}</p>
                  </div>
                  
                  {shelf.tags && shelf.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Tags</h4>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {shelf.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
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
            ) : (
              <div className="bg-card rounded-lg p-5">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                    <Input 
                      id="title" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      className="w-full mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                    <Textarea 
                      id="description" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      className="w-full mt-1 resize-none"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
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
                      
                      <span className="text-xs text-muted-foreground ml-auto">Press Enter to add</span>
                    </div>
                    
                    {(tagLimitReached || tagError) && (
                      <Alert variant={tagLimitReached ? "default" : "destructive"} className="py-2 mb-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {tagLimitReached ? `Maximum ${MAX_TAGS} tags allowed` : tagError}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="tags"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={handleTagKeyPress}
                          placeholder={tags.length >= MAX_TAGS ? "Tag limit reached" : "Add a tag"}
                          className={`pr-16 ${tags.length >= MAX_TAGS ? "opacity-50" : ""}`}
                          disabled={tags.length >= MAX_TAGS}
                          maxLength={MAX_TAG_LENGTH + 5}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={handleAddTag}
                          className="absolute right-0 top-0 h-full px-3 flex items-center gap-1 text-xs font-medium hover:bg-primary/10 hover:text-primary"
                          disabled={!tagInput.trim() || tags.length >= MAX_TAGS}
                        >
                          <PlusCircle size={14} />
                          Add
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 mt-3 p-2 bg-background min-h-[40px] rounded-md">
                      {tags.length === 0 ? (
                        <p className="w-full text-center text-sm text-muted-foreground py-1">
                          No tags added yet
                        </p>
                      ) : (
                        tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="bg-primary/10 text-primary pl-2 pr-1 py-1 flex items-center gap-1"
                          >
                            {tag}
                            <button 
                              onClick={() => {
                                handleRemoveTag(tag);
                                setTagLimitReached(false);
                              }}
                              className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
                              aria-label={`Remove tag ${tag}`}
                            >
                              <X size={14} />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveMetadata} 
                    disabled={isProcessingTags}
                  >
                    {isProcessingTags ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}
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