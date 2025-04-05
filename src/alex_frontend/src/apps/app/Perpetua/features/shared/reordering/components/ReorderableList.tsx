import React, { ReactNode } from 'react';
import { ReorderableItem } from '../../../../types/reordering.types';
import ReorderableContainer from './ReorderableContainer';
import { cn } from '@/lib/utils';

interface ReorderableListProps<T extends ReorderableItem> {
  // Items to render
  items: T[];
  
  // Whether edit mode is enabled
  isEditMode: boolean;
  
  // Drag and drop handlers
  handleDragStart: (e: React.DragEvent, index: number) => void;
  handleDragOver: (e: React.DragEvent, index: number) => void;
  handleDragEnd: () => void;
  handleDrop: (e: React.DragEvent, index: number) => void;
  
  // Function to get drag styling
  getDragItemStyle?: (index: number) => React.CSSProperties;
  
  // Render function for each item
  renderItem: (item: T, index: number, isDragging: boolean) => ReactNode;
  
  // Optional class name for the container
  className?: string;
  
  // Optional spacing between items
  spacing?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10;
  
  // Optional draggable attribute - defaults to isEditMode
  draggable?: boolean;
}

/**
 * A vertical list layout for reorderable items
 */
export const ReorderableList = <T extends ReorderableItem>({
  items,
  isEditMode,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  handleDrop,
  getDragItemStyle,
  renderItem,
  className,
  spacing = 2,
  draggable
}: ReorderableListProps<T>) => {
  const gap = {
    0: 'gap-0',
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8',
    10: 'gap-10'
  }[spacing];

  return (
    <ReorderableContainer
      items={items}
      isEditMode={isEditMode}
      handleDragStart={handleDragStart}
      handleDragOver={handleDragOver}
      handleDragEnd={handleDragEnd}
      handleDrop={handleDrop}
      getDragItemStyle={getDragItemStyle}
      renderItem={renderItem}
      className={className}
      containerClassName={cn('flex flex-col w-full', gap)}
      draggable={draggable}
    />
  );
};

export default ReorderableList; 