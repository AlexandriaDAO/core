import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { supportedFileTypes } from '@/apps/Modules/shared/types/files';
import { toggleTag } from '../../shared/state/nft/librarySlice';

const LibraryContentTagsSelector: React.FC = () => {
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
      <div className="mt-2 space-y-2">
        {supportedFileTypes.map(type => (
          <label key={type.mimeType} className="inline-flex items-center mr-4">
            <input
              type="checkbox"
              checked={tags.includes(type.mimeType)}
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

export default LibraryContentTagsSelector; 