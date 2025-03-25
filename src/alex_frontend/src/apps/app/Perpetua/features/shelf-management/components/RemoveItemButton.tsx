import React, { useCallback } from "react";
import { Button } from "@/lib/components/button";
import { Trash2 } from "lucide-react";
import { useShelfOperations } from "../hooks/useShelfOperations";
import { toast } from "sonner";
import { useContentPermissions } from "@/apps/app/Perpetua/hooks/useContentPermissions";
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

interface RemoveItemButtonProps {
  shelfId: string;
  itemId: number;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  buttonSize?: "sm" | "md";
  label?: string; // Optional label to show instead of just the icon
  variant?: "destructive" | "outline" | "secondary" | "ghost" | "link" | "muted" | "primary" | "inverted" | "constructive" | "info" | "warning";
}

/**
 * Button component that allows removing a item from a shelf
 * 
 * This component renders a trash button that, when clicked, opens a confirmation dialog
 * before removing the item from the shelf.
 */
export const RemoveItemButton: React.FC<RemoveItemButtonProps> = ({ 
  shelfId, 
  itemId,
  position = "top-right",
  buttonSize = "sm",
  label,
  variant = "secondary"
}) => {
  const { removeItem } = useShelfOperations();
  const { checkEditAccess } = useContentPermissions();
  
  // Only render if user has edit access to the shelf
  const hasEditAccess = checkEditAccess(shelfId);
  if (!hasEditAccess) return null;
  
  // Get size classes based on the size prop
  const getSizeClasses = (size: string) => {
    switch (size) {
      case "sm": return "h-8 w-8 p-0";
      case "md": return "h-10";
      default: return "h-8 w-8 p-0";
    }
  };
  
  // Handle item removal
  const handleRemoveItem = useCallback(async () => {
    console.log(`Removing item ${itemId} from shelf ${shelfId}`);
    try {
      const success = await removeItem(shelfId, itemId);
      
      if (success) {
        toast.success("Item removed from shelf");
      } else {
        toast.error("Failed to remove item from shelf");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Error removing item from shelf");
    }
  }, [shelfId, itemId, removeItem]);
  
  // Handle button click
  const handleButtonClick = (e: React.MouseEvent) => {
    // Prevent event from reaching card or other elements
    e.stopPropagation();
    e.preventDefault();
  };
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          onClick={handleButtonClick}
          className={`${getSizeClasses(buttonSize)}`}
          variant={variant}
        >
          <Trash2 className="h-4 w-4" />
          {label && <span className="ml-2">{label}</span>}
        </Button>
      </AlertDialogTrigger>
      
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
  );
}; 