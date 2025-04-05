import React from "react";
import { ShelfOptionProps } from "../../../types/shelf.types";
import { cn } from "@/lib/utils";

/**
 * Component for displaying a selectable shelf option
 * Reused across different shelf selection interfaces
 */
export const ShelfOption: React.FC<ShelfOptionProps> = ({ shelf, isSelected, onSelect }) => {
  return (
    <div
      className={cn(
        "p-3 rounded-md cursor-pointer transition-all hover:bg-secondary/50",
        isSelected 
          ? "bg-primary/10 border border-primary shadow-sm" 
          : "border border-transparent"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(shelf.shelf_id);
      }}
    >
      <div className="font-medium truncate">{shelf.title}</div>
      {shelf.description?.[0] && (
        <div className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
          {shelf.description[0]}
        </div>
      )}
    </div>
  );
}; 