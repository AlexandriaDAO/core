import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/lib/components/toggle-group';
import { supportedFileTypes } from '../types/files';

interface ContentTypeToggleGroupProps {
  selectedTags: string[];
  onTagToggle: (mimeType: string) => void;
  filteredTypes?: typeof supportedFileTypes;
}

export const ContentTypeToggleGroup: React.FC<ContentTypeToggleGroupProps> = ({
  selectedTags,
  onTagToggle,
  filteredTypes = [],
}) => {
  const handleValueChange = (newValues: string[]) => {
    // Find which value changed by comparing the new and old arrays
    const added = newValues.find(value => !selectedTags.includes(value));
    const removed = selectedTags.find(value => !newValues.includes(value));
    
    // Toggle the value that changed
    onTagToggle(added || removed || '');
  };

  return (
    <ToggleGroup 
      type="multiple" 
      className="flex flex-wrap gap-2"
      value={selectedTags}
      onValueChange={handleValueChange}
    >
      {filteredTypes.map((type) => (
        <ToggleGroupItem
          key={type.mimeType}
          value={type.mimeType}
          variant="tag"
          className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-full transition-colors"
          aria-label={type.displayName}
        >
          {type.displayName}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}; 