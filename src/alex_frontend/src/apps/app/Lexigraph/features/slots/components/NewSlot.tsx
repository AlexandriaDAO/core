import React, { useState, useMemo } from "react";
import { Button } from "@/lib/components/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/lib/components/dialog";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Textarea } from "@/lib/components/textarea";
import { Shelf } from "../../../../../../../../declarations/lexigraph/lexigraph.did";
import { X } from "lucide-react";
import NftSearchDialog from "./NftSearch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { selectShelves, selectSelectedShelf } from "@/apps/Modules/shared/state/lexigraph/lexigraphSlice";
import { toast } from "sonner";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NewSlotDialogProps extends DialogProps {
  onSubmit: (content: string, type: "Nft" | "Markdown" | "Shelf") => Promise<void>;
  shelves?: Shelf[];
}

const NewSlotDialog = ({ isOpen, onClose, onSubmit, shelves: propShelves }: NewSlotDialogProps) => {
  const [content, setContent] = useState("");
  const [type, setType] = useState<"Nft" | "Markdown" | "Shelf">("Markdown");
  const [selectedShelfId, setSelectedShelfId] = useState<string>("");
  
  // Get shelves from Redux store
  const allShelves = useAppSelector(selectShelves);
  const currentShelf = useAppSelector(selectSelectedShelf);

  // Filter out the current shelf and any shelves already added as slots
  const availableShelves = useMemo(() => {
    // If we have shelves from props, use those (for backwards compatibility)
    if (propShelves) return propShelves;
    
    if (!allShelves || !currentShelf) return [];
    
    // Find any shelves that are already added as slots in the current shelf
    const shelvesInCurrentShelf = new Set<string>();
    
    if (currentShelf.slots) {
      currentShelf.slots.forEach(([_, slot]) => {
        if (slot.content && 'Shelf' in slot.content) {
          shelvesInCurrentShelf.add(slot.content.Shelf);
        }
      });
    }
    
    // Filter out the current shelf and any shelves already in the current shelf
    return allShelves.filter(shelf => 
      shelf.shelf_id !== currentShelf.shelf_id && 
      !shelvesInCurrentShelf.has(shelf.shelf_id)
    );
  }, [allShelves, currentShelf, propShelves]);

  const handleSubmit = async () => {
    // If type is Shelf, use the selected shelf ID as content
    const finalContent = type === "Shelf" ? selectedShelfId : content;
    await onSubmit(finalContent, type);
    setContent("");
    setSelectedShelfId("");
  };

  const handleNftSelect = (nftId: string) => {
    setContent(nftId);
  };

  const handleNftSubmit = async () => {
    if (content) {
      await onSubmit(content, "Nft");
    } else {
      toast.error("Please select an NFT first");
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
            {type === "Markdown" ? (
              <div className="flex-1 flex flex-col h-full p-4">
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter markdown content..."
                  className="flex-1 text-base p-4 resize-none"
                />
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={handleSubmit} 
                    className="px-6 py-2 text-base"
                  >
                    Create
                  </Button>
                </div>
              </div>
            ) : type === "Nft" ? (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <NftSearchDialog onSelect={handleNftSelect} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col p-4">
                <select
                  id="shelfSelect"
                  value={selectedShelfId}
                  onChange={(e) => setSelectedShelfId(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a shelf...</option>
                  {availableShelves.map((shelf) => (
                    <option key={shelf.shelf_id} value={shelf.shelf_id}>
                      {shelf.title}
                    </option>
                  ))}
                </select>
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={handleSubmit} 
                    disabled={!selectedShelfId}
                    className="px-6 py-2 text-base"
                  >
                    Create
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewSlotDialog; 