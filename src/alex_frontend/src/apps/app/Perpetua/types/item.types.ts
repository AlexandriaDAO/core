import { ShelfPublic, Item } from "@/../../declarations/perpetua/perpetua.did";
import React from 'react';

/** 
 * Core item-related types for the Perpetua app
 */

export interface ShelfDetailViewProps {
  shelf: ShelfPublic;
  orderedItems: [number, Item][];
  isEditMode: boolean;
  editedItems: [number, Item][];
  hasEditAccess: boolean;
  onBack?: () => void;
  onAddItem?: (shelf: ShelfPublic) => void;
  onViewItem?: (itemId: number) => void;
  onEnterEditMode: () => void;
  onCancelEditMode: () => void;
  onSaveItemOrder: () => Promise<void>;
  handleDragStart: (e: React.DragEvent, index: number) => void;
  handleDragOver: (e: React.DragEvent, index: number) => void;
  handleDragEnd: () => void;
  handleDrop: (e: React.DragEvent, index: number) => void;
  draggedIndex?: number | null;
  getDragItemStyle?: (index: number) => React.CSSProperties;
  settingsButton?: React.ReactNode;
} 