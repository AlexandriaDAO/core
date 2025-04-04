import React, { useState, useMemo } from "react";
import { Button } from "@/lib/components/button";
import { Dialog, DialogContent } from "@/lib/components/dialog";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Textarea } from "@/lib/components/textarea";
import { Shelf, Item } from "@/../../declarations/perpetua/perpetua.did";
import { X, Plus } from "lucide-react";
import NftSearchDialog from "./NftSearch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { selectUserShelves, selectSelectedShelf, NormalizedShelf } from "@/apps/app/Perpetua/state/perpetuaSlice";
import { toast } from "sonner";
import { ShelfForm } from "@/apps/app/Perpetua/features/shelf-management/components/NewShelf";
import { useShelfOperations } from "@/apps/app/Perpetua/features/shelf-management/hooks/useShelfOperations";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NewItemDialogProps extends DialogProps {
  onSubmit: (content: string, type: "Nft" | "Markdown" | "Shelf", collectionType?: "NFT" | "SBT") => Promise<void>;
  shelves?: Shelf[] | NormalizedShelf[];
}

type ContentType = "Markdown" | "Nft" | "Shelf";

const NewItemDialog: React.FC<NewItemDialogProps> = ({ isOpen, onClose, onSubmit, shelves: propShelves }) => {
  // Core state
  const [content, setContent] = useState("");
  const [type, setType] = useState<ContentType>("Markdown");
  const [collectionType, setCollectionType] = useState<"NFT" | "SBT">("NFT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Shelf-specific state
  const [selectedShelfId, setSelectedShelfId] = useState<string>("");
  const [creatingNewShelf, setCreatingNewShelf] = useState(false);
  const [newShelfTitle, setNewShelfTitle] = useState("");
  const [newShelfDescription, setNewShelfDescription] = useState("");
  const [isCreatingShelf, setIsCreatingShelf] = useState(false);
  
  // Selectors
  const allShelves = useAppSelector(selectUserShelves);
  const currentShelf = useAppSelector(selectSelectedShelf);
  const { createAndAddShelfItem } = useShelfOperations();

  // Reset form when dialog opens/closes or type changes
  React.useEffect(() => {
    setContent("");
    setSelectedShelfId("");
    setCreatingNewShelf(false);
    setNewShelfTitle("");
    setNewShelfDescription("");
  }, [isOpen, type]);

  // Filter available shelves that can be added as items
  const availableShelves = useMemo(() => {
    if (propShelves) return propShelves;
    if (!allShelves || !currentShelf) return [];
    
    const shelvesInCurrentShelf = new Set<string>();
    
    if (currentShelf.items) {
      currentShelf.items.forEach(([, item]: [number, Item]) => {
        if (item.content && 'Shelf' in item.content) {
          shelvesInCurrentShelf.add(item.content.Shelf);
        }
      });
    }
    
    return allShelves.filter((shelf) => 
      shelf.shelf_id !== currentShelf.shelf_id && 
      !shelvesInCurrentShelf.has(shelf.shelf_id)
    );
  }, [allShelves, currentShelf, propShelves]);

  // Handle NFT selection from NftSearchDialog
  const handleNftSelect = (numericNftId: string, selectedCollectionType: "NFT" | "SBT") => {
    if (!numericNftId) {
      toast.error("Invalid NFT ID. Please try selecting another NFT.");
      return;
    }
    
    if (!/^\d+$/.test(numericNftId)) {
      toast.error("Invalid NFT ID format. Expected a numeric ID.");
      return;
    }
    
    setContent(numericNftId);
    setCollectionType(selectedCollectionType);
  };

  // Submit the current content as an item
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const finalContent = type === "Shelf" ? selectedShelfId : content;
      
      if (!finalContent) {
        toast.error(`Please ${type === "Markdown" ? "enter" : "select"} ${type.toLowerCase()} content`);
        return;
      }
      
      if (type === "Nft" && !/^\d+$/.test(finalContent)) {
        toast.error("Invalid NFT ID format. The ID must be numeric.");
        return;
      }
      
      await onSubmit(finalContent, type, type === "Nft" ? collectionType : undefined);
      setContent("");
      setSelectedShelfId("");
      onClose();
      toast.success(`Added ${type.toLowerCase()} content to shelf`);
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to add content to shelf";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Create a new shelf and add it as an item
  const handleCreateShelf = async () => {
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
        onClose();
      } else {
        toast.error("Failed to create and add shelf");
      }
    } catch (error) {
      console.error("Error creating and adding shelf:", error);
      toast.error("Failed to create and add shelf");
    } finally {
      setIsCreatingShelf(false);
    }
  };

  // Content type tabs
  const ContentTypeTabs = () => (
    <div className="flex justify-center py-4 border-b border-border">
      <div className="flex gap-4">
        {(["Markdown", "Nft", "Shelf"] as ContentType[]).map((contentType) => (
          <Button
            key={contentType}
            variant={type === contentType ? "primary" : "outline"}
            onClick={() => setType(contentType)}
            className="px-6 py-2 text-base"
          >
            {contentType}
          </Button>
        ))}
      </div>
    </div>
  );
  
  // Markdown content form
  const MarkdownForm = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 flex-grow">
        <Label htmlFor="markdownContent" className="block mb-2">Markdown Content</Label>
        <Textarea
          id="markdownContent"
          className="h-full min-h-[400px] resize-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="# Title

