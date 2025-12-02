import { ShelfPublic } from "@/../../declarations/perpetua/perpetua.did";
import { NormalizedShelf } from "../state/perpetuaSlice";

/**
 * Core shelf-related types for the Perpetua app
 */

// Shelf card display types
export interface ShelfCardProps {
  shelf: ShelfPublic;
  onViewShelf?: (shelfId: string) => void;
  showOwner?: boolean;
  isReordering?: boolean;
  parentShelfId?: string;
  itemId?: number;
}

export interface PublicShelfCardProps {
  shelf: ShelfPublic;
  onViewShelf?: (shelfId: string) => void;
  isReordering?: boolean;
  parentShelfId?: string;
  itemId?: number;
}

// Shelf UI containers
export interface LibraryShelvesUIProps {
  shelves: ShelfPublic[];
  loading: boolean;
  onNewShelf: () => void;
  onViewShelf: (shelfId: string) => void;
}

export interface ExploreShelvesUIProps {
  shelves: ShelfPublic[];
  loading: boolean;
  onViewShelf: (shelfId: string) => void;
  onLoadMore: () => Promise<void>;
}

export interface UserShelvesUIProps {
  shelves: ShelfPublic[];
  loading: boolean;
  onViewShelf: (shelfId: string) => void;
  onViewOwner?: (ownerId: string) => void;
  onBack?: () => void;
  isCurrentUser?: boolean;
  onNewShelf?: () => void;
  isCreatingShelf?: boolean;
  ownerUsername?: string;
}

// Shelf management types
export type ContentType = "Nft" | "Markdown" | "Shelf";

export interface ShelfManagerProps {
  contentId: string;
  contentType: ContentType;
  currentShelfId?: string;
}

export interface ShelfOptionProps {
  shelf: ShelfPublic | NormalizedShelf;
  isSelected: boolean;
  onSelect: (shelfId: string) => void;
}

export interface ShelfContentProps {
  shelves: (ShelfPublic | NormalizedShelf)[];
  selectedShelfId: string | null;
  onSelectShelf: (shelfId: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isAddingContent: boolean;
  onAddToShelf: () => Promise<void>;
  onClose: () => void;
} 