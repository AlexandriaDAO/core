import React, { ReactNode } from 'react';
import { ReorderableItem } from '../../../../types/reordering.types';
import ReorderableContainer from './ReorderableContainer';
import { cn } from '@/lib/utils';

interface ReorderableGridProps<T extends ReorderableItem> {
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
  
  // Grid configuration
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10;
  
  // Optional draggable attribute - defaults to isEditMode
  draggable?: boolean;
}

/**
 * A grid layout for reorderable items
 */
export const ReorderableGrid = <T extends ReorderableItem>({
  items,
  isEditMode,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  handleDrop,
  getDragItemStyle,
  renderItem,
  className,
  columns = 3,
  gap = 4,
  draggable
}: ReorderableGridProps<T>) => {
  const gridColumns = {
    1: 'grid-cols-1',
    2: 'grid-cols-2', 
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8',
    9: 'grid-cols-9',
    10: 'grid-cols-10',
    11: 'grid-cols-11',
    12: 'grid-cols-12'
  }[columns];

  const gridGap = {
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8',
    10: 'gap-10'
  }[gap];

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
      containerClassName={cn('grid w-full', gridColumns, gridGap)}
      itemClassName="rounded-md overflow-hidden"
      draggable={draggable}
    />
  );
};

export default ReorderableGrid; 