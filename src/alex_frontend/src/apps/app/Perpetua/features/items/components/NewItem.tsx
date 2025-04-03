import React, { useState, useMemo } from "react";
import { Button } from "@/lib/components/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/lib/components/dialog";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Textarea } from "@/lib/components/textarea";
import { Shelf, Item } from "@/../../declarations/perpetua/perpetua.did";
import { X, Plus } from "lucide-react";
import NftSearchDialog from "./NftSearch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { selectUserShelves, selectSelectedShelf, NormalizedShelf } from "@/apps/app/Perpetua/state/perpetuaSlice";
import { toast } from "sonner";
import { ShelfForm } from "@/apps/app/Perpetua/features/shelf-management/components/NewShelf";
import { getActorPerpetua } from "@/features/auth/utils/authUtils";
import { loadShelves } from "@/apps/app/Perpetua/state";
import { Principal } from "@dfinity/principal";
import { useShelfOperations } from "@/apps/app/Perpetua/features/shelf-management/hooks/useShelfOperations";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NewItemDialogProps extends DialogProps {
  onSubmit: (content: string, type: "Nft" | "Markdown" | "Shelf", collectionType?: "NFT" | "SBT") => Promise<void>;
  shelves?: Shelf[] | NormalizedShelf[];
}

const NewItemDialog: React.FC<NewItemDialogProps> = ({ isOpen, onClose, onSubmit, shelves: propShelves }) => {
  const dispatch = useAppDispatch();
  const [content, setContent] = useState("");
  const [type, setType] = useState<"Nft" | "Markdown" | "Shelf">("Markdown");
  const [collectionType, setCollectionType] = useState<"NFT" | "SBT">("NFT");
  const [selectedShelfId, setSelectedShelfId] = useState<string>("");
  const [creatingNewShelf, setCreatingNewShelf] = useState(false);
  
  // States for shelf creation
  const [newShelfTitle, setNewShelfTitle] = useState("");
  const [newShelfDescription, setNewShelfDescription] = useState("");
  const [isCreatingShelf, setIsCreatingShelf] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get user principal directly from auth state - single source of truth
  const userPrincipal = useAppSelector(state => state.auth.user?.principal);
  
  // Get shelves from Redux store
  const allShelves = useAppSelector(selectUserShelves);
  const currentShelf = useAppSelector(selectSelectedShelf);

  // Get the shelf operations
  const { createAndAddShelfItem } = useShelfOperations();

  // Filter out the current shelf and any shelves already added as items
  const availableShelves = useMemo(() => {
    // If we have shelves from props, use those (for backwards compatibility)
    if (propShelves) return propShelves;
    
    if (!allShelves || !currentShelf) return [];
    
    // Find any shelves that are already added as items in the current shelf
    const shelvesInCurrentShelf = new Set<string>();
    
    if (currentShelf.items) {
      currentShelf.items.forEach(([key, item]: [number, Item]) => {
        if (item.content && 'Shelf' in item.content) {
          shelvesInCurrentShelf.add(item.content.Shelf);
        }
      });
    }
    
    // Filter out the current shelf and any shelves already in the current shelf
    return allShelves.filter((shelf) => 
      shelf.shelf_id !== currentShelf.shelf_id && 
      !shelvesInCurrentShelf.has(shelf.shelf_id)
    );
  }, [allShelves, currentShelf, propShelves]);

  // Reset form when dialog opens/closes or type changes
  React.useEffect(() => {
    setContent("");
    setSelectedShelfId("");
    setCreatingNewShelf(false);
    setNewShelfTitle("");
    setNewShelfDescription("");
  }, [isOpen, type]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // If type is Shelf, use the selected shelf ID as content
      const finalContent = type === "Shelf" ? selectedShelfId : content;
      
      // Validate content based on type
      if (!finalContent) {
        switch (type) {
          case "Markdown":
            toast.error("Please enter markdown content");
            break;
          case "Nft":
            toast.error("Please select an NFT");
            break;
          case "Shelf":
            toast.error("Please select a shelf");
            break;
        }
        return;
      }
      
      // Special validation for NFT content - it must be numeric
      if (type === "Nft" && !/^\d+$/.test(finalContent)) {
        toast.error("Invalid NFT ID format. The ID must be numeric.");
        console.error(`Invalid NFT ID format in NewItem.handleSubmit: ${finalContent}`);
        return;
      }
      
      console.log(`NewItem - Submitting ${type} item with content: ${finalContent}${type === "Nft" ? `, collection: ${collectionType}` : ''}`);
      
      try {
        // Call parent component's onSubmit function
        await onSubmit(finalContent, type, type === "Nft" ? collectionType : undefined);
        
        // Clear form fields
        setContent("");
        setSelectedShelfId("");
        setCreatingNewShelf(false);
        
        // Close dialog on success
        onClose();
        
        // Show success message
        toast.success(`Added ${type} content to shelf successfully`);
      } catch (error: any) {
        // Handle server errors
        const errorMessage = error?.message || "Failed to add content to shelf";
        toast.error(errorMessage);
        console.error(`Server error adding ${type} content:`, error);
      }
      
    } catch (error) {
      console.error(`Error in handleSubmit for ${type} content:`, error);
      toast.error(`Failed to add ${type} content. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // This function receives the numeric NFT ID from NftSearchDialog
  const handleNftSelect = (numericNftId: string, selectedCollectionType: "NFT" | "SBT") => {
    // Make sure the ID is valid
    if (!numericNftId) {
      toast.error("Invalid NFT ID. Please try selecting another NFT.");
      console.error("NewItem - Received empty NFT ID in handleNftSelect");
      return;
    }
    
    // Validate that we received a numeric ID
    if (!/^\d+$/.test(numericNftId)) {
      toast.error("Invalid NFT ID format. Expected a numeric ID.");
      console.error(`NewItem - Received non-numeric NFT ID: ${numericNftId}`);
      return;
    }
    
    // Store the numeric NFT ID and collection type
    console.log(`NewItem - Storing numeric NFT ID: ${numericNftId}, collection: ${selectedCollectionType}`);
    setContent(numericNftId);
    setCollectionType(selectedCollectionType);
  };
  
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
      
      // Use the new integrated function instead of the two-step process
      const newShelfId = await createAndAddShelfItem(
        currentShelf.shelf_id,
        newShelfTitle,
        newShelfDescription
      );
      
      if (newShelfId) {
        toast.success(`New shelf "${newShelfTitle}" created and added as a item`);
        
        // Clear the form
        setNewShelfTitle("");
        setNewShelfDescription("");
        
        // Close the dialog after successful creation and addition
        onClose();
      } else {
        toast.error("Failed to create and add shelf");
      }
    } catch (error) {
      console.error("Error creating and adding shelf:", error);
      toast.error("Failed to create and add shelf. See console for details.");
    } finally {
      setIsCreatingShelf(false);
    }
  };

  const renderContentTypeForm = () => {
    switch (type) {
      case "Markdown":
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4">
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
        
      case "Nft":
        return (
          <NftSearchDialog
            onSelect={(numericNftId, selectedCollectionType) => handleNftSelect(numericNftId, selectedCollectionType)}
          />
        );
        
      case "Shelf":
        return (
          <div className="flex-1 flex flex-col p-4">
            {!creatingNewShelf ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <Label htmlFor="shelfSelect" className="block mb-1">Select an existing shelf</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Add an existing shelf as a item in your current shelf
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
        
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] h-[95vh] max-w-none p-0 border-0 rounded-none flex flex-col bg-background overflow-hidden" closeIcon={<X className="h-5 w-5" />}>
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex justify-center py-4 border-b border-border flex-shrink-0">
            <div className="flex gap-4">
              <Button
                variant={type === "Markdown" ? "primary" : "outline"}
                onClick={() => setType("Markdown")}
                className="px-6 py-2 text-base"
              >
                Markdown
              </Button>
              <Button
                variant={type === "Nft" ? "primary" : "outline"}
                onClick={() => setType("Nft")}
                className="px-6 py-2 text-base"
              >
                NFT
              </Button>
              <Button
                variant={type === "Shelf" ? "primary" : "outline"}
                onClick={() => setType("Shelf")}
                className="px-6 py-2 text-base"
              >
                Shelf
              </Button>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {renderContentTypeForm()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewItemDialog; 