import React from "react";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Search } from "lucide-react";
import { ScrollArea } from "@/lib/components/scroll-area";
import { ShelfOption } from "./ShelfOption";
import { ShelfContentProps } from "../types";

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
    <div onClick={handleClick}>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search shelves..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <ScrollArea className="max-h-[300px] mt-2">
        {shelves.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchTerm 
              ? "No shelves match your search" 
              : "You don't have any shelves you can edit"}
          </div>
        ) : (
          <div className="space-y-2 p-1">
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
      
      <div className="flex justify-end gap-2 mt-4">
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