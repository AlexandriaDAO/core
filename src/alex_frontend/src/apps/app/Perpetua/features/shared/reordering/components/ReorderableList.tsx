import React, { ReactNode } from 'react';
import { ReorderableItem } from '../../../../types/reordering.types';

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
  
  // Optional draggable attribute - defaults to isEditMode
  draggable?: boolean;
}

/**
 * A reusable component for rendering a vertically reorderable list
 */
export const ReorderableList = <T extends ReorderableItem>({
  items,
  isEditMode,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  handleDrop,
  getDragItemStyle = () => ({}),
  renderItem,
  className = '',
  draggable
}: ReorderableListProps<T>) => {
  // Determine if items should be draggable
  const isDraggable = draggable !== undefined ? draggable : isEditMode;
  
  return (
    <div 
      className={`reorderable-list ${className}`}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          draggable={isDraggable}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          onDrop={(e) => handleDrop(e, index)}
          style={{
            ...getDragItemStyle(index),
            cursor: isDraggable ? 'grab' : 'default',
            transition: 'transform 0.2s, opacity 0.2s, box-shadow 0.2s',
          }}
          className="reorderable-list-item"
        >
          {renderItem(item, index, isEditMode)}
        </div>
      ))}
    </div>
  );
};

export default ReorderableList; 