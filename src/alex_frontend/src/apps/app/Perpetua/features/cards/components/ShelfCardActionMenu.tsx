import React from "react";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/lib/components/dropdown-menu";
import { Button } from "@/lib/components/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/lib/components/alert-dialog";
import { ShelfSelectionDialog } from "../../shelf-management/components/ShelfSelectionDialog";
import { useAddToShelf } from "../../shelf-management/hooks/useAddToShelf";
import { useShelfOperations } from "../../shelf-management/hooks/useShelfOperations";
import { useContentPermissions } from "../../../hooks/useContentPermissions";

interface ShelfCardActionMenuProps {
  contentId: string;
  contentType: "Nft" | "Markdown" | "Shelf";
  currentShelfId?: string;
  parentShelfId?: string;
  itemId?: number;
  className?: string;
}

/**
 * Dropdown menu providing actions for shelf content management
 */
export const ShelfCardActionMenu = ({
  contentId,
  contentType,
  currentShelfId,
  parentShelfId,
  itemId,
  className
}: ShelfCardActionMenuProps) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = React.useState(false);
  
  const { hasEditableShelvesExcluding, isLoggedIn } = useAddToShelf();
  const { removeItem } = useShelfOperations();
  const { checkEditAccess } = useContentPermissions();
  
  const hasAvailableShelves = hasEditableShelvesExcluding(currentShelfId);
  const canAddToShelf = hasAvailableShelves && isLoggedIn;
  const canRemoveItem = Boolean(parentShelfId && itemId && checkEditAccess(parentShelfId));
  
  // If no actions are available, don't render the menu
  if (!canAddToShelf && !canRemoveItem) return null;

  const handleRemoveItem = async () => {
    if (!parentShelfId || !itemId) return;
    
    try {
      const success = await removeItem(parentShelfId, itemId);
      success 
        ? toast.success("Item removed from shelf")
        : toast.error("Failed to remove item from shelf");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Error removing item from shelf");
    }
    
    setRemoveDialogOpen(false);
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`h-8 w-8 p-0 absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm hover:bg-muted ${className ?? ""}`}
            onClick={(e) => {
              stopPropagation(e);
              setMenuOpen(!menuOpen);
            }}
            aria-label="Open actions menu"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" onClick={stopPropagation} className="w-48">
          {canAddToShelf && (
            <DropdownMenuItem 
              onClick={(e) => {
                stopPropagation(e);
                setAddDialogOpen(true);
                setMenuOpen(false);
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
                stopPropagation(e);
                setRemoveDialogOpen(true);
                setMenuOpen(false);
              }}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove from shelf
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {canAddToShelf && (
        <ShelfSelectionDialog
          contentId={contentId}
          contentType={contentType}
          currentShelfId={currentShelfId}
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
        />
      )}
      
      {canRemoveItem && (
        <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
          <AlertDialogContent onClick={stopPropagation}>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove item from shelf</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this item from the shelf? 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={stopPropagation}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemoveItem}>Remove</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}; 