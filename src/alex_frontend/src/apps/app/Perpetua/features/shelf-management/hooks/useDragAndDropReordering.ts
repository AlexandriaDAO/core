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
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    console.log(`Drag started: ${index}`);
    setDraggedIndex(index);
    
    // Create custom drag image
    const draggedElement = e.currentTarget as HTMLElement;
    
    // Create a clone of the element for the drag image
    const dragImage = draggedElement.cloneNode(true) as HTMLElement;
    dragImage.style.width = `${draggedElement.offsetWidth}px`;
    dragImage.style.height = `${draggedElement.offsetHeight}px`;
    dragImage.style.opacity = '0.8';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px'; // Position offscreen
    dragImage.style.backgroundColor = 'white';
    dragImage.style.border = '2px solid #4299e1';
    dragImage.style.borderRadius = '4px';
    dragImage.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    
    // Append to body temporarily
    document.body.appendChild(dragImage);
    
    // Set the custom drag image
    e.dataTransfer.setDragImage(dragImage, draggedElement.offsetWidth / 2, draggedElement.offsetHeight / 2);
    
    // Remove the element after drag starts
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
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
      return { 
        opacity: 0.5,
        transform: 'scale(0.98)',
        boxShadow: '0 0 0 2px #4299e1',
        transition: 'all 0.2s ease'
      };
    }
    
    if (dragOverIndex === index) {
      return { 
        borderTop: '2px dashed #4299e1',
        backgroundColor: 'rgba(66, 153, 225, 0.05)',
        transform: 'scale(1.02)',
        transition: 'all 0.2s ease'
      };
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