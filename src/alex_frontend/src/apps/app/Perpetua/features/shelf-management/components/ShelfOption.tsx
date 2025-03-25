import React from "react";
import { ShelfOptionProps } from "../types";

/**
 * Component for displaying a selectable shelf option
 * Reused across different shelf selection interfaces
 */
export const ShelfOption: React.FC<ShelfOptionProps> = ({ shelf, isSelected, onSelect }) => {
  // Handle click with stopPropagation
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(shelf.shelf_id);
  };

  return (
    <div
      className={`p-3 rounded-md cursor-pointer transition-colors ${
        isSelected 
          ? "bg-primary/10 border border-primary" 
          : "hover:bg-secondary border border-transparent"
      }`}
      onClick={handleClick}
    >
      <div className="font-medium">{shelf.title}</div>
      <div className="text-sm text-muted-foreground line-clamp-1">
        {shelf.description?.[0] || ""}
      </div>
    </div>
  );
}; 