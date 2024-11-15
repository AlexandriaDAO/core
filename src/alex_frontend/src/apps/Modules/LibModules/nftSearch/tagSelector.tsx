import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { toggleTag } from '../../shared/state/nft/librarySlice';
import { ContentTypeToggleGroup } from '../../shared/components/ContentTypeToggleGroup';
import { supportedFileTypes, FileTypeConfig, fileTypeCategories } from '../../shared/types/files';

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

const TagSelector: React.FC = () => {
  const dispatch = useDispatch();
  const tags = useSelector((state: RootState) => state.library.tags);
  const [showAllTags, setShowAllTags] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('favorites');

  const handleTagToggle = (mimeType: string) => {
    const clickedType = supportedFileTypes.find(t => t.mimeType === mimeType);
    if (!clickedType) return;

    // Find all related MIME types
    const relatedTypes = supportedFileTypes.filter(t => 
      t.displayName === clickedType.displayName
    ).map(t => t.mimeType);

    // If any related type is selected, remove all. Otherwise, add all.
    const hasSelected = relatedTypes.some(type => tags.includes(type));
    relatedTypes.forEach(type => {
      dispatch(toggleTag(type));
    });
  };

  // Filter content types based on the selected category
  const filteredContentTypes = useMemo(() => {
    if (selectedCategory === 'all') {
      return supportedFileTypes;
    }
    const categoryMimeTypes = fileTypeCategories[selectedCategory] || [];
    return supportedFileTypes.filter(type => categoryMimeTypes.includes(type.mimeType));
  }, [selectedCategory]);

  // Filter visible content types based on selection and showAllTags state
  const visibleContentTypes = useMemo(() => {
    let types = showAllTags ? filteredContentTypes : filteredContentTypes.filter(type => 
      tags.some((tag: string) => {
        const matchingType = supportedFileTypes.find(st => st.mimeType === tag);
        return matchingType?.displayName === type.displayName;
      })
    );

    // Remove duplicates based on displayName
    return getUniqueDisplayTypes(types);
  }, [filteredContentTypes, tags, showAllTags]);

  return (
    <div className="space-y-4">
      <div className="relative w-full">
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full h-[50px] px-5 py-4 rounded-[30px] border border-[#F3F3F3] bg-white
                   text-black font-syne text-base font-normal appearance-none"
        >
          <option value="favorites">Popular</option>
          {Object.keys(fileTypeCategories)
            .filter(category => category !== 'favorites')
            .map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
          ))}
        </select>
        
        <div className="absolute right-[22px] top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.8721 4.25939C15.8721 4.12502 15.8189 3.9875 15.7158 3.88437C15.5096 3.67812 15.1721 3.67812 14.9658 3.88437L7.90645 10.9437L0.950195 3.9875C0.743945 3.78125 0.406446 3.78125 0.200195 3.9875C-0.00605488 4.19375 -0.00605488 4.53125 0.200195 4.7375L7.53145 12.0719C7.7377 12.2781 8.0752 12.2781 8.28145 12.0719L15.7158 4.6375C15.8221 4.53125 15.8721 4.39689 15.8721 4.25939Z" fill="black"/>
          </svg>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">
            Filter by Content Type:
          </label>
          <button
            onClick={() => setShowAllTags(!showAllTags)}
            className="inline-flex items-center justify-center p-1 rounded-full hover:bg-gray-100"
          >
            <span className="text-gray-600 text-sm">
              {showAllTags ? "−" : "+"} {!showAllTags && filteredContentTypes.length - visibleContentTypes.length > 0 && 
                `(${filteredContentTypes.length - visibleContentTypes.length})`}
            </span>
          </button>
        </div>
        <div className="relative">
          <ContentTypeToggleGroup
            selectedTags={tags}
            onTagToggle={handleTagToggle}
            filteredTypes={visibleContentTypes}
          />
        </div>
      </div>
    </div>
  );
};

export default TagSelector; 