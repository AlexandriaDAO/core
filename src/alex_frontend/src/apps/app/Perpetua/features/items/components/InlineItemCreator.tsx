import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Textarea } from "@/lib/components/textarea";
import { ShelfPublic, Item } from "@/../../declarations/perpetua/perpetua.did";
import { X, Plus, ChevronUp } from "lucide-react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { selectUserShelves, selectSelectedShelf, NormalizedShelf } from "@/apps/app/Perpetua/state/perpetuaSlice";
import { toast } from "sonner";
import { ShelfForm } from "@/apps/app/Perpetua/features/shelf-management/components/NewShelf";
import { useShelfOperations } from "@/apps/app/Perpetua/features/shelf-management/hooks/useShelfOperations";
import { loadShelves } from "@/apps/app/Perpetua/state";
import { useIdentity } from "@/hooks/useIdentity";
import AlexandrianSelector from "./AlexandrianSelector";

type ContentType = "Markdown" | "Nft" | "Shelf";

interface InlineItemCreatorProps {
  onSubmit: (content: string, type: "Markdown" | "Shelf") => Promise<void>;
  onCancel: () => void;
  shelves?: ShelfPublic[] | NormalizedShelf[];
  shelf: any;
}

const InlineItemCreator: React.FC<InlineItemCreatorProps> = ({ 
  onSubmit, 
  onCancel,
  shelves: propShelves,
  shelf
}) => {
  // Core state
  const [content, setContent] = useState("");
  const [type, setType] = useState<ContentType>("Markdown");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Shelf-specific state
  const [selectedShelfId, setSelectedShelfId] = useState<string>("");
  const [creatingNewShelf, setCreatingNewShelf] = useState(false);
  const [newShelfTitle, setNewShelfTitle] = useState("");
  const [newShelfDescription, setNewShelfDescription] = useState("");
  const [isCreatingShelf, setIsCreatingShelf] = useState(false);
  
  // Selectors and hooks
  const dispatch = useAppDispatch();
  const { identity } = useIdentity();
  
  // Only fetch shelves data when needed (when on Shelf tab)
  const allShelves = useAppSelector(type === "Shelf" ? selectUserShelves : () => []);
  const currentShelf = useAppSelector(type === "Shelf" ? selectSelectedShelf : () => null);
  const { createAndAddShelfItem } = useShelfOperations();

  // Reset form on type changes
  useEffect(() => {
    setContent("");
    setSelectedShelfId("");
    setCreatingNewShelf(false);
    setNewShelfTitle("");
    setNewShelfDescription("");
  }, [type]);

  // Fetch shelves when the Shelf tab is selected - only on initial tab selection
  useEffect(() => {
    if (type === "Shelf" && identity) {
      try {
        const principal = identity.getPrincipal().toString();
        // Dispatch action with a stable reference
        const action = loadShelves({ 
          principal, 
          params: { offset: 0, limit: 20 }
        });
        dispatch(action);
      } catch (err) {
        console.error("Error loading shelves:", err);
      }
    }
  }, [type, identity]); // explicitly exclude dispatch

  // Filter available shelves that can be added as items
  const availableShelves = useMemo(() => {
    // Only process when on Shelf tab
    if (type !== "Shelf") return [];

    // Use shelves provided as props if available
    if (propShelves) {
      return propShelves;
    }

    // Get shelves from Redux
    const userShelves = allShelves;
    
    // If we don't have any shelves or current shelf, return empty array
    if (!userShelves || userShelves.length === 0) {
      return [];
    }
    
    // If no current shelf selected, show all shelves
    if (!currentShelf) {
      return userShelves;
    }
    
    // Get IDs of shelves that are already added as items to current shelf
    const shelvesInCurrentShelf = new Set<string>();
    
    if (currentShelf.items) {
      currentShelf.items.forEach(([, item]: [number, Item]) => {
        if (item.content && 'Shelf' in item.content) {
          shelvesInCurrentShelf.add(item.content.Shelf);
        }
      });
    }
    
    // Filter out:
    // 1. The current shelf itself
    // 2. Shelves that are already added as items
    return userShelves.filter((shelf) => 
      shelf.shelf_id !== currentShelf.shelf_id && 
      !shelvesInCurrentShelf.has(shelf.shelf_id)
    );
  }, [
    type,
    allShelves?.length,
    currentShelf?.shelf_id,
    currentShelf?.items,
    propShelves
  ]);

  // Submit the current content as an item - memoized to prevent rerenders
  const handleSubmit = useCallback(async () => {
    // Explicitly handle only Markdown and Shelf types for submission
    if (type === "Nft") {
      console.warn("handleSubmit called on Nft tab, which should not happen.");
      return; // Do nothing if on the Nft tab
    }

    try {
      setIsSubmitting(true);
      
      const finalContent = type === "Shelf" ? selectedShelfId : content;
      
      if (!finalContent) {
        toast.error(`Please ${type === "Markdown" ? "enter" : "select"} ${type.toLowerCase()} content`);
        return;
      }
      
      await onSubmit(finalContent, type as "Markdown" | "Shelf");
      setContent("");
      setSelectedShelfId("");
      toast.success(`Added ${type.toLowerCase()} content to shelf`);
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to add content to shelf";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [type, selectedShelfId, content, onSubmit]);
  
  // Create a new shelf and add it as an item - memoized
  const handleCreateShelf = useCallback(async () => {
    if (!newShelfTitle) {
      toast.error("Please enter a title for the shelf");
      return;
    }
    
    if (!currentShelf) {
      toast.error("No current shelf selected");
      return;
    }
    
    try {
      setIsCreatingShelf(true);
      
      const newShelfId = await createAndAddShelfItem(
        currentShelf.shelf_id,
        newShelfTitle,
        newShelfDescription
      );
      
      if (newShelfId) {
        toast.success(`New shelf "${newShelfTitle}" created and added as an item`);
        setNewShelfTitle("");
        setNewShelfDescription("");
        onCancel();
      } else {
        toast.error("Failed to create and add shelf");
      }
    } catch (error) {
      console.error("Error creating and adding shelf:", error);
      toast.error("Failed to create and add shelf");
    } finally {
      setIsCreatingShelf(false);
    }
  }, [currentShelf, newShelfTitle, newShelfDescription, createAndAddShelfItem, onCancel]);

  // Memoized handler for switching to create mode
  const handleEnterCreateMode = useCallback(() => {
    setCreatingNewShelf(true);
  }, []);

  // Memoized handler for returning to selection mode
  const handleBackToSelection = useCallback(() => {
    setCreatingNewShelf(false);
  }, []);

  // Set content handler - memoized
  const handleSetContent = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  }, []);

  // Set shelf ID handler - memoized
  const handleSetShelfId = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedShelfId(e.target.value);
  }, []);

  // Toggle content type handler
  const handleTypeChange = useCallback((newType: ContentType) => {
    setType(newType);
  }, []);

  // Memoize the tab buttons to prevent unnecessary rerenders
  const contentTypeTabs = useMemo(() => (
    <div className="flex p-2 gap-2 border-b border-border font-serif">
      {(["Markdown", "Nft", "Shelf"] as ContentType[]).map((contentType) => (
        <Button
          key={contentType}
          variant={type === contentType ? "secondary" : "ghost"}
          onClick={() => handleTypeChange(contentType)}
          className="px-4 py-1"
        >
          {contentType}
        </Button>
      ))}
    </div>
  ), [type, handleTypeChange]);

  // Lazily render only the active form to prevent wasted renders
  const renderActiveForm = () => {
    switch(type) {
      case "Markdown":
        return (
          <div className="flex-1 flex flex-col font-serif">
            <div className="p-4 flex-grow">
              <Label htmlFor="markdownContent" className="block mb-2 font-serif">Markdown Content</Label>
              <Textarea
                id="markdownContent"
                className="min-h-[300px] w-full font-serif"
                value={content}
                onChange={handleSetContent}
                placeholder="# Title
                
## Subtitle
                
Your content here..."
              />
            </div>
            <div className="p-4 mt-auto border-t border-border flex justify-between">
              <Button onClick={onCancel} variant="outline">Cancel</Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !content.trim()}
                variant="primary"
              >
                {isSubmitting ? "Adding..." : "Add Markdown"}
              </Button>
            </div>
          </div>
        );
        
      case "Nft":
        return (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-hidden">
              <AlexandrianSelector />
            </div>
          </div>
        );
        
      case "Shelf":
        if (creatingNewShelf) {
          return (
            <div className="flex-1 flex flex-col p-4 font-serif">
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-lg font-medium font-serif">Create New Shelf</h3>
                    <p className="text-sm text-muted-foreground font-serif">
                      Create a new shelf and immediately add it to your current shelf
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleBackToSelection}
                  >
                    Back to Existing Shelves
                  </Button>
                </div>
                <div className="bg-muted/20 p-4 rounded-md border border-border mt-2">
                  <ShelfForm
                    title={newShelfTitle}
                    setTitle={setNewShelfTitle}
                    description={newShelfDescription}
                    setDescription={setNewShelfDescription}
                    submitLabel="Create & Add Shelf"
                    onSubmit={handleCreateShelf}
                    inline={true}
                  />
                  <div className="flex justify-between mt-4">
                    <Button onClick={onCancel} variant="outline">Cancel</Button>
                    <Button 
                      onClick={handleCreateShelf} 
                      disabled={!newShelfTitle || isCreatingShelf}
                      variant="primary"
                    >
                      {isCreatingShelf ? "Creating..." : "Create & Add Shelf"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <div className="flex-1 flex flex-col p-4 font-serif">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <Label htmlFor="shelfSelect" className="block mb-1 font-serif">Select an existing shelf</Label>
                  <p className="text-sm text-muted-foreground mb-3 font-serif">
                    Add an existing shelf as an item in your current shelf
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleEnterCreateMode}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Create New
                </Button>
              </div>
              <select
                id="shelfSelect"
                value={selectedShelfId}
                onChange={handleSetShelfId}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-serif"
              >
                <option value="">Select a shelf...</option>
                {availableShelves.length > 0 ? (
                  availableShelves.map((shelf) => (
                    <option key={shelf.shelf_id} value={shelf.shelf_id}>
                      {shelf.title}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No available shelves to add</option>
                )}
              </select>
              {availableShelves.length === 0 && (
                <p className="text-sm text-amber-500 mt-2 font-serif">
                  You don't have any other shelves that can be added. Create a new shelf instead.
                </p>
              )}
              <div className="flex justify-between mt-4">
                <Button onClick={onCancel} variant="outline">Cancel</Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!selectedShelfId || isSubmitting}
                  variant="primary"
                >
                  {isSubmitting ? "Adding..." : "Add Existing Shelf"}
                </Button>
              </div>
            </div>
          );
        }
        
      default:
        return null;
    }
  };

  return (
    <div className="bg-background border border-border rounded-md shadow-sm mb-4 overflow-hidden font-serif">
      <div className="flex flex-col">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-4 border-b border-border bg-muted/30">
          <h3 className="text-lg font-medium font-serif">Add Item to Shelf</h3>
          <div 
            onClick={onCancel} 
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted cursor-pointer"
          >
            <X className="h-4 w-4" />
          </div>
        </div>
        
        {/* Content type tabs */}
        {contentTypeTabs}
        
        {/* Content form based on selected type */}
        <div className="flex-1 min-h-[400px]">
          {renderActiveForm()}
        </div>
      </div>
    </div>
  );
};

export default InlineItemCreator; 