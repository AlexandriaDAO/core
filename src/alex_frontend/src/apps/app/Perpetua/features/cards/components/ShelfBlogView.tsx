import React from 'react';
import { ContentGrid } from "@/apps/Modules/AppModules/contentGrid/Grid";
import { Item } from "@/../../declarations/perpetua/perpetua.did";
import ShelfContentCard from './ShelfContentCard';
import { BlogMarkdownDisplay } from './ContentDisplays';
import { isMarkdownContent } from "../../../utils";

interface ShelfBlogViewProps {
  items: [number, Item][];
  isEditMode: boolean;
  draggedIndex: number | null;
  shelf: any;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  handleDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  handleContentClick: (itemId: number) => void;
  handleNftDetails: (tokenId: string) => void;
}

export const ShelfBlogView: React.FC<ShelfBlogViewProps> = ({
  items,
  isEditMode,
  draggedIndex,
  shelf,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  handleDrop,
  handleContentClick,
  handleNftDetails
}) => {
  // Define types
  type BlogItemType = [number, Item, number]; // [itemKey, item, index]
  type SectionType = 'markdown' | 'visual' | null;
  type BlogSection = { type: SectionType; items: BlogItemType[] };
  
  // Group consecutive markdown items together
  const blogSections: BlogSection[] = [];
  let currentGroup: BlogItemType[] = [];
  let currentType: SectionType = null; // 'markdown' or 'visual'
  
  // Process all items and group them
  items.forEach(([itemKey, item]: [number, Item], index: number) => {
    const isMarkdownItem = isMarkdownContent(item.content);
    const currentContentType: SectionType = isMarkdownItem ? 'markdown' : 'visual';
    
    // Start a new group if type changes
    if (currentType !== null && currentType !== currentContentType) {
      blogSections.push({ type: currentType, items: [...currentGroup] });
      currentGroup = [];
    }
    
    // Add to current group
    currentGroup.push([itemKey, item, index]);
    currentType = currentContentType;
  });
  
  // Add the final group
  if (currentGroup.length > 0 && currentType !== null) {
    blogSections.push({ type: currentType, items: [...currentGroup] });
  }

  return (
    <div className="blog-view-layout max-w-4xl mx-auto">
      {blogSections.map((section, sectionIndex) => (
        <div key={`section-${sectionIndex}`} className="mb-12">
          {section.type === 'markdown' ? (
            // Render markdown content in a vertical flow
            <div className="prose dark:prose-invert max-w-none">
              {section.items.map(([itemKey, item, originalIndex]: [number, Item, number]) => (
                <div 
                  key={`item-${itemKey}`} 
                  className={`item-card mb-8 ${isEditMode ? 'relative border border-dashed border-border p-6 rounded-md bg-muted/5' : ''}`}
                  draggable={isEditMode}
                  onDragStart={isEditMode ? (e) => handleDragStart(e, originalIndex) : undefined}
                  onDragOver={isEditMode ? (e) => handleDragOver(e, originalIndex) : undefined}
                  onDragEnd={isEditMode ? handleDragEnd : undefined}
                  onDrop={isEditMode ? (e) => handleDrop(e, originalIndex) : undefined}
                >
                  {isEditMode && (
                    <div className="absolute top-2 right-2 z-40 bg-background text-foreground px-2 py-1 text-xs rounded-md border border-border">
                      Item #{itemKey}
                      <div 
                        className="item-drag-handle ml-2 inline-block text-gray-400 p-1 rounded hover:bg-gray-700 cursor-grab"
                        onMouseDown={(e) => { e.stopPropagation(); }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
                        </svg>
                      </div>
                    </div>
                  )}
                  <BlogMarkdownDisplay 
                    content={(item.content as any).Markdown} 
                    onClick={() => handleContentClick(itemKey)} 
                  />
                </div>
              ))}
            </div>
          ) : (
            // Render visual content (NFTs/Shelves) in a horizontal grid
            <div className="visual-content-row mb-8">
              <h3 className="text-sm uppercase tracking-wide text-muted-foreground mb-4 font-semibold">Visual Content</h3>
              <ContentGrid>
                {section.items.map(([itemKey, item, originalIndex]: [number, Item, number]) => (
                  <ShelfContentCard
                    key={`blog-grid-item-${itemKey}`}
                    itemKey={itemKey}
                    item={item}
                    index={originalIndex}
                    isEditMode={isEditMode}
                    draggedIndex={draggedIndex}
                    shelf={shelf}
                    handleDragStart={handleDragStart}
                    handleDragOver={handleDragOver}
                    handleDragEnd={handleDragEnd}
                    handleDrop={handleDrop}
                    handleNftDetails={handleNftDetails}
                    handleContentClick={handleContentClick}
                  />
                ))}
              </ContentGrid>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ShelfBlogView; 