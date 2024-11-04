import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { supportedFileTypes, fileTypeCategories } from '@/apps/Modules/shared/types/files';
import { setSearchState } from '@/apps/Modules/shared/state/arweave/arweaveSlice';
import { ContentTypeToggleGroup } from '@/apps/Modules/shared/components/ContentTypeToggleGroup';

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
    if (searchState.contentCategory === 'favorites') {
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
      <ContentTypeToggleGroup
        selectedTags={searchState.tags}
        onTagToggle={handleTagToggle}
        filteredTypes={filteredContentTypes}
      />
    </div>
  );
};

export default ContentTagsSelector;
