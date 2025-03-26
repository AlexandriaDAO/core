import { useState, useCallback } from 'react';

/**
 * Generic hook to handle drag-and-drop reordering for any collection of items
 * @param onReorder Function to call when items are reordered
 * @returns Drag and drop handlers and state
 */
export const useDragAndDropReordering = <T>(
  onReorder: (dragIndex: number, dropIndex: number) => void
) => {
  // Track drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Handle drag start
  const handleDragStart = useCallback((index: number) => {
    console.log(`Drag started: ${index}`);
    setDraggedIndex(index);
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }, [draggedIndex]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    console.log('Drag ended');
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      console.log(`Dropping item from ${draggedIndex} to ${dropIndex}`);
      onReorder(draggedIndex, dropIndex);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, onReorder]);

  // Determine the visual style for an item based on drag state
  const getDragItemStyle = useCallback((index: number) => {
    if (draggedIndex === index) {
      return { opacity: 0.5 };
    }
    
    if (dragOverIndex === index) {
      return { borderTop: '2px dashed #4299e1' };
    }
    
    return {};
  }, [draggedIndex, dragOverIndex]);

  return {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    getDragItemStyle,
    resetDragState: () => {
      setDraggedIndex(null);
      setDragOverIndex(null);
    }
  };
};

export default useDragAndDropReordering; 