import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { toggleTag } from '../../shared/state/nft/librarySlice';
import { ContentTypeToggleGroup } from '../../shared/components/ContentTypeToggleGroup';
import { supportedFileTypes } from '../../shared/types/files';

const TagSelector: React.FC = () => {
  const dispatch = useDispatch();
  const tags = useSelector((state: RootState) => state.library.tags);

  const handleTagToggle = (mimeType: string) => {
    dispatch(toggleTag(mimeType));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Filter by Content Type:
      </label>
      <ContentTypeToggleGroup
        selectedTags={tags}
        onTagToggle={handleTagToggle}
        filteredTypes={supportedFileTypes}
      />
    </div>
  );
};

export default TagSelector; 