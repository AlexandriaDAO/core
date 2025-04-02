import React, { ReactNode } from 'react';
import { ReorderableItem } from '../../../../types/reordering.types';

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
  columns?: number;
  gap?: number;
  
  // Optional draggable attribute - defaults to isEditMode
  draggable?: boolean;
}

/**
 * A reusable component for rendering a grid of reorderable items
 */
export const ReorderableGrid = <T extends ReorderableItem>({
  items,
  isEditMode,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  handleDrop,
  getDragItemStyle = () => ({}),
  renderItem,
  className = '',
  columns = 3,
  gap = 16,
  draggable
}: ReorderableGridProps<T>) => {
  // Determine if items should be draggable
  const isDraggable = draggable !== undefined ? draggable : isEditMode;
  
  return (
    <div 
      className={`reorderable-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
        width: '100%'
      }}
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
            borderRadius: '4px',
            overflow: 'hidden',
          }}
          className="reorderable-grid-item"
        >
          {renderItem(item, index, isEditMode)}
        </div>
      ))}
    </div>
  );
};

export default ReorderableGrid; 