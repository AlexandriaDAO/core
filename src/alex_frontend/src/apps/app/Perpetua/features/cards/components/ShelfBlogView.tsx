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

type BlogItemType = [number, Item, number]; // [itemKey, item, index]
type SectionType = 'markdown' | 'visual';
type BlogSection = { type: SectionType; items: BlogItemType[] };

const DragHandle = () => (
  <div className="cursor-grab p-1 rounded hover:bg-gray-700">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
    </svg>
  </div>
);

const MarkdownSection = ({
  items,
  isEditMode,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  handleDrop,
  handleContentClick
}: {
  items: BlogItemType[];
  isEditMode: boolean;
  handleDragStart: ShelfBlogViewProps['handleDragStart'];
  handleDragOver: ShelfBlogViewProps['handleDragOver'];
  handleDragEnd: ShelfBlogViewProps['handleDragEnd'];
  handleDrop: ShelfBlogViewProps['handleDrop'];
  handleContentClick: ShelfBlogViewProps['handleContentClick'];
}) => (
  <div className="prose dark:prose-invert max-w-none">
    {items.map(([itemKey, item, originalIndex]) => (
      <div
        key={`item-${itemKey}`}
        className={`mb-8 ${isEditMode ? 'relative border border-dashed border-border p-6 rounded-md bg-muted/5' : ''}`}
        draggable={isEditMode}
        onDragStart={isEditMode ? (e) => handleDragStart(e, originalIndex) : undefined}
        onDragOver={isEditMode ? (e) => handleDragOver(e, originalIndex) : undefined}
        onDragEnd={isEditMode ? handleDragEnd : undefined}
        onDrop={isEditMode ? (e) => handleDrop(e, originalIndex) : undefined}
      >
        {isEditMode && (
          <div className="absolute top-2 right-2 z-40 bg-background text-foreground px-2 py-1 text-xs rounded-md border border-border flex items-center">
            <span>Item #{itemKey}</span>
            <div className="ml-2 text-gray-400" onMouseDown={(e) => e.stopPropagation()}>
              <DragHandle />
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
);

const VisualSection = ({
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
}: {
  items: BlogItemType[];
  isEditMode: boolean;
  draggedIndex: number | null;
  shelf: any;
  handleDragStart: ShelfBlogViewProps['handleDragStart'];
  handleDragOver: ShelfBlogViewProps['handleDragOver'];
  handleDragEnd: ShelfBlogViewProps['handleDragEnd'];
  handleDrop: ShelfBlogViewProps['handleDrop'];
  handleContentClick: ShelfBlogViewProps['handleContentClick'];
  handleNftDetails: ShelfBlogViewProps['handleNftDetails'];
}) => (
  <div className="mb-8">
    <ContentGrid>
      {items.map(([itemKey, item, originalIndex]) => (
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
);

export const ShelfBlogView: React.FC<ShelfBlogViewProps> = (props) => {
  const { items } = props;
  
  // Process items into blog sections
  const processItems = (): BlogSection[] => {
    const sections: BlogSection[] = [];
    let currentGroup: BlogItemType[] = [];
    let currentType: SectionType | null = null;
    
    // Build sections by grouping consecutive items of the same type
    items.forEach(([itemKey, item], index) => {
      const isMarkdownItem = isMarkdownContent(item.content);
      const itemType: SectionType = isMarkdownItem ? 'markdown' : 'visual';
      
      if (currentType !== null && currentType !== itemType) {
        sections.push({ type: currentType, items: [...currentGroup] });
        currentGroup = [];
      }
      
      currentGroup.push([itemKey, item, index]);
      currentType = itemType;
    });
    
    // Add the final group
    if (currentGroup.length > 0 && currentType !== null) {
      sections.push({ type: currentType, items: [...currentGroup] });
    }
    
    return sections;
  };
  
  const blogSections = processItems();

  return (
    <div className="max-w-4xl mx-auto">
      {blogSections.map((section, sectionIndex) => (
        <div key={`section-${sectionIndex}`} className="mb-12">
          {section.type === 'markdown' ? (
            <MarkdownSection 
              items={section.items} 
              isEditMode={props.isEditMode}
              handleDragStart={props.handleDragStart}
              handleDragOver={props.handleDragOver}
              handleDragEnd={props.handleDragEnd}
              handleDrop={props.handleDrop}
              handleContentClick={props.handleContentClick}
            />
          ) : (
            <VisualSection 
              items={section.items} 
              isEditMode={props.isEditMode}
              draggedIndex={props.draggedIndex}
              shelf={props.shelf}
              handleDragStart={props.handleDragStart}
              handleDragOver={props.handleDragOver}
              handleDragEnd={props.handleDragEnd}
              handleDrop={props.handleDrop}
              handleContentClick={props.handleContentClick}
              handleNftDetails={props.handleNftDetails}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ShelfBlogView; 