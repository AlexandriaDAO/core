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
import AppCard from '@/components/AppCard';
import { findApp } from '@/config/apps';

// Define the character limit constant
const MAX_MARKDOWN_LENGTH = 1000;

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
  
  // Selectors and hooks
  const dispatch = useAppDispatch();
  const { identity } = useIdentity();
  
  // Only fetch shelves data when needed (when on Shelf tab)
  const allShelves = useAppSelector(type === "Shelf" ? selectUserShelves : () => []);
  const currentShelf = useAppSelector(type === "Shelf" ? selectSelectedShelf : () => null);

  // Find the specific apps we need
  const alexandrianApp = findApp('Alexandrian');
  const permasearchApp = findApp('Permasearch');
  const pinaxApp = findApp('Pinax');

  // Reset form on type changes
  useEffect(() => {
    setContent("");
    setSelectedShelfId("");
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
    allShelves?.length, // Use .length for dependency if allShelves itself is stable
    currentShelf?.shelf_id,
    currentShelf?.items, // Consider deep comparison or more specific dependencies if items structure changes often
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
        setIsSubmitting(false); // Release submitting state if validation fails
        return;
      }

      if (type === "Markdown") {
        // Optimistic update for Markdown
        const tempUiId = `optimistic_${Date.now()}`; // Generate a temporary ID
        dispatch({
          type: "perpetua/optimisticMarkdownAddPending", // Replace with your actual action type
          payload: {
            shelfId: shelf.shelf_id, // Assuming shelf prop has shelf_id
            item: {
              type: "Markdown",
              content: finalContent,
              tempUiId: tempUiId,
              // You might want to add other temporary fields like a timestamp or pending status
            },
          },
        });
      }
      
      await onSubmit(finalContent, type as "Markdown" | "Shelf");
      // If onSubmit is successful, it should ideally dispatch an action to finalize the optimistic update,
      // replacing the temporary item with the real one from the backend, using the tempUiId.

      setContent("");
      setSelectedShelfId("");
      // Toast message might need adjustment based on optimistic success vs. actual success
      // For now, we keep it as is, assuming onSubmit handles its own success/error feedback
      // or that the optimistic add is usually fast and reliable.
      // toast.success(`Added ${type.toLowerCase()} content to shelf`); // Consider moving this or making it conditional
    } catch (error: any) {
      const errorMessage = error?.message || "You can't add a shelf that has this shelf inside it.";
      toast.error(errorMessage);
      // If an error occurs, dispatch an action to roll back the optimistic update for Markdown
      if (type === "Markdown") {
        // Assuming you have a tempUiId from the optimistic add step, you'd use it here.
        // This part requires the tempUiId to be available in this catch block.
        // For simplicity, this example doesn't pass tempUiId to the catch block,
        // but in a real implementation, you'd need to handle this.
        // A more robust way would be for onSubmit to handle its own rollback action dispatch
        // upon failure, referencing the tempUiId if it was involved in an optimistic update.
        // dispatch({
        //   type: "perpetua/optimisticMarkdownAddRollback", // Replace with your actual rollback action
        //   payload: { shelfId: shelf.shelf_id, tempUiId: /* tempUiId from above */ },
        // });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [type, selectedShelfId, content, onSubmit, dispatch, shelf?.shelf_id]); // Added dispatch and shelf.shelf_id

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
                placeholder={`# Title\n\n## Subtitle\n\n- Use lists for points\n- Another list item\n\n**Bold text** or *italic text*.\n\n[Link example](https://example.com)\n\nYour content here...`}
                maxLength={MAX_MARKDOWN_LENGTH}
              />
              <div className="text-right text-xs text-muted-foreground mt-1 font-serif">
                {content.length} / {MAX_MARKDOWN_LENGTH}
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-serif">
                For larger content, consider uploading your markdown as an NFT.
              </p>
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
          <div className="flex-1 flex flex-col p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 h-full place-items-center">
              <div className="flex flex-col items-center w-full">
                <span className="font-medium text-base mb-4">Find Existing NFTs</span>
                {alexandrianApp && (
                  <div className="w-full max-w-xs">
                    <AppCard 
                      app={alexandrianApp} 
                      size="default" 
                      className="w-full cursor-pointer hover:scale-105 transition-transform" 
                    />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-center w-full">
                <span className="font-medium text-base mb-4">Find New Ones on Arweave</span>
                {permasearchApp && (
                  <div className="w-full max-w-xs">
                    <AppCard 
                      app={permasearchApp} 
                      size="default" 
                      className="w-full cursor-pointer hover:scale-105 transition-transform" 
                    />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-center w-full">
                <span className="font-medium text-base mb-4">Bring Your Own</span>
                {pinaxApp && (
                  <div className="w-full max-w-xs">
                    <AppCard 
                      app={pinaxApp} 
                      size="default" 
                      className="w-full cursor-pointer hover:scale-105 transition-transform" 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      case "Shelf":
        return (
          <div className="flex-1 flex flex-col p-4 font-serif">
            <div className="flex justify-between items-center mb-2">
              <div>
                <Label htmlFor="shelfSelect" className="block mb-1 font-serif">Select an existing shelf</Label>
                <p className="text-sm text-muted-foreground mb-3 font-serif">
                  Add an existing shelf as an item in your current shelf
                </p>
              </div>
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