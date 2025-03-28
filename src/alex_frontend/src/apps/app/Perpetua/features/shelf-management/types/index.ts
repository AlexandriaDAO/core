import { Shelf } from "../../../../../../../../declarations/perpetua/perpetua.did";
import { NormalizedShelf } from "@/apps/Modules/shared/state/perpetua/perpetuaSlice";

export type ContentType = "Nft" | "Markdown" | "Shelf";

export interface ShelfManagerProps {
  contentId: string;
  contentType: ContentType;
  currentShelfId?: string;
}

export interface ShelfOptionProps {
  shelf: Shelf | NormalizedShelf;
  isSelected: boolean;
  onSelect: (shelfId: string) => void;
}

export interface ShelfContentProps {
  shelves: (Shelf | NormalizedShelf)[];
  selectedShelfId: string | null;
  onSelectShelf: (shelfId: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isAddingContent: boolean;
  onAddToShelf: () => Promise<void>;
  onClose: () => void;
} 