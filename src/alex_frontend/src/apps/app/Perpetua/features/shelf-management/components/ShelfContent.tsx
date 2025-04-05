import React from "react";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Search } from "lucide-react";
import { ScrollArea } from "@/lib/components/scroll-area";
import { ShelfOption } from "./ShelfOption";
import { ShelfContentProps } from "../../../types/shelf.types";

/**
 * Component for displaying the content of shelf selection dialogs
 * Reused across different shelf selection interfaces
 */
export const ShelfContent: React.FC<ShelfContentProps> = ({
  shelves,
  selectedShelfId,
  onSelectShelf,
  searchTerm,
  onSearchChange,
  isAddingContent,
  onAddToShelf,
  onClose
}) => {
  // Handle click to prevent propagation
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search shelves..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <ScrollArea className="h-[300px] pr-3">
        {shelves.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground p-4">
            {searchTerm 
              ? "No shelves match your search" 
              : "You don't have any shelves you can edit"}
          </div>
        ) : (
          <div className="space-y-2">
            {shelves.map((shelf) => (
              <ShelfOption
                key={shelf.shelf_id}
                shelf={shelf}
                isSelected={selectedShelfId === shelf.shelf_id}
                onSelect={onSelectShelf}
              />
            ))}
          </div>
        )}
      </ScrollArea>
      
      <div className="flex justify-end gap-2 mt-2">
        <Button variant="outline" onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}>
          Cancel
        </Button>
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onAddToShelf();
          }} 
          disabled={!selectedShelfId || isAddingContent}
        >
          {isAddingContent ? "Adding..." : "Add to Shelf"}
        </Button>
      </div>
    </div>
  );
}; 