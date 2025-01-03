import React, { useMemo, useState, KeyboardEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { supportedFileTypes, fileTypeCategories, FileTypeConfig } from '@/apps/Modules/shared/types/files';
import { setSearchState } from '@/apps/Modules/shared/state/arweave/arweaveSlice';
import { ContentTypeToggleGroup } from '@/apps/Modules/shared/components/ContentTypeToggleGroup';

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

const ContentTagsSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { searchState } = useSelector((state: RootState) => state.arweave);
  const [showAllTags, setShowAllTags] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customTag, setCustomTag] = useState('');

  const handleTagToggle = (mimeType: string) => {
    const clickedType = supportedFileTypes.find(t => t.mimeType === mimeType);
    if (!clickedType) {
      // Handle custom tag toggle
      const newTags = searchState.tags.includes(mimeType)
        ? searchState.tags.filter(tag => tag !== mimeType)
        : [...searchState.tags, mimeType];
      dispatch(setSearchState({ tags: newTags }));
      return;
    }

    // Find all related MIME types
    const relatedTypes = supportedFileTypes.filter(t => 
      t.displayName === clickedType.displayName
    ).map(t => t.mimeType);

    // If any related type is selected, remove all. Otherwise, add all.
    const hasSelected = relatedTypes.some(type => searchState.tags.includes(type));
    const newTags = hasSelected
      ? searchState.tags.filter(tag => !relatedTypes.includes(tag))
      : [...searchState.tags, ...relatedTypes];

    dispatch(setSearchState({ tags: newTags }));
  };

  // Filter content types based on the selected category
  const filteredContentTypes = useMemo(() => {
    if (searchState.contentCategory === 'favorites' || showAllCategories) {
      return supportedFileTypes;
    }
    const categoryMimeTypes = fileTypeCategories[searchState.contentCategory] || [];
    return supportedFileTypes.filter(type => categoryMimeTypes.includes(type.mimeType));
  }, [searchState.contentCategory, showAllCategories]);

  // Filter visible content types based on selection and showAllTags state
  const visibleContentTypes = useMemo(() => {
    let types = showAllTags ? filteredContentTypes : filteredContentTypes.filter(type => 
      searchState.tags.some(tag => {
        const matchingType = supportedFileTypes.find(st => st.mimeType === tag);
        return matchingType?.displayName === type.displayName;
      })
    );

    // Remove duplicates based on displayName
    types = getUniqueDisplayTypes(types);

    // Add custom tags as FileTypeConfig objects
    const customTypes = searchState.tags
      .filter(tag => !supportedFileTypes.find(type => type.mimeType === tag))
      .map(tag => ({
        mimeType: tag,
        extension: 'custom',
        displayName: tag
      }));

    return [...types, ...customTypes];
  }, [filteredContentTypes, searchState.tags, showAllTags]);

  const handleSelectAll = () => {
    const allMimeTypes = filteredContentTypes.map(type => type.mimeType);
    dispatch(setSearchState({ tags: allMimeTypes }));
  };

  const handleClearAll = () => {
    dispatch(setSearchState({ tags: [] }));
  };

  const handleCustomTagAdd = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customTag.trim()) {
      if (!searchState.tags.includes(customTag.trim())) {
        dispatch(setSearchState({ 
          tags: [...searchState.tags, customTag.trim()] 
        }));
      }
      setCustomTag('');
      setIsAddingCustom(false);
    } else if (e.key === 'Escape') {
      setIsAddingCustom(false);
      setCustomTag('');
    }
  };

  return (
    <div className="flex-1">
      <div className="p-[14px] rounded-2xl border border-input bg-background">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {showAllTags && searchState.contentCategory !== 'all' && (
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                {showAllCategories ? "Show category" : "Show all"}
              </button>
            )}
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
        </div>

        <div className="relative">
          <ContentTypeToggleGroup
            selectedTags={searchState.tags}
            onTagToggle={handleTagToggle}
            filteredTypes={visibleContentTypes}
          />
          {showAllTags && (
            isAddingCustom ? (
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={handleCustomTagAdd}
                onBlur={() => setIsAddingCustom(false)}
                placeholder="Type MIME type and press Enter"
                className="mt-2 w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsAddingCustom(true)}
                className="mt-2 inline-flex items-center px-3 py-1.5 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
              >
                <span className="mr-1">+</span> Add custom type
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentTagsSelector;
