import React, { ReactNode } from 'react';
import { ReorderableItem } from '../../../../types/reordering.types';
import { cn } from '@/lib/utils';

export interface ReorderableContainerProps<T extends ReorderableItem> {
  items: T[];
  isEditMode: boolean;
  handleDragStart: (e: React.DragEvent, index: number) => void;
  handleDragOver: (e: React.DragEvent, index: number) => void;
  handleDragEnd: () => void;
  handleDrop: (e: React.DragEvent, index: number) => void;
  getDragItemStyle?: (index: number) => React.CSSProperties;
  renderItem: (item: T, index: number, isDragging: boolean) => ReactNode;
  className?: string;
  itemClassName?: string;
  containerClassName?: string;
  draggable?: boolean;
}

/**
 * Base component for reorderable containers (grid or list)
 */
export const ReorderableContainer = <T extends ReorderableItem>({
  items,
  isEditMode,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  handleDrop,
  getDragItemStyle = () => ({}),
  renderItem,
  className = '',
  itemClassName = '',
  containerClassName = '',
  draggable
}: ReorderableContainerProps<T>) => {
  const isDraggable = draggable !== undefined ? draggable : isEditMode;
  
  return (
    <div className={cn(containerClassName, className)}>
      {items.map((item, index) => (
        <div
          key={item.id}
          draggable={isDraggable}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          onDrop={(e) => handleDrop(e, index)}
          style={getDragItemStyle(index)}
          className={cn(
            'transition-all duration-200',
            isDraggable ? 'cursor-grab' : 'cursor-default',
            itemClassName
          )}
        >
          {renderItem(item, index, isEditMode)}
        </div>
      ))}
    </div>
  );
};

export default ReorderableContainer; 