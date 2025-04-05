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
}) => (
  <div className="flex flex-col items-center justify-center h-full py-10 text-center">
    <p className="mb-4 text-muted-foreground">This shelf is empty.</p>
    
    {hasEditAccess && (
      <Button
        variant="outline"
        className="flex items-center gap-2 text-sm h-9"
        onClick={() => onAddItem(shelf)}
      >
        <Plus className="w-4 h-4" />
        Add First Item
      </Button>
    )}
  </div>
);

export default ShelfEmptyView; 