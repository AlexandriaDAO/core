import React from "react";
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
import { cn } from "@/lib/utils";

interface RemoveItemButtonProps {
  shelfId: string;
  itemId: number;
  buttonSize?: "sm" | "md";
  label?: string;
  variant?: "destructive" | "outline" | "secondary" | "ghost" | "link";
}

/**
 * Button component that allows removing an item from a shelf
 * 
 * This component renders a trash button that, when clicked, opens a confirmation dialog
 * before removing the item from the shelf.
 */
export const RemoveItemButton: React.FC<RemoveItemButtonProps> = ({ 
  shelfId, 
  itemId,
  buttonSize = "sm",
  label,
  variant = "secondary"
}) => {
  const { removeItem } = useShelfOperations();
  const { checkEditAccess } = useContentPermissions();
  
  // Only render if user has edit access to the shelf
  const hasEditAccess = checkEditAccess(shelfId);
  if (!hasEditAccess) return null;
  
  const handleRemoveItem = async () => {
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
  };
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          onClick={(e) => e.stopPropagation()}
          className={cn(
            buttonSize === "sm" ? "h-8 p-0" : "h-10", 
            !label && buttonSize === "sm" ? "w-8" : ""
          )}
          variant={variant}
        >
          <Trash2 className="h-4 w-4" />
          {label && <span className="ml-2">{label}</span>}
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove item from shelf</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove this item from the shelf? 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleRemoveItem}>
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}; 