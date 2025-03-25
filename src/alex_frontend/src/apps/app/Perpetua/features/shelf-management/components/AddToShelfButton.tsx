import React, { useState } from "react";
import { Button } from "@/lib/components/button";
import { Plus } from "lucide-react";
import { ShelfSelectionDialog } from "./ShelfSelectionDialog";
import { ShelfManagerProps } from "../types";
import { useAddToShelf } from "../hooks/useAddToShelf";

interface AddToShelfButtonProps extends ShelfManagerProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

/**
 * Button component that allows adding content to a shelf
 * 
 * This component renders a plus button that, when clicked, opens a dialog
 * allowing the user to select a shelf to add the content to.
 */
export const AddToShelfButton: React.FC<AddToShelfButtonProps> = ({ 
  contentId, 
  contentType, 
  currentShelfId,
  position = "top-right" 
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { hasEditableShelvesExcluding, isLoggedIn } = useAddToShelf();
  
  // Only render if user has shelves they can edit
  const hasAvailableShelves = hasEditableShelvesExcluding(currentShelfId);
  if (!hasAvailableShelves || !isLoggedIn) return null;
  
  // Get position classes based on the position prop
  const getPositionClasses = (pos: string) => {
    switch (pos) {
      case "top-right": return "top-2 right-2";
      case "top-left": return "top-2 left-2";
      case "bottom-right": return "bottom-2 right-2";
      case "bottom-left": return "bottom-2 left-2";
      default: return "top-2 right-2";
    }
  };
  
  return (
    <>
      {/* Button to trigger the dialog */}
      <Button 
        onClick={(e) => { 
          e.stopPropagation(); 
          e.preventDefault(); 
          setDialogOpen(true);
        }}
        className={`absolute ${getPositionClasses(position)} z-10 bg-background/80 backdrop-blur-sm h-8 w-8 p-0`}
        variant="secondary"
      >
        <Plus className="h-4 w-4" />
      </Button>
      
      {/* Dialog for shelf selection */}
      <ShelfSelectionDialog
        contentId={contentId}
        contentType={contentType}
        currentShelfId={currentShelfId}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}; 