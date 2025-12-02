import { ShelfPublic } from "../../../../../../../declarations/perpetua/perpetua.did";

export interface ShelfSettingsDialogProps {
  shelf: ShelfPublic;
  onUpdateMetadata?: (shelfId: string, title: string, description?: string) => Promise<boolean>;
  className?: string;
}

export interface ShelfInformationSectionProps {
  shelf: ShelfPublic;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  isOwner: boolean;
  appearsIn: string[];
  editingField: "title" | "description" | null;
  toggleFieldEdit: (field: "title" | "description" | null) => void;
  isDirty: boolean;
  isSavingMetadata: boolean;
  handleSaveChanges: () => Promise<void>;
  handleCancelChanges: () => void;
  onUpdateMetadata?: (shelfId: string, title: string, description?: string) => Promise<boolean>;
}

export interface PublicAccessSectionProps {
  isOwner: boolean;
  isPublic: boolean;
  isPublicLoading: boolean;
  isTogglingPublic: boolean;
  shelfId: string;
  handlePublicAccessToggle: (enabled: boolean) => Promise<void>;
}

export interface TagsSectionProps {
  isOwner: boolean;
  tags: string[];
  setTags: (tags: string[]) => void;
  tagInput: string;
  setTagInput: (input: string) => void;
  tagError: string | null;
  tagLimitReached: boolean;
  isAddingTag: boolean;
  removingTagId: string | null;
  handleAddTag: () => Promise<void>;
  handleRemoveTag: (tag: string) => Promise<void>;
  handleTagKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onUpdateMetadata?: (shelfId: string, title: string, description?: string) => Promise<boolean>;
}

export interface GeneralSettingsTabProps {
  shelf: ShelfPublic;
  isOwner: boolean;
  isPublic: boolean;
  isPublicLoading: boolean;
  isTogglingPublic: boolean;
  onUpdateMetadata?: (shelfId: string, title: string, description?: string) => Promise<boolean>;
  handlePublicAccessToggle: (enabled: boolean) => Promise<void>;
}

export interface CollaboratorsTabProps {
  shelfId: string;
} 