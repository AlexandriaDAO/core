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
          variant="outline"
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary"
          aria-label={type.displayName}
        >
          {type.displayName}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}; 