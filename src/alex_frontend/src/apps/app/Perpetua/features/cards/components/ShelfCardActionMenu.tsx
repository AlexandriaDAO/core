import React, { useState } from "react";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/lib/components/dropdown-menu";
import { Button } from "@/lib/components/button";
import { ShelfSelectionDialog } from "../../shelf-management/components/ShelfSelectionDialog";
import { useAddToShelf } from "../../shelf-management/hooks/useAddToShelf";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/lib/components/alert-dialog";
import { useShelfOperations } from "../../shelf-management/hooks/useShelfOperations";
import { useContentPermissions } from "../../../hooks/useContentPermissions";
import { toast } from "sonner";

interface ShelfCardActionMenuProps {
  contentId: string;
  contentType: "Nft" | "Markdown" | "Shelf";
  currentShelfId?: string;
  parentShelfId?: string;
  itemId?: number;
  className?: string;
}

/**
 * A dropdown menu component that combines AddToShelfButton and RemoveItemButton functionality
 * 
 * This menu is triggered by a three-dots icon button and provides actions for
 * adding the content to a shelf and/or removing it from its parent shelf.
 */
export const ShelfCardActionMenu: React.FC<ShelfCardActionMenuProps> = ({
  contentId,
  contentType,
  currentShelfId,
  parentShelfId,
  itemId,
  className
}) => {
  const [open, setOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  
  const { hasEditableShelvesExcluding, isLoggedIn } = useAddToShelf();
  const { removeItem } = useShelfOperations();
  const { checkEditAccess } = useContentPermissions();
  
  // Only show add to shelf option if user has shelves they can edit
  const hasAvailableShelves = hasEditableShelvesExcluding(currentShelfId);
  const canAddToShelf = hasAvailableShelves && isLoggedIn;
  
  // Only show remove item option if the user has edit access to the parent shelf
  const canRemoveItem = parentShelfId && itemId && checkEditAccess(parentShelfId);
  
  // If neither action is available, don't render the menu
  if (!canAddToShelf && !canRemoveItem) return null;

  const handleTriggerClick = (e: React.MouseEvent) => {
    // Prevent event propagation to avoid triggering card clicks
    e.stopPropagation();
    e.preventDefault();
    setOpen(!open);
  };

  // Handle item removal
  const handleRemoveItem = async () => {
    if (!parentShelfId || !itemId) return;
    
    console.log(`Removing item ${itemId} from shelf ${parentShelfId}`);
    try {
      const success = await removeItem(parentShelfId, itemId);
      
      if (success) {
        toast.success("Item removed from shelf");
      } else {
        toast.error("Failed to remove item from shelf");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Error removing item from shelf");
    }
    
    setRemoveDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`h-8 w-8 p-0 absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm hover:bg-muted ${className}`}
            onClick={handleTriggerClick}
            aria-label="Open actions menu"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          side="bottom"
          onClick={(e) => e.stopPropagation()}
          className="w-48"
        >
          {canAddToShelf && (
            <DropdownMenuItem 
              onClick={(e) => {
                e.preventDefault();
                setAddDialogOpen(true);
                setOpen(false);
              }}
              className="cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to shelf
            </DropdownMenuItem>
          )}
          
          {canRemoveItem && (
            <DropdownMenuItem 
              onClick={(e) => {
                e.preventDefault();
                setRemoveDialogOpen(true);
                setOpen(false);
              }}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove from shelf
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Dialog for shelf selection when adding to shelf */}
      <ShelfSelectionDialog
        contentId={contentId}
        contentType={contentType}
        currentShelfId={currentShelfId}
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
      />
      
      {/* Confirmation dialog for removing from shelf */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent onClick={e => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove item from shelf</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from the shelf? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={e => e.stopPropagation()}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveItem}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}; 