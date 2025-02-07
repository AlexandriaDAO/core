import React, { useMemo } from 'react';
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
  const [selectedCategory, setSelectedCategory] = React.useState('favorites');

  React.useEffect(() => {
    if (tags.length === 0) {
      const allMimeTypes = supportedFileTypes.map(type => type.mimeType);
      dispatch(setTags(allMimeTypes));
    }
  }, [dispatch]);

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

      <ToggleGroup 
        type="multiple" 
        value={tags} 
        onValueChange={handleTagToggle} 
        className="flex flex-wrap gap-1.5 sm:gap-2"
      >
        {visibleContentTypes.map((type) => (
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
    </div>
  );
};

export default TagSelector; 