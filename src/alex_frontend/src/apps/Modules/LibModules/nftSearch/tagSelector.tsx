import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setTags } from '../../shared/state/librarySearch/librarySlice';
import { ToggleGroup, ToggleGroupItem } from "@/lib/components/toggle-group";
import { supportedFileTypes, FileTypeConfig, fileTypeCategories } from '../../shared/types/files';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/components/select";
import { Button } from "@/lib/components/button";
import { ChevronDown, ChevronUp } from "lucide-react";

const getUniqueDisplayTypes = (types: FileTypeConfig[]): FileTypeConfig[] => {
  const grouped = types.reduce((acc, type) => {
    const existing = acc.find((t: FileTypeConfig) => t.displayName === type.displayName);
    if (!existing) {
      acc.push(type);
    }
    return acc;
  }, [] as FileTypeConfig[]);
  return grouped;
};

interface TagSelectorProps {
  defaultCategory?: 'favorites' | 'all';
}

const TagSelector: React.FC<TagSelectorProps> = ({ defaultCategory = 'favorites' }) => {
  const dispatch = useDispatch();
  const tags = useSelector((state: RootState) => state.library.tags);
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  const [isExpanded, setIsExpanded] = useState(false);
  const tagContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tags.length === 0) {
      // Set tags based on the selected category
      const categoryMimeTypes = defaultCategory === 'all' 
        ? supportedFileTypes.map(type => type.mimeType)
        : fileTypeCategories[defaultCategory] || [];
      
      dispatch(setTags(categoryMimeTypes));
    }
  }, [dispatch, defaultCategory]);

  const filteredContentTypes = useMemo(() => {
    if (selectedCategory === 'all') {
      return supportedFileTypes;
    }
    const categoryMimeTypes = fileTypeCategories[selectedCategory] || [];
    return supportedFileTypes.filter(type => categoryMimeTypes.includes(type.mimeType));
  }, [selectedCategory]);

  const visibleContentTypes = useMemo(() => {
    return getUniqueDisplayTypes(filteredContentTypes);
  }, [filteredContentTypes]);

  const handleTagToggle = (values: string[]) => {
    if (values.length === 0) {
      const allMimeTypes = supportedFileTypes.map(type => type.mimeType);
      dispatch(setTags(allMimeTypes));
      return;
    }
    dispatch(setTags(values));
  };

  // Determine which tags to show based on expansion state
  const displayedContentTypes = useMemo(() => {
    if (isExpanded) {
      return visibleContentTypes;
    }
    
    // For collapsed view, just return the first 5-7 items (or adjust based on UI needs)
    return visibleContentTypes.slice(0, 6);
  }, [visibleContentTypes, isExpanded]);
  
  const hasMoreTags = visibleContentTypes.length > displayedContentTypes.length;

  return (
    <div className="p-2 sm:p-[14px] rounded-2xl border border-input bg-background">
      <div className="flex justify-center pb-2 sm:pb-3">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full max-w-[200px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="favorites">Popular</SelectItem>
            <SelectItem value="all">All Types</SelectItem>
            {Object.keys(fileTypeCategories)
              .filter(category => !['favorites', 'all'].includes(category))
              .map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative" ref={tagContainerRef}>
        <ToggleGroup 
          type="multiple" 
          value={tags} 
          onValueChange={handleTagToggle} 
          className={`flex flex-wrap gap-1.5 sm:gap-2 ${!isExpanded ? "max-h-[40px] overflow-hidden" : ""}`}
        >
          {displayedContentTypes.map((type) => (
            <ToggleGroupItem
              key={type.mimeType}
              value={type.mimeType}
              variant="tag"
              className={`px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-full transition-colors
                ${!tags.includes(type.mimeType) && 'hover:bg-muted'}`}
            >
              {type.displayName}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        
        {hasMoreTags && (
          <div className="flex justify-center mt-1 sm:mt-2">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 px-2 text-xs text-muted-foreground flex items-center hover:bg-accent hover:text-accent-foreground rounded"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" /> Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" /> Show more
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagSelector; 