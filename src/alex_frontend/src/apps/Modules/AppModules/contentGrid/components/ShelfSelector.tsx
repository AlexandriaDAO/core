import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/lib/components/button";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useIdentity } from "@/hooks/useIdentity";
import { selectShelves, selectLoading, selectSelectedShelf } from "@/apps/Modules/shared/state/perpetua/perpetuaSlice";
import { addSlot, loadShelves } from "@/apps/Modules/shared/state/perpetua/perpetuaThunks";

// Define the Shelf interface inline
interface Slot {
  id: number;
  content: {
    Nft?: string;
    Markdown?: string;
    Shelf?: string;
  };
}

interface Shelf {
  title: string;
  updated_at: bigint;
  owner: string;
  description?: string;
  created_at: bigint;
  shelf_id: string;
  rebalance_count: number;
  slots: [number, Slot][];
  needs_rebalance: boolean;
  slot_positions: [number, number][];
}

interface ShelfSelectorProps {
  nftId: string; // This is actually the arweaveId
  onClose: () => void;
}

const ShelfSelector: React.FC<ShelfSelectorProps> = ({ nftId: arweaveId, onClose }) => {
  const { identity } = useIdentity();
  const dispatch = useAppDispatch();
  const [selectedShelfId, setSelectedShelfId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shelves = useAppSelector(selectShelves);
  const isLoading = useAppSelector(selectLoading);
  const currentShelf = useAppSelector(selectSelectedShelf);
  
  // Get the arweaveToNftId mapping from Redux
  const arweaveToNftId = useAppSelector(state => state.nftData.arweaveToNftId);
  // Get the actual NFT ID from the mapping
  const actualNftId = arweaveToNftId[arweaveId];
  
  // Load shelves on mount if they aren't already loaded
  useEffect(() => {
    if (identity && (!shelves || shelves.length === 0)) {
      dispatch(loadShelves(identity.getPrincipal()));
    }
  }, [dispatch, identity, shelves]);
  
  // Filter out shelves that already have this NFT
  const availableShelves = React.useMemo(() => {
    if (!shelves || !shelves.length) return [];
    if (!actualNftId) return shelves; // Show all shelves if no actual NFT ID is found
    
    // Create a filtered list of shelves that don't already contain this NFT
    return shelves.filter(shelf => {
      // Check if this shelf already contains the NFT
      if (!shelf.slots) return true;
      
      // Check each slot to see if it contains this NFT
      const hasNft = Array.from(shelf.slots).some(([_, slot]) => {
        return slot.content && 'Nft' in slot.content && slot.content.Nft === actualNftId;
      });
      
      // Only include shelves that don't already have this NFT
      return !hasNft;
    });
  }, [shelves, actualNftId]);

  const handleSubmit = useCallback(async () => {
    if (!selectedShelfId || !identity) {
      toast.error("Please select a shelf");
      return;
    }
    
    // Check if we have the actual NFT ID
    if (!actualNftId) {
      toast.error("Could not find NFT ID for this item");
      console.error(`No NFT ID found for arweave ID: ${arweaveId}`);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Find the selected shelf
      const selectedShelf = shelves?.find(shelf => shelf.shelf_id === selectedShelfId);
      
      if (!selectedShelf) {
        toast.error("Selected shelf not found");
        return;
      }
      
      console.log(`Adding NFT with ID: ${actualNftId} to shelf: ${selectedShelf.title}`);
      
      // Add the NFT to the selected shelf using the actual NFT ID
      await dispatch(addSlot({ 
        shelf: selectedShelf, 
        content: actualNftId, // Use the actual NFT ID instead of arweaveId
        type: "Nft",
        principal: identity.getPrincipal()
      }));
      
      toast.success(`Added to shelf: ${selectedShelf.title}`);
      onClose();
    } catch (error) {
      console.error("Error adding NFT to shelf:", error);
      toast.error(`Failed to add NFT to shelf: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedShelfId, identity, shelves, dispatch, actualNftId, arweaveId, onClose]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your shelves...</p>
      </div>
    );
  }

  if (!shelves || shelves.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground">You don't have any shelves yet.</p>
        <Button 
          onClick={onClose} 
          className="mt-4"
        >
          Close
        </Button>
      </div>
    );
  }

  // Show message if NFT ID couldn't be found
  if (!actualNftId) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground">Could not find NFT data for this item.</p>
        <Button 
          onClick={onClose} 
          className="mt-4"
        >
          Close
        </Button>
      </div>
    );
  }

  if (availableShelves.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground">This NFT is already in all of your shelves.</p>
        <Button 
          onClick={onClose} 
          className="mt-4"
        >
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4">
      <p className="text-sm text-muted-foreground mb-4">
        Select a shelf to add this NFT to:
      </p>
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
      
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!selectedShelfId || isSubmitting}
          className="min-w-20"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            "Add to Shelf"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ShelfSelector; 