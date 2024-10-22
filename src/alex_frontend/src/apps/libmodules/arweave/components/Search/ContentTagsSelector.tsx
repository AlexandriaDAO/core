import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { supportedFileTypes, fileTypeCategories } from '../../types/files';
import { setSearchState } from '../../redux/arweaveSlice';

const ContentTagsSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { searchState } = useSelector((state: RootState) => state.arweave);

  const handleTagToggle = (mimeType: string) => {
    const newTags = searchState.tags.includes(mimeType)
      ? searchState.tags.filter(tag => tag !== mimeType)
      : [...searchState.tags, mimeType];
    dispatch(setSearchState({ tags: newTags }));
  };

  // Filter content types based on the selected category
  const filteredContentTypes = useMemo(() => {
    if (searchState.contentCategory === 'all') {
      return supportedFileTypes;
    }
    const categoryMimeTypes = fileTypeCategories[searchState.contentCategory] || [];
    return supportedFileTypes.filter(type => categoryMimeTypes.includes(type.mimeType));
  }, [searchState.contentCategory]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Content Tags:
      </label>
      <div className="mt-2 space-y-2">
        {filteredContentTypes.map(type => (
          <label key={type.mimeType} className="inline-flex items-center mr-4">
            <input
              type="checkbox"
              checked={searchState.tags.includes(type.mimeType)}
              onChange={() => handleTagToggle(type.mimeType)}
              className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
            />
            <span className="ml-2 text-sm text-gray-700">{type.displayName}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ContentTagsSelector;