## Subtitle

Your content here..."
        />
      </div>
      <div className="p-4 mt-auto border-t border-border">
        <Button 
          onClick={handleSubmit} 
          disabled={!content.trim() || isSubmitting}
          className="px-6 py-2 text-base"
          variant="primary"
        >
          {isSubmitting ? "Adding..." : "Add Markdown"}
        </Button>
      </div>
    </div>
  );
  
  // Shelf selection form
  const ShelfSelectionForm = () => (
    <div className="flex-1 flex flex-col p-4">
      {!creatingNewShelf ? (
        <>
          <div className="flex justify-between items-center mb-2">
            <div>
              <Label htmlFor="shelfSelect" className="block mb-1">Select an existing shelf</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Add an existing shelf as an item in your current shelf
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setCreatingNewShelf(true)}
              className="flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Create New
            </Button>
          </div>
          <select
            id="shelfSelect"
            value={selectedShelfId}
            onChange={(e) => setSelectedShelfId(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
            <p className="text-sm text-amber-500 mt-2">
              You don't have any other shelves that can be added. Create a new shelf instead.
            </p>
          )}
          <div className="flex justify-end mt-4">
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedShelfId || isSubmitting}
              className="px-6 py-2 text-base"
              variant="primary"
            >
              {isSubmitting ? "Adding..." : "Add Existing Shelf"}
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-lg font-medium">Create New Shelf</h3>
              <p className="text-sm text-muted-foreground">
                Create a new shelf and immediately add it to your current shelf
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setCreatingNewShelf(false)}
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
            <div className="flex justify-end mt-4">
              <Button 
                onClick={handleCreateShelf} 
                disabled={!newShelfTitle || isCreatingShelf}
                className="px-6 py-2 text-base"
                variant="primary"
              >
                {isCreatingShelf ? "Creating..." : "Create & Add Shelf"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render the appropriate form based on selected content type
  const renderContentForm = () => {
    switch (type) {
      case "Markdown": return <MarkdownForm />;
      case "Nft": return <NftSearchDialog onSelect={handleNftSelect} />;
      case "Shelf": return <ShelfSelectionForm />;
      default: return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] h-[95vh] max-w-none p-0 border-0 rounded-none flex flex-col bg-background overflow-hidden" closeIcon={<X className="h-5 w-5" />}>
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <ContentTypeTabs />
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {renderContentForm()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewItemDialog; 