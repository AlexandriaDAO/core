import React from 'react';
import { Button } from "@/lib/components/button";
import { Plus } from "lucide-react";

interface ShelfEmptyViewProps {
  hasEditAccess: boolean;
  onAddItem: ((shelf: any) => void) | (() => void);
  shelf: any;
}

export const ShelfEmptyView: React.FC<ShelfEmptyViewProps> = ({
  hasEditAccess,
  onAddItem,
  shelf
}) => {
  // Safe way to call onAddItem with the shelf
  const handleAddItem = () => {
    onAddItem(shelf);
  };

  return (
    <div className="text-center py-10 text-muted-foreground h-full flex flex-col items-center justify-center">
      <p className="mb-2">This shelf is empty.</p>
      {hasEditAccess && (
        <Button
          variant="outline"
          className="flex items-center gap-1 mx-auto"
          onClick={handleAddItem}
        >
          <Plus className="w-4 h-4" />
          Add First Item
        </Button>
      )}
    </div>
  );
};

export default ShelfEmptyView; 