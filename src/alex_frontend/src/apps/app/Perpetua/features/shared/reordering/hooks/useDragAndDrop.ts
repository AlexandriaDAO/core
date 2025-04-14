import { useState, useCallback } from 'react';

/**
 * Hook for managing drag-and-drop reordering state and handlers
 */
export const useDragAndDrop = <T>(items: T[], onReorder: (newItems: T[]) => void) => {
  // State for tracking drag operation
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    
    // Create custom drag image for better UX
    const draggedElement = e.currentTarget as HTMLElement;
    
    const dragImage = draggedElement.cloneNode(true) as HTMLElement;
    dragImage.style.width = `${draggedElement.offsetWidth}px`;
    dragImage.style.height = `${draggedElement.offsetHeight}px`;
    dragImage.style.opacity = '0.8';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.backgroundColor = 'white';
    dragImage.style.border = '2px solid #4299e1';
    dragImage.style.borderRadius = '4px';
    dragImage.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    
    document.body.appendChild(dragImage);
    
    e.dataTransfer.setDragImage(
      dragImage, 
      draggedElement.offsetWidth / 2, 
      draggedElement.offsetHeight / 2
    );
    
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
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent, index: number) => {
    console.log(`[useDragAndDrop] handleDrop called. Received index: ${index}, Current draggedIndex: ${draggedIndex}`);
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) {
      console.log(`[useDragAndDrop] handleDrop: No action needed (draggedIndex: ${draggedIndex}, target index: ${index})`);
      return;
    }
    
    // Create new item order by moving the dragged item
    const updatedItems = [...items];
    const [draggedItem] = updatedItems.splice(draggedIndex, 1);
    console.log(`[useDragAndDrop] handleDrop: Splicing dragged item (${draggedIndex}) into target index: ${index}`);
    updatedItems.splice(index, 0, draggedItem);
    
    // Notify parent of the reordering
    onReorder(updatedItems);
    
    // Reset drag state
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, items, onReorder, dragOverIndex]);

  // Determine visual style for dragged items
  const getDragItemStyle = useCallback((index: number) => {
    if (draggedIndex === index) {
      return { 
        opacity: 0.5,
        transform: 'scale(0.98)',
        boxShadow: '0 0 0 2px #4299e1',
      };
    }
    
    if (dragOverIndex === index) {
      return { 
        borderTop: '2px dashed #4299e1',
        backgroundColor: 'rgba(66, 153, 225, 0.05)',
        transform: 'scale(1.02)',
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
    getDragItemStyle
  };
}; 